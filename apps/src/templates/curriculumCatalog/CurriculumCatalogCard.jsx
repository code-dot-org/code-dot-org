import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDurations,
  subjectsAndTopicsOrder,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {concat, intersection} from 'lodash';
import style from './curriculum_catalog_card.module.scss';

const CurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  gradesArray,
  imageAltText = '', // for decorative images
  imageSrc = 'https://images.code.org/0a24eb3b51bd86e054362f0760c6e64e-image-1681413990565.png',
  subjects = [],
  topics = [],
  isTranslated = false,
  isEnglish,
  pathToCourse,
}) => (
  <CustomizableCurriculumCatalogCard
    assignButtonText={i18n.assign()}
    assignButtonDescription={i18n.assignDescription({
      course_name: courseDisplayName,
    })}
    courseDisplayName={courseDisplayName}
    duration={i18n.durationLabel({
      duration: translatedCourseOfferingDurations[duration],
    })}
    gradeRange={i18n.gradeRange({
      numGrades: gradesArray.length,
      youngestGrade: gradesArray[0],
      oldestGrade: gradesArray[gradesArray.length - 1],
    })}
    imageSrc={imageSrc}
    subjectsAndTopics={intersection(
      subjectsAndTopicsOrder,
      concat(subjects, topics)
    )?.map(
      subject_or_topic_key =>
        translatedCourseOfferingSchoolSubjects[subject_or_topic_key] ||
        translatedCourseOfferingCsTopics[subject_or_topic_key]
    )}
    quickViewButtonDescription={i18n.quickViewDescription({
      course_name: courseDisplayName,
    })}
    quickViewButtonText={i18n.learnMore()}
    imageAltText={imageAltText}
    isTranslated={isTranslated}
    translationIconTitle={i18n.courseInYourLanguage()}
    isEnglish={isEnglish}
    pathToCourse={pathToCourse + '?viewAs=Instructor'}
  />
);

CurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.oneOf(Object.keys(translatedCourseOfferingDurations))
    .isRequired,
  gradesArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  imageAltText: PropTypes.string,
  imageSrc: PropTypes.string,
  isTranslated: PropTypes.bool,
  subjects: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingSchoolSubjects))
  ),
  topics: PropTypes.arrayOf(
    PropTypes.oneOf(Object.keys(translatedCourseOfferingCsTopics))
  ),
  isEnglish: PropTypes.bool.isRequired,
  pathToCourse: PropTypes.string.isRequired,
};

const CustomizableCurriculumCatalogCard = ({
  assignButtonDescription,
  assignButtonText,
  courseDisplayName,
  duration,
  gradeRange,
  imageAltText,
  imageSrc,
  isTranslated,
  translationIconTitle,
  subjectsAndTopics,
  quickViewButtonDescription,
  quickViewButtonText,
  isEnglish,
  pathToCourse,
}) => (
  <div
    className={classNames(
      style.curriculumCatalogCardContainer,
      isEnglish
        ? style.curriculumCatalogCardContainer_english
        : style.curriculumCatalogCardContainer_notEnglish
    )}
  >
    <img src={imageSrc} alt={imageAltText} />
    <div className={style.curriculumInfoContainer}>
      <div className={style.labelsAndTranslatabilityContainer}>
        <div className={style.labelsContainer}>
          {subjectsAndTopics.length > 0 && <div>{subjectsAndTopics[0]}</div>}
          {subjectsAndTopics.length > 1 && (
            <div>{`+${subjectsAndTopics.length - 1}`}</div>
          )}
        </div>
        {isTranslated && (
          <FontAwesome
            icon="language"
            className="fa-solid"
            title={translationIconTitle}
          />
        )}
      </div>
      <h4>{courseDisplayName}</h4>
      <div className={style.iconWithDescription}>
        <FontAwesome icon="user" className="fa-solid" />
        <p>{gradeRange}</p>
      </div>
      <div className={style.iconWithDescription}>
        <FontAwesome icon="clock" className="fa-solid" />
        <p>{duration}</p>
      </div>
      <div
        className={classNames(
          style.buttonsContainer,
          isEnglish
            ? style.buttonsContainer_english
            : style.buttonsContainer_notEnglish
        )}
      >
        <Button
          __useDeprecatedTag
          color={Button.ButtonColor.neutralDark}
          type="button"
          href={pathToCourse}
          aria-label={quickViewButtonDescription}
          text={quickViewButtonText}
        />
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          type="button"
          onClick={() => {}}
          aria-label={assignButtonDescription}
          text={assignButtonText}
        />
      </div>
    </div>
  </div>
);

CustomizableCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  gradeRange: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  isTranslated: PropTypes.bool,
  isEnglish: PropTypes.bool,
  translationIconTitle: PropTypes.string.isRequired,
  subjectsAndTopics: PropTypes.arrayOf(PropTypes.string),
  quickViewButtonText: PropTypes.string.isRequired,
  assignButtonText: PropTypes.string.isRequired,
  pathToCourse: PropTypes.string.isRequired,

  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired,
};

export default CurriculumCatalogCard;
