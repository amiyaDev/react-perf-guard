// warnings.ts – Optimistic, stable, debounced reporter
import { upsertIssue, resolveIssue } from "./issue-store/issueStore";

type Issue = {
  ruleId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "INFO";
  confidence: number;
  reason: string;
};

type Result = {
  component: string;
  path?: string[];
  boundaryType: string;
  metrics: any;
  issues: Issue[];
};

/* --------------------------------------------
   Internal state (reporter-only)
--------------------------------------------- */

type IssueState = {
  component: string;
  issue: Issue;
  lastSeen: number;
  // How many *separate* evaluation cycles (5s apart, per PerfProvider's
  // flush interval) this fingerprint has appeared in.
  sightings: number;
  // Whether it has recurred enough to be shown as a genuine issue, as
  // opposed to a one-off spike (a single big mount, one debounced render).
  confirmed: boolean;
};

const activeIssues = new Map<string, IssueState>();
const lastLogTime = new Map<string, number>();

const LOG_COOLDOWN = 30_000; // log once per 30s

// An issue auto-resolves once it hasn't been re-confirmed by a fresh
// evaluation for this long. This is wall-clock based on purpose: resolution
// used to depend on the *same* component showing up "clean" in a future
// EVALUATE batch, which only happens if it keeps rendering. A component
// that simply stops re-rendering (e.g. the user stops interacting with it)
// would then never get re-evaluated, so its issues stayed "ACTIVE" forever.
const STALE_AFTER_MS = 12_000;
const SWEEP_INTERVAL_MS = 4_000;

// An issue must recur in at least this many separate evaluation cycles
// before it's ever shown. Without this, a single legitimately-expensive
// render — mounting a large dataset for the first time, one debounced
// search re-render — gets reported with 100% confidence on first sight,
// indistinguishable from an actual recurring bug. Requiring recurrence is
// what makes "ignores one-off spikes" (see README) actually true.
const CONFIRM_AFTER_SIGHTINGS = 2;

// Exempt from gating: an unambiguous runaway loop is worth knowing about
// immediately, even if it never happens again.
const IMMEDIATE_RULES = new Set(["SUSPICIOUS_RENDER_LOOP"]);

let sweepStarted = false;

/* --------------------------------------------
   Utilities
--------------------------------------------- */

// Identity deliberately excludes severity/confidence: those can shift batch
// to batch for what is really the *same* underlying issue (e.g. confidence
// crossing a downgrade threshold). Keying the fingerprint on them used to
// spawn a brand-new, orphaned panel row every time that happened, instead
// of updating the existing one in place.
function fingerprint(component: string, ruleId: string) {
  return `${component}:${ruleId}`;
}

function ensureSweepStarted() {
  if (sweepStarted) return;
  sweepStarted = true;

  setInterval(() => {
    const now = Date.now();
    for (const [fp, state] of activeIssues.entries()) {
      if (now - state.lastSeen >= STALE_AFTER_MS) {
        activeIssues.delete(fp);
        // Only tell the store to resolve something it was actually told
        // about — unconfirmed sightings never got upserted in the first place.
        if (state.confirmed) {
          resolveIssue(fp);
          logResolvedIssue(state.component, state.issue);
        }
      }
    }
  }, SWEEP_INTERVAL_MS);
}

function shouldLog(fp: string) {
  const last = lastLogTime.get(fp) || 0;
  if (Date.now() - last < LOG_COOLDOWN) return false;
  lastLogTime.set(fp, Date.now());
  return true;
}

function severityEmoji(sev: Issue["severity"]) {
  switch (sev) {
    case "CRITICAL": return "💥";
    case "HIGH": return "🔴";
    case "MEDIUM": return "🟡";
    case "LOW": return "🔵";
    default: return "ℹ️";
  }
}

function severityColor(sev: Issue["severity"]) {
  switch (sev) {
    case "CRITICAL": return "#dc2626";
    case "HIGH": return "#ef4444";
    case "MEDIUM": return "#f59e0b";
    case "LOW": return "#3b82f6";
    default: return "#6b7280";
  }
}

/* --------------------------------------------
   Public API
--------------------------------------------- */

function publish(fp: string, result: Result, issue: Issue, status: "NEW" | "ACTIVE", now: number) {
  upsertIssue({
    id: fp,
    component: result.component,
    path: result.path,
    ruleId: issue.ruleId,
    severity: issue.severity,
    confidence: issue.confidence,
    boundaryType: result.boundaryType,
    status,
    reason: issue.reason,
    lastSeen: now,
    metrics: result.metrics,
  });
}

export function showWarning(result: Result) {
  ensureSweepStarted();

  for (const issue of result.issues) {
    const fp = fingerprint(result.component, issue.ruleId);
    const now = Date.now();
    const state = activeIssues.get(fp);

    if (!state) {
      const confirmed = IMMEDIATE_RULES.has(issue.ruleId);
      activeIssues.set(fp, { component: result.component, issue, lastSeen: now, sightings: 1, confirmed });

      if (confirmed) {
        publish(fp, result, issue, "NEW", now);
        if (shouldLog(fp)) logNewIssue(result, issue);
      }
      // else: first sighting of a gated rule — wait to see if it recurs
      // before treating it as a genuine issue rather than a one-off spike.
    } else {
      state.issue = issue;
      state.lastSeen = now;

      if (!state.confirmed) {
        state.sightings += 1;
        if (state.sightings < CONFIRM_AFTER_SIGHTINGS) continue;
        state.confirmed = true;
        publish(fp, result, issue, "NEW", now);
        if (shouldLog(fp)) logNewIssue(result, issue);
      } else {
        publish(fp, result, issue, "ACTIVE", now);
      }
    }
  }
}

export function showCriticalAlert(result: Result) {
  for (const issue of result.issues) {
    if (issue.severity !== "CRITICAL") continue;

    const fp = fingerprint(result.component, issue.ruleId);

    // Only pop the overlay for issues that have actually been confirmed —
    // showWarning() runs first each cycle, so this reflects the up-to-date
    // confirmation state for the same result.
    if (!activeIssues.get(fp)?.confirmed) continue;

    // once per lifecycle
    if (!shouldLog(fp)) continue;

    showCriticalOverlay(result.component, issue);
  }
}

/* --------------------------------------------
   Console output helpers
--------------------------------------------- */

function logNewIssue(result: Result, issue: Issue) {
  console.groupCollapsed(
    `%c⚡ PerfGuard · ${result.component}`,
    `color:${severityColor(issue.severity)};font-weight:bold`
  );

  console.info(
    `%c${severityEmoji(issue.severity)} ${issue.ruleId} (${issue.severity})`,
    `color:${severityColor(issue.severity)}`
  );

  console.info("Confidence:", `${Math.round(issue.confidence * 100)}%`);
  console.info("Reason:", issue.reason);
  console.info("Boundary:", result.boundaryType);

  console.groupCollapsed("📊 Metrics");
  console.table(result.metrics);
  console.groupEnd();

  console.groupEnd();
}

function logResolvedIssue(component: string, issue: Issue) {
  console.info(
    `%c✅ PerfGuard · RESOLVED · ${component} · ${issue.ruleId}`,
    "color:#16a34a;font-weight:bold"
  );
}

/* --------------------------------------------
   Visual alert (CRITICAL only)
--------------------------------------------- */

function showCriticalOverlay(component: string, issue: Issue) {
  if (typeof document === "undefined") return;

  const alert = document.createElement("div");

  alert.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 14px 18px;
    border-radius: 8px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.35);
    z-index: 10000;
    font-family: monospace;
    font-size: 13px;
    max-width: 360px;
  `;

  alert.innerHTML = `
    <strong>💥 PerfGuard – CRITICAL</strong><br/>
    Component: ${component}<br/>
    Rule: ${issue.ruleId}<br/>
    Confidence: ${Math.round(issue.confidence * 100)}%
  `;

  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 8000);
}
