import {FieldGridDropdown} from '@blockly/field-grid-dropdown';
import * as Blockly from 'blockly/core';

import {PluginType} from '@/components/blockly/plugins';
import type {GlobalPlugin} from '@/components/blockly/plugins';

/**
 * Implements extra logic to style the image dropdown for sprite selection.
 *
 * Note: this class *does not* inherit from `FieldDropdown`.
 */
export class FieldSpriteDropdown extends FieldGridDropdown {
  constructor(menu: Blockly.MenuOption[], whiteBackground: boolean = true) {
    const initialOptions = menu;
    const numColumns = Math.min(
      initialOptions.length,
      Math.max(4, Math.floor(Math.sqrt(initialOptions.length))),
    );

    super(menu, undefined /* validator */, {
      columns: numColumns,
      primaryColour: whiteBackground ? '#ffffff' : undefined,
    });
  }

  setValue(value: string) {
    // We have an issue where we sometimes try to set the value to a quoted string
    value = value.replace(/^"/, '').replace(/"$/, '');
    super.setValue(value);
  }

  setOptions(options: Blockly.MenuOption[]) {
    const numColumns = Math.min(
      options.length,
      Math.max(4, Math.floor(Math.sqrt(options.length))),
    );

    (
      this as unknown as {
        menuGenerator_: Blockly.MenuOption[];
      }
    ).menuGenerator_ = options;

    this.setColumns(numColumns);
  }
}

export const plugin: GlobalPlugin = {
  type: PluginType.Global,
  initialize: () => {
    Blockly.fieldRegistry.register(
      'field_sprite_dropdown',
      FieldSpriteDropdown,
    );
  },
  uninitialize: () => {
    Blockly.fieldRegistry.unregister('field_sprite_dropdown');
  },
};

export default plugin;
