import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

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

  sendEvent(eventName, payload, includeProjectProperties = false) {
    // Include project properties in Statsig events.
    const statsigPayload = includeProjectProperties
      ? {...payload, ...this.projectContext}
      : payload;
    statsigReporter.sendEvent(eventName, statsigPayload);
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
