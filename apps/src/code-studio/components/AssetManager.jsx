import PropTypes from 'prop-types';
import React from 'react';

import {STARTER_ASSET_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import {
  assets as assetsApi,
  starterAssets as starterAssetsApi,
  files as filesApi,
} from '@cdo/apps/clientApi';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import FlaggedImageModal from '@cdo/apps/sharedComponents/FlaggedImageModal';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import assetListStore from '../assets/assetListStore';

import AddAssetButtonRow from './AddAssetButtonRow';
import AssetRow from './AssetRow';
import AudioRecorder from './AudioRecorder';
import {RecordingFileType} from './recorders';

export const AudioErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save',
};
export const ImageMode = {
  FILE: 'file',
  ICON: 'icon',
  URL: 'url',
  DEFAULT: 'default',
};

const errorMessages = {
  403: 'Quota exceeded. Please delete some files and try again.',
  413: 'The file is too large.',
  415: 'This type of file is not supported.',
  500: 'The server responded with an error.',
  unknown: 'An unknown error occurred.',
};

const errorUploadDisabled =
  'This project has been reported for abusive content, ' +
  'so uploading new assets is disabled.';

function getErrorMessage(status) {
  return errorMessages[status] || errorMessages.unknown;
}

/**
 * A component for managing hosted assets. If utilizing this shared component,
 * verify the ImagePicker has access to the correct fields in your redux store,
 * namely level.name and level.isStartMode. Otherwise, the files will not be
 * saved to S3 or retrieved and displayed.
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
    recordingFileType: PropTypes.oneOf(Object.values(RecordingFileType)),
    projectId: PropTypes.string,
    levelName: PropTypes.string,
    isStartMode: PropTypes.bool,

    // For logging purposes
    imagePicker: PropTypes.bool, // identifies if displayed by 'Manage Assets' flow
    elementId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      assets: null,
      starterAssets: null,
      statusMessage: props.uploadsEnabled ? '' : errorUploadDisabled,
      recordingAudio: false,
      audioErrorType: AudioErrorType.NONE,
      projectType: '',
      showFlaggedModal: false,
      pendingUploadData: null,
      flaggedModalError: null,
      uploadsDisabled: false,
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
    const projectType = api.getProjectType();
    if (projectType) {
      this.setState({projectType: api.getProjectType()});
    }
  }

  onStarterAssetsReceived = result => {
    const response = JSON.parse(result.response);
    this.setState({starterAssets: response.starter_assets});
  };

  onStarterAssetsFailure = xhr => {
    this.setState({
      statusMessage:
        'Error loading starter assets: ' + getErrorMessage(xhr.status),
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
      assets: assetListStore.list(this.props.allowedExtensions),
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
      statusMessage: 'Error loading asset list: ' + getErrorMessage(status),
    });
  };

  getImageDimensions = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          resolve({width: img.width, height: img.height});
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Called when user initiates an upload. If the file is an image, send it
   * to be moderated first. If flagged, show modal. Otherwise continue with upload.
   * @param data - Upload data from jquery.fileupload
   */
  onUploadStart = data => {
    const file = data?.files?.[0];
    if (!file) {
      console.error('No file found in upload data.');
      return;
    }

    // Only moderate image files
    const isImage = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
    ].includes(file.type);

    if (!isImage) {
      // Not an image, proceed with upload without moderation
      this.setState({statusMessage: 'Uploading...'});
      console.log('onUploadStart data', data);
      data.submit();
      return;
    }

    analyticsReporter.sendEvent(
      EVENTS.UPLOAD_CUSTOM_IMAGE,
      {UploaderType: 'Asset Uploader', ProjectType: this.state.projectType},
      PLATFORMS.STATSIG
    );

    this.setState({statusMessage: 'Uploading...'});

    this.getImageDimensions(file)
      .then(({width, height}) => {
        if (width < 128 || height < 128) {
          // We skip moderation of small images because Azure Content Moderator has a minimum
          // requirement for their evaluate endpoint.
          console.log('onUploadStart data', data);
          data.submit();
          return;
        }

        this.setState({
          pendingUploadData: data,
        });

        HttpClient.post(`/v3/images/moderate`, file, true, {
          'Content-Type': file.type,
        })
          .then(response => response.json())
          .then(json => {
            // If rating is not 'everyone' or 'unknown', then flag project for image moderation.
            if (json.rating !== 'everyone' && json.rating !== 'unknown') {
              this.setState({
                showFlaggedModal: true,
              });
              analyticsReporter.sendEvent(
                EVENTS.FLAGGED_CUSTOM_IMAGE,
                {
                  UploaderType: 'Asset Manager',
                  ProjectType: this.state.projectType,
                },
                PLATFORMS.STATSIG
              );
            } else {
              // If the image is rated 'everyone' or 'unknown', continue with upload.
              console.log('onUploadStart data', this.state.pendingUploadData);
              this.state.pendingUploadData.submit();
              this.setState({pendingUploadData: null});
            }
          })
          .catch(err => {
            this.onUploadError(500);
            MetricsReporter.logError('Azure image moderation error: ' + err);
          });
      })
      .catch(err => {
        MetricsReporter.logError('Error getting image dimensions: ' + err);
        this.onUploadError(500);
      });
  };

  handleAcceptFlaggedImage = () => {
    const {pendingUploadData} = this.state;
    if (!pendingUploadData) return;

    const body = JSON.stringify({type: 'flag'});
    HttpClient.post(
      `/v3/channels/${this.props.projectId}/abuse/image`,
      body,
      true,
      {'Content-Type': 'application/json; charset=UTF-8'}
    )
      .then(response => response.json())
      .then(() => {
        console.log('onUploadStart data', pendingUploadData);
        pendingUploadData.submit();
        this.setState({
          showFlaggedModal: false,
          pendingUploadData: null,
          uploadsDisabled: true,
          statusMessage: errorUploadDisabled,
        });
        analyticsReporter.sendEvent(
          EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
          {
            UploaderType: 'Asset Manager',
            ProjectType: this.state.projectType,
          },
          PLATFORMS.STATSIG
        );
      })
      .catch(err => {
        this.setState({
          showFlaggedModal: true,
          flaggedModalError: 'Error uploading file: ' + getErrorMessage(500),
        });
        MetricsReporter.logError('Update project abuse error: ' + err);
      });
  };

  handleCancelFlaggedImage = () => {
    this.setState({
      showFlaggedModal: false,
      pendingUploadData: null,
      flaggedModalError: null,
      statusMessage: '',
    });
    analyticsReporter.sendEvent(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {
        UploaderType: 'Asset Manager',
        ProjectType: this.state.projectType,
      },
      PLATFORMS.STATSIG
    );
  };

  onUploadDone = result => {
    let newState = {
      statusMessage: 'File "' + result.filename + '" successfully uploaded!',
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
      statusMessage: 'Error uploading file: ' + getErrorMessage(status),
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

    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions),
      statusMessage: `File "${name}" successfully deleted!`,
    });
  };

  deleteStarterAssetRow = name => {
    let starterAssets = [...this.state.starterAssets].filter(
      asset => asset.filename !== name
    );
    this.setState({
      starterAssets,
      statusMessage: `File "${name}" successfully deleted!`,
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
      elementId: this.props.elementId,
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
      console.log('uploadApi this.props.useFilesApi', this.props.useFilesApi);

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
    const uploadsEnabled =
      this.props.uploadsEnabled && !this.state.uploadsDisabled;
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
            recordingFileType={this.props.recordingFileType}
            imagePicker={this.props.imagePicker}
          />
        )}
        <AddAssetButtonRow
          uploadsEnabled={uploadsEnabled}
          allowedExtensions={this.props.allowedExtensions}
          api={this.uploadApi()}
          onUploadStart={this.onUploadStart}
          onUploadDone={this.onUploadDone}
          onUploadError={this.onUploadError}
          onSelectRecord={this.onSelectRecord}
          statusMessage={this.state.statusMessage}
          recordDisabled={this.state.recordingAudio}
          hideAudioRecording={this.props.disableAudioRecording}
          projectType={this.state.projectType}
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
              {i18n.manageAssetsSoundLibraryMessage({
                soundLibraryButtonText: i18n.soundLibrary(),
              })}
            </div>
            <div>
              {i18n.manageAssetsSoundUploadMessage({
                assetUploaderButtonText: i18n.uploadFile(),
              })}
            </div>
          </div>
        ) : (
          <div>
            {i18n.manageAssetsDefaultMessage({
              assetUploaderButtonText: i18n.uploadFile(),
            })}
          </div>
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
            style={{maxHeight: '380px', overflowY: 'scroll', margin: '1em 0'}}
          >
            <table style={{width: '100%'}}>
              <tbody>{rows}</tbody>
            </table>
          </div>
          {buttons}
        </div>
      );
    }

    return (
      <>
        {this.state.showFlaggedModal && (
          <FlaggedImageModal
            onAccept={this.handleAcceptFlaggedImage}
            onCancel={this.handleCancelFlaggedImage}
            errorMessage={this.state.flaggedModalError}
          />
        )}
        {assetList}
      </>
    );
  }
}

const styles = {
  emptyText: {
    margin: '1em 0',
    fontSize: '16px',
    lineHeight: '20px',
  },
};
