// The pencil on a `define …` block: open what it runs.
//
// specs/NEXT.md §8. A rule's implementations are not in the workspace — the
// editor holds them beside it (`blockly/bodySurfaces`) — so a member's block
// is a signature, and this is the only way to the body behind it.
//
// The same shape `openSourceButton`, `lessonButton` and `enhanceButton` have:
// a `FieldButton` drawing a glyph, appended to the block's last input, whose
// click goes through a module-level opener the editor installs on mount. A
// Blockly field has no route to React state, which is what `setModuleOpener`
// and `setLessonOpener` are for too.

import type {Block, BlockSvg, Input} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {hasBody, HIDE_BODIES} from '../bodySurfaces';

import {glyphIcon} from './glyphIcon';

export const BODY_BUTTON_EXTENSION = 'world_body_button';

/** The field's name on the block — how it is found again to remove it. */
const FIELD_NAME = 'OPEN_BODY';

/** FontAwesome's `pen-to-square` (f044). */
const PENCIL = '';

type Opener = (blockId: string) => void;

let opener: Opener | null = null;

/** Who opens a body, or nobody. Installed by the editor while it is mounted. */
export function setBodyOpener(next: Opener | null): void {
  opener = next;
}

const lastInput = (block: Block): Input | undefined =>
  block.inputList[block.inputList.length - 1];

function syncButton(block: Block): void {
  // NOT gated on an opener being installed. The editor installs itself in an
  // effect, which runs after the workspace has built its blocks, so asking
  // "is anyone listening" at init time always answered no and the button
  // never appeared. A click with no opener does nothing, which is also the
  // right answer for the headless generator.
  // …and gated on the split being on. With it off the bodies are still in
  // the workspace, so there is nothing behind the pencil and it would open an
  // empty surface — worse than no pencil.
  const wanted = HIDE_BODIES && hasBody(block.type);
  if (wanted === Boolean(block.getField(FIELD_NAME))) {
    return;
  }
  const input = lastInput(block);
  if (!input) {
    return;
  }
  if (wanted) {
    input.appendField(
      new FieldButton({
        value: '',
        onClick: () => {
          // After the click, not during it: opening a body reloads the
          // workspace, and Blockly is still inside its own gesture handling
          // for the press — the same reason `openSourceButton` defers.
          const id = block.id;
          setTimeout(() => opener?.(id), 0);
        },
        icon: glyphIcon(PENCIL),
        // A locked level can still be read, and a body is worth reading.
        allowReadOnlyClick: true,
      }),
      FIELD_NAME,
    );
    const field = block.getField(FIELD_NAME);
    field?.setTooltip('Open what this runs');
    // NOT saved, and not editable — both flags, for the reason
    // `openSourceButton` records: `FieldButton` is serializable by default, so
    // the button would be written into every file that had one and warned
    // about on every load of one that did not.
    if (field) {
      field.SERIALIZABLE = false;
      field.EDITABLE = false;
    }
  } else {
    input.removeField(FIELD_NAME);
  }
  (block as BlockSvg).render?.();
}

export const bodyButtonExtension: Extension = defineExtension(
  BODY_BUTTON_EXTENSION,
  {
    extension() {
      syncButton(this as unknown as Block);
    },
  },
);
