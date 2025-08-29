import {queryParams} from '@cdo/apps/code-studio/utils';
import {
  commonFilterTypes,
  durationInHoursFilterTypes,
  FilterTypeConfig,
} from '@cdo/apps/templates/courseOfferings/filters/helpers';

export const SELF_PACED_PL_CATALOG_FILTERS: FilterTypeConfig[] = [
  commonFilterTypes.grade,
  commonFilterTypes.topic,
  commonFilterTypes.marketingInitiative,
  durationInHoursFilterTypes,
] as const;

export type SelfPacedCatalogFilterKey =
  (typeof SELF_PACED_PL_CATALOG_FILTERS)[number]['name'];

export const getEmptyFilters = () => {
  const emptyFilters = {} as Record<SelfPacedCatalogFilterKey, string[]>;
  for (const filter of SELF_PACED_PL_CATALOG_FILTERS) {
    emptyFilters[filter.name] = [];
  }
  return emptyFilters;
};

// Filters out invalid values for the given filter key.
export const getValidParamValues = (
  filterKey: string,
  paramValues: string[]
) => {
  const currFilter = SELF_PACED_PL_CATALOG_FILTERS.find(
    filter => filter.name === filterKey
  );

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
export const getInitialFilterStates = () => {
  const urlParams = queryParams() as Record<string, string | undefined>;
  const filterKeys = SELF_PACED_PL_CATALOG_FILTERS.map(filter => filter.name);

  const initialFilters = getEmptyFilters();
  filterKeys.forEach(key => {
    const paramValue = urlParams[key];
    if (paramValue) {
      initialFilters[key] = getValidParamValues(key, paramValue.split(','));
    }
  });
  return initialFilters as Record<SelfPacedCatalogFilterKey, string[]>;
};
