import React from 'react';
import style from './expanded_curriculum_catalog_card.module.scss';
import centererStyle from './curriculum_catalog_card.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import {
  BodyTwoText,
  Heading3,
  Heading4,
} from '@cdo/apps/componentLibrary/typography';
import {TextLink} from '@dsco_/link';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  translatedCourseOfferingDeviceTypes,
  translatedAvailableResources,
} from '../teacherDashboard/CourseOfferingHelpers';

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
  pathToCourse,
  assignButtonOnClick,
  assignButtonDescription,
  onClose,
  isInUS,
  imageSrc,
  imageAltText,
  availableResources,
}) => {
  const iconData = {
    ideal: {
      icon: 'circle-check',
      color: style.circleCheck,
    },
    not_recommended: {
      icon: 'triangle-exclamation',
      color: style.triangleExclamation,
    },
    incompatible: {
      icon: 'circle-xmark',
      color: style.circleXmark,
    },
  };

  const devices = JSON.parse(deviceCompatibility);

  const resoucesOrder = [
    'Lesson Plan',
    'Slide Deck',
    'Activity Guide',
    'Answer Key',
    'Rubric',
  ];

  let availableResourceCounter = 0;

  const displayDivider = () => {
    return ++availableResourceCounter < Object.keys(availableResources).length;
  };

  return (
    <div>
      <div
        className={`${style.arrowContainer} ${centererStyle.arrowContainer}`}
      />
      <div className={centererStyle.centerExpandedCard}>
        <div className={style.expandedCardContainer}>
          <div className={style.flexDivider}>
            <div className={style.courseOfferingContainer}>
              <Heading3 style={{marginBottom: '8px'}}>
                {courseDisplayName}
              </Heading3>
              <div className={style.infoContainer}>
                <div className={style.iconWithDescription}>
                  <FontAwesome icon="user" className="fa-solid" />
                  <BodyTwoText>{gradeRange}</BodyTwoText>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesome icon="clock" className="fa-solid" />
                  <BodyTwoText>{duration}</BodyTwoText>
                </div>
                <div className={style.iconWithDescription}>
                  <FontAwesome icon="book" className="fa-solid" />
                  <BodyTwoText className={style.subjectsText}>
                    {i18n.topic() + ': ' + subjectsAndTopics.join(', ')}
                  </BodyTwoText>
                </div>
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.centerContentContainer}>
                <div className={style.descriptionVideoContainer}>
                  <div className={style.descriptionContainer}>
                    <BodyTwoText className={style.descriptionText}>
                      {description}
                    </BodyTwoText>
                  </div>
                  <div className={style.mediaContainer}>
                    {video ? (
                      <div className={style.videoContainer}>
                        <iframe
                          width="100%"
                          height="100%"
                          style={{border: 'none'}}
                          src={video}
                          title=""
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className={style.imageContainer}>
                        <img
                          src={imageSrc}
                          alt={imageAltText}
                          style={{height: '100%'}}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className={style.linksContainer}>
                  <div className={style.resourcesContainer}>
                    {Object.keys(availableResources).length > 0 && (
                      <div>
                        <Heading4 visualAppearance="heading-xs">
                          {i18n.availableResources()}
                        </Heading4>
                        <hr className={style.thickDivider} />
                        {resoucesOrder.map(
                          resource =>
                            availableResources[resource] && (
                              <div>
                                <TextLink
                                  text={translatedAvailableResources[resource]}
                                  href="#"
                                />
                                {displayDivider() && (
                                  <hr className={style.horizontalDivider} />
                                )}
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                  {isInUS &&
                    (professionalLearningProgram ||
                      selfPacedPlCourseOfferingPath) && (
                      <div className={style.professionalLearningContainer}>
                        <Heading4 visualAppearance="heading-xs">
                          {i18n.professionalLearning()}
                        </Heading4>
                        <hr className={style.thickDivider} />
                        {professionalLearningProgram && (
                          <TextLink
                            text={i18n.facilitatorLedWorkshops()}
                            href={professionalLearningProgram}
                            icon={
                              <FontAwesome
                                icon="arrow-up-right-from-square"
                                className="fa-solid"
                              />
                            }
                          />
                        )}
                        {professionalLearningProgram &&
                          selfPacedPlCourseOfferingPath && (
                            <hr className={style.horizontalDivider} />
                          )}
                        {selfPacedPlCourseOfferingPath && (
                          <TextLink
                            text={i18n.selfPacedPl()}
                            href={selfPacedPlCourseOfferingPath}
                            icon={
                              <FontAwesome
                                icon="arrow-up-right-from-square"
                                className="fa-solid"
                              />
                            }
                          />
                        )}
                      </div>
                    )}
                </div>
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.compatibilityContainer}>
                {Object.keys(devices).map(device => (
                  <div className={style.iconWithDescription}>
                    <FontAwesome
                      icon={iconData[devices[device]].icon}
                      className={`fa-solid ${iconData[devices[device]].color}`}
                    />
                    <BodyTwoText>
                      {device !== 'no_device'
                        ? translatedCourseOfferingDeviceTypes[device]
                            .charAt(0)
                            .toUpperCase() +
                          translatedCourseOfferingDeviceTypes[device].slice(1)
                        : i18n.offline()}
                    </BodyTwoText>
                  </div>
                ))}
              </div>
              <hr className={style.horizontalDivider} />
              <div className={style.buttonsContainer}>
                <Button
                  __useDeprecatedTag
                  color={Button.ButtonColor.neutralDark}
                  type="button"
                  href={pathToCourse}
                  aria-label={i18n.quickViewDescription({
                    course_name: courseDisplayName,
                  })}
                  text={i18n.seeCurriculumDetails()}
                  style={{flex: 1}}
                />
                <Button
                  color={Button.ButtonColor.brandSecondaryDefault}
                  type="button"
                  onClick={assignButtonOnClick}
                  aria-label={assignButtonDescription}
                  text={i18n.assignToClassSections()}
                  style={{flex: 1}}
                />
              </div>
            </div>
            <div className={style.relatedCurriculaContainer}>
              <div className={style.closeButton}>
                <Button
                  onClick={onClose}
                  icon="xmark"
                  iconClassName="fa-solid"
                />
              </div>
              <div className={style.relatedContainer}>
                <Heading4 visualAppearance="heading-xs">
                  {i18n.relatedCurricula()}
                </Heading4>
                <hr className={style.thickDivider} />
              </div>
            </div>
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
  pathToCourse: PropTypes.string,
  assignButtonOnClick: PropTypes.func,
  assignButtonDescription: PropTypes.string,
  onClose: PropTypes.func,
  isInUS: PropTypes.bool,
  imageSrc: PropTypes.string,
  imageAltText: PropTypes.string,
  availableResources: PropTypes.object,
};
export default ExpandedCurriculumCatalogCard;
