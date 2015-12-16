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
"and":function(d){return "এবং"},
"backToPreviousLevel":function(d){return "পূর্ববর্তী ধাপে ফিরে যান"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocks"},
"booleanFalse":function(d){return "মিথ্যা"},
"booleanTrue":function(d){return "সত্যি"},
"catActions":function(d){return "ক্রিয়া"},
"catColour":function(d){return "রং"},
"catLists":function(d){return "তালিকা"},
"catLogic":function(d){return "যুক্তি"},
"catLoops":function(d){return "Loops"},
"catMath":function(d){return "গণিত"},
"catProcedures":function(d){return "ফাংশনগুলি"},
"catText":function(d){return "পাঠ"},
"catVariables":function(d){return "চলকগুলো"},
"clearPuzzle":function(d){return "আবার শুরু কর"},
"clearPuzzleConfirm":function(d){return "এটি puzzleটিকে পুনর্বিন্যাস করে শুরুর স্থানে নিয়ে যাবে এবং তোমার করা ব্লকে-যুক্ত-করন বা পরিবর্তন সব মুছে দেবে।"},
"clearPuzzleConfirmHeader":function(d){return "তুমি কি সব আবার আগের থেকে শুরু করতে চাও?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "প্রস্তুত হওয়া JavaScript code দেখো।"},
"completedWithoutRecommendedBlock":function(d){return "অভিনন্দন! আপনি ধাঁধা "+common_locale.v(d,"puzzleNumber")+" সম্পন্ন করছেন। (কিন্তু আপনি শক্তিশালী কোড জন্য একটি ভিন্ন ব্লক ব্যবহার করতে পারেন।)"},
"continue":function(d){return "চালিয়ে যান"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "বাতিল করুন"},
"dialogOK":function(d){return "ঠিক আছে"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "দুটো সংখ্যা যুক্ত কর"},
"dropletBlock_addOperator_signatureOverride":function(d){return "চালনাকারী যুক্ত কর"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "বিদ্যমান এক variable এর মান নির্ধারন কর। উদাহরণস্বরূপ, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "এক variable নির্ধারন কর"},
"dropletBlock_callMyFunction_description":function(d){return "এক function চালনা করো যার আর কোনো parameter নেই"},
"dropletBlock_callMyFunction_n_description":function(d){return "এক function চালনা করো যার এক বা একাধিক parameter আছে"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Parameters দিয়ে এক function চালনা কর"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "এক function চালনা কর"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "একটি variable বানাও এবং প্রদত্ত প্রাথমিক মানগুলোর দ্বারা এটিকে একটি array এর সাথে জুড়ে দাও"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "একটি variable বানিয়ে একটি array এর সাথে জুড়ে দাও"},
"dropletBlock_declareAssign_x_description":function(d){return "'var' এর পরে থাকা নাম দিয়ে একটি variable বানাও, এবং expression এর ডান দিকের মানের সাথে এটিকে জুড়ে দাও"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "এটা বলে দাও যে, code এবার একটি variable ব্যবহার করবে এবং ব্যবহারকারীর দেয়া প্রাথমিক মানে নির্ধারিত হবে"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "ব্যবহারকারীকে একটি মানের জন্য উৎসাহিত কর এবং এটিকে সংরক্ষণ কর"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "একটি variable বানাও"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "একটি variable বানাও"},
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
"dropletBlock_mathRandom_description":function(d){return "০ এর সমান বা বড় কিন্তু ১ থেকে ছোট সীমা মধ্যে এলোমেলো সংখ্যা ফিরান"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "নূন্যতম"},
"dropletBlock_randomNumber_param0_description":function(d){return "ন্যূনতম নম্বর ফিরে আসে"},
"dropletBlock_randomNumber_param1":function(d){return "সর্বোচ্চ"},
"dropletBlock_randomNumber_param1_description":function(d){return "সর্বোচ্চ নম্বর ফিরে আসে"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "ফেরায়"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "ফাংশনটিতে কোন ইনপুট দেয়া হয়নি."},
"emptyBlockInVariable":function(d){return "চলরাশিটির "+common_locale.v(d,"name")+" একটি ভরাট না হওয়া ইনপুট আছে।"},
"emptyBlocksErrorMsg":function(d){return "\"পুনরাবৃত্ত\" ব্লক এবং \"যদি\" ব্লক কাজ করার জন্য এর ভিতর অন্য ব্লক প্রয়োজন। ভিতরের ব্লক গুলো ঠিকভাবে বসেছে কিনা নিশ্চিত করুন।."},
"emptyExampleBlockErrorMsg":function(d){return "আপনার "+common_locale.v(d,"functionName")+" ফাংশনের অন্তত দুটি উদাহরণ প্রয়োজন। প্রতিটি উদাহরণের একটি কল এবং একটি ফলাফলের আছে কিনা তা নিশ্চিত করুন।"},
"emptyFunctionBlocksErrorMsg":function(d){return "ফাংশন ব্লকটি কাজ করতে এর ভিতরে অন্যান্য ব্লক প্রয়োজন আছে।"},
"emptyFunctionalBlock":function(d){return "একটি ভরাট না করা ইনপুট সঙ্গে আপনার একটি ব্লক আছে।"},
"emptyTopLevelBlock":function(d){return "চালানোর জন্য আর কোন ব্লক নেই। চালানোর জন্য "+common_locale.v(d,"topLevelBlockName")+" সাথে আপনাকে অবশ্য একটি ব্লক সংযুক্ত করতে হবে।"},
"end":function(d){return "শেষ"},
"errorEmptyFunctionBlockModal":function(d){return "আপনার ফাংশন সংজ্ঞা ভিতরে ব্লক থাকতে হবে। \"সম্পাদনা\" ক্লিক করুন করুন এবং  সবুজ ব্লক ভিতরে ব্লক টানুন।"},
"errorIncompleteBlockInFunction":function(d){return "আপনার ফাংশন সংজ্ঞা ভিতরে কোনো ব্লক অনুপস্থিত আছে কি না তা নিশ্চিত করতে \"সম্পাদনা\" ক্লিক করুন।"},
"errorParamInputUnattached":function(d){return "আপনার কর্মক্ষেত্র ফাংশন ব্লক প্রতিটি প্যারামিটার ইনপুট একটি ব্লক সংযুক্ত করতে খেয়াল রাখুন।"},
"errorQuestionMarksInNumberField":function(d){return "\"???\" একটি মান সঙ্গে প্রতিস্থাপন কর।"},
"errorRequiredParamsMissing":function(d){return "\"সম্পাদনা\" ক্লিক করে প্রয়োজনীয় প্যারামিটার যুক্ত করে আপনার ফাংশনের জন্য প্যারামিটার তৈরি করুন। আপনার ফাংশন সংজ্ঞা মধ্যে নতুন প্যারামিটার ব্লক টেনে আনুন।"},
"errorUnusedFunction":function(d){return "আপনি একটি ফাংশন নির্মান করেছেন কিন্তু আপনার কর্মক্ষেত্রে ব্যবহার করেননি! টুলবক্স \"কার্যাবলী\" তে ক্লিক করুন এবং আপনি আপনার প্রোগ্রামে এটি ব্যবহার করছেন তা নিশ্চিত করুন।"},
"errorUnusedParam":function(d){return "আপনি একটি পরামিতি ব্লক যোগ করেছেন, কিন্তু সংজ্ঞায় এটা ব্যবহার করানি। \"সম্পাদনা\" ক্লিক করে এবং সবুজ ব্লক ভিতরে পরামিতি ব্লক স্থাপন করে পরামিতির ব্যবহার নিশ্চিত করুন।"},
"exampleErrorMessage":function(d){return "ফাংশন "+common_locale.v(d,"functionName")+" এক বা একাধিক উদাহরণ আছে যা  সমন্বয় করা প্রয়োজন। নিশ্চিত করুন যে তারা আপনার সংজ্ঞা এবং প্রশ্নের উত্তরের সাথে মিল।"},
"examplesFailedOnClose":function(d){return "আপনার এক বা একাধিক উদাহরণ আপনার সংজ্ঞা মিলছে না। বন্ধ করার আগে আপনার উদাহরণ চেক করুন।"},
"extraTopBlocks":function(d){return "আপনি বিচ্ছিন্ন ব্লক আছে"},
"extraTopBlocksWhenRun":function(d){return "আপনি বিচ্ছিন্ন ব্লক আছে। আপনি কি সেগুল \"যখন চলবে\" ব্লকের সাথে যুক্ত করতে চাইছেন ?"},
"finalStage":function(d){return "অভিনন্দন! আপনি চূড়ান্ত পর্যায় সম্পন্ন করেছেন।"},
"finalStageTrophies":function(d){return "অভিনন্দন! আপনি চূড়ান্ত পর্যায়ে সম্পন্ন এবং জিতেছে্ন "+common_locale.p(d,"numTrophies",0,"bn",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"।."},
"finish":function(d){return "শেষ"},
"generatedCodeInfo":function(d){return "এমনকি শীর্ষ বিশ্ববিদ্যালয় ব্লক ভিত্তিক কোডিং শেখান (যেমন, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). কিন্তু ব্লকের নিচে, আপনি যে ব্লক একত্র করেছেন তা বিশ্বের সবচেয়ে বহুল ব্যবহৃত কোডিং ভাষা জাভাস্ক্রিপ্টে দেখানো যেতে পারে:"},
"hashError":function(d){return "দুঃখিত, '% 1' কোনো সংরক্ষিত প্রোগ্রামের সাথে সঙ্গতিপূর্ণ নয়।"},
"help":function(d){return "সাহায্য"},
"hideToolbox":function(d){return "(লুকান)"},
"hintHeader":function(d){return "এখানে একটি ইঙ্গিত:"},
"hintRequest":function(d){return "ইঙ্গিত দেখুন"},
"hintTitle":function(d){return "সংকেত:"},
"ignore":function(d){return "উপেক্ষা করুন"},
"infinity":function(d){return "অসীম"},
"jump":function(d){return "লাফান"},
"keepPlaying":function(d){return "খেলতে থাকুন"},
"levelIncompleteError":function(d){return "আপনি প্রয়োজনীয় সব ধরনের ব্লক ব্যবহার করছেন কিন্তু সঠিক ভাবে নয়।"},
"listVariable":function(d){return "তালিকা"},
"makeYourOwnFlappy":function(d){return "আপনার নিজের ফ্লাপি গেম তৈরি করুন"},
"missingRecommendedBlocksErrorMsg":function(d){return "পুরোপুরি নয়। আপনার এখনও ব্যবহার না করা একটি ব্লক ব্যবহার করার চেষ্টা করুন।"},
"missingRequiredBlocksErrorMsg":function(d){return "পুরোপুরি নয়। আপনার এখনও ব্যবহার না করা একটি ব্লক ব্যবহার করতে হবে।"},
"nestedForSameVariable":function(d){return "আপনি দুই বা ততোধিক নেস্টেড লুপের ভিতরে একই ভেরিয়েবল ব্যবহার করছেন। অসীম লুপ এড়াতে অনন্য ভেরিয়েবলের নাম ব্যবহার করুন।"},
"nextLevel":function(d){return "অভিনন্দন! আপনি "+common_locale.v(d,"puzzleNumber")+" নাম্বার ধাঁধা সম্পন্ন করছেন।"},
"nextLevelTrophies":function(d){return "অভিনন্দন! আপনি "+common_locale.v(d,"puzzleNumber")+" চূড়ান্ত পর্যায়ে সম্পন্ন এবং জিতেছেন "+common_locale.p(d,"numTrophies",0,"bn",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"।."},
"nextPuzzle":function(d){return "পরবর্তী ধাঁধা"},
"nextStage":function(d){return "অভিনন্দন! আপনি "+common_locale.v(d,"Stagename")+" সম্পন্ন করছেন।"},
"nextStageTrophies":function(d){return "অভিনন্দন! আপনি "+common_locale.v(d,"Stagename")+" সম্পন্ন করছেন এবং "+common_locale.p(d,"numTrophies",0,"bn",{"one":"টি ট্রফি","other":common_locale.n(d,"numTrophies")+" টি ট্রফি"})+" জিতেছেন।"},
"numBlocksNeeded":function(d){return "অভিনন্দন! আপনি ধাঁধা "+common_locale.v(d,"puzzleNumber")+" সম্পন্ন করছেন। (তবে, আপনি শুধুমাত্র "+common_locale.p(d,"numBlocks",0,"bn",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" ব্যবহার করতে পারতেন।)"},
"numLinesOfCodeWritten":function(d){return "আপনি এইমাত্র "+common_locale.p(d,"numLines",0,"bn",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" কোড লিখেছেন!"},
"openWorkspace":function(d){return "এটি কিভাবে কাজ করে"},
"orientationLock":function(d){return "ডিভাইস সেটিংস অভিযোজন (ওরিয়েন্টেশন) লক বন্ধ করুন।"},
"play":function(d){return "খেলুন"},
"print":function(d){return "ছাপুন"},
"puzzleTitle":function(d){return common_locale.v(d,"stage_total")+" এর মধ্যে ধাঁধা "+common_locale.v(d,"puzzle_number")},
"readonlyWorkspaceHeader":function(d){return "শুধু দেখা যাবে: "},
"repeat":function(d){return "পুনরাই"},
"resetProgram":function(d){return "পুনরায় সেট করুন"},
"rotateText":function(d){return "আপনার ডিভাইস ঘুরান।"},
"runProgram":function(d){return "চালান"},
"runTooltip":function(d){return "কর্মক্ষেত্রে থাকা ব্লক দ্বারা সংজ্ঞায়িত প্রোগ্রাম চালান।"},
"runtimeErrorMsg":function(d){return "আপনার প্রোগ্রাম সফলভাবে চালানো হয়নি. লাইন "+common_locale.v(d,"lineNumber")+" অপসারণ করে আবার চেষ্টা করুন."},
"saveToGallery":function(d){return "গ্যালারিতে সংরক্ষণ করুন"},
"savedToGallery":function(d){return "গ্যালারিতে সংরক্ষিত!"},
"score":function(d){return "স্কোর"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "দুঃখিত, আমরা এই প্রোগ্রাম শেয়ার করতে পারছি না."},
"shareWarningsAge":function(d){return "নিচে আপনার বয়স প্রদান করুন এবং চলিয়ে যাবার জন্য OK ক্লিক করুন।"},
"shareWarningsMoreInfo":function(d){return "অধিক তথ্য"},
"shareWarningsStoreData":function(d){return "আপনাকে যদি ব্যক্তিগত তথ্য প্রদান করতে বলা হয় তাহলে সতর্কতা অবলম্বন করা আবশ্যক কারন এই অ্যাপ্লিকেশন কোড স্টুডিও তথ্য ভান্ডারের উপর ভিত্তি করে নির্মিত যা এই শেয়ারিং লিঙ্ক সহ যে কেউ দেখা যেতে পারে।"},
"showBlocksHeader":function(d){return "ব্লকসমূহ দেখান"},
"showCodeHeader":function(d){return "কোড প্রদর্শন করুন"},
"showGeneratedCode":function(d){return "কোড প্রদর্শন করুন"},
"showTextHeader":function(d){return "লেখা দেখান"},
"showToolbox":function(d){return "টুলবক্স দেখান"},
"showVersionsHeader":function(d){return "সংস্করণ ইতিহাস"},
"signup":function(d){return "ভুমিকা কোর্সের জন্য নিবন্ধন করুন"},
"stringEquals":function(d){return "স্ট্রিং =?"},
"submit":function(d){return "জমা করুন"},
"submitYourProject":function(d){return "আপনার প্রকল্প জমা দিন"},
"submitYourProjectConfirm":function(d){return "আপনার প্রকল্পটি জমা দেওয়ার পর তা আর সম্পাদনা  করতে পারবেন না, আপনি সত্যিই এটা জমা দিতে চান?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "আপনার প্রকল্প ফিরিয়ে নেন"},
"unsubmitYourProjectConfirm":function(d){return "আপনার প্রকল্প ফিরিয়ে নিলে জমা দেবার তারিখ রিসেট হবে, সত্যিই প্রকল্প ফিরিয়ে নিতে চান?"},
"subtitle":function(d){return "ভিজ্যুয়াল প্রোগ্রামিং পরিবেশ"},
"syntaxErrorMsg":function(d){return "আপনার প্রোগ্রাম লিখায় একটি ভুল রয়েছে। লাইন "+common_locale.v(d,"lineNumber")+" অপসারণ করে আবার চেষ্টা করুন।"},
"textVariable":function(d){return "পাঠ"},
"toggleBlocksErrorMsg":function(d){return "ব্লক হিসেবে দেখানো আগে আপনার প্রোগ্রামের মধ্যে থাকা একটি ত্রুটি সংশোধন করা প্রয়োজন।"},
"tooFewBlocksMsg":function(d){return "আপনি প্রয়োজনীয় সব ধরনের ব্লক ব্যবহার করছেন, ধাঁধা সম্পূর্ণ করার জন্য এই ধরনের আরো ব্লক ব্যবহারের চেষ্টা করুন।"},
"tooManyBlocksMsg":function(d){return "এই ধাঁধা <x id='START_SPAN'/><x id='END_SPAN'/> ব্লক দিয়ে সমাধান করা যেতে পারে."},
"tooMuchWork":function(d){return "আপনি আমাকে অনেক কাজ করেছেন! আপনি পুনরাবৃত্তি করার চেষ্টা করবে?"},
"toolboxHeader":function(d){return "ব্লকসমূহ"},
"toolboxHeaderDroplet":function(d){return "টুলবক্স"},
"totalNumLinesOfCodeWritten":function(d){return "সর্বকালীন মোট:  "+common_locale.p(d,"numLines",0,"bn",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" লাইন কোড।"},
"tryAgain":function(d){return "আবার চেষ্টা করুন"},
"tryBlocksBelowFeedback":function(d){return "নীচের ব্লকগুলির কোন একটি ব্যবহার করার চেষ্টা করুন:"},
"tryHOC":function(d){return "এক ঘন্টা কোড চেষ্টা করুন"},
"unnamedFunction":function(d){return "আপনি একটি একটি পরিবর্তনশীল ফাংশন যার নাম নেই। সবকিছু একটি বর্ণনামূলক নাম দিতে ভুলবেন না।"},
"wantToLearn":function(d){return "কোড শিখতে চান?"},
"watchVideo":function(d){return "ভিডিও দেখুন"},
"when":function(d){return "যখন"},
"whenRun":function(d){return "চালানোর সময়"},
"workspaceHeaderShort":function(d){return "কর্মপরিসর:"},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};