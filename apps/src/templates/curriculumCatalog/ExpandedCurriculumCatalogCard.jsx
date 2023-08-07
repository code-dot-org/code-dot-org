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
        <div className={style.flexDivider}>
          <div className={style.courseOfferingContainer}>
            <h4 style={{marginBottom: '8px'}}>{courseDisplayName}</h4>
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
            <hr className={style.horizontalDivider} />
            <div className={style.centerContentContainer}>
              <div className={style.descriptionVideoContainer}>
                <div className={style.bodyText}>{description}</div>
                <div>{video}</div>
              </div>
              <div className={style.linksContainer}>
                <div className={style.resourcesContainer}>
                  <h6>Available Resources</h6>
                  <hr className={style.thickDivider} />
                  <a className={style.bodyText} href="#">
                    Lesson Plans
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    Slide Decks
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    Activity Guides
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    Answer Keys/Exemplars
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    Project Rubrics
                  </a>
                </div>
                <div className={style.professionalLearning}>
                  <h6>Professional Learning</h6>
                  <hr className={style.thickDivider} />
                  <a href={professionalLearningProgram}>
                    Facilitator led workshops
                    <FontAwesome
                      icon="arrow-up-right-from-square"
                      className="fa-solid"
                    />
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a href={selfPacedPlCourseOfferingPath}>
                    Self-paced PL
                    <FontAwesome
                      icon="arrow-up-right-from-square"
                      className="fa-solid"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div>{deviceCompatibility}</div>
            <div>{publishedDate}</div>
          </div>
          <div className={style.relatedCurriculaContainer}>
            Related Curricula
          </div>
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
