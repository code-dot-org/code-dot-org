
exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.turnBlack = function (id) {
  return Webapp.executeCmd(String(id), 'turnBlack');
};

exports.createHtmlBlock = function (blockId, elementId, html) {
  return Webapp.executeCmd(String(blockId),
                          'createHtmlBlock',
                          {'elementId': elementId,
                           'html': html });
};

exports.attachEventHandler = function (blockId, elementId, eventName, func) {
  return Webapp.executeCmd(String(blockId),
                          'attachEventHandler',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func });
};

