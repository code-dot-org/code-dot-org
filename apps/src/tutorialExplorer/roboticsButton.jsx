/* RoboticsButton: A button shown below the filters that goes to /learn/robotics.
 */

import React from 'react';

const styles = {
  roboticsButtonImage: {
    marginTop: 10,
    marginBottom: 20
  },
  roboticsText: {
    float: "left",
    margin: 5,
    padding: 5,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#eee"
  }
};

const RoboticsButton = (props) => (
  <div style={{float:"left"}}>
    <div className="desktop-feature">
      <a href="/learn/robotics">
        <img src="/images/learn/robotics-link.png" style={styles.roboticsButtonImage}/>
      </a>
    </div>
    <div className="mobile-feature" style={styles.roboticsText}>
      Got robots? <a href="/learn/robotics">Use these activities</a> and make a tangible Hour of Code for students of any age!
    </div>
  </div>
);

export default RoboticsButton;
