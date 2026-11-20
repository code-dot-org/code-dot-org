import {AuthoredTour, AuthoredTourStep, TourReference} from '../types';

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;

export const newTour = (library: AuthoredTour[]): AuthoredTour => ({
  id: newId('tour'),
  name: `Tour ${library.length + 1}`,
  steps: [],
});

export const copyTour = (tour: AuthoredTour): AuthoredTour => ({
  ...tour,
  id: newId('tour'),
  name: `${tour.name} (copy)`,
});

// Points the level's reference to a tour at another tour, in the same place.
export const swapReference = (
  references: TourReference[],
  fromId: string,
  toId: string
): TourReference[] =>
  references.map(reference =>
    reference.id === fromId ? {...reference, id: toId} : reference
  );

export const newStep = (): AuthoredTourStep => ({
  id: newId('step'),
  title: '',
  text: '',
});

export const replaceTour = (
  tours: AuthoredTour[],
  tour: AuthoredTour
): AuthoredTour[] =>
  tours.map(existing => (existing.id === tour.id ? tour : existing));

export const replaceStep = (
  tour: AuthoredTour,
  step: AuthoredTourStep
): AuthoredTour => ({
  ...tour,
  steps: tour.steps.map(existing =>
    existing.id === step.id ? step : existing
  ),
});

export const removeStep = (
  tour: AuthoredTour,
  stepId: string
): AuthoredTour => ({
  ...tour,
  steps: tour.steps.filter(step => step.id !== stepId),
});

// Moves a step one place earlier (-1) or later (1).
export const moveStep = (
  tour: AuthoredTour,
  stepId: string,
  direction: -1 | 1
): AuthoredTour => {
  const from = tour.steps.findIndex(step => step.id === stepId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= tour.steps.length) {
    return tour;
  }
  const steps = [...tour.steps];
  [steps[from], steps[to]] = [steps[to], steps[from]];
  return {...tour, steps};
};

export const addReferences = (
  references: TourReference[],
  tourIds: string[]
): TourReference[] => [
  ...references,
  ...tourIds
    .filter(id => !references.some(reference => reference.id === id))
    .map(id => ({id, autoStart: false})),
];

export const removeReference = (
  references: TourReference[],
  tourId: string
): TourReference[] => references.filter(reference => reference.id !== tourId);

export const setAutoStart = (
  references: TourReference[],
  tourId: string,
  autoStart: boolean
): TourReference[] =>
  references.map(reference =>
    reference.id === tourId ? {...reference, autoStart} : reference
  );
