import React from 'react';
import style from './expanded_curriculum_catalog_card.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';

const ExpandedCurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  video,
  device,
  gradeRange,
  subjectsAndTopics,
}) => {
  return (
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
    </div>
  );
};

ExpandedCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  video: PropTypes.string,
  device: PropTypes.string,
  gradeRange: PropTypes.string.isRequired,
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string),
};

export default ExpandedCurriculumCatalogCard;
