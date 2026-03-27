import * as fc from 'fast-check';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {SentryAdapter} from '../adapters/sentry';

// Mock @sentry/browser so tests don't need a real DSN or network
vi.mock('@sentry/browser', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  close: vi.fn().mockResolvedValue(undefined),
}));

// eslint-disable-next-line import-x/order -- must come after vi.mock() for Vitest hoisting
import * as Sentry from '@sentry/browser';

describe('SentryAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      // Temporarily remove window
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

    it('tracePropagationTargets defaults to same-origin pattern when not set (Req 9.5)', () => {
      const adapter = new SentryAdapter();
      adapter.init({
        provider: 'sentry',
        sentry: {dsn: 'https://test@sentry.io/1'},
      });
      const call = vi.mocked(Sentry.init).mock.calls[0][0] as {
        tracePropagationTargets: unknown[];
      };
      expect(call.tracePropagationTargets).toHaveLength(1);
      expect(call.tracePropagationTargets[0]).toBeInstanceOf(RegExp);
      // Should match /foo but not //foo
      const pattern = call.tracePropagationTargets[0] as RegExp;
      expect(pattern.test('/api/v1')).toBe(true);
      expect(pattern.test('//external.com')).toBe(false);
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
  });
});
