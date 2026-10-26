// Clicking a `set sprite` field opens the picture picker, not a menu.
//
// The field stays a dropdown — that is what validates and serializes its value,
// and what turns `coinSpin.png#3` into a readable label — but its editor is
// replaced: pressing it asks the lab to run the picker flow (blockly/spritePick)
// and takes whatever comes back.
//
// Falls back to the ordinary menu when nothing has registered a handler, so a
// workspace outside the lab (a test, a thumbnail) still works.

import type {Block} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {canPickSprite, requestSpritePick} from '../spritePick';

export const SPRITE_PICK_EXTENSION = 'world_sprite_pick';

/** Replace a SPRITE dropdown's editor with the lab's picker. */
export const spritePickExtension: Extension = defineExtension(
  SPRITE_PICK_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('SPRITE') as Blockly.FieldDropdown | null;
      if (!field) {
        return;
      }
      // `showEditor_` is protected — Blockly's own way of saying "a field
      // decides how it is edited". That is exactly what is being changed, and
      // from outside the class, so the cast is the honest way to say so.
      const editable = field as unknown as {
        showEditor_: (event?: MouseEvent) => void;
      };
      const menu = editable.showEditor_.bind(field);
      editable.showEditor_ = (event?: MouseEvent) => {
        if (!canPickSprite()) {
          menu(event);
          return;
        }
        void requestSpritePick(String(field.getValue() ?? '')).then(chosen => {
          if (chosen !== undefined && field.getSourceBlock()) {
            field.setValue(chosen);
          }
        });
      };
    },
  },
);
