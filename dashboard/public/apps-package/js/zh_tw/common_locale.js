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
"and":function(d){return "且"},
"backToPreviousLevel":function(d){return "返回上一關"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "程式積木"},
"booleanFalse":function(d){return "假"},
"booleanTrue":function(d){return "真"},
"catActions":function(d){return "動作類別"},
"catColour":function(d){return "顏色"},
"catLists":function(d){return "清單類"},
"catLogic":function(d){return "邏輯類"},
"catLoops":function(d){return "迴圈類"},
"catMath":function(d){return "運算類"},
"catProcedures":function(d){return "函數類別"},
"catText":function(d){return "文字類"},
"catVariables":function(d){return "變數類"},
"clearPuzzle":function(d){return "重新開始"},
"clearPuzzleConfirm":function(d){return "這會讓這一關重新開始。之前你所新增或改變的都將會回復原狀。"},
"clearPuzzleConfirmHeader":function(d){return "你確定要重新開始嗎？"},
"codeMode":function(d){return "程式碼"},
"codeTooltip":function(d){return "觀看產生的 JavaScript 程式碼。"},
"completedWithoutRecommendedBlock":function(d){return "恭喜你! 完成了第 "+common_locale.v(d,"puzzleNumber")+" 關。(但你可以使用不同的程式積木來完成更好的程式碼)"},
"continue":function(d){return "繼續 "},
"copy":function(d){return "複製"},
"defaultTwitterText":function(d){return "看看我做了什麼"},
"designMode":function(d){return "設計"},
"dialogCancel":function(d){return "取消"},
"dialogOK":function(d){return "確定"},
"directionEastLetter":function(d){return "東"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionWestLetter":function(d){return "西"},
"dropletBlock_addOperator_description":function(d){return "加入兩個數字"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "值"},
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
"dropletBlock_mathRandom_description":function(d){return "傳回一個從0(包含) 到1(不包含) 之間的亂數數值。"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "數學.亂數()"},
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
"dropletBlock_randomNumber_param0":function(d){return "最小值"},
"dropletBlock_randomNumber_param0_description":function(d){return "傳回的最小數值"},
"dropletBlock_randomNumber_param1":function(d){return "最大值"},
"dropletBlock_randomNumber_param1_description":function(d){return "傳回的最大數值"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "回傳"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "函式 "+common_locale.v(d,"name")+" 有未完成的輸入。"},
"emptyBlockInVariable":function(d){return "變數 "+common_locale.v(d,"name")+" 有未完成的輸入。"},
"emptyBlocksErrorMsg":function(d){return "「重複」和「如果」程式積木需要包含其它積木在裏面才能正常運作。請檢查內部的程式積木放得正不正確。"},
"emptyExampleBlockErrorMsg":function(d){return "函數 "+common_locale.v(d,"functionName")+" 至少需要兩個例子。請確定一下每個例子都有被呼叫到並傳回結果。"},
"emptyFunctionBlocksErrorMsg":function(d){return "函式積木裡面需要放其他程式積木才能運作。"},
"emptyFunctionalBlock":function(d){return "你有一塊程式積木沒有完整的輸入。"},
"emptyTopLevelBlock":function(d){return "現在沒有程式積木可以執行。您必須將一個程式積木接到 "+common_locale.v(d,"topLevelBlockName")+" 區塊。"},
"end":function(d){return "結束"},
"errorEmptyFunctionBlockModal":function(d){return "在您的函式積木中要有程式積木。按一下「編輯」並在把其他程式積木拖到綠色積木之內。"},
"errorIncompleteBlockInFunction":function(d){return "按一下「編輯」來確定你的函式中沒有缺少任何程式積木。"},
"errorParamInputUnattached":function(d){return "在工作區中，記得在函式積木上每個參數輸入的地方加上一個程式積木。"},
"errorQuestionMarksInNumberField":function(d){return "試把 \"???\" 更換為一個值。"},
"errorRequiredParamsMissing":function(d){return "點按「編輯」並加上需要的參數值，就可以為你的函式積木建立一個參數。把新的參數積木拖到函數定義中。"},
"errorUnusedFunction":function(d){return "你建立了一個函式，但並沒有在工作區上使用它！在工具箱中點一下「函式」，並確認在你的程式中有沒有使用到它。"},
"errorUnusedParam":function(d){return "你加入一個參數積木，但是函式定義中沒有用到它。請按一下「編輯」，並且在綠色區塊裏放入參數積木，以確保使用到你的參數。"},
"exampleErrorMessage":function(d){return "函式 "+common_locale.v(d,"functionName")+" 中有一個以上的例子需要調整。請確認一下這些例子與您的函式定義相符，並能夠回答這個問題。"},
"examplesFailedOnClose":function(d){return "你有一個以上的例子與函式定義不相符。請在關閉前檢查一下例子。"},
"extraTopBlocks":function(d){return "你有一些流浪在外的區塊。"},
"extraTopBlocksWhenRun":function(d){return "你有一些在外面流浪的區塊喔。你是不是要讓它們回到「當按下執行時」的積木身邊？"},
"finalStage":function(d){return "恭喜你 ！你已完成最後關卡的挑戰。"},
"finalStageTrophies":function(d){return "恭喜! 你已完成最後關卡並且贏得 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"一個獎盃","other":common_locale.n(d,"numTrophies")+" 獎盃"})+"."},
"finish":function(d){return "完成 "},
"generatedCodeInfo":function(d){return "就連頂尖大學也使用程式積木來進行程式教學（例如： "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"）。但是藏在底下的是，你所組裝的每個程式積木都可以用 JavaScript 語法（世界上使用最廣的程式語言之一）來表示："},
"hashError":function(d){return "對不起，'%1' 無法對應任何已儲存的程式。"},
"help":function(d){return "說明"},
"hideToolbox":function(d){return "(隱藏)"},
"hintHeader":function(d){return "提示："},
"hintRequest":function(d){return "查看提示"},
"hintTitle":function(d){return "提示："},
"ignore":function(d){return "忽略"},
"infinity":function(d){return "無限大"},
"jump":function(d){return "跳"},
"keepPlaying":function(d){return "繼續玩"},
"levelIncompleteError":function(d){return "您已使用了所有必要類型的程式積木，但方式不太正確。"},
"listVariable":function(d){return "清單變數"},
"makeYourOwnFlappy":function(d){return "做出自己的 Flappy 遊戲"},
"missingRecommendedBlocksErrorMsg":function(d){return "不完全正確。使用一個你還沒使用過的程式積木試看看!"},
"missingRequiredBlocksErrorMsg":function(d){return "不完全正確。你必須使用一個還沒使用過的程式積木!"},
"nestedForSameVariable":function(d){return "您在兩個以上的巢狀迴圈中使用相同的變數。請用不同並唯一的變數名稱來避免無限迴圈。"},
"nextLevel":function(d){return "恭喜！你已完成第 "+common_locale.v(d,"puzzleNumber")+" 關。"},
"nextLevelTrophies":function(d){return "恭喜！你已經完成第 "+common_locale.v(d,"puzzleNumber")+" 關，並且贏得了 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"1 個獎盃","other":common_locale.n(d,"numTrophies")+" 個獎盃"})+"。"},
"nextPuzzle":function(d){return "下一關"},
"nextStage":function(d){return " 恭喜你！你已經完成 "+common_locale.v(d,"stageName")+"。"},
"nextStageTrophies":function(d){return "恭喜！你已經完成 "+common_locale.v(d,"stageName")+" 階段，並贏得了 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"1 個獎盃","other":common_locale.n(d,"numTrophies")+" 個獎盃"})+"。"},
"numBlocksNeeded":function(d){return "恭喜！你已經完成第 "+common_locale.v(d,"puzzleNumber")+" 關。 (但是，你可以只使用 "+common_locale.p(d,"numBlocks",0,"zh",{"one":"1 個程式積木","other":common_locale.n(d,"numBlocks")+" 個程式積木"})+"來完成挑戰哦！)"},
"numLinesOfCodeWritten":function(d){return "你已經撰寫了 "+common_locale.p(d,"numLines",0,"zh",{"one":"一行","other":common_locale.n(d,"numLines")+" 行"})+" 的程式碼！"},
"openWorkspace":function(d){return "它是如何運作的"},
"orientationLock":function(d){return "在裝置設定中關閉旋轉鎖定。"},
"play":function(d){return "玩"},
"print":function(d){return "列印"},
"puzzleTitle":function(d){return "階段 "+common_locale.v(d,"stage_total")+" 的第 "+common_locale.v(d,"puzzle_number")+" 關"},
"readonlyWorkspaceHeader":function(d){return "只能觀看： "},
"repeat":function(d){return "重複"},
"resetProgram":function(d){return "再試一次"},
"rotateText":function(d){return "旋轉您的設備。"},
"runProgram":function(d){return "執行"},
"runTooltip":function(d){return "執行工作區中程式積木所定義的程式碼。"},
"runtimeErrorMsg":function(d){return "您的程式並未執行成功。請刪除第 "+common_locale.v(d,"lineNumber")+" 行並再試一次。"},
"saveToGallery":function(d){return "保存到作品集"},
"savedToGallery":function(d){return "已經保存到作品集了！"},
"score":function(d){return "分數"},
"sendToPhone":function(d){return "傳送到手機"},
"shareFailure":function(d){return "抱歉, 我們無法分享這個程式"},
"shareWarningsAge":function(d){return "請提供您的年齡，並點擊「確認」以繼續。"},
"shareWarningsMoreInfo":function(d){return "詳情"},
"shareWarningsStoreData":function(d){return "這個 app 是 Code Studio 建立用來儲存資料，可以由任何人使用此共用連結和查看。如果有人要求您提供個人資訊，請小心。"},
"showBlocksHeader":function(d){return "顯示積木"},
"showCodeHeader":function(d){return "顯示程式碼"},
"showGeneratedCode":function(d){return "顯示程式碼"},
"showTextHeader":function(d){return "顯示內容"},
"showToolbox":function(d){return "顯示工具箱"},
"showVersionsHeader":function(d){return "版本歷史"},
"signup":function(d){return "報名參加簡介課程"},
"stringEquals":function(d){return "字串=？"},
"submit":function(d){return "送出"},
"submitYourProject":function(d){return "提交您的專案"},
"submitYourProjectConfirm":function(d){return "專案提交後將無法再編輯，確定要送出嗎?"},
"unsubmit":function(d){return "不提交"},
"unsubmitYourProject":function(d){return "取消提交專案"},
"unsubmitYourProjectConfirm":function(d){return "取消提交專案將會重設專案提交日期，確定要取消嗎？"},
"subtitle":function(d){return "一個視覺化的程式設計環境\n\n"},
"syntaxErrorMsg":function(d){return "你的程式含一個錯誤。請刪除第 "+common_locale.v(d,"lineNumber")+" 行並再試一次。"},
"textVariable":function(d){return "文字變數"},
"toggleBlocksErrorMsg":function(d){return "您需要更正您程式中的一個錯誤，才能以積木顯示。"},
"tooFewBlocksMsg":function(d){return "你已使用所有必要類型的程式積木，但請嘗試使用更多同類型的程式積木來完成這個關卡。"},
"tooManyBlocksMsg":function(d){return "這個關卡可以用 < x id = 'START_SPAN' / > < x id = 'END_SPAN' / > 個程式積木解決。"},
"tooMuchWork":function(d){return "您讓我做太多工作了！可以試著減少一些重複次數嗎？"},
"toolboxHeader":function(d){return "程式積木"},
"toolboxHeaderDroplet":function(d){return "工具箱"},
"totalNumLinesOfCodeWritten":function(d){return "到目前為止共撰寫了："+common_locale.p(d,"numLines",0,"zh",{"one":"1 行","other":common_locale.n(d,"numLines")+" 行"})+" 的程式碼。"},
"tryAgain":function(d){return "再試一次"},
"tryBlocksBelowFeedback":function(d){return "試著從下列程式積木中挑選一個用看看："},
"tryHOC":function(d){return "試試一小時的程式設計課程"},
"unnamedFunction":function(d){return "你有一個沒有名稱的變數或函式。別忘了給一個具描述性的名稱。"},
"wantToLearn":function(d){return "想要學習寫程式嗎?"},
"watchVideo":function(d){return "觀看影片"},
"when":function(d){return "當"},
"whenRun":function(d){return "當按下\"執行\"時"},
"workspaceHeaderShort":function(d){return "工作區:"},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};