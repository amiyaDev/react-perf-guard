// PerfPathContext.tsx – tracks the ancestor chain of PerfProfiler/withPerfGuard
// boundaries so a nested component's reported issues can show *where* in the
// tree they came from (e.g. "App > Dashboard > UserTable"), not just a flat
// component name.
import { createContext, useContext } from "react";

export const PerfPathContext = createContext<string[]>([]);

export function usePerfPath(id: string): string[] {
  const parentPath = useContext(PerfPathContext);
  return [...parentPath, id];
}
