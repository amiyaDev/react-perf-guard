import React, { useEffect, useState } from "react";
import { withPerfGuard } from "react-pref-guard";

function burnCPU(ms: number) {
  const start = performance.now();
  while (performance.now() - start < ms) {
    // busy wait
  }
}

function CriticalRegression() {
  const [phase, setPhase] = useState<"FAST" | "SLOW">("FAST");

  // FAST → SLOW regression
  burnCPU(phase === "FAST" ? 5 : 80);

  useEffect(() => {
    const id = setTimeout(() => setPhase("SLOW"), 3000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{ padding: 20, background: "#fef2f2" }}>
      📉 Regression phase: {phase}
    </div>
  );
}

const CriticalRegressionGuarded = withPerfGuard(CriticalRegression);
export default CriticalRegressionGuarded;
