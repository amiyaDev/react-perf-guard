import { createRoot } from "react-dom/client";
import { PerfProvider } from "react-perf-guard";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // forceEnable: this Vercel deployment IS a production build (NODE_ENV=production),
  // which normally disables PerfGuard entirely — that's the correct default for a
  // real app. This app's whole purpose is *demonstrating* PerfGuard, so it opts in
  // explicitly. Never do this in a real production app.
  <PerfProvider forceEnable>
    <App />
  </PerfProvider>
);
