// withPerfGuard.tsx

import React, { Profiler } from "react";
import { collectMetric } from "./collector";
import type { PerfGuardOptions } from "./Typescript/prefTypes";

const DEFAULT_OPTIONS: Required<PerfGuardOptions> = {
  boundaryType: "INLINE",
  enabled: true,
};

export function withPerfGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: PerfGuardOptions
) {
  const { boundaryType, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const fallbackId = "AnonymousComponent";
  const name =
    Component.displayName ||
    Component.name ||
    `PerfGuard(${fallbackId})`;

  // 🚫 ZERO overhead in prod
  if (process.env.NODE_ENV === "production" || !enabled) {
    return Component;
  }

  const Guarded: React.FC<P> = (props) => {
    return (
      <Profiler
        id={name}
        onRender={(
          id,
          phase,
          actualDuration,
          baseDuration,
          startTime,
          commitTime
        ) => {
          collectMetric({
            component: id,
            phase,
            actualDuration,
            baseDuration,
            startTime,
            commitTime,
            boundaryType,
          });
        }}
      >
        <Component {...props} />
      </Profiler>
    );
  };

  Guarded.displayName = `withPerfGuard(${name})`;

  return Guarded;
}
