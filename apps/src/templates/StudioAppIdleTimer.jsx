import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import IdleTimer from 'react-idle-timer';
import {setIdleTimeMs} from '@cdo/apps/redux/studioAppActivity';

const IDLE_AFTER = 1000 * 60 * 2;

/**
 * Timer component for all Code Studio app types, this component does idle time tracking
 * which is stored in redux and used for calculating time spent on a level.
 */
class StudioAppIdleTimer extends React.Component {
  static propTypes = {
    totalIdleTime: PropTypes.number.isRequired,
    setIdleTime: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      idleStart: null
    };
  }

  // This method isn't called until user has been idle for IDLE_AFTER ms,
  // which is when we start actually tracking idle time
  onIdle = () => {
    this.setState({idleStart: new Date().getTime()});
  };

  onActive = () => {
    if (this.state.idleStart) {
      const now = new Date().getTime();
      const timeSpentIdle = now - this.state.idleStart;
      this.props.setIdleTime(this.props.totalIdleTime + timeSpentIdle);
    }
  };

  render() {
    return (
      <IdleTimer
        timeout={IDLE_AFTER}
        onIdle={this.onIdle}
        onActive={this.onActive}
        debounce={250}
      />
    );
  }
}

export default connect(
  state => ({
    totalIdleTime: state.studioAppActivity.idleTimeMs
  }),
  dispatch => ({
    setIdleTime(ms) {
      dispatch(setIdleTimeMs(ms));
    }
  })
)(StudioAppIdleTimer);
