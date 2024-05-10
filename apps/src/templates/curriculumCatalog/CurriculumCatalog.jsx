import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {curriculumDataShape} from './curriculumCatalogConstants';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogBannerBackground from '../../../static/curriculum_catalog/course-catalog-banner-bg.png';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CourseCatalogNoSearchResultPenguin from '../../../static/curriculum_catalog/course-catalog-no-search-result-penguin.png';
import {Heading5, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import CurriculumCatalogFilters from './CurriculumCatalogFilters';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  assignToSection,
  sectionsForDropdown,
  unassignSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import MultipleSectionsAssigner from '@cdo/apps/templates/MultipleSectionsAssigner';
import {
  CreateSectionsToAssignSectionsDialog,
  SignInToAssignSectionsDialog,
  UpgradeAccountToAssignSectionsDialog,
} from '@cdo/apps/templates/curriculumCatalog/noSectionsToAssignDialogs';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  getSimilarRecommendations,
  getStretchRecommendations,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import {connect} from 'react-redux';

const CurriculumCatalog = ({
  curriculaData,
  isEnglish,
  languageNativeName,
  isInUS,
  isSignedOut,
  isTeacher,
  curriculaTaught,
  sectionsForDropdown,
  ...props
}) => {
  const [filteredCurricula, setFilteredCurricula] = useState(curriculaData);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState('');
  const [showAssignSuccessMessage, setShowAssignSuccessMessage] =
    useState(false);
  const [expandedCardKey, setExpandedCardKey] = useState(null);
  const [recommendedSimilarCurriculum, setRecommendedSimilarCurriculum] =
    useState(null);
  const [recommendedStretchCurriculum, setRecommendedStretchCurriculum] =
    useState(null);

  useEffect(() => {
    const expandedCardFound = filteredCurricula.some(
      co => expandedCardKey === co['key']
    );

    if (!expandedCardFound) {
      setExpandedCardKey(null);
      setRecommendedSimilarCurriculum(null);
      setRecommendedStretchCurriculum(null);
    }
  }, [expandedCardKey, filteredCurricula]);

  const handleAssignSuccess = assignmentData => {
    setAssignSuccessMessage(
      i18n.successAssigningCurriculum({
        curriculum: assignmentData.assignedTitle,
      })
    );
    setShowAssignSuccessMessage(true);

    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_ASSIGN_COMPLETED_EVENT,
      {
        curriculum_offering: assignmentData.assignedTitle,
      }
    );
  };

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [courseKeyForAssign, setCourseKeyForAssign] = useState(null);
  const handleClickAssign = (cardType, courseKey) => {
    setIsAssignDialogOpen(true);
    setCourseKeyForAssign(courseKey);
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
    const curriculumToAssign = filteredCurricula.find(
      curriculum => curriculum.key === courseKeyForAssign
    );
    const courseDisplayNameWithLatestYear =
      curriculumToAssign?.display_name_with_latest_year;
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
          onAssignSuccess={handleAssignSuccess}
          isAssigningCourse={!!curriculumToAssign?.course_id}
          courseId={curriculumToAssign?.course_id}
          scriptId={curriculumToAssign?.script_id}
          courseOfferingId={curriculumToAssign?.course_offering_id}
          courseVersionId={curriculumToAssign?.course_version_id}
          sectionDirections={i18n.chooseSectionsDirectionsOnCatalog()}
          isStandAloneUnit={curriculumToAssign?.is_standalone_unit}
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

  const handleCloseAssignSuccessMessage = () => {
    setShowAssignSuccessMessage(false);
    setAssignSuccessMessage('');
  };

  const handleQuickViewClicked = key => {
    if (expandedCardKey === key) {
      // If Quick View is clicked again to close the card (or the 'X' on the expanded card is clicked)
      setExpandedCardKey(null);
      setRecommendedSimilarCurriculum(null);
      setRecommendedStretchCurriculum(null);
    } else {
      analyticsReporter.sendEvent(
        EVENTS.CURRICULUM_CATALOG_QUICK_VIEW_CLICKED_EVENT,
        {
          curriculum_offering: key,
        }
      );
      handleSetExpandedCardKey(key);
    }
  };

  const handleSetExpandedCardKey = key => {
    const newRecommendedSimilarCurriculum =
      getRecommendedSimilarCurriculum(key);
    const newRecommendedStretchCurriculum = getRecommendedStretchCurriculum(
      key,
      newRecommendedSimilarCurriculum.key
    );

    analyticsReporter.sendEvent(EVENTS.RECOMMENDED_CATALOG_CURRICULUM_SHOWN, {
      current_curriculum_offering: key,
      recommended_similar_curriculum_offering:
        newRecommendedSimilarCurriculum.key,
      recommended_stretch_curriculum_offering:
        newRecommendedStretchCurriculum.key,
    });

    setRecommendedSimilarCurriculum(newRecommendedSimilarCurriculum);
    setRecommendedStretchCurriculum(newRecommendedStretchCurriculum);
    setExpandedCardKey(key);
  };

  // Get the top recommended similar curriculum based on the curriculum with the given
  // curriculumKey
  const getRecommendedSimilarCurriculum = curriculumKey => {
    // Check if Similar Curriculum Recommender has already been run with this curriculumKey and cached in sessionStorage
    const similarRecommenderResults =
      JSON.parse(tryGetSessionStorage('similarRecommenderResults', '{}')) || {};
    const similarRecommenderCurrKeyResult =
      similarRecommenderResults[curriculumKey];
    if (similarRecommenderCurrKeyResult) {
      return similarRecommenderCurrKeyResult;
    }

    // Get top recommended similar curriculum
    const recommendations = getSimilarRecommendations(
      curriculaData,
      curriculumKey,
      curriculaTaught
    );
    const recommendedCurriculum = recommendations[0];

    // Update sessionStorage with new recommendation result
    similarRecommenderResults[curriculumKey] = recommendedCurriculum;
    trySetSessionStorage(
      'similarRecommenderResults',
      JSON.stringify(similarRecommenderResults)
    );

    return recommendedCurriculum;
  };

  // Get the top recommended stretch curriculum based on the curriculum with the given
  // curriculumKey. If the top result is the same as the similar curriculum, show the
  // second result.
  const getRecommendedStretchCurriculum = (
    curriculumKey,
    similarCurriculumKey
  ) => {
    // Check if Stretch Curriculum Recommender has already been run with this curriculumKey and cached in sessionStorage
    const stretchRecommenderResults =
      JSON.parse(tryGetSessionStorage('stretchRecommenderResults', '{}')) || {};
    const stretchRecommenderCurrKeyResult =
      stretchRecommenderResults[curriculumKey];
    if (stretchRecommenderCurrKeyResult) {
      return stretchRecommenderCurrKeyResult;
    }

    // Get top recommended stretch curriculum
    const recommendations = getStretchRecommendations(
      curriculaData,
      curriculumKey,
      curriculaTaught
    );
    const recommendedCurriculum =
      similarCurriculumKey === recommendations[0].key
        ? recommendations[1]
        : recommendations[0];

    // Update sessionStorage with new recommendation result
    stretchRecommenderResults[curriculumKey] = recommendedCurriculum;
    trySetSessionStorage(
      'stretchRecommenderResults',
      JSON.stringify(stretchRecommenderResults)
    );

    return recommendedCurriculum;
  };

  // Renders search results based on the applied filters (or shows the No matching curriculums
  // message if no results).
  const renderSearchResults = () => {
    if (filteredCurricula.length > 0) {
      return (
        <div className={style.catalogContentCards}>
          {filteredCurricula
            .filter(
              curriculum =>
                !!curriculum.grade_levels && !!curriculum.course_version_path
            )
            .map(
              ({
                key,
                image,
                display_name,
                display_name_with_latest_year,
                grade_levels,
                duration,
                school_subject,
                cs_topic,
                course_version_path,
                course_version_id,
                course_id,
                course_offering_id,
                script_id,
                is_standalone_unit,
                is_translated,
                //Expanded Card Props
                device_compatibility,
                description,
                professional_learning_program,
                video,
                published_date,
                self_paced_pl_course_offering_path,
                available_resources,
              }) => (
                <CurriculumCatalogCard
                  key={key}
                  courseKey={key}
                  courseDisplayName={display_name}
                  courseDisplayNameWithLatestYear={
                    display_name_with_latest_year
                  }
                  imageSrc={image || undefined}
                  duration={duration}
                  gradesArray={grade_levels.split(',')}
                  subjects={school_subject?.split(',')}
                  topics={cs_topic?.split(',')}
                  isTranslated={is_translated}
                  isEnglish={isEnglish}
                  pathToCourse={course_version_path}
                  courseVersionId={course_version_id}
                  courseId={course_id}
                  courseOfferingId={course_offering_id}
                  scriptId={script_id}
                  isStandAloneUnit={is_standalone_unit}
                  handleClickAssign={handleClickAssign}
                  onAssignSuccess={response => handleAssignSuccess(response)}
                  deviceCompatibility={device_compatibility}
                  description={description}
                  professionalLearningProgram={professional_learning_program}
                  video={video}
                  publishedDate={published_date}
                  selfPacedPlCourseOfferingPath={
                    self_paced_pl_course_offering_path
                  }
                  isExpanded={expandedCardKey === key}
                  handleSetExpandedCardKey={handleSetExpandedCardKey}
                  onQuickViewClick={() => handleQuickViewClicked(key)}
                  isInUS={isInUS}
                  availableResources={available_resources}
                  isSignedOut={isSignedOut}
                  isTeacher={isTeacher}
                  recommendedSimilarCurriculum={recommendedSimilarCurriculum}
                  recommendedStretchCurriculum={recommendedStretchCurriculum}
                  {...props}
                />
              )
            )}
        </div>
      );
    } else {
      return (
        <div className={style.catalogContentNoResults}>
          <img src={CourseCatalogNoSearchResultPenguin} alt="" />
          <Heading5>{i18n.noCurriculumSearchResultsHeader()}</Heading5>
          <BodyTwoText>{i18n.noCurriculumSearchResultsBody()}</BodyTwoText>
        </div>
      );
    }
  };

  return (
    <>
      <HeaderBanner
        headingText={i18n.curriculumCatalogHeaderTitle()}
        subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
        backgroundUrl={CourseCatalogBannerBackground}
        imageUrl={CourseCatalogIllustration01}
      />
      {showAssignSuccessMessage && (
        <div className={style.assignSuccessMessageCenter}>
          <div className={style.assignSuccessMessageContainer}>
            <BodyTwoText>{assignSuccessMessage}</BodyTwoText>
            <button
              aria-label="close success message"
              onClick={handleCloseAssignSuccessMessage}
              type="button"
            >
              <strong>X</strong>
            </button>
          </div>
        </div>
      )}
      <CurriculumCatalogFilters
        curriculaData={curriculaData}
        filteredCurricula={filteredCurricula}
        setFilteredCurricula={setFilteredCurricula}
        isEnglish={isEnglish}
        languageNativeName={languageNativeName}
      />
      <div className={style.catalogContentContainer}>
        {renderSearchResults()}
      </div>
      {isAssignDialogOpen && renderAssignDialog()}
    </>
  );
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape),
  isEnglish: PropTypes.bool.isRequired,
  languageNativeName: PropTypes.string.isRequired,
  isInUS: PropTypes.bool.isRequired,
  isSignedOut: PropTypes.bool.isRequired,
  isTeacher: PropTypes.bool.isRequired,
  curriculaTaught: PropTypes.arrayOf(PropTypes.number),
  sectionsForDropdown: PropTypes.array,
  assignToSection: PropTypes.func.isRequired,
  unassignSection: PropTypes.func.isRequired,
};

// export default CurriculumCatalog;

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
)(CurriculumCatalog);
