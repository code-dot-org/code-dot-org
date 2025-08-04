import React from 'react';

import SelfPacedPLCatalogCard from '@cdo/apps/code-studio/pd/professional_learning/courses/SelfPacedPLCatalogCard';
import NoMatchingSearchResultsFound from '@cdo/apps/templates/courseOfferings/noMatchingSearchResultsFound/NoMathcingSearchResultsFound';
import {CourseOffering} from '@cdo/apps/templates/courseOfferings/types';
import NoMatchingCoursesImage from '@cdo/static/professional-learning/courses/no-curriculum-assigned-empty-state-illustration.png';

import moduleStyles from './selfPacedPLCatalog.module.scss';

interface SelfPacedPLCatalogSearchResultsProps {
  filteredCourses: CourseOffering[];
  handleClearAllFilters: () => void;
  updateExpandedCardKey: (key: string) => void;
  expandedCardKey?: string;
}
const SelfPacedPLCatalogSearchResults: React.FunctionComponent<
  SelfPacedPLCatalogSearchResultsProps
> = ({
  filteredCourses,
  handleClearAllFilters,
  updateExpandedCardKey,
  expandedCardKey,
}) =>
  filteredCourses.length > 0 ? (
    <div className={moduleStyles.catalogContentCards}>
      {filteredCourses.map(courseOffering => (
        <SelfPacedPLCatalogCard
          courseOffering={courseOffering}
          updateExpandedCardKey={updateExpandedCardKey}
          isExpanded={expandedCardKey === courseOffering.key}
        />
      ))}
    </div>
  ) : (
    <NoMatchingSearchResultsFound
      illustrationImageProps={{src: NoMatchingCoursesImage}}
      noResultsHeadingText="No matching courses"
      noResultsSubHeadingText="None of our self-paced courses match your exact criteria, try broadening your search."
      onClearAllFilters={handleClearAllFilters}
    />
  );

export default SelfPacedPLCatalogSearchResults;
