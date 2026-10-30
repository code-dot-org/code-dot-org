// A level's callouts (the callouts level property): a bouncing arrow at
// one of the lab's tabs, shown while the level's condition holds. The
// first callout whose condition holds is the one shown.

import {Tab} from './redux/spriteLab2Redux';
import {CalloutDirection} from './views/components/Callout';
import {editorSwitchButtonId} from './views/components/EditorSwitch';

export type CalloutTarget = 'images-tab' | 'world-tab' | 'code-tab';

export interface LevelCallout {
  target: CalloutTarget;
  /** Which way the arrow points at its target; up when unset. */
  direction?: CalloutDirection;
  when?: {
    /** Checklist items, by index, that must be done. */
    done?: number[];
    /** Checklist items, by index, that must not be done yet. */
    notDone?: number[];
    /** The arrow shows while the student is not on this tab. */
    tabNot?: Tab;
  };
}

/** What the student has done so far and which tab they are on, for the
    callout conditions. */
export interface CalloutState {
  done: ReadonlySet<number>;
  tab: Tab;
}

/** The CSS selector for the element a target names, as the lab renders it. */
export function calloutSelector(target: CalloutTarget): string {
  switch (target) {
    case 'images-tab':
      return `#${editorSwitchButtonId('Images')}`;
    case 'world-tab':
      return `#${editorSwitchButtonId('World')}`;
    case 'code-tab':
      return `#${editorSwitchButtonId('Code')}`;
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
    (when.tabNot === undefined || state.tab !== when.tabNot)
  );
}

export function activeCallout(
  callouts: LevelCallout[] | undefined,
  state: CalloutState
): LevelCallout | undefined {
  return callouts?.find(callout => calloutHolds(callout, state));
}
