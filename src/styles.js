import { COLORS, ELEVATION } from "./constants.js";

export const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Karla:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root { height: 100%; }
  html, body { overscroll-behavior: none; }
  body { margin: 0; }

  /* Elementos de interfaz (botones, nav, headers) no son texto para
     seleccionar/copiar — el contenido real (notas, comentarios) no lleva
     esta regla, así que se queda seleccionable donde importa. */
  button, .header-safe {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .header-safe input, .header-safe textarea {
    -webkit-user-select: text;
    user-select: text;
  }

  /* Anillo de foco propio en vez de quitarlo — solo aparece con teclado
     (:focus-visible), no en cada tap. */
  :focus { outline: none; }
  :focus-visible {
    outline: 2px solid ${COLORS.clay};
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    .app-shell { padding: 0 !important; align-items: stretch !important; }
    .phone-shell {
      width: 100% !important;
      max-width: 100% !important;
      height: 100dvh !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
  }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
  .skeleton-pulse { animation: pulse 1.3s ease-in-out infinite; }

  @media (display-mode: standalone) {
    .header-safe { padding-top: max(18px, env(safe-area-inset-top)) !important; }
    .content-safe { padding-bottom: max(30px, env(safe-area-inset-bottom)) !important; }
  }
`;

export const styles = {
  app: { minHeight: "100vh", background: "#1C130D", display: "flex", justifyContent: "center", fontFamily: "'Karla', sans-serif", padding: "24px 12px" },
  phone: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: ELEVATION[4], display: "flex", flexDirection: "column", height: 780, position: "relative" },
  loadingBox: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, boxShadow: ELEVATION[4], display: "flex", alignItems: "center", justifyContent: "center", height: 780 },
  saveErrorBanner: { position: "absolute", top: 0, left: 0, right: 0, background: COLORS.red, color: "#fff", fontSize: 11, textAlign: "center", padding: "6px 10px", zIndex: 5 },
  header: { background: COLORS.ink, color: COLORS.bg, padding: "18px 18px 0" },
  headerTopRow: { marginBottom: 10 },
  backBtn: { background: "none", border: "none", color: COLORS.bg, fontSize: 13, cursor: "pointer", padding: 0, opacity: 0.85, fontFamily: "'Karla', sans-serif" },
  brand: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, opacity: 0.8 },
  titulo: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 24, marginTop: 8, marginBottom: 14 },
  search: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: COLORS.bg, fontSize: 13.5, fontFamily: "'Karla', sans-serif", marginBottom: 16 },
  playerRow: { display: "flex", alignItems: "center", gap: 14, paddingBottom: 16 },
  avatarBig: { width: 50, height: 50, borderRadius: "50%", background: COLORS.ball, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, fontFamily: "'Fraunces', serif", flexShrink: 0 },
  playerName: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19 },
  playerMeta: { fontSize: 12, opacity: 0.65, marginTop: 3 },
  levelBadge: { background: "rgba(214,178,62,0.16)", border: "1px solid rgba(214,178,62,0.5)", color: COLORS.ball, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "5px 9px" },
  readOnlyBadge: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", color: COLORS.ink, background: COLORS.ball, borderRadius: 999, padding: "4px 9px 3px" },
  coachLine: { fontSize: 11.5, color: COLORS.bg, opacity: 0.7, paddingBottom: 14 },
  tabs: { display: "flex", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: "0 14px", overflowX: "auto", whiteSpace: "nowrap" },
  tabBtn: { background: "none", border: "none", padding: "13px 0", marginRight: 18, fontSize: 13.5, cursor: "pointer", position: "relative", fontFamily: "'Karla', sans-serif", flexShrink: 0 },
  tabIndicator: { position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: COLORS.clay, borderRadius: 2 },
  content: { flex: 1, overflowY: "auto", padding: "16px 18px 30px", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  cardLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.muted, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", userSelect: "none" },
  row: { display: "flex", alignItems: "center", gap: 12, background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 12, cursor: "pointer", width: "100%", fontFamily: "'Karla', sans-serif" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#F0E4D2", color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, fontFamily: "'Fraunces', serif", flexShrink: 0 },
  nombre: { fontSize: 14, fontWeight: 700, color: COLORS.ink },
  meta: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  restantesTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 700 },
  alertaDot: { width: 7, height: 7, borderRadius: "50%", background: COLORS.red },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", cursor: "pointer" },
  infoK: { color: COLORS.muted },
  infoV: { color: COLORS.ink, fontWeight: 600 },
  objetivoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, borderBottom: "1px solid #EEE0C8", paddingBottom: 9, marginBottom: 9 },
  objetivoTexto: { fontSize: 13, color: COLORS.ink, fontWeight: 600, lineHeight: 1.4 },
  objetivoPlazo: { fontSize: 10.5, color: COLORS.muted, marginTop: 2 },
  objetivoFecha: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#A0876E", whiteSpace: "nowrap" },
  puntoRow: { display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 },
  prioridadDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  puntoTexto: { fontSize: 13, color: COLORS.ink, lineHeight: 1.4 },
  puntoLabel: { fontSize: 13, fontWeight: 700, color: COLORS.ink },
  puntoDetalle: { fontSize: 12, color: "#6B5A47", marginTop: 2, lineHeight: 1.4 },
  sesionesLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.muted, fontWeight: 700, marginTop: 4 },
  sesionCard: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 4 },
  sesionEnfoque: { fontSize: 14, fontWeight: 700, color: COLORS.ink, marginTop: 6 },
  matchDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: COLORS.muted },
  ejercicioList: { margin: "8px 0 0", paddingLeft: 18 },
  ejercicioItem: { fontSize: 12.5, color: "#6B5A47", lineHeight: 1.6 },
  segmented: { display: "flex", background: "#EFE3CE", borderRadius: 10, padding: 3, gap: 3 },
  segmentBtn: { flex: 1, background: "transparent", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12.5, fontWeight: 600, color: COLORS.muted, cursor: "pointer", fontFamily: "'Karla', sans-serif" },
  segmentBtnActive: { background: COLORS.card, color: COLORS.ink, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  pagoResumen: { display: "flex", gap: 10, marginBottom: 6 },
  pagoResumenPagadas: { fontSize: 12.5, fontWeight: 700, color: COLORS.ink },
  pagoResumenPendientes: { fontSize: 12.5, fontWeight: 700, color: COLORS.amber },
  pagoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid #EEE0C8` },
  pagoFecha: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: COLORS.ink },
  pagoChip: { fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "'Karla', sans-serif" },
  paqueteTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  paqueteVence: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  paqueteBarWrap: { marginTop: 12 },
  paqueteBarBg: { height: 8, borderRadius: 6, background: "#EFE3CE", overflow: "hidden" },
  paqueteBarFill: { height: "100%", background: COLORS.ink, borderRadius: 6 },
  paqueteNums: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  paqueteRestantes: { fontSize: 13, fontWeight: 700, color: COLORS.ink },
  paqueteUsadas: { fontSize: 11.5, color: COLORS.muted },
  usadasControl: { display: "flex", alignItems: "center", gap: 8 },
  stepBtn: { width: 22, height: 22, borderRadius: 6, border: "1px solid #DCC9A8", background: "#fff", color: COLORS.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  finalizarBtn: { width: "100%", marginTop: 12, background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 4 },
  calDow: { fontSize: 10, color: "#B5A48C", textAlign: "center", fontWeight: 700, paddingBottom: 4 },
  calDay: { fontSize: 11.5, textAlign: "center", padding: "6px 0", borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", border: "none", cursor: "pointer", background: "transparent", position: "relative" },
  calFootnote: { fontSize: 11, color: "#A0876E", marginTop: 10 },
  calTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calMonthLabel: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: COLORS.ink, textTransform: "capitalize" },
  calArrow: { width: 26, height: 26, borderRadius: 7, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.muted, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  calEventDot: { position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%" },
  eventCard: { display: "flex", alignItems: "flex-start", gap: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "12px 14px", width: "100%" },
  eventDateBadge: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: COLORS.clay, background: "#F0E4D2", borderRadius: 8, padding: "6px 8px", textAlign: "center", lineHeight: 1.3, flexShrink: 0, minWidth: 42, display: "flex", flexDirection: "column" },
  eventDateMes: { fontSize: 9, opacity: 0.75, textTransform: "uppercase" },
  eventTag: { display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "rgba(214,178,62,0.2)", color: "#8C6B1F" },
  matchCard: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  matchTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultChip: { fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: "3px 8px", borderRadius: 6, color: COLORS.ink },
  rival: { fontSize: 15, fontWeight: 700, marginTop: 8, color: COLORS.ink },
  score: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.ink, marginTop: 2 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { fontSize: 10.5, background: "#F0E4D2", color: "#6B4E30", padding: "4px 8px", borderRadius: 20, fontWeight: 600 },
  matchNote: { fontSize: 12.5, color: "#6B5A47", marginTop: 10, lineHeight: 1.5 },
  timeline: { position: "relative", paddingLeft: 4 },
  timelineItem: { display: "flex", gap: 12, paddingBottom: 20, position: "relative" },
  timelineDot: { width: 9, height: 9, borderRadius: "50%", background: COLORS.clay, marginTop: 5, flexShrink: 0, boxShadow: "0 0 0 4px #F0E4D2" },
  noteTop: { display: "flex", justifyContent: "space-between" },
  noteAuthor: { fontSize: 13, fontWeight: 700, color: COLORS.ink },
  noteDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.muted },
  noteText: { fontSize: 13, color: "#4A3F35", marginTop: 4, lineHeight: 1.5 },
  input: { width: "100%", padding: "9px 10px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 13, fontFamily: "'Karla', sans-serif", marginBottom: 7, color: COLORS.ink },
  textarea: { width: "100%", padding: "9px 10px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 13, fontFamily: "'Karla', sans-serif", marginBottom: 7, minHeight: 60, resize: "vertical", color: COLORS.ink },
  select: { padding: "9px 8px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 12.5, fontFamily: "'Karla', sans-serif", marginBottom: 7, color: COLORS.ink, background: "#fff" },
  miniForm: { marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 },
  addBtn: { background: COLORS.clay, color: COLORS.card, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif", width: "100%" },
  secondaryBtn: { background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif", width: "100%" },
  secondaryBtnSmall: { background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Karla', sans-serif", flex: 1 },
  primaryBtn: { background: COLORS.clay, color: COLORS.card, border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif", width: "100%" },
  // Tercer nivel de jerarquía de botones: solo texto, sin fondo ni borde.
  // Para acciones de bajo compromiso (ej. "Ver detalle", enlaces inline) que
  // no deben competir visualmente con el primario ni el secundario.
  tertiaryBtn: { background: "transparent", border: "none", color: COLORS.clay, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif", width: "100%" },
  iconBtn: { width: 44, flexShrink: 0, background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, fontSize: 16, cursor: "pointer" },
  // Base para tags de estado (pagos, etc.) — siempre ícono + texto, nunca
  // solo color. bg/fg se completan en el call site con SEMANTIC.<estado>.
  statusTag: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "4px 9px" },
  backupHint: { fontSize: 12, color: COLORS.muted, lineHeight: 1.5, margin: "0 0 10px" },
  importError: { fontSize: 12, color: COLORS.red, marginTop: 8 },
  deleteBtn: { background: "none", border: "none", color: COLORS.muted, fontSize: 18, lineHeight: 1, cursor: "pointer", padding: "2px 4px", flexShrink: 0 },
  dangerBtn: { width: "100%", background: "transparent", border: `1.5px solid ${COLORS.red}`, color: COLORS.red, borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Karla', sans-serif", marginTop: 4 },
};
