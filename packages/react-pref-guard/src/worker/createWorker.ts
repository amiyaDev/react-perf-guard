// worker/createWorker.ts - Enhanced with trend detection
export function createAnalyzerWorker() {
  const code = `
    /* ===============================
       PerfGuard – Enhanced Rule DSL Worker
       =============================== */

    const history = new Map();
    const MAX_HISTORY = 10; // Increased for trend detection

    const DOMINANT_RULES = new Set([
    "BLOCKING_RENDER",
    "SEVERE_PERF_REGRESSION",
    "SUSPICIOUS_RENDER_LOOP",
    "RENDER_TIME_CREEP",
    ]);

    let RULES = [];

    /* -------------------------------
       Utilities
    -------------------------------- */

    function hasDominantIssue(issues) {
    return issues.some(issue => DOMINANT_RULES.has(issue.ruleId));
    }

    function record(snapshot) {
      const list = history.get(snapshot.component) || [];
      list.push(snapshot);
      if (list.length > MAX_HISTORY) list.shift();
      history.set(snapshot.component, list);
    }

  function calculateConfidenceWithCurrent(predicateFn, historyList, snapshot) {
   if (historyList.length === 0) return 1;

    const matches = historyList.filter(predicateFn).length;
    const currentMatch = predicateFn(snapshot) ? 1 : 0;

   return (matches + currentMatch) / (historyList.length + 1);
}

  function downgradeSeverity(severity, confidence, boundaryType) {
  //  CRITICAL is NEVER downgraded
  if (severity === "CRITICAL") return "CRITICAL";

  //  INLINE components downgrade by ONE level only
  if (boundaryType === "INLINE") {
    if (severity === "HIGH") return "MEDIUM";
    if (severity === "MEDIUM") return "LOW";
    return "INFO";
  }

  // 📉 Confidence-based softening
  if (confidence < 0.7) return "LOW";
  if (confidence < 0.85) return "MEDIUM";

  return severity;
}

    function buildPredicate({ field, operator, value }) {
      switch (operator) {
        case ">": return (s) => s[field] > value;
        case "<": return (s) => s[field] < value;
        case ">=": return (s) => s[field] >= value;
        case "<=": return (s) => s[field] <= value;
        case "===": return (s) => s[field] === value;
        default: return () => false;
      }
    }

    function interpolateMessage(template, values) {
      let result = template;
      for (const [key, value] of Object.entries(values)) {
        result = result.replace(
          new RegExp(\`{\${key}}\`, 'g'),
          typeof value === 'number' ? Math.round(value).toString() : value
        );
      }
      return result;
    }

    /* -------------------------------
       Trend Detection
    -------------------------------- */

    function detectTrend(historyList, field) {
      if (historyList.length < 5) return { direction: 'stable', change: 0 };
      
      // Use linear regression to detect trend
      const values = historyList.map(s => s[field]);
      const n = values.length;
      const indices = Array.from({ length: n }, (_, i) => i);
      
      const sumX = indices.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
      const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const avgValue = sumY / n;
      
      // Calculate percentage change
      const percentChange = (slope * n / avgValue) * 100;
      
      return {
        direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
        change: Math.abs(percentChange)
      };
    }

    /* -------------------------------
       Rule Evaluation Engine
    -------------------------------- */

function evaluate(snapshot) {
  const issues = [];
  const historyList = history.get(snapshot.component) || [];
  const previous = historyList[historyList.length - 1];

  /* ===============================
     PASS 1: DOMINANT RULES ONLY
     =============================== */
  for (const rule of RULES) {
    if (!DOMINANT_RULES.has(rule.id)) continue;

    /* ----- Regression Rule ----- */
    if (rule.regression && previous) {
      const field = rule.regression.field;
      const multiplier = rule.regression.multiplier;

      if (snapshot[field] > previous[field] * multiplier) {
        issues.push({
          ruleId: rule.id,
          confidence: 1,
          severity: downgradeSeverity(
            rule.baseSeverity,
            1,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            prevValue: previous[field].toFixed(1),
            currValue: snapshot[field].toFixed(1),
          }),
        });
      }
      continue;
    }

    /* ----- Trend Detection Rule ----- */
    if (rule.trend && historyList.length >= 5) {
      const trend = detectTrend(historyList, rule.trend.field);

      if (
        trend.direction === rule.trend.direction &&
        trend.change >= rule.trend.threshold
      ) {
        const confidence = Math.min(trend.change / 100, 1.0);

        issues.push({
          ruleId: rule.id,
          confidence,
          severity: downgradeSeverity(
            rule.baseSeverity,
            confidence,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            change: trend.change.toFixed(1),
          }),
        });
      }
      continue;
    }

    /* ----- Predicate Rule ----- */
    if (rule.predicate) {
      const predicateFn = buildPredicate(rule.predicate);
      const confidence = calculateConfidenceWithCurrent(
  predicateFn,
  historyList,
  snapshot
);
      const threshold = rule.confidenceThreshold || 0.6;

      if (predicateFn(snapshot) && confidence >= threshold) {
        issues.push({
          ruleId: rule.id,
          confidence,
          severity: downgradeSeverity(
            rule.baseSeverity,
            confidence,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            confidence: (confidence * 100).toFixed(0),
          }),
        });
      }
    }
  }

  /* ===============================
     If dominant issue exists → stop
     =============================== */
  if (issues.length) {
    // Allow DEV_HINT rules only
    for (const rule of RULES) {
      if (!rule.id.startsWith("DEV_HINT")) continue;
      if (!rule.predicate) continue;

      const predicateFn = buildPredicate(rule.predicate);
      const confidence = calculateConfidenceWithCurrent(
  predicateFn,
  historyList,
  snapshot
);
      const threshold = rule.confidenceThreshold || 0.6;

      if (predicateFn(snapshot) && confidence >= threshold) {
        issues.push({
          ruleId: rule.id,
          confidence,
          severity: "INFO",
          reason: interpolateMessage(rule.messageTemplate, {
            confidence: (confidence * 100).toFixed(0),
          }),
        });
      }
    }

    record(snapshot);
    return issues;
  }

  /* ===============================
     PASS 2: NORMAL RULES
     =============================== */
  for (const rule of RULES) {

    /* ----- Regression Rule ----- */
    if (rule.regression && previous) {
      const field = rule.regression.field;
      const multiplier = rule.regression.multiplier;

      if (snapshot[field] > previous[field] * multiplier) {
        issues.push({
          ruleId: rule.id,
          confidence: 1,
          severity: downgradeSeverity(
            rule.baseSeverity,
            1,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            prevValue: previous[field].toFixed(1),
            currValue: snapshot[field].toFixed(1),
          }),
        });
      }
      continue;
    }

    /* ----- Trend Detection Rule ----- */
    if (rule.trend && historyList.length >= 5) {
      const trend = detectTrend(historyList, rule.trend.field);

      if (
        trend.direction === rule.trend.direction &&
        trend.change >= rule.trend.threshold
      ) {
        const confidence = Math.min(trend.change / 100, 1.0);

        issues.push({
          ruleId: rule.id,
          confidence,
          severity: downgradeSeverity(
            rule.baseSeverity,
            confidence,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            change: trend.change.toFixed(1),
          }),
        });
      }
      continue;
    }

    /* ----- Predicate Rule ----- */
    if (rule.predicate) {
      const predicateFn = buildPredicate(rule.predicate);
      const confidence = calculateConfidenceWithCurrent(
  predicateFn,
  historyList,
  snapshot
);
      const threshold = rule.confidenceThreshold || 0.6;

      if (predicateFn(snapshot) && confidence >= threshold) {
        issues.push({
          ruleId: rule.id,
          confidence,
          severity: downgradeSeverity(
            rule.baseSeverity,
            confidence,
            snapshot.boundaryType || "HOC"
          ),
          reason: interpolateMessage(rule.messageTemplate, {
            confidence: (confidence * 100).toFixed(0),
          }),
        });
      }
    }
  }

  record(snapshot);
  return issues;
}


    /* -------------------------------
       Worker Message Handler
    -------------------------------- */

    self.onmessage = (e) => {
      const { type, payload } = e.data;

      /* Init rules once */
      if (type === "INIT_RULES") {
        RULES = payload;
        console.log('[PerfGuard Worker] Rules loaded:', RULES.length);
        self.postMessage({ type: "INIT_SUCCESS", count: RULES.length });
        return;
      }

      /* Evaluate snapshots */
      if (type === "EVALUATE") {
        const results = [];
        let hasCritical = false;

        for (const snapshot of payload) {
          const issues = evaluate(snapshot);

          if (issues.length) {
            const componentResult = {
              component: snapshot.component,
              boundaryType: snapshot.boundaryType || "HOC",
              metrics: {
                renders: snapshot.renders,
                avgTime: snapshot.avgTime,
                maxTime: snapshot.maxTime,
              },
              issues,
            };

            // Check for critical issues
            if (issues.some(i => i.severity === 'CRITICAL')) {
              hasCritical = true;
              componentResult.hasCritical = true;
            }

            results.push(componentResult);
          }
        }

        console.log('[PerfGuard Worker] Evaluation complete:', results.length, 'issues');
        self.postMessage({ 
          type: "RESULTS", 
          data: results,
          hasCritical,
          timestamp: Date.now()
        });
      }

      /* Reset history */
      if (type === "RESET") {
        history.clear();
        self.postMessage({ type: "RESET_SUCCESS" });
      }

      /* Get stats */
      if (type === "GET_STATS") {
        const stats = {
          componentsTracked: history.size,
          totalSnapshots: Array.from(history.values()).reduce((sum, list) => sum + list.length, 0),
          rulesLoaded: RULES.length,
        };
        self.postMessage({ type: "STATS", data: stats });
      }
    };
  `;

  return new Worker(
    URL.createObjectURL(new Blob([code], { type: "application/javascript" }))
  );
}
