import PropTypes from 'prop-types';
import React from 'react';
import IdleTimer from 'react-idle-timer';
import {connect} from 'react-redux';

import {setStartIdle, setEndIdle} from '@cdo/apps/redux/studioAppActivity';

// Idle time doesn't start tracking until after IDLE_AFTER milliseconds of idling
const IDLE_AFTER = 1000 * 60 * 2;

/**
 * Timer component for all Code Studio app types, this component does idle time tracking
 * which is stored in redux and used for calculating time spent on a level.
 */
class StudioAppIdleTimer extends React.Component {
  static propTypes = {
    setStartIdle: PropTypes.func.isRequired,
    setEndIdle: PropTypes.func.isRequired,
  };

  render() {
    return (
      <IdleTimer
        timeout={IDLE_AFTER}
        onIdle={this.props.setStartIdle}
        onActive={this.props.setEndIdle}
      />
    );
  }
}

export default connect(null, dispatch => ({
  setStartIdle() {
    dispatch(setStartIdle());
  },
  setEndIdle() {
    dispatch(setEndIdle());
  },
}))(StudioAppIdleTimer);
