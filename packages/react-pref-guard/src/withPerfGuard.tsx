import React, { Profiler } from "react";
import { collectMetric } from "./collector";

export function withPerfGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  const name = Component.displayName || Component.name || "Anonymous";

  const Guarded: React.FC<P> = (props) => {
    return (
      <Profiler id={name} onRender={collectMetric}>
        <Component {...props} />
      </Profiler>
    );
  };

  Guarded.displayName = `withPerfGuard(${name})`;

  return Guarded;
}
