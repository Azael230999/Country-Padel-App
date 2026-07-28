import { useState } from "react";
import { auth } from "../firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { styles, fontImport } from "../styles.js";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResetStatus("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setResetStatus("Escribe tu correo arriba primero.");
      return;
    }
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetStatus("Te enviamos un correo para restablecer tu contraseña.");
    } catch (err) {
      setResetStatus("No pudimos enviar el correo. Revisa que esté bien escrito.");
    }
  };

  return (
    <div style={styles.app} className="app-shell">
      <style>{fontImport}</style>
      <div style={styles.phone} className="phone-shell">
        <div style={styles.header} className="header-safe">
          <div style={styles.brand}>COUNTRY PADEL</div>
          <div style={styles.titulo}>Iniciar sesión</div>
        </div>
        <div style={styles.content} className="content-safe">
          <form onSubmit={handleSubmit} style={styles.card}>
            <div style={styles.cardLabel}>Acceso del coach</div>
            <input
              style={styles.input}
              type="email"
              autoCapitalize="none"
              autoComplete="username"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div style={styles.importError}>{error}</div>}
            <button style={{ ...styles.primaryBtn, marginTop: 4 }} disabled={loading || !email.trim() || !password}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
            <button
              type="button"
              style={{ ...styles.secondaryBtnSmall, width: "100%", marginTop: 8 }}
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
            {resetStatus && <div style={styles.backupHint}>{resetStatus}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
