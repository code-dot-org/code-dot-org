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
"and":function(d){return "اور"},
"backToPreviousLevel":function(d){return "گزشتہ لیول پر واپس"},
"blocklyMessage":function(d){return "بلاکلی"},
"blocks":function(d){return "بلاکس"},
"booleanFalse":function(d){return "غلط"},
"booleanTrue":function(d){return "True"},
"catActions":function(d){return "ایکشنز"},
"catColour":function(d){return "رنگ بھریں"},
"catLists":function(d){return "فہرستیں"},
"catLogic":function(d){return "منطق"},
"catLoops":function(d){return "لوپس"},
"catMath":function(d){return "ریاضی"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "متن"},
"catVariables":function(d){return "متغیرات"},
"clearPuzzle":function(d){return "آغاز(اسٹارٹ اوور)"},
"clearPuzzleConfirm":function(d){return "یہ پزل کو اسٹارٹ اسٹیٹ پر دوبارہ ری-سیٹ کر دے گا اور اُن تمام بلاکس کو حذف کر دے گا جو کہ آپ نے اضافہ یا تبدیل کئے ہوں گے۔"},
"clearPuzzleConfirmHeader":function(d){return "کیا آپ یقینی طور پر دوبارہ شروع (اسٹارٹ اوور) کرنا چاہتے ہیں؟"},
"codeMode":function(d){return "ضابطہ کار(کوڈ)"},
"codeTooltip":function(d){return "تخلیق شدہ جاوا اسکرپٹ کوڈ دیکھیں۔"},
"completedWithoutRecommendedBlock":function(d){return "مبارک ہو! آپ نے پزل "+common_locale.v(d,"puzzleNumber")+" مکمل کر لیا ہے۔ (لیکن مضبوط کوڈ کے لیے آپ مختلف بلاک استعمال کرسکتے ہیں۔)"},
"continue":function(d){return "جاری رکھیے"},
"copy":function(d){return "کاپی"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "منصوبہ سازی"},
"dialogCancel":function(d){return "منسوخ کریں"},
"dialogOK":function(d){return "ٹھيک ہے"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
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
"dropletBlock_mathRandom_description":function(d){return "(بشمول) 0 سے لے کر کوئی بھی ایک بلاترتیب نمبر واپس کرتا ہے لیکن اس میں (بالخصوص) 1 شامل نہیں"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "میتھ ۔ رینڈم ()"},
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
"dropletBlock_randomNumber_param0":function(d){return "کم سے کم"},
"dropletBlock_randomNumber_param0_description":function(d){return "کم سے کم ریٹرنڈ نمبر"},
"dropletBlock_randomNumber_param1":function(d){return "زیادہ سے زیادہ"},
"dropletBlock_randomNumber_param1_description":function(d){return "زیادہ سے زیادہ ریٹرنڈ نمبر"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "واپس کرنا"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "فنکشن "+common_locale.v(d,"name")+" میں ایک اَن-فِلڈ اِن-پُٹ ہے۔"},
"emptyBlockInVariable":function(d){return "ویری-ایبل "+common_locale.v(d,"name")+" میں ایک اَن-فِلڈ اِن-پُٹ ہے۔"},
"emptyBlocksErrorMsg":function(d){return "\"ریپیٹ\" یا \"اِف\" بلاک کو کام کرنے کے لیے، اپنے اندر دیگر بلاکس کی ضرورت پڑے گی۔ خیال رکھیں حامل بلاک کے اندر اندرونی بلاک مناسب طور پر فِٹ بیٹھے۔\n \n"},
"emptyExampleBlockErrorMsg":function(d){return "فنکشن "+common_locale.v(d,"functionName")+" میں آپ کو کم از کم دو مثالوں کی ضرورت پڑے گی۔ ہر مثال میں ایک کال اور ایک ریزلٹ کی موجودگی یقینی بنائیں۔"},
"emptyFunctionBlocksErrorMsg":function(d){return "فنکشن بلاک کو کام کرنے کے لیے اس کے اندر مزید بلاکس کی ضرورت پڑے گی۔"},
"emptyFunctionalBlock":function(d){return "آپ کے بلاک یں ایک اَن-فلڈ اِن-پُٹ ہے۔"},
"emptyTopLevelBlock":function(d){return "رَن کرنے کیلے وہاں کوئی بلاکس نہیں ہے۔ "+common_locale.v(d,"topLevelBlockName")+" بلاک سے آپ کو لازماً کوئی ایک بلاک منسلک کرنا ہوگا۔"},
"end":function(d){return "اختتام"},
"errorEmptyFunctionBlockModal":function(d){return "آپ کے فنکشن ڈیفینیشن کے اندر بلاکس کی ضرورت ہوگی۔ \"ایڈٹ\" پر کلک کریں اور گرین بلاک میں اپنا بلاک ڈریگ کریں۔"},
"errorIncompleteBlockInFunction":function(d){return "\"ایڈٹ\" پر کلک کریں تاکہ یقینی اطمینان ہوجائے کہ آپ کے فنکشن ڈیفینیشن کے اندر کوئی بھی متعلقہ بلاکس لاپتہ نہیں ہیں۔"},
"errorParamInputUnattached":function(d){return "اپنی ورک اسپیس میں فنکشن بلاک پر ہر ایک پیرامیٹر اِن-پُٹ کے لیے ایک بلاک اٹیچ کرنا یاد رکھیں۔"},
"errorQuestionMarksInNumberField":function(d){return "\"???\" کو کسی ویلیو سے تبدیل کرنے کی کوشش کریں۔"},
"errorRequiredParamsMissing":function(d){return "\"ایڈٹ\" پر کلکنگ کرتے ہوئے اپنے فنکشن کے پیرامیٹر کری-ایٹ کریں اور ضروری پیرامیٹرز شامل کریں۔ فنکشن ڈیفینیشن میں نئے پیرامیٹر بلاکس ڈریگ کریں۔"},
"errorUnusedFunction":function(d){return "آپ نے فنکشن کری-ایٹ کرلیا ہے، لیکن اسے اپنی ورک اسپیس پر کبھی استعمال نہیں کیا! ٹول بکس میں \"فنکشنز\" پر کلک کریں اور اپنے پروگرام میں اسے یقینی طور پر استعمال میں لائیں۔"},
"errorUnusedParam":function(d){return "آپ نے ایک پیرامیٹر بلاک شامل کیا ہے، لیکن اسے ڈیفینیشن میں استعمال نہیں کیا۔ \"ایڈٹ\" پر کلک کرتے ہوئے پیرامیٹر بلاک کو گرین بلاک کے اندر رکھتے ہوئے اپنے پیرامیٹر کو استعمال میں لانا یقینی بنائیں۔"},
"exampleErrorMessage":function(d){return "فنکشن "+common_locale.v(d,"functionName")+" میں ایک یا اس سے زائد مثالیں ہوتی ہیں جنہیں ایڈجسٹنگ کی ضرورت ہوتی ہے۔ اس بات کو یقینی بنائیں کہ وہ آپ کی ڈیفینیشن سے میچ کریں اور سوال کا جواب دیں۔"},
"examplesFailedOnClose":function(d){return "آپ کی ایک یا زائد ایگزامپلز آپ کی ڈیفینیشن سے میچ نہیں کر رہی ہیں۔ کلوزنگ سے پہلے اپنی ایگزامپلز چیک کریں۔"},
"extraTopBlocks":function(d){return "آپ کے پاس غیر-منسلک بلاکس ہیں۔"},
"extraTopBlocksWhenRun":function(d){return "آپ کے پاس غیر منسلک بلاکس ہیں۔ کیا آپ کا مقصد ان کو \"وین رَن\" بلاک سے منسلک کرنا ہے؟ "},
"finalStage":function(d){return "مبارک ہو! آپ نے آخری مرحلہ مکمل کرلیا۔"},
"finalStageTrophies":function(d){return "مبارک ہو! آپ نے آخری مرحلہ مکمل کرلیا اور "+common_locale.p(d,"numTrophies",0,"ur",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" جیت لیا۔"},
"finish":function(d){return "اختتام"},
"generatedCodeInfo":function(d){return "یہاں تک کہ اعلی درجہ کی یونیورسٹیاں بلاک-بیسڈ کوڈنگ (مثلاً، "+common_locale.v(d,"berkeleyLink")+"، "+common_locale.v(d,"harvardLink")+") سکھاتی ہیں۔ لیکن ایک حد میں رہتے ہوئے، جن بلاکس کو آپ نے اسیمبلڈ کیا ہے انہیں جاوا، جو کہ دنیا میں سب سے زیادہ استعمال کی جانے والی کوڈنگ لنگویج ہے، میں بھی دیکھایا جاسکتا ہے:"},
"hashError":function(d){return "معذرت، ' %1 ' کسی محفوظ کردہ پروگرام سے مطابقت نہیں کرتا۔"},
"help":function(d){return "مدد"},
"hideToolbox":function(d){return "(چھپائیں)"},
"hintHeader":function(d){return "یہ رہی ایک ترکیب (ٹپ)"},
"hintPrompt":function(d){return "Need help?"},
"hintRequest":function(d){return "ھنٹ (اشارہ) دیکھیں"},
"hintReviewTitle":function(d){return "اپنے اشارہ کا جائزہ لیں"},
"hintSelectInstructions":function(d){return "ہدایات اور پرانے اشارے"},
"hintSelectNewHint":function(d){return "ایک نیا اشارہ حاصل کریں"},
"hintTitle":function(d){return "ھنٹ:"},
"ignore":function(d){return "اگنور"},
"infinity":function(d){return "Infinity"},
"jump":function(d){return "چھلانگ لگایں"},
"keepPlaying":function(d){return "کھیلتے رہیں"},
"levelIncompleteError":function(d){return "آپ ہر اقسام کے تمام ضروری بلاکس استعمال کر رہے ہیں لیکن درست طریقہ سے نہیں۔"},
"listVariable":function(d){return "فہرست"},
"makeYourOwnFlappy":function(d){return "خود اپنی طرز کا فلاپی گیم بنائیں"},
"missingRecommendedBlocksErrorMsg":function(d){return "بالکل نہیں۔ اس بلاک کو استعمال کرنے کی کوشش کریں جسے آپ نے اب تک استعمال نہیں کیا۔"},
"missingRequiredBlocksErrorMsg":function(d){return "بالکل نہیں۔ آپ کو لازماً اس بلاک کو استعمال کرنا ہوگا جسے اب تک آپ نے استعمال نہیں کیا ہے۔"},
"nestedForSameVariable":function(d){return "آپ دو یا زائد نیسٹڈ لوپس کے اندر یکساں نام کے ویری-ایبل استعمال کر رہے ہیں۔ کسی انفانائیٹ (لامتناہی) لوپس سے بچنے کے لیے منفرد ویری-ایبل نیمز استعمال کریں۔"},
"nextLevel":function(d){return "مبارک ہو! آپ نے پزل "+common_locale.v(d,"puzzleNumber")+" مکمل کر لیا۔"},
"nextLevelTrophies":function(d){return "مبارک ہو! آپ نے پزل "+common_locale.v(d,"puzzleNumber")+" مکمل کر لیا ہے۔ (لیکن اسٹارنگ کوڈ کے لیے آپ مختلف بلاک استعمال کرسکتے ہیں۔) "+common_locale.p(d,"numTrophies",0,"ur",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})},
"nextPuzzle":function(d){return "اگلا پزل"},
"nextStage":function(d){return "مبارک ہو! آپ نے "+common_locale.v(d,"stageName")+" مکمل کرلیا۔"},
"nextStageTrophies":function(d){return "مبارک ہو! آپ نے مرحلہ "+common_locale.v(d,"stageName")+" مکمل کر لیا اور جیت لیا ہے۔ \n"+common_locale.p(d,"numTrophies",0,"ur",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "مبارک ہو! آپ نے پزل "+common_locale.v(d,"puzzleNumber")+" مکمل کر لیا۔ (تاہم، آپ صرف "+common_locale.p(d,"numBlocks",0,"ur",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+") استعمال کرسکے۔ "},
"numLinesOfCodeWritten":function(d){return "آپ نے ابھی صرف کوڈ کی "+common_locale.p(d,"numLines",0,"ur",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" لائنز لکھیں ہیں!"},
"openWorkspace":function(d){return "یہ کس طرح کام کرتا ہے"},
"orientationLock":function(d){return "ڈیوائس سیٹنگز میں اوریئنٹیشن لاک کو بند کردیں۔"},
"play":function(d){return "play"},
"print":function(d){return "پرنٹ"},
"puzzleTitle":function(d){return "پزل "+common_locale.v(d,"puzzle_number")+" کا "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "صرف ویو کریں: "},
"repeat":function(d){return "دوبارہ"},
"resetProgram":function(d){return "ری-سیٹ کریں"},
"rotateText":function(d){return "اپنی ڈیوائس کو گھمائیے۔"},
"runProgram":function(d){return "رَن کریں"},
"runTooltip":function(d){return "ورک اسپیس میں بلاک کے ذریعے وضع کردہ پروگرام رَن کریں۔"},
"runtimeErrorMsg":function(d){return "آپ کا پروگرام کامیابی سے رَن نہیں ہوا۔ براہ کرم، اس لائن "+common_locale.v(d,"lineNumber")+" کو ہٹا کر دوبارہ کوشش کریں۔"},
"saveToGallery":function(d){return "Save"},
"savedToGallery":function(d){return "Saved"},
"score":function(d){return "اسکور"},
"sendToPhone":function(d){return "فون پر بھیجیں"},
"shareFailure":function(d){return "سوری، ہم اس پروگرام کو شیئر نہیں کرسکتے۔"},
"shareWarningsAge":function(d){return "ذیل میں اپنی عمر فراہم کریں اور جاری رکھنے کے لیے OK پر کلک کریں۔"},
"shareWarningsMoreInfo":function(d){return "مزید معلومات"},
"shareWarningsStoreData":function(d){return "اس ایپ کو کوڈ اسٹوڈیو پر بنایا گیا ہے، یہ ڈیٹا اسٹور کرتی ہے جو کہ کوئی بھی اس شیئرنگ لنک کے ذریعے اسے دیکھ سکتا ہے ، لہذا اگر آپ سے پرسنل انفارمیشن فراہم کرنا طلب کیا جائے تو احتیاط سے کام لیں۔ "},
"showBlocksHeader":function(d){return "شو بلاکس"},
"showCodeHeader":function(d){return "شو کوڈ"},
"showGeneratedCode":function(d){return "شو کوڈ"},
"showTextHeader":function(d){return "شو ٹیکسٹ"},
"showToolbox":function(d){return "شو ٹول باکس"},
"showVersionsHeader":function(d){return "ورژن ہسٹری"},
"signup":function(d){return "تعارفی کورس کے لیے سائن اَپ کریں"},
"stringEquals":function(d){return "اسٹرنگ =؟"},
"submit":function(d){return "جمع کرائیں"},
"submitYourProject":function(d){return "اپنا پروجیکٹ جمع کریں"},
"submitYourProjectConfirm":function(d){return "آپ اپنا پروجیکٹ جمع کرانے کے بعد اسے پھر ایڈٹ نہیں کرسکتے، کیا واقعی آپ کو سبمٹ کرنا ہے؟"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "اپنے پروجیکٹ کو اَن-سبمٹ کریں"},
"unsubmitYourProjectConfirm":function(d){return "اپنے پروجیکٹ کو اَن-سبمٹ کرنے سے سبمٹ کرنے کی تاریخ ری-سیٹ ہوجائے گی، کیا واقعی اَن-سبمٹ کرنا ہے؟"},
"subtitle":function(d){return "ایک ویوژول پروگرامنگ اینوائرمنٹ"},
"syntaxErrorMsg":function(d){return "آپ کے پروگرام میں ایک ٹائیپو ہے۔ براہ کرم لائن "+common_locale.v(d,"lineNumber")+" ہٹا دیں اور دوبارہ کوشش کریں۔"},
"textVariable":function(d){return "ٹیکسٹ"},
"toggleBlocksErrorMsg":function(d){return "آپ کو اپنے پروگرام میں ایک غلطی (ایرر) درست کرنے کی ضرورت ہے اس سے قبل کہ اسے بطور بلاکس دکھایا جاسکے۔"},
"tooFewBlocksMsg":function(d){return "آپ تمام اقسام کے ضروری بلاکس استعمال کر ہے ہیں، لیکن اس پزل کو مکمل کرنے کے لیے ان اقسام کے مزید بلاکس کو استعمال کرنے کی کوشش کریں۔"},
"tooManyBlocksMsg":function(d){return "یہ پزل <x id='START_SPAN'/><x id='END_SPAN'/> بلاکس کے ذریعہ حل کیا جاسکتا ہے۔"},
"tooMuchWork":function(d){return "تمہاری وجہ سے مجھے بہت سارے کام کرنا پڑ رہا ہے! کیا تم کئی مرتبہ اسے دہرا سکتے ہو؟"},
"toolboxHeader":function(d){return "بلاکس"},
"toolboxHeaderDroplet":function(d){return "ٹول باکس"},
"totalNumLinesOfCodeWritten":function(d){return "آل-ٹائم ٹوٹل کریں: "+common_locale.p(d,"numLines",0,"ur",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" کوڈ کا۔"},
"tryAgain":function(d){return "دوبارہ کوشش کریں"},
"tryBlocksBelowFeedback":function(d){return "ذیل کے بلاکس میں سے ایک کو استعمال کرنے کی کوشش کریں:"},
"tryHOC":function(d){return "آور-آف-کوڈ پر کوشش کریں۔"},
"unnamedFunction":function(d){return "آپ کا ایک ویری-ایبل یا فنکشن ہے جس کا کوئی نام نہیں ہے۔ ہر چیز کو مخصوص وضاحتی نام دینا نہ بھولیں۔"},
"wantToLearn":function(d){return "کوڈ کرنا سیکھنا چاہتے ہیں؟"},
"watchVideo":function(d){return "ویڈیو دیکھیں"},
"when":function(d){return "کب"},
"whenRun":function(d){return "رَن کب ہوگا"},
"workspaceHeaderShort":function(d){return "ورک اسپیس "}};