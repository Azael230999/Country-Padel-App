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

## Instalar en iPhone

1. Sube el resultado de `npm run build` (carpeta `dist/`) a un hosting con HTTPS (por ejemplo Vercel, Netlify o GitHub Pages).
2. Abre la URL publicada en Safari en tu iPhone.
3. Toca el botón de compartir (el cuadrado con flecha hacia arriba).
4. Selecciona **"Agregar a pantalla de inicio"**.
5. Abre la app desde el ícono — se ejecuta a pantalla completa, como una app nativa.

> Nota: para que el ícono, el modo standalone y el funcionamiento sin conexión funcionen correctamente en iOS, la app debe servirse por HTTPS (no funciona igual desde `localhost` accedido remotamente).
