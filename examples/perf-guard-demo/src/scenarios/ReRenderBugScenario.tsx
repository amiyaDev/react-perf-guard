import { useCallback, useState } from "react";
import { PerfProfiler } from "react-perf-guard";
import { useUsers } from "../hooks/useUsers";
import { UserTable } from "../components/UserTable";
import { Controls } from "../components/Controls";
import { InfoBanner } from "../components/InfoBanner";
import { LiveTimerBadge } from "../components/LiveTimerBadge";
import type { Mode, SortKey } from "../types";

export default function ReRenderBugScenario() {
  const [mode, setMode] = useState<Mode>("buggy");
  const [size, setSize] = useState(1000);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { users, loading, error } = useUsers(size);

  // Stable identity in both modes — the demo isolates *one* variable at a
  // time (row memoization, then search debouncing) rather than mixing bugs.
  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Missing Memoization</h1>
          <p className="tagline">A table re-renders every row when one row's state changes</p>
        </div>
        <LiveTimerBadge />
      </header>

      <InfoBanner mode={mode} />

      <Controls
        mode={mode}
        onModeChange={setMode}
        size={size}
        onSizeChange={setSize}
        search={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
        loading={loading}
      />

      {error && <div className="error-banner">Failed to load users: {error}</div>}

      {/* Nested on purpose: UserTable has its own PerfProfiler boundary
          inside this one, so the panel can show a path like
          "Dashboard > UserTable (buggy)" instead of a flat name. */}
      <PerfProfiler id="Dashboard" boundaryType="LAYOUT">
        <UserTable
          users={users}
          mode={mode}
          search={search}
          sortKey={sortKey}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      </PerfProfiler>

      <p className="data-source">
        Data via{" "}
        <a href="https://randomuser.me" target="_blank" rel="noreferrer">
          randomuser.me
        </a>
      </p>
    </div>
  );
}
