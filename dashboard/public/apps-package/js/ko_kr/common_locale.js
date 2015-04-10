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
"and":function(d){return "이면서"},
"booleanTrue":function(d){return "true"},
"booleanFalse":function(d){return "false"},
"blocks":function(d){return "블록"},
"blocklyMessage":function(d){return "Blockly(블러클리)"},
"catActions":function(d){return "동작"},
"catColour":function(d){return "색"},
"catLogic":function(d){return "논리"},
"catLists":function(d){return "리스트"},
"catLoops":function(d){return "반복"},
"catMath":function(d){return "계산"},
"catProcedures":function(d){return "함수"},
"catText":function(d){return "문장"},
"catVariables":function(d){return "변수"},
"clearPuzzle":function(d){return "다시 시작하기"},
"clearPuzzleConfirm":function(d){return "퍼즐을 시작 상태로 되돌리고 그 동안 추가 및 변경했던 블록들을 모두 삭제합니다."},
"clearPuzzleConfirmHeader":function(d){return "정말 다시 시작하겠습니까?"},
"codeMode":function(d){return "코드"},
"codeTooltip":function(d){return "자바스크립트(JavaScript) 코드 보기."},
"continue":function(d){return "계속하기"},
"designMode":function(d){return "디자인"},
"designModeHeader":function(d){return "디자인 모드"},
"dialogCancel":function(d){return "취소"},
"dialogOK":function(d){return "확인"},
"directionNorthLetter":function(d){return "위쪽"},
"directionSouthLetter":function(d){return "아래쪽"},
"directionEastLetter":function(d){return "오른쪽"},
"directionWestLetter":function(d){return "왼쪽"},
"dropletBlock_addOperator_description":function(d){return "두 숫자를 더하세요."},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND 부울 연산자"},
"dropletBlock_arcLeft_description":function(d){return "지정된 각도와 반지름으로 거북이를 시계 반대 방향으로 움직여 보세요."},
"dropletBlock_arcRight_description":function(d){return "지정된 각도와 반지름으로 거북이를 시계 방향으로 움직여 보세요."},
"dropletBlock_assign_x_description":function(d){return "변수 값 재할당"},
"dropletBlock_button_description":function(d){return "버튼을 만들고 요소 ID를 할당하세요."},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_changeScore_description":function(d){return "점수를 올리거나 내립니다."},
"dropletBlock_checkbox_description":function(d){return "체크 박스를 만들고 요소 ID를 할당하세요."},
"dropletBlock_circle_description":function(d){return "중심(x, y) 좌표 값과 반지름 값으로 현재 캔버스에 원을 그리세요."},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "반지름"},
"dropletBlock_clearCanvas_description":function(d){return "현재 캔버스의 모든 내용을 삭제합니다."},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param2":function(d){return "높이"},
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
"dropletBlock_dot_param0":function(d){return "반지름"},
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
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND 부울 연산자"},
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
"dropletBlock_rect_param3":function(d){return "높이"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "배경 이미지 설정"},
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
"dropletBlock_setSprite_description":function(d){return "케릭터를 바꿉니다."},
"dropletBlock_setSpriteEmotion_description":function(d){return "케릭터의 표정을 설정합니다."},
"dropletBlock_setSpritePosition_description":function(d){return "케릭터를 지정한 위치로 바로 점프 시킵니다."},
"dropletBlock_setSpriteSpeed_description":function(d){return "케릭터의 속도를 설정합니다."},
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
"dropletBlock_throw_description":function(d){return "지정한 케릭터에서 물건을 던집니다."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "케릭터를 삭제합니다."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "끝"},
"emptyBlocksErrorMsg":function(d){return "\"반복\" 블럭이나 \"조건\" 블럭이 실행되려면, 그 안에 다른 블럭들이 있어야 합니다. 블럭 안쪽에 필요한 블럭들을 끼워 맞춰 연결하세요."},
"emptyFunctionalBlock":function(d){return "입력이 없는 블럭이 있습니다."},
"emptyFunctionBlocksErrorMsg":function(d){return "함수 블럭 안에는 다른 블럭을 넣어주어야 합니다."},
"errorEmptyFunctionBlockModal":function(d){return "함수 정의 안에 블럭을 추가해야 합니다. \"편집\"을 클릭한 후 녹색 블럭 안으로 블럭을 드래그하세요."},
"errorIncompleteBlockInFunction":function(d){return "함수 정의 안에 빠진 블럭을 채우려면 \"편집\"을 클릭하세요."},
"errorParamInputUnattached":function(d){return "작업공간에서 함수 블럭의 각 파라매터 입력에 블럭을 추가하는 것을 잊지마세요."},
"errorUnusedParam":function(d){return "파라매터 블럭은 추가했지만 함수 정의에서 파라매터 블럭을 사용하지 않았습니다. \"편집\"을 클릭해서 파라매터를 사용하도록 만들고 파라매터 블럭을 녹색 블럭 안으로 옮기세요."},
"errorRequiredParamsMissing":function(d){return "\"편집\"을 클릭해서 함수에 파라매터를 만들고 필요한 파라매터를 추가해보세요. 파라매터 블럭을 함수 정의문으로 드래그하면 됩니다."},
"errorUnusedFunction":function(d){return "작성한 함수가 한 번도 사용되지 않았습니다. 도구상자에서 \"함수\"를 클릭하고 프로그램에서 함수를 사용하도록 만드세요."},
"errorQuestionMarksInNumberField":function(d){return "\"???\"를 값으로 바꾸세요."},
"extraTopBlocks":function(d){return "블럭들이 붙어있지 않습니다. 블럭들을 붙이겠습니까?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했습니다."},
"finalStageTrophies":function(d){return "축하합니다! 마지막 단계까지 성공적으로 해결했고, "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" 을 얻었습니다."},
"finish":function(d){return "마침"},
"generatedCodeInfo":function(d){return " "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"와 같은 유명한 대학에서도 블럭기반 프로그래밍을 가르칩니다. 하지만, 블럭들은 모두 JavaScript로 바뀌어 실행됩니다 : "},
"hashError":function(d){return "죄송합니다. 저장된 '%1' 프로그램은 없습니다."},
"help":function(d){return "도움말"},
"hintTitle":function(d){return "힌트:"},
"jump":function(d){return "점프"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "필요한 블럭들을 모두 사용했지만, 정확한 방법은 아닙니다."},
"listVariable":function(d){return "리스트"},
"makeYourOwnFlappy":function(d){return "자신만의 플래피 게임을 만들어보세요."},
"missingBlocksErrorMsg":function(d){return "퍼즐을 풀기 위해 아래 블럭들을 더 사용해 보세요."},
"nextLevel":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다."},
"nextLevelTrophies":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결하고, "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" 를 얻었습니다."},
"nextStage":function(d){return "축하드립니다! "+locale.v(d,"stageName")+"을(를) 완료하셨습니다."},
"nextStageTrophies":function(d){return "축하합니다. "+locale.v(d,"stageName")+" 를 완료하였습니다. "+locale.p(d,"numTrophies",0,"ko",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "축하합니다! "+locale.v(d,"puzzleNumber")+" 번 퍼즐을 해결했습니다. (하지만, "+locale.p(d,"numBlocks",0,"ko",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" 만 사용해야 합니다.)"},
"numLinesOfCodeWritten":function(d){return "오! 코드 "+locale.p(d,"numLines",0,"ko",{"one":"1 line","other":locale.n(d,"numLines")+" 줄"})+"로 해결했네요!"},
"play":function(d){return "실행"},
"print":function(d){return "인쇄"},
"puzzleTitle":function(d){return "퍼즐 "+locale.v(d,"puzzle_number")+"/"+locale.v(d,"stage_total")},
"repeat":function(d){return "반복"},
"resetProgram":function(d){return "처음 상태로"},
"runProgram":function(d){return "실행"},
"runTooltip":function(d){return "블럭들로 작성되어있는 프로그램을 실행합니다."},
"score":function(d){return "점수"},
"showCodeHeader":function(d){return "코드 보기"},
"showBlocksHeader":function(d){return "블럭 보이기"},
"showGeneratedCode":function(d){return "코드 보기"},
"stringEquals":function(d){return "문장=?"},
"subtitle":function(d){return "비주얼 프로그래밍 환경"},
"textVariable":function(d){return "문장"},
"tooFewBlocksMsg":function(d){return "퍼즐을 해결하기 위해 필요한 블럭 종류는 모두 사용했지만, 이런 종류의 블럭들을 더 사용해 보세요."},
"tooManyBlocksMsg":function(d){return "이 퍼즐은  <x id='START_SPAN'/><x id='END_SPAN'/> 블럭들을 사용해 해결할 수 있습니다."},
"tooMuchWork":function(d){return "작업을 너무 많이 해야 되요! 더 적게 반복하는 방법은 없을까요?"},
"toolboxHeader":function(d){return "blocks"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "실행 설명"},
"totalNumLinesOfCodeWritten":function(d){return "지금까지: 코드 "+locale.p(d,"numLines",0,"ko",{"one":"1 line","other":locale.n(d,"numLines")+" 줄"})+" 사용."},
"tryAgain":function(d){return "다시 시도"},
"hintRequest":function(d){return "도움 보기"},
"backToPreviousLevel":function(d){return "이전 퍼즐"},
"saveToGallery":function(d){return "갤러리에 저장"},
"savedToGallery":function(d){return "갤러리에 저장되었습니다!"},
"shareFailure":function(d){return "프로그램을 공유할 수 없습니다."},
"workspaceHeaderShort":function(d){return "작업 영역: "},
"infinity":function(d){return "무한"},
"rotateText":function(d){return "돌리세요."},
"orientationLock":function(d){return "회전 잠금을 해제하세요."},
"wantToLearn":function(d){return "코드(code)를 배워볼까요?"},
"watchVideo":function(d){return "비디오 보기"},
"when":function(d){return "~할 때"},
"whenRun":function(d){return "실행하면"},
"tryHOC":function(d){return "Hour of Code 해보기"},
"signup":function(d){return "샘플 코스를 위해 가입하기"},
"hintHeader":function(d){return "도움말:"},
"genericFeedback":function(d){return "어떻게 종료되는지 살펴보고 프로그램을 수정해 보세요."},
"toggleBlocksErrorMsg":function(d){return "오류가 블럭으로 보이기 전에 오류를 수정해야 합니다."},
"defaultTwitterText":function(d){return "만든 작품 확인하기"}};