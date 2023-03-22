import _ from 'lodash';
import React from 'react';
import yaml from 'js-yaml';
import SetupChecklist from './SetupChecklist';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import applabI18n from '@cdo/applab/locale';
import {
  isCodeOrgBrowser,
  isOSX,
  isWindows,
  isLinux,
  isChromeOS
} from '../util/browserChecks';
import Button from '../../../../templates/Button';
import ToggleGroup from '../../../../templates/ToggleGroup';
import FontAwesome from '../../../../templates/FontAwesome';
import {CHROME_APP_WEBSTORE_URL} from '../util/makerConstants';
import {Provider} from 'react-redux';
import {
  shouldUseWebSerial,
  WEB_SERIAL_FILTERS
} from '@cdo/apps/lib/kits/maker/util/boardUtils';
import {getStore} from '@cdo/apps/redux';
import {DOWNLOAD_PREFIX} from '@cdo/apps/lib/kits/maker/util/makerConstants';
const WINDOWS = 'windows';
const MAC = 'mac';
const LINUX = 'linux';
const CHROMEBOOK = 'chromebook';

const style = {
  icon: {
    float: 'left',
    padding: '5px'
  }
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
          <Downloads />
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

    if (isCodeOrgBrowser() || (isChromeOS() && !shouldUseWebSerial())) {
      return this.renderSetupChecklist(webSerialPort);
    }

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

class Downloads extends React.Component {
  constructor(props) {
    super(props);
    this.state = {platform: Downloads.platformFromHash()};
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.onHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHashChange);
  }

  static platformFromHash() {
    const hash = window.location.hash.slice(1);
    if ([WINDOWS, MAC, LINUX, CHROMEBOOK].includes(hash)) {
      return hash;
    } else if (isWindows()) {
      return WINDOWS;
    } else if (isOSX()) {
      return MAC;
    } else if (isLinux()) {
      return LINUX;
    }
    return WINDOWS;
  }

  onHashChange = () => {
    this.setState({platform: Downloads.platformFromHash()});
  };

  onPlatformChange = platform => {
    window.location.hash = '#' + platform;
    this.setState({platform});
  };

  render() {
    const {platform} = this.state;

    // Once in the Maker App or in Chromebook, there is no need to
    // display Download Instructions
    if (isCodeOrgBrowser() || isChromeOS()) {
      return null;
    }

    return (
      <div style={{marginTop: 50}}>
        <ToggleGroup selected={platform} onChange={this.onPlatformChange}>
          <button type="button" value={WINDOWS}>
            <FontAwesome icon="windows" /> {i18n.windows()}
          </button>
          <button type="button" value={MAC}>
            <FontAwesome icon="apple" /> {i18n.mac()}
          </button>
          <button type="button" value={LINUX}>
            <FontAwesome icon="linux" /> {i18n.linux()}
          </button>
          <button type="button" value={CHROMEBOOK}>
            <FontAwesome icon="chrome" /> {i18n.chromebook()}
          </button>
        </ToggleGroup>
        {WINDOWS === platform && <WindowsDownloads />}
        {MAC === platform && <MacDownloads />}
        {LINUX === platform && <LinuxDownloads />}
        {CHROMEBOOK === platform && <ChromebookInstructions />}
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
        <h2>{applabI18n.makerSetupMakerAppForWindows()}</h2>
        <p>{applabI18n.makerSetupMakerAppAlternatePath()}</p>
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={applabI18n.downloadMakerAppFor({
              OS: i18n.windows(),
              installerVersion: installer.version
            })}
            icon="download"
            color={Button.ButtonColor.orange}
            size={Button.ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        )}
        {error && <FetchingLatestVersionError />}
        <div>
          <h4>{i18n.instructionsWithColon()}</h4>
          <ol>
            <li>{applabI18n.makerSetupDownloadAndInstall()}</li>
            <li>
              <SafeMarkdown markdown={applabI18n.makerSetupWindows7Drivers()} />
            </li>
            <li>{applabI18n.makerSetupSignIn()}</li>
            <li>{applabI18n.makerSetupPlugInBoard()}</li>
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
        <h2>{applabI18n.makerSetupMakerAppForMac()}</h2>
        <p>{applabI18n.makerSetupMakerAppAlternatePath()}</p>
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={applabI18n.downloadMakerAppFor({
              OS: i18n.mac(),
              installerVersion: installer.version
            })}
            icon="download"
            color={Button.ButtonColor.orange}
            size={Button.ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        )}
        {error && <FetchingLatestVersionError />}
        <Instructions />
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
        <h2>{applabI18n.makerSetupMakerAppForLinux()}</h2>
        <p>{applabI18n.makerSetupMakerAppAlternatePath()}</p>
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={applabI18n.downloadMakerAppFor({
              OS: i18n.linux(),
              installerVersion: installer.version
            })}
            icon="download"
            color={Button.ButtonColor.orange}
            size={Button.ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        )}
        {error && <FetchingLatestVersionError />}
        <div>
          <Instructions />
          <h4>{applabI18n.makerSetupLinuxAlternative()}</h4>
          <ul>
            {debFile && (
              <li>
                <a href={DOWNLOAD_PREFIX + debFile}>{debFile}</a>
              </li>
            )}
            <li>
              <FontAwesome style={style.icon} icon="external-link" />
              <SafeMarkdown
                markdown={applabI18n.makerSetupLinuxAlternativeInstall()}
              />
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

const FETCH_STATUS_STYLE = {
  fontSize: 'large',
  margin: '0.5em 0'
};

const FetchingLatestVersionMessage = () => (
  <div style={FETCH_STATUS_STYLE}>
    <FontAwesome icon="spinner" className="fa-fw fa-spin" />{' '}
    <em>{applabI18n.makerSetupFetchingVersion()}</em>
  </div>
);

const FetchingLatestVersionError = () => (
  <div>
    <div style={FETCH_STATUS_STYLE}>
      <FontAwesome
        icon="times-circle"
        className="fa-fw"
        style={{color: 'darkred'}}
      />{' '}
      <strong>{applabI18n.makerSetupDownloadProblem()}</strong>
    </div>
    <div>
      <SafeMarkdown markdown={applabI18n.makerSetupCheckInternetConnection()} />
    </div>
  </div>
);

const Instructions = () => (
  <div>
    <h4>{i18n.instructionsWithColon()}</h4>
    <ol>
      <li>{applabI18n.makerSetupDownloadAndInstall()}</li>
      <li>{applabI18n.makerSetupSignIn()}</li>
      <li>{applabI18n.makerSetupPlugInBoard()}</li>
    </ol>
  </div>
);

const MAKER_SETUP_PAGE_URL = document.location.origin + '/maker/setup';

class ChromebookInstructions extends React.Component {
  webSerialSetupInstructions() {
    return (
      <div>
        {applabI18n.makerSetupChromebook()}
        <h4>{applabI18n.note()}</h4>
        {applabI18n.makerSetupChromebookHistoricalNote()}
      </div>
    );
  }

  chromeAppSetupInstructions() {
    return (
      <div>
        <SafeMarkdown
          markdown={applabI18n.makerSetupSerialConnector({
            webstoreURL: CHROME_APP_WEBSTORE_URL
          })}
        />
        <h4>{i18n.instructions()}</h4>
        <ol>
          <li>
            <SafeMarkdown
              markdown={applabI18n.makerSetupChromebookPage({
                makerSetupPage: MAKER_SETUP_PAGE_URL
              })}
            />
          </li>
          <li>{applabI18n.makerSetupFollowInstructions()}</li>
          <li>{applabI18n.makerSetupPlugInBoard()}</li>
        </ol>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h2>{applabI18n.makerSetupMakerAppForChromebook()}</h2>
        {shouldUseWebSerial()
          ? this.webSerialSetupInstructions()
          : this.chromeAppSetupInstructions()}
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
  return latestInstaller(DOWNLOAD_PREFIX + 'latest-mac.yml').then(metadata => ({
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
const latestInstaller = _.memoize(latestYamlUrl => {
  return fetch(latestYamlUrl, {mode: 'cors'})
    .then(response => response.text())
    .then(text => yaml.safeLoad(text))
    .then(datum => ({
      filename: datum.path,
      version: datum.version
    }));
});
