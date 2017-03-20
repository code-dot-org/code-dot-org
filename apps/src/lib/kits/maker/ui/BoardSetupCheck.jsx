/** @file Maker Board setup checker */
import React, {Component} from 'react';
import CircuitPlaygroundBoard from '../CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '../portScanning';
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

export default class BoardSetupCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {...initialState};
  }

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
    this.setState({...initialState, isDetecting: true});

    if (!isWindows()) {
      this.hide(STATUS_WINDOWS_DRIVERS);
    }

    let portName = null;
    let boardController = null;

    Promise.resolve()

        // Are we using a compatible browser?
        .then(() => this.detectChromeVersion())

        // Is Chrome App Installed?
        .then(() => this.detectChromeAppInstalled())

        // Is board plugged in?
        .then(() => this.detectBoardPluggedIn())
        .then(usablePort => portName = usablePort)

        // Can we talk to the firmware?
        .then(() => this.detectCorrectFirmware(portName))
        .then(board => boardController = board)

        // Can we initialize components successfully?
        .then(() => this.detectComponentsInitialize(boardController))

        // Everything looks good, let's par-tay!
        .then(() => this.celebrate(boardController))

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
          if (boardController) {
            boardController.destroy();
            boardController = null;
          }
          portName = null;
          this.setState({isDetecting: false});
        });
  }

  detectChromeVersion() {
    this.spin(STATUS_IS_CHROME);
    return promiseWaitFor(200)
        .then(() => {
          if (!isChrome()) {
            return Promise.reject(new Error('Not using Chrome'));
          }

          if (!gtChrome33()) {
            return Promise.reject(new Error('Not using Chrome > v33'));
          }

          this.succeed(STATUS_IS_CHROME);
        })
        .catch(error => {
          this.fail(STATUS_IS_CHROME);
          return Promise.reject(error);
        });
  }

  /**
   * @return {Promise}
   */
  detectChromeAppInstalled() {
    this.spin(STATUS_APP_INSTALLED);
    return promiseWaitFor(200)
        .then(ensureAppInstalled)
        .then(() => this.succeed(STATUS_APP_INSTALLED))
        .catch(error => {
          this.fail(STATUS_APP_INSTALLED);
          return Promise.reject(error);
        });
  }

  /**
   * @return {Promise.<string>} Resolves to usable port name
   */
  detectBoardPluggedIn() {
    this.spin(STATUS_BOARD_PLUG);
    return promiseWaitFor(200)
        .then(findPortWithViableDevice)
        .then(portName => {
          this.succeed(STATUS_BOARD_PLUG);
          return portName;
        })
        .catch(error => {
          this.fail(STATUS_BOARD_PLUG);
          return Promise.reject(error);
        });
  }

  /**
   * @return {Promise.<CircuitPlaygroundBoard>}
   */
  detectCorrectFirmware(portName) {
    this.spin(STATUS_BOARD_CONNECT);
    const boardController = new CircuitPlaygroundBoard(portName);
    return boardController.connectToFirmware()
        .then(() => {
          this.succeed(STATUS_BOARD_CONNECT);
          return boardController;
        })
        .catch(error => {
          this.fail(STATUS_BOARD_CONNECT);
          return Promise.reject(error);
        });
  }

  /**
   * @return {Promise}
   */
  detectComponentsInitialize(boardController) {
    this.spin(STATUS_BOARD_COMPONENTS);
    return promiseWaitFor(200)
        .then(() => boardController.initializeComponents())
        .then(() => this.succeed(STATUS_BOARD_COMPONENTS))
        .catch(error => {
          this.fail(STATUS_BOARD_COMPONENTS);
          return Promise.reject(error);
        });
  }

  /**
   * @return {Promise}
   */
  celebrate(boardController) {
    this.thumb(STATUS_BOARD_COMPONENTS);
    return boardController.celebrateSuccessfulConnection()
        .then(() => this.succeed(STATUS_BOARD_COMPONENTS));
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
              Please install the <a href="https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg">Code.org Serial Connector Chrome App extension</a>.
              <br/>Once it is installed, come back to this page and click the "re-detect" button, above.
              <br/>If a dialog asking for permission for Code Studio to connect to the Chrome App pops up, click Accept.
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

function isChrome() {
  return !!window.chrome;
}

function getChromeVersion() {
  const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : false;
}

function gtChrome33() {
  return getChromeVersion() >= 33;
}

function isWindows() {
  return navigator.platform.indexOf('Win') > -1;
}
