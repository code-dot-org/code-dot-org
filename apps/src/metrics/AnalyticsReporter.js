import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

import {PLATFORMS} from './AnalyticsConstants';

class AnalyticsReporter {
  constructor() {
    this.projectContext = {};
  }

  setProjectProperty(property, value) {
    // Store project properties for Statsig only. These properties are included in events sent to Statsig if opted in.
    if (value) {
      this.projectContext[property] = value;
    } else {
      delete this.projectContext[property];
    }
  }

  /*
   *  Allows us to temporarily send events to Amplitude, Statsig, or both
   *  platforms without requiring a refactor of all events. If/when we move
   *  entirely to Statsig, this file can be replaced with the contents of
   *  StatsigReporter, or the files sending events can import that file instead
   *  and we can delete this one.
   */
  sendEvent(
    eventName,
    payload,
    analyticsTool = PLATFORMS.STATSIG,
    includeProjectProperties = false
  ) {
    if (![PLATFORMS.STATSIG, PLATFORMS.BOTH].includes(analyticsTool)) {
      return;
    }
    // Include project properties in Statsig events.
    const statsigPayload = includeProjectProperties
      ? {...payload, ...this.projectContext}
      : payload;
    statsigReporter.sendEvent(eventName, statsigPayload);
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
