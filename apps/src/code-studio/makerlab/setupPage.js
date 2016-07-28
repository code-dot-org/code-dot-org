import BoardController from '@cdo/apps/makerlab/BoardController';
import React from 'react';
import ReactDOM from 'react-dom';

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
    };
  },

  render() {
    return (
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
            stepName="Windows drivers installed"
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
              ], tempo: 41500
            });
            bc.prewiredComponents.colorLeds.forEach(l => l.color('green'));
          })
          .then(() => promiseWaitFor(1600))
          .then(() => bc.prewiredComponents.colorLeds.forEach(l => l.off()))
          .then(() => this.succeed('board-components'))
          .catch((error) => this.fail('board-components'));
    });
  }
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
