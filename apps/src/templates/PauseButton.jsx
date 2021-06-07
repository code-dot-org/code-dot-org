import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {actions, selectors} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {setArrowButtonDisabled} from '@cdo/apps/templates/arrowDisplayRedux';

class PauseButton extends React.Component {
  static propTypes = {
    pauseHandler: PropTypes.func.isRequired,
    marginRight: PropTypes.number,
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
      ...(this.props.isPaused && styles.pausedColor),
      ...(this.props.marginRight && {marginRight: this.props.marginRight})
    };

    return (
      <button
        type="button"
        onClick={this.togglePause}
        style={buttonStyle}
        disabled={!this.props.isRunning}
        className="no-focus-outline"
      >
        <div style={styles.container}>
          <i
            style={styles.icon}
            className={
              this.props.isPaused ? 'fa fa-fw fa-play' : 'fa fa-fw fa-pause'
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
    color: color.white
  },
  container: {
    width: 40,
    height: 40,
    lineHeight: '40px',
    textAlign: 'center',
    verticalAlign: 'middle',
    display: 'inline-block'
  },
  button: {
    minWidth: 0,
    padding: 0,
    borderRadius: '100%'
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
