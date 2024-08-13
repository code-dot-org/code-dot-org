import classNames from 'classnames';
import {concat, intersection} from 'lodash';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {
  Button,
  buttonColors,
  LinkButton,
} from '@cdo/apps/componentLibrary/button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import CardLabels from '@cdo/apps/templates/curriculumCatalog/CardLabels';
import {
  CreateSectionsToAssignSectionsDialog,
  SignInToAssignSectionsDialog,
  UpgradeAccountToAssignSectionsDialog,
} from '@cdo/apps/templates/curriculumCatalog/noSectionsToAssignDialogs';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {
  translatedCourseOfferingCsTopics,
  translatedCourseOfferingSchoolSubjects,
  translatedCourseOfferingDurations,
  subjectsAndTopicsOrder,
  translatedLabels,
} from '@cdo/apps/templates/teacherDashboard/CourseOfferingHelpers';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {
  assignToSection,
  sectionsForDropdown,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import {
  curriculumCatalogCardIdPrefix,
  defaultImageSrc,
} from './curriculumCatalogConstants';
import ExpandedCurriculumCatalogCard from './ExpandedCurriculumCatalogCard';

import style from './curriculum_catalog_card.module.scss';

const CurriculumCatalogCard = ({
  courseKey,
  courseDisplayName,
  duration,
  gradesArray,
  imageAltText = '', // for decorative images
  imageSrc = defaultImageSrc,
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
  isExpanded,
  handleSetExpandedCardKey,
  onQuickViewClick,
  isInUS,
  availableResources,
  isSignedOut,
  isTeacher,
  recommendedSimilarCurriculum,
  recommendedStretchCurriculum,
  ...props
}) => (
  <CustomizableCurriculumCatalogCard
    courseKey={courseKey}
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
    pathToCourse={`${
      isSignedOut || isTeacher
        ? pathToCourse + '?viewAs=Instructor'
        : pathToCourse
    }`}
    onAssignSuccess={onAssignSuccess}
    deviceCompatibility={deviceCompatibility}
    description={description}
    professionalLearningProgram={professionalLearningProgram}
    video={video}
    publishedDate={publishedDate}
    selfPacedPlCourseOfferingPath={selfPacedPlCourseOfferingPath}
    isExpanded={isExpanded}
    onQuickViewClick={onQuickViewClick}
    handleSetExpandedCardKey={handleSetExpandedCardKey}
    isInUS={isInUS}
    availableResources={availableResources}
    isSignedOut={isSignedOut}
    isTeacher={isTeacher}
    recommendedSimilarCurriculum={recommendedSimilarCurriculum}
    recommendedStretchCurriculum={recommendedStretchCurriculum}
    {...props}
  />
);

CurriculumCatalogCard.propTypes = {
  courseKey: PropTypes.string,
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
  isExpanded: PropTypes.bool,
  handleSetExpandedCardKey: PropTypes.func.isRequired,
  onQuickViewClick: PropTypes.func,
  isInUS: PropTypes.bool,
  availableResources: PropTypes.object,
  isTeacher: PropTypes.bool.isRequired,
  isSignedOut: PropTypes.bool.isRequired,
  recommendedSimilarCurriculum: PropTypes.object,
  recommendedStretchCurriculum: PropTypes.object,
};

const CustomizableCurriculumCatalogCard = ({
  courseKey,
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
  isExpanded,
  handleSetExpandedCardKey,
  onQuickViewClick,
  isInUS,
  availableResources,
  recommendedSimilarCurriculum,
  recommendedStretchCurriculum,
  ...props
}) => {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const isTeacherOrSignedOut = isSignedOut || isTeacher;

  const handleClickAssign = cardType => {
    setIsAssignDialogOpen(true);
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_ASSIGN_CLICKED_EVENT,
      {
        curriculum_offering: courseKey,
        has_sections: sectionsForDropdown.length > 0,
        is_signed_in: !isSignedOut,
        card_type: cardType,
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

  return (
    <div
      id={`${curriculumCatalogCardIdPrefix}${courseKey}`}
      className={style.cardsContainer}
    >
      <div>
        <div
          className={classNames(
            style.curriculumCatalogCardContainer,
            isExpanded ? style.expandedCard : '',
            isEnglish
              ? style.curriculumCatalogCardContainer_english
              : style.curriculumCatalogCardContainer_notEnglish
          )}
        >
          <img src={imageSrc} alt={imageAltText} />
          <div className={style.curriculumInfoContainer}>
            <div className={style.labelsAndTranslatabilityContainer}>
              <CardLabels subjectsAndTopics={subjectsAndTopics} />
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
              <Button
                onClick={onQuickViewClick}
                ariaLabel={quickViewButtonDescription}
                text={i18n.quickView()}
                className={`${style.buttonFlex} ${style.quickViewButton}`}
                type="secondary"
                color={buttonColors.black}
              />
              {isTeacherOrSignedOut && (
                <>
                  <LinkButton
                    color={buttonColors.black}
                    type="secondary"
                    href={pathToCourse}
                    ariaLabel={i18n.learnMoreDescription({
                      course_name: courseDisplayName,
                    })}
                    text={i18n.learnMore()}
                    className={`${style.buttonFlex} ${style.teacherAndSignedOutLearnMoreButton}`}
                  />
                  <Button
                    color={buttonColors.purple}
                    type="primary"
                    onClick={() => handleClickAssign('top-card')}
                    ariaLabel={assignButtonDescription}
                    text={assignButtonText}
                    className={style.buttonFlex}
                  />
                </>
              )}
              {!isTeacherOrSignedOut && (
                <LinkButton
                  color={buttonColors.purple}
                  type="primary"
                  href={pathToCourse}
                  ariaLabel={i18n.tryCourseNow({
                    course_name: courseDisplayName,
                  })}
                  text={i18n.tryNow()}
                  className={`${style.buttonFlex} ${style.studentLearnMoreButton}`}
                />
              )}
            </div>
          </div>
        </div>
        {isAssignDialogOpen && renderAssignDialog()}
      </div>
      {isExpanded && (
        <ExpandedCurriculumCatalogCard
          courseKey={courseKey}
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
          pathToCourse={pathToCourse}
          assignButtonOnClick={handleClickAssign}
          assignButtonDescription={assignButtonDescription}
          onClose={onQuickViewClick}
          handleSetExpandedCardKey={handleSetExpandedCardKey}
          isInUS={isInUS}
          imageSrc={imageSrc}
          imageAltText={imageAltText}
          availableResources={availableResources}
          isSignedOut={isSignedOut}
          isTeacher={isTeacher}
          recommendedSimilarCurriculum={recommendedSimilarCurriculum}
          recommendedStretchCurriculum={recommendedStretchCurriculum}
        />
      )}
    </div>
  );
};

CustomizableCurriculumCatalogCard.propTypes = {
  courseKey: PropTypes.string,
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
  isTeacher: PropTypes.bool.isRequired,
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
  isExpanded: PropTypes.bool,
  handleSetExpandedCardKey: PropTypes.func.isRequired,
  onQuickViewClick: PropTypes.func,
  isInUS: PropTypes.bool,
  availableResources: PropTypes.object,
  recommendedSimilarCurriculum: PropTypes.object,
  recommendedStretchCurriculum: PropTypes.object,
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
