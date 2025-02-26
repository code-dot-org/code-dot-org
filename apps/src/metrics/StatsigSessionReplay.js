import {StatsigClient} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

class StatsigSessionReplay {
  constructor() {
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

    this.statsigClient = new StatsigClient(this.api_key);
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
}

export default StatsigSessionReplay;
