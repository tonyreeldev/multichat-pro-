# 📖 Manual de Usuario - Multichat Multiplataforma

Bienvenido a **Multichat**. Esta herramienta te permite centralizar los chats de Twitch, YouTube, TikTok y Kick en una sola ventana personalizable para tus streams.

---

## 🚀 Inicio Rápido

### En macOS
1. Abre la terminal en la carpeta del proyecto.
2. Ejecuta `npm install` (solo la primera vez).
3. Ejecuta `npm start` para iniciar el servidor.
4. Se abrirá automáticamente el Dashboard en `http://localhost:8000`.

### En Windows
1. Localiza el archivo `start_node_windows.bat`.
2. Haz **doble clic** sobre él.

---

## 🎨 Personalización de Estilos

### Estilos de Burbujas
En el Dashboard, ve a la columna derecha **"Estilo de Burbuja"** y selecciona:
- **CLÁSICO**: Estilo por defecto con borde de color.
- **BURBUJA**: Forma redondeada tipo aplicación de mensajería.
- **MINIMAL**: Transparente, sin bordes ni sombras.
- **CRISTAL**: Efecto de vidrio con desenfoque.
- **AVATAR**: Muestra la foto de perfil del usuario.

Los cambios se aplican instantáneamente a todos los mensajes en pantalla.

### Colores por Plataforma
Cada mensaje muestra automáticamente el color distintivo de su plataforma:
- 🟣 **Twitch**: Morado
- 🔴 **YouTube**: Rojo
- 🌸 **TikTok**: Rosa
- 🟢 **Kick**: Verde

---

## 🛠 Configuración de Canales

Una vez abierta la aplicación, pulsa en **"Iniciar Servidor"** y luego en **"Abrir Panel de Control"**. Verás los campos para cada plataforma con un **indicador de estado** (círculo pequeño) a la derecha:

- **⚪ Gris**: El canal no está configurado o no has pulsado "Conectar".
- **🟢 Verde**: Conexión exitosa. El chat está activo y recibiendo mensajes.
- **🔴 Rojo**: Error de conexión. El usuario no existe o el canal no está en vivo (YouTube/TikTok).

| Plataforma | Cómo escribir el canal | Ejemplo |
|---|---|---|
| **Twitch** | Solo el nombre de usuario | `tonyreel` |
| **YouTube** | @handle o URL del canal | `@tonyreel` |
| **TikTok** | Nombre de usuario (con o sin @) | `@tonyreel` |
| **Kick** | Solo el nombre de usuario | `tonyreel` |

> **Tip:** Marca la casilla **"Recordar canales al cerrar"** para que no tengas que escribirlos la próxima vez.

- **YouTube no conecta:** Asegúrate de que el canal esté EN VIVO. Si usas el ID del canal, prueba usando el `@handle`. Los cambios recientes incluyen **regex optimizado** para el token de continuación y **cookies simplificadas**.
- **TikTok no conecta:** El streamer debe estar EN VIVO en el momento de pulsar "Conectar".
- **Los emotes no se ven:** El servidor debe estar corriendo para que el "Proxy de Emotes" funcione y evite bloqueos de seguridad del navegador.
- **El chat se ve cortado:** Ajusta el tamaño de la fuente o aumenta el ancho/alto de la fuente de navegador en OBS.

---
*Desarrollado por **Tony Reel***
