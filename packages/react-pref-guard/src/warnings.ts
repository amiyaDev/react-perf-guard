type IssueType =
  | "EXCESSIVE_RENDERS"
  | "SLOW_RENDER"
  | "UNSTABLE_STATE_UPDATES"
  | "UNOPTIMIZED_LIST";

export function showWarning(result: {
  component: string;
  renders: number;
  avgTime: number;
  maxTime: number;
  issues: IssueType[];
}) {
  if (!result.issues || result.issues.length === 0) return;

  console.group(
    `%c[PerfGuard] ${result.component}`,
    "color: orange; font-weight: bold"
  );

  /* ----------------------------------
     Excessive Re-renders
  ---------------------------------- */
  if (result.issues.includes("EXCESSIVE_RENDERS")) {
    console.warn("• Excessive re-renders detected");
    console.info(
      "Why this matters:",
      "Frequent renders increase CPU usage and slow the UI."
    );
    console.info(
      "Fix:",
      "Wrap component with React.memo, avoid unnecessary state updates, and stabilize props."
    );
  }

  /* ----------------------------------
     Slow Render
  ---------------------------------- */
  if (result.issues.includes("SLOW_RENDER")) {
    console.warn("• Slow render detected (>16ms)");
    console.info(
      "Why this matters:",
      "Slow renders block the main thread and cause frame drops."
    );
    console.info(
      "Fix:",
      "Move heavy calculations to useMemo, split components, or offload work to a Web Worker."
    );
  }

  /* ----------------------------------
     Unstable State Updates
  ---------------------------------- */
  if (result.issues.includes("UNSTABLE_STATE_UPDATES")) {
    console.warn("• Unstable state updates detected");
    console.info(
      "Why this matters:",
      "State changes on every render cause cascading re-renders."
    );
    console.info(
      "Fix:",
      "Avoid setting state during render and debounce rapid updates."
    );
  }

  /* ----------------------------------
     Unoptimized Large List
  ---------------------------------- */
  if (result.issues.includes("UNOPTIMIZED_LIST")) {
    console.warn("• Large list rendering detected");
    console.info(
      "Why this matters:",
      "Rendering many DOM nodes is expensive and slows scrolling."
    );
    console.info(
      "Fix:",
      "Use list virtualization (react-window, react-virtualized)."
    );
  }

  /* ----------------------------------
     Summary
  ---------------------------------- */
  console.info(
    "Metrics:",
    `renders=${result.renders}, avg=${result.avgTime.toFixed(
      2
    )}ms, max=${result.maxTime.toFixed(2)}ms`
  );

  console.groupEnd();
}
