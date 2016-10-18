/* RoboticsButton: A button shown below the filters that goes to /learn2016/robotics.
 */

import React from 'react';

const RoboticsButton = React.createClass({
  render() {
    return (
      <a href="/learn2016/robotics">
        <img src="/images/learn/robotics-link.png" style={{marginTop: 10}}/>
      </a>
    );
  }
});

export default RoboticsButton;
