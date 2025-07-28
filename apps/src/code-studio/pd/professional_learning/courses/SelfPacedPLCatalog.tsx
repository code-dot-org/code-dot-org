import HeroBanner from '@code-dot-org/component-library/heroBanner';
// import {configureStore} from '@reduxjs/toolkit';
import React, {useEffect, useState} from 'react';
// import {Provider} from 'react-redux';

import SelfPacedPLCatalogCard from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalogCard';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {
  filterByDuration,
  filterByGradeLevel,
  filterByMarketingInitiative,
  filterByTopic,
} from '@cdo/apps/templates/courseOfferings/filters/helpers';
import NoMatchingSearchResultsFound from '@cdo/apps/templates/courseOfferings/noMatchingSearchResultsFound/NoMathcingSearchResultsFound';
import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
// import CurriculumCatalog from '@cdo/apps/templates/curriculumCatalog/CurriculumCatalog';
// import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import NoMatchingCoursesImage from '@cdo/static/professional-learning/courses/no-curriculum-assigned-empty-state-illustration.png';
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
        filterByDuration(course, appliedFilters.duration)
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

  // console.log(selfPacedPLCourseOfferings);
  const [expandedCardKey, setExpandedCardKey] = useState('');

  useEffect(() => {
    const expandedCardFound = filteredCourses.some(
      co => expandedCardKey === co['key']
    );

    if (!expandedCardFound) {
      setExpandedCardKey('');
    }
  }, [expandedCardKey, filteredCourses]);

  // const updateExpandedCardKey = (key: string) => {
  //   // If updateExpandedCardKey receives the same key as it currently is, then that indicates it's open and
  //   // we want to close it so we set it to ''. Otherwise, we expand the card of the provided key.
  //   setExpandedCardKey(expandedCardKey === key ? '' : key);
  // };

  // Clears all filter selections.
  const handleClearAllFilters = () => {
    setAppliedFilters(getEmptyFilters());
    SELF_PACED_PL_CATALOG_FILTERS.forEach(filter =>
      updateQueryParam(filter.name, undefined, false)
    );
  };

  // Renders search results based on the applied filters (or shows the No matching course offerings
  // message if no results).
  const renderSearchResults = () => {
    if (filteredCourses.length > 0) {
      return (
        <div className={style.catalogContentCards}>
          {filteredCourses.map(courseOffering => (
            <SelfPacedPLCatalogCard {...courseOffering} />
          ))}
        </div>
      );
    } else {
      return (
        <NoMatchingSearchResultsFound
          illustrationImageProps={{src: NoMatchingCoursesImage}}
          noResultsHeadingText="No matching courses"
          noResultsSubHeadingText="None of our self-paced courses match your exact criteria, try broadening your search."
          onClearAllFilters={handleClearAllFilters}
        />
      );
    }
  };

  return (
    <div className={style.selfPacedPLCatalog}>
      {/*<Provider store={configureStore({reducer: {teacherSections}})}>*/}
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
        <div>{renderSearchResults()}</div>
      </section>

      {/*<CurriculumCatalog*/}
      {/*  curriculaData={selfPacedPLCourseOfferings}*/}
      {/*  isInUS*/}
      {/*  languageNativeName={'adsa'}*/}
      {/*/>*/}
      {/*</Provider>*/}
    </div>
  );
};

export default SelfPacedPLCatalog;
