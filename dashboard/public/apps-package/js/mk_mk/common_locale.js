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
"and":function(d){return "и"},
"backToPreviousLevel":function(d){return "Врати се на претходно ниво"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "влока"},
"booleanFalse":function(d){return "погрешно"},
"booleanTrue":function(d){return "точно"},
"catActions":function(d){return "Акции"},
"catColour":function(d){return "Color"},
"catLists":function(d){return "Листи"},
"catLogic":function(d){return "Логика"},
"catLoops":function(d){return "Лупови"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "Променливи"},
"choosePrefix":function(d){return "Choose..."},
"clearPuzzle":function(d){return "Започни"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Дали сте сигурни дека сакате да започнете?"},
"codeMode":function(d){return "Код"},
"codeTooltip":function(d){return "Погледни го генерираниот JavaScript code."},
"completedWithoutRecommendedBlock":function(d){return "Честитки! Ти ја заврши задачката. ( Но би можеле да искористите различна коцка за појак код)"},
"continue":function(d){return "Продолжи"},
"copy":function(d){return "копирај"},
"debugConsoleHeader":function(d){return "Debug Console"},
"debugCommandsHeaderWhenOpen":function(d){return "Debug Commands"},
"debugCommandsHeaderWhenClosed":function(d){return "Show Debug Commands"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "дизајнирај"},
"dialogCancel":function(d){return "Откажи"},
"dialogOK":function(d){return "Во ред"},
"directionEastLetter":function(d){return "Исток"},
"directionNorthLetter":function(d){return "Север"},
"directionSouthLetter":function(d){return "Југ"},
"directionWestLetter":function(d){return "Запад"},
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
"dropletBlock_mathRandom_description":function(d){return "Returns a random number ranging from 0 (inclusive) up to but not including 1 (exclusive)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "математика.рандом()"},
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
"dropletBlock_randomNumber_param0":function(d){return "минимално"},
"dropletBlock_randomNumber_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_param1":function(d){return "максимално"},
"dropletBlock_randomNumber_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "врати"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlocksErrorMsg":function(d){return "На \"Повтори \" или \" Ако \" блокот треба да има и други блокови во него за  да работат. Бидете сигурни дека внатрешниот блок се вклопува правилно во внатрешноста на  блок."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "Функцијата блок треба да има и други блокови во  него за да работи."},
"emptyFunctionalBlock":function(d){return "You have a block with an unfilled input."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "Крај"},
"errorEmptyFunctionBlockModal":function(d){return "Мора да има блока во дефиниција на вашата функција. Притисни \"применувај\" и извлечи блока во зелениот блок."},
"errorIncompleteBlockInFunction":function(d){return "Притисни \"уредувај\" за да сте сигурни дека нема блока што фалат од дефиницијата на вашата функција."},
"errorParamInputUnattached":function(d){return "Запамтете да спојите блок со параметар во функцијоналниот блок во вашата работна површина."},
"errorQuestionMarksInNumberField":function(d){return "Обиди се да го размениш \"???\" со некоја вредноста."},
"errorRequiredParamsMissing":function(d){return "Создади параметар за вашата функција со притискување на \"уредувај\" и додавање на потребните параметри. Повлечи ги новите параметарски блока во дефиниција на вашата функција."},
"errorUnusedFunction":function(d){return "Вие создадовте функција али никогаш не ја употребивте на работната површина! Притиснете на \"Функции\" во кутијата со алатки и бидете сигурни дека ја употребувате во програмот."},
"errorUnusedParam":function(d){return "Вие дадовте параметарски блок али не го употребивте во дефиницијата. Бидете сигурни дека го употребивте параметарот со притискување на \"уредувај\" и со ставанје на параметарскиот блок во зелениот блок."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "Имате Неповрзани блокови. Дали мислевте да ѓи закачите на овие \"кога работи\" блок?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "Честитки! вие го коплетиравте финалното ниво."},
"finalStageTrophies":function(d){return "Честитки! Вие го комлетриавте финалното ниво и освоивте повеќе видови на трофеи "+common_locale.p(d,"numTrophies",0,"mk",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Крај"},
"generatedCodeInfo":function(d){return "Дури и најдобрите универзитети предаваат блок-базирано кодирање (на пример, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Но, под хауба, на блоковите ќе можат да бидат прикажани во JavaScript,кој во  светот е  најраспространетиот  јазик за кодирање:"},
"hashError":function(d){return "Извни ,'%1'не кореспондира со било кој зачуван програм."},
"help":function(d){return "Помош"},
"hideToolbox":function(d){return "(скриј)"},
"hintHeader":function(d){return "Еве еден совет :"},
"hintPrompt":function(d){return "Need help?"},
"hintRequest":function(d){return "Види тип"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"},
"hintTitle":function(d){return "Совет:"},
"ignore":function(d){return "Игнорирај"},
"infinity":function(d){return "Бесконечно"},
"jump":function(d){return "Рипај "},
"keepPlaying":function(d){return "Продолжи со играта"},
"levelIncompleteError":function(d){return "Вие ѓи користете  сите потребни видови на блокови, но не на вистински начин."},
"listVariable":function(d){return "листа"},
"makeYourOwnFlappy":function(d){return "Направете своја Flappy игра"},
"missingRecommendedBlocksErrorMsg":function(d){return "Not quite. Try using a block you aren’t using yet."},
"missingRequiredBlocksErrorMsg":function(d){return "Not quite. You have to use a block you aren’t using yet."},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"nextLevel":function(d){return "Честитки! Ти ја заврши загатка "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Честитки! Ти ја  заврши загатка "+common_locale.v(d,"puzzleNumber")+" и го освои "+common_locale.p(d,"numTrophies",0,"mk",{"one":"трофеј","other":common_locale.n(d,"numTrophies")+" трофеи"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Честитки! Ти се коплетираше "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Честитки! Ти ги заврши  "+common_locale.v(d,"stageName")+" и освои "+common_locale.p(d,"numTrophies",0,"mk",{"one":"трофеј","other":common_locale.n(d,"numTrophies")+" трофеи"})+"."},
"numBlocksNeeded":function(d){return "Честитки! Ти ја заврши Загатката  "+common_locale.v(d,"puzzleNumber")+". (Сепак, ти можеше да ги искористш "+common_locale.p(d,"numBlocks",0,"mk",{"one":"1 блок","other":common_locale.n(d,"numBlocks")+" блокови"})+".)"},
"numLinesOfCodeWritten":function(d){return "Само што напиша "+common_locale.p(d,"numLines",0,"mk",{"one":"1 Линија","other":common_locale.n(d,"numLines")+" Линии"})+" на Кодови!"},
"openWorkspace":function(d){return "Како работи"},
"orientationLock":function(d){return "Исклучување ориентација заклучување во прилагодувања на уредот."},
"pause":function(d){return "Break"},
"play":function(d){return "Пушти"},
"print":function(d){return "Печати"},
"puzzleTitle":function(d){return "Загатка "+common_locale.v(d,"puzzle_number")+" на "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Види само: "},
"recommendedBlockContextualHintTitle":function(d){return "Try using a block like this to solve the puzzle."},
"repeat":function(d){return "повтори"},
"resetProgram":function(d){return "Од почеток ,Ресетирање"},
"rotateText":function(d){return "Ротација на Вашиот уред."},
"runProgram":function(d){return "Трчај"},
"runTooltip":function(d){return "Стартувај  ја програмата која е  дефинирана од страна на блоковите во просторот."},
"runtimeErrorMsg":function(d){return "Your program did not run successfully. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"saveToGallery":function(d){return "Зачувај во галерија"},
"savedToGallery":function(d){return "Зачувано во галерија!"},
"score":function(d){return "Резултат"},
"sendToPhone":function(d){return "Прати на телефон"},
"shareFailure":function(d){return "Извинете, неможеме да го споделиме овој програм."},
"shareWarningsAge":function(d){return "Please provide your age below and click OK to continue."},
"shareWarningsMoreInfo":function(d){return "Повеќе информации"},
"shareWarningsStoreData":function(d){return "This app built on Code Studio stores data that could be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information."},
"showBlocksHeader":function(d){return "Покажи ги Блоковите"},
"showCodeHeader":function(d){return "Прикажи го кодот"},
"showGeneratedCode":function(d){return "Покажи го кодот"},
"showTextHeader":function(d){return "Прикажи текст"},
"showToolbox":function(d){return "Show Toolbox"},
"showVersionsHeader":function(d){return "Version History"},
"signup":function(d){return "Зачлени се за го посетиш воведувачкиот курс"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"stringEquals":function(d){return "низа=?"},
"submit":function(d){return "Submit"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Unsubmit your project"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting your project will reset the submitted date, really unsubmit?"},
"subtitle":function(d){return "Визуелна средина за рограмирање"},
"syntaxErrorMsg":function(d){return "Your program contains a typo. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Мора да поправите грешка во програмот пред да може да се претстави како блока."},
"tooFewBlocksMsg":function(d){return "Ти ги користиш сите потребни видови на блокови но ,обидисе со други  видови на блокови  за да ја завршиш загатката."},
"tooManyBlocksMsg":function(d){return "Оваа загатка може да се реши со  <x id='START_SPAN'/><x id='END_SPAN'/> блокови."},
"tooMuchWork":function(d){return "Ти ме натера на многу работа! Ќе можеш ли да се обидеш да го пофториш неколку пати?"},
"toolboxHeader":function(d){return "Блокови"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Севкупно време: "+common_locale.p(d,"numLines",0,"mk",{"one":"1 линија","other":common_locale.n(d,"numLines")+" линии"})+" на кодови."},
"tryAgain":function(d){return "Обиди се повторно"},
"tryBlocksBelowFeedback":function(d){return "Try using one of the blocks below:"},
"tryHOC":function(d){return "Пробај еден час кодирање"},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "Сакаш да научиш да бидеш коде програмер?"},
"watchVideo":function(d){return "Погледни го видеото"},
"when":function(d){return "Кога"},
"whenRun":function(d){return "Кога трча"},
"workspaceHeaderShort":function(d){return "Работна површина: "}};