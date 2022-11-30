import {
  init,
  track,
  Identify,
  identify,
  setUserId,
  setSessionId
} from '@amplitude/analytics-browser';

const API_KEY = '12345';

class AnalyticsReporter {
  constructor() {
    // TODO: API Key
    init(API_KEY);
    this.sessionStartTime = null;
  }

  setUserProperties(userId, userType, signInState) {
    const identifyObj = new Identify();
    setUserId(userId || 'none');
    identifyObj.set('userType', userType);
    identifyObj.set('signInState', signInState);

    this.log(
      `User properties: userId: ${userId}, userType: ${userType}, signInState: ${signInState}`
    );
    identify(identifyObj);
  }

  onButtonClicked(buttonName) {
    track('Button clicked', {buttonName});
    this.log(`Button clicked. Payload: ${JSON.stringify({buttonName})}`);
  }

  onSessionStart() {
    this.sessionStartTime = Date.now();
    setSessionId(this.sessionStartTime);

    this.log(`Session start. Session ID: ${this.sessionStartTime}`);
  }

  onSessionEnd() {
    if (this.sessionStartTime === null) {
      return;
    }
    const duration = Date.now() - this.sessionStartTime;
    // report duration event, and instructions seen events
    this.sessionStartTime = null;
    const payload = {
      durationSeconds: duration / 1000,
      blockStats: this.blockStats
    };
    track('Session end', payload);
    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
