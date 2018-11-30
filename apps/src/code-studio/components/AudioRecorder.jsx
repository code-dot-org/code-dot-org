import React, {PropTypes} from 'react';
import Button from "../../templates/Button";
import i18n from '@cdo/locale';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {assetButtonStyles} from "./AddAssetButtonRow";
import {AudioErrorType} from "./AssetManager";
import firehoseClient from "@cdo/apps/lib/util/firehose";
import experiments from "@cdo/apps/util/experiments";

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
    this.slices = [];
    this.state = {
      audioName: "",
      recording: false
    };
  }

  componentDidMount = () => {
    //Initialize the media recorder when the component loads
    //Check if the user has mediaDevices and request permission to use the microphone
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({audio: true})
        .then(this.initializeMediaRecorder)
        .catch(() => this.props.afterAudioSaved(AudioErrorType.INITIALIZE));
    } else {
      this.props.afterAudioSaved(AudioErrorType.INITIALIZE);
    }
  };

  initializeMediaRecorder = (stream) => {
    // Set newly initialized mediaRecorder to instance variable
    // Media Recorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    this.recorder = new MediaRecorder(stream);

    // Set method to save the data when it becomes available
    this.recorder.ondataavailable = (e) => {
      this.slices.push(e.data);
    };

    this.recorder.onstart = () => {
      this.slices = [];
    };
  };

  saveAudio = (blob) => {
    assetsApi.putAsset(this.state.audioName + ".mp3", blob,
    (xhr) => {
      this.setState({audioName: ""});
      let result = JSON.parse(xhr.response);
      result.filename = decodeURI(result.filename);
      this.props.onUploadDone(result);
      this.props.afterAudioSaved(AudioErrorType.NONE);
    }, error => {
      console.error(`Audio Failed to Save: ${error}`);
      this.props.afterAudioSaved(AudioErrorType.SAVE);
    });
  };

  onNameChange = (event) => {
    this.setState({audioName: event.target.value});
  };

  onCancel = () => {
    this.setState({audioName: "", recording: false}, () => {
      this.props.afterAudioSaved(AudioErrorType.NONE);
      // Only stop recording if it's been started
      if (this.recorder.state !== "inactive") {
        clearTimeout(this.recordTimeout);
        this.recorder.stop();
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
    const studyGroup = this.props.imagePicker ? 'manage-assets' :
      (experiments.isEnabled(experiments.AUDIO_LIBRARY_DEFAULT) ? 'library-tab' : 'files-tab');
    this.recorder.start();
    firehoseClient.putRecord(
      {
        study: 'sound-dialog-1',
        study_group: studyGroup,
        event: 'record-sound',
        data_json: this.state.audioName,
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
      this.setStopAndSaveBehavior();
      this.recorder.stop();
      this.setState({recording: !this.state.recording});
    }
  };

  //Set the recorder onstop behavior to save the final audio blob
  setStopAndSaveBehavior = () => {
    this.recorder.onstop = () => {
      const blob = new Blob(this.slices, {'type': 'audio/mpeg'});
      this.saveAudio(blob);
      this.recorder.onstop = () => {};
    };
  };

  render() {
    return (
      <div style={styles.buttonRow}>
        <input type="text" placeholder={i18n.soundName()} onChange={this.onNameChange} value={this.state.audioName}/>
        {this.state.recording &&
          <span style={assetButtonStyles.button}>
            <i style={styles.recordingIcon} className="fa fa-circle"/>
            {i18n.recording()}
          </span>
        }
        <span>
          <Button
            onClick={this.toggleRecord}
            id="start-stop-record"
            style={assetButtonStyles.button}
            color={Button.ButtonColor.blue}
            icon={this.state.recording ? "stop" : "circle"}
            text={this.state.recording ? i18n.stop() : i18n.record()}
            size="large"
            disabled={this.state.audioName.length === 0}
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
    );
  }
}
