const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const tmi = require('tmi.js');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { LiveChat } = require('youtube-chat');
const axios = require('axios');
const cors = require('cors');
const WebSocket = require('ws');

// --- ESCUDO GLOBAL ---
process.on('unhandledRejection', (r) => logSystem('warning', `Red: ${r.message || 'Error'}`));
process.on('uncaughtException', (e) => logSystem('error', `Crítico: ${e.message}`));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 8000;
const CHANNELS_FILE = path.join(__dirname, 'channels.json');
const HUMAN_HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' };

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

let connections = { twitch: null, tiktok: null, youtube: null, kick: null };
let platformStatus = { twitch: false, youtube: false, tiktok: false, kick: false };
let botStatus = { streamerbot: false, speakerbot: false, tikfinity: false };
let streamerBotWs = null;

let integrationConfig = {
    streamerbot_url: "ws://127.0.0.1:8080/",
    speakerbot_url: "http://127.0.0.1:5000/speak",
    tikfinity_url: "http://127.0.0.1:21213/api/v1/event"
};

const logSystem = (type, message) => {
    const log = { type, message, time: new Date().toLocaleTimeString() };
    io.emit('sys_log', log);
    console.log(`[${log.time}] [${type.toUpperCase()}] ${message}`);
};

const checkBotsHealth = async () => {
    botStatus.streamerbot = streamerBotWs?.readyState === WebSocket.OPEN;
    try { await axios.get(integrationConfig.speakerbot_url.replace('/speak', ''), { timeout: 1000 }); botStatus.speakerbot = true; } catch(e) { botStatus.speakerbot = !!e.response; }
    try { await axios.get(integrationConfig.tikfinity_url.split('/api')[0], { timeout: 1000 }); botStatus.tikfinity = true; } catch(e) { botStatus.tikfinity = !!e.response; }
};
setInterval(checkBotsHealth, 10000);

const emitMessage = (data) => {
    const payload = { ...data, timestamp: new Date().toISOString() };
    io.emit('new_message', payload);
    
    if (botStatus.streamerbot) streamerBotWs.send(JSON.stringify({ request: "ExecuteCode", id: "multichat_event", args: payload }));
    if (botStatus.speakerbot && ['chat', 'gift'].includes(data.type)) {
        const text = data.type === 'chat' ? `${data.author} dice: ${data.message}` : `¡Regalo de ${data.author}!`;
        axios.post(integrationConfig.speakerbot_url, { message: text }).catch(() => {});
    }
    if (data.platform === 'tiktok' && botStatus.tikfinity) axios.post(integrationConfig.tikfinity_url, payload).catch(() => {});
};

// --- MOTORES DE EMOTES ---

const parseTwitchEmotes = (msg, emotes) => {
    if (!emotes) return [{ type: 'text', content: msg }];
    const parts = [];
    const emoteList = [];
    Object.keys(emotes).forEach(id => {
        emotes[id].forEach(range => {
            const [start, end] = range.split('-').map(Number);
            emoteList.push({ start, end, id, url: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0` });
        });
    });
    emoteList.sort((a, b) => a.start - b.start);
    let lastIdx = 0;
    emoteList.forEach(emote => {
        if (emote.start > lastIdx) parts.push({ type: 'text', content: msg.substring(lastIdx, emote.start) });
        parts.push({ type: 'emote', name: msg.substring(emote.start, emote.end + 1), url: emote.url });
        lastIdx = emote.end + 1;
    });
    if (lastIdx < msg.length) parts.push({ type: 'text', content: msg.substring(lastIdx) });
    return parts;
};

const parseKickEmotes = (content) => {
    const parts = [];
    const regex = /\[emote:(\d+):([^\]]+)\]/g;
    let lastIdx = 0, m;
    while ((m = regex.exec(content)) !== null) {
        if (m.index > lastIdx) parts.push({ type: 'text', content: content.substring(lastIdx, m.index) });
        parts.push({ type: 'emote', name: m[2], url: `https://files.kick.com/emotes/${m[1]}/fullsize` });
        lastIdx = regex.lastIndex;
    }
    if (lastIdx < content.length) parts.push({ type: 'text', content: content.substring(lastIdx) });
    return parts;
};

// --- PLATAFORMAS ---

const connectTwitch = (username) => {
    try {
        if (connections.twitch) connections.twitch.disconnect();
        const client = new tmi.Client({ connection: { reconnect: true, secure: true }, channels: [username] });
        client.on('message', (ch, tags, msg) => {
            emitMessage({ platform: 'twitch', type: 'chat', author: tags['display-name'] || tags.username, message: msg, parts: parseTwitchEmotes(msg, tags.emotes), color: tags.color || '#9146FF' });
        });
        client.on('connected', () => { logSystem('success', 'Twitch: En línea'); platformStatus.twitch = true; });
        client.on('disconnected', () => { platformStatus.twitch = false; });
        client.connect().catch(() => { platformStatus.twitch = false; });
        connections.twitch = client;
    } catch(e) {}
};

const connectTikTok = (username, sessionId = null) => {
    try {
        const cleanUser = username.replace('@', '');
        logSystem('info', `TikTok: Conectando a @${cleanUser}...`);
        if (connections.tiktok) connections.tiktok.disconnect();
        const tiktokChat = new WebcastPushConnection(cleanUser, { enableExtendedConfig: true, sessionId: sessionId || undefined });

        tiktokChat.on('chat', (data) => {
            logSystem('info', `TikTok: Mensaje de ${data.nickname}`);
            emitMessage({ platform: 'tiktok', type: 'chat', author: data.nickname || data.uniqueId, message: data.comment, avatar: data.profilePictureUrl, color: '#EE1D52' });
        });

        tiktokChat.on('gift', (data) => {
            if (data.gift.repeat_end) {
                emitMessage({ platform: 'tiktok', type: 'gift', author: data.nickname || data.uniqueId, message: `envió ${data.gift.repeat_count}x ${data.gift.gift_name}`, avatar: data.profilePictureUrl, color: '#ff0050' });
            }
        });

        tiktokChat.on('connected', () => { logSystem('success', 'TikTok: En línea'); platformStatus.tiktok = true; });
        tiktokChat.on('error', (err) => { logSystem('error', `TikTok: ${err.message || 'Bloqueo'}`); platformStatus.tiktok = false; });
        tiktokChat.connect().catch(() => { platformStatus.tiktok = false; });
        connections.tiktok = tiktokChat;
    } catch(e) { platformStatus.tiktok = false; }
};

const connectYouTube = async (input) => {
    try {
        if (connections.youtube) connections.youtube.stop();
        let channelId = input;
        if (input.startsWith('@')) {
            const res = await axios.get(`https://www.youtube.com/${input}/live`, { headers: HUMAN_HEADERS, timeout: 5000 }).catch(() => null);
            if (res) { const m = res.data.match(/"channelId":"(UC[^"]+)"/); if (m) channelId = m[1]; }
        }
        const liveChat = new LiveChat({ channelId });
        liveChat.on('chat', (item) => {
            const parts = item.message.map(m => m.text ? { type: 'text', content: m.text } : { type: 'emote', name: m.emojiText, url: m.url });
            emitMessage({ platform: 'youtube', type: 'chat', author: item.author.name, message: item.message.map(m => m.text || "").join(""), parts, avatar: item.author.thumbnail.url, color: '#FF0000' });
        });
        liveChat.on('start', () => { logSystem('success', 'YouTube: En línea'); platformStatus.youtube = true; });
        liveChat.on('error', () => { platformStatus.youtube = false; });
        liveChat.start().catch(() => { platformStatus.youtube = false; });
        connections.youtube = liveChat;
    } catch (e) { platformStatus.youtube = false; }
};

const connectKick = async (username, manualId = null) => {
    try {
        if (connections.kick) { try { connections.kick.close(); } catch(e){} }
        let chatroomId = manualId;
        if (!chatroomId) {
            const res7 = await axios.get(`https://7tv.io/v3/users/kick/${username.toLowerCase()}`, { timeout: 3000 }).catch(() => null);
            chatroomId = res7?.data.platform_id;
        }
        if (!chatroomId) {
            const res = await axios.get(`https://kick.com/${username}`, { headers: HUMAN_HEADERS, timeout: 4000 }).catch(() => null);
            chatroomId = res?.data.match(/"chatroom":\s*{\s*"id":\s*(\d+)/)?.[1] || res?.data.match(/"chatroom_id":\s*(\d+)/)?.[1];
        }
        if (!chatroomId) return;

        const kickWS = new WebSocket('wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false');
        kickWS.on('open', () => {
            kickWS.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatrooms.${chatroomId}.v2` } }));
            logSystem('success', 'Kick: En línea');
            platformStatus.kick = true;
        });
        kickWS.on('message', (data) => {
            const response = JSON.parse(data);
            if (response.event === 'App\\Events\\ChatMessageEvent') {
                const msg = JSON.parse(response.data);
                emitMessage({ 
                    platform: 'kick', 
                    type: 'chat', 
                    author: msg.sender.username, 
                    message: msg.content, 
                    parts: parseKickEmotes(msg.content), 
                    color: msg.sender.identity.color || '#53FC18',
                    avatar: msg.sender.profile_pic 
                });
            }
            if (response.event === 'pusher:ping') kickWS.send(JSON.stringify({ event: 'pusher:pong', data: {} }));
        });
        kickWS.on('close', () => { platformStatus.kick = false; });
        connections.kick = kickWS;
    } catch (e) { platformStatus.kick = false; }
};

// --- ENDPOINTS ---
app.get('/status', (req, res) => res.json({ platforms: platformStatus, bots: botStatus }));
app.get('/config', (req, res) => res.json(fs.existsSync(CHANNELS_FILE) ? JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf-8')) : {}));

app.post('/connect', (req, res) => {
    const { twitch, tiktok, youtube, kick, save, tiktokSessionId, kickId } = req.body;
    if (save) fs.writeFileSync(CHANNELS_FILE, JSON.stringify(req.body, null, 2));
    if (twitch) connectTwitch(twitch);
    if (tiktok) connectTikTok(tiktok, tiktokSessionId);
    if (youtube) connectYouTube(youtube);
    if (kick) connectKick(kick, kickId);
    res.json({ status: 'success' });
});

const connectIntegrations = () => {
    try {
        if (streamerBotWs) streamerBotWs.close();
        streamerBotWs = new WebSocket(integrationConfig.streamerbot_url);
        streamerBotWs.on('open', () => { logSystem('success', 'Integración: Bot Conectado'); checkBotsHealth(); });
        streamerBotWs.on('close', () => setTimeout(connectIntegrations, 10000));
    } catch(e) {}
};

app.post('/update_integrations', (req, res) => {
    const { streamerbot_url, speakerbot_url, tikfinity_url } = req.body;
    if (streamerbot_url) integrationConfig.streamerbot_url = streamerbot_url;
    if (speakerbot_url) integrationConfig.speakerbot_url = speakerbot_url;
    if (tikfinity_url) integrationConfig.tikfinity_url = tikfinity_url;
    connectIntegrations();
    checkBotsHealth();
    res.json({ status: 'updated' });
});

io.on('connection', (socket) => {
    socket.on('update_style', (data) => io.emit('apply_style', data));
    socket.on('test_message', (data) => io.emit('new_message', data));
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));
app.get('/panel', (req, res) => res.sendFile(path.join(__dirname, 'public', 'panel.html')));

server.listen(PORT, () => {
    logSystem('success', `Dashboard en http://localhost:${PORT}`);
    connectIntegrations();
    setTimeout(() => {
        if (fs.existsSync(CHANNELS_FILE)) {
            const c = JSON.parse(fs.readFileSync(CHANNELS_FILE, 'utf-8'));
            if (c.twitch) connectTwitch(c.twitch);
            if (c.tiktok) connectTikTok(c.tiktok, c.tiktokSessionId);
            if (c.youtube) connectYouTube(c.youtube);
            if (c.kick) connectKick(c.kick, c.kickId);
        }
    }, 2000);
});
