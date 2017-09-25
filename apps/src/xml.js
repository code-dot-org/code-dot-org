// Serializes an XML DOM node to a string.
exports.serialize = function (node) {
  var serializer = new XMLSerializer();
  return serializer.serializeToString(node);
};

/**
 * Parses a single root element string, wrapping it in an <xml/> element.
 * @param {string} text
 * @return {Element}
 */
exports.parseElement = function (text) {
  var parser = new DOMParser();
  text = text.trim();
  var dom = text.indexOf('<xml') === 0 ?
      parser.parseFromString(text, 'text/xml') :
      parser.parseFromString('<xml>' + text + '</xml>', 'text/xml');
  var errors = dom.getElementsByTagName("parsererror");
  var element = dom.firstChild;
  if (!element) {
    throw new Error('Nothing parsed');
  }
  if (errors.length > 0) {
    throw new Error(exports.serialize(errors[0]));
  }
  if (element !== dom.lastChild) {
    throw new Error('Parsed multiple elements');
  }
  return element;
};

// Apply a function to a node and all of its descendants
exports.visitAll = function (node, callback) {
  callback(node);
  for (let child of node.childNodes) {
    exports.visitAll(child, callback);
  }
};
