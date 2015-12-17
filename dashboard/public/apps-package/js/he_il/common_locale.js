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
"and":function(d){return "ו"},
"backToPreviousLevel":function(d){return "חזרה לשלב הקודם"},
"blocklyMessage":function(d){return "בלוקלי"},
"blocks":function(d){return "בלוקים"},
"booleanFalse":function(d){return "שגוי"},
"booleanTrue":function(d){return "נכון"},
"catActions":function(d){return "פעולות"},
"catColour":function(d){return "צבע"},
"catLists":function(d){return "רשימות"},
"catLogic":function(d){return "הגיון"},
"catLoops":function(d){return "לולאות"},
"catMath":function(d){return "מתמטיקה"},
"catProcedures":function(d){return "פונקציות"},
"catText":function(d){return "טקסט"},
"catVariables":function(d){return "משתנים"},
"clearPuzzle":function(d){return "התחל מחדש"},
"clearPuzzleConfirm":function(d){return "זה יאפס את הפאזל למצבו ההתחלתי, וימחק את כל הבלוקים שהוספת או שינית."},
"clearPuzzleConfirmHeader":function(d){return "האם אתה בטוח שאתה רוצה להתחיל מחדש?"},
"codeMode":function(d){return "קוד"},
"codeTooltip":function(d){return "ראה קוד JavaScript שנוצר."},
"completedWithoutRecommendedBlock":function(d){return "מזל טוב! השלמת את הפאזל "+common_locale.v(d,"puzzleNumber")+". (אך באפשרותך להשתמש בבלוקים שונים עבור קוד חזק יותר)"},
"continue":function(d){return "המשך"},
"copy":function(d){return "העתק"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "איפיון"},
"dialogCancel":function(d){return "בטל"},
"dialogOK":function(d){return "אישור"},
"directionEastLetter":function(d){return "מז"},
"directionNorthLetter":function(d){return "צ"},
"directionSouthLetter":function(d){return "ד"},
"directionWestLetter":function(d){return "מע"},
"dropletBlock_addOperator_description":function(d){return "הוסף שני מספרים"},
"dropletBlock_addOperator_signatureOverride":function(d){return "הוסף פעולה"},
"dropletBlock_andOperator_description":function(d){return "מחזירה true רק כאשר שני הביטויים הם true ו- false אחרת"},
"dropletBlock_andOperator_signatureOverride":function(d){return "פעולת \"וגם\" בוליאנית"},
"dropletBlock_assign_x_description":function(d){return "מקצה ערך למשתנה קיים. לדוגמא: x=0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "שם המשתנה אליו הוא משויך"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "הערך שהמשתנה מוקצה אליו."},
"dropletBlock_assign_x_signatureOverride":function(d){return "הקצה משתנה"},
"dropletBlock_callMyFunction_description":function(d){return "קורא לפונקציה בשם שלא מקבלת פרמטרים"},
"dropletBlock_callMyFunction_n_description":function(d){return "קרא לפונקציה שמקבלת פרמטר אחד או יותר"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "קרא לפונקציה עם פרמטרים"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "קרא לפונקציה"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "צור משתנה והקצה אותו למערך עם ערכים התחלתיים נתונים"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "הערכים ההתחלתיים למערך"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"הזן ערך\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"הזן ערך\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "הצהר על משתנה"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "הצהר על משתנה"},
"dropletBlock_divideOperator_description":function(d){return "חלק שני מספרים"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "חלק את האופרטור"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "לולאת for"},
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
"dropletBlock_mathRandom_description":function(d){return "מחזיר מספר אקראי הנע בין 0 (כולל) עד 1 (לא כולל)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "בחר.אקראי()"},
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
"dropletBlock_randomNumber_param0":function(d){return "מינימום"},
"dropletBlock_randomNumber_param0_description":function(d){return "המספר המינימלי המוחזר"},
"dropletBlock_randomNumber_param1":function(d){return "מקסימום"},
"dropletBlock_randomNumber_param1_description":function(d){return "המספר המקסימלי המוחזר"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "החזר"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "בפונקציה "+common_locale.v(d,"name")+" יש קלט לא מלא."},
"emptyBlockInVariable":function(d){return "למשתנה "+common_locale.v(d,"name")+" יש קלט לא מלא."},
"emptyBlocksErrorMsg":function(d){return "בלוקי ה\"חזור שוב\" או ה\"אם\" צריכים בלוקים אחרים בתוכם כדי לעבוד. וודא כי הבלוק הפנימי מתאים בבלוק החיצוני."},
"emptyExampleBlockErrorMsg":function(d){return "אתה צריך לפחות שתי דוגמאות בפונקציה "+common_locale.v(d,"functionName")+". ודא כי לכל דוגמה יש קריאה ותוצאה."},
"emptyFunctionBlocksErrorMsg":function(d){return "פונקציית הבלוק דורשת בלוקים אחרים בתוכה כדי לעבוד."},
"emptyFunctionalBlock":function(d){return "נותר לך בלוק ללא קלט."},
"emptyTopLevelBlock":function(d){return "אין מה להריץ, יש לחבר בלוק לבלוק ההתחלה ("+common_locale.v(d,"topLevelBlockName")+")."},
"end":function(d){return "סוף"},
"errorEmptyFunctionBlockModal":function(d){return "צריכים להיות בלוקים בתוך הגדרת הפונקציה שלך. לחץ על \"עריכה\" וגרור את הבלוקים שבתוך הבלוק הירוק."},
"errorIncompleteBlockInFunction":function(d){return "לחץ על \"ערוך\" כדי לוודא שאין לך בלוקים חסרים בתוך הגדרת הפונקציה שלך."},
"errorParamInputUnattached":function(d){return "זכור להצמיד בלוק לכל פרמטר קלט שבבלוק הפונקציה בסביבת העבודה שלך."},
"errorQuestionMarksInNumberField":function(d){return "נסה להחליף \"???\" בערך כלשהו."},
"errorRequiredParamsMissing":function(d){return "תיצור פרמטר לפונקציה שלך ע\"י לחיצה על \"עריכה\" והוספת הפרמטים הנחוצים. גרור את בלוק הפרמטר החדש אל תוך הגדרת הפונקציה שלך."},
"errorUnusedFunction":function(d){return "יצרת פונקציה, אך לא ביצעת בה שימוש בסביבת העבודה שלך! לחץ על \"פונקציות\" בארגז הכלים ותוודא שאתה משתמש בה בתוכנית שלך."},
"errorUnusedParam":function(d){return "הוספת בלוק פרמטר, אבל לא ביצעת בו שימוש בהגדרה. הקפד להשתמש בפרמטר על ידי לחיצה על \"עריכה\" והצבת בלוק הפרמטר בתוך הבלוק הירוק."},
"exampleErrorMessage":function(d){return "לפונקציה "+common_locale.v(d,"functionName")+" יש דוגמא אחת או יותר הזקוקה להתאמה. וודא שהן תואמות את ההגדרה שלך ועונות על השאלה."},
"examplesFailedOnClose":function(d){return "דוגמא אחת לפחות אינה תואמת את ההגדרה שלך. בדוק את אדוגמאות לפני הסגירה"},
"extraTopBlocks":function(d){return "נותרו לך בלוקים לא מצורפים."},
"extraTopBlocksWhenRun":function(d){return "נותרו לך בלוקים לא מצורפים. האם התכוונת לצרף אותם לבלוק \"בזמן ריצה\"?"},
"finalStage":function(d){return "מזל טוב! השלמת את השלב הסופי."},
"finalStageTrophies":function(d){return "מזל טוב! השלמת את השלב הסופי וזכית ב"+common_locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":common_locale.n(d,"numTrophies")+" פרסים"})+"."},
"finish":function(d){return "סיים"},
"generatedCodeInfo":function(d){return "אפילו האוניברסטאות הטובות ביותר מלמדות תכנות בשיטת בלוקים (לדוגמה, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). אבל מתחת למכסה המנוע, המיומנויות שרכשת ניתנות למימוש גם בג'אווה סקריפט, שפת התכנות הפופלרית בעולם:"},
"hashError":function(d){return "סליחה, אך '%1' אינו תואם לאף תוכנית שנשמרה."},
"help":function(d){return "עזרה"},
"hideToolbox":function(d){return "(הסתר)"},
"hintHeader":function(d){return "הנה עצה:"},
"hintRequest":function(d){return "ראה רמז"},
"hintTitle":function(d){return "רמז:"},
"ignore":function(d){return "התעלם"},
"infinity":function(d){return "אינסוף"},
"jump":function(d){return "קפוץ"},
"keepPlaying":function(d){return "להמשיך לשחק"},
"levelIncompleteError":function(d){return "הנך משתמש בכל סוגי הבלוקים הנדרשים אך לא באופן הנכון."},
"listVariable":function(d){return "רשימה"},
"makeYourOwnFlappy":function(d){return "תיצור משחק Flappy משלך"},
"missingRecommendedBlocksErrorMsg":function(d){return ". לא בדיוק- נסה להשתמש בבלוק שאינך משתמש בו עדיין."},
"missingRequiredBlocksErrorMsg":function(d){return ". לא בדיוק- אתה צריך להשתמש בלוק שאינך משתמש בו עדיין."},
"nestedForSameVariable":function(d){return "הנך משתמש באותו משתנה בתוך שתי לולאות מקוננות או יותר. השתמש במשתנים יחודיים בכדי להמנע מלולאה אין סופית."},
"nextLevel":function(d){return "מזל טוב! השלמת את פאזל "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "מזל טוב! השלמת את פאזל "+common_locale.v(d,"puzzleNumber")+" וזכית ב"+common_locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":common_locale.n(d,"numTrophies")+" פרסים"})+"."},
"nextPuzzle":function(d){return "פאזל הבא"},
"nextStage":function(d){return "מזל טוב! השלמת "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return " הכבוד! השלמת את שלב "+common_locale.v(d,"stageName")+" וזכית ב-"+common_locale.p(d,"numTrophies",0,"he",{"one":"פרס","other":common_locale.n(d,"numTrophies")+" פרסים"})+"."},
"numBlocksNeeded":function(d){return "כל הכבוד! השלמת את חידה "+common_locale.v(d,"puzzleNumber")+". (עם זאת, יכולת להשתמש רק ב "+common_locale.p(d,"numBlocks",0,"he",{"one":"1 בלוק","other":common_locale.n(d,"numBlocks")+" בלוקים"})+".)"},
"numLinesOfCodeWritten":function(d){return "כתבת "+common_locale.p(d,"numLines",0,"he",{"one":"שורת","other":common_locale.n(d,"numLines")+" שורות"})+" קוד!"},
"openWorkspace":function(d){return "איך זה עובד"},
"orientationLock":function(d){return "בטל את נעילת הכיוון בהגדרות המכשיר."},
"play":function(d){return "הפעל"},
"print":function(d){return "הדפס"},
"puzzleTitle":function(d){return "חידה "+common_locale.v(d,"puzzle_number")+" מ- "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "הצג רק: "},
"repeat":function(d){return "חזור על"},
"resetProgram":function(d){return "אפס"},
"rotateText":function(d){return "סובב את המכשיר שלך."},
"runProgram":function(d){return "הרץ"},
"runTooltip":function(d){return "הפעל את התוכנית המוגדרת על-ידי הבלוקים בסביבת העבודה."},
"runtimeErrorMsg":function(d){return "התוכנית לא רצה בהצלחה. אנא הסר את שורה מספר "+common_locale.v(d,"lineNumber")+" ונסה שנית."},
"saveToGallery":function(d){return "שמור לגלריה"},
"savedToGallery":function(d){return "נשמר בגלריה!"},
"score":function(d){return "ציון"},
"sendToPhone":function(d){return "שלח לטלפון"},
"shareFailure":function(d){return "מצטערים, אנחנו לא יכולים לשתף תוכנית זו."},
"shareWarningsAge":function(d){return "אנא רשום את גילך כאן ולחץ אישור בכדי להמשיך."},
"shareWarningsMoreInfo":function(d){return "מידע נוסף"},
"shareWarningsStoreData":function(d){return "ישום זה הבנוי על קוד-סטודיו מאחסן מידע אשר יכול להראות על ידי כל אחד באמצעות שיתוף קישור זה, כך שעליך להיות זהיר במידה ותתבקש לספק מידע אישי."},
"showBlocksHeader":function(d){return "הצג בלוקים"},
"showCodeHeader":function(d){return "הצג קוד"},
"showGeneratedCode":function(d){return "הצג קוד"},
"showTextHeader":function(d){return "הצג טקסט"},
"showToolbox":function(d){return "הצג את ארגז הכלים"},
"showVersionsHeader":function(d){return "היסטורית גירסאות"},
"signup":function(d){return "הירשם לקורס המבוא"},
"stringEquals":function(d){return "מחרוזת=?"},
"submit":function(d){return "שלח"},
"submitYourProject":function(d){return "הגש את הפרוייקט"},
"submitYourProjectConfirm":function(d){return "אינך יכול לערוך את הפרוייקט לאחר הגשתו. האם אתה בטוח שברצונך להגישו?"},
"unsubmit":function(d){return "בטל הגשה"},
"unsubmitYourProject":function(d){return "בטל את הגשת הפרוייקט שלך"},
"unsubmitYourProjectConfirm":function(d){return "ביטול הגשת הפרוייקט יאפס את תאריך ההגשה, באמת לבטל?"},
"subtitle":function(d){return "סביבת תיכנות חזותית"},
"syntaxErrorMsg":function(d){return "התוכנה שלך מכילה שגיאת הקלדה. אנא הסר את שורה מספר "+common_locale.v(d,"lineNumber")+" ונסה שנית."},
"textVariable":function(d){return "טקסט"},
"toggleBlocksErrorMsg":function(d){return "עליך לתקן שגיאה בתוכנית שלך, לפני שהיא תוכל להיות מוצגת בצורת בלוקים."},
"tooFewBlocksMsg":function(d){return "אתה משתמש בכל סוגי הבלוקים הנחוצים, אך נסה להשתמש ביותר בלוקים מסוגים אלו כדי להשלים את הפאזל."},
"tooManyBlocksMsg":function(d){return "ניתן לפתור את החידה הזאת עם  <x id='START_SPAN'/><x id='END_SPAN'/>  בלוקים."},
"tooMuchWork":function(d){return "גרמת לי להרבה עבודה! האם אתה יכול לנסות לחזור פחות פעמים?"},
"toolboxHeader":function(d){return "בלוקים"},
"toolboxHeaderDroplet":function(d){return "ארגז כלים"},
"totalNumLinesOfCodeWritten":function(d){return "סך כל הזמנים:  "+common_locale.p(d,"numLines",0,"he",{"one":"שורה אחת","other":common_locale.n(d,"numLines")+" שורות"})+" של קוד."},
"tryAgain":function(d){return "נסה שוב"},
"tryBlocksBelowFeedback":function(d){return "נסה להשתמש באחת מהבלוקים שלהלן:"},
"tryHOC":function(d){return "נסה את \"שעת הקוד\" (Hour of Code)"},
"unnamedFunction":function(d){return "יש לך משתנה או פונקציה ללא שם. אל תשכח לתת שם תיאורי לכל דבר."},
"wantToLearn":function(d){return "רוצה ללמוד לתכנת?"},
"watchVideo":function(d){return "צפה בסרטון"},
"when":function(d){return "מתי"},
"whenRun":function(d){return "מתי לרוץ"},
"workspaceHeaderShort":function(d){return "סביבת העבודה: "}};