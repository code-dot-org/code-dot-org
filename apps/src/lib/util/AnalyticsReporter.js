import {
  init,
  track,
  Identify,
  identify,
  setUserId
} from '@amplitude/analytics-browser';
import {currentLocation} from '@cdo/apps/utils';

// A flag that can be toggled to send events regardless of environment
const ALWAYS_SEND = false;

const Environments = {
  production: 'production',
  levelbuilder: 'levelbuilder',
  test: 'test',
  staging: 'staging',
  adhoc: 'adhoc',
  development: 'development',
  unknown: 'unknown'
};

class AnalyticsReporter {
  constructor() {
    // Get the API key from the DOM. See application.html.haml layout.
    const element = document.querySelector('script[data-amplitude-api-key]');
    const api_key = element ? element.dataset.amplitudeApiKey : '';
    // Let Amplitude handle missing/invalid keys.
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      init(api_key);
    }
  }

  setUserProperties(userId, userType, signInState) {
    const identifyObj = new Identify();
    const formattedUserId = this.formatUserId(userId);
    setUserId(formattedUserId);
    identifyObj.set('userType', userType);
    identifyObj.set('signInState', signInState);

    if (!this.shouldPutRecord(ALWAYS_SEND)) {
      this.log(
        `User properties: userId: ${formattedUserId}, userType: ${userType}, signInState: ${signInState}`
      );
    }
    identify(identifyObj);
  }

  sendEvent(eventName, payload) {
    if (this.shouldPutRecord(ALWAYS_SEND)) {
      track(eventName, payload);
    } else {
      this.log(`${eventName}. Payload: ${JSON.stringify({payload})}`);
    }
  }

  log(message) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }

  formatUserId(userId) {
    const userIdString = userId.toString() || 'none';
    if (!userId) {
      return userIdString;
    }
    if (this.isProductionEnvironment()) {
      return userIdString.padStart(5, '0');
    } else {
      const environment = this.getEnvironment();
      return `${environment}-${userIdString}`;
    }
  }

  /**
   * Returns whether the request should be sent through to AWS Firehose.
   * @param {boolean} alwaysPut An override to default environment behavior.
   * @return {boolean} Whether the request should be sent through to AWS
   *   Firehose.
   */
  shouldPutRecord(alwaysPut) {
    if (alwaysPut) {
      return true;
    }
    if (this.isTestEnvironment() || this.isDevelopmentEnvironment()) {
      return false;
    }
    return true;
  }

  /**
   * Returns the current environment.
   * @return {string} The current environment, e.g., "staging" or "production".
   */
  getEnvironment() {
    const hostname = currentLocation().hostname;
    if (hostname.includes('adhoc')) {
      // As adhoc hostnames may include other keywords, check it first.
      return Environments.adhoc;
    }
    if (hostname.includes('test')) {
      return Environments.test;
    }
    if (hostname.includes('levelbuilder')) {
      return Environments.levelbuilder;
    }
    if (hostname.includes('staging')) {
      return Environments.staging;
    }
    if (hostname.includes('localhost')) {
      return Environments.development;
    }
    if (hostname.includes('code.org')) {
      return Environments.production;
    }
    return Environments.unknown;
  }

  isTestEnvironment() {
    return this.getEnvironment() === Environments.test;
  }

  isDevelopmentEnvironment() {
    return this.getEnvironment() === Environments.development;
  }

  isProductionEnvironment() {
    return this.getEnvironment() === Environments.production;
  }
}

export const EVENTS = {
  // Sign-up flow
  ACCOUNT_TYPE_PICKED_EVENT: 'Account Type Picked',
  SIGN_UP_FINISHED_EVENT: 'Sign Up Finished',

  // Course/Unit info
  LOGIN_TYPE_SELECTED_EVENT: 'Login Type Selected',
  COURSE_OVERVIEW_PAGE_VISITED_EVENT: 'Course Overview Page Visited',
  UNIT_OVERVIEW_PAGE_VISITED_EVENT: 'Unit Overview Page Visited',
  TRY_NOW_BUTTON_CLICK_EVENT: 'Try Now Button Clicked',

  // Workshop enrollment
  WORKSHOP_ENROLLMENT_COMPLETED_EVENT: 'Workshop Enrollment Completed',

  // PD Application flow
  TEACHER_APP_STARTED_EVENT: '6-12 Teacher Application Started',
  PAGE_CHANGED_EVENT: 'Page Changed',
  PROGRAM_PICKED_EVENT: 'Professional Learning Program Picked',
  SCHOOL_ID_CHANGED_EVENT: 'School ID Changed',
  RP_FOUND_EVENT: 'Regional Partner Found',
  APPLICATION_SAVED_EVENT: 'Application Saved',
  APPLICATION_SUBMITTED_EVENT: 'Application Submitted',
  APP_STATUS_CHANGE_EVENT: 'Application Status Changed',
  ADMIN_APPROVAL_RECEIVED_EVENT: 'Administrator Approval Received',
  SUBMIT_RP_CONTACT_FORM_EVENT: 'Submit Regional Partner Contact Form'
};

const analyticsReporter = new AnalyticsReporter();

export default analyticsReporter;
