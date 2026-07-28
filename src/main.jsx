import React from "react";
import ReactDOM from "react-dom/client";
import CountryPadelApp from "./App.jsx";
import AlumnoView from "./AlumnoView.jsx";

const alumnoId = new URLSearchParams(window.location.search).get("alumno");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {alumnoId ? <AlumnoView id={alumnoId} /> : <CountryPadelApp />}
  </React.StrictMode>
);
