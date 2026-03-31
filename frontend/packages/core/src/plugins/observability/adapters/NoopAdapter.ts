import type {ObservabilityConfig} from '../types';

import {BaseAdapter} from './BaseAdapter';

export class NoopAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
    void config;
  }

  recordError(error: unknown, context?: Record<string, unknown>): void {
    void error;
    void context;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
