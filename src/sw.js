import { precacheAndRoute, matchPrecache, cleanupOutdatedCaches } from "workbox-precaching";
import { setCatchHandler } from "workbox-routing";
import { googleFontsCache } from "workbox-recipes";

self.skipWaiting();
cleanupOutdatedCaches();

// Precachea el shell de la app (JS/CSS/HTML/íconos) — build-time, inyectado
// por vite-plugin-pwa. Con esto, visitas repetidas cargan directo del caché,
// sin esperar red.
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Las fuentes de Google Fonts se sirven aparte (dominio distinto) — sin
// esto, cada carga sin red cae a la fuente del sistema.
googleFontsCache();

// Último recurso: si una navegación no puede resolverse ni por red ni por
// caché (nada previamente visitado), muestra la pantalla de "sin conexión"
// con la marca en vez del error nativo del navegador. El caso normal —app
// ya visitada antes, ahora sin señal— ya se resuelve arriba: el shell sale
// del precache y los datos vienen del caché local de Firestore.
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return (await matchPrecache("offline.html")) || Response.error();
  }
  return Response.error();
});
