import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initViewportFix } from "./utils/viewportFix";

// Initialize mobile viewport fix before rendering
initViewportFix();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
