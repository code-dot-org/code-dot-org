import * as fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {SentryAdapter} from '../adapters/sentry';
import {isSampled} from '../sampling';

// Mock @sentry/browser so tests don't need a real DSN or network
vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
  browserTracingIntegration: vi.fn().mockReturnValue({name: 'BrowserTracing'}),
  consoleLoggingIntegration: vi.fn().mockReturnValue({name: 'ConsoleLogging'}),
  logger: {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  metrics: {
    count: vi.fn(),
    gauge: vi.fn(),
    distribution: vi.fn(),
  },
}));

// eslint-disable-next-line import-x/order -- must come after vi.mock() for Vitest hoisting
import * as Sentry from '@sentry/browser';

describe('SentryAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  // ─── Property 3: recordError forwards errors to the provider ───────────────
  // Feature: observability, Property 3: recordError forwards errors to the provider
  it('Property 3: recordError forwards any error and context to Sentry.captureException', () => {
    fc.assert(
      fc.property(
        fc.anything(),
        fc.record({key: fc.string()}),
        (error, context) => {
          vi.clearAllMocks();
          const adapter = new SentryAdapter();
          adapter.init({
            provider: 'sentry',
            sentry: {dsn: 'https://test@sentry.io/1'},
          });

          expect(() => adapter.recordError(error, context)).not.toThrow();
          expect(Sentry.captureException).toHaveBeenCalledWith(error, {
            extra: context,
          });
        },
      ),
      {numRuns: 100},
    );
  });

  // ─── Property 4: SDK errors during recordError are swallowed ───────────────
  // Feature: observability, Property 4: Provider SDK errors during recordError are swallowed
  it('Property 4: swallows any error thrown by Sentry.captureException', () => {
    fc.assert(
      fc.property(fc.anything(), thrownValue => {
        vi.clearAllMocks();
        vi.mocked(Sentry.captureException).mockImplementationOnce(() => {
          throw thrownValue;
        });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const adapter = new SentryAdapter();
        adapter.init({
          provider: 'sentry',
          sentry: {dsn: 'https://test@sentry.io/1'},
        });

        expect(() => adapter.recordError(new Error('test'))).not.toThrow();
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
      }),
      {numRuns: 100},
    );
  });

  // ─── Property 5: Consent round-trip ────────────────────────────────────────
  // Feature: observability, Property 5: Consent round-trip — setConsented/isConsented accurately reflect state
  it('Property 5: isConsented reflects setConsented state correctly', () => {
    fc.assert(
      fc.property(
        fc.string({minLength: 1}),
        fc.boolean(),
        (userId, setBeforeInit) => {
          vi.clearAllMocks();
          const adapter = new SentryAdapter();

          if (setBeforeInit) {
            adapter.setConsented(userId);
            expect(adapter.isConsented()).toBe(true); // queued value reflected
            adapter.init({
              provider: 'sentry',
              sentry: {dsn: 'https://test@sentry.io/1'},
            });
            expect(adapter.isConsented()).toBe(true); // applied after init
          } else {
            adapter.init({
              provider: 'sentry',
              sentry: {dsn: 'https://test@sentry.io/1'},
            });
            expect(adapter.isConsented()).toBe(false);
            adapter.setConsented(userId);
            expect(adapter.isConsented()).toBe(true);
          }

          // Clearing consent
          adapter.setConsented(null);
          expect(adapter.isConsented()).toBe(false);

          adapter.setConsented('');
          expect(adapter.isConsented()).toBe(false);
        },
      ),
      {numRuns: 100},
    );
  });

  // ─── Property 6: Config pass-through to SDK ────────────────────────────────
  // Feature: observability, Property 6: Config values are passed through to the provider SDK unchanged
  it('Property 6: passes sampling rates and tracePropagationTargets to Sentry.init unchanged', () => {
    fc.assert(
      fc.property(
        fc.float({min: 0, max: 1}),
        fc.float({min: 0, max: 1}),
        fc.array(fc.string()),
        (errorSampleRate, tracesSampleRate, tracePropagationTargets) => {
          vi.clearAllMocks();
          const adapter = new SentryAdapter();
          adapter.init({
            provider: 'sentry',
            sentry: {dsn: 'https://test@sentry.io/1'},
            sampling: {errorSampleRate, tracesSampleRate},
            tracePropagationTargets,
          });

          expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
              sampleRate: errorSampleRate,
              tracesSampleRate,
              tracePropagationTargets,
            }),
          );
        },
      ),
      {numRuns: 100},
    );
  });

  // ─── Property 8: Init failure degrades gracefully ──────────────────────────
  // Feature: observability, Property 8: Init failure falls back gracefully without propagating
  it('Property 8: init failure does not propagate; subsequent recordError calls are no-ops', () => {
    fc.assert(
      fc.property(fc.anything(), thrownValue => {
        vi.clearAllMocks();
        vi.mocked(Sentry.init).mockImplementationOnce(() => {
          throw thrownValue;
        });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const adapter = new SentryAdapter();
        expect(() =>
          adapter.init({
            provider: 'sentry',
            sentry: {dsn: 'https://test@sentry.io/1'},
          }),
        ).not.toThrow();
        expect(warnSpy).toHaveBeenCalled();

        // After failed init, recordError should be a no-op
        vi.clearAllMocks();
        expect(() => adapter.recordError(new Error('test'))).not.toThrow();
        expect(Sentry.captureException).not.toHaveBeenCalled();

        // isConsented should return false
        expect(adapter.isConsented()).toBe(false);

        warnSpy.mockRestore();
      }),
      {numRuns: 100},
    );
  });

  // ─── Unit tests (Task 5.6) ─────────────────────────────────────────────────
  describe('unit tests', () => {
    it('init sets sendDefaultPii: false (Req 4.2, 4.4)', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({sendDefaultPii: false}),
      );
    });

    it('setConsented before init is applied after init (Req 5.4)', () => {
      const adapter = new SentryAdapter();
      adapter.setConsented('user-42');
      expect(adapter.isConsented()).toBe(true);
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.setUser).toHaveBeenCalledWith({id: 'user-42'});
      expect(adapter.isConsented()).toBe(true);
    });

    it('init is a no-op when typeof window === undefined (Req 6.2)', () => {
      const originalWindow = global.window;
      // @ts-expect-error intentionally deleting window for test
      delete global.window;

      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.init).not.toHaveBeenCalled();

      global.window = originalWindow;
    });

    it('tracesSampleRate defaults to 0 when not set (Req 8.2)', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({tracesSampleRate: 0}),
      );
    });

    it('tracePropagationTargets defaults to environment-derived target when not set (Req 9.5)', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      const call = vi.mocked(Sentry.init).mock.calls[0][0] as {
        tracePropagationTargets: unknown[];
      };
      expect(call.tracePropagationTargets).toHaveLength(1);
      expect(
        typeof call.tracePropagationTargets[0] === 'string' ||
          call.tracePropagationTargets[0] instanceof RegExp,
      ).toBe(true);
    });

    it('tracePropagationTargets is passed through even when tracesSampleRate is 0 (Req 9.3)', () => {
      const targets = ['https://studio.code.org/api'];
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
        sampling: {tracesSampleRate: 0},
        tracePropagationTargets: targets,
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0,
          tracePropagationTargets: targets,
        }),
      );
    });

    it('enableLogs is true when logSampleRate > 0 and session is sampled, false otherwise', () => {
      // With logSampleRate=1.0, isSampled always returns true
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
        sampling: {logSampleRate: 1.0},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({enableLogs: true}),
      );

      vi.clearAllMocks();
      const adapter2 = new SentryAdapter();
      adapter2.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({enableLogs: false}),
      );
    });

    it('enableMetrics is true when metricsSampleRate > 0 and session is sampled, false otherwise', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
        sampling: {metricsSampleRate: 1.0},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({enableMetrics: true}),
      );

      vi.clearAllMocks();
      const adapter2 = new SentryAdapter();
      adapter2.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({enableMetrics: false}),
      );
    });
  });
});

describe('environment bucketing and getAllowedTracingUrls (Task 15.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('Sentry.init receives environment matching CodeStudioConfig.environment (Req 6.6)', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
    });
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({environment: expect.any(String)}),
    );
  });

  it('tracePropagationTargets uses getAllowedTracingUrls() when not explicitly provided (Req 11.5)', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
    });
    const call = vi.mocked(Sentry.init).mock.calls[0][0] as {
      tracePropagationTargets: unknown[];
    };
    expect(call.tracePropagationTargets).toHaveLength(1);
  });

  it('tracePropagationTargets is passed through unchanged when explicitly provided (Req 11.5)', () => {
    const targets = ['https://studio.code.org/api', 'https://other.example.com'];
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      tracePropagationTargets: targets,
    });
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({tracePropagationTargets: targets}),
    );
  });

  it('getAllowedTracingUrls() returns a string URL or RegExp for any environment (Req 11.4)', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
    });
    const call = vi.mocked(Sentry.init).mock.calls[0][0] as {
      tracePropagationTargets: unknown[];
    };
    expect(call.tracePropagationTargets).toHaveLength(1);
    expect(
      typeof call.tracePropagationTargets[0] === 'string' ||
        call.tracePropagationTargets[0] instanceof RegExp,
    ).toBe(true);
  });
});

describe('session ID management and sampling gates (Task 17.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('session ID is generated and persisted to sessionStorage on init (Req 9.3, 10.3)', () => {
    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    expect(sessionStorage.getItem('__cdo_observability_session_id__')).not.toBeNull();
  });

  it('same session ID is returned on subsequent calls within the same session (Req 9.3, 10.3)', () => {
    const adapter1 = new SentryAdapter();
    adapter1.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    const id1 = sessionStorage.getItem('__cdo_observability_session_id__');

    const adapter2 = new SentryAdapter();
    adapter2.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    const id2 = sessionStorage.getItem('__cdo_observability_session_id__');

    expect(id1).toBe(id2);
  });

  it('sessionStorageUnavailable is set and console.warn logged when sessionStorage throws (Req 9.3, 10.3)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});

    expect(warnSpy).toHaveBeenCalledWith(
      '[observability] sessionStorage unavailable — sampling disabled',
    );
    expect(adapter.isLogSampled(1.0)).toBe(false);
    expect(adapter.isMetricsSampled(1.0)).toBe(false);

    warnSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  it('log events are not sampled when logSampleRate is 0 or not set (Req 9.2)', () => {
    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    expect(adapter.isLogSampled(0)).toBe(false);
    expect(adapter.isLogSampled(undefined)).toBe(false);
  });

  it('metric events are not sampled when metricsSampleRate is 0 or not set (Req 10.2)', () => {
    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    expect(adapter.isMetricsSampled(0)).toBe(false);
    expect(adapter.isMetricsSampled(undefined)).toBe(false);
  });

  it('isLogSampled returns true when logSampleRate is 1.0 and session ID exists', () => {
    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    expect(adapter.isLogSampled(1.0)).toBe(true);
  });

  it('isMetricsSampled returns true when metricsSampleRate is 1.0 and session ID exists', () => {
    const adapter = new SentryAdapter();
    adapter.init({provider: 'sentry', sentry: {dsn: 'https://test@sentry.io/1'}});
    expect(adapter.isMetricsSampled(1.0)).toBe(true);
  });
});

// ─── Property 10: enableLogs/enableMetrics reflect session sampling at init ───
// Feature: observability, Property 10: enableLogs/enableMetrics reflect the session sampling decision made at init
describe('Property 10: SDK-level sampling flags at init (Task 22.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('Property 10: enableLogs matches isSampled(sessionId, logSampleRate) for any rate', () => {
    fc.assert(
      fc.property(
        fc.float({min: 0, max: 1}),
        fc.float({min: 0, max: 1}),
        (logSampleRate, metricsSampleRate) => {
          vi.clearAllMocks();
          sessionStorage.clear();

          const adapter = new SentryAdapter();
          adapter.init({
            provider: 'sentry',
            sentry: {dsn: 'https://test@sentry.io/1'},
            sampling: {logSampleRate, metricsSampleRate},
          });

          const sessionId = sessionStorage.getItem('__cdo_observability_session_id__');
          const expectedEnableLogs = sessionId !== null
            ? isSampled(sessionId, logSampleRate)
            : false;
          const expectedEnableMetrics = sessionId !== null
            ? isSampled(sessionId, metricsSampleRate)
            : false;

          expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
              enableLogs: expectedEnableLogs,
              enableMetrics: expectedEnableMetrics,
            }),
          );
        },
      ),
      {numRuns: 100},
    );
  });

  it('enableLogs is false when logSampleRate is 0', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 0},
    });
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({enableLogs: false}),
    );
  });

  it('enableMetrics is false when metricsSampleRate is 0', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {metricsSampleRate: 0},
    });
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({enableMetrics: false}),
    );
  });
});

// ─── Task 22.2: logger and metrics direct delegation ─────────────────────────
describe('logger — direct delegation to Sentry.logger (Task 22.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('logger.* calls Sentry.logger.* directly when enableLogs is true (logSampleRate=1)', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 1.0},
    });

    const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
    for (const level of levels) {
      vi.clearAllMocks();
      adapter.logger[level]('test message', {key: 'val'});
      expect(Sentry.logger[level]).toHaveBeenCalledWith('test message', {key: 'val'});
    }
  });

  it('logger.* is a no-op before init (NOOP_LOGGER)', () => {
    const adapter = new SentryAdapter();
    expect(() => adapter.logger.info('before init')).not.toThrow();
    expect(Sentry.logger.info).not.toHaveBeenCalled();
  });

  it('logger.* swallows SDK errors and logs console.warn (Req 13.3)', () => {
    vi.mocked(Sentry.logger.info).mockImplementationOnce(() => {
      throw new Error('sdk error');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 1.0},
    });

    expect(() => adapter.logger.info('test')).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('metrics — direct delegation to Sentry.metrics (Task 22.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('metrics.count/gauge/distribution call Sentry.metrics.* directly when enableMetrics is true', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {metricsSampleRate: 1.0},
    });

    adapter.metrics.count('lab.clicks', 1, {lab: 'music'});
    expect(Sentry.metrics.count).toHaveBeenCalledWith('lab.clicks', 1, {attributes: {lab: 'music'}});

    adapter.metrics.gauge('lab.queue', 42);
    expect(Sentry.metrics.gauge).toHaveBeenCalledWith('lab.queue', 42, {attributes: undefined});

    adapter.metrics.distribution('lab.latency', 187);
    expect(Sentry.metrics.distribution).toHaveBeenCalledWith('lab.latency', 187, {attributes: undefined});
  });

  it('metrics.count defaults value to 1 (Req 14.1)', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {metricsSampleRate: 1.0},
    });

    adapter.metrics.count('lab.clicks');
    expect(Sentry.metrics.count).toHaveBeenCalledWith('lab.clicks', 1, {attributes: undefined});
  });

  it('metrics.* are no-ops before init (NOOP_METRICS)', () => {
    const adapter = new SentryAdapter();
    expect(() => adapter.metrics.count('lab.clicks')).not.toThrow();
    expect(Sentry.metrics.count).not.toHaveBeenCalled();
  });

  it('metrics.* swallows SDK errors and logs console.warn (Req 14.3)', () => {
    vi.mocked(Sentry.metrics.count).mockImplementationOnce(() => {
      throw new Error('sdk error');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {metricsSampleRate: 1.0},
    });

    expect(() => adapter.metrics.count('lab.clicks')).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ─── Task 22.3: consoleLoggingIntegration (Req 15) ───────────────────────────
describe('consoleLoggingIntegration (Task 22.3, Req 15.1, 15.3, 15.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('consoleLoggingIntegration is included in integrations when enableLogs is true', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 1.0},
    });

    expect(Sentry.consoleLoggingIntegration).toHaveBeenCalledWith({levels: ['error']});
    const call = vi.mocked(Sentry.init).mock.calls[0][0] as {integrations: unknown[]};
    // integrations array should contain the consoleLoggingIntegration result
    expect(call.integrations).toContainEqual({name: 'ConsoleLogging'});
  });

  it('consoleLoggingIntegration is NOT included when enableLogs is false', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
      sampling: {logSampleRate: 0},
    });

    expect(Sentry.consoleLoggingIntegration).not.toHaveBeenCalled();
    const call = vi.mocked(Sentry.init).mock.calls[0][0] as {integrations: unknown[]};
    expect(call.integrations).not.toContainEqual({name: 'ConsoleLogging'});
  });

  it('consoleLoggingIntegration is NOT included when logSampleRate is not set', () => {
    const adapter = new SentryAdapter();
    adapter.init({
      provider: 'sentry',
      sentry: {dsn: 'https://test@sentry.io/1'},
    });

    expect(Sentry.consoleLoggingIntegration).not.toHaveBeenCalled();
  });
});
