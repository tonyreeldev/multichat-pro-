# Multichat Pro v2.0 (Versión Final de Élite)

**Multichat Pro** es la solución definitiva para streamers profesionales. Unifica los chats de **Twitch, YouTube, TikTok y Kick** en un solo overlay para OBS, procesando no solo mensajes, sino también eventos de apoyo en tiempo real (Regalos, Seguidores, Likes y Raids). 

Reescrito completamente en **Node.js**, ofrece un rendimiento ultra-ligero y una resistencia superior contra bloqueos de seguridad.

link
https://multichat-pro-tr.onrender.com/
---

## 🚀 Funcionalidades de Élite

### 1. Sistema de Notificaciones de Apoyo
A diferencia de otros chats, esta versión captura y muestra visualmente:
*   **Regalos (Gifts)**: Notificación con cantidad y nombre del regalo (TikTok/Kick).
*   **Seguidores (Follows)**: Alerta visual cuando alguien nuevo se une a la comunidad.
*   **Likes y Shares**: Contador de corazones y avisos de compartido para maximizar el engagement.
*   **Suscripciones y Raids**: Eventos completos de Twitch y Kick integrados.

### 2. Monitor de Integraciones (Health Check)
El Dashboard realiza un escaneo activo cada 10 segundos para verificar tus bots:
*   🟢 **Verde (En línea)**: El bot está encendido y el servidor está enviando datos.
*   ⚪ **Gris (Desconectado)**: El bot está apagado o la URL/Puerto es incorrecto.
*   **Bots Soportados**: Streamer.bot (WebSocket), Speaker.bot (TTS) y TikFinity (Event Bridge).

### 3. Layouts Maestros para OBS
Soporte nativo para 4 estilos de visualización mediante parámetros de URL:
1.  **Vertical (`/chat`)**: El estándar para el lateral de la pantalla.
2.  **Horizontal (`/chat?layout=horizontal`)**: Estilo burbuja lateral, ideal para el pie de cámara.
3.  **Ticker (`/chat?layout=ticker`)**: Marquesina tipo noticiero de una sola línea (1920x100px).
4.  **Scroll (`/chat?layout=scroll`)**: Flujo ascendente continuo para créditos o pantallas de espera.

### 4. Estilos de Burbujas Personalizables
5 estilos visuales para los mensajes, aplicables en tiempo real desde el Dashboard:
1.  **Clásico**: Estilo estándar con borde izquierdo de color.
2.  **Burbuja**: Bordes redondeados tipo mensajería moderna.
3.  **Minimal**: Transparente y limpio, sin bordes ni sombras.
4.  **Cristal**: Efecto glassmorphism con desenfoque de fondo.
5.  **Avatar**: Muestra la imagen del usuario junto al mensaje.

### 5. Visualización Mejorada
- **Plataforma + Usuario** en la cabecera del mensaje con colores distintivos por plataforma (Twitch morado, YouTube rojo, TikTok rosa, Kick verde).
- Cambios de estilo aplicados instantáneamente a todos los mensajes existentes.


<img width="869" height="495" alt="image" src="https://github.com/user-attachments/assets/cf510c90-9ad8-4d47-9257-b5bb53fba0f5" />

---

## 🛡️ Estabilidad y Tecnología Anti-Bloqueo
*   **TikTok Session ID**: Campo dedicado para cookies de sesión, permitiendo conexiones indestructibles incluso bajo bloqueos de IP.
*   **Kick Pusher Direct**: Conexión vía WebSocket crudo que evita las restricciones de las librerías comerciales.
*   **Rescate de ID por Sonda**: El Dashboard usa tu propio navegador para obtener los IDs de chat necesarios y enviarlos al servidor.
*   **Escudo Global**: El motor es inmune a cierres por errores de red; si algo falla, se recupera solo sin interrumpir el stream.

---

<img width="1917" height="971" alt="image" src="https://github.com/user-attachments/assets/b7dd749a-2427-4f82-b2ed-e69c2e137d52" />



## 🛠️ Estructura del Proyecto

```text
Multichat Final/
├── server.js               # Motor de Alto Rendimiento (Backend)
├── package.json            # Gestor de dependencias
├── channels.json           # Base de datos local de configuración
├── start_node_windows.bat  # Lanzador Automático (Limpia puertos + Auto-update)
├── public/                 # Interfaz de Usuario
│   ├── index.html          # Dashboard Maestro de Control (Estilos + Conexión)
│   └── chat.html           # Overlay Universal (5 Estilos de Burbujas + 4 Layouts)
├── README.md               # Este manual
├── MANUAL_USUARIO.md       # Guía de uso
└── DESPLIEGUE.md           # Instrucciones de despliegue en la nube
```

---

## 📺 Configuración Rápida
1.  **En Windows**: Ejecuta `start_node_windows.bat`.
    **En Mac**: Ejecuta `npm install` y luego `npm start`.
2.  En el Dashboard (`localhost:8000`), introduce tus usuarios y configura tus bots.
3.  En la sección **Estilo de Burbuja**, selecciona el diseño visual que prefieras.
4.  Haz clic en **CONECTAR**. Verifica que los puntos de estado se pongan verdes.
5.  En la columna derecha, haz clic en la fuente que prefieras para copiar el link.
6.  En OBS, añade una **Fuente de Navegador** y pega el link.

Desarrollado con pasión técnica por **Tony Reel**.
"# multichat-pro-" 
