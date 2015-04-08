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
"blocks":function(d){return "Bloki"},
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
"clearPuzzle":function(d){return "Zacznij od nowa"},
"clearPuzzleConfirm":function(d){return "To spowoduje zresetowanie zagadki do stanu początkowego i usunięcie wszystkich bloków, które dodano lub zmieniono."},
"clearPuzzleConfirmHeader":function(d){return "Czy na pewno chcesz zacząć od nowa?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Zobacz wygenerowany kod w JavaScript."},
"continue":function(d){return "Dalej"},
"designMode":function(d){return "Projekt"},
"designModeHeader":function(d){return "Tryb projektowania"},
"dialogCancel":function(d){return "Anuluj"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Dodaj dwie liczby"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "Przesuń żółwia w kierunku przeciwnym do ruchu wskazówek zegara używając określonej liczby stopni i promienia"},
"dropletBlock_arcRight_description":function(d){return "Przesuń żółwia w kierunku zgodnym z ruchem wskazówek zegara używając określonej liczby stopni i promienia"},
"dropletBlock_assign_x_description":function(d){return "Przypisz zmienną"},
"dropletBlock_button_description":function(d){return "Stwórz przycisk i przypisz mu identyfikator elementu"},
"dropletBlock_callMyFunction_description":function(d){return "Użyj funkcji bez argumentu"},
"dropletBlock_callMyFunction_n_description":function(d){return "Użyj funkcji z argumentem"},
"dropletBlock_changeScore_description":function(d){return "Dodaj lub usuń punkt do/z wyniku."},
"dropletBlock_checkbox_description":function(d){return "Utwórz pole wyboru i przypisz mu identyfikator elementu"},
"dropletBlock_circle_description":function(d){return "Narysuj okrąg na aktywnym płótnie z określonymi współrzędnmi środka i (x, y) i promieniem"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_clearCanvas_description":function(d){return "Wyczyść wszystkie dane na aktywnym płótnie"},
"dropletBlock_clearInterval_description":function(d){return "Wyczyść istniejący interwał czasowy przekazując wartość zwróconą przez setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Wyczyść istniejący wyzwalacz czasowy przekazując wartość zwróconą przez setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_container_description":function(d){return "Utwórz kontener podziału z określonym identyfikatorem elementu i opcjonalnie ustaw jego wewnętrzny HTML"},
"dropletBlock_createCanvas_description":function(d){return "Utwórz kontener z określonym identyfikatorem elementu i opcjonalnie ustaw jego szerokość i wysokość"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "width"},
"dropletBlock_createCanvas_param2":function(d){return "wysokość"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "rekord"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Stwórz zmienną i zainicjuj ją jako tablicę"},
"dropletBlock_declareAssign_x_description":function(d){return "Stwórz zmienną po raz pierwszy"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Stwórz zmienną i przypisz jej wartość pobraną z wyświetlonego monitu"},
"dropletBlock_deleteElement_description":function(d){return "Usuń element z określonym identyfikatorem"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "rekord"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "Podziel dwie liczby"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_drawImage_description":function(d){return "Narysuj obraz na aktywnym płótnie z określonym elementem obrazu i x, y jako koordynatami od góry i od lewej strony"},
"dropletBlock_dropdown_description":function(d){return "Stwórz listę rozwijalną, przypisz jej identyfikator elementu i wypełnij ją listą elementów"},
"dropletBlock_equalityOperator_description":function(d){return "Test jakości"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Pobiera alfa"},
"dropletBlock_getAttribute_description":function(d){return "Pobiera podany atrybut"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Pobierz stan przycisku checkbox lub radio"},
"dropletBlock_getDirection_description":function(d){return "Pobierz kierunek żółwia (0 stopni kieruje w górę)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Pobierz ImageData z prostokąta (x, y, szerokość, wysokość) na aktywnym płótnie"},
"dropletBlock_getImageURL_description":function(d){return "Pobierz adres URL powiązany z obrazem lub przycisk wysyłania obrazu"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Pobierz tekst z określonego elementu"},
"dropletBlock_getTime_description":function(d){return "Pobierz aktualny czas w milisekundach"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getXPosition_description":function(d){return "Pobierz współrzędną x pozycji elementu"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_getYPosition_description":function(d){return "Pobierz współrzędną y pozycji elementu"},
"dropletBlock_greaterThanOperator_description":function(d){return "Porównaj dwie liczby"},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_hideElement_description":function(d){return "Ukryj element o podanym id"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_image_description":function(d){return "Stwórz obraz i przypisz mu identyfikator elementu"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test nierówności"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Porównaj dwie liczby"},
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
"dropletBlock_mathRound_description":function(d){return "Zaokrągl do najbliższej liczby całkowitej"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "piksele"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "piksele"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Pomnożenie dwóch liczb"},
"dropletBlock_notOperator_description":function(d){return "Logiczne NIE dla wartości logicznej"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "identyfikator"},
"dropletBlock_onEvent_param1":function(d){return "zdarzenie"},
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
"dropletBlock_playSound_description":function(d){return "Odtwarzaj plik dźwiękowy MP3, OGG lub WAV z określonego adresu URL"},
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
"dropletBlock_rect_param3":function(d){return "wysokość"},
"dropletBlock_return_description":function(d){return "Zwróć wartość funkcji"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_setAttribute_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_setBackground_description":function(d){return "Ustawia obraz w tle"},
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
"dropletBlock_setRGBA_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setSprite_description":function(d){return "Ustawia obrazek postaci"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Ustawia nastój postaci"},
"dropletBlock_setSpritePosition_description":function(d){return "Natychmiast przenosi postać do określonej lokalizacji."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Ustawia prędkość postaci"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "width"},
"dropletBlock_setStyle_description":function(d){return "Dodaj tekst stylu CSS do elementu"},
"dropletBlock_setText_description":function(d){return "Ustaw tekst dla określonego elementu"},
"dropletBlock_setTimeout_description":function(d){return "Ustaw czasomierz i wykonuj kodu, gdy upłynie ta liczba milisekund"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Pokaż element o podanym id"},
"dropletBlock_speed_description":function(d){return "Zmienić prędkość wykonywania programu do określonej wartości procentowej"},
"dropletBlock_startWebRequest_description":function(d){return "Zażądaj danych z Internetu i wykonaj kod, gdy żądanie zostanie spełnione"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Odejmowanie dwóch liczb"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Wyrzuca pocisk z określonej postaci."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "rekord"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Wymazuje postać."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Utwórz blok tekstu"},
"end":function(d){return "koniec"},
"emptyBlocksErrorMsg":function(d){return "Blok \"powtarzaj\" lub blok \"jeśli\" muszą zawierać inne bloki, by poprawnie działać. Upewnij się, czy wewnętrzny blok pasuje do zewnętrznego."},
"emptyFunctionalBlock":function(d){return "Nie wprowadziłeś żadnej zawartości do swojego bloku."},
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
"keepPlaying":function(d){return "Nie przestawaj grać"},
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
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "Jak to Działa"},
"totalNumLinesOfCodeWritten":function(d){return "Sumaryczny wynik: "+locale.p(d,"numLines",0,"pl",{"one":"1 linia","other":locale.n(d,"numLines")+" linii"})+" kodu."},
"tryAgain":function(d){return "Spróbuj ponownie"},
"hintRequest":function(d){return "Zobacz wskazówkę"},
"backToPreviousLevel":function(d){return "Wróć do poprzedniego poziomu"},
"saveToGallery":function(d){return "Zapisz w galerii"},
"savedToGallery":function(d){return "Zapisane w galerii!"},
"shareFailure":function(d){return "Przepraszamy, ale nie możemy udostępnić tego programu."},
"workspaceHeaderShort":function(d){return "Obszar roboczy: "},
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
"defaultTwitterText":function(d){return "Sprawdź, co zrobiłem"}};