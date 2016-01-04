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
"and":function(d){return "و"},
"backToPreviousLevel":function(d){return "العودة إلى المستوى السابق"},
"blocklyMessage":function(d){return "بلوكلي"},
"blocks":function(d){return "مربعات برمجية"},
"booleanFalse":function(d){return "خطأ"},
"booleanTrue":function(d){return "صحيح"},
"catActions":function(d){return "الإجراءات"},
"catColour":function(d){return "اللون"},
"catLists":function(d){return "القوائم"},
"catLogic":function(d){return "المنطق"},
"catLoops":function(d){return "الحلقات"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "الدوال"},
"catText":function(d){return "النص"},
"catVariables":function(d){return "المتغيرات"},
"clearPuzzle":function(d){return "البدء من جديد"},
"clearPuzzleConfirm":function(d){return "سيقوم هذا بإعادة اللغز إلى حالته الأصلية وحذف جميع المربعات البرمجية التي قمت بإضافتها أو تعديلها."},
"clearPuzzleConfirmHeader":function(d){return "هل أنت متأكد من أنك تريد البدء من جديد؟"},
"codeMode":function(d){return "البرمجة"},
"codeTooltip":function(d){return "راجع تعليمات JavaScript البرمجية التي تم إنشائها."},
"completedWithoutRecommendedBlock":function(d){return "تهانينا! لقد أكملت اللغز رقم"+common_locale.v(d,"puzzleNumber")+" (و لكن كان بإمكانك استخدام قطعة برمجية بديلة حتي تكون البرمجة الخاص بك أقوى)"},
"continue":function(d){return "الاستمرار"},
"copy":function(d){return "نسخ"},
"defaultTwitterText":function(d){return "انظر ما الذي صنعته"},
"designMode":function(d){return "تصميم"},
"dialogCancel":function(d){return "إلغاء"},
"dialogOK":function(d){return "موافق"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "جمع رقمين"},
"dropletBlock_addOperator_signatureOverride":function(d){return "علامة الجمع"},
"dropletBlock_andOperator_description":function(d){return "إرجاع قيمة \"صحيح\" فقط عندما يكون التعبيرين صح أو خطأ وإلا"},
"dropletBlock_andOperator_signatureOverride":function(d){return "علامة \"وَ\""},
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
"dropletBlock_mathRandom_description":function(d){return "يُرجع رقم عشري عشوائي اكبر من او يساوي 0 و أصغر من 1"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "الرياضيات.عشوائي()"},
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
"dropletBlock_randomNumber_param0":function(d){return "أصغر"},
"dropletBlock_randomNumber_param0_description":function(d){return "أعاد أصغر عدد"},
"dropletBlock_randomNumber_param1":function(d){return "أكبر"},
"dropletBlock_randomNumber_param1_description":function(d){return "أعاد أكبرعدد"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "إرجاع"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "الدالة "+common_locale.v(d,"name")+" فيها إدخال فارغ."},
"emptyBlockInVariable":function(d){return "المتغيّر "+common_locale.v(d,"name")+" فيه إدخال فارغ."},
"emptyBlocksErrorMsg":function(d){return "تحتاج المربعات البرمجية \"تكرار\" و \"إذا كان\" إلى أن تحتوي على مربعات برمجية أخرى داخلها كي تعمل. الرجاء التأكد من أن المربعات البرمجية الداخلية تتناسب بشكل صحيح مع المربعات البرمجية الحاوية لها."},
"emptyExampleBlockErrorMsg":function(d){return "أنت بحاجة إلى مثالين على الأقل في الدالة "+common_locale.v(d,"functionName")+". تأكد من أن لكل مثال استدعاء ونتيجة."},
"emptyFunctionBlocksErrorMsg":function(d){return "المربع البرمجي للدالة يحتاج إلى مربعات برمجية أخرى داخلها لكي يعمل."},
"emptyFunctionalBlock":function(d){return "لديك مربع برمجي فيه إدخال فارغ."},
"emptyTopLevelBlock":function(d){return "لا يوجد مقاطع برمجية لتشغيلها. يجب إرفاق مقطع برمجي إلى المقطع البرمجي "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "نهاية"},
"errorEmptyFunctionBlockModal":function(d){return "يجب أن يكون هناك مربعات برمجية داخل تعريف الدالة الخاصة بك. انقر فوق \"تحرير\" واسحب المربعات البرمجية داخل المربع الأخضر."},
"errorIncompleteBlockInFunction":function(d){return "انقر فوق \"تحرير\" للتأكد من عدم وجود أي مربعات برمجية ناقصة داخل تعريف الدالة الخاصة بك."},
"errorParamInputUnattached":function(d){return "تذكر أن تقوم بإرفاق مربع برمجي لكل عامل إدخال في المربع البرمجي الخاص بالدالة في مساحة عملك."},
"errorQuestionMarksInNumberField":function(d){return "حاول أن تستبدل \"؟؟؟\" بقيمة ما."},
"errorRequiredParamsMissing":function(d){return "أنشئ عامل للدالة الخاصة بك عن طريق النقر على \"تحرير\" و إضافة العوامل الضرورية. اسحب المربعات البرمجية للعامل الجديد إلى تعريف الدالة الخاص بك."},
"errorUnusedFunction":function(d){return "لقد قمت بإنشاء دالة، ولكن لم تستخدمها في مساحة العمل الخاصة بك! انقر على \"المهام/الدوال\" في مربع الأدوات وتأكد من استخدامها في البرنامج الخاص بك."},
"errorUnusedParam":function(d){return "لقد قمت بإضافة مربع برمجي للعامل ولكنك لم تستخدمه في التعريف. تأكد من استخدام العامل الخاص بك عن طريق النقر على \"تحرير\" ثم وضع المربع البرمجي للعامل داخل المربع الأخضر."},
"exampleErrorMessage":function(d){return "الدالة "+common_locale.v(d,"functionName")+" لها مثال واحد أو أكثر بحاجة إلى تعديل. تأكد من مطابقتها للتعريف الخاص بك والإجابة على السؤال."},
"examplesFailedOnClose":function(d){return "واحد أو أكثر من أمثلتك لا تتطابق مع التعريف الخاص بك. راجع أمثلتك قبل الإغلاق"},
"extraTopBlocks":function(d){return "لديك مربعات برمجية غير متصلة."},
"extraTopBlocksWhenRun":function(d){return "لديك مربعات برمجية غير متصلة. هل كنت تقصد إرفاقها إلى المربع البرمجي \"عند التشغيل\"؟"},
"finalStage":function(d){return "تهانينا! لقد أكملت حل اللغز الأخير."},
"finalStageTrophies":function(d){return "تهانينا! لقد أكملت حل اللغز الأخير و فزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"finish":function(d){return "إنهاء"},
"generatedCodeInfo":function(d){return "حتى أفضل الجامعات تعلم البرمجة المبنية على المربعات البرمجية (على سبيل المثال، "+common_locale.v(d,"berkeleyLink")+"، "+common_locale.v(d,"harvardLink")+"). ولكن في الحقيقة، من الممكن إظهار المربعات البرمجية التي جمعتها من خلال الجافا سكريبت، وهي أكثر لغة برمجية مستخدمة في العالم:"},
"hashError":function(d){return "عذراً، %1 لا يتوافق مع أي من البرامج المحفوظة."},
"help":function(d){return "مساعدة"},
"hideToolbox":function(d){return "(إخفاء)"},
"hintHeader":function(d){return "إليك نصيحة:"},
"hintPrompt":function(d){return "بحاجة إلى مساعدة؟"},
"hintRequest":function(d){return "شاهد تلميحاً"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"},
"hintTitle":function(d){return "تلميح:"},
"ignore":function(d){return "تجاهل"},
"infinity":function(d){return "ما لانهاية"},
"jump":function(d){return "إقفز"},
"keepPlaying":function(d){return "استمر في اللعب"},
"levelIncompleteError":function(d){return "أنت استخدمت كل أنواع المربعات البرمجية الضرورية ولكن ليس في الطريقة الصحيحة."},
"listVariable":function(d){return "قائمة"},
"makeYourOwnFlappy":function(d){return "برمج لعبة فلابي الخاصة بك"},
"missingRecommendedBlocksErrorMsg":function(d){return "ليس تماما. حاول ان تجرب استخدام قطعة برمجية جديدة لم تستخدمها من قبل."},
"missingRequiredBlocksErrorMsg":function(d){return "ليس تماما. يجب عليك استخدام قطعة برمجية جديدة لم تستخدمها من قبل."},
"nestedForSameVariable":function(d){return "أنت تستخدم المتغير ذاته في حلقتين متداخلتين أو أكثر. استخدم أسماء فريدة للمتغير لتفادي حلقات لا نهائية."},
"nextLevel":function(d){return "تهانينا! لقد أكملت اللغز "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "تهانينا! لقد أكملت اللغز "+common_locale.v(d,"puzzleNumber")+" وفزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"nextPuzzle":function(d){return "اللغز التالي"},
"nextStage":function(d){return "تهانينا! لقد أكملت المرحلة "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة "+common_locale.v(d,"stageNumber")+" وفزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"numBlocksNeeded":function(d){return "تهانينا! لقد أكملت اللغز "+common_locale.v(d,"puzzleNumber")+". (لكن كان بإمكانك استخدام "+common_locale.p(d,"numBlocks",0,"ar",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".) فقط"},
"numLinesOfCodeWritten":function(d){return "لقد كتبت "+common_locale.p(d,"numLines",0,"ar",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" من الكود البرمجي!"},
"openWorkspace":function(d){return "كيف يعمل ذلك"},
"orientationLock":function(d){return "قم بتعطيل قفل التوجه في إعدادات المستخدم."},
"play":function(d){return "إلعب"},
"print":function(d){return "طباعة"},
"puzzleTitle":function(d){return "اللغز "+common_locale.v(d,"puzzle_number")+" من "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "عرض فقط: "},
"repeat":function(d){return "كرر"},
"resetProgram":function(d){return "إعادة تعيين"},
"rotateText":function(d){return "تدوير الجهاز."},
"runProgram":function(d){return "تشغيل"},
"runTooltip":function(d){return "تشغيل البرنامج المعرّف من خلال المربعات البرمجية في مساحة العمل."},
"runtimeErrorMsg":function(d){return "لم يشتغل برنامجك بنجاح. الرجاء إزالة خط "+common_locale.v(d,"lineNumber")+" ثم أعد المحاولة."},
"saveToGallery":function(d){return "حفظ إلى المعرض"},
"savedToGallery":function(d){return "تم الحفط في المعرض!"},
"score":function(d){return "النتيجة"},
"sendToPhone":function(d){return "إرسال إلى الهاتف"},
"shareFailure":function(d){return "عذراً، لا يمكن أن نشارك هذا البرنامج."},
"shareWarningsAge":function(d){return "الرجاء تعبئة عمرك أدناه ثم اضغط حسنا للمتابعة."},
"shareWarningsMoreInfo":function(d){return "مزيد من المعلومات"},
"shareWarningsStoreData":function(d){return "هذا التطبيق تم بنائه في استوديو التعليمات البرمجية و يمكن مشاهدته من قبل أي شخص لديه هذا الرابط, لذا كن حذرا إذا طلب منك تقديم معلومات شخصية."},
"showBlocksHeader":function(d){return "إظهار المربعات البرمجية"},
"showCodeHeader":function(d){return "إظهار الكود البرمجي"},
"showGeneratedCode":function(d){return "إظهار الكود البرمجي"},
"showTextHeader":function(d){return "إظهار النص"},
"showToolbox":function(d){return "إظهار علبة الأدوات"},
"showVersionsHeader":function(d){return "تاريخ الإصدارات"},
"signup":function(d){return "قم بالتسجيل في الدورة التدريبية التقديمية"},
"stringEquals":function(d){return "الكلمة هستاوى إيه؟"},
"submit":function(d){return "تسجيل"},
"submitYourProject":function(d){return "تقديم مشروعك"},
"submitYourProjectConfirm":function(d){return "لا يمكنك تعديل مشروعك بعد تقديمه، هل تريد بالفعل تقديمه؟"},
"unsubmit":function(d){return "عدم تقديم"},
"unsubmitYourProject":function(d){return "الغاء تقديم المشروع الخاص بك"},
"unsubmitYourProjectConfirm":function(d){return "الغاء تقديم المشروع الخاص بك سوف يؤدي الي اعادة تعيين تاريخ التقديم, هل انت متأكد من الغاء التقديم ؟"},
"subtitle":function(d){return "بيئة البرمجة المرئية"},
"syntaxErrorMsg":function(d){return "برنامجك يحتوي علي خطأ في الكتابة الرجاء إزالة السطر رقم "+common_locale.v(d,"lineNumber")+" والمحاولة مرة أخرى."},
"textVariable":function(d){return "النص"},
"toggleBlocksErrorMsg":function(d){return "يجب تصحيح خطأ في برنامجك قبل أن يمكنك عرضه كمربعات برمجية."},
"tooFewBlocksMsg":function(d){return "لقد استخدمت كافة أنواع المربعات البرمجية اللازمة ولكن حاول أن تستخدم المزيد من هذه الأنواع من المربعات البرمجية لإكمال هذا اللغز."},
"tooManyBlocksMsg":function(d){return "من الممكن حل هذا اللغز باستخدام <x id='END_SPAN'/><x id='START_SPAN'/> مربع برمجي."},
"tooMuchWork":function(d){return "لقد جعلتني أقوم بالكثير من العمل الشاق!  هل يمكنك محاولة تقليص عدد مرات التكرار؟"},
"toolboxHeader":function(d){return "مربعات برمجية"},
"toolboxHeaderDroplet":function(d){return "علبة الأدوات"},
"totalNumLinesOfCodeWritten":function(d){return "الحصيلة الشاملة: "+common_locale.p(d,"numLines",0,"ar",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" من الشيفرة البرمجية."},
"tryAgain":function(d){return "حاول مرة أخرى"},
"tryBlocksBelowFeedback":function(d){return "حاول استخدام واحد من القطع البرمجية الموجودة بالأسفل:"},
"tryHOC":function(d){return "جرب ساعة من البرمجة - \"Hour of Code\""},
"unnamedFunction":function(d){return "لديك متغير أو دالة دون اسم. لا تنسى أن تعطي كل شيء اسماً وصفياً."},
"wantToLearn":function(d){return "هل تريد أن تتعلم البرمجة؟"},
"watchVideo":function(d){return "شاهد الفيديو"},
"when":function(d){return "عندما"},
"whenRun":function(d){return "عند التشغيل"},
"workspaceHeaderShort":function(d){return "مساحة العمل: "}};