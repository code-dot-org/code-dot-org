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
"and":function(d){return "és"},
"booleanTrue":function(d){return "igaz"},
"booleanFalse":function(d){return "hamis"},
"blocks":function(d){return "blokk"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Műveletek"},
"catColour":function(d){return "Szín"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Listák"},
"catLoops":function(d){return "Ciklusok"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkciók"},
"catText":function(d){return "szöveg"},
"catVariables":function(d){return "Változók"},
"clearPuzzle":function(d){return "Újrakezdés"},
"clearPuzzleConfirm":function(d){return "Visszaállítja a kiindulási állapotot és töröl minden blokkot, amit hozzáadtál a programhoz, vagy amit megváltoztattál."},
"clearPuzzleConfirmHeader":function(d){return "Biztosan újra szeretnéd kezdeni?"},
"codeMode":function(d){return "Kód"},
"codeTooltip":function(d){return "Lássuk a generált JavaScript kódot."},
"continue":function(d){return "Tovább"},
"designMode":function(d){return "Megjelenés"},
"designModeHeader":function(d){return "Tervező mód"},
"dialogCancel":function(d){return "Mégsem"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "Észak"},
"directionSouthLetter":function(d){return "Dél"},
"directionEastLetter":function(d){return "Kelet"},
"directionWestLetter":function(d){return "Nyugat"},
"dropletBlock_addOperator_description":function(d){return "Adjon meg két értéket"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "A teknőcöt óramutató járással szemben mozgatja a meghatározott szögben és sugárban"},
"dropletBlock_arcRight_description":function(d){return "A teknőcöt óramutató járással egyezően mozgatja a meghatározott szögben és sugárban"},
"dropletBlock_assign_x_description":function(d){return "Újra hozzárandel egy változót"},
"dropletBlock_button_description":function(d){return "Létrehoz egy gombot és hozzárendeli egy elemhez"},
"dropletBlock_callMyFunction_description":function(d){return "A függvény használata változó nélkül"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_callMyFunction_n_description":function(d){return "A függvény használata változóval"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_changeScore_description":function(d){return "Adj hozzá vagy vegyél el egy pontot a pontszámból."},
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
"dropletBlock_createCanvas_param2":function(d){return "magasság"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_moveBackward_param0":function(d){return "képpontok"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "képpontok"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "function"},
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
"dropletBlock_rect_param3":function(d){return "magasság"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Add meg a háttér képet"},
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
"dropletBlock_setSprite_description":function(d){return "A szereplő külsejének beállítása"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Szereplő hangulatának beállítása"},
"dropletBlock_setSpritePosition_description":function(d){return "Egy szereplő azonnal átkerül a megadott helyre."},
"dropletBlock_setSpriteSpeed_description":function(d){return "A szereplő sebességének beállítása"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Adott karakter dobja a lövedéket."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Eltünteti a szereplőt."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "vége"},
"emptyBlocksErrorMsg":function(d){return "Ahhoz hogy az \"Ismételd\" vagy a \"Ha\" blokkok működjenek, más blokkoknak is kell bennük lenni. Győződj meg arról, hogy a belső blokk megfelelően illeszkedik a külső befogadó blokkhoz."},
"emptyFunctionalBlock":function(d){return "Van egy blokkod kitöltetlen bemenettel."},
"emptyFunctionBlocksErrorMsg":function(d){return "A függvény blokkon belül lenni kell más blokkoknak is ahhoz, hogy működjön."},
"errorEmptyFunctionBlockModal":function(d){return "A függvénydeklarációdban blokkoknak kell lenni. Kattints a \"szerkesztés\" gombra, és húzd be a blokkokat a zöld blokkba."},
"errorIncompleteBlockInFunction":function(d){return "Kattints a \"szerkesztés\"-re, hogy pótold az esetlegesen hiányzó blokkokat a függvénydeklarációdból."},
"errorParamInputUnattached":function(d){return "Ne felejts a munkaterületen levő függvények minden bemenő paraméteréhez egy blokkot illeszteni."},
"errorUnusedParam":function(d){return "Hozzáadtál egy paraméterblokkot, de nem használtad fel azt a deklarálásodban. Győződj meg róla, hogy használod a paraméteredet, rákattintva a \"szerkesztés\"-re  és arról is, hogy bele van-e illesztve a paraméterblokkod a zöld blokkba!"},
"errorRequiredParamsMissing":function(d){return "Hozz létre egy paramétert a függvényed számára a \"szerkesztés\"-re kattintva, és hozzáadva a szükséges paramétereket! Húzd az új paraméterblokkokat a függvénydeklarációdra!"},
"errorUnusedFunction":function(d){return "Létrehoztál egy függvényt, de soha sem használtad fel azt a munkaterületeden! Kattints a \"Függvények\"-re az eszközkészleten, és győződj meg róla, hogy használod a függvényt a programodban."},
"errorQuestionMarksInNumberField":function(d){return "Próbálj a \"???\" helyére értéket írni."},
"extraTopBlocks":function(d){return "Különálló blokkjaid vannak. A \"futtatáskor\" blokkhoz akartad ezeket csatolni?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt."},
"finalStageTrophies":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"finish":function(d){return "Kész"},
"generatedCodeInfo":function(d){return "Még a legjobb egyetemeken (pl. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+") is tanítanak blokk alapú programozást, de a felszín alatt az általad összeállított blokkok is megjeleníthetők JavaScriptben, a világ legszélesebb körben használt programozási nyelvén:"},
"hashError":function(d){return "Sajnálom, de \"%1\" nem felel meg egyetlen mentett programnak sem."},
"help":function(d){return "Segítség"},
"hintTitle":function(d){return "Tanács:"},
"jump":function(d){return "Ugorj"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Minden szükséges blokkot felhasználtál, de nem megfelelően."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Készíts saját Flappy játékot"},
"missingBlocksErrorMsg":function(d){return "A feladvány megoldásához használj egy vagy több blokkot az alábbiak közül."},
"nextLevel":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt."},
"nextLevelTrophies":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"nextStage":function(d){return "Gratulálok! Teljesítetted a(z) "+locale.v(d,"stageName")+" szakaszt."},
"nextStageTrophies":function(d){return "Gratulálok! Teljesítetted a(z) "+locale.v(d,"stageNumber")+". szintet és nyertél "+locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":locale.n(d,"numTrophies")+" trófeát"})+"."},
"numBlocksNeeded":function(d){return "Gratulálok! Megoldottad a "+locale.v(d,"puzzleNumber")+". feladványt. (Habár megoldható csupán "+locale.p(d,"numBlocks",0,"hu",{"one":"1 blokk","other":locale.n(d,"numBlocks")+" blokk"})+" használatával.)"},
"numLinesOfCodeWritten":function(d){return "Éppen most írtál újabb "+locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":locale.n(d,"numLines")+" sor"})+" kódot!"},
"play":function(d){return "lejátszás"},
"print":function(d){return "Nyomtatás"},
"puzzleTitle":function(d){return locale.v(d,"puzzle_number")+"/"+locale.v(d,"stage_total")+". feladvány"},
"repeat":function(d){return "ismételd"},
"resetProgram":function(d){return "Visszaállítás"},
"runProgram":function(d){return "Futtatás"},
"runTooltip":function(d){return "A munkalapon összeépített program futtatása."},
"score":function(d){return "pontszám"},
"showCodeHeader":function(d){return "Kód megjelenítése"},
"showBlocksHeader":function(d){return "Blokkok megjelenítése"},
"showGeneratedCode":function(d){return "Kód megjelenítése"},
"stringEquals":function(d){return "string =?"},
"subtitle":function(d){return "vizuális programozási felület"},
"textVariable":function(d){return "szöveg"},
"tooFewBlocksMsg":function(d){return "A megfelelő blokkokat használod, de próbálj meg többet használni belőlük, hogy megoldd a feladványt."},
"tooManyBlocksMsg":function(d){return "Ez a feladvány megoldható <x id='START_SPAN'/><x id='END_SPAN'/> blokkal."},
"tooMuchWork":function(d){return "Sokat dolgoztattál. Megpróbálnád egy kicsit kevesebb ismétléssel?"},
"toolboxHeader":function(d){return "blokkok"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "Hogyan is működik"},
"totalNumLinesOfCodeWritten":function(d){return "Összesített eredmény: "+locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":locale.n(d,"numLines")+" sor"})+" kód."},
"tryAgain":function(d){return "Próbáld újra"},
"hintRequest":function(d){return "Segítség"},
"backToPreviousLevel":function(d){return "Vissza az előző szintre"},
"saveToGallery":function(d){return "Mentés a galériába"},
"savedToGallery":function(d){return "Elmentve a galériába!"},
"shareFailure":function(d){return "Sajnálom, de nem tudjuk megosztani ezt a programot."},
"workspaceHeaderShort":function(d){return "Munkaterület: "},
"infinity":function(d){return "Végtelen"},
"rotateText":function(d){return "Fordítsd el a készüléked."},
"orientationLock":function(d){return "Kapcsold ki a tájolási zárat az eszközbeállításokban."},
"wantToLearn":function(d){return "Szeretnél megtanulni programozni?"},
"watchVideo":function(d){return "Nézd meg a videót"},
"when":function(d){return "amikor"},
"whenRun":function(d){return "futtatáskor"},
"tryHOC":function(d){return "Próbáld ki a Kódolás Óráját"},
"signup":function(d){return "Regisztrálj a bevezető képzésre"},
"hintHeader":function(d){return "Itt egy ötlet:"},
"genericFeedback":function(d){return "Nézd meg hogy milyen lett, és próbáld meg kijavítani a programod."},
"toggleBlocksErrorMsg":function(d){return "Ki kell javítanod egy hibát a programodban, mielőtt blokként megjelenhetne."},
"defaultTwitterText":function(d){return "Nézd meg, mit csináltam"}};