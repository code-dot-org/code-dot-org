import React from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import Button from "../Button";

const styles = {
  section: {
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    borderStyle: 'dashed',
    borderWidth: 5,
    borderColor: color.border_gray,
    boxSizing: "border-box"
  },
  heading: {
    paddingLeft: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  rtlHeading: {
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 38,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  description: {
    paddingLeft: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  rtlDescription: {
    paddingRight: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 18,
    color: color.charcoal
  },
  button: {
    marginLeft: 50,
    marginBottom: 80
  },
  rtlButton: {
    marginRight: 50,
    marginBottom: 80
  }
};

const SetUpMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['courses', 'sections']).isRequired,
    codeOrgUrlPrefix: React.PropTypes.string,
    isRtl: React.PropTypes.bool.isRequired,
    headingText: React.PropTypes.string.isRequired,
    descriptionText: React.PropTypes.string.isRequired,
    buttonText: React.PropTypes.string.isRequired,
  },

  render() {
    const {
      type,
      codeOrgUrlPrefix,
      isRtl,
      headingText,
      descriptionText,
      buttonText,
    } = this.props;
    const sectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    if (type === 'courses') {
      return (
        <div style={styles.section}>
          <div style={isRtl ? styles.rtlHeading : styles.heading}>
            {headingText}
          </div>
          <div style={isRtl ? styles.rtlDescription : styles.description}>
            {descriptionText}
          </div>
          <Button
            href="/courses"
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={isRtl ? styles.rtlButton : styles.button}
          />
        </div>
      );
    }
    if (type === 'sections') {
      return (
        <div style={styles.section}>
          <div style={isRtl ? styles.rtlHeading : styles.heading}>
            {headingText}
          </div>
          <div style={isRtl ? styles.rtlDescription : styles.description}>
            {descriptionText}
          </div>
          <Button
            href={sectionsUrl}
            color={Button.ButtonColor.gray}
            text={buttonText}
            style={isRtl ? styles.rtlButton : styles.button}
          />
        </div>
      );
    }
  }
});

export const CoursesSetUpMessage = (props) => {
  const {isTeacher} = props;
  return (
    <SetUpMessage
      type="courses"
      headingText={i18n.startLearning()}
      descriptionText={isTeacher ? i18n.setupCoursesTeacher() : i18n.setupCoursesStudent()}
      buttonText={i18n.findCourse()}
      {...props}
    />
  );
};
CoursesSetUpMessage.propTypes = {
  isTeacher: React.PropTypes.bool.isRequired,
};

export const SectionsSetUpMessage = (props) => {
  return (
    <SetUpMessage
      type="sections"
      headingText={i18n.setUpClassroom()}
      descriptionText={i18n.createNewClassroom()}
      buttonText={i18n.createSection()}
      {...props}
    />
  );
};
