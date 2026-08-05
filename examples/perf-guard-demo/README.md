# react-perf-guard — live demo

A working demonstration of [`react-perf-guard`](https://github.com/amiyaDev/react-perf-guard)
catching real, common React performance bugs against live public APIs — not contrived
benchmarks.

## Scenarios

### Missing memoization

A table of real user data (from [randomuser.me](https://randomuser.me)) with search,
sort, and a per-row favorite toggle. Buggy and Optimized modes render the exact same
row component; the only difference is memoization and search debouncing:

| | Buggy | Optimized |
|---|---|---|
| Row component | plain function component | wrapped in `React.memo` |
| Search input | filters on every keystroke | filters on a 250ms debounce |

Clicking one row's favorite in Buggy mode re-renders every row in the table, not just
the one that changed. `react-perf-guard` catches this live — within a few
interactions the panel flags `BLOCKING_RENDER` / `POOR_INTERACTION_RESPONSE`.
Switching to Optimized mode and repeating the same click drops the commit time by one
to two orders of magnitude and the panel goes quiet.

Buggy mode, confirmed issues visible with component path and severity:

![Panel showing four confirmed issues under Dashboard > UserTable (buggy)](../../docs/screenshots/panel-confirmed-issues.png)

Optimized mode, same interactions, panel quiet:

![Optimized mode with 1,000 rows loaded and the panel reading "No issues detected"](../../docs/screenshots/clean-run-no-issues.png)

### Nested dashboard

Three independent widgets (posts from JSONPlaceholder, products from DummyJSON, todos
from JSONPlaceholder), each with its own `PerfProfiler` boundary nested inside one
outer `Dashboard` boundary. The product widget has a real bug — a clock ticking every
second in the same component as an unmemoized product grid, so the whole grid
re-renders every second even though the products never change. The panel points at
`Dashboard > ProductsWidget` specifically, while the sibling widgets stay quiet —
demonstrating component path attribution in a nested tree.

### Infinite scroll

A photo feed (via [picsum.photos](https://picsum.photos)) that loads more as you
scroll, with a Buggy/Optimized card memoization toggle. In Buggy mode, appending a
new page re-renders every previously loaded card, not just the new ones, so render
cost grows with total items shown. This is the scenario most likely to trigger the
trend-based rules (`RENDER_TIME_CREEP`, `RENDER_COUNT_CREEP`), which need several
pages of history before they fire — keep scrolling.

### Heavy form

A 17-field form with live validation and a country select populated from a real API
([api.first.org](https://api.first.org)). In Buggy mode, typing a single character in
any field re-renders and re-validates every field. In Optimized mode, fields are
memoized and only the field being typed in re-renders.

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter perf-guard-demo dev
```

This installs the **published** `react-perf-guard` package from npm. To test local
library changes instead, see the root [README](../../README.md#development).

## Deploy to Vercel

This app depends on the published npm package, not a workspace link, so it deploys
like any standalone Vite app.

1. Push this repository to GitHub.
2. In Vercel, "Add New Project" and import the repository.
3. This is a monorepo, so set **Root Directory** to `examples/perf-guard-demo` in the
   project settings.
4. Framework preset: Vite (auto-detected). Build and output settings are also pinned
   in `vercel.json`.
5. Deploy. No environment variables are required.

Or, from this folder, using the Vercel CLI:

```bash
cd examples/perf-guard-demo
vercel
```

### Why the panel still shows up after deploying

A Vercel deployment is a production build (`NODE_ENV=production`), and
react-perf-guard is inert by default in production — that is the correct behavior for
a real application. Since this app exists specifically to demonstrate the tool, its
`src/main.tsx` opts in explicitly:

```tsx
<PerfProvider forceEnable>
  <App />
</PerfProvider>
```

`forceEnable` is documented in the
[package README](../../packages/react-perf-guard/README.md#running-it-against-a-production-build).
Do not use it in a real application — only this demo, and only because showing the
tool working is the point of the deployment.
