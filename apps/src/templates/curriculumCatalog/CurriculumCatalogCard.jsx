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
  subjectsAndTopicsOrder
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
  isEnglish
}) => (
  <CustomizableCurriculumCatalogCard
    assignButtonText={i18n.assign()}
    assignButtonDescription={i18n.assignDescription({
      course_name: courseDisplayName
    })}
    courseDisplayName={courseDisplayName}
    duration={translatedCourseOfferingDurations[duration]}
    gradeRange={i18n.gradeRange({
      numGrades: gradesArray.length,
      youngestGrade: gradesArray[0],
      oldestGrade: gradesArray[gradesArray.length - 1]
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
      course_name: courseDisplayName
    })}
    quickViewButtonText={i18n.quickView()}
    imageAltText={imageAltText}
    isTranslated={isTranslated}
    translationIconTitle={i18n.courseInYourLanguage()}
    isEnglish={isEnglish}
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
  isEnglish: PropTypes.bool.isRequired
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
  isEnglish
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
      <div className={style.tagsAndTranslatabilityContainer}>
        <div
          className={subjectsAndTopics.length > 0 ? style.tagsContainer : ''}
        >
          <div className={style.tagsText}>{subjectsAndTopics[0]}</div>
          {subjectsAndTopics.length > 1 && (
            <div className={style.tagsText}>{`+${
              subjectsAndTopics.length - 1
            }`}</div>
          )}
        </div>
        {/*TODO [MEG]: Ensure this icon matches spec when we update FontAwesome */}
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
        <p className={style.iconWithDescriptionText}>{gradeRange}</p>
      </div>
      <div className={style.iconWithDescription}>
        {/*TODO [MEG]: Update this to be clock fa-solid when we update FontAwesome */}
        <FontAwesome icon="clock-o" />
        <p className={style.iconWithDescriptionText}>{duration}</p>
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
          color={Button.ButtonColor.neutralDark}
          type="button"
          onClick={() => {}}
          aria-label={quickViewButtonDescription}
        >
          {quickViewButtonText}
        </Button>
        <Button
          color={Button.ButtonColor.brandSecondaryDefault}
          type="button"
          onClick={() => {}}
          aria-label={assignButtonDescription}
        >
          {assignButtonText}
        </Button>
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

  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired
};

export default CurriculumCatalogCard;
