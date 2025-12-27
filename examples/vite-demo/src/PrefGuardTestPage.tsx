import React, { useMemo, useState } from "react";
import { withPerfGuard, PerfProfiler } from "react-pref-guard";

/* --------------------------------------------------
   1️⃣ FAST COMPONENT (CONTROL CASE – NO WARNING)
-------------------------------------------------- */
function FastComponent() {
  return <div>✅ Fast Component (should NOT warn)</div>;
}

const GuardedFast = withPerfGuard(FastComponent);

/* --------------------------------------------------
   2️⃣ EXCESSIVE RE-RENDER TEST
-------------------------------------------------- */
function ReRenderBomb() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h3>🔥 Excessive Re-render Test</h3>
      <button onClick={() => setCount((c) => c + 1)}>
        Re-render ({count})
      </button>
    </div>
  );
}

const GuardedReRenderBomb = withPerfGuard(ReRenderBomb);

/* --------------------------------------------------
   3️⃣ SLOW RENDER TEST (>16ms)
-------------------------------------------------- */
function SlowRenderComponent() {
  // Artificial blocking work
  const start = performance.now();
  while (performance.now() - start < 20) {}

  return <div>🐢 Slow Render Component</div>;
}

const GuardedSlowRender = withPerfGuard(SlowRenderComponent);

/* --------------------------------------------------
   4️⃣ MULTIPLE ISSUES TEST (RENDER + SLOW)
-------------------------------------------------- */
function MultiIssueComponent() {
  const [state, setState] = useState(0);

  const start = performance.now();
  while (performance.now() - start < 25) {}

  return (
    <div>
      <h3>💥 Multi Issue Component</h3>
      <button onClick={() => setState(Math.random())}>
        Trigger Heavy Render ({state})
      </button>
    </div>
  );
}

const GuardedMultiIssue = withPerfGuard(MultiIssueComponent);

/* --------------------------------------------------
   5️⃣ OPTIMIZED VERSION (FALSE POSITIVE CHECK)
-------------------------------------------------- */
function OptimizedComponent({ items }: { items: number[] }) {
  const filtered = items.filter((n) => n % 2 === 0);

  return (
    <div>
      <h3>🧠 Optimized Component</h3>
      {filtered.map((n) => (
        <span key={n}>{n} </span>
      ))}
    </div>
  );
}

const GuardedOptimized = withPerfGuard(OptimizedComponent);

/* --------------------------------------------------
   MAIN TEST PAGE
-------------------------------------------------- */
export default function PerfGuardTestPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>🧪 React Pref Guard – Test Page</h1>
      {/* 
      <hr />

      <GuardedFast />

      <hr />

      <GuardedReRenderBomb />

      <hr />

      <GuardedSlowRender />

      <hr />

      <GuardedMultiIssue />

      <hr /> */}

      <PerfProfiler id="InlineProfiler">
        <OptimizedComponent
          items={[
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 312, 412, 3234, 123213,
            213213213, 1231,
          ]}
        />
      </PerfProfiler>
    </div>
  );
}
