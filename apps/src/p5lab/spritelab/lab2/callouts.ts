// A level's callouts (the callouts level property): a bouncing arrow at
// one of the lab's tabs or scene controls, shown while the level's
// condition holds. The first callout whose condition holds is the one
// shown.

import {Tab} from './redux/spriteLab2Redux';
import {CalloutDirection} from './views/components/Callout';
import {editorSwitchButtonId} from './views/components/EditorSwitch';
import {
  sceneDropdownButtonId,
  sceneMenuItemId,
} from './views/components/SceneDropdown';

export type CalloutTarget =
  | 'images-tab'
  | 'world-tab'
  | 'code-tab'
  /** The scene menu's button. */
  | 'scene-menu'
  /** A scene's entry in the open scene menu; `scene` names it. */
  | 'scene-option';

/** Where an arrow goes. */
export interface CalloutSpot {
  target: CalloutTarget;
  /** The scene a scene-option callout points at, by id. */
  scene?: string;
  /** Which way the arrow points at its target; up when unset. */
  direction?: CalloutDirection;
}

export interface LevelCallout extends CalloutSpot {
  /** Where the arrow goes while the target is not on the page: at the
      scene menu's button while the menu is closed, say. */
  fallback?: CalloutSpot;
  when?: {
    /** Checklist items, by index, that must be done. */
    done?: number[];
    /** Checklist items, by index, that must not be done yet. */
    notDone?: number[];
    /** The arrow shows while the student is not on this tab. */
    tabNot?: Tab;
    /** The arrow shows while the editor is not on this scene. */
    sceneNot?: string;
  };
}

/** What the student has done so far and where they are, for the callout
    conditions. */
export interface CalloutState {
  done: ReadonlySet<number>;
  tab: Tab;
  /** The scene open in the editor. */
  scene?: string;
}

/** The CSS selector for the element a spot names, as the lab renders it. */
export function calloutSelector({target, scene}: CalloutSpot): string {
  switch (target) {
    case 'images-tab':
      return `#${editorSwitchButtonId('Images')}`;
    case 'world-tab':
      return `#${editorSwitchButtonId('World')}`;
    case 'code-tab':
      return `#${editorSwitchButtonId('Code')}`;
    case 'scene-menu':
      return `#${sceneDropdownButtonId()}`;
    case 'scene-option':
      if (scene === undefined) {
        console.warn('scene-option callout names no scene');
      }
      return `#${sceneMenuItemId(scene ?? '')}`;
  }
}

export function calloutHolds(
  callout: LevelCallout,
  state: CalloutState
): boolean {
  const when = callout.when ?? {};
  return (
    (when.done ?? []).every(i => state.done.has(i)) &&
    (when.notDone ?? []).every(i => !state.done.has(i)) &&
    (when.tabNot === undefined || state.tab !== when.tabNot) &&
    (when.sceneNot === undefined || state.scene !== when.sceneNot)
  );
}

export function activeCallout(
  callouts: LevelCallout[] | undefined,
  state: CalloutState
): LevelCallout | undefined {
  return callouts?.find(callout => calloutHolds(callout, state));
}
