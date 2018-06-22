import React, { PropTypes } from 'react';

const styles = {
  buttonRow: {
    display: 'flex',
    flexFlow: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginRight: 30
  }
};

class AudioRecorder extends React.Component {
  static propTypes = {
    visible: PropTypes.bool
  };

  state = {
    audioName: 'mysound'
  };

  onNameChange = (event) => {
    this.setState({audioName: event.target.value});
  };

  render() {
    if (this.props.visible) {
      return <div></div>;
    }

    return (
      <div style={styles.buttonRow}>
        <input type="text" placeholder="mysound1.mp3" onChange={this.onNameChange} value={this.state.audioName}></input>
        <span>
          <button
            onClick={this.onStopClick}
            className="share"
            id="record-asset"
            style={styles.button}
          >
            <i className="fa fa-stop" />
            &nbsp;Stop
          </button>
          <button
            onClick={()=>{}}
            className="share"
            id="record-asset"
            style={styles.button}
          >
            Cancel
          </button>
        </span>
      </div>
    );
  }
}

export default AudioRecorder;
