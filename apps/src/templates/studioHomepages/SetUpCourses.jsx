import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import BorderedCallToAction from './BorderedCallToAction';

const SetUpCourses = ({isTeacher, hasCourse}) => (
  <BorderedCallToAction
    type="courses"
    headingText={hasCourse ? i18n.findCourse() : i18n.startLearning()}
    descriptionText={
      isTeacher ? i18n.setupCoursesTeacher() : i18n.setupCoursesStudent()
    }
    buttonText={i18n.findCourse()}
    buttonUrl={isTeacher ? '/catalog' : '/courses'}
    solidBorder={true}
  />
);
SetUpCourses.propTypes = {
  isTeacher: PropTypes.bool.isRequired,
  hasCourse: PropTypes.bool,
};
export default SetUpCourses;
