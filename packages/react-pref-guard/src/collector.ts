//collector.ts

import type { MetricSnapshot, ProfilerMetric } from "./Typescript/prefTypes";

type InternalMetric = {
  renders: number;
  totalTime: number;
  maxTime: number;
  boundaryType: ProfilerMetric["boundaryType"];
  phaseCounts: {
    mount: number;
    update: number;
  };
};

const buffer = new Map<string, InternalMetric>();

export function collectMetric(metric: ProfilerMetric) {
  const {
    component,
    phase,
    actualDuration,
    boundaryType,
  } = metric;

  let entry = buffer.get(component);

  if (!entry) {
    entry = {
      renders: 0,
      totalTime: 0,
      maxTime: 0,
      boundaryType,
      phaseCounts: { mount: 0, update: 0 },
    };
    buffer.set(component, entry);
  }

  entry.renders += 1;
  entry.totalTime += actualDuration;
  entry.maxTime = Math.max(entry.maxTime, actualDuration);
if (phase === "mount" || phase === "update") {
  entry.phaseCounts[phase] += 1;
}
}


export function flushMetrics(): MetricSnapshot[] {
  const now = performance.now();
  const snapshot: MetricSnapshot[] = [];

  for (const [component, metric] of buffer.entries()) {
    snapshot.push({
      component,
      renders: metric.renders,
      avgTime:
        metric.renders > 0
          ? metric.totalTime / metric.renders
          : 0,
      maxTime: metric.maxTime,
      boundaryType: metric.boundaryType,

      phaseCounts: {
        mount: metric.phaseCounts.mount,
        update: metric.phaseCounts.update,
      },

      timestamp: now,
    });
  }

  buffer.clear();
  return snapshot;
}
