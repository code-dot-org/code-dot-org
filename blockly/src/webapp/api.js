
exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for droplet and/or blockly (must include blockId):

exports.createHtmlBlock = function (blockId, elementId, html) {
  return Webapp.executeCmd(blockId,
                          'createHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.replaceHtmlBlock = function (blockId, elementId, html) {
  return Webapp.executeCmd(blockId,
                          'replaceHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteHtmlBlock = function (blockId, elementId) {
  return Webapp.executeCmd(blockId,
                          'deleteHtmlBlock',
                          {'elementId': elementId });
};

exports.createButton = function (blockId, elementId, text) {
  return Webapp.executeCmd(blockId,
                          'createButton',
                          {'elementId': elementId,
                           'text': text });
};

exports.createImage = function (blockId, elementId, src) {
  return Webapp.executeCmd(blockId,
                          'createImage',
                          {'elementId': elementId,
                           'src': src });
};

exports.setPosition = function (blockId, elementId, left, top, width, height) {
  return Webapp.executeCmd(blockId,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height });
};

exports.createCanvas = function (blockId, elementId, width, height) {
  return Webapp.executeCmd(blockId,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.canvasDrawLine = function (blockId, elementId, x1, y1, x2, y2) {
  return Webapp.executeCmd(blockId,
                          'canvasDrawLine',
                          {'elementId': elementId,
                           'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2 });
};

exports.canvasDrawCircle = function (blockId, elementId, x, y, radius) {
  return Webapp.executeCmd(blockId,
                          'canvasDrawCircle',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'radius': radius });
};

exports.canvasDrawRect = function (blockId, elementId, x, y, width, height) {
  return Webapp.executeCmd(blockId,
                          'canvasDrawRect',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasSetLineWidth = function (blockId, elementId, width) {
  return Webapp.executeCmd(blockId,
                          'canvasSetLineWidth',
                          {'elementId': elementId,
                           'width': width });
};

exports.canvasSetStrokeColor = function (blockId, elementId, color) {
  return Webapp.executeCmd(blockId,
                          'canvasSetStrokeColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasSetFillColor = function (blockId, elementId, color) {
  return Webapp.executeCmd(blockId,
                          'canvasSetFillColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasClear = function (blockId, elementId) {
  return Webapp.executeCmd(blockId,
                          'canvasClear',
                          {'elementId': elementId });
};

exports.createTextInput = function (blockId, elementId, text) {
  return Webapp.executeCmd(blockId,
                          'createTextInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.createTextLabel = function (blockId, elementId, text, forId) {
  return Webapp.executeCmd(blockId,
                          'createTextLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId });
};

exports.createCheckbox = function (blockId, elementId, checked) {
  return Webapp.executeCmd(blockId,
                          'createCheckbox',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.createRadio = function (blockId, elementId, checked, name) {
  return Webapp.executeCmd(blockId,
                          'createRadio',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name });
};

exports.getChecked = function (blockId, elementId) {
  return Webapp.executeCmd(blockId,
                          'getChecked',
                          {'elementId': elementId });
};

exports.setChecked = function (blockId, elementId, checked) {
  return Webapp.executeCmd(blockId,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.createDropdown = function (blockId, elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 2);
  return Webapp.executeCmd(blockId,
                          'createDropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray });
};

exports.getText = function (blockId, elementId) {
  return Webapp.executeCmd(blockId,
                          'getText',
                          {'elementId': elementId });
};

exports.setText = function (blockId, elementId, text) {
  return Webapp.executeCmd(blockId,
                          'setText',
                          {'elementId': elementId,
                           'text': text });
};

exports.setImageURL = function (blockId, elementId, src) {
  return Webapp.executeCmd(blockId,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src });
};

exports.setParent = function (blockId, elementId, parentId) {
  return Webapp.executeCmd(blockId,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId });
};

exports.setStyle = function (blockId, elementId, style) {
  return Webapp.executeCmd(blockId,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style });
};

exports.attachEventHandler = function (blockId, elementId, eventName, func) {
  return Webapp.executeCmd(blockId,
                          'attachEventHandler',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func });
};

exports.startWebRequest = function (blockId, url, func) {
  return Webapp.executeCmd(blockId,
                          'startWebRequest',
                          {'url': url,
                           'func': func });
};

exports.setTimeout = function (blockId, func, milliseconds) {
  return Webapp.executeCmd(blockId,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearTimeout = function (blockId, timeoutId) {
  return Webapp.executeCmd(blockId,
                           'clearTimeout',
                           {'timeoutId': timeoutId });
};

