import React, {PropTypes} from 'react';
import i18n from "@cdo/locale";
import SetUpMessage from './SetUpMessage';

const SetUpCourses = ({isTeacher}) => (
  <SetUpMessage
    type="courses"
    headingText={i18n.startLearning()}
    descriptionText={isTeacher ? i18n.setupCoursesTeacher() : i18n.setupCoursesStudent()}
    buttonText={i18n.findCourse()}
    buttonUrl="/courses"
  />
);
SetUpCourses.propTypes = {
  isTeacher: PropTypes.bool.isRequired,
};
export default SetUpCourses;
