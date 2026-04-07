import React from "react";
import { createRoot } from "react-dom/client";
import Game from "./game.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root mount point");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
