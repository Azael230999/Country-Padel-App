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
  red: "#8B2E2E",
  amber: "#C97C3D",
  green: "#6B8F5C",
};

export const DEFAULT_COACH = { nombre: "", rol: "Coach de Padel", telefono: "", email: "", bio: "", academyId: "", isAdmin: true };

// Tiros para elegir al agregar un punto por desarrollar (tenis + pádel).
export const TIROS = ["Saque", "Derecha", "Revés", "Volea", "Bandeja", "Víbora", "Remate", "Slice", "Globo", "Salida de pared", "Definición", "Movimiento"];

export function fmt(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${meses[parseInt(m, 10) - 1]}`;
}
