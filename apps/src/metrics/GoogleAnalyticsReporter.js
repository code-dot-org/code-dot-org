import getScriptData from '@cdo/apps/util/getScriptData';

window.dataLayer = window.dataLayer || [];

/**
 * Global function used to track Google Universal events.
 * It is a wrapper class that appends information to window.dataLayer
 * This is the equivalent of ga() in Google Universal
 */
function gtag() {
  window.dataLayer.push(arguments);
}

/**
 * Class used to control the initialization of Google analytics
 * for code.org properties.
 */
class GoogleAnalyticsReporter {
  constructor() {
    this.initializeGoogleAnalytics();
    window.trackEvent = this.trackEvent;
  }

  /**
   * Initialize google Analytics 4 and the property tag
   */
  initializeGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];

    const ga4MeasurementId = getScriptData('googleMeasurement').id;

    gtag('js', new Date());
    gtag('config', ga4MeasurementId, window.userAnalyticsDimensions);
  }

  /**
   * GA4 compatible function to track an event.
   */
  trackEvent(categoryValue, actionName, parameters) {
    gtag('event', actionName, {
      eventCategory: categoryValue,
      ...parameters,
    });
  }
}

const googleAnalyticsReporter = new GoogleAnalyticsReporter();

export default googleAnalyticsReporter;
