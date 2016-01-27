// TODO - may want to rename file

var library = require('./designElements/library');
var ElementType = library.ElementType;

/**
 * For each element type, lists the valid properties we can set via setProperty.
 * Also maps each from the name used for setProperty to the name used
 * internally by designMode.updateProperty, and the expected type
 */
var settableProps = {};
settableProps[ElementType.IMAGE] = {
  width: { name: 'style-width', type: 'number'},
  height: { name: 'style-height', type: 'number' },
  x: { name: 'left', type: 'number' },
  y: { name: 'top', type: 'number' },
  picture: { name: 'picture', type: 'string' },
  hidden: { name: 'hidden', type: 'boolean' },
};

// May belong in droplet, should possibly be cleaner
function getValueOfNthParam(block, n) {
  var token = block.start;
  do {
    if (token.type === 'socketStart') {
      if (n === 0) {
        var textToken = token.next;
        if (textToken.type !== 'text') {
          throw new Error('unexpected');
        }
        return textToken.value;
      }
      n--;
    }
    token = token.next;
  } while(token);
  return null;
}

/**
 * Given a string like <"asdf"> strips quotes and returns <asdf>
 */
function stripQuotes(str) {
  var match = str.match(/^['|"](.*)['|"]$/);
  if (match) {
    return match[1];
  }
  return str;
}

/**
 * Given an element and a friendly name for that element, returns an object
 * containing the internal equivalent for that friendly name, or undefined
 * if we don't have info for this element/property.
 */
module.exports.getInternalPropertyInfo = function (element, property) {
  var elementType = library.getElementType(element);
  var info;
  if (elementType) {
    info = settableProps[elementType][property];
  }
  return info;
};

/**
 * @returns {function} Gets the value of the first param for this block, gets
 *   the element that it refers to, and then enumerates a list of possible
 *   properties that can be set on this element. If it can't determine element
 *   types, provides full list of properties across all types.
 */
module.exports.setPropertyDropdown = function () {
  return function () {
    // Note: We depend on "this" being the droplet socket.
    var param1 = getValueOfNthParam(this.parent, 0);

    // TODO
    var allProps = ['allProps'];

    var elementId = stripQuotes(param1);
    var element = document.querySelector("#divApplab #" + elementId);
    if (!element) {
      return allProps;
    }

    var elementType = library.getElementType(element);
    if (!elementType) {
      return allProps;
    }

    var keys = Object.keys(settableProps[elementType]);
    if (!keys) {
      return allProps;
    }

    return keys.map(function (key) { return '"' + key + '"'; });
  };
};
