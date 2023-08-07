import React from 'react';
import style from './expanded_curriculum_catalog_card.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';

const ExpandedCurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  gradeRange,
  subjectsAndTopics,
  deviceCompatibility,
  description,
  professionalLearningProgram,
  video,
  publishedDate,
  selfPacedPlCourseOfferingPath,
}) => {
  return (
    <div>
      <div className={style.expandedCardContainer}>
        <h4>{courseDisplayName}</h4>
        <div className={style.infoContainer}>
          <div className={style.iconWithDescription}>
            <FontAwesome icon="user" className="fa-solid" />
            <p>{gradeRange}</p>
          </div>
          <div className={style.iconWithDescription}>
            <FontAwesome icon="clock" className="fa-solid" />
            <p>{duration}</p>
          </div>
          <div className={style.iconWithDescription}>
            <FontAwesome icon="book" className="fa-solid" />
            <p>{subjectsAndTopics.join(', ')}</p>
          </div>
        </div>
        <div>{deviceCompatibility}</div>
        <div>{description}</div>
        <div>{professionalLearningProgram}</div>
        <div>{video}</div>
        <div>{publishedDate}</div>
        <div>
          <a href={selfPacedPlCourseOfferingPath}>here</a>
        </div>
      </div>
    </div>
  );
};
ExpandedCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  gradeRange: PropTypes.string.isRequired,
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
  deviceCompatibility: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  professionalLearningProgram: PropTypes.string.isRequired,
  video: PropTypes.string.isRequired,
  publishedDate: PropTypes.string.isRequired,
  selfPacedPlCourseOfferingPath: PropTypes.string.isRequired,
};

export default ExpandedCurriculumCatalogCard;
