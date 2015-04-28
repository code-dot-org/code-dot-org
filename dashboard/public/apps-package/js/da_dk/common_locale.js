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
"booleanTrue":function(d){return "sandt"},
"booleanFalse":function(d){return "falsk"},
"blocks":function(d){return "blokke"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farve"},
"catLogic":function(d){return "Logik"},
"catLists":function(d){return "Lister"},
"catLoops":function(d){return "Sløjfer"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"clearPuzzle":function(d){return "Start forfra"},
"clearPuzzleConfirm":function(d){return "Dette vil nulstille puslespillet til sin starttilstand og slette alle de blokke, du har tilføjet eller ændret."},
"clearPuzzleConfirmHeader":function(d){return "Sikker på, at du vil starte forfra?"},
"codeMode":function(d){return "Kode"},
"codeTooltip":function(d){return "Se genererede JavaScript-kode."},
"continue":function(d){return "Fortsæt"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Designtilstand"},
"dialogCancel":function(d){return "Annuller"},
"dialogOK":function(d){return "Ok"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "Ø"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Tilføj to numre"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Returnerer sand, når begge udtryk er sande ellers falsk"},
"dropletBlock_andOperator_signatureOverride":function(d){return "OG boolesk operator"},
"dropletBlock_arcLeft_description":function(d){return "Flyt skildpadden venstredrejet bue ved brug af specificerede grad- og radiusangivelser"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "radius"},
"dropletBlock_arcRight_description":function(d){return "Flyt skildpadden i en højredrejet bue ved brug af specificerede grad- og radiusangivelser"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "radius"},
"dropletBlock_assign_x_description":function(d){return "Gentildel en variabel"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Opret en knap og tildel den et element-ID"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "tekst"},
"dropletBlock_callMyFunction_description":function(d){return "Kalder en navngiven funktion, der ikke tager parametre"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kald en funktion"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kalder en navngiven funktion, der tager en eller flere parametre"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kald en funktion med parametre"},
"dropletBlock_changeScore_description":function(d){return "Tilføj eller fjern et point til scoren."},
"dropletBlock_checkbox_description":function(d){return "Opret et afkrydsningsfelt og tildel dette et element-ID"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Tegn en cirkel på det aktive lærred med de specificerede koordinater for centrum (x, y) og radius"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "radius"},
"dropletBlock_clearCanvas_description":function(d){return "Ryd alle data på det aktive lærred"},
"dropletBlock_clearInterval_description":function(d){return "Ryd en eksisterende intervaltimer ved aflevering af værdien, der returneres fra setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Ryd en eksisterende timer ved aflevering af værdien returneres fra setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Viser streng eller variabel i konsol visningen"},
"dropletBlock_console.log_param0":function(d){return "besked"},
"dropletBlock_container_description":function(d){return "Opret en divisionscontainer med det specificerede element-ID og angiv evt. dens indre HTML"},
"dropletBlock_createCanvas_description":function(d){return "Opret et lærred med det specificerede ID og angiv evt. bredde- og højdedimensioner"},
"dropletBlock_createCanvas_param0":function(d){return "arbejdsområde-id"},
"dropletBlock_createCanvas_param1":function(d){return "bredde"},
"dropletBlock_createCanvas_param2":function(d){return "højde"},
"dropletBlock_createRecord_description":function(d){return "Ved hjælp af App Lab tabel data opbevaring, opretter en post med et entydigt id i tabel navnet forudsat, og kalder tilbagekalds-Funktionen, når handlingen er færdig."},
"dropletBlock_createRecord_param0":function(d){return "tabelNavn"},
"dropletBlock_createRecord_param1":function(d){return "post"},
"dropletBlock_createRecord_param2":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Opret en variabel og initialisér den som en matrix"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Erklærer en variabel med navnet efter 'var', og tildeler værdien på højre side af udtrykket"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Erklære en variabel"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Opret en variabel og tilknyt den en værdi ved at vise en prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Slet elementet med det specificerede ID"},
"dropletBlock_deleteElement_param0":function(d){return "ID"},
"dropletBlock_deleteRecord_description":function(d){return "Bruge App Lab tabel datalagring, sletter den angivne post i tabelNavn. posten er et objekt, der skal identificeres entydigt med sit id-feltet. Når opkaldet er afsluttet, kaldes tilbagekalds-Funktionen."},
"dropletBlock_deleteRecord_param0":function(d){return "tabelNavn"},
"dropletBlock_deleteRecord_param1":function(d){return "post"},
"dropletBlock_deleteRecord_param2":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_divideOperator_description":function(d){return "Opdel to tal"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Tegn en prik på skildpaddens placering med den specificerede radius"},
"dropletBlock_dot_param0":function(d){return "radius"},
"dropletBlock_drawImage_description":function(d){return "Tegn et billede på det aktive lærred med den specificerede billedelement og x, y som de øverste venstre koordinater"},
"dropletBlock_drawImage_param0":function(d){return "ID"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "bredde"},
"dropletBlock_drawImage_param4":function(d){return "højde"},
"dropletBlock_dropdown_description":function(d){return "Opret en rulleliste, tildel den et element-ID og udfyld den med en lelementeroversigt"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for lighed"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Opretter en løkke, bestående af en initialisering udtryk, et betinget udtryk, en stigende udtryk og en sætningsblok henrettet for hver gentagelse af løkken"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for-løkke"},
"dropletBlock_functionParams_n_description":function(d){return "En række erklæringer, der tager i en eller flere parametre, og udfører en opgave eller beregne en værdi, når funktionen kaldes"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definerer en funktion med parametre"},
"dropletBlock_functionParams_none_description":function(d){return "En række sætninger, der udfører en opgave eller beregne en værdi, når funktionen kaldes"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definerer en funktion"},
"dropletBlock_getAlpha_description":function(d){return "Får alpha"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Får given attribut"},
"dropletBlock_getBlue_description":function(d){return "Får værdien på blå (spænder fra 0 til 255) i farven på pixel beliggende på given x og y position i en given billeddata."},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Få tilstanden for et afkrydsningsfelt eller radioknap"},
"dropletBlock_getChecked_param0":function(d){return "ID"},
"dropletBlock_getDirection_description":function(d){return "Få skildpaddens retning (0 grader peger opad)"},
"dropletBlock_getGreen_description":function(d){return "Får værdien af grøn (lige fra 0 til 255) i farven på pixel beliggende på given x og y position i en given billeddata."},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Få ImageData til et rektangel (x, y, bredde, højde) inden for den aktive lærred"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get Webadressen knyttet til et billede eller et billede upload-knappen"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Henter værdien gemmes på den angivne nøglenavn i App Lab nøgle/værdi dataopbevaring. Værdien returneres som en parameter til tilbagekalds-Funktionen når hentningen er færdig."},
"dropletBlock_getKeyValue_param0":function(d){return "nøgle"},
"dropletBlock_getKeyValue_param1":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_getRed_description":function(d){return "Får værdien af  rød (spænder fra 0 til 255) i farven på pixel beliggende på given x og y position i en given billeddata."},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Få teksten fra det angivne element"},
"dropletBlock_getText_param0":function(d){return "ID"},
"dropletBlock_getTime_description":function(d){return "Få den aktuelle tid i millisekunder"},
"dropletBlock_getUserId_description":function(d){return "Får et entydigt id for den aktuelle bruger af denne app"},
"dropletBlock_getX_description":function(d){return "Bliver den aktuelle x koordinere i pixel af skildpadden"},
"dropletBlock_getXPosition_description":function(d){return "Få elementet's x position"},
"dropletBlock_getXPosition_param0":function(d){return "ID"},
"dropletBlock_getY_description":function(d){return "Henter den nuværende y-koordinat i pixel af skildpadden"},
"dropletBlock_getYPosition_description":function(d){return "Få elementets y position"},
"dropletBlock_getYPosition_param0":function(d){return "ID"},
"dropletBlock_greaterThanOperator_description":function(d){return "Sammenligne to tal"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Skjuler skildpadden, så det ikke er vist på skærmen"},
"dropletBlock_hideElement_description":function(d){return "Skjule elementet med det angivne id"},
"dropletBlock_hideElement_param0":function(d){return "ID"},
"dropletBlock_ifBlock_description":function(d){return "Udfører en sætningsblok, hvis den angivne betingelse er sand"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "hvis sætning"},
"dropletBlock_ifElseBlock_description":function(d){return "Udfører en sætningsblok, hvis den angivne betingelse er sand; ellers udføres sætningsblokken i delsætningen ELLERS"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "Hvis/ellers erklæring"},
"dropletBlock_image_description":function(d){return "Opret et billede og tildel det et element-ID"},
"dropletBlock_image_param0":function(d){return "ID"},
"dropletBlock_image_param1":function(d){return "URL"},
"dropletBlock_imageUploadButton_description":function(d){return "Opret en billede-uploadknap og tildel den et element-ID"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for ulighed"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Sæt den interne HTML for elementet med det angivne ID"},
"dropletBlock_lessThanOperator_description":function(d){return "Sammenligne to tal"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Tegner en streg på det aktive lærred fra x1, y1 til x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Tager den absolutte værdi af x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Tager den maksimale værdi blandt en eller flere værdier n1, n2,..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max(n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Tager minimumsværdien blandt en eller flere værdier n1, n2,..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.Min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Afrund til nærmeste heltal"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Bevæger skildpadden fra sin nuværende placering. Tilføjer x til skildpaddens x-position og y til skildpaddens y-position"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Bevæger skildpadden tilbage et bestemt antal pixel i dens nuværende retning"},
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_description":function(d){return "Bevæger skildpadden frem et bestemt antal pixel i dens nuværende retning"},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveTo_description":function(d){return "Bevæger skildpadden til et bestemt x-,y-koordinat på skærmen"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplicere to tal"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Returnerer falsk, hvis udtrykket kan omregnes til sandt; ellers returneres sandt"},
"dropletBlock_notOperator_signatureOverride":function(d){return "OG boolesk operator"},
"dropletBlock_onEvent_description":function(d){return "Eksekvér kode som svar på den specificerede hændelse."},
"dropletBlock_onEvent_param0":function(d){return "ID"},
"dropletBlock_onEvent_param1":function(d){return "begivenhed"},
"dropletBlock_onEvent_param2":function(d){return "function"},
"dropletBlock_orOperator_description":function(d){return "Returnerer sand, når begge udtryk er sande, og ellers falsk"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ELLER boolesk operator"},
"dropletBlock_penColor_description":function(d){return "Angiver farven på linjen trukket bag skildpadden, når den bevæger sig"},
"dropletBlock_penColor_param0":function(d){return "farve"},
"dropletBlock_penColour_description":function(d){return "Angiver farven på linjen trukket bag skildpadden, når den bevæger sig"},
"dropletBlock_penColour_param0":function(d){return "farve"},
"dropletBlock_penDown_description":function(d){return "Resulterer i en streg tegnet bag skildpadden, når den bevæger sig"},
"dropletBlock_penUp_description":function(d){return "Stopper skildpadden i at tegne en streg bag sig, når den bevæger sig"},
"dropletBlock_penWidth_description":function(d){return "Sæt skildpadden til den angivne stregtykkelse"},
"dropletBlock_penWidth_param0":function(d){return "bredde"},
"dropletBlock_playSound_description":function(d){return "Afspil MP3-, OGG- eller WAV-lydfil fra den angivne URL"},
"dropletBlock_playSound_param0":function(d){return "URL"},
"dropletBlock_putImageData_description":function(d){return "Indstil ImageData for et rektangel indenfor det aktive lærred med x, y som de øverste venstre koordinater"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Opret en drejeknap og tildel den et element-ID"},
"dropletBlock_radioButton_param0":function(d){return "ID"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Få et tilfældigt tal mellem 0 og den angivne maksimumværdi"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Få et tilfældigt tal mellem de angivne minimums- og maksimumsværdier"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Ved brug af App Lab' tabeldatalager, læses posterne fra det angivne tabelnavn, der svarer til searchTerms. Når kaldet er afsluttet, kaldes callbackFunction og videregives til post-matrixen."},
"dropletBlock_readRecords_param0":function(d){return "tabelNavn"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_rect_description":function(d){return "Tegner et rektangel på det aktive lærred placeret på upperLeftX og upperLeftY, og tilpasser bredde og højde."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "bredde"},
"dropletBlock_rect_param3":function(d){return "højde"},
"dropletBlock_return_description":function(d){return "Returnerer en værdi fra en funktion"},
"dropletBlock_return_signatureOverride":function(d){return "vend tilbage"},
"dropletBlock_setActiveCanvas_description":function(d){return "Sætter lærred-ID for efterfølgende lærred-kommandoer (kun nødvendig ved flere lærred-elementer)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "arbejdsområde-id"},
"dropletBlock_setAlpha_description":function(d){return "Sætter den angivne værdi"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Sætter den angivne værdi"},
"dropletBlock_setBackground_description":function(d){return "Indstiller baggrundsbilledet"},
"dropletBlock_setBlue_description":function(d){return "Sætter mængden af blå (i intervallet 0 til 255) i farven på pixlen placeret på en given x og y position i den givne billeddata til blueValue inputmængden."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Sæt tilstanden for et afkrydsningsfelt eller drejeknap"},
"dropletBlock_setChecked_param0":function(d){return "ID"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Sæt fyldfarven for det aktive lærred"},
"dropletBlock_setFillColor_param0":function(d){return "farve"},
"dropletBlock_setGreen_description":function(d){return "Sætter mængden af grøn (i intervallet 0 til 255) i farven på pixlen placeret på en given x og y position i den givne billeddata til greenValue inputmængden."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Sæt URL-adressen til det angivne billedelement-ID"},
"dropletBlock_setImageURL_param0":function(d){return "ID"},
"dropletBlock_setImageURL_param1":function(d){return "URL"},
"dropletBlock_setInterval_description":function(d){return "Fortsæt eksekvering af kode hver gang det angivne antal millisekunder er forløbet"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "millisekunder"},
"dropletBlock_setKeyValue_description":function(d){return "Lagrer et nøgle/værdi-par i App Lab' nøgle-/værdidatalager og kalder callbackFunction, når handlingen er færdig."},
"dropletBlock_setKeyValue_param0":function(d){return "nøgle"},
"dropletBlock_setKeyValue_param1":function(d){return "værdi"},
"dropletBlock_setKeyValue_param2":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_setParent_description":function(d){return "Sæt et element til at blive afkom af et overordnet element"},
"dropletBlock_setPosition_description":function(d){return "Placér et element med x-, y-, bredde- og højdekoordinater"},
"dropletBlock_setPosition_param0":function(d){return "ID"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "bredde"},
"dropletBlock_setPosition_param4":function(d){return "højde"},
"dropletBlock_setRed_description":function(d){return "Sætter mængden af rød (i intervallet 0 til 255) i farven på pixlen placeret på en given x og y position i den givne billeddata til redValue inputmængden."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "rød"},
"dropletBlock_setRGB_param4":function(d){return "grøn"},
"dropletBlock_setRGB_param5":function(d){return "blå"},
"dropletBlock_setStrokeColor_description":function(d){return "Sæt stregfarve for det aktive lærred"},
"dropletBlock_setStrokeColor_param0":function(d){return "farve"},
"dropletBlock_setSprite_description":function(d){return "Indstiller spillererens billede"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Sætter spillerhumør"},
"dropletBlock_setSpritePosition_description":function(d){return "Flytter straks en spiller til den angivne placering."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Indstiller spillererens hastigheden"},
"dropletBlock_setStrokeWidth_description":function(d){return "Sæt stregtykkelsen for det aktive lærred"},
"dropletBlock_setStrokeWidth_param0":function(d){return "bredde"},
"dropletBlock_setStyle_description":function(d){return "Tilføj CSS-stil tekst til et element"},
"dropletBlock_setText_description":function(d){return "Sæt teksten for det angivne element"},
"dropletBlock_setText_param0":function(d){return "ID"},
"dropletBlock_setText_param1":function(d){return "tekst"},
"dropletBlock_setTimeout_description":function(d){return "Sæt en timer og eksekvér kode, når antallet af millisekunder er forløbet"},
"dropletBlock_setTimeout_param0":function(d){return "function"},
"dropletBlock_setTimeout_param1":function(d){return "millisekunder"},
"dropletBlock_show_description":function(d){return "Viser skildpadden på skærmen, ved at gøre den synlig på dens nuværende placering"},
"dropletBlock_showElement_description":function(d){return "Vis elementet med det angivne ID"},
"dropletBlock_showElement_param0":function(d){return "ID"},
"dropletBlock_speed_description":function(d){return "Ændr eksekveringshastighed i programmet til den angivne procentværdi"},
"dropletBlock_speed_param0":function(d){return "værdi"},
"dropletBlock_startWebRequest_description":function(d){return "Anmod om data fra Internet og eksekvér kode, når anmodningen er fuldført"},
"dropletBlock_startWebRequest_param0":function(d){return "URL"},
"dropletBlock_startWebRequest_param1":function(d){return "function"},
"dropletBlock_subtractOperator_description":function(d){return "Subtrahér to numre"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Opret et tekstinput og tildel denne et element-ID"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "tekst"},
"dropletBlock_textLabel_description":function(d){return "Opret en tekstetiket, tildel den et element-ID og bind den til et associeret element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "tekst"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Kaster et projektil fra den angivne spiller."},
"dropletBlock_turnLeft_description":function(d){return "Drej skildpadden det angivne antal grader mod uret"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Drej skildpadden det angivne antal grader med uret"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Drej skildpadde til den angivne retning (0 grader peger opad)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Ved brug af App Lab' tabeldatalagring, opdateres den angivne post i tableName. Posten skal være entydigt identificeret med sit ID-felt. Når kaldet er afsluttet, kaldes callbackFunction"},
"dropletBlock_updateRecord_param0":function(d){return "tabelNavn"},
"dropletBlock_updateRecord_param1":function(d){return "post"},
"dropletBlock_updateRecord_param2":function(d){return "tilbagekalds-Funktionen"},
"dropletBlock_vanish_description":function(d){return "Lader spilleren forsvinde."},
"dropletBlock_whileBlock_description":function(d){return "Opretter en løkke, bestående af et betinget udtryk og en sætningsblok, der eksekveres for hver gentagelse af løkken. Løkken fortsætter eksekvering så længe betingelsen evalueres er sand"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "imens løkke"},
"dropletBlock_write_description":function(d){return "Opret en tekstblok"},
"dropletBlock_write_param0":function(d){return "tekst"},
"end":function(d){return "slut"},
"emptyBlocksErrorMsg":function(d){return "\"Gentag\" eller \"Hvis\" blokkene skal have andre blokke inden i for at virke. Kontroller, at den indre blok passer ordentligt inde i blokken."},
"emptyFunctionalBlock":function(d){return "Du har en blok med et ikke-udfyldt input."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktionen blok skal have andre blokke inde i det for at virke."},
"errorEmptyFunctionBlockModal":function(d){return "Der skal være blokke i din definition af en funktion. Klik på \"Rediger\" og træk blokke ind i den grønne blok."},
"errorIncompleteBlockInFunction":function(d){return "Klik på \"Rediger\" for at sikre at der ikke mangler nogen blokke i din definition af funktionen."},
"errorParamInputUnattached":function(d){return "Husk at knytte en blok til hvert parameter-felt på funktions-blokken i dit arbejdsområde."},
"errorUnusedParam":function(d){return "Du har tilføjet en parameterblok, men ikke brugt den i definitionen. Klik på \"Rediger\" og placer parameterblokken inden i den grønne blok, for at bruge din parameter."},
"errorRequiredParamsMissing":function(d){return "Opret en parameter for din funktion ved at klikke på \"Rediger\" og tilføje de nødvendige parametre. Træk de nye parameter-blokke til din definitionen af din funktion."},
"errorUnusedFunction":function(d){return "Du har oprettet en funktion, men ikke brugt den i dit arbejdsområde! Klik på \"Funktioner\" i værktøjskassen, og sørg for du bruger den i dit program."},
"errorQuestionMarksInNumberField":function(d){return "Prøv at erstatte \"???\" med en værdi."},
"extraTopBlocks":function(d){return "Du har separate blokke."},
"extraTopBlocksWhenRun":function(d){return "Du har separate blokke. Var det din mening at hæfte disse til \"ved kørsel\"-blokken?"},
"finalStage":function(d){return "Tillykke! Du har fuldført det sidste trin."},
"finalStageTrophies":function(d){return "Tillykke! Du har afsluttet det sidste trin og vundet "+locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":locale.n(d,"numTrophies")+" trofæer"})+"."},
"finish":function(d){return "Færdig"},
"generatedCodeInfo":function(d){return "Selv top-universiteter underviser i blok-baseret programmering (f.eks. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Men under kølerhjelmen, kan de blokke du har samlet også vises i JavaScript, verdens mest udbredte programmeringssprog:"},
"hashError":function(d){return "Beklager, '%1' svarer ikke til noget gemt program."},
"help":function(d){return "Hjælp"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "hop"},
"keepPlaying":function(d){return "Fortsæt med at spille"},
"levelIncompleteError":function(d){return "Du bruger alle de nødvendige typer af blokke, men ikke på den rigtige måde."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lav dit eget Flappy spil"},
"missingBlocksErrorMsg":function(d){return "Prøv en eller flere af blokkene nedenfor for at løse denne opgave."},
"nextLevel":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+" og vandt "+locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":locale.n(d,"numTrophies")+" trofæer"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Tillykke! Du gennemførte "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Tillykke! Du gennemførte "+locale.v(d,"stageName")+" og vandt "+locale.p(d,"numTrophies",0,"da",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+". (Men du kunne have løst den med "+locale.p(d,"numBlocks",0,"da",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokke"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har lige skrevet "+locale.p(d,"numLines",0,"da",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" kode!"},
"play":function(d){return "afspil"},
"print":function(d){return "Udskriv"},
"puzzleTitle":function(d){return "Opgave "+locale.v(d,"puzzle_number")+" af "+locale.v(d,"stage_total")},
"repeat":function(d){return "gentag"},
"resetProgram":function(d){return "Nulstil"},
"runProgram":function(d){return "Kør"},
"runTooltip":function(d){return "Kør programmet defineret af blokkene i arbejdsområdet."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Vis kode"},
"showBlocksHeader":function(d){return "Vis blokke"},
"showGeneratedCode":function(d){return "Vis kode"},
"stringEquals":function(d){return "streng =?"},
"subtitle":function(d){return "et visuelt programmerings miljø"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Du bruger alle de nødvendige typer blokke, men prøv at bruge flere af disse blokke for at løse opgaven."},
"tooManyBlocksMsg":function(d){return "Denne opgave kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokke."},
"tooMuchWork":function(d){return "Du fik mig til at gøre en masse arbejde! Kunne du prøve at gentage færre gange?"},
"toolboxHeader":function(d){return "blokke"},
"toolboxHeaderDroplet":function(d){return "Værktøjskasse"},
"hideToolbox":function(d){return "(Skjul)"},
"showToolbox":function(d){return "Vis værktøjskasse"},
"openWorkspace":function(d){return "Sådan fungerer det"},
"totalNumLinesOfCodeWritten":function(d){return "I alt: "+locale.p(d,"numLines",0,"da",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" af kode."},
"tryAgain":function(d){return "Prøv igen"},
"hintRequest":function(d){return "Se hjælp"},
"backToPreviousLevel":function(d){return "Tilbage til forrige niveau"},
"saveToGallery":function(d){return "Gem"},
"savedToGallery":function(d){return "Gemt!"},
"shareFailure":function(d){return "Beklager, vi kan ikke dele dette program."},
"workspaceHeaderShort":function(d){return "Arbejdsområde: "},
"infinity":function(d){return "Uendelig"},
"rotateText":function(d){return "Drej din enhed."},
"orientationLock":function(d){return "Slå orienterings-lås fra i Enhedsindstillinger."},
"wantToLearn":function(d){return "Vil du lære at kode?"},
"watchVideo":function(d){return "Se denne video"},
"when":function(d){return "når"},
"whenRun":function(d){return "når programmet kører"},
"tryHOC":function(d){return "Prøv Hour of Code"},
"signup":function(d){return "Tilmeld til Introduktion kursus"},
"hintHeader":function(d){return "Her er et tip:"},
"genericFeedback":function(d){return "Se hvordan du endte. Prøv at rette dit program."},
"toggleBlocksErrorMsg":function(d){return "Du skal rette en fejl i dit program, før det kan blive vist som blokke."},
"defaultTwitterText":function(d){return "Se hvad jeg har lavet"}};