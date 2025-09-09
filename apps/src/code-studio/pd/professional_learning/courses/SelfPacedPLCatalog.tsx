import HeroBanner from '@code-dot-org/component-library/heroBanner';
import React, {useCallback, useEffect, useState} from 'react';

import SelfPacedPLCatalogSearchResults from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalogSearchResults';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {
  filterByDurationInHours,
  filterByGradeLevel,
  filterByMarketingInitiative,
  filterByTopic,
} from '@cdo/apps/templates/courseOfferings/filters/helpers';
import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import PLCatalogHeroBannerImage from '@cdo/static/professional-learning/courses/selfPacedPLCatalog-HeroBanner-illustration.png';

import {
  getEmptyFilters,
  getInitialFilterStates,
  SELF_PACED_PL_CATALOG_FILTERS,
} from './helpers';
import SelfPacedPLCatalogFilters from './SelfPacedPLCatalogFilters';

// eslint-disable-next-line import/no-duplicates
import style from './selfPacedPLCatalog.module.scss';
// eslint-disable-next-line no-duplicate-imports,import/no-duplicates
import moduleStyles from './selfPacedPLCatalog.module.scss';

const SelfPacedPLCatalog: React.FunctionComponent<{
  selfPacedPLCourseOfferings: CourseOffering[];
}> = ({selfPacedPLCourseOfferings}) => {
  const [filteredCourses, setFilteredCourses] = useState(
    selfPacedPLCourseOfferings
  );

  const [appliedFilters, setAppliedFilters] = useState(
    getInitialFilterStates()
  );

  // Updates the filtered courses based on the applied filters.
  useEffect(() => {
    const newlyFilteredCourses = selfPacedPLCourseOfferings.filter(
      course =>
        filterByGradeLevel(course, appliedFilters.grade) &&
        filterByTopic(course, appliedFilters.topic) &&
        filterByMarketingInitiative(
          course,
          appliedFilters.marketingInitiative
        ) &&
        filterByDurationInHours(course, appliedFilters.duration)
    );

    setFilteredCourses(newlyFilteredCourses);
  }, [
    selfPacedPLCourseOfferings,
    appliedFilters.grade,
    appliedFilters.topic,
    appliedFilters.marketingInitiative,
    appliedFilters.duration,
    setFilteredCourses,
  ]);

  const [expandedCardKey, setExpandedCardKey] = useState('');

  useEffect(() => {
    const expandedCardFound = filteredCourses.some(
      co => expandedCardKey === co['key']
    );

    if (!expandedCardFound) {
      setExpandedCardKey('');
    }
  }, [expandedCardKey, filteredCourses]);

  const updateExpandedCardKey = useCallback(
    (key: string) => {
      // If updateExpandedCardKey receives the same key as it currently is, then that indicates it's open and
      // we want to close it so we set it to ''. Otherwise, we expand the card of the provided key.
      setExpandedCardKey(expandedCardKey === key ? '' : key);
    },
    [expandedCardKey, setExpandedCardKey]
  );

  // Clears all filter selections.
  const handleClearAllFilters = () => {
    setAppliedFilters(getEmptyFilters());
    SELF_PACED_PL_CATALOG_FILTERS.forEach(filter =>
      updateQueryParam(filter.name, undefined, false)
    );
  };

  return (
    <div className={moduleStyles.selfPacedPLCatalog}>
      <HeroBanner
        className={moduleStyles.plCatalogHeroBanner}
        data-theme="Dark"
        heading="Explore self-paced professional learning"
        subHeading="Professional learning offerings to support teachers in every stage of their computer science teaching journey."
        imageProps={{src: PLCatalogHeroBannerImage}}
        withWideText
        hideImageOnSmallScreen
      />
      <section className={style.bodyContainer}>
        <SelfPacedPLCatalogFilters
          appliedFilters={appliedFilters}
          setAppliedFilters={setAppliedFilters}
          handleClearAllFilters={handleClearAllFilters}
        />
        <SelfPacedPLCatalogSearchResults
          filteredCourses={filteredCourses}
          handleClearAllFilters={handleClearAllFilters}
          updateExpandedCardKey={updateExpandedCardKey}
          expandedCardKey={expandedCardKey}
        />
      </section>
    </div>
  );
};

export default SelfPacedPLCatalog;
