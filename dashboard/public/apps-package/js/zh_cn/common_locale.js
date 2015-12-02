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
"and":function(d){return "和"},
"backToPreviousLevel":function(d){return "回到前一关"},
"blocklyMessage":function(d){return "布洛克里"},
"blocks":function(d){return "模块"},
"booleanFalse":function(d){return "错"},
"booleanTrue":function(d){return "真"},
"catActions":function(d){return "操作"},
"catColour":function(d){return "颜色"},
"catLists":function(d){return "列表"},
"catLogic":function(d){return "逻辑"},
"catLoops":function(d){return "循环"},
"catMath":function(d){return "数学"},
"catProcedures":function(d){return "函数"},
"catText":function(d){return "文本"},
"catVariables":function(d){return "变量"},
"clearPuzzle":function(d){return "重新开始"},
"clearPuzzleConfirm":function(d){return "你将重设这个猜谜至初始状态，并且删除所有你已经增加或更改的模块。"},
"clearPuzzleConfirmHeader":function(d){return "你确定要重新开始吗？"},
"codeMode":function(d){return "代码"},
"codeTooltip":function(d){return "请参见所生成的 JavaScript 代码。"},
"completedWithoutRecommendedBlock":function(d){return "恭喜你！你完成了第"+common_locale.v(d,"puzzleNumber")+" 个拼图。(但你可以尝试使用其他模块来写出更优美的代码)"},
"continue":function(d){return "继续"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "看看我做的"},
"designMode":function(d){return "设计"},
"dialogCancel":function(d){return "取消"},
"dialogOK":function(d){return "确定"},
"directionEastLetter":function(d){return "东"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionWestLetter":function(d){return "西"},
"dropletBlock_addOperator_description":function(d){return "添加两个数字"},
"dropletBlock_addOperator_signatureOverride":function(d){return "添加运算符"},
"dropletBlock_andOperator_description":function(d){return "仅当两个表达式同时为真返回结果为真，否则返回假"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND布尔运算符"},
"dropletBlock_assign_x_description":function(d){return "给已有变量指定一个值（赋值）。"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "变量名称被分配给"},
"dropletBlock_assign_x_param1":function(d){return "值"},
"dropletBlock_assign_x_param1_description":function(d){return "被分配给该变量的值。"},
"dropletBlock_assign_x_signatureOverride":function(d){return "指定一个变量"},
"dropletBlock_callMyFunction_description":function(d){return "调用一个已经命名的不带参数的函数"},
"dropletBlock_callMyFunction_n_description":function(d){return "调用一个已经定义的的有一个或多个参数的函数。"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "调用带参数的函数"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "调用函数"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "数组的初始值"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "声明一个变量时，需要在它前面加上var ，并在它的右侧赋值。"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"输入值\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"输入值\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "声明一个变量"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "声明一个变量"},
"dropletBlock_divideOperator_description":function(d){return "两个数相除"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "相等运算符"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for 循环"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "定义一个函数"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "如果语句"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "如果/否则 语句"},
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
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max (n1、 n2，......，nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1、 n2，......，nX)"},
"dropletBlock_mathRandom_description":function(d){return "返回一个大于等于0，且小于1的随机数。"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "数学. 随机()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "将两个数字相乘"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "或布尔运算符"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "最小"},
"dropletBlock_randomNumber_param0_description":function(d){return "返回的最小值"},
"dropletBlock_randomNumber_param1":function(d){return "最大"},
"dropletBlock_randomNumber_param1_description":function(d){return "返回的最大值"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "返回"},
"dropletBlock_setAttribute_description":function(d){return "设为给定的值"},
"dropletBlock_subtractOperator_description":function(d){return "两个数字相减"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while 循环"},
"emptyBlockInFunction":function(d){return "函数 "+common_locale.v(d,"name")+" 含有未指定的输入"},
"emptyBlockInVariable":function(d){return "变量 "+common_locale.v(d,"name")+" 含有一个未指定输入。"},
"emptyBlocksErrorMsg":function(d){return "“重复”或“如果”容器模块需要将其他的模块放在里面才能工作。请确保在容器模块里填入了合适的模块。"},
"emptyExampleBlockErrorMsg":function(d){return "函数 "+common_locale.v(d,"functionName")+" 需要至少两个例子。并且每个例子都被调用到和并传回了结果。"},
"emptyFunctionBlocksErrorMsg":function(d){return "函数模块需要有其他模块在里面才能工作"},
"emptyFunctionalBlock":function(d){return "你有一个未填入数据的模块。"},
"emptyTopLevelBlock":function(d){return "没有可以运行的模块。你必须将一个模块放在 "+common_locale.v(d,"topLevelBlockName")+" 下。"},
"end":function(d){return "结束"},
"errorEmptyFunctionBlockModal":function(d){return "你的函数定义内需要有模块. 按一下\"编辑\"并拖动模块到绿色模块内部."},
"errorIncompleteBlockInFunction":function(d){return "按一下\"编辑\"来确保你的函数定义中没有缺少任何模块."},
"errorParamInputUnattached":function(d){return "在工作区内，要在每个函数模块的参数上都放一个模块。"},
"errorQuestionMarksInNumberField":function(d){return "尝试把\"???\"更换成一个值."},
"errorRequiredParamsMissing":function(d){return "通过点击“编辑“来为你的函数创建必要的参数。将新的参数模块拖放到你的函数定义中。"},
"errorUnusedFunction":function(d){return "你创建了一个函数，但从来没有在工作区使用过! 点击工具箱中的“函数”，并确保你在程序中使用它."},
"errorUnusedParam":function(d){return "你添加了一个参数块，但没有在定义中使用它. 确保通过点击“编辑”来使用你的参数块并把参数块放在绿色模块内."},
"exampleErrorMessage":function(d){return "函数 "+common_locale.v(d,"functionName")+" 有一个或多个例子需要调整。请确认它们符合定义并有正确的返回值。"},
"examplesFailedOnClose":function(d){return "至少一个实例与你的定义不匹配。在关闭前检查一下。"},
"extraTopBlocks":function(d){return "你有一些未连接上的模块。"},
"extraTopBlocksWhenRun":function(d){return "你有一些未连接上的模块。你是否要把这些模块连接在“当运行时”模块上？"},
"finalStage":function(d){return "祝贺你 ！您已完成最后一章。"},
"finalStageTrophies":function(d){return "祝贺你 ！已完成最终章并赢得了 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"1个奖杯","other":common_locale.n(d,"numTrophies")+" 个奖杯"})+"。"},
"finish":function(d){return "完成"},
"generatedCodeInfo":function(d){return "一些顶级的大学都在教学中使用这种基于模块的编程方式（如： "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+" ）。归根结底，你组装的这些模块也可以显示为Javascript代码，Javascript是目前广泛使用的编程语言。"},
"hashError":function(d){return "对不起，'%1' 并不对应任何已保存的程序。"},
"help":function(d){return "帮助"},
"hideToolbox":function(d){return "(隐藏)"},
"hintHeader":function(d){return "提示："},
"hintRequest":function(d){return "查看提示"},
"hintTitle":function(d){return "提示："},
"ignore":function(d){return "忽略"},
"infinity":function(d){return "无限"},
"jump":function(d){return "跳转"},
"keepPlaying":function(d){return "继续玩"},
"levelIncompleteError":function(d){return "你虽然把所有必要的模块都用上了，但是使用方法不对。"},
"listVariable":function(d){return "列表"},
"makeYourOwnFlappy":function(d){return "制作你自己的Flappy游戏吧"},
"missingRecommendedBlocksErrorMsg":function(d){return "不正确。请尝试一个未使用的模块。"},
"missingRequiredBlocksErrorMsg":function(d){return "不完全正确, 您还需使用一个您未使用过的块。"},
"nestedForSameVariable":function(d){return "你正在嵌套循环中使用相同的变量。使用唯一的变量名来避免无限循环。"},
"nextLevel":function(d){return "祝贺你 ！完成了关卡 "+common_locale.v(d,"puzzleNumber")+"。"},
"nextLevelTrophies":function(d){return "祝贺你 ！完成了关卡 "+common_locale.v(d,"puzzleNumber")+"，并且赢得了"+common_locale.p(d,"numTrophies",0,"zh",{"one":"1个奖杯","other":common_locale.n(d,"numTrophies")+" 奖杯"})+"."},
"nextPuzzle":function(d){return "下一关"},
"nextStage":function(d){return "祝贺你 ！您完成了 "+common_locale.v(d,"stageName")+"。"},
"nextStageTrophies":function(d){return "祝贺你 ！您完成 "+common_locale.v(d,"stageName")+"，赢取了 "+common_locale.p(d,"numTrophies",0,"zh",{"one":"一个奖杯","other":common_locale.n(d,"numTrophies")+" 很多奖杯"})+"。"},
"numBlocksNeeded":function(d){return "祝贺你 ！完成了关卡 "+common_locale.v(d,"puzzleNumber")+"。(然而，其实可以只使用"+common_locale.p(d,"numBlocks",0,"zh",{"one":"1个模块","other":common_locale.n(d,"numBlocks")+" 模块"})+"。)"},
"numLinesOfCodeWritten":function(d){return "你刚刚写了"+common_locale.p(d,"numLines",0,"zh",{"one":"1行","other":common_locale.n(d,"numLines")+" 行"})+" 的代码 ！"},
"openWorkspace":function(d){return "它是如何运行的？"},
"orientationLock":function(d){return "关闭设置中的旋转锁定。"},
"play":function(d){return "玩"},
"print":function(d){return "打印"},
"puzzleTitle":function(d){return "第"+common_locale.v(d,"stage_total")+" 章的关卡 "+common_locale.v(d,"puzzle_number")},
"readonlyWorkspaceHeader":function(d){return "仅查看： "},
"repeat":function(d){return "重复"},
"resetProgram":function(d){return "重置"},
"rotateText":function(d){return "旋转您的设备。"},
"runProgram":function(d){return "运行"},
"runTooltip":function(d){return "运行你在工作区里由各种模块组装出的程序。"},
"runtimeErrorMsg":function(d){return "您的程序未成功运行。请删除第 "+common_locale.v(d,"lineNumber")+" 行并再试一次。"},
"saveToGallery":function(d){return "保存到作品集"},
"savedToGallery":function(d){return "已保存在作品集內!"},
"score":function(d){return "得分"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "对不起，我们无法分享这程序。"},
"shareWarningsAge":function(d){return "请在下方提供你的年龄，并单击确定继续。"},
"shareWarningsMoreInfo":function(d){return "更多信息"},
"shareWarningsStoreData":function(d){return "这个建立在代码工作室上的应用储存了一些数据，这些数据将会被任何使用此共享的链接的人看到，所以若有人询问你的个人信息时，请提高警惕。"},
"showBlocksHeader":function(d){return "显示模块"},
"showCodeHeader":function(d){return "显示代码"},
"showGeneratedCode":function(d){return "显示代码"},
"showTextHeader":function(d){return "显示文本"},
"showToolbox":function(d){return "显示工具箱"},
"showVersionsHeader":function(d){return "版本历史"},
"signup":function(d){return "注册账号后参加简介课程"},
"stringEquals":function(d){return "字符串 = ？"},
"submit":function(d){return "提交"},
"submitYourProject":function(d){return "提交您的项目"},
"submitYourProjectConfirm":function(d){return "提交后的项目不能再次编辑，确认提交么?"},
"unsubmit":function(d){return "未提交"},
"unsubmitYourProject":function(d){return "撤销您的项目"},
"unsubmitYourProjectConfirm":function(d){return "撤销提交您的项目将会重置提交的日期，真的撤销提交吗?"},
"subtitle":function(d){return "一个可视化的编程环境"},
"syntaxErrorMsg":function(d){return "你的程序包含一个错别字。请删除第"+common_locale.v(d,"lineNumber")+" 行并再试一次。"},
"textVariable":function(d){return "文本"},
"toggleBlocksErrorMsg":function(d){return "您需要更正程序中的错误，才能将其显示为模块。"},
"tooFewBlocksMsg":function(d){return "您使用了所有必要的模块，但请尝试更多的模块来完成这个关卡。"},
"tooManyBlocksMsg":function(d){return "可以使用 <x id = 'START_SPAN' /> <x id = 'END_SPAN' /> 模块来通过这关。"},
"tooMuchWork":function(d){return "你让我多做了很多工作 ！你能试着少重复几次吗？"},
"toolboxHeader":function(d){return "块"},
"toolboxHeaderDroplet":function(d){return "工具箱"},
"totalNumLinesOfCodeWritten":function(d){return "全程统计： "+common_locale.p(d,"numLines",0,"zh",{"one":"1 行","other":common_locale.n(d,"numLines")+" 行"})+"代码。"},
"tryAgain":function(d){return "再试一次"},
"tryBlocksBelowFeedback":function(d){return "试着使用以下模块之一："},
"tryHOC":function(d){return "来试试“编程一小时”项目！"},
"unnamedFunction":function(d){return "你有一个变量或函数没有命名。记得给任何东西都起一个有描述意义的名字。"},
"wantToLearn":function(d){return "想要学习如何写代码吗？"},
"watchVideo":function(d){return "观看视频"},
"when":function(d){return "当"},
"whenRun":function(d){return "当运行时"},
"workspaceHeaderShort":function(d){return "工作区域"}};