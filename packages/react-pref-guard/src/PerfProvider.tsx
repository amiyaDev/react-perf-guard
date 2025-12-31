// PerfProvider.tsx 
import React, { useEffect,  useState } from "react";
import { flushMetrics } from "./collector";
import { showWarning, showCriticalAlert } from "./warnings";
import { createAnalyzerWorker } from "./worker/createWorker";
import { isDev } from "./env";
import { getRulesConfig } from "./pref-engine/rules";

let worker: Worker | null = null;

export function PerfProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState({ issues: 0, critical: 0 });

  if (!isDev) {
    return <>{children}</>;
  }

  useEffect(() => {
    try {
      worker = createAnalyzerWorker();

      // Initialize worker with rules
      const rules = getRulesConfig();
      
      worker.postMessage({
        type: "INIT_RULES",
        payload: rules,
      });

      console.log(`[PerfGuard] Initialized with ${rules.length} rules`);

      worker.onmessage = (e) => {
        const { type, data, hasCritical } = e.data;

        if (type === "INIT_SUCCESS") {
          console.log(`✅ [PerfGuard] Worker ready with ${e.data.count} rules`);
        }

        if (type === "RESULTS") {
          console.log(`[PerfGuard] Analysis results: ${data.length} issue(s)`, {
            hasCritical,
            timestamp: new Date().toISOString()
          });

          // Update stats
          setStats(prev => ({
            issues: prev.issues + data.length,
            critical: prev.critical + (hasCritical ? 1 : 0)
          }));

          // Show warnings
          data.forEach((result: any) => {
            if (result.hasCritical) {
              showCriticalAlert(result);
            } else {
              showWarning(result);
            }
          });
        }

        if (type === "STATS") {
          console.log("📊 [PerfGuard] Stats:", e.data.data);
        }
      };

      worker.onerror = (err) => {
        console.error("[PerfGuard] Worker error:", err);
      };

    } catch (err) {
      console.warn("[PerfGuard] Worker failed to start", err);
      return;
    }

    // Flush metrics to worker every 5 seconds
    const interval = setInterval(() => {
      const data = flushMetrics();
      if (data.length) {
        console.log(`[PerfGuard] Flushing ${data.length} snapshot(s)`);
        worker?.postMessage({
          type: "EVALUATE",
          payload: data,
        });
      }
    }, 5000);

    // Get stats every 30 seconds
    const statsInterval = setInterval(() => {
      worker?.postMessage({ type: "GET_STATS" });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
      worker?.terminate();
      worker = null;
    };
  }, []);

  // Show stats overlay in dev mode
  if (stats.critical > 0) {
    return (
      <>
        {children}
        <div 
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            background: '#dc2626',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 10000,
            fontFamily: 'monospace',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🚨 {stats.critical} CRITICAL | {stats.issues} issues total
        </div>
      </>
    );
  }

  return <>{children}</>;
}
