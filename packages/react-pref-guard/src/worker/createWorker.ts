// worker/createWorker.ts - Enhanced with trend detection
export function createAnalyzerWorker() {
  const code = `
    /* ===============================
       PerfGuard – Enhanced Rule DSL Worker
       =============================== */

    const history = new Map();
    const MAX_HISTORY = 10; // Increased for trend detection
    let RULES = [];

    /* -------------------------------
       Utilities
    -------------------------------- */

    function record(snapshot) {
      const list = history.get(snapshot.component) || [];
      list.push(snapshot);
      if (list.length > MAX_HISTORY) list.shift();
      history.set(snapshot.component, list);
    }

    function calculateConfidence(predicateFn, historyList) {
      if (historyList.length === 0) return 0;
      const matches = historyList.filter(predicateFn).length;
      return matches / historyList.length;
    }

    function downgradeSeverity(severity, confidence, boundaryType) {
      if (boundaryType === "INLINE") return "INFO";
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

      for (const rule of RULES) {

        /* ----- Regression Rule ----- */
        if (rule.regression && previous) {
          const field = rule.regression.field;
          const multiplier = rule.regression.multiplier;

          if (snapshot[field] > previous[field] * multiplier) {
            const reason = interpolateMessage(rule.messageTemplate, {
              prevValue: previous[field].toFixed(1),
              currValue: snapshot[field].toFixed(1),
            });

            issues.push({
              ruleId: rule.id,
              confidence: 1,
              severity: downgradeSeverity(rule.baseSeverity, 1, snapshot.boundaryType || "HOC"),
              reason,
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
            const reason = interpolateMessage(rule.messageTemplate, {
              change: trend.change.toFixed(1),
            });

            const confidence = Math.min(trend.change / 100, 1.0);

            issues.push({
              ruleId: rule.id,
              confidence,
              severity: downgradeSeverity(rule.baseSeverity, confidence, snapshot.boundaryType || "HOC"),
              reason,
            });
          }
          continue;
        }

        /* ----- Predicate Rule ----- */
        if (rule.predicate) {
          const predicateFn = buildPredicate(rule.predicate);
          const confidence = calculateConfidence(predicateFn, historyList);
          const threshold = rule.confidenceThreshold || 0.6;

          if (predicateFn(snapshot) && confidence >= threshold) {
            const reason = interpolateMessage(rule.messageTemplate, {
              confidence: (confidence * 100).toFixed(0),
            });

            issues.push({
              ruleId: rule.id,
              confidence,
              severity: downgradeSeverity(rule.baseSeverity, confidence, snapshot.boundaryType || "HOC"),
              reason,
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
    URL.createObjectURL(
      new Blob([code], { type: "application/javascript" })
    )
  );
}