import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this project at /Country-Padel-App/, so the build
// needs that subpath as its base. Local dev/preview stays at "/".
const base = process.env.GH_PAGES ? "/Country-Padel-App/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "offline.html"],
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
      manifest: {
        name: "Country Padel",
        short_name: "Country Padel",
        description: "Gestión de alumnos, entrenamientos, asistencia y partidos.",
        // Paleta "Cancha de arcilla": café oscuro de marca (COLORS.ink) y
        // crema de fondo (COLORS.bg) — antes tenía verde de una paleta vieja.
        theme_color: "#2A1D14",
        background_color: "#F5EEE2",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
