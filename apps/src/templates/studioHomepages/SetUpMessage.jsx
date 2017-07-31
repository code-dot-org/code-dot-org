import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import color from "../../util/color";
import styleConstants from '../../styleConstants';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import Button from "../Button";
import {connect} from 'react-redux';
import {pegasusUrl} from '@cdo/apps/redux/urlHelpers';
import {beginEditingNewSection} from '../teacherDashboard/teacherSectionsRedux';

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

const SetUpMessage = ({
  isRtl,
  headingText,
  descriptionText,
  buttonText,
  buttonUrl,
  onClick,
}) => (
  <div style={styles.section}>
    <div style={isRtl ? styles.rtlHeading : styles.heading}>
      {headingText}
    </div>
    <div style={isRtl ? styles.rtlDescription : styles.description}>
      {descriptionText}
    </div>
    <Button
      href={buttonUrl}
      onClick={onClick}
      color={Button.ButtonColor.gray}
      text={buttonText}
      style={isRtl ? styles.rtlButton : styles.button}
    />
  </div>
);
SetUpMessage.propTypes ={
  isRtl: PropTypes.bool.isRequired,
  headingText: PropTypes.string.isRequired,
  descriptionText: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonUrl: PropTypes.string,
  onClick: PropTypes.func,
};

export const CoursesSetUpMessage = ({isRtl, isTeacher}) => (
  <SetUpMessage
    type="courses"
    headingText={i18n.startLearning()}
    descriptionText={isTeacher ? i18n.setupCoursesTeacher() : i18n.setupCoursesStudent()}
    buttonText={i18n.findCourse()}
    buttonUrl="/courses"
    isRtl={isRtl}
  />
);
CoursesSetUpMessage.propTypes = {
  isRtl: PropTypes.bool.isRequired,
  isTeacher: PropTypes.bool.isRequired,
};

export const UnconnectedSectionsSetUpMessage = ({
  isRtl,
  codeOrgUrlPrefix,
  beginEditingNewSection,
}) => {
  const sectionFlow2017 = experiments.isEnabled(SECTION_FLOW_2017);
  const clickHandlerProp = sectionFlow2017 ?
    {onClick: beginEditingNewSection} :
    {buttonUrl: `${codeOrgUrlPrefix}/teacher-dashboard#/sections`};
  return (
    <SetUpMessage
      type="sections"
      headingText={i18n.setUpClassroom()}
      descriptionText={i18n.createNewClassroom()}
      buttonText={i18n.createSection()}
      isRtl={isRtl}
      {...clickHandlerProp}
    />
  );
};
UnconnectedSectionsSetUpMessage.propTypes = {
  isRtl: PropTypes.bool.isRequired,
  codeOrgUrlPrefix: PropTypes.string,
  beginEditingNewSection: PropTypes.func.isRequired,
};
export const SectionsSetUpMessage = connect(state => ({
  codeOrgUrlPrefix: pegasusUrl(state, ''),
}), {
  beginEditingNewSection,
})(UnconnectedSectionsSetUpMessage);
SectionsSetUpMessage.displayName = 'SectionsSetUpMessage';
