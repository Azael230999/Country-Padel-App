import { useState } from "react";
import { styles } from "../styles.js";

export function EditableRow({ k, v, onSave, multiline }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(v || "");

  if (editando) {
    return (
      <div style={{ padding: "6px 0" }}>
        {multiline ? (
          <textarea style={styles.textarea} value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        ) : (
          <input style={styles.input} value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        )}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button style={styles.addBtn} onClick={() => { onSave(valor); setEditando(false); }}>Guardar</button>
          <button style={styles.secondaryBtnSmall} onClick={() => { setValor(v || ""); setEditando(false); }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.infoRow} onClick={() => setEditando(true)}>
      {k && <span style={styles.infoK}>{k}</span>}
      <span style={{ ...styles.infoV, cursor: "pointer", flex: k ? undefined : 1 }}>{v || "Tocar para agregar"}</span>
    </div>
  );
}
