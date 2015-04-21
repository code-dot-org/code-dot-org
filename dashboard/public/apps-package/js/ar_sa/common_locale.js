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
"and":function(d){return "و"},
"booleanTrue":function(d){return "صحيح"},
"booleanFalse":function(d){return "خطأ"},
"blocks":function(d){return "مكعبات"},
"blocklyMessage":function(d){return "بلوكلي"},
"catActions":function(d){return "الاجراءات"},
"catColour":function(d){return "لون"},
"catLogic":function(d){return "منطق"},
"catLists":function(d){return "القوائم والمصفوفات"},
"catLoops":function(d){return "الجمل التكرارية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "الدوال"},
"catText":function(d){return "نص"},
"catVariables":function(d){return "المتغيرات"},
"clearPuzzle":function(d){return "البدء من جديد"},
"clearPuzzleConfirm":function(d){return "هذا سيتم إعادة تعيين اللغز إلى حالته ابدأ وحذف جميع المكعبات التي قمت بإضافة أو تغيير."},
"clearPuzzleConfirmHeader":function(d){return "هل أنت متأكد من أنك تريد البدء من جديد؟"},
"codeMode":function(d){return "الرمز"},
"codeTooltip":function(d){return "شاهد كود الـ JavaScript ."},
"continue":function(d){return "أستمر"},
"designMode":function(d){return "تصميم"},
"designModeHeader":function(d){return "وضع التصميم"},
"dialogCancel":function(d){return "إلغاء"},
"dialogOK":function(d){return "موافق"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "إضافة رقمين"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "ترجع صحيحة فقط عندما يكون التعبيرين صح او خطأ"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "Move the turtle in a counterclockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "radius"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "radius"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Create a button and assign it an element id"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "نص"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_changeScore_description":function(d){return "إضافة أو إزالة نقطة ليسجل."},
"dropletBlock_checkbox_description":function(d){return "Create a checkbox and assign it an element id"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_clearCanvas_description":function(d){return "Clear all data on the active canvas"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param2":function(d){return "الأرتفاع"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Delete the element with the specified id"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "record"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "width"},
"dropletBlock_drawImage_param4":function(d){return "الأرتفاع"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Gets the given attribute"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Get the state of a checkbox or radio button"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Get the text from the specified element"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getXPosition_description":function(d){return "Get the element's x position"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_getYPosition_description":function(d){return "Get the element's y position"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
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
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "بكسلات"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "بكسلات"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "نفذ الكود استجابة للحدث المحدَّد."},
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
"dropletBlock_penWidth_param0":function(d){return "width"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "onSuccess"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "width"},
"dropletBlock_rect_param3":function(d){return "الأرتفاع"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "يرجع"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "تحديد صورة الخلفية"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "color"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "milliseconds"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param2":function(d){return "callbackFunction"},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "width"},
"dropletBlock_setPosition_param4":function(d){return "الأرتفاع"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "أحمر"},
"dropletBlock_setRGB_param4":function(d){return "أخضر"},
"dropletBlock_setRGB_param5":function(d){return "أزرق"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setSprite_description":function(d){return "تعيين صورة الفاعل"},
"dropletBlock_setSpriteEmotion_description":function(d){return "يحدد مزاج الممثل"},
"dropletBlock_setSpritePosition_description":function(d){return "على الفور تحرك فاعل للموقع المحدد."},
"dropletBlock_setSpriteSpeed_description":function(d){return "تعيين سرعة فاعل"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "نص"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "نص"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "نص"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "يلقي قذيفة من الفاعل المحدد."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "يختفي الممثل ."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "نص"},
"end":function(d){return "نهاية"},
"emptyBlocksErrorMsg":function(d){return "قطعة \" أكرر\" أو \" اذا \" تحتاج ان تحتوي على قطع اخرى داخلها من اجل العمل . تأكد من القطع الداخلية بحيث يجب ان تكون تناسب القطع المحتوية في الداخل ."},
"emptyFunctionalBlock":function(d){return "You have a block with an unfilled input."},
"emptyFunctionBlocksErrorMsg":function(d){return "قطعة الدالة تحتاج إلى القطع الأخرى بداخلها لكي تعمل."},
"errorEmptyFunctionBlockModal":function(d){return "يجب أن تكون هناك كتل داخل تعريف الدالة الخاصة بك. انقر فوق \"تحرير\" واسحب الكتل داخل الكتلة الخضراء."},
"errorIncompleteBlockInFunction":function(d){return "انقر فوق \"تحرير\" للتأكد من عدم وجود أي كتل ناقصة داخل تعريف الدالة الخاص بك ."},
"errorParamInputUnattached":function(d){return "تذكر أن تقوم بإرفاق كتلة لكل عامل الإدخال في الكتلة الخاصة بالدالة في مساحة العمل الخاصة بك."},
"errorUnusedParam":function(d){return "لقد قمت بإضافة كتلة معلمة، ولكنك لم تستخدامه في التعريف. تأكد من استخدام العامل الخاص بك عن طريق النقر على \"تحرير\" ثم وضع كتلة العامل داخل الكتلة الخضراء."},
"errorRequiredParamsMissing":function(d){return "أنشئ عامل للدالة الخاصة بك عن طريق النقر على \"تحرير\" و إضافة العوامل الضرورية. اسحب كتلة العوامل الجديدة في تعريف الدالة الخاص بك."},
"errorUnusedFunction":function(d){return "لقد قمت بإنشاء دالة، ولكن لم تستخدمها في مساحة العمل الخاصة بك! انقر على \"المهام/الدوال\" في مربع الأدوات وتأكد من استخدامها في البرنامج الخاص بك."},
"errorQuestionMarksInNumberField":function(d){return "حاول أن  تغير قيمة \"؟؟؟\" ."},
"extraTopBlocks":function(d){return "أنت لم تقم بإرفاق القطع . هل قصدت إرفاق هذه القطع إلى قطعة \"عند التشغيل\"؟"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "تهانينا! لقد اتممت المرحلة النهائية."},
"finalStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة النهائية وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"finish":function(d){return "إنهاء"},
"generatedCodeInfo":function(d){return "حتى أفضل الجامعات تعلم الكود البرمجي المبني على القطع (على سبيل المثال، "+locale.v(d,"berkeleyLink")+"، "+locale.v(d,"harvardLink")+"). ولكن في الحقيقه، يمكن للقطع التي جمعتها انت في الظهور في الجافا سكريبت، وهو أكثر لغة كود برمجي مستخدم في العالم:"},
"hashError":function(d){return "عذرا , %1 لايتوافق مع اي البرامج المحفوظة ."},
"help":function(d){return "مساعدة"},
"hintTitle":function(d){return "تلميح:"},
"jump":function(d){return "إقفز"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن ليس في الطريق الصحيح."},
"listVariable":function(d){return "قائمة"},
"makeYourOwnFlappy":function(d){return "برمج لعبة فلابي الخاصة بك"},
"missingBlocksErrorMsg":function(d){return "استخدم القطع الموجودة في الاسفل لحل هذا اللغز."},
"nextLevel":function(d){return "تهانينا ! أنت اكملت اللغز "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "تهانينا! لقد أكملت اللغز "+locale.v(d,"puzzleNumber")+" وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "تهانينا! لقد أكملت مرحلة "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة "+locale.v(d,"stageNumber")+" وفزت بـ "+locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":locale.n(d,"numTrophies")+" جوائز"})+"."},
"numBlocksNeeded":function(d){return "تهانينا! لقد أكملت اللغز "+locale.v(d,"puzzleNumber")+". (لكن كان بامكانك استخذام "+locale.p(d,"numBlocks",0,"ar",{"one":"1 بلوك","other":locale.n(d,"numBlocks")+" بلوكات"})+".) فقط"},
"numLinesOfCodeWritten":function(d){return "لقد كتبت "+locale.p(d,"numLines",0,"ar",{"one":"سطر1","other":locale.n(d,"numLines")+" سطور"})+" من الكود البرمجي!"},
"play":function(d){return "إلعب"},
"print":function(d){return "طباعة"},
"puzzleTitle":function(d){return "اللغز "+locale.v(d,"puzzle_number")+" من "+locale.v(d,"stage_total")},
"repeat":function(d){return "كرر"},
"resetProgram":function(d){return "إعادة تعيين"},
"runProgram":function(d){return "تشغيل"},
"runTooltip":function(d){return "تنفيذ البرنامج هو الامر الذي يقوم بتنفيذ القطع في مساحة العمل البيضاء."},
"score":function(d){return "النتيجة"},
"showCodeHeader":function(d){return "اظهار الكود البرمجي"},
"showBlocksHeader":function(d){return "إظهار القطع"},
"showGeneratedCode":function(d){return "اظهار الكود البرمجي"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "بيئة البرمجة المرئية"},
"textVariable":function(d){return "نص"},
"tooFewBlocksMsg":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن حاول ان تستخدم المزيد من هذه الأنواع من القطع لأكمال هذا اللغز."},
"tooManyBlocksMsg":function(d){return "يمكن حل هذا اللغز مع <x id='END_SPAN'/><x id='START_SPAN'/> قطع."},
"tooMuchWork":function(d){return "جعلتني أقوم بالكثير من العمل!  هل بإمكانك أن تحاول جعل مرات التكرار أقل؟"},
"toolboxHeader":function(d){return "قطع"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "كيف يعمل ذلك"},
"totalNumLinesOfCodeWritten":function(d){return "مجموع كل الاوقات: "+locale.p(d,"numLines",0,"ar",{"one":"1 خط","other":locale.n(d,"numLines")+" خطوط"})+"  من الكود البرمجي."},
"tryAgain":function(d){return "حاول مرة أخرى"},
"hintRequest":function(d){return "شاهد تلميحاً"},
"backToPreviousLevel":function(d){return "الرجوع إلى المستوى السابق"},
"saveToGallery":function(d){return "حفظ إلى المعرض"},
"savedToGallery":function(d){return "تم الحفط في المعرض!"},
"shareFailure":function(d){return "عذراً، لا يمكن أن نشارك هذا البرنامج."},
"workspaceHeaderShort":function(d){return "Workspace: "},
"infinity":function(d){return "ما لانهاية"},
"rotateText":function(d){return "دور النص."},
"orientationLock":function(d){return "قم بتعطيل قفل التوجه في اعدادات المستخدم."},
"wantToLearn":function(d){return "هل تريد أن تتعلم البرمجة؟"},
"watchVideo":function(d){return "شاهد الفيديو"},
"when":function(d){return "عندما"},
"whenRun":function(d){return "عند التشغيل"},
"tryHOC":function(d){return "جرب \"Hour of Code\""},
"signup":function(d){return "سجل لمشاهدة مقدمة الدورة"},
"hintHeader":function(d){return "إليك نصيحة:"},
"genericFeedback":function(d){return "انظر كيف انتهى الأمر، و حاول إصلاح برنامجك."},
"toggleBlocksErrorMsg":function(d){return "أنت تحتاج لتصحيح الخطأ في برنامجك قبل أن يمكنك عرضه كقطع."},
"defaultTwitterText":function(d){return "انظر ما الذي صنعته"}};