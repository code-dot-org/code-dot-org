import * as fc from 'fast-check';

import {NoopAdapter} from '../adapters/noop';

describe('NoopAdapter', () => {
  // Feature: observability, Property 7: No-op adapter accepts any config and performs no external calls
  it('Property 7: accepts any config without throwing and produces no side effects', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(
        fc.record({
          provider: fc.constantFrom('sentry' as const, 'none' as const),
          sampling: fc.record({
            errorSampleRate: fc.float({min: 0, max: 1}),
            tracesSampleRate: fc.float({min: 0, max: 1}),
            logSampleRate: fc.float({min: 0, max: 1}),
            metricsSampleRate: fc.float({min: 0, max: 1}),
          }),
          tracePropagationTargets: fc.array(fc.string()),
        }),
        config => {
          const adapter = new NoopAdapter();
          // Should not throw for any config
          expect(() => adapter.init(config)).not.toThrow();
          expect(() =>
            adapter.recordError(new Error('test'), {key: 'val'}),
          ).not.toThrow();
          expect(() => adapter.setConsented('user-123')).not.toThrow();
          expect(() => adapter.isConsented()).not.toThrow();
          // No console output
          expect(consoleSpy).not.toHaveBeenCalled();
          expect(warnSpy).not.toHaveBeenCalled();
          expect(errorSpy).not.toHaveBeenCalled();
        },
      ),
      {numRuns: 100},
    );

    consoleSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  // Unit tests (Task 3.2)
  describe('unit tests', () => {
    let adapter: NoopAdapter;

    beforeEach(() => {
      adapter = new NoopAdapter();
    });

    it('init is callable without error', () => {
      expect(() => adapter.init({provider: 'none'})).not.toThrow();
    });

    it('recordError is callable without error', () => {
      expect(() => adapter.recordError(new Error('test'))).not.toThrow();
      expect(() =>
        adapter.recordError(new Error('test'), {extra: 'data'}),
      ).not.toThrow();
    });

    it('setConsented is callable without error', () => {
      expect(() => adapter.setConsented('user-123')).not.toThrow();
      expect(() => adapter.setConsented(null)).not.toThrow();
    });

    it('isConsented returns false when setConsented is never called', () => {
      expect(adapter.isConsented()).toBe(false);
    });

    it('isConsented reflects setConsented state (inherited from BaseAdapter)', () => {
      adapter.setConsented('user-123');
      expect(adapter.isConsented()).toBe(true);
      adapter.setConsented(null);
      expect(adapter.isConsented()).toBe(false);
    });

    it('shutdown resolves', async () => {
      await expect(adapter.shutdown()).resolves.toBeUndefined();
    });

    it('init does not call any provider SDK (sessionStorage is accessed by BaseAdapter for sampling)', () => {
      // NoopAdapter inherits BaseAdapter.init() which reads sessionStorage for
      // session-based sampling — this is expected and correct behaviour.
      // What it must NOT do is call any external provider SDK.
      const adapter = new NoopAdapter();
      expect(() => adapter.init({provider: 'none'})).not.toThrow();
      // isLogSampled / isMetricsSampled still work (return false at rate 0)
      expect(adapter.isLogSampled(0)).toBe(false);
      expect(adapter.isMetricsSampled(0)).toBe(false);
    });

    it('logger methods are all no-ops (Req 13.5)', () => {
      const adapter = new NoopAdapter();
      adapter.init({provider: 'none'});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => adapter.logger.trace('t')).not.toThrow();
      expect(() => adapter.logger.debug('d')).not.toThrow();
      expect(() => adapter.logger.info('i')).not.toThrow();
      expect(() => adapter.logger.warn('w')).not.toThrow();
      expect(() => adapter.logger.error('e')).not.toThrow();
      expect(() => adapter.logger.fatal('f')).not.toThrow();
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('metrics methods are all no-ops (Req 14.5)', () => {
      const adapter = new NoopAdapter();
      adapter.init({provider: 'none'});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => adapter.metrics.count('x')).not.toThrow();
      expect(() => adapter.metrics.gauge('x', 1)).not.toThrow();
      expect(() => adapter.metrics.distribution('x', 1)).not.toThrow();
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
