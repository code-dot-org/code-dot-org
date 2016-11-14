/* RoboticsButton: A button shown below the filters that goes to /learn/robotics.
 */

import React from 'react';
import { getResponsiveValue } from './responsive';
import i18n from './locale';

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

const RoboticsButton = React.createClass({
  render() {
    const roboticsTextStyle = {
      ...styles.roboticsText,
      display: getResponsiveValue({xs: "block", md: "none"})
    };

    return (
      <div style={{float:"left"}}>
        <div style={{display: getResponsiveValue({md: "block", xs: "none"})}}>
          <a href="/learn/robotics">
            <img src="/images/learn/robotics-link.png" style={styles.roboticsButtonImage}/>
          </a>
        </div>
        <div style={roboticsTextStyle}>
          {i18n.roboticsButtonText({robotics_url: "/learn/robotics"})}
        </div>
      </div>
    );
  }
});

export default RoboticsButton;
