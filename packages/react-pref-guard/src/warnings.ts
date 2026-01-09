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
  boundaryType: string;
  metrics: any;
  issues: Issue[];
};

/* --------------------------------------------
   Internal state (reporter-only)
--------------------------------------------- */

type IssueState = {
  issue: Issue;
  missingCount: number;
};

const activeIssues = new Map<string, IssueState>();
const lastLogTime = new Map<string, number>();

const LOG_COOLDOWN = 30_000;          // log once per 30s
const RESOLVE_AFTER_MISSES = 3;       // batches before resolving

/* --------------------------------------------
   Utilities
--------------------------------------------- */

function fingerprint(component: string, issue: Issue) {
  return `${component}:${issue.ruleId}:${issue.severity}`;
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

export function showWarning(result: Result) {
  console.log("[PerfGuard] Processing result for", result);
  const seenThisBatch = new Set<string>();

  // 1️⃣ Process current issues
  for (const issue of result.issues) {
    const fp = fingerprint(result.component, issue);
    seenThisBatch.add(fp);

    const state = activeIssues.get(fp);

    if (!state) {
      activeIssues.set(fp, { issue, missingCount: 0 });

      upsertIssue({
        id: fp,
        component: result.component,
        ruleId: issue.ruleId,
        severity: issue.severity,
        confidence: issue.confidence,
        boundaryType: result.boundaryType,
        status: "NEW",
        reason: issue.reason,
        lastSeen: Date.now(),
      });

      if (shouldLog(fp)) {
        logNewIssue(result, issue);
      }
    } else {
      // Still active → reset miss counter
      state.missingCount = 0;
      upsertIssue({
        id: fp,
        component: result.component,
        ruleId: issue.ruleId,
        severity: issue.severity, // CRITICAL preserved
        confidence: issue.confidence,
        boundaryType: result.boundaryType,
        status: "ACTIVE",
        reason: issue.reason,
        lastSeen: Date.now(),
      });
    }
  }

  // 2️⃣ Handle missing issues (gracefully)
  for (const [fp, state] of activeIssues.entries()) {
    if (!seenThisBatch.has(fp)) {
      state.missingCount++;

      if (state.missingCount >= RESOLVE_AFTER_MISSES) {
        activeIssues.delete(fp);
        resolveIssue(fp);
        logResolvedIssue(result.component, state.issue);
      }
    }
  }
}

export function showCriticalAlert(result: Result) {
  for (const issue of result.issues) {
    if (issue.severity !== "CRITICAL") continue;

    const fp = fingerprint(result.component, issue);

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
