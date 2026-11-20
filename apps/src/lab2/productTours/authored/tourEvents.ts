import {AppName} from '@cdo/apps/lab2/types';

// Something a student does in a lab that a click cannot stand for. An authored
// tour step can wait for one. Saved tours store the name.
export interface TourEvent {
  name: string;
  // Completes the sentence "To continue, the student ..." in the tour editor.
  label: string;
}

export const AILAB_MODEL_TRAINED = 'ailab-model-trained';

const TourEventsPerLab: Partial<Record<AppName, TourEvent[]>> = {
  ailab: [{name: AILAB_MODEL_TRAINED, label: 'trains a model'}],
};

export const getTourEvents = (appName: string | undefined): TourEvent[] =>
  TourEventsPerLab[appName as AppName] ?? [];

const TOUR_EVENT = 'lab2-tour-event';

// Labs call this when the named event happens.
export const reportTourEvent = (name: string) =>
  document.dispatchEvent(new CustomEvent(TOUR_EVENT, {detail: name}));

// Returns a function that stops listening.
export const onTourEvent = (name: string, callback: () => void) => {
  const listener = (event: Event) => {
    if ((event as CustomEvent<string>).detail === name) {
      callback();
    }
  };
  document.addEventListener(TOUR_EVENT, listener);
  return () => document.removeEventListener(TOUR_EVENT, listener);
};
