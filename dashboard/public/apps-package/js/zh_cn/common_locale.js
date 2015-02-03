var locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "和"},
"booleanTrue":function(d){return "真"},
"booleanFalse":function(d){return "错"},
"blocklyMessage":function(d){return "布洛克里"},
"catActions":function(d){return "操作"},
"catColour":function(d){return "颜色"},
"catLogic":function(d){return "逻辑"},
"catLists":function(d){return "列表"},
"catLoops":function(d){return "循环"},
"catMath":function(d){return "数学"},
"catProcedures":function(d){return "函数"},
"catText":function(d){return "文本"},
"catVariables":function(d){return "变量"},
"codeTooltip":function(d){return "请参见所生成的 JavaScript 代码。"},
"continue":function(d){return "继续"},
"dialogCancel":function(d){return "取消"},
"dialogOK":function(d){return "确定"},
"directionNorthLetter":function(d){return "北"},
"directionSouthLetter":function(d){return "南"},
"directionEastLetter":function(d){return "东"},
"directionWestLetter":function(d){return "西"},
"end":function(d){return "结束"},
"emptyBlocksErrorMsg":function(d){return "“Repeat”或“If”模块需要其他的模块充填在里面才能工作。请确保在容器模块里填入了合适的模块。"},
"emptyFunctionBlocksErrorMsg":function(d){return "这个函数块，需要有其他块在里面才能工作"},
"errorEmptyFunctionBlockModal":function(d){return "你的函数定义内需要有区块. 按一下\"编辑\"并拖动区块到绿色区块内部."},
"errorIncompleteBlockInFunction":function(d){return "按一下\"编辑\"来确保你的函式定义中没有缺少任何区块."},
"errorParamInputUnattached":function(d){return "记住要将区块附加到你工作空间内的函数块的每个参数输入上."},
"errorUnusedParam":function(d){return "你加了一个参数块，但没有在定义中使用它. 确保通过按“编辑”来使用你的参数块并把参数块放在绿色区块内."},
"errorRequiredParamsMissing":function(d){return "通過按“編輯來給你的函數創建一個參數, 並添加必要的參數. 把新的参数块拖动到你的函数定义内."},
"errorUnusedFunction":function(d){return "你创建一个函数，但从来没有使用它在你的工作空间! 按一下工具箱中的“函数”，并确保你在程序中使用它."},
"errorQuestionMarksInNumberField":function(d){return "尝试把\"???\"更换成一个值."},
"extraTopBlocks":function(d){return "你有一些未连接上的模块。你是否要把这些模块连接在“运行”模块上？"},
"finalStage":function(d){return "祝贺你 ！您已完成最后一章。"},
"finalStageTrophies":function(d){return "祝贺你 ！已完成最终章并赢得了 "+locale.p(d,"numTrophies",0,"zh",{"one":"1个奖杯","other":locale.n(d,"numTrophies")+" 奖杯"})+"。"},
"finish":function(d){return "完成"},
"generatedCodeInfo":function(d){return "即使是顶级的大学教授基于块的编码(如。"+locale.v(d,"berkeleyLink")+","+locale.v(d,"harvardLink")+")。但是,你组装的模块也可以显示在JavaScript中,世界上最广泛使用的编程语言:\n"},
"hashError":function(d){return "对不起，'%1' 并不对应任何已保存的程序。"},
"help":function(d){return "帮助"},
"hintTitle":function(d){return "提示："},
"jump":function(d){return "跳转"},
"levelIncompleteError":function(d){return "你虽然把所有必要的模块都用上了，但是使用方法不对。"},
"listVariable":function(d){return "列表"},
"makeYourOwnFlappy":function(d){return "制作你自己的Flappy游戏吧"},
"missingBlocksErrorMsg":function(d){return "尝试下面一个或多个模块来解开这个谜题。"},
"nextLevel":function(d){return "祝贺你 ！完成了谜题 "+locale.v(d,"puzzleNumber")+"。"},
"nextLevelTrophies":function(d){return "祝贺你 ！完成了谜题 "+locale.v(d,"puzzleNumber")+"，并且赢得了"+locale.p(d,"numTrophies",0,"zh",{"one":"1个奖杯","other":locale.n(d,"numTrophies")+" 奖杯"})+"."},
"nextStage":function(d){return "祝贺你 ！您完成了 "+locale.v(d,"stageName")+"。"},
"nextStageTrophies":function(d){return "祝贺你 ！您完成 "+locale.v(d,"stageName")+"，赢取了 "+locale.p(d,"numTrophies",0,"zh",{"one":"一个奖杯","other":locale.n(d,"numTrophies")+" 很多奖杯"})+"。"},
"numBlocksNeeded":function(d){return "祝贺你 ！完成了谜题 "+locale.v(d,"puzzleNumber")+"。(然而，你其实可以只使用"+locale.p(d,"numBlocks",0,"zh",{"one":"1个模块","other":locale.n(d,"numBlocks")+" 模块"})+"。)"},
"numLinesOfCodeWritten":function(d){return "你刚刚写了"+locale.p(d,"numLines",0,"zh",{"one":"1行","other":locale.n(d,"numLines")+" 行"})+" 的代码 ！"},
"play":function(d){return "玩"},
"print":function(d){return "打印"},
"puzzleTitle":function(d){return "第"+locale.v(d,"stage_total")+"章的谜题 "+locale.v(d,"puzzle_number")+" "},
"repeat":function(d){return "重复"},
"resetProgram":function(d){return "重置"},
"runProgram":function(d){return "运行"},
"runTooltip":function(d){return "运行你在工作区里由各种模块组装出的程序。"},
"score":function(d){return "得分"},
"showCodeHeader":function(d){return "显示代码"},
"showBlocksHeader":function(d){return "显示区块"},
"showGeneratedCode":function(d){return "显示代码"},
"stringEquals":function(d){return "字符串 = ？"},
"subtitle":function(d){return "一个可视化的编程环境"},
"textVariable":function(d){return "文本"},
"tooFewBlocksMsg":function(d){return "您正在使用所有必要类型的模块，但请尝试更多这些类型的模块来完成这个谜题。"},
"tooManyBlocksMsg":function(d){return "可以使用 < x id = 'START_SPAN' / > < x id = 'END_SPAN' / > 模块来解决这个谜题。"},
"tooMuchWork":function(d){return "你让我多做很多工作 ！你可以尝试少重复几次吗？"},
"toolboxHeader":function(d){return "块"},
"openWorkspace":function(d){return "它是如何工作的？"},
"totalNumLinesOfCodeWritten":function(d){return "全程统计： "+locale.p(d,"numLines",0,"zh",{"one":"1 行","other":locale.n(d,"numLines")+" 行"})+"代码。"},
"tryAgain":function(d){return "再次尝试"},
"hintRequest":function(d){return "看提示"},
"backToPreviousLevel":function(d){return "返回到上一级"},
"saveToGallery":function(d){return "保存到画廊"},
"savedToGallery":function(d){return "已保存在画廊內!"},
"shareFailure":function(d){return "对不起，我们无法分享这程序。"},
"workspaceHeader":function(d){return "在这里组装你的模块:"},
"workspaceHeaderJavaScript":function(d){return "在这里输入你的JavaScript代码"},
"infinity":function(d){return "无限"},
"rotateText":function(d){return "旋转您的设备。"},
"orientationLock":function(d){return "关闭设置中的旋转锁定。"},
"wantToLearn":function(d){return "想要学习如何写代码吗？"},
"watchVideo":function(d){return "观看视频"},
"when":function(d){return "当"},
"whenRun":function(d){return "当运行时"},
"tryHOC":function(d){return "来试试”编程一小时“项目！"},
"signup":function(d){return "注册账号后参加简介课程"},
"hintHeader":function(d){return "这里有一个提示："},
"genericFeedback":function(d){return "看你的程序时如何结束的，并尝试修复你的程序"},
"toggleBlocksErrorMsg":function(d){return "在作为一个程序块之前，您需要更正程序中的错误。"},
"defaultTwitterText":function(d){return "看看我做了什么"}};