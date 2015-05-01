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
"and":function(d){return "!!-and-!!"},
"backToPreviousLevel":function(d){return "!!-Back to previous level-!!"},
"blocklyMessage":function(d){return "!!-Blockly-!!"},
"blocks":function(d){return "!!-blocks-!!"},
"booleanFalse":function(d){return "!!-false-!!"},
"booleanTrue":function(d){return "!!-true-!!"},
"catActions":function(d){return "!!-Actions-!!"},
"catColour":function(d){return "!!-Color-!!"},
"catLists":function(d){return "!!-Lists-!!"},
"catLogic":function(d){return "!!-Logic-!!"},
"catLoops":function(d){return "!!-Loops-!!"},
"catMath":function(d){return "!!-Math-!!"},
"catProcedures":function(d){return "!!-Functions-!!"},
"catText":function(d){return "!!-Text-!!"},
"catVariables":function(d){return "!!-Variables-!!"},
"clearPuzzle":function(d){return "!!-Start Over-!!"},
"clearPuzzleConfirm":function(d){return "!!-This will reset the puzzle to its start state and delete all the blocks you've added or changed.-!!"},
"clearPuzzleConfirmHeader":function(d){return "!!-Are you sure you want to start over?-!!"},
"codeMode":function(d){return "!!-Code-!!"},
"codeTooltip":function(d){return "!!-See generated JavaScript code.-!!"},
"continue":function(d){return "!!-Continue-!!"},
"defaultTwitterText":function(d){return "!!-Check out what I made-!!"},
"designMode":function(d){return "!!-Design-!!"},
"designModeHeader":function(d){return "!!-Design Mode-!!"},
"dialogCancel":function(d){return "!!-Cancel-!!"},
"dialogOK":function(d){return "!!-OK-!!"},
"directionEastLetter":function(d){return "!!-E-!!"},
"directionNorthLetter":function(d){return "!!-N-!!"},
"directionSouthLetter":function(d){return "!!-S-!!"},
"directionWestLetter":function(d){return "!!-W-!!"},
"dropletBlock_addOperator_description":function(d){return "!!-Add two numbers-!!"},
"dropletBlock_addOperator_signatureOverride":function(d){return "!!-Add operator-!!"},
"dropletBlock_andOperator_description":function(d){return "!!-Returns true only when both expressions are true and false otherwise-!!"},
"dropletBlock_andOperator_signatureOverride":function(d){return "!!-AND boolean operator-!!"},
"dropletBlock_arcLeft_description":function(d){return "!!-Moves the turtle forward and to the left in a smooth circular arc-!!"},
"dropletBlock_arcLeft_param0":function(d){return "!!-angle-!!"},
"dropletBlock_arcLeft_param0_description":function(d){return "!!-The angle along the circle to move.-!!"},
"dropletBlock_arcLeft_param1":function(d){return "!!-radius-!!"},
"dropletBlock_arcLeft_param1_description":function(d){return "!!-The radius of the circle that is placed left of the turtle. Must be >= 0.-!!"},
"dropletBlock_arcRight_description":function(d){return "!!-Moves the turtle forward and to the right in a smooth circular arc-!!"},
"dropletBlock_arcRight_param0":function(d){return "!!-angle-!!"},
"dropletBlock_arcRight_param0_description":function(d){return "!!-The angle along the circle to move.-!!"},
"dropletBlock_arcRight_param1":function(d){return "!!-radius-!!"},
"dropletBlock_arcRight_param1_description":function(d){return "!!-The radius of the circle that is placed right of the turtle. Must be >= 0.-!!"},
"dropletBlock_assign_x_description":function(d){return "!!-Assigns a value to an existing variable. For example, x = 0;-!!"},
"dropletBlock_assign_x_param0":function(d){return "!!-x-!!"},
"dropletBlock_assign_x_param0_description":function(d){return "!!-The variable name being assigned to-!!"},
"dropletBlock_assign_x_param1":function(d){return "!!-value-!!"},
"dropletBlock_assign_x_param1_description":function(d){return "!!-The value the variable is being assigned to.-!!"},
"dropletBlock_assign_x_signatureOverride":function(d){return "!!-Assign a variable-!!"},
"dropletBlock_button_description":function(d){return "!!-Creates a button that you can click on. The button will display the text provided and can be referenced by the given id-!!"},
"dropletBlock_button_param0":function(d){return "!!-buttonId-!!"},
"dropletBlock_button_param0_description":function(d){return "!!-A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers.-!!"},
"dropletBlock_button_param1":function(d){return "!!-text-!!"},
"dropletBlock_button_param1_description":function(d){return "!!-The text displayed within the button.-!!"},
"dropletBlock_callMyFunction_description":function(d){return "!!-Calls a named function that takes no parameters-!!"},
"dropletBlock_callMyFunction_n_description":function(d){return "!!-Calls a named function that takes one or more parameters-!!"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "!!-Call a function with parameters-!!"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "!!-Call a function-!!"},
"dropletBlock_changeScore_description":function(d){return "!!-Add or remove a point to the score.-!!"},
"dropletBlock_checkbox_description":function(d){return "!!-Create a checkbox and assign it an element id-!!"},
"dropletBlock_checkbox_param0":function(d){return "!!-checkboxId-!!"},
"dropletBlock_checkbox_param1":function(d){return "!!-checked-!!"},
"dropletBlock_circle_description":function(d){return "!!-Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius-!!"},
"dropletBlock_circle_param0":function(d){return "!!-centerX-!!"},
"dropletBlock_circle_param0_description":function(d){return "!!-The x position in pixels of the center of the circle.-!!"},
"dropletBlock_circle_param1":function(d){return "!!-centerY-!!"},
"dropletBlock_circle_param1_description":function(d){return "!!-The y position in pixels of the center of the circle.-!!"},
"dropletBlock_circle_param2":function(d){return "!!-radius-!!"},
"dropletBlock_circle_param2_description":function(d){return "!!-The radius of the circle, in pixels.-!!"},
"dropletBlock_clearCanvas_description":function(d){return "!!-Clear all data on the active canvas-!!"},
"dropletBlock_clearInterval_description":function(d){return "!!-Clear an existing interval timer by passing in the value returned from setInterval()-!!"},
"dropletBlock_clearInterval_param0":function(d){return "!!-interval-!!"},
"dropletBlock_clearInterval_param0_description":function(d){return "!!-The value returned by the setInterval function to clear.-!!"},
"dropletBlock_clearTimeout_description":function(d){return "!!-Clear an existing timer by passing in the value returned from setTimeout()-!!"},
"dropletBlock_clearTimeout_param0":function(d){return "!!-timeout-!!"},
"dropletBlock_clearTimeout_param0_description":function(d){return "!!-The value returned by the setTimeout function to cancel.-!!"},
"dropletBlock_console.log_description":function(d){return "!!-Displays the string or variable in the console display-!!"},
"dropletBlock_console.log_param0":function(d){return "!!-message-!!"},
"dropletBlock_console.log_param0_description":function(d){return "!!-The message string to display in the console.-!!"},
"dropletBlock_container_description":function(d){return "!!-Create a division container with the specified element id, and optionally set its inner HTML-!!"},
"dropletBlock_createCanvas_description":function(d){return "!!-Create a canvas with the specified id, and optionally set width and height dimensions-!!"},
"dropletBlock_createCanvas_param0":function(d){return "!!-canvasId-!!"},
"dropletBlock_createCanvas_param0_description":function(d){return "!!-The id of the new canvas element.-!!"},
"dropletBlock_createCanvas_param1":function(d){return "!!-width-!!"},
"dropletBlock_createCanvas_param1_description":function(d){return "!!-The horizontal width in pixels of the rectangle.-!!"},
"dropletBlock_createCanvas_param2":function(d){return "!!-height-!!"},
"dropletBlock_createCanvas_param2_description":function(d){return "!!-The vertical height in pixels of the rectangle.-!!"},
"dropletBlock_createRecord_description":function(d){return "!!-Using App Lab's table data storage, creates a record with a unique id in the table name provided, and calls the callbackFunction when the action is finished.-!!"},
"dropletBlock_createRecord_param0":function(d){return "!!-tableName-!!"},
"dropletBlock_createRecord_param0_description":function(d){return "!!-The name of the table the record should be added to. `tableName` gets created if it doesn't exist.-!!"},
"dropletBlock_createRecord_param1":function(d){return "!!-record-!!"},
"dropletBlock_createRecord_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "!!-Declares a variable and assigns it to an array with the given initial values-!!"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "!!-x-!!"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "!!-The name you will use in the program to reference the variable-!!"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "!!-1,2,3,4-!!"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "!!-The initial values to the array-!!"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "!!-Declare a variable assigned to an array-!!"},
"dropletBlock_declareAssign_x_description":function(d){return "!!-Declares a variable with the given name after 'var', and assigns it to the value on the right side of the expression-!!"},
"dropletBlock_declareAssign_x_param0":function(d){return "!!-x-!!"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "!!-The name you will use in the program to reference the variable-!!"},
"dropletBlock_declareAssign_x_param1":function(d){return "!!-0-!!"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "!!-The initial value of the variable-!!"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "!!-Declares that the code will now use a variable and assign it an initial value provided by the user-!!"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "!!-x-!!"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "!!-The name you will use in the program to reference the variable-!!"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "!!-\"Enter value\"-!!"},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "!!-The string the user will see in the pop up when asked to enter a value-!!"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "!!-Prompt the user for a value and store it-!!"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "!!-Declare a variable-!!"},
"dropletBlock_deleteElement_description":function(d){return "!!-Delete the element with the specified id-!!"},
"dropletBlock_deleteElement_param0":function(d){return "!!-id-!!"},
"dropletBlock_deleteElement_param0_description":function(d){return "!!-The id of the element to delete.-!!"},
"dropletBlock_deleteRecord_description":function(d){return "!!-Using App Lab's table data storage, deletes the provided record in tableName. record is an object that must be uniquely identified with its id field. When the call is completed, the callbackFunction is called.-!!"},
"dropletBlock_deleteRecord_param0":function(d){return "!!-tableName-!!"},
"dropletBlock_deleteRecord_param0_description":function(d){return "!!-The name of the table from which the records should be searched and read.-!!"},
"dropletBlock_deleteRecord_param1":function(d){return "!!-record-!!"},
"dropletBlock_deleteRecord_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_deleteRecord_param2_description":function(d){return "!!-A function that is asynchronously called when the call to deleteRecord() is finished.-!!"},
"dropletBlock_divideOperator_description":function(d){return "!!-Divide two numbers-!!"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "!!-Divide operator-!!"},
"dropletBlock_dot_description":function(d){return "!!-Draws a dot in the turtle's location with the specified radius-!!"},
"dropletBlock_dot_param0":function(d){return "!!-radius-!!"},
"dropletBlock_dot_param0_description":function(d){return "!!-The radius of the dot to draw-!!"},
"dropletBlock_drawImage_description":function(d){return "!!-Draws the specified image or canvas element onto the active canvas at the specified position, and optionally scales the element to the specified width and height-!!"},
"dropletBlock_drawImage_param0":function(d){return "!!-id-!!"},
"dropletBlock_drawImage_param0_description":function(d){return "!!-The x position in pixels of the upper left corner of the image to draw.-!!"},
"dropletBlock_drawImage_param1":function(d){return "!!-x-!!"},
"dropletBlock_drawImage_param1_description":function(d){return "!!-The x position in pixels of the upper left corner of the image to draw.-!!"},
"dropletBlock_drawImage_param2":function(d){return "!!-y-!!"},
"dropletBlock_drawImage_param2_description":function(d){return "!!-The y position in pixels of the upper left corner of the image to draw.-!!"},
"dropletBlock_drawImage_param3":function(d){return "!!-width-!!"},
"dropletBlock_drawImage_param4":function(d){return "!!-height-!!"},
"dropletBlock_dropdown_description":function(d){return "!!-Create a dropdown, assign it an element id, and populate it with a list of items-!!"},
"dropletBlock_dropdown_signatureOverride":function(d){return "!!-dropdown(dropdownID, option1, option2, ..., optionX)-!!"},
"dropletBlock_equalityOperator_description":function(d){return "!!-Test whether two values are equal. Returns true if the value on the left-hand side of the expression equals the value on the right-hand side of the expression, and false otherwise-!!"},
"dropletBlock_equalityOperator_param0":function(d){return "!!-x-!!"},
"dropletBlock_equalityOperator_param0_description":function(d){return "!!-The first value to use for comparison.-!!"},
"dropletBlock_equalityOperator_param1":function(d){return "!!-y-!!"},
"dropletBlock_equalityOperator_param1_description":function(d){return "!!-The second value to use for comparison.-!!"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "!!-Equality operator-!!"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "!!-Creates a loop consisting of an initialization expression, a conditional expression, an incrementing expression, and a block of statements executed for each iteration of the loop-!!"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "!!-for loop-!!"},
"dropletBlock_functionParams_n_description":function(d){return "!!-A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called-!!"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "!!-Define a function with parameters-!!"},
"dropletBlock_functionParams_none_description":function(d){return "!!-A set of statements that perform a task or calculate a value when the function is called-!!"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "!!-Define a function-!!"},
"dropletBlock_getAlpha_description":function(d){return "!!-Returns the amount of alpha (opacity) (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data-!!"},
"dropletBlock_getAlpha_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_getAlpha_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_getAlpha_param1":function(d){return "!!-x-!!"},
"dropletBlock_getAlpha_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getAlpha_param2":function(d){return "!!-y-!!"},
"dropletBlock_getAlpha_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getAttribute_description":function(d){return "!!-Gets the given attribute-!!"},
"dropletBlock_getBlue_description":function(d){return "!!-Gets the amount of blue (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data-!!"},
"dropletBlock_getBlue_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_getBlue_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_getBlue_param1":function(d){return "!!-x-!!"},
"dropletBlock_getBlue_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getBlue_param2":function(d){return "!!-y-!!"},
"dropletBlock_getBlue_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getChecked_description":function(d){return "!!-Get the state of a checkbox or radio button-!!"},
"dropletBlock_getChecked_param0":function(d){return "!!-id-!!"},
"dropletBlock_getDirection_description":function(d){return "!!-Returns the current direction that the turtle is facing. 0 degrees is pointing up-!!"},
"dropletBlock_getGreen_description":function(d){return "!!-Gets the amount of green (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data-!!"},
"dropletBlock_getGreen_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_getGreen_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_getGreen_param1":function(d){return "!!-x-!!"},
"dropletBlock_getGreen_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getGreen_param2":function(d){return "!!-y-!!"},
"dropletBlock_getGreen_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getImageData_description":function(d){return "!!-Returns an object representing the image data captured from the canvas in the coordinate range from startX, startY to endX, endY-!!"},
"dropletBlock_getImageData_param0":function(d){return "!!-startX-!!"},
"dropletBlock_getImageData_param0_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image to start the capture.-!!"},
"dropletBlock_getImageData_param1":function(d){return "!!-startY-!!"},
"dropletBlock_getImageData_param1_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image to start the capture.-!!"},
"dropletBlock_getImageData_param2":function(d){return "!!-endX-!!"},
"dropletBlock_getImageData_param2_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image to end the capture.-!!"},
"dropletBlock_getImageData_param3":function(d){return "!!-endY-!!"},
"dropletBlock_getImageData_param3_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image to end the capture.-!!"},
"dropletBlock_getImageURL_description":function(d){return "!!-Get the URL for the provided image element id-!!"},
"dropletBlock_getImageURL_param0":function(d){return "!!-imageId-!!"},
"dropletBlock_getImageURL_param0_description":function(d){return "!!-The id of the image element.-!!"},
"dropletBlock_getKeyValue_description":function(d){return "!!-Retrieves the value stored at the provided key name in App Lab's key/value data storage. The value is returned as a parameter to callbackFunction when the retrieval is finished-!!"},
"dropletBlock_getKeyValue_param0":function(d){return "!!-key-!!"},
"dropletBlock_getKeyValue_param0_description":function(d){return "!!-The name of the key to be retrieved.-!!"},
"dropletBlock_getKeyValue_param1":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_getRed_description":function(d){return "!!-Gets the amount of red (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data-!!"},
"dropletBlock_getRed_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_getRed_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_getRed_param1":function(d){return "!!-x-!!"},
"dropletBlock_getRed_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getRed_param2":function(d){return "!!-y-!!"},
"dropletBlock_getRed_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_getText_description":function(d){return "!!-Get the text from the specified element-!!"},
"dropletBlock_getText_param0":function(d){return "!!-id-!!"},
"dropletBlock_getTime_description":function(d){return "!!-Get the current time in milliseconds-!!"},
"dropletBlock_getUserId_description":function(d){return "!!-Gets a unique identifier for the current user of this app-!!"},
"dropletBlock_getXPosition_description":function(d){return "!!-Get the element's x position-!!"},
"dropletBlock_getXPosition_param0":function(d){return "!!-id-!!"},
"dropletBlock_getX_description":function(d){return "!!-Gets the current x coordinate in pixels of the turtle-!!"},
"dropletBlock_getYPosition_description":function(d){return "!!-Get the element's y position-!!"},
"dropletBlock_getYPosition_param0":function(d){return "!!-id-!!"},
"dropletBlock_getY_description":function(d){return "!!-Gets the current y coordinate in pixels of the turtle-!!"},
"dropletBlock_greaterThanOperator_description":function(d){return "!!-Tests whether a number is greater than another number. Returns true if the value on the left-hand side of the expression is strictly greater than the value on the right-hand side of the expression-!!"},
"dropletBlock_greaterThanOperator_param0":function(d){return "!!-x-!!"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "!!-The first value to use for comparison.-!!"},
"dropletBlock_greaterThanOperator_param1":function(d){return "!!-y-!!"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "!!-The second value to use for comparison.-!!"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "!!-Greater than operator-!!"},
"dropletBlock_hideElement_description":function(d){return "!!-Hides the element with the provided id so it is not shown on the screen-!!"},
"dropletBlock_hideElement_param0":function(d){return "!!-id-!!"},
"dropletBlock_hideElement_param0_description":function(d){return "!!-The id of the element to hide.-!!"},
"dropletBlock_hide_description":function(d){return "!!-Hides the turtle so it is not shown on the screen-!!"},
"dropletBlock_ifBlock_description":function(d){return "!!-Executes a block of statements if the specified condition is true-!!"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "!!-if statement-!!"},
"dropletBlock_ifElseBlock_description":function(d){return "!!-Executes a block of statements if the specified condition is true; otherwise, the block of statements in the else clause are executed-!!"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "!!-if/else statement-!!"},
"dropletBlock_imageUploadButton_description":function(d){return "!!-Create an image upload button and assign it an element id-!!"},
"dropletBlock_image_description":function(d){return "!!-Displays the image from the provided url on the screen-!!"},
"dropletBlock_image_param0":function(d){return "!!-id-!!"},
"dropletBlock_image_param0_description":function(d){return "!!-The id of the image element.-!!"},
"dropletBlock_image_param1":function(d){return "!!-url-!!"},
"dropletBlock_image_param1_description":function(d){return "!!-The source URL of the image to be displayed on screen.-!!"},
"dropletBlock_inequalityOperator_description":function(d){return "!!-Tests whether two values are not equal. Returns true if the value on the left-hand side of the expression does not equal the value on the right-hand side of the expression-!!"},
"dropletBlock_inequalityOperator_param0":function(d){return "!!-x-!!"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "!!-The first value to use for comparison.-!!"},
"dropletBlock_inequalityOperator_param1":function(d){return "!!-y-!!"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "!!-The second value to use for comparison.-!!"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "!!-Inequality operator-!!"},
"dropletBlock_innerHTML_description":function(d){return "!!-Set the inner HTML for the element with the specified id-!!"},
"dropletBlock_lessThanOperator_description":function(d){return "!!-Tests whether a value is less than another value. Returns true if the value on the left-hand side of the expression is strictly less than the value on the right-hand side of the expression-!!"},
"dropletBlock_lessThanOperator_param0":function(d){return "!!-x-!!"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "!!-The first value to use for comparison.-!!"},
"dropletBlock_lessThanOperator_param1":function(d){return "!!-y-!!"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "!!-The second value to use for comparison.-!!"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "!!-Less than operator-!!"},
"dropletBlock_line_description":function(d){return "!!-Draws a line on the active canvas from x1, y1 to x2, y2.-!!"},
"dropletBlock_line_param0":function(d){return "!!-x1-!!"},
"dropletBlock_line_param0_description":function(d){return "!!-The x position in pixels of the beginning of the line.-!!"},
"dropletBlock_line_param1":function(d){return "!!-y1-!!"},
"dropletBlock_line_param1_description":function(d){return "!!-The y position in pixels of the beginning of the line.-!!"},
"dropletBlock_line_param2":function(d){return "!!-x2-!!"},
"dropletBlock_line_param2_description":function(d){return "!!-The x position in pixels of the end of the line.-!!"},
"dropletBlock_line_param3":function(d){return "!!-y2-!!"},
"dropletBlock_line_param3_description":function(d){return "!!-The y position in pixels of the end of the line.-!!"},
"dropletBlock_mathAbs_description":function(d){return "!!-Takes the absolute value of x-!!"},
"dropletBlock_mathAbs_param0":function(d){return "!!-x-!!"},
"dropletBlock_mathAbs_param0_description":function(d){return "!!-An arbitrary number.-!!"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "!!-Math.abs(x)-!!"},
"dropletBlock_mathMax_description":function(d){return "!!-Takes the maximum value among one or more values n1, n2, ..., nX-!!"},
"dropletBlock_mathMax_param0":function(d){return "!!-n1, n2,..., nX-!!"},
"dropletBlock_mathMax_param0_description":function(d){return "!!-One or more numbers to compare.-!!"},
"dropletBlock_mathMax_signatureOverride":function(d){return "!!-Math.max(n1, n2, ..., nX)-!!"},
"dropletBlock_mathMin_description":function(d){return "!!-Takes the minimum value among one or more values n1, n2, ..., nX-!!"},
"dropletBlock_mathMin_param0":function(d){return "!!-n1, n2,..., nX-!!"},
"dropletBlock_mathMin_param0_description":function(d){return "!!-One or more numbers to compare.-!!"},
"dropletBlock_mathMin_signatureOverride":function(d){return "!!-Math.min(n1, n2, ..., nX)-!!"},
"dropletBlock_mathRound_description":function(d){return "!!-Rounds a number to the nearest integer-!!"},
"dropletBlock_mathRound_param0":function(d){return "!!-x-!!"},
"dropletBlock_mathRound_param0_description":function(d){return "!!-An arbitrary number.-!!"},
"dropletBlock_mathRound_signatureOverride":function(d){return "!!-Math.round(x)-!!"},
"dropletBlock_moveBackward_description":function(d){return "!!-Moves the turtle back a given number of pixels in its current direction-!!"},
"dropletBlock_moveBackward_param0":function(d){return "!!-pixels-!!"},
"dropletBlock_moveBackward_param0_description":function(d){return "!!-The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels-!!"},
"dropletBlock_moveForward_description":function(d){return "!!-Moves the turtle forward a given number of pixels in its current direction-!!"},
"dropletBlock_moveForward_param0":function(d){return "!!-pixels-!!"},
"dropletBlock_moveForward_param0_description":function(d){return "!!-The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels-!!"},
"dropletBlock_moveTo_description":function(d){return "!!-Moves the turtle to a specific x,y coordinate on the screen-!!"},
"dropletBlock_moveTo_param0":function(d){return "!!-x-!!"},
"dropletBlock_moveTo_param0_description":function(d){return "!!-The x coordinate on the screen to move the turtle.-!!"},
"dropletBlock_moveTo_param1":function(d){return "!!-y-!!"},
"dropletBlock_moveTo_param1_description":function(d){return "!!-The y coordinate on the screen to move the turtle.-!!"},
"dropletBlock_move_description":function(d){return "!!-Moves the turtle from its current location. Adds x to the turtle's x position and y to the turtle's y position-!!"},
"dropletBlock_move_param0":function(d){return "!!-x-!!"},
"dropletBlock_move_param0_description":function(d){return "!!-The number of pixels to move the turtle right.-!!"},
"dropletBlock_move_param1":function(d){return "!!-y-!!"},
"dropletBlock_move_param1_description":function(d){return "!!-The number of pixels to move the turtle down.-!!"},
"dropletBlock_multiplyOperator_description":function(d){return "!!-Multiply two numbers-!!"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "!!-Multiply operator-!!"},
"dropletBlock_notOperator_description":function(d){return "!!-Returns false if the expression can be converted to true; otherwise, returns true-!!"},
"dropletBlock_notOperator_signatureOverride":function(d){return "!!-NOT boolean operator-!!"},
"dropletBlock_onEvent_description":function(d){return "!!-Execute the callbackFunction code when a specific event type occurs for the specified element-!!"},
"dropletBlock_onEvent_param0":function(d){return "!!-id-!!"},
"dropletBlock_onEvent_param0_description":function(d){return "!!-The ID of the UI control to which this function applies.-!!"},
"dropletBlock_onEvent_param1":function(d){return "!!-type-!!"},
"dropletBlock_onEvent_param1_description":function(d){return "!!-The type of event to respond to.-!!"},
"dropletBlock_onEvent_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_onEvent_param2_description":function(d){return "!!-A function to execute.-!!"},
"dropletBlock_orOperator_description":function(d){return "!!-Returns true when either expression is true and false otherwise-!!"},
"dropletBlock_orOperator_signatureOverride":function(d){return "!!-OR boolean operator-!!"},
"dropletBlock_penColor_description":function(d){return "!!-Sets the color of the line drawn behind the turtle as it moves-!!"},
"dropletBlock_penColor_param0":function(d){return "!!-color-!!"},
"dropletBlock_penColor_param0_description":function(d){return "!!-The color of the line left behind the turtle as it moves-!!"},
"dropletBlock_penColour_description":function(d){return "!!-Sets the color of the line drawn behind the turtle as it moves-!!"},
"dropletBlock_penColour_param0":function(d){return "!!-color-!!"},
"dropletBlock_penDown_description":function(d){return "!!-Causes a line to be drawn behind the turtle as it moves-!!"},
"dropletBlock_penUp_description":function(d){return "!!-Stops the turtle from drawing a line behind it as it moves-!!"},
"dropletBlock_penWidth_description":function(d){return "!!-Changes the diameter of the circles drawn behind the turtle as it moves-!!"},
"dropletBlock_penWidth_param0":function(d){return "!!-width-!!"},
"dropletBlock_penWidth_param0_description":function(d){return "!!-The diameter of the circles drawn behind the turtle as it moves-!!"},
"dropletBlock_playSound_description":function(d){return "!!-Play the MP3, OGG, or WAV sound file from the specified URL-!!"},
"dropletBlock_playSound_param0":function(d){return "!!-url-!!"},
"dropletBlock_putImageData_description":function(d){return "!!-Puts the input image data onto the current canvas element starting at position startX, startY-!!"},
"dropletBlock_putImageData_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_putImageData_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_putImageData_param1":function(d){return "!!-startX-!!"},
"dropletBlock_putImageData_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image to place the data on the canvas.-!!"},
"dropletBlock_putImageData_param2":function(d){return "!!-startY-!!"},
"dropletBlock_putImageData_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image to place the data on the canvas.-!!"},
"dropletBlock_radioButton_description":function(d){return "!!-Creates a radio button and assigns it to a group for choosing from a predefined set of options. Only one radio button in a group can be selected at a time-!!"},
"dropletBlock_radioButton_param0":function(d){return "!!-id-!!"},
"dropletBlock_radioButton_param0_description":function(d){return "!!-A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers.-!!"},
"dropletBlock_radioButton_param1":function(d){return "!!-checked-!!"},
"dropletBlock_radioButton_param1_description":function(d){return "!!-Whether the radio button is initially checked.-!!"},
"dropletBlock_radioButton_param2":function(d){return "!!-group-!!"},
"dropletBlock_radioButton_param2_description":function(d){return "!!-The group that the radio button is associated with. Only one button in a group can be checked at a time.-!!"},
"dropletBlock_randomNumber_max_description":function(d){return "!!-Returns a random number ranging from zero to max, including both zero and max in the range-!!"},
"dropletBlock_randomNumber_max_param0":function(d){return "!!-max-!!"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "!!-The maximum number returned-!!"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "!!-randomNumber(max)-!!"},
"dropletBlock_randomNumber_min_max_description":function(d){return "!!-Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range-!!"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "!!-min-!!"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "!!-The minimum number returned-!!"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "!!-max-!!"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "!!-The maximum number returned-!!"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "!!-randomNumber(min, max)-!!"},
"dropletBlock_readRecords_description":function(d){return "!!-Using App Lab's table data storage, reads the records from the provided tableName that match the searchTerms. When the call is completed, the callbackFunction is called and is passed the array of records.-!!"},
"dropletBlock_readRecords_param0":function(d){return "!!-tableName-!!"},
"dropletBlock_readRecords_param0_description":function(d){return "!!-The name of the table from which the records should be searched and read.-!!"},
"dropletBlock_readRecords_param1":function(d){return "!!-searchTerms-!!"},
"dropletBlock_readRecords_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_rect_description":function(d){return "!!-Draws a rectangle onto the active canvas positioned at upperLeftX and upperLeftY, and size width and height.-!!"},
"dropletBlock_rect_param0":function(d){return "!!-upperLeftX-!!"},
"dropletBlock_rect_param0_description":function(d){return "!!-The x position in pixels of the upper left corner of the rectangle.-!!"},
"dropletBlock_rect_param1":function(d){return "!!-upperLeftY-!!"},
"dropletBlock_rect_param1_description":function(d){return "!!-The y position in pixels of the upper left corner of the rectangle.-!!"},
"dropletBlock_rect_param2":function(d){return "!!-width-!!"},
"dropletBlock_rect_param2_description":function(d){return "!!-The horizontal width in pixels of the rectangle.-!!"},
"dropletBlock_rect_param3":function(d){return "!!-height-!!"},
"dropletBlock_rect_param3_description":function(d){return "!!-The vertical height in pixels of the rectangle.-!!"},
"dropletBlock_return_description":function(d){return "!!-Return a value from a function-!!"},
"dropletBlock_return_signatureOverride":function(d){return "!!-return-!!"},
"dropletBlock_setActiveCanvas_description":function(d){return "!!-Change the active canvas to the canvas with the specified id (other canvas commands only affect the active canvas)-!!"},
"dropletBlock_setActiveCanvas_param0":function(d){return "!!-canvasId-!!"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "!!-The id of the canvas element to activate.-!!"},
"dropletBlock_setAlpha_description":function(d){return "!!-Sets the amount of alpha (opacity) (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data-!!"},
"dropletBlock_setAlpha_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_setAlpha_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_setAlpha_param1":function(d){return "!!-x-!!"},
"dropletBlock_setAlpha_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setAlpha_param2":function(d){return "!!-y-!!"},
"dropletBlock_setAlpha_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setAlpha_param3":function(d){return "!!-alphaValue-!!"},
"dropletBlock_setAlpha_param3_description":function(d){return "!!-The amount of alpha (opacity) (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setAttribute_description":function(d){return "!!-Sets the given value-!!"},
"dropletBlock_setBackground_description":function(d){return "!!-Sets the background image-!!"},
"dropletBlock_setBlue_description":function(d){return "!!-Sets the amount of blue (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the blueValue input amount.-!!"},
"dropletBlock_setBlue_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_setBlue_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_setBlue_param1":function(d){return "!!-x-!!"},
"dropletBlock_setBlue_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setBlue_param2":function(d){return "!!-y-!!"},
"dropletBlock_setBlue_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setBlue_param3":function(d){return "!!-blueValue-!!"},
"dropletBlock_setBlue_param3_description":function(d){return "!!-The amount of blue (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setChecked_description":function(d){return "!!-Set the state of a checkbox or radio button-!!"},
"dropletBlock_setChecked_param0":function(d){return "!!-id-!!"},
"dropletBlock_setChecked_param1":function(d){return "!!-checked-!!"},
"dropletBlock_setFillColor_description":function(d){return "!!-Set the fill color for the active canvas-!!"},
"dropletBlock_setFillColor_param0":function(d){return "!!-color-!!"},
"dropletBlock_setFillColor_param0_description":function(d){return "!!-The color name or hex value representing the color.-!!"},
"dropletBlock_setGreen_description":function(d){return "!!-Sets the amount of green (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the greenValue input amount.-!!"},
"dropletBlock_setGreen_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_setGreen_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_setGreen_param1":function(d){return "!!-x-!!"},
"dropletBlock_setGreen_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setGreen_param2":function(d){return "!!-y-!!"},
"dropletBlock_setGreen_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setGreen_param3":function(d){return "!!-greenValue-!!"},
"dropletBlock_setGreen_param3_description":function(d){return "!!-The amount of green (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setImageURL_description":function(d){return "!!-Sets the URL for the provided image element id-!!"},
"dropletBlock_setImageURL_param0":function(d){return "!!-id-!!"},
"dropletBlock_setImageURL_param0_description":function(d){return "!!-The id of the image element.-!!"},
"dropletBlock_setImageURL_param1":function(d){return "!!-url-!!"},
"dropletBlock_setImageURL_param1_description":function(d){return "!!-TThe source URL of the image to be displayed on screen.-!!"},
"dropletBlock_setInterval_description":function(d){return "!!-Execute the callback function code every time a certain number of milliseconds has elapsed, until canceled-!!"},
"dropletBlock_setInterval_param0":function(d){return "!!-function-!!"},
"dropletBlock_setInterval_param0_description":function(d){return "!!-A function to execute.-!!"},
"dropletBlock_setInterval_param1":function(d){return "!!-milliseconds-!!"},
"dropletBlock_setInterval_param1_description":function(d){return "!!-The number of milliseconds between each execution of the function.-!!"},
"dropletBlock_setKeyValue_description":function(d){return "!!-Stores a key/value pair in App Lab's key/value data storage, and calls the callbackFunction when the action is finished.-!!"},
"dropletBlock_setKeyValue_param0":function(d){return "!!-key-!!"},
"dropletBlock_setKeyValue_param0_description":function(d){return "!!-The name of the key to be stored.-!!"},
"dropletBlock_setKeyValue_param1":function(d){return "!!-value-!!"},
"dropletBlock_setKeyValue_param1_description":function(d){return "!!-The data to be stored.-!!"},
"dropletBlock_setKeyValue_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_setKeyValue_param2_description":function(d){return "!!-A function that is asynchronously called when the call to setKeyValue is finished.-!!"},
"dropletBlock_setParent_description":function(d){return "!!-Set an element to become a child of a parent element-!!"},
"dropletBlock_setPosition_description":function(d){return "!!-Position an element with x, y, width, and height coordinates-!!"},
"dropletBlock_setPosition_param0":function(d){return "!!-id-!!"},
"dropletBlock_setPosition_param1":function(d){return "!!-x-!!"},
"dropletBlock_setPosition_param2":function(d){return "!!-y-!!"},
"dropletBlock_setPosition_param3":function(d){return "!!-width-!!"},
"dropletBlock_setPosition_param4":function(d){return "!!-height-!!"},
"dropletBlock_setRGB_description":function(d){return "!!-Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts-!!"},
"dropletBlock_setRGB_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_setRGB_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_setRGB_param1":function(d){return "!!-x-!!"},
"dropletBlock_setRGB_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setRGB_param2":function(d){return "!!-y-!!"},
"dropletBlock_setRGB_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setRGB_param3":function(d){return "!!-red-!!"},
"dropletBlock_setRGB_param3_description":function(d){return "!!-The amount of red (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setRGB_param4":function(d){return "!!-green-!!"},
"dropletBlock_setRGB_param4_description":function(d){return "!!-The amount of green (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setRGB_param5":function(d){return "!!-blue-!!"},
"dropletBlock_setRGB_param5_description":function(d){return "!!-The amount of blue (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setRGB_param6":function(d){return "!!-alpha-!!"},
"dropletBlock_setRGB_param6_description":function(d){return "!!-Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity).-!!"},
"dropletBlock_setRed_description":function(d){return "!!-Sets the amount of red (ranging from 0 to 255) in the color of the pixel located at the given x and y position in the given image data to the redValue input amount.-!!"},
"dropletBlock_setRed_param0":function(d){return "!!-imageData-!!"},
"dropletBlock_setRed_param0_description":function(d){return "!!-The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))-!!"},
"dropletBlock_setRed_param1":function(d){return "!!-x-!!"},
"dropletBlock_setRed_param1_description":function(d){return "!!-The x position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setRed_param2":function(d){return "!!-y-!!"},
"dropletBlock_setRed_param2_description":function(d){return "!!-The y position in pixels starting from the upper left corner of image.-!!"},
"dropletBlock_setRed_param3":function(d){return "!!-redValue-!!"},
"dropletBlock_setRed_param3_description":function(d){return "!!-The amount of red (from 0 to 255) to set in the pixel.-!!"},
"dropletBlock_setSpriteEmotion_description":function(d){return "!!-Sets the actor mood-!!"},
"dropletBlock_setSpritePosition_description":function(d){return "!!-Instantly moves an actor to the specified location.-!!"},
"dropletBlock_setSpriteSpeed_description":function(d){return "!!-Sets the speed of an actor-!!"},
"dropletBlock_setSprite_description":function(d){return "!!-Sets the actor image-!!"},
"dropletBlock_setStrokeColor_description":function(d){return "!!-Set the stroke color for the active canvas-!!"},
"dropletBlock_setStrokeColor_param0":function(d){return "!!-color-!!"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "!!-The color name or hex value representing the color.-!!"},
"dropletBlock_setStrokeWidth_description":function(d){return "!!-Set the line width for the active canvas-!!"},
"dropletBlock_setStrokeWidth_param0":function(d){return "!!-width-!!"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "!!-The width in pixels with which to draw lines, circles, and rectangles.-!!"},
"dropletBlock_setStyle_description":function(d){return "!!-Add CSS style text to an element-!!"},
"dropletBlock_setText_description":function(d){return "!!-Set the text for the specified element-!!"},
"dropletBlock_setText_param0":function(d){return "!!-id-!!"},
"dropletBlock_setText_param1":function(d){return "!!-text-!!"},
"dropletBlock_setTimeout_description":function(d){return "!!-Set a timer and execute code when that number of milliseconds has elapsed-!!"},
"dropletBlock_setTimeout_param0":function(d){return "!!-function-!!"},
"dropletBlock_setTimeout_param0_description":function(d){return "!!-A function to execute.-!!"},
"dropletBlock_setTimeout_param1":function(d){return "!!-milliseconds-!!"},
"dropletBlock_setTimeout_param1_description":function(d){return "!!-The number of milliseconds to wait before executing the function.-!!"},
"dropletBlock_showElement_description":function(d){return "!!-Shows the element with the provided id-!!"},
"dropletBlock_showElement_param0":function(d){return "!!-id-!!"},
"dropletBlock_showElement_param0_description":function(d){return "!!-The id of the element to hide.-!!"},
"dropletBlock_show_description":function(d){return "!!-Shows the turtle on the screen, by making it visible at its current location-!!"},
"dropletBlock_speed_description":function(d){return "!!-Sets the speed for the entire app's execution (which includes the turtle's speed). Expects a number from 1 - 100.-!!"},
"dropletBlock_speed_param0":function(d){return "!!-value-!!"},
"dropletBlock_speed_param0_description":function(d){return "!!-The speed of the app's execution in the range of (1-100)-!!"},
"dropletBlock_startWebRequest_description":function(d){return "!!-Request data from the internet and execute code when the request is complete-!!"},
"dropletBlock_startWebRequest_param0":function(d){return "!!-url-!!"},
"dropletBlock_startWebRequest_param0_description":function(d){return "!!-The web address of a service that returns data.-!!"},
"dropletBlock_startWebRequest_param1":function(d){return "!!-function-!!"},
"dropletBlock_startWebRequest_param1_description":function(d){return "!!-A function to execute.-!!"},
"dropletBlock_subtractOperator_description":function(d){return "!!-Subtract two numbers-!!"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "!!-Subtract operator-!!"},
"dropletBlock_textInput_description":function(d){return "!!-Create a text input and assign it an element id-!!"},
"dropletBlock_textInput_param0":function(d){return "!!-inputId-!!"},
"dropletBlock_textInput_param1":function(d){return "!!-text-!!"},
"dropletBlock_textLabel_description":function(d){return "!!-Creates and displays a text label. The text label is used to display a description for the following input controls: radio buttons, check boxes, text inputs, and dropdown lists-!!"},
"dropletBlock_textLabel_param0":function(d){return "!!-labelId-!!"},
"dropletBlock_textLabel_param0_description":function(d){return "!!-A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers.-!!"},
"dropletBlock_textLabel_param1":function(d){return "!!-text-!!"},
"dropletBlock_textLabel_param1_description":function(d){return "!!-The value to display for the label.-!!"},
"dropletBlock_textLabel_param2":function(d){return "!!-forId-!!"},
"dropletBlock_textLabel_param2_description":function(d){return "!!-The id to associate the label with. Clicking the label is the same as clicking on the control.-!!"},
"dropletBlock_throw_description":function(d){return "!!-Throws a projectile from the specified actor.-!!"},
"dropletBlock_turnLeft_description":function(d){return "!!-Changes the turtle's direction to the left by the specified angle in degrees-!!"},
"dropletBlock_turnLeft_param0":function(d){return "!!-angle-!!"},
"dropletBlock_turnLeft_param0_description":function(d){return "!!-The angle to turn left.-!!"},
"dropletBlock_turnRight_description":function(d){return "!!-Changes the turtle's direction to the right by the specified angle in degrees-!!"},
"dropletBlock_turnRight_param0":function(d){return "!!-angle-!!"},
"dropletBlock_turnRight_param0_description":function(d){return "!!-The angle to turn right.-!!"},
"dropletBlock_turnTo_description":function(d){return "!!-Changes the turtle's direction to a specific angle. 0 is up, 90 is right, 180 is down, and 270 is left-!!"},
"dropletBlock_turnTo_param0":function(d){return "!!-angle-!!"},
"dropletBlock_turnTo_param0_description":function(d){return "!!-The new angle to set the turtle's direction to.-!!"},
"dropletBlock_updateRecord_description":function(d){return "!!-Using App Lab's table data storage, updates the provided record in tableName. record must be uniquely identified with its id field. When the call is completed, the callbackFunction is called-!!"},
"dropletBlock_updateRecord_param0":function(d){return "!!-tableName-!!"},
"dropletBlock_updateRecord_param0_description":function(d){return "!!-The name of the table from which the records should be searched and read.-!!"},
"dropletBlock_updateRecord_param1":function(d){return "!!-record-!!"},
"dropletBlock_updateRecord_param2":function(d){return "!!-callbackFunction-!!"},
"dropletBlock_vanish_description":function(d){return "!!-Vanishes the actor.-!!"},
"dropletBlock_whileBlock_description":function(d){return "!!-Creates a loop consisting of a conditional expression and a block of statements executed for each iteration of the loop. The loop continues to execute as long as the condition evaluates to true-!!"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "!!-while loop-!!"},
"dropletBlock_write_description":function(d){return "!!-Appends the specified text to the bottom of the document. The text can also be formatted as HTML.-!!"},
"dropletBlock_write_param0":function(d){return "!!-text-!!"},
"dropletBlock_write_param0_description":function(d){return "!!-The text or HTML you want appended to the bottom of your application-!!"},
"emptyBlocksErrorMsg":function(d){return "!!-The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block.-!!"},
"emptyFunctionBlocksErrorMsg":function(d){return "!!-The function block needs to have other blocks inside it to work.-!!"},
"emptyFunctionalBlock":function(d){return "!!-You have a block with an unfilled input.-!!"},
"end":function(d){return "!!-end-!!"},
"errorEmptyFunctionBlockModal":function(d){return "!!-There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block.-!!"},
"errorIncompleteBlockInFunction":function(d){return "!!-Click \"edit\" to make sure you don't have any blocks missing inside your function definition.-!!"},
"errorParamInputUnattached":function(d){return "!!-Remember to attach a block to each parameter input on the function block in your workspace.-!!"},
"errorQuestionMarksInNumberField":function(d){return "!!-Try replacing \"???\" with a value.-!!"},
"errorRequiredParamsMissing":function(d){return "!!-Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition.-!!"},
"errorUnusedFunction":function(d){return "!!-You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program.-!!"},
"errorUnusedParam":function(d){return "!!-You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block.-!!"},
"extraTopBlocks":function(d){return "!!-You have unattached blocks.-!!"},
"extraTopBlocksWhenRun":function(d){return "!!-You have unattached blocks. Did you mean to attach these to the \"when run\" block?-!!"},
"finalStage":function(d){return "!!-Congratulations! You have completed the final stage.-!!"},
"finalStageTrophies":function(d){return "!!-Congratulations! You have completed the final stage and won "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+".-!!"},
"finish":function(d){return "!!-Finish-!!"},
"generatedCodeInfo":function(d){return "!!-Even top universities teach block-based coding (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:-!!"},
"genericFeedback":function(d){return "!!-See how you ended up, and try to fix your program.-!!"},
"hashError":function(d){return "!!-Sorry, '%1' doesn't correspond with any saved program.-!!"},
"help":function(d){return "!!-Help-!!"},
"hideToolbox":function(d){return "!!-(Hide)-!!"},
"hintHeader":function(d){return "!!-Here's a tip:-!!"},
"hintRequest":function(d){return "!!-See hint-!!"},
"hintTitle":function(d){return "!!-Hint:-!!"},
"infinity":function(d){return "!!-Infinity-!!"},
"jump":function(d){return "!!-jump-!!"},
"keepPlaying":function(d){return "!!-Keep Playing-!!"},
"levelIncompleteError":function(d){return "!!-You are using all of the necessary types of blocks but not in the right way.-!!"},
"listVariable":function(d){return "!!-list-!!"},
"makeYourOwnFlappy":function(d){return "!!-Make Your Own Flappy Game-!!"},
"missingBlocksErrorMsg":function(d){return "!!-Try one or more of the blocks below to solve this puzzle.-!!"},
"nextLevel":function(d){return "!!-Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+".-!!"},
"nextLevelTrophies":function(d){return "!!-Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+" and won "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+".-!!"},
"nextPuzzle":function(d){return "!!-Next Puzzle-!!"},
"nextStage":function(d){return "!!-Congratulations! You completed "+locale.v(d,"stageName")+".-!!"},
"nextStageTrophies":function(d){return "!!-Congratulations! You completed "+locale.v(d,"stageName")+" and won "+locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+".-!!"},
"numBlocksNeeded":function(d){return "!!-Congratulations! You completed Puzzle "+locale.v(d,"puzzleNumber")+". (However, you could have used only "+locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)-!!"},
"numLinesOfCodeWritten":function(d){return "!!-You just wrote "+locale.p(d,"numLines",0,"en",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code!-!!"},
"openWorkspace":function(d){return "!!-How It Works-!!"},
"orientationLock":function(d){return "!!-Turn off orientation lock in device settings.-!!"},
"play":function(d){return "!!-play-!!"},
"print":function(d){return "!!-Print-!!"},
"puzzleTitle":function(d){return "!!-Puzzle "+locale.v(d,"puzzle_number")+" of "+locale.v(d,"stage_total")+"-!!"},
"repeat":function(d){return "!!-repeat-!!"},
"resetProgram":function(d){return "!!-Reset-!!"},
"rotateText":function(d){return "!!-Rotate your device.-!!"},
"runProgram":function(d){return "!!-Run-!!"},
"runTooltip":function(d){return "!!-Run the program defined by the blocks in the workspace.-!!"},
"saveToGallery":function(d){return "!!-Save to gallery-!!"},
"savedToGallery":function(d){return "!!-Saved in gallery!-!!"},
"score":function(d){return "!!-score-!!"},
"shareFailure":function(d){return "!!-Sorry, we can't share this program.-!!"},
"showBlocksHeader":function(d){return "!!-Show Blocks-!!"},
"showCodeHeader":function(d){return "!!-Show Code-!!"},
"showGeneratedCode":function(d){return "!!-Show code-!!"},
"showToolbox":function(d){return "!!-Show Toolbox-!!"},
"signup":function(d){return "!!-Sign up for the intro course-!!"},
"stringEquals":function(d){return "!!-string=?-!!"},
"subtitle":function(d){return "!!-a visual programming environment-!!"},
"textVariable":function(d){return "!!-text-!!"},
"toggleBlocksErrorMsg":function(d){return "!!-You need to correct an error in your program before it can be shown as blocks.-!!"},
"tooFewBlocksMsg":function(d){return "!!-You are using all of the necessary types of blocks, but try using more  of these types of blocks to complete this puzzle.-!!"},
"tooManyBlocksMsg":function(d){return "!!-This puzzle can be solved with <x id='START_SPAN'/><x id='END_SPAN'/> blocks.-!!"},
"tooMuchWork":function(d){return "!!-You made me do a lot of work!  Could you try repeating fewer times?-!!"},
"toolboxHeader":function(d){return "!!-Blocks-!!"},
"toolboxHeaderDroplet":function(d){return "!!-Toolbox-!!"},
"totalNumLinesOfCodeWritten":function(d){return "!!-All-time total: "+locale.p(d,"numLines",0,"en",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code.-!!"},
"tryAgain":function(d){return "!!-Try again-!!"},
"tryHOC":function(d){return "!!-Try the Hour of Code-!!"},
"wantToLearn":function(d){return "!!-Want to learn to code?-!!"},
"watchVideo":function(d){return "!!-Watch the Video-!!"},
"when":function(d){return "!!-when-!!"},
"whenRun":function(d){return "!!-when run-!!"},
"workspaceHeaderShort":function(d){return "!!-Workspace: -!!"}};