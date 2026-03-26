import * as fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Use vi.hoisted so mock variables are available when vi.mock factories are hoisted
const {
  mockSentryInit,
  mockAddBreadcrumb,
  mockMetricsDistribution,
  mockMetricsCount,
  mockClose,
} = vi.hoisted(() => ({
  mockSentryInit: vi.fn(),
  mockAddBreadcrumb: vi.fn(),
  mockMetricsDistribution: vi.fn(),
  mockMetricsCount: vi.fn(),
  mockClose: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@sentry/browser', () => ({
  init: mockSentryInit,
  addBreadcrumb: mockAddBreadcrumb,
  metrics: {
    distribution: mockMetricsDistribution,
    count: mockMetricsCount,
  },
  close: mockClose,
}));

vi.mock('../../internal/ssrGuard', () => ({
  isBrowser: vi.fn(() => true),
}));

import {isBrowser} from '../../internal/ssrGuard';
import {SentryAdapter} from '../sentry';

const baseConfig = {
  applicationName: 'test-app',
  environment: 'test',
  version: '1.0.0',
};

describe('SentryAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  // Unit tests — 7.3
  describe('SSR guard', () => {
    it('does not call SDK when not in browser', () => {
      (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      expect(mockSentryInit).not.toHaveBeenCalled();
    });
  });

  describe('degraded mode', () => {
    it('sets degraded when init throws', () => {
      mockSentryInit.mockImplementationOnce(() => {
        throw new Error('Sentry blocked');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      expect(warnSpy).toHaveBeenCalled();
      adapter.recordLog('info', 'msg');
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('recordLog is no-op when not initialized', () => {
      const adapter = new SentryAdapter();
      adapter.recordLog('info', 'msg');
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });

    it('recordMetric is no-op when not initialized', () => {
      const adapter = new SentryAdapter();
      adapter.recordMetric('m', 1);
      expect(mockMetricsDistribution).not.toHaveBeenCalled();
    });
  });

  describe('method mappings', () => {
    it('init calls Sentry.init with PRIVACY_COMPLIANCE settings', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        ...baseConfig,
        providerOptions: {dsn: 'https://key@sentry.io/123'},
      });
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          sendDefaultPii: false,
          environment: 'test',
          release: '1.0.0',
        }),
      );
    });

    it('SENTRY_PRIVACY_COMPLIANCE is spread before providerOptions', () => {
      const adapter = new SentryAdapter();
      // Verify sendDefaultPii defaults to false when not in providerOptions
      adapter.init(baseConfig);
      const call = mockSentryInit.mock.calls[0]?.[0] ?? {};
      expect(call.sendDefaultPii).toBe(false);
    });

    it('recordLog delegates to Sentry.addBreadcrumb', () => {
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('warn', 'warning', {key: 'val'});
      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        level: 'warning',
        message: 'warning',
        data: {key: 'val'},
      });
    });

    it('recordMetric delegates to Sentry.metrics.distribution', () => {
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      adapter.recordMetric('my.metric', 42, {
        unit: 'ms',
        dimensions: {env: 'prod'},
      });
      expect(mockMetricsDistribution).toHaveBeenCalledWith(
        'my.metric',
        42,
        expect.objectContaining({attributes: {env: 'prod'}}),
      );
    });

    it('incrementCounter delegates to Sentry.metrics.count', () => {
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      adapter.incrementCounter('my.counter', {region: 'us'});
      expect(mockMetricsCount).toHaveBeenCalledWith('my.counter', 1, {
        attributes: {region: 'us'},
      });
    });

    it('shutdown calls Sentry.close', () => {
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      adapter.shutdown();
      expect(mockClose).toHaveBeenCalled();
    });

    it('init is idempotent', () => {
      const adapter = new SentryAdapter();
      adapter.init(baseConfig);
      adapter.init(baseConfig);
      expect(mockSentryInit).toHaveBeenCalledTimes(1);
    });
  });

  // Property-based tests — Properties 3, 4, 5, 6, 7
  // Feature: observability, Property 3: recordLog is forwarded to the provider
  describe('Property 3: recordLog is forwarded to the provider', () => {
    it('forwards any log level/message to Sentry.addBreadcrumb', () => {
      /**
       * Validates: Requirements 3.1
       */
      const levelArb = fc.constantFrom(
        'info' as const,
        'warn' as const,
        'error' as const,
      );
      fc.assert(
        fc.property(levelArb, fc.string(), (level, message) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new SentryAdapter();
          adapter.init(baseConfig);
          adapter.recordLog(level, message);
          const sentryLevel = level === 'warn' ? 'warning' : level;
          expect(mockAddBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({level: sentryLevel, message}),
          );
        }),
        {numRuns: 100},
      );
    });
  });

  // Feature: observability, Property 4: recordMetric is forwarded to the provider
  describe('Property 4: recordMetric is forwarded to the provider', () => {
    it('forwards any metric name/value to Sentry.metrics.distribution', () => {
      /**
       * Validates: Requirements 3.2
       */
      fc.assert(
        fc.property(
          fc.string({minLength: 1}),
          fc.float({min: -1e6, max: 1e6}),
          (name, value) => {
            vi.clearAllMocks();
            (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
            const adapter = new SentryAdapter();
            adapter.init(baseConfig);
            adapter.recordMetric(name, value);
            expect(mockMetricsDistribution).toHaveBeenCalledWith(
              name,
              value,
              expect.anything(),
            );
          },
        ),
        {numRuns: 100},
      );
    });
  });

  // Feature: observability, Property 5: incrementCounter === Sentry.metrics.count(name, 1)
  describe('Property 5: incrementCounter calls Sentry.metrics.count with value 1', () => {
    it('calls Sentry.metrics.count with value 1 for any counter name', () => {
      /**
       * Validates: Requirements 3.3
       */
      fc.assert(
        fc.property(fc.string({minLength: 1}), name => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new SentryAdapter();
          adapter.init(baseConfig);
          adapter.incrementCounter(name);
          expect(mockMetricsCount).toHaveBeenCalledWith(
            name,
            1,
            expect.anything(),
          );
        }),
        {numRuns: 100},
      );
    });
  });

  // Feature: observability, Property 6: No user identity transmitted by default
  describe('Property 6: no user identity transmitted by default', () => {
    it('init does not pass userId or PII to Sentry.init', () => {
      /**
       * Validates: Requirements 4.1, 4.2
       */
      fc.assert(
        fc.property(fc.string(), fc.string(), (appName, env) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new SentryAdapter();
          adapter.init({applicationName: appName, environment: env});
          const sentryCall = mockSentryInit.mock.calls[0]?.[0] ?? {};
          expect(sentryCall).not.toHaveProperty('user');
          expect(sentryCall.sendDefaultPii).toBe(false);
        }),
        {numRuns: 100},
      );
    });
  });

  // Feature: observability, Property 7: SDK failures do not propagate
  describe('Property 7: SDK failures do not propagate', () => {
    it('recordLog does not throw when SDK throws', () => {
      /**
       * Validates: Requirements 3.4, 5.4
       */
      fc.assert(
        fc.property(
          fc.constantFrom('info' as const, 'warn' as const, 'error' as const),
          fc.string(),
          (level, message) => {
            vi.clearAllMocks();
            (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
            mockAddBreadcrumb.mockImplementation(() => {
              throw new Error('Sentry SDK error');
            });
            const adapter = new SentryAdapter();
            adapter.init(baseConfig);
            expect(() => adapter.recordLog(level, message)).not.toThrow();
          },
        ),
        {numRuns: 50},
      );
    });

    it('recordMetric does not throw when SDK throws', () => {
      /**
       * Validates: Requirements 3.4, 5.4
       */
      fc.assert(
        fc.property(fc.string({minLength: 1}), fc.float(), (name, value) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          mockMetricsDistribution.mockImplementation(() => {
            throw new Error('Sentry SDK error');
          });
          const adapter = new SentryAdapter();
          adapter.init(baseConfig);
          expect(() => adapter.recordMetric(name, value)).not.toThrow();
        }),
        {numRuns: 50},
      );
    });

    it('incrementCounter does not throw when SDK throws', () => {
      /**
       * Validates: Requirements 3.4, 5.4
       */
      fc.assert(
        fc.property(fc.string({minLength: 1}), name => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          mockMetricsCount.mockImplementation(() => {
            throw new Error('Sentry SDK error');
          });
          const adapter = new SentryAdapter();
          adapter.init(baseConfig);
          expect(() => adapter.incrementCounter(name)).not.toThrow();
        }),
        {numRuns: 50},
      );
    });
  });
});
