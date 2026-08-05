import { memo } from "react";
import type { User } from "../types";

interface UserRowProps {
  user: User;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function UserRowBase({ user, isFavorite, onToggleFavorite }: UserRowProps) {
  return (
    <tr>
      <td className="col-avatar">
        <img src={user.avatar} alt="" width={32} height={32} loading="lazy" />
      </td>
      <td>
        <div className="row-name">
          <span className="row-initials">{initials(user.firstName, user.lastName)}</span>
          {user.firstName} {user.lastName}
        </div>
      </td>
      <td className="col-muted">{user.email}</td>
      <td>{user.age}</td>
      <td>
        {user.city}, {user.country}
      </td>
      <td className="col-fav">
        <button
          className={`fav-btn ${isFavorite ? "is-fav" : ""}`}
          onClick={() => onToggleFavorite(user.id)}
          aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </td>
    </tr>
  );
}

// 🐛 Buggy: plain component — re-executes for every row on every
// parent render, even when its own props haven't changed.
export const BuggyUserRow = UserRowBase;

// ✅ Optimized: memoized — React skips re-rendering a row whose
// props are unchanged, even though the parent (and its sibling rows) re-rendered.
export const OptimizedUserRow = memo(UserRowBase);
