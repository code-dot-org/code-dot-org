/** @file Maker Board setup checker */
import React, {Component, PropTypes} from 'react';
import SetupChecker from '../util/SetupChecker';
import {isWindows, isChrome, getChromeVersion} from '../util/browserChecks';
import SetupStep, {
  HIDDEN,
  WAITING,
  ATTEMPTING,
  SUCCEEDED,
  FAILED,
  CELEBRATING,
} from './SetupStep';

const STATUS_IS_CHROME = 'statusIsChrome';
const STATUS_APP_INSTALLED = 'statusAppInstalled';
const STATUS_WINDOWS_DRIVERS = 'statusWindowsDrivers';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';

const initialState = {
  isDetecting: false,
  caughtError: null,
  [STATUS_IS_CHROME]: WAITING,
  [STATUS_APP_INSTALLED]: WAITING,
  [STATUS_WINDOWS_DRIVERS]: WAITING,
  [STATUS_BOARD_PLUG]: WAITING,
  [STATUS_BOARD_CONNECT]: WAITING,
  [STATUS_BOARD_COMPONENTS]: WAITING,
};

export default class SetupChecklist extends Component {
  state = {...initialState};

  static propTypes = {
    setupChecker: PropTypes.instanceOf(SetupChecker).isRequired,
    stepDelay: PropTypes.number,
  };

  hide(selector) {
    this.setState({[selector]: HIDDEN});
  }

  fail(selector) {
    this.setState({[selector]: FAILED});
  }

  spin(selector) {
    this.setState({[selector]: ATTEMPTING});
  }

  succeed(selector) {
    this.setState({[selector]: SUCCEEDED});
  }

  thumb(selector) {
    this.setState({[selector]: CELEBRATING});
  }

  getSurveyURL() {
    const baseFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSe4NB7weq20sydf4kKn3QzIIn1O91hfPNU0U6b2xc1W6w44eQ/viewform';
    const userAgentFieldFill = `entry.1520933088=${encodeURIComponent(navigator.userAgent)}`;
    const prettifiedCurrentStates = JSON.stringify(this.state, null, 2);
    const setupStatesFieldFill = `entry.804069894=${encodeURIComponent(prettifiedCurrentStates)}`;
    return `${baseFormURL}?${userAgentFieldFill}&${setupStatesFieldFill}`;
  }

  detect() {
    const {setupChecker} = this.props;
    this.setState({...initialState, isDetecting: true});

    if (!isWindows()) {
      this.hide(STATUS_WINDOWS_DRIVERS);
    }

    Promise.resolve()

        // Are we using a compatible browser?
        .then(() => this.detectStep(STATUS_IS_CHROME,
            () => setupChecker.detectChromeVersion()))

        // Is Chrome App Installed?
        .then(() => this.detectStep(STATUS_APP_INSTALLED,
            () => setupChecker.detectChromeAppInstalled()))

        // Is board plugged in?
        .then(() => this.detectStep(STATUS_BOARD_PLUG,
            () => setupChecker.detectBoardPluggedIn()))

        // Can we talk to the firmware?
        .then(() => this.detectStep(STATUS_BOARD_CONNECT,
            () => setupChecker.detectCorrectFirmware()))

        // Can we initialize components successfully?
        .then(() => this.detectStep(STATUS_BOARD_COMPONENTS,
            () => setupChecker.detectComponentsInitialize()))

        // Everything looks good, let's par-tay!
        .then(() => this.thumb(STATUS_BOARD_COMPONENTS))
        .then(() => setupChecker.celebrate())
        .then(() => this.succeed(STATUS_BOARD_COMPONENTS))

        // If anything goes wrong along the way, we'll end up in this
        // catch clause - make sure to report the error out.
        .catch(error => {
          this.setState({caughtError: error});
          if (console && typeof console.error === 'function') {
            console.error(error);
          }
        })

        // Finally...
        .then(() => {
          setupChecker.teardown();
          this.setState({isDetecting: false});
        });
  }

  /**
   * Perform the work to check a step, wrapped in appropriate status changes.
   * @param {string} stepKey
   * @param {function:Promise} stepWork
   * @return {Promise}
   */
  detectStep(stepKey, stepWork) {
    this.spin(stepKey);
    return promiseWaitFor(this.props.stepDelay || 200)
        .then(stepWork)
        .then(() => this.succeed(stepKey))
        .catch(error => {
          this.fail(stepKey);
          return Promise.reject(error);
        });
  }

  /**
   * Helper to be used on second/subsequent attempts at detecing board usability.
   */
  redetect() {
    if (this.state[STATUS_APP_INSTALLED] !== SUCCEEDED) {
      // If the Chrome app was not installed last time we checked, but has been
      // installed since, we'll probably need a full page reload to pick it up.
      window.location.reload();
    } else {
      // Otherwise we should be able to redetect without a page reload.
      this.detect();
    }
  }

  componentDidMount() {
    this.detect();
  }

  render() {
    const surveyLink = (
      <span>
        <br/>Still having trouble?  Please <a href={this.getSurveyURL()}>submit our quick survey</a> about your setup issues.
      </span>
    );
    return (
        <div>
          <h2>
            Setup Check
            <input
              style={{marginLeft: 9, marginTop: -4}}
              className="btn"
              type="button"
              value="re-detect"
              onClick={this.redetect.bind(this)}
              disabled={this.state.isDetecting}
            />
          </h2>
          <div className="setup-status">
            <SetupStep
              stepStatus={this.state[STATUS_IS_CHROME]}
              stepName="Chrome version 33+"
            >
              {isChrome() && `It looks like your Chrome version is ${getChromeVersion()}.`}
              Your current browser is not supported at this time.
              Please install the latest version of <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.
              <br/><em>Note: We plan to support other browsers including Internet Explorer in Fall 2017.</em>
            </SetupStep>
            <SetupStep
              stepStatus={this.state[STATUS_APP_INSTALLED]}
              stepName="Chrome App installed"
            >
              Please install the <a href="https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg" target="_blank">Code.org Serial Connector Chrome App extension</a>.
              <br/>Once it is installed, come back to this page and click the "re-detect" button, above.
              <br/>If a prompt asking for permission for Code Studio to connect to the Chrome App pops up, click Accept.
              {surveyLink}
            </SetupStep>
            <SetupStep
              stepStatus={this.state[STATUS_WINDOWS_DRIVERS]}
              stepName="Windows drivers installed? (cannot auto-check)"
            />
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_PLUG]}
              stepName="Board plugged in"
            >
              We couldn't detect a Circuit Playground board.
              Make sure your board is plugged in, and click <a href="#" onClick={this.redetect.bind(this)}>re-detect</a>.
              {surveyLink}
            </SetupStep>
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_CONNECT]}
              stepName="Board connectable"
            >
              We found a board but it didn't respond properly when we tried to connect to it.
              <br/>You should make sure it has the right firmware sketch installed.
              You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
              {surveyLink}
            </SetupStep>
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
              stepName="Board components usable"
            >
              Oh no! Something unexpected went wrong while verifying the board components.
              <br/>You should make sure your board has the right firmware sketch installed.
              You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
              {surveyLink}
            </SetupStep>
          </div>
          <h2>Survey / Support</h2>
          <div>
            <p>Did it work? Having trouble?</p>

            <a
              href={this.getSurveyURL()}
              style={{'fontSize': '20px', marginBottom: 14, marginTop: 12, display: 'block'}}
            >
              Submit our quick survey&nbsp;
              <i className="fa fa-arrow-circle-o-right" />
            </a>
            <p>Results of setup status detection and browser/platform information will be pre-filled in the survey through the link above.</p>
          </div>
        </div>
    );
  }
}

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
