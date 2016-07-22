import BoardController from '@cdo/apps/makerlab/BoardController';
import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

const HIDDEN = 0;
const WAITING = 1;
const ATTEMPTING = 2;
const SUCCEEDED = 3;
const FAILED = 4;
const STEP_STATUSES = [HIDDEN, WAITING, ATTEMPTING, SUCCEEDED, FAILED];

const BoardSetupStatus = React.createClass({
  propTypes: {
    stepName: React.PropTypes.string.isRequired,
    stepId: React.PropTypes.string.isRequired,
    stepStatus: React.PropTypes.oneOf(STEP_STATUSES).isRequired,
  },
  render() {
    return (
        <div className="setup-status">
          <SetupStep stepStatus={WAITING} stepId="is-chrome" stepName="Chrome version 33+"/>
          <SetupStep stepStatus={WAITING} stepId="app-installed" stepName="Chrome App installed"/>
          <SetupStep stepStatus={WAITING} stepId="windows-drivers" stepName="Windows drivers installed"/>
          <SetupStep stepStatus={WAITING} stepId="board-plug" stepName="Board plugged in"/>
          <SetupStep stepStatus={WAITING} stepId="board-connect" stepName="Board connectable"/>
          <SetupStep stepStatus={WAITING} stepId="board-components" stepName="Board components usable"/>
        </div>
    );
  }
});

const SetupStep = React.createClass({
  render() {
    return (
        <div id={this.props.stepId} className="waiting"><i className="fa fa-fw fa-clock-o"/><span>{this.props.stepName}</span></div>
    );
  }
});

$(function () {
  ReactDOM.render((
        <BoardSetupStatus/>
  ), document.getElementById('setup-status-mount'));

  $('.maker-setup a').attr('target', '_blank');

  const isChrome = !!window.chrome;
  const gtChrome33 = isChrome && getChromeVersion() >= 33;

  function getChromeVersion() {
    const raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

    return raw ? parseInt(raw[2], 10) : false;
  }

  function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1;
  }

  function isWindows() {
    return navigator.platform.indexOf('Win') > -1;
  }

  if (isChrome) {
    if (gtChrome33) {
      check('#is-chrome');
    } else {
      $('#is-chrome').append("Your Chrome version is " + getChromeVersion() + ", please upgrade to at least version 33");
    }

    const bc = new BoardController();
    Promise.resolve().then(() => {
      spin('#app-installed');
      return bc.ensureAppInstalled()
          .then(() => check('#app-installed'))
          .catch((error) => fail('#app-installed'));
    }).then(() => {
      spin('#board-plug');
      return BoardController.getDevicePort()
          .then(() => check('#board-plug'))
          .catch((error) => fail('#board-plug'));
    }).then(() => {
      spin('#board-connect');
      return bc.ensureBoardConnected()
          .then(() => check('#board-connect'))
          .catch((error) => fail('#board-connect'));
    }).then(() => {
      spin('#board-components');
      return bc.connectWithComponents()
          .then(() => thumb('#board-components'))
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
          .then(() => check('#board-components'))
          .catch((error) => fail('#board-components'));
    });
  } else {
    fail('#is-chrome');
  }

  if (isWindows()) {
    $('#windows-drivers').removeClass('hidden').addClass('incomplete');
  }
});

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  });
}

function fail(selector, e) {
  $(selector).addClass('incomplete').removeClass('complete waiting');
  $(selector + ' i').removeClass('fa-spinner fa-spin').addClass('fa fa-times-circle');
  if (e) {
    console.error(e);
  }
}

function spin(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o').addClass('fa-spinner fa-spin');
}

function check(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o fa-spinner fa-thumbs-o-up fa-spin').addClass('fa-check-circle');
}

function thumb(selector) {
  $(selector).removeClass('waiting').addClass('complete');
  $(selector + ' i').removeClass('fa-times-circle fa-clock-o fa-spinner fa-spin').addClass('fa-thumbs-o-up');
}
