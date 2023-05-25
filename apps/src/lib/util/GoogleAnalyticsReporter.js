window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

class GoogleAnalyticsReporter {
  enableGoogleAnalyticsUniversal = true;
  enabledGoogleAnalytics4 = true;
  googleUniversalGtag = 'UA-37745279-1';
  googleAnalyticsGTag = 'G-L9HT5MZ3HD';

  constructor() {
    alert('hello');
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

  sendPageView() {
    if (this.enableGoogleAnalyticsUniversal) {
      ga('send', 'pageview');
    }
  }

  setCustomDimension(dimension_name, custom_data) {
    // Example ga('set', 'page', url);
    if (this.enableGoogleAnalyticsUniversal) {
      ga('set', dimension_name, custom_data);
    }
    if (this.enabledGoogleAnalytics4) {
      window.gtag('set', {dimension_name: custom_data});
    }
  }

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
