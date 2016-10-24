/* RoboticsButton: A button shown below the filters that goes to /learn2016/robotics.
 */

import React from 'react';

const styles = {
  roboticsButtonImage: {
    marginTop: 10,
    marginBottom: 20
  }
};

const RoboticsButton = (props) => (
  <a href="/learn2016/robotics">
    <img src="/images/learn/robotics-link.png" style={styles.roboticsButtonImage}/>
  </a>
);

export default RoboticsButton;
