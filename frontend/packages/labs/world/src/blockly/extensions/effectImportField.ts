// Turns the `(import…)` row of an effect dropdown into an actual import.
//
// The row is not a value: choosing it means "go and fetch me one", and the
// field must end up holding whatever was fetched — or its previous value if the
// learner cancelled. So the validator REJECTS the sentinel (returning null
// leaves the field as it was) and kicks off the import, then writes the result
// back when the dialog resolves.
//
// This wraps whatever validator is already on the field rather than replacing
// it: `effectParamsInitExtension` installs one to rebuild the parameter sockets
// when the effect changes, and a field holds exactly one validator. Order
// matters — list this extension AFTER the params one on the block, so the
// params validator is the one being wrapped and still sees every real value,
// including the imported path.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_EFFECT_VALUE, requestEffectImport} from '../effectImport';

export const EFFECT_IMPORT_FIELD_EXTENSION = 'world_effect_import_field';

export const effectImportFieldExtension: Extension = defineExtension(
  EFFECT_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('EFFECT') as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_EFFECT_VALUE) {
          return inner ? inner.call(this, value) : value;
        }

        void requestEffectImport().then(path => {
          // Cancelled, or the editor went away while the dialog was open.
          if (!path || block.isDisposed()) {
            return;
          }
          // `setValue` runs this validator again, this time with a real path —
          // so the parameter sockets are rebuilt by the wrapped validator
          // exactly as if the learner had picked an existing effect.
          field.setValue(path);
        });

        // Reject the sentinel: the field keeps whatever it held while the
        // dialog is open, and is never left holding a value that is not an
        // effect.
        return null;
      });
    },
  },
);
