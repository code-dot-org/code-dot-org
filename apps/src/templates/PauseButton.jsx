import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {actions, selectors} from '@cdo/apps/lib/tools/jsdebugger/redux';
import * as coreLibrary from '@cdo/apps/p5lab/spritelab/coreLibrary';

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
  static propTypes = {
    // from redux
    togglePause: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isAttached: PropTypes.bool.isRequired
  };

  state = {
    pauseStart: 0
  };

  togglePause = () => {
    const current = new Date().getTime();
    if (this.props.isPaused) {
      coreLibrary.addPauseTime(current - this.state.pauseStart);
      this.setState({pauseStart: 0});
    } else {
      this.setState({pauseStart: current});
    }
    this.props.togglePause();
  };

  render() {
    return (
      <button
        type="button"
        onClick={this.togglePause}
        style={styles.button}
        disabled={!this.props.isAttached}
      >
        <i className={this.props.isPaused ? 'fa fa-play' : 'fa fa-pause'} />
      </button>
    );
  }
}

export default connect(
  state => ({
    isAttached: selectors.isAttached(state),
    isPaused: selectors.isPaused(state)
  }),
  {
    togglePause: actions.togglePause
  }
)(PauseButton);
