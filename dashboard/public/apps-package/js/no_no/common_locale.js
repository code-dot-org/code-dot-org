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
"and":function(d){return "og"},
"booleanTrue":function(d){return "sann"},
"booleanFalse":function(d){return "usann"},
"blocks":function(d){return "blokker"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farge"},
"catLogic":function(d){return "Logikk"},
"catLists":function(d){return "Lister"},
"catLoops":function(d){return "Løkker"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"clearPuzzle":function(d){return "Start på nytt"},
"clearPuzzleConfirm":function(d){return "Dette nullstiller oppgaven og sletter alle blokkene du har lagt til eller endret."},
"clearPuzzleConfirmHeader":function(d){return "Er du sikker på at du vil starte på nytt?"},
"codeMode":function(d){return "Kode"},
"codeTooltip":function(d){return "Se generert JavaScript-kode."},
"continue":function(d){return "Fortsett"},
"designMode":function(d){return "Utforming"},
"designModeHeader":function(d){return "Utformingsmodus"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "Ø"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Legg til to tall"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Returnerer TRUE når begge uttrykkene er sanne og FALSE ellers"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolsk operator"},
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
"dropletBlock_button_param1":function(d){return "tekst"},
"dropletBlock_callMyFunction_description":function(d){return "Kaller en navngitt funksjon som ikke tar noen parametere"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kall en funksjon"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kaller en navngitt funksjon som tar en eller flere parametre"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kaller en funksjon med parametre"},
"dropletBlock_changeScore_description":function(d){return "Legge til eller fjerne et poeng fra poengsummen."},
"dropletBlock_checkbox_description":function(d){return "Lag en avkrysningsboks og gi den en element-id"},
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
"dropletBlock_console.log_param0":function(d){return "melding"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "bredde"},
"dropletBlock_createCanvas_param2":function(d){return "høyde"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "tabellNavn"},
"dropletBlock_createRecord_param1":function(d){return "post"},
"dropletBlock_createRecord_param2":function(d){return "funksjon"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Slett elementet med den angitte id-en"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "tabellNavn"},
"dropletBlock_deleteRecord_param1":function(d){return "post"},
"dropletBlock_deleteRecord_param2":function(d){return "funksjon"},
"dropletBlock_divideOperator_description":function(d){return "Del to tall"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "bredde"},
"dropletBlock_drawImage_param4":function(d){return "høyde"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definer en funksjon med parametre"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definer en funksjon"},
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
"dropletBlock_getKeyValue_param0":function(d){return "nøkkel"},
"dropletBlock_getKeyValue_param1":function(d){return "funksjon"},
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
"dropletBlock_image_param1":function(d){return "URL"},
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
"dropletBlock_moveBackward_param0":function(d){return "piksler"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "piksler"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multipliser to tall"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "hendelse"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "farge"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "farge"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Forhindrer skilpadden fra å tegne en linke bak seg når den beveger seg"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "bredde"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_playSound_param0":function(d){return "URL"},
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
"dropletBlock_readRecords_param0":function(d){return "tabellNavn"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "funksjon"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "bredde"},
"dropletBlock_rect_param3":function(d){return "høyde"},
"dropletBlock_return_description":function(d){return "Returnerer en verdi fra en funksjon"},
"dropletBlock_return_signatureOverride":function(d){return "returner"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Angir bakgrunnsbilde"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "farge"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param1":function(d){return "URL"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "millisekunder"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "nøkkel"},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param2":function(d){return "funksjon"},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "bredde"},
"dropletBlock_setPosition_param4":function(d){return "høyde"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "rød"},
"dropletBlock_setRGB_param4":function(d){return "grønn"},
"dropletBlock_setRGB_param5":function(d){return "blå"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "farge"},
"dropletBlock_setSprite_description":function(d){return "Angir skuespiller bildet"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Setter skuespillerens humør"},
"dropletBlock_setSpritePosition_description":function(d){return "Flytter en skuespiller til den angitte plasseringen."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Angir farten til en skuespiller"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "bredde"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "tekst"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "funksjon"},
"dropletBlock_setTimeout_param1":function(d){return "millisekunder"},
"dropletBlock_show_description":function(d){return "Viser skilpadden på skjermen, ved å gjøre den synlig der den befinner seg"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "URL"},
"dropletBlock_startWebRequest_param1":function(d){return "funksjon"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "tekst"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "tekst"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Kaster et prosjektil fra angitte skuespiller."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tabellNavn"},
"dropletBlock_updateRecord_param1":function(d){return "post"},
"dropletBlock_updateRecord_param2":function(d){return "funksjon"},
"dropletBlock_vanish_description":function(d){return "Fjerner skuespilleren."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "tekst"},
"end":function(d){return "slutt"},
"emptyBlocksErrorMsg":function(d){return "\"Gjenta\"- eller \"Hvis\"-blokken må ha andre blokker inne i seg for å fungere. Kontroller at den indre blokken sitter riktig på plass i blokken som er utenfor."},
"emptyFunctionalBlock":function(d){return "Du har en blokk som mangler inndata."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funksjonsblokken må ha andre blokker inni seg for å virke."},
"errorEmptyFunctionBlockModal":function(d){return "Det må være blokker inni funksjonsdefinisjonen din. Klikk \"Rediger\" og dra blokker inn i den grønne blokken."},
"errorIncompleteBlockInFunction":function(d){return "Klikk \"Rediger\" for å sørge for at du ikke mangler noen blokker inni funksjonsdefinisjonen din."},
"errorParamInputUnattached":function(d){return "Husk å feste en blokk til hver av innverdiene på funksjonsblokken i arbeidsområdet."},
"errorUnusedParam":function(d){return "Du la til en parameterblokk, men bruke den ikke i definisjonen. Husk å bruke parameteren ved å klikke \"Rediger\" og sette parameterblokk innenfor den grønne blokken."},
"errorRequiredParamsMissing":function(d){return "Lag en parameter for funksjonen din ved å klikke \"Rediger\" og legge til de nødvendige parameterne. Dra de nye parameterblokkene til funksjonsdefinisjonen."},
"errorUnusedFunction":function(d){return "Du opprettet en funksjon, men brukte den ikke i arbeidsområdet! Klikk på \"Funksjoner\" i verktøykassen, og forsikre deg om at du bruker den i programmet ditt."},
"errorQuestionMarksInNumberField":function(d){return "Prøv å erstatte \"???\" med en verdi!"},
"extraTopBlocks":function(d){return "Du har ubrukte klosser. Vil du feste dem til \"start\"-klossen?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Gratulerer! Du har fullført siste nivå."},
"finalStageTrophies":function(d){return "Gratulerer! Du har fullført siste nivå og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":locale.n(d,"numTrophies")+" pokaler"})+"."},
"finish":function(d){return "Fullfør"},
"generatedCodeInfo":function(d){return "Selv topp universiteter lærer blokk-basert koding (f.eks "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Men under panseret, kan blokkene du har samlet også vises i JavaScript, verdens mest brukte kode språk:"},
"hashError":function(d){return "Beklager, '%1' samsvarer ikke med noe lagret program."},
"help":function(d){return "Hjelp"},
"hintTitle":function(d){return "Tips:"},
"jump":function(d){return "Hopp"},
"keepPlaying":function(d){return "Fortsett å spille"},
"levelIncompleteError":function(d){return "Du bruker alle nødvendige typer blokker, men ikke på riktig måte."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lag ditt eget \"Sprette-Spill\""},
"missingBlocksErrorMsg":function(d){return "Forsøk en eller flere av blokkene under for å løse denne oppgaven."},
"nextLevel":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+" og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":locale.n(d,"numTrophies")+" pokaler"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Gratulerer! Du fullførte "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulerer! Du har fullført "+locale.v(d,"stageName")+" og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+". (Men, du kunne ha brukt kun "+locale.p(d,"numBlocks",0,"no",{"one":"1 blokk","other":locale.n(d,"numBlocks")+" blokker"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har akkurat skrevet "+locale.p(d,"numLines",0,"no",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" med kode!"},
"play":function(d){return "spill"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Oppgave "+locale.v(d,"puzzle_number")+" av "+locale.v(d,"stage_total")},
"repeat":function(d){return "gjenta"},
"resetProgram":function(d){return "Nullstill"},
"runProgram":function(d){return "Kjør"},
"runTooltip":function(d){return "Kjør programmet definert av blokkene i arbeidsområdet."},
"score":function(d){return "poengsum"},
"showCodeHeader":function(d){return "Vis kode"},
"showBlocksHeader":function(d){return "Vis blokker"},
"showGeneratedCode":function(d){return "Vis kode"},
"stringEquals":function(d){return "streng =?"},
"subtitle":function(d){return "et visuelt programmeringsopplegg"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Du bruker alle de nødvendige blokktypene, men forsøk å bruke flere av denne typen blokker for å løse denne oppgaven."},
"tooManyBlocksMsg":function(d){return "Denne oppgaven kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokker."},
"tooMuchWork":function(d){return "Du fikk meg til å gjøre masse arbeid! Kan du forsøke med mindre repetisjon?"},
"toolboxHeader":function(d){return "blokker"},
"toolboxHeaderDroplet":function(d){return "Verktøykasse"},
"hideToolbox":function(d){return "(Skjul)"},
"showToolbox":function(d){return "Vis verktøykasse"},
"openWorkspace":function(d){return "Slik fungerer det"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+locale.p(d,"numLines",0,"no",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" med kode."},
"tryAgain":function(d){return "Forsøk igjen"},
"hintRequest":function(d){return "Se hint"},
"backToPreviousLevel":function(d){return "Tilbake til forrige nivå"},
"saveToGallery":function(d){return "Lagre i galleriet"},
"savedToGallery":function(d){return "Lagret i galleriet!"},
"shareFailure":function(d){return "Beklager, vi kan ikke dele dette programmet."},
"workspaceHeaderShort":function(d){return "Arbeidsområde: "},
"infinity":function(d){return "Uendelig"},
"rotateText":function(d){return "Roter enheten din."},
"orientationLock":function(d){return "Skru av roteringslåsen på enheten din."},
"wantToLearn":function(d){return "Vil du lære å kode?"},
"watchVideo":function(d){return "Se videoen"},
"when":function(d){return "når"},
"whenRun":function(d){return "når den kjører"},
"tryHOC":function(d){return "Prøv Kodetimen"},
"signup":function(d){return "Registrer deg for introduksjonskurset"},
"hintHeader":function(d){return "Her er et tips:"},
"genericFeedback":function(d){return "Se hvordan du endte opp, og prøv å fikse programmet ditt."},
"toggleBlocksErrorMsg":function(d){return "Du må fikse en feil i programmet ditt før det kan vises som brikker."},
"defaultTwitterText":function(d){return "Sjekk ut det jeg lagde"}};