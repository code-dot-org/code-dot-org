import React, {useRef, useEffect, useState} from 'react';
import style from './expanded_curriculum_catalog_card.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import {
  BodyTwoText,
  Heading4,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

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
}) => {
  const subjectsRef = useRef(null);
  const [topics, setTopics] = useState(
    i18n.topic() + ': ' + subjectsAndTopics.join(', ')
  );
  const icons = {
    ideal: 'circle-check',
    not_recommended: 'triangle-exclamation',
    incompatible: 'circle-xmark',
  };
  const compatibilities = {
    'circle-check': '#3ea33e',
    'triangle-exclamation': '#eed202',
    'circle-xmark': '#e5311a',
  };

  useEffect(() => {
    const subjects = subjectsRef.current;
    if (subjects.scrollWidth > 410) {
      setTopics(i18n.topic() + ': ' + i18n.multiple());
    }
  }, []);

  const getDeviceCompatibility = deviceCompatibility => {
    const devices = JSON.parse(deviceCompatibility);
    const compatibilityIcons = {};
    for (var device in devices) {
      compatibilityIcons[
        device !== 'no_device'
          ? device.charAt(0).toUpperCase() + device.slice(1)
          : i18n.offline()
      ] = icons[devices[device]];
    }
    return compatibilityIcons;
  };

  const getIconColor = compatibility => {
    return compatibilities[compatibility];
  };

  const compatibilityIcons = getDeviceCompatibility(deviceCompatibility);

  return (
    <div>
      <div className={style.expandedCardContainer}>
        <div className={style.flexDivider}>
          <div className={style.courseOfferingContainer}>
            <Heading4 style={{marginBottom: '8px'}}>
              {courseDisplayName}
            </Heading4>
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
                <BodyTwoText ref={subjectsRef} className={style.subjectsText}>
                  {topics}
                </BodyTwoText>
              </div>
            </div>
            <hr className={style.horizontalDivider} />
            <div className={style.centerContentContainer}>
              <div className={style.descriptionVideoContainer}>
                <div className={style.descriptionContainer}>
                  <div className={style.bodyText}>{description}</div>
                </div>
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
              </div>
              <div className={style.linksContainer}>
                <div className={style.resourcesContainer}>
                  <Heading6>{i18n.availableResources()}</Heading6>
                  <hr className={style.thickDivider} />
                  <a className={style.bodyText} href="#">
                    {i18n.lessonPlans()}
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    {i18n.slideDecks()}
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    {i18n.activityGuides()}
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    {i18n.answerKeysExemplars()}
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a className={style.bodyText} href="#">
                    {i18n.projectRubrics()}
                  </a>
                </div>
                <div className={style.professionalLearning}>
                  <Heading6>{i18n.professionalLearning()}</Heading6>
                  <hr className={style.thickDivider} />
                  <a
                    className={style.professionalLearningText}
                    href={professionalLearningProgram}
                  >
                    {i18n.facilitatorLedWorkshops()}
                    <FontAwesome
                      icon="arrow-up-right-from-square"
                      className="fa-solid"
                    />
                  </a>
                  <hr className={style.horizontalDivider} />
                  <a
                    className={style.professionalLearningText}
                    href={selfPacedPlCourseOfferingPath}
                  >
                    {i18n.selfPacedPl()}
                    <FontAwesome
                      icon="arrow-up-right-from-square"
                      className="fa-solid"
                    />
                  </a>
                </div>
              </div>
            </div>
            <hr className={style.horizontalDivider} />
            <div className={style.compatibilityContainer}>
              {Object.keys(compatibilityIcons).map(key => (
                <div className={style.iconWithDescription}>
                  <FontAwesome
                    icon={compatibilityIcons[key]}
                    className="fa-solid"
                    style={{color: getIconColor(compatibilityIcons[key])}}
                  />
                  <p>{key}</p>
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
              <a onClick={onClose}>
                <FontAwesome icon="xmark" className="fa-solid" />
              </a>
            </div>
            <div className={style.relatedContainer}>
              <Heading6>{i18n.relatedCurricula()}</Heading6>
              <hr className={style.thickDivider} />
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
};
export default ExpandedCurriculumCatalogCard;
