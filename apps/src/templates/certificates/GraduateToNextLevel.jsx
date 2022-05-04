import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import VerticalImageResourceCard from '@cdo/apps/templates/VerticalImageResourceCard';
import {nextLevelCourses} from '@cdo/apps/templates/certificates/congratsNextLevelActivityCards';

const GraduateToNextLevel = ({nextCourse}) => {
  const nextCourseInfo = nextLevelCourses.find(
    course => course.title.toLowerCase().replace(' ', '') === nextCourse
  );

  return (
    <>
      <div id="next-level-block">
        <h1 id="next-level-title">{i18n.congratsNextLevelHeading()}</h1>
        <VerticalImageResourceCard
          id={`course-card-${nextCourseInfo.title}`}
          title={nextCourseInfo.title}
          description={nextCourseInfo.description}
          link={nextCourseInfo.link}
          image={nextCourseInfo.image}
          buttonText={nextCourseInfo.buttonText}
          jumbo={true}
        />
      </div>
    </>
  );
};

GraduateToNextLevel.propTypes = {
  nextCourse: PropTypes.string.isRequired
};

export default GraduateToNextLevel;
