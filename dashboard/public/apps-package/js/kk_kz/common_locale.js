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
"and":function(d){return "және"},
"backToPreviousLevel":function(d){return "Алдыңғы деңгейге қайта оралу"},
"blocklyMessage":function(d){return "Блокты"},
"blocks":function(d){return "блоктар"},
"booleanFalse":function(d){return "Жалған"},
"booleanTrue":function(d){return "дұрыс"},
"catActions":function(d){return "Іс-әрекеттер"},
"catColour":function(d){return "Түс"},
"catLists":function(d){return "Тізімдер"},
"catLogic":function(d){return "Логика"},
"catLoops":function(d){return "Ілмек"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "Мәтін"},
"catVariables":function(d){return "Айнымалылар"},
"clearPuzzle":function(d){return "Басынан бастау"},
"clearPuzzleConfirm":function(d){return "Бұл сіз қосқан немесе өзгерткен барлық блоктарды жою арқылы бас қатырғышта бастапқы күйіне қайта ысырады"},
"clearPuzzleConfirmHeader":function(d){return "Сіз басынан бастауға сенімдісіз бе?"},
"codeMode":function(d){return "Код"},
"codeTooltip":function(d){return "Генерацияланған JavaScript кодын көру."},
"completedWithoutRecommendedBlock":function(d){return "Құттықтаймыз! Сіз соңғы "+common_locale.v(d,"puzzleNumber")+" кезңді аяқтадыңыз"},
"continue":function(d){return "Жалғастыру"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Дизайн"},
"dialogCancel":function(d){return "Болдырмау"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "Ш"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "О"},
"directionWestLetter":function(d){return "Б"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Returns true only when both expressions are true and false otherwise"},
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
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
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
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Define a function with parameters"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
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
"dropletBlock_mathRandom_description":function(d){return "Нөл мен максимал мәндерді қоса есептегенде аралықта жатқан кездейсоқ шаманы қайтарады"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "мин"},
"dropletBlock_randomNumber_param0_description":function(d){return "Минимум санды қайтарады"},
"dropletBlock_randomNumber_param1":function(d){return "макс"},
"dropletBlock_randomNumber_param1_description":function(d){return "Максимум санды қайтарады"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "Қайтару"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Creates a loop consisting of a conditional expression and a block of statements executed for each iteration of the loop. The loop continues to execute as long as the condition evaluates to true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return common_locale.v(d,"name")+" функциясында толтырылмаған кіріс мәні бар."},
"emptyBlockInVariable":function(d){return common_locale.v(d,"name")+" айнымалысында толтырылмаған кіріс мәні бар."},
"emptyBlocksErrorMsg":function(d){return "\"Қайталау\" немесе \"Егер\" блогы, блок ішінде басқада блокар болуы қажет. Ішкі блок контейнердің ішінде дұрыс орналастырылғанын тексеріңіз"},
"emptyExampleBlockErrorMsg":function(d){return common_locale.v(d,"functionName")+" функциясында сізде кем дегенде екі мысал болуы қажет. Әр бір мысалдың шақырылуы және нәтижесі болатындығына көз жеткізіңіз."},
"emptyFunctionBlocksErrorMsg":function(d){return "Қызмет атқарушы блогы жұмыс жасауы үшін ішінде басқа да блоктар болуы қажет"},
"emptyFunctionalBlock":function(d){return "Сізде толтырылмаған кіріс міні бар блок бар."},
"emptyTopLevelBlock":function(d){return "Жүктеуге қажет блок жоқ. "+common_locale.v(d,"topLevelBlockName")+" блогын тіркуіңіз қажет."},
"end":function(d){return "соңы"},
"errorEmptyFunctionBlockModal":function(d){return "Функция анықтамасының ішінде блоктар болуы қажет. \"Өңдеу\" басыңыз және жасыл блок ішіне блоктарды алып келіңіз."},
"errorIncompleteBlockInFunction":function(d){return "Функция анықтамасының ішінде жетіспейтін блоктардың бар немесе жоқтығын тексеру үшін \"Өңдеу\" басыңыз."},
"errorParamInputUnattached":function(d){return "Жұмыс аумағындағы қызмет атқарушы блоктағы әрбір кіріс параметрлеріне блок қосуды ұмытпаңыз"},
"errorQuestionMarksInNumberField":function(d){return "\"???\" мәнмен орын ауыстыруға тырысыңыз."},
"errorRequiredParamsMissing":function(d){return "\"Өңдеу\" басу арқылы сіздің функцияңых үшін параметр құру. Параметрлердің жаңа блоктарын функция анықтамасына алып келіңіз."},
"errorUnusedFunction":function(d){return "Сіз функцияны құрдыңыз, алайда өзіңіздің жұмыс аумағыңызда қолданбадыңыз! Өзіңіздің бағдарламаңызда аталған функцияны қолданып отырғаныңызда құрал саймандар тақташасындағы \"Функциялар\" батырмасын басу арқылы тексеріңіз."},
"errorUnusedParam":function(d){return "Сіз параметрлер блогын қостыңыз, алайда анықтамада қолданбадыңыз. Өзіңіздің параметрлеріңізді қолданып отырғаныңызға басу арқылы және жасыл блок ішіндегі параметрлер блогындағы орналасуын тексеру арқылы көз жеткізіңіз."},
"exampleErrorMessage":function(d){return common_locale.v(d,"functionName")+" функциясында реттеуді қажет ететін бір немесе бірнеше мысал бар. Сіздің анықтамаларыңызға сай келетіндігіне көз жеткізіп сұраққа жауап беріңіз."},
"examplesFailedOnClose":function(d){return "Сіздің бір немесе бірнеше мысылдарыңыз өз анықтамаларына сәйкес келмейді, өз мысалдарыңызды жабуға дейін тексеріп аллыңыз"},
"extraTopBlocks":function(d){return "Сізде бекітілмеген блоктар бар."},
"extraTopBlocksWhenRun":function(d){return "Сізде бекітілмеген блоктар бар.Сіз оны \"Жүктелу\"кезінде орындалатын блокка тіркегіңіз келеді ме?"},
"finalStage":function(d){return "Құттықтаймыз! Сіз соңғы кезңді аяқтадыңыз."},
"finalStageTrophies":function(d){return "Құттықтаймыз! Сіз соңғы кезеңді аяқтадыңыз және "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+". ұтып алдыңыз."},
"finish":function(d){return "Аяқтау"},
"generatedCodeInfo":function(d){return "Тіпті ең жақсы университтердің өзі кодтауды блоктау негізінде түсіндіреді(мысалы, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Алайда сіз жинақтаған блоктарды әдемде кеңінен қолданылатын JavaScript бағдарламалау тілінде де көрсетуге болады."},
"hashError":function(d){return "Кешіріңіз, '%1' кез келген сақталған бағдарламаға сай келмейді."},
"help":function(d){return "Көмек"},
"hideToolbox":function(d){return "(Жасыру)"},
"hintHeader":function(d){return "Кенес мұнда:"},
"hintRequest":function(d){return "Кеңесті көру:"},
"hintTitle":function(d){return "Кеңес:"},
"ignore":function(d){return "Ескермеу"},
"infinity":function(d){return "Шексіздік"},
"jump":function(d){return "секіру"},
"keepPlaying":function(d){return "Ойынауды жалғастыр"},
"levelIncompleteError":function(d){return "Сіз барлық блок типтерін қолданудасыз, бірақ қате бағытта"},
"listVariable":function(d){return "тізім"},
"makeYourOwnFlappy":function(d){return "Өзіңіздің жеке Flappy Game жасаңыз"},
"missingRecommendedBlocksErrorMsg":function(d){return "Дұрыс емес. Пайдаланбаған блокты қолданып көріңіз."},
"missingRequiredBlocksErrorMsg":function(d){return "Дұрыс емес. Пайдаланбаған блокты қолдануыңыз керек."},
"nestedForSameVariable":function(d){return "Сіз бір айнымалыны екі немесе одан да көп циклдардың ішінде бір айнымалыны қолданып отырсыз. Тұрып қалмас үшін айталанбайтын айнымалылар аттарын қолданыңыз"},
"nextLevel":function(d){return "Құттықтаймыз!  "+common_locale.v(d,"puzzleNumber")+" бас қатырғышты аяқтадыңыз."},
"nextLevelTrophies":function(d){return "Құттықтаймыз!  "+common_locale.v(d,"puzzleNumber")+" бас қатырғышты аяқтадыңыз және  "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" ұтып алдыңыз."},
"nextPuzzle":function(d){return "Келесі бас қатырғыщ"},
"nextStage":function(d){return "Құттықтаймыз!  Сіз "+common_locale.v(d,"stageName")+" аяқтадыңыз."},
"nextStageTrophies":function(d){return "Құттықтаймыз! Сіз "+common_locale.v(d,"stageName")+" аяқтадыңыз және "+common_locale.p(d,"numTrophies",0,"en",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" ұтып алдыңыз."},
"numBlocksNeeded":function(d){return "Құттықтаймыз! Сіз "+common_locale.v(d,"puzzleNumber")+" бас қатырғышты аяқтадыңыз. (Әйтседе сіз тек қана "+common_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" қолдануыңызға болар еді.)"},
"numLinesOfCodeWritten":function(d){return "Сіз қазір ғана кодтың "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" жаздыңыз!"},
"openWorkspace":function(d){return "Бұл қалай жұмыс жасайды"},
"orientationLock":function(d){return "Құрылғының бапталымынан бағдарды құрсалауды өшіріп тастаңыз."},
"play":function(d){return "ойнау"},
"print":function(d){return "Шығару"},
"puzzleTitle":function(d){return " "+common_locale.v(d,"stage_total")+"-тің "+common_locale.v(d,"puzzle_number")+" бас қатырғышы "},
"readonlyWorkspaceHeader":function(d){return "Тек қана көру: "},
"repeat":function(d){return "қайтала"},
"resetProgram":function(d){return "қалпына келтіру"},
"rotateText":function(d){return "Құрылғыны бұрыңыз"},
"runProgram":function(d){return "Қосу"},
"runTooltip":function(d){return "Жұмыс  орнындағы блоктармен анықталған бағдарламаны қосу"},
"runtimeErrorMsg":function(d){return "Сіздің программаңыз дұрыс орындалған жоқ. "+common_locale.v(d,"lineNumber")+" қатарын өшіріңіз және қайтадан байқап көріңіз."},
"saveToGallery":function(d){return "Галереяға сақтау"},
"savedToGallery":function(d){return "Галереяда сақталды!"},
"score":function(d){return "ұпай"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Өкінішке орай біз бұл бағдарламамен бөлісе алмаймыз."},
"shareWarningsAge":function(d){return "Жасыңызды еңгізіңіз және жалғастыру үшін OK түймесін басыңыз."},
"shareWarningsMoreInfo":function(d){return "Толығырақ ақпарат"},
"shareWarningsStoreData":function(d){return "Бұл бағдарлама Code Studio-да жасалған. Сақталған ақпарат сілтемесі бар кез келген адамға қол жетімді болады. Сондықтан, жеке ақпарат сұралган жағдайда мұқият болыңыз."},
"showBlocksHeader":function(d){return "Блоктарды көрсету"},
"showCodeHeader":function(d){return "Кодты көрсету"},
"showGeneratedCode":function(d){return "Кодты көрсету"},
"showTextHeader":function(d){return "Мәтінді көрсету"},
"showToolbox":function(d){return "Құрал-жабдықтарды көрсету"},
"showVersionsHeader":function(d){return "Нұсқа тарихы"},
"signup":function(d){return "Кіріспе курсқа жазылыңыз"},
"stringEquals":function(d){return "жол=?"},
"submit":function(d){return "Жіберу"},
"submitYourProject":function(d){return "Өз проектіңізді жіберіңіз"},
"submitYourProjectConfirm":function(d){return "Сіз өз проектіңізді жібергеннен кейін өзгерте алмайсыз, жіберуді растайсыз ба?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "Жобаңызды қайтару"},
"unsubmitYourProjectConfirm":function(d){return "Жобаңызды кері кайтарсаңыз, жоба ұсынылған күні қайта өзгереді, кері кайтару?"},
"subtitle":function(d){return "Визуальді бағдарламалу ортасы"},
"syntaxErrorMsg":function(d){return "Сіздің бағдарламанызда қате бар. "+common_locale.v(d,"lineNumber")+" қатарын өшіріңіз және қайтадан байқап көріңіз."},
"textVariable":function(d){return "мәтін"},
"toggleBlocksErrorMsg":function(d){return "Сіз өз бағдарламаңыздағы қателікті ол блок күйінде көрсетілгенге дейін түзетуіңіз қажет."},
"tooFewBlocksMsg":function(d){return "Сіз блоктардың барлық қажет типтерін қолданудасыз, бұл бас қатрығышты шешу үшін осы блок типтерін көбірек қолданып көріңіз."},
"tooManyBlocksMsg":function(d){return "Бұл бас қатрығыш <x id='START_SPAN'/><x id='END_SPAN'/> блогының көмегімен шығаруға болады."},
"tooMuchWork":function(d){return "Сіз мені көп жұмыс жасауға мәжбүрлеп отырсыз. Сіз аз рет қайталап көріңіз"},
"toolboxHeader":function(d){return "Блоктар"},
"toolboxHeaderDroplet":function(d){return "Құрал-жабдықтар"},
"totalNumLinesOfCodeWritten":function(d){return "Барлық уақытта жалпы  кодтың "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" "},
"tryAgain":function(d){return "Қайта көру"},
"tryBlocksBelowFeedback":function(d){return "Төмендегі блоктардың бірін пайдаланып көріңіз:"},
"tryHOC":function(d){return "Код Сағатын қолданып көріңіз"},
"unnamedFunction":function(d){return "Сіз аты көрстілмеген айнымалы немесе функция бар. Атын анықтауға мүмкіндік беретін барлық заттарды көрсетуді ұмытпаңыз."},
"wantToLearn":function(d){return "Бағдарламалуды үйренгіңіз келеді ме?"},
"watchVideo":function(d){return "Бейнематериалды көру"},
"when":function(d){return "кезде"},
"whenRun":function(d){return "қосу кезінде"},
"workspaceHeaderShort":function(d){return "Жұмыс аумағы: "}};