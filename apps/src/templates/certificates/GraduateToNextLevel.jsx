import PropTypes from 'prop-types';
import React from 'react';

import {
  nextLevelCourseCards,
  defaultNextLevelCourseCard,
} from '@cdo/apps/templates/certificates/congratsNextLevelActivityCards';
import VerticalImageResourceCard from '@cdo/apps/templates/VerticalImageResourceCard';
import i18n from '@cdo/locale';

const GraduateToNextLevel = ({scriptName, courseTitle, courseDesc}) => {
  // The scriptName prop takes the form `course1` or `courseb-2022` or `applab-intro`
  // Since CourseCards do not include the year, only ensure courseCard.scriptName
  // is included in scriptName prop
  const courseInfo =
    nextLevelCourseCards.find(
      courseCard => scriptName && scriptName.includes(courseCard.scriptName)
    ) || defaultNextLevelCourseCard;

  return (
    <>
      <div id="next-level-block">
        <h1 id="next-level-title">{i18n.congratsNextLevelHeading()}</h1>
        <VerticalImageResourceCard
          id={`course-card-${courseInfo.scriptName}`}
          title={courseTitle || i18n.introToAppLabTitle()}
          description={courseDesc || i18n.introToAppLabDesc()}
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
  courseDesc: PropTypes.string,
};

export default GraduateToNextLevel;
