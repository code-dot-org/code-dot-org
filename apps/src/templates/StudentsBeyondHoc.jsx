import React, { PropTypes, Component } from 'react';
import i18n from "@cdo/locale";
import color from "../util/color";

const styles = {
  heading: {
    color: color.teal
  }
};

export default class StudentsBeyondHoc extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(['applab', 'newMinecraft', 'oldMinecraft', 'other']).isRequired,
    MCShareLink: PropTypes.string
  };

  render() {
    return (
      <div>
        <h1 style={styles.heading}>
          {i18n.congratsStudentHeading()}
        </h1>
      </div>
    );
  }
}
