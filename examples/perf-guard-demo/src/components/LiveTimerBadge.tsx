import { useEffect, useState } from "react";
import { subscribeTimer } from "../lib/liveTimerStore";

export function LiveTimerBadge() {
  const [ms, setMs] = useState(0);

  useEffect(() => subscribeTimer(setMs), []);

  const level = ms > 100 ? "hot" : ms > 16 ? "warm" : "cool";

  return (
    <div className={`timer-badge timer-${level}`}>
      <span className="timer-label">Last commit</span>
      <span className="timer-value">{ms.toFixed(1)} ms</span>
    </div>
  );
}
