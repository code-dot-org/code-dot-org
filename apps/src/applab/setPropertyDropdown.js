// TODO - may want to rename file

var library = require('./designElements/library');
var ElementType = library.ElementType;

/**
 * For each element type, lists the valid properties we can set via setProperty.
 * Also maps each from the name used for setProperty (key) to the name used
 * internally by designMode.updateProperty (value)
 */
var settableProps = {};
// TODO - may later want to also have the type so that we can log errors if it doesnt match?
settableProps[ElementType.IMAGE] = {
  width: 'style-width',
  height: 'style-height',
  x: 'left',
  y: 'top',
  picture: 'picture',
  hidden: 'hidden'
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

function stripQuotes(str) {
  var match = str.match(/^['|"](.*)['|"]$/);
  if (match) {
    return match[1];
  }
  return str;
}

module.exports.getInternalPropertyName = function (element, property) {
  var elementType = library.getElementType(element);
  if (elementType) {
    return settableProps[elementType][property] || property;
  }
  return property;
};

// TODO - comment me
module.exports.setPropertyDropdown = function () {
  return function () {
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
