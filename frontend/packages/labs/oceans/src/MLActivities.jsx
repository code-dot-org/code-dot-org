import React from 'react';
import RPS from './activities/rps/rps';

module.exports = class MLActivities extends React.Component {
  startRPS() {
    new RPS();
  }

  render() {
    return <div>
      <h1>
        ML Activity Playground
      </h1>
      <button onClick={this.startRPS}>
        RPS Activity
      </button>
    </div>;
  }
};
