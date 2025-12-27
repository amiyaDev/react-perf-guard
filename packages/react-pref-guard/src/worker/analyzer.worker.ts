self.onmessage = (event) => {
  const metrics = event.data;

  const results = metrics.map((m: any) => {
    const issues: string[] = [];

    if (m.renders > 20) {
      issues.push("Excessive re-renders");
    }

    if (m.avgTime > 16) {
      issues.push("Slow render (>16ms)");
    }

    return {
      ...m,
      issues,
      risk: issues.length === 0 ? "LOW" : "HIGH"
    };
  });

  self.postMessage(results);
};
