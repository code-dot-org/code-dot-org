/** @file Maker Board setup checker */
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import applabI18n from '@cdo/applab/locale';
import Button from '@cdo/apps/legacySharedComponents/Button';
import MBFirmataUpdater from '@cdo/apps/lib/kits/maker/boards/microBit/MBFirmataUpdater';
import WebSerialPortWrapper from '@cdo/apps/lib/kits/maker/WebSerialPortWrapper';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import * as utils from '../../../../utils';
import ValidationStep, {Status} from '../../../ui/ValidationStep';
import {BOARD_TYPE, shouldUseWebSerial, delayPromise} from '../util/boardUtils';
import {isWindows, isLinux} from '../util/browserChecks';
import SetupChecker from '../util/SetupChecker';

const STATUS_SUPPORTED_BROWSER = 'statusSupportedBrowser';
const STATUS_BOARD_PLUG = 'statusBoardPlug';
const STATUS_BOARD_CONNECT = 'statusBoardConnect';
const STATUS_BOARD_COMPONENTS = 'statusBoardComponents';
const STATUS_BOARD_UPDATE_FIRMATA = 'statusBoardUpdateFirmata';

const MICROBIT_FIRMATA_URL =
  'https://github.com/microbit-foundation/microbit-firmata#installing-firmata-on-your-bbc-microbit';
const EXPRESS_FIRMATA_URL =
  'https://learn.adafruit.com/adafruit-circuit-playground-express/code-org-csd';
const CLASSIC_FIRMATA_URL =
  'https://learn.adafruit.com/circuit-playground-firmata/overview';

const initialState = {
  isDetecting: false,
  caughtError: null,
  boardTypeDetected: BOARD_TYPE.OTHER,
  [STATUS_SUPPORTED_BROWSER]: Status.WAITING,
  [STATUS_BOARD_PLUG]: Status.WAITING,
  [STATUS_BOARD_CONNECT]: Status.WAITING,
  [STATUS_BOARD_COMPONENTS]: Status.WAITING,
  [STATUS_BOARD_UPDATE_FIRMATA]: Status.WAITING,
};

class SetupChecklist extends Component {
  constructor(props) {
    super(props);
    const {webSerialPort} = props;
    const wrappedSerialPort = webSerialPort
      ? new WebSerialPortWrapper(webSerialPort)
      : null;
    this.setupChecker = new SetupChecker(wrappedSerialPort);
  }
  state = {...initialState};

  static propTypes = {
    webSerialPort: PropTypes.object,
    stepDelay: PropTypes.number,
    firmataPercentComplete: PropTypes.number,
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

  question(selector) {
    this.setState({[selector]: Status.UNKNOWN});
  }

  detect() {
    this.setState({...initialState, isDetecting: true});

    Promise.resolve()

      // Are we using a compatible browser?
      .then(() =>
        this.detectStep(STATUS_SUPPORTED_BROWSER, () =>
          this.setupChecker.detectSupportedBrowser()
        )
      )

      // Is board plugged in?
      .then(() =>
        this.detectStep(STATUS_BOARD_PLUG, () =>
          this.setupChecker.detectBoardPluggedIn()
        )
      )

      // What type of board is this?
      .then(() => {
        this.setState({boardTypeDetected: this.setupChecker.detectBoardType()});
        analyticsReporter.sendEvent(EVENTS.MAKER_SETUP_PAGE_BOARD_TYPE_EVENT, {
          'Maker Board Type': this.state.boardTypeDetected,
        });

        Promise.resolve();
      })

      // Can we talk to the firmware?
      .then(() =>
        this.detectStep(STATUS_BOARD_CONNECT, () =>
          this.setupChecker.detectCorrectFirmware(this.state.boardTypeDetected)
        )
      )

      // Can we initialize components successfully?
      .then(() => {
        if (this.state.boardTypeDetected !== BOARD_TYPE.MICROBIT) {
          return this.detectStep(STATUS_BOARD_COMPONENTS, () =>
            this.setupChecker.detectComponentsInitialize()
          );
        }
        return Promise.resolve();
      })

      // Everything looks good, let's par-tay!
      .then(() =>
        this.thumb(
          this.state.boardTypeDetected === BOARD_TYPE.MICROBIT
            ? STATUS_BOARD_CONNECT
            : STATUS_BOARD_COMPONENTS
        )
      )
      .then(() => this.setupChecker.celebrate())
      .then(() => delayPromise(3000)) // allow 3 seconds for 'celebrate' on Micro:Bit before disconnecting
      .then(() => this.succeed(STATUS_BOARD_COMPONENTS))

      // If anything goes wrong along the way, we'll end up in this
      // catch clause - make sure to report the error out.
      .catch(error => {
        const extraErrorInfo = {};
        this.setState({caughtError: error, ...extraErrorInfo});
        if (console && typeof console.error === 'function') {
          console.error(error);
        }
      })

      // Finally...
      .then(() => {
        this.setupChecker.teardown();
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
    return delayPromise(this.props.stepDelay || 200)
      .then(stepWork)
      .then(() => this.succeed(stepKey))
      .catch(error => {
        this.fail(stepKey);
        return Promise.reject(error);
      });
  }

  /**
   * Helper to be used on second/subsequent attempts at detecting board usability.
   */
  redetect() {
    utils.reload();
  }

  updateMBFirmata() {
    this.spin(STATUS_BOARD_UPDATE_FIRMATA);
    this.question(STATUS_BOARD_CONNECT);
    const mbFirmataUpdater = new MBFirmataUpdater();
    return mbFirmataUpdater
      .updateMBFirmataVersioned()
      .then(() => {
        this.succeed(STATUS_BOARD_UPDATE_FIRMATA);
      })
      .catch(err => {
        console.log(err);
        this.fail(STATUS_BOARD_UPDATE_FIRMATA);
        this.fail(STATUS_BOARD_CONNECT);
      });
  }

  componentDidMount() {
    this.detect();
  }

  renderPlatformSpecificSteps() {
    if (shouldUseWebSerial()) {
      return (
        <ValidationStep
          stepName={applabI18n.makerSetupBrowserSupported()}
          stepStatus={this.state[STATUS_SUPPORTED_BROWSER]}
        />
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

  renderBoardPluggedInStep() {
    const errorDetails =
      this.state.caughtError && this.state.caughtError.reason ? (
        <pre>{this.state.caughtError.reason}</pre>
      ) : null;
    const windowDetails = isWindows() ? (
      <SafeMarkdown markdown={applabI18n.makerSetupAdafruitWindowsDrivers()} />
    ) : null;
    return (
      <ValidationStep
        stepStatus={this.state[STATUS_BOARD_PLUG]}
        stepName={i18n.validationStepBoardPluggedIn()}
        hideWaitingSteps={true}
      >
        {errorDetails}
        {applabI18n.makerSetupPlugInBoardCheck()}
        <a href="#" onClick={this.redetect.bind(this)}>
          {applabI18n.redetect()}
        </a>
        .{this.contactSupport()}
        {windowDetails}
      </ValidationStep>
    );
  }

  renderMicroBitUpdateStep() {
    const boardUpdateStatus = this.state[STATUS_BOARD_UPDATE_FIRMATA];
    if (
      this.state.boardTypeDetected !== BOARD_TYPE.MICROBIT ||
      boardUpdateStatus === Status.WAITING
    ) {
      return;
    }
    let stepDetails = null;
    if (boardUpdateStatus === Status.ATTEMPTING) {
      stepDetails = (
        <div>
          <p>{applabI18n.makerSetupMicrobitFirmataTransferring()}</p>
        </div>
      );
    } else if (boardUpdateStatus === Status.SUCCEEDED) {
      stepDetails = (
        <div>
          <p>{applabI18n.makerSetupMicrobitFirmataUpdateSuccess()}</p>
          <p>
            <strong>{applabI18n.makerSetupClickRedetect()}</strong>
            &nbsp;
            {applabI18n.makerSetupConfirmConnection()}
          </p>
        </div>
      );
    }
    return (
      <ValidationStep
        stepStatus={this.state[STATUS_BOARD_UPDATE_FIRMATA]}
        stepName={i18n.validationStepUpdateMicroBitSoftware()}
        hideWaitingSteps={false}
        alwaysShowChildren={true}
        percentComplete={this.props.firmataPercentComplete}
      >
        {stepDetails}
      </ValidationStep>
    );
  }

  renderBoardConnectableStep() {
    const linuxPermissionError =
      isLinux() &&
      this.state.caughtError?.message?.includes('Permission denied');
    const showUpdateMicroBitButton =
      this.state.boardTypeDetected === BOARD_TYPE.MICROBIT &&
      this.state[STATUS_BOARD_CONNECT] === Status.FAILED &&
      (this.state[STATUS_BOARD_UPDATE_FIRMATA] === Status.WAITING ||
        this.state[STATUS_BOARD_UPDATE_FIRMATA] === Status.FAILED);
    let errorDetails = null;
    if (linuxPermissionError) {
      errorDetails = (
        <div>
          <p>{applabI18n.makerSetupLinuxSerialport()}</p>
          <p>{applabI18n.makerSetupLinuxGroupsCheck()}</p>
          <pre>groups $&#123;USER&#125;</pre>
          <p>{applabI18n.makerSetupLinuxAddDialout()}</p>
          <pre>sudo gpasswd --add $&#123;USER&#125; dialout</pre>
          <p> {applabI18n.makerSetupLinuxRestart()} </p>
        </div>
      );
    } else if (!linuxPermissionError) {
      errorDetails = this.installFirmware();
    }
    const microBitButton = showUpdateMicroBitButton ? (
      <div>
        <Button
          text={applabI18n.makerSetupUpdateMBFirmata()}
          color={Button.ButtonColor.brandSecondaryDefault}
          size={Button.ButtonSize.medium}
          style={downloadButtonStyle}
          onClick={() => this.updateMBFirmata()}
          title={applabI18n.makerSetupUpdateMBFirmataDescription()}
        />
        <SafeMarkdown
          markdown={applabI18n.makerSetupMicrobitSupportArticle()}
        />{' '}
      </div>
    ) : null;
    return (
      <ValidationStep
        stepStatus={this.state[STATUS_BOARD_CONNECT]}
        stepName={i18n.validationStepBoardConnectable()}
        hideWaitingSteps={true}
      >
        {applabI18n.makerSetupBoardBadResponse()}
        {errorDetails}
        {microBitButton}
      </ValidationStep>
    );
  }

  renderComponentsUsable() {
    if (this.state.boardTypeDetected === BOARD_TYPE.MICROBIT) {
      return;
    }
    return (
      <ValidationStep
        stepStatus={this.state[STATUS_BOARD_COMPONENTS]}
        stepName={i18n.validationStepBoardComponentsUsable()}
        hideWaitingSteps={true}
      >
        {applabI18n.makerSetupVerifyComponents()}
        <br />
        {this.installFirmware()}
        {this.contactSupport()}
      </ValidationStep>
    );
  }

  contactSupport() {
    return <SafeMarkdown markdown={i18n.contactGeneralSupport()} />;
  }

  installFirmware() {
    let firmataMarkdown;
    if (this.state.boardTypeDetected === BOARD_TYPE.MICROBIT) {
      firmataMarkdown = applabI18n.makerSetupInstallFirmataMB({
        firmataURL: MICROBIT_FIRMATA_URL,
      });
    } else {
      firmataMarkdown = applabI18n.makerSetupInstallFirmataCP({
        firmataURLExpress: EXPRESS_FIRMATA_URL,
        firmataURLClassic: CLASSIC_FIRMATA_URL,
      });
    }
    return (
      <div style={styles.suggestionHeader}>
        <SafeMarkdown markdown={firmataMarkdown} />
      </div>
    );
  }

  render() {
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
          {this.renderBoardPluggedInStep()}
          {this.renderMicroBitUpdateStep()}
          {this.renderBoardConnectableStep()}
          {this.renderComponentsUsable()}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  firmataPercentComplete: state.microBit.microBitFirmataUpdatePercent,
}))(SetupChecklist);

const styles = {
  suggestionHeader: {
    marginTop: 15,
  },
};

const downloadButtonStyle = {
  textAlign: 'center',
  marginBottom: 15,
};
