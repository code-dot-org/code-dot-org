var locale = {lc:{"ar":function(n){
  if (n === 0) {
    return 'zero';
  }
  if (n == 1) {
    return 'one';
  }
  if (n == 2) {
    return 'two';
  }
  if ((n % 100) >= 3 && (n % 100) <= 10 && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 99 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"},"cs":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "dhe"},
"booleanTrue":function(d){return "e saktë"},
"booleanFalse":function(d){return "e gabuar"},
"blocks":function(d){return "bllok"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Veprimet"},
"catColour":function(d){return "Ngjyra"},
"catLogic":function(d){return "Logjika"},
"catLists":function(d){return "Listat"},
"catLoops":function(d){return "perseritje"},
"catMath":function(d){return "Matematikë"},
"catProcedures":function(d){return "funksionet"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "variabla"},
"clearPuzzle":function(d){return "Fillo nga fillimi"},
"clearPuzzleConfirm":function(d){return "Kjo do ta rikthejë pazëllin ne gjëndjen fillestare dhe do te fshijë gjithë blloqet qe ti ke shtuar ose ke ndryshuar."},
"clearPuzzleConfirmHeader":function(d){return "A jeni i sigurt qe doni te filloni nga fillimi?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Shikoni kodin e gjeneruar në JavaScript."},
"continue":function(d){return "Vazhdo"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Design Mode"},
"dialogCancel":function(d){return "Anullo"},
"dialogOK":function(d){return "Ne rregull"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "Move the turtle in a counterclockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_button_description":function(d){return "Create a button and assign it an element id"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_changeScore_description":function(d){return "Shto ose hiq një pikë tek rezultati."},
"dropletBlock_checkbox_description":function(d){return "Create a checkbox and assign it an element id"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_clearCanvas_description":function(d){return "Clear all data on the active canvas"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param2":function(d){return "gjatësia"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_deleteElement_description":function(d){return "Delete the element with the specified id"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "record"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAttribute_description":function(d){return "Gets the given attribute"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Get the state of a checkbox or radio button"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Get the text from the specified element"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getXPosition_description":function(d){return "Get the element's x position"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_getYPosition_description":function(d){return "Get the element's y position"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "piksela"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "piksela"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_onEvent_description":function(d){return "Ekzekuto kodin në përgjigje te eventit specifik."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "funksion"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "color"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Pick up the turtle's pen"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "onSuccess"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "width"},
"dropletBlock_rect_param3":function(d){return "gjatësia"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Vendos sfondin e imazhit"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param2":function(d){return "callbackFunction"},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGBA_description":function(d){return "Sets the given value"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setSprite_description":function(d){return "Vendos imazhin e pjesmarrësit"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Vendos gjëndjen e pjesmarrësit"},
"dropletBlock_setSpritePosition_description":function(d){return "Lëviz menjëherë pjesmarrësin në vendin e caktuar."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Vendos shpejtësinë e pjesmarrësit"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "funksion"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "funksion"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Hedh një raketë nga një pjesmarrës i caktuar."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Zhduk pjesmarrësin."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "fundi"},
"emptyBlocksErrorMsg":function(d){return "Blloku \"Përsërit\" ose \"Nëse\"  ka nevojë të ketë blloqe të tjera brënda në mënyrë që të funksionojë. Sigurohu që blloku i brendshëm të përshtatet në mënyrë sa më të mirë brenda bllokut që e përmban."},
"emptyFunctionalBlock":function(d){return "Ti ke një bllok me një input të pambushur."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blloku i funksionit ka nevojë për blloqe të tjera brënda, në mënyrë që të funksionojë."},
"errorEmptyFunctionBlockModal":function(d){return "Duhet që të ketë blloqe brenda përcaktimit të funksionit tënd. Kliko \"redakto\" dhe zhvendos blloqet brenda bllokut të gjelbër."},
"errorIncompleteBlockInFunction":function(d){return "Kliko \"redakto\" për tu siguruar që nuk mungon ndonjë bllok brenda përcaktimit të funksionit tënd."},
"errorParamInputUnattached":function(d){return "Kujtohu që të bashkangjitësh një bllok në çdo parametër që futet në bllokun e funksionit tek zona juaj e punimit."},
"errorUnusedParam":function(d){return "Ti shtove një bllok parametër, por nuk e përdore atë në përcaktim. Sigurohu që të përdorësh parametrin tënd duke klikuar \"redakto\" dhe duke vendosur këtë parametër bllok brenda bllokut të gjelbër."},
"errorRequiredParamsMissing":function(d){return "Krijo një parametër për funksionin tënd duke klikuar \"redakto\" dhe duke shtuar parametrat e nevojshëm. Zhvendos blloqet e reja me parametra brenda në përcaktimin e funksionit tënd."},
"errorUnusedFunction":function(d){return "Ti krijove një funksion, por nuk e përdore asnjëherë në hapësirën tënde të punës! Kliko tek \"Funksionet\" në grupin e komandave dhe sigurohu që ta përdorësh atë në programin tënd."},
"errorQuestionMarksInNumberField":function(d){return "Përpiqu të zëvendësosh \"???\" me një vlerë."},
"extraTopBlocks":function(d){return "Ti ke blloqe që nuk janë të bashkuar. Mendove të bashkosh ato me bllokun \"kur vrapon\"?"},
"finalStage":function(d){return "Urime! Ju sapo perfunduat fazen finale "},
"finalStageTrophies":function(d){return "Urime! Ti ke përfunduar fazën finale dhe ke fituar "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Përfundo"},
"generatedCodeInfo":function(d){return "Edhe universitetet më të mira të mësojnë kodimin e bazuar në blloqe (psh "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Por mbrapa asaj çfarë shohim, blloqet të cilat ke mbledhur, mund të shfaqen në JavaScript, në gjuhën më të përdorur të kodimit:"},
"hashError":function(d){return "Më vjen keq, '%1' nuk përputhet me asnjë program të ruajtur."},
"help":function(d){return "Ndihmë"},
"hintTitle":function(d){return "Ndihmes:"},
"jump":function(d){return "hidhu"},
"keepPlaying":function(d){return "Vazhdoni luani"},
"levelIncompleteError":function(d){return "Ti je duke përdorur të gjithë tipet e nevojshëm të blloqeve, por jo në mënyrën e duhur."},
"listVariable":function(d){return "listë"},
"makeYourOwnFlappy":function(d){return "Bëj lojën tënde Flappy"},
"missingBlocksErrorMsg":function(d){return "Përdor një ose më shumë nga blloqet e mëposhtme për të zgjidhur këtë puzzle."},
"nextLevel":function(d){return "Urime ju e perfunduat Puzzle-n "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Urime! Ti përfundove Puzzle "+locale.v(d,"puzzleNumber")+" dhe fitove "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Urime! Ti përfundove "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Urime! Ti përfundove "+locale.v(d,"stageName")+" dhe fitove "+locale.p(d,"numTrophies",0,"sq",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Urime! Ti përfundove Puzzle "+locale.v(d,"puzzleNumber")+". (Megjithatë, ti mund të kishe përdorur vetëm "+locale.p(d,"numBlocks",0,"sq",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ti sapo shkruajte "+locale.p(d,"numLines",0,"sq",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" të kodit!"},
"play":function(d){return "luaj"},
"print":function(d){return "Shtyp"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" i "+locale.v(d,"stage_total")},
"repeat":function(d){return "përsërit"},
"resetProgram":function(d){return "Rivendosni"},
"runProgram":function(d){return "Ekzekuto"},
"runTooltip":function(d){return "Ekzekuto programin e përcaktuar nga blloqet, në hapësirën tënde të punës."},
"score":function(d){return "rezultati"},
"showCodeHeader":function(d){return "Shfaq kodin"},
"showBlocksHeader":function(d){return "Shfaq Blloqet"},
"showGeneratedCode":function(d){return "Shfaq kodin"},
"stringEquals":function(d){return "vargu=?"},
"subtitle":function(d){return "një mjedis i dukshëm programimi"},
"textVariable":function(d){return "teksti"},
"tooFewBlocksMsg":function(d){return "Ti je duke i përdorur të gjithë tipet e nevojshëm të blloqeve, por përpiqu të përdorësh më shumë nga këto tipe blloqesh për të përfunduar këtë puzzle."},
"tooManyBlocksMsg":function(d){return "Ky puzzle mund të zgjidhet me blloqet <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Ti më detyrove të bëj shumë veprime! Mund të përpiqesh ta përsërisësh me më pak hapa?"},
"toolboxHeader":function(d){return "Blloqet"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "Si Funksionon"},
"totalNumLinesOfCodeWritten":function(d){return "Totali i gjithë kohës: "+locale.p(d,"numLines",0,"sq",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" i kodit."},
"tryAgain":function(d){return "Provo perseri"},
"hintRequest":function(d){return "Shih ndihmën"},
"backToPreviousLevel":function(d){return "Kthehu në nivelin e mëparshëm"},
"saveToGallery":function(d){return "Ruaj tek galeria"},
"savedToGallery":function(d){return "U ruajt në galeri!"},
"shareFailure":function(d){return "Më vjen keq, ne nuk mund ta ndajmë këtë program."},
"workspaceHeaderShort":function(d){return "Vendi i punës: "},
"infinity":function(d){return "Pafundësi"},
"rotateText":function(d){return "Rrotullo pajisjen tënde."},
"orientationLock":function(d){return "Fik orientimet në konfigurimet e pajisjes."},
"wantToLearn":function(d){return "Dëshiron të mësosh se si të kodosh?"},
"watchVideo":function(d){return "Shiko Videon"},
"when":function(d){return "kur"},
"whenRun":function(d){return "kur vrapon"},
"tryHOC":function(d){return "Provo Orën e Kodimit"},
"signup":function(d){return "Rregjistrohu për kursin hyrës"},
"hintHeader":function(d){return "Ja ku është një këshillë:"},
"genericFeedback":function(d){return "Shiko se si përfundove dhe përpiqu të rregullosh programin tënd."},
"toggleBlocksErrorMsg":function(d){return "Ti duhet të rregullosh një gabim në programin tënd përpara se të shfaqet si blloqet."},
"defaultTwitterText":function(d){return "Shiko se çfarë bëra"}};