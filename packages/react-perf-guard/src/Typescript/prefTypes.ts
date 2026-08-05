export type BoundaryType =
  | "INLINE"
  | "HOC"
  | "PAGE"
  | "LAYOUT"
  | "PROVIDER";



export type RenderPhase = "mount" | "update"|"nested-update";

export interface PerfGuardOptions {
  boundaryType?: BoundaryType;
  enabled?: boolean;
}

export interface ProfilerMetric {
  component: string;
  // Full ancestor chain of nested PerfProfiler/withPerfGuard boundaries,
  // e.g. ["App", "Dashboard", "UserTable"]. Falls back to [component] when
  // this boundary has no PerfProfiler ancestor.
  path?: string[];
  phase: RenderPhase;
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  boundaryType: BoundaryType;
}

export interface MetricSnapshot {
  component: string;
  path?: string[];
  renders: number;
  avgTime: number;
  maxTime: number;
  boundaryType: BoundaryType;
  phaseCounts: {
    mount: number;
    update: number;
  };
  timestamp: number;
}
