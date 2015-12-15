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
"and":function(d){return "un"},
"backToPreviousLevel":function(d){return "Atpakaļ uz iepriekšējo līmeni"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "Bloki"},
"booleanFalse":function(d){return "nepatiess"},
"booleanTrue":function(d){return "patiess"},
"catActions":function(d){return "Darbības"},
"catColour":function(d){return "Krāsa"},
"catLists":function(d){return "Saraksti"},
"catLogic":function(d){return "Loģika"},
"catLoops":function(d){return "Cikli"},
"catMath":function(d){return "Matemātika"},
"catProcedures":function(d){return "Funkcijas"},
"catText":function(d){return "Teksts"},
"catVariables":function(d){return "Mainīgie"},
"clearPuzzle":function(d){return "Sākt no sākuma"},
"clearPuzzleConfirm":function(d){return "Šis atiestatīs mīklu līdz tās sākuma pozīcijai un izdzēsīs visus blokus, kurus esi pievienojis, vai mainijis."},
"clearPuzzleConfirmHeader":function(d){return "Vai esat pārliecināts, ka vēlaties sākt no jauna?"},
"codeMode":function(d){return "Kods"},
"codeTooltip":function(d){return "Skatīt ģenerēto JavaScript kodu."},
"completedWithoutRecommendedBlock":function(d){return "Congratulations! You completed Puzzle "+common_locale.v(d,"puzzleNumber")+". (But you could use a different block for stronger code.)"},
"continue":function(d){return "Turpināt"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Apskaties, ko esmu izveidojis"},
"designMode":function(d){return "Izskats"},
"dialogCancel":function(d){return "Atcelt"},
"dialogOK":function(d){return "Labi"},
"directionEastLetter":function(d){return "A"},
"directionNorthLetter":function(d){return "Z"},
"directionSouthLetter":function(d){return "D"},
"directionWestLetter":function(d){return "R"},
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
"dropletBlock_mathRandom_description":function(d){return "Returns a random number ranging from 0 (inclusive) up to but not including 1 (exclusive)"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "atgriež"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funkcijai "+common_locale.v(d,"name")+" ir neaizpildīta ievade."},
"emptyBlockInVariable":function(d){return "Mainīgajam "+common_locale.v(d,"name")+" ir neaizpildīta ievade."},
"emptyBlocksErrorMsg":function(d){return "\"Atkārtojuma\" vai \"ja\" blokam nepieciešams saturēt citus blokus lai strādātu. Pārliecinieties, ka iekšējie bloki pareizi iederas ārējā blokā."},
"emptyExampleBlockErrorMsg":function(d){return "Jums ir jāizveido vismaz divi funkcijas "+common_locale.v(d,"functionName")+" piemēri. Pārliecinieties, vai katrs piemērs tiek izsaukts un kāds ir rezultāts."},
"emptyFunctionBlocksErrorMsg":function(d){return "Lai tas strādātu, funkciju blokam ir nepieciešami citi bloki tajā."},
"emptyFunctionalBlock":function(d){return "Jums ir bloks ar neaizpildītu ievadi."},
"emptyTopLevelBlock":function(d){return "Nav bloki, kurus aktivizēt. Tev ir jāpievieno bloku pie "+common_locale.v(d,"topLevelBlockName")+" bloka."},
"end":function(d){return "beigas"},
"errorEmptyFunctionBlockModal":function(d){return "Funkcijā jābūt blokiem. Klikšķini \"labot\" un velc blokus zaļajā blokā."},
"errorIncompleteBlockInFunction":function(d){return "Klikšķini \"labot\", lai pārliecinātkos, ka definētajā funkcijā nepietrūkst neviena bloka."},
"errorParamInputUnattached":function(d){return "Atceries savā darba vietā pievienot bloku katra parametra ievadei funkcijā."},
"errorQuestionMarksInNumberField":function(d){return "Nomaini \"???\" ar vērtību."},
"errorRequiredParamsMissing":function(d){return "Izveido parametru funkcijai, klikšķinot \"labot\" un pievienojot nepieciešamos parametrus. Velc jauno parametra bloku savā definētajā funkcijā."},
"errorUnusedFunction":function(d){return "Tu izveidoji funkciju, bet neizmanto to savā darbavietā. Klikšķini uz \"funkcijas\" rīku joslā un pārliecinies, ka izmanto to savā programmā."},
"errorUnusedParam":function(d){return "Tu pievienoji parametra bloku, bet neizmanto to funkcijas definēšanā. Pārliecinies, ka izmanto parametru, klikšķinot \"labot\" un ievietojot parametra bloku zaļajā blokā."},
"exampleErrorMessage":function(d){return "Funkcijai "+common_locale.v(d,"functionName")+" ir viens vai vairāki piemēri, kurus nepieciešams sakārtot. Pārliecinieties, ka tie atbilst jūsu definīcijai un atbildiet uz jautājumu."},
"examplesFailedOnClose":function(d){return "Viens vai vairāki no jūsu piemēriem neatbilst jūsu definīcijai. Pārbaudiet savus piemērus pirms to aizvēršanas"},
"extraTopBlocks":function(d){return "Tev ir nepievienoti bloki."},
"extraTopBlocksWhenRun":function(d){return "Tev ir nepievienoti bloki. Vai biji domājis tos pievienot \"Kad palaists\" blokam?"},
"finalStage":function(d){return "Apsveicu! Pēdējais posms ir pabeigts."},
"finalStageTrophies":function(d){return "Apsveicu! Tu esi pabeidzis pēdējos posmu un ieguvis "+common_locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Pabeigt"},
"generatedCodeInfo":function(d){return "Arī labākās universitātēs apmāca vizuālo programmēšanu (piemēram, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Bet pamatā bloki, ko tu esi izveidojies, var arī tikt parādīti valodā JavaScript - vienā no pasaules populārākajām programmēšanas valodām:"},
"hashError":function(d){return "Atvainojiet, '%1' neatbilst nevienai saglabātai programmai."},
"help":function(d){return "Palīdzība"},
"hideToolbox":function(d){return "(Paslēpt)"},
"hintHeader":function(d){return "Padoms:"},
"hintRequest":function(d){return "Apskatīt padomu"},
"hintTitle":function(d){return "Padoms:"},
"ignore":function(d){return "Ignorēt"},
"infinity":function(d){return "Bezgalība"},
"jump":function(d){return "lēkt"},
"keepPlaying":function(d){return "Turpināt spēlēt"},
"levelIncompleteError":function(d){return "Jūs izmantojat visus nepieciešamos bloka veidus, bet ne pareizā veidā."},
"listVariable":function(d){return "saraksts"},
"makeYourOwnFlappy":function(d){return "Izveido savu \"Flappy\" spēli"},
"missingRecommendedBlocksErrorMsg":function(d){return "Not quite. Try using a block you aren’t using yet."},
"missingRequiredBlocksErrorMsg":function(d){return "Not quite. You have to use a block you aren’t using yet."},
"nestedForSameVariable":function(d){return "Jūs izmantojot vienādus mainīgo nosaukumus divos vai vairākos iekļautos ciklos. Lietojiet unikālus mainīgo nosaukumus, lai izvairītos no bezgalīgām cilpām."},
"nextLevel":function(d){return "Apsveicu! Esi pabeidzis mīklu "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Apsveicu! Tu pabeidzi mīklu "+common_locale.v(d,"puzzleNumber")+" un ieguvi "+common_locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Nākamais uzdevums"},
"nextStage":function(d){return "Apsveicu! Tu pabeidzi "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Apsveicu! tu pabeidzi "+common_locale.v(d,"stageName")+" un ieguvi "+common_locale.p(d,"numTrophies",0,"lv",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Apsveicu! Tu pabeidzis mīkl "+common_locale.v(d,"puzzleNumber")+". (Tomēr tu būtu varējis izmantot tikai "+common_locale.p(d,"numBlocks",0,"lv",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Tu tikko uzrakstīji "+common_locale.p(d,"numLines",0,"lv",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" koda!"},
"openWorkspace":function(d){return "Kā tas darbojas"},
"orientationLock":function(d){return "Ieslēdz rotāciju ierīces uzstādījumos."},
"play":function(d){return "spēlēt"},
"print":function(d){return "Drukāt"},
"puzzleTitle":function(d){return "Mīkla "+common_locale.v(d,"puzzle_number")+" no "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Tikai skatāms: "},
"repeat":function(d){return "atkārtot"},
"resetProgram":function(d){return "Atiestatīt"},
"rotateText":function(d){return "Pagriez savu ierīci."},
"runProgram":function(d){return "Palaist"},
"runTooltip":function(d){return "Palaid programmu, kura izveidota no darba vietā esošajiem blokiem."},
"runtimeErrorMsg":function(d){return "Jūsu programma netika veiksmīgi izpildīta. Lūdzu dzēsiet "+common_locale.v(d,"lineNumber")+" rindu un mēģiniet vēlreiz."},
"saveToGallery":function(d){return "Saglabāt galerijā"},
"savedToGallery":function(d){return "Saglabāts galerijā!"},
"score":function(d){return "rezultāts"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Piedod, mēs nevaram izplatīt šo programmu."},
"shareWarningsAge":function(d){return "Lūdzu norādiet jūsu vecumu un noklikšķiniet uz Labi, lai turpinātu."},
"shareWarningsMoreInfo":function(d){return "Vairāk informācijas"},
"shareWarningsStoreData":function(d){return "Šīs aplikācijas pamatā ir Code Studio saglabātie dati, kas būs apskatāmi ikvienam ar šo koplietošanas saiti, tāpēc esiet uzmanīgs, ja jums tiek pieprasīts norādīt savu personisko informāciju."},
"showBlocksHeader":function(d){return "Parādīt blokus"},
"showCodeHeader":function(d){return "Parādīt Kodu"},
"showGeneratedCode":function(d){return "Parādīt kodu"},
"showTextHeader":function(d){return "Parādīt tekstu"},
"showToolbox":function(d){return "Parādīt rīkus"},
"showVersionsHeader":function(d){return "Versiju vēsture"},
"signup":function(d){return "Piereģistrējies ievadkursam"},
"stringEquals":function(d){return "virkne=?"},
"submit":function(d){return "Iesniegt"},
"submitYourProject":function(d){return "Iesniegt savu projektu"},
"submitYourProjectConfirm":function(d){return "Jūs nevarēsiet rediģēt savu projektu pēc tā iesniegšanas, tiešām iesniegt?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Unsubmit your project"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting your project will reset the submitted date, really unsubmit?"},
"subtitle":function(d){return "vizuāla programmēšanas vide"},
"syntaxErrorMsg":function(d){return "Jūsu programma satur sintakses vai drukas kļūdu. Lūdzu labojiet "+common_locale.v(d,"lineNumber")+" rindu un mēģiniet vēlreiz."},
"textVariable":function(d){return "teksts"},
"toggleBlocksErrorMsg":function(d){return "Tev jāizlabo kļūdu savā programmā, pirms to var rādīt blokos."},
"tooFewBlocksMsg":function(d){return "Tu izmanto visus nepieciešamos bloku veidus, bet, lai pabeigtu šo mīklu, mēģini izmantot vēl vairāk šāda veida blokus."},
"tooManyBlocksMsg":function(d){return "Mīkla var tikt atrisināta ar <x id='START_SPAN'/><x id='END_SPAN'/> blokiem."},
"tooMuchWork":function(d){return "Tu man liki daudz darīt! Vari pamēģināt atkārtot mazāk reižu?"},
"toolboxHeader":function(d){return "Bloki"},
"toolboxHeaderDroplet":function(d){return "Rīki"},
"totalNumLinesOfCodeWritten":function(d){return "Visu laiko kopējais:  "+common_locale.p(d,"numLines",0,"lv",{"one":"1 rinda","other":common_locale.n(d,"numLines")+" rindas"})+"  koda"},
"tryAgain":function(d){return "Mēgini vēlreiz"},
"tryBlocksBelowFeedback":function(d){return "Try using one of the blocks below:"},
"tryHOC":function(d){return "Izmēģini Programmēšanas stundu"},
"unnamedFunction":function(d){return "Programmā ir mainīgais vai funkcija, kuram nav piešķirts nosaukumus. Neaizmirstiet visiem elementiem dot aprakstošus nosaukumus."},
"wantToLearn":function(d){return "Vai vēlies iemācīties programmēt?"},
"watchVideo":function(d){return "Noskaties video"},
"when":function(d){return "kad"},
"whenRun":function(d){return "kad izpilda"},
"workspaceHeaderShort":function(d){return "Darba virsma: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};