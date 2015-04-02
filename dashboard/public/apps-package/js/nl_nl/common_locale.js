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
"and":function(d){return "en"},
"booleanTrue":function(d){return "waar"},
"booleanFalse":function(d){return "onwaar"},
"blocks":function(d){return "blokken"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Acties"},
"catColour":function(d){return "Kleur"},
"catLogic":function(d){return "Logica"},
"catLists":function(d){return "Lijsten"},
"catLoops":function(d){return "Lussen"},
"catMath":function(d){return "Wiskunde"},
"catProcedures":function(d){return "Functies"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabelen"},
"clearPuzzle":function(d){return "Begin opnieuw"},
"clearPuzzleConfirm":function(d){return "Hiermee breng je de puzzel terug naar zijn beginstaat en verwijder je alle blokken die je toegevoegd of veranderd hebt."},
"clearPuzzleConfirmHeader":function(d){return "Weet je zeker dat je opnieuw wilt beginnen?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Zie gegenereerde JavaScript-code."},
"continue":function(d){return "Verder"},
"designMode":function(d){return "Ontwerp"},
"designModeHeader":function(d){return "Ontwerpmodus"},
"dialogCancel":function(d){return "Annuleren"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "Z"},
"directionEastLetter":function(d){return "O"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Twee getallen optellen"},
"dropletBlock_andOperator_description":function(d){return "Logische AND van twee boolean waarden"},
"dropletBlock_arcLeft_description":function(d){return "Verplaats de schildpad tegen de klok in volgens het opgegeven aantal graden en de opgegeven radius"},
"dropletBlock_arcRight_description":function(d){return "Verplaats de schildpad met de klok mee volgens het opgegeven aantal graden en de opgegeven radius"},
"dropletBlock_assign_x_description":function(d){return "Variabele opnieuw toewijzen"},
"dropletBlock_button_description":function(d){return "Knop maken en element-id toekennen"},
"dropletBlock_callMyFunction_description":function(d){return "Een functie zonder argument gebruiken"},
"dropletBlock_callMyFunction_n_description":function(d){return "Een functie gebruiken met argument"},
"dropletBlock_changeScore_description":function(d){return "Verwijder of voeg een punt toe aan de score."},
"dropletBlock_checkbox_description":function(d){return "Checkbox maken en element-id toekennen"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_clearCanvas_description":function(d){return "Clear all data on the active canvas"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createRecord_description":function(d){return "Maakt een nieuwe record aan in de opgegeven tabel."},
"dropletBlock_createRecord_param0":function(d){return "tabel"},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "bijSucces"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_deleteElement_description":function(d){return "Element met de opgegeven id verwijderen"},
"dropletBlock_deleteRecord_description":function(d){return "Verwijdert het record aangeduid met record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "tabel"},
"dropletBlock_deleteRecord_param1":function(d){return "record"},
"dropletBlock_deleteRecord_param2":function(d){return "bijSucces"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Iets meerdere keren uitvoeren"},
"dropletBlock_functionParams_n_description":function(d){return "Functie met een argument maken"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Functie met een Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Functie zonder argument maken"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Functie-definitie"},
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
"dropletBlock_greaterThanOperator_description":function(d){return "Twee getallen vergelijken"},
"dropletBlock_hide_description":function(d){return "Afbeelding van de schildpad verbergen"},
"dropletBlock_hideElement_description":function(d){return "Element met het opgegeven id verbergen"},
"dropletBlock_ifBlock_description":function(d){return "Iets alleen doen als een voorwaarde waar is"},
"dropletBlock_ifElseBlock_description":function(d){return "Iets uitvoeren als een voorwaarde waar is en anders iets anders uitvoeren"},
"dropletBlock_image_description":function(d){return "Afbeelding maken en element-id toekennen"},
"dropletBlock_imageUploadButton_description":function(d){return "Een knop maken voor het uploaden van een afbeelding en hieraan een element-id toekennen"},
"dropletBlock_inequalityOperator_description":function(d){return "Test op ongelijkheid"},
"dropletBlock_innerHTML_description":function(d){return "Binnenste HTML-code instellen voor het element met de opgegeven id"},
"dropletBlock_lessThanOperator_description":function(d){return "Twee getallen vergelijken"},
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
"dropletBlock_onEvent_description":function(d){return "Code uitvoeren in reactie op de opgegeven gebeurtenis."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "functie"},
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
"dropletBlock_readRecords_param0":function(d){return "tabel"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "bijSucces"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Hiermee stel je de achtergrondafbeelding in"},
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
"dropletBlock_setSprite_description":function(d){return "Hiermee wordt de acteur afbeelding ingesteld"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Zet het humeur van de acteur"},
"dropletBlock_setSpritePosition_description":function(d){return "Verplaats de speler meteen naar een opgegeven plaats."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Hiermee stel je de snelheid van een speler in"},
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
"dropletBlock_throw_description":function(d){return "Gooit een projectiel vanaf de gekozen speler."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_vanish_description":function(d){return "Laat de acteur verdwijnen."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "einde"},
"emptyBlocksErrorMsg":function(d){return "De \"herhaal\" of \"als\" blokken hebben andere blokken in zich nodig om te werken. Zorg ervoor dat het binnenste blok correct past in het buitenste blok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Het functie-blok moet andere blokken bevatten om te werken."},
"errorEmptyFunctionBlockModal":function(d){return "In je functie-definitie moeten blokken staan . Klik op \"bewerk\" en sleep blokken  het groene blok in."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"bewerk\" en zorg ervoor dat je geen blokken mist in je functie-definitie."},
"errorParamInputUnattached":function(d){return "Denk er aan om aan iedere parameter input op het functieblok in je werkruimte een blok toe te voegen."},
"errorUnusedParam":function(d){return "Je voegde een parameter blok toe maar gebruikte deze niet in je functie. Zorg ervoor dat je je parameter gebruikt door op \"bewerk\" te klikken en de parameter blok binnen de groene blok te plaatsen."},
"errorRequiredParamsMissing":function(d){return "Maak een parameter voor je functie door op \"bewerk\" te klikken en de nodige parameters toe te voegen. Sleep de nieuwe parameter blok in je functie-definitie."},
"errorUnusedFunction":function(d){return "Je maakte een functie  maar gebruikte deze nooit in je werkruimte! Klik op \"Functies\" in de gereedschapskist en zorg ervoor dat je ze gebruikt in je programma."},
"errorQuestionMarksInNumberField":function(d){return "Vervang \"???\" door een waarde."},
"extraTopBlocks":function(d){return "Je hebt blokken die nergens aan vast zitten. Was het je bedoeling die aan het \"bij uitvoeren\"-blok toe te voegen?"},
"finalStage":function(d){return "Gefeliciteerd! Je hebt de laatste fase voltooid."},
"finalStageTrophies":function(d){return "Gefeliciteerd! U hebt de laatste fase voltooid en won "+locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":locale.n(d,"numTrophies")+" trofeeën"})+"."},
"finish":function(d){return "Voltooien"},
"generatedCodeInfo":function(d){return "Zelfs op topuniversiteiten wordt les gegevens met programmeertalen die op blokken zijn gebaseerd (bijv. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Maar onder de motorkap kunnen de blokken waarmee je een programma hebt gemaakt ook getoond worden in JavaScript, de programmeertaal die wereldwijd het meest wordt gebruikt:"},
"hashError":function(d){return "Sorry, '%1' komt niet overeen met een opgeslagen programma."},
"help":function(d){return "Hulp"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "spring"},
"keepPlaying":function(d){return "Doorgaan met spelen"},
"levelIncompleteError":function(d){return "Je gebruikt alle soorten blokken die nodig zijn, maar niet op de juiste manier."},
"listVariable":function(d){return "lijst"},
"makeYourOwnFlappy":function(d){return "Maak je eigen 'Flappy'-spel"},
"missingBlocksErrorMsg":function(d){return "Probeer een of meer van de blokken onderaan om deze puzzel op te lossen."},
"nextLevel":function(d){return "Gefeliciteerd! Je hebt puzzel "+locale.v(d,"puzzleNumber")+" af."},
"nextLevelTrophies":function(d){return "Gefeliciteerd! Je hebt puzzel "+locale.v(d,"puzzleNumber")+" opgelost en je hebt "+locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":locale.n(d,"numTrophies")+" trofeeën"})+" gewonnen."},
"nextStage":function(d){return "Gefeliciteerd! Je hebt "+locale.v(d,"stageName")+" af."},
"nextStageTrophies":function(d){return "Gefeliciteerd! Je hebt "+locale.v(d,"stageName")+" af en je hebt "+locale.p(d,"numTrophies",0,"nl",{"one":"een medaille","other":locale.n(d,"numTrophies")+" medailles"})+" gewonnen."},
"numBlocksNeeded":function(d){return "Gefeliciteerd! Je hebt puzzel "+locale.v(d,"puzzleNumber")+" opgelost. (Maar je had het het ook met "+locale.p(d,"numBlocks",0,"nl",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" op kunnen lossen.)"},
"numLinesOfCodeWritten":function(d){return "Je schreef zojuist "+locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":locale.n(d,"numLines")+" regels"})+" code!"},
"play":function(d){return "afspelen"},
"print":function(d){return "Afdrukken"},
"puzzleTitle":function(d){return "Puzzel "+locale.v(d,"puzzle_number")+" van "+locale.v(d,"stage_total")},
"repeat":function(d){return "herhaal"},
"resetProgram":function(d){return "Herstellen"},
"runProgram":function(d){return "Start"},
"runTooltip":function(d){return "Voer het programma gedefinieerd door de blokken uit in de werkruimte."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Code weergeven"},
"showBlocksHeader":function(d){return "Toon blokken"},
"showGeneratedCode":function(d){return "Code weergeven"},
"stringEquals":function(d){return "tekenreeks =?"},
"subtitle":function(d){return "een visuele programmeeromgeving"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Je gebruikt alle soorten blokken die je nodig hebt, maar probeer meer van deze blokken te gebruiken om deze puzzel op te lossen."},
"tooManyBlocksMsg":function(d){return "Deze puzzel kan worden opgelost met <x id='START_SPAN'/><x id='END_SPAN'/> blokken."},
"tooMuchWork":function(d){return "Je laat me veel werk doen! Kun je proberen minder te herhalen?"},
"toolboxHeader":function(d){return "blokken"},
"openWorkspace":function(d){return "Hoe het werkt"},
"totalNumLinesOfCodeWritten":function(d){return "Totale tijd: "+locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":locale.n(d,"numLines")+" regels"})+" code."},
"tryAgain":function(d){return "Probeer opnieuw"},
"hintRequest":function(d){return "Bekijk tip"},
"backToPreviousLevel":function(d){return "Terug naar het vorige niveau"},
"saveToGallery":function(d){return "Opslaan in galerij"},
"savedToGallery":function(d){return "Opgeslagen in galerij!"},
"shareFailure":function(d){return "Sorry, we kunnen dit programma niet delen."},
"workspaceHeader":function(d){return "Zet je blokken hier in elkaar:"},
"workspaceHeaderJavaScript":function(d){return "Typ hier jouw JavaScript-code"},
"workspaceHeaderShort":function(d){return "Werkplaats: "},
"infinity":function(d){return "Oneindig"},
"rotateText":function(d){return "Draai je apparaat."},
"orientationLock":function(d){return "Schakel de oriëntatieblokkering uit in de instellingen van je apparaat."},
"wantToLearn":function(d){return "Wil je leren programmeren?"},
"watchVideo":function(d){return "Bekijk de video"},
"when":function(d){return "wanneer"},
"whenRun":function(d){return "als gestart"},
"tryHOC":function(d){return "Probeer \"Hour of Code\""},
"signup":function(d){return "Neem deel aan de introductie cursus"},
"hintHeader":function(d){return "Een tip:"},
"genericFeedback":function(d){return "Kijk wat er gebeurde, en probeer je programma te verbeteren."},
"toggleBlocksErrorMsg":function(d){return "je moet een fout in je programma corrigeren voordat het kan worden weergeven in blokken."},
"defaultTwitterText":function(d){return "Kijk wat ik gemaakt heb"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"}};