import type {ObservabilityConfig} from '../types';
import {BaseAdapter} from './base';

/**
 * No-op adapter — performs no instrumentation and makes no external calls.
 * Extends BaseAdapter so it inherits the correct isConsented/sampling/consent
 * queue behaviour without duplicating any logic.
 * Requirements: 2.2, 8.6, 9.6
 */
export class NoopAdapter extends BaseAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected initProvider(_config: ObservabilityConfig): void {
    // no-op — intentionally does nothing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recordError(_error: unknown, _context?: Record<string, unknown>): void {
    // no-op
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
