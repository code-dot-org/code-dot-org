// The `(import…)` row of a MAP dropdown, answered by the stock-map picker.
//
// `actorImportField`'s sibling: choosing the row opens the picker instead of
// storing the sentinel, and the field takes the imported map's path once the
// picker resolves.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_MAP_VALUE, requestMapImport} from '../../maps/mapImport';

export const MAP_IMPORT_FIELD_EXTENSION = 'world_map_import_field';

export const mapImportFieldExtension: Extension = defineExtension(
  MAP_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('MAP') as FieldDropdown | null;
      if (!field) {
        return;
      }
      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_MAP_VALUE) {
          return inner ? inner.call(this, value) : value;
        }
        void requestMapImport().then(path => {
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
