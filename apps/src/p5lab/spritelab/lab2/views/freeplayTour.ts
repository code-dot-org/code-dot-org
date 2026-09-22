import {queryParams} from '@cdo/apps/code-studio/utils';

import {SCENE_CHIP_ID, SCENE_MANAGE_ITEM_ID} from './SceneSelector';
import {SCENE_CARD_ATTRIBUTE} from './ScenesGallery';

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
  | 'play';

/** Where the arrow points, and which way: `up` sits below the target,
    `left` to its right, `right` to its left. */
export interface TourTarget {
  selector: string;
  direction: 'up' | 'left' | 'right';
}

export interface TourStep {
  id: string;
  text: string;
  view: TourView;
  target?: TourTarget;
}

/** The open scene menu (SceneSelector's CustomDropdown names it). */
export const SCENE_MENU_SELECTOR = 'ul[aria-label="Scenes"]';

export const TOUR_WELCOME =
  'Welcome to free play, where you can keep working on your project, and ' +
  'do so much more.';

/**
 * The lines, in order. The two scene lines depend on which scene chip is
 * under trial (see SpriteLab2View's chipOpensGallery): with a menu, both
 * show it open, pointing first at the chip and then at its Manage item;
 * with a chip that opens the gallery, the first points at the chip over
 * the black cover and the second at the gallery's first scene.
 */
export function tourSteps(chipOpensGallery: boolean): TourStep[] {
  return [
    {id: 'welcome', text: TOUR_WELCOME, view: 'blank'},
    {
      id: 'scenes',
      text: 'Switch between your scenes, and make new ones.',
      view: chipOpensGallery ? 'blank' : 'scene-menu',
      target: {selector: `#${SCENE_CHIP_ID}`, direction: 'right'},
    },
    {
      id: 'gallery',
      text: 'Manage your scenes, and change which one comes first.',
      view: chipOpensGallery ? 'gallery' : 'scene-menu',
      target: chipOpensGallery
        ? {selector: `[${SCENE_CARD_ATTRIBUTE}]`, direction: 'left'}
        : {selector: `#${SCENE_MANAGE_ITEM_ID}`, direction: 'left'},
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
      view: 'play',
      target: {selector: '[role="tab"][data-label="Play"]', direction: 'up'},
    },
  ];
}

/** The lines the list variant offers: every step but the welcome. */
export function tourListSteps(steps: TourStep[]): TourStep[] {
  return steps.filter(step => step.id !== 'welcome');
}

/** ?tour=steps or ?tour=list; anything else is no tour. */
export function tourVariantFromParams(): TourVariant | undefined {
  const value = queryParams('tour');
  return value === 'steps' || value === 'list' ? value : undefined;
}
