import logToCloud from '@cdo/apps/logToCloud';
import {
  getEnvironment,
  isProductionEnvironment,
  isStagingEnvironment,
  isDevelopmentEnvironment,
} from '../../utils';
import Statsig from 'statsig-js';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;

class StatsigReporter {
  constructor() {
    const managed_test_environment = document.querySelector(
      'script[data-managed-test-server]'
    );
    const local_mode =
      isProductionEnvironment() || managed_test_environment ? false : true;
    const options = {
      environment: {tier: getEnvironment()},
      network_timeout: 5,
      local_mode: local_mode,
    };
    const api_key = document.querySelector(
      'script[data-statsig-api-client-key]'
    );
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      Statsig.initialize(api_key, options);
    }
  }

  // Utilizes Statsig's function for updating a user once we've recognized a sign in
  setUserProperties(userId, userType) {
    let user;
    const formattedUserId = this.formatUserId(userId);
    user.id = formattedUserId;
    user.type = userType;
    Statsig.updateUser(user);

    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, signInState: ${!!userId}`
      );
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
        Statsig.logEvent('NO_VALID_EVENT_NAME_LOG_ERROR', payload);
      } else {
        Statsig.logEvent(eventName, payload);
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
    if (isProductionEnvironment() || isStagingEnvironment()) {
      return true;
    }
    return false;
  }
}

const statsigReporter = new StatsigReporter();

export default statsigReporter;
