// "How this works" at the top of a rule's drawer.
//
// The fourth and last of the back-links specs/PROGRESSION_UI.md asks for. The
// other three sit where a learner CHOOSES a rule (the import dialogs) or USES
// one (the button beside the eye on `use trait`); this one sits where they go
// looking for its blocks, which is the drawer named after it.
//
// A Blockly flyout button, which is a first-class toolbox item — `{kind:
// 'button', text, callbackkey}` — and a callback registered per workspace. The
// key carries the tile, so one entry in the toolbox needs no lookup table
// beside it; the callbacks are registered for the whole catalogue at injection
// rather than per toolbox rebuild, because sixty-seven registrations cost
// nothing and a toolbox that rebuilds without them is a button that does
// nothing when pressed.

import type * as Blockly from 'blockly/core';

import {TILES} from '../progression/catalogue';
import {TILES_BY_ID} from '../progression/index';
import {lessonFor, openLesson} from '../progression/lessonSeam';
import {stockRuleByName} from '../rules/stock';

/** The callback key a lesson button carries. */
const key = (tile: string) => `world_lesson_${tile}`;

/**
 * The button at the top of a rule's drawer, or nothing.
 *
 * Nothing when the rule is the learner's own, when no lesson granted it, and
 * when there is no progression mounted to open — see `lessonFor`, which answers
 * for all three.
 */
export function lessonFlyoutButton(
  ruleName: string,
): Blockly.utils.toolbox.ButtonOrLabelInfo | undefined {
  const stock = stockRuleByName(ruleName);
  const tile = stock ? lessonFor({kind: 'rule', id: stock.id}) : undefined;
  if (!tile) {
    return undefined;
  }
  return {
    kind: 'button',
    // The lesson's own name, as everywhere else this link appears: somebody
    // deciding whether to go is deciding about that lesson.
    text: `How this works: ${TILES_BY_ID.get(tile)?.title ?? tile}`,
    callbackkey: key(tile),
  };
}

/**
 * Teach a workspace what the lesson buttons do.
 *
 * Called from `onInject`. Registering on every tile rather than on the ones the
 * current toolbox happens to name keeps this independent of when the toolbox is
 * rebuilt — which is often, and for reasons that have nothing to do with this.
 */
export function registerLessonButtons(workspace: Blockly.WorkspaceSvg): void {
  for (const tile of TILES) {
    workspace.registerButtonCallback(key(tile.id), () => {
      // After the press, not during it: opening the map takes focus while
      // Blockly is still inside its own gesture handling (the same reason the
      // eye and the lesson button on a block defer).
      setTimeout(() => openLesson(tile.id), 0);
    });
  }
}
