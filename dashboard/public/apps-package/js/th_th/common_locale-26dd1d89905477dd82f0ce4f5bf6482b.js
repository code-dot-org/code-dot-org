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
"and":function(d){return "และ"},
"backToPreviousLevel":function(d){return "กลับไปยังระดับก่อนหน้า"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "บล็อก"},
"booleanFalse":function(d){return "เท็จ"},
"booleanTrue":function(d){return "จริง"},
"catActions":function(d){return "การดำเนินการ"},
"catColour":function(d){return "สี"},
"catLists":function(d){return "ลิสต์"},
"catLogic":function(d){return "ตรรกะ"},
"catLoops":function(d){return "ลูป"},
"catMath":function(d){return "คำนวณ"},
"catProcedures":function(d){return "ฟังก์ชัน"},
"catText":function(d){return "ข้อความ"},
"catVariables":function(d){return "ตัวแปร"},
"clearPuzzle":function(d){return "เริ่มต้นใหม่"},
"clearPuzzleConfirm":function(d){return "สิ่งนี้จะเริ่มต้นเกมใหม่ที่จุดเริ่มต้นและลบทุกบล็อกที่คุณเพิ่มหรือเปลี่ยนออกไป."},
"clearPuzzleConfirmHeader":function(d){return "คุณจะเริ่มต้นใหม่จริงๆหรือ ?"},
"codeMode":function(d){return "โปรแกรม"},
"codeTooltip":function(d){return "ดูการสร้างโค้ด JavaScript."},
"continue":function(d){return "ดำเนินการต่อไป"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "ออกแบบ"},
"dialogCancel":function(d){return "ยกเลิก"},
"dialogOK":function(d){return "ตกลง"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "เพิ่มตัวเลขสองตัว"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "คืนค่าเป็นจริงก็ต่อเมื่อนิพจน์ทั้งสองเป็นจริง หรือเท็จทั้งคู่"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ตัวดำเนินการทางตรรกศาสตร์ \"และ\""},
"dropletBlock_assign_x_description":function(d){return "กำหนดค่าตัวแปรใหม่"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "กำหนดตัวแปร"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "สร้างตัวแปรเป็นอาร์เรย์"},
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
"dropletBlock_declareAssign_x_prompt_description":function(d){return "สร้างตัวแปรและกำหนดค่าให้แสดงค่าพื้นฐาน"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "ประกาศตัวแปร"},
"dropletBlock_divideOperator_description":function(d){return "หารตัวเลขสองตัว"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "ตรวจสอบความเท่ากัน"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "สร้างลูปที่มีคำสั่งกำหนดค่า เงื่อนไขการทำงานของลูป การเปลี่ยนแปลงค่าตัวแปร และบล็อคของคำสั่งที่จะทำสำหรับการลูปแต่ละครั้ง"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "ลูป for"},
"dropletBlock_functionParams_n_description":function(d){return "กลุ่มของคำสั่งที่มีพารามิเตอร์ตั้งแต่ 1 ตัวขึ้นไป และทำงานตามคำสั่งที่กำหนดไว้เมื่อเรียกใช้งาน"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "กำหนดฟังก์ชันที่มีพารามิเตอร์"},
"dropletBlock_functionParams_none_description":function(d){return "กลุ่มของคำสั่งที่ทำงานเมื่อเรียกใช้งาน"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "กำหนดฟังก์ชัน"},
"dropletBlock_getTime_description":function(d){return "รับเวลาในปัจจุบันเป็นหน่วยมิลลิวินาที"},
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
"dropletBlock_notOperator_signatureOverride":function(d){return "ตัวดำเนินการทางตรรกศาสตร์ \"และ\""},
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
"dropletBlock_return_signatureOverride":function(d){return "ย้อนกลับ"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "\"ทำซ้ำ\" หรือ \"ถ้า\" บล็อกจำเป็นต้องมีบล็อกอื่น ๆ ภายในจึงจะทำงาน. ตรวจสอบให้แน่ใจว่า บล็อกภายในเข้ากันอย่างถูกต้องแล้ว."},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyFunctionBlocksErrorMsg":function(d){return "บล็อกหน้าที่ต้องการให้มีบล็อกอื่นๆอยู่ด้านในถึงจะทำงานได้."},
"emptyFunctionalBlock":function(d){return "คุณมีบล็อกที่ไม่ได้เติมข้อมูลเข้า."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "สิ้นสุด"},
"errorEmptyFunctionBlockModal":function(d){return "มันควรจะมีบล็อกอยู่ภายในความหมายของหน้าการทำงานของโปรแกรม. คลิ่กที่ การแก้ไข และ ลาก บล็อกทั้งหลายภายในบล็อกสีเขียว."},
"errorIncompleteBlockInFunction":function(d){return "คลิ่กที่ การแก้ไข เพื่อให้แน่ใจว่า คุณไม่มีบล็อกค้างอยู่ภายในความหมายของหน้าที่การทำงาน."},
"errorParamInputUnattached":function(d){return "จำให้ได้ว่า จะต้องแนบบล็อกไปในแต่ละข้อมูลเข้าในบล็อกหน้าที่การทำงาน ในพื้นที่การทำงานของคุณ."},
"errorQuestionMarksInNumberField":function(d){return "ลองแทน \"???\" ด้วยค่า."},
"errorRequiredParamsMissing":function(d){return "สร้างพารามิเตอร์สำหรับฟังก์ชันของคุณ โดยคลิก \"แก้ไข\" และเพิ่มพารามิเตอร์ที่จำเป็น.\nลากบล็อกของพารามิเตอร์ใหม่ไปสู่นิยามของฟังก์ชัน."},
"errorUnusedFunction":function(d){return "คุณสร้างฟังก์ชัน แต่ไม่เคยใช้มันบนพื้นที่ทำงานของคุณ คลิกที่ \"ฟังก์ชัน\" ในกล่องเครื่องมือ และให้แน่ใจว่า คุณใช้ในโปรแกรมของคุณ."},
"errorUnusedParam":function(d){return "คุณเพิ่มบล็อกของตัวแทนค่า แต่อย่าใช้มันในการให้ความหมาย ให้แน่ใจว่า คุณ ใช้ตัวแปรของคุณโดยการคลิ่กที่ การแก้ไข และ วางมันลงไปที่บล็อกตัวแปร ด้านใน ของบล็อกเขียว."},
"extraTopBlocks":function(d){return "คุณมีบล็อกที่แยกออกไป คุณหมายถึง ว่าคุณจะแนบบล็อคเหล่านี้ไปที่ \"เมื่อรัน\" บล็อกหรือเปล่า ?"},
"extraTopBlocksWhenRun":function(d){return "You have unattached blocks. Did you mean to attach these to the \"when run\" block?"},
"finalStage":function(d){return "ขอแสดงความยินดี ขั้นตอนสุดท้ายสำเร็จแล้ว."},
"finalStageTrophies":function(d){return "ขอแสดงความยินดี คุณได้เสร็จสิ้นขั้นตอนสุดท้าย และชนะ "+common_locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "เสร็จ"},
"generatedCodeInfo":function(d){return "มหาวิทยาลัยชั้นนำสอนการเขียนโค้ดแบบ  บล็อกเบสต์   (e.g., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+").  แต่ภายใต้กรอบสี่เหลี่ยมนั้น,  คุณต้องประมวลผลให้บล็อกของคุณแสดงใน ภาษาจาว่า, ซึ่งเป็นภาษาที่กว้าง และสำคัญของโลก."},
"genericFeedback":function(d){return "ดูว่าคุณสิ้นสุดอย่างไร และพยายามที่จะแก้ไขโปรแกรมของคุณ."},
"hashError":function(d){return "ขออภัย '%1' ไม่ตรงกับโปรแกรมที่บันทึกไว้."},
"help":function(d){return "ขอความช่วยเหลือ"},
"hideToolbox":function(d){return "(ซ่อน)"},
"hintHeader":function(d){return "เคล็ดลับ:"},
"hintRequest":function(d){return "ดูคำแนะนำ"},
"hintTitle":function(d){return "คำแนะนำ:"},
"infinity":function(d){return "ไม่จำกัด"},
"jump":function(d){return "กระโดด"},
"keepPlaying":function(d){return "เล่นต่อไป"},
"levelIncompleteError":function(d){return "คุณกำลังใช้ทุกสิ่งทุกอย่างที่จำเป็นของบล็อก แต่ไม่ใช่ทางที่ถูกต้อง."},
"listVariable":function(d){return "รายการ"},
"makeYourOwnFlappy":function(d){return "สร้าง Flappy เกม ไว้เป็นของเราเอง"},
"missingBlocksErrorMsg":function(d){return "ลองอย่างน้อยหนึ่งบล็อกด้านล่างเพื่อแก้ปริศนานี้."},
"nextLevel":function(d){return "ขอแสดงความยินดี คุณเสร็จสิ้นปริศนา "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "ขอแสดงความยินดี คุณเสร็จสิ้นปริศนา "+common_locale.v(d,"puzzleNumber")+" และชนะ "+common_locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "เย้ ยินดีด้วย คุณผ่านด่าน "+common_locale.v(d,"stageName")+" แล้ว"},
"nextStageTrophies":function(d){return "เย้ ยินดีด้วย คุณผ่านด่าน "+common_locale.v(d,"stageName")+" แล้ว และยังได้ "+common_locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+" อีกด้วย !"},
"numBlocksNeeded":function(d){return "ขอแสดงความยินดี คุณสมบูรณ์ปริศนา "+common_locale.v(d,"puzzleNumber")+" (อย่างไรก็ตาม คุณสามารถใช้เฉพาะ "+common_locale.p(d,"numBlocks",0,"th",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "คุณเพิ่งเขียนรหัส "+common_locale.p(d,"numLines",0,"th",{"one":"1 บรรทัด","other":common_locale.n(d,"numLines")+" บรรทัด"})+"!"},
"openWorkspace":function(d){return "มันทำงานได้อย่างไร"},
"orientationLock":function(d){return "ปิดล็อควางแนวในการตั้งค่าอุปกรณ์."},
"play":function(d){return "เล่น"},
"print":function(d){return "พิมพ์"},
"puzzleTitle":function(d){return "ปริศนา "+common_locale.v(d,"puzzle_number")+" ของ "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "ดูเท่านั้น:"},
"repeat":function(d){return "ทำซ้ำ"},
"resetProgram":function(d){return "ตั้งค่าใหม่"},
"rotateText":function(d){return "หมุนอุปกรณ์ของคุณ."},
"runProgram":function(d){return "เริ่ม"},
"runTooltip":function(d){return "เรียกใช้โปรแกรมที่กำหนด โดยบล็อกในพื้นที่ทำงาน."},
"saveToGallery":function(d){return "จัดเก็บสู่ที่แสดงรูปภาพ"},
"savedToGallery":function(d){return "จัดเก็บสู่ที่แสดงรูปภาพเรียบร้อยแล้ว!"},
"score":function(d){return "ตะแนน"},
"shareFailure":function(d){return "ขออภัย เราไม่สามารถใช้โปรแกรมนี้ร่วมกันได้."},
"showBlocksHeader":function(d){return "แสดงบล็อก"},
"showCodeHeader":function(d){return "แสดงรหัส"},
"showGeneratedCode":function(d){return "แสดงโค้ด"},
"showTextHeader":function(d){return "Show Text"},
"showToolbox":function(d){return "แสดงกล่องเลรื่องมือ"},
"signup":function(d){return "ลงทะเบียนเพื่อทดลองเรียน"},
"stringEquals":function(d){return "ประโยค = ?"},
"subtitle":function(d){return "มุมมองสภาพการเขียนโปรแกรม"},
"textVariable":function(d){return "ข้อความ"},
"toggleBlocksErrorMsg":function(d){return "คุณต้องแก้ไขข้อผิดพลาดในโปรแกรมของคุณก่อนที่จะไปแสดงเป็นบล็อก."},
"tooFewBlocksMsg":function(d){return "คุณได้ใช้ทุกบล็อกที่จำเป็นแล้ว แต่ลองให้บล็อกหลากหลายมากกว่านี้เพื่อให้การแก้ปัญหาสมบูรณ์แบบ."},
"tooManyBlocksMsg":function(d){return "ปัญหานี้สามารถแก้ด้วยบล็อกนี้คือ <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "คุณทำให้ฉันทำงานหนัก! คุณจะทำซ้ำให้น้อยลงได้ไหม?"},
"toolboxHeader":function(d){return "บล็อก"},
"toolboxHeaderDroplet":function(d){return "กล่องเครื่องมือ"},
"totalNumLinesOfCodeWritten":function(d){return "รวมสรุป: "+common_locale.p(d,"numLines",0,"th",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" of code."},
"tryAgain":function(d){return "ลองอีกครั้ง"},
"tryHOC":function(d){return "ลองใช้ Hour of Code สิ"},
"wantToLearn":function(d){return "ต้องการศึกษาการเขียนโปรแกรมหรือ"},
"watchVideo":function(d){return "ดูวีดีโอ"},
"when":function(d){return "เมื่อ"},
"whenRun":function(d){return "เมื่อเรียกให้ทำงาน"},
"workspaceHeaderShort":function(d){return "พื้นที่ทำงาน: "}};