
// ============================================
// 2. FIXED: rules.test.ts
// ============================================
import { PERF_RULES, getRulesConfig, RULE_GROUPS } from '../perf-engine/rules';

describe('RULE_GROUPS', () => {
  it('all group rules must exist in PERF_RULES', () => {
    const allRuleIds = new Set(PERF_RULES.map(r => r.id));

    Object.values(RULE_GROUPS)
      .flat()
      .forEach(rule => {
        expect(allRuleIds.has(rule.id)).toBe(true);
      });
  });

  it('CRITICAL_ONLY contains only CRITICAL severity rules', () => {
    RULE_GROUPS.CRITICAL_ONLY.forEach(rule => {
      expect(rule.baseSeverity).toBe('CRITICAL');
    });
  });

  it('category groups contain only rules of matching category', () => {
    RULE_GROUPS.PERFORMANCE.forEach(rule =>
      expect(rule.category).toBe('PERFORMANCE')
    );

    RULE_GROUPS.UX.forEach(rule =>
      expect(rule.category).toBe('UX')
    );

    RULE_GROUPS.STABILITY.forEach(rule =>
      expect(rule.category).toBe('STABILITY')
    );

    RULE_GROUPS.MEMORY.forEach(rule =>
      expect(rule.category).toBe('MEMORY')
    );
  });

  it('every PERF_RULE appears in at least one group', () => {
    const groupedIds = new Set(
      Object.values(RULE_GROUPS)
        .flat()
        .map(r => r.id)
    );

    PERF_RULES.forEach(rule => {
      expect(groupedIds.has(rule.id)).toBe(true);
    });
  });
});
