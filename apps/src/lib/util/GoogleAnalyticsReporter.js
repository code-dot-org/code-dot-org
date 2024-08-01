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
  googleAnalyticsGTag = 'G-L9HT5MZ3HD';

  constructor() {
    this.initializeGoogleAnalytics();
    window.trackEvent = this.trackEvent;
    // window.ga = ga;
  }

  /**
   * Initialize google Analytics 4 and the property tag
   */
  initializeGoogleAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.ga = ga;

    gtag('js', new Date());
    gtag('config', 'G-L9HT5MZ3HD', userAnalyticsDimensions);
  }

  /**
   * Support legacy ga() calls using the mapping suggested at
   * https://support.google.com/analytics/answer/10271001.
   * Back compat to match format described at
   * https://web.archive.org/web/20170714001459/https://developers.google.com/analytics/devguides/collection/analyticsjs/events
   */
  /*
  // experimental:
  ga2(command, hitType, eventCategory, eventAction, eventLabel, eventValue) {
    if (command === 'send' && hitType == 'event') {
      //this.trackEvent(eventCategory, eventAction, dimensions);
      gtag('event', actionName, {eventCategory, eventAction, eventLabel, eventValue, ...dimensions});
    }
  }

  // works:
  ga(type, event, categoryValue, actionName, dimensions) {
    if (type === 'send' && event == 'event') {
      this.trackEvent(categoryValue, actionName, dimensions);
      //gtag('event', actionName, {eventCategory: categoryValue, ...dimensions});
    }
  }
  */

  /**
   * GA4 compatible implementtion of a function that we have provided since Universal
   * Analytics, to report an event.
   */
  trackEvent(categoryValue, actionName, dimensions) {
    gtag('event', actionName, {
      eventCategory: categoryValue,
      ...dimensions,
    });
  }
}

const googleAnalyticsReporter = new GoogleAnalyticsReporter();

export default googleAnalyticsReporter;
