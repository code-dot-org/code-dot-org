import React from 'react';
import Button from "../../templates/Button";
import i18n from '@cdo/locale';

const styles = {
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 10,
    borderRadius: 4,
    fontSize: 'large',
    fontWeight: 'lighter',
    boxShadow: 'none',
  }
};

export default class AudioRecorder extends React.Component {
  state = {
    audioName: 'mysound',
    recording: false,
    errorInitialize: false
  };

  componentDidMount = () => {
    //Initialize the media recorder when the component loads
    this.initializeMediaRecorder();
  };

  initializeMediaRecorder = () => {
    //Check if the user has mediaDevices and request permission to use the microphone
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({audio: true})
        .then((stream) => {
          let mediaRecorder = new MediaRecorder(stream);
        })
        .catch((err) => {
          this.recordError(err);
        });
    } else {
      this.recordError();
    }
  };

  recordError = (err) => {
    console.log('Audio Initializing Error: ' + err);
    this.setState({errorInitialize: true});
  };

  onNameChange = (event) => {
    this.setState({audioName: event.target.value});
  };

  toggleRecord = () => {
    this.setState({recording: !this.state.recording});
  };

  render() {
    return (
      <div style={styles.buttonRow}>
        {!this.state.errorInitialize &&
          <div>
            <input type="text" placeholder="mysound1.mp3" onChange={this.onNameChange} value={this.state.audioName}/>
            <span>
              <Button
                onClick={this.toggleRecord}
                id="start-stop-record"
                style={styles.button}
                color={Button.ButtonColor.blue}
                icon={this.state.recording ? "stop" : "circle"}
                text={this.state.recording ? i18n.stop() : i18n.record()}
                size="large"
              />
              <Button
                onClick={()=>{}}
                id="cancel-record"
                style={styles.button}
                color={Button.ButtonColor.gray}
                text={i18n.cancel()}
                size="large"
              />
            </span>
          </div>
        }
        {this.state.errorInitialize &&
          <div>{i18n.audioInitializeError()}</div>
        }
      </div>
    );
  }
}
