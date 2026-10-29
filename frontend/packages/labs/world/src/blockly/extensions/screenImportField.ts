// The `(import…)` row of a SCREEN dropdown, answered by the stock-screen
// picker.
//
// `actorImportField`'s sibling: choosing the row opens the picker instead of
// storing the sentinel, and the field takes the imported screen's path once
// the picker resolves.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {
  IMPORT_SCREEN_VALUE,
  requestScreenImport,
} from '../../maps/screenImport';

export const SCREEN_IMPORT_FIELD_EXTENSION = 'world_screen_import_field';

export const screenImportFieldExtension: Extension = defineExtension(
  SCREEN_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('SCREEN') as FieldDropdown | null;
      if (!field) {
        return;
      }
      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_SCREEN_VALUE) {
          return inner ? inner.call(this, value) : value;
        }
        void requestScreenImport().then(path => {
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
