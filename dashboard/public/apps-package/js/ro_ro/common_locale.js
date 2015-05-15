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
"and":function(d){return "şi"},
"backToPreviousLevel":function(d){return "Înapoi la nivelul anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocuri"},
"booleanFalse":function(d){return "fals"},
"booleanTrue":function(d){return "adevărat"},
"catActions":function(d){return "Acţiuni"},
"catColour":function(d){return "Culoare"},
"catLists":function(d){return "Liste"},
"catLogic":function(d){return "Logică"},
"catLoops":function(d){return "Bucle"},
"catMath":function(d){return "Matematică"},
"catProcedures":function(d){return "Funcţii"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variabile"},
"clearPuzzle":function(d){return "Reia"},
"clearPuzzleConfirm":function(d){return "Acest lucru va reseta puzzle la starea sa de start şi va şterge toate blocurile pe care le-aţi adăugat sau modificat."},
"clearPuzzleConfirmHeader":function(d){return "Sunteţi sigur că doriţi să reînceapă?"},
"codeMode":function(d){return "Cod"},
"codeTooltip":function(d){return "Vezi codul JavaScript generat."},
"continue":function(d){return "Continuă"},
"defaultTwitterText":function(d){return "Verifică ceea ce am creat"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Mod proiectare"},
"dialogCancel":function(d){return "Anulează"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Adăugaţi două numere"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Adaugă operatorul"},
"dropletBlock_andOperator_description":function(d){return "Returnează ADEVĂRAT numai atunci când ambele expresii sunt adevărate și FALS în caz contrar"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ŞI (AND) operator boolean"},
"dropletBlock_arcLeft_description":function(d){return "Mută țestoasa înainte şi spre stânga într-un arc lin circular"},
"dropletBlock_arcLeft_param0":function(d){return "unghi"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "raza"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Mută țestoasa înainte şi spre dreapta într-un arc lin circular"},
"dropletBlock_arcRight_param0":function(d){return "unghi"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "raza"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Atribuie o valoare unei variabile existente. De exemplu, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Atribuie o variabilă"},
"dropletBlock_button_description":function(d){return "Creează un buton pe care se poate da clic. Butonul va afişa textul furnizat şi poate fi referit cu ID-ul dat"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "scris"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "Apelează o anumită funcție care nu are parametri"},
"dropletBlock_callMyFunction_n_description":function(d){return "Apelează o anumită funcție care are unul sau mai mulți parametri"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Apelează o funcție cu parametri"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Apelează o funcție"},
"dropletBlock_changeScore_description":function(d){return "Adăugaţi sau eliminaţi un punct la scor."},
"dropletBlock_checkbox_description":function(d){return "Creaţi o casetă de selectare şi atribuiţi-i un id de element"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "selectat"},
"dropletBlock_circle_description":function(d){return "Desenaţi un cerc pe planșa activă cu coordonatele specificate pentru centrul (x, y) şi rază"},
"dropletBlock_circle_param0":function(d){return "centruX"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "centruY"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "raza"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Şterge toate datele de pe planșa activă"},
"dropletBlock_clearInterval_description":function(d){return "Curăță intervalul dat al unui cronometru transmițând valoarea returnată de setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Curăță intervalul dat al unui cronometru transmițând valoarea returnată de setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Afișează în consolă șirul sau variabila"},
"dropletBlock_console.log_param0":function(d){return "mesaj"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Creaţi un container de divizare cu ID-ul specificat şi, opțional, setați-i conținutul interior HTML"},
"dropletBlock_createCanvas_description":function(d){return "Creaţi o planșă cu ID-ul specificat şi, opţional, setaţi lăţimea şi înălţimea"},
"dropletBlock_createCanvas_param0":function(d){return "plansaId"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "lăţime"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "înălțime"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "Folosind tabela de stocare a datelor App Lab , creează o înregistrare cu un id unic în numele de tabel furnizat, şi apelează callbackFunction atunci când acţiunea se termină."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "înregistrare"},
"dropletBlock_createRecord_param2":function(d){return "funcţie"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Declară o variabilă şi îi atribuie o secvență de valori iniţiale date"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declarați o variabilă căreia i se atribuie o secvență"},
"dropletBlock_declareAssign_x_description":function(d){return "Declară o variabilă cu numele dat după \"var\", şi îi atribuie valoarea din partea dreapta a expresiei"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Precizează că secvența de cod folosește acum o variabilă şi îi atribuie o valoare iniţială furnizată de utilizator"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Solicitați-i utilizatorului o valoare şi memorați-o"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declarați o variabilă"},
"dropletBlock_deleteElement_description":function(d){return "Ștergeți elementul cu id precizat"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Folosind tabela de stocare a datelor App Lab, şterge înregistrarea furnizată de tableName. Înregistrarea este un obiect care trebuie să fie identificat în mod unic cu câmpul id al său. La terminarea apelului, se apelează callbackFunction."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "înregistrare"},
"dropletBlock_deleteRecord_param2":function(d){return "funcţie"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Împărțiți două numere"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Operatorul de împărțite"},
"dropletBlock_dot_description":function(d){return "Desenează un punct la poziția țestoasei cu raza precizată"},
"dropletBlock_dot_param0":function(d){return "raza"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Desenează imaginea specificată sau un element de pe planșa activă la poziţia specificată şi, opţional, redimensioanează elementul la lăţimea şi înălţimea precizate"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "lăţime"},
"dropletBlock_drawImage_param4":function(d){return "înălțime"},
"dropletBlock_dropdown_description":function(d){return "Creaţi o listă dropdown, atribuiţi-i un id de element şi încărcați-l cu o listă de elemente"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, Optiuni2,..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Testaţi dacă două valori sunt egale. Returnează adevărat dacă valoarea din partea stângă a expresiei este egală cu valoarea din partea dreaptă a acesteia, iar în caz contrar false"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operatorul de egalitate"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Creează o buclă constând dintr-o expresie de iniţializare, o expresie condiţională, o expresie de incrementare şi un bloc de declaraţii executat pentru fiecare repetare a buclei"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "pentru buclă"},
"dropletBlock_functionParams_n_description":function(d){return "Un set de instrucțiuni care ia unul sau mai multe parametri şi efectuează o sarcină sau calculează o valoare atunci când funcţia este apelată"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definiți o funcţie cu parametri"},
"dropletBlock_functionParams_none_description":function(d){return "Un set de instrucțiuni care execută o sarcină sau calculează o valoare atunci când funcţia este apelată"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definiți o funcţie"},
"dropletBlock_getAlpha_description":function(d){return "Returnează valoarea alpha (opacitatea) (de la 0 la 255) în culoarea pixelului situat la poziția dată de x şi y în imaginea dată"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Obține atributul dat"},
"dropletBlock_getBlue_description":function(d){return "Obține cantitatea de albastru (de la 0 la 255) în culoarea pixelului situat la poziția dată de x şi  y în imaginea dată"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Determinați starea unui buton de selectare sau a unui buton radio"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Returnează direcţia curentă spre care este îndreptată țestoasa. 0 grade dacă este îndreptată în sus"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "key"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "funcţie"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Get the text from the specified element"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getXPosition_description":function(d){return "Get the element's x position"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getYPosition_description":function(d){return "Get the element's y position"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
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
"dropletBlock_mathAbs_description":function(d){return "Ia valoarea absolută a lui x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Ia valoarea maximă dintre una sau mai multe valori n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Ia valoarea minimă dintre una sau mai multe valori n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Rotunjeşte un număr la cel mai apropiat întreg"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "pixeli"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "pixeli"},
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
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "funcţie"},
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
"dropletBlock_penWidth_param0":function(d){return "lăţime"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "selectat"},
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
"dropletBlock_readRecords_param2":function(d){return "funcţie"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "lăţime"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "înălțime"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "returnează"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "plansaId"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Setează imaginea de fundal"},
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
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "selectat"},
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
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "funcţie"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "milliseconds"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "key"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "value"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "funcţie"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "lăţime"},
"dropletBlock_setPosition_param4":function(d){return "înălțime"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "roşu"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "verde"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "albastru"},
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
"dropletBlock_setSpriteEmotion_description":function(d){return "Setează starea de spirit de actor"},
"dropletBlock_setSpritePosition_description":function(d){return "Instantaneu mută un actor la locația specificată."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Setează viteza unui actor"},
"dropletBlock_setSprite_description":function(d){return "Setează imaginea actorului"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "color"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "lăţime"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "scris"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "funcţie"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "value"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "funcţie"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "scris"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "scris"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "Aruncă un proiectil de la actorul specificat."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "unghi"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "unghi"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "unghi"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "înregistrare"},
"dropletBlock_updateRecord_param2":function(d){return "funcţie"},
"dropletBlock_vanish_description":function(d){return "Şterge actorul."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "scris"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Blocul \"Repetă\" sau \"Dacă\" trebuie să aibe alte blocuri în interiorul său  pentru a putea funcționa. Asigură-te că blocul interior se încadrează corect în blocul care îl conține."},
"emptyFunctionBlocksErrorMsg":function(d){return "Blocul de funcţie trebuie să aibă alte blocuri în interior ca să funcţioneze."},
"emptyFunctionalBlock":function(d){return "Ai un bloc necompletat."},
"end":function(d){return "șfârșit"},
"errorEmptyFunctionBlockModal":function(d){return "În interiorul definiției unei funcții trebuie să includem blocuri. Dați clic pe ”editare” și trageți blocuri în interiorul blocului verde."},
"errorIncompleteBlockInFunction":function(d){return "Faceţi clic pe \"editare\" pentru a vă asigura că nu aveţi blocuri lipsă în interiorul definiţiei funcţiei dvs."},
"errorParamInputUnattached":function(d){return "Amintiţi-vă să ataşați un bloc pentru fiecare parametru de intrare în blocul funcţiei din spaţiul de lucru."},
"errorQuestionMarksInNumberField":function(d){return "Încercaţi să înlocuiți \"???\" cu o valoare."},
"errorRequiredParamsMissing":function(d){return "Creaţi un parametru pentru funcţia dvs. făcând clic pe \"Editaţi\" şi adăugând parametrii necesari. Glisaţi noile blocuri parametru în definiţia funcţiei dvs."},
"errorUnusedFunction":function(d){return "Ați creat o funcţie, dar nu ați folosit-o în spaţiul de lucru! Faceţi clic pe \"Funcţii\" în caseta de instrumente şi asiguraţi-vă că o folosiţi în programul dvs."},
"errorUnusedParam":function(d){return "Aţi adăugat un bloc de parametri, dar nu l-ați utilizat în definiţie. Asiguraţi-vă de utilizarea parametrului dvs. făcând clic pe \"Editaţi\" şi plasând blocul parametru în interiorul blocului verde."},
"extraTopBlocks":function(d){return "Ai blocuri neatașate. Ai vrut să ataşezi acestea la blocul \"atunci când rulaţi\"?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Felicitări! Ai terminat ultima etapă."},
"finalStageTrophies":function(d){return "Felicitări! Ai terminat etapa finală şi ai câştigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Sfârsit"},
"generatedCodeInfo":function(d){return "Chiar și în universităţi de top se predă programarea bazată pe blocuri de coduri (de exemplu, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Dar în esență, blocurile de cod pe care le-ai compus pot fi de asemenea afișate în JavaScript, limbajul de programare cel mai utilizat din lume:"},
"genericFeedback":function(d){return "Vezi cum se termină şi încearcă să-ți corectezi programul."},
"hashError":function(d){return "Ne pare rău, '%1' nu corespunde cu nici un program salvat."},
"help":function(d){return "Ajutor"},
"hideToolbox":function(d){return "(Hide)"},
"hintHeader":function(d){return "Iată un sfat:"},
"hintRequest":function(d){return "Dă un indiciu"},
"hintTitle":function(d){return "Sugestie:"},
"infinity":function(d){return "Infinit"},
"jump":function(d){return "sari"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Utilizezi toate tipurile de blocuri necesare, dar nu așa cum trebuie."},
"listVariable":function(d){return "listă"},
"makeYourOwnFlappy":function(d){return "Crează-ți propriul tău joc Flappy"},
"missingBlocksErrorMsg":function(d){return "Încearcă unul sau mai multe blocuri de mai jos pentru a rezolva acest puzzle."},
"nextLevel":function(d){return "Felicitări! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Felicitări! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+" și ai câștigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Felicitări! Ai terminat "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Felicitări! Ai finalizat Etapa "+common_locale.v(d,"stageName")+" și ai câștigat "+common_locale.p(d,"numTrophies",0,"ro",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Felicităr! Ai terminat Puzzle-ul "+common_locale.v(d,"puzzleNumber")+". (Însă, ai fi putut folosi doar "+common_locale.p(d,"numBlocks",0,"ro",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ai scris doar "+common_locale.p(d,"numLines",0,"ro",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" de cod!"},
"openWorkspace":function(d){return "Cum funcţionează"},
"orientationLock":function(d){return "Oprește blocarea de orientare în setările dispozitivului."},
"play":function(d){return "joacă"},
"print":function(d){return "Tipărire"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" din "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "repetă"},
"resetProgram":function(d){return "Resetează"},
"rotateText":function(d){return "Rotește dispozitivul tău."},
"runProgram":function(d){return "Rulează"},
"runTooltip":function(d){return "Rulează programul definit de blocuri în spațiul de lucru."},
"saveToGallery":function(d){return "Salvare în galerie"},
"savedToGallery":function(d){return "Salvat în galerie!"},
"score":function(d){return "scor"},
"shareFailure":function(d){return "Ne pare rau, nu putem să distribuim acest program."},
"showBlocksHeader":function(d){return "Afișează blocurile"},
"showCodeHeader":function(d){return "Arată codul"},
"showGeneratedCode":function(d){return "Arată codul"},
"showToolbox":function(d){return "Show Toolbox"},
"signup":function(d){return "Înscrie-te la cursul introductiv"},
"stringEquals":function(d){return "şir =?"},
"subtitle":function(d){return "un mediu de programare vizual"},
"textVariable":function(d){return "scris"},
"toggleBlocksErrorMsg":function(d){return "Trebuie să corectați o eroare în programul dumneavoastră înainte să poată fi inclusă ca bloc."},
"tooFewBlocksMsg":function(d){return "Folosești toate tipurile necesare de blocuri, dar încearcă să utilizezi mai multe din aceste tipuri de blocuri pentru a completa puzzle-ul."},
"tooManyBlocksMsg":function(d){return "Acest puzzle poate fi rezolvat cu blocuri <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "M-ai făcut să lucrez foarte mult! Ai putea să încerci să repeți de mai puține ori?"},
"toolboxHeader":function(d){return "blocuri"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Totalul all-time: "+common_locale.p(d,"numLines",0,"ro",{"one":"1 linie","other":common_locale.n(d,"numLines")+" linii"})+" de cod."},
"tryAgain":function(d){return "Încearcă din nou"},
"tryHOC":function(d){return "Încearcă Ora de Cod"},
"wantToLearn":function(d){return "Vrei să înveți să codezi?"},
"watchVideo":function(d){return "Urmărește clipul video"},
"when":function(d){return "când"},
"whenRun":function(d){return "când rulezi"},
"workspaceHeaderShort":function(d){return "Spaţiu de lucru: "}};