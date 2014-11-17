
exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed only for droplet:

exports.random = function (min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
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

