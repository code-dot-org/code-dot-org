import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from '../types';

const PREFIX = '[STATSIG ANALYTICS EVENT]';

/** Transmits nothing and logs what a transmitting environment would send. */
export class ConsoleAdapter implements AnalyticsClient {
  init(config: AnalyticsConfig, session: AnalyticsSession): void {
    console.log(`${PREFIX}: Statsig Stable ID: ${session.stableId}`);
    if (!config.user) return;
    console.log(
      `${PREFIX}: Seeded identity: userId: ${config.user.userId}, userType: ${config.user.userType}`,
    );
  }

  sendEvent(name: string, payload?: Record<string, unknown>): void {
    console.log(`${PREFIX}: ${name}. Payload: ${JSON.stringify({payload})}`);
  }

  setUser(user: AnalyticsUser | null): void {
    if (!user) return;
    console.log(
      `${PREFIX}: User properties: userId: ${user.userId}, userType: ${user.userType}, isVerifiedInstructor: ${user.isVerifiedInstructor}, signInState: true`,
    );
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
