import type { Mode, SortKey } from "../types";

interface ControlsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  size: number;
  onSizeChange: (size: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sortKey: SortKey;
  onSortKeyChange: (key: SortKey) => void;
  loading: boolean;
}

const SIZES = [100, 500, 1000, 2500, 5000];

export function Controls({
  mode,
  onModeChange,
  size,
  onSizeChange,
  search,
  onSearchChange,
  sortKey,
  onSortKeyChange,
  loading,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="mode-toggle" role="tablist" aria-label="Rendering mode">
        <button
          role="tab"
          aria-selected={mode === "buggy"}
          className={mode === "buggy" ? "active buggy" : ""}
          onClick={() => onModeChange("buggy")}
        >
          🐛 Buggy
        </button>
        <button
          role="tab"
          aria-selected={mode === "optimized"}
          className={mode === "optimized" ? "active optimized" : ""}
          onClick={() => onModeChange("optimized")}
        >
          ✅ Optimized
        </button>
      </div>

      <label className="control-field">
        <span>Rows</span>
        <select value={size} onChange={(e) => onSizeChange(Number(e.target.value))}>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s.toLocaleString()}
            </option>
          ))}
        </select>
      </label>

      <label className="control-field">
        <span>Sort</span>
        <select value={sortKey} onChange={(e) => onSortKeyChange(e.target.value as SortKey)}>
          <option value="name">Name</option>
          <option value="age">Age</option>
          <option value="country">Country</option>
        </select>
      </label>

      <input
        className="search-input"
        type="text"
        placeholder="Type to filter... (try typing fast)"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {loading && <span className="loading-pill">Loading users…</span>}
    </div>
  );
}
