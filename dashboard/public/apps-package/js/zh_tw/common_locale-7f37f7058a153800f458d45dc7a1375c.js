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
"backToPreviousLevel":function(d){return "返回上一階段"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "區塊"},
"booleanFalse":function(d){return "假"},
"booleanTrue":function(d){return "真"},
"catActions":function(d){return "動作類別"},
"catColour":function(d){return "顏色"},
"catLists":function(d){return "清單/陣列類"},
"catLogic":function(d){return "邏輯類別"},
"catLoops":function(d){return "迴圈類別"},
"catMath":function(d){return "運算類別"},
"catProcedures":function(d){return "函數類別"},
"catText":function(d){return "本文"},
"catVariables":function(d){return "變數類別"},
"clearPuzzle":function(d){return "重新開始"},
"clearPuzzleConfirm":function(d){return "這將會使目前進行的題目重置並回一剛開始的狀態,且刪除之前你所增加或改變的區塊　　"},
"clearPuzzleConfirmHeader":function(d){return "你確定要重新開始嗎？"},
"codeMode":function(d){return "程式碼"},
"codeTooltip":function(d){return "觀看產生的 JavaScript 程式碼。"},
"continue":function(d){return "繼續 "},
"defaultTwitterText":function(d){return "Check out what I made"},
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
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "值"},
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
"dropletBlock_return_signatureOverride":function(d){return "回傳"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "\"重複\"和\"如果\"程式積木需要包含其它積木在裏面才能正常運作, 請檢查裏面是否有安排適當的程式積木."},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyFunctionBlocksErrorMsg":function(d){return "\"函式\"積木裡面需要放其他程式積木才能運作"},
"emptyFunctionalBlock":function(d){return "你有一塊未填充的程式積木。"},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "結束"},
"errorEmptyFunctionBlockModal":function(d){return "在此需要定義您的函式區塊。按一下\"編輯\"並在綠色區塊內部拖曳區塊。"},
"errorIncompleteBlockInFunction":function(d){return "按一下\"編輯\"來確保你的函式定義中沒有缺少任何區塊。"},
"errorParamInputUnattached":function(d){return "在你的工作區，記得附加一區塊到每個函數區塊輸入的參數。"},
"errorQuestionMarksInNumberField":function(d){return "試把 \"???\" 更換為一個值。"},
"errorRequiredParamsMissing":function(d){return "點按\"編輯\"和加入必要的參數值，為你的函數建立一個參數。拖曳新參數區塊到你的函數定義中。"},
"errorUnusedFunction":function(d){return "你建立一個函數，但從未在工作區上使用它 ！在工具箱中點按\"函數\"，並確認在你的程式中有使用它。"},
"errorUnusedParam":function(d){return "你加入一個參數區塊，但是定義中沒有使用它。請點按\"編輯\"，並且在綠色區塊裏放入參數區塊，以確認使用你的參數。"},
"extraTopBlocks":function(d){return "你有一些獨立的區塊"},
"extraTopBlocksWhenRun":function(d){return "你有一些獨立的區塊, 你的意思是要讓他們跟\"When run\"區塊相連嗎?"},
"finalStage":function(d){return "恭喜你 ！你已完成最後關卡的挑戰。"},
"finalStageTrophies":function(d){return "恭喜! 你已完成最後關卡並且贏得 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"一個獎盃","other":common_locale.n(d,"numTrophies")+" 獎盃"})+"."},
"finish":function(d){return "完成 "},
"generatedCodeInfo":function(d){return "就連頂尖大學也使用\"程式積木\"來進行程式教學。(例如 :  "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+")。但是藏在底下的是，你所組裝的每個程式積木都可以用JavaScript 語法（世界上使用最廣的程式語言之一）來表示。"},
"genericFeedback":function(d){return "看看你的成果如何, 並試著修正你的程式"},
"hashError":function(d){return "對不起，'%1' 無法對應任何已儲存的程式。"},
"help":function(d){return "說明"},
"hideToolbox":function(d){return "(隱藏)"},
"hintHeader":function(d){return "提示："},
"hintRequest":function(d){return "查看提示"},
"hintTitle":function(d){return "提示："},
"infinity":function(d){return "無窮"},
"jump":function(d){return "跳"},
"keepPlaying":function(d){return "繼續玩"},
"levelIncompleteError":function(d){return "您已使用了所有必要類型的程式積木，但方式不太正確。"},
"listVariable":function(d){return "列表變數"},
"makeYourOwnFlappy":function(d){return "做出自己的 Flappy 遊戲"},
"missingBlocksErrorMsg":function(d){return "請嘗試組合底下的程式積木來解決這一個關卡。"},
"nextLevel":function(d){return "恭喜你 ！你已完成第"+common_locale.v(d,"puzzleNumber")+"關。"},
"nextLevelTrophies":function(d){return "恭喜!你已經完成第"+common_locale.v(d,"puzzleNumber")+"關，並且贏得"+common_locale.p(d,"numTrophies",0,"zh",{"one":"1個獎盃","other":common_locale.n(d,"numTrophies")+" 獎盃"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return " 恭喜你！你已經完成 "+common_locale.v(d,"stageName")+"。"},
"nextStageTrophies":function(d){return "恭喜您!你已經完成\""+common_locale.v(d,"stageName")+"\"階段，並贏得"+common_locale.p(d,"numTrophies",0,"zh",{"one":"1個獎盃","other":common_locale.n(d,"numTrophies")+"個獎盃"})+"."},
"numBlocksNeeded":function(d){return "恭喜！你已經完成第 "+common_locale.v(d,"puzzleNumber")+" 關。 (但是，你可以只使用 "+common_locale.p(d,"numBlocks",0,"zh",{"one":"一個程式積木","other":common_locale.n(d,"numBlocks")+" 程式積木"})+".來完成挑戰哦！)"},
"numLinesOfCodeWritten":function(d){return "你已經撰寫了 "+common_locale.p(d,"numLines",0,"zh",{"one":"一行","other":common_locale.n(d,"numLines")+" 行"})+" 的程式碼！"},
"openWorkspace":function(d){return "它如何運作的"},
"orientationLock":function(d){return "在設備設置中關閉旋轉鎖定。"},
"play":function(d){return "玩"},
"print":function(d){return "列印"},
"puzzleTitle":function(d){return "階段 "+common_locale.v(d,"stage_total")+" 的第"+common_locale.v(d,"puzzle_number")+" 關"},
"repeat":function(d){return "重複"},
"resetProgram":function(d){return "再試一次"},
"rotateText":function(d){return "旋轉你的設備。"},
"runProgram":function(d){return "執行"},
"runTooltip":function(d){return "執行工作區中程式積木所定義的程式碼。"},
"saveToGallery":function(d){return "保存到作品集"},
"savedToGallery":function(d){return "已經保存到作品集了！"},
"score":function(d){return "分數"},
"shareFailure":function(d){return "抱歉, 我們無法分享這個程式"},
"showBlocksHeader":function(d){return "顯示積木"},
"showCodeHeader":function(d){return "顯示程式碼"},
"showGeneratedCode":function(d){return "顯示程式碼"},
"showTextHeader":function(d){return "顯示內容"},
"showToolbox":function(d){return "顯示工具箱"},
"signup":function(d){return "報名參加簡介課程"},
"stringEquals":function(d){return "字串=？"},
"subtitle":function(d){return "一個視覺化的程式設計環境\n\n"},
"textVariable":function(d){return "文本"},
"toggleBlocksErrorMsg":function(d){return "要讓您的程式可以像積木表示，您需要更正您程式中的一個錯誤。"},
"tooFewBlocksMsg":function(d){return "你已使用所有必要類型的程式積木，但請嘗試使用更多同類型的程式積木來完成這個關卡。"},
"tooManyBlocksMsg":function(d){return "這個關卡可以用 < x id = 'START_SPAN' / > < x id = 'END_SPAN' / > 個程式積木解決。"},
"tooMuchWork":function(d){return "你讓我做太多工作了! 可以試著減少一些重複次數嗎?"},
"toolboxHeader":function(d){return "程式模塊"},
"toolboxHeaderDroplet":function(d){return "工具箱"},
"totalNumLinesOfCodeWritten":function(d){return "到目前為止共撰寫了："+common_locale.p(d,"numLines",0,"zh",{"one":"1 行","other":common_locale.n(d,"numLines")+" 行"})+" 的程式碼。"},
"tryAgain":function(d){return "再試一次"},
"tryHOC":function(d){return "試試一小時的程式設計課程"},
"wantToLearn":function(d){return "想要學習寫程式嗎?"},
"watchVideo":function(d){return "觀看影片"},
"when":function(d){return "當"},
"whenRun":function(d){return "當按下\"執行\"時"},
"workspaceHeaderShort":function(d){return "工作區:"}};