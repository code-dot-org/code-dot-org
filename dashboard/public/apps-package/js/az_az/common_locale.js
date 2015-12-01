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
"and":function(d){return "və"},
"backToPreviousLevel":function(d){return "Əvvəlki mərhələyə qayıt"},
"blocklyMessage":function(d){return "\"Blockly\""},
"blocks":function(d){return "blok"},
"booleanFalse":function(d){return "yalan"},
"booleanTrue":function(d){return "doğru"},
"catActions":function(d){return "Əmrlər"},
"catColour":function(d){return "Rəng"},
"catLists":function(d){return "Siyahılar"},
"catLogic":function(d){return "Məntiq"},
"catLoops":function(d){return "Dövlər"},
"catMath":function(d){return "Riyaziyyat"},
"catProcedures":function(d){return "Funksiyalar"},
"catText":function(d){return "mətn"},
"catVariables":function(d){return "Dəyişənlər"},
"clearPuzzle":function(d){return "Yenidən başla"},
"clearPuzzleConfirm":function(d){return "Bu, tapmacanı ilkin vəziyyətinə qaytaracaq və əlavə etdiyiniz, dəyişdiyiniz bütün blokları siləcək."},
"clearPuzzleConfirmHeader":function(d){return "Yenidən başlamaq istədiyinizə əminsiniz?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Generasiya olunmuş \"JavaScript\" kodunu nəzərdən keçirin."},
"completedWithoutRecommendedBlock":function(d){return "Təbriklər! Siz "+common_locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız (lakin daha güclü kod yazmaq üçün başqa bir blokdan istifadə edə bilərdiniz)."},
"continue":function(d){return "Davam et"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "İmtina et"},
"dialogOK":function(d){return "Oldu"},
"directionEastLetter":function(d){return "Şərq"},
"directionNorthLetter":function(d){return "Şimal"},
"directionSouthLetter":function(d){return "Cənub"},
"directionWestLetter":function(d){return "Qərb"},
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
"dropletBlock_mathRandom_description":function(d){return "Sıfırdan (0 daxil olmaqla) birə qədər (1 daxil olmamaqla) təsadüfi bir ədədi qaytarır"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "Minimum, yəni ən kiçik ədəd alındı"},
"dropletBlock_randomNumber_param1":function(d){return "maks"},
"dropletBlock_randomNumber_param1_description":function(d){return "Maksimum, yəni ən böyük ədəd alındı"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "qaytar"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return common_locale.v(d,"name")+" funksiyasının boş qalmış girişi var."},
"emptyBlockInVariable":function(d){return common_locale.v(d,"name")+" dəyişəninin boş qalmış girişi var."},
"emptyBlocksErrorMsg":function(d){return "\"Təkrar\" və ya \"Əgər\" blokları işləsin deyə içərisində başqa blokların olmağı lazımdır. Əmin olun ki, daxili blokun konteyner blokun içərisinə düz yerləşir."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "The function block needs to have other blocks inside it to work."},
"emptyFunctionalBlock":function(d){return "You have a block with an unfilled input."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "son"},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorQuestionMarksInNumberField":function(d){return "\"???\" əvəzinə bir qiymət yazmağı sınayın."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "Sizin qoşulmamış bloklarınız var."},
"extraTopBlocksWhenRun":function(d){return "Sizin qoşulmamış bloklarınız var. Onları \"icra etdikdə\" blokuna qoşmaq istəmirsiniz?"},
"finalStage":function(d){return "Təbriklər! Siz son mərhələni başa vurdunuz."},
"finalStageTrophies":function(d){return "Təbriklər! Siz sonuncu mərhələni tamamladınız və "+common_locale.p(d,"numTrophies",0,"en",{"one":"bir kubok","other":common_locale.n(d,"numTrophies")+" kubok"})+" qazandınız."},
"finish":function(d){return "Son"},
"generatedCodeInfo":function(d){return "Even top universities teach block-based coding (e.g., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"},
"hashError":function(d){return "Təəssüf ki, '%1' yaddaşa verilmiş heç bir proqramla uyğunlaşmır."},
"help":function(d){return "Kömək"},
"hideToolbox":function(d){return "(Gizlət)"},
"hintHeader":function(d){return "Məsləhət belədir:"},
"hintRequest":function(d){return "Məsləhətə baxın"},
"hintTitle":function(d){return "Məsləhət:"},
"ignore":function(d){return "Nəzərə alma"},
"infinity":function(d){return "Sonsuzluq"},
"jump":function(d){return "atıl"},
"keepPlaying":function(d){return "Oyuna davam edin"},
"levelIncompleteError":function(d){return "Siz bütün lazım olan bloklardan istifadə edirsiniz amma səhv formada."},
"listVariable":function(d){return "siyahı"},
"makeYourOwnFlappy":function(d){return "Öz qanadlı oyununuzu düzəldin"},
"missingRecommendedBlocksErrorMsg":function(d){return "Not quite. Try using a block you aren’t using yet."},
"missingRequiredBlocksErrorMsg":function(d){return "Not quite. You have to use a block you aren’t using yet."},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"nextLevel":function(d){return "Təbriklər! Siz "+common_locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız."},
"nextLevelTrophies":function(d){return "Təbriklər! Siz "+common_locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız və "+common_locale.p(d,"numTrophies",0,"en",{"one":"bir kubok","other":common_locale.n(d,"numTrophies")+" kubok"})+" qazandınız."},
"nextPuzzle":function(d){return "Növbəti tapmaca"},
"nextStage":function(d){return "Təbriklər! Siz "+common_locale.v(d,"stageName")+" mərhələsini tamamladınız."},
"nextStageTrophies":function(d){return "Təbriklər! Siz "+common_locale.v(d,"stageName")+" mərhələsini tamamladınız və "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" qazandınız."},
"numBlocksNeeded":function(d){return "Təbriklər! Siz "+common_locale.v(d,"puzzleNumber")+" nömrəli tapmacanı tamamladınız. (Amma siz cəmi "+common_locale.p(d,"numBlocks",0,"en",{"one":"1 blokdan","other":common_locale.n(d,"numBlocks")+" blokdan"})+" istifadə edə bilərdiniz)"},
"numLinesOfCodeWritten":function(d){return "Siz indicə "+common_locale.p(d,"numLines",0,"en",{"one":"bir sətir","other":common_locale.n(d,"numLines")+" sətir"})+" kod yazdınız!"},
"openWorkspace":function(d){return "Bu necə işləyir?"},
"orientationLock":function(d){return "Cihaz nizamlamalarında səmt kilidini söndürün."},
"play":function(d){return "səsləndir"},
"print":function(d){return "çap"},
"puzzleTitle":function(d){return "Tapmaca "+common_locale.v(d,"puzzle_number")+" (cəmi "+common_locale.v(d,"stage_total")+" tapmaca var)"},
"readonlyWorkspaceHeader":function(d){return "Ancaq baxış: "},
"repeat":function(d){return "təkrar et"},
"resetProgram":function(d){return "Yenidən başla"},
"rotateText":function(d){return "Cihazınızı döndərin."},
"runProgram":function(d){return "İcra et"},
"runTooltip":function(d){return "İş sahəsindəki blokların təsvir etdiyi proqramı icra et."},
"runtimeErrorMsg":function(d){return "Proqramınızın icrası uğurlu olmadı. Zəhmət olmazsa, "+common_locale.v(d,"lineNumber")+" nömrəli sətri pozun və bir daha cəhd edin."},
"saveToGallery":function(d){return "Qalereyada yadda saxla"},
"savedToGallery":function(d){return "Qalereyada yadda saxlandı!"},
"score":function(d){return "xal"},
"shareFailure":function(d){return "Bağışlayın, bu proqramı bölüşə bilmirik."},
"shareWarningsAge":function(d){return "Zəhmət olmazsa, aşağıda yaşınızı daxil edin və davam etmək üçün \"Oldu\"nu klikləyin."},
"shareWarningsMoreInfo":function(d){return "Daha ətraflı"},
"shareWarningsStoreData":function(d){return "This app built on Code Studio stores data that could be viewed by anyone with this sharing link, so be careful if you are asked to provide personal information."},
"showBlocksHeader":function(d){return "Blokları göstər"},
"showCodeHeader":function(d){return "Kodu göstər"},
"showGeneratedCode":function(d){return "Kodu göstər"},
"showTextHeader":function(d){return "Mətni göstər"},
"showToolbox":function(d){return "Alətlər qutusunu göstər"},
"showVersionsHeader":function(d){return "Versiya tarixçəsi"},
"signup":function(d){return "Giriş kursu üçün qeydiyyatdan keçin"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Göndər"},
"submitYourProject":function(d){return "Layihənizi göndərin"},
"submitYourProjectConfirm":function(d){return "Layihənizi göndərdikdən sonra ona düzəliş edə bilməzsiniz, əminsiniz?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Layihənizi geri çağırın"},
"unsubmitYourProjectConfirm":function(d){return "Layihənizi geri çağırmağınız göndərmə tarixini sıfırlayacaq, əminsiniz?"},
"subtitle":function(d){return "vizual proqramlaşdırma mühiti"},
"syntaxErrorMsg":function(d){return "Proqramınızda hərf səhvi var. Zəhmət olmazsa, "+common_locale.v(d,"lineNumber")+" nömrəli sətri pozun və bir daha cəhd edin."},
"textVariable":function(d){return "mətn"},
"toggleBlocksErrorMsg":function(d){return "Bloklar şəklində göstərilə bilməsi üçün əvvəl proqramınızdakı xətanı düzəltməyiniz lazımdır."},
"tooFewBlocksMsg":function(d){return "Siz bütün lazım olan blok növlərindən istifadə edirsiniz, amma bu tapmacanı tamamlamaq üçün daha çox blok növlərindən istifadə etməyə çalışın."},
"tooManyBlocksMsg":function(d){return "Bu tapmaca <x id='START_SPAN'/><x id='END_SPAN'/> blokla həll oluna bilər."},
"tooMuchWork":function(d){return "Siz mənə çox iş gördürdünüz! Təkrarlamaları azalda bilərsiniz?"},
"toolboxHeader":function(d){return "bloklar"},
"toolboxHeaderDroplet":function(d){return "Alətlər qutusu"},
"totalNumLinesOfCodeWritten":function(d){return "Ümumi cəm: "+common_locale.p(d,"numLines",0,"en",{"one":"1 sətir","other":common_locale.n(d,"numLines")+" sətir"})+" kod."},
"tryAgain":function(d){return "Bir daha cəhd edin"},
"tryBlocksBelowFeedback":function(d){return "Aşağıdakı bloklardan birini istifadə etməyə çalışın:"},
"tryHOC":function(d){return "Kod Saatında özünüzü sınayın"},
"unnamedFunction":function(d){return "Adı olmayan dəyişən və ya funksiyanız var. Hər şeyə bir təsviri ad verməyi unutmayın."},
"wantToLearn":function(d){return "Proqramlaşdırmağı öyrənmək istəyirsiniz?"},
"watchVideo":function(d){return "Videoya baxın"},
"when":function(d){return "nə zaman"},
"whenRun":function(d){return "icra etdikdə"},
"workspaceHeaderShort":function(d){return "iş sahəsi: "},
"copy":function(d){return "Copy"},
"sendToPhone":function(d){return "Send To Phone"}};