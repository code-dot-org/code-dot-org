import React from 'react';
import RPS from './activities/rps/RPS';

const Activity = Object.freeze({
  None: 0,
  RPS: 1,
});

module.exports = class MLActivities extends React.Component {
  state = {
    currentActivity: Activity.None,
  };

  render() {
    return <div>
      <h1>
        ML Activities Playground
      </h1>
      {
        this.state.currentActivity === Activity.None &&
        <button
          style={{height: 40}}
          onClick={() => this.setState({
            currentActivity: Activity.RPS
          })}
        >
          Pick RPS Activity
        </button>
      }
      {
        this.state.currentActivity === Activity.RPS &&
        <RPS/>
      }
    </div>;
  }
};
