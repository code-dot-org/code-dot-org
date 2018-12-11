import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import SetUpMessage from './SetUpMessage';

const SetUpCourses = ({isTeacher, hasCourse}) => (
  <SetUpMessage
    type="courses"
    headingText={hasCourse ? i18n.findCourse() : i18n.startLearning()}
    descriptionText={isTeacher ? i18n.setupCoursesTeacher() : i18n.setupCoursesStudent()}
    buttonText={i18n.findCourse()}
    buttonUrl="/courses"
    solidBorder={hasCourse}
  />
);
SetUpCourses.propTypes = {
  isTeacher: PropTypes.bool.isRequired,
  hasCourse: PropTypes.bool,
};
export default SetUpCourses;
