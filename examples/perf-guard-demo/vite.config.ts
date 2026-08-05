import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = process.env.PORT ? Number(process.env.PORT) : 5173;

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias:
      mode === "production"
        ? {
            // React's standard production build strips Profiler.onRender
            // instrumentation entirely to minimize overhead — the whole
            // reason this demo exists is to show that instrumentation, so
            // it needs the profiling build specifically in production.
            // Dev mode already includes full instrumentation, no alias needed.
            "react-dom/client": "react-dom/profiling",
          }
        : {},
  },
  server: {
    port,
    strictPort: true,
  },
  preview: {
    port,
    strictPort: true,
  },
}));
