
exports.randomFromArray = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

// APIs needed for blockly (must include blockId) (keep in sync with api.js):

exports.container = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'container',
                          {'elementId': elementId,
                           'html': html});
};

exports.write = function (blockId, html) {
  return Applab.executeCmd(blockId,
                          'write',
                          {'html': html});
};

exports.innerHTML = function (blockId, elementId, html) {
  return Applab.executeCmd(blockId,
                          'innerHTML',
                          {'elementId': elementId,
                           'html': html});
};

exports.deleteElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'deleteElement',
                          {'elementId': elementId});
};

exports.showElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'showElement',
                          {'elementId': elementId});
};

exports.hideElement = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'hideElement',
                          {'elementId': elementId});
};

exports.setScreen = function (blockId, screenId) {
  return Applab.executeCmd(blockId,
                          'setScreen',
                          {'screenId': screenId});
};

exports.button = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'button',
                          {'elementId': elementId,
                           'text': text});
};

exports.image = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'image',
                          {'elementId': elementId,
                           'src': src});
};

exports.setPosition = function (blockId, elementId, left, top, width, height) {
  return Applab.executeCmd(blockId,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height});
};

exports.setSize = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'setSize',
                          {'elementId': elementId,
                           'width': width,
                           'height': height});
};


exports.getXPosition = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getXPosition',
                          {'elementId': elementId});
};

exports.getYPosition = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getYPosition',
                          {'elementId': elementId});
};

exports.createCanvas = function (blockId, elementId, width, height) {
  return Applab.executeCmd(blockId,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height});
};

exports.setActiveCanvas = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'setActiveCanvas',
                          {'elementId': elementId});
};

exports.line = function (blockId, x1, y1, x2, y2) {
  return Applab.executeCmd(blockId,
                          'line',
                          {'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2});
};

exports.circle = function (blockId, x, y, radius) {
  return Applab.executeCmd(blockId,
                          'circle',
                          {'x': x,
                           'y': y,
                           'radius': radius});
};

exports.rect = function (blockId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'rect',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.setStrokeWidth = function (blockId, width) {
  return Applab.executeCmd(blockId,
                          'setStrokeWidth',
                          {'width': width});
};

exports.setStrokeColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'setStrokeColor',
                          {'color': color});
};

exports.setFillColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'setFillColor',
                          {'color': color});
};

exports.clearCanvas = function (blockId) {
  return Applab.executeCmd(blockId, 'clearCanvas');
};

exports.drawImage = function (blockId, imageId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'drawImage',
                          {'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.getImageData = function (blockId, x, y, width, height) {
  return Applab.executeCmd(blockId,
                          'getImageData',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.putImageData = function (blockId, imageData, x, y) {
  return Applab.executeCmd(blockId,
                          'putImageData',
                          {'imageData': imageData,
                           'x': x,
                           'y': y});
};

exports.textInput = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'textInput',
                          {'elementId': elementId,
                           'text': text});
};

exports.textLabel = function (blockId, elementId, text, forId) {
  return Applab.executeCmd(blockId,
                          'textLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId});
};

exports.checkbox = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'checkbox',
                          {'elementId': elementId,
                           'checked': checked});
};

exports.radioButton = function (blockId, elementId, checked, name) {
  return Applab.executeCmd(blockId,
                          'radioButton',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name});
};

exports.getChecked = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getChecked',
                          {'elementId': elementId});
};

exports.setChecked = function (blockId, elementId, checked) {
  return Applab.executeCmd(blockId,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked});
};

exports.dropdown = function (blockId, elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 2);
  return Applab.executeCmd(blockId,
                          'dropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray});
};

exports.getAttribute = function (blockId, elementId, attribute) {
  return Applab.executeCmd(blockId,
                           'getAttribute',
                           {elementId: elementId,
                            attribute: attribute});
};

exports.setAttribute = function (blockId, elementId, attribute, value) {
  return Applab.executeCmd(blockId,
                           'setAttribute',
                           {elementId: elementId,
                            attribute: attribute,
                            value: value});
};

exports.getText = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getText',
                          {'elementId': elementId});
};

exports.setText = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                          'setText',
                          {'elementId': elementId,
                           'text': text});
};

exports.getNumber = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getNumber',
                          {'elementId': elementId});
};

exports.setNumber = function (blockId, elementId, number) {
  return Applab.executeCmd(blockId,
                          'setNumber',
                          {'elementId': elementId,
                           'number': number});
};

exports.getImageURL = function (blockId, elementId) {
  return Applab.executeCmd(blockId,
                          'getImageURL',
                          {'elementId': elementId});
};

exports.setImageURL = function (blockId, elementId, src) {
  return Applab.executeCmd(blockId,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src});
};

exports.imageUploadButton = function (blockId, elementId, text) {
  return Applab.executeCmd(blockId,
                           'imageUploadButton',
                           {'elementId': elementId,
                            'text': text});
};

exports.setParent = function (blockId, elementId, parentId) {
  return Applab.executeCmd(blockId,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId});
};

exports.setStyle = function (blockId, elementId, style) {
  return Applab.executeCmd(blockId,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style});
};

exports.onEvent = function (blockId, elementId, eventName, func) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(4);
  return Applab.executeCmd(blockId,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func,
                           'extraArgs': extraArgs});
};

exports.startWebRequest = function (blockId, url, func) {
  return Applab.executeCmd(blockId,
                          'startWebRequest',
                          {'url': url,
                           'func': func});
};

exports.setTimeout = function (blockId, func, milliseconds) {
  return Applab.executeCmd(blockId,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds});
};

exports.clearTimeout = function (blockId, timeoutId) {
  return Applab.executeCmd(blockId,
                           'clearTimeout',
                           {'timeoutId': timeoutId});
};

exports.setInterval = function (blockId, func, milliseconds) {
  return Applab.executeCmd(blockId,
                          'setInterval',
                          {'func': func,
                           'milliseconds': milliseconds});
};

exports.clearInterval = function (blockId, intervalId) {
  return Applab.executeCmd(blockId,
                           'clearInterval',
                           {'intervalId': intervalId});
};

exports.playSound = function (blockId, url) {
  return Applab.executeCmd(blockId,
                          'playSound',
                          {'url': url});
};

exports.getKeyValue = function (blockId, key, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                           'getKeyValue',
                           {'key': key,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.setKeyValue = function (blockId, key, value, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                           'setKeyValue',
                           {'key': key,
                            'value': value,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.createRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'createRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.readRecords = function (blockId, table, searchParams, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'readRecords',
                          {'table': table,
                           'searchParams': searchParams,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.updateRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'updateRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.deleteRecord = function (blockId, table, record, onSuccess, onError) {
  return Applab.executeCmd(blockId,
                          'deleteRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.onRecordEvent = function (blockId, table, onRecord) {
  return Applab.executeCmd(blockId,
                          'onRecordEvent',
                          {'table': table,
                           'onRecord': onRecord});
};

exports.getUserId = function (blockId) {
  return Applab.executeCmd(blockId,
                          'getUserId',
                          {});
};

exports.moveForward = function (blockId, distance) {
  return Applab.executeCmd(blockId,
                          'moveForward',
                          {'distance': distance});
};

exports.moveBackward = function (blockId, distance) {
  return Applab.executeCmd(blockId,
                          'moveBackward',
                          {'distance': distance});
};

exports.move = function (blockId, x, y) {
  return Applab.executeCmd(blockId,
                          'move',
                          {'x': x,
                           'y': y});
};

exports.moveTo = function (blockId, x, y) {
  return Applab.executeCmd(blockId,
                          'moveTo',
                          {'x': x,
                           'y': y});
};

exports.turnRight = function (blockId, degrees) {
  return Applab.executeCmd(blockId,
                          'turnRight',
                          {'degrees': degrees});
};

exports.turnLeft = function (blockId, degrees) {
  return Applab.executeCmd(blockId,
                          'turnLeft',
                          {'degrees': degrees});
};

exports.turnTo = function (blockId, direction) {
  return Applab.executeCmd(blockId,
                           'turnTo',
                           {'direction': direction});
};

exports.arcRight = function (blockId, degrees, radius) {
  return Applab.executeCmd(blockId,
                           'arcRight',
                           {'degrees': degrees,
                            'radius': radius});
};

exports.arcLeft = function (blockId, degrees, radius) {
  return Applab.executeCmd(blockId,
                           'arcLeft',
                           {'degrees': degrees,
                            'radius': radius});
};

exports.dot = function (blockId, radius) {
  return Applab.executeCmd(blockId,
                           'dot',
                           {'radius': radius});
};

exports.getX = function (blockId) {
  return Applab.executeCmd(blockId, 'getX');
};

exports.getY = function (blockId) {
  return Applab.executeCmd(blockId, 'getY');
};

exports.getDirection = function (blockId) {
  return Applab.executeCmd(blockId, 'getDirection');
};

exports.penUp = function (blockId) {
  return Applab.executeCmd(blockId, 'penUp');
};

exports.penDown = function (blockId) {
  return Applab.executeCmd(blockId, 'penDown');
};

exports.show = function (blockId) {
  return Applab.executeCmd(blockId, 'show');
};

exports.hide = function (blockId) {
  return Applab.executeCmd(blockId, 'hide');
};

exports.speed = function (blockId, percent) {
  return Applab.executeCmd(blockId,
                           'speed',
                           {'percent': percent});
};

exports.penWidth = function (blockId, width) {
  return Applab.executeCmd(blockId,
                          'penWidth',
                          {'width': width});
};

exports.penColor = function (blockId, color) {
  return Applab.executeCmd(blockId,
                          'penColor',
                          {'color': color});
};

exports.penRGB = function (blockId, r, g, b, a) {
  return Applab.executeCmd(blockId,
                          'penRGB',
                          {'r': r,
                           'g': g,
                           'b': b,
                           'a': a});
};

exports.insertItem = function (blockId, array, index, item) {
  return Applab.executeCmd(blockId,
                          'insertItem',
                          {'array': array,
                           'index': index,
                           'item': item});
};

exports.appendItem = function (blockId, array, item) {
  return Applab.executeCmd(blockId,
                          'appendItem',
                          {'array': array,
                           'item': item});
};

exports.removeItem = function (blockId, array, index) {
  return Applab.executeCmd(blockId,
                          'removeItem',
                          {'array': array,
                           'index': index});
};

exports.drawChart = function (chartId, chartType, chartData, options, callback) {
  return Applab.executeCmd(null,
                          'drawChart',
                          {'chartId': chartId,
                           'chartType': chartType,
                           'chartData': chartData,
                           'options': options,
                           'callback': callback});
};

exports.drawChartFromRecords = function (chartId, chartType, tableName, columns, options, callback) {
  return Applab.executeCmd(null,
                          'drawChartFromRecords',
                          {'chartId': chartId,
                           'chartType': chartType,
                           'tableName': tableName,
                           'columns': columns,
                           'options': options,
                           'callback': callback});
};
