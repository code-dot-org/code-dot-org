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

  // `value` populates Statsig's own event value field, which Statsig breaks
  // results down by automatically when it has fewer than eight distinct
  // values. Callers that omit it get the historical behavior: the event name
  // repeated into that field.
  sendEvent(eventName, payload, includeProjectProperties = false, value) {
    // Include project properties in Statsig events.
    const statsigPayload = includeProjectProperties
      ? {...payload, ...this.projectContext}
      : payload;
    statsigReporter.sendEvent(eventName, statsigPayload, value);
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
