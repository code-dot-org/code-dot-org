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
"and":function(d){return "at"},
"backToPreviousLevel":function(d){return "Bumalik sa nakaraang level"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "mga block"},
"booleanFalse":function(d){return "mali"},
"booleanTrue":function(d){return "tama"},
"catActions":function(d){return "Mga aksyon"},
"catColour":function(d){return "Kulay"},
"catLists":function(d){return "Mga listahan"},
"catLogic":function(d){return "Lohika"},
"catLoops":function(d){return "Mga loop"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Mga function"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Mga variable"},
"clearPuzzle":function(d){return "Magsimula sa Umpisa"},
"clearPuzzleConfirm":function(d){return "Ire-reset nito ang puzzle sa umpisa at tatanggalin ang lahat ng mga bloke na iyong idinagdag o binago."},
"clearPuzzleConfirmHeader":function(d){return "Sigurado ka bang gusto mong magsimula muli?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Tingnan ang nabuo na JavaScript code."},
"completedWithoutRecommendedBlock":function(d){return "Mabuhay! Nakumpleto mo ang Puzzle "+common_locale.v(d,"puzzleNumber")+". (Ngunit puwede kang gumamit ng ibang block sa mas malakas na code.)"},
"continue":function(d){return "Magpatuloy"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Disenyo"},
"dialogCancel":function(d){return "Kanselahin"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Magdagdag ng dalawang numero"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Magdagdag ng operator"},
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
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Tumawag ng isang function"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Ang paunang mga value sa array"},
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
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "para sa loop"},
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
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else na statement"},
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
"dropletBlock_mathRandom_description":function(d){return "Nagbibigay ng random na number na nagmumula sa 0 (kasama) hanggang sa ngunit walang 1 (hindi kasama)"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Ang minimum na number na ibinalik"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Ang maximum na number na ibinalik"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "ibalik"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Ang function na "+common_locale.v(d,"name")+" ay walang input."},
"emptyBlockInVariable":function(d){return "Ang variable "+common_locale.v(d,"name")+" ay walang input."},
"emptyBlocksErrorMsg":function(d){return "Ang \"Repeat\" o \"if\" block ay kailangan ng iba pang mga block sa loob nito upang gumana. Siguraduhin na ang block na asa loob ay nakasukat ng maayos sa loob ng naglalaman na block."},
"emptyExampleBlockErrorMsg":function(d){return "Kailangan mo ng hindi babasa sa dalawang halimbawa sa function "+common_locale.v(d,"functionName")+". Siguraduhin na ang bawat halimbawa ay may call at result."},
"emptyFunctionBlocksErrorMsg":function(d){return "Ang function na block ay kailangang magkaroon ng iba pang mga block sa loob nito upang gumana."},
"emptyFunctionalBlock":function(d){return "Mayroon kang isang block na walang nailagay na input ."},
"emptyTopLevelBlock":function(d){return "Walang block na papatakbuhin. Dapat maglagay ka ng block sa "+common_locale.v(d,"topLevelBlockName")+" na block."},
"end":function(d){return "tapos"},
"errorEmptyFunctionBlockModal":function(d){return "Dapat meron mga block sa loob ng iyong kahulugan ng function. I-click ang \"i-edit\" at i-drag ang mga block sa loob ng berdeng block."},
"errorIncompleteBlockInFunction":function(d){return "I-click ang \"i-edit\" upang tiyakin na wala kang nawawala sa loob ng iyong kahulugan ng function ng anumang mga block."},
"errorParamInputUnattached":function(d){return "Tandaang i-attach ang isang block sa bawat input parameter sa function block sa iyong workspace."},
"errorQuestionMarksInNumberField":function(d){return "Subukan ang pagpalit ng \"???\" na may value."},
"errorRequiredParamsMissing":function(d){return "Lumikha ng parameter sa pamamagitan ng pag-click sa \"i-edit\" at pagdagdag ng mga kinakailangang parameter. I-drag ang mga bagong block parameter sa iyong kahulugan ng function."},
"errorUnusedFunction":function(d){return "Lumikha ka ng isang function, ngunit hindi kailanman ginamit ito sa iyong workspace! Mag-click sa \"Mga Functions\" sa toolbox at tiyakin na ginagamit mo ito sa iyong program."},
"errorUnusedParam":function(d){return "Nagdagdag ka ng isang block na parameter, ngunit hindi ito ginamit sa definition. Siguraduhin na gamitin ang iyong mga parameter sa pamamagitan ng pag-click sa \"i-edit\" at paglalagay ng parameter block sa loob ng berdeng block."},
"exampleErrorMessage":function(d){return "Ang function "+common_locale.v(d,"functionName")+" ay may isa o mas marami pa na example na kailangan ng pagbabago. Siguraduhin na sila ay magkatugma sa iyong definition at sagot sa tanong."},
"examplesFailedOnClose":function(d){return "Ang isa o higit pa sa iyong mga halimbawa ay hindi tugma sa iyong definition. Tingnan ang iyong mga halimbawa bago isara"},
"extraTopBlocks":function(d){return "Ikaw ay may hindi na-attach na mga block."},
"extraTopBlocksWhenRun":function(d){return "Ikaw ay may hindi na-attach na mga block. Nais mo ba na i-attach ang mga ito sa \"when run\" na block?"},
"finalStage":function(d){return "Maligayang pagbati! Natapos mo na ang pinakahuling stage."},
"finalStageTrophies":function(d){return "Maligayang pagbati! Nakumpleto mo na ang pinakahuling stage at nanalo ng "+common_locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Katapusan"},
"generatedCodeInfo":function(d){return "Kahit ang mga nangungunang mga unibersidad ay nagtuturo ng block-based na coding (eg, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ngunit sa ilalim nito, ang mga bloke na iyong binuo ay maaari ring ipakita sa JavaScript, pinaka-tinatanggap na mga wika coding ng mundo:"},
"hashError":function(d){return "Pasensya, '%1' ay walang katumbas sa mga na save na program."},
"help":function(d){return "Tulong"},
"hideToolbox":function(d){return "(itago)"},
"hintHeader":function(d){return "Narito ang isang tip:"},
"hintRequest":function(d){return "Tingnan ang hint"},
"hintTitle":function(d){return "Pahiwatig:"},
"ignore":function(d){return "I-ignore"},
"infinity":function(d){return "Walang katapusan"},
"jump":function(d){return "talon"},
"keepPlaying":function(d){return "I-play lang"},
"levelIncompleteError":function(d){return "Ginagamit mo ang lahat ng kinakailangang mga uri ng mga bloke ngunit hindi sa tamang paraan."},
"listVariable":function(d){return "list"},
"makeYourOwnFlappy":function(d){return "Gumawa Ng Sarili Mong Flappy Game"},
"missingRecommendedBlocksErrorMsg":function(d){return "Hindi ganun. Subukan na gumamit ng block na hindi mo pa ginagamit."},
"missingRequiredBlocksErrorMsg":function(d){return "Hindi ganun. Kailangan mo na gumamit ng block na hindi mo pa ginagamit."},
"nestedForSameVariable":function(d){return "Ginagamit mo ang parehong variable sa loob ng dalawa o mahigit pa na naka-nest na mga loop. Gumamit ng unique na variable na pangalan upang maiwasan ang infinite na loops."},
"nextLevel":function(d){return "Maligayang bati! Natapos mo ang Puzzle "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Maligayang bati! Nakumpleto mo ang Puzzle "+common_locale.v(d,"puzzleNumber")+" at nanalo ng "+common_locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Sunod na puzzle"},
"nextStage":function(d){return "Maligayang bati! Nakumpleto mo ang "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Maligayang bati! Natapos mo ang "+common_locale.v(d,"stageName")+" at nanalo ng "+common_locale.p(d,"numTrophies",0,"fil",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Maligayang bati! Nakumpleto mo ang Puzzle "+common_locale.v(d,"puzzleNumber")+". (Subalit, maaari mo sanang gamitin lamang ang "+common_locale.p(d,"numBlocks",0,"fil",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ikaw ang nagsulat ng "+common_locale.p(d,"numLines",0,"fil",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" ng code!"},
"openWorkspace":function(d){return "Kung Paano Ito Gumagana"},
"orientationLock":function(d){return "I-off ang orientation ng lock sa mga setting ng device."},
"play":function(d){return "i-play"},
"print":function(d){return "I-print"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" ng "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Tingnan lang: "},
"repeat":function(d){return "ulitin"},
"resetProgram":function(d){return "Ulitin"},
"rotateText":function(d){return "Paikutin ang iyong device."},
"runProgram":function(d){return "Patakbuhin"},
"runTooltip":function(d){return "Patakbuhin ang program na tinutukoy ng mga block sa workspace."},
"runtimeErrorMsg":function(d){return "Your program did not run successfully. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"saveToGallery":function(d){return "I-save sa gallery"},
"savedToGallery":function(d){return "Na-save sa gallery!"},
"score":function(d){return "Score"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Pasesnya, hindi namin pwede ibahagi ang program na ito."},
"shareWarningsAge":function(d){return "Please provide your age below and click OK to continue."},
"shareWarningsMoreInfo":function(d){return "More Info"},
"shareWarningsStoreData":function(d){return "This app built on Code Studio stores data that could be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information."},
"showBlocksHeader":function(d){return "Ipakita ang mga Block"},
"showCodeHeader":function(d){return "Ipakita ang Code"},
"showGeneratedCode":function(d){return "Ipakita ang Code"},
"showTextHeader":function(d){return "Show Text"},
"showToolbox":function(d){return "Show Toolbox"},
"showVersionsHeader":function(d){return "Version History"},
"signup":function(d){return "Mag-sign up para sa intro ng kurso"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Ipasa"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Unsubmit your project"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting your project will reset the submitted date, really unsubmit?"},
"subtitle":function(d){return "isang visual programming na environment"},
"syntaxErrorMsg":function(d){return "Your program contains a typo. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"textVariable":function(d){return "text"},
"toggleBlocksErrorMsg":function(d){return "Kailangan mong iwasto ang isang error sa iyong programa bago ito ay ipapakita bilang mga block."},
"tooFewBlocksMsg":function(d){return "Ginagamit mo ang lahat na posibleng klase ng bloke, ngunit subukan mong gamitin ang iba pang mga uri ng mga block upang makumpleto ang puzzle na ito."},
"tooManyBlocksMsg":function(d){return "Ang puzzle na ito ay maaaring malutas gamit ang <x id='START_SPAN'/><x id='END_SPAN'/> na mga block."},
"tooMuchWork":function(d){return "Pinagawa mo ako ng naparaming trabaho! Maaari mo ba na ulitin ng mas kaunting mga beses?"},
"toolboxHeader":function(d){return "Mga block"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Kinabuohan: "+common_locale.p(d,"numLines",0,"fil",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" ng code."},
"tryAgain":function(d){return "Subukang muli"},
"tryBlocksBelowFeedback":function(d){return "Try using one of the blocks below:"},
"tryHOC":function(d){return "Subukan ang Hour of Code"},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "Gusto mo matuto mag-code?"},
"watchVideo":function(d){return "Panoorin ang Video"},
"when":function(d){return "kelan"},
"whenRun":function(d){return "kapag tumakbo"},
"workspaceHeaderShort":function(d){return "Workspace: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};