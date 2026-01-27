import _ from 'lodash';

/**
 * Converts a printer-style string range to an array of numbers
 * e.g., "1,2,4-6" becomes [1,2,4,5,6]
 * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
 * @returns  array of numbers
 */
export function printerStyleNumberRangeToList(rangeString: string) {
  const rangeStringNoSpaces = rangeString.replace(/ /g, '');
  const rangeItems = rangeStringNoSpaces.split(',');
  const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "4-6"
  const numberRegExp = /^(\d+)$/; // e.g., "1", "2"
  const fullNumberList = rangeItems.reduce<number[]>((numberArray, currExp) => {
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
export function numberListToString(numberList: number[]) {
  let numberString = numberList.reduce<string>((str, curr) => {
    str = str + curr + ',';
    return str;
  }, '');
  if (numberList.length > 0) {
    numberString = numberString.slice(0, -1);
  }
  return numberString;
}
