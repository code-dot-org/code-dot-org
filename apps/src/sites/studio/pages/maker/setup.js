import BoardController from '@cdo/apps/lib/kits/maker/BoardController';
import {SONG_CHARGE} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';
import React from 'react';
import ReactDOM from 'react-dom';

const HIDDEN = 'HIDDEN';
const WAITING = 'WAITING';
const ATTEMPTING = 'ATTEMPTING';
const SUCCEEDED = 'SUCCEEDED';
const FAILED = 'FAILED';
const CELEBRATING = 'CELEBRATING';
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED, CELEBRATING];

const BoardSetupStatus = React.createClass({
  getInitialState() {
    return {
      isDetecting: false,
      'status-is-chrome': WAITING,
      'status-app-installed': WAITING,
      'status-windows-drivers': WAITING,
      'status-board-plug': WAITING,
      'status-board-connect': WAITING,
      'status-board-components': WAITING
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
      this.fail('is-chrome');
      return;
    }

    if (!isWindows()) {
      this.hide('windows-drivers');
    }

    if (gtChrome33()) {
      this.succeed('is-chrome');
    } else {
      this.fail('is-chrome');
    }

    const bc = new BoardController();
    Promise.resolve()

        // Is Chrome App Installed?
        .then(() => this.spin('app-installed'))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() =>
            BoardController.ensureAppInstalled()
                .then(() => this.succeed('app-installed'))
                .catch(error => this.fail('app-installed')))

        // Is board plugged in?
        .then(() => this.spin('board-plug'))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() =>
            BoardController.getDevicePortName()
                .then(() => this.succeed('board-plug'))
                .catch(error => this.fail('board-plug')))

        // Can we talk to the firmware?
        .then(() => this.spin('board-connect'))
        .then(() =>
            bc.ensureBoardConnected()
                .then(() => this.succeed('board-connect'))
                .catch(error => this.fail('board-connect')))

        // Can we initialize components successfully?
        .then(() => this.spin('board-components'))
        .then(() => promiseWaitFor(200)) // Artificial delay feels better
        .then(() => bc.connectWithComponents())
        .then(() => this.celebrateAllSuccessful(bc))
        .catch(error => this.fail('board-components'))

        // Put the board back in its original state, if possible
        .then(() => bc.reset())
        .then(() => this.setState({isDetecting: false}));
  },

  /**
   * Play a song and animate some LEDs to demonstrate successful connection
   * to the board.
   * @param {BoardController} bc
   * @returns {Promise} resolved when the song and animation are done.
   */
  celebrateAllSuccessful(bc) {
    /**
     * Run given function for each LED on the board in sequence, with givcen
     * delay between them.
     * @param {function(five.Led.RGB)} func
     * @param {number} delay in milliseconds
     * @returns {Promise} resolves after func is called for the last LED
     */
    function forEachLedInSequence(func, delay) {
      return new Promise(resolve => {
        const leds = bc.prewiredComponents.colorLeds;
        let ledIndex = 0;
        const interval = setInterval(() => {
          func(leds[ledIndex]);
          ledIndex++;
          if (ledIndex >= leds.length) {
            clearInterval(interval);
            resolve();
          }
        }, delay);
      });
    }

    return Promise.resolve()
        .then(() => this.thumb('board-components'))
        .then(() => bc.prewiredComponents.buzzer.play(SONG_CHARGE, 104))
        .then(() => forEachLedInSequence(led => led.color('green'), 80))
        .then(() => forEachLedInSequence(led => led.off(), 80))
        .then(() => this.succeed('board-components'));
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
              onClick={this.detect}
              disabled={this.state.isDetecting}
            />
          </h2>
          <div className="setup-status" style={{'fontSize': '26px'}}>
            <SetupStep
              stepStatus={this.state['status-is-chrome']}
              stepName="Chrome version 33+"
            >
              {isChrome() && " - Your Chrome version is " + getChromeVersion() + ", please upgrade to at least version 33"}
            </SetupStep>
            <SetupStep
              stepStatus={this.state['status-app-installed']}
              stepName="Chrome App installed"
            />
            <SetupStep
              stepStatus={this.state['status-windows-drivers']}
              stepName="Windows drivers installed? (cannot auto-check)"
            />
            <SetupStep
              stepStatus={this.state['status-board-plug']}
              stepName="Board plugged in"
            />
            <SetupStep
              stepStatus={this.state['status-board-connect']}
              stepName="Board connectable"
            />
            <SetupStep
              stepStatus={this.state['status-board-components']}
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
    this.setState({[`status-${selector}`]: HIDDEN});
  },

  fail(selector) {
    this.setState({[`status-${selector}`]: FAILED});
  },

  spin(selector) {
    this.setState({[`status-${selector}`]: ATTEMPTING});
  },

  succeed(selector) {
    this.setState({[`status-${selector}`]: SUCCEEDED});
  },

  thumb(selector) {
    this.setState({[`status-${selector}`]: CELEBRATING});
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
