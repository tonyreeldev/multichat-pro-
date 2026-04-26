# 🚀 Guía de Despliegue: Multichat Pro v2.0

Este documento te explica cómo subir tu Multichat a la nube para que puedas acceder al Dashboard desde cualquier lugar y usarlo en OBS sin tener el servidor encendido en tu PC.

---

## 📦 Paso 1: Subir a GitHub

GitHub será el lugar donde guardaremos tu código de forma segura.

1.  Crea una cuenta en [GitHub.com](https://github.com) si no la tienes.
2.  Crea un nuevo **Repositorio** (dale un nombre como `multichat-pro`).
3.  En tu carpeta local "Multichat Final", asegúrate de tener el archivo `.gitignore` (ya lo creamos nosotros).
4.  Sube tus archivos usando **GitHub Desktop** o mediante comandos en la terminal:
    ```bash
    git init
    git add .
    git commit -m "Versión Final Multichat Pro"
    git branch -M main
    git remote add origin TU_URL_DE_GITHUB
    git push -u origin main
    ```

---

## 🌐 Paso 2: Publicar en la Web (Hosting)

Como este es un sistema híbrido con un servidor Node.js, **no sirve GitHub Pages** (que solo es para sitios estáticos). Necesitamos un hosting de aplicaciones. Recomiendo **Render.com** o **Railway.app**.

### Opción Recomendada: Render.com (Gratis)

1.  Entra en [Render.com](https://render.com) y regístrate con tu cuenta de GitHub.
2.  Haz clic en **New +** y selecciona **Web Service**.
3.  Conecta tu repositorio de GitHub `multichat-pro`.
4.  **Configuración del despliegue:**
    *   **Name:** `multichat-tu-nombre`
    *   **Environment:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
5.  Haz clic en **Create Web Service**.

---

## ⚙️ Paso 3: Configuración Final

Una vez que Render termine (verás un mensaje de "Live"), te dará una URL (ej: `https://multichat-pro.onrender.com`).

1.  Abre esa URL: ¡Tu Dashboard ya está en internet!
2.  **Importante**: En OBS, ahora deberás usar esa nueva URL. 
    *   *Ejemplo*: `https://multichat-pro.onrender.com/chat`
3.  **Bots Locales**: Si usas Streamer.bot o Speaker.bot en tu PC de stream, asegúrate de que las URLs en el Dashboard apunten a tu IP local o mantén `127.0.0.1` si abres el Dashboard desde la misma PC donde corren los bots.

---

## ⚠️ Notas de Seguridad

*   **channels.json**: Por defecto, el archivo `.gitignore` evita que se suba tu configuración personal a GitHub. Esto es bueno para que nadie vea tus usuarios. Al estar en la nube, la configuración se guardará en la memoria del servidor de Render.
*   **Modo Dormido**: Los servicios gratuitos como Render se "duermen" tras 15 minutos sin uso. La primera vez que abras el chat en el día, puede tardar unos 30 segundos en "despertar".

---

Desarrollado por **Tony Reel**
