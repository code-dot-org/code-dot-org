import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from '../types';

type DeferredOperation = (client: AnalyticsClient) => void;
const MAX_PENDING_OPERATIONS = 1000;

/** Buffers calls until a concrete client exists, then replays them in order. */
export class DeferredAdapter implements AnalyticsClient {
  private delegate: AnalyticsClient | null = null;
  private pendingOperations: DeferredOperation[] = [];

  init(config: AnalyticsConfig, session: AnalyticsSession): void {
    this.enqueue(client => client.init(config, session));
  }

  sendEvent(name: string, payload?: Record<string, unknown>): void {
    this.enqueue(client => client.sendEvent(name, payload));
  }

  setUser(user: AnalyticsUser | null): void {
    this.enqueue(client => client.setUser(user));
  }

  shutdown(): Promise<void> {
    return this.delegate?.shutdown() ?? Promise.resolve();
  }

  /** Installs the real client and replays everything buffered so far. */
  flushTo(client: AnalyticsClient): void {
    const pendingOperations = this.pendingOperations;
    this.pendingOperations = [];
    this.delegate = client;

    for (const operation of pendingOperations) {
      operation(client);
    }
  }

  private enqueue(operation: DeferredOperation): void {
    if (this.delegate) {
      operation(this.delegate);
      return;
    }

    if (this.pendingOperations.length >= MAX_PENDING_OPERATIONS) {
      this.pendingOperations.shift();
    }

    this.pendingOperations.push(operation);
  }
}
