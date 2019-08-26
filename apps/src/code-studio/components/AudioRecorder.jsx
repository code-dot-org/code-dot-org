/* global navigator */
import PropTypes from 'prop-types';
import React from 'react';
import Button from '../../templates/Button';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {assetButtonStyles} from './AddAssetButtonRow';
import {AudioErrorType} from './AssetManager';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import vmsg from 'vmsg';

const styles = {
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recordingIcon: {
    color: 'red',
    margin: 5
  },
  warning: {
    textAlign: 'left',
    color: color.red
  },
  spinner: {
    display: 'inline-block',
    verticalAlign: 'top',
    marginTop: '16px',
    marginRight: '10px'
  }
};

const RECORD_MAX_TIME = 30000;

export default class AudioRecorder extends React.Component {
  static propTypes = {
    onUploadDone: PropTypes.func,
    afterAudioSaved: PropTypes.func,

    //Temporary prop for logging - indicates user chose 'Manage Assets'
    imagePicker: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.timeout = null;
    this.recorder = null;
    this.state = {
      audioName: '',
      recording: false,
      loading: true
    };
  }

  componentDidMount = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.recorder = new vmsg.Recorder({wasmURL: '/shared/wasm/vmsg.wasm'});
      this.initializeMp3Recorder().catch(() =>
        this.props.afterAudioSaved(AudioErrorType.INITIALIZE)
      );
    } else {
      this.props.afterAudioSaved(AudioErrorType.INITIALIZE);
    }
  };

  initializeMp3Recorder = async () => {
    await this.recorder.initAudio();
    await this.recorder.initWorker();
    this.setState({loading: false});
  };

  saveAudio = blob => {
    assetsApi.putAsset(
      this.state.audioName + '.mp3',
      blob,
      xhr => {
        this.setState({audioName: ''});
        let result = JSON.parse(xhr.response);
        result.filename = decodeURI(result.filename);
        this.props.onUploadDone(result);
        this.props.afterAudioSaved(AudioErrorType.NONE);
      },
      error => {
        console.error(`Audio Failed to Save: ${error}`);
        this.props.afterAudioSaved(AudioErrorType.SAVE);
      }
    );
  };

  onNameChange = event => {
    this.setState({audioName: event.target.value});
  };

  onCancel = () => {
    this.setState({audioName: '', recording: false}, () => {
      this.props.afterAudioSaved(AudioErrorType.NONE);
      // Only stop recording if it's been started
      if (this.recorder.blob) {
        clearTimeout(this.recordTimeout);
        this.recorder.stopRecording();
      }
    });
  };

  toggleRecord = () => {
    if (this.state.recording) {
      this.stopRecordingAndSave();
    } else {
      this.startRecording();
    }
  };

  startRecording = () => {
    const studyGroup = this.props.imagePicker ? 'manage-assets' : 'library-tab';
    this.recorder.startRecording();
    firehoseClient.putRecord(
      {
        study: 'sound-dialog-2',
        study_group: studyGroup,
        event: 'record-sound',
        data_json: this.state.audioName
      },
      {includeUserId: true}
    );
    this.setState({recording: !this.state.recording});

    //Stop recording after set amount of time
    this.recordTimeout = setTimeout(this.stopRecordingAndSave, RECORD_MAX_TIME);
  };

  //Stop recording and save the final audio
  stopRecordingAndSave = () => {
    if (this.state.recording) {
      clearTimeout(this.recordTimeout);
      this.recorder.stopRecording().then(blob => {
        this.saveAudio(blob);
      });
      this.setState({recording: !this.state.recording});
    }
  };

  render() {
    return (
      <div>
        <div style={styles.buttonRow}>
          <input
            type="text"
            placeholder={i18n.soundName()}
            onChange={this.onNameChange}
            value={this.state.audioName}
          />
          {this.state.recording && (
            <span style={assetButtonStyles.button}>
              <i style={styles.recordingIcon} className="fa fa-circle" />
              {i18n.recording()}
            </span>
          )}
          <span>
            {this.state.loading && this.state.audioName.length > 0 && (
              <div style={styles.spinner}>
                <i
                  className="fa fa-spinner fa-spin"
                  style={{fontSize: '20px'}}
                />
              </div>
            )}
            <Button
              onClick={this.toggleRecord}
              id="start-stop-record"
              style={assetButtonStyles.button}
              color={Button.ButtonColor.blue}
              icon={this.state.recording ? 'stop' : 'circle'}
              text={this.state.recording ? i18n.stop() : i18n.record()}
              size="large"
              disabled={this.state.audioName.length === 0 || this.state.loading}
            />
            <Button
              onClick={this.onCancel}
              id="cancel-record"
              style={assetButtonStyles.button}
              color={Button.ButtonColor.gray}
              text={i18n.cancel()}
              size="large"
            />
          </span>
        </div>
      </div>
    );
  }
}
