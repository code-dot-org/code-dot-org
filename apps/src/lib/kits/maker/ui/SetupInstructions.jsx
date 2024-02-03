import React from 'react';
import SetupChecklist from './SetupChecklist';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import applabI18n from '@cdo/applab/locale';
import {Provider} from 'react-redux';
import {
  shouldUseWebSerial,
  WEB_SERIAL_FILTERS,
} from '@cdo/apps/lib/kits/maker/util/boardUtils';
import {getStore} from '@cdo/apps/redux';
import {
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_FILENAME,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';

const style = {
  oneColumn: {
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: 'space-between',
  },
  connectYourBoardChecklistId: 'connectYourBoardChecklist',
};

export default class SetupInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={getStore()}>
        <div>
          <ConnectionInstructions />
          <CPExpressInstallInstructions />
          <Support />
        </div>
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
    console.log(webSerialPort);
    const connectionState = webSerialPort
      ? this.renderSetupChecklist(webSerialPort)
      : this.renderWebSerialConnectButton();

    if (!shouldUseWebSerial()) {
      // TODO: Ask Alice how she gets around this in her local env.
      // return null;
    }

    return (
      <div>
        <h2 id={style.connectYourBoardChecklistId}>
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
            <SafeMarkdown
              markdown={applabI18n.makerSetupWebSerialWindowConnect()}
            />
          </li>
          <li>{applabI18n.makerSetupWebSerialSuccessfulConnection()}</li>
        </ol>
        <SafeMarkdown
          markdown={applabI18n.makerSetupWebSerialSupportArticle()}
        />
        {connectionState}
      </div>
    );
  }
}

class CPExpressInstallInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // TODO: layout with images
    // TODO: get screenshot for image copy
    // TODO: reset button gif- put in our cdn?
    // TODO: make i18n strings for all the strings
    return (
      <div id="CPExpressInstallInstructions">
        <h2>Install the Firmata firmware onto the CP Express</h2>
        <ol>
          <li>
            Set your Circuit Playground Express to Bootloader Mode
            <div style={style.oneColumn}>
              <ul>
                <li>{applabI18n.makerSetupWebSerialConnectToComputer()}</li>
                <li>
                  Press or double-press the RESET button in the center of the
                  board.
                </li>
                <li>
                  You've successfully entered bootloader mode when all the LEDs
                  turn green and your computer detects a new removable storage
                  device called 'CPLAYBOOT'.
                </li>
                <li>
                  If pressing RESET once doesn't work, try double-pressing it.
                </li>
                <li>
                  If the color LEDs turn all red, check your USB cable, try
                  another cable or another USB port.
                </li>
              </ul>
              <img
                src="https://cdn-learn.adafruit.com/assets/assets/000/051/201/original/makecode_uf2.gif?1519151701"
                width={200}
                alt={
                  'GIF showing two ways to enter bootloader mode on the Circuit Playground Express by pressing the reset button once, then twice in a row.'
                }
              />
            </div>
          </li>
          <li>
            Copy over the Firmata firmware.
            <ul>
              <li>
                <SafeMarkdown
                  markdown={`Download the [Circuit Playground Express Firmata](${CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL})`}
                />
              </li>
              <li>
                Copy the '{CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_FILENAME}' file to
                the 'CPLAYBOOT' drive on your computer.
              </li>
              <li>
                The Circuit Playground Express will reboot automatically after a
                few seconds.
              </li>
            </ul>
          </li>
          <li>
            <SafeMarkdown
              markdown={`Return to the [checklist](#${style.connectYourBoardChecklistId}) above, and continue where you left off. The device should be discoverable now that the Firmata firmware is installed.`}
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
      <div>
        <h2>{i18n.support()}</h2>
        <SafeMarkdown markdown={i18n.contactGeneralSupport()} />
      </div>
    );
  }
}
