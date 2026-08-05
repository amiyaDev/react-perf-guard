import { Profiler, useMemo } from "react";
import { PerfProfiler } from "react-perf-guard";
import { BuggyUserRow, OptimizedUserRow } from "./UserRow";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { reportRender } from "../lib/liveTimerStore";
import type { Mode, SortKey, User } from "../types";

interface UserTableProps {
  users: User[];
  mode: Mode;
  search: string;
  sortKey: SortKey;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

function sortUsers(users: User[], sortKey: SortKey): User[] {
  const copy = [...users];
  copy.sort((a, b) => {
    if (sortKey === "name") return a.firstName.localeCompare(b.firstName);
    if (sortKey === "age") return a.age - b.age;
    return a.country.localeCompare(b.country);
  });
  return copy;
}

function filterUsers(users: User[], search: string): User[] {
  if (!search.trim()) return users;
  const q = search.toLowerCase();
  return users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q)
  );
}

export function UserTable({
  users,
  mode,
  search,
  sortKey,
  favorites,
  onToggleFavorite,
}: UserTableProps) {
  // 🐛 vs ✅ #1: buggy mode re-filters on every keystroke immediately.
  // Optimized mode waits for typing to pause before recomputing the (expensive) list.
  const debouncedSearch = useDebouncedValue(search, 250);
  const effectiveSearch = mode === "optimized" ? debouncedSearch : search;

  const visibleUsers = useMemo(
    () => sortUsers(filterUsers(users, effectiveSearch), sortKey),
    [users, effectiveSearch, sortKey]
  );

  // 🐛 vs ✅ #2: buggy mode uses a plain row component (always re-renders).
  // Optimized mode uses the exact same component wrapped in React.memo.
  const RowComponent = mode === "optimized" ? OptimizedUserRow : BuggyUserRow;

  return (
    <Profiler id="live-timer" onRender={(_id, _phase, actualDuration) => reportRender(actualDuration)}>
      <PerfProfiler id={`UserTable (${mode})`} boundaryType="PAGE">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="col-avatar"></th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Location</th>
                <th className="col-fav"></th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <RowComponent
                  key={user.id}
                  user={user}
                  isFavorite={favorites.has(user.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </tbody>
          </table>
          {visibleUsers.length === 0 && <div className="empty-state">No users match "{search}"</div>}
        </div>
      </PerfProfiler>
    </Profiler>
  );
}
