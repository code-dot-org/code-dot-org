// A level's callouts (the callouts level property): a bouncing arrow at
// one of the lab's controls, shown while the level's condition holds.
// The first callout whose condition holds is the one shown.

import {Tab} from './redux/spriteLab2Redux';
import {CalloutDirection} from './views/components/Callout';

export type CalloutTarget = 'code-tab' | 'scene-dropdown' | 'scene-option';

export interface CalloutAim {
  target: CalloutTarget;
  /** The scene a scene-option target names. */
  scene?: string;
  /** Which way the arrow points at its target; up when unset. */
  direction?: CalloutDirection;
}

export interface LevelCallout extends CalloutAim {
  /** Where the arrow goes while the target is not on the page: the menu
      button while the menu is closed, say. */
  fallback?: CalloutAim;
  when?: {
    /** Checklist items, by index, that must be done. */
    done?: number[];
    /** Checklist items, by index, that must not be done yet. */
    notDone?: number[];
    /** The arrow shows while the student is not on this tab. */
    tabNot?: Tab;
    /** A scene the student must not have opened yet. */
    sceneNever?: string;
  };
}

/** What the level has seen the student do so far, and where they are. */
export interface CalloutState {
  done: ReadonlySet<number>;
  tab: Tab;
  scenesSeen: ReadonlySet<string>;
}

/** The element an aim names, as the lab renders it. */
export function calloutSelector(aim: CalloutAim): string {
  switch (aim.target) {
    case 'code-tab':
      return 'button:has(> [data-label="Code"])';
    case 'scene-dropdown':
      return '[aria-label^="Scene:"]';
    case 'scene-option':
      return `[data-scene-id="${aim.scene ?? ''}"]`;
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
    (when.sceneNever === undefined || !state.scenesSeen.has(when.sceneNever))
  );
}

export function activeCallout(
  callouts: LevelCallout[] | undefined,
  state: CalloutState
): LevelCallout | undefined {
  return callouts?.find(callout => calloutHolds(callout, state));
}
