import logToCloud from '@cdo/apps/logToCloud';
import {
  getEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
} from '../../utils';
import Statsig from 'statsig-js';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;
const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

class StatsigReporter {
  constructor() {
    const api_element = document.querySelector(
      'script[data-statsig-api-client-key]'
    );
    const api_key = api_element ? api_element.dataset.statsigApiClientKey : '';
    const managed_test_environment_element = document.querySelector(
      'script[data-managed-test-server]'
    );
    const managed_test_environment = managed_test_environment_element
      ? managed_test_environment_element.dataset.managedTestServer === 'true'
      : false;
    this.local_mode = !(isProductionEnvironment() || managed_test_environment);
    const options = {
      environment: {tier: getEnvironment()},
      localMode: this.local_mode,
    };
    this.initialize(api_key, options);
  }

  async initialize(api_key, options) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      await Statsig.initialize(api_key, options);
    }
  }

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  async setUserProperties(userId, userType, enabledExperiments) {
    const formattedUserId = this.formatUserId(userId);
    const user = {
      userID: formattedUserId,
      custom: {
        type: userType,
        experiments: enabledExperiments,
      },
    };
    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, signInState: ${!!userId}`
      );
    } else {
      await Statsig.updateUser(user);
    }
  }

  sendEvent(eventName, payload) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      if (!eventName) {
        logToCloud.addPageAction(
          logToCloud.PageAction.NoValidStatsigEventNameError,
          {
            payload: payload,
          }
        );
        Statsig.logEvent(NO_EVENT_NAME, NO_EVENT_NAME, payload);
      } else {
        // Statsig expects a name, value and data. Because we are unifying this
        // with our Amplitude logging, we are bypassing the 'value' and sending
        // event name twice. If we want to use this field moving forward, we
        // will need to refactor all AnalyticsReporting event calls accordingly.
        Statsig.logEvent(eventName, eventName, payload);
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
    if (isDevelopmentEnvironment() && !IN_UNIT_TEST) {
      console.log(`[STATSIG ANALYTICS EVENT]: ${message}`);
    }
  }

  formatUserId(userId) {
    const userIdString = userId.toString() || 'none';
    if (!userId) {
      return userIdString;
    }
    if (isProductionEnvironment()) {
      return userIdString.padStart(5, '0');
    } else {
      const environment = getEnvironment();
      return `${environment}-${userIdString}`;
    }
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
    if (!this.local_mode) {
      return true;
    }
    return false;
  }
}

const statsigReporter = new StatsigReporter();

export default statsigReporter;
