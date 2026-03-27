import type {ObservabilityClient, ObservabilityConfig} from '../types';

/**
 * No-op adapter that satisfies the ObservabilityClient interface
 * but performs no instrumentation and makes no external calls.
 * This is the default when no provider is configured.
 * Requirements: 2.2, 8.6, 9.6
 */
export class NoopAdapter implements ObservabilityClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(_config: ObservabilityConfig): void {
    // no-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recordError(_error: unknown, _context?: Record<string, unknown>): void {
    // no-op
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setConsented(_userId: string | null): void {
    // no-op
  }

  isConsented(): boolean {
    return false;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
