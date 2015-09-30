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
"and":function(d){return "och"},
"backToPreviousLevel":function(d){return "Gå tillbaka till föregående nivå"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "block"},
"booleanFalse":function(d){return "falskt"},
"booleanTrue":function(d){return "sant"},
"catActions":function(d){return "Handlingar"},
"catColour":function(d){return "Färg"},
"catLists":function(d){return "Listor"},
"catLogic":function(d){return "Logik"},
"catLoops":function(d){return "Loopar"},
"catMath":function(d){return "Matte"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variabler"},
"clearPuzzle":function(d){return "Börja om"},
"clearPuzzleConfirm":function(d){return "Detta kommer att återställa pusslet och ta bort alla block du har lagt till eller ändrat."},
"clearPuzzleConfirmHeader":function(d){return "Är du säker på att du vill börja om?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Se genererad JavaScript-kod."},
"continue":function(d){return "Fortsätt"},
"defaultTwitterText":function(d){return "Kolla vad jag gjorde"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "Ok"},
"directionEastLetter":function(d){return "Ö"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Lägg till två nummer"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Returnerar sant först när båda uttrycken ärgningen sanna eller falska"},
"dropletBlock_andOperator_signatureOverride":function(d){return "OCH boolska operatorn"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Anropar en funktion som inte har några parametrar"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
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
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
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
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "Ge tillbaka"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "\"Upprepa\" eller \"Om\" blocken måste ha andra block inuti sig för att fungera. Se till att det inre blocket sitter rätt inuti blocket."},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktionsblocket måste ha andra block i sig för att fungera."},
"emptyFunctionalBlock":function(d){return "Du har ett block med en ofylld inmatning."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "slut"},
"errorEmptyFunctionBlockModal":function(d){return "Det måste finnas block inuti din funktionsdefinition. Klicka på \"redigera\" och dra block in i det gröna blocket."},
"errorIncompleteBlockInFunction":function(d){return "Klicka på \"Redigera\" för att se till att  någon block inte saknas inuti din funktionsdefinition."},
"errorParamInputUnattached":function(d){return "Kom ihåg att bifoga ett block på varje parameter i blockets funktion på din arbetsyta."},
"errorQuestionMarksInNumberField":function(d){return "Prova att ersätta \"???\" med ett värde."},
"errorRequiredParamsMissing":function(d){return "Skapa en parameter för din funktion genom att klicka på \"redigera\" och lägga till de nödvändiga parametrarna. Dra de nya parameterblocken in i din funktionsdefinition."},
"errorUnusedFunction":function(d){return "Du skapade en funktion, men använde det aldrig på din arbetsyta! Klicka på \"Funktioner\" i verktygslådan och kontrollera att du använder det i ditt program."},
"errorUnusedParam":function(d){return "Du har lagt till ett parameterblock, men använder inte det i definitionen. Se till att använda parametern genom att klicka på \"Redigera\" och placera parameterblocket inuti gröna blocket."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "Du har okopplade block."},
"extraTopBlocksWhenRun":function(d){return "Du har okopplade block. Menade du att bifoga dessa till \"när kör\" blocket?"},
"finalStage":function(d){return "Grattis! Du har slutfört den sista nivån."},
"finalStageTrophies":function(d){return "Grattis! Du har slutfört den sista nivån och vann "+common_locale.p(d,"numTrophies",0,"sv",{"en":"en trofé","other":common_locale.n(d,"numTrophies")+" troféer"})+"."},
"finish":function(d){return "Avsluta"},
"generatedCodeInfo":function(d){return "Även toppuniversitet lär ut blockbaserad programmering (t.ex. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Men under ytan kan blocken du har byggt ihop också visas som JavaScript, världens mest använda programmeringsspråk:"},
"genericFeedback":function(d){return "Se vad det blev, och försök fixa ditt program."},
"hashError":function(d){return "Tyvärr, '%1' finns inte bland dina sparade program."},
"help":function(d){return "Hjälp"},
"hideToolbox":function(d){return "(Dölj)"},
"hintHeader":function(d){return "Här är ett tips:"},
"hintRequest":function(d){return "Se tips"},
"hintTitle":function(d){return "Tips:"},
"ignore":function(d){return "Ignore"},
"infinity":function(d){return "Oändligt"},
"jump":function(d){return "hoppa"},
"keepPlaying":function(d){return "Fortsätt spela"},
"levelIncompleteError":function(d){return "Du använder alla nödvändiga typer av block, men inte på rätt sätt."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Gör ditt eget Flappy-spel"},
"missingBlocksErrorMsg":function(d){return "Prova att använda ett eller flera av blocken nedan för att lösa pusslet."},
"nextLevel":function(d){return "Grattis! Du slutförde pussel "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Grattis! Du slutförde pussel "+common_locale.v(d,"puzzleNumber")+" och vann "+common_locale.p(d,"numTrophies",0,"sv",{"one":"en trofé","other":common_locale.n(d,"numTrophies")+" troféer"})+"."},
"nextPuzzle":function(d){return "Nästa pussel"},
"nextStage":function(d){return "Grattis! Du har klarat "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Grattis! Du klarade "+common_locale.v(d,"stageName")+" och har fått "+common_locale.p(d,"numTrophies",0,"sv",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Grattis! Du klarade pussel "+common_locale.v(d,"puzzleNumber")+". (Men du borde bara behövt använda "+common_locale.p(d,"numBlocks",0,"sv",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" block"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du skrev "+common_locale.p(d,"numLines",0,"sv",{"one":"1 rad","other":common_locale.n(d,"numLines")+" rader"})+" kod!"},
"openWorkspace":function(d){return "Hur det fungerar"},
"orientationLock":function(d){return "Stäng av orienterings låset i enhetsinställningar."},
"play":function(d){return "spela"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Pussel "+common_locale.v(d,"puzzle_number")+" av "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "View only: "},
"repeat":function(d){return "upprepa"},
"resetProgram":function(d){return "Återställ"},
"rotateText":function(d){return "Rotera din enhet."},
"runProgram":function(d){return "Kör"},
"runTooltip":function(d){return "Starta programmet som gjorts av blocken på arbetsytan."},
"saveToGallery":function(d){return "Spara till galleriet"},
"savedToGallery":function(d){return "Sparad i galleriet!"},
"score":function(d){return "poäng"},
"shareFailure":function(d){return "Tyvärr kan inte vi dela detta program."},
"showBlocksHeader":function(d){return "Visa block"},
"showCodeHeader":function(d){return "Visa kod"},
"showGeneratedCode":function(d){return "Visa kod"},
"showTextHeader":function(d){return "Visa text"},
"showVersionsHeader":function(d){return "Version History"},
"showToolbox":function(d){return "Visa verktygslådan"},
"signup":function(d){return "Registrera dig för introduktionskursen"},
"stringEquals":function(d){return "sträng =?"},
"subtitle":function(d){return "en visuell programmeringsmiljö"},
"textVariable":function(d){return "text"},
"toggleBlocksErrorMsg":function(d){return "Du behöver fixa ett fel i ditt program innan det kan visas som block."},
"tooFewBlocksMsg":function(d){return "Du använder alla sorters block du behöver, prova att använda fler av samma sorter för att göra klart pusslet."},
"tooManyBlocksMsg":function(d){return "Detta pusslet kan lösas med <x id='START_SPAN'/><x id='END_SPAN'/> block."},
"tooMuchWork":function(d){return "Du fick mig att göra en hel del arbete!  Du kan försöka upprepa färre gånger?"},
"toolboxHeader":function(d){return "bitar"},
"toolboxHeaderDroplet":function(d){return "Verktygslåda"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+common_locale.p(d,"numLines",0,"sv",{"one":"1 rad","other":common_locale.n(d,"numLines")+" rader"})+" kod."},
"tryAgain":function(d){return "Försök igen"},
"tryHOC":function(d){return "Prova Kodtimmen"},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "Vill du lära dig att programmera?"},
"watchVideo":function(d){return "Titta på videon"},
"when":function(d){return "när"},
"whenRun":function(d){return "när startat"},
"workspaceHeaderShort":function(d){return "Arbetsyta: "},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"submit":function(d){return "Submit"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"}};