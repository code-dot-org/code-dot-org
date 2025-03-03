import {StatsigClient} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';
import {runStatsigAutoCapture} from '@statsig/web-analytics';
import cookies from 'js-cookie';

import {getEnvironment, isProductionEnvironment, createUuid} from '../utils';

const STABLE_ID_KEY = 'statsig_stable_id';

class StatsigSessionReplay {
  constructor() {
    // stable_id is set as a cookie in application_controller.rb. However in a
    // the rare case we are running outside of the application layout,
    // set stable_id as a cookie here if it doesn't exist.
    this.stable_id = this.findOrCreateStableId();
    let user = {
      customIDs: {stableID: this.stable_id},
      custom: {},
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
    this.user = user;
    const api_element = document.querySelector(
      'script[data-statsig-api-client-key-session-replay]'
    );

    this.api_key = api_element
      ? api_element.dataset.statsigApiClientKeySessionReplay
      : '';
  }

  async startRecording() {
    if (this.statsigClient) {
      return;
    }

    this.statsigClient = new StatsigClient(this.api_key, this.user);
    runStatsigSessionReplay(this.statsigClient);
    runStatsigAutoCapture(this.statsigClient);
    await this.statsigClient.initializeAsync();
  }

  stopRecording() {
    if (!this.statsigClient) {
      return;
    }

    this.statsigClient.shutdown();
    this.statsigClient = null;
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
        path: '/',
      });
    }
    return stableId;
  }
}

export default StatsigSessionReplay;
