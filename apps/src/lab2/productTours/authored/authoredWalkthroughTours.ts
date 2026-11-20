import {
  ListedAuthoredToursPerLab,
  WalkthroughTour,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {AppName, LevelProperties} from '@cdo/apps/lab2/types';

import {createAuthoredTourSteps} from './authoredTourSteps';
import {AuthoredTour, TourReference} from './types';

const playableLibrary = (
  levelProperties: LevelProperties | undefined
): AuthoredTour[] =>
  levelProperties?.disableProductTours
    ? []
    : (levelProperties?.productTourLibrary ?? []).filter(
        tour => tour.steps.length > 0
      );

// The library tours the level references, in the level's order. A reference
// to a tour missing from the library is skipped.
export const getReferencedTours = (
  levelProperties: LevelProperties | undefined
): {tour: AuthoredTour; reference: TourReference}[] => {
  const library = playableLibrary(levelProperties);
  return (levelProperties?.tourReferences ?? []).flatMap(reference => {
    const tour = library.find(candidate => candidate.id === reference.id);
    return tour ? [{tour, reference}] : [];
  });
};

const toWalkthrough = (
  tour: AuthoredTour,
  appName: string | undefined
): WalkthroughTour => ({
  name: tour.id,
  displayName: tour.name,
  metricName: tour.name,
  getSteps: createAuthoredTourSteps(tour, appName),
});

// The authored tours the student resources tab lists: the level's own, and
// the lab's listed tours the level does not reference.
export const getAuthoredWalkthroughTours = (
  levelProperties: LevelProperties
): {levelTours: WalkthroughTour[]; otherTours: WalkthroughTour[]} => {
  const referenced = getReferencedTours(levelProperties).map(({tour}) => tour);
  const listedIds =
    ListedAuthoredToursPerLab[levelProperties.appName as AppName] ?? [];
  const listed = playableLibrary(levelProperties).filter(
    tour => listedIds.includes(tour.id) && !referenced.includes(tour)
  );
  return {
    levelTours: referenced.map(tour =>
      toWalkthrough(tour, levelProperties.appName)
    ),
    otherTours: listed.map(tour =>
      toWalkthrough(tour, levelProperties.appName)
    ),
  };
};
