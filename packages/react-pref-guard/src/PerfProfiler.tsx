// PerfProfiler.tsx

import { Profiler } from "react";
import { isDev } from "./env";
import { ProfilerMetric } from "./Typescript/prefTypes";
import { collectMetric } from "./collector";

export function PerfProfiler({
  id,
  children,
  boundaryType = "INLINE",
}: {
  id: string;
  boundaryType?: ProfilerMetric["boundaryType"];
  children: React.ReactNode;
}) {
  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <Profiler
      id={id}
      onRender={(
        component,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime
      ) => {
        collectMetric({
          component,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime,
          boundaryType,
        });
      }}
    >
      {children}
    </Profiler>
  );
}
