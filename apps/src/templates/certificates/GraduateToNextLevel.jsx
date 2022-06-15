import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import VerticalImageResourceCard from '@cdo/apps/templates/VerticalImageResourceCard';
import {
  nextLevelCourses,
  defaultNextLevelCourse
} from '@cdo/apps/templates/certificates/congratsNextLevelActivityCards';

const GraduateToNextLevel = ({scriptName, courseTitle, courseDesc}) => {
  // The scriptName prop takes the form `course1` or `courseb-2022` or `applab-intro`
  const courseInfo =
    nextLevelCourses.find(course => scriptName.includes(course.scriptName)) ||
    defaultNextLevelCourse;

  return (
    <>
      <div id="next-level-block">
        <h1 id="next-level-title">{i18n.congratsNextLevelHeading()}</h1>
        <VerticalImageResourceCard
          id={`course-card-${scriptName}`}
          title={courseTitle}
          description={courseDesc}
          link={courseInfo.link}
          image={courseInfo.image}
          buttonText={courseInfo.buttonText}
          hasAdjustableHeight={true}
        />
      </div>
    </>
  );
};

GraduateToNextLevel.propTypes = {
  scriptName: PropTypes.string,
  courseTitle: PropTypes.string,
  courseDesc: PropTypes.string
};

export default GraduateToNextLevel;
