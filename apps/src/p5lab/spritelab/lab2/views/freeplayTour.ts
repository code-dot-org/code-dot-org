import {queryParams} from '@cdo/apps/code-studio/utils';

/**
 * The freeplay welcome tour: a few sentences about what the level offers,
 * each shown against the part of the lab it describes. Two shapes are under
 * trial. `steps` walks them one at a time with a Next button; `list` shows
 * every line at once and a click on a line brings up its view.
 */
export type TourVariant = 'steps' | 'list';

/** What the lab shows behind a tour line. */
export type TourView =
  | 'blank'
  | 'scene-menu'
  | 'gallery'
  | 'world'
  | 'code'
  | 'play-hint';

/** Where the arrow points, and from which side. */
export interface TourTarget {
  selector: string;
  direction: 'up' | 'left';
}

export interface TourStep {
  id: string;
  text: string;
  view: TourView;
  target?: TourTarget;
}

export const TOUR_WELCOME =
  'Welcome to free play, where you can keep working on your project, and ' +
  'do so much more.';

export const TOUR_STEPS: TourStep[] = [
  {id: 'welcome', text: TOUR_WELCOME, view: 'blank'},
  {
    id: 'scenes',
    text: 'Switch between your scenes, and make new ones.',
    view: 'scene-menu',
    target: {selector: 'ul[aria-label="Scenes"]', direction: 'left'},
  },
  {
    id: 'gallery',
    text: 'Manage your scenes, and change which one comes first.',
    view: 'gallery',
  },
  {
    id: 'world',
    text: "Change your platform scene's world.",
    view: 'world',
    target: {selector: '[role="tab"][data-label="World"]', direction: 'up'},
  },
  {
    id: 'code',
    text: "Change your scene's code.",
    view: 'code',
    target: {selector: '[role="tab"][data-label="Code"]', direction: 'up'},
  },
  {
    id: 'play',
    text: 'Play your game.',
    view: 'play-hint',
    target: {selector: '[role="tab"][data-label="Play"]', direction: 'up'},
  },
];

/** The lines the list variant offers: every step but the welcome. */
export const TOUR_LIST_STEPS = TOUR_STEPS.filter(step => step.view !== 'blank');

/** ?tour=steps or ?tour=list; anything else is no tour. */
export function tourVariantFromParams(): TourVariant | undefined {
  const value = queryParams('tour');
  return value === 'steps' || value === 'list' ? value : undefined;
}
