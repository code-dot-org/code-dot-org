import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import ProgressButton from "../progress/ProgressButton";

const styles = {
  section: {
    width: 940,
    backgroundColor: color.white,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: color.border_gray,
    borderRadius: 2,
  },
  heading: {
    paddingLeft: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.teal,
  },
  description: {
    paddingLeft: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  button: {
    marginLeft: 50,
    marginBottom: 80
  }
};

const SetUpMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['courses', 'sections']).isRequired,
    codeOrgUrlPrefix: React.PropTypes.string,
  },

  render() {
    const { type, codeOrgUrlPrefix } = this.props;
    const sectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    if (type === 'courses') {
      return (
        <div style={styles.section} >
          <div style={styles.heading}>
            {i18n.startLearning()}
          </div>
          <div style={styles.description}>
            {i18n.assignACourse()}
          </div>
          <ProgressButton
            href="/courses"
            color={ProgressButton.ButtonColor.gray}
            text={i18n.viewCourses()}
            style={styles.button}
          />
        </div>
      );
    }
    if (type === 'sections') {
      return (
        <div style={styles.section} >
          <div style={styles.heading}>
            {i18n.setUpClassroom()}
          </div>
          <div style={styles.description}>
            {i18n.createNewClassroom()}
          </div>
          <ProgressButton
            href={sectionsUrl}
            color={ProgressButton.ButtonColor.gray}
            text={i18n.createSection()}
            style={styles.button}
          />
        </div>
      );
    }
  }
});

export default SetUpMessage;
