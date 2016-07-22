import BoardController from '@cdo/apps/makerlab/BoardController';
import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const HIDDEN = 0;
const WAITING = 1;
const ATTEMPTING = 2;
const SUCCEEDED = 3;
const FAILED = 4;
const CELEBRATING = 5;
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED, CELEBRATING];

const BoardSetupStatus = React.createClass({
  getInitialState() {
    return {
      'status-is-chrome': WAITING,
      'status-app-installed': WAITING,
      'status-windows-drivers': WAITING,
      'status-board-plug': WAITING,
      'status-board-connect': WAITING,
      'status-board-components': WAITING
    }
  },

  render() {
    return (
        <div className="setup-status">
          <SetupStep stepStatus={this.state['status-is-chrome']}
                     stepId="is-chrome"
                     stepName="Chrome version 33+"/>
          <SetupStep stepStatus={this.state['status-app-installed']}
                     stepId="app-installed"
                     stepName="Chrome App installed"/>
          <SetupStep stepStatus={this.state['status-windows-drivers']}
                     stepId="windows-drivers"
                     stepName="Windows drivers installed"/>
          <SetupStep stepStatus={this.state['status-board-plug']}
                     stepId="board-plug"
                     stepName="Board plugged in"/>
          <SetupStep stepStatus={this.state['status-board-connect']}
                     stepId="board-connect"
                     stepName="Board connectable"/>
          <SetupStep stepStatus={this.state['status-board-components']}
                     stepId="board-components"
                     stepName="Board components usable"/>
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

  componentDidMount() {
    const isChrome = !!window.chrome;
    const gtChrome33 = isChrome && getChromeVersion() >= 33;

    function getChromeVersion() {
      const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
      return raw ? parseInt(raw[2], 10) : false;
    }

    function isWindows() {
      return navigator.platform.indexOf('Win') > -1;
    }

    if (isChrome) {
      if (gtChrome33) {
        this.succeed('is-chrome');
      } else {
        $('is-chrome').append("Your Chrome version is " + getChromeVersion() + ", please upgrade to at least version 33");
      }

      const bc = new BoardController();
      Promise.resolve().then(() => {
        this.spin('app-installed');
        return bc.ensureAppInstalled()
            .then(() => this.succeed('app-installed'))
            .catch((error) => this.fail('app-installed'));
      }).then(() => {
        this.spin('board-plug');
        return BoardController.getDevicePort()
            .then(() => this.succeed('board-plug'))
            .catch((error) => this.fail('board-plug'));
      }).then(() => {
        this.spin('board-connect');
        return bc.ensureBoardConnected()
            .then(() => this.succeed('board-connect'))
            .catch((error) => this.fail('board-connect'));
      }).then(() => {
        this.spin('board-components');
        return bc.connectWithComponents()
            .then(() => this.thumb('board-components'))
            .then(() => {
              bc.prewiredComponents.buzzer.play({
                song: [
                  ["G3", 100], ["C4", 100], ["E4", 100], ["G4", 50],
                  [null, 150], ["E4", 75], ["G4", 400]
                ], tempo: 45000
              });
              bc.prewiredComponents.colorLeds.forEach(l => l.color('green'));
            })
            .then(() => promiseWaitFor(1600))
            .then(() => {
              bc.prewiredComponents.colorLeds.forEach(l => l.off());
              bc.prewiredComponents.buzzer.play({
                song: [["C4", 100]],
                tempo: 45000
              });
            })
            .then(() => this.succeed('board-components'))
            .catch((error) => this.fail('board-components'));
      });
    } else {
      this.fail('is-chrome');
    }

    if (!isWindows()) {
      this.hide('windows-drivers');
    }
  }
});

const SetupStep = React.createClass({
  propTypes: {
    stepName: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.string.isRequired,
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

  classFor(stepStatus) {
    switch (stepStatus) {
      case WAITING:
        return 'waiting';
      case SUCCEEDED:
      case CELEBRATING:
        return 'complete';
      case ATTEMPTING:
        return 'waiting';
        return 'waiting';
      case HIDDEN:
        return 'hidden';
      default:
        return 'incomplete';
    }
  },

  render() {
    if (this.props.stepStatus === HIDDEN) {
      return null;
    }
    return (
        <div id={this.props.stepId}
             className={this.classFor(this.props.stepStatus)}>
          <i className={this.iconFor(this.props.stepStatus)}/>
          <span>{this.props.stepName}</span>
        </div>
    );
  }
});

$(function () {
  ReactDOM.render((
      <BoardSetupStatus/>
  ), document.getElementById('setup-status-mount'));
  $('.maker-setup a').attr('target', '_blank');
});

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}


