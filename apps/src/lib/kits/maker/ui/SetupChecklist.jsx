/** @file Maker Board setup checker */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import * as utils from '../../../../utils';
import trackEvent from '../../../../util/trackEvent';
import SetupChecker from '../util/SetupChecker';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import {
  isWindows,
  isChrome,
  isChromeOS,
  isCodeOrgBrowser,
  isLinux
} from '../util/browserChecks';
import ValidationStep, {Status} from '../../../ui/ValidationStep';
import {BOARD_TYPE} from '../CircuitPlaygroundBoard';
import experiments from '@cdo/apps/util/experiments';
import _ from 'lodash';
import yaml from 'js-yaml';
import Button from '@cdo/apps/templates/Button';

const STATUS_SUPPORTED_BROWSER = 'statusSupportedBrowser';
const STATUS_APP_INSTALLED = 'statusAppInstalled';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';
const STATUS_BOARD_FIRMWARE = 'statusBoardFirmware';

const initialState = {
  isDetecting: false,
  caughtError: null,
  boardTypeDetected: BOARD_TYPE.OTHER,
  [STATUS_SUPPORTED_BROWSER]: Status.WAITING,
  [STATUS_APP_INSTALLED]: Status.WAITING,
  [STATUS_BOARD_PLUG]: Status.WAITING,
  [STATUS_BOARD_CONNECT]: Status.WAITING,
  [STATUS_BOARD_COMPONENTS]: Status.WAITING,
  [STATUS_BOARD_FIRMWARE]: Status.ALERT
};

export default class SetupChecklist extends Component {
  state = {...initialState};

  static propTypes = {
    setupChecker: PropTypes.instanceOf(SetupChecker).isRequired,
    stepDelay: PropTypes.number
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

  detect() {
    const {setupChecker} = this.props;
    this.setState({...initialState, isDetecting: true});

    Promise.resolve()

      // Are we using a compatible browser?
      .then(() =>
        this.detectStep(STATUS_SUPPORTED_BROWSER, () =>
          setupChecker.detectSupportedBrowser()
        )
      )

      // Is Chrome App Installed?
      .then(
        () =>
          (isChromeOS() || isChrome()) &&
          this.detectStep(STATUS_APP_INSTALLED, () =>
            setupChecker.detectChromeAppInstalled()
          )
      )

      // Is board plugged in?
      .then(() =>
        this.detectStep(STATUS_BOARD_PLUG, () =>
          setupChecker.detectBoardPluggedIn()
        )
      )

      // Can we talk to the firmware?
      .then(() =>
        this.detectStep(STATUS_BOARD_CONNECT, () =>
          setupChecker.detectCorrectFirmware()
        )
      )

      // What type of board is this?
      .then(() => {
        this.setState({boardTypeDetected: setupChecker.detectBoardType()});
        Promise.resolve();
      })

      // Can we initialize components successfully?
      .then(() =>
        this.detectStep(STATUS_BOARD_COMPONENTS, () =>
          setupChecker.detectComponentsInitialize()
        )
      )

      // Everything looks good, let's par-tay!
      .then(() => this.thumb(STATUS_BOARD_COMPONENTS))
      .then(() => setupChecker.celebrate())
      .then(() => this.succeed(STATUS_BOARD_COMPONENTS))
      .then(() => trackEvent('MakerSetup', 'ConnectionSuccess'))

      // If anything goes wrong along the way, we'll end up in this
      // catch clause - make sure to report the error out.
      .catch(error => {
        const extraErrorInfo = {};
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
   * Update the firmware on the attached board. Currently, only the CPClassic can be flashed.
   * @return {Promise}
   */
  updateBoardFirmware() {
    this.setState({[STATUS_BOARD_FIRMWARE]: Status.ATTEMPTING});
    latestFirmware(
      'https://s3.amazonaws.com/downloads.code.org/maker/latest-firmware.yml'
    ).then(firmware => {
      return window.MakerBridge.flashBoardFirmware({
        boardName: 'circuit-playground-classic',
        hexPath: firmware.url,
        checksum: firmware.checksum
      }).then(() => this.setState({[STATUS_BOARD_FIRMWARE]: Status.SUCCEEDED}));
    });
  }

  /**
   * Helper to be used on second/subsequent attempts at detecing board usability.
   */
  redetect() {
    if (
      this.state[STATUS_SUPPORTED_BROWSER] !== Status.SUCCEEDED ||
      ((isChromeOS() || isChrome()) &&
        this.state[STATUS_APP_INSTALLED] !== Status.SUCCEEDED)
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
          Please install the{' '}
          <a
            href="https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg"
            target="_blank"
          >
            Code.org Serial Connector Chrome App
          </a>
          .
          <br />
          Once it is installed, come back to this page and click the "re-detect"
          button, above.
          <br />
          If a prompt asking for permission for Code Studio to connect to the
          Chrome App pops up, click Accept.
          {this.contactSupport()}
        </ValidationStep>
      );
    } else {
      // Unsupported Browser
      return (
        <ValidationStep
          stepName="Using a supported browser"
          stepStatus={Status.FAILED}
        >
          Your current browser is not supported at this time. Please install the
          latest version of{' '}
          <a href="https://www.google.com/chrome/browser/">Google Chrome</a>.
        </ValidationStep>
      );
    }
  }

  contactSupport() {
    return <SafeMarkdown markdown={i18n.contactGeneralSupport()} />;
  }

  render() {
    const linuxPermissionError =
      isLinux() &&
      this.state.caughtError &&
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
          <ValidationStep
            stepStatus={this.state[STATUS_BOARD_PLUG]}
            stepName={i18n.validationStepBoardPluggedIn()}
          >
            {this.state.caughtError && this.state.caughtError.reason && (
              <pre>{this.state.caughtError.reason}</pre>
            )}
            We couldn't detect a Circuit Playground board. Make sure your board
            is plugged in, and click{' '}
            <a href="#" onClick={this.redetect.bind(this)}>
              re-detect
            </a>
            .
            {isWindows() && (
              <p>
                If your board is plugged in, you may be missing the{' '}
                <strong>Adafruit Windows Drivers</strong>. Follow the
                instructions{' '}
                <a href="https://learn.adafruit.com/adafruit-feather-32u4-basic-proto/using-with-arduino-ide#install-drivers-windows-only">
                  on this page
                </a>{' '}
                to install the drivers and try again.
              </p>
            )}
            {this.contactSupport()}
          </ValidationStep>
          <ValidationStep
            stepStatus={this.state[STATUS_BOARD_CONNECT]}
            stepName={i18n.validationStepBoardConnectable()}
          >
            We found a board but it didn't respond properly when we tried to
            connect to it.
            {linuxPermissionError && (
              <div>
                <p>
                  We didn't have permission to open the serialport. Please make
                  sure you are a member of the 'dialout' group.
                </p>
                <p>From your terminal, check which groups you belong to:</p>
                <pre>groups $&#123;USER&#125;</pre>
                <p>
                  If you don't belong to 'dialout', you'll want to add yourself
                  to that group:
                </p>
                <pre>sudo gpasswd --add $&#123;USER&#125; dialout</pre>
                <p>
                  You may need to restart your computer for changes to take
                  effect.
                </p>
              </div>
            )}
            {!linuxPermissionError && (
              <div>
                You should make sure it has the right firmware sketch installed.
                You can{' '}
                <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">
                  install the Circuit Playground Firmata sketch with these
                  instructions
                </a>
                .
              </div>
            )}
            {this.contactSupport()}
          </ValidationStep>
          <ValidationStep
            stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
            stepName={i18n.validationStepBoardComponentsUsable()}
          >
            Oh no! Something unexpected went wrong while verifying the board
            components.
            <br />
            You should make sure your board has the right firmware sketch
            installed. You can{' '}
            <a href="https://learn.adafruit.com/circuit-playground-firmata/overview">
              install the Circuit Playground Firmata sketch with these
              instructions
            </a>
            .{this.contactSupport()}
          </ValidationStep>
          {experiments.isEnabled('flash-classic') &&
            this.state.boardTypeDetected !== BOARD_TYPE.OTHER && (
              <ValidationStep
                stepStatus={this.state[STATUS_BOARD_FIRMWARE]}
                stepName={i18n.validationStepBoardFirmware()}
              >
                <div>
                  <p>{i18n.updateFirmwareExplanation()}</p>
                  <p>
                    {this.state.boardTypeDetected === BOARD_TYPE.CLASSIC
                      ? i18n.updateFirmwareExplanationClassic()
                      : i18n.updateFirmwareExplanationExpress()}
                  </p>
                  <Button
                    text={i18n.updateFirmware()}
                    onClick={
                      this.state.boardTypeDetected === BOARD_TYPE.CLASSIC
                        ? () => this.updateBoardFirmware()
                        : null
                    }
                    href={
                      this.state.boardTypeDetected === BOARD_TYPE.CLASSIC
                        ? null
                        : 'https://learn.adafruit.com/adafruit-circuit-playground-express/code-org-csd'
                    }
                  />
                </div>
              </ValidationStep>
            )}
        </div>
        <div>
          <h2>{i18n.support()}</h2>
          <SafeMarkdown markdown={i18n.debugMakerToolkit()} />
          {this.contactSupport()}
        </div>
      </div>
    );
  }
}

const latestFirmware = _.memoize(latestYamlUrl => {
  return fetch(latestYamlUrl, {mode: 'cors'})
    .then(response => response.text())
    .then(text => yaml.safeLoad(text))
    .then(data => ({
      url: data.url,
      checksum: data.checksum
    }));
});

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
