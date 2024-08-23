
class AnalyticsReporter {
  constructor() {
  }

  setUserProperties(userId, userType, enabledExperiments) {
  }

  sendEvent(eventName, payload, analyticsTool) {
  }

  sendAnalyticsEvent(eventName, payload) {
  }

  log(message) {
  }

  formatUserId(userId) {
  }

  shouldPutRecord(alwaysPut) {
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
