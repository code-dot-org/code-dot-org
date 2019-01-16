/* eslint-disable react/no-is-mounted */
import React, {PropTypes} from 'react';
import {assets as assetsApi, files as filesApi} from '@cdo/apps/clientApi';

import AssetRow from './AssetRow';
import assetListStore from '../assets/assetListStore';
import AudioRecorder from './AudioRecorder';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import AddAssetButtonRow from "./AddAssetButtonRow";
import i18n from '@cdo/locale';

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

const errorUploadDisabled = "This project has been reported for abusive content, " +
  "so uploading new assets is disabled.";

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
    //For logging upload failures
    projectId: PropTypes.string,
    soundPlayer: PropTypes.object,
    disableAudioRecording: PropTypes.bool,
    //Temp prop for logging - identifies if displayed by 'Manage Assets' flow
    imagePicker: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      assets: null,
      statusMessage: props.uploadsEnabled ? '' : errorUploadDisabled,
      recordingAudio: false,
      audioErrorType: AudioErrorType.NONE
    };
  }

  componentWillMount() {
    let api = this.props.useFilesApi ? filesApi : assetsApi;
    api.getFiles(this.onAssetListReceived, this.onAssetListFailure);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Called after the component mounts, when the server responds with the
   * current list of assets.
   * @param result
   */
  onAssetListReceived = (result) => {
    assetListStore.reset(result.files);
    if (this._isMounted) {
      this.setState({assets: assetListStore.list(this.props.allowedExtensions)});
    }
  };

  /**
   * Called after the component mounts, if the server responds with an error
   * when loading the current list of assets.
   * @param xhr
   */
  onAssetListFailure = (xhr) => {
    if (this._isMounted) {
      this.setState({
        statusMessage: 'Error loading asset list: ' + getErrorMessage(xhr.status)
      });
    }
  };

  onUploadStart = (data) => {
    this.setState({statusMessage: 'Uploading...'});
    data.submit();
  };

  onUploadDone = (result) => {
    assetListStore.add(result);
    if (this.props.assetsChanged) {
      this.props.assetsChanged();
    }
    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions),
      statusMessage: 'File "' + result.filename + '" successfully uploaded!'
    });
  };

  onUploadError = (status) => {
    this.setState({statusMessage: 'Error uploading file: ' +
      getErrorMessage(status)});
    firehoseClient.putRecord(
      {
        study: 'project-data-integrity',
        study_group: 'v4',
        event: 'asset-upload-error',
        project_id: this.props.projectId,
        data_int: status
      },
    );
  };

  onSelectRecord = () => {
    this.setState({recordingAudio: true});
  };

  deleteAssetRow = (name) => {
    assetListStore.remove(name);
    if (this.props.assetsChanged) {
      this.props.assetsChanged();
    }
    this.setState({
      assets: assetListStore.list(this.props.allowedExtensions),
      statusMessage: 'File "' + name + '" successfully deleted!'
    });
  };

  afterAudioSaved = (err) => {
    this.setState({recordingAudio: false, audioErrorType: err});
  };

  render() {
    const displayAudioRecorder = this.state.audioErrorType !== AudioErrorType.INITIALIZE && this.state.recordingAudio;
    const buttons = (
      <div>
        {this.state.audioErrorType === AudioErrorType.SAVE &&
          <div>{i18n.audioSaveError()}</div>
        }
        {this.state.audioErrorType === AudioErrorType.INITIALIZE &&
          <div>{i18n.audioInitializeError()}</div>
        }
        {displayAudioRecorder &&
          <AudioRecorder onUploadDone={this.onUploadDone} afterAudioSaved={this.afterAudioSaved} imagePicker={this.props.imagePicker}/>
        }
        <AddAssetButtonRow
          uploadsEnabled={this.props.uploadsEnabled}
          allowedExtensions={this.props.allowedExtensions}
          useFilesApi={this.props.useFilesApi}
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
    // If `this.state.assets` is null, the asset list is still loading. If it's
    // empty, the asset list has loaded and there are no assets in the current
    // channel (matching the `allowedExtensions`, if any were provided).
    if (this.state.assets === null) {
      assetList = (
        <div style={{margin: '1em 0', textAlign: 'center'}}>
          <i className="fa fa-spinner fa-spin" style={{fontSize: '32px'}}></i>
        </div>
      );
    } else if (this.state.assets.length === 0) {
      const emptyText = this.props.allowedExtensions === '.mp3'?
        (<div>
          <div>Go to the "Sound library" to find sounds for your project.</div>
          <div>To upload your own sound, click "Upload File." Your uploaded assets will appear here.</div>
          </div>)
        : ('Your assets will appear here. Click "Upload File" to add a new asset for this project.');
      assetList = (
        <div>
          <div style={styles.emptyText}>
            {emptyText}
          </div>
          {buttons}
        </div>
      );
    } else {
      const rows = this.state.assets.map(function (asset) {
        const choose = this.props.assetChosen && this.props.assetChosen.bind(this,
            asset.filename);

        return (
          <AssetRow
            key={asset.filename}
            name={asset.filename}
            timestamp={asset.timestamp}
            type={asset.category}
            size={asset.size}
            useFilesApi={this.props.useFilesApi}
            onChoose={choose}
            onDelete={this.deleteAssetRow.bind(this, asset.filename)}
            soundPlayer={this.props.soundPlayer}
            imagePicker={this.props.imagePicker}
          />
        );
      }.bind(this));

      assetList = (
        <div>
          <div style={{maxHeight: '330px', overflowY: 'scroll', margin: '1em 0'}}>
            <table style={{width: '100%'}}>
              <tbody>
                {rows}
              </tbody>
            </table>
          </div>
          {buttons}
        </div>
      );
    }

    return assetList;
  }
}
