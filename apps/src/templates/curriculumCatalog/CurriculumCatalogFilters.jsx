import Toggle from '@code-dot-org/component-library/toggle';
import {BodyTwoText} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useCallback} from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import CourseOfferingsFilters from '@cdo/apps/templates/courseOfferings/filters/CourseOfferingsFilters';
import {
  commonFilterTypes,
  filterByGradeLevel,
  filterByDuration,
  filterByDevice,
  filterByTopic,
  filterByMarketingInitiative,
} from '@cdo/apps/templates/courseOfferings/filters/helpers';
import i18n from '@cdo/locale';

import {queryParams, updateQueryParam} from '../../code-studio/utils';

import {curriculumDataShape} from './curriculumCatalogConstants';

import style from '../../../style/code-studio/curriculum_catalog_filters.module.scss';

const FILTERS = Object.values(commonFilterTypes);
const curriculumCatalogFilterKeys = FILTERS.map(filter => filter.name);

const getEmptyFilters = (forceTranslated = false) => {
  let filters = {translated: forceTranslated};
  curriculumCatalogFilterKeys.forEach(filterKey => {
    filters[filterKey] = [];
  });
  return filters;
};

// Filters out invalid values for the given filter key.
const getValidParamValues = (filterKey, paramValues) => {
  const currFilter = FILTERS.find(filter => filter.name === filterKey);

  if (!Array.isArray(paramValues)) {
    paramValues = [paramValues];
  }
  return currFilter
    ? paramValues.filter(paramValue =>
        Object.keys(currFilter.options).includes(paramValue)
      )
    : [];
};

// Returns initial filter states based on URL parameters (returns empty filters if
// no relevant parameters in the URL).
const getInitialFilterStates = forceTranslated => {
  const urlParams = queryParams();

  let filters = getEmptyFilters(forceTranslated);
  Object.keys(urlParams).forEach(paramKey => {
    if (curriculumCatalogFilterKeys.includes(paramKey)) {
      filters[paramKey] = getValidParamValues(paramKey, urlParams[paramKey]);
    } else if (paramKey === 'translated') {
      filters['translated'] = urlParams[paramKey] === 'true';
    }
  });
  return filters;
};

const CurriculumCatalogFilters = ({
  curriculaData,
  filteredCurricula,
  setFilteredCurricula,
  isEnglish,
  forceTranslated,
  languageNativeName,
}) => {
  const [appliedFilters, setAppliedFilters] = useState(
    getInitialFilterStates(forceTranslated)
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
  const handleSelect = (filterKey, updatedFilters, value) => {
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
    const allCurrentFilterOptions = Object.keys(
      FILTERS.find(filter => filter.name === filterKey).options
    );
    handleUpdateFilter(filterKey, allCurrentFilterOptions);
    analyticsReporter.sendEvent(
      EVENTS.CURRICULUM_CATALOG_DROPDOWN_FILTER_SELECTED_EVENT,
      {
        filter_category: filterKey,
        filter_name: allCurrentFilterOptions.toString(),
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
    curriculumCatalogFilterKeys.forEach(filterKey =>
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
    <CourseOfferingsFilters
      filtersConfigArray={Object.values(commonFilterTypes)}
      appliedFilters={appliedFilters}
      updateAppliedFilter={handleSelect}
      onSelectAllOfOneFilter={handleSelectAllOfFilter}
      onClearAllOfOneFilter={handleClearAllOfFilter}
      onClearAllFilters={handleClear}
    >
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
          {!forceTranslated && (
            <Toggle
              name="filterTranslatedToggle"
              label={i18n.onlyShowCurriculaInLanguage({
                language: languageNativeName,
              })}
              size="m"
              checked={appliedFilters['translated']}
              onChange={e => handleToggleLanguageFilter(e.target.checked)}
            />
          )}
        </div>
      )}
    </CourseOfferingsFilters>
  );
};

CurriculumCatalogFilters.propTypes = {
  curriculaData: PropTypes.arrayOf(curriculumDataShape).isRequired,
  filteredCurricula: PropTypes.arrayOf(curriculumDataShape),
  setFilteredCurricula: PropTypes.func.isRequired,
  isEnglish: PropTypes.bool.isRequired,
  languageNativeName: PropTypes.string.isRequired,
  forceTranslated: PropTypes.bool,
};

export default CurriculumCatalogFilters;
