# react-perf-guard

Development-time performance monitoring for React applications. It watches component
render behavior while you work, evaluates it against a rule engine, and surfaces the
components that are actually slowing your app down — with a plain-language
explanation and a suggested fix, not a raw number you have to interpret yourself.

Disabled by default in production builds. No runtime cost when it is off.

[![npm version](https://img.shields.io/npm/v/react-perf-guard.svg)](https://www.npmjs.com/package/react-perf-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

![The panel showing four confirmed issues, each with a component path, a severity, a confidence score, and a Recurring badge](docs/screenshots/panel-confirmed-issues.png)

Full documentation, including the complete rule reference, is in the package README:
[`packages/react-perf-guard/README.md`](packages/react-perf-guard/README.md).

## Repository layout

This is a pnpm workspace with one published package and two example applications.

```
packages/react-perf-guard/    the library itself (published as "react-perf-guard" on npm)
examples/perf-guard-demo/     a standalone, deployable demo covering four real scenarios
```

## Quick start

```bash
npm install react-perf-guard
```

```tsx
import { PerfProvider } from "react-perf-guard";

export function App() {
  return (
    <PerfProvider>
      <YourApp />
    </PerfProvider>
  );
}
```

See the [package README](packages/react-perf-guard/README.md) for the full quick
start, the rule reference, how to interpret the panel, and framework-specific setup
for Next.js, Vite, Create React App, and Remix.

## The demo

`examples/perf-guard-demo` is a self-contained application demonstrating four real
performance bugs — a re-render bug in a large data table, a bug pinpointed by
component path in a nested dashboard, growing render cost in an infinite-scroll feed,
and a form re-render bug — each against live public APIs, each with a working/buggy
toggle so you can see the before and after.

Run it locally:

```bash
pnpm install
pnpm --filter perf-guard-demo dev
```

It depends on the published `react-perf-guard` package rather than the local
workspace source, so it can also be deployed standalone (for example to Vercel)
without any monorepo-specific build configuration. See
[`examples/perf-guard-demo/README.md`](examples/perf-guard-demo/README.md) for
deployment instructions, including how the demo forces itself to run inside a
production build so the deployed version still shows the panel.

## Development

```bash
pnpm install                                # install all workspace packages
pnpm --filter react-perf-guard build         # build the library
pnpm --filter react-perf-guard test          # run the test suite
pnpm --filter perf-guard-demo dev            # run the demo against local source
```

To point the demo at your local changes instead of the published package during
development, change its dependency to `"react-perf-guard": "workspace:*"`, run
`pnpm install`, and clear the Vite dependency cache
(`rm -rf examples/perf-guard-demo/node_modules/.vite`) after rebuilding the library.
Switch it back to a semver range (for example `^0.1.2`) before deploying it
standalone.

## License

MIT (c) Amiya Das
