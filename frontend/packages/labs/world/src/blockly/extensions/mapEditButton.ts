// The `edit…` button on a `create actor in map` block.
//
// It opens the map canvas on this block's placements (MAPS.md §4) through the
// `mapPick` seam, and writes back what comes out of it. The count on the block
// is the button's label — "edit… (3)" — because a block whose whole content is
// somewhere else should at least say how much of it there is.
//
// A button rather than a dropdown: there is nothing to choose here, and the
// thing it opens is a canvas rather than a menu.

import type {Block, BlockSvg} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {translate} from '../../effect/localization';
import {actorLabelFor} from '../localActors';
import {requestMapPick} from '../mapPick';
import {placementsOf, setPlacements} from '../mapPlacements';

export const MAP_EDIT_BUTTON_EXTENSION = 'world_map_edit_button';

const FIELD_NAME = 'EDIT_MAP';

/** What the button says: the act, and how many placements are behind it. */
const buttonText = (block: Block): string => {
  const count = placementsOf(block).length;
  return count
    ? translate('edit… ({n})', {n: String(count)})
    : translate('edit…');
};

/** The block's own serialized state, for the mutation event's before/after. */
const saveState = (block: Block): string => JSON.stringify(placementsOf(block));

/** Re-label the button after the placements change. */
const refresh = (block: Block): void => {
  const field = block.getField(FIELD_NAME);
  field?.setValue(buttonText(block));
  (block as BlockSvg).render?.();
};

export const mapEditButtonExtension: Extension = defineExtension(
  MAP_EDIT_BUTTON_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const input = block.inputList[block.inputList.length - 1];
      if (!input) {
        return;
      }
      input.appendField(
        new FieldButton({
          value: buttonText(block),
          onClick: () => {
            const type = block.getFieldValue('ACTOR');
            if (!type) {
              return; // nothing chosen yet: nothing to arrange
            }
            void requestMapPick({
              blockId: block.id,
              type,
              name: actorLabelFor(block, type),
              placements: placementsOf(block),
            }).then(next => {
              // Undefined means the learner closed it without changing
              // anything, which is not the same as an empty arrangement.
              if (!next || block.isDisposed()) {
                return;
              }
              const before = saveState(block);
              setPlacements(block, next);
              refresh(block);
              // One mutation event, so the arrangement is undoable and gets
              // persisted: writing extraState fires nothing on its own, and an
              // edit the workspace never hears about is neither saved nor
              // compiled.
              Blockly.Events.fire(
                new Blockly.Events.BlockChange(
                  block,
                  'mutation',
                  null,
                  before,
                  saveState(block),
                ),
              );
            });
          },
        }),
        FIELD_NAME,
      );
      block
        .getField(FIELD_NAME)
        ?.setTooltip(translate('Arrange these actors on the map'));
    },
  },
);
