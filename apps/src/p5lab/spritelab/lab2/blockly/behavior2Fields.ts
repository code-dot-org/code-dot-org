// The system dropdown, as a registered field type (SceneDropdown's idiom):
// options come from the live registry, so student-created systems appear
// without re-registering blocks.

import * as BlocklyCore from 'blockly/core';

import {getBehavior2Registry, getBehavior2System} from './behavior2Meta';

export const FIELD_SYSTEM_DROPDOWN_TYPE = 'field_spritelab2_system';

function systemMenuOptions(): [string, string][] {
  return getBehavior2Registry().map(system => [system.label, system.name]);
}

export class SystemDropdown extends BlocklyCore.FieldDropdown {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new SystemDropdown(systemMenuOptions);
  }

  // Keep the sibling UNIT label (the setting's noun: gravity, speed) in
  // step with the chosen system, where the block has one. A label field
  // updates instantly; a dropdown's displayed text would go stale.
  doValueUpdate_(newValue: string) {
    super.doValueUpdate_(newValue);
    const unit = this.getSourceBlock()?.getField('UNIT');
    if (unit) {
      unit.setValue(getBehavior2System(newValue).optionLabel);
    }
  }
}
