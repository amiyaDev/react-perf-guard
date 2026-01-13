# ⚡ react-perf-guard

<div align="center">

### *Performance Guard for React Applications*

**Catch performance issues before they reach production**

[![npm version](https://img.shields.io/npm/v/react-perf-guard.svg)](https://www.npmjs.com/package/react-perf-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Quick Start](#-quick-start) • [Features](#-key-features) • [Documentation](#-how-react-perf-guard-works) • [Examples](#%EF%B8%8F-instrument-components-optional-but-recommended)

</div>

---

## 🎯 What is react-perf-guard?

**react-perf-guard** (Performance Guard) is a **development-first performance guardrail** for React applications that continuously monitors component rendering **during development** and automatically detects **performance issues, regressions, and UX risks** — *before they ever reach production*.

It's a **dev-only runtime performance analysis tool** that works silently in the background, applying a **rule-based analysis engine** to surface **clear, actionable signals** instead of noisy metrics.

> **Think of it as ESLint for runtime performance** — continuous, automatic, and built for developers.

---

## 🤔 Why react-perf-guard?

<table>
<tr>
<!-- <td width="50%"> -->

### ❌ The Problem Today

- React DevTools Profiler requires **manual intervention**
- Lighthouse runs **after performance degradation occurs**
- Performance regressions **slip through silently**
- Console logs create **noise and alert fatigue**
- Teams lack **continuous performance feedback**
- Performance audits happen **too late in the cycle**

</td>
<!-- <td width="50%"> -->

### ✅ The react-perf-guard Solution

- **Automatic** render performance detection
- **Continuous** monitoring during development
- **Intelligent** rule-based insights
- **Deduplicated** issue reporting
- **Trend & regression** detection
- **Real-time** performance feedback

</td>
</tr>
</table>

### How It's Different

| Traditional Approach | react-perf-guard |
|---------------------|------------------|
| Manual profiling sessions | ✨ Automatic detection |
| One-time snapshots | 📊 Continuous monitoring |
| Raw timing numbers | 🎯 Rule-based insights |
| Console spam | 🔕 Deduplicated issues |
| No historical data | 📈 Trend & regression analysis |
| Post-development audits | 🚀 Development-time prevention |

**Make performance a continuous development signal — not a last-minute crisis.**

---

## ✨ Key Features

<table>
<tr>
<td width="33%" align="center">

### 🚀 Automatic Detection
Monitors component renders without manual profiling sessions

</td>
<td width="33%" align="center">

### 📉 Regression Analysis
Detects performance degradation through trend analysis

</td>
<td width="33%" align="center">

### 🧠 Smart Rule Engine
Confidence-based system prevents false positives

</td>
</tr>
<tr>
<td width="33%" align="center">

### 🎯 Context-Aware
Boundary-aware severity tuning for accurate reporting

</td>
<td width="33%" align="center">

### 🔕 Noise-Resistant
Suppresses one-off spikes and repetitive warnings

</td>
<td width="33%" align="center">

### 🖥️ Built-in Panel
Visual dashboard for tracking issues in real-time

</td>
</tr>
<tr>
<td width="33%" align="center">

### 🔒 Production-Safe
Automatically disabled in production builds

</td>
<td width="33%" align="center">

### ⚡ Worker-Based
Analysis runs off-thread for zero impact

</td>
<td width="33%" align="center">

### 🎨 Framework-Friendly
Works with Next.js, Create React App, Vite

</td>
</tr>
</table>

---

## 🏗️ How react-perf-guard Works
```
┌─────────────────────┐
│  React Profiler     │  ← Captures component render metrics
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Metrics Collector   │  ← Batches data in-memory
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Batch Flush       │  ← Sends metrics at intervals
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Analyzer Web Worker │  ⚡ Runs off the main thread
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Rule Engine       │  ← Evaluates performance patterns
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Issue Aggregation   │  ← Deduplicates & prioritizes
└──────────┬──────────┘
           │
           ├──────────────┐
           ▼              ▼              
    ┌─────────┐   ┌──────────┐
    │  Panel  │   │  Alerts  │
    └─────────┘   └──────────┘
```
**Architecture Overview:**

1. **React Profiler** captures render metrics from instrumented components
2. **Metrics Collector** batches data in-memory for efficiency
3. **Batch Flush** sends accumulated metrics at intervals
4. **Analyzer Web Worker** processes data off the main thread
5. **Rule Engine** evaluates performance patterns against rules
6. **Issue Aggregation** deduplicates and prioritizes findings
7. **PerfGuard Panel** displays actionable insights to developers

> All heavy analysis runs in a **Web Worker**, keeping your application fast and responsive.

---

## 📦 Installation

```bash
# Using npm
npm install react-perf-guard

# Using pnpm
pnpm add react-perf-guard

# Using yarn
yarn add react-perf-guard
```

**Requirements:**
- React 16.8+ (Hooks support)
- Development environment (automatically disabled in production)

---

## 🚀 Quick Start

### 1️⃣ Wrap Your App with `PerfProvider`

The `PerfProvider` is the entry point that initializes the performance monitoring system.

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

**What happens under the hood:**

- ✅ Starts the analyzer worker thread
- ✅ Loads performance rules into the engine
- ✅ Begins automatic metric flushing
- ✅ Mounts the PerfGuard Panel UI

> 🔒 **Production Safety:** `react-perf-guard` **automatically disables itself in production** with zero overhead.

---

### 2️⃣ Instrument Components *(optional but recommended)*

Choose the approach that fits your code style. Both methods use **React's built-in Profiler API** internally.

#### 🎨 Option A — `withPerfGuard` HOC (Higher-Order Component)

Perfect for wrapping existing components without modifying their structure.

```tsx
import { withPerfGuard } from "react-perf-guard";

function HeavyComponent() {
  return <div>Heavy UI rendering logic</div>;
}

// Wrap and export
export default withPerfGuard(HeavyComponent);
```

#### 🎨 Option B — `PerfProfiler` Component Wrapper

Great for explicit profiling or conditional instrumentation.

```tsx
import { PerfProfiler } from "react-perf-guard";

export function ProductPage() {
  return (
    <PerfProfiler id="ProductList">
      <ProductList />
    </PerfProfiler>
  );
}
```

**Best Practices:**
- Instrument components at route/page boundaries
- Profile known performance-sensitive components
- Use descriptive IDs for easier debugging

---

## 🖥️ PerfGuard Panel

The **PerfGuard Panel** is your performance command center — a visual dashboard that appears automatically in development.

<table>
<tr>
<td width="50%">

### 📊 What It Shows

- **Active Issues:** Current performance problems
- **Resolved Issues:** Previously fixed problems
- **Severity Levels:** `LOW` → `MEDIUM` → `HIGH` → `CRITICAL`
- **Confidence Scores:** Trend-based reliability indicator
- **Component Names:** Exact location of issues
- **Rule IDs:** Which performance rule was triggered
- **Expandable Details:** Full context and recommendations

</td>
<td width="50%">

### 🎯 Panel Features

- **Real-time Updates:** Issues appear as they're detected
- **Issue Filtering:** Focus on specific severity levels
- **Historical View:** Track resolution over time
- **One-Click Details:** Expand for full diagnostic info
- **Minimal UI:** Unobtrusive during development
- **Auto-hidden:** Never appears in production

</td>
</tr>
</table>

> **The panel is your single source of truth** for React performance issues during development.

---

## 🚨 Critical Alerts

When **critical performance issues** are detected, react-perf-guard escalates visibility to ensure you don't miss user-impacting problems.

### What Makes an Issue "Critical"?

Critical issues indicate **likely user-visible UX problems** such as:
- Render times exceeding 100ms (blocking the main thread)
- Repeated severe performance degradation
- High-confidence regression detection

### Critical Alert Behavior

- 🔴 **Visually Highlighted:** Red indicators in the panel
- 📢 **Reported Once:** Per component lifecycle to avoid spam
- 📌 **Persistent Display:** Remains visible until resolved
- 🎯 **High Priority:** Sorted to the top of the issue list

**This prevents alert fatigue while ensuring serious regressions get immediate attention.**

---

## 🎯 Boundary Types

Boundary types provide **context-aware severity tuning** — the same render time means different things for different component types.

| Boundary Type | Description | Example Use Cases | Severity Adjustment |
|--------------|-------------|-------------------|-------------------|
| **INLINE** | Small child component | Buttons, icons, labels | Softened (higher threshold) |
| **ROUTE** | Page or route boundary | Full page components | Standard severity |
| **LAYOUT** | Layout or shell component | Navigation, sidebars, wrappers | Moderate severity |

### Why This Matters

A 50ms render might be:
- ✅ **Acceptable** for a route-level page component
- ⚠️ **Concerning** for a layout shell
- 🚨 **Critical** for an inline button

Boundary types ensure you get **accurate, actionable signals** instead of false alarms.

---

## 🧠 Rule Engine Overview

The rule engine is the brain of react-perf-guard, transforming raw metrics into **actionable performance insights**.

### How Rules Work

```
Current Render Snapshot + Historical Data
              ↓
    Declarative Rule Evaluation
              ↓
    Pattern & Trend Detection
              ↓
  Confidence Score Calculation
              ↓
    Issue Classification
```

### Key Characteristics

- **📋 Declarative Rules:** Define what to look for, not how to find it
- **📊 Historical Context:** Evaluates current performance against past trends
- **🎚️ Confidence-Based:** Scores increase only when issues persist
- **🛡️ False Positive Prevention:** Ignores one-off spikes and anomalies
- **🔄 Adaptive:** Learns normal patterns for each component

**Perfect for long development sessions and real feature work**, not just contrived demos.

---

## 🔒 Production Safety Guarantee

react-perf-guard is **designed with production safety as the top priority**.

### What Gets Disabled in Production

```tsx
// Development: Full monitoring enabled
if (process.env.NODE_ENV === 'development') {
  // ✅ React Profiler active
  // ✅ Web Worker running
  // ✅ Rule engine processing
  // ✅ Dev Panel visible
  // ✅ Metrics collection active
}

// Production: Everything disabled
if (process.env.NODE_ENV === 'production') {
  // ❌ No React Profiler
  // ❌ No Web Worker
  // ❌ No Dev Panel
  // ❌ No memory overhead
  // ❌ No runtime cost
}
```

### Zero Production Footprint

- **No bundle size impact** (tree-shaken away)
- **No memory allocation** for metrics
- **No CPU cycles** for analysis
- **No network requests** for reporting
- **No visual components** rendered

**Safe by default. Zero cost in production. Guaranteed.**

---

## ⚡ Framework Integration

### Using with Next.js

react-perf-guard works seamlessly with both **Next.js routing paradigms**.

#### 📄 Pages Router

Wrap your application in `_app.tsx`:

```tsx
import type { AppProps } from "next/app";
import { PerfProvider } from "react-perf-guard";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PerfProvider>
      <Component {...pageProps} />
    </PerfProvider>
  );
}
```

#### 🗂️ App Router

Create a client-side provider component:

```tsx
// app/providers.tsx
"use client";

import { PerfProvider } from "react-perf-guard";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <PerfProvider>{children}</PerfProvider>;
}
```

Then use it in your root layout:

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Other Frameworks

- **Create React App:** Wrap in `src/index.tsx`
- **Vite:** Wrap in `src/main.tsx`
- **Remix:** Wrap in `app/root.tsx`

---

## 🛣️ Roadmap

We're actively developing features to make react-perf-guard even more powerful:

<table>
<tr>
<td width="50%">

### 🔜 Coming Soon

- **Custom Rule Authoring API**  
  Define your own performance rules and thresholds

- **CI/CD Integration**  
  GitHub Actions support for automated performance checks

- **Performance Budgets**  
  Set and enforce render time budgets per component

</td>
<td width="50%">

### 🔮 Future Vision

- **Exportable Reports**  
  Generate performance reports for documentation

- **Ignore Annotations**  
  Suppress specific warnings when intentional

- **Dashboard Integrations**  
  Connect to monitoring platforms

</td>
</tr>
</table>

**Want to contribute?** We welcome PRs and feature suggestions!

---

## 📚 Additional Resources

- **Documentation:** [Full API Reference](#) *(coming soon)*
- **Examples:** [GitHub Examples Repository](#) *(coming soon)*
- **Blog:** [Performance Best Practices](#) *(coming soon)*

---

## 🤝 Contributing

We welcome contributions! Whether it's:

- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🔧 Code contributions

Please check our contributing guidelines before submitting a PR.

---

## 📄 License

MIT © Amiya Das 

---

## ⭐ Final Word

> **Performance should fail early, clearly, and with context.**

**react-perf-guard** transforms performance from a last-minute fire drill into a **daily development habit**.

Stop shipping performance regressions. Start building faster React apps.

<div align="center">

### Ready to guard your React performance?

```bash
npm install react-perf-guard
```

**[Get Started](#-quick-start)** • **[View Examples](#%EF%B8%8F-instrument-components-optional-but-recommended)** • **[Read Docs](#-how-react-perf-guard-works)**

---

*Made with ⚡ for React developers who care about performance*

**Star this repo if you find it useful!** ⭐

</div>