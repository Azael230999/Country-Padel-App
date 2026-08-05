// Categorías con las que arranca una academia nueva. A partir de ahí el admin
// puede editarlas libremente (viven en Firestore, en academyConfig/{academyId}).
export const DEFAULT_GRUPOS = {
  "Pádel": ["Avanzado", "Intermedio", "Principiantes"],
  "Tenis": ["Competitivo", "Bola amarilla", "Bola verde", "Bola naranja", "Bola roja"],
};

export function computeGrupoLabels(grupos) {
  return Object.entries(grupos).flatMap(([deporte, categorias]) =>
    categorias.map((categoria) => `${deporte} · ${categoria}`)
  );
}

export function grupoLabel(deporte, categoria) {
  return `${deporte} · ${categoria}`;
}

// Paleta "Cancha de arcilla": el rojo de la tierra batida contra la piedra
// caliza de Yucatán. clay = acento sólido (botones/estados activos, siempre
// con texto claro encima); ball = acento brillante (para texto/insignias
// sobre el header oscuro, donde clay no tiene suficiente contraste).
//
// Tokens (sección 2 de la propuesta de sistema de diseño):
//   --bg-header      -> ink    --accent-primary -> clay   --text-muted -> muted
//   --bg-app         -> bg     --accent-gold    -> ball   --danger     -> red
//   --bg-card        -> card                              --success    -> green
//   --text-primary   -> ink
// ball (dorado) es solo para insignias/destacados (nivel, avatar, badges) —
// nunca para indicar un resultado positivo ("GANÓ" usa green, no ball, para
// no confundirse con el badge de nivel).
export const COLORS = {
  ink: "#2A1D14",
  bg: "#F5EEE2",
  card: "#FFFDF8",
  border: "#E6D9C4",
  clay: "#B24A28",
  ball: "#D6B23E",
  muted: "#8C7862",
  // rojo "error/destructivo": antes #8B2E2E (hue 0°), a solo 15° de clay
  // (hue ~15°) en la rueda de color — se sentían parientes. Este es más
  // frío/azulado (hue ~344°, hacia el magenta) para separarse con claridad
  // del terracota de marca sin dejar de leerse como rojo.
  red: "#9B2242",
  // ámbar "advertencia": antes #C97C3D (hue 27°, todavía del lado naranja).
  // Este está en la familia dorada de `ball` (hue ~46°) en vez de naranja,
  // y es deliberadamente oscuro — un dorado claro nunca pasa 4.5:1 como
  // texto (ver SEMANTIC.warning más abajo, verificado con WCAG).
  amber: "#5C420C",
  green: "#6B8F5C",
};

// Colores semánticos: cada estado trae "bg" (fondo claro para tags/chips) y
// "fg" (texto/ícono que va encima de ese bg). Todos los pares fg-sobre-bg
// pasan WCAG AA para texto normal (>=4.5:1) — verificado con la fórmula de
// contraste estándar (luminancia relativa), no a ojo:
//   success  6.24:1   warning  7.68:1   error  5.98:1   info  6.20:1
// `success` usa un verde más oscuro que COLORS.green porque ese último es
// un color de superficie (fondo de chip), no de texto — no sirven los dos
// roles con el mismo tono. `warning.fg` reusa COLORS.amber y `error.fg`
// reusa COLORS.red, así que cualquier lugar que ya usaba esos tokens hereda
// la corrección de tono automáticamente.
export const SEMANTIC = {
  success: { bg: "#E3EDDD", fg: "#3F5C34" },
  warning: { bg: "#F5E8C2", fg: COLORS.amber },
  error: { bg: "#F3DCE2", fg: COLORS.red },
  info: { bg: "#DCE6EE", fg: "#2C5578" },
};

// Elevación: 4 niveles, sombra siempre con tinte café (COLORS.ink = 42,29,20)
// en vez de negro puro, para que se sienta parte de la misma paleta cálida.
export const ELEVATION = {
  1: "0 1px 2px rgba(42,29,20,0.08)",
  2: "0 2px 6px rgba(42,29,20,0.10), 0 1px 2px rgba(42,29,20,0.06)",
  3: "0 8px 20px rgba(42,29,20,0.14)",
  4: "0 20px 48px rgba(42,29,20,0.22)",
};

// Espaciado: grid de 8px.
export const SPACING = { sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const DEFAULT_COACH = { nombre: "", rol: "Coach de Padel", telefono: "", email: "", bio: "", academyId: "", isAdmin: true };

// Tiros para elegir al agregar un punto por desarrollar (tenis + pádel).
export const TIROS = ["Saque", "Derecha", "Revés", "Volea", "Bandeja", "Víbora", "Remate", "Slice", "Globo", "Salida de pared", "Definición", "Movimiento"];

export function fmt(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${meses[parseInt(m, 10) - 1]}`;
}

// Nivel se guarda como texto libre (ej. "4.0", "3.00", "4"); esto lo muestra
// sin decimales si es un número entero, o con máximo 1 decimal si no lo es.
// Valores no numéricos (ej. el placeholder "—") se devuelven tal cual.
export function formatNivel(nivel) {
  const num = Number(nivel);
  if (nivel === "" || nivel == null || Number.isNaN(num)) return nivel;
  return Number.isInteger(num) ? String(num) : String(Math.round(num * 10) / 10);
}
