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
 * The class is responsible for
 * - Adding the Google Tags needed by Tag manager
 * - Send any dimensions information
 * - Wrap Google Universal and Analytics functions for easier transition
 * - Centralize common code
 */
class GoogleAnalyticsReporter {
  enableGoogleAnalyticsUniversal = true;
  enabledGoogleAnalytics4 = true;
  googleUniversalGtag = 'UA-37745279-1';
  googleAnalyticsGTag = 'G-L9HT5MZ3HD';

  constructor() {
    this.#initializeGoogleUniversal(
      window,
      window.document,
      'script',
      '//www.google-analytics.com/analytics.js',
      'ga'
    );

    this.#initializeGoogleAnalytics();

    this.#addEventListener();

    window.trackEvent = this.trackEvent;
    window.readCookie = this.readCookie;
  }
  /**
   * Enable Google Universal. This adds the tags and the ga function to the window
   * to be used across the site.
   */
  #initializeGoogleUniversal(i, s, o, g, r, a, m) {
    if (this.enableGoogleAnalyticsUniversal) {
      i.ga =
        i.ga ||
        function () {
          (ga.q = ga.q || []).push(arguments);
        };
      ga.l = +new Date();
      i['GoogleAnalyticsObject'] = r;
      (i[r] =
        i[r] ||
        function () {
          (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = 1 * new Date());
      (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
      ga('create', this.googleUniversalGtag, document.location.href);
    }
  }

  /**
   * Initialize google Analytics 4 and the property tag
   */
  #initializeGoogleAnalytics() {
    if (this.enabledGoogleAnalytics4) {
      gtag('js', new Date());
      window.dataLayer = window.dataLayer || [];
      gtag('config', this.googleAnalyticsGTag);
    }
  }

  #addEventListener() {
    window.addEventListener('load', function () {
      const ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = 'https://www.google-analytics.com/analytics.js';
      document.body.appendChild(ga);
    });
  }
  /**
   * Public function used to mark when a page has been viewed.
   * This is not required by Google Analytics 4
   */
  sendPageView() {
    if (this.enableGoogleAnalyticsUniversal) {
      ga('send', 'pageview');
    }
  }

  /**
   * Public function used to create custom dimensions to analyze the data
   * Most common dimensions for the site are: language, genre, user_type, environment, etc.
   */
  setCustomDimension(dimension_name, custom_data) {
    // Example ga('set', 'page', url);
    if (this.enableGoogleAnalyticsUniversal) {
      ga('set', dimension_name, custom_data);
    }
    if (this.enabledGoogleAnalytics4) {
      gtag('set', {[dimension_name]: custom_data});
    }
  }

  /**
   * Public function exposed to track custom events in Google Analytics
   */
  trackEvent(category_value, action_name, dimensions) {
    if (this.enableGoogleAnalyticsUniversal) {
      ga('send', 'event', category_value, action_name, dimensions);
    }
    if (this.enabledGoogleAnalytics4) {
      gtag('event', action_name, {
        eventCategory: category_value,
        dimension5: 'custom data',
      });
    }
  }

  /**
   * Common function used to read properties from cookies.
   * Properties are extracted so they can be logged later.
   * @name  name of the desired cookie to be extracted
   */
  readCookie = name => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };
}

const googleAnalyticsReporter = new GoogleAnalyticsReporter();

export default googleAnalyticsReporter;
