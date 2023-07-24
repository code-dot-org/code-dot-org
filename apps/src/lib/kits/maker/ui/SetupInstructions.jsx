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

export default class SetupInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={getStore()}>
        <div>
          <ConnectionInstructions />
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

    const connectionState = webSerialPort
      ? this.renderSetupChecklist(webSerialPort)
      : this.renderWebSerialConnectButton();

    if (!shouldUseWebSerial()) {
      return null;
    }

    return (
      <div>
        <h2>WebSerial</h2>
        <p>{applabI18n.makerSetupConnectWithWebSerial()}</p>
        <ol>
          <li>{applabI18n.makerSetupWebSerialConnectToComputer()}</li>
          <li>{applabI18n.makerSetupWebSerialConnectToBoardButton()}</li>
          <li>{applabI18n.makerSetupWebSerialWindowConnect()}</li>
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

class Support extends React.Component {
  render() {
    return (
      <div>
        <h2>{i18n.support()}</h2>
        <SafeMarkdown markdown={i18n.debugMakerToolkit()} />
        <SafeMarkdown markdown={i18n.contactGeneralSupport()} />
      </div>
    );
  }
}
