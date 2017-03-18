import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';
import {ensureAppInstalled, findPortWithViableDevice} from '@cdo/apps/lib/kits/maker/portScanning';
import React from 'react';
import ReactDOM from 'react-dom';

const HIDDEN = 'HIDDEN';
const WAITING = 'WAITING';
const ATTEMPTING = 'ATTEMPTING';
const SUCCEEDED = 'SUCCEEDED';
const FAILED = 'FAILED';
const CELEBRATING = 'CELEBRATING';
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED, CELEBRATING];

const STATUS_IS_CHROME = 'statusIsChrome';
const STATUS_APP_INSTALLED = 'statusAppInstalled';
const STATUS_WINDOWS_DRIVERS = 'statusWindowsDrivers';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';

const BoardSetupStatus = React.createClass({
  getInitialState() {
    return {
      isDetecting: false,
      [STATUS_IS_CHROME]: WAITING,
      [STATUS_APP_INSTALLED]: WAITING,
      [STATUS_WINDOWS_DRIVERS]: WAITING,
      [STATUS_BOARD_PLUG]: WAITING,
      [STATUS_BOARD_CONNECT]: WAITING,
      [STATUS_BOARD_COMPONENTS]: WAITING
    };
  },

  getSurveyURL() {
    const baseFormURL = 'https://docs.google.com/forms/d/e/1FAIpQLSe4NB7weq20sydf4kKn3QzIIn1O91hfPNU0U6b2xc1W6w44eQ/viewform';
    const userAgentFieldFill = `entry.1520933088=${encodeURIComponent(navigator.userAgent)}`;
    const prettifiedCurrentStates = JSON.stringify(this.state, null, 2);
    const setupStatesFieldFill = `entry.804069894=${encodeURIComponent(prettifiedCurrentStates)}`;
    return `${baseFormURL}?${userAgentFieldFill}&${setupStatesFieldFill}`;
  },

  detect() {
    this.setState({...this.getInitialState(), isDetecting: true});

    if (!isChrome()) {
      this.fail(STATUS_IS_CHROME);
      return;
    }

    if (!isWindows()) {
      this.hide(STATUS_WINDOWS_DRIVERS);
    }

    if (gtChrome33()) {
      this.succeed(STATUS_IS_CHROME);
    } else {
      this.fail(STATUS_IS_CHROME);
    }

    let portName = null;
    let boardController = null;

    Promise.resolve()

        // Is Chrome App Installed?
        .then(() => this.spin(STATUS_APP_INSTALLED))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() =>
            ensureAppInstalled()
                .then(() => this.succeed(STATUS_APP_INSTALLED))
                .catch(error => this.fail(STATUS_APP_INSTALLED))
        )

        // Is board plugged in?
        .then(() => this.spin(STATUS_BOARD_PLUG))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() =>
            findPortWithViableDevice()
                .then(usablePort => {
                  portName = usablePort;
                  this.succeed(STATUS_BOARD_PLUG);
                })
                .catch(error => this.fail(STATUS_BOARD_PLUG))
        )

        // Can we talk to the firmware?
        .then(() => this.spin(STATUS_BOARD_CONNECT))
        .then(() => {
              boardController = new CircuitPlaygroundBoard(portName);
              return boardController.connectToFirmware()
                  .then(() => this.succeed(STATUS_BOARD_CONNECT))
                  .catch(error => this.fail(STATUS_BOARD_CONNECT));
            }
        )

        // Can we initialize components successfully?
        .then(() => this.spin(STATUS_BOARD_COMPONENTS))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() => boardController.initializeComponents())
        .then(() => this.thumb(STATUS_BOARD_COMPONENTS))
        .then(() => boardController.celebrateSuccessfulConnection())
        .then(() => this.succeed(STATUS_BOARD_COMPONENTS))
        .catch(error => {
          console.log(error);
          this.fail(STATUS_BOARD_COMPONENTS);
        })

        // Put the board back in its original state, if possible
        .then(() => boardController.destroy())
        .then(() => this.setState({isDetecting: false}));
  },

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
  },

  componentDidMount() {
    this.detect();
  },

  render() {
    return (
        <div>
          <h2>
            Setup Status
            <input
              style={{marginLeft: 9, marginTop: -4}}
              className="btn"
              type="button"
              value="re-detect"
              onClick={this.redetect}
              disabled={this.state.isDetecting}
            />
          </h2>
          <div className="setup-status" style={{'fontSize': '26px'}}>
            <SetupStep
              stepStatus={this.state[STATUS_IS_CHROME]}
              stepName="Chrome version 33+"
            >
              {isChrome() && ` - Your Chrome version is ${getChromeVersion()}, please upgrade to at least version 33`}
            </SetupStep>
            <SetupStep
              stepStatus={this.state[STATUS_APP_INSTALLED]}
              stepName="Chrome App installed"
            />
            <SetupStep
              stepStatus={this.state[STATUS_WINDOWS_DRIVERS]}
              stepName="Windows drivers installed? (cannot auto-check)"
            />
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_PLUG]}
              stepName="Board plugged in"
            />
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_CONNECT]}
              stepName="Board connectable"
            />
            <SetupStep
              stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
              stepName="Board components usable"
            />
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
  },

  hide(selector) {
    this.setState({[selector]: HIDDEN});
  },

  fail(selector) {
    this.setState({[selector]: FAILED});
  },

  spin(selector) {
    this.setState({[selector]: ATTEMPTING});
  },

  succeed(selector) {
    this.setState({[selector]: SUCCEEDED});
  },

  thumb(selector) {
    this.setState({[selector]: CELEBRATING});
  },
});

const SetupStep = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    stepName: React.PropTypes.string.isRequired,
    stepStatus: React.PropTypes.oneOf(STEP_STATUSES).isRequired
  },

  iconFor(stepStatus) {
    switch (stepStatus) {
      case WAITING:
        return "fa fa-fw fa-clock-o";
      case ATTEMPTING:
        return "fa fa-fw fa-spinner fa-spin";
      case SUCCEEDED:
        return "fa fa-fw fa-check-circle";
      case CELEBRATING:
        return "fa fa-fw fa-thumbs-o-up";
      case FAILED:
        return "fa fa-fw fa-times-circle";
      default:
        throw new Error('Unknown step status.');
    }
  },

  styleFor(stepStatus) {
    switch (stepStatus) {
      case ATTEMPTING:
      case WAITING:
        return {color: '#949ca2'};
      case SUCCEEDED:
      case CELEBRATING:
        return {color: 'green'};
      case HIDDEN:
        return {display: 'none'};
      default:
        return {color: 'red', fontWeight: 'bold'};
    }
  },

  render() {
    if (this.props.stepStatus === HIDDEN) {
      return null;
    }
    return (
        <div style={Object.assign({margin: '15px 0'}, this.styleFor(this.props.stepStatus))}>
          <i style={{'marginRight': '6px'}} className={this.iconFor(this.props.stepStatus)}/>
          <span>{this.props.stepName}</span>
          {this.props.stepStatus === FAILED && this.props.children}
        </div>
    );
  }
});

$(function () {
  ReactDOM.render(<BoardSetupStatus/>, document.getElementById('setup-status-mount'));
  $('.maker-setup a').attr('target', '_blank');
});

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
