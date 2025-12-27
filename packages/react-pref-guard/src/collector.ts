type Metric = {
  renders: number;
  totalTime: number;
  maxTime: number;
};

const buffer = new Map<string, Metric>();

export function collectMetric(
  id: string,
  _phase: string,
  actualDuration: number
) {
  const metric = buffer.get(id) ?? {
    renders: 0,
    totalTime: 0,
    maxTime: 0
  };

  metric.renders += 1;
  metric.totalTime += actualDuration;
  metric.maxTime = Math.max(metric.maxTime, actualDuration);

  buffer.set(id, metric);
}

export function flushMetrics() {
  const snapshot = Array.from(buffer.entries()).map(
    ([component, metric]) => ({
      component,
      renders: metric.renders,
      avgTime: metric.totalTime / metric.renders,
      maxTime: metric.maxTime
    })
  );

  buffer.clear();
  return snapshot;
}
