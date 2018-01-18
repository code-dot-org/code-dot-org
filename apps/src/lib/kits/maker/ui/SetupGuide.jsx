import React from 'react';
import yaml from 'js-yaml';
import SetupChecklist from "./SetupChecklist";
import SetupChecker from '../util/SetupChecker';
import {isCodeOrgBrowser, isChromeOS, isOSX, isWindows} from '../util/browserChecks';
import SurveySupportSection from "./SurveySupportSection";
import Button, {ButtonColor, ButtonSize} from '../../../../templates/Button';

const DOWNLOAD_PREFIX = 'https://downloads.code.org/makertoolkit/';

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

class SetupWindowsDownloads extends React.Component {
  state = {installer: null};

  componentDidMount() {
    latestWindowsInstaller().then(installer => this.setState({installer}));
  }


  render() {
    const {installer} = this.state;
    return (
      <div>
        <h2>Maker Toolkit App for Windows</h2>
        {installer &&
          <Button
            text={`Download Maker Toolkit App for Windows (${installer.version})`}
            icon="download"
            color={ButtonColor.orange}
            size={ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        }
        <Button
          text="Install Adafruit Windows Drivers"
          color={ButtonColor.blue}
          size={ButtonSize.large}
          style={downloadButtonStyle}
          href="https://learn.adafruit.com/adafruit-feather-32u4-basic-proto/using-with-arduino-ide#install-drivers-windows-only"
        />
        <div>
          <h4>Instructions:</h4>
          <ol>
            <li>Download and install the Maker Toolkit app using the download
              button above.
            </li>
            <li>Install the Adafruit Windows drivers.</li>
            <li>Open up the Maker Toolkit app and sign in to Code.org.</li>
            <li>Plug in your board to start using it with App Lab!</li>
          </ol>
        </div>
      </div>
    );
  }
}

class SetupMacDownloads extends React.Component {
  state = {installer: null};

  componentDidMount() {
    latestMacInstaller().then(installer => this.setState({installer}));
  }

  render() {
    const {installer} = this.state;
    return (
      <div>
        <h2>Maker Toolkit App for Mac</h2>
        {installer &&
          <Button
            text={`Download Maker Toolkit App for Mac (${installer.version})`}
            icon="download"
            color={ButtonColor.orange}
            size={ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        }
        <div>
          <h4>Instructions:</h4>
          <ol>
            <li>Download and install the Maker Toolkit app using the download
              button above.
            </li>
            <li>Open up the Maker Toolkit app and sign in to Code.org.</li>
            <li>Plug in your board to start using it with App Lab!</li>
          </ol>
        </div>
      </div>
    );
  }
}

class SetupUnsupportedBrowser extends React.Component {
  render() {
    return (
      <div>
        <h2>Use a different computer</h2>
        Maker Toolkit is not supported on your current operating system. To set
        up Maker Toolkit, please open this page on a device running one of the
        following operating systems:
        <ul>
          <li>Windows</li>
          <li>OSX</li>
          <li>Chrome OS</li>
        </ul>
        <SurveySupportSection/>
      </div>
    );
  }
}


/** @returns {Promise<string>} Resolves to Windows installer info. */
function latestWindowsInstaller() {
  return latestInstaller(DOWNLOAD_PREFIX + 'latest.yml');
}

/** @returns {Promise<string>} Resolves to Mac installer info. */
function latestMacInstaller() {
  return latestInstaller(DOWNLOAD_PREFIX + 'latest-mac.yml');
}

/**
 * @param {string} latestYamlUrl - fully-qualified URL to YAML metadata file
 *   specifying the latest available version.
 * @returns {Promise<string>} Resolves to application installer info.
 */
function latestInstaller(latestYamlUrl) {
  return fetch(latestYamlUrl, {mode: 'cors'})
    .then(response => response.text())
    .then(text => yaml.safeLoad(text))
    .then(datum => ({
      filename: datum.url,
      version: datum.version
    }));
}
