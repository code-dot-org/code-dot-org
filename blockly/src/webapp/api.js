
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

exports.createCanvas = function (blockId, elementId) {
  return Webapp.executeCmd(String(blockId),
                          'createCanvas',
                          {'elementId': elementId });
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

