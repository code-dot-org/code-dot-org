import * as Blockly from 'blockly/core';

import type {Extension} from '@code-dot-org/blockly-workspace';
import {defineExtension} from '@code-dot-org/blockly-workspace';

import {
  FIELD_EFFECTS_EXTENSION,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  DEFAULT_EFFECT_VALUE,
  FIELD_EFFECTS_VALUE_OPTIONS,
} from '../constants';

/**
 * Ensures that sound blocks also have a valid value, even if a level's library or song
 * pack has changed.
 */
export const fieldEffectsExtension: Extension = defineExtension(
  FIELD_EFFECTS_EXTENSION,
  {
    extension() {
      // Set the initial state when the block gets created
      // Use arrow function to capture outer `this` (the block instance)
      const valuesDropdown = new Blockly.FieldDropdown(
        (): Blockly.MenuOption[] => {
          return FIELD_EFFECTS_VALUE_OPTIONS[
            this.getFieldValue(
              FIELD_EFFECTS_NAME,
            ) as keyof typeof FIELD_EFFECTS_VALUE_OPTIONS
          ] as unknown as Blockly.MenuOption[];
        },
      );

      valuesDropdown.setValue(DEFAULT_EFFECT_VALUE);
      this.getInput(FIELD_EFFECTS_VALUE)?.appendField(
        valuesDropdown,
        FIELD_EFFECTS_VALUE,
      );

      // Set up handler to update the effect value when the effect name changes
      const fieldEffectsName = this.getField(
        FIELD_EFFECTS_NAME,
      ) as Blockly.FieldDropdown | null;

      if (!fieldEffectsName) {
        return;
      }

      // Override the default onItemSelected_ handler
      // @ts-expect-error -- Accessing protected property to override default behavior
      const baseHandler = fieldEffectsName.onItemSelected_;
      // @ts-expect-error -- Accessing protected property to override default behavior
      fieldEffectsName.onItemSelected_ = (
        menu: Blockly.Menu,
        menuItem: Blockly.MenuItem,
      ) => {
        // Update the effect value dropdown's options to match the newly selected effect
        // @ts-expect-error -- Accessing private property opt_value on MenuItem
        const selectedEffectName = menuItem.opt_value as string;
        const effectValueField = this.getField(
          FIELD_EFFECTS_VALUE,
        ) as Blockly.FieldDropdown | null;

        if (effectValueField) {
          // @ts-expect-error -- Accessing protected property to update menu options dynamically
          effectValueField.menuGenerator_ = FIELD_EFFECTS_VALUE_OPTIONS[
            selectedEffectName as keyof typeof FIELD_EFFECTS_VALUE_OPTIONS
          ] as unknown as Blockly.MenuOption[];
          effectValueField.setValue(DEFAULT_EFFECT_VALUE);
        }

        baseHandler.call(fieldEffectsName, menu, menuItem);
      };
    },
  },
);
