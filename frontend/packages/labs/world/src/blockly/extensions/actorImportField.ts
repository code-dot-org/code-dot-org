// Turns the `(import…)` row of an ACTOR dropdown into an actual import.
//
// `ruleImportField` with one word changed, and the same reasoning: the row is
// not a value, so the validator REJECTS the sentinel — which leaves the field
// holding whatever it held — and writes the imported path back when the dialog
// resolves.
//
// Bound by field NAME because the two blocks that want it disagree: `add actor`
// and `create in map` both call it ACTOR, and that is the only one an actor
// dropdown offering an import ever is.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_ACTOR_VALUE, requestActorImport} from '../../actors/actorImport';

export const ACTOR_IMPORT_FIELD_EXTENSION = 'world_actor_import_field';

export const actorImportFieldExtension: Extension = defineExtension(
  ACTOR_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('ACTOR') as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_ACTOR_VALUE) {
          return inner ? inner.call(this, value) : value;
        }

        void requestActorImport().then(path => {
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
