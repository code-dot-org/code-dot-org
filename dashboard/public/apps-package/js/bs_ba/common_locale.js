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
"booleanTrue":function(d){return "istinito"},
"booleanFalse":function(d){return "neistinito"},
"blocks":function(d){return "blokovi"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Akcije"},
"catColour":function(d){return "Boja"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Liste"},
"catLoops":function(d){return "Petlje"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Varijable"},
"clearPuzzle":function(d){return "Počni Ponovo"},
"clearPuzzleConfirm":function(d){return "Ova akcija će resetovati ovaj zadatak na njegovo početno stanje i izbrisati će sve blokove koje si dodao/la ili promijenio/la."},
"clearPuzzleConfirmHeader":function(d){return "Jesi li siguran/na da želiš početi iznova?"},
"codeMode":function(d){return "Kôd"},
"codeTooltip":function(d){return "Pogledaj stvoreni JavaScript kôd."},
"continue":function(d){return "Nastavi"},
"designMode":function(d){return "Dizajn"},
"designModeHeader":function(d){return "Način Dizajniranje"},
"dialogCancel":function(d){return "Poništi"},
"dialogOK":function(d){return "U redu"},
"directionNorthLetter":function(d){return "Sjever"},
"directionSouthLetter":function(d){return "Jug"},
"directionEastLetter":function(d){return "Istok"},
"directionWestLetter":function(d){return "Zapad"},
"dropletBlock_addOperator_description":function(d){return "Saberi dva broja"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Vraća istinito samo onda kada su oba izraza istinita. U suprotnom vraća neistinito"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND (I) logički operator"},
"dropletBlock_arcLeft_description":function(d){return "Move the turtle in a counterclockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "prečnik"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "prečnik"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Create a button and assign it an element id"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "tekst"},
"dropletBlock_callMyFunction_description":function(d){return "Zove imenovanu funkciju koja ne uzima parametre"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Zovi funkciju"},
"dropletBlock_callMyFunction_n_description":function(d){return "Poziva imenovanu funkciju koja uzima jedan ili više parametara"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Poziva funkciju sa parametrima"},
"dropletBlock_changeScore_description":function(d){return "Dodaj ili oduzmi bod."},
"dropletBlock_checkbox_description":function(d){return "Napravi okvir za izbor i dodijeli mu ID elementa"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Nacrtaj krug na aktivnom platnu sa datim koordinatama centra (x,y) i prečnik"},
"dropletBlock_circle_param0":function(d){return "centarX"},
"dropletBlock_circle_param1":function(d){return "centarY"},
"dropletBlock_circle_param2":function(d){return "prečnik"},
"dropletBlock_clearCanvas_description":function(d){return "Izbriši sve podatke sa aktivnog platna"},
"dropletBlock_clearInterval_description":function(d){return "Obriši postojeći interval vremenskog brojača tako što ćeš proslijediti vrijednost vraćenu iz postaviInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Obriši postojeći vremenski brojač tako što češ proslijediti vrijednost vraćenu od setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Prikazuje niz karaktera ili varijablu na prikaz konzole"},
"dropletBlock_console.log_param0":function(d){return "poruka"},
"dropletBlock_container_description":function(d){return "Napravi odjeljak (\"kontejner\") sa datim ID elementa, i po želji, postavi njegov unutrašnji HTML"},
"dropletBlock_createCanvas_description":function(d){return "Napravi platno sa datim ID-om, i po želji, postavi širinu i visinu"},
"dropletBlock_createCanvas_param0":function(d){return "platnoId"},
"dropletBlock_createCanvas_param1":function(d){return "širina"},
"dropletBlock_createCanvas_param2":function(d){return "visina"},
"dropletBlock_createRecord_description":function(d){return "Koristeći tabelu za pohranu podataka App Laboratorije, pravi zapis sa jedinstvenim ID-om u datoj tabeli, i onda zove callbackFunction pri završetku akcije."},
"dropletBlock_createRecord_param0":function(d){return "tabelaIme"},
"dropletBlock_createRecord_param1":function(d){return "zapis"},
"dropletBlock_createRecord_param2":function(d){return "funkcija"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Deklarira varijablu sa datim imenom nakon 'var', i dodijeljuje joj vrijednost na desnoj strani izraza"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Deklariraj varijablu"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Izbriši element sa datim ID-om"},
"dropletBlock_deleteElement_param0":function(d){return "ID"},
"dropletBlock_deleteRecord_description":function(d){return "Koristeći tabelu za pohranu podataka App Laobratorije, briše dati zapis u tabelaIme. Zapis je objekat koji mora biti jedinstveno identifikovan uz pomoć svog ID polja. Kada je poziv završen, poziva se callbackFunction."},
"dropletBlock_deleteRecord_param0":function(d){return "tabelaIme"},
"dropletBlock_deleteRecord_param1":function(d){return "zapis"},
"dropletBlock_deleteRecord_param2":function(d){return "funkcija"},
"dropletBlock_divideOperator_description":function(d){return "Podijeli dva broja"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Crta tačku na mjestu kornjačine lokacije sa datim prečnikom"},
"dropletBlock_dot_param0":function(d){return "prečnik"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_drawImage_param0":function(d){return "ID"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "širina"},
"dropletBlock_drawImage_param4":function(d){return "visina"},
"dropletBlock_dropdown_description":function(d){return "Kreiraj padajući izbornik, dodijeli mu ID elementa, i ispuni ga sa listom elemenata"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Kreira petlju koja se sastoji od izaza inicijalizacije, uvjetnog izraza, inkrementirajućeg izraza, i bloka izraza izvršenih za svaku iteraciju petlje"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "od-do-za petlja"},
"dropletBlock_functionParams_n_description":function(d){return "Skup izraza koji uzima jedan ili više parametara, i obavlja zadatak ili izračunava vrijednost kada je funkcija pozvana"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definiraj funkciju sa parametrima"},
"dropletBlock_functionParams_none_description":function(d){return "Skup izjava koji izvršavaju zadatak ili računaju vrijednost pri pozivu funkcije"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definiraj funkciju"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Dobija dati atribut"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Uzmi stanje okvira za izbor ili radio dugmeta"},
"dropletBlock_getChecked_param0":function(d){return "ID"},
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
"dropletBlock_getKeyValue_param0":function(d){return "ključ"},
"dropletBlock_getKeyValue_param1":function(d){return "funkcija"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Uzmi tekst iz datog elementa"},
"dropletBlock_getText_param0":function(d){return "ID"},
"dropletBlock_getTime_description":function(d){return "Uzmi trenutno vrijeme u milisekundama"},
"dropletBlock_getUserId_description":function(d){return "Uzima jedinstveni identifikator za trenutnog korisnika ove aplikacije"},
"dropletBlock_getX_description":function(d){return "Uzima kornjačinu trenutnu x koordinatu u pikselima"},
"dropletBlock_getXPosition_description":function(d){return "Uzmi x poziciju elementa"},
"dropletBlock_getXPosition_param0":function(d){return "ID"},
"dropletBlock_getY_description":function(d){return "Uzima kornjačinu trenutnu y koordinatu u pikselima"},
"dropletBlock_getYPosition_description":function(d){return "Uzmi y poziciju elementa"},
"dropletBlock_getYPosition_param0":function(d){return "ID"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Sakriva kornjaču tako da više nije prikazana na ekranu"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "ID"},
"dropletBlock_ifBlock_description":function(d){return "Izvršava blok izraza ako je dati uvjet istinit"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "ako izjava"},
"dropletBlock_ifElseBlock_description":function(d){return "Izvršava blok izraza ako je dati uvjet istinit; u suprotnom, izvršava se blok izraza u \"inače\" dijelu"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ako/inače izraz"},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "ID"},
"dropletBlock_image_param1":function(d){return "URL"},
"dropletBlock_imageUploadButton_description":function(d){return "Kreiraj sliku, učitaj dugme i dodijeli mu ID elementa"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Postavi unutranji HTML za element sa datim ID-om"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Crta liniju na aktivnom platnu od x1, y1 do x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Uzima apsolutnu vrijednost od x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.Abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Uzima maksimalnu vrijednost of jedne ili više vrijednosti n1, n2,..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Uzima najmanju vrijednost jedne ili više vrijednosti n1, n2,..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1, n2,..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Pomiče kornjaču s trenutne lokacije. Dodaje x kornjačinoj x poziciji i y kornjačinoj y poziciji"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Pomiče kornjaču unazad za zadani broj piksela u njenom trenutnom pravcu kretanja"},
"dropletBlock_moveBackward_param0":function(d){return "pikseli"},
"dropletBlock_moveForward_description":function(d){return "Pomiče kornjaču naprijed za zadani broj piksela u njenom trenutnom pravcu kretanja"},
"dropletBlock_moveForward_param0":function(d){return "pikseli"},
"dropletBlock_moveTo_description":function(d){return "Pomiče kornjaču na određenu x, y koordinatu na ekranu"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Pomnoži dva broja"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Vraća neistinito ako se izraz može pretvoriti u istinito; inače, vraća istinito"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Execute code in response to the specified event."},
"dropletBlock_onEvent_param0":function(d){return "ID"},
"dropletBlock_onEvent_param1":function(d){return "događaj"},
"dropletBlock_onEvent_param2":function(d){return "funkcija"},
"dropletBlock_orOperator_description":function(d){return "Vraća istinito ako je jedan od izraza istinit, i neistinito u suprotnom"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ILI logički operator"},
"dropletBlock_penColor_description":function(d){return "Postavlja boju linije nacrtanu iza kornjače dok se ona kreće"},
"dropletBlock_penColor_param0":function(d){return "boja"},
"dropletBlock_penColour_description":function(d){return "Postavlja boju linije nacrtanu iza kornjače dok se ona kreće"},
"dropletBlock_penColour_param0":function(d){return "boja"},
"dropletBlock_penDown_description":function(d){return "Uzrokuje crtanje linije iza kornjače prilikom njenog pokretanja"},
"dropletBlock_penUp_description":function(d){return "Zaustavlja crtanje linije iza kornjače pri njenom kretanju"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "širina"},
"dropletBlock_playSound_description":function(d){return "Reprodukuj MP3, OGG ili WAV zvučne datoteke s navedenim URL-om"},
"dropletBlock_playSound_param0":function(d){return "URL"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "ID"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Korištenjem tabele za pohranu podataka App Laboratorije, učitava zapise iz date tabelaName koja se podudara sa searchTerms. Kada je poziv završen, zove se callbackFunction sa proslijeđenim nizom zapisa."},
"dropletBlock_readRecords_param0":function(d){return "tabelaIme"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "funkcija"},
"dropletBlock_rect_description":function(d){return "Crta pravougaonik na aktivno platno lociranog u upperLeftX i upperLeftY, i sa širinom i visinom."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "širina"},
"dropletBlock_rect_param3":function(d){return "visina"},
"dropletBlock_return_description":function(d){return "Vrati vrijednost iz funkcije"},
"dropletBlock_return_signatureOverride":function(d){return "vrati"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "platnoId"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Postavlja zadanu vrijednost"},
"dropletBlock_setBackground_description":function(d){return "Postavlja pozadinsku sliku"},
"dropletBlock_setBlue_description":function(d){return "Postavlja količinu plave (u rasponu od 0 do 255) u boju piksela na poziciji x i y u datoj slici na vrijednost  blueValue ulaznog parametra."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Postavi stanje okvira za izbor ili radio dugmeta"},
"dropletBlock_setChecked_param0":function(d){return "ID"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "boja"},
"dropletBlock_setGreen_description":function(d){return "Postavlja količinu zelene (u rasponu od 0 do 255) u boju piksela na x i y poziciji u datoj slici podataka na vrijednost ulaznog parametra greenValue."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "ID"},
"dropletBlock_setImageURL_param1":function(d){return "URL"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "milisekunde"},
"dropletBlock_setKeyValue_description":function(d){return "Pohranjuje ključ/vrijednost par u bazu podataka App Lab-a formata ključ/vrijednost, i zove callbackFunction kada je akcija završena."},
"dropletBlock_setKeyValue_param0":function(d){return "ključ"},
"dropletBlock_setKeyValue_param1":function(d){return "vrijednost"},
"dropletBlock_setKeyValue_param2":function(d){return "funkcija"},
"dropletBlock_setParent_description":function(d){return "Postavi element tako da postane dijete roditelj elementa"},
"dropletBlock_setPosition_description":function(d){return "Postavi element sa x, y, širina i visina koordinatama"},
"dropletBlock_setPosition_param0":function(d){return "ID"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "širina"},
"dropletBlock_setPosition_param4":function(d){return "visina"},
"dropletBlock_setRed_description":function(d){return "Postavlja količinu crvene (u rasponu od 0 do 255) u boju piksela na x i y poziciji u datoj slici podataka na vrijednost ulaznog parametra redValue."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "crvena"},
"dropletBlock_setRGB_param4":function(d){return "zelena"},
"dropletBlock_setRGB_param5":function(d){return "plava"},
"dropletBlock_setStrokeColor_description":function(d){return "Postavi boje poteza kista za aktivna platna"},
"dropletBlock_setStrokeColor_param0":function(d){return "boja"},
"dropletBlock_setSprite_description":function(d){return "Postavlja izgled lika"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Postavlja raspoloženje lika"},
"dropletBlock_setSpritePosition_description":function(d){return "Odmah premješta lik na zadanu poziciju."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Postavlja brzinu lika"},
"dropletBlock_setStrokeWidth_description":function(d){return "Postavi širinu linije za aktivno platno"},
"dropletBlock_setStrokeWidth_param0":function(d){return "širina"},
"dropletBlock_setStyle_description":function(d){return "Dodaj elementu CSS stil teksta"},
"dropletBlock_setText_description":function(d){return "Postavi tekst za dati element"},
"dropletBlock_setText_param0":function(d){return "ID"},
"dropletBlock_setText_param1":function(d){return "tekst"},
"dropletBlock_setTimeout_description":function(d){return "Postavi vremenski brojač i izvrši kod kada protekne taj broj milisekundi"},
"dropletBlock_setTimeout_param0":function(d){return "funkcija"},
"dropletBlock_setTimeout_param1":function(d){return "milisekunde"},
"dropletBlock_show_description":function(d){return "Prikazuje kornjaču na ekranu, tako što učini njenu trenutnu lokaciju vidljivom"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "ID"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "vrijednost"},
"dropletBlock_startWebRequest_description":function(d){return "Zahtjevaj podatke s interneta i izvrši kod kada je zahtjev kompletiran"},
"dropletBlock_startWebRequest_param0":function(d){return "URL"},
"dropletBlock_startWebRequest_param1":function(d){return "funkcija"},
"dropletBlock_subtractOperator_description":function(d){return "Oduzmi dva broja"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Kreiraj unost teksta i dodijeli mu ID elementa"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "tekst"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "tekst"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Odabrani lik baca projektil."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Korištenjem tabele za pohranu podataka App Laboratorije, ažurira dati zapis u tableName. Zapis mora biti identifikovan jedinstveno za svojim ID poljem. Kada je poziv kompletiran, zove se callbackFunction"},
"dropletBlock_updateRecord_param0":function(d){return "tabelaIme"},
"dropletBlock_updateRecord_param1":function(d){return "zapis"},
"dropletBlock_updateRecord_param2":function(d){return "funkcija"},
"dropletBlock_vanish_description":function(d){return "Učini da lik nestane."},
"dropletBlock_whileBlock_description":function(d){return "Stvara petlju koja se sastoji od uvjetnog izraza i bloka izraza koji se izvršavaju pri svakoj iteraciji petlje. Petlja se nastavlja izvršavati sve dok je uvjet istinit"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "dok petlja"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "tekst"},
"end":function(d){return "kraj"},
"emptyBlocksErrorMsg":function(d){return "Da bi blokovi \"Ponovi\" ili \"Ako\" radili, u njih treba ugraditi druge blokove. Provjeri uklapa li se unutarnji blok pravilno u vanjski blok."},
"emptyFunctionalBlock":function(d){return "Imaš nepopunjen blok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funkcijski blok treba u sebi sadržavati druge blokove da bi mogao raditi."},
"errorEmptyFunctionBlockModal":function(d){return "Moraš staviti blokove unutar definicije funkcije. Klikni na \"uredi\" i dovuci blokove unutar zelenog bloka."},
"errorIncompleteBlockInFunction":function(d){return "Klikni na \"uredi\" da budeš siguran da nijedan blok ne nedostaje unutar tvoje definicije funkcije."},
"errorParamInputUnattached":function(d){return "Sjeti se da prikačiš blok za svaki unos parametra na blok funkcije na svojoj radnoj površini."},
"errorUnusedParam":function(d){return "Dodao si blok parametara, ali ga nisi koristio u definiciji. Pobrini se da koristiš svoj parametar tako da klikneš na \"uredi\" i staviš blok parametara unutar zelenog bloka."},
"errorRequiredParamsMissing":function(d){return "Napravi parametar za svoju funkciju tako da što ćeš kliknuti na \"uredi\" i dodati neophodne parametre. Dovuci nove blokove parametara u svoju definiciju funkcije."},
"errorUnusedFunction":function(d){return "Napravio si funkciju, ali je nikad nisi koristio na svojoj radnoj površini! Klikni na \"Funkcije\" na alatnoj traci i pobrini se da je iskoristiš u svom programu."},
"errorQuestionMarksInNumberField":function(d){return "Pokušaj zamijeniti \"???\" sa nekom vrijednošću."},
"extraTopBlocks":function(d){return "Imaš neprivezane blokove."},
"extraTopBlocksWhenRun":function(d){return "Imaš neprivezane blokove. Da li si mislio/la da ih prikačiš za \"pri pokretanju\" blok?"},
"finalStage":function(d){return "Čestitamo! Posljednja faza je završena."},
"finalStageTrophies":function(d){return "Čestitamo! Završena je posljednja faza i osvajaš "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"finish":function(d){return "Završi"},
"generatedCodeInfo":function(d){return "Čak i vrhunski univerziteti podučavaju kodiranje pomoću blokova (npr. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ali u suštini, blokovi koje si spojio se mogu prikazati kao kôd u JavaScript'u, najkorištenijem programskom jeziku na svijetu:"},
"hashError":function(d){return "Nažalost, '%1' ne odgovara nijednom snimljenom programu."},
"help":function(d){return "Pomoć"},
"hintTitle":function(d){return "Savjet:"},
"jump":function(d){return "skoči"},
"keepPlaying":function(d){return "Nastaviti Igrati"},
"levelIncompleteError":function(d){return "Koristiš sve potrebne vrste blokova, ali na pogrešan način."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Napravi Svoju vlastitu Flappy igricu"},
"missingBlocksErrorMsg":function(d){return "Za rješavanje ovog zadatka isprobaj jedan ili više blokova koji se nalaze ispod."},
"nextLevel":function(d){return "Čestitamo! Zadatak "+locale.v(d,"puzzleNumber")+" je riješen."},
"nextLevelTrophies":function(d){return "Čestitamo! Riješivši Zadatak "+locale.v(d,"puzzleNumber")+" osvajaš "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Čestitke! Završio si "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Čestitamo! Završio si fazu "+locale.v(d,"stageName")+" i osvojio "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"numBlocksNeeded":function(d){return "Čestitamo! Zadatak "+locale.v(d,"puzzleNumber")+" je riješen. (Međutim, mogao si samo iskoristiti "+locale.p(d,"numBlocks",0,"en",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokova"})+".)"},
"numLinesOfCodeWritten":function(d){return "Upravo si napisao "+locale.p(d,"numLines",0,"en",{"one":"1 liniju","other":locale.n(d,"numLines")+" linija"})+" kôda!"},
"play":function(d){return "igraj"},
"print":function(d){return "Isprintaj"},
"puzzleTitle":function(d){return "Zadatak "+locale.v(d,"puzzle_number")+" od "+locale.v(d,"stage_total")},
"repeat":function(d){return "ponovi"},
"resetProgram":function(d){return "Resetuj"},
"runProgram":function(d){return "Pokreni"},
"runTooltip":function(d){return "Pokreni program određen blokovima na radnom prostoru."},
"score":function(d){return "bodovi"},
"showCodeHeader":function(d){return "Pokaži Kôd"},
"showBlocksHeader":function(d){return "Pokaži Blokove"},
"showGeneratedCode":function(d){return "Pokaži kôd"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "grafičko okruženje za programiranje"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Koristiš sve neophodne vrste blokova, ali za rješavanje ovog zadatka pokušaj koristiti više ovakvih blokova."},
"tooManyBlocksMsg":function(d){return "Ovaj zadatak se može riješiti sa <x id='START_SPAN'/><x id='END_SPAN'/> blokova."},
"tooMuchWork":function(d){return "Uh, baš sam se naradio! Možeš li mi sada dati uputstva sa manje ponavljanja?"},
"toolboxHeader":function(d){return "Blokovi"},
"toolboxHeaderDroplet":function(d){return "Alatni okvir"},
"hideToolbox":function(d){return "(Sakrij)"},
"showToolbox":function(d){return "Prikaži Alatni okvir"},
"openWorkspace":function(d){return "Kako To Radi"},
"totalNumLinesOfCodeWritten":function(d){return "Sveukupno: "+locale.p(d,"numLines",0,"en",{"one":"1 linija","other":locale.n(d,"numLines")+" linija"})+" kôda."},
"tryAgain":function(d){return "Pokušaj ponovo"},
"hintRequest":function(d){return "Pogledaj savjet"},
"backToPreviousLevel":function(d){return "Povratak na prethodni nivo"},
"saveToGallery":function(d){return "Snimi u galeriju"},
"savedToGallery":function(d){return "Snimljeno u galeriju!"},
"shareFailure":function(d){return "Žalim, ali ne možemo dijeliti ovaj program."},
"workspaceHeaderShort":function(d){return "Radni prostor: "},
"infinity":function(d){return "Beskonačnost"},
"rotateText":function(d){return "Okreni svoj uređaj."},
"orientationLock":function(d){return "U postavkama uređaja isključi blokadu orijentacije."},
"wantToLearn":function(d){return "Želiš li naučiti programirati?"},
"watchVideo":function(d){return "Pogledaj Video"},
"when":function(d){return "kada"},
"whenRun":function(d){return "pri pokretanju"},
"tryHOC":function(d){return "Isprobaj Sat Kodiranja"},
"signup":function(d){return "Registrirajte se na početni kurs"},
"hintHeader":function(d){return "Evo jedan savjet:"},
"genericFeedback":function(d){return "Pogledaj kako si završio i pokušaj popraviti svoj program."},
"toggleBlocksErrorMsg":function(d){return "Trebaš ispraviti grešku u svom programu prije nego što može biti prikazan u obliku blokova."},
"defaultTwitterText":function(d){return "Pogledaj šta sam napravio"}};