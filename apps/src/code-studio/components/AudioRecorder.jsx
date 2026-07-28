import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {assets as assetsApi} from '@cdo/apps/clientApi';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import {assetButtonStyles} from './AddAssetButtonRow';
import {AudioErrorType} from './AssetManager';
import getRecorder, {RecordingFileType} from './recorders';

const RECORD_MAX_TIME = 30000;

export default class AudioRecorder extends React.Component {
  static propTypes = {
    onUploadDone: PropTypes.func,
    afterAudioSaved: PropTypes.func,
    recordingFileType: PropTypes.oneOf(Object.values(RecordingFileType)),

    //Temporary prop for logging - indicates user chose 'Manage Assets'
    imagePicker: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.timeout = null;
    this.recorder = null;
    this.state = {
      audioName: '',
      recording: false,
      loading: true,
    };
  }

  componentDidMount = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.recorder = getRecorder(this.props.recordingFileType);

      navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(this.recorder.init)
        .then(() => this.setState({loading: false}))
        .catch(() => this.props.afterAudioSaved(AudioErrorType.INITIALIZE));
    } else {
      this.props.afterAudioSaved(AudioErrorType.INITIALIZE);
    }
  };

  saveAudio = blob => {
    this.setState({loading: true});
    assetsApi.putAsset(
      this.state.audioName + this.recorder.getExtension(),
      blob,
      xhr => {
        this.setState({audioName: '', loading: false});
        let result = JSON.parse(xhr.response);
        result.filename = decodeURI(result.filename);
        this.props.onUploadDone(result);
        this.props.afterAudioSaved(AudioErrorType.NONE);
      },
      error => {
        this.setState({loading: false});
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
      if (this.recorder.isRecording()) {
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
    this.recorder.startRecording().then(() => {
      this.setState({recording: !this.state.recording});
    });

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
      <div style={styles.root}>
        <div style={styles.buttonRow}>
          <TextField
            name="audioName"
            size="s"
            placeholder={i18n.soundName()}
            onChange={this.onNameChange}
            value={this.state.audioName}
          />
          {this.state.recording && (
            <span style={assetButtonStyles.button}>
              <i style={styles.recordingIcon} className="fa-solid fa-circle" />
              {i18n.recording()}
            </span>
          )}
          <span style={styles.actionGroup}>
            {this.state.loading && this.state.audioName.length > 0 && (
              <FontAwesomeV6Icon
                iconName="spinner"
                animationType="spin"
                style={{fontSize: '20px'}}
              />
            )}
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              onClick={this.toggleRecord}
              id="start-stop-record"
              disabled={this.state.audioName.length === 0 || this.state.loading}
              startIcon={
                <FontAwesomeV6Icon
                  iconName={this.state.recording ? 'stop' : 'circle'}
                  iconStyle="solid"
                />
              }
            >
              {this.state.recording ? i18n.stop() : i18n.record()}
            </MuiButton>
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              onClick={this.onCancel}
              id="cancel-record"
              type="button"
            >
              {i18n.cancel()}
            </MuiButton>
          </span>
        </div>
      </div>
    );
  }
}

const styles = {
  root: {
    marginBottom: 16,
  },
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingIcon: {
    color: 'red',
    margin: 5,
  },
  warning: {
    textAlign: 'left',
    color: color.red,
  },
  actionGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
};
