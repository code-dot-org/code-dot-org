/** @file Maker Board setup checker */
import React, {Component, PropTypes} from 'react';
import * as utils from '../../../../utils';
import trackEvent from '../../../../util/trackEvent';
import SetupChecker from '../util/SetupChecker';
import {
  isWindows,
  isChrome,
  isChromeOS,
  isCodeOrgBrowser,
  isLinux,
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

    Promise.resolve()

        // Are we using a compatible browser?
        .then(() => this.detectStep(STATUS_SUPPORTED_BROWSER,
            () => setupChecker.detectSupportedBrowser()))

        // Is Chrome App Installed?
        .then(() => (isChromeOS() || isChrome()) && this.detectStep(STATUS_APP_INSTALLED,
            () => setupChecker.detectChromeAppInstalled()))

        // Is board plugged in?
        .then(() => this.detectStep(STATUS_BOARD_PLUG,
            () => setupChecker.detectBoardPluggedIn()))

        // Can we talk to the firmware?
        .then(() => this.detectStep(STATUS_BOARD_CONNECT,
            () => setupChecker.detectCorrectFirmware()))

        // If we got this far, the drivers must be good.
        .then(() => this.succeed(STATUS_WINDOWS_DRIVERS))

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
          const extraErrorInfo = {};
          // If board connection failed, also mark the drivers step failed
          // so we display additional help information (it will only be
          // visible on Windows either way).
          if (this.state[STATUS_BOARD_PLUG] === Status.FAILED ||
            this.state[STATUS_BOARD_CONNECT] === Status.FAILED) {
            extraErrorInfo[STATUS_WINDOWS_DRIVERS] = Status.FAILED;
          }
          this.setState({caughtError: error, ...extraErrorInfo});
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
      || ((isChromeOS() || isChrome()) && this.state[STATUS_APP_INSTALLED] !== Status.SUCCEEDED)
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

  renderPlatformSpecificSteps() {
    if (isCodeOrgBrowser()) {
      // Maker Toolkit Standalone App
      return (
        <ValidationStep
          stepName="Code.org Browser"
          stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
        />
      );
    } else if (isChromeOS() || isChrome()) {
      // Chromebooks - Chrome App
      return (
        <ValidationStep
          stepName={'Chrome App installed' + (isChromeOS() ? '' : ' (Legacy)')}
          stepStatus={this.state[STATUS_APP_INSTALLED]}
        >
          Please install the
          {' '}
          <a
            href="https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg"
            target="_blank"
          >
            Code.org Serial Connector Chrome App
          </a>.
          <br/>Once it is installed, come back to this page and click the
          "re-detect" button, above.
          <br/>If a prompt asking for permission for Code Studio to connect
          to the Chrome App pops up, click Accept.
          {this.surveyLink()}
        </ValidationStep>
      );
    } else {
      // Unsupported Browser
      return (
        <ValidationStep
          stepName="Using a supported browser"
          stepStatus={Status.FAILED}
        >
          Your current browser is not supported at this time.
          Please install the latest version of <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.
        </ValidationStep>
      );
    }
  }

  surveyLink() {
    return (
      <span>
        <br/>Still having trouble?  Please <a href={this.getSurveyURL()}>submit our quick survey</a> about your setup issues.
      </span>
    );
  }

  render() {
    const linuxPermissionError = isLinux() && this.state.caughtError &&
      this.state.caughtError.message.includes('Permission denied');

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
            {this.renderPlatformSpecificSteps()}
            {isWindows() &&
              <ValidationStep
                stepStatus={this.state[STATUS_WINDOWS_DRIVERS]}
                stepName="Adafruit drivers installed"
              >
                We can't actually check this, but you should double-check that
                you have the <a href="https://learn.adafruit.com/adafruit-feather-32u4-basic-proto/using-with-arduino-ide#install-drivers-windows-only">Adafruit Windows Driver</a> installed.
              </ValidationStep>
            }
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_PLUG]}
              stepName="Board plugged in"
            >
              We couldn't detect a Circuit Playground board.
              Make sure your board is plugged in, and click <a href="#" onClick={this.redetect.bind(this)}>re-detect</a>.
              {this.surveyLink()}
            </ValidationStep>
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_CONNECT]}
              stepName="Board connectable"
            >
              We found a board but it didn't respond properly when we tried to connect to it.
              {linuxPermissionError &&
                <div>
                  <p>
                    We didn't have permission to open the serialport.  Please make sure you are a member of the 'dialout' group.
                  </p>
                  <p>
                    From your terminal, check which groups you belong to:
                  </p>
                  <pre>
                    groups $&#123;USER&#125;
                  </pre>
                  <p>
                    If you don't belong to 'dialout', you'll want to add yourself to that group:
                  </p>
                  <pre>
                    sudo gpasswd --add $&#123;USER&#125; dialout
                  </pre>
                </div>
              }
              {!linuxPermissionError &&
                <div>
                  You should make sure it has the right firmware sketch installed.
                  You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
                </div>
              }
              {this.surveyLink()}
            </ValidationStep>
            <ValidationStep
              stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
              stepName="Board components usable"
            >
              Oh no! Something unexpected went wrong while verifying the board components.
              <br/>You should make sure your board has the right firmware sketch installed.
              You can <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">install the Circuit Playground Firmata sketch with these instructions</a>.
              {this.surveyLink()}
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
