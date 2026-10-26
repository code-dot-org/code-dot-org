// The eye on `define block`: whether anybody else is offered what it defines.
//
// AN ACTOR'S OWN WORK IS NOT VOCABULARY. The Text Area says "keep the caret in
// view" at eight sites and means the arithmetic behind it; that block is an
// implementation, and offering it in every file's toolbox hands a reader
// something which only means anything inside the file it came from.
//
// `define property` has answered the same question since it had a setter, with
// the same picture: the eye means VISIBLE, and a shut eye is a declaration its
// own file uses and nobody else is given. This is that, one row up
// (`fields/visibilityEye`, `ownProperties.designedBlock`).
//
// NOT A BOUNDARY. Nothing stops a file naming a private block if it writes the
// type out by hand, and nothing should — what this decides is what the TOOLBOX
// offers, which is what a learner can find.

import type {Block} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {visibilityEye} from '../fields/visibilityEye';

export const BLOCK_ACCESS_FIELD = 'ACCESS';
/** Offered everywhere, which is what a block that says nothing is. */
export const SHARED = 'shared';
/** Offered only in the file that defines it. */
export const PRIVATE = 'private';

const BLOCK_VISIBILITY_EXTENSION = 'world_block_visibility';

export const blockVisibilityExtension: Extension = defineExtension(
  BLOCK_VISIBILITY_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      // Once, on the first row — beside the name and the pencil, which is
      // where a reader asking "what is this block" is already looking.
      if (block.getField(BLOCK_ACCESS_FIELD)) {
        return;
      }
      const eye = visibilityEye(SHARED, PRIVATE);
      block.inputList[0]?.appendField(eye.field, BLOCK_ACCESS_FIELD);
      eye.field.setTooltip(
        'Whether other files are offered this block. Shut the eye for ' +
          'something this kind does for itself.',
      );
      // The glyph has to follow the value however the value arrived —
      // clicked, or loaded from the file — so it is synced on every change
      // rather than only in the click.
      const sync = () => eye.sync();
      sync();
      block.setOnChange(sync);
    },
  },
);
