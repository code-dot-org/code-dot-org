/** @file Maker Board setup checker */
import React, {Component, PropTypes} from 'react';
import * as utils from '../../../../utils';
import trackEvent from '../../../../util/trackEvent';
import SetupChecker from '../util/SetupChecker';
import {
  isWindows,
  isChrome,
  getChromeVersion,
  isCodeOrgBrowser,
} from '../util/browserChecks';
import ValidationStep, {Status} from '../../../ui/ValidationStep';
import SurveySupportSection from './SurveySupportSection';

const STATUS_SUPPORTED_BROWSER = 'statusSupportedBrowser';
const STATUS_APP_INSTALLED = 'statusAppInstalled';
const STATUS_WINDOWS_DRIVERS = 'statusWindowsDrivers';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';

const initialState = {
  isDetecting: false,
  caughtError: null,
  [STATUS_SUPPORTED_BROWSER]: Status.WAITING,
  [STATUS_APP_INSTALLED]: Status.WAITING,
  [STATUS_WINDOWS_DRIVERS]: Status.WAITING,
  [STATUS_BOARD_PLUG]: Status.WAITING,
  [STATUS_BOARD_CONNECT]: Status.WAITING,
  [STATUS_BOARD_COMPONENTS]: Status.WAITING,
};

export default class SetupChecklist extends Component {
  state = {...initialState};

  static propTypes = {
    setupChecker: PropTypes.instanceOf(SetupChecker).isRequired,
    stepDelay: PropTypes.number,
  };

  hide(selector) {
    this.setState({[selector]: Status.HIDDEN});
  }

  fail(selector) {
    this.setState({[selector]: Status.FAILED});
  }

  spin(selector) {
    this.setState({[selector]: Status.ATTEMPTING});
  }

  succeed(selector) {
    this.setState({[selector]: Status.SUCCEEDED});
  }

  thumb(selector) {
    this.setState({[selector]: Status.CELEBRATING});
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
        .then(() => this.detectStep(STATUS_SUPPORTED_BROWSER,
            () => setupChecker.detectSupportedBrowser()))

        // Is Chrome App Installed?
        .then(() => isChrome() && this.detectStep(STATUS_APP_INSTALLED,
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
        .then(() => trackEvent('MakerSetup', 'ConnectionSuccess'))

        // If anything goes wrong along the way, we'll end up in this
        // catch clause - make sure to report the error out.
        .catch(error => {
          this.setState({caughtError: error});
          trackEvent('MakerSetup', 'ConnectionError');
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
    if (
      this.state[STATUS_SUPPORTED_BROWSER] !== Status.SUCCEEDED
      || (isChrome() && this.state[STATUS_APP_INSTALLED] !== Status.SUCCEEDED)
    ) {
      // If the Chrome app was not installed last time we checked, but has been
      // installed since, we'll probably need a full page reload to pick it up.
      utils.reload();
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
            {this.state[STATUS_SUPPORTED_BROWSER] !== Status.SUCCEEDED &&
              <ValidationStep
                stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
                stepName="Using a supported browser"
              >
                {isChrome() && `It looks like your Chrome version is ${getChromeVersion()}.`}
                Your current browser is not supported at this time.
                Please install the latest version of <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.
                <br/><em>Note: We plan to support other browsers including Internet Explorer in Fall 2017.</em>
              </ValidationStep>
            }
            {this.state[STATUS_SUPPORTED_BROWSER] === Status.SUCCEEDED && isCodeOrgBrowser() &&
              <ValidationStep
                stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
                stepName="Code.org Browser"
              />
            }
            {this.state[STATUS_SUPPORTED_BROWSER] === Status.SUCCEEDED && isChrome() &&
              <div>
                <ValidationStep
                  stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
                  stepName="Chrome version 33+"
                />
                <ValidationStep
                  stepStatus={this.state[STATUS_APP_INSTALLED]}
                  stepName="Chrome App installed"
                >
                  Please install the
                  {' '}
                  <a
                    href="https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg"
                    target="_blank"
                  >
                    Code.org Serial Connector Chrome App extension
                  </a>.
                  <br/>Once it is installed, come back to this page and click the
                  "re-detect" button, above.
                  <br/>If a prompt asking for permission for Code Studio to connect
                  to the Chrome App pops up, click Accept.
                  {surveyLink}
                </ValidationStep>
              </div>
            }
            <ValidationStep
              stepStatus={this.state[STATUS_WINDOWS_DRIVERS]}
              stepName="Windows drivers installed? (cannot auto-check)"
            />
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_PLUG]}
              stepName="Board plugged in"
            >
              We couldn't detect a Circuit Playground board.
              Make sure your board is plugged in, and click <a href="#" onClick={this.redetect.bind(this)}>re-detect</a>.
              {surveyLink}
            </ValidationStep>
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_CONNECT]}
              stepName="Board connectable"
            >
              We found a board but it didn't respond properly when we tried to connect to it.
              <br/>You should make sure it has the right firmware sketch installed.
              You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
              {surveyLink}
            </ValidationStep>
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
              stepName="Board components usable"
            >
              Oh no! Something unexpected went wrong while verifying the board components.
              <br/>You should make sure your board has the right firmware sketch installed.
              You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
              {surveyLink}
            </ValidationStep>
          </div>
          <SurveySupportSection surveyUrl={this.getSurveyURL()}/>
        </div>
    );
  }
}

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
