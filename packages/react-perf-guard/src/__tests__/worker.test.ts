
// ============================================
// 3. FIXED: worker.test.ts
// ============================================
import { createAnalyzerWorker } from '../worker/createWorker';
import { PERF_RULES } from '../perf-engine/rules';

beforeAll(() => {
  global.Worker = require('../../jest.worker.mock');
  jest.useFakeTimers();
});

afterAll(() => {
  if (global.Worker) {
    delete global.Worker;
  }
  jest.useRealTimers();
});

describe('Worker - Rule Engine', () => {
  let worker: Worker;

  beforeEach(() => {
    jest.clearAllTimers();
    worker = createAnalyzerWorker();
  });

  afterEach(() => {
    worker.terminate();
    jest.clearAllTimers();
  });

  describe('Worker Initialization', () => {
    it('should create worker successfully', () => {
      expect(worker).toBeDefined();
      expect(worker).toBeInstanceOf(Worker);
    });

    it('should load rules successfully', (done) => {
      worker.onmessage = (e) => {
        const { type, count } = e.data;
        expect(type).toBe('INIT_SUCCESS');
        expect(count).toBe(PERF_RULES.length);
        done();
      };

      worker.postMessage({
        type: 'INIT_RULES',
        payload: PERF_RULES,
      });

      jest.advanceTimersByTime(20);
    });
  });

  describe('SLOW_RENDER Detection', () => {
    it('should detect slow render (>16ms)', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'SlowComponent', avgTime: 20, maxTime: 30, renders: 5, boundaryType: 'HOC' },
              { component: 'SlowComponent', avgTime: 22, maxTime: 32, renders: 6, boundaryType: 'HOC' },
              { component: 'SlowComponent', avgTime: 21, maxTime: 31, renders: 5, boundaryType: 'HOC' },
              { component: 'SlowComponent', avgTime: 23, maxTime: 33, renders: 7, boundaryType: 'HOC' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS') {
          expect(e.data.data.length).toBeGreaterThan(0);
          const issue = e.data.data[0].issues.find((i: any) => i.ruleId === 'SLOW_RENDER');
          expect(issue).toBeDefined();
          expect(issue.confidence).toBeGreaterThan(0.6);
          done();
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });

    it('should respect confidence threshold', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'SometimesSlow', avgTime: 20, maxTime: 30, renders: 5, boundaryType: 'HOC' },
              { component: 'SometimesSlow', avgTime: 10, maxTime: 15, renders: 6, boundaryType: 'HOC' },
              { component: 'SometimesSlow', avgTime: 12, maxTime: 18, renders: 5, boundaryType: 'HOC' },
              { component: 'SometimesSlow', avgTime: 11, maxTime: 16, renders: 7, boundaryType: 'HOC' },
              { component: 'SometimesSlow', avgTime: 18, maxTime: 25, renders: 8, boundaryType: 'HOC' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS') {
          const slowRenderIssue = e.data.data.flatMap((r: any) => r.issues)
            .find((i: any) => i.ruleId === 'SLOW_RENDER');
          expect(slowRenderIssue).toBeUndefined();
          done();
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });
  });

  describe('PERF_REGRESSION Detection', () => {
    it('should detect 30% performance regression', (done) => {
      let initDone = false;

      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'RegressingComponent', avgTime: 10, maxTime: 15, renders: 5, boundaryType: 'HOC' },
              { component: 'RegressingComponent', avgTime: 10, maxTime: 15, renders: 5, boundaryType: 'HOC' },
              { component: 'RegressingComponent', avgTime: 15, maxTime: 20, renders: 5, boundaryType: 'HOC' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS' && e.data.data.length > 0) {
          const issue = e.data.data[0].issues.find((i: any) => i.ruleId === 'PERF_REGRESSION');
          if (issue) {
            expect(issue).toBeDefined();
            expect(issue.confidence).toBe(1);
            expect(issue.severity).toBe('HIGH');
            done();
          }
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });
  });

  describe('Severity Downgrade', () => {
    it('should downgrade INLINE boundary to INFO', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'InlineComponent', avgTime: 25, maxTime: 35, renders: 5, boundaryType: 'INLINE' },
              { component: 'InlineComponent', avgTime: 28, maxTime: 38, renders: 6, boundaryType: 'INLINE' },
              { component: 'InlineComponent', avgTime: 26, maxTime: 36, renders: 5, boundaryType: 'INLINE' },
              { component: 'InlineComponent', avgTime: 27, maxTime: 37, renders: 7, boundaryType: 'INLINE' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS') {
          const issue = e.data.data[0].issues[0];
          expect(issue.severity).toBe('INFO');
          done();
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });

    it('should downgrade based on confidence level', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'MediumConfidence', avgTime: 20, maxTime: 30, renders: 5, boundaryType: 'HOC' },
              { component: 'MediumConfidence', avgTime: 22, maxTime: 32, renders: 6, boundaryType: 'HOC' },
              { component: 'MediumConfidence', avgTime: 12, maxTime: 18, renders: 5, boundaryType: 'HOC' },
              { component: 'MediumConfidence', avgTime: 21, maxTime: 31, renders: 7, boundaryType: 'HOC' },
              { component: 'MediumConfidence', avgTime: 23, maxTime: 33, renders: 8, boundaryType: 'HOC' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS') {
          if (e.data.data.length > 0) {
            const issue = e.data.data[0].issues[0];
            expect(['LOW', 'MEDIUM']).toContain(issue.severity);
            done();
          }
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single snapshot (no history)', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({
            type: 'EVALUATE',
            payload: [
              { component: 'NewComponent', avgTime: 25, maxTime: 35, renders: 5, boundaryType: 'HOC' },
            ]
          });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'RESULTS') {
          expect(e.data.data.length).toBe(0);
          done();
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });
  });

  describe('Worker Stats', () => {
    it('should return stats', (done) => {
      worker.onmessage = (e) => {
        if (e.data.type === 'INIT_SUCCESS') {
          worker.postMessage({ type: 'GET_STATS' });
          jest.advanceTimersByTime(20);
        } else if (e.data.type === 'STATS') {
          expect(e.data.data).toHaveProperty('componentsTracked');
          expect(e.data.data).toHaveProperty('totalSnapshots');
          expect(e.data.data).toHaveProperty('rulesLoaded');
          done();
        }
      };

      worker.postMessage({ type: 'INIT_RULES', payload: PERF_RULES });
      jest.advanceTimersByTime(20);
    });
  });
});
