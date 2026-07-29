import React from "react";
import ReactDOM from "react-dom/client";
import CountryPadelApp from "./App.jsx";
import AlumnoView from "./AlumnoView.jsx";
import AlumnoGrupoView from "./AlumnoGrupoView.jsx";

const params = new URLSearchParams(window.location.search);
const alumnoId = params.get("alumno");
const alumnoGrupoId = params.get("alumnoGrupo");

function Root() {
  if (alumnoId) return <AlumnoView id={alumnoId} />;
  if (alumnoGrupoId) return <AlumnoGrupoView id={alumnoGrupoId} />;
  return <CountryPadelApp />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
