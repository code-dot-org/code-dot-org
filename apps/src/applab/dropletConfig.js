module.exports.blocks = [
  {'func': 'onEvent', 'title': 'Execute code in response to an event for the specified element. Additional parameters are passed to the callback function.', 'category': 'UI controls', 'params': ["'id'", "'click'", "function(event) {\n  \n}"] },
  {'func': 'createButton', 'title': 'Create a button and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "'text'"] },
  {'func': 'createTextInput', 'title': 'Create a text input and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "'text'"] },
  {'func': 'createTextLabel', 'title': 'Create a text label, assign it an element id, and bind it to an associated element', 'category': 'UI controls', 'params': ["'id'", "'text'", "'forId'"] },
  {'func': 'createDropdown', 'title': 'Create a dropdown, assign it an element id, and populate it with a list of items', 'category': 'UI controls', 'params': ["'id'", "'option1'", "'etc'"] },
  {'func': 'getText', 'title': 'Get the text from the specified element', 'category': 'UI controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setText', 'title': 'Set the text for the specified element', 'category': 'UI controls', 'params': ["'id'", "'text'"] },
  {'func': 'createCheckbox', 'title': 'Create a checkbox and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "false"] },
  {'func': 'createRadio', 'title': 'Create a radio button and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "false", "'group'"] },
  {'func': 'getChecked', 'title': 'Get the state of a checkbox or radio button', 'category': 'UI controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setChecked', 'title': 'Set the state of a checkbox or radio button', 'category': 'UI controls', 'params': ["'id'", "true"] },
  {'func': 'createImage', 'title': 'Create an image and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
  {'func': 'getImageURL', 'title': 'Get the URL associated with an image or image upload button', 'category': 'UI controls', 'params': ["'id'"], 'type': 'value' },
  {'func': 'setImageURL', 'title': 'Set the URL for the specified image element id', 'category': 'UI controls', 'params': ["'id'", "'http://code.org/images/logo.png'"] },
  {'func': 'playSound', 'title': 'Play the MP3, OGG, or WAV sound file from the specified URL', 'category': 'UI controls', 'params': ["'http://soundbible.com/mp3/neck_snap-Vladimir-719669812.mp3'"] },
  {'func': 'deleteElement', 'title': 'Delete the element with the specified id', 'category': 'UI controls', 'params': ["'id'"] },
  {'func': 'setPosition', 'title': 'Position an element with x, y, width, and height coordinates', 'category': 'UI controls', 'params': ["'id'", "0", "0", "100", "100"] },
  {'func': 'createImageUploadButton', 'title': 'Create an image upload button and assign it an element id', 'category': 'UI controls', 'params': ["'id'", "'text'"] },

  {'func': 'createCanvas', 'title': 'Create a canvas with the specified id, and optionally set width and height dimensions', 'category': 'Canvas', 'params': ["'id'", "320", "480"] },
  {'func': 'setActiveCanvas', 'title': 'Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)', 'category': 'Canvas', 'params': ["'id'"] },
  {'func': 'line', 'title': 'Draw a line on the active canvas from x1, y1 to x2, y2', 'category': 'Canvas', 'params': ["0", "0", "160", "240"] },
  {'func': 'circle', 'title': 'Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius', 'category': 'Canvas', 'params': ["160", "240", "100"] },
  {'func': 'rect', 'title': 'Draw a rectangle on the active  canvas with x, y, width, and height coordinates', 'category': 'Canvas', 'params': ["80", "120", "160", "240"] },
  {'func': 'setStrokeWidth', 'title': 'Set the line width for the active  canvas', 'category': 'Canvas', 'params': ["3"] },
  {'func': 'setStrokeColor', 'title': 'Set the stroke color for the active  canvas', 'category': 'Canvas', 'params': ["'red'"] },
  {'func': 'setFillColor', 'title': 'Set the fill color for the active  canvas', 'category': 'Canvas', 'params': ["'yellow'"] },
  {'func': 'drawImage', 'title': 'Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates', 'category': 'Canvas', 'params': ["'imageId'", "0", "0"] },
  {'func': 'getImageData', 'title': 'Get the ImageData for a rectangle (x, y, width, height) within the active  canvas', 'category': 'Canvas', 'params': ["0", "0", "320", "480"], 'type': 'value' },
  {'func': 'putImageData', 'title': 'Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates', 'category': 'Canvas', 'params': ["imageData", "0", "0"] },
  {'func': 'clearCanvas', 'title': 'Clear all data on the active canvas', 'category': 'Canvas', },

  {'func': 'startWebRequest', 'title': 'Request data from the internet and execute code when the request is complete', 'category': 'Data', 'params': ["'http://api.openweathermap.org/data/2.5/weather?q=London,uk'", "function(status, type, content) {\n  \n}"] },
  {'func': 'writeSharedValue', 'title': 'Saves a value associated with the key, shared with everyone who uses the app.', 'category': 'Data', 'params': ["'key'", "'value'", "function () {\n  \n}"] },
  {'func': 'readSharedValue', 'title': 'Reads the value associated with the key, shared with everyone who uses the app.', 'category': 'Data', 'params': ["'key'", "function (value) {\n  \n}"] },
  {'func': 'createSharedRecord', 'title': 'createSharedRecord(record, onSuccess, onError); Creates a new shared record in table record.tableName.', 'category': 'Data', 'params': ["{tableName:'abc', name:'Alice', age:7, male:false}", "function() {\n  \n}"] },
  {'func': 'readSharedRecords', 'title': 'readSharedRecords(searchParams, onSuccess, onError); Reads all shared records whose properties match those on the searchParams object.', 'category': 'Data', 'params': ["{tableName: 'abc'}", "function(records) {\n  for (var i =0; i < records.length; i++) {\n    container('id', records[i].id + ': ' + records[i].name);\n  }\n}"] },
  {'func': 'updateSharedRecord', 'title': 'updateSharedRecord(record, onSuccess, onFailure); Updates a shared record, identified by record.tableName and record.id.', 'category': 'Data', 'params': ["{tableName:'abc', id: 1, name:'Bob', age:8, male:true}", "function() {\n  \n}"] },
  {'func': 'deleteSharedRecord', 'title': 'deleteSharedRecord(record, onSuccess, onFailure)\nDeletes a shared record, identified by record.tableName and record.id.', 'category': 'Data', 'params': ["{tableName:'abc', id: 1}", "function() {\n  \n}"] },

  {'func': 'moveForward', 'title': 'Move the turtle forward the specified distance', 'category': 'Turtle', 'params': ["25"] },
  {'func': 'moveBackward', 'title': 'Move the turtle backward the specified distance', 'category': 'Turtle', 'params': ["25"] },
  {'func': 'move', 'title': 'Move the turtle by the specified x and y coordinates', 'category': 'Turtle', 'params': ["25", "25"] },
  {'func': 'moveTo', 'title': 'Move the turtle to the specified x and y coordinates', 'category': 'Turtle', 'params': ["0", "0"] },
  {'func': 'turnRight', 'title': 'Turn the turtle clockwise by the specified number of degrees', 'category': 'Turtle', 'params': ["90"] },
  {'func': 'turnLeft', 'title': 'Turn the turtle counterclockwise by the specified number of degrees', 'category': 'Turtle', 'params': ["90"] },
  {'func': 'penUp', 'title': "Pick up the turtle's pen", 'category': 'Turtle' },
  {'func': 'penDown', 'title': "Set down the turtle's pen", 'category': 'Turtle' },
  {'func': 'penWidth', 'title': 'Set the turtle to the specified pen width', 'category': 'Turtle', 'params': ["3"] },
  {'func': 'penColor', 'title': 'Set the turtle to the specified pen color', 'category': 'Turtle', 'params': ["'red'"] },
  {'func': 'show', 'title': "Show the turtle image at its current location", 'category': 'Turtle' },
  {'func': 'hide', 'title': "Hide the turtle image", 'category': 'Turtle' },

  {'func': 'setTimeout', 'title': 'Set a timer and execute code when that number of milliseconds has elapsed', 'category': 'Control', 'params': ["function() {\n  \n}", "1000"] },
  {'func': 'clearTimeout', 'title': 'Clear an existing timer by passing in the value returned from setTimeout()', 'category': 'Control', 'params': ["0"] },

  {'func': 'container', 'title': 'Create a division container with the specified element id, and optionally set its inner HTML', 'category': 'Advanced', 'params': ["'id'", "'html'"] },
  {'func': 'innerHTML', 'title': 'Set the inner HTML for the element with the specified id', 'category': 'Advanced', 'params': ["'id'", "'html'"] },
  {'func': 'setParent', 'title': 'Set an element to become a child of a parent element', 'category': 'Advanced', 'params': ["'id'", "'parentId'"] },
  {'func': 'setStyle', 'title': 'Add CSS style text to an element', 'category': 'Advanced', 'params': ["'id'", "'color:red;'"] },
  {'func': 'getAttribute', 'category': 'Advanced', 'params': ["'id'", "'scrollHeight'"], 'type': 'value' },
  {'func': 'setAttribute', 'category': 'Advanced', 'params': ["'id'", "'scrollHeight'", "200"]},
];

module.exports.categories = {
  'UI controls': {
    'color': 'red',
    'blocks': []
  },
  'Canvas': {
    'color': 'yellow',
    'blocks': []
  },
  'Data': {
    'color': 'orange',
    'blocks': []
  },
  'Turtle': {
    'color': 'yellow',
    'blocks': []
  },
  'Advanced': {
    'color': 'blue',
    'blocks': []
  },
  'Control': {
    'color': 'blue',
    'blocks': []
  },
};
