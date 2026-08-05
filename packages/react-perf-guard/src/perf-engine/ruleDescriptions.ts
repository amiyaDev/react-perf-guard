// ruleDescriptions.ts – plain-English copy for the panel, kept separate
// from rules.ts so rule *logic* (thresholds) and rule *copy* (wording) can
// change independently.

export interface RuleInfo {
  label: string;
  explain: string;
  fix: string;
}

export const RULE_INFO: Record<string, RuleInfo> = {
  BLOCKING_RENDER: {
    label: "Blocking Render",
    explain: "This component takes over 100ms to render — long enough that users can feel the UI freeze.",
    fix: "Look for expensive work happening during render (loops, formatting, sorting) and move it out, or split the component into smaller pieces.",
  },
  SLOW_RENDER: {
    label: "Slow Render",
    explain: "This component is regularly taking longer than 16ms to render, which can make animations and scrolling feel choppy.",
    fix: "Wrap the component in React.memo, or memoize expensive calculations with useMemo.",
  },
  VERY_SLOW_RENDER: {
    label: "Very Slow Render",
    explain: "This component is regularly taking over 50ms to render — a noticeable delay for anyone interacting with it.",
    fix: "Profile the component to find the expensive part, and consider breaking it into smaller, independently-updating pieces.",
  },
  INCONSISTENT_PERFORMANCE: {
    label: "Inconsistent Performance",
    explain: "Render time is usually fine but occasionally spikes above 50ms.",
    fix: "Check for renders triggered by large or unexpected prop/state changes (e.g. a big list update) that only happen sometimes.",
  },
  EXCESSIVE_RENDERS: {
    label: "Excessive Renders",
    explain: "This component re-rendered more than 20 times in a short window.",
    fix: "Check what's causing so many updates — an unstable dependency in a hook, or state changing more often than it needs to.",
  },
  RENDER_THRASHING: {
    label: "Render Thrashing",
    explain: "This component re-rendered more than 50 times in a short window — a strong sign something is looping.",
    fix: "Check for a state update inside an effect or event handler that isn't properly guarded, causing it to re-trigger itself.",
  },
  SUSPICIOUS_RENDER_LOOP: {
    label: "Possible Infinite Loop",
    explain: "This component rendered over 100 times very quickly — this usually means a render loop, not real user interaction.",
    fix: "Check useEffect dependency arrays and any state updates that happen unconditionally during render.",
  },
  PERF_REGRESSION: {
    label: "Performance Regression",
    explain: "Render time jumped by more than 30% compared to the last measurement.",
    fix: "Compare with what changed just before this — a new prop, a larger dataset, or a new piece of state.",
  },
  SEVERE_PERF_REGRESSION: {
    label: "Severe Performance Regression",
    explain: "Render time at least doubled compared to the last measurement.",
    fix: "Treat this like a bug report — something recently made this component twice as slow.",
  },
  RENDER_COUNT_SPIKE: {
    label: "Render Count Spike",
    explain: "The number of renders in this window is at least 50% higher than the previous window.",
    fix: "Look for a new interaction pattern (e.g. fast typing, rapid clicks) or a missing debounce/memoization.",
  },
  MAX_TIME_REGRESSION: {
    label: "Peak Time Regression",
    explain: "The single slowest render got at least 50% slower compared to before.",
    fix: "Look for an occasional expensive path — a large paste, a big search result, a cold cache.",
  },
  JANKY_ANIMATION: {
    label: "Janky Animation",
    explain: "This component can't consistently render within a 60fps frame budget (16.67ms).",
    fix: "Avoid layout-heavy CSS or expensive JS during animation frames; consider CSS transforms instead.",
  },
  POOR_INTERACTION_RESPONSE: {
    label: "Poor Interaction Response",
    explain: "Responding to user interaction (clicks, typing) is taking over 50ms — users will feel a lag.",
    fix: "This is the classic 'clicking one item re-renders everything' bug — check for missing React.memo and unstable callback props.",
  },
  RENDER_TIME_CREEP: {
    label: "Gradual Slowdown",
    explain: "Render time has been trending upward over the last several measurements.",
    fix: "Could indicate a growing dataset or a memory/state leak accumulating over the session.",
  },
  RENDER_COUNT_CREEP: {
    label: "Growing Render Count",
    explain: "The number of renders per window has been steadily increasing.",
    fix: "Check for state that keeps growing (e.g. an array that's appended to but never trimmed) driving more frequent updates.",
  },
  ERRATIC_PERFORMANCE: {
    label: "Erratic Performance",
    explain: "Occasional spikes over 100ms, even if the average looks fine.",
    fix: "Look for rare but expensive code paths — first-time data fetches, cold caches, or large conditional renders.",
  },
  FIRST_RENDER_SLOW: {
    label: "Slow Initial Mount",
    explain: "The very first render of this component took over 200ms.",
    fix: "For large lists, consider virtualization; for heavy initial data, consider a loading skeleton and progressive rendering.",
  },
  PROD_READY_PERF: {
    label: "Production Ready",
    explain: "This component consistently renders in under 10ms — it's in good shape.",
    fix: "No action needed — this is a positive signal, not a problem.",
  },
  DEV_HINT_MEMOIZATION: {
    label: "Consider Memoization",
    explain: "This component renders often enough that memoizing it would likely help.",
    fix: "Try wrapping it in React.memo, or memoize the values/callbacks passed to it.",
  },
  DEV_HINT_OPTIMIZATION: {
    label: "Optimization Opportunity",
    explain: "Average render time is above 20ms — not critical yet, but worth a look.",
    fix: "Profile this component if it's on a hot path (frequently visible or frequently updated).",
  },
};

export function getRuleInfo(ruleId: string): RuleInfo {
  return (
    RULE_INFO[ruleId] ?? {
      label: ruleId
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" "),
      explain: "No description available for this rule yet.",
      fix: "Check the rule definition in perf-engine/rules.ts for details.",
    }
  );
}
