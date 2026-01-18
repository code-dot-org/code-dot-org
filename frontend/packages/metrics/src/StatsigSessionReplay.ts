/*
IMPORTANT: Before you use Session Replay, you must ensure that you are filtering
PII from the session replay data. Please reference the Statsig Session
Replay docs, specifically the section on filtering PII, for more information:
https://docs.statsig.com/session-replay/configure#configure-recording-privacypii-options

Statsig supports filtering of PII by adding specific classes to the HTML elements
that contain PII. Please refer to the above documentation for more information.
At the time of writing, the classes that Statsig supports are:

* input[type="password"] will be masked by default.
* An element with the class name .rr-block will not be recorded. Instead, it will
  replay as a placeholder with the same dimensions.
* An element with the class name .rr-ignore will not record its input events.
* All text of elements with the class name .rr-mask and their children will be 
  masked.
*/

import {StatsigClient} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

import {isProductionEnvironment} from '@code-dot-org/core';

import * as experiments from './experiments';
import {
  getUserID,
  getUserType,
  getStableId,
  formatUserId,
} from './statsigHelpers';
import type {StatsigPayload} from './StatsigReporter';

// A flag that can be toggled to enable session recording for development environments
const LOCAL_MODE = false;

class StatsigSessionReplay {
  apiKey: string;
  stableID?: string;
  user: StatsigPayload;
  statsigClient?: StatsigClient;

  constructor() {
    // stableID is set as a cookie in application_controller.rb. However in a
    // the rare case we are running outside of the application layout,
    // set stableID as a cookie here if it doesn't exist.
    this.stableID = getStableId();
    const user: StatsigPayload = {
      custom: {
        enabledExperiments: experiments.getEnabledExperiments(),
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
    const apiElement = document.querySelector(
      'script[data-statsig-api-client-key-session-replay]',
    ) as HTMLElement | undefined;

    this.apiKey = apiElement?.dataset?.statsigApiClientKeySessionReplay || '';
  }

  async startRecording() {
    // check if the statsig client is already initialized
    if (this.statsigClient) {
      return;
    }

    const managedTestEnvironmentElement = document.querySelector(
      'script[data-managed-test-server]',
    ) as HTMLElement | undefined;
    const managedTestEnvironment =
      managedTestEnvironmentElement?.dataset?.managedTestServer === 'true';

    // Only proceed with recording if in production environment, managed test
    // environment, or local mode is enabled
    if (!isProductionEnvironment() && !managedTestEnvironment && !LOCAL_MODE) {
      return;
    }

    this.statsigClient = new StatsigClient(this.apiKey, this.user);
    runStatsigSessionReplay(this.statsigClient);
    runStatsigAutoCapture(this.statsigClient);
    await this.statsigClient.initializeAsync();
  }

  stopRecording() {
    // check if the statsig client is already stopped
    if (!this.statsigClient) {
      return;
    }

    this.statsigClient.shutdown();
    this.statsigClient = undefined;
  }
}

export default StatsigSessionReplay;
