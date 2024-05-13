import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {actions, selectors} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setArrowButtonDisabled} from '@cdo/apps/templates/arrowDisplayRedux';
import color from '@cdo/apps/util/color';

class PauseButton extends React.Component {
  static propTypes = {
    pauseHandler: PropTypes.func.isRequired,
    marginRight: PropTypes.number,
    // from redux
    togglePause: PropTypes.func.isRequired,
    setArrowButtonDisabled: PropTypes.func.isRequired,
    isPaused: PropTypes.bool.isRequired,
    isAttached: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
  };

  state = {
    pauseStart: 0,
  };

  togglePause = () => {
    this.props.pauseHandler(this.props.isPaused);
    this.props.setArrowButtonDisabled(!this.props.isPaused);
    this.props.togglePause();
  };

  render() {
    const buttonStyle = {
      ...styles.button,
      ...(this.props.marginRight && {marginRight: this.props.marginRight}),
    };
    const iconStyle = {
      ...styles.icon,
      ...(this.props.isAttached && styles.inactiveColor),
      ...(this.props.isRunning && styles.runningColor),
      ...(this.props.isPaused && styles.pausedColor),
    };

    return (
      <button
        type="button"
        onClick={this.togglePause}
        style={buttonStyle}
        disabled={!this.props.isRunning}
        className="no-focus-outline"
        id="pauseButton"
      >
        <div style={styles.container}>
          <i
            style={iconStyle}
            className={
              this.props.isPaused
                ? 'fa fa-fw fa-play-circle'
                : 'fa fa-fw fa-pause-circle'
            }
          />
        </div>
      </button>
    );
  }
}

const styles = {
  icon: {
    lineHeight: 'inherit',
    fontSize: 48,
  },
  container: {
    width: 40,
    height: 40,
    lineHeight: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    minWidth: 0,
    padding: 0,
    borderRadius: '100%',
    backgroundColor: color.white,
  },
  inactiveColor: {
    color: '#C7C7C7',
  },
  runningColor: {
    color: color.cyan,
  },
  pausedColor: {
    color: color.orange,
  },
};

export default connect(
  state => ({
    isAttached: selectors.isAttached(state),
    isPaused: selectors.isPaused(state),
    isRunning: selectors.isRunning(state),
  }),
  {
    togglePause: actions.togglePause,
    setArrowButtonDisabled,
  }
)(PauseButton);
