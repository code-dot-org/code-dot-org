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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
"and":function(d){return "und"},
"backToPreviousLevel":function(d){return "Zurück zum vorherigen Level"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "Bausteine"},
"booleanFalse":function(d){return "falsch"},
"booleanTrue":function(d){return "wahr"},
"catActions":function(d){return "Aktionen"},
"catColour":function(d){return "Farbe"},
"catLists":function(d){return "Listen"},
"catLogic":function(d){return "Logik"},
"catLoops":function(d){return "Schleifen"},
"catMath":function(d){return "Mathematik"},
"catProcedures":function(d){return "Funktionen"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variablen"},
"clearPuzzle":function(d){return "Neu starten"},
"clearPuzzleConfirm":function(d){return "Diese Aktion wird die Aufgabe in den Ausgangszustand versetzen und alle Bausteine, die du hinzugefügt oder verändert hast, löschen."},
"clearPuzzleConfirmHeader":function(d){return "Bist du dir sicher das du neu anfangen möchtest?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Erzeugten JavaScript-Code ansehen."},
"completedWithoutRecommendedBlock":function(d){return "Herzlichen Glückwunsch! Du hast die Aufgabe "+common_locale.v(d,"puzzleNumber")+" absolviert (aber du hättest einen anderen Block für noch besseren Code verwenden können)."},
"continue":function(d){return "Weiter"},
"copy":function(d){return "Kopieren"},
"defaultTwitterText":function(d){return "Schau dir an was ich gemacht habe"},
"designMode":function(d){return "Entwurf"},
"dialogCancel":function(d){return "Abbrechen"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "O"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Füge 2 Nummern hinzu"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Füge einen Operator hinzu"},
"dropletBlock_andOperator_description":function(d){return "Es wird nur true zurückgegeben, wenn beide Ausdrücke true sind. Ansonsten wird false zurückgegeben"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "Wert"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters"},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a named function that takes one or more parameters"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Eine Funktion mit Parametern aufrufen"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Eine Funktion aufrufen"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Wert eingeben\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Wert eingeben\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Zwei Zahlen teilen"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
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
"dropletBlock_mathRandom_description":function(d){return "Gibt eine Zufallszahl zurück. Die Zufallszahl ist größer oder gleich 0 und kleiner als 1"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Zufallsfunktion"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Der kleinste Rückgabewert"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Der größte Rückgabewert"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "gebe zurück"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while-Schleife"},
"emptyBlockInFunction":function(d){return "Die Funktion "+common_locale.v(d,"name")+" hat ein leeres Feld."},
"emptyBlockInVariable":function(d){return "Die Variable "+common_locale.v(d,"name")+" hat ein leeres Feld."},
"emptyBlocksErrorMsg":function(d){return "Innerhalb der \"Wiederholen\"- oder \"Wenn\"-Blöcke müssen sich andere Blöcke befinden, um zu funktionieren. Achte darauf, dass der innere Block genau in den umfassenden Block passt."},
"emptyExampleBlockErrorMsg":function(d){return "Du benötigst mindestens zwei Beispiele in der Funktion "+common_locale.v(d,"functionName")+". Prüfe, dass jedes Beispiel einen Aufruf und einen Rückgabewert hat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Der Funktionsblock muss andere Blöcke beinhalten, um zu funktionieren."},
"emptyFunctionalBlock":function(d){return "Du hast einen Block ohne Eingabe."},
"emptyTopLevelBlock":function(d){return "Es gibt keine Bausteine zum Ausführen. Du musst ein Baustein dem "+common_locale.v(d,"topLevelBlockName")+" Baustein anhängen."},
"end":function(d){return "Ende"},
"errorEmptyFunctionBlockModal":function(d){return "Es müssen Blöcke innerhalb deiner Funktionsdefinition sein. Klicke auf \"Bearbeiten\", und ziehe die Blöcke in den grünen Block."},
"errorIncompleteBlockInFunction":function(d){return "Klicke auf \"Bearbeiten\", um sicherzustellen, dass kein Block innerhalb deiner Funktionsdefinition fehlt."},
"errorParamInputUnattached":function(d){return "Vergiss nicht, im Funktionsblock zu jeder Parametereingabe einen Block zu verknüpfen."},
"errorQuestionMarksInNumberField":function(d){return "Versuche \"???\" mit einem Wert zu ersetzen."},
"errorRequiredParamsMissing":function(d){return "Erstelle einen Parameter für deine Funktion, indem du auf \"Bearbeiten\" klickst und den nötigen Parameter ergänzt. Ziehe die neuen Parameter-Blöcke in die Funktionsdefinition."},
"errorUnusedFunction":function(d){return "Du hast eine Funktion erstellt, aber sie nie verwendet! Klicke auf \"Funktionen\" in den Werkzeugen, und stelle sicher, dass du sie in deinem Programm verwendest."},
"errorUnusedParam":function(d){return "Du hast einen Parameterblock erstellt, aber ihn nicht in der Definition verwendet. Stelle sicher das du deine Parameter verwendest, indem du auf \"Bearbeiten\" klickst und den Parameterblock im grünen Block platzierst."},
"exampleErrorMessage":function(d){return "Die Funktion "+common_locale.v(d,"functionName")+" hat eine oder mehrere Stellen, die noch korrigiert werden müssen. Prüfe, ob sie zu deiner Beschreibung passen und beantworte die Frage."},
"examplesFailedOnClose":function(d){return "Mindestens eines deiner Beispiele stimmt nicht mit deiner Definition überein. Überprüfe deine Beispiele"},
"extraTopBlocks":function(d){return "Du hast unverbundene Blöcke."},
"extraTopBlocksWhenRun":function(d){return "Du hast unverbundene Blöcke. Wolltest Du sie mit dem \"wenn ausgeführt\" Block verbinden?"},
"finalStage":function(d){return "Glückwunsch! Du hast den letzten Level abgeschlossen."},
"finalStageTrophies":function(d){return "Glückwunsch! Du hast den letzten Level abgeschlossen und "+common_locale.p(d,"numTrophies",0,"de",{"one":"eine Trophäe","other":common_locale.n(d,"numTrophies")+" Trophäen"})+" gewonnen."},
"finish":function(d){return "Abschließen"},
"generatedCodeInfo":function(d){return "Selbst Top-Universitäten unterrichten Baustein basiertes Programmieren (z.B. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Allerdings können die von Dir zusammengefügten Bausteine auch in JavaScript, der weltweit meistverbreitesten Programmierspache, dargestellt werden:"},
"hashError":function(d){return "Ups, '%1' stimmt mit keinem gespeicherten Programm überein."},
"help":function(d){return "Hilfe"},
"hideToolbox":function(d){return "(Ausblenden)"},
"hintHeader":function(d){return "Hier ein Tipp:"},
"hintPrompt":function(d){return "Brauchst du Hilfe?"},
"hintRequest":function(d){return "Hinweis anzeigen"},
"hintReviewTitle":function(d){return "Siehe deine Hinweise an"},
"hintSelectInstructions":function(d){return "Anleitung und alte Hinweise"},
"hintSelectNewHint":function(d){return "Erhalte einen neuen Hinweis"},
"hintTitle":function(d){return "Hinweis:"},
"ignore":function(d){return "Ignorieren"},
"infinity":function(d){return "Unendlichkeit"},
"jump":function(d){return "springen"},
"keepPlaying":function(d){return "Spiel weiter"},
"levelIncompleteError":function(d){return "Du verwendest alle nötigen Bausteine, aber noch nicht auf die richtige Weise."},
"listVariable":function(d){return "Liste"},
"makeYourOwnFlappy":function(d){return "Programmiere Dein eigenes \"Flappy\"-Spiel"},
"missingRecommendedBlocksErrorMsg":function(d){return "Nicht ganz. Versuche es mit einem Baustein, den du bisher noch nicht verwendet hast."},
"missingRequiredBlocksErrorMsg":function(d){return "Nicht ganz. Du musst einen Block verwenden, den du bisher noch nicht benutzt."},
"nestedForSameVariable":function(d){return "Du benutzt die gleiche Variable in zwei oder mehr verschachtelten Schleifen (Loops). Nutze Namen für Variablen immer nur einmal, um unendliche Schleifen zu vermeiden."},
"nextLevel":function(d){return "Glückwunsch! Du hast Aufgabe "+common_locale.v(d,"puzzleNumber")+" erfolgreich abgeschlossen."},
"nextLevelTrophies":function(d){return "Glückwunsch! Du hast Aufgabe "+common_locale.v(d,"puzzleNumber")+" erfolgreich abgeschlossen und "+common_locale.p(d,"numTrophies",0,"de",{"one":"eine Trophäe","other":common_locale.n(d,"numTrophies")+" Trophäen"})+" gewonnen."},
"nextPuzzle":function(d){return "Nächste Aufgabe"},
"nextStage":function(d){return "Herzlichen Glückwunsch! Du hast "+common_locale.v(d,"stageName")+" erfolgreich abgeschlossen."},
"nextStageTrophies":function(d){return "Herzlichen Glückwunsch! Du hast Teil "+common_locale.v(d,"stageName")+" erfolgreich abgeschlossen und "+common_locale.p(d,"numTrophies",0,"de",{"one":"eine Trophäe","other":common_locale.n(d,"numTrophies")+" Trophäen"})+" gewonnen."},
"numBlocksNeeded":function(d){return "Glückwunsch! Du hast Aufgabe "+common_locale.v(d,"puzzleNumber")+" gelöst. (Du hättest jedoch nur "+common_locale.p(d,"numBlocks",0,"de",{"one":"einen Baustein","other":common_locale.n(d,"numBlocks")+" Bausteine"})+" gebraucht.)"},
"numLinesOfCodeWritten":function(d){return "Du hast soeben "+common_locale.p(d,"numLines",0,"de",{"one":"eine Zeile","other":common_locale.n(d,"numLines")+" Zeilen"})+" Code geschrieben!"},
"openWorkspace":function(d){return "Wie es funktioniert"},
"orientationLock":function(d){return "Deaktiviere die Rotationssperre in den Geräteeinstellungen."},
"play":function(d){return "spielen"},
"print":function(d){return "Drucken"},
"puzzleTitle":function(d){return "Aufgabe "+common_locale.v(d,"puzzle_number")+" von "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Zeige nur: "},
"repeat":function(d){return "wiederhole"},
"resetProgram":function(d){return "Zurücksetzen"},
"rotateText":function(d){return "Drehe Dein Gerät."},
"runProgram":function(d){return "Ausführen"},
"runTooltip":function(d){return "Starte das Programm, das durch die Bausteine in deinem Arbeitsbereich festgelegt ist."},
"runtimeErrorMsg":function(d){return "Dein Programm lief nicht einwandfrei. Bitte entferne Zeile "+common_locale.v(d,"lineNumber")+" und versuche es erneut."},
"saveToGallery":function(d){return "In die Galerie abspeichern"},
"savedToGallery":function(d){return "In der Galerie gespeichert!"},
"score":function(d){return "Punktestand"},
"sendToPhone":function(d){return "An Handy schicken"},
"shareFailure":function(d){return "Leider können wir dieses Programm nicht freigeben."},
"shareWarningsAge":function(d){return "Bitte teile uns unten dein Alter mit und klicke auf OK um weiter zu machen."},
"shareWarningsMoreInfo":function(d){return "Weitere Infos"},
"shareWarningsStoreData":function(d){return "Diese App basiert auf Code-Studio und speichert Daten, die von jedem mit diesem Teilen-Link angezeigt werden könnte. Sei also bitte vorsichtig, wenn Du aufgefordert wirst, persönliche Informationen anzugeben."},
"showBlocksHeader":function(d){return "Zeige Blöcke"},
"showCodeHeader":function(d){return "Programm anzeigen"},
"showGeneratedCode":function(d){return "Programm anzeigen"},
"showTextHeader":function(d){return "Text anzeigen"},
"showToolbox":function(d){return "Zeige Werkzeuge"},
"showVersionsHeader":function(d){return "Versions Historie"},
"signup":function(d){return "Für den Einführungskurs anmelden"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Absenden"},
"submitYourProject":function(d){return "Reiche Dein Projekt ein"},
"submitYourProjectConfirm":function(d){return "Du kannst das Projekt nicht mehr bearbeiten, nachdem du es eingereicht hast. Willst du es wirklich einreichen?"},
"unsubmit":function(d){return "Zurücknehmen"},
"unsubmitYourProject":function(d){return "Einreichung deines Projektes rückgängig machen"},
"unsubmitYourProjectConfirm":function(d){return "Wenn die Einreichung des Projektes rückgängig gemacht wird, wird das Einreichungsdatum zurückgesetzt. Wirklich rückgängig machen?"},
"subtitle":function(d){return "eine visuelle Programmierumgebung"},
"syntaxErrorMsg":function(d){return "Dein Programm enthält einen Tippfehler. Bitte entferne die Zeile "+common_locale.v(d,"lineNumber")+" und versuche es erneut."},
"textVariable":function(d){return "Text"},
"toggleBlocksErrorMsg":function(d){return "Du musst einen Fehler in deinem Programm beheben, bevor es als Baustein angezeigt werden kann."},
"tooFewBlocksMsg":function(d){return "Du verwendest alle nötigen Baustein-Typen. Versuche jedoch mehr von diesen Baustein-Typen zu verwenden, um diese Aufgabe abzuschließen."},
"tooManyBlocksMsg":function(d){return "Diese Aufgabe kann mit <x id='START_SPAN'/><x id='END_SPAN'/> Bausteinen gelöst werden."},
"tooMuchWork":function(d){return "Du hast mich ganz schön arbeiten lassen! Könntest du versuchen, weniger zu wiederholen?"},
"toolboxHeader":function(d){return "Bausteine"},
"toolboxHeaderDroplet":function(d){return "Werkzeuge"},
"totalNumLinesOfCodeWritten":function(d){return "Insgesamt: "+common_locale.p(d,"numLines",0,"de",{"one":"Eine Zeile","other":common_locale.n(d,"numLines")+" Zeilen"})+" Code."},
"tryAgain":function(d){return "Versuche es noch einmal"},
"tryBlocksBelowFeedback":function(d){return "Probiere einen der folgenden Blöcke zu verwenden:"},
"tryHOC":function(d){return "Probiere \"The Hour of Code\" aus"},
"unnamedFunction":function(d){return "Es existiert noch eine Variable oder eine Funktion ohne Name. Denk dran, Variablen und Funktionen einen aussagekräftigen Namen zu geben."},
"wantToLearn":function(d){return "Möchtest du programmieren lernen?"},
"watchVideo":function(d){return "Video anschauen"},
"when":function(d){return "wenn"},
"whenRun":function(d){return "beim Ausführen"},
"workspaceHeaderShort":function(d){return "Arbeitsbereich: "}};