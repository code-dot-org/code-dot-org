/** @file Maker Board setup checker */
import PropTypes from 'prop-types';

import React, {Component} from 'react';
import * as utils from '../../../../utils';
import trackEvent from '../../../../util/trackEvent';
import SetupChecker from '../util/SetupChecker';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import applabI18n from '@cdo/applab/locale';
import {
  isWindows,
  isChrome,
  isChromeOS,
  isCodeOrgBrowser,
  isLinux
} from '../util/browserChecks';
import ValidationStep, {Status} from '../../../ui/ValidationStep';
import experiments from '@cdo/apps/util/experiments';
import {BOARD_TYPE} from '../util/boardUtils';
import {CHROME_APP_WEBSTORE_URL} from '../util/makerConstants';

const STATUS_SUPPORTED_BROWSER = 'statusSupportedBrowser';
const STATUS_APP_INSTALLED = 'statusAppInstalled';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';

const initialState = {
  isDetecting: false,
  caughtError: null,
  boardTypeDetected: BOARD_TYPE.OTHER,
  [STATUS_SUPPORTED_BROWSER]: Status.WAITING,
  [STATUS_APP_INSTALLED]: Status.WAITING,
  [STATUS_BOARD_PLUG]: Status.WAITING,
  [STATUS_BOARD_CONNECT]: Status.WAITING,
  [STATUS_BOARD_COMPONENTS]: Status.WAITING
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

      // What type of board is this?
      .then(() => {
        this.setState({boardTypeDetected: setupChecker.detectBoardType()});
        if (experiments.isEnabled('microbit')) {
          console.log('Board detected: ' + setupChecker.detectBoardType());
        }
        Promise.resolve();
      })

      // Can we talk to the firmware?
      .then(() =>
        this.detectStep(STATUS_BOARD_CONNECT, () =>
          setupChecker.detectCorrectFirmware(this.state.boardTypeDetected)
        )
      )

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
          stepName={applabI18n.makerSetupBrowserTitle()}
          stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
        />
      );
    } else if (isChromeOS() || isChrome()) {
      // Chromebooks - Chrome App
      return (
        <ValidationStep
          stepName={
            applabI18n.makerSetupAppInstalled() +
            (isChromeOS() ? '' : applabI18n.legacy())
          }
          stepStatus={this.state[STATUS_APP_INSTALLED]}
        >
          <SafeMarkdown
            markdown={applabI18n.makerSetupInstallSerialConnector({
              webstoreURL: CHROME_APP_WEBSTORE_URL
            })}
          />
          <br />
          {applabI18n.makerSetupRedetect()}
          <br />
          {applabI18n.makerSetupAcceptPrompt()}
          {this.contactSupport()}
        </ValidationStep>
      );
    } else {
      // Unsupported Browser
      return (
        <ValidationStep
          stepName={applabI18n.makerSetupBrowserSupported()}
          stepStatus={Status.FAILED}
        >
          <SafeMarkdown markdown={applabI18n.makerSetupUnsupportedBrowser()} />
        </ValidationStep>
      );
    }
  }

  contactSupport() {
    return <SafeMarkdown markdown={i18n.contactGeneralSupport()} />;
  }

  installFirmwareSketch() {
    let firmataFromBoardType;
    switch (this.state.boardTypeDetected) {
      case BOARD_TYPE.EXPRESS:
        firmataFromBoardType =
          'https://learn.adafruit.com/adafruit-circuit-playground-express/code-org-csd';
        break;
      case BOARD_TYPE.MICROBIT:
        firmataFromBoardType =
          'https://github.com/microbit-foundation/microbit-firmata#installing-firmata-on-your-bbc-microbit';
        break;
      default:
        firmataFromBoardType =
          'https://learn.adafruit.com/circuit-playground-firmata/overview';
    }
    return (
      <div>
        <SafeMarkdown
          markdown={applabI18n.makerSetupInstallFirmata({
            firmataURL: firmataFromBoardType
          })}
        />
      </div>
    );
  }

  render() {
    const linuxPermissionError =
      isLinux() &&
      this.state.caughtError &&
      this.state.caughtError.message.includes('Permission denied');

    return (
      <div>
        <h2>
          {applabI18n.makerSetupCheck()}
          <input
            style={{marginLeft: 9, marginTop: -4}}
            className="btn"
            type="button"
            value={applabI18n.redetect()}
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
            {applabI18n.makerSetupPlugInBoardCheck()}
            <a href="#" onClick={this.redetect.bind(this)}>
              {applabI18n.redetect()}
            </a>
            .
            {isWindows() && (
              <SafeMarkdown
                markdown={applabI18n.makerSetupAdafruitWindowsDrivers()}
              />
            )}
            {this.contactSupport()}
          </ValidationStep>
          <ValidationStep
            stepStatus={this.state[STATUS_BOARD_CONNECT]}
            stepName={i18n.validationStepBoardConnectable()}
          >
            {applabI18n.makerSetupBoardBadResponse()}
            {linuxPermissionError && (
              <div>
                <p>{applabI18n.makerSetupLinuxSerialport()}</p>
                <p>{applabI18n.makerSetupLinuxGroupsCheck()}</p>
                <pre>groups $&#123;USER&#125;</pre>
                <p>{applabI18n.makerSetupLinuxAddDialout()}</p>
                <pre>sudo gpasswd --add $&#123;USER&#125; dialout</pre>
                <p> {applabI18n.makerSetupLinuxRestart()} </p>
              </div>
            )}
            {!linuxPermissionError && this.installFirmwareSketch()}
            {this.contactSupport()}
          </ValidationStep>
          <ValidationStep
            stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
            stepName={i18n.validationStepBoardComponentsUsable()}
          >
            {applabI18n.makerSetupVerifyComponents()}
            <br />
            {this.installFirmwareSketch()}
            {this.contactSupport()}
          </ValidationStep>
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

function promiseWaitFor(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
