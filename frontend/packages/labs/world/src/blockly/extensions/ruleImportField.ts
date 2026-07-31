// Turns the `(import…)` row of a `use rule` dropdown into an actual import.
//
// The row is not a value: choosing it means "go and fetch me one", and the
// field must end up holding whatever was fetched — or its previous value if the
// learner cancelled. So the validator REJECTS the sentinel (returning null
// leaves the field as it was) and kicks off the import, writing the result back
// when the dialog resolves.
//
// Wraps whatever validator is already on the field rather than replacing it,
// since a field holds exactly one; list this extension AFTER any other that
// installs one.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_RULE_VALUE, requestRuleImport} from '../ruleImport';

export const RULE_IMPORT_FIELD_EXTENSION = 'world_rule_import_field';

export const ruleImportFieldExtension: Extension = defineExtension(
  RULE_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField('RULE') as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_RULE_VALUE) {
          return inner ? inner.call(this, value) : value;
        }

        void requestRuleImport().then(path => {
          // Cancelled, or the editor went away while the dialog was open.
          if (!path || block.isDisposed()) {
            return;
          }
          field.setValue(path);
        });

        // Reject the sentinel: the field keeps whatever it held while the
        // dialog is open, and is never left holding a value that is not a rule.
        return null;
      });
    },
  },
);
