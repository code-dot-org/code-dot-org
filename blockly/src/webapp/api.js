
exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for droplet and/or blockly (must include blockId):

exports.createHtmlBlock = function (blockId, elementId, html) {
  return Webapp.executeCmd(String(blockId),
                          'createHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.replaceHtmlBlock = function (blockId, elementId, html) {
  return Webapp.executeCmd(String(blockId),
                          'replaceHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.deleteHtmlBlock = function (blockId, elementId) {
  return Webapp.executeCmd(String(blockId),
                          'deleteHtmlBlock',
                          {'elementId': elementId });
};

exports.createButton = function (blockId, elementId, text) {
  return Webapp.executeCmd(String(blockId),
                          'createButton',
                          {'elementId': elementId,
                           'text': text });
};

exports.setPosition = function (blockId, elementId, left, top, width, height) {
  return Webapp.executeCmd(String(blockId),
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height });
};

exports.createCanvas = function (blockId, elementId, width, height) {
  return Webapp.executeCmd(String(blockId),
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height });
};

exports.canvasDrawLine = function (blockId, elementId, x1, y1, x2, y2) {
  return Webapp.executeCmd(String(blockId),
                          'canvasDrawLine',
                          {'elementId': elementId,
                           'x1': Number(x1),
                           'y1': Number(y1),
                           'x2': Number(x2),
                           'y2': Number(y2) });
};

exports.canvasDrawCircle = function (blockId, elementId, x, y, radius) {
  return Webapp.executeCmd(String(blockId),
                          'canvasDrawCircle',
                          {'elementId': elementId,
                           'x': Number(x),
                           'y': Number(y),
                           'radius': Number(radius) });
};

exports.canvasSetLineWidth = function (blockId, elementId, width) {
  return Webapp.executeCmd(String(blockId),
                          'canvasSetLineWidth',
                          {'elementId': elementId,
                           'width': Number(width) });
};

exports.canvasSetStrokeColor = function (blockId, elementId, color) {
  return Webapp.executeCmd(String(blockId),
                          'canvasSetStrokeColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasSetFillColor = function (blockId, elementId, color) {
  return Webapp.executeCmd(String(blockId),
                          'canvasSetFillColor',
                          {'elementId': elementId,
                           'color': color });
};

exports.canvasClear = function (blockId, elementId) {
  return Webapp.executeCmd(String(blockId),
                          'canvasClear',
                          {'elementId': elementId });
};

exports.createTextInput = function (blockId, elementId, text) {
  return Webapp.executeCmd(String(blockId),
                          'createTextInput',
                          {'elementId': elementId,
                           'text': text });
};

exports.createTextLabel = function (blockId, elementId, text) {
  return Webapp.executeCmd(String(blockId),
                          'createTextLabel',
                          {'elementId': elementId,
                           'text': text });
};

exports.getText = function (blockId, elementId) {
  return Webapp.executeCmd(String(blockId),
                          'getText',
                          {'elementId': elementId });
};

exports.setText = function (blockId, elementId, text) {
  return Webapp.executeCmd(String(blockId),
                          'setText',
                          {'elementId': elementId,
                           'text': text });
};

exports.setParent = function (blockId, elementId, parentId) {
  return Webapp.executeCmd(String(blockId),
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId });
};

exports.setStyle = function (blockId, elementId, style) {
  return Webapp.executeCmd(String(blockId),
                           'setStyle',
                           {'elementId': elementId,
                           'style': style });
};

exports.attachEventHandler = function (blockId, elementId, eventName, func) {
  return Webapp.executeCmd(String(blockId),
                          'attachEventHandler',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func });
};

exports.startWebRequest = function (blockId, url, func) {
  return Webapp.executeCmd(String(blockId),
                          'startWebRequest',
                          {'url': url,
                           'func': func });
};
