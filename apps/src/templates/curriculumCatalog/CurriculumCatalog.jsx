import React, {useState, useEffect, useCallback} from 'react';
import PropTypes from 'prop-types';

import {curriculumDataShape} from './curriculumCatalogShapes';
import i18n from '@cdo/locale';
import style from '../../../style/code-studio/curriculum_catalog_container.module.scss';
import {queryParams, updateQueryParam} from '../../code-studio/utils';
import HeaderBanner from '../HeaderBanner';
import CourseCatalogBannerBackground from '../../../static/curriculum_catalog/course-catalog-banner-illustration-01.png';
import CourseCatalogIllustration01 from '../../../static/curriculum_catalog/course-catalog-illustration-01.png';
import CourseCatalogNoSearchResultPenguin from '../../../static/curriculum_catalog/course-catalog-no-search-result-penguin.png';

import Button from '@cdo/apps/templates/Button';
import {
  Heading5,
  Heading6,
  BodyOneText,
} from '@cdo/apps/componentLibrary/typography';
import CheckboxDropdown from '../CheckboxDropdown';
import CurriculumCatalogCard from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalogCard';
import {
  translatedCourseOfferingCsTopics,
  translatedInterdisciplinary,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDurations,
  translatedGradeLevels,
  gradeLevelsMap,
} from '../teacherDashboard/CourseOfferingHelpers';

const filterTypes = {
  grade: {
    name: 'grade',
    label: i18n.grade(),
    options: translatedGradeLevels,
  },
  duration: {
    name: 'duration',
    label: i18n.duration(),
    options: translatedCourseOfferingDurations,
  },
  topic: {
    name: 'topic',
    label: i18n.topic(),
    options: {
      ...translatedInterdisciplinary,
      ...translatedCourseOfferingCsTopics,
    },
  },
  device: {
    name: 'device',
    label: i18n.device(),
    options: translatedCourseOfferingDeviceTypes,
  },
};

const getEmptyFilters = () => {
  let filters = {};
  Object.keys(filterTypes).forEach(filterKey => {
    filters[filterKey] = [];
  });
  return filters;
};

// Filters out invalid values for the given filter key.
const getValidParamValues = (filterKey, paramValues) => {
  if (!Array.isArray(paramValues)) {
    paramValues = [paramValues];
  }
  return paramValues.filter(paramValue => {
    return Object.keys(filterTypes[filterKey].options).includes(paramValue);
  });
};

// Returns initial filter states based on URL parameters (returns empty filters if
// no relevant parameters in the URL).
const getInitialFilterStates = () => {
  const filterTypeKeys = Object.keys(filterTypes);
  const urlParams = queryParams();

  let filters = getEmptyFilters();
  Object.keys(urlParams).forEach(paramKey => {
    if (filterTypeKeys.includes(paramKey)) {
      filters[paramKey] = getValidParamValues(paramKey, urlParams[paramKey]);
    }
  });
  return filters;
};

// Returns whether the given curriculum matches the checked grade level filters.
const filterByGradeLevel = (curriculum, gradeFilters) => {
  if (gradeFilters.length > 0) {
    if (!curriculum.grade_levels) {
      return false;
    } else {
      const curriculumGradeLevels = curriculum.grade_levels.split(',');
      const supportsFilteredGradeLevel = gradeFilters.some(grade =>
        curriculumGradeLevels.includes(gradeLevelsMap[grade])
      );
      if (!supportsFilteredGradeLevel) {
        return false;
      }
    }
  }
  return true;
};

// Returns whether the given curriculum matches the checked duration filters.
const filterByDuration = (curriculum, durationFilters) => {
  return (
    durationFilters.length === 0 ||
    durationFilters.includes(curriculum.duration)
  );
};

// Returns whether the given curriculum matches the checked topic filters.
// (Note: the Interdisciplinary topic will show any course that has been tagged
// with a school subject (e.g. Math, Science, etc.))
const filterByTopic = (curriculum, topicFilters) => {
  if (topicFilters.length > 0) {
    if (!curriculum.cs_topic) {
      return false;
    } else {
      // Handle main CS topics
      const curriculumTopics = curriculum.cs_topic.split(',');
      const supportsFilteredTopics = topicFilters.some(topic =>
        curriculumTopics.includes(topic)
      );
      // Handle case of Interdisciplinary topic
      const hasAndSupportsInterdisciplinary =
        topicFilters.includes('interdisciplinary') && curriculum.school_subject;
      if (!supportsFilteredTopics && !hasAndSupportsInterdisciplinary) {
        return false;
      }
    }
  }
  return true;
};

// Returns whether the given curriculum matches the checked device filters.
const filterByDevice = (curriculum, deviceFilters) => {
  if (deviceFilters.length > 0) {
    if (!curriculum.device_compatibility) {
      return false;
    } else {
      const curriculumDevComp = JSON.parse(curriculum.device_compatibility);
      const supportsFilteredDevice = deviceFilters.some(
        device => curriculumDevComp[device] === 'ideal'
      );
      if (!supportsFilteredDevice) {
        return false;
      }
    }
  }
  return true;
};

const CurriculumCatalog = ({curriculaData, isEnglish}) => {
  const [filteredCurricula, setFilteredCurricula] = useState(curriculaData);
  const [appliedFilters, setAppliedFilters] = useState(
    getInitialFilterStates()
  );

  // Filters out any Curriculum Catalog Cards of courses that do not match the filter criteria.
  useEffect(() => {
    const newFilteredCurricula = curriculaData.filter(
      curriculum =>
        filterByGradeLevel(curriculum, appliedFilters['grade']) &&
        filterByDuration(curriculum, appliedFilters['duration']) &&
        filterByTopic(curriculum, appliedFilters['topic']) &&
        filterByDevice(curriculum, appliedFilters['device'])
    );

    setFilteredCurricula(newFilteredCurricula);
  }, [curriculaData, appliedFilters]);

  // Handles updating the given filter and the URL parameters.
  const handleUpdateFilter = (filterKey, values) => {
    let newFilters = {...appliedFilters};
    newFilters[filterKey] = values;
    setAppliedFilters(newFilters);

    const valuesParam = values.length > 0 ? values : undefined;
    updateQueryParam(filterKey, valuesParam, true);
  };

  // Selects the given value in the given filter.
  const handleSelect = (event, filterKey) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    let updatedFilters;
    if (isChecked) {
      // Add checked item into applied filters
      updatedFilters = [...appliedFilters[filterKey], value];
    } else {
      // Remove unchecked item from applied filters
      updatedFilters = appliedFilters[filterKey].filter(item => item !== value);
    }
    handleUpdateFilter(filterKey, updatedFilters);
  };

  // Selects all options within the given filter.
  const handleSelectAllOfFilter = filterKey => {
    handleUpdateFilter(filterKey, Object.keys(filterTypes[filterKey].options));
  };

  // Clears all filter selections.
  const handleClear = useCallback(() => {
    setAppliedFilters(getEmptyFilters());
    Object.keys(filterTypes).forEach(filterKey =>
      updateQueryParam(filterKey, undefined, false)
    );
  }, []);

  // Clears selections within the given filter.
  const handleClearAllOfFilter = filterKey => {
    handleUpdateFilter(filterKey, []);
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
                grade_levels,
                duration,
                school_subject,
                cs_topic,
                course_version_path,
              }) => (
                <CurriculumCatalogCard
                  key={key}
                  courseDisplayName={display_name}
                  imageSrc={image || undefined}
                  duration={duration}
                  gradesArray={grade_levels.split(',')}
                  subjects={school_subject?.split(',')}
                  topics={cs_topic?.split(',')}
                  isTranslated={false} // TODO [MEG]: actually pass in this data
                  isEnglish={isEnglish}
                  pathToCourse={course_version_path}
                />
              )
            )}
        </div>
      );
    } else {
      return (
        <div className={style.catalogContentNoResults}>
          <img
            className={style.noResultsImage}
            src={CourseCatalogNoSearchResultPenguin}
            alt=""
          />
          <Heading5 className={style.noResultsHeading}>
            {i18n.noCurriculumSearchResultsHeader()}
          </Heading5>
          <BodyOneText className={style.noResultsBody}>
            {i18n.noCurriculumSearchResultsBody()}
          </BodyOneText>
        </div>
      );
    }
  };

  return (
    <>
      <HeaderBanner
        headingText={i18n.curriculumCatalogHeaderTitle()}
        subHeadingText={i18n.curriculumCatalogHeaderSubtitle()}
        short={false}
        backgroundUrl={CourseCatalogBannerBackground}
        imageUrl={CourseCatalogIllustration01}
      />
      <div className={style.catalogFiltersContainer}>
        <Heading6 className={style.catalogFiltersRowLabel}>
          {i18n.filterBy()}
        </Heading6>
        {Object.keys(filterTypes).map(filterKey => (
          <CheckboxDropdown
            key={filterKey}
            name={filterKey}
            label={filterTypes[filterKey].label}
            allOptions={filterTypes[filterKey].options}
            checkedOptions={appliedFilters[filterKey]}
            onChange={e => handleSelect(e, filterKey)}
            handleSelectAll={() => handleSelectAllOfFilter(filterKey)}
            handleClearAll={() => handleClearAllOfFilter(filterKey)}
          />
        ))}
        <Button
          id="clear-filters"
          className={style.catalogClearFiltersButton}
          type="button"
          onClick={handleClear}
          text={i18n.clearFilters()}
          styleAsText
          color={Button.ButtonColor.brandSecondaryDefault}
        />
      </div>
      <div className={style.catalogContentContainer}>
        {renderSearchResults()}
      </div>
    </>
  );
};

CurriculumCatalog.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape),
  isEnglish: PropTypes.bool.isRequired,
};

export default CurriculumCatalog;
