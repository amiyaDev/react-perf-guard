import React, { useEffect } from "react";
import { flushMetrics } from "./collector";
import { showWarning } from "./warnings";
import { createAnalyzerWorker } from "./worker/createWorker";
import { isDev } from "./env";

let worker: Worker | null = null;

export function PerfProvider({ children }: { children: React.ReactNode }) {
  if (!isDev) {
    return <>{children}</>;
  }

  useEffect(() => {
    try {
      worker = createAnalyzerWorker();

      worker.onmessage = (e) => {
        console.log(e, "[PerfGuard] Analysis results", e.data);
        e.data
          .filter(Boolean) 
          .forEach(showWarning);
      };
    } catch (err) {
      console.warn("[PerfGuard] Worker failed to start", err);
      return;
    }

    const interval = setInterval(() => {
      const data = flushMetrics();
      console.log("[PerfGuard] Flushing metrics", data);
      if (data.length) {
        worker?.postMessage(data);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      worker?.terminate();
      worker = null;
    };
  }, []);

  return <>{children}</>;
}
