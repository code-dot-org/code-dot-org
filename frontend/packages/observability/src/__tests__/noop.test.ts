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

    it('isConsented returns false', () => {
      expect(adapter.isConsented()).toBe(false);
      adapter.setConsented('user-123');
      expect(adapter.isConsented()).toBe(false);
    });

    it('shutdown resolves', async () => {
      await expect(adapter.shutdown()).resolves.toBeUndefined();
    });
  });
});
