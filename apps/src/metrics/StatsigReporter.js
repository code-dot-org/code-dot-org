import cookies from 'js-cookie';
import Statsig from 'statsig-js';

import logToCloud from '@cdo/apps/logToCloud';
import experiments from '@cdo/apps/util/experiments';

import {
  getEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
  createUuid,
} from '../utils';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;
const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';
const STABLE_ID_KEY = 'statsig_stable_id';

class StatsigReporter {
  constructor() {
    let user = {
      custom: {
        enabledExperiments: experiments.getEnabledExperiments(),
      },
    };
    const user_id_element = document.querySelector('script[data-user-id]');
    const user_id = user_id_element ? user_id_element.dataset.userId : null;
    const user_type_element = document.querySelector('script[data-user-type');
    const user_type = user_type_element
      ? user_type_element.dataset.userType
      : null;
    if (user_id) {
      user.userID = this.formatUserId(user_id);
      user.custom.userType = user_type;
    }
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
    this.stable_id = this.findOrCreateStableId();
    const options = {
      environment: {tier: getEnvironment()},
      localMode: this.local_mode,
      disableErrorLogging: true,
      overrideStableID: this.stable_id,
    };
    this.initialize(api_key, user, options);
  }

  // This user object will potentially update via a setUserProperties call
  // (below) from current user redux
  async initialize(api_key, user, options) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      await Statsig.initialize(api_key, user, options);
    }
  }

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  async setUserProperties(userId, userType, enabledExperiments) {
    const formattedUserId = this.formatUserId(userId);
    const user = {
      userID: formattedUserId,
      custom: {userType: userType, enabledExperiments: enabledExperiments},
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

  getIsInExperiment(name, parameter, defaultValue) {
    if (this.local_mode) {
      return false;
    }
    return Statsig.getExperiment(name).get(parameter, defaultValue);
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

  findOrCreateStableId() {
    let stableId = cookies.get(STABLE_ID_KEY);
    if (!stableId) {
      stableId = createUuid();
      cookies.set(STABLE_ID_KEY, stableId, {
        expires: 400,
        domain: 'code.org',
      });
    }
    return stableId;
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
