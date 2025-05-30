import * as Blockly from 'blockly/core';

import {PluginType} from '../../plugins';
import type {GlobalPlugin} from '../../plugins';

import {FieldButton, FieldButtonOptions} from './fieldButton';

/** SVG element namespace */
const SVG_NS = 'http://www.w3.org/2000/svg';

const APP_HEIGHT = 400;

/**
 * Implements a (x,y) coordinate value with a picker widget that allows
 * interacting with the playfield.
 */
export class FieldLocation extends FieldButton {
  static fromJson(options: FieldButtonOptions) {
    const icon = document.createElementNS(SVG_NS, 'tspan');
    icon.style.fontFamily = 'FontAwesome';
    icon.textContent = ' \uf276'; // map-pin

    const button = FieldButton.fromJson({
      ...options,
      icon,
      onClick: () => {
        button.setValue(JSON.stringify({x: 300, y: 300}));
      },
      transformText: (value: string) => {
        console.log('value', value);
        if (value) {
          try {
            const loc = JSON.parse(value);
            return `(${loc.x}, ${APP_HEIGHT - loc.y})`;
          } catch (_) {
            // Just ignore bad values
          }
        }
        return '';
      },
    });

    return button;
  }
}

export const plugin: GlobalPlugin = {
  type: PluginType.Global,
  initialize: () => {
    Blockly.fieldRegistry.register('field_location', FieldLocation);
  },
  uninitialize: () => {
    Blockly.fieldRegistry.unregister('field_location');
  },
};

export default plugin;
