import React from 'react';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';

const styles = {
  button: {
    minWidth: 0,
    padding: '10px 13px',
    backgroundColor: color.orange,
    borderColor: color.orange,
    color: color.white
  }
};

class PauseButton extends React.Component {
  togglePause = () => {
    console.log('toggle');
  };

  render() {
    const isAttached = true;
    const isPaused = false;
    return (
      <button
        type="button"
        onClick={this.togglePause}
        style={styles.button}
        disabled={!isAttached}
      >
        <i className={isPaused ? 'fa fa-play' : 'fa fa-pause'} />
      </button>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({})
)(PauseButton);
