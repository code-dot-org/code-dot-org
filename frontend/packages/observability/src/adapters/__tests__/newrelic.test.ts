import * as fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Mock ssrGuard
vi.mock('../../internal/ssrGuard', () => ({
  isBrowser: vi.fn(() => true),
}));

import {NewRelicAdapter} from '../newrelic';
import {isBrowser} from '../../internal/ssrGuard';

// Helper to set up a mock newrelic global
function setupNewRelicGlobal() {
  const mockNr = {
    setApplicationVersion: vi.fn(),
    setCustomAttribute: vi.fn(),
    log: vi.fn(),
    recordCustomEvent: vi.fn(),
  };
  Object.defineProperty(window, 'newrelic', {
    value: mockNr,
    writable: true,
    configurable: true,
  });
  return mockNr;
}

function removeNewRelicGlobal() {
  Object.defineProperty(window, 'newrelic', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

const baseConfig = {applicationName: 'test-app', environment: 'test', version: '1.0.0'};

describe('NewRelicAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
    removeNewRelicGlobal();
  });

  // Unit tests — 6.3
  describe('SSR guard', () => {
    it('does not call SDK when not in browser', () => {
      (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      expect(mockNr.setApplicationVersion).not.toHaveBeenCalled();
    });
  });

  describe('when newrelic global is not available', () => {
    it('init does not throw when newrelic is not on window', () => {
      const adapter = new NewRelicAdapter();
      expect(() => adapter.init(baseConfig)).not.toThrow();
    });

    it('recordLog is no-op when newrelic not available', () => {
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      expect(() => adapter.recordLog('info', 'msg')).not.toThrow();
    });
  });

  describe('degraded mode', () => {
    it('sets degraded when init throws', () => {
      const mockNr = setupNewRelicGlobal();
      mockNr.setApplicationVersion.mockImplementationOnce(() => {
        throw new Error('NR error');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      expect(warnSpy).toHaveBeenCalled();
      adapter.recordLog('info', 'msg');
      expect(mockNr.log).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('recordLog is no-op when not initialized', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.recordLog('info', 'msg');
      expect(mockNr.log).not.toHaveBeenCalled();
    });
  });

  describe('method mappings', () => {
    it('init calls setApplicationVersion and setCustomAttribute', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      expect(mockNr.setApplicationVersion).toHaveBeenCalledWith('1.0.0');
      expect(mockNr.setCustomAttribute).toHaveBeenCalledWith('environment', 'test');
    });

    it('init skips setApplicationVersion when version is undefined', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init({applicationName: 'app', environment: 'test'});
      expect(mockNr.setApplicationVersion).not.toHaveBeenCalled();
      expect(mockNr.setCustomAttribute).toHaveBeenCalledWith('environment', 'test');
    });

    it('recordLog delegates to newrelic.log', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('warn', 'warning msg', {key: 'val'});
      expect(mockNr.log).toHaveBeenCalledWith('warning msg', {
        level: 'warn',
        customAttributes: {key: 'val'},
      });
    });

    it('recordMetric delegates to newrelic.recordCustomEvent', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      adapter.recordMetric('my.metric', 42, {unit: 'ms', dimensions: {env: 'prod'}});
      expect(mockNr.recordCustomEvent).toHaveBeenCalledWith(
        'my.metric',
        expect.objectContaining({value: 42, unit: 'ms', env: 'prod'})
      );
    });

    it('incrementCounter calls recordMetric with value 1 and unit count', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      adapter.incrementCounter('my.counter', {region: 'us'});
      expect(mockNr.recordCustomEvent).toHaveBeenCalledWith(
        'my.counter',
        expect.objectContaining({value: 1, unit: 'count', region: 'us'})
      );
    });

    it('shutdown is a no-op', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      expect(() => adapter.shutdown()).not.toThrow();
      // No NR shutdown API exists
    });

    it('init is idempotent', () => {
      const mockNr = setupNewRelicGlobal();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      adapter.init(baseConfig);
      expect(mockNr.setApplicationVersion).toHaveBeenCalledTimes(1);
    });

    it('never calls setUserId (privacy compliance)', () => {
      const mockNr = setupNewRelicGlobal() as ReturnType<typeof setupNewRelicGlobal> & {setUserId?: ReturnType<typeof vi.fn>};
      mockNr.setUserId = vi.fn();
      const adapter = new NewRelicAdapter();
      adapter.init(baseConfig);
      adapter.recordLog('info', 'msg');
      adapter.recordMetric('m', 1);
      adapter.incrementCounter('c');
      adapter.shutdown();
      expect(mockNr.setUserId).not.toHaveBeenCalled();
    });
  });

  // Property-based tests — Properties 3, 4, 5, 6, 7
  // Feature: observability, Property 3: recordLog is forwarded to the provider
  describe('Property 3: recordLog is forwarded to the provider', () => {
    it('forwards any log level/message to newrelic.log', () => {
      const levelArb = fc.constantFrom('info' as const, 'warn' as const, 'error' as const);
      fc.assert(
        fc.property(levelArb, fc.string(), (level, message) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const mockNr = setupNewRelicGlobal();
          const adapter = new NewRelicAdapter();
          adapter.init(baseConfig);
          adapter.recordLog(level, message);
          expect(mockNr.log).toHaveBeenCalledWith(message, expect.objectContaining({level}));
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 4: recordMetric is forwarded to the provider
  describe('Property 4: recordMetric is forwarded to the provider', () => {
    it('forwards any metric name/value to newrelic.recordCustomEvent', () => {
      fc.assert(
        fc.property(fc.string({minLength: 1}), fc.float({min: -1e6, max: 1e6}), (name, value) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const mockNr = setupNewRelicGlobal();
          const adapter = new NewRelicAdapter();
          adapter.init(baseConfig);
          adapter.recordMetric(name, value);
          expect(mockNr.recordCustomEvent).toHaveBeenCalledWith(
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
          const mockNr = setupNewRelicGlobal();
          const adapter = new NewRelicAdapter();
          adapter.init(baseConfig);
          adapter.incrementCounter(name);
          expect(mockNr.recordCustomEvent).toHaveBeenCalledWith(
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
    it('never calls setUserId for any config', () => {
      fc.assert(
        fc.property(fc.string(), fc.string(), (appName, env) => {
          vi.clearAllMocks();
          (isBrowser as ReturnType<typeof vi.fn>).mockReturnValue(true);
          const mockNr = setupNewRelicGlobal() as ReturnType<typeof setupNewRelicGlobal> & {setUserId?: ReturnType<typeof vi.fn>};
          mockNr.setUserId = vi.fn();
          const adapter = new NewRelicAdapter();
          adapter.init({applicationName: appName, environment: env});
          expect(mockNr.setUserId).not.toHaveBeenCalled();
          // setCustomAttribute should only be called with 'environment', never with user-identifying keys
          const calls = mockNr.setCustomAttribute.mock.calls;
          for (const [key] of calls) {
            expect(key).not.toMatch(/user|userId|email|name/i);
          }
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
            const mockNr = setupNewRelicGlobal();
            mockNr.log.mockImplementation(() => {
              throw new Error('NR SDK error');
            });
            const adapter = new NewRelicAdapter();
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
          const mockNr = setupNewRelicGlobal();
          mockNr.recordCustomEvent.mockImplementation(() => {
            throw new Error('NR SDK error');
          });
          const adapter = new NewRelicAdapter();
          adapter.init(baseConfig);
          expect(() => adapter.recordMetric(name, value)).not.toThrow();
        }),
        {numRuns: 50}
      );
    });
  });
});
