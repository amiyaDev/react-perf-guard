// PerfProfiler.tsx

import { Profiler } from "react";
import { isPerfGuardActive } from "./env";
import { ProfilerMetric } from "./Typescript/prefTypes";
import { collectMetric } from "./collector";
import { PerfPathContext, usePerfPath } from "./context/PerfPathContext";

export function PerfProfiler({
  id,
  children,
  boundaryType = "INLINE",
}: {
  id: string;
  boundaryType?: ProfilerMetric["boundaryType"];
  children: React.ReactNode;
}) {
  const path = usePerfPath(id);

  if (!isPerfGuardActive()) {
    return <>{children}</>;
  }

  return (
    <PerfPathContext.Provider value={path}>
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
            path,
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
    </PerfPathContext.Provider>
  );
}
