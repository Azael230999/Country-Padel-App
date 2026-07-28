import { useState } from "react";
import { styles } from "../styles.js";
import { COLORS, computeGrupoLabels } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";

export function CoachesScreen({ coaches, groupAssignments, onUpdateAssignments, grupos, onUpdateGrupos, alumnos, nav, setNav, onAddCoach }) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(null);

  const grupoLabels = computeGrupoLabels(grupos);

  const contarAlumnos = (deporte, categoria) =>
    (alumnos || []).filter((a) => a.deporte === deporte && (categoria === undefined || a.categoria === categoria)).length;

  const removeCategoria = (deporte, categoria) => {
    const n = contarAlumnos(deporte, categoria);
    if (n > 0 && !window.confirm(`${n} alumno${n !== 1 ? "s" : ""} está${n !== 1 ? "n" : ""} en "${deporte} · ${categoria}". Si borras la categoría, esos alumnos seguirán existiendo pero ya no aparecerá en las listas. ¿Continuar?`)) {
      return;
    }
    const nextCategorias = grupos[deporte].filter((c) => c !== categoria);
    const next = { ...grupos };
    if (nextCategorias.length === 0) delete next[deporte];
    else next[deporte] = nextCategorias;
    onUpdateGrupos(next);
  };

  const removeDeporte = (deporte) => {
    const n = contarAlumnos(deporte);
    if (n > 0) {
      window.alert(`No puedes borrar "${deporte}" porque tiene ${n} alumno${n !== 1 ? "s" : ""} asignado${n !== 1 ? "s" : ""}. Muévelos o elimínalos primero.`);
      return;
    }
    if (!window.confirm(`¿Eliminar el deporte "${deporte}" y todas sus categorías?`)) return;
    const next = { ...grupos };
    delete next[deporte];
    onUpdateGrupos(next);
  };

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Coaches</div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={{ marginBottom: 10 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={true} />
        </div>

        <button style={styles.secondaryBtn} onClick={() => { setShowNuevo((v) => !v); setCreado(null); setError(""); }}>
          {showNuevo ? "Cancelar" : "+ Agregar coach"}
        </button>

        {showNuevo && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <div style={styles.cardLabel}>Nueva cuenta de coach</div>
            <input style={styles.input} type="email" autoCapitalize="none" placeholder="Correo del coach" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div style={styles.importError}>{error}</div>}
            {creado && (
              <div style={styles.backupHint}>
                Cuenta creada. Pásale al coach estos datos para que entre:
                <br /><strong>Correo:</strong> {creado.email}
                <br /><strong>Contraseña temporal:</strong> {creado.password}
              </div>
            )}
            {!creado && (
              <button
                style={{ ...styles.primaryBtn, marginTop: 4 }}
                disabled={loading || !email.trim()}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const password = Array.from(crypto.getRandomValues(new Uint8Array(10))).map((b) => b.toString(36)).join("").slice(0, 12);
                  try {
                    await onAddCoach(email.trim(), password);
                    setCreado({ email: email.trim(), password });
                    setEmail("");
                  } catch (e) {
                    setError(e.code === "auth/email-already-in-use" ? "Ese correo ya tiene una cuenta." : "No se pudo crear la cuenta.");
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Creando…" : "Crear cuenta"}
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {coaches === null && <div className="spinner" style={styles.spinner} />}
          {coaches && coaches.length === 0 && <div style={styles.empty}>Aún no has agregado coaches.</div>}
          {coaches && coaches.map((c) => (
            <div key={c.uid} style={styles.row}>
              <div style={styles.avatar}>{(c.nombre || c.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.nombre}>{c.nombre || "Sin nombre todavía"}</div>
                <div style={styles.meta}>{c.rol || "Coach"}</div>
              </div>
            </div>
          ))}
        </div>

        {coaches && coaches.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={styles.sesionesLabel}>Asignación de grupos</div>
            <p style={{ ...styles.backupHint, marginTop: 6 }}>Toca los coaches que dan cada grupo. Un grupo puede tener varios, y un coach puede dar varios grupos.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {grupoLabels.map((label) => {
                const asignados = (groupAssignments && groupAssignments[label]) || [];
                return (
                  <div key={label} style={styles.card}>
                    <div style={styles.cardLabel}>{label}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {coaches.map((c) => {
                        const activo = asignados.includes(c.uid);
                        return (
                          <button
                            key={c.uid}
                            style={{
                              ...styles.pagoChip,
                              background: activo ? COLORS.clay : "transparent",
                              color: activo ? COLORS.card : COLORS.muted,
                              border: activo ? "none" : `1.5px solid ${COLORS.border}`,
                            }}
                            onClick={() => {
                              const next = activo ? asignados.filter((u) => u !== c.uid) : [...asignados, c.uid];
                              onUpdateAssignments(label, next);
                            }}
                          >
                            {c.nombre || c.email || c.uid}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div style={styles.sesionesLabel}>Categorías de grupo</div>
          <p style={{ ...styles.backupHint, marginTop: 6 }}>Agrega o quita deportes y categorías. Si una categoría o deporte tiene alumnos, te lo advertimos antes de borrarlo.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {Object.entries(grupos).map(([deporte, categorias]) => (
              <CategoriaCard
                key={deporte}
                deporte={deporte}
                categorias={categorias}
                onRemoveCategoria={(cat) => removeCategoria(deporte, cat)}
                onRemoveDeporte={() => removeDeporte(deporte)}
                onAddCategoria={(cat) => onUpdateGrupos({ ...grupos, [deporte]: [...categorias, cat] })}
              />
            ))}
            <NuevoDeporteCard
              existentes={Object.keys(grupos)}
              onAdd={(nombre, primeraCategoria) => onUpdateGrupos({ ...grupos, [nombre]: [primeraCategoria] })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function CategoriaCard({ deporte, categorias, onRemoveCategoria, onRemoveDeporte, onAddCategoria }) {
  const [nueva, setNueva] = useState("");
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={styles.cardLabel}>{deporte}</div>
        <button style={styles.deleteBtn} onClick={onRemoveDeporte} aria-label={`Eliminar ${deporte}`}>×</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {categorias.map((cat) => (
          <span
            key={cat}
            style={{ ...styles.pagoChip, background: "transparent", color: COLORS.ink, border: `1.5px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 5 }}
          >
            {cat}
            <button
              style={{ ...styles.deleteBtn, fontSize: 14, padding: 0 }}
              onClick={() => onRemoveCategoria(cat)}
              aria-label={`Eliminar categoría ${cat}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={{ ...styles.input, flex: 1, marginBottom: 0 }}
          placeholder="Nueva categoría"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <button
          style={{ ...styles.addBtn, width: "auto", padding: "9px 14px" }}
          disabled={!nueva.trim() || categorias.includes(nueva.trim())}
          onClick={() => { onAddCategoria(nueva.trim()); setNueva(""); }}
        >
          + Agregar
        </button>
      </div>
    </div>
  );
}

function NuevoDeporteCard({ existentes, onAdd }) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  return (
    <div style={styles.card}>
      <div style={styles.cardLabel}>Nuevo deporte</div>
      <input style={styles.input} placeholder="Nombre del deporte" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input style={styles.input} placeholder="Primera categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
      <button
        style={styles.addBtn}
        disabled={!nombre.trim() || !categoria.trim() || existentes.includes(nombre.trim())}
        onClick={() => { onAdd(nombre.trim(), categoria.trim()); setNombre(""); setCategoria(""); }}
      >
        + Agregar deporte
      </button>
    </div>
  );
}
