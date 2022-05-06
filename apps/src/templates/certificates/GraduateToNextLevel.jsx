import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import VerticalImageResourceCard from '@cdo/apps/templates/VerticalImageResourceCard';
import {nextLevelCourses} from '@cdo/apps/templates/certificates/congratsNextLevelActivityCards';

const GraduateToNextLevel = ({scriptName, courseTitle, courseDesc}) => {
  // TODO: Create a pattern to make course identifiers are mapped to their titles correctly
  // look at 'pre-express' and 'accelerated' courses too
  const courseInfo = nextLevelCourses.find(
    course => course.scriptName === scriptName
  );

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
  scriptName: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  courseDesc: PropTypes.string.isRequired
};

export default GraduateToNextLevel;
