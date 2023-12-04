import _ from 'lodash';
import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

/**
 * Performs a case-insensitive comparison of two strings.
 * @param {string} str1 - First string.
 * @param {string} str2 - Second string.
 * @returns {number} - Returns -1, 0, or 1 depending on whether str1 is considered
 * less, equal to, or greater than str2, in a case-insensitive manner.
 */
export function caseInsensitiveCompare(str1, str2) {
  // Convert both strings to lowercase for case-insensitive comparison
  var lowerStr1 = str1.toLowerCase();
  var lowerStr2 = str2.toLowerCase();

  if (lowerStr1 < lowerStr2) {
    return -1; // str1 is less than str2
  }
  if (lowerStr1 > lowerStr2) {
    return 1; // str1 is greater than str2
  }
  return 0; // str1 is equal to str2
}

/**
 * Reads a boolean attribute from an XML element.
 * @param {Element} xmlElement - The XML element from which the attribute will be read.
 * @param {string} attribute - The name of the attribute to be read from the XML element.
 * @returns {boolean} True if the attribute value is exactly 'true', otherwise false.
 * If we ever need to return true for unset attributes, we can update this function.
 */
export function readBooleanAttribute(xmlElement, attribute) {
  const attributeValue = xmlElement.getAttribute(attribute);
  return attributeValue === 'true';
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseSoundPathString(text) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  if (!text.startsWith(SOUND_PREFIX) || !text.endsWith('.mp3')) {
    throw new Error('This is not a valid path to a sound file.');
  }
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    category = pathStringArray[2];
    // Example: 'category_board_games' becomes 'Board games: '
    category = category.replace('category_', '');
    category = category.replace(/_/g, ' ');
    category = capitalizeFirstLetter(category) + ': ';
  }
  // Example: 'card_dealing_multiple.mp3' becomes 'card_dealing_multiple'
  const soundName = pathStringArray[pathStringArray.length - 1].replace(
    '.mp3',
    ''
  );
  // Examples: 'Board games: card_dealing_multiple', 'default'
  const fieldText = `${category}${soundName}`;
  return fieldText;
}

/**
 * Converts a printer-style string range to an array of numbers
 * e.g., "1,2,4-6" becomes [1,2,4,5,6]
 * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
 * @returns  array of numbers
 */
export function printerStyleNumberRangeToList(rangeString) {
  const rangeStringNoSpaces = rangeString.replace(/ /g, '');
  const rangeItems = rangeStringNoSpaces.split(',');
  const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "4-6"
  const numberRegExp = /^(\d+)$/; // e.g., "1", "2"
  const fullNumberList = rangeItems.reduce((numberArray, currExp) => {
    const rangeResult = rangeRegExp.exec(currExp);
    const numberResult = numberRegExp.exec(currExp);
    if (rangeResult) {
      const lowerBound = Number(rangeResult[1]);
      const upperNonInclusiveBound = Number(rangeResult[2]) + 1;
      const rangeArray = _.range(lowerBound, upperNonInclusiveBound);
      numberArray = numberArray.concat(rangeArray);
    } else if (numberResult) {
      numberArray.push(Number(numberResult[1]));
    }
    return numberArray;
  }, []);
  return fullNumberList;
}

/**
 * Converts an array of numbers to a string of numbers separated by commas
 * e.g., [1,2,4,5,6] becomes "1,2,4,5,6", [5] becomes "5"
 * @param numberList array of numbers
 * @returns  numberString {string}
 */
export function numberListToString(numberList) {
  let numberString = numberList.reduce((str, curr) => {
    str = str + curr + ',';
    return str;
  }, '');
  if (numberList.length > 0) {
    numberString = numberString.slice(0, -1);
  }
  return numberString;
}
