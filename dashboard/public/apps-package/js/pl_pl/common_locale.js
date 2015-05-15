var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "i"},
"backToPreviousLevel":function(d){return "Wróć do poprzedniego poziomu"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "Bloki"},
"booleanFalse":function(d){return "fałsz"},
"booleanTrue":function(d){return "prawda"},
"catActions":function(d){return "Działania"},
"catColour":function(d){return "Kolor"},
"catLists":function(d){return "Listy"},
"catLogic":function(d){return "Logika"},
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
"defaultTwitterText":function(d){return "Sprawdź, co zrobiłem"},
"designMode":function(d){return "Projekt"},
"designModeHeader":function(d){return "Tryb projektowania"},
"dialogCancel":function(d){return "Anuluj"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Dodaj dwie liczby"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Dodaj operatora"},
"dropletBlock_andOperator_description":function(d){return "Zwraca prawda (true) tylko wtedy, gdy oba wyrażenia są prawdziwe, w przeciwnym przypadku zwraca fałsz (false)"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND (I) operator logiczny"},
"dropletBlock_arcLeft_description":function(d){return "Przesuń żółwia do przodu i w lewo delikatnym łukiem kołowym"},
"dropletBlock_arcLeft_param0":function(d){return "kat"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "promień"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Przesuń żółwia do przodu i w prawo delikatnym ruchem kołowym"},
"dropletBlock_arcRight_param0":function(d){return "kat"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "promień"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Przypisuje wartość do istniejącej zmiennej. Na przykład, x=0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Przypisać zmienna"},
"dropletBlock_button_description":function(d){return "Tworzy przycisk, który możesz kliknąć. Przycisk wyświetli tekst i może być odwołany przez dodanie odnośnika id"},
"dropletBlock_button_param0":function(d){return "Id przycisku"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "tekst"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "Wywołuje daną funkcję, która nie ma parametrów"},
"dropletBlock_callMyFunction_n_description":function(d){return "Wywołuje daną funkcję, która ma jeden lub więcej parametrów"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Wywołaj funkcję z parametrami"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Wywołaj funkcję"},
"dropletBlock_changeScore_description":function(d){return "Dodaj lub usuń punkt do/z wyniku."},
"dropletBlock_checkbox_description":function(d){return "Utwórz pole wyboru i przypisz mu identyfikator elementu"},
"dropletBlock_checkbox_param0":function(d){return "polewyboruid"},
"dropletBlock_checkbox_param1":function(d){return "sprawdzony"},
"dropletBlock_circle_description":function(d){return "Narysuj okrąg na aktywnym płótnie z określonymi współrzędnmi środka i (x, y) i promieniem"},
"dropletBlock_circle_param0":function(d){return "centrumX"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "centrumY"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "promień"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Wyczyść wszystkie dane na aktywnym płótnie"},
"dropletBlock_clearInterval_description":function(d){return "Wyczyść istniejący interwał czasowy przekazując wartość zwróconą przez setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "przerwa"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Wyczyść istniejący wyzwalacz czasowy przekazując wartość zwróconą przez setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "koniec czasu"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Wyświetla łańcuch (string) lub zmienna na konsoli"},
"dropletBlock_console.log_param0":function(d){return "komunikat"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Utwórz kontener podziału z określonym identyfikatorem elementu i opcjonalnie ustaw jego wewnętrzny HTML"},
"dropletBlock_createCanvas_description":function(d){return "Utwórz kontener z określonym identyfikatorem elementu i opcjonalnie ustaw jego szerokość i wysokość"},
"dropletBlock_createCanvas_param0":function(d){return "identyfikator kanwy"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "szerokość"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "wysokość"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "rekord"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Stwórz zmienną i zainicjuj ją jako tablicę"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Stwórz zmienną po raz pierwszy"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Stwórz zmienną i przypisz jej wartość pobraną z wyświetlonego monitu"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_deleteElement_description":function(d){return "Usuń element z określonym identyfikatorem"},
"dropletBlock_deleteElement_param0":function(d){return "identyfikator"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "rekord"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Podziel dwie liczby"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "promień"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Narysuj obraz na aktywnym płótnie z określonym elementem obrazu i x, y jako koordynatami od góry i od lewej strony"},
"dropletBlock_drawImage_param0":function(d){return "identyfikator"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "szerokość"},
"dropletBlock_drawImage_param4":function(d){return "wysokość"},
"dropletBlock_dropdown_description":function(d){return "Stwórz listę rozwijalną, przypisz jej identyfikator elementu i wypełnij ją listą elementów"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test jakości"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Pobiera alfa"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Pobiera podany atrybut"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Pobierz stan przycisku checkbox lub radio"},
"dropletBlock_getChecked_param0":function(d){return "identyfikator"},
"dropletBlock_getDirection_description":function(d){return "Pobierz kierunek żółwia (0 stopni kieruje w górę)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Pobierz ImageData z prostokąta (x, y, szerokość, wysokość) na aktywnym płótnie"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Pobierz adres URL powiązany z obrazem lub przycisk wysyłania obrazu"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "callbackFunction"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Pobierz tekst z określonego elementu"},
"dropletBlock_getText_param0":function(d){return "identyfikator"},
"dropletBlock_getTime_description":function(d){return "Pobierz aktualny czas w milisekundach"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getXPosition_description":function(d){return "Pobierz współrzędną x pozycji elementu"},
"dropletBlock_getXPosition_param0":function(d){return "identyfikator"},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getYPosition_description":function(d){return "Pobierz współrzędną y pozycji elementu"},
"dropletBlock_getYPosition_param0":function(d){return "identyfikator"},
"dropletBlock_getY_description":function(d){return "Pobiera bieżącą współrzędną y żółwia wyrażoną w pikselach"},
"dropletBlock_greaterThanOperator_description":function(d){return "Porównaj dwie liczby"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hideElement_description":function(d){return "Ukryj element o podanym id"},
"dropletBlock_hideElement_param0":function(d){return "identyfikator"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Chowa żółwia aby nie był już widoczny na ekranie"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_image_description":function(d){return "Stwórz obraz i przypisz mu identyfikator elementu"},
"dropletBlock_image_param0":function(d){return "identyfikator"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Test nierówności"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Porównaj dwie liczby"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Zaokrągl do najbliższej liczby całkowitej"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "piksele"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "piksele"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_multiplyOperator_description":function(d){return "Pomnożenie dwóch liczb"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logiczne NIE dla wartości logicznej"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND (I) operator logiczny"},
"dropletBlock_onEvent_description":function(d){return "Wykonaj kod w odpowiedzi na wskazane zdarzenie."},
"dropletBlock_onEvent_param0":function(d){return "identyfikator"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "zdarzenie"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "color"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Pick up the turtle's pen"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "szerokość"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Odtwarzaj plik dźwiękowy MP3, OGG lub WAV z określonego adresu URL"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "identyfikator"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "sprawdzony"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "onSuccess"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "szerokość"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "wysokość"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Zwróć wartość funkcji"},
"dropletBlock_return_signatureOverride":function(d){return "zwróć"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "identyfikator kanwy"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Ustawia daną wartość"},
"dropletBlock_setBackground_description":function(d){return "Ustawia obraz w tle"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "identyfikator"},
"dropletBlock_setChecked_param1":function(d){return "sprawdzony"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "color"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "identyfikator"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "milliseconds"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "callbackFunction"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "identyfikator"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "szerokość"},
"dropletBlock_setPosition_param4":function(d){return "wysokość"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "czerwony"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "zielony"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "niebieski"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Ustawia nastój postaci"},
"dropletBlock_setSpritePosition_description":function(d){return "Natychmiast przenosi postać do określonej lokalizacji."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Ustawia prędkość postaci"},
"dropletBlock_setSprite_description":function(d){return "Ustawia obrazek postaci"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "szerokość"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Dodaj tekst stylu CSS do elementu"},
"dropletBlock_setText_description":function(d){return "Ustaw tekst dla określonego elementu"},
"dropletBlock_setText_param0":function(d){return "identyfikator"},
"dropletBlock_setText_param1":function(d){return "tekst"},
"dropletBlock_setTimeout_description":function(d){return "Ustaw czasomierz i wykonuj kodu, gdy upłynie ta liczba milisekund"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Pokaż element o podanym id"},
"dropletBlock_showElement_param0":function(d){return "identyfikator"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_speed_description":function(d){return "Zmienić prędkość wykonywania programu do określonej wartości procentowej"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Zażądaj danych z Internetu i wykonaj kod, gdy żądanie zostanie spełnione"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Odejmowanie dwóch liczb"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "tekst"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "tekst"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "Wyrzuca pocisk z określonej postaci."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "kat"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "kat"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "kat"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "rekord"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Wymazuje postać."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Utwórz blok tekstu"},
"dropletBlock_write_param0":function(d){return "tekst"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Blok \"powtarzaj\" lub blok \"jeśli\" muszą zawierać inne bloki, by poprawnie działać. Upewnij się, czy wewnętrzny blok pasuje do zewnętrznego."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blok funkcji musi zawierać inne bloki, by działał."},
"emptyFunctionalBlock":function(d){return "Nie wprowadziłeś żadnej zawartości do swojego bloku."},
"end":function(d){return "koniec"},
"errorEmptyFunctionBlockModal":function(d){return "Wewnątrz definicji Twojej funkcji powinny znajdować się bloki. Kliknij przycisk Edytuj i przeciągnij bloki do wnętrza zielonego bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknij przycisk Edytuj, aby upewnić się, że wewnątrz definicji Twojej funkcji nie brakuje żadnego bloku."},
"errorParamInputUnattached":function(d){return "Pamiętaj, aby dołączyć blok do każdego parametru wejścia w bloku funkcji w Twoim obszarze roboczym."},
"errorQuestionMarksInNumberField":function(d){return "Spróbuj zastąpić ??? wartością."},
"errorRequiredParamsMissing":function(d){return "Utwórz parametr dla swojej funkcji klikając na przycisk Edytuj i dodając niezbędne parametry. Przeciągnij nowe bloki parametrów do definicji swojej funkcji."},
"errorUnusedFunction":function(d){return "Utworzyłeś funkcję, ale nigdy nie użyłeś jej w swoim obszarze roboczym! W przyborniku kliknij na Funkcje i upewnij się, że używasz ich w swoim programie."},
"errorUnusedParam":function(d){return "Dodałeś blok parametru, ale nie użyłeś go w definicji. Upewnij się, że używasz swojego parametru klikając na przycisk Editi i umieszczając blok parametru wewnątrz bloku zielonego."},
"extraTopBlocks":function(d){return "Masz niezałączone bloki. Czy chcesz je załączyć do bloku \"po uruchomieniu\"?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Gratulacje! Ukończyłeś ostatni etap."},
"finalStageTrophies":function(d){return "Gratulacje! Ukończyłeś ostatni etap i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"finish":function(d){return "Koniec"},
"generatedCodeInfo":function(d){return "Nawet najlepsze uczelnie uczą kodowania opartego o bloki (np. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ale bloki, które użyłeś, można również znaleźć w JavaScript, w jednym z najpowszechniej stosowanym języku programowania na świecie:"},
"genericFeedback":function(d){return "Zobacz jak zakończyłeś i spróbuj naprawić swój program."},
"hashError":function(d){return "Przepraszamy, '%1' nie odpowiada żadnemu zapisanemu programowi."},
"help":function(d){return "Pomoc"},
"hideToolbox":function(d){return "(Hide)"},
"hintHeader":function(d){return "Oto wskazówka:"},
"hintRequest":function(d){return "Zobacz wskazówkę"},
"hintTitle":function(d){return "Podpowiedź:"},
"infinity":function(d){return "Nieskończoność"},
"jump":function(d){return "skocz"},
"keepPlaying":function(d){return "Nie przestawaj grać"},
"levelIncompleteError":function(d){return "Używasz wszystkich niezbędnych rodzajów bloków, ale w niewłaściwy sposób."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Utwórz swoją grę Flappy"},
"missingBlocksErrorMsg":function(d){return "Spróbuj użyć jednego lub więcej poniższych bloków, by rozwiązać tę łamigłówkę."},
"nextLevel":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+" i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Gratulacje! Ukończyłeś etap "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulacje! Ukończyłeś etap "+common_locale.v(d,"stageName")+" i wygrałeś "+common_locale.p(d,"numTrophies",0,"pl",{"one":"trofeum","other":common_locale.n(d,"numTrophies")+" trofea"})+"."},
"numBlocksNeeded":function(d){return "Gratulacje! Rozwiązałeś Łamigłówkę nr "+common_locale.v(d,"puzzleNumber")+". (Jednakże, mogłeś użyć jedynie "+common_locale.p(d,"numBlocks",0,"pl",{"one":"blok","other":common_locale.n(d,"numBlocks")+" bloki"})+")"},
"numLinesOfCodeWritten":function(d){return "Właśnie napisałeś "+common_locale.p(d,"numLines",0,"pl",{"one":"linię","other":common_locale.n(d,"numLines")+" linii"})+" kodu!"},
"openWorkspace":function(d){return "Jak to Działa"},
"orientationLock":function(d){return "Wyłącz blokadę orientacji w ustawieniach urządzenia."},
"play":function(d){return "zagraj"},
"print":function(d){return "Drukuj"},
"puzzleTitle":function(d){return "Łamigłówka "+common_locale.v(d,"puzzle_number")+" z "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "powtarzaj"},
"resetProgram":function(d){return "Zresetuj"},
"rotateText":function(d){return "Obróć swoje urządzenie."},
"runProgram":function(d){return "Uruchom"},
"runTooltip":function(d){return "Uruchom program zdefiniowany za pomocą bloków w miejscu roboczym."},
"saveToGallery":function(d){return "Zapisz w galerii"},
"savedToGallery":function(d){return "Zapisane w galerii!"},
"score":function(d){return "wynik"},
"shareFailure":function(d){return "Przepraszamy, ale nie możemy udostępnić tego programu."},
"showBlocksHeader":function(d){return "Pokaż Bloki"},
"showCodeHeader":function(d){return "Pokaż Kod"},
"showGeneratedCode":function(d){return "Pokaż kod"},
"showToolbox":function(d){return "Show Toolbox"},
"signup":function(d){return "Zapisz się na kurs wprowadzający"},
"stringEquals":function(d){return "łańcuch=?"},
"subtitle":function(d){return "środowisko wizualnego programowania"},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Musisz poprawić błąd w programie, zanim będzie wyświetlony w blokach."},
"tooFewBlocksMsg":function(d){return "Używasz wszystkich wymaganych rodzajów bloków, ale spróbuj użyć ich więcej, aby ukończyć łamigłówkę."},
"tooManyBlocksMsg":function(d){return "Ta łamigłówka może być rozwiązana przy pomocy bloków <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Spowodowałeś, że miałem dużo pracy. Czy możesz zmniejszyć liczbę powtórzeń?"},
"toolboxHeader":function(d){return "Bloki"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Sumaryczny wynik: "+common_locale.p(d,"numLines",0,"pl",{"one":"1 linia","other":common_locale.n(d,"numLines")+" linii"})+" kodu."},
"tryAgain":function(d){return "Spróbuj ponownie"},
"tryHOC":function(d){return "Weź udział w Godzinie Kodowania (the Hour of Code)"},
"wantToLearn":function(d){return "Czy chcesz nauczyć się kodowania (programowania)?"},
"watchVideo":function(d){return "Obejrzyj wideo"},
"when":function(d){return "kiedy"},
"whenRun":function(d){return "po uruchomieniu"},
"workspaceHeaderShort":function(d){return "Obszar roboczy: "}};