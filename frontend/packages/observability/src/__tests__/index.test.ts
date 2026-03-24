import * as fc from 'fast-check';
import {describe, expect, it, vi} from 'vitest';

// Mock all adapters so no real SDK calls happen.
// Each mock export must be a class (constructor function) so `new Adapter()` works.
vi.mock('../adapters/noop', () => {
  const NoOpAdapter = vi.fn(function (this: Record<string, unknown>) {
    this.init = vi.fn();
    this.recordLog = vi.fn();
    this.recordMetric = vi.fn();
    this.incrementCounter = vi.fn();
    this.shutdown = vi.fn();
  });
  return {NoOpAdapter};
});

vi.mock('../adapters/datadog', () => {
  const DatadogAdapter = vi.fn(function (this: Record<string, unknown>) {
    this.init = vi.fn();
    this.recordLog = vi.fn();
    this.recordMetric = vi.fn();
    this.incrementCounter = vi.fn();
    this.shutdown = vi.fn();
  });
  return {DatadogAdapter};
});

vi.mock('../adapters/newrelic', () => {
  const NewRelicAdapter = vi.fn(function (this: Record<string, unknown>) {
    this.init = vi.fn();
    this.recordLog = vi.fn();
    this.recordMetric = vi.fn();
    this.incrementCounter = vi.fn();
    this.shutdown = vi.fn();
  });
  return {NewRelicAdapter};
});

vi.mock('../adapters/sentry', () => {
  const SentryAdapter = vi.fn(function (this: Record<string, unknown>) {
    this.init = vi.fn();
    this.recordLog = vi.fn();
    this.recordMetric = vi.fn();
    this.incrementCounter = vi.fn();
    this.shutdown = vi.fn();
  });
  return {SentryAdapter};
});

import {createRumClient} from '../index';
import {NoOpAdapter} from '../adapters/noop';
import {DatadogAdapter} from '../adapters/datadog';
import {NewRelicAdapter} from '../adapters/newrelic';
import {SentryAdapter} from '../adapters/sentry';
import type {RumClient, RumProvider} from '../types';

const VALID_PROVIDERS: RumProvider[] = ['none', 'datadog', 'newrelic', 'sentry'];

describe('createRumClient', () => {
  // Unit tests — 8.2
  describe('unit tests', () => {
    it('returns NoOpAdapter for provider "none"', () => {
      const client = createRumClient('none');
      expect(NoOpAdapter).toHaveBeenCalledTimes(1);
      expect(client).toBeDefined();
    });

    it('returns DatadogAdapter for provider "datadog"', () => {
      const client = createRumClient('datadog');
      expect(DatadogAdapter).toHaveBeenCalledTimes(1);
      expect(client).toBeDefined();
    });

    it('returns NewRelicAdapter for provider "newrelic"', () => {
      const client = createRumClient('newrelic');
      expect(NewRelicAdapter).toHaveBeenCalledTimes(1);
      expect(client).toBeDefined();
    });

    it('returns SentryAdapter for provider "sentry"', () => {
      const client = createRumClient('sentry');
      expect(SentryAdapter).toHaveBeenCalledTimes(1);
      expect(client).toBeDefined();
    });

    it('throws for unknown provider', () => {
      expect(() => createRumClient('unknown' as RumProvider)).toThrow(
        /Unsupported RUM provider: "unknown"/
      );
    });

    it('thrown error message contains the unsupported value', () => {
      const badProvider = 'amplitude';
      expect(() => createRumClient(badProvider as RumProvider)).toThrow(badProvider);
    });

    it('returned client implements all RumClient methods', () => {
      for (const provider of VALID_PROVIDERS) {
        const client: RumClient = createRumClient(provider);
        expect(typeof client.init).toBe('function');
        expect(typeof client.recordLog).toBe('function');
        expect(typeof client.recordMetric).toBe('function');
        expect(typeof client.incrementCounter).toBe('function');
        expect(typeof client.shutdown).toBe('function');
      }
    });
  });

  // Property-based tests — 8.2
  // Feature: observability, Property 1: Factory returns a complete RumClient for every valid provider
  // **Validates: Requirements 1.2**
  describe('Property 1: factory returns a complete RumClient for every valid provider', () => {
    it('returns an object with all required RumClient methods for any valid provider', () => {
      const providerArb = fc.constantFrom(...VALID_PROVIDERS);
      fc.assert(
        fc.property(providerArb, provider => {
          const client: RumClient = createRumClient(provider);
          expect(typeof client.init).toBe('function');
          expect(typeof client.recordLog).toBe('function');
          expect(typeof client.recordMetric).toBe('function');
          expect(typeof client.incrementCounter).toBe('function');
          expect(typeof client.shutdown).toBe('function');
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 2: Unknown provider values always throw
  // **Validates: Requirements 1.2**
  describe('Property 2: unknown provider values always throw', () => {
    it('throws an Error whose message contains the unsupported value', () => {
      // Generate strings that are NOT valid providers
      const invalidProviderArb = fc
        .string()
        .filter(s => !VALID_PROVIDERS.includes(s as RumProvider));

      fc.assert(
        fc.property(invalidProviderArb, badProvider => {
          expect(() => createRumClient(badProvider as RumProvider)).toThrow(
            new RegExp(badProvider.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          );
        }),
        {numRuns: 100}
      );
    });
  });
});
