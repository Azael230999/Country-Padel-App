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

export const COLORS = {
  ink: "#12211F",
  bg: "#FAF9F4",
  card: "#fff",
  border: "#E9E2D3",
  lime: "#C4D82E",
  muted: "#8A9A94",
  red: "#C4553F",
  amber: "#D9A93A",
  green: "#B7C98A",
};

export const DEFAULT_COACH = { nombre: "", rol: "Coach de Padel", telefono: "", email: "", bio: "", academyId: "", isAdmin: true };

export function fmt(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${meses[parseInt(m, 10) - 1]}`;
}
