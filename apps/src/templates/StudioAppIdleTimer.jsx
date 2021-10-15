import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import IdleTimer from 'react-idle-timer';
import {setIdleTimeMs} from '@cdo/apps/redux/studioAppActivity';

/**
 * Wrapper component for all Code Studio app types, which provides rotate
 * container and clear-div but otherwise just renders children.
 */
class StudioAppIdleTimer extends React.Component {
  static propTypes = {
    setIdleTime: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.idleTimer = null;

    this.state = {
      lastIdleStart: null,
      totalIdleTime: 0
    };
  }

  onIdle = () => {
    console.log('on Idle');
    // Don't start calculating idle time until user has been idle for timeout seconds
    this.setState({lastIdleStart: new Date().getTime()});
  };

  onActive = () => {
    console.log('onAction');
    if (this.state.lastIdleStart) {
      const now = new Date().getTime();
      const newIdleTime = now - this.state.lastIdleStart;
      this.setState({
        totalIdleTime: this.state.totalIdleTime + newIdleTime
      });
      this.props.setIdleTime(this.state.totalIdleTime + newIdleTime);
    }
  };

  render() {
    return (
      <IdleTimer
        ref={ref => {
          this.idleTimer = ref;
        }}
        timeout={1000 * 15}
        onIdle={this.onIdle}
        onActive={this.onActive}
        debounce={250}
      />
    );
  }
}

export default connect(
  null,
  dispatch => ({
    setIdleTime(ms) {
      dispatch(setIdleTimeMs(ms));
    }
  })
)(StudioAppIdleTimer);
