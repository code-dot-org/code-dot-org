import * as Sentry from '@sentry/browser';

import type {ObservabilityClient, ObservabilityConfig} from '../types';

/**
 * Internal state for the SentryAdapter.
 */
interface AdapterState {
  initialized: boolean;
  consentedUserId: string | null | undefined; // undefined = setConsented never called
  pendingConsent: string | null | undefined; // queued before init
}

/**
 * SentryAdapter wraps @sentry/browser and implements ObservabilityClient.
 * All sessions are anonymous by default; user linkage requires setConsented().
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4, 5.1, 5.2, 5.4, 5.5, 6.2, 6.4, 8.2, 8.4, 9.2, 9.3, 9.5
 */
export class SentryAdapter implements ObservabilityClient {
  private state: AdapterState = {
    initialized: false,
    consentedUserId: undefined,
    pendingConsent: undefined,
  };

  /**
   * Initialize the Sentry SDK.
   * Guards on typeof window — safe in SSR environments.
   * On failure, logs a warning and degrades to no-op behavior.
   */
  init(config: ObservabilityConfig): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      Sentry.init({
        dsn: config.sentry?.dsn,
        sendDefaultPii: false,
        sampleRate: config.sampling?.errorSampleRate ?? 1.0,
        tracesSampleRate: config.sampling?.tracesSampleRate ?? 0,
        tracePropagationTargets: config.tracePropagationTargets ?? [
          /^\/(?!\/)/,
        ],
      });

      this.state.initialized = true;

      // Apply any queued setConsented call
      if (this.state.pendingConsent !== undefined) {
        this._applyConsent(this.state.pendingConsent);
        this.state.pendingConsent = undefined;
      }
    } catch (err) {
      console.warn(
        '[observability] SentryAdapter.init failed — degrading to no-op:',
        err,
      );
      // Mark as initialized so subsequent calls don't queue, but SDK is broken.
      // We leave initialized=false so recordError becomes a no-op too.
    }
  }

  /**
   * Record an error with optional context metadata.
   * No-op if not initialized. Never throws.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.state.initialized) {
      return;
    }
    try {
      Sentry.captureException(error, {extra: context});
    } catch (err) {
      console.warn('[observability] SentryAdapter.recordError failed:', err);
    }
  }

  /**
   * Associate the current session with a user ID.
   * If called before init(), queues the association.
   * Passing null or empty string removes any existing user association.
   */
  setConsented(userId: string | null): void {
    if (!this.state.initialized) {
      this.state.pendingConsent = userId;
      return;
    }
    this._applyConsent(userId);
  }

  /**
   * Returns true if a non-empty user ID is currently associated with the session.
   * Before init(), reflects the pending queued value.
   */
  isConsented(): boolean {
    const userId = this.state.initialized
      ? this.state.consentedUserId
      : this.state.pendingConsent !== undefined
        ? this.state.pendingConsent
        : this.state.consentedUserId;
    return userId !== null && userId !== undefined && userId !== '';
  }

  /**
   * Tear down the Sentry SDK and flush pending events.
   */
  shutdown(): Promise<void> {
    return Sentry.close().then(() => undefined);
  }

  private _applyConsent(userId: string | null): void {
    this.state.consentedUserId = userId;
    Sentry.setUser(userId ? {id: userId} : null);
  }
}
