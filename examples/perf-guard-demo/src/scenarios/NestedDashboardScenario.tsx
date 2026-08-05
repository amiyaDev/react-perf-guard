import { PerfProfiler } from "react-perf-guard";
import PostsWidget from "./dashboard/PostsWidget";
import ProductsWidget from "./dashboard/ProductsWidget";
import TodosWidget from "./dashboard/TodosWidget";

export default function NestedDashboardScenario() {
  return (
    <div>
      <header className="app-header">
        <div>
          <h1>Nested Boundaries</h1>
          <p className="tagline">Three independent widgets, one dashboard — which one is slow?</p>
        </div>
      </header>

      <div className="info-banner">
        <h2>Pinpointing the culprit in a tree</h2>
        <p>
          Each widget below fetches from a different real API and has its own <code>PerfProfiler</code>{" "}
          boundary, nested inside one outer <code>Dashboard</code> boundary. The Product Grid widget has a
          real bug: a "last updated" clock ticks every second in the same component as the product list,
          so the whole grid re-renders every second even though the products never change.
        </p>
        <p className="banner-note buggy">
          Watch the panel — it will point at <code>Dashboard › ProductsWidget</code> specifically, while{" "}
          <code>Dashboard › PostsWidget</code> and <code>Dashboard › TodosWidget</code> stay quiet. That's
          the component path feature: same tree, only one branch is actually the problem.
        </p>
      </div>

      <PerfProfiler id="Dashboard" boundaryType="LAYOUT">
        <div className="widget-grid">
          <PostsWidget />
          <ProductsWidget />
          <TodosWidget />
        </div>
      </PerfProfiler>
    </div>
  );
}
