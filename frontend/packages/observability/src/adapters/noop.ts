import type {RumClient, RumClientConfig} from '../types';

/**
 * No-op adapter — performs no instrumentation.
 * Used when rumProvider is 'none' or as a safe fallback.
 */
export class NoOpAdapter implements RumClient {
  init(_config: RumClientConfig): void {}

  recordLog(
    _level: 'info' | 'warn' | 'error',
    _message: string,
    _context?: Record<string, unknown>
  ): void {}

  recordMetric(
    _name: string,
    _value: number,
    _options?: {unit?: string; dimensions?: Record<string, string>}
  ): void {}

  incrementCounter(
    _name: string,
    _dimensions?: Record<string, string>
  ): void {}

  shutdown(): void {}
}
