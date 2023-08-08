import React, {useState} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {concat, intersection} from 'lodash';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDurations,
  subjectsAndTopicsOrder,
  translatedLabels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import style from './curriculum_catalog_card.module.scss';
import CardLabels from '@cdo/apps/templates/curriculumCatalog/CardLabels';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {connect} from 'react-redux';
import {
  assignToSection,
  sectionsForDropdown,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  CreateSectionsToAssignSectionsDialog,
  SignInToAssignSectionsDialog,
  UpgradeAccountToAssignSectionsDialog,
} from '@cdo/apps/templates/curriculumCatalog/noSectionsToAssignDialogs';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import DCDO from '@cdo/apps/dcdo';
import ExpandedCurriculumCatalogCard from './ExpandedCurriculumCatalogCard';

const CurriculumCatalogCard = ({
  courseDisplayName,
  duration,
  gradesArray,
  imageAltText = '', // for decorative images
  imageSrc = 'https://images.code.org/0a24eb3b51bd86e054362f0760c6e64e-image-1681413990565.png',
  subjects = [],
  topics = [],
  pathToCourse,
  onAssignSuccess,
  deviceCompatibility,
  description,
  professionalLearningProgram,
  video,
  publishedDate,
  selfPacedPlCourseOfferingPath,
  ...props
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
    )?.map(subject_or_topic_key => translatedLabels[subject_or_topic_key])}
    quickViewButtonDescription={i18n.quickViewDescription({
      course_name: courseDisplayName,
    })}
    quickViewButtonText={i18n.quickView()}
    imageAltText={imageAltText}
    translationIconTitle={i18n.courseInYourLanguage()}
    pathToCourse={pathToCourse + '?viewAs=Instructor'}
    onAssignSuccess={onAssignSuccess}
    deviceCompatibility={deviceCompatibility}
    description={description}
    professionalLearningProgram={professionalLearningProgram}
    video={video}
    publishedDate={publishedDate}
    selfPacedPlCourseOfferingPath={selfPacedPlCourseOfferingPath}
    {...props}
  />
);

CurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  courseDisplayNameWithLatestYear: PropTypes.string.isRequired,
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
  courseVersionId: PropTypes.number,
  courseId: PropTypes.number,
  courseOfferingId: PropTypes.number,
  scriptId: PropTypes.number,
  isStandAloneUnit: PropTypes.bool,
  onAssignSuccess: PropTypes.func,
  deviceCompatibility: PropTypes.string,
  description: PropTypes.string,
  professionalLearningProgram: PropTypes.string,
  video: PropTypes.string,
  publishedDate: PropTypes.string,
  selfPacedPlCourseOfferingPath: PropTypes.string,
};

const CustomizableCurriculumCatalogCard = ({
  assignButtonDescription,
  assignButtonText,
  courseDisplayName,
  courseDisplayNameWithLatestYear,
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
  sectionsForDropdown = [],
  isTeacher,
  isSignedOut,
  onAssignSuccess,
  courseId,
  deviceCompatibility,
  description,
  professionalLearningProgram,
  video,
  publishedDate,
  selfPacedPlCourseOfferingPath,
  ...props
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isExpandedCardDisplayed, setIsExpandedCardDisplayed] = useState(false);

  const handleClickAssign = () => {
    setIsAssignDialogOpen(true);
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_ASSIGN_CLICKED_EVENT,
      {
        curriculum_offering: courseDisplayNameWithLatestYear,
        has_sections: sectionsForDropdown.length > 0,
        is_signed_in: !isSignedOut,
      }
    );
  };

  const renderAssignDialog = () => {
    if (isSignedOut) {
      return (
        <SignInToAssignSectionsDialog
          onClose={() => setIsAssignDialogOpen(false)}
        />
      );
    } else if (isTeacher && sectionsForDropdown.length > 0) {
      return (
        <MultipleSectionsAssigner
          assignmentName={courseDisplayNameWithLatestYear}
          onClose={() => setIsAssignDialogOpen(false)}
          sections={sectionsForDropdown}
          participantAudience="student"
          onAssignSuccess={onAssignSuccess}
          isAssigningCourse={!!courseId}
          courseId={courseId}
          sectionDirections={i18n.chooseSectionsDirectionsOnCatalog()}
          {...props}
        />
      );
    } else if (isTeacher) {
      return (
        <CreateSectionsToAssignSectionsDialog
          onClose={() => setIsAssignDialogOpen(false)}
          onClick={() => {}}
        />
      );
    } else {
      return (
        <UpgradeAccountToAssignSectionsDialog
          onClose={() => setIsAssignDialogOpen(false)}
        />
      );
    }
  };
  const handleQuickView = () => {
    setIsExpandedCardDisplayed(!isExpandedCardDisplayed);
  };

  return (
    <div>
      <div>
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
                <CardLabels subjectsAndTopics={subjectsAndTopics} />
              </div>
              {!isEnglish && isTranslated && (
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
              {!!DCDO.get('quick-view', false) ? (
                <Button
                  color={Button.ButtonColor.neutralDark}
                  type="button"
                  onClick={handleQuickView}
                  aria-label={quickViewButtonDescription}
                  text={'Quick View'}
                />
              ) : (
                <Button
                  __useDeprecatedTag
                  color={Button.ButtonColor.neutralDark}
                  type="button"
                  href={pathToCourse}
                  aria-label={i18n.quickViewDescription({
                    course_name: courseDisplayName,
                  })}
                  text={i18n.learnMore()}
                />
              )}
              <Button
                color={Button.ButtonColor.brandSecondaryDefault}
                type="button"
                onClick={handleClickAssign}
                aria-label={assignButtonDescription}
                text={assignButtonText}
              />
            </div>
          </div>
        </div>
        {isAssignDialogOpen && renderAssignDialog()}
      </div>
      {isExpandedCardDisplayed && (
        <ExpandedCurriculumCatalogCard
          courseDisplayName={courseDisplayName}
          duration={duration}
          gradeRange={gradeRange}
          subjectsAndTopics={subjectsAndTopics}
          deviceCompatibility={deviceCompatibility}
          description={description}
          professionalLearningProgram={professionalLearningProgram}
          video={video}
          publishedDate={publishedDate}
          selfPacedPlCourseOfferingPath={selfPacedPlCourseOfferingPath}
        />
      )}
    </div>
  );
};

CustomizableCurriculumCatalogCard.propTypes = {
  courseDisplayName: PropTypes.string.isRequired,
  courseDisplayNameWithLatestYear: PropTypes.string.isRequired,
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
  courseVersionId: PropTypes.number,
  courseId: PropTypes.number,
  courseOfferingId: PropTypes.number,
  scriptId: PropTypes.number,
  isStandAloneUnit: PropTypes.bool,
  sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
  isTeacher: PropTypes.bool,
  isSignedOut: PropTypes.bool.isRequired,
  onAssignSuccess: PropTypes.func,
  // for screenreaders
  imageAltText: PropTypes.string,
  quickViewButtonDescription: PropTypes.string.isRequired,
  assignButtonDescription: PropTypes.string.isRequired,
  // for expanded card
  deviceCompatibility: PropTypes.string,
  description: PropTypes.string,
  professionalLearningProgram: PropTypes.string,
  video: PropTypes.string,
  publishedDate: PropTypes.string,
  selfPacedPlCourseOfferingPath: PropTypes.string,
};

export default connect(
  (state, ownProps) => ({
    sectionsForDropdown: sectionsForDropdown(
      state.teacherSections,
      ownProps.courseOfferingId,
      ownProps.courseVersionId,
      state.progress?.scriptId
    ),
  }),
  {
    assignToSection,
    unassignSection,
  }
)(CurriculumCatalogCard);
