// Turns the `(import…)` row of a sound dropdown into an import.
//
// `appearanceImportField`'s sibling, and the same reasoning: the row is not a
// value. Choosing it means "go and fetch me one", so the validator REJECTS the
// sentinel — returning null leaves the field as it was — and kicks off the
// import, writing the result back when the library resolves.
//
// Wraps whatever validator is already on the field rather than replacing it,
// since a field holds exactly one; list this extension AFTER any other that
// installs one.

import type {Block, FieldDropdown} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {IMPORT_SOUND_VALUE, requestSoundImport} from '../../sound/soundImport';

export const SOUND_IMPORT_FIELD_EXTENSION = 'world_sound_import_field';

/** The field both sound blocks name their sound in. */
const SOUND_FIELD = 'SOUND';

export const soundImportFieldExtension: Extension = defineExtension(
  SOUND_IMPORT_FIELD_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      const field = block.getField(SOUND_FIELD) as FieldDropdown | null;
      if (!field) {
        return;
      }

      const inner = field.getValidator();
      field.setValidator(function (this: unknown, value: string) {
        if (value !== IMPORT_SOUND_VALUE) {
          return inner ? inner.call(this, value) : value;
        }

        void requestSoundImport().then(imported => {
          // Cancelled, or the editor went away while the library was open.
          if (!imported || block.isDisposed()) {
            return;
          }
          // Rebuild the option list before the value lands, so the field
          // cannot end up right in the generated code and wrong on the block.
          //
          // BELT AND BRACES on today's fields, not load-bearing: every dropdown
          // with an `(import…)` row is bound by `bindLiveOptions`, which
          // replaces `getOptions` with a call to the registry and takes no
          // `useCache` argument at all — there is no cache left to rebuild
          // (`liveDropdowns.test`). The three sibling extensions omit this and
          // are not broken. It stays because it is correct for a field that is
          // NOT live-bound, and costs one registry read for one that is.
          field.getOptions(false);
          field.setValue(imported);
        });
        return null;
      });
    },
  },
);
