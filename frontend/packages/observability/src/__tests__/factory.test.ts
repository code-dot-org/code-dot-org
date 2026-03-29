import * as fc from 'fast-check';

import {createObservabilityClient} from '../factory';

describe('createObservabilityClient', () => {
  // Feature: observability, Property 1: Factory returns a valid client for all valid providers and configs
  it('Property 1: returns a valid ObservabilityClient for all valid providers and configs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('sentry' as const, 'none' as const),
        fc.record({
          sampling: fc.record({
            errorSampleRate: fc.float({min: 0, max: 1}),
            tracesSampleRate: fc.float({min: 0, max: 1}),
          }),
          tracePropagationTargets: fc.array(fc.string()),
        }),
        async (provider, config) => {
          const client = await createObservabilityClient(provider, config);
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
  it('Property 2: throws a descriptive error for unrecognized providers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string().filter(s => s !== 'sentry' && s !== 'none' && s.length > 0),
        async badProvider => {
          await expect(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createObservabilityClient(badProvider as any),
          ).rejects.toThrow(badProvider);
        },
      ),
      {numRuns: 100},
    );
  });

  // Unit tests (Task 4.3)
  describe('unit tests', () => {
    it('returns a no-op client when called with no arguments', async () => {
      const client = await createObservabilityClient();
      expect(typeof client.init).toBe('function');
      expect(typeof client.recordError).toBe('function');
      expect(typeof client.setConsented).toBe('function');
      expect(typeof client.isConsented).toBe('function');
      expect(typeof client.shutdown).toBe('function');
      expect(client.isConsented()).toBe(false);
    });

    it('returns a no-op client for provider "none"', async () => {
      const client = await createObservabilityClient('none');
      expect(client.isConsented()).toBe(false);
    });

    it('returns a client with all required methods for provider "sentry"', async () => {
      const client = await createObservabilityClient('sentry');
      expect(typeof client.init).toBe('function');
      expect(typeof client.recordError).toBe('function');
      expect(typeof client.setConsented).toBe('function');
      expect(typeof client.isConsented).toBe('function');
      expect(typeof client.shutdown).toBe('function');
    });

    it('throws for an unknown provider', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createObservabilityClient('datadog' as any),
      ).rejects.toThrow('Unsupported observability provider: "datadog"');
    });
  });
});
