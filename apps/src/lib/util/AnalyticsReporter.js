import {
  init,
  track,
  Identify,
  identify,
  setUserId,
} from '@amplitude/analytics-browser';
import logToCloud from '@cdo/apps/logToCloud';
import {
  getEnvironment,
  isProductionEnvironment,
  isStagingEnvironment,
  isDevelopmentEnvironment,
} from '../../utils';

import DCDO from '@cdo/apps/dcdo';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;

class AnalyticsReporter {
  constructor() {
    // Get the API key from the DOM. See application.html.haml layout.
    const element = document.querySelector('script[data-amplitude-api-key]');
    const api_key = element ? element.dataset.amplitudeApiKey : '';
    // Let Amplitude handle missing/invalid keys.
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      init(api_key);
    }
  }

  setUserProperties(userId, userType, enabledExperiments) {
    const identifyObj = new Identify();
    const formattedUserId = this.formatUserId(userId);
    // enabledExperiments sometimes has duplicates
    const uniqueExperiments = [...new Set(enabledExperiments)].sort();
    setUserId(formattedUserId);
    identifyObj.set('userType', userType);
    identifyObj.set('signInState', !!userId);
    identifyObj.set('enabledExperiments', uniqueExperiments);

    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, signInState: ${!!userId}, enabledExperiments: ${uniqueExperiments}`
      );
    }
    identify(identifyObj);
  }

  sendEvent(eventName, payload) {
    // we can accept an optional 3rd parameter of an options object.
    // Valid flags include:
    //   useSampling - boolean true/false - whether to look to the DCDO.logSampleRate
    //   sampleRateFlag - the DCDO flag we look to to determine the sample rate for this event.

    // if useSampling is true, then we pull out the DCDO value of the sampleRateFlag.
    // if we're sampling, then look to our DCDO flag to the event sample rate.
    // the sampleRate should be a floating point number indicating the percentage of events
    // to track. i.e. 0.25 means we track 25% of the events.
    // if it is 0 or undefined, we track all events.

    // finally, if we are sampling, and we have a sample rate AND our random number is > the sampleRate
    // then we simply bow out and do nothing.
    // look to our DCDO flags to the event sample rate.
    // if it's not defined, then we just proceed as normal.
    // however, if it -is- defined, then it should be a floating point number
    // indicating the % of the time we want to track the event.
    // i.e., 0.25 means we want to track 25% of the events.
    const sampleRates = DCDO.get('amplitude-event-sample-rates', {});
    const sampleRate = sampleRates[eventName];

    const sampleRateString = sampleRate ? `[SAMPLE RATE ${sampleRate}]` : '';
    if (sampleRate && Math.random() > sampleRate) {
      this.log(
        `[SKIPPED SAMPLED EVENT]${sampleRateString}${eventName}. Payload: ${JSON.stringify(
          {
            payload,
          }
        )}`
      );
      return;
    }

    if (this.shouldPutRecord(ALWAYS_SEND)) {
      if (!eventName) {
        logToCloud.addPageAction(
          logToCloud.PageAction.NoValidAmplitudeEventNameError,
          {
            payload: payload,
          }
        );
        track('NO_VALID_EVENT_NAME_LOG_ERROR', payload);
      } else {
        track(eventName, payload);
      }
    } else {
      this.log(
        `${sampleRateString}${eventName}. Payload: ${JSON.stringify({
          payload,
        })}`
      );
    }
  }

  log(message) {
    if (isDevelopmentEnvironment() && !IN_UNIT_TEST) {
      console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
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

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
