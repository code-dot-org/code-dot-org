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
  wordBox: {
    width: styleConstants['content-width']-200,
    float: 'left',
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    color: color.teal,
    float: 'left',
    paddingTop: 25,
    paddingLeft: 25,
  },
  rtlHeading: {
    paddingRight: 50,
    paddingTop: 80,
    paddingBottom: 20,
    fontSize: 20,
    fontFamily: 'Gotham 5r',
    color: color.teal,
  },
  description: {
    width: styleConstants['content-width']-250,
    paddingTop: 5,
    paddingBottom: 25,
    paddingLeft: 25,
    fontSize: 14,
    color: color.charcoal,
    float: 'left'
  },
  rtlDescription: {
    paddingRight: 50,
    paddingTop: 25,
    paddingBottom: 40,
    fontSize: 14,
    color: color.charcoal
  },
  button: {
    float: 'right',
    marginRight: 25,
    marginTop: 28,
  },
  rtlButton: {
    marginRight: 50,
    marginBottom: 80
  },
  clear: {
    clear: 'both'
  }
};

const SetUpMessage = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf(['courses', 'sections']).isRequired,
    codeOrgUrlPrefix: React.PropTypes.string,
    isRtl: React.PropTypes.bool.isRequired,
    isTeacher: React.PropTypes.bool.isRequired,
  },

  render() {
    const { type, codeOrgUrlPrefix, isRtl, isTeacher } = this.props;
    const sectionsUrl = `${codeOrgUrlPrefix}/teacher-dashboard#/sections`;

    if (type === 'courses') {
      return (
        <div style={styles.section}>
          <div style={styles.wordBox}>
            <div style={isRtl ? styles.rtlHeading : styles.heading}>
              {i18n.startLearning()}
            </div>
            {isTeacher && (
              <div style={isRtl ? styles.rtlDescription : styles.description}>
                {i18n.setupCoursesTeacher()}
              </div>
            )}
            {!isTeacher && (
              <div style={isRtl ? styles.rtlDescription : styles.description}>
                {i18n.setupCoursesStudent()}
              </div>
            )}
          </div>
          <Button
            href="/courses"
            color={Button.ButtonColor.gray}
            text={i18n.findCourse()}
            style={isRtl ? styles.rtlButton : styles.button}
          />
          <div style={styles.clear}/>
        </div>
      );
    }
    if (type === 'sections') {
      return (
        <div style={styles.section}>
          <div style={styles.wordBox}>
            <div style={isRtl ? styles.rtlHeading : styles.heading}>
              {i18n.setUpClassroom()}
            </div>
            <div style={isRtl ? styles.rtlDescription : styles.description}>
              {i18n.createNewClassroom()}
            </div>
          </div>
          <Button
            href={sectionsUrl}
            color={Button.ButtonColor.gray}
            text={i18n.createSection()}
            style={isRtl ? styles.rtlButton : styles.button}
          />
          <div style={styles.clear}/>
        </div>
      );
    }
  }
});

export default SetUpMessage;
