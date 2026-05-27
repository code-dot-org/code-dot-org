/**
 * Runtime config for the analytics plugin. Parsed by `SiteConfig` from the
 * `analytics` slot of the Rails-injected `<meta name="app-config">`. When
 * `provider` is `'none'` (or absent) the plugin remains a no-op.
 */
export interface AnalyticsConfig {
  provider: 'statsig' | 'none';
  statsig?: {
    /** Client SDK key for analytics + experiments. */
    sdkKey?: string;
    /** Separate SDK key for the session-replay client (Statsig segments these). */
    sessionReplaySdkKey?: string;
    /** Enable Statsig's auto-capture web analytics. Default off. */
    autoCapture?: boolean;
    /** Enable Statsig session replay. Default off. */
    sessionReplay?: boolean;
  };
}

/** User identification attached to the analytics session. */
export interface AnalyticsUser {
  userId?: string;
  userType?: string;
  isVerifiedInstructor?: boolean;
  educatorRole?: string;
  enabledExperiments?: string[];
}

/**
 * Event props accepted by `trackEvent`. Statsig accepts any primitive and
 * GTM's dataLayer accepts the same — keeping the surface uniform between
 * the two plugins so callers don't stringify by hand.
 */
export type EventProps = Record<string, string | number | boolean>;

/**
 * Minimal contract any backend implements. Mirrors the observability
 * adapter contract: providers get a single chance to `init`, then receive
 * `trackEvent`/`setUser` calls until `shutdown`. Pre-init calls are
 * buffered by the `DeferredAdapter`.
 */
export interface AnalyticsClient {
  init(config: AnalyticsConfig): Promise<void>;
  trackEvent(name: string, props?: EventProps): void;
  setUser(user: AnalyticsUser): Promise<void>;
  /** Returns the current value of an experiment parameter, or `defaultValue`. */
  getExperiment<T>(
    experimentName: string,
    parameter: string,
    defaultValue: T,
  ): T;
  /** Start session replay if the provider supports it. No-op otherwise. */
  startSessionReplay(): Promise<void>;
  stopSessionReplay(): void;
  shutdown(): Promise<void>;
  /**
   * Whether the live provider is wired up. Noop returns `false`; the
   * deferred buffer returns `true` (plugin is registered, SDK is loading).
   */
  isEnabled(): boolean;
}
