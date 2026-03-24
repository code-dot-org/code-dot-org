import * as fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Use vi.hoisted so mock variables are available when vi.mock factories are hoisted
const {
  mockRumInit,
  mockRumAddAction,
  mockRumStopSession,
  mockLogsInit,
  mockLogsLoggerInfo,
  mockLogsLoggerWarn,
  mockLogsLoggerError,
} = vi.hoisted(() => ({
  mockRumInit: vi.fn(),
  mockRumAddAction: vi.fn(),
  mockRumStopSession: vi.fn(),
  mockLogsInit: vi.fn(),
  mockLogsLoggerInfo: vi.fn(),
  mockLogsLoggerWarn: vi.fn(),
  mockLogsLoggerError: vi.fn(),
}));

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    init: mockRumInit,
    addAction: mockRumAddAction,
    stopSession: mockRumStopSession,
  },
}));

vi.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    init: mockLogsInit,
    logger: {
      info: mockLogsLoggerInfo,
      warn: mockLogsLoggerWarn,
      error: mockLogsLoggerError,
    },
  },
}));

vi.mock('../../internal/ssrGuard', () => ({
  isBrowser: vi.fn(() => true),
}));

import {DatadogAdapter} from '../datadog';
import {isBrowser} from '../../internal/ssrGuard';

const baseConfig = {applicationName: 'test-app', environment: 'test'};

describe('DatadogAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  // Unit tests — 5.3
  describe('SSR guard', () => {
    it('does not call SDK when window is undefined', () => {
      (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      expect(mockRumInit).not.toHaveBeenCalled();
      expect(mockLogsInit).not.toHaveBeenCalled();
    });
  });

  describe('degraded mode', () => {
    it('sets degraded=true when init throws', () => {
      mockRumInit.mockImplementationOnce(() => {
        throw new Error('blocked by ad-blocker');
      });
      const adapter = new DatadogAdapter();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      adapter.init(baseConfig);
      expect(warnSpy).toHaveBeenCalled();
      // After degraded init, subsequent calls are no-ops
      adapter.recordLog('info', 'msg');
      expect(mockLogsLoggerInfo).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('recordLog is no-op when not initialized', () => {
      const adapter = new DatadogAdapter();
      adapter.recordLog('info', 'msg');
      expect(mockLogsLoggerInfo).not.toHaveBeenCalled();
    });

    it('recordMetric is no-op when not initialized', () => {
      const adapter = new DatadogAdapter();
      adapter.recordMetric('m', 1);
      expect(mockRumAddAction).not.toHaveBeenCalled();
    });
  });

  describe('method mappings', () => {
    it('init calls datadogRum.init with PRIVACY_COMPLIANCE settings', () => {
      const adapter = new DatadogAdapter();
      adapter.init({
        ...baseConfig,
        providerOptions: {applicationId: 'app-id', clientToken: 'token'},
      });
      expect(mockRumInit).toHaveBeenCalledWith(
        expect.objectContaining({
          trackUserInteractions: false,
          trackResources: false,
          trackLongTasks: false,
          defaultPrivacyLevel: 'mask-user-input',
          service: 'test-app',
          env: 'test',
        })
      );
    });

    it('init also calls datadogLogs.init', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      expect(mockLogsInit).toHaveBeenCalled();
    });

    it('recordLog delegates to datadogLogs.logger.info', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('info', 'hello', {key: 'val'});
      expect(mockLogsLoggerInfo).toHaveBeenCalledWith('hello', {key: 'val'});
    });

    it('recordLog delegates to datadogLogs.logger.warn', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('warn', 'warning');
      expect(mockLogsLoggerWarn).toHaveBeenCalledWith('warning', undefined);
    });

    it('recordLog delegates to datadogLogs.logger.error', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('error', 'err');
      expect(mockLogsLoggerError).toHaveBeenCalledWith('err', undefined);
    });

    it('recordMetric delegates to datadogRum.addAction', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.recordMetric('my.metric', 42, {unit: 'ms', dimensions: {env: 'prod'}});
      expect(mockRumAddAction).toHaveBeenCalledWith(
        'my.metric',
        expect.objectContaining({value: 42, unit: 'ms', env: 'prod'})
      );
    });

    it('incrementCounter calls recordMetric with value 1 and unit count', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.incrementCounter('my.counter', {region: 'us'});
      expect(mockRumAddAction).toHaveBeenCalledWith(
        'my.counter',
        expect.objectContaining({value: 1, unit: 'count', region: 'us'})
      );
    });

    it('shutdown calls datadogRum.stopSession', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.shutdown();
      expect(mockRumStopSession).toHaveBeenCalled();
    });

    it('init is idempotent — second call is no-op', () => {
      const adapter = new DatadogAdapter();
      adapter.init(baseConfig);
      adapter.init(baseConfig);
      expect(mockRumInit).toHaveBeenCalledTimes(1);
    });
  });

  // Property-based tests — 5.4
  // Feature: observability, Property 3: recordLog is forwarded to the provider
  describe('Property 3: recordLog is forwarded to the provider', () => {
    it('forwards any log level/message/context to datadogLogs.logger', () => {
      const levelArb = fc.constantFrom('info' as const, 'warn' as const, 'error' as const);
      fc.assert(
        fc.property(levelArb, fc.string(), (level, message) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new DatadogAdapter();
          adapter.init(baseConfig);
          adapter.recordLog(level, message);
          const mockFn =
            level === 'info'
              ? mockLogsLoggerInfo
              : level === 'warn'
                ? mockLogsLoggerWarn
                : mockLogsLoggerError;
          expect(mockFn).toHaveBeenCalledWith(message, undefined);
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 4: recordMetric is forwarded to the provider
  describe('Property 4: recordMetric is forwarded to the provider', () => {
    it('forwards any metric name/value to datadogRum.addAction', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), fc.float({min: -1e6, max: 1e6}), (name, value) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new DatadogAdapter();
          adapter.init(baseConfig);
          adapter.recordMetric(name, value);
          expect(mockRumAddAction).toHaveBeenCalledWith(
            name,
            expect.objectContaining({value})
          );
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 5: incrementCounter === recordMetric(name, 1, {unit:'count'})
  describe('Property 5: incrementCounter is equivalent to recordMetric with value 1 and unit count', () => {
    it('produces the same SDK call as recordMetric(name, 1, {unit: count})', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), name => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new DatadogAdapter();
          adapter.init(baseConfig);
          adapter.incrementCounter(name);
          expect(mockRumAddAction).toHaveBeenCalledWith(
            name,
            expect.objectContaining({value: 1, unit: 'count'})
          );
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 6: No user identity transmitted by default
  describe('Property 6: no user identity transmitted by default', () => {
    it('init does not pass userId or PII to the SDK', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (appName, env) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const adapter = new DatadogAdapter();
          adapter.init({applicationName: appName, environment: env});
          const rumCall = mockRumInit.mock.calls[0]?.[0] ?? {};
          expect(rumCall).not.toHaveProperty('userId');
          expect(rumCall).not.toHaveProperty('user');
          expect(rumCall.trackUserInteractions).toBe(false);
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 7: SDK failures do not propagate
  describe('Property 7: SDK failures do not propagate', () => {
    it('recordLog does not throw when SDK throws', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('info' as const, 'warn' as const, 'error' as const),
          fc.string(),
          (level, message) => {
            vi.clearAllMocks();
            (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
            mockLogsLoggerInfo.mockImplementation(() => {
              throw new Error('SDK error');
            });
            mockLogsLoggerWarn.mockImplementation(() => {
              throw new Error('SDK error');
            });
            mockLogsLoggerError.mockImplementation(() => {
              throw new Error('SDK error');
            });
            const adapter = new DatadogAdapter();
            adapter.init(baseConfig);
            expect(() => adapter.recordLog(level, message)).not.toThrow();
          }
        ),
        {numRuns: 50}
      );
    });

    it('recordMetric does not throw when SDK throws', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), fc.float(), (name, value) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          mockRumAddAction.mockImplementation(() => {
            throw new Error('SDK error');
          });
          const adapter = new DatadogAdapter();
          adapter.init(baseConfig);
          expect(() => adapter.recordMetric(name, value)).not.toThrow();
        }),
        {numRuns: 50}
      );
    });
  });
});
