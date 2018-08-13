import React, {PropTypes} from 'react';
import Button from "../../templates/Button";
import i18n from '@cdo/locale';
import {assets as assetsApi} from '@cdo/apps/clientApi';
import {assetButtonStyles} from "./AddAssetButtonRow";

const ErrorType = {
  NONE: 'none',
  INITIALIZE: 'initialize',
  SAVE: 'save'
};

const styles = {
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
};

export default class AudioRecorder extends React.Component {
  static propTypes = {
    onUploadDone: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.recorder = null;
    this.slices = [];
    this.state = {
      audioName: 'mysound',
      recording: false,
      error: ErrorType.NONE
    };
  }

  componentDidMount = () => {
    //Initialize the media recorder when the component loads
    //Check if the user has mediaDevices and request permission to use the microphone
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({audio: true})
        .then(this.initializeMediaRecorder)
        .catch(this.recordInitializationError);
    } else {
      this.recordInitializationError();
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

    // Set method to create data blob after recording has stopped
    this.recorder.onstop = (e) => {
      const blob = new Blob(this.slices, {'type': 'audio/mpeg'});
      this.slices = [];
      this.saveAudio(blob);
    };
  };

  saveAudio = (blob) => {
    assetsApi.putAsset(this.state.audioName + ".mp3", blob,
    (xhr) => {
      this.setState({error: ErrorType.NONE});
      this.props.onUploadDone(JSON.parse(xhr.response));
    }, error => {
      this.setState({error: ErrorType.SAVE});
      console.error(`Audio Failed to Save: ${error}`);
    });
  };

  recordInitializationError = (err) => {
    console.error('Audio Recorder Failed to Initialize: ' + err);
    this.setState({error: ErrorType.INITIALIZE});
  };

  onNameChange = (event) => {
    this.setState({audioName: event.target.value});
  };

  toggleRecord = () => {
    if (this.state.recording) {
      this.recorder.stop();
    } else {
      this.recorder.start();
    }
    this.setState({recording: !this.state.recording});
  };

  render() {
    return (
      <div>
        {this.state.error === ErrorType.SAVE &&
          <div>{i18n.audioSaveError()}</div>
        }
        {this.state.error !== ErrorType.INITIALIZE &&
          <div style={styles.buttonRow}>

            <input type="text" placeholder="mysound1.mp3" onChange={this.onNameChange} value={this.state.audioName}/>
            <span>
              <Button
                onClick={this.toggleRecord}
                id="start-stop-record"
                style={assetButtonStyles.button}
                color={Button.ButtonColor.blue}
                icon={this.state.recording ? "stop" : "circle"}
                text={this.state.recording ? i18n.stop() : i18n.record()}
                size="large"
              />
              <Button
                onClick={()=>{}}
                id="cancel-record"
                style={assetButtonStyles.button}
                color={Button.ButtonColor.gray}
                text={i18n.cancel()}
                size="large"
              />
            </span>
          </div>
        }
        {this.state.error === ErrorType.INITIALIZE &&
          <div>{i18n.audioInitializeError()}</div>
        }
      </div>
    );
  }
}
