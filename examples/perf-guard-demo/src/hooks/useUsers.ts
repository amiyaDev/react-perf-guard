import { useEffect, useState } from "react";
import { fetchUsers } from "../api/randomUser";
import type { User } from "../types";

export function useUsers(count: number) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchUsers(count)
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [count]);

  return { users, loading, error };
}
