import {
  init,
  track,
  Identify,
  identify,
  setUserId
} from '@amplitude/analytics-browser';

class AnalyticsReporter {
  constructor() {
    // Get the API key from the DOM. See application.html.haml layout.
    const element = document.querySelector('script[data-amplitude-api-key]');
    const api_key = element ? element.dataset.amplitudeApiKey : '';
    // Let Amplitude handle missing/invalid keys.
    init(api_key);
  }

  setUserProperties(userId, userType, signInState) {
    const identifyObj = new Identify();
    setUserId(`dev-${userId || 'none'}`);
    identifyObj.set('userType', userType);
    identifyObj.set('signInState', signInState);

    this.log(
      `User properties: userId: ${userId}, userType: ${userType}, signInState: ${signInState}`
    );
    identify(identifyObj);
  }

  sendEvent(eventName, payload) {
    track(eventName, payload);
    this.log(`${eventName}. Payload: ${JSON.stringify({payload})}`);
  }

  log(message) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
