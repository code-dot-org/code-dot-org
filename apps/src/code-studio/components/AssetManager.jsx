/* eslint-disable react/no-is-mounted */
import PropTypes from 'prop-types';
import React from 'react';
import {
  assets as assetsApi,
  starterAssets as starterAssetsApi,
  files as filesApi
} from '@cdo/apps/clientApi';

import AssetRow from './AssetRow';
import assetListStore from '../assets/assetListStore';
import AudioRecorder from './AudioRecorder';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import AddAssetButtonRow from './AddAssetButtonRow';
import i18n from '@cdo/locale';
import {STARTER_ASSET_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

export const AudioErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save'
};

const errorMessages = {
  403: 'Quota exceeded. Please delete some files and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.',
  unknown: 'An unknown error occurred.'
};

const errorUploadDisabled =
  'This project has been reported for abusive content, ' +
  'so uploading new assets is disabled.';

function getErrorMessage(status) {
  return errorMessages[status] || errorMessages.unknown;
}

const styles = {
  emptyText: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px'
  }
};

/**
 * A component for managing hosted assets.
 */
export default class AssetManager extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func,
    assetsChanged: PropTypes.func,
    allowedExtensions: PropTypes.string,
    uploadsEnabled: PropTypes.bool.isRequired,
    useFilesApi: PropTypes.bool,
    soundPlayer: PropTypes.object,
    disableAudioRecording: PropTypes.bool,
    projectId: PropTypes.string,
    levelName: PropTypes.string,
    isStartMode: PropTypes.bool,

    // For logging purposes
    imagePicker: PropTypes.bool, // identifies if displayed by 'Manage Assets' flow
    elementId: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      assets: null,
      starterAssets: null,
      statusMessage: props.uploadsEnabled ? '' : errorUploadDisabled,
      recordingAudio: false,
      audioErrorType: AudioErrorType.NONE
    };
  }

  componentDidMount() {
    if (this.props.levelName) {
      starterAssetsApi.getStarterAssets(
        this.props.levelName,
        this.onStarterAssetsReceived,
        this.onStarterAssetsFailure
      );
    } else {
      this.setState({starterAssets: []});
    }

    let api = this.props.useFilesApi ? filesApi : assetsApi;
    if (!api.getProjectId()) {
      api = api.withProjectId(this.props.projectId);
    }

    // Request to files/assets API will fail if no projectId is present, so only
    // request files if we have a projectId.
    if (api.getProjectId()) {
      api.getFiles(this.onAssetListReceived, this.onAssetListFailure);
    } else {
      this.setState({assets: []});
    }
  }

  onStarterAssetsReceived = result => {
    const response = JSON.parse(result.response);
    this.setState({starterAssets: response.starter_assets});
  };

  onStarterAssetsFailure = xhr => {
    this.setState({
      statusMessage:
        'Error loading starter assets: ' + getErrorMessage(xhr.status)
    });
  };

  /**
   * Called after the component mounts, when the server responds with the
   * current list of assets.
   * @param result
   */
  onAssetListReceived = result => {
    assetListStore.reset(result.files);
    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions)
    });
  };

  /**
   * Called after the component mounts, if the server responds with an error
   * when loading the current list of assets.
   * @param xhr
   */
  onAssetListFailure = ({status}) => {
    const {useFilesApi} = this.props;
    if (useFilesApi && status === 404) {
      // No files in this project yet, proceed with an empty file list
      this.onAssetListReceived({files: []});
      return;
    }

    this.setState({
      statusMessage: 'Error loading asset list: ' + getErrorMessage(status)
    });
  };

  onUploadStart = data => {
    this.setState({statusMessage: 'Uploading...'});
    data.submit();
  };

  onUploadDone = result => {
    let newState = {
      statusMessage: 'File "' + result.filename + '" successfully uploaded!'
    };

    if (this.props.isStartMode) {
      newState.starterAssets = [...this.state.starterAssets, result];
    } else {
      assetListStore.add(result);
      if (this.props.assetsChanged) {
        this.props.assetsChanged();
      }
      newState.assets = assetListStore.list(this.props.allowedExtensions);
    }

    this.setState(newState);
  };

  onUploadError = status => {
    this.setState({
      statusMessage: 'Error uploading file: ' + getErrorMessage(status)
    });
    firehoseClient.putRecord({
      study: 'project-data-integrity',
      study_group: 'v4',
      event: 'asset-upload-error',
      project_id: this.props.projectId,
      data_int: status
    });
  };

  onSelectRecord = () => {
    this.setState({recordingAudio: true});
  };

  deleteAssetRow = name => {
    assetListStore.remove(name);
    if (this.props.assetsChanged) {
      this.props.assetsChanged();
    }
    firehoseClient.putRecord({
      study: 'delete-asset',
      study_group:
        this.props.assetChosen && typeof this.props.assetChosen === 'function'
          ? 'choose-assets'
          : 'manage-assets',
      event: 'confirm',
      project_id: this.props.projectId,
      data_json: JSON.stringify({
        assetName: name,
        elementId: this.props.elementId
      })
    });

    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions),
      statusMessage: `File "${name}" successfully deleted!`
    });
  };

  deleteStarterAssetRow = name => {
    let starterAssets = [...this.state.starterAssets].filter(
      asset => asset.filename !== name
    );
    this.setState({
      starterAssets,
      statusMessage: `File "${name}" successfully deleted!`
    });
  };

  afterAudioSaved = err => {
    this.setState({recordingAudio: false, audioErrorType: err});
  };

  defaultAssetProps = asset => {
    return {
      key: asset.filename,
      name: asset.filename,
      timestamp: asset.timestamp,
      type: asset.category,
      size: asset.size,
      soundPlayer: this.props.soundPlayer,
      imagePicker: this.props.imagePicker,
      projectId: this.props.projectId,
      elementId: this.props.elementId
    };
  };

  getStarterAssetRows = () => {
    if (!this.props.levelName || this.state.starterAssets.length === 0) {
      return [];
    }

    const boundApi = starterAssetsApi.withLevelName(this.props.levelName);
    return this.state.starterAssets.map(asset => {
      return (
        <AssetRow
          {...this.defaultAssetProps(asset)}
          api={boundApi}
          onChoose={
            this.props.assetChosen &&
            (() =>
              this.props.assetChosen(
                STARTER_ASSET_PREFIX + asset.filename,
                asset.timestamp
              ))
          }
          onDelete={() => this.deleteStarterAssetRow(asset.filename)}
          levelName={this.props.levelName}
          hideDelete={!this.props.isStartMode}
        />
      );
    });
  };

  getAssetRows = () => {
    const api = this.props.useFilesApi ? filesApi : assetsApi;

    return this.state.assets.map(asset => {
      return (
        <AssetRow
          {...this.defaultAssetProps(asset)}
          api={api}
          onChoose={
            this.props.assetChosen &&
            (() => this.props.assetChosen(asset.filename, asset.timestamp))
          }
          onDelete={() => this.deleteAssetRow(asset.filename)}
        />
      );
    });
  };

  uploadApi = () => {
    if (this.props.isStartMode) {
      return starterAssetsApi.withLevelName(this.props.levelName);
    } else {
      let api = this.props.useFilesApi ? filesApi : assetsApi;

      // Bind API if it isn't already bound
      if (!api.getProjectId()) {
        api = api.withProjectId(this.props.projectId);
      }

      return api;
    }
  };

  render() {
    const displayAudioRecorder =
      this.state.audioErrorType !== AudioErrorType.INITIALIZE &&
      this.state.recordingAudio;
    const buttons = (
      <div>
        {this.state.audioErrorType === AudioErrorType.SAVE && (
          <div>{i18n.audioSaveError()}</div>
        )}
        {this.state.audioErrorType === AudioErrorType.INITIALIZE && (
          <div>{i18n.audioInitializeError()}</div>
        )}
        {displayAudioRecorder && (
          <AudioRecorder
            onUploadDone={this.onUploadDone}
            afterAudioSaved={this.afterAudioSaved}
            imagePicker={this.props.imagePicker}
          />
        )}
        <AddAssetButtonRow
          uploadsEnabled={this.props.uploadsEnabled}
          allowedExtensions={this.props.allowedExtensions}
          api={this.uploadApi()}
          onUploadStart={this.onUploadStart}
          onUploadDone={this.onUploadDone}
          onUploadError={this.onUploadError}
          onSelectRecord={this.onSelectRecord}
          statusMessage={this.state.statusMessage}
          recordDisabled={this.state.recordingAudio}
          hideAudioRecording={this.props.disableAudioRecording}
        />
      </div>
    );

    let assetList;
    // If this.state.assets or this.state.starterAssets are null, assets are still loading.
    // If empty, the asset list has loaded and there are no assets in the current
    // channel (matching the `allowedExtensions`, if any were provided).
    if (this.state.assets === null || this.state.starterAssets === null) {
      assetList = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}} />
        </div>
      );
    } else if (
      this.state.assets.length === 0 &&
      this.state.starterAssets.length === 0
    ) {
      const emptyText =
        this.props.allowedExtensions === '.mp3' ? (
          <div>
            <div>
              Go to the "Sound library" to find sounds for your project.
            </div>
            <div>
              To upload your own sound, click "Upload File." Your uploaded
              assets will appear here.
            </div>
          </div>
        ) : (
          'Your assets will appear here. Click "Upload File" to add a new asset for this project.'
        );
      assetList = (
        <div>
          <div style={styles.emptyText}>{emptyText}</div>
          {buttons}
        </div>
      );
    } else {
      const rows = [...this.getStarterAssetRows(), ...this.getAssetRows()];
      assetList = (
        <div>
          <div
            style={{maxHeight: '330px', overflowY: 'scroll', margin: '1em 0'}}
          >
            <table style={{width: '100%'}}>
              <tbody>{rows}</tbody>
            </table>
          </div>
          {buttons}
        </div>
      );
    }

    return assetList;
  }
}
