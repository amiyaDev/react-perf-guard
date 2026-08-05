import { useState } from "react";
import ReRenderBugScenario from "./scenarios/ReRenderBugScenario";
import NestedDashboardScenario from "./scenarios/NestedDashboardScenario";
import InfiniteScrollScenario from "./scenarios/InfiniteScrollScenario";
import HeavyFormScenario from "./scenarios/HeavyFormScenario";
import "./App.css";

const SCENARIOS = [
  { id: "rerender", label: "🐛 Missing Memoization", Component: ReRenderBugScenario },
  { id: "dashboard", label: "🧩 Nested Dashboard", Component: NestedDashboardScenario },
  { id: "scroll", label: "📜 Infinite Scroll", Component: InfiniteScrollScenario },
  { id: "form", label: "📝 Heavy Form", Component: HeavyFormScenario },
] as const;

export default function App() {
  const [scenarioId, setScenarioId] = useState<(typeof SCENARIOS)[number]["id"]>("rerender");
  const active = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const Active = active.Component;

  return (
    <div className="app">
      <div className="brand-header">
        <h1>⚡ react-perf-guard</h1>
        <p className="tagline">Live demos — real bugs, real data, caught by the rule engine</p>
      </div>

      <nav className="scenario-nav">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={s.id === scenarioId ? "active" : ""}
            onClick={() => setScenarioId(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <Active />

      <footer className="app-footer">
        Source on{" "}
        <a href="https://github.com/amiyaDev/react-perf-guard" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}
