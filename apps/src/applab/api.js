// APIs needed for droplet (keep in sync with apiBlockly.js):

export function container(elementId, html) {
  return Applab.executeCmd(null, 'container', {
    elementId: elementId,
    html: html
  });
}

export function write(html) {
  return Applab.executeCmd(null, 'write', {html: html});
}

export function innerHTML(elementId, html) {
  return Applab.executeCmd(null, 'innerHTML', {
    elementId: elementId,
    html: html
  });
}

export function deleteElement(elementId) {
  return Applab.executeCmd(null, 'deleteElement', {elementId: elementId});
}

export function showElement(elementId) {
  return Applab.executeCmd(null, 'showElement', {elementId: elementId});
}

export function hideElement(elementId) {
  return Applab.executeCmd(null, 'hideElement', {elementId: elementId});
}

export function setScreen(screenId) {
  return Applab.executeCmd(null, 'setScreen', {screenId: screenId});
}

export function button(elementId, text) {
  return Applab.executeCmd(null, 'button', {elementId: elementId, text: text});
}

export function image(elementId, src) {
  return Applab.executeCmd(null, 'image', {elementId: elementId, src: src});
}

export function setPosition(elementId, left, top, width, height) {
  return Applab.executeCmd(null, 'setPosition', {
    elementId: elementId,
    left: left,
    top: top,
    width: width,
    height: height
  });
}

export function setSize(elementId, width, height) {
  return Applab.executeCmd(null, 'setSize', {
    elementId: elementId,
    width: width,
    height: height
  });
}

export function setProperty(elementId, property, value) {
  return Applab.executeCmd(null, 'setProperty', {
    elementId: elementId,
    property: property,
    value: value
  });
}

export function getProperty(elementId, property) {
  return Applab.executeCmd(null, 'getProperty', {
    elementId: elementId,
    property: property
  });
}

export function getXPosition(elementId) {
  return Applab.executeCmd(null, 'getXPosition', {elementId: elementId});
}

export function getYPosition(elementId) {
  return Applab.executeCmd(null, 'getYPosition', {elementId: elementId});
}

export function createCanvas(elementId, width, height) {
  return Applab.executeCmd(null, 'createCanvas', {
    elementId: elementId,
    width: width,
    height: height
  });
}

export function setActiveCanvas(elementId) {
  return Applab.executeCmd(null, 'setActiveCanvas', {elementId: elementId});
}

export function line(x1, y1, x2, y2) {
  return Applab.executeCmd(null, 'line', {x1: x1, y1: y1, x2: x2, y2: y2});
}

export function circle(x, y, radius) {
  return Applab.executeCmd(null, 'circle', {x: x, y: y, radius: radius});
}

export function rect(x, y, width, height) {
  return Applab.executeCmd(null, 'rect', {
    x: x,
    y: y,
    width: width,
    height: height
  });
}

export function setStrokeWidth(width) {
  return Applab.executeCmd(null, 'setStrokeWidth', {width: width});
}

export function rgb(r, g, b, a) {
  return Applab.executeCmd(null, 'rgb', {r: r, g: g, b: b, a: a});
}

export function setStrokeColor(color) {
  return Applab.executeCmd(null, 'setStrokeColor', {color: color});
}

export function setFillColor(color) {
  return Applab.executeCmd(null, 'setFillColor', {color: color});
}

export function clearCanvas() {
  return Applab.executeCmd(null, 'clearCanvas');
}

export function drawImage(imageId, x, y, width, height) {
  return Applab.executeCmd(null, 'drawImage', {
    imageId: imageId,
    x: x,
    y: y,
    width: width,
    height: height
  });
}

export function drawImageURL(url, x, y, width, height, callback) {
  if (
    y === undefined &&
    width === undefined &&
    height === undefined &&
    callback === undefined
  ) {
    // everything after x is undefined. assume the two param version (in which
    // callback might still be undefined)
    callback = x;
    x = undefined;
  }
  return Applab.executeCmd(null, 'drawImageURL', {
    url: url,
    x: x,
    y: y,
    width: width,
    height: height,
    callback: callback
  });
}

export function getImageData(x, y, width, height) {
  return Applab.executeCmd(null, 'getImageData', {
    x: x,
    y: y,
    width: width,
    height: height
  });
}

export function putImageData(imageData, x, y) {
  return Applab.executeCmd(null, 'putImageData', {
    imageData: imageData,
    x: x,
    y: y
  });
}

export function textInput(elementId, text) {
  return Applab.executeCmd(null, 'textInput', {
    elementId: elementId,
    text: text
  });
}

export function textLabel(elementId, text, forId) {
  return Applab.executeCmd(null, 'textLabel', {
    elementId: elementId,
    text: text,
    forId: forId
  });
}

export function checkbox(elementId, checked) {
  return Applab.executeCmd(null, 'checkbox', {
    elementId: elementId,
    checked: checked
  });
}

export function radioButton(elementId, checked, name) {
  return Applab.executeCmd(null, 'radioButton', {
    elementId: elementId,
    checked: checked,
    name: name
  });
}

export function getChecked(elementId) {
  return Applab.executeCmd(null, 'getChecked', {elementId: elementId});
}

export function setChecked(elementId, checked) {
  return Applab.executeCmd(null, 'setChecked', {
    elementId: elementId,
    checked: checked
  });
}

export function dropdown(elementId) {
  var optionsArray = Array.prototype.slice.call(arguments, 1);
  return Applab.executeCmd(null, 'dropdown', {
    elementId: elementId,
    optionsArray: optionsArray
  });
}

export function getAttribute(elementId, attribute) {
  return Applab.executeCmd(null, 'getAttribute', {
    elementId: elementId,
    attribute: attribute
  });
}

export function setAttribute(elementId, attribute, value) {
  return Applab.executeCmd(null, 'setAttribute', {
    elementId: elementId,
    attribute: attribute,
    value: value
  });
}

export function setSelectionRange(
  elementId,
  selectionStart,
  selectionEnd,
  selectionDirection
) {
  return Applab.executeCmd(null, 'setSelectionRange', {
    elementId,
    selectionStart,
    selectionEnd,
    selectionDirection
  });
}

export function getText(elementId) {
  return Applab.executeCmd(null, 'getText', {elementId: elementId});
}

export function setText(elementId, text) {
  return Applab.executeCmd(null, 'setText', {elementId: elementId, text: text});
}

export function getNumber(elementId) {
  return Applab.executeCmd(null, 'getNumber', {elementId: elementId});
}

export function setNumber(elementId, number) {
  return Applab.executeCmd(null, 'setNumber', {
    elementId: elementId,
    number: number
  });
}

export function getImageURL(elementId) {
  return Applab.executeCmd(null, 'getImageURL', {elementId: elementId});
}

export function setImageURL(elementId, src) {
  return Applab.executeCmd(null, 'setImageURL', {
    elementId: elementId,
    src: src
  });
}

export function imageUploadButton(elementId, text) {
  return Applab.executeCmd(null, 'imageUploadButton', {
    elementId: elementId,
    text: text
  });
}

export function setParent(elementId, parentId) {
  return Applab.executeCmd(null, 'setParent', {
    elementId: elementId,
    parentId: parentId
  });
}

export function setStyle(elementId, style) {
  return Applab.executeCmd(null, 'setStyle', {
    elementId: elementId,
    style: style
  });
}

export function onEvent(elementId, eventName, func) {
  var extraArgs = Array.prototype.slice.call(arguments).slice(3);
  return Applab.executeCmd(null, 'onEvent', {
    elementId: elementId,
    eventName: eventName,
    func: func,
    extraArgs: extraArgs
  });
}

export function open(url) {
  return Applab.executeCmd(null, 'openUrl', {url: url});
}

export function startWebRequest(url, func) {
  return Applab.executeCmd(null, 'startWebRequest', {url: url, func: func});
}

export function startWebRequestSync(url, headers, func) {
  return Applab.executeCmd(null, 'startWebRequestSync', {url, func, headers});
}

export function getKeyValue(key, onSuccess, onError) {
  return Applab.executeCmd(null, 'getKeyValue', {
    key: key,
    onSuccess: onSuccess,
    onError: onError
  });
}

export function getKeyValueSync(key, callback) {
  return Applab.executeCmd(null, 'getKeyValueSync', {
    key: key,
    callback: callback
  });
}

export function setKeyValue(key, value, onSuccess, onError) {
  return Applab.executeCmd(null, 'setKeyValue', {
    key: key,
    value: value,
    onSuccess: onSuccess,
    onError: onError
  });
}

export function setKeyValueSync(key, value, callback) {
  return Applab.executeCmd(null, 'setKeyValueSync', {
    key: key,
    value: value,
    callback: callback
  });
}

export function getColumn(table, column, callback) {
  return Applab.executeCmd(null, 'getColumn', {
    table: table,
    column: column,
    callback: callback
  });
}

export function createRecord(table, record, onSuccess, onError) {
  return Applab.executeCmd(null, 'createRecord', {
    table: table,
    record: record,
    onSuccess: onSuccess,
    onError: onError
  });
}

export function readRecords(table, searchParams, onSuccess, onError) {
  return Applab.executeCmd(null, 'readRecords', {
    table: table,
    searchParams: searchParams,
    onSuccess: onSuccess,
    onError: onError
  });
}

export function updateRecord(table, record, onComplete, onError) {
  return Applab.executeCmd(null, 'updateRecord', {
    table: table,
    record: record,
    onComplete: onComplete,
    onError: onError
  });
}

export function deleteRecord(table, record, onComplete, onError) {
  return Applab.executeCmd(null, 'deleteRecord', {
    table: table,
    record: record,
    onComplete: onComplete,
    onError: onError
  });
}

export function onRecordEvent(table, onRecord, includeAll) {
  return Applab.executeCmd(null, 'onRecordEvent', {
    table: table,
    onRecord: onRecord,
    includeAll: includeAll
  });
}

export function getUserId() {
  return Applab.executeCmd(null, 'getUserId', {});
}

export function moveForward(distance) {
  return Applab.executeCmd(null, 'moveForward', {distance: distance});
}

export function moveBackward(distance) {
  return Applab.executeCmd(null, 'moveBackward', {distance: distance});
}

export function move(x, y) {
  return Applab.executeCmd(null, 'move', {x: x, y: y});
}

export function moveTo(x, y) {
  return Applab.executeCmd(null, 'moveTo', {x: x, y: y});
}

export function turnRight(degrees) {
  return Applab.executeCmd(null, 'turnRight', {degrees: degrees});
}

export function turnLeft(degrees) {
  return Applab.executeCmd(null, 'turnLeft', {degrees: degrees});
}

export function turnTo(direction) {
  return Applab.executeCmd(null, 'turnTo', {direction: direction});
}

export function arcRight(degrees, radius) {
  return Applab.executeCmd(null, 'arcRight', {
    degrees: degrees,
    radius: radius
  });
}

export function arcLeft(degrees, radius) {
  return Applab.executeCmd(null, 'arcLeft', {degrees: degrees, radius: radius});
}

export function dot(radius) {
  return Applab.executeCmd(null, 'dot', {radius: radius});
}

export function getX() {
  return Applab.executeCmd(null, 'getX');
}

export function getY() {
  return Applab.executeCmd(null, 'getY');
}

export function getDirection() {
  return Applab.executeCmd(null, 'getDirection');
}

export function penUp() {
  return Applab.executeCmd(null, 'penUp');
}

export function penDown() {
  return Applab.executeCmd(null, 'penDown');
}

export function show() {
  return Applab.executeCmd(null, 'show');
}

export function hide() {
  return Applab.executeCmd(null, 'hide');
}

export function speed(percent) {
  return Applab.executeCmd(null, 'speed', {percent: percent});
}

export function penWidth(width) {
  return Applab.executeCmd(null, 'penWidth', {width: width});
}

export function penColor(color) {
  return Applab.executeCmd(null, 'penColor', {color: color});
}

export function penRGB(r, g, b, a) {
  return Applab.executeCmd(null, 'penRGB', {r: r, g: g, b: b, a: a});
}

export function drawChart(chartId, chartType, chartData, options, callback) {
  return Applab.executeCmd(null, 'drawChart', {
    chartId: chartId,
    chartType: chartType,
    chartData: chartData,
    options: options,
    callback: callback
  });
}

export function drawChartFromRecords(
  chartId,
  chartType,
  tableName,
  columns,
  options,
  callback
) {
  return Applab.executeCmd(null, 'drawChartFromRecords', {
    chartId: chartId,
    chartType: chartType,
    tableName: tableName,
    columns: columns,
    options: options,
    callback: callback
  });
}
