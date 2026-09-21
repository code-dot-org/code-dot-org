// Turns the `(import…)` row of the theme dropdown into an actual import.
//
// `effectImportField` with one field name changed, and the same reasoning: the
// row is not a value, so the validator REJECTS the sentinel — returning null
// leaves the field holding whatever it held — kicks off the import, and writes
// the result back when the dialog resolves.
//
// It wraps whatever validator is already on the field rather than replacing
// one, because a field holds exactly one. Nothing else installs one here
// today; it wraps anyway, so that the day something does, this does not
// silently eat it.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_STYLE_VALUE, requestStyleImport} from '../../styles/styleImport';

export const STYLE_IMPORT_FIELD_EXTENSION = 'world_style_import_field';

export const styleImportFieldExtension: Extension = defineExtension(
  STYLE_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('THEME') as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_STYLE_VALUE) {
          return inner ? inner.call(this, value) : value;
        }

        void requestStyleImport().then(path => {
          // Cancelled, or the editor went away while the dialog was open.
          if (!path || block.isDisposed()) {
            return;
          }
          field.setValue(path);
        });

        return null;
      });
    },
  },
);
