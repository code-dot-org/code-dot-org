import {StatsigClient} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

import {isProductionEnvironment} from '../utils';

import {
  getUserID,
  getUserType,
  findOrCreateStableId,
  formatUserId,
} from './StatsigHelpers';

// A flag that can be toggled to enable session recording for development environments
const LOCAL_MODE = false;

class StatsigSessionReplay {
  constructor() {
    // stable_id is set as a cookie in application_controller.rb. However in a
    // the rare case we are running outside of the application layout,
    // set stable_id as a cookie here if it doesn't exist.
    this.stable_id = findOrCreateStableId();
    let user = {
      customIDs: {stableID: this.stable_id},
      custom: {},
    };

    const user_id = getUserID();
    const user_type = getUserType();

    if (user_id) {
      user.userID = formatUserId(user_id);
      user.custom.userType = user_type;
    }
    this.user = user;
    const api_element = document.querySelector(
      'script[data-statsig-api-client-key-session-replay]'
    );

    this.api_key = api_element
      ? api_element.dataset.statsigApiClientKeySessionReplay
      : '';
  }

  async startRecording() {
    // check if the statsig client is already initialized
    if (this.statsigClient) {
      return;
    }

    const managed_test_environment_element = document.querySelector(
      'script[data-managed-test-server]'
    );
    const managed_test_environment = managed_test_environment_element
      ? managed_test_environment_element.dataset.managedTestServer === 'true'
      : false;

    // Only proceed with recording if in production environment, managed test
    // environment, or local mode is enabled
    if (
      !isProductionEnvironment() &&
      !managed_test_environment &&
      !LOCAL_MODE
    ) {
      return;
    }

    this.statsigClient = new StatsigClient(this.api_key, this.user);
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
    this.statsigClient = null;
  }
}

export default StatsigSessionReplay;
