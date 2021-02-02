import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {actions, selectors} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setArrowButtonDisabled} from '@cdo/apps/templates/arrowDisplayRedux';

const styles = {
  button: {
    minWidth: 0,
    padding: '10px 13px',
    borderRadius: '100%',
    color: color.white
  },
  runningColor: {
    backgroundColor: color.cyan,
    borderColor: color.cyan
  },
  pausedColor: {
    backgroundColor: color.orange,
    borderColor: color.orange
  }
};

class PauseButton extends React.Component {
  static propTypes = {
    pauseHandler: PropTypes.func.isRequired,
    // from redux
    togglePause: PropTypes.func.isRequired,
    setArrowButtonDisabled: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isAttached: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired
  };

  state = {
    pauseStart: 0
  };

  togglePause = () => {
    this.props.pauseHandler(this.props.isPaused);
    this.props.setArrowButtonDisabled(!this.props.isPaused);
    this.props.togglePause();
  };

  render() {
    const buttonStyle = {
      ...styles.button,
      ...(this.props.isRunning && styles.runningColor),
      ...(this.props.isPaused && styles.pausedColor)
    };

    return (
      <button
        type="button"
        onClick={this.togglePause}
        style={buttonStyle}
        disabled={!this.props.isRunning}
      >
        <i className={this.props.isPaused ? 'fa fa-play' : 'fa fa-pause'} />
      </button>
    );
  }
}

export default connect(
  state => ({
    isAttached: selectors.isAttached(state),
    isPaused: selectors.isPaused(state),
    isRunning: selectors.isRunning(state)
  }),
  {
    togglePause: actions.togglePause,
    setArrowButtonDisabled
  }
)(PauseButton);
