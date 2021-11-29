import _ from 'lodash';
import React from 'react';
import yaml from 'js-yaml';
import SetupChecklist from './SetupChecklist';
import SetupChecker from '../util/SetupChecker';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';
import applabI18n from '@cdo/applab/locale';
import {
  isCodeOrgBrowser,
  isChromeOS,
  isOSX,
  isWindows,
  isLinux
} from '../util/browserChecks';
import Button from '../../../../templates/Button';
import ToggleGroup from '../../../../templates/ToggleGroup';
import FontAwesome from '../../../../templates/FontAwesome';
import {CHROME_APP_WEBSTORE_URL} from '../util/makerConstants';
import {createStore, combineReducers} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import {Provider} from 'react-redux';

const DOWNLOAD_PREFIX = 'https://downloads.code.org/maker/';
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

export default class SetupGuide extends React.Component {
  constructor(props) {
    super(props);
    this.setupChecker = new SetupChecker();
  }

  render() {
    // Create store for Provider
    const store = createStore(
      combineReducers({
        isRtl,
        responsive
      })
    );

    if (isCodeOrgBrowser() || isChromeOS()) {
      return <SetupChecklist setupChecker={this.setupChecker} />;
    }
    return (
      <Provider store={store}>
        <Downloads />
      </Provider>
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
    return (
      <div>
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
        <h2>{i18n.support()}</h2>
        <SafeMarkdown markdown={i18n.debugMakerToolkit()} />
        <SafeMarkdown markdown={i18n.contactGeneralSupport()} />
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
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={`Download Code.org Maker App for Windows (${
              installer.version
            })`}
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
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={`Download Code.org Maker App for Mac (${installer.version})`}
            icon="download"
            color={Button.ButtonColor.orange}
            size={Button.ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        )}
        {error && <FetchingLatestVersionError />}
        <SetupInstructions />
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
        {!installer && !error && <FetchingLatestVersionMessage />}
        {installer && !error && (
          <Button
            __useDeprecatedTag
            text={`Download Code.org Maker App for Linux (${
              installer.version
            })`}
            icon="download"
            color={Button.ButtonColor.orange}
            size={Button.ButtonSize.large}
            style={downloadButtonStyle}
            href={DOWNLOAD_PREFIX + installer.filename}
          />
        )}
        {error && <FetchingLatestVersionError />}
        <div>
          <SetupInstructions />
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

const SetupInstructions = () => (
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
  render() {
    return (
      <div>
        <h2>{applabI18n.makerSetupMakerAppForChromebook()}</h2>
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
