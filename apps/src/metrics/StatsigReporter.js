import {StatsigClient} from '@statsig/js-client';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

import logToCloud from '@cdo/apps/logToCloud';
import experiments from '@cdo/apps/util/experiments';
import {getGlobalEditionRegion} from '@cdo/apps/util/globalEdition';

import {
  getEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
} from '../utils';

import {
  getUserID,
  getUserType,
  findOrCreateStableId,
  formatUserId,
} from './statsigHelpers';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;
const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

class StatsigReporter {
  constructor() {
    this.ready = false;
    this.stable_id = null;
    this.user = null;
    this.api_key = '';
    this.local_mode = true;
    this.options = {};
    this.environment = getEnvironment();
    this.statsigClient = null;
    const oneTrustPromise =
      window.oneTrustPromise &&
      typeof window.oneTrustPromise.then === 'function'
        ? window.oneTrustPromise
        : Promise.resolve(); // Default for environments without OneTrust (tests)
    this.readyPromise = oneTrustPromise.then(() => {
      return this.initializeAfterConsent();
    });
  }

  initializeAfterConsent() {
    this.stable_id = findOrCreateStableId();
    this.log(`Statsig Stable ID: ${this.stable_id}`);
    let user = {
      custom: {
        enabledExperiments: experiments.getEnabledExperiments(),
        geRegion: getGlobalEditionRegion(),
      },
      customIDs: {stableID: this.stable_id},
    };

    const user_id = getUserID();
    const user_type = getUserType();

    if (user_id) {
      user.userID = formatUserId(user_id);
      user.custom.userType = user_type;
    }
    this.user = user;

    const api_element = document.querySelector(
      'script[data-statsig-api-client-key]'
    );
    this.api_key = api_element ? api_element.dataset.statsigApiClientKey : '';

    const managed_test_environment_element = document.querySelector(
      'script[data-managed-test-server]'
    );
    const managed_test_environment = managed_test_environment_element
      ? managed_test_environment_element.dataset.managedTestServer === 'true'
      : false;
    this.local_mode = !(
      IN_UNIT_TEST ||
      isProductionEnvironment() ||
      managed_test_environment ||
      process.env.STATSIG_LOCAL_MODE_OFF
    );
    this.options = {
      localMode: this.local_mode,
      disableErrorLogging: true,
      environment: {tier: this.environment},
    };

    this.ready = true;
    this.initializedPromise = this.initialize(
      this.api_key,
      this.user,
      this.options
    );
    return this.initializedPromise;
  }

  // This user object will potentially update via a setUserProperties call
  // (below) from current user redux
  async initialize(api_key, user, options) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      this.statsigClient = new StatsigClient(api_key, user, options);
      await this.statsigClient.initializeAsync();
    }
  }

  // Wait until the reporter is ready
  waitUntilReady = async () => {
    await this.readyPromise;
  };

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  async setUserProperties({
    userId,
    userType,
    isVerifiedInstructor,
    enabledExperiments,
    educatorRole,
  }) {
    await this.readyPromise;
    if (!this.ready || !this.statsigClient) {
      return;
    }
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
      await this.statsigClient.updateUserAsync(user);
    }
  }

  sendEvent(eventName, payload) {
    if (!this.ready) {
      this.readyPromise.then(() => this.sendEvent(eventName, payload));
      return;
    }
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      if (!eventName) {
        logToCloud.addPageAction(
          logToCloud.PageAction.NoValidStatsigEventNameError,
          {
            payload: payload,
          }
        );
        this.statsigClient.logEvent(NO_EVENT_NAME, NO_EVENT_NAME, payload);
      } else {
        // Statsig expects a name, value and data. Because we are unifying this
        // with our Amplitude logging, we are bypassing the 'value' and sending
        // event name twice. If we want to use this field moving forward, we
        // will need to refactor all AnalyticsReporting event calls accordingly.
        this.statsigClient.logEvent(eventName, eventName, payload);
      }
    } else {
      this.log(
        `${eventName}. Payload: ${JSON.stringify({
          payload,
        })}`
      );
    }
  }

  log(message) {
    if (!IN_UNIT_TEST && isDevelopmentEnvironment()) {
      console.log(`[STATSIG ANALYTICS EVENT]: ${message}`);
    }
  }

  getIsInExperiment(name, parameter, defaultValue) {
    if (!this.ready || !this.statsigClient) {
      return defaultValue ?? false;
    }
    if (this.local_mode) {
      return defaultValue ?? false;
    }
    return (
      this.statsigClient.getExperiment(name).value[parameter] ?? defaultValue
    );
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param {boolean} alwaysPut An override to default environment behavior.
   * @return {boolean} Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut) {
    if (alwaysPut) {
      return true;
    }
    if (!this.ready) {
      return false;
    }
    if (!this.local_mode) {
      return true;
    }
    return false;
  }

  /**
   * Runs Web Analytics auto-capturing.
   * @see https://docs.statsig.com/webanalytics/overview
   */
  async runAutoCapture() {
    await this.readyPromise;
    if (!this.ready) {
      return;
    }
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      const client = new StatsigClient(this.api_key, this.user, this.options);
      runStatsigAutoCapture(client);
      await client.initializeAsync();
    }
  }
}

const statsigReporter = new StatsigReporter();

export default statsigReporter;
