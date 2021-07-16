/* Generic helper functions. */

export function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

export function isEmpty(object) {
  return Object.keys(object).length === 0;
}

export function areArraysEqual(array1, array2) {
  return (
    array1.length === array2.length &&
    array1.every((value, index) => {
      return value === array2[index];
    })
  );
}

export function arrayIntersection(array1, array2) {
  return array1.filter(value => array2.includes(value));
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
