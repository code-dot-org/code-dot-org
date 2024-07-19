import React from 'react';
import {Provider} from 'react-redux';

import applabI18n from '@cdo/applab/locale';
import {
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_FILENAME,
  RESET_BUTTON_NAME,
  BOOT_DRIVE_NAME,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import {
  shouldUseWebSerial,
  WEB_SERIAL_FILTERS,
} from '@cdo/apps/lib/kits/maker/util/boardUtils';
import {getStore} from '@cdo/apps/redux';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {isWindows} from '../util/browserChecks';

import SetupChecklist from './SetupChecklist';

import styles from './setup-instructions.module.scss';

// These are used for jumplinks between the
// two sets of instructions in this component.
const checklistId = 'connectYourBoardChecklist';
const installInstructionsId = 'installInstructions';

export default class SetupInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={getStore()}>
        <ConnectionInstructions />
        <Support />
      </Provider>
    );
  }
}

class ConnectionInstructions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {webSerialPort: null};
  }

  renderWebSerialConnectButton = () => {
    // WebSerial requires user input for user to select port.
    // Add a button for user interaction before initiated Setup Checklist
    return (
      <div>
        <input
          style={{margin: 15, marginBottom: 25}}
          className="btn"
          type="button"
          value={applabI18n.connectToBoard()}
          onClick={() => {
            navigator.serial
              .requestPort({filters: WEB_SERIAL_FILTERS})
              .then(port => {
                this.setState({webSerialPort: port});
              });
          }}
        />
      </div>
    );
  };

  renderSetupChecklist = webSerialPort => {
    return <SetupChecklist webSerialPort={webSerialPort} />;
  };

  render() {
    const {webSerialPort} = this.state;
    const connectionState = webSerialPort
      ? this.renderSetupChecklist(webSerialPort)
      : this.renderWebSerialConnectButton();

    if (!shouldUseWebSerial()) {
      return null;
    }

    return (
      <div>
        <h2 id={checklistId}>
          {applabI18n.makerSetupConnectBoardChecklistTitle()}
        </h2>
        <p>
          {applabI18n.makerSetupConnectWithWebSerial()}
          <strong>{applabI18n.makerSetupConnectOnlyOneTab()}</strong>
          {applabI18n.makerSetupConnectOnlyOneTabDetails()}
        </p>
        <ol>
          <li>{applabI18n.makerSetupWebSerialConnectToComputer()}</li>
          <li>{applabI18n.makerSetupWebSerialConnectToBoardButton()}</li>
          <li>
            {applabI18n.makerSetupWebSerialWindowConnect()}
            <ul className={styles.troubleshootList}>
              <li>
                <SafeMarkdown
                  markdown={applabI18n.makerSetupNoCompatibleDevices({
                    installInstructionsId,
                  })}
                />
              </li>
            </ul>
          </li>
          <li>{applabI18n.makerSetupWebSerialSuccessfulConnection()}</li>
        </ol>
        <SafeMarkdown
          markdown={applabI18n.makerSetupWebSerialSupportArticle()}
          openExternalLinksInNewTab={true}
        />
        {connectionState}
        <CPExpressInstallInstructions />
      </div>
    );
  }
}

class CPExpressInstallInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  renderStepOne = () => {
    return (
      <div className={styles.listWithImage}>
        <div>
          {applabI18n.makerSetupCPXInstallStep1()}
          <ul>
            <li>{applabI18n.makerSetupWebSerialConnectToComputer()}</li>
            <li>
              {applabI18n.makerSetupCPXInstallStep1a({
                buttonName: RESET_BUTTON_NAME,
              })}
            </li>
            <li>
              {applabI18n.makerSetupCPXInstallStep1b({
                driveName: BOOT_DRIVE_NAME,
              })}
              <ul className={styles.troubleshootList}>
                <li>
                  {applabI18n.makerSetupCPXInstallStep1c({
                    buttonName: RESET_BUTTON_NAME,
                  })}
                </li>
                <li>{applabI18n.makerSetupCPXInstallStep1d()}</li>
              </ul>
            </li>
          </ul>
        </div>
        <figure className={styles.imageContainer}>
          <img
            src="/blockly/media/maker/cpx-bootloader-mode.gif"
            alt={applabI18n.makerSetupCPXBootloaderGifAltText()}
          />
        </figure>
      </div>
    );
  };

  renderStepTwo = () => {
    return (
      <>
        {applabI18n.makerSetupCPXInstallStep2()}
        <ul>
          <li>
            <SafeMarkdown
              markdown={applabI18n.makerSetupCPXInstallStep2a({
                firmataUrl: CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
              })}
            />
          </li>
          <li>
            {applabI18n.makerSetupCPXInstallStep2b({
              firmataFilename: CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_FILENAME,
              driveName: BOOT_DRIVE_NAME,
            })}
            <figure>
              <img
                src={
                  isWindows()
                    ? '/blockly/media/maker/copy-firmata-windows.png'
                    : '/blockly/media/maker/copy-firmata-mac.png'
                }
                alt={applabI18n.makerSetupCPXInstallScreenshotAltText()}
              />
            </figure>
          </li>
          <li>{applabI18n.makerSetupCPXInstallStep2c()}</li>
        </ul>
      </>
    );
  };

  render() {
    return (
      <div id={installInstructionsId}>
        <h2>{applabI18n.makerSetupCPXInstallHeader()}</h2>
        <ol>
          <li>{this.renderStepOne()}</li>
          <li>{this.renderStepTwo()}</li>
          <li>
            <SafeMarkdown
              markdown={applabI18n.makerSetupCPXInstallStep3({checklistId})}
            />
          </li>
        </ol>
      </div>
    );
  }
}

class Support extends React.Component {
  render() {
    return (
      <>
        <h2>{i18n.support()}</h2>
        <SafeMarkdown markdown={i18n.contactGeneralSupport()} />
      </>
    );
  }
}
