// APIs needed for droplet (keep in sync with apiBlockly.js):

exports.container = function (elementId, html) {
  return Applab.executeCmd(null,
                          'container',
                          {'elementId': elementId,
                           'html': html});
};

exports.write = function (html) {
  return Applab.executeCmd(null,
                          'write',
                          {'html': html});
};

exports.innerHTML = function (elementId, html) {
  return Applab.executeCmd(null,
                          'innerHTML',
                          {'elementId': elementId,
                           'html': html});
};

exports.deleteElement = function (elementId) {
  return Applab.executeCmd(null,
                          'deleteElement',
                          {'elementId': elementId});
};

exports.showElement = function (elementId) {
  return Applab.executeCmd(null,
                          'showElement',
                          {'elementId': elementId});
};

exports.hideElement = function (elementId) {
  return Applab.executeCmd(null,
                          'hideElement',
                          {'elementId': elementId});
};

exports.setScreen = function (screenId) {
  return Applab.executeCmd(null,
                          'setScreen',
                          {'screenId': screenId});
};

exports.button = function (elementId, text) {
  return Applab.executeCmd(null,
                          'button',
                          {'elementId': elementId,
                           'text': text});
};

exports.image = function (elementId, src) {
  return Applab.executeCmd(null,
                          'image',
                          {'elementId': elementId,
                           'src': src});
};

exports.setPosition = function (elementId, left, top, width, height) {
  return Applab.executeCmd(null,
                          'setPosition',
                          {'elementId': elementId,
                           'left': left,
                           'top': top,
                           'width': width,
                           'height': height});
};

exports.setSize = function (elementId, width, height) {
  return Applab.executeCmd(null,
                          'setSize',
                          {'elementId': elementId,
                           'width': width,
                           'height': height});
};

exports.setProperty = function (elementId, property, value) {
  return Applab.executeCmd(null,
                          'setProperty',
                          {'elementId': elementId,
                           'property': property,
                           'value': value});
};


exports.getXPosition = function (elementId) {
  return Applab.executeCmd(null,
                          'getXPosition',
                          {'elementId': elementId});
};

exports.getYPosition = function (elementId) {
  return Applab.executeCmd(null,
                          'getYPosition',
                          {'elementId': elementId});
};

exports.createCanvas = function (elementId, width, height) {
  return Applab.executeCmd(null,
                          'createCanvas',
                          {'elementId': elementId,
                           'width': width,
                           'height': height});
};

exports.setActiveCanvas = function (elementId) {
  return Applab.executeCmd(null,
                          'setActiveCanvas',
                          {'elementId': elementId});
};

exports.line = function (x1, y1, x2, y2) {
  return Applab.executeCmd(null,
                          'line',
                          {'x1': x1,
                           'y1': y1,
                           'x2': x2,
                           'y2': y2});
};

exports.circle = function (x, y, radius) {
  return Applab.executeCmd(null,
                          'circle',
                          {'x': x,
                           'y': y,
                           'radius': radius});
};

exports.rect = function (x, y, width, height) {
  return Applab.executeCmd(null,
                          'rect',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.setStrokeWidth = function (width) {
  return Applab.executeCmd(null,
                          'setStrokeWidth',
                          {'width': width});
};

exports.setStrokeColor = function (color) {
  return Applab.executeCmd(null,
                          'setStrokeColor',
                          {'color': color});
};

exports.setFillColor = function (color) {
  return Applab.executeCmd(null,
                          'setFillColor',
                          {'color': color});
};

exports.clearCanvas = function () {
  return Applab.executeCmd(null, 'clearCanvas');
};

exports.drawImage = function (imageId, x, y, width, height) {
  return Applab.executeCmd(null,
                          'drawImage',
                          {'imageId': imageId,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.drawImageURL = function (url, x, y, width, height, callback) {
  if (y === undefined && width === undefined && height === undefined &&
      callback === undefined) {
    // everything after x is undefined. assume the two param version (in which
    // callback might still be undefined)
    callback = x;
    x = undefined;
  }
  return Applab.executeCmd(null,
                          'drawImageURL',
                          {'url': url,
                           'x': x,
                           'y': y,
                           'width': width,
                           'height': height,
                           'callback': callback});
};


exports.getImageData = function (x, y, width, height) {
  return Applab.executeCmd(null,
                          'getImageData',
                          {'x': x,
                           'y': y,
                           'width': width,
                           'height': height});
};

exports.putImageData = function (imageData, x, y) {
  return Applab.executeCmd(null,
                          'putImageData',
                          {'imageData': imageData,
                           'x': x,
                           'y': y});
};

exports.textInput = function (elementId, text) {
  return Applab.executeCmd(null,
                          'textInput',
                          {'elementId': elementId,
                           'text': text});
};

exports.textLabel = function (elementId, text, forId) {
  return Applab.executeCmd(null,
                          'textLabel',
                          {'elementId': elementId,
                           'text': text,
                           'forId': forId});
};

exports.checkbox = function (elementId, checked) {
  return Applab.executeCmd(null,
                          'checkbox',
                          {'elementId': elementId,
                           'checked': checked});
};

exports.radioButton = function (elementId, checked, name) {
  return Applab.executeCmd(null,
                          'radioButton',
                          {'elementId': elementId,
                           'checked': checked,
                           'name': name});
};

exports.getChecked = function (elementId) {
  return Applab.executeCmd(null,
                          'getChecked',
                          {'elementId': elementId});
};

exports.setChecked = function (elementId, checked) {
  return Applab.executeCmd(null,
                          'setChecked',
                          {'elementId': elementId,
                           'checked': checked});
};

exports.dropdown = function (elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 1);
  return Applab.executeCmd(null,
                          'dropdown',
                          {'elementId': elementId,
                           'optionsArray': optionsArray});
};

exports.getAttribute = function(elementId, attribute) {
  return Applab.executeCmd(null,
                           'getAttribute',
                           {elementId: elementId,
                            attribute: attribute});
};

exports.setAttribute = function(elementId, attribute, value) {
  return Applab.executeCmd(null,
                           'setAttribute',
                           {elementId: elementId,
                            attribute: attribute,
                            value: value});
};

exports.getText = function (elementId) {
  return Applab.executeCmd(null,
                          'getText',
                          {'elementId': elementId});
};

exports.setText = function (elementId, text) {
  return Applab.executeCmd(null,
                          'setText',
                          {'elementId': elementId,
                           'text': text});
};

exports.getNumber = function (elementId) {
  return Applab.executeCmd(null,
                          'getNumber',
                          {'elementId': elementId});
};

exports.setNumber = function (elementId, number) {
  return Applab.executeCmd(null,
                          'setNumber',
                          {'elementId': elementId,
                           'number': number});
};

exports.getImageURL = function (elementId) {
  return Applab.executeCmd(null,
                          'getImageURL',
                          {'elementId': elementId});
};

exports.setImageURL = function (elementId, src) {
  return Applab.executeCmd(null,
                          'setImageURL',
                          {'elementId': elementId,
                           'src': src});
};

exports.imageUploadButton = function (elementId, text) {
  return Applab.executeCmd(null,
                           'imageUploadButton',
                           {'elementId': elementId,
                            'text': text});
};

exports.setParent = function (elementId, parentId) {
  return Applab.executeCmd(null,
                          'setParent',
                          {'elementId': elementId,
                           'parentId': parentId});
};

exports.setStyle = function (elementId, style) {
  return Applab.executeCmd(null,
                           'setStyle',
                           {'elementId': elementId,
                           'style': style});
};

exports.onEvent = function (elementId, eventName, func) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(3);
  return Applab.executeCmd(null,
                          'onEvent',
                          {'elementId': elementId,
                           'eventName': eventName,
                           'func': func,
                           'extraArgs': extraArgs});
};

exports.startWebRequest = function (url, func) {
  return Applab.executeCmd(null,
                          'startWebRequest',
                          {'url': url,
                           'func': func});
};

exports.setTimeout = function (func, milliseconds) {
  return Applab.executeCmd(null,
                          'setTimeout',
                          {'func': func,
                           'milliseconds': milliseconds});
};

exports.clearTimeout = function (timeoutId) {
  return Applab.executeCmd(null,
                           'clearTimeout',
                           {'timeoutId': timeoutId});
};

exports.setInterval = function (func, milliseconds) {
  return Applab.executeCmd(null,
                          'setInterval',
                          {'func': func,
                           'milliseconds': milliseconds});
};

exports.clearInterval = function (intervalId) {
  return Applab.executeCmd(null,
                           'clearInterval',
                           {'intervalId': intervalId});
};

exports.playSound = function (url) {
  return Applab.executeCmd(null,
                          'playSound',
                          {'url': url});
};

exports.getKeyValue = function(key, onSuccess, onError) {
  return Applab.executeCmd(null,
                           'getKeyValue',
                           {'key':key,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.getKeyValueSync = function(key, callback) {
  return Applab.executeCmd(null,
                           'getKeyValueSync',
                           {'key':key,
                            'callback': callback});
};

exports.setKeyValue = function(key, value, onSuccess, onError) {
  return Applab.executeCmd(null,
                           'setKeyValue',
                           {'key':key,
                            'value': value,
                            'onSuccess': onSuccess,
                            'onError': onError});
};

exports.setKeyValueSync = function(key, value, callback) {
  return Applab.executeCmd(null,
                           'setKeyValueSync',
                           {'key':key,
                            'value': value,
                            'callback': callback});
};

exports.createRecord = function (table, record, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'createRecord',
                          {'table': table,
                           'record': record,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.readRecords = function (table, searchParams, onSuccess, onError) {
  return Applab.executeCmd(null,
                          'readRecords',
                          {'table': table,
                           'searchParams': searchParams,
                           'onSuccess': onSuccess,
                           'onError': onError});
};

exports.updateRecord = function (table, record, onComplete, onError) {
  return Applab.executeCmd(null,
                          'updateRecord',
                          {'table': table,
                           'record': record,
                           'onComplete': onComplete,
                           'onError': onError});
};

exports.deleteRecord = function (table, record, onComplete, onError) {
  return Applab.executeCmd(null,
                          'deleteRecord',
                          {'table': table,
                           'record': record,
                           'onComplete': onComplete,
                           'onError': onError});
};

exports.onRecordEvent = function (table, onRecord) {
  return Applab.executeCmd(null,
                           'onRecordEvent',
                           {'table': table,
                            'onRecord': onRecord});
};

exports.getUserId = function () {
  return Applab.executeCmd(null,
                          'getUserId',
                          {});
};

exports.moveForward = function (distance) {
  return Applab.executeCmd(null,
                          'moveForward',
                          {'distance': distance});
};

exports.moveBackward = function (distance) {
  return Applab.executeCmd(null,
                          'moveBackward',
                          {'distance': distance});
};

exports.move = function (x, y) {
  return Applab.executeCmd(null,
                          'move',
                          {'x': x,
                           'y': y});
};

exports.moveTo = function (x, y) {
  return Applab.executeCmd(null,
                          'moveTo',
                          {'x': x,
                           'y': y});
};

exports.turnRight = function (degrees) {
  return Applab.executeCmd(null,
                          'turnRight',
                          {'degrees': degrees});
};

exports.turnLeft = function (degrees) {
  return Applab.executeCmd(null,
                          'turnLeft',
                          {'degrees': degrees});
};

exports.turnTo = function (direction) {
  return Applab.executeCmd(null,
                           'turnTo',
                           {'direction': direction});
};

exports.arcRight = function (degrees, radius) {
  return Applab.executeCmd(null,
                           'arcRight',
                           {'degrees': degrees,
                            'radius': radius});
};

exports.arcLeft = function (degrees, radius) {
  return Applab.executeCmd(null,
                           'arcLeft',
                           {'degrees': degrees,
                            'radius': radius});
};

exports.dot = function (radius) {
  return Applab.executeCmd(null,
                           'dot',
                           {'radius': radius});
};

exports.getX = function () {
  return Applab.executeCmd(null, 'getX');
};

exports.getY = function () {
  return Applab.executeCmd(null, 'getY');
};

exports.getDirection = function () {
  return Applab.executeCmd(null, 'getDirection');
};

exports.penUp = function () {
  return Applab.executeCmd(null, 'penUp');
};

exports.penDown = function () {
  return Applab.executeCmd(null, 'penDown');
};

exports.show = function () {
  return Applab.executeCmd(null, 'show');
};

exports.hide = function () {
  return Applab.executeCmd(null, 'hide');
};

exports.speed = function (percent) {
  return Applab.executeCmd(null,
                           'speed',
                           {'percent': percent});
};

exports.penWidth = function (width) {
  return Applab.executeCmd(null,
                          'penWidth',
                          {'width': width});
};

exports.penColor = function (color) {
  return Applab.executeCmd(null,
                          'penColor',
                          {'color': color});
};

exports.penRGB = function (r, g, b, a) {
  return Applab.executeCmd(null,
                          'penRGB',
                          {'r': r,
                           'g': g,
                           'b': b,
                           'a': a});
};

exports.insertItem = function (array, index, item) {
  return Applab.executeCmd(null,
                          'insertItem',
                          {'array': array,
                           'index': index,
                           'item': item});
};

exports.appendItem = function (array, item) {
  return Applab.executeCmd(null,
                          'appendItem',
                          {'array': array,
                           'item': item});
};

exports.removeItem = function (array, index) {
  return Applab.executeCmd(null,
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
