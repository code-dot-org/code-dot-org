module.exports.blocks = [
  {'func': 'onEvent', 'title': 'Execute code in response to an event for the specified element. Additional parameters are passed to the callback function.', 'category': 'General', 'params': ["'id'", "'click'", "function(event) {\n  \n}"] },
  {'func': 'startWebRequest', 'title': 'Request data from the internet and execute code when the request is complete', 'category': 'General', 'params': ["'http://api.openweathermap.org/data/2.5/weather?q=London,uk'", "function(status, type, content) {\n  \n}"] },
  {'func': 'setTimeout', 'title': 'Set a timer and execute code when that number of milliseconds has elapsed', 'category': 'General', 'params': ["function() {\n  \n}", "1000"] },
  {'func': 'clearTimeout', 'title': 'Clear an existing timer by passing in the value returned from setTimeout()', 'category': 'General', 'params': ["0"] },
  {'func': 'createHtmlBlock', 'title': 'Create a block of HTML and assign it an element id', 'category': 'General', 'params': ["'id'", "'html'"] },
  {'func': 'replaceHtmlBlock', 'title': 'Replace a block of HTML associated with the specified id', 'category': 'General', 'params': ["'id'", "'html'"] },
  {'func': 'deleteHtmlBlock', 'title': 'Delete the element with the specified id', 'category': 'General', 'params': ["'id'"] },
  {'func': 'setParent', 'title': 'Set an element to become a child of a parent element', 'category': 'General', 'params': ["'id'", "'parentId'"] },
  {'func': 'setPosition', 'title': 'Position an element with x, y, width, and height coordinates', 'category': 'General', 'params': ["'id'", "0", "0", "100", "100"] },
  {'func': 'setStyle', 'title': 'Add CSS style text to an element', 'category': 'General', 'params': ["'id'", "'color:red;'"] },
  {'func': 'getAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'"], 'type': 'value' },
  {'func': 'setAttribute', 'category': 'General', 'params': ["'id'", "'scrollHeight'", "200"]},
  {'func': 'createButton', 'title': 'Create a button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
  {'func': 'createTextInput', 'title': 'Create a text input and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
  {'func': 'createTextLabel', 'title': 'Create a text label, assign it an element id, and bind it to an associated element', 'category': 'UI Controls', 'params': ["'id'", "'text'", "'forId'"] },
  {'func': 'createDropdown', 'title': 'Create a dropdown, assign it an element id, and populate it with a list of items', 'category': 'UI Controls', 'params': ["'id'", "'option1'", "'etc'"] },
  {'func': 'getText', 'title': 'Get the text from the specified element', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setText', 'title': 'Set the text for the specified element', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
  {'func': 'createCheckbox', 'title': 'Create a checkbox and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false"] },
  {'func': 'createRadio', 'title': 'Create a radio button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "false", "'group'"] },
  {'func': 'getChecked', 'title': 'Get the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setChecked', 'title': 'Set the state of a checkbox or radio button', 'category': 'UI Controls', 'params': ["'id'", "true"] },
  {'func': 'createImage', 'title': 'Create an image and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
  {'func': 'getImageURL', 'title': 'Get the URL associated with an image or image upload button', 'category': 'UI Controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setImageURL', 'title': 'Set the URL for the specified image element id', 'category': 'UI Controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
  {'func': 'createImageUploadButton', 'title': 'Create an image upload button and assign it an element id', 'category': 'UI Controls', 'params': ["'id'", "'text'"] },
  {'func': 'createCanvas', 'title': 'Create a canvas with width, height dimensions', 'category': 'Canvas', 'params': ["'id'", "320", "480"] },
  {'func': 'canvasDrawLine', 'title': 'Draw a line on a canvas from x1, y1 to x2, y2', 'category': 'Canvas', 'params': ["'id'", "0", "0", "160", "240"] },
  {'func': 'canvasDrawCircle', 'title': 'Draw a circle on a canvas with the specified coordinates for center (x, y) and radius', 'category': 'Canvas', 'params': ["'id'", "160", "240", "100"] },
  {'func': 'canvasDrawRect', 'title': 'Draw a rectangle on a canvas with x, y, width, and height coordinates', 'category': 'Canvas', 'params': ["'id'", "80", "120", "160", "240"] },
  {'func': 'canvasSetLineWidth', 'title': 'Set the line width for a canvas', 'category': 'Canvas', 'params': ["'id'", "3"] },
  {'func': 'canvasSetStrokeColor', 'title': 'Set the stroke color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'red'"] },
  {'func': 'canvasSetFillColor', 'title': 'Set the fill color for a canvas', 'category': 'Canvas', 'params': ["'id'", "'yellow'"] },
  {'func': 'canvasDrawImage', 'title': 'Draw an image on a canvas with the specified image element and x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "'imageId'", "0", "0"] },
  {'func': 'canvasGetImageData', 'title': 'Get the ImageData for a rectangle (x, y, width, height) within a canvas', 'category': 'Canvas', 'params': ["'id'", "0", "0", "320", "480"], 'type': 'value' },
  {'func': 'canvasPutImageData', 'title': 'Set the ImageData for a rectangle within a canvas with x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'id'", "imageData", "0", "0"] },
  {'func': 'canvasClear', 'title': 'Clear all data on a canvas', 'category': 'Canvas', 'params': ["'id'"] },
  {'func': 'writeRemoteValue', 'title': 'writeRemoteValue(key, value, visibility, callback); Saves the value associated with the key in a remote data store. Set visibility to "shared" to make it visible to other users of your app.', 'category': 'Storage', 'params': ["'key'", "'value'","'user'", "function () {\n  \n}"] },
  {'func': 'readRemoteValue', 'title': 'readRemoteValue(key, value, visibility, callback); Reads the value associated with the key in a remote data store. Set visibility to "user" or "shared", whichever you used to write the remote value.', 'category': 'Storage', 'params': ["'key'", "'user'", "function (value) {\n  \n}"] },
  {'func': 'createRecord', 'title': 'createRecord(record, visibility, onSuccess, onError); Creates a new record in table record.tableName. Set visibility to "shared" to make it visible to other users of your app.', 'category': 'Storage', 'params': ["{tableName:'abc', name:'Alice', age:7}", "'user'", "function() {\n  \n}"] },
  {'func': 'readRecords', 'title': 'readRecords(searchParams, visibility, onSuccess, onError); Reads all records whose properties match those on the searchParams object. Set visibility to "user" or "shared", whichever you used to create the record.', 'category': 'Storage', 'params': ["{tableName: 'abc'}", "'user'", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    createHtmlBlock('id', records[i].id + ': ' + records[i].name);\n  }\n}"] },
  {'func': 'updateRecord', 'title': 'updateRecord(record, visibility, onSuccess, onFailure); Updates a record, identified by record.tableName and record.id. Set visibility to "user" or "shared", whichever you used to create the record.', 'category': 'Storage', 'params': ["{tableName:'abc', id: 1, name:'Bob', age:8}", "'user'", "function() {\n  \n}"] },
  {'func': 'deleteRecord', 'title': 'deleteRecord(record, visibility, onSuccess, onFailure)\nDeletes a record, identified by record.tableName and record.id. Set visibility to "user" or "shared", whichever you used to create the record.', 'category': 'Storage', 'params': ["{tableName:'abc', id: 1}", "'user'", "function() {\n  \n}"] },
  {'func': 'turtleMoveForward', 'title': 'Move the turtle forward the specified distance', 'category': 'Turtle', 'params': ["100"] },
  {'func': 'turtleMoveBackward', 'title': 'Move the turtle backward the specified distance', 'category': 'Turtle', 'params': ["100"] },
  {'func': 'turtleMove', 'title': 'Move the turtle by the specified x and y coordinates', 'category': 'Turtle', 'params': ["50", "50"] },
  {'func': 'turtleMoveTo', 'title': 'Move the turtle to the specified x and y coordinates', 'category': 'Turtle', 'params': ["0", "0"] },
  {'func': 'turtleTurnRight', 'title': 'Turn the turtle clockwise by the specified number of degrees', 'category': 'Turtle', 'params': ["90"] },
  {'func': 'turtleTurnLeft', 'title': 'Turn the turtle counterclockwise by the specified number of degrees', 'category': 'Turtle', 'params': ["90"] },
  {'func': 'turtlePenUp', 'title': "Pick up the turtle's pen", 'category': 'Turtle' },
  {'func': 'turtlePenDown', 'title': "Set down the turtle's pen", 'category': 'Turtle' },
  {'func': 'turtlePenWidth', 'title': 'Set the turtle to the specified pen width', 'category': 'Turtle', 'params': ["3"] },
  {'func': 'turtlePenColor', 'title': 'Set the turtle to the specified pen color', 'category': 'Turtle', 'params': ["'red'"] },
];

module.exports.categories = {
  'General': {
    'color': 'blue',
    'blocks': []
  },
  'UI Controls': {
    'color': 'red',
    'blocks': []
  },
  'Canvas': {
    'color': 'yellow',
    'blocks': []
  },
  'Storage': {
    'color': 'orange',
    'blocks': []
  },
  'Turtle': {
    'color': 'yellow',
    'blocks': []
  },
};
