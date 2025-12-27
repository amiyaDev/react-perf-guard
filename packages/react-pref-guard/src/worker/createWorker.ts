export function createAnalyzerWorker() {
  const code = `
    self.onmessage = (e) => {
      const metrics = e.data;

      const results = metrics
        .map((m) => {
          const issues = [];

          // Rule 1: Excessive re-renders
          if (m.renders > 20) {
            issues.push("EXCESSIVE_RENDERS");
          }

          // Rule 2: Slow render
          if (m.avgTime > 16 || m.maxTime > 16) {
            issues.push("SLOW_RENDER");
          }

          // If no issues → do not warn
          if (issues.length === 0) {
            return null;
          }

          return {
            component: m.component,
            renders: m.renders,
            avgTime: m.avgTime,
            maxTime: m.maxTime,
            issues,
            risk: issues.length > 1 ? "HIGH" : "MEDIUM"
          };
        })
        .filter(Boolean); // remove healthy components

      self.postMessage(results);
    };
  `;

  const blob = new Blob([code], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  return new Worker(url);
}
