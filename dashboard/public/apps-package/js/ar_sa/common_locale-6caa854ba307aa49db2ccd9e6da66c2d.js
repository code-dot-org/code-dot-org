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
"backToPreviousLevel":function(d){return "الرجوع إلى المستوى السابق"},
"blocklyMessage":function(d){return "بلوكلي"},
"blocks":function(d){return "مقاطع برمجيّة"},
"booleanFalse":function(d){return "خطأ"},
"booleanTrue":function(d){return "صحيح"},
"catActions":function(d){return "الاجراءات"},
"catColour":function(d){return "لون"},
"catLists":function(d){return "القوائم والمصفوفات"},
"catLogic":function(d){return "منطق"},
"catLoops":function(d){return "الجمل التكرارية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "الدوال"},
"catText":function(d){return "نص"},
"catVariables":function(d){return "المتغيرات"},
"clearPuzzle":function(d){return "البدء من جديد"},
"clearPuzzleConfirm":function(d){return "هذا سوف يعيد تعيين اللغز إلى حالته الأصلية وحذف جميع المكعبات التي قمت بإضافتها أو تعديلها."},
"clearPuzzleConfirmHeader":function(d){return "هل أنت متأكد من أنك تريد البدء من جديد؟"},
"codeMode":function(d){return "كود"},
"codeTooltip":function(d){return "شاهد كود الـ JavaScript ."},
"continue":function(d){return "أستمر"},
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
"dropletBlock_andOperator_description":function(d){return "ترجع صحيحة فقط عندما يكون التعبيرين صح او خطأ"},
"dropletBlock_andOperator_signatureOverride":function(d){return "علامة \"وَ\""},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
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
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "يرجع"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "قطعة \" أكرر\" أو \" اذا \" تحتاج ان تحتوي على قطع اخرى داخلها من اجل العمل . تأكد من القطع الداخلية بحيث يجب ان تكون تناسب القطع المحتوية في الداخل ."},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "قطعة الدالة تحتاج إلى القطع الأخرى بداخلها لكي تعمل."},
"emptyFunctionalBlock":function(d){return "You have a block with an unfilled input."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "نهاية"},
"errorEmptyFunctionBlockModal":function(d){return "يجب أن تكون هناك كتل داخل تعريف الدالة الخاصة بك. انقر فوق \"تحرير\" واسحب الكتل داخل الكتلة الخضراء."},
"errorIncompleteBlockInFunction":function(d){return "انقر فوق \"تحرير\" للتأكد من عدم وجود أي كتل ناقصة داخل تعريف الدالة الخاص بك ."},
"errorParamInputUnattached":function(d){return "تذكر أن تقوم بإرفاق كتلة لكل عامل الإدخال في الكتلة الخاصة بالدالة في مساحة العمل الخاصة بك."},
"errorQuestionMarksInNumberField":function(d){return "حاول أن  تغير قيمة \"؟؟؟\" ."},
"errorRequiredParamsMissing":function(d){return "أنشئ عامل للدالة الخاصة بك عن طريق النقر على \"تحرير\" و إضافة العوامل الضرورية. اسحب كتلة العوامل الجديدة في تعريف الدالة الخاص بك."},
"errorUnusedFunction":function(d){return "لقد قمت بإنشاء دالة، ولكن لم تستخدمها في مساحة العمل الخاصة بك! انقر على \"المهام/الدوال\" في مربع الأدوات وتأكد من استخدامها في البرنامج الخاص بك."},
"errorUnusedParam":function(d){return "لقد قمت بإضافة كتلة معلمة، ولكنك لم تستخدامه في التعريف. تأكد من استخدام العامل الخاص بك عن طريق النقر على \"تحرير\" ثم وضع كتلة العامل داخل الكتلة الخضراء."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "لديك كتلة منفصلة."},
"extraTopBlocksWhenRun":function(d){return "لديك كتلة منفصلة. هل تقصد إرفاق هذه إلى كتلة \"عند التشغيل\"؟"},
"finalStage":function(d){return "تهانينا! لقد اتممت المرحلة النهائية."},
"finalStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة النهائية وفزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"finish":function(d){return "إنهاء"},
"generatedCodeInfo":function(d){return "حتى أفضل الجامعات تعلم الكود البرمجي المبني على القطع (على سبيل المثال، "+common_locale.v(d,"berkeleyLink")+"، "+common_locale.v(d,"harvardLink")+"). ولكن في الحقيقه، يمكن للقطع التي جمعتها انت في الظهور في الجافا سكريبت، وهو أكثر لغة كود برمجي مستخدم في العالم:"},
"genericFeedback":function(d){return "انظر كيف انتهى الأمر، و حاول إصلاح برنامجك."},
"hashError":function(d){return "عذرا , %1 لايتوافق مع اي البرامج المحفوظة ."},
"help":function(d){return "مساعدة"},
"hideToolbox":function(d){return "(اخفي)"},
"hintHeader":function(d){return "إليك نصيحة:"},
"hintRequest":function(d){return "شاهد تلميحاً"},
"hintTitle":function(d){return "تلميح:"},
"ignore":function(d){return "Ignore"},
"infinity":function(d){return "ما لانهاية"},
"jump":function(d){return "إقفز"},
"keepPlaying":function(d){return "استمر في اللعب"},
"levelIncompleteError":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن ليس في الطريق الصحيح."},
"listVariable":function(d){return "قائمة"},
"makeYourOwnFlappy":function(d){return "برمج لعبة فلابي الخاصة بك"},
"missingBlocksErrorMsg":function(d){return "استخدم القطع الموجودة في الاسفل لحل هذا اللغز."},
"nextLevel":function(d){return "تهانينا ! أنت اكملت اللغز "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "تهانينا! لقد أكملت اللغز "+common_locale.v(d,"puzzleNumber")+" وفزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "تهانينا! لقد أكملت مرحلة "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "تهانينا! لقد أكملت المرحلة "+common_locale.v(d,"stageNumber")+" وفزت بـ "+common_locale.p(d,"numTrophies",0,"ar",{"one":"جائزة","other":common_locale.n(d,"numTrophies")+" جوائز"})+"."},
"numBlocksNeeded":function(d){return "تهانينا! لقد أكملت اللغز "+common_locale.v(d,"puzzleNumber")+". (لكن كان بامكانك استخذام "+common_locale.p(d,"numBlocks",0,"ar",{"one":"1 بلوك","other":common_locale.n(d,"numBlocks")+" بلوكات"})+".) فقط"},
"numLinesOfCodeWritten":function(d){return "لقد كتبت "+common_locale.p(d,"numLines",0,"ar",{"one":"سطر1","other":common_locale.n(d,"numLines")+" سطور"})+" من الكود البرمجي!"},
"openWorkspace":function(d){return "كيف يعمل ذلك"},
"orientationLock":function(d){return "قم بتعطيل قفل التوجه في اعدادات المستخدم."},
"play":function(d){return "إلعب"},
"print":function(d){return "طباعة"},
"puzzleTitle":function(d){return "اللغز "+common_locale.v(d,"puzzle_number")+" من "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "View only: "},
"repeat":function(d){return "كرر"},
"resetProgram":function(d){return "إعادة تعيين"},
"rotateText":function(d){return "دور النص."},
"runProgram":function(d){return "تشغيل"},
"runTooltip":function(d){return "تنفيذ البرنامج هو الامر الذي يقوم بتنفيذ القطع في مساحة العمل البيضاء."},
"saveToGallery":function(d){return "حفظ إلى المعرض"},
"savedToGallery":function(d){return "تم الحفط في المعرض!"},
"score":function(d){return "النتيجة"},
"shareFailure":function(d){return "عذراً، لا يمكن أن نشارك هذا البرنامج."},
"showBlocksHeader":function(d){return "إظهار القطع"},
"showCodeHeader":function(d){return "اظهار الكود البرمجي"},
"showGeneratedCode":function(d){return "اظهار الكود البرمجي"},
"showTextHeader":function(d){return "أظهر النص"},
"showVersionsHeader":function(d){return "Version History"},
"showToolbox":function(d){return "إظهار علبة الأدوات"},
"signup":function(d){return "سجل لمشاهدة مقدمة الدورة"},
"stringEquals":function(d){return "الكلمة هستاوى إيه؟"},
"subtitle":function(d){return "بيئة البرمجة المرئية"},
"textVariable":function(d){return "نص"},
"toggleBlocksErrorMsg":function(d){return "أنت تحتاج لتصحيح الخطأ في برنامجك قبل أن يمكنك عرضه كمكعبات"},
"tooFewBlocksMsg":function(d){return "أنت استخدمت كل انواع القطع الضرورية ولكن حاول ان تستخدم المزيد من هذه الأنواع من القطع لأكمال هذا اللغز."},
"tooManyBlocksMsg":function(d){return "يمكن حل هذا اللغز مع <x id='END_SPAN'/><x id='START_SPAN'/> قطع."},
"tooMuchWork":function(d){return "جعلتني أقوم بالكثير من العمل!  هل بإمكانك أن تحاول جعل مرات التكرار أقل؟"},
"toolboxHeader":function(d){return "قطع"},
"toolboxHeaderDroplet":function(d){return "علبة الأدوات"},
"totalNumLinesOfCodeWritten":function(d){return "مجموع كل الاوقات: "+common_locale.p(d,"numLines",0,"ar",{"one":"1 خط","other":common_locale.n(d,"numLines")+" خطوط"})+"  من الكود البرمجي."},
"tryAgain":function(d){return "حاول مرة أخرى"},
"tryHOC":function(d){return "جرب \"Hour of Code\""},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "هل تريد أن تتعلم البرمجة؟"},
"watchVideo":function(d){return "شاهد الفيديو"},
"when":function(d){return "عندما"},
"whenRun":function(d){return "عند التشغيل"},
"workspaceHeaderShort":function(d){return "مساحة العمل: "}};