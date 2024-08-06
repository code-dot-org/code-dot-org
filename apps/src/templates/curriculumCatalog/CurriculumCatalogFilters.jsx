import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';

import {Heading6, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import i18n from '@cdo/locale';

import {queryParams, updateQueryParam} from '../../code-studio/utils';
import Toggle from '../../componentLibrary/toggle/Toggle.tsx';
import CheckboxDropdown from '../CheckboxDropdown';
import {
  translatedCourseOfferingCsTopics,
  translatedInterdisciplinary,
  translatedCourseOfferingDeviceTypes,
  translatedCourseOfferingDurationsWithTime,
  translatedCourseOfferingMarketingInitiatives,
  translatedGradeLevels,
  gradeLevelsMap,
} from '../teacherDashboard/CourseOfferingHelpers';

import {curriculumDataShape} from './curriculumCatalogConstants';

import style from '../../../style/code-studio/curriculum_catalog_filters.module.scss';

const filterTypes = {
  grade: {
    name: 'grade',
    label: i18n.grade(),
    options: translatedGradeLevels,
  },
  duration: {
    name: 'duration',
    label: i18n.duration(),
    options: translatedCourseOfferingDurationsWithTime,
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
  marketingInitiative: {
    name: 'marketingInitiative',
    label: i18n.curriculum(),
    options: translatedCourseOfferingMarketingInitiatives,
  },
};

const getEmptyFilters = () => {
  let filters = {translated: false};
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
    } else if (paramKey === 'translated') {
      filters['translated'] = urlParams[paramKey] === 'true';
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

const filterByMarketingInitiative = (
  curriculum,
  marketingInitiativeFilters
) => {
  if (marketingInitiativeFilters.length > 0) {
    if (!curriculum.marketing_initiative) {
      return false;
    } else if (
      marketingInitiativeFilters.includes(
        curriculum.marketing_initiative.toLowerCase()
      )
    ) {
      return true;
    }
    return false;
  }

  return true;
};

const CurriculumCatalogFilters = ({
  curriculaData,
  filteredCurricula,
  setFilteredCurricula,
  isEnglish,
  languageNativeName,
}) => {
  const [appliedFilters, setAppliedFilters] = useState(
    getInitialFilterStates()
  );
  const [numFilteredTranslatedCurricula, setNumFilteredTranslatedCurricula] =
    useState(
      filteredCurricula.filter(curriculum => curriculum.is_translated).length
    );

  // Filters out any Curriculum Catalog Cards of courses that do not match the filter criteria.
  useEffect(() => {
    const newFilteredCurricula = curriculaData.filter(
      curriculum =>
        filterByGradeLevel(curriculum, appliedFilters['grade']) &&
        filterByDuration(curriculum, appliedFilters['duration']) &&
        filterByTopic(curriculum, appliedFilters['topic']) &&
        filterByDevice(curriculum, appliedFilters['device']) &&
        filterByMarketingInitiative(
          curriculum,
          appliedFilters['marketingInitiative']
        ) &&
        (!appliedFilters['translated'] || curriculum.is_translated)
    );
    const newNumFilteredTranslatedCurricula = newFilteredCurricula.filter(
      curriculum => curriculum.is_translated
    ).length;

    setNumFilteredTranslatedCurricula(newNumFilteredTranslatedCurricula);
    setFilteredCurricula(newFilteredCurricula);

    if (newFilteredCurricula.length === 0) {
      analyticsReporter.sendEvent(
        EVENTS.CURRICULUM_CATALOG_NO_AVAILABLE_CURRICULA_EVENT,
        {
          filters_selected: JSON.stringify(appliedFilters),
        }
      );
    }
  }, [curriculaData, appliedFilters, setFilteredCurricula]);

  // Handles updating the given filter and the URL parameters.
  const handleUpdateFilter = (filterKey, values) => {
    let newFilters = {...appliedFilters};
    newFilters[filterKey] = values;
    setAppliedFilters(newFilters);

    const valuesParam =
      values.length > 0 || filterKey === 'translated' ? values : undefined;
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

    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_DROPDOWN_FILTER_SELECTED_EVENT,
      {
        filter_category: filterKey,
        filter_name: value,
      }
    );
  };

  // Selects all options within the given filter.
  const handleSelectAllOfFilter = filterKey => {
    handleUpdateFilter(filterKey, Object.keys(filterTypes[filterKey].options));
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_DROPDOWN_FILTER_SELECTED_EVENT,
      {
        filter_category: filterKey,
        filter_name: Object.keys(filterTypes[filterKey].options).toString(),
      }
    );
  };

  const handleToggleLanguageFilter = isToggled => {
    handleUpdateFilter('translated', isToggled);
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_TOGGLE_LANGUAGE_FILTER_EVENT,
      {
        toggle_setting: isToggled,
      }
    );
  };

  // Clears all filter selections.
  const handleClear = useCallback(() => {
    setAppliedFilters(getEmptyFilters());
    Object.keys(filterTypes).forEach(filterKey =>
      updateQueryParam(filterKey, undefined, false)
    );
    if (!isEnglish) {
      updateQueryParam('translated', undefined, false);
    }
  }, [isEnglish]);

  // Clears selections within the given filter.
  const handleClearAllOfFilter = filterKey => {
    handleUpdateFilter(filterKey, []);
  };

  return (
    <div className={style.catalogFiltersContainer}>
      <div className={style.catalogDropdownFiltersTopRow}>
        <Heading6 className={style.catalogFiltersRowLabel}>
          {i18n.filterBy()}
        </Heading6>
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
      <div className={style.catalogDropdownFilters}>
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
      </div>
      {!isEnglish && (
        <div className={style.catalogLanguageFilterRow}>
          <div className={style.catalogLanguageFilterRowNumAvailable}>
            <BodyTwoText>
              {i18n.numCurriculaAvailableInLanguage({
                numCurricula: numFilteredTranslatedCurricula,
                language: languageNativeName,
              })}
              <FontAwesome
                icon="language"
                className={`fa-solid ${style.iconVerticalCenter}`}
                title={i18n.courseInYourLanguage()}
              />
            </BodyTwoText>
          </div>
          <Toggle
            name="filterTranslatedToggle"
            label={i18n.onlyShowCurriculaInLanguage({
              language: languageNativeName,
            })}
            size="m"
            checked={appliedFilters['translated']}
            onChange={e => handleToggleLanguageFilter(e.target.checked)}
          />
        </div>
      )}
    </div>
  );
};

CurriculumCatalogFilters.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape).isRequired,
  filteredCurricula: PropTypes.arrayOf(curriculumDataShape),
  setFilteredCurricula: PropTypes.func.isRequired,
  isEnglish: PropTypes.bool.isRequired,
  languageNativeName: PropTypes.string.isRequired,
};

export default CurriculumCatalogFilters;
