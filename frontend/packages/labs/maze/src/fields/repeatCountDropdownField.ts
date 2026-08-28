import * as Blockly from 'blockly/core';

import {PluginType} from '@code-dot-org/blockly';
import type {FieldPlugin} from '@code-dot-org/blockly';

// A real Levelbuilder repeat-count dropdown carries a per-level `config`
// range attribute (e.g. "2-10", "1-20" — dashboard/config/levels/custom/maze,
// grepped) that the legacy CdoFieldDropdown read to build its option list.
// The ported XML->JSON conversion this package's toolbox/workspace loading
// goes through (@code-dot-org/blockly's xml/index.ts) only carries a field's
// value, not its other attributes, so that per-level range can't reach here.
// '2'-'10' covers the field's own common case (courseB_iceage_loops and most
// other maze repeat levels use "2-10") and the `doClassValidation_` override
// below covers the rest: any seeded value outside the list is added to it
// rather than silently snapping to the first option, which is what a plain
// FieldDropdown does with an out-of-list value.
const DEFAULT_OPTIONS: [string, string][] = Array.from({length: 9}, (_, i) => {
  const value = String(i + 2); // '2' .. '10'
  return [value, value];
});

export class RepeatCountDropdownField extends Blockly.FieldDropdown {
  constructor() {
    super(DEFAULT_OPTIONS);
  }

  static fromJson(): RepeatCountDropdownField {
    return new RepeatCountDropdownField();
  }

  // `newValue` arrives as a JS number, not a string, whenever it was loaded
  // through this package's XML->JSON conversion (packages/blockly/src/xml's
  // parseValue coerces numeric-looking field text to a number) — a plain
  // `===` against this class's string-typed options would then always
  // report "not found" and inject a NUMBER-typed option pair, which crashes
  // Blockly's own ARIA label computation downstream (it requires the
  // option's label to be a string). Coercing here keeps every option pair,
  // injected or original, uniformly string-typed.
  protected override doClassValidation_(newValue?: string): string | null {
    const value = newValue === undefined ? undefined : String(newValue);
    if (value !== undefined && /^\d+$/.test(value)) {
      const options = this.menuGenerator_;
      if (
        Array.isArray(options) &&
        !options.some(option => Array.isArray(option) && option[1] === value)
      ) {
        this.menuGenerator_ = [...options, [value, value]];
      }
    }
    return super.doClassValidation_(value);
  }
}

export const repeatCountDropdownFieldPlugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_repeat_count_dropdown',
  field: RepeatCountDropdownField,
};
