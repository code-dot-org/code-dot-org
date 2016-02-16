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
"and":function(d){return "eta"},
"backToPreviousLevel":function(d){return "Atzera aurreko mailara"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokeak"},
"booleanFalse":function(d){return "gezurra"},
"booleanTrue":function(d){return "egia"},
"catActions":function(d){return "Ekintzak"},
"catColour":function(d){return "Kolorea"},
"catLists":function(d){return "Zerrendak"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Itzuliak"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funtzioak"},
"catText":function(d){return "Testua"},
"catVariables":function(d){return "Aldagaiak"},
"choosePrefix":function(d){return "Choose..."},
"clearPuzzle":function(d){return "Hasi Berriro"},
"clearPuzzleConfirm":function(d){return "Honek ariketa berrezarriko du hasierako egoerara eta sortu edo kargatutako bloke guztiak ezabatuko ditu."},
"clearPuzzleConfirmHeader":function(d){return "Ziur al zaude berriro hasi nahi duzula?"},
"codeMode":function(d){return "Kodea"},
"codeTooltip":function(d){return "Ikusi sortutako Javascript kodea."},
"completedWithoutRecommendedBlock":function(d){return "Zorionak! "+common_locale.v(d,"puzzleNumber")+". ariketa bukatu duzu. (Baina beste bloke bat erabil zenezakeen kode hobea lortzeko.)"},
"continue":function(d){return "Jarraitu"},
"copy":function(d){return "Kopiatu"},
"debugConsoleHeader":function(d){return "Debug Console"},
"debugCommandsHeaderWhenOpen":function(d){return "Debug Commands"},
"debugCommandsHeaderWhenClosed":function(d){return "Show Debug Commands"},
"defaultTwitterText":function(d){return "Ikusi egin dudana"},
"designMode":function(d){return "Diseinua"},
"dialogCancel":function(d){return "Ezeztatu"},
"dialogOK":function(d){return "Ongi"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "I"},
"directionSouthLetter":function(d){return "H"},
"directionWestLetter":function(d){return "M"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters"},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a named function that takes one or more parameters"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_comment_description":function(d){return "Write a description of some code"},
"dropletBlock_comment_signatureOverride":function(d){return "comment"},
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
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_mathRandom_description":function(d){return "0 eta 1 arteko ausazko zenbaki bat itzultzen du, 0a barne baina 1a kanpoan utziz (exklusiboa)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
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
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Itzulitako balio minimoa"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Itzulitako zenbaki maximoa"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "itzuli"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return common_locale.v(d,"name")+" funtzioak sarrera bat hutsik dauka."},
"emptyBlockInVariable":function(d){return common_locale.v(d,"name")+" aldagaiak sarrera bat hutsik dauka."},
"emptyBlocksErrorMsg":function(d){return "\"Errepikatu\" edo \"baldintza\" blokeak barruan beste bloke batzuk behar ditu funtzionatzeko. Egiaztatu barruko blokeak egoki kokatuak daudela."},
"emptyExampleBlockErrorMsg":function(d){return "Gutxienez "+common_locale.v(d,"functionName")+" funtzioaren bi adibide dehar dituzu. Ziurtatu adibide bakoitzak dei bat eta emaitza bat daukala."},
"emptyFunctionBlocksErrorMsg":function(d){return "\"Funtzio\" blokeak beste bloke batzuk izan behar ditu bere barruan lan egiteko."},
"emptyFunctionalBlock":function(d){return "Bete gabeko sarrera bat duen bloke bat daukazu."},
"emptyTopLevelBlock":function(d){return "Ez dago blokerik exekutatzeko. Blokeren bat atxiki behar diozu "+common_locale.v(d,"topLevelBlockName")+" blokeari."},
"end":function(d){return "amaiera"},
"errorEmptyFunctionBlockModal":function(d){return "Zure funtzioaren definizioan, blokeak sartu behar dituzu. Klikatu \"editatu\" eta arrastatu blokeak bloke berdearen barrura."},
"errorIncompleteBlockInFunction":function(d){return "Klikatu \"editatu\" ziurtatzeko ez dela blokerik faltatzen zure funtzioaren definizioan."},
"errorParamInputUnattached":function(d){return "Gogoratu bloke bana itsatsi behar diozula parametro sarrera bakoitzari zure languneko funtzio blokean."},
"errorQuestionMarksInNumberField":function(d){return "Saiatu \"???\" ordezkatzen balio batez."},
"errorRequiredParamsMissing":function(d){return "Sortu parametro bat zure funtziorako \"editatu\" klikatuz eta beharrezko parametroak gehituz. Arrastatu parametro berrien blokeak zure funtzioaren definiziora."},
"errorUnusedFunction":function(d){return "Funtzio bat sortu duzu, baina ez duzu inoiz erabili zure langunean! Klikatu \"Funtzioak\" tresnen kutxan eta ziurtatu zure programan erabiltzen dituzula."},
"errorUnusedParam":function(d){return "Parametro-bloke bat gehitu zenuen, baina ez zenuen definizioan gehitu. Ziurtatu zure parametroa erabiltzen duzula \"editatu\"n klik eginez eta parametro-blokea bloke berdearen barruan sartuz."},
"exampleErrorMessage":function(d){return common_locale.v(d,"functionName")+" funtzioak doitu beharreko adibide bat edo gehiago dauzka. Ziurtatu zure definizioarekin bat datozela eta erantzun galdera."},
"examplesFailedOnClose":function(d){return "Zure adibideetako bat edo gehiago ez datoz bat zure definizioarekin. Begira zure adibideak itxi aurretik"},
"extraTopBlocks":function(d){return "Erantsi gabeko blokeak dituzu."},
"extraTopBlocksWhenRun":function(d){return "Erantsi gabeko blokeak dituzu. Hauek \"martxan dagoenean\" blokera erantsi nahi dituzu?"},
"finalStage":function(d){return "Zorionak! Azkeneko ariketa osatu duzu."},
"finalStageTrophies":function(d){return "Zorionak! Azkeneko eszenatokia osatu duzu eta "+common_locale.p(d,"numTrophies",0,"eu",{"one":"garaikurra","other":common_locale.n(d,"numTrophies")+" garaikur"})+"."},
"finish":function(d){return "Amaitu"},
"generatedCodeInfo":function(d){return "Goi mailako unibertsitateek (adib., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+") ere blokeetan oinarritutako programazioa irakasten dute. Baina zuk erabilitako blokeen azpian munduan zehar erabilera zabalen duen programazio lengoaia dago, JavaScript:"},
"hashError":function(d){return "Barkatu. '%1' ez dator bat inongo gordetako programarekin."},
"help":function(d){return "Laguntza"},
"hideToolbox":function(d){return "(Ezkutatu)"},
"hintHeader":function(d){return "Hemen aholkua:"},
"hintPrompt":function(d){return "Laguntzarik behar?"},
"hintRequest":function(d){return "Ikusi aholkua"},
"hintReviewTitle":function(d){return "Berrikusi zure aholkuak"},
"hintSelectInstructions":function(d){return "Aginduak eta aholku zaharrak"},
"hintSelectNewHint":function(d){return "Eskuratu aholku berri bat"},
"hintTitle":function(d){return "Aholkua:"},
"ignore":function(d){return "Baztertu"},
"infinity":function(d){return "Infinitu"},
"jump":function(d){return "salto egin"},
"keepPlaying":function(d){return "Jarraitu jolasten"},
"levelIncompleteError":function(d){return "Beharrezko diren bloke mota guztiak erabiltzen ari zara baina ez modu egokian."},
"listVariable":function(d){return "zerrenda"},
"makeYourOwnFlappy":function(d){return "Egin zure Flappy joko propioa"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ez guztiz. Saiatu oraindik erabiltzen ari ez zaren blokea erabiltzen."},
"missingRequiredBlocksErrorMsg":function(d){return "Ez guztiz. Erabiltzen ari ez zaren bloke bat erabili behar duzu."},
"nestedForSameVariable":function(d){return "Aldagai bera erabiltzen ari zara habiatutako begizta bi edo gehiagotan. Begizta amaigabekoak ekiditeko erabili aldagai izen desberdinak."},
"nextLevel":function(d){return "Zorionak! "+common_locale.v(d,"puzzleNumber")+". ariketa osatu duzu."},
"nextLevelTrophies":function(d){return "Zorionak! "+common_locale.v(d,"puzzleNumber")+". ariketa osatu duzu eta "+common_locale.p(d,"numTrophies",0,"eu",{"one":"garaikur bat irabazi duzu","other":common_locale.n(d,"numTrophies")+" garaikur irabazi dituzu"})+"."},
"nextPuzzle":function(d){return "Hurrengo ariketa"},
"nextStage":function(d){return "Zorionak! "+common_locale.v(d,"stageName")+" osatu duzu."},
"nextStageTrophies":function(d){return "Zorionak! "+common_locale.v(d,"stageName")+" osatu duzu eta "+common_locale.p(d,"numTrophies",0,"eu",{"one":"garaikur bat irabazi duzu","other":common_locale.n(d,"numTrophies")+" garaikur irabazi dituzu"})+"."},
"numBlocksNeeded":function(d){return "Zorionak! "+common_locale.v(d,"puzzleNumber")+". ariketa osatu duzu. (Hala ere "+common_locale.p(d,"numBlocks",0,"eu",{"one":"bloke bat bakarrik erabil zenezakeen","other":common_locale.n(d,"numBlocks")+" bloke erabili zenitzakeen"})},
"numLinesOfCodeWritten":function(d){return " "+common_locale.p(d,"numLines",0,"eu",{"one":"kode lerro bat idatzi berri duzu","other":common_locale.n(d,"numLines")+" lerro kode idatzi berri dituzu"})+"!"},
"openWorkspace":function(d){return "Nola dabilen"},
"orientationLock":function(d){return "Itzali orientazio lokatzea gailuaren aukeretan."},
"pause":function(d){return "Break"},
"play":function(d){return "hasi"},
"print":function(d){return "Inprimatu"},
"puzzleTitle":function(d){return common_locale.v(d,"puzzle_number")+". ariketa, "+common_locale.v(d,"stage_total")+"tik"},
"readonlyWorkspaceHeader":function(d){return "Ikusteko bakarrik: "},
"recommendedBlockContextualHintTitle":function(d){return "Try using a block like this to solve the puzzle."},
"repeat":function(d){return "errepikatu"},
"resetProgram":function(d){return "Berrezarri"},
"rotateText":function(d){return "Biratu zure gailua."},
"runProgram":function(d){return "Hasi"},
"runTooltip":function(d){return "Hasi lan eremuko blokeek definitutako programaren exekuzioa."},
"runtimeErrorMsg":function(d){return "Zure programak ez du behar bezala funtzionatu. Mesedez, ezabatu "+common_locale.v(d,"lineNumber")+". lerroa eta saiatu berriro."},
"saveToGallery":function(d){return "Gorde"},
"savedToGallery":function(d){return "Gordeta"},
"score":function(d){return "markagailua"},
"sendToPhone":function(d){return "Bidali Telefonora"},
"shareFailure":function(d){return "Barkatu, ezin dugu programa hau partekatu."},
"shareWarningsAge":function(d){return "Mesedez idatzi zure adina azpian eta klikatu OK jarraitzeko."},
"shareWarningsMoreInfo":function(d){return "Informazio gehiago"},
"shareWarningsStoreData":function(d){return "Code Studion egindako app honek elkarbanatze esteka hau duen edonork ikusteko moduan gordetzen ditu datuak; beraz, kontuz ibili informazio pertsonala emateko eskatuz gero."},
"showBlocksHeader":function(d){return "Erakutsi blokeak"},
"showCodeHeader":function(d){return "Ikusi kodea"},
"showGeneratedCode":function(d){return "Ikusi kodea"},
"showTextHeader":function(d){return "Erakutsi testua"},
"showToolbox":function(d){return "Erakutsi tresna-kutxa"},
"showVersionsHeader":function(d){return "Bertsio historia"},
"signup":function(d){return "Izena eman sarrera kurtsorako"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"stringEquals":function(d){return "katea=?"},
"submit":function(d){return "Bidali"},
"submitYourProject":function(d){return "Bidali zure proiektua"},
"submitYourProjectConfirm":function(d){return "Behin proiektua bidalita ezingo duzu berriro editatu. Benetan bidali nahi duzu?"},
"unsubmit":function(d){return "Bidalketa ezeztatu"},
"unsubmitYourProject":function(d){return "Kendu aure proiektua"},
"unsubmitYourProjectConfirm":function(d){return "Zure proiektua kenduz gero, bidalitako data ezabatuko da. Ziur kendu nahi duzula?"},
"subtitle":function(d){return "programazio ingurune bisuala"},
"syntaxErrorMsg":function(d){return "Zure programak tipografia errore bat dauka. Mesedez, ezabatu "+common_locale.v(d,"lineNumber")+". lerroa eta saiatu berriro ere."},
"textVariable":function(d){return "testua"},
"toggleBlocksErrorMsg":function(d){return "Zure programan akats bat zuzendu behar duzu bloke gisa aurkeztu baino lehen."},
"tooFewBlocksMsg":function(d){return "Beharrezko bloke mota guztiak erabiltzen ari zara, baina saiatu mota hauetako bloke gehiago erabiltzen ariketa osatzeko."},
"tooManyBlocksMsg":function(d){return "Ariketa hau <x id='START_SPAN'/><x id='END_SPAN'/> blokerekin ebaz daiteke."},
"tooMuchWork":function(d){return "Lan asko eginarazi didazu! Saiatu zaitezke gutxiagotan errepikatzen?"},
"toolboxHeader":function(d){return "Blokeak"},
"toolboxHeaderDroplet":function(d){return "Tresna-kutxa"},
"totalNumLinesOfCodeWritten":function(d){return "Guztira: "+common_locale.p(d,"numLines",0,"eu",{"one":"kode lerro 1","other":common_locale.n(d,"numLines")+" lerro kode"})+"."},
"tryAgain":function(d){return "Saiatu berriro"},
"tryBlocksBelowFeedback":function(d){return "Saiatu azpiko blokeetako bat erabiltzen:"},
"tryHOC":function(d){return "Probatu Kode Ordua"},
"unnamedFunction":function(d){return "Izenik gabeko aldagai edo funtzio bat daukazu. Ez ahaztu guztiei esanguratsua den izen bat jartzeaz."},
"wantToLearn":function(d){return "Programatzen ikasi nahi?"},
"watchVideo":function(d){return "Ikusi Bideoa"},
"when":function(d){return "-enean"},
"whenRun":function(d){return "martxan dagoenean"},
"workspaceHeaderShort":function(d){return "Lan eremua: "}};