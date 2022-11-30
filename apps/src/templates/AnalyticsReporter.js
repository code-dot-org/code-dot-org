import {
  init,
  track,
  Identify,
  identify,
  setUserId
} from '@amplitude/analytics-browser';

const API_KEY = '12345';

class AnalyticsReporter {
  constructor() {
    init(API_KEY);
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
