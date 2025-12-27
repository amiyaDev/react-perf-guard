import React, { Profiler } from "react";
import { collectMetric } from "./collector";
import { isDev } from "./env";

export function PerfProfiler({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}) {
if (!isDev) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={collectMetric}>
      {children}
    </Profiler>
  );
}
