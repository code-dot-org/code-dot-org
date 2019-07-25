// APIs needed for App Lab, that run as interpreted "polyfills"

function insertItem(array, index, item) {
  array.splice(index, 0, item);
}

function appendItem(array, item) {
  array.push(item);
}

function removeItem(array, index) {
  array.splice(array, index, 1);
}

if (typeof module !== 'undefined') {
  module.exports = {
    insertItem: insertItem,
    appendItem: appendItem,
    removeItem: removeItem
  };
}
