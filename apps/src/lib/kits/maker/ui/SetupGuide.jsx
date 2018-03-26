import _ from 'lodash';
import React from 'react';
import yaml from 'js-yaml';
import SetupChecklist from "./SetupChecklist";
import SetupChecker from '../util/SetupChecker';
import {isCodeOrgBrowser, isChromeOS, isOSX, isWindows, isLinux} from '../util/browserChecks';
import SurveySupportSection from "./SurveySupportSection";
import Button, {ButtonColor, ButtonSize} from '../../../../templates/Button';
import ToggleGroup from '../../../../templates/ToggleGroup';
import FontAwesome from "../../../../templates/FontAwesome";

const DOWNLOAD_PREFIX = 'https://downloads.code.org/maker/';
const WINDOWS = 'windows';
const MAC = 'mac';
const LINUX = 'linux';
const CHROMEBOOK = 'chromebook';

export default class SetupGuide extends React.Component {
  constructor(props) {
    super(props);
    this.setupChecker = new SetupChecker();
  }

  render() {
    if (isCodeOrgBrowser() || isChromeOS()) {
      return <SetupChecklist setupChecker={this.setupChecker}/>;
    }
    return <Downloads/>;
  }
}

class Downloads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      platform: isWindows() ? WINDOWS :
        isOSX() ? MAC :
          isLinux() ? LINUX :
            WINDOWS
    };
  }

  onPlatformChange = (platform) => {
    this.setState({platform});
  };

  render() {
    const {platform} = this.state;
    return (
      <div>
        <ToggleGroup
          selected={platform}
          onChange={this.onPlatformChange}
        >
          <button value={WINDOWS}>
            <FontAwesome icon="windows"/>
            {' '}
            Windows
          </button>
          <button value={MAC}>
            <FontAwesome icon="apple"/>
            {' '}
            Mac
          </button>
          <button value={LINUX}>
            <FontAwesome icon="linux"/>
            {' '}
            Linux
          </button>
          <button value={CHROMEBOOK}>
            <FontAwesome icon="chrome"/>
            {' '}
            Chromebook
          </button>
        </ToggleGroup>
        {WINDOWS === platform && <WindowsDownloads/>}
        {MAC === platform && <MacDownloads/>}
        {LINUX === platform && <LinuxDownloads/>}
        {CHROMEBOOK === platform && <ChromebookInstructions/>}
        <SurveySupportSection/>
      </div>
    );
  }
}

const downloadButtonStyle = {
  minWidth: 400,
  textAlign: 'center'
};

class WindowsDownloads extends React.Component {
  state = {installer: null, error: null};

  componentDidMount() {
    latestWindowsInstaller()
      .then(installer => this.setState({installer}))
      .catch(error => this.setState({error}));
  }


  render() {
    const {installer, error} = this.state;
    return (
      <div>
        <h2>Code.org Maker App for Windows</h2>
        {!installer && !error &&
          <FetchingLatestVersionMessage/>
        }
        {installer && !error &&
          <Button
            text={`Download Code.org Maker App for Windows (${installer.version})`}
            icon="download"
            color={ButtonColor.orange}
            size={ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        }
        {error &&
          <FetchingLatestVersionError/>
        }
        <div>
          <h4>Instructions:</h4>
          <ol>
            <li>Download and install the Code.org Maker App using the download button above.</li>
            <li>(Windows 7) Install the <a href="https://learn.adafruit.com/adafruit-feather-32u4-basic-proto/using-with-arduino-ide#install-drivers-windows-only">Adafruit Windows drivers</a>.</li>
            <li>Open up the Code.org Maker App and sign in to Code.org.</li>
            <li>Plug in your board to start using it with App Lab!</li>
          </ol>
        </div>
      </div>
    );
  }
}

class MacDownloads extends React.Component {
  state = {installer: null, error: null};

  componentDidMount() {
    latestMacInstaller()
      .then(installer => this.setState({installer}))
      .catch(error => this.setState({error}));
  }

  render() {
    const {installer, error} = this.state;
    return (
      <div>
        <h2>Code.org Maker App for Mac</h2>
        {!installer && !error &&
          <FetchingLatestVersionMessage/>
        }
        {installer && !error &&
          <Button
            text={`Download Code.org Maker App for Mac (${installer.version})`}
            icon="download"
            color={ButtonColor.orange}
            size={ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        }
        {error &&
          <FetchingLatestVersionError/>
        }
        <div>
          <h4>Instructions:</h4>
          <ol>
            <li>Download and install the Code.org Maker App using the download
              button above.
            </li>
            <li>Open up the Code.org Maker App and sign in to Code.org.</li>
            <li>Plug in your board to start using it with App Lab!</li>
          </ol>
        </div>
      </div>
    );
  }
}

class LinuxDownloads extends React.Component {
  state = {installer: null, error: null};

  componentDidMount() {
    latestLinuxInstaller()
      .then(installer => this.setState({installer}))
      .catch(error => this.setState({error}));
  }

  debFile() {
    if (!this.state.installer) {
      return null;
    }
    return null; // TODO - derive from latest-linux.yml correctly
  }

  render() {
    const {installer, error} = this.state;
    const debFile = this.debFile();
    return (
      <div>
        <h2>Code.org Maker App for Linux</h2>
        {!installer && !error &&
          <FetchingLatestVersionMessage/>
        }
        {installer && !error &&
          <Button
            text={`Download Code.org Maker App for Linux (${installer.version})`}
            icon="download"
            color={ButtonColor.orange}
            size={ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        }
        {error &&
          <FetchingLatestVersionError/>
        }
        <div>
          <h4>Instructions:</h4>
          <ol>
            <li>Download and install the Code.org Maker App using the download
              button above.
            </li>
            <li>Open up the Code.org Maker App and sign in to Code.org.</li>
            <li>Plug in your board to start using it with App Lab!</li>
          </ol>
          <h4>Alternative Installers</h4>
          <ul>
            {debFile &&
              <li>
                <a href={DOWNLOAD_PREFIX + debFile}>
                  {debFile}
                </a>
              </li>
            }
            <li>
              <a href="https://github.com/code-dot-org/browser">
                Install from source
                {' '}
                <FontAwesome icon="external-link"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const FETCH_STATUS_STYLE = {
  fontSize: 'large',
  margin: '0.5em 0',
};

const FetchingLatestVersionMessage = () => (
  <div style={FETCH_STATUS_STYLE}>
    <FontAwesome icon="spinner" className="fa-fw fa-spin"/>
    {' '}
    <em>
      Getting the latest version...
    </em>
  </div>
);

const FetchingLatestVersionError = () => (
  <div>
    <div style={FETCH_STATUS_STYLE}>
      <FontAwesome icon="times-circle" className="fa-fw" style={{color: 'darkred'}}/>
      {' '}
      <strong>
        There was a problem getting your download link.
      </strong>
    </div>
    <div>
      Please make sure you are connected to the internet, and
      {' '}
      <a href="https://downloads.code.org/index.html">https://downloads.code.org/</a>
      {' '}
      is reachable from your network.
    </div>
  </div>
);

const CHROME_APP_WEBSTORE_URL = "https://chrome.google.com/webstore/detail/codeorg-serial-connector/ncmmhcpckfejllekofcacodljhdhibkg";
const MAKER_SETUP_PAGE_URL = document.location.origin + '/maker/setup';

class ChromebookInstructions extends React.Component {
  render() {
    return (
      <div>
        <h2>Maker Toolkit for Chromebook</h2>
        <p>
          Maker Toolkit on Chromebook does not use the Code.org Maker App.
          Instead, it depends on the
          {' '}
          <a href={CHROME_APP_WEBSTORE_URL}>
            Code.org Serial Connector
          </a>
          {' '}
          Chrome App.
        </p>
        <h4>Instructions</h4>
        <ol>
          <li>
            Open this page (
            <a href={MAKER_SETUP_PAGE_URL}>{MAKER_SETUP_PAGE_URL}</a>
            ) on your Chromebook.
          </li>
          <li>Follow the instructions given by the interactive setup checklist.</li>
          <li>Plug in your board to start using it with App Lab!</li>
        </ol>
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
  return latestInstaller(DOWNLOAD_PREFIX + 'latest-mac.yml')
    .then(metadata => ({
      ...metadata,
      filename: metadata.filename.replace('zip', 'dmg')
    }));
}

function latestLinuxInstaller() {
  return latestInstaller(DOWNLOAD_PREFIX + 'latest-linux.yml');
}

/**
 * Retrieve installer metadata from a yaml file on the server.
 * Memoized so any particular file is requested only once per page load.
 * @param {string} latestYamlUrl - fully-qualified URL to YAML metadata file
 *   specifying the latest available version.
 * @returns {Promise<string>} Resolves to application installer info.
 */
const latestInstaller = _.memoize((latestYamlUrl) => {
  return fetch(latestYamlUrl, {mode: 'cors'})
    .then(response => response.text())
    .then(text => yaml.safeLoad(text))
    .then(datum => ({
      filename: datum.url,
      version: datum.version
    }));
});
