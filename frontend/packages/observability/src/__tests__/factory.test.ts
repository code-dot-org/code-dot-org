import * as fc from 'fast-check';

import {createObservabilityClient} from '../factory';

describe('createObservabilityClient', () => {
  // Feature: observability, Property 1: Factory returns a valid client for all valid providers and configs
  it('Property 1: returns a valid ObservabilityClient for all valid providers and configs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('sentry' as const, 'none' as const),
        fc.record({
          sampling: fc.record({
            errorSampleRate: fc.float({min: 0, max: 1}),
            tracesSampleRate: fc.float({min: 0, max: 1}),
          }),
          tracePropagationTargets: fc.array(fc.string()),
        }),
        (provider, config) => {
          const client = createObservabilityClient(provider, config);
          expect(typeof client.init).toBe('function');
          expect(typeof client.recordError).toBe('function');
          expect(typeof client.setConsented).toBe('function');
          expect(typeof client.isConsented).toBe('function');
          expect(typeof client.shutdown).toBe('function');
        },
      ),
      {numRuns: 100},
    );
  });

  // Feature: observability, Property 2: Unrecognized provider throws a descriptive error
  it('Property 2: throws a descriptive error for unrecognized providers', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => s !== 'sentry' && s !== 'none' && s.length > 0),
        badProvider => {
          let thrown: unknown;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createObservabilityClient(badProvider as any);
          } catch (e) {
            thrown = e;
          }
          expect(thrown).toBeInstanceOf(Error);
          expect((thrown as Error).message).toContain(badProvider);
        },
      ),
      {numRuns: 100},
    );
  });

  // Unit tests (Task 4.3)
  describe('unit tests', () => {
    it('returns a no-op client when called with no arguments', () => {
      const client = createObservabilityClient();
      expect(typeof client.init).toBe('function');
      expect(typeof client.recordError).toBe('function');
      expect(typeof client.setConsented).toBe('function');
      expect(typeof client.isConsented).toBe('function');
      expect(typeof client.shutdown).toBe('function');
      expect(client.isConsented()).toBe(false);
    });

    it('returns a no-op client for provider "none"', () => {
      const client = createObservabilityClient('none');
      expect(client.isConsented()).toBe(false);
    });

    it('returns a client with all required methods for provider "sentry"', () => {
      const client = createObservabilityClient('sentry');
      expect(typeof client.init).toBe('function');
      expect(typeof client.recordError).toBe('function');
      expect(typeof client.setConsented).toBe('function');
      expect(typeof client.isConsented).toBe('function');
      expect(typeof client.shutdown).toBe('function');
    });

    it('throws for an unknown provider', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => createObservabilityClient('datadog' as any)).toThrow(
        'Unsupported observability provider: "datadog"',
      );
    });
  });
});
