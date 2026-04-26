// Lógica para conectar con bots locales desde el navegador
class BrowserIntegration {
    constructor() {
        this.streamerbotUrl = "ws://127.0.0.1:8080/";
        this.speakerbotUrl = "http://127.0.0.1:5000/speak";
        this.ws = null;
    }

    connectStreamerbot() {
        this.ws = new WebSocket(this.streamerbotUrl);
        this.ws.onopen = () => console.log("✅ Conectado a Streamer.bot local");
        this.ws.onclose = () => {
            console.log("❌ Streamer.bot desconectado. Reintentando...");
            setTimeout(() => this.connectStreamerbot(), 5000);
        };
    }

    sendToStreamerbot(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                request: "ExecuteCode",
                id: "multichat_event",
                args: data
            }));
        }
    }

    async sendToSpeakerbot(text) {
        try {
            await fetch(this.speakerbotUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
        } catch (e) {
            // Ignorar si no está abierto
        }
    }

    processEvent(data) {
        this.sendToStreamerbot(data);
        if (data.type === 'chat' || data.type === 'gift') {
            const author = data.nickname || data.author;
            const ttsText = data.type === 'chat' ? `${author} dice: ${data.message}` : `¡Gracias ${author} por el regalo!`;
            // this.sendToSpeakerbot(ttsText); // Opcional
        }
    }
}

window.browserIntegration = new BrowserIntegration();
window.browserIntegration.connectStreamerbot();
