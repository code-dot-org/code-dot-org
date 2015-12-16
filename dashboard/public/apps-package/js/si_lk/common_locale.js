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
"and":function(d){return "සහ"},
"backToPreviousLevel":function(d){return "පෙර මට්ටම වෙත නැවත යන්න"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "බ්ලොක්ස්"},
"booleanFalse":function(d){return "false"},
"booleanTrue":function(d){return "සත්‍ය"},
"catActions":function(d){return "ක්‍රියාවන්"},
"catColour":function(d){return "පාට"},
"catLists":function(d){return "ලැයිස්තු"},
"catLogic":function(d){return "තර්කය"},
"catLoops":function(d){return "ලූපයන්"},
"catMath":function(d){return "ගණිත"},
"catProcedures":function(d){return "ශ්‍රිතයන්"},
"catText":function(d){return "පෙළ"},
"catVariables":function(d){return "විචල්‍යන්"},
"clearPuzzle":function(d){return "මුල සිට නැවත අරඹන්න"},
"clearPuzzleConfirm":function(d){return "මෙමගින් ප්‍රෙහෙලිකාව යලි පිහිටුවන අතර ඔබ දැනට ඇතුලත් හෝ වෙනස් කල බ්ලොක්ස් සියල්ල මකා දැමේ."},
"clearPuzzleConfirmHeader":function(d){return "මුල සිට පටන් ගැනීම ඔබ තහවුරු කරනවද?"},
"codeMode":function(d){return "කේතය"},
"codeTooltip":function(d){return "ජනිත වූ JavaScript කේතය බලන්න."},
"completedWithoutRecommendedBlock":function(d){return "ඔබ ප්‍රෙහෙලිකාව "+common_locale.v(d,"puzzleNumber")+" සම්පූර්ණ කලා.... සුභ පැතුම්! (නමුත් ප්‍රභල කේතයක් සඳහා වෙනත් බ්ලොක් එකක් භාවිතා කරන්න පුලුවන්)"},
"continue":function(d){return "ඉදිරියට යන්න"},
"copy":function(d){return "පිටපත් කරන්න"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "නිරමාණය"},
"dialogCancel":function(d){return "අවලංගු කරන්න"},
"dialogOK":function(d){return "හරි"},
"directionEastLetter":function(d){return "නැ"},
"directionNorthLetter":function(d){return "උ"},
"directionSouthLetter":function(d){return "ද"},
"directionWestLetter":function(d){return "බ"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Returns true only when both expressions are true and false otherwise"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to a previously declared variable."},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters."},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a user defined function that takes one or more parameters."},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Declares a variable and assigns it to an array with the given initial values"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Declares a variable with the given name after 'var', and assigns it to the value on the right side of the expression"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Declares that the code will now use a variable and assign it an initial value provided by the user"},
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
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name."},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test whether two values are equal. Returns true if the value on the left-hand side of the expression equals the value on the right-hand side of the expression, and false otherwise"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Creates a loop consisting of an initialization expression, a conditional expression, an incrementing expression, and a block of statements executed for each iteration of the loop"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Gives a name to a set of parameter driven actions for the computer to perform."},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Define a function with parameters"},
"dropletBlock_functionParams_none_description":function(d){return "Gives a name to a set of actions you want the computer to perform."},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Define a function"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Tests whether a number is greater than another number. Returns true if the value on the left-hand side of the expression is strictly greater than the value on the right-hand side of the expression"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Executes a block of statements if the specified condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Executes a block of statements if the specified condition is true; otherwise, the block of statements in the else clause are executed"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Tests whether two values are not equal. Returns true if the value on the left-hand side of the expression does not equal the value on the right-hand side of the expression"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Tests whether a value is less than another value. Returns true if the value on the left-hand side of the expression is strictly less than the value on the right-hand side of the expression"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Takes the absolute value of x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Takes the maximum value among one or more values n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Takes the minimum value among one or more values n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "0(ඇතුලුව) වේ සිට ඉහලට අහඹු සංඛ්‍යාවක් return කරන්න නමුත් 1(ඇතුලත් නැති) ඇතුලත් නොවිය යුතුය"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Rounds a number to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Returns false if the expression can be converted to true; otherwise, returns true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "NOT boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Returns true when either expression is true and false otherwise"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "අවම"},
"dropletBlock_randomNumber_param0_description":function(d){return "ආපසු පැමිණි අවම සංක්‍යාව"},
"dropletBlock_randomNumber_param1":function(d){return "උපරිම"},
"dropletBlock_randomNumber_param1_description":function(d){return "නැවත පැමිණි වැඩිතම සංක්‍යාව"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "return"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Creates a loop consisting of a conditional expression and a block of statements executed for each iteration of the loop. The loop continues to execute as long as the condition evaluates to true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return common_locale.v(d,"name")+" ශ්‍රිතයේ ආදානයක් පුරවා නොමැත."},
"emptyBlockInVariable":function(d){return common_locale.v(d,"name")+" විචල්‍යයේ ආදානයක් සම්පුර්ණ කර නොමැත."},
"emptyBlocksErrorMsg":function(d){return "The \"Repeat\" or \"If\" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least two examples in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "The function block needs to have other blocks inside it to work."},
"emptyFunctionalBlock":function(d){return "ඔබ සතුව අසම්පූර්ණ ආදානයක් සහිත බ්ලොක් එකක් ඇත."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "අවසානය"},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "ඔබසතුව සම්බන්ද නොකරන ලද බ්ලොක්ස් ඇත."},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "සුභ පැතුම් ! ඔබ අවසාන අදියර අවසන් කලා,"},
"finalStageTrophies":function(d){return "සුභ පැතුම්! ඔබ අවසාන අදියර සම්පූර්ණකර "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" ජයග්‍රහණය කරනලදී."},
"finish":function(d){return "අවසන් කරන්න"},
"generatedCodeInfo":function(d){return "ලොව ඉහල පෙලේ විශ්ව විද්‍යාලවල පවා බ්ලොක් ආශ්‍රිත වැඩසටහන් ක්‍රමලේඛ සම්පාදනය කරනු අයුරු උගන්වයි (උදා:, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). නමුත් ඔබට ක්‍රමලේඛයේ කේතය නිරීක්ෂණය කල හැකි අතර එම කේත ලොව වැඩිවශයෙන් භාවිතාවන පරිගණක ක්‍රමලේඛභාෂාවක් වන JavaScript වලින් සමන්විතවේ."},
"hashError":function(d){return "Sorry, '%1' doesn't correspond with any saved program."},
"help":function(d){return "උදව්"},
"hideToolbox":function(d){return "(සඟවන්න)"},
"hintHeader":function(d){return "මෙන්න ඉඟියක්:"},
"hintRequest":function(d){return "ඉඟිය බලන්න"},
"hintTitle":function(d){return "ඉඟිය:"},
"ignore":function(d){return "නොසලකා හරින්න"},
"infinity":function(d){return "අනන්තය"},
"jump":function(d){return "පනින්න"},
"keepPlaying":function(d){return "දිගටම සෙල්ලම් කරන්න"},
"levelIncompleteError":function(d){return "ඔබ අවශ්‍ය සියලුම වර්ගයේ බ්ලොක්ස් භාවිතා කරයි නමුත් හරි ආකාරව නොවේ."},
"listVariable":function(d){return "ලැයිස්තුව"},
"makeYourOwnFlappy":function(d){return "ඔබේම Flappy Game එකක් නිර්මාණය කරන්න"},
"missingRecommendedBlocksErrorMsg":function(d){return "Not quite. Try using a block you aren’t using yet."},
"missingRequiredBlocksErrorMsg":function(d){return "Not quite. You have to use a block you aren’t using yet."},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"nextLevel":function(d){return "සුභ පැතුම්! ඔබ "+common_locale.v(d,"puzzleNumber")+" ප්‍රහෙලිකාව සම්පූර්ණ කරන ලදී."},
"nextLevelTrophies":function(d){return "සුභ පැතුම්! ඔබ ප්‍රහෙලිකාව "+common_locale.v(d,"puzzleNumber")+" සම්පූර්ණ කර "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" ජයග්‍රහණය කරනලදී."},
"nextPuzzle":function(d){return "ඊලඟ ප්‍රෙහෙලිකාව"},
"nextStage":function(d){return "සුභ පැතුම්! ඔබ අදියර "+common_locale.v(d,"stageName")+" සම්පූර්ණ කරන ලදී."},
"nextStageTrophies":function(d){return "සුභ පැතුම්! ඔබ අදියර "+common_locale.v(d,"stageName")+" සම්පූර්ණ කර "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" ජයග්‍රහණය කරනලදී."},
"numBlocksNeeded":function(d){return "සුභ පැතුම්! ඔබ ප්‍රහෙලිකාව "+common_locale.v(d,"puzzleNumber")+" සම්පූර්ණ කරන ලදී. (නමුත් ඔබට හැකිවූයේ"+common_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+"භාවිතයට පමණි)"},
"numLinesOfCodeWritten":function(d){return "ඔබ විසින් දැන් වැඩසටහන් කේත "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" ප්‍රමාණයක් ලියන ලදී!"},
"openWorkspace":function(d){return "කොහොමද ඒක වැඩකරන්නේ"},
"orientationLock":function(d){return "උපාංගයේ අනුගතවීමේ අගුල ක්‍රියා විරහිත කරන්න."},
"play":function(d){return "play"},
"print":function(d){return "මුද්‍රණය කරන්න"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" of "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "නැරඹීමට පමණි: "},
"repeat":function(d){return "repeat"},
"resetProgram":function(d){return "යලි පිහිටුවන්න"},
"rotateText":function(d){return "ඔබගේ උපකරණය භ්‍රමණය කරන්න."},
"runProgram":function(d){return "Run"},
"runTooltip":function(d){return "වැඩතලයේ අර්ථ දක්වා ඇති පරිදි වැඩසටහන ධාවනය කරන්න."},
"runtimeErrorMsg":function(d){return "ඔබේ වැඩ සටහන සාර්ථකව ධාවනය නොවේ. පේලි අංක "+common_locale.v(d,"lineNumber")+" ඉවත්කර නැවත උත්සාහ කරන්න."},
"saveToGallery":function(d){return "ගැලරියට සුරකින්න"},
"savedToGallery":function(d){return "ගැලරියට සුරකින් ලදී!"},
"score":function(d){return "score"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "සමාවන්න, අපට මේ වැඩසටහන ශෙයා කිරීමට නොහැක."},
"shareWarningsAge":function(d){return "ඔබගේ වයස ලබාදී OK බොත්තම ක්ලික් කරන්න."},
"shareWarningsMoreInfo":function(d){return "වැඩි විස්තර"},
"shareWarningsStoreData":function(d){return "This app built on Code Studio stores data that could be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information."},
"showBlocksHeader":function(d){return "බ්ලොක්ස් පෙන්නන්න"},
"showCodeHeader":function(d){return "කේතය පෙන්වන්න"},
"showGeneratedCode":function(d){return "කේතය පෙන්වන්න"},
"showTextHeader":function(d){return "වාක්‍ය පෙන්නන්න"},
"showToolbox":function(d){return "මෙවලම් පෙට්ටිය පෙන්නන්න"},
"showVersionsHeader":function(d){return "වෙළුමේ ඉතිහාසය"},
"signup":function(d){return "හඳුන්වාදීමේ පාඨමාලාවට ලියාපදිංචි වන්න"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "යොමුකරන්න"},
"submitYourProject":function(d){return "ඔබේ ව්‍යාපෘතිය යොමු කරන්න"},
"submitYourProjectConfirm":function(d){return "ඔබේ ව්‍යාපෘතිය යොමු කිරීමෙන් පසු නැවත සංස්කරණය කල නොහැක, ඔබ ව්‍යාපෘතිය යොමුකරන්නේද?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "ව්‍යාපෘතිය යොමුකිරීම ඉවත්කරන්න"},
"unsubmitYourProjectConfirm":function(d){return "යොමු කිරීම ඉවත් කිරීමෙන් ව්‍යාපෘතිය යළි පිහිටුවනු ඇත, යොමු කිරීම ඉවත් කරන බවට තහවුරු කරන්නේද?"},
"subtitle":function(d){return "දෘශ්‍යමාන වැඩ සටහන් සම්පාදක පරිසරයකි"},
"syntaxErrorMsg":function(d){return "Your program contains a typo. Please remove line "+common_locale.v(d,"lineNumber")+" and try again."},
"textVariable":function(d){return "පෙළ"},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"tooFewBlocksMsg":function(d){return "You are using all of the necessary types of blocks, but try using more of these types of blocks to complete this puzzle."},
"tooManyBlocksMsg":function(d){return "මෙම ප්‍රෙහෙලිකාව <x id='START_SPAN'/><x id='END_SPAN'/> බ්ලොක්ස් භාවිත කරමින් විසඳිය හැකිය."},
"tooMuchWork":function(d){return "You made me do a lot of work!  Could you try repeating fewer times?"},
"toolboxHeader":function(d){return "Blocks"},
"toolboxHeaderDroplet":function(d){return "මෙවලම්පෙට්ටිය"},
"totalNumLinesOfCodeWritten":function(d){return "All-time total: "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" of code."},
"tryAgain":function(d){return "නැවත උත්සාහ කරන්න"},
"tryBlocksBelowFeedback":function(d){return "පහත ඇති බ්ලොක්ස් වලින් එකකක් භාවිතා කරන්න:"},
"tryHOC":function(d){return "Hour of Code උත්සාහ කරන්න"},
"unnamedFunction":function(d){return "ඔබේ යම්කිසි විචල්‍යයක් හෝ ශ්‍රිතයක් සඳහා නාමයක් ලබාදී නොමැත. සෑම එකකටම නාමයක් ලබාදීමට අමතක නොකරන්න."},
"wantToLearn":function(d){return "Code කරන්න ඉගෙනගන්න කැමතිද?"},
"watchVideo":function(d){return "වීඩියෝව නරඹන්න"},
"when":function(d){return "when"},
"whenRun":function(d){return "when run"},
"workspaceHeaderShort":function(d){return "වැඩ අවකාශය: "},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};