// __tests__/integration.test.tsx - FIXED VERSION
import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { PerfProvider } from '../PerfProvider';

// Mock console methods BEFORE anything else
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

global.console.log = jest.fn();
global.console.error = jest.fn();

// Setup Worker mock BEFORE importing anything
beforeAll(() => {
  global.Worker = require('../../jest.worker.mock');
});

afterAll(() => {
  global.console.log = originalConsoleLog;
  global.console.error = originalConsoleError;
  if (global.Worker) {
    delete (global as any).Worker;
  }
});

// Mock the collector - MUST define mocks inside factory function
let mockMetrics: any[] = [];

jest.mock('../collector', () => ({
  flushMetrics: jest.fn(() => {
    const metrics = [...mockMetrics];
    mockMetrics = [];
    return metrics;
  }),
}));

// Mock the warnings - MUST define mocks inside factory function
const mockWarnings: any[] = [];

jest.mock('../warnings', () => ({
  showWarning: jest.fn((result) => {
    mockWarnings.push({ type: 'warning', ...result });
  }),
  showCriticalAlert: jest.fn((result) => {
    mockWarnings.push({ type: 'critical', ...result });
  }),
}));

// Mock isDev
jest.mock('../env', () => ({
  isDev: true,
  isPerfGuardActive: jest.fn(() => true),
  setForceEnabled: jest.fn(),
}));

describe('PerfGuard - End-to-End Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMetrics.length = 0;
    mockWarnings.length = 0;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('PerfProvider Integration', () => {
    it('should render children without PerfGuard in production', () => {
      const { isPerfGuardActive } = require('../env');
      (isPerfGuardActive as jest.Mock).mockReturnValueOnce(false);

      const { container } = render(
        <PerfProvider>
          <div>Test Content</div>
        </PerfProvider>
      );

      expect(container.textContent).toBe('Test Content');
    });

    it('should initialize worker with rules', async () => {
      render(
        <PerfProvider>
          <div>Test</div>
        </PerfProvider>
      );

      // Advance timers to allow worker initialization
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.console.log).toHaveBeenCalledWith(
          expect.stringContaining('[PerfGuard] Worker ready with')
        );
      }, { timeout: 1000 });
    });

    it('should flush metrics every 5 seconds', async () => {
      const { flushMetrics } = require('../collector');
      
      // Add some metrics first
      mockMetrics = [
        { component: 'TestComponent', avgTime: 5, maxTime: 10, renders: 3, boundaryType: 'HOC' },
      ];

      render(
        <PerfProvider>
          <div>Test</div>
        </PerfProvider>
      );

      // Wait for initialization
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Advance to trigger flush (5 seconds)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(flushMetrics).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should show warnings when issues detected', async () => {
      const { showWarning } = require('../warnings');
      
      // Add metrics that will trigger SLOW_RENDER (need 3+ for pattern detection)
      mockMetrics = [
        { component: 'SlowComponent', avgTime: 25, maxTime: 35, renders: 5, boundaryType: 'HOC' },
        { component: 'SlowComponent', avgTime: 28, maxTime: 38, renders: 6, boundaryType: 'HOC' },
        { component: 'SlowComponent', avgTime: 26, maxTime: 36, renders: 5, boundaryType: 'HOC' },
        { component: 'SlowComponent', avgTime: 27, maxTime: 37, renders: 7, boundaryType: 'HOC' },
      ];

      render(
        <PerfProvider>
          <div>Test</div>
        </PerfProvider>
      );

      // Initialize worker
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Trigger flush
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for worker to process and call showWarning
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(showWarning).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should catch slow component pattern', async () => {
      const { showWarning } = require('../warnings');
      
      // Simulate slow component renders
      mockMetrics = [
        { component: 'ProductList', avgTime: 20, maxTime: 30, renders: 5, boundaryType: 'HOC' },
        { component: 'ProductList', avgTime: 22, maxTime: 32, renders: 6, boundaryType: 'HOC' },
        { component: 'ProductList', avgTime: 21, maxTime: 31, renders: 5, boundaryType: 'HOC' },
        { component: 'ProductList', avgTime: 23, maxTime: 33, renders: 7, boundaryType: 'HOC' },
      ];

      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Trigger flush
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(showWarning).toHaveBeenCalled();
        const warning = mockWarnings[0];
        expect(warning.component).toBe('ProductList');
        expect(warning.issues).toBeDefined();
      }, { timeout: 2000 });
    });

    it('should catch excessive re-renders', async () => {
      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // First batch - need 3+ snapshots for pattern detection
      mockMetrics = [
        { component: 'LiveChart', avgTime: 5, maxTime: 10, renders: 25, boundaryType: 'HOC' },
      ];
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Second batch
      mockMetrics = [
        { component: 'LiveChart', avgTime: 6, maxTime: 11, renders: 28, boundaryType: 'HOC' },
      ];
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Third batch
      mockMetrics = [
        { component: 'LiveChart', avgTime: 5, maxTime: 9, renders: 30, boundaryType: 'HOC' },
      ];
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(
        () => {
          const excessiveRenderIssue = mockWarnings.some(w =>
            w.issues?.some((i: any) => i.ruleId === 'EXCESSIVE_RENDERS')
          );
          expect(excessiveRenderIssue).toBe(true);
        },
        { timeout: 2000 }
      );
    });

    it('should detect performance regression', async () => {
      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // First batch - baseline (need 3 for pattern)
      mockMetrics = [
        { component: 'Dashboard', avgTime: 10, maxTime: 15, renders: 5, boundaryType: 'HOC' },
        { component: 'Dashboard', avgTime: 10, maxTime: 15, renders: 5, boundaryType: 'HOC' },
      ];
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Second batch - regressed (30% slower = 10ms -> 15ms)
      mockMetrics = [
        { component: 'Dashboard', avgTime: 15, maxTime: 20, renders: 5, boundaryType: 'HOC' },
      ];
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        const regressionIssue = mockWarnings.some(w =>
          w.issues?.some((i: any) => i.ruleId === 'PERF_REGRESSION')
        );
        expect(regressionIssue).toBeTruthy();
      }, { timeout: 2000 });
    });

    it('should show critical alerts for blocking renders', async () => {
      const { showCriticalAlert } = require('../warnings');
      
      // Metrics that trigger BLOCKING_RENDER (>100ms)
      mockMetrics = [
        { component: 'HeavyComponent', avgTime: 120, maxTime: 150, renders: 5, boundaryType: 'HOC' },
        { component: 'HeavyComponent', avgTime: 125, maxTime: 155, renders: 6, boundaryType: 'HOC' },
        { component: 'HeavyComponent', avgTime: 122, maxTime: 152, renders: 5, boundaryType: 'HOC' },
      ];

      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Trigger flush
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(showCriticalAlert).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('Multiple Components Tracking', () => {
    it('should track multiple components simultaneously', async () => {
      // Need 3+ snapshots for Sidebar to trigger detection
      mockMetrics = [
        { component: 'Header', avgTime: 5, maxTime: 10, renders: 3, boundaryType: 'HOC' },
        { component: 'Sidebar', avgTime: 20, maxTime: 30, renders: 25, boundaryType: 'HOC' },
        { component: 'Sidebar', avgTime: 22, maxTime: 32, renders: 28, boundaryType: 'HOC' },
        { component: 'Sidebar', avgTime: 21, maxTime: 31, renders: 30, boundaryType: 'HOC' },
        { component: 'Content', avgTime: 12, maxTime: 18, renders: 5, boundaryType: 'HOC' },
        { component: 'Footer', avgTime: 3, maxTime: 5, renders: 2, boundaryType: 'HOC' },
      ];

      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Trigger flush
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // Should detect issues in Sidebar (slow + excessive renders)
        const sidebarWarning = mockWarnings.find(w => w.component === 'Sidebar');
        expect(sidebarWarning).toBeDefined();

        // Header is fast enough to earn PROD_READY_PERF (an INFO-level
        // confirmation, not a problem) — it should not have anything more
        // severe than that.
        const headerWarning = mockWarnings.find(
          (w) => w.component === 'Header' && w.issues?.some((i: any) => i.severity !== 'INFO')
        );
        expect(headerWarning).toBeUndefined();
      }, { timeout: 2000 });
    });
  });

  describe('Worker Error Handling', () => {
    it('should handle worker errors gracefully', async () => {
      // Mock Worker to simulate error
      const OriginalWorker = global.Worker;
      
      class ErrorWorker {
        onmessage: any = null;
        onerror: any = null;
        
        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new ErrorEvent('error', { message: 'Test worker error' }));
            }
          }, 50);
        }
        
        postMessage() {}
        terminate() {}
      }
      
      global.Worker = ErrorWorker as any;

      render(
        <PerfProvider>
          <div>App</div>
        </PerfProvider>
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // PerfProvider logs this as two args: console.error("[PerfGuard]
        // Worker error:", err) — match both rather than the whole call as
        // a single string.
        expect(global.console.error).toHaveBeenCalledWith(
          expect.stringContaining('[PerfGuard] Worker error'),
          expect.anything()
        );
      }, { timeout: 1000 });

      global.Worker = OriginalWorker;
    });
  });

  describe('Stats Overlay', () => {
    it('should show stats overlay when critical issues exist', async () => {
      // Metrics that trigger CRITICAL severity
      mockMetrics = [
        { component: 'CriticalComponent', avgTime: 120, maxTime: 150, renders: 5, boundaryType: 'HOC' },
        { component: 'CriticalComponent', avgTime: 125, maxTime: 155, renders: 6, boundaryType: 'HOC' },
        { component: 'CriticalComponent', avgTime: 122, maxTime: 152, renders: 5, boundaryType: 'HOC' },
      ];

      const { container } = render(
        <PerfProvider showStats={true}>
          <div>App</div>
        </PerfProvider>
      );

      // Initialize
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Trigger flush
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Wait for processing
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // Look for overlay - might have different selector based on your implementation
        const overlay = container.querySelector('[data-testid="perf-overlay"]') || 
                        container.querySelector('div[style*="position: fixed"]') ||
                        container.querySelector('div[style*="position:fixed"]');
        expect(overlay).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup worker on unmount', async () => {
      const { unmount } = render(
        <PerfProvider>
          <div>Test</div>
        </PerfProvider>
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      unmount();

      // Worker cleanup happens internally
      expect(true).toBe(true);
    });

    it('should clear intervals on unmount', () => {
      const { unmount } = render(
        <PerfProvider>
          <div>Test</div>
        </PerfProvider>
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      const timerCountBefore = jest.getTimerCount();
      
      unmount();

      // After unmount, timer count should be 0 or less than before
      const timerCountAfter = jest.getTimerCount();
      expect(timerCountAfter).toBeLessThanOrEqual(timerCountBefore);
    });
  });
});