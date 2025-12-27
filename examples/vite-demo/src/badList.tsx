import { PerfProvider, withPerfGuard, PerfProfiler } from "react-pref-guard";



function BadList({ items }: { items: number[] }) {

  const filtered = items.filter((n) => n % 2 === 0);
  const start = performance.now();
while (performance.now() - start < 20) {}

  return (
    <div>
      {filtered.map((n) => (
        <div key={n}>{n}</div>
      ))}
      
    </div>
  );
}

const BadListWithPerfGuard = withPerfGuard(BadList);

export default BadListWithPerfGuard;
