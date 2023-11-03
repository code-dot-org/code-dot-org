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

import {EVENT_GROUPS} from './AnalyticsConstants';

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
    //we can enable/disable sampling based upon the event's group, which is defined in the AnalyticsConstants
    //file, in the EVENT_GROUPS variable. If an event is not listed in that mapping, it defaults to 'ungrouped'

    // event groups can define a sample rate, as part of the 'amplitude-event-sample-rates' DCDO flag.
    // e.g. { 'ungrouped' : 0, 'video-events' : 0.25, 'expensive-events' : -1 }
    // which would, respectively, log:
    //   all events w/o sampling for 'ungrouped'
    //   video-events at a 25% sampling rate
    //   and explicitly turn off expensive-events

    // if a eventGroup is not defined or set to 0, then all events will be logged w/o sampling.
    // if set to -1, then nothing will be logged.

    const sampleRates = DCDO.get('amplitude-event-sample-rates', {});
    const eventGroup = EVENT_GROUPS[eventName] || 'ungrouped';
    const sampleRate = sampleRates[eventGroup] || 0;

    const sampleRateString = sampleRate
      ? `[SAMPLE RATE ${sampleRate} for ${eventGroup}]`
      : '';
    if (sampleRate < 0 || (sampleRate > 0 && Math.random() > sampleRate)) {
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
