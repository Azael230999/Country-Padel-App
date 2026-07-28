# Country Padel App

App de gestión para coaches de pádel: directorio de alumnos, bitácora de entrenamiento, asistencia, paquetes de clases, partidos y notas.

Es una Progressive Web App (PWA) — se instala en el iPhone como una app normal, con ícono en pantalla de inicio y funcionamiento sin conexión. Los datos se guardan localmente en el dispositivo (`localStorage`).

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Publicar en GitHub Pages

El repo incluye `.github/workflows/deploy.yml`, que construye y publica la app en GitHub Pages automáticamente en cada push a `main`.

**Paso único (una sola vez):** en GitHub, ve a `Settings → Pages` y en "Build and deployment → Source" selecciona **GitHub Actions**. Después de esto, cada push a `main` publica la app sola.

La URL quedará en `https://<usuario>.github.io/Country-Padel-App/`.

Para lanzar un deploy manual sin esperar un push, ve a la pestaña `Actions` del repo, abre el workflow "Deploy to GitHub Pages" y usa "Run workflow".

## Instalar en iPhone

1. Abre la URL publicada de GitHub Pages en **Safari** en tu iPhone (tiene que ser Safari, no Chrome).
2. Toca el botón de compartir (el cuadrado con flecha hacia arriba).
3. Selecciona **"Agregar a pantalla de inicio"**.
4. Abre la app desde el ícono — se ejecuta a pantalla completa, como una app nativa, e incluso funciona sin conexión.
