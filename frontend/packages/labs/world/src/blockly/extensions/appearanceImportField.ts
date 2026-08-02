// Turns the `(import…)` row of a sprite or animation dropdown into an import.
//
// The same shape as `ruleImportField`, and the same reasoning: the row is not a
// value. Choosing it means "go and fetch me one", so the validator REJECTS the
// sentinel — returning null leaves the field as it was — and kicks off the
// import, writing the result back when the picker resolves.
//
// Wraps whatever validator is already on the field rather than replacing it,
// since a field holds exactly one; list this extension AFTER any other that
// installs one.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {
  IMPORT_ANIMATION_VALUE,
  IMPORT_SPRITE_VALUE,
  requestAppearanceImport,
  type AppearanceKind,
} from '../../appearance/appearanceImport';

const KINDS: ReadonlyArray<{
  extension: string;
  field: string;
  sentinel: string;
  kind: AppearanceKind;
}> = [
  {
    extension: 'world_sprite_import_field',
    field: 'SPRITE',
    sentinel: IMPORT_SPRITE_VALUE,
    kind: 'sprite',
  },
  {
    extension: 'world_animation_import_field',
    field: 'ANIMATION',
    sentinel: IMPORT_ANIMATION_VALUE,
    kind: 'animation',
  },
];

const importField = ({
  extension,
  field: fieldName,
  sentinel,
  kind,
}: (typeof KINDS)[number]): Extension =>
  defineExtension(extension, {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField(fieldName) as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== sentinel) {
          return inner ? inner.call(this, value) : value;
        }

        void requestAppearanceImport(kind).then(imported => {
          // Cancelled, or the editor went away while the picker was open.
          if (!imported || block.isDisposed()) {
            return;
          }
          field.setValue(imported);
        });

        // Reject the sentinel: the field keeps whatever it held while the
        // picker is open, and is never left holding a row that is not a value.
        return null;
      });
    },
  });

export const [spriteImportFieldExtension, animationImportFieldExtension] =
  KINDS.map(importField);
