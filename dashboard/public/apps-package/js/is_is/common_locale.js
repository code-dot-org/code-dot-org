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
"booleanTrue":function(d){return "satt"},
"booleanFalse":function(d){return "ósatt"},
"blocks":function(d){return "kubbar"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Aðgerðir"},
"catColour":function(d){return "Litir"},
"catLogic":function(d){return "Rökvísi"},
"catLists":function(d){return "Listar"},
"catLoops":function(d){return "Lykkjur"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catText":function(d){return "texti"},
"catVariables":function(d){return "Breytur"},
"clearPuzzle":function(d){return "Byrja aftur"},
"clearPuzzleConfirm":function(d){return "Þetta setur þrautina aftur í upphafsstöðu og eyðir öllum kubbum sem þú hefur bætt við eða breytt."},
"clearPuzzleConfirmHeader":function(d){return "Ertu viss um að þú viljir byrja aftur?"},
"codeMode":function(d){return "Kóði"},
"codeTooltip":function(d){return "Sjá samsvarandi JavaScript kóða."},
"continue":function(d){return "Halda áfram"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Hönnun"},
"dialogCancel":function(d){return "Hætta við"},
"dialogOK":function(d){return "Í lagi"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "A"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_arcLeft_description":function(d){return "Move the turtle in a counterclockwise arc using the specified number of degrees and radius"},
"dropletBlock_arcRight_description":function(d){return "Move the turtle in a clockwise arc using the specified number of degrees and radius"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_button_description":function(d){return "Create a button and assign it an element id"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_changeScore_description":function(d){return "Hækka eða lækka skorið um eitt stig."},
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
"dropletBlock_onEvent_description":function(d){return "Keyra kóða til að bregðast við hinum tiltekna atburði."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "event"},
"dropletBlock_onEvent_param2":function(d){return "fall"},
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
"dropletBlock_setBackground_description":function(d){return "Stillir bakgrunninn"},
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
"dropletBlock_setSprite_description":function(d){return "Stillir ímynd leikmanns"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Stillir skap leikmanns"},
"dropletBlock_setSpritePosition_description":function(d){return "Færir leikmann samstundis á hinn tiltekna stað."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Stillir hraða leikmanns"},
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
"dropletBlock_throw_description":function(d){return "Sendir skot frá tiltekna leikmanninum."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_vanish_description":function(d){return "Lætur leikmanninn hverfa."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "endir"},
"emptyBlocksErrorMsg":function(d){return "Kubbarnir \"endurtaka\" og \"ef\" verða að innihalda aðra kubba til að virka. Gættu þess að innri kubburinn smellpassi í ytri kubbinn."},
"emptyFunctionBlocksErrorMsg":function(d){return "Fallkubburinn þarf að innhalda aðra kubba til að virka."},
"errorEmptyFunctionBlockModal":function(d){return "Það þurfa að vera kubbar innan í skilgreiningunni á fallinu. Smelltu á \"breyta\" og dragðu kubba inn í græna kubbinn."},
"errorIncompleteBlockInFunction":function(d){return "Smelltu á \"breyta\" til að ganga úr skugga um að það vanti ekki neina kubba í skilgreininguna á fallinu."},
"errorParamInputUnattached":function(d){return "Mundu að tengja kubb við hvert inntak fyrir stika sem er á kubbi fallsins á vinnusvæðinu."},
"errorUnusedParam":function(d){return "Þú bættir við kubbi fyrir stika en notaðir hann ekki í skilgreiningunni. Gættu þess að nota stikann þinn með því að smella á \"breyta\" og setja stikakubbinn inn í græna kubbinn."},
"errorRequiredParamsMissing":function(d){return "Búðu til stika fyrir fallið þitt með því að smella á \"breyta\" og bæta við stikunum sem þarf. Dragðu nýju stikakubbana inn í skilgreiningu þína fyrir fallið."},
"errorUnusedFunction":function(d){return "Þú bjóst til fall, en notaðir það aldrei á vinnusvæðinu! Smelltu á \"Föll\" í verkfærakassanum og gættu þess að nota fallið í forritinu þínu."},
"errorQuestionMarksInNumberField":function(d){return "Prófaðu að skipta \"???\" út fyrir gildi."},
"extraTopBlocks":function(d){return "Þú ert með ótengda kubba. Ætlaðir þú að festa þá á \"þegar keyrt\" kubbinn?"},
"finalStage":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann."},
"finalStageTrophies":function(d){return "Til hamingju! Þú hefur klárað síðasta áfangann og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"finish":function(d){return "Ljúka"},
"generatedCodeInfo":function(d){return "Jafnvel bestu háskólar kenna forritun með kubbum (t.d. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). En bak við tjöldin er hægt að sýna kubbana sem þú hefur sett saman sem JavaScript, sem er mest notaða forritunarmál í heimi:"},
"hashError":function(d){return "Því miður finnst ekkert vistað forrit '%1'."},
"help":function(d){return "Hjálp"},
"hintTitle":function(d){return "Vísbending:"},
"jump":function(d){return "stökkva"},
"keepPlaying":function(d){return "Spila áfram"},
"levelIncompleteError":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum en ekki á réttan hátt."},
"listVariable":function(d){return "listi"},
"makeYourOwnFlappy":function(d){return "Búðu til þinn eigin(n) Flappy leik"},
"missingBlocksErrorMsg":function(d){return "Reyndu einn eða fleiri af kubbunum hér fyrir neðan til að leysa þessa þraut."},
"nextLevel":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Til hamingju! Þú hefur leyst þraut "+locale.v(d,"puzzleNumber")+" og unnið "+locale.p(d,"numTrophies",0,"is",{"one":"bikar","other":locale.n(d,"numTrophies")+" bikara"})+"."},
"nextStage":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Til hamingju! Þú kláraðir "+locale.v(d,"stageName")+" og vannst "+locale.p(d,"numTrophies",0,"is",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Til hamingju! Þú kláraðir þraut "+locale.v(d,"puzzleNumber")+". (En þú hefðir getað notað bara  "+locale.p(d,"numBlocks",0,"is",{"one":"1 kubb","other":locale.n(d,"numBlocks")+" kubba"})+".)"},
"numLinesOfCodeWritten":function(d){return "Þú náðir að skrifa "+locale.p(d,"numLines",0,"is",{"one":"1 línu","other":locale.n(d,"numLines")+" línur"})+" af kóða!"},
"play":function(d){return "spila"},
"print":function(d){return "Prenta"},
"puzzleTitle":function(d){return "Þraut "+locale.v(d,"puzzle_number")+" af "+locale.v(d,"stage_total")},
"repeat":function(d){return "endurtaka"},
"resetProgram":function(d){return "Endurstilla"},
"runProgram":function(d){return "Keyra"},
"runTooltip":function(d){return "Keyra forritið sem samanstendur af kubbunum á vinnusvæðinu."},
"score":function(d){return "stig"},
"showCodeHeader":function(d){return "Sýna kóða"},
"showBlocksHeader":function(d){return "Sýna kubba"},
"showGeneratedCode":function(d){return "Sýna kóða"},
"stringEquals":function(d){return "strengur=?"},
"subtitle":function(d){return "sjónrænt forritunarumhverfi"},
"textVariable":function(d){return "texti"},
"tooFewBlocksMsg":function(d){return "Þú ert að nota allar nauðsynlegu tegundirnar af kubbum, en reyndu að nota fleiri svoleiðis kubba til að leysa þessa þraut."},
"tooManyBlocksMsg":function(d){return "Þessa þraut er hægt að leysa með <x id='START_SPAN'/><x id='END_SPAN'/> kubbum."},
"tooMuchWork":function(d){return "Þú lagðir á mig mjög mikla vinnu! Gætirðu reynt að nota færri endurtekningar?"},
"toolboxHeader":function(d){return "kubbar"},
"openWorkspace":function(d){return "Hvernig það virkar"},
"totalNumLinesOfCodeWritten":function(d){return "Samtals: "+locale.p(d,"numLines",0,"is",{"one":"1 lína","other":locale.n(d,"numLines")+" línur"})+" af kóða."},
"tryAgain":function(d){return "Reyna aftur"},
"hintRequest":function(d){return "Sjá vísbendingu"},
"backToPreviousLevel":function(d){return "Til baka í fyrri áfanga"},
"saveToGallery":function(d){return "Vista í safni"},
"savedToGallery":function(d){return "Vistað í safni!"},
"shareFailure":function(d){return "Því miður getum við ekki deilt þessu forriti."},
"workspaceHeader":function(d){return "Settu kubbana saman hér: "},
"workspaceHeaderJavaScript":function(d){return "Skrifaðu JavaScript kóða þinn hér"},
"workspaceHeaderShort":function(d){return "Vinnusvæði: "},
"infinity":function(d){return "Óendanleiki"},
"rotateText":function(d){return "Snúðu tækinu þínu."},
"orientationLock":function(d){return "Slökktu á stefnulæsingu í stillingum tækis."},
"wantToLearn":function(d){return "Viltu læra að kóða?"},
"watchVideo":function(d){return "Horfa á videóið"},
"when":function(d){return "þegar"},
"whenRun":function(d){return "þegar keyrt"},
"tryHOC":function(d){return "Prófa Klukkustund kóðunar"},
"signup":function(d){return "Skráning á inngangsnámskeiðið"},
"hintHeader":function(d){return "Vísbending:"},
"genericFeedback":function(d){return "Athugaðu hvernig þetta fór og reyndu að laga forritið."},
"toggleBlocksErrorMsg":function(d){return "Þú þarft að leiðrétta villu í forritinu þínu áður en hægt er að sýna það með kubbum."},
"defaultTwitterText":function(d){return "Skoðaðu það sem ég bjó til"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"}};