
exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for droplet and/or blockly (must include blockId):

exports.createHtmlBlock = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'createHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.replaceHtmlBlock = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'replaceHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteHtmlBlock = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'deleteHtmlBlock',
                          {'elementId': elementId });
};

exports.createButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'createButton',
                          {'elementId': elementId,
                           'text': text });
};

exports.createImage = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'createImage',
                          {'elementId': elementId,
                           'src': src });
};

exports.setPosition = function (blockId, elementId, left, top, width, height) {
  return Applab.executeCmd(blockId,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height });
};

exports.createCanvas = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.canvasDrawLine = function (blockId, elementId, x1, y1, x2, y2) {
  return Applab.executeCmd(blockId,
                          'canvasDrawLine',
                          {'elementId': elementId,
                           'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2 });
};

exports.canvasDrawCircle = function (blockId, elementId, x, y, radius) {
  return Applab.executeCmd(blockId,
                          'canvasDrawCircle',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'radius': radius });
};

exports.canvasDrawRect = function (blockId, elementId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasDrawRect',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasSetLineWidth = function (blockId, elementId, width) {
  return Applab.executeCmd(blockId,
                          'canvasSetLineWidth',
                          {'elementId': elementId,
                           'width': width });
};

exports.canvasSetStrokeColor = function (blockId, elementId, color) {
  return Applab.executeCmd(blockId,
                          'canvasSetStrokeColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasSetFillColor = function (blockId, elementId, color) {
  return Applab.executeCmd(blockId,
                          'canvasSetFillColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasClear = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'canvasClear',
                          {'elementId': elementId });
};

exports.canvasDrawImage = function (blockId, elementId, imageId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasDrawImage',
                          {'elementId': elementId,
                           'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasGetImageData = function (blockId, elementId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'canvasGetImageData',
                          {'elementId': elementId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height });
};

exports.canvasPutImageData = function (blockId, elementId, imageData, x, y) {
  return Applab.executeCmd(blockId,
                          'canvasPutImageData',
                          {'elementId': elementId,
                           'imageData': imageData,
                           'x': x,
                           'y': y });
};

exports.createTextInput = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'createTextInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.createTextLabel = function (blockId, elementId, text, forId) {
  return Applab.executeCmd(blockId,
                          'createTextLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId });
};

exports.createCheckbox = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'createCheckbox',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.createRadio = function (blockId, elementId, checked, name) {
  return Applab.executeCmd(blockId,
                          'createRadio',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name });
};

exports.getChecked = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getChecked',
                          {'elementId': elementId });
};

exports.setChecked = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked });
};

exports.createDropdown = function (blockId, elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 2);
  return Applab.executeCmd(blockId,
                          'createDropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray });
};

exports.getAttribute = function(blockId, elementId, attribute) {
  return Applab.executeCmd(blockId,
                           'getAttribute',
                           {elementId: elementId,
                            attribute: attribute});
};

exports.setAttribute = function(blockId, elementId, attribute, value) {
  return Applab.executeCmd(blockId,
                           'setAttribute',
                           {elementId: elementId,
                            attribute: attribute,
                            value: value});
};

exports.getText = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getText',
                          {'elementId': elementId });
};

exports.setText = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'setText',
                          {'elementId': elementId,
                           'text': text });
};

exports.getImageURL = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getImageURL',
                          {'elementId': elementId });
};

exports.setImageURL = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src });
};

exports.createImageUploadButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                           'createImageUploadButton',
                           {'elementId': elementId,
                            'text': text });
};

exports.setParent = function (blockId, elementId, parentId) {
  return Applab.executeCmd(blockId,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId });
};

exports.setStyle = function (blockId, elementId, style) {
  return Applab.executeCmd(blockId,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style });
};

exports.onEvent = function (blockId, elementId, eventName, func) {
  return Applab.executeCmd(blockId,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func });
};

exports.startWebRequest = function (blockId, url, func) {
  return Applab.executeCmd(blockId,
                          'startWebRequest',
                          {'url': url,
                           'func': func });
};

exports.setTimeout = function (blockId, func, milliseconds) {
  return Applab.executeCmd(blockId,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds });
};

exports.clearTimeout = function (blockId, timeoutId) {
  return Applab.executeCmd(blockId,
                           'clearTimeout',
                           {'timeoutId': timeoutId });
};

exports.createSharedRecord = function (blockId, record, callback) {
  return Applab.executeCmd(blockId,
                          'createSharedRecord',
                          {'record': record,
                           'callback': callback });
};

exports.readSharedRecords = function (blockId, searchParams, callback) {
  return Applab.executeCmd(blockId,
                          'readSharedRecords',
                          {'searchParams': searchParams,
                           'callback': callback });
};

exports.updateSharedRecord = function (blockId, record, callback) {
  return Applab.executeCmd(blockId,
                          'updateSharedRecord',
                          {'record': record,
                           'callback': callback });
};

exports.deleteSharedRecord = function (blockId, record, callback) {
  return Applab.executeCmd(blockId,
                          'deleteSharedRecord',
                          {'record': record,
                           'callback': callback });
};
