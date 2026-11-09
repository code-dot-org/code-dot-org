// Apps' CdoFieldDropdown: a dropdown whose options an XML `config` attribute
// may narrow, and which accepts the '???' placeholder a level leaves unset.
import * as Blockly from 'blockly/core';

import {PluginType} from '../../plugins';
import type {FieldPlugin} from '../../plugins';

import {
  numberListToString,
  printerStyleNumberRangeToList,
} from './numberRanges';

export {numberListToString, printerStyleNumberRangeToList};

/** The value of a dropdown a level author left unset. */
export const EMPTY_OPTION = '???';

export type CdoMenuOption = [string, string];

export type CdoMenuGenerator = CdoMenuOption[] | Blockly.MenuGeneratorFunction;

/** The language-neutral value, unquoted and lowercased: "GIRAFFE" as giraffe. */
function toHumanReadableString(text: string): string {
  return text.replace(/['"]+/g, '').toLowerCase();
}

/**
 * A map from value to label, e.g. [['first item', 'ITEM1']] as
 * {ITEM1: 'first item'}. A generator function gives an empty map.
 */
export function arrayToMap(
  optionsArray: CdoMenuGenerator | Blockly.MenuGenerator | undefined,
): {[value: string]: string} {
  if (!Array.isArray(optionsArray)) {
    return {};
  }
  const map: {[value: string]: string} = {};
  for (const option of optionsArray) {
    if (Array.isArray(option) && typeof option[0] === 'string') {
      map[option[1]] = option[0];
    }
  }
  return map;
}

/**
 * The options a `config` attribute names: a printer-style number range such
 * as "1,6-9", or a comma-separated list of values, never both. A value the
 * field already offers keeps its label.
 */
export function getUpdatedOptionsFromConfig(
  config: string,
  existingOptionsMap: {[value: string]: string},
): CdoMenuOption[] {
  const numberList = printerStyleNumberRangeToList(config);
  const options =
    numberList.length > 0 ? numberListToString(numberList) : config;
  return options.split(',').map(val => {
    val = val.trim();
    return existingOptionsMap[val]
      ? [existingOptionsMap[val], val]
      : [toHumanReadableString(val), val];
  });
}

export class CdoFieldDropdown extends Blockly.FieldDropdown {
  private config: string | null = null;

  constructor(
    menuGenerator?: CdoMenuGenerator,
    validator?: Blockly.FieldDropdownValidator,
    config?: Blockly.FieldDropdownConfig,
  ) {
    // A block may leave its options to the `config` attribute.
    super(menuGenerator ?? [['', '']], validator, config);
  }

  static fromJson(
    options: Blockly.FieldDropdownFromJsonConfig,
  ): CdoFieldDropdown {
    return new CdoFieldDropdown(
      options.options as CdoMenuGenerator | undefined,
      undefined,
      options,
    );
  }

  /** Also accepts '???', and a value the options hold only in quotes. */
  protected override doClassValidation_(newValue: string): string | null {
    if (newValue === EMPTY_OPTION) {
      return newValue;
    }
    for (const option of this.getOptions(true)) {
      if (option[1] === newValue) {
        return newValue;
      }
      if (option[1] === `"${newValue}"`) {
        return `"${newValue}"`;
      }
    }
    const sourceBlock = this.getSourceBlock();
    if (sourceBlock) {
      console.warn(
        "Cannot set the dropdown's value to an unavailable option." +
          ` Block type: ${sourceBlock.type}, Field name: ${this.name},` +
          ` Value: ${newValue}`,
      );
    }
    return null;
  }

  protected override doValueUpdate_(newValue: string): void {
    if (newValue !== EMPTY_OPTION) {
      super.doValueUpdate_(newValue);
      return;
    }
    this.value_ = newValue;
    this.isDirty_ = true;
    // FieldDropdown keeps the shown option private; no option holds '???'.
    (this as unknown as {selectedOption: CdoMenuOption}).selectedOption = [
      EMPTY_OPTION,
      '',
    ];
  }

  /**
   * Blockly saves this field as its XML string, because it overrides toXml;
   * saved content holds either that or a plain value.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override loadState(state: any): void {
    if (typeof state === 'string' && /<field/.test(state)) {
      this.fromXml(Blockly.utils.xml.textToDom(state));
      return;
    }
    if (this.isOptionListDynamic()) {
      this.getOptions(false);
    }
    this.setValue(state);
  }

  override fromXml(element: Element): void {
    this.config = element.getAttribute('config');
    if (this.config) {
      this.menuGenerator_ = getUpdatedOptionsFromConfig(
        this.config,
        arrayToMap(this.menuGenerator_),
      );
    }
    super.fromXml(element);
  }

  override toXml(element: Element): Element {
    if (this.config) {
      element.setAttribute('config', this.config);
    }
    super.toXml(element);
    return element;
  }
}

export const plugin: FieldPlugin = {
  type: PluginType.Field,
  name: 'field_cdo_dropdown',
  field: CdoFieldDropdown,
};

export default plugin;
