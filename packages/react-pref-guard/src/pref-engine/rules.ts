// rules.ts - Production-grade rule set (Development focused)
export interface RulePredicate {
  field: "avgTime" | "maxTime" | "renders" | "minTime";
  operator: ">" | "<" | ">=" | "<=" | "===";
  value: number;
}

export interface RuleRegression {
  field: "avgTime" | "maxTime" | "renders";
  multiplier: number;
}

export interface RuleTrend {
  field: "avgTime" | "maxTime" | "renders";
  direction: "increasing" | "decreasing";
  threshold: number; // percentage change
}

export interface PerfRule {
  id: string;
  category: "PERFORMANCE" | "MEMORY" | "RELIABILITY" | "STABILITY" | "UX";
  baseSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  predicate?: RulePredicate;
  regression?: RuleRegression;
  trend?: RuleTrend;
  confidenceThreshold?: number;
  messageTemplate: string;
  messageFields?: string[];
  // Documentation link
  docUrl?: string;
}

export const PERF_RULES: PerfRule[] = [
  // ========================================
  // CRITICAL PERFORMANCE RULES
  // ========================================
  {
    id: "BLOCKING_RENDER",
    category: "PERFORMANCE",
    baseSeverity: "CRITICAL",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 100,
    },
    confidenceThreshold: 0.4,
    messageTemplate: "CRITICAL: Component blocks UI thread for >100ms in {confidence}% of renders",
    messageFields: ["confidence"],
    docUrl: "https://web.dev/rail/",
  },

  {
    id: "SLOW_RENDER",
    category: "PERFORMANCE",
    baseSeverity: "HIGH",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 16,
    },
    confidenceThreshold: 0.6,
    messageTemplate: "Average render time exceeded 16ms in {confidence}% of recent batches",
    messageFields: ["confidence"],
  },

  {
    id: "VERY_SLOW_RENDER",
    category: "PERFORMANCE",
    baseSeverity: "HIGH",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 50,
    },
    confidenceThreshold: 0.5,
    messageTemplate: "Critical: render time exceeded 50ms in {confidence}% of batches",
    messageFields: ["confidence"],
  },

  {
    id: "INCONSISTENT_PERFORMANCE",
    category: "STABILITY",
    baseSeverity: "MEDIUM",
    predicate: {
      field: "maxTime",
      operator: ">",
      value: 50,
    },
    confidenceThreshold: 0.3,
    messageTemplate: "Unstable performance: max render time spikes to >50ms",
    messageFields: ["confidence"],
  },

  // ========================================
  // RENDER OPTIMIZATION RULES
  // ========================================
  {
    id: "EXCESSIVE_RENDERS",
    category: "PERFORMANCE",
    baseSeverity: "MEDIUM",
    predicate: {
      field: "renders",
      operator: ">",
      value: 20,
    },
    confidenceThreshold: 0.6,
    messageTemplate: "Component rendered excessively in {confidence}% of recent batches",
    messageFields: ["confidence"],
  },

  {
    id: "RENDER_THRASHING",
    category: "PERFORMANCE",
    baseSeverity: "HIGH",
    predicate: {
      field: "renders",
      operator: ">",
      value: 50,
    },
    confidenceThreshold: 0.4,
    messageTemplate: "Severe render thrashing detected: >50 renders in {confidence}% of batches",
    messageFields: ["confidence"],
  },

  {
    id: "SUSPICIOUS_RENDER_LOOP",
    category: "RELIABILITY",
    baseSeverity: "CRITICAL",
    predicate: {
      field: "renders",
      operator: ">",
      value: 100,
    },
    confidenceThreshold: 0.2,
    messageTemplate: "Potential infinite render loop: >100 renders detected",
    messageFields: ["confidence"],
  },

  // ========================================
  // REGRESSION DETECTION
  // ========================================
  {
    id: "PERF_REGRESSION",
    category: "PERFORMANCE",
    baseSeverity: "HIGH",
    regression: {
      field: "avgTime",
      multiplier: 1.3,
    },
    messageTemplate: "Avg render time increased from {prevValue}ms to {currValue}ms",
    messageFields: ["prevValue", "currValue"],
  },

  {
    id: "SEVERE_PERF_REGRESSION",
    category: "PERFORMANCE",
    baseSeverity: "CRITICAL",
    regression: {
      field: "avgTime",
      multiplier: 2.0,
    },
    messageTemplate: "SEVERE: Performance degraded by 2x from {prevValue}ms to {currValue}ms",
    messageFields: ["prevValue", "currValue"],
  },

  {
    id: "RENDER_COUNT_SPIKE",
    category: "STABILITY",
    baseSeverity: "MEDIUM",
    regression: {
      field: "renders",
      multiplier: 1.5,
    },
    messageTemplate: "Render count increased from {prevValue} to {currValue}",
    messageFields: ["prevValue", "currValue"],
  },

  {
    id: "MAX_TIME_REGRESSION",
    category: "STABILITY",
    baseSeverity: "HIGH",
    regression: {
      field: "maxTime",
      multiplier: 1.5,
    },
    messageTemplate: "Peak render time degraded from {prevValue}ms to {currValue}ms",
    messageFields: ["prevValue", "currValue"],
  },

  // ========================================
  // USER EXPERIENCE RULES
  // ========================================
  {
    id: "JANKY_ANIMATION",
    category: "UX",
    baseSeverity: "MEDIUM",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 16.67, // 60fps threshold
    },
    confidenceThreshold: 0.7,
    messageTemplate: "Janky animations: unable to maintain 60fps in {confidence}% of renders",
    messageFields: ["confidence"],
  },

  {
    id: "POOR_INTERACTION_RESPONSE",
    category: "UX",
    baseSeverity: "HIGH",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 50,
    },
    confidenceThreshold: 0.5,
    messageTemplate: "Poor interaction response: >50ms delay in {confidence}% of renders",
    messageFields: ["confidence"],
  },

  // ========================================
  // MEMORY & LEAK DETECTION
  // ========================================
  {
    id: "RENDER_TIME_CREEP",
    category: "MEMORY",
    baseSeverity: "MEDIUM",
    trend: {
      field: "avgTime",
      direction: "increasing",
      threshold: 20, // 20% increase over time
    },
    messageTemplate: "Gradual performance degradation: render time increasing over time",
    confidenceThreshold: 0.6,
  },

  {
    id: "RENDER_COUNT_CREEP",
    category: "MEMORY",
    baseSeverity: "MEDIUM",
    trend: {
      field: "renders",
      direction: "increasing",
      threshold: 30,
    },
    messageTemplate: "Render count steadily increasing - possible state management issue",
    confidenceThreshold: 0.6,
  },

  // ========================================
  // STABILITY & RELIABILITY
  // ========================================
  {
    id: "ERRATIC_PERFORMANCE",
    category: "STABILITY",
    baseSeverity: "MEDIUM",
    predicate: {
      field: "maxTime",
      operator: ">",
      value: 100,
    },
    confidenceThreshold: 0.3,
    messageTemplate: "Erratic performance spikes detected (>100ms)",
    messageFields: ["confidence"],
  },

  {
    id: "FIRST_RENDER_SLOW",
    category: "UX",
    baseSeverity: "MEDIUM",
    predicate: {
      field: "maxTime",
      operator: ">",
      value: 200,
    },
    confidenceThreshold: 0.8,
    messageTemplate: "Slow initial mount: first render >200ms",
    messageFields: ["confidence"],
  },

  // ========================================
  // PRODUCTION READINESS CHECKS
  // ========================================
  {
    id: "PROD_READY_PERF",
    category: "PERFORMANCE",
    baseSeverity: "INFO",
    predicate: {
      field: "avgTime",
      operator: "<",
      value: 10,
    },
    confidenceThreshold: 0.9,
    messageTemplate: "✅ Component meets production performance standards (<10ms avg)",
    messageFields: ["confidence"],
  },



  // ========================================
  // HELPFUL HINTS (DEVELOPMENT)
  // ========================================
  {
    id: "DEV_HINT_MEMOIZATION",
    category: "PERFORMANCE",
    baseSeverity: "INFO",
    predicate: {
      field: "renders",
      operator: ">",
      value: 15,
    },
    confidenceThreshold: 0.5,
    messageTemplate: "💡 Consider React.memo or useMemo for this component",
    messageFields: ["confidence"],
  },

  {
    id: "DEV_HINT_OPTIMIZATION",
    category: "PERFORMANCE",
    baseSeverity: "INFO",
    predicate: {
      field: "avgTime",
      operator: ">",
      value: 20,
    },
    confidenceThreshold: 0.5,
    messageTemplate: "💡 Component could benefit from optimization (>20ms avg)",
    messageFields: ["confidence"],
  },
];

// ========================================
// RULE CONFIGURATION
// ========================================

export function getRulesConfig(): PerfRule[] {
  return PERF_RULES;
}

// Load rules with custom overrides
export function loadRulesFromConfig(): PerfRule[] {
  const rules = [...PERF_RULES];
  
  // Example: Override thresholds from environment variables
  if (process.env.REACT_APP_PERF_THRESHOLD) {
    const threshold = parseInt(process.env.REACT_APP_PERF_THRESHOLD);
    rules.forEach(rule => {
      if (rule.id === "SLOW_RENDER" && rule.predicate) {
        rule.predicate.value = threshold;
      }
    });
  }
  
  return rules;
}

// Rule groups for different scenarios
export const RULE_GROUPS = {
  CRITICAL_ONLY: PERF_RULES.filter(r => r.baseSeverity === "CRITICAL"),
  PERFORMANCE: PERF_RULES.filter(r => r.category === "PERFORMANCE"),
  UX: PERF_RULES.filter(r => r.category === "UX"),
  STABILITY: PERF_RULES.filter(r => r.category === "STABILITY"),
  MEMORY: PERF_RULES.filter(r => r.category === "MEMORY"),
  HINTS: PERF_RULES.filter(r => r.id.startsWith("DEV_HINT") || r.id.startsWith("PROD_READY")),
};