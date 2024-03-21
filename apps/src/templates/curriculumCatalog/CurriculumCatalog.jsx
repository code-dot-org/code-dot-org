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
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  getSimilarRecommendations,
  getStretchRecommendations,
} from '@cdo/apps/util/curriculumRecommender/curriculumRecommender';

const CurriculumCatalog = ({
  curriculaData,
  isEnglish,
  languageNativeName,
  isInUS,
  isSignedOut,
  isTeacher,
  curriculaTaught,
  ...props
}) => {
  const [filteredCurricula, setFilteredCurricula] = useState(curriculaData);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState('');
  const [showAssignSuccessMessage, setShowAssignSuccessMessage] =
    useState(false);
  const [expandedCardKey, setExpandedCardKey] = useState(null);

  useEffect(() => {
    const expandedCardFound = filteredCurricula.some(
      co => expandedCardKey === co['key']
    );

    if (!expandedCardFound) {
      setExpandedCardKey(null);
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

  const handleCloseAssignSuccessMessage = () => {
    setShowAssignSuccessMessage(false);
    setAssignSuccessMessage('');
  };

  const handleExpandedCardChange = key => {
    if (expandedCardKey !== key) {
      analyticsReporter.sendEvent(
        EVENTS.CURRICULUM_CATALOG_QUICK_VIEW_CLICKED_EVENT,
        {
          curriculum_offering: key,
        }
      );
    }
    setExpandedCardKey(expandedCardKey === key ? null : key);
  };

  // Get the top recommended similar curriculum based on the curriculum with the given
  // curriculumKey
  const getRecommendedSimilarCurriculum = curriculumKey => {
    const recommendations = getSimilarRecommendations(
      curriculaData,
      curriculumKey,
      curriculaTaught
    );
    return recommendations[0];
  };

  // Get the top recommended stretch curriculum based on the curriculum with the given
  // curriculumKey
  const getRecommendedStretchCurriculum = curriculumKey => {
    const recommendations = getStretchRecommendations(
      curriculaData,
      curriculumKey,
      curriculaTaught
    );
    return recommendations[0];
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
                  setExpandedCardKey={setExpandedCardKey}
                  onQuickViewClick={() => handleExpandedCardChange(key)}
                  isInUS={isInUS}
                  availableResources={available_resources}
                  isSignedOut={isSignedOut}
                  isTeacher={isTeacher}
                  getRecommendedSimilarCurriculum={
                    getRecommendedSimilarCurriculum
                  }
                  getRecommendedStretchCurriculum={
                    getRecommendedStretchCurriculum
                  }
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
};

export default CurriculumCatalog;
