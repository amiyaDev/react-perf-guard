import type { Mode } from "../types";

export function InfoBanner({ mode }: { mode: Mode }) {
  return (
    <div className="info-banner">
      <h2>A real React performance bug, live</h2>
      <p>
        This table renders real user data pulled from a public API. Every row shares the exact
        same component code — the only thing that changes between modes is whether rows are
        memoized and whether search input is debounced.
      </p>
      <ol>
        <li>
          Switch to <strong>🐛 Buggy</strong>, click a few ⭐ favorites, and watch the counter and
          the PerfGuard panel (bottom-right).
        </li>
        <li>Type quickly in the search box — every keystroke re-renders the entire table.</li>
        <li>
          Switch to <strong>✅ Optimized</strong> and repeat the same actions — the panel goes
          quiet.
        </li>
      </ol>
      {mode === "buggy" ? (
        <p className="banner-note buggy">
          Rows are <code>plain components</code> — React re-renders every single row whenever the
          table re-renders, even ones that didn't change.
        </p>
      ) : (
        <p className="banner-note optimized">
          Rows are wrapped in <code>React.memo</code> and search is debounced — React skips rows
          whose props didn't change and avoids re-rendering on every keystroke.
        </p>
      )}
    </div>
  );
}
