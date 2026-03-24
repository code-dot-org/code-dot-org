import * as fc from 'fast-check';
import {NoOpAdapter} from '../noop';
import type {RumClient} from '../../types';

describe('NoOpAdapter', () => {
  let adapter: NoOpAdapter;

  beforeEach(() => {
    adapter = new NoOpAdapter();
  });

  // Unit tests — 4.2
  describe('unit tests', () => {
    it('implements the RumClient interface', () => {
      const client: RumClient = adapter;
      expect(typeof client.init).toBe('function');
      expect(typeof client.recordLog).toBe('function');
      expect(typeof client.recordMetric).toBe('function');
      expect(typeof client.incrementCounter).toBe('function');
      expect(typeof client.shutdown).toBe('function');
    });

    it('init does not throw', () => {
      expect(() =>
        adapter.init({applicationName: 'test', environment: 'test'})
      ).not.toThrow();
    });

    it('recordLog does not throw', () => {
      expect(() => adapter.recordLog('info', 'hello')).not.toThrow();
      expect(() => adapter.recordLog('warn', 'hello', {key: 'val'})).not.toThrow();
      expect(() => adapter.recordLog('error', 'hello')).not.toThrow();
    });

    it('recordMetric does not throw', () => {
      expect(() => adapter.recordMetric('my.metric', 42)).not.toThrow();
      expect(() =>
        adapter.recordMetric('my.metric', 42, {unit: 'ms', dimensions: {env: 'prod'}})
      ).not.toThrow();
    });

    it('incrementCounter does not throw', () => {
      expect(() => adapter.incrementCounter('my.counter')).not.toThrow();
      expect(() =>
        adapter.incrementCounter('my.counter', {env: 'prod'})
      ).not.toThrow();
    });

    it('shutdown does not throw', () => {
      expect(() => adapter.shutdown()).not.toThrow();
    });

    it('makes no external calls', () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());
      adapter.init({applicationName: 'test', environment: 'test'});
      adapter.recordLog('info', 'msg');
      adapter.recordMetric('m', 1);
      adapter.incrementCounter('c');
      adapter.shutdown();
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  // Property-based tests — 4.3
  // Feature: observability, Property 8: No-Op Adapter is always safe
  describe('Property 8: no-op adapter is always safe for any method call sequence', () => {
    it('never throws for any sequence of calls', () => {
      const levelArb = fc.constantFrom('info' as const, 'warn' as const, 'error' as const);
      const configArb = fc.record({
        applicationName: fc.string(),
        environment: fc.string(),
        version: fc.option(fc.string(), {nil: undefined}),
      });
      const callArb = fc.oneof(
        configArb.map(cfg => (a: NoOpAdapter) => a.init(cfg)),
        fc.tuple(levelArb, fc.string()).map(
          ([lvl, msg]) =>
            (a: NoOpAdapter) =>
              a.recordLog(lvl, msg)
        ),
        fc.tuple(fc.string(), fc.float({min: -1e6, max: 1e6})).map(
          ([name, val]) =>
            (a: NoOpAdapter) =>
              a.recordMetric(name, val)
        ),
        fc.string().map(name => (a: NoOpAdapter) => a.incrementCounter(name)),
        fc.constant((a: NoOpAdapter) => a.shutdown())
      );

      fc.assert(
        fc.property(fc.array(callArb, {minLength: 0, maxLength: 20}), calls => {
          const a = new NoOpAdapter();
          expect(() => {
            for (const call of calls) call(a);
          }).not.toThrow();
        }),
        {numRuns: 100}
      );
    });
  });

  // Feature: observability, Property 1: NoOpAdapter implements complete RumClient
  describe('Property 1: NoOpAdapter implements all required RumClient methods', () => {
    it('has all required methods for any instantiation', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const client: RumClient = new NoOpAdapter();
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
});
