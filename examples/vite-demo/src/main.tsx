import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PerfProvider } from "react-pref-guard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PerfProvider>
      <App />
    </PerfProvider>
  </StrictMode>
);
