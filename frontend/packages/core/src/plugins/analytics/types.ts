/** Runtime analytics configuration, read from the app-config meta tag. */
export interface AnalyticsConfig {
  provider: 'statsig' | 'none';
  statsig?: {clientKey: string};
}

/** Anonymous session dimensions, resolved once at boot. */
export interface AnalyticsSession {
  /** Undefined when consent withholds persistence, leaving the provider to mint its own. */
  stableId: string | undefined;
  enabledExperiments: string[];
  geRegion: string | null;
}

/** Signed-in identity attached to subsequent events. */
export interface AnalyticsUser {
  userId: string;
  userType?: string;
  isVerifiedInstructor?: boolean;
  educatorRole?: string | null;
}

export interface AnalyticsClient {
  init(config: AnalyticsConfig, session: AnalyticsSession): void;
  sendEvent(name: string, payload?: Record<string, unknown>): void;
  setUser(user: AnalyticsUser | null): void;
  shutdown(): Promise<void>;
}
