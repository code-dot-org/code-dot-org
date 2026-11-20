// A product tour written by a levelbuilder in the tour editor, as opposed to
// the tours in productToursPerLab.ts, which are written in code. Each lab has
// one library of these tours; a level uses one by referencing it.

export type AuthoredTourPlacement =
  | 'auto'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

// What the student does to leave a step.
export type AuthoredTourRequirement =
  | {type: 'next'}
  // The student clicks the step's target.
  | {type: 'click'}
  // The lab reports an event named in tourEvents.ts.
  | {type: 'event'; event: string};

export interface AuthoredTourStep {
  id: string;
  // Name of a TourAnchor. A step with no anchor is centered on the page.
  anchor?: string;
  // The anchor's label when it was picked, for the editor to show while the
  // anchor is not on the page.
  anchorLabel?: string;
  title: string;
  text: string;
  placement?: AuthoredTourPlacement;
  requirement?: AuthoredTourRequirement;
}

export interface AuthoredTour {
  id: string;
  name: string;
  steps: AuthoredTourStep[];
}

// A level's use of a library tour.
export interface TourReference {
  id: string;
  // Start the tour the first time a student opens the level.
  autoStart: boolean;
}

// A level that references a library tour.
export interface TourUsageLevel {
  id: number;
  name: string;
  // Its place in a unit, e.g. "csd3 · Lesson 2 · Level 4", else its name.
  label: string;
  url: string;
}

// Library tour id to the levels that reference it.
export type TourUsage = Record<string, TourUsageLevel[]>;
