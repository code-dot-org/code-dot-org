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
    marginRight: 30,
    borderRadius: 4
  }
};

export default class AudioRecorder extends React.Component {
  state = {
    audioName: 'mysound',
    recording: false
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
        <input type="text" placeholder="mysound1.mp3" onChange={this.onNameChange} value={this.state.audioName}/>
        <span>
          <Button
            onClick={this.toggleRecord}
            id="start-stop-record"
            style={styles.button}
            color={Button.ButtonColor.blue}
            icon={this.state.recording ? "stop" : "circle"}
            text={this.state.recording ? i18n.stop() : i18n.record()}
          />
          <Button
            onClick={()=>{}}
            id="cancel-record"
            style={styles.button}
            text={i18n.cancel()}
          />
        </span>
      </div>
    );
  }
}
