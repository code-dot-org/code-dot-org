import React, {Dispatch, SetStateAction} from 'react';

import {SelfPacedCatalogFilterKey} from '@cdo/apps/code-studio/pd/professional_learning/courses/helpers';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import CourseOfferingFilters from '@cdo/apps/templates/courseOfferings/filters/CourseOfferingsFilters';

import {SELF_PACED_PL_CATALOG_FILTERS} from './helpers';

type SelfPacedPLCatalogFiltersProps = {
  appliedFilters: Record<SelfPacedCatalogFilterKey, string[]>;
  setAppliedFilters: Dispatch<
    SetStateAction<Record<SelfPacedCatalogFilterKey, string[]>>
  >;
  handleClearAllFilters: () => void;
};

const SelfPacedPLCatalogFilters: React.FunctionComponent<
  SelfPacedPLCatalogFiltersProps
> = ({appliedFilters, setAppliedFilters, handleClearAllFilters}) => {
  // Handles updating the given filter and the URL parameters.
  const handleUpdateFilter = (
    filterKey: SelfPacedCatalogFilterKey,
    values: string[]
  ) => {
    const newFilters = {...appliedFilters};
    newFilters[filterKey] = values;
    setAppliedFilters(newFilters);

    const valuesParamForUrl = values.length > 0 ? values.join(',') : undefined;
    updateQueryParam(filterKey, valuesParamForUrl, true);
  };

  return (
    <CourseOfferingFilters<SelfPacedCatalogFilterKey>
      filtersConfigArray={SELF_PACED_PL_CATALOG_FILTERS}
      appliedFilters={appliedFilters}
      updateAppliedFilter={handleUpdateFilter}
      onSelectAllOfOneFilter={(filterKey: SelfPacedCatalogFilterKey) => {
        const allOptions = Object.keys(
          SELF_PACED_PL_CATALOG_FILTERS.find(
            filter => filter.name === filterKey
          )?.options || {}
        );
        handleUpdateFilter(filterKey, allOptions);
      }}
      onClearAllOfOneFilter={(filterKey: SelfPacedCatalogFilterKey) => {
        handleUpdateFilter(filterKey, []);
      }}
      onClearAllFilters={handleClearAllFilters}
    />
  );
};

export default SelfPacedPLCatalogFilters;
