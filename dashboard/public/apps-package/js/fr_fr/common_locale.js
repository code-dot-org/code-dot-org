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
"and":function(d){return "et"},
"booleanTrue":function(d){return "vrai"},
"booleanFalse":function(d){return "faux"},
"blocks":function(d){return "blocs"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Actions"},
"catColour":function(d){return "Couleur"},
"catLogic":function(d){return "Logique"},
"catLists":function(d){return "Listes"},
"catLoops":function(d){return "Boucles"},
"catMath":function(d){return "Calculs"},
"catProcedures":function(d){return "Fonctions"},
"catText":function(d){return "texte"},
"catVariables":function(d){return "Variables"},
"clearPuzzle":function(d){return "Recommencer"},
"clearPuzzleConfirm":function(d){return "Cela va réinitialiser le puzzle à son état de départ et supprimer tous les blocs que tu as ajouté ou changé."},
"clearPuzzleConfirmHeader":function(d){return "Est-tu certain(e) de vouloir recommencer ?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Voir le code JavaScript généré."},
"continue":function(d){return "Continuer"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Mode création"},
"dialogCancel":function(d){return "Annuler"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "O"},
"dropletBlock_addOperator_description":function(d){return "Ajouter deux nombres"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_arcLeft_description":function(d){return "Bouge la tortue dans un arc dans le sens inverse des aiguilles d'une montre en utilisant le nombre de degrés et de rayons indiqués"},
"dropletBlock_arcRight_description":function(d){return "Bouge la tortue dans un arc dans le sens des aiguilles d'une montre en utilisant le nombre de degrés et de rayons indiqués"},
"dropletBlock_assign_x_description":function(d){return "Réaffecter une variable"},
"dropletBlock_button_description":function(d){return "Crée un bouton et attribue-lui un élément id"},
"dropletBlock_callMyFunction_description":function(d){return "Utiliser une fonction sans argument"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_callMyFunction_n_description":function(d){return "Utiliser une fonction avec un argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_changeScore_description":function(d){return "Ajouter ou enlever un point au score."},
"dropletBlock_checkbox_description":function(d){return "Create a checkbox and assign it an element id"},
"dropletBlock_circle_description":function(d){return "Draw a circle on the active  canvas with the specified coordinates for center (x, y) and radius"},
"dropletBlock_circle_param0":function(d){return "CentreX"},
"dropletBlock_circle_param1":function(d){return "CentreY"},
"dropletBlock_circle_param2":function(d){return "Rayon"},
"dropletBlock_clearCanvas_description":function(d){return "Réinitialiser la zone de dessin active"},
"dropletBlock_clearInterval_description":function(d){return "Clear an existing interval timer by passing in the value returned from setInterval()"},
"dropletBlock_clearTimeout_description":function(d){return "Clear an existing timer by passing in the value returned from setTimeout()"},
"dropletBlock_console.log_description":function(d){return "Log a message or variable to the output window"},
"dropletBlock_console.log_param0":function(d){return "message"},
"dropletBlock_container_description":function(d){return "Create a division container with the specified element id, and optionally set its inner HTML"},
"dropletBlock_createCanvas_description":function(d){return "Create a canvas with the specified id, and optionally set width and height dimensions"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "largeur"},
"dropletBlock_createCanvas_param2":function(d){return "hauteur"},
"dropletBlock_createRecord_description":function(d){return "Creates a new record in the specified table."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "record"},
"dropletBlock_createRecord_param2":function(d){return "onSuccess"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Créer une variable pour la première fois"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_deleteElement_description":function(d){return "Effacer les éléments contenant un id spécifique"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "record"},
"dropletBlock_deleteRecord_param2":function(d){return "onSuccess"},
"dropletBlock_divideOperator_description":function(d){return "Diviser deux nombres"},
"dropletBlock_dot_description":function(d){return "Draw a dot in the turtle's location with the specified radius"},
"dropletBlock_dot_param0":function(d){return "Rayon"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getAlpha_description":function(d){return "Récupère l'alpha"},
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
"dropletBlock_getXPosition_description":function(d){return "Récupère la position de l'élément sur l'axe des X"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_getYPosition_description":function(d){return "Récupère la position de l'élément sur l'axe des Y"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare deux nombres"},
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
"dropletBlock_lessThanOperator_description":function(d){return "Compare deux nombres"},
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
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplie deux nombres"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Exécute du code en réponse à l'événement spécifié."},
"dropletBlock_onEvent_param0":function(d){return "identifiant"},
"dropletBlock_onEvent_param1":function(d){return "événement"},
"dropletBlock_onEvent_param2":function(d){return "fonction"},
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
"dropletBlock_rect_param2":function(d){return "largeur"},
"dropletBlock_rect_param3":function(d){return "hauteur"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Définit l'image d'arrière-plan"},
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
"dropletBlock_setSprite_description":function(d){return "Définit l'image de l'acteur"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Définit l'humeur de l'acteur"},
"dropletBlock_setSpritePosition_description":function(d){return "Déplace instantanément un acteur à l'emplacement spécifié."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Définit la vitesse d'un acteur"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "largeur"},
"dropletBlock_setStyle_description":function(d){return "Add CSS style text to an element"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "fonction"},
"dropletBlock_setTimeout_param1":function(d){return "milliseconds"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "fonction"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_throw_description":function(d){return "Lance un projectile depuis l'acteur spécifié."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "record"},
"dropletBlock_updateRecord_param2":function(d){return "callbackFunction"},
"dropletBlock_vanish_description":function(d){return "Fait disparaître l'acteur."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"end":function(d){return "fin"},
"emptyBlocksErrorMsg":function(d){return "Le bloc « Répéter » ou « si » doit contenir d'autres blocs pour fonctionner. Assurez-vous que le bloc interne s'insère correctement à l'intérieur du bloc conteneur."},
"emptyFunctionalBlock":function(d){return "Un de vos blocs ne contient pas d'entrée."},
"emptyFunctionBlocksErrorMsg":function(d){return "Le bloc « Fonction » doit contenir d'autres blocs pour fonctionner."},
"errorEmptyFunctionBlockModal":function(d){return "Il faut des blocs dans votre définition de fonction. Cliquez sur \"modifier\" puis faites glisser les blocs dans le bloc vert."},
"errorIncompleteBlockInFunction":function(d){return "Cliquez sur \"modifier\" pour vous assurer qu'il ne manque pas de blocs dans votre définition de fonction."},
"errorParamInputUnattached":function(d){return "N'oubliez pas de joindre un bloc à l'entrée de chaque paramètre sur le bloc de fonction dans votre espace de travail."},
"errorUnusedParam":function(d){return "Vous avez ajouté un bloc de paramètres, mais il n'a pas été utilisé dans la définition. Assurez-vous d'utiliser votre paramètre en cliquant sur « modifier » et de placer le bloc de paramètres dans le bloc vert."},
"errorRequiredParamsMissing":function(d){return "Créez un paramètre pour votre fonction en cliquant sur « modifier » et en ajoutant les paramètres nécessaires. Faites glisser les nouveaux blocs de paramètres dans votre définition de fonction."},
"errorUnusedFunction":function(d){return "Vous avez créé une fonction mais ne l'avez pas ajoutée à votre espace de travail ! Cliquez « Fonctions » dans la boîte à outils et assurez-vous d'utiliser votre fonction dans votre programme."},
"errorQuestionMarksInNumberField":function(d){return "Essayez de remplacer \"???\" avec un nombre."},
"extraTopBlocks":function(d){return "Vous avez des blocs non attachés. Est-ce que vous vouliez les attacher au bloc \"lors du lancement\" ?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Félicitations ! Tu as terminé l'étape finale."},
"finalStageTrophies":function(d){return "Félicitations ! Tu as terminé l'étape finale et gagné "+locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":locale.n(d,"numTrophies")+" trophées"})+"."},
"finish":function(d){return "Terminer"},
"generatedCodeInfo":function(d){return "Même les plus grandes univesités enseignent la programmation basée sur les blocs. (ex., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Mais sous le capot, les blocs que vous avez assemblés peuvent aussi être affichés en Javascript, le langage de programmation le plus utilisé au monde:"},
"hashError":function(d){return "Désolé, '%1' ne correspond à aucun programme enregistré."},
"help":function(d){return "Aide"},
"hintTitle":function(d){return "Indice :"},
"jump":function(d){return "sauter"},
"keepPlaying":function(d){return "Continuer à jouer"},
"levelIncompleteError":function(d){return "Vous utilisez tous les types nécessaires de blocs, mais pas de la bonne manière."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Réalisez votre propre Flappy Bird"},
"missingBlocksErrorMsg":function(d){return "Essayez un ou plusieurs des blocs ci-dessous pour résoudre ce puzzle."},
"nextLevel":function(d){return "Félicitations ! Tu as terminé le Puzzle "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Félicitations ! Tu as terminé le Puzzle "+locale.v(d,"puzzleNumber")+" et gagné "+locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":locale.n(d,"numTrophies")+" trophées"})+"."},
"nextStage":function(d){return "Félicitations ! Vous avez terminé "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Félicitations ! Vous avez terminé "+locale.v(d,"stageName")+" et gagné "+locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":locale.n(d,"numTrophies")+" trophées"})+"."},
"numBlocksNeeded":function(d){return "Félicitations !  Vous avez terminé le Puzzle "+locale.v(d,"puzzleNumber")+". (Toutefois, vous auriez pu utiliser seulement "+locale.p(d,"numBlocks",0,"fr",{"one":"1 bloc","other":locale.n(d,"numBlocks")+" blocs"})+".)"},
"numLinesOfCodeWritten":function(d){return "Vous venez d'écrire "+locale.p(d,"numLines",0,"fr",{"one":"1 ligne","other":locale.n(d,"numLines")+" lignes "})+" de code!"},
"play":function(d){return "jouer"},
"print":function(d){return "Imprimer"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" sur "+locale.v(d,"stage_total")},
"repeat":function(d){return "répéter"},
"resetProgram":function(d){return "Réinitialiser"},
"runProgram":function(d){return "Démarrer"},
"runTooltip":function(d){return "Exécuter le programme défini par les blocs dans l'espace de travail."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Afficher le code"},
"showBlocksHeader":function(d){return "Afficher les blocs"},
"showGeneratedCode":function(d){return "Afficher le code"},
"stringEquals":function(d){return "Texte = ?"},
"subtitle":function(d){return "un environnement de programmation visuelle"},
"textVariable":function(d){return "texte"},
"tooFewBlocksMsg":function(d){return "Vous utilisez tous les types des blocs nécessaires, mais essayez d'utiliser plus de ces types de blocs pour compléter ce puzzle."},
"tooManyBlocksMsg":function(d){return "Ce puzzle peut être résolu avec <x id ='START_SPAN'/><x id='END_SPAN'/> blocs."},
"tooMuchWork":function(d){return "Vous m'avez fait faire beaucoup de travail !  Pourriez-vous essayer en répétant moins de fois ?"},
"toolboxHeader":function(d){return "blocs"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"hideToolbox":function(d){return "(Hide)"},
"showToolbox":function(d){return "Show Toolbox"},
"openWorkspace":function(d){return "Comment ça marche"},
"totalNumLinesOfCodeWritten":function(d){return "Production totale : "+locale.p(d,"numLines",0,"fr",{"one":"1 ligne","other":locale.n(d,"numLines")+" lignes"})+" de code."},
"tryAgain":function(d){return "Réessayer"},
"hintRequest":function(d){return "Voir l'astuce"},
"backToPreviousLevel":function(d){return "Retour au niveau précédent"},
"saveToGallery":function(d){return "Sauvegarder dans la galerie"},
"savedToGallery":function(d){return "Enregistré dans la galerie !"},
"shareFailure":function(d){return "Désolé, nous ne pouvons pas partager ce programme."},
"workspaceHeaderShort":function(d){return "Espace de travail :"},
"infinity":function(d){return "Infini"},
"rotateText":function(d){return "Tournez votre appareil."},
"orientationLock":function(d){return "Désactivez le verrouillage de l'orientation dans les réglages de votre appareil."},
"wantToLearn":function(d){return "Vous souhaitez apprendre à coder ?"},
"watchVideo":function(d){return "Voir la vidéo"},
"when":function(d){return "lorsque"},
"whenRun":function(d){return "lors du lancement"},
"tryHOC":function(d){return "Essayez l'Heure de Code"},
"signup":function(d){return "Inscrivez-vous au cours d'introduction"},
"hintHeader":function(d){return "Voici une astuce :"},
"genericFeedback":function(d){return "Observez le résultat et essayez de corriger les erreurs."},
"toggleBlocksErrorMsg":function(d){return "Vous devez corriger une erreur dans votre programme avant qu'il ne puisse être présenté sous forme de blocs."},
"defaultTwitterText":function(d){return "Découvre ce que j'ai fait"}};