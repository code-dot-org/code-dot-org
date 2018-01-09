import React from 'react';
import SetupChecklist from "./SetupChecklist";
import SetupChecker from '../util/SetupChecker';
import {isCodeOrgBrowser, isChromeOS, isOSX, isWindows} from '../util/browserChecks';
import SurveySupportSection from "./SurveySupportSection";
import Button, {ButtonColor, ButtonSize} from '../../../../templates/Button';

export default class SetupGuide extends React.Component {
  constructor(props) {
    super(props);
    this.setupChecker = new SetupChecker();
  }

  render() {
    if (isCodeOrgBrowser() || isChromeOS()) {
      return <SetupChecklist setupChecker={this.setupChecker}/>;
    } else if (isOSX() || isWindows()) {
      return <SetupDownloads/>;
    }
    return <SetupUnsupportedBrowser/>;
  }
}

class SetupDownloads extends React.Component {
  render() {
    return (
      <div>
        {isWindows() ? <SetupWindowsDownloads/> : <SetupMacDownloads/>}
        <SurveySupportSection/>
      </div>
    );
  }
}

const downloadButtonStyle = {
  minWidth: 400,
  textAlign: 'center'
};

const SetupWindowsDownloads = () => (
  <div>
    <h2>Maker Toolkit App for Windows</h2>
    <Button
      text="Download Maker Toolkit App (v1.0.0)"
      icon="download"
      color={ButtonColor.orange}
      size={ButtonSize.large}
      style={downloadButtonStyle}
      onClick={() => {}}
    />
    <Button
      text="Install Adafruit Windows Drivers"
      color={ButtonColor.blue}
      size={ButtonSize.large}
      style={downloadButtonStyle}
      onClick={() => {}}
    />
    <div>
      <h4>Instructions:</h4>
      <ol>
        <li>Download and install the Maker Toolkit app using the download button above.</li>
        <li>Install the Adafruit Windows drivers.</li>
        <li>Open up the Maker Toolkit app and sign in to Code.org.</li>
        <li>Plug in your board to start using it with App Lab!</li>
      </ol>
    </div>
  </div>
);

const SetupMacDownloads = () => (
  <div>
    <h2>Maker Toolkit App for Mac</h2>
    <Button
      text="Download Maker Toolkit App (v1.0.0)"
      icon="download"
      color={ButtonColor.orange}
      size={ButtonSize.large}
      style={downloadButtonStyle}
      onClick={() => {}}
    />
    <div>
      <h4>Instructions:</h4>
      <ol>
        <li>Download and install the Maker Toolkit app using the download button above.</li>
        <li>Open up the Maker Toolkit app and sign in to Code.org.</li>
        <li>Plug in your board to start using it with App Lab!</li>
      </ol>
    </div>
  </div>
);

class SetupUnsupportedBrowser extends React.Component {
  render() {
    return (
      <div/>
    );
  }
}
