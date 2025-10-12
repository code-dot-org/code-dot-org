import {StatsigClient} from '@statsig/js-client';
import type {StatsigUser, AnyStatsigOptions} from '@statsig/js-client';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

import {
  getEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
} from './environment';
import * as experiments from './experiments';
import * as NewRelicReporter from './NewRelicReporter';
import {
  getUserID,
  getUserType,
  getStableId,
  formatUserId,
} from './statsigHelpers';

export interface CustomPayload {
  enabledExperiments: string[];
  userType?: string;
  isVerifiedInstructor?: boolean;
  educatorRole?: string;
}

export interface StatsigPayload extends StatsigUser {
  custom: CustomPayload & StatsigUser['custom'];
  customIDs: {
    stableID?: string;
  };
}

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;
const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

export class StatsigReporter {
  apiKey: string;
  stableID?: string;
  user: StatsigPayload;
  options: AnyStatsigOptions;
  localMode: boolean;
  statsigClient?: StatsigClient;

  constructor() {
    // stableID is set as a cookie in application_controller.rb. However in a
    // the rare case we are running outside of the application layout,
    // set stableID as a cookie here if it doesn't exist.
    this.stableID = getStableId();
    this.log(`Statsig Stable ID: ${this.stableID}`);
    const user: StatsigPayload = {
      custom: {
        enabledExperiments: experiments.getEnabledExperiments(),
        /*geRegion: getGlobalEditionRegion(),*/
      },
      customIDs: {stableID: this.stableID},
    };

    const user_id = getUserID();
    const user_type = getUserType();

    if (user_id) {
      user.userID = formatUserId(user_id);
      user.custom.userType = user_type;
    }
    this.user = user;

    const apiElement = (typeof document !== 'undefined' ? document.querySelector(
      'script[data-statsig-api-client-key]'
    ) : undefined) as (HTMLElement | undefined);
    this.apiKey = apiElement?.dataset?.statsigApiClientKey || '';

    const managedTestEnvironmentElement = (typeof document !== 'undefined' ? document.querySelector(
      'script[data-managed-test-server]'
    ) : undefined) as HTMLElement | undefined;
    const managedTestEnvironment = managedTestEnvironmentElement?.dataset?.managedTestServer === 'true';
    this.localMode = !(
      isProductionEnvironment() ||
      managedTestEnvironment ||
      process.env.STATSIG_LOCAL_MODE_OFF
    );
    this.options = {
      environment: {tier: getEnvironment()},
    };

    this.initialize(this.apiKey, this.user, this.options);
  }

  // This user object will potentially update via a setUserProperties call
  // (below) from current user redux
  async initialize(apiKey: string, user?: StatsigPayload, options?: AnyStatsigOptions): Promise<void> {
    user ||= this.user;
    options ||= this.options;

    if (this.shouldPutRecord(ALWAYS_SEND)) {
      this.statsigClient = new StatsigClient(apiKey, user, options);
      await this.statsigClient.initializeAsync();
    }
  }

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  async setUserProperties({
    userId,
    userType,
    isVerifiedInstructor,
    enabledExperiments,
    educatorRole,
  }: CustomPayload & {userId: string}): Promise<void> {
    const formattedUserId = formatUserId(userId);
    const user = {
      userID: formattedUserId,
      custom: {
        userType,
        isVerifiedInstructor,
        enabledExperiments,
        educatorRole,
      },
    };
    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, isVerifiedInstructor: ${isVerifiedInstructor}, signInState: ${!!userId}`
      );
    } else {
      await this.statsigClient?.updateUserAsync(user);
    }
  }

  sendEvent(eventName: string, payload: Record<string, string>) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      if (!eventName) {
        NewRelicReporter.addPageAction(
          NewRelicReporter.PageAction.NoValidStatsigEventNameError,
          {
            payload,
          }
        );
        this.statsigClient?.logEvent(NO_EVENT_NAME, NO_EVENT_NAME, payload);
      } else {
        // Statsig expects a name, value and data. Because we are unifying this
        // with our Amplitude logging, we are bypassing the 'value' and sending
        // event name twice. If we want to use this field moving forward, we
        // will need to refactor all AnalyticsReporting event calls accordingly.
        this.statsigClient?.logEvent(eventName, eventName, payload);
      }
    } else {
      this.log(
        `${eventName}. Payload: ${JSON.stringify({
          payload,
        })}`
      );
    }
  }

  log(message: string) {
    if (isDevelopmentEnvironment()) {
      console.log(`[STATSIG ANALYTICS EVENT]: ${message}`);
    }
  }

  getIsInExperiment(name: string, parameter: string, defaultValue: boolean) {
    if (this.localMode) {
      return defaultValue ?? false;
    }

    return (
      this.statsigClient?.getExperiment(name).value[parameter] ?? defaultValue
    );
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param alwaysPut - An override to default environment behavior.
   * @return Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut: boolean): boolean {
    if (alwaysPut) {
      return true;
    }
    if (!this.localMode) {
      return true;
    }
    return false;
  }

  /**
   * Runs Web Analytics auto-capturing.
   * @see https://docs.statsig.com/webanalytics/overview
   */
  async runAutoCapture(): Promise<void> {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      const client = new StatsigClient(this.apiKey, this.user, this.options);
      runStatsigAutoCapture(client);
      await client.initializeAsync();
    }
  }
}

const statsigReporter = new StatsigReporter();
statsigReporter.initialize(statsigReporter.apiKey);

export default statsigReporter;
