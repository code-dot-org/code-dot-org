// The control beside each top block that shows or hides its body
// (specs/LAZY_WORKSPACE_PLAN.md, `lazyBodies`).
//
// A chevron at the front of the block's first row: pointing right when the
// body is held unbuilt, down when it is built. Drawn as a glyph button the
// way the pencil into a `define block`'s body is (`extensions/bodyButton`),
// and like it not part of the file: not serialized, and put on and taken off
// as the block gains or loses a body.

import type {Block, BlockSvg} from 'blockly';

import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {glyphIcon} from './extensions/glyphIcon';
import {hasBuiltBody} from './lazyBodies';

const FIELD_NAME = 'BODY_TOGGLE';

/** `chevron-right` (f054) and `chevron-down` (f078), in the free set too. */
const COLLAPSED = '';
const EXPANDED = '';

/** Which glyph the toggle on `block` is wearing, if it has one. */
const shownState = new WeakMap<Block, boolean>();

/**
 * Put a toggle on every top block with a body, in the state it is in, and
 * take it off any that has none.
 *
 * `collapsed` says whether a top block's body is held unbuilt; `onToggle` is
 * what a press does. Cheap to run after every edit: a block whose toggle
 * already says the right thing is left alone.
 */
export function syncBodyToggles(
  tops: readonly Block[],
  collapsed: (id: string) => boolean,
  onToggle: (id: string) => void,
): void {
  for (const block of tops) {
    if (block.isShadow() || block.isInsertionMarker()) {
      continue;
    }
    const held = collapsed(block.id);
    const wanted = held || hasBuiltBody(block);
    const input = block.inputList[0];
    const has = Boolean(block.getField(FIELD_NAME));
    if (!input) {
      continue;
    }
    if (has && (!wanted || shownState.get(block) !== held)) {
      input.removeField(FIELD_NAME);
    }
    if (wanted && (!has || shownState.get(block) !== held)) {
      const id = block.id;
      input.insertFieldAt(
        0,
        new FieldButton({
          value: '',
          // After the click has finished with the block: the press lands on a
          // field inside the block, and building or disposing its body under
          // the gesture that is still running is how a click becomes a drag.
          onClick: () => setTimeout(() => onToggle(id), 0),
          icon: glyphIcon(held ? COLLAPSED : EXPANDED),
          allowReadOnlyClick: true,
        }),
        FIELD_NAME,
      );
      const field = block.getField(FIELD_NAME);
      if (field) {
        field.SERIALIZABLE = false;
        field.EDITABLE = false;
        field.setTooltip(held ? 'Show what this does' : 'Hide what this does');
      }
      shownState.set(block, held);
    }
    if (has !== wanted || shownState.get(block) !== held) {
      (block as BlockSvg).queueRender?.();
    }
  }
}
