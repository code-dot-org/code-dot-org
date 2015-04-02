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
"and":function(d){return "i"},
"booleanTrue":function(d){return "prawda"},
"booleanFalse":function(d){return "fałsz"},
"blocks":function(d){return "blocks"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Działania"},
"catColour":function(d){return "Kolor"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Listy"},
"catLoops":function(d){return "Pętle"},
"catMath":function(d){return "Matematyka"},
"catProcedures":function(d){return "Funkcje"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Zmienne"},
"clearPuzzle":function(d){return "Clear Puzzle"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Are you sure you want to clear the puzzle?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Zobacz wygenerowany kod w JavaScript."},
"continue":function(d){return "Dalej"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Design Mode"},
"dialogCancel":function(d){return "Anuluj"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_arcLeft_description":function(d){return "Move the turtle in a counterclockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_button_description":function(d){return "Create a button and assign it an element id"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_changeScore_description":function(d){return "Dodaj lub usuń punkt do/z wyniku."},
"dropletBlock_checkbox_description":function(d){return "Create a checkbox and assign it an element id"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_clearCanvas_description":function(d){return "Clear all data on the active canvas"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
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
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAttribute_description":function(d){return "Gets the given attribute"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getChecked_description":function(d){return "Get the state of a checkbox or radio button"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
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
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
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
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Ustawia obraz w tle"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRGBA_description":function(d){return "Sets the given value"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setSprite_description":function(d){return "Ustawia obrazek postaci"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Ustawia nastój postaci"},
"dropletBlock_setSpritePosition_description":function(d){return "Natychmiast przenosi postać do określonej lokalizacji."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Ustawia prędkość postaci"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Wyrzuca pocisk z określonej postaci."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_vanish_description":function(d){return "Wymazuje postać."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "koniec"},
"emptyBlocksErrorMsg":function(d){return "Blok \"powtarzaj\" lub blok \"jeśli\" muszą zawierać inne bloki, by poprawnie działać. Upewnij się, czy wewnętrzny blok pasuje do zewnętrznego."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkcji musi zawierać inne bloki, by działał."},
"errorEmptyFunctionBlockModal":function(d){return "Wewnątrz definicji Twojej funkcji powinny znajdować się bloki. Kliknij przycisk Edytuj i przeciągnij bloki do wnętrza zielonego bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknij przycisk Edytuj, aby upewnić się, że wewnątrz definicji Twojej funkcji nie brakuje żadnego bloku."},
"errorParamInputUnattached":function(d){return "Pamiętaj, aby dołączyć blok do każdego parametru wejścia w bloku funkcji w Twoim obszarze roboczym."},
"errorUnusedParam":function(d){return "Dodałeś blok parametru, ale nie użyłeś go w definicji. Upewnij się, że używasz swojego parametru klikając na przycisk Editi i umieszczając blok parametru wewnątrz bloku zielonego."},
"errorRequiredParamsMissing":function(d){return "Utwórz parametr dla swojej funkcji klikając na przycisk Edytuj i dodając niezbędne parametry. Przeciągnij nowe bloki parametrów do definicji swojej funkcji."},
"errorUnusedFunction":function(d){return "Utworzyłeś funkcję, ale nigdy nie użyłeś jej w swoim obszarze roboczym! W przyborniku kliknij na Funkcje i upewnij się, że używasz ich w swoim programie."},
"errorQuestionMarksInNumberField":function(d){return "Spróbuj zastąpić ??? wartością."},
"extraTopBlocks":function(d){return "Masz niezałączone bloki. Czy chcesz je załączyć do bloku \"po uruchomieniu\"?"},
"finalStage":function(d){return "Gratulacje! Ukończyłeś ostatni etap."},
"finalStageTrophies":function(d){return "Gratulacje! Ukończyłeś ostatni etap i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"finish":function(d){return "Koniec"},
"generatedCodeInfo":function(d){return "Nawet najlepsze uczelnie uczą kodowania opartego o bloki (np. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ale bloki, które użyłeś, można również znaleźć w JavaScript, w jednym z najpowszechniej stosowanym języku programowania na świecie:"},
"hashError":function(d){return "Przepraszamy, '%1' nie odpowiada żadnemu zapisanemu programowi."},
"help":function(d){return "Pomoc"},
"hintTitle":function(d){return "Podpowiedź:"},
"jump":function(d){return "skocz"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Używasz wszystkich niezbędnych rodzajów bloków, ale w niewłaściwy sposób."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Utwórz swoją grę Flappy"},
"missingBlocksErrorMsg":function(d){return "Spróbuj użyć jednego lub więcej poniższych bloków, by rozwiązać tę łamigłówkę."},
"nextLevel":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+" i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"nextStage":function(d){return "Gratulacje! Ukończyłeś etap "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulacje! Ukończyłeś etap "+locale.v(d,"stageName")+" i wygrałeś "+locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":locale.n(d,"numTrophies")+" trofea"})+"."},
"numBlocksNeeded":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+locale.v(d,"puzzleNumber")+". (Jednakże, mogłeś użyć jedynie "+locale.p(d,"numBlocks",0,"pl",{"one":"blok","other":locale.n(d,"numBlocks")+" bloki"})+")"},
"numLinesOfCodeWritten":function(d){return "Właśnie napisałeś "+locale.p(d,"numLines",0,"pl",{"one":"linię","other":locale.n(d,"numLines")+" linii"})+" kodu!"},
"play":function(d){return "zagraj"},
"print":function(d){return "Drukuj"},
"puzzleTitle":function(d){return "Łamigłówka "+locale.v(d,"puzzle_number")+" z "+locale.v(d,"stage_total")},
"repeat":function(d){return "powtarzaj"},
"resetProgram":function(d){return "Zresetuj"},
"runProgram":function(d){return "Uruchom"},
"runTooltip":function(d){return "Uruchom program zdefiniowany za pomocą bloków w miejscu roboczym."},
"score":function(d){return "wynik"},
"showCodeHeader":function(d){return "Pokaż Kod"},
"showBlocksHeader":function(d){return "Pokaż Bloki"},
"showGeneratedCode":function(d){return "Pokaż kod"},
"stringEquals":function(d){return "łańcuch=?"},
"subtitle":function(d){return "środowisko wizualnego programowania"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Używasz wszystkich wymaganych rodzajów bloków, ale spróbuj użyć ich więcej, aby ukończyć łamigłówkę."},
"tooManyBlocksMsg":function(d){return "Ta łamigłówka może być rozwiązana przy pomocy bloków <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Spowodowałeś, że miałem dużo pracy. Czy możesz zmniejszyć liczbę powtórzeń?"},
"toolboxHeader":function(d){return "Bloki"},
"openWorkspace":function(d){return "Jak to Działa"},
"totalNumLinesOfCodeWritten":function(d){return "Sumaryczny wynik: "+locale.p(d,"numLines",0,"pl",{"one":"1 linia","other":locale.n(d,"numLines")+" linii"})+" kodu."},
"tryAgain":function(d){return "Spróbuj ponownie"},
"hintRequest":function(d){return "Zobacz wskazówkę"},
"backToPreviousLevel":function(d){return "Wróć do poprzedniego poziomu"},
"saveToGallery":function(d){return "Zapisz w galerii"},
"savedToGallery":function(d){return "Zapisane w galerii!"},
"shareFailure":function(d){return "Przepraszamy, ale nie możemy udostępnić tego programu."},
"workspaceHeader":function(d){return "Połącz swoje bloki tutaj: "},
"workspaceHeaderJavaScript":function(d){return "Wpisz tutaj swój kod w JavaScript"},
"workspaceHeaderShort":function(d){return "Workspace: "},
"infinity":function(d){return "Nieskończoność"},
"rotateText":function(d){return "Obróć swoje urządzenie."},
"orientationLock":function(d){return "Wyłącz blokadę orientacji w ustawieniach urządzenia."},
"wantToLearn":function(d){return "Czy chcesz nauczyć się kodowania (programowania)?"},
"watchVideo":function(d){return "Obejrzyj wideo"},
"when":function(d){return "kiedy"},
"whenRun":function(d){return "po uruchomieniu"},
"tryHOC":function(d){return "Weź udział w Godzinie Kodowania (the Hour of Code)"},
"signup":function(d){return "Zapisz się na kurs wprowadzający"},
"hintHeader":function(d){return "Oto wskazówka:"},
"genericFeedback":function(d){return "Zobacz jak zakończyłeś i spróbuj naprawić swój program."},
"toggleBlocksErrorMsg":function(d){return "Musisz poprawić błąd w programie, zanim będzie wyświetlony w blokach."},
"defaultTwitterText":function(d){return "Sprawdź, co zrobiłem"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"}};