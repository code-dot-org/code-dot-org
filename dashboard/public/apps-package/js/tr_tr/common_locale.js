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
"and":function(d){return "ve"},
"booleanTrue":function(d){return "doğru"},
"booleanFalse":function(d){return "false"},
"blocks":function(d){return "bloklar"},
"blocklyMessage":function(d){return "Parçalı"},
"catActions":function(d){return "Eylemler"},
"catColour":function(d){return "Renk"},
"catLogic":function(d){return "Mantık"},
"catLists":function(d){return "Listeler"},
"catLoops":function(d){return "Döngüler"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fonksiyonlar"},
"catText":function(d){return "yazı"},
"catVariables":function(d){return "Değişkenler"},
"clearPuzzle":function(d){return "Baştan Başla"},
"clearPuzzleConfirm":function(d){return "Bu, bulmacayı başlangıç durumuna sıfırlayacak ve eklediğiniz veya değiştirdiğiniz tüm blokları silecek."},
"clearPuzzleConfirmHeader":function(d){return "Baştan başlamak istediğinizden emin misiniz?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Oluşturulan JavaScript kodunu gör."},
"continue":function(d){return "Devam Et"},
"designMode":function(d){return "Tasarım"},
"designModeHeader":function(d){return "Tasarım Modu"},
"dialogCancel":function(d){return "İptal"},
"dialogOK":function(d){return "TAMAM"},
"directionNorthLetter":function(d){return "K"},
"directionSouthLetter":function(d){return "G"},
"directionEastLetter":function(d){return "D"},
"directionWestLetter":function(d){return "B"},
"dropletBlock_addOperator_description":function(d){return "iki sayı ekle"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "Kaplumbağayı, belirlenen sayıda derece ve çapı kullanarak, saatin tersi  yönünde bir eğri boyunca hareket ettiriniz"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_assign_x_description":function(d){return "Bir değişken atayınız"},
"dropletBlock_button_description":function(d){return "Bir düğme oluşturun ve ona bir öge kimliği atayın"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_changeScore_description":function(d){return "Skoru bir puan arttır veya azalt."},
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
"dropletBlock_createCanvas_param2":function(d){return "Yükseklik"},
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
"dropletBlock_moveBackward_param0":function(d){return "pikseller"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "pikseller"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Belirtilen olaya karşılık gelen kodu çalıştırın."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "işlev"},
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
"dropletBlock_rect_param3":function(d){return "Yükseklik"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Arka plan resmini ayarlar"},
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
"dropletBlock_setSprite_description":function(d){return "Aktör resmini ayarlar"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Aktör ruh halini ayarla"},
"dropletBlock_setSpritePosition_description":function(d){return "Anlık olarak aktörü belirtilen konuma taşır."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Bir aktörün hızını ayarlar"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "işlev"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "işlev"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Belirlenen aktör atılacak cismi fırlatır."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Aktör kaybolur."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "son"},
"emptyBlocksErrorMsg":function(d){return "\"Tekrar\" bloğu veya \"Eğer\" bloğunun çalışması için  içerisinde bir başka blok yer almalıdır. İçteki bloğu, dış blok içerisine yerleştirdiğine emin ol."},
"emptyFunctionalBlock":function(d){return "Doldurulmamış bir giriş bloğunuz bulunuyor."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fonksiyon bloğunun çalışabilmesi için içine başka bloklar koymalısın."},
"errorEmptyFunctionBlockModal":function(d){return "Fonksiyon tanımının içinde bloklara ihtiyacın var. \"Düzenle\" butonuna tıkla ve blokları yeşil bloğun içine sürükle."},
"errorIncompleteBlockInFunction":function(d){return "Fonksiyon tanımının içinde eksik blokların kalıp kalmadığından emin olmak için \"düzenle\" butonuna tıkla."},
"errorParamInputUnattached":function(d){return "Çalışma alanında bulunan fonksiyon bloğundaki her parametre girdisine bir blok eklemeyi unutma."},
"errorUnusedParam":function(d){return "Parametre bloğu ekledin ama bunu tanımında kullanmadın. \"Düzenle\" butonuna tıklayarak ve parametre bloğunu yeşil bloğun içine yerleştirerek parametreni kullandığından emin ol."},
"errorRequiredParamsMissing":function(d){return "\"Düzenle\" butonuna tıklayarak ve gerekli parametreleri ekleyecek fonksiyonun için bir parametre yarat. Yeni parametre bloğunu, fonksiyon tanımının içine sürükle."},
"errorUnusedFunction":function(d){return "Bir fonksiyon yarattın ama çalışma alanında kullanmadın! Araç çubuğundaki \"fonksiyonlar\" kısmına tıkla ve fonksiyonunu programında kullandığına emin ol."},
"errorQuestionMarksInNumberField":function(d){return "\"???\" kısmını bir değerle değiştirmeyi deneyin."},
"extraTopBlocks":function(d){return "Blokları bağlamadın. \"Çalıştığı zaman\" bloğuna bağlamayı denediniz mi?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Son aşamayı bitirdiniz. Tebrikler!"},
"finalStageTrophies":function(d){return "Tebrikler! Son aşamayı bitirerek "+locale.p(d,"numTrophies",0,"tr",{"one":"bir ganimet","other":locale.n(d,"numTrophies")+" ganimet"})+" kazandınız."},
"finish":function(d){return "Bitiş"},
"generatedCodeInfo":function(d){return "Dünyanın en iyi üniversiteleri bile yap-boz oyun tabanlı kodlama öğretiyor (Örn. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ayrıca detaylı incelerseniz, birleştirdiğiniz bloklar dünyanın en yaygın kullanılan kodlama dili olan JavaScript dilinde de görüntüleniyor:"},
"hashError":function(d){return "Üzgünüz, '%1' kayıtlı herhangi bir programa karşılık gelmez."},
"help":function(d){return "Yardım"},
"hintTitle":function(d){return "İpucu:"},
"jump":function(d){return "zıpla"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Tüm gerekli türdeki blokları kullanıyorsunuz ama doğru şekilde değil."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Kendi Flappy Oyununu Yap"},
"missingBlocksErrorMsg":function(d){return "Aşağıdaki bloklardan bir ya da birden fazlasını kullanarak bulmacayı çözmeye çalışın."},
"nextLevel":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı."},
"nextLevelTrophies":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı ve "+locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":locale.n(d,"numTrophies")+"  kupa"})+" kazandınız."},
"nextStage":function(d){return "Tebrikler! "+locale.v(d,"stageName")+" tamamlandı."},
"nextStageTrophies":function(d){return "Tebrikler! Kademe "+locale.v(d,"stageNumber")+" tamamlandı ve "+locale.p(d,"numTrophies",0,"tr",{"one":"bir kupa","other":locale.n(d,"numTrophies")+" kupalar"})+" kazandınız."},
"numBlocksNeeded":function(d){return "Tebrikler! Bulmaca "+locale.v(d,"puzzleNumber")+" tamamlandı. (Ancak, sadece "+locale.p(d,"numBlocks",0,"tr",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blok"})+" kullanmış olabilirdiniz.)"},
"numLinesOfCodeWritten":function(d){return "Tam olarak "+locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":locale.n(d,"numLines")+" satır"})+" kod yazdınız!"},
"play":function(d){return "oynat"},
"print":function(d){return "Yazdır"},
"puzzleTitle":function(d){return "Bulmaca "+locale.v(d,"puzzle_number")+" / "+locale.v(d,"stage_total")},
"repeat":function(d){return "bu işlemleri"},
"resetProgram":function(d){return "Yeniden başla"},
"runProgram":function(d){return "Çalıştır"},
"runTooltip":function(d){return "Çalişma alaninda bloklar tarafından tanımlanmış bir program çalıştır."},
"score":function(d){return "puan"},
"showCodeHeader":function(d){return "Kodu Görüntüle"},
"showBlocksHeader":function(d){return "Bloklarını göster"},
"showGeneratedCode":function(d){return "Kodu Görüntüle"},
"stringEquals":function(d){return "dizi=?"},
"subtitle":function(d){return "Bir görsel programa ortamı"},
"textVariable":function(d){return "metin"},
"tooFewBlocksMsg":function(d){return "Tüm gerekli blok türlerini kullanıyorsun,fakat bulmacayı tamamlamak için bu blok tiplerinden daha fazla kullanmayı dene."},
"tooManyBlocksMsg":function(d){return "Bu bulmaca <x id='START_SPAN'/><x id='END_SPAN'/> bloklarıyla çözülebilir."},
"tooMuchWork":function(d){return "Bana çok fazla iş yaptırdın!Daha az tekrar etmeyi deneyebilir misin ?"},
"toolboxHeader":function(d){return "bloklar"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "Nasıl Çalışır"},
"totalNumLinesOfCodeWritten":function(d){return "Toplam: "+locale.p(d,"numLines",0,"tr",{"one":"1 satır","other":locale.n(d,"numLines")+" satır"})+" kod."},
"tryAgain":function(d){return "Tekrar dene"},
"hintRequest":function(d){return "İpucunu gör"},
"backToPreviousLevel":function(d){return "Önceki seviyeye dön"},
"saveToGallery":function(d){return "Galerisine Kaydet"},
"savedToGallery":function(d){return "Galeri klasörüne kaydedilmiş!"},
"shareFailure":function(d){return "Üzgünüz, bu programı paylaşamıyoruz."},
"workspaceHeaderShort":function(d){return "Çalışma alanı: "},
"infinity":function(d){return "Sonsuz"},
"rotateText":function(d){return "Cihazınızı döndürün."},
"orientationLock":function(d){return "Yönlendirme kilidini aygıt ayarlarından devre dışı bırakın."},
"wantToLearn":function(d){return "Kod yazmayı öğrenmek ister misiniz?"},
"watchVideo":function(d){return "Videoyu İzle"},
"when":function(d){return "Ne zaman"},
"whenRun":function(d){return "Çalıştığı zaman"},
"tryHOC":function(d){return "Kodlama Saati'ni Deneyin"},
"signup":function(d){return "Giriş dersi için üye olun"},
"hintHeader":function(d){return "İşte bir ipucu:"},
"genericFeedback":function(d){return "Sonucunu gör ve programını düzeltmeyi dene."},
"toggleBlocksErrorMsg":function(d){return "Bloklar halinde gösterilebilmesi için programındaki bir hatayı düzeltmelisin."},
"defaultTwitterText":function(d){return "Ne yaptığıma bakın"}};