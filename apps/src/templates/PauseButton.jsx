import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

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
    return (
      <MuiIconButton
        type="button"
        variant={
          this.props.isRunning && this.props.isPaused ? 'contained' : 'outlined'
        }
        color="primary"
        onClick={this.togglePause}
        disabled={!this.props.isRunning}
        id="pauseButton"
        aria-label={this.props.isPaused ? 'Play' : 'Pause'}
      >
        <FontAwesomeV6Icon iconName={this.props.isPaused ? 'play' : 'pause'} />
      </MuiIconButton>
    );
  }
}

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
