// The `config` attribute an XML toolbox may put on a dropdown field, which
// narrows its options. Ported from apps' blockly/addons/cdoFieldDropdown.ts.

import {
  numberListToString,
  printerStyleNumberRangeToList,
} from './numberRanges';

type CustomMenuOption = [string, string];

/** The language-neutral value, unquoted and lowercased, e.g. "GIRAFFE" as giraffe. */
function toHumanReadableString(text: string) {
  return text.replace(/['"]+/g, '').toLowerCase();
}

/**
 * Converts an array of option arrays to a map from value to label, e.g.
 * [['first item', 'ITEM1']] to {ITEM1: 'first item'}.
 */
export function arrayToMap(optionsArray: CustomMenuOption[] | undefined) {
  return Array.isArray(optionsArray)
    ? optionsArray.reduce((optionsMap: {[key: string]: string}, curr) => {
        optionsMap[curr[1]] = curr[0];
        return optionsMap;
      }, {})
    : {};
}

/**
 * The options a `config` attribute names: a printer-style number range such
 * as "1,6-9", or a comma-separated list of values, never both. A value the
 * field already offers keeps its label.
 */
export function getUpdatedOptionsFromConfig(
  config: string,
  existingOptionsMap: {[key: string]: string},
): CustomMenuOption[] {
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
