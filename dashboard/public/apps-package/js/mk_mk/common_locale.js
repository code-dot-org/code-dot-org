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
"and":function(d){return "и"},
"booleanTrue":function(d){return "точно"},
"booleanFalse":function(d){return "погрешно"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Акции"},
"catColour":function(d){return "Color"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Листи"},
"catLoops":function(d){return "Лупови"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "Варајабли"},
"codeTooltip":function(d){return "Погледни го генерираниот JavaScript code."},
"continue":function(d){return "Продолжи"},
"dialogCancel":function(d){return "Откажи"},
"dialogOK":function(d){return "Во ред"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "Крај"},
"emptyBlocksErrorMsg":function(d){return "На \"Повтори \" или \" Ако \" блокот треба да има и други блокови во него за  да работат. Бидете сигурни дека внатрешниот блок се вклопува правилно во внатрешноста на  блок."},
"emptyFunctionBlocksErrorMsg":function(d){return "Функцијата блок треба да има и други блокови во  него за да работи."},
"errorEmptyFunctionBlockModal":function(d){return "There need to be blocks inside your function definition. Click \"edit\" and drag blocks inside the green block."},
"errorIncompleteBlockInFunction":function(d){return "Click \"edit\" to make sure you don't have any blocks missing inside your function definition."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Try replacing \"???\" with a value."},
"extraTopBlocks":function(d){return "Имате Неповрзани блокови. Дали мислевте да ѓи закачите на овие \"кога работи\" блок?"},
"finalStage":function(d){return "Честитки! вие го коплетиравте финалното ниво."},
"finalStageTrophies":function(d){return "Честитки! Вие го комлетриавте финалното ниво и освоивте повеќе видови на трофеи "+locale.p(d,"numTrophies",0,"mk",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Крај"},
"generatedCodeInfo":function(d){return "Дури и најдобрите универзитети предаваат блок-базирано кодирање (на пример, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Но, под хауба, на блоковите ќе можат да бидат прикажани во JavaScript,кој во  светот е  најраспространетиот  јазик за кодирање:"},
"hashError":function(d){return "Извни ,'%1'не кореспондира со било кој зачуван програм."},
"help":function(d){return "Помош"},
"hintTitle":function(d){return "Совет:"},
"jump":function(d){return "Рипај "},
"levelIncompleteError":function(d){return "Вие ѓи користете  сите потребни видови на блокови, но не на вистински начин."},
"listVariable":function(d){return "листа"},
"makeYourOwnFlappy":function(d){return "Направете своја Flappy игра"},
"missingBlocksErrorMsg":function(d){return "Обидете се еден или повеќе блокови подолу за да реши оваа загатка."},
"nextLevel":function(d){return "Честитки! Ти ја заврши загатка "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Честитки! Ти ја  заврши загатка "+locale.v(d,"puzzleNumber")+" и го освои "+locale.p(d,"numTrophies",0,"mk",{"one":"трофеј","other":locale.n(d,"numTrophies")+" трофеи"})+"."},
"nextStage":function(d){return "Честитки! Ти се коплетираше "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Честитки! Ти ги заврши  "+locale.v(d,"stageName")+" и освои "+locale.p(d,"numTrophies",0,"mk",{"one":"трофеј","other":locale.n(d,"numTrophies")+" трофеи"})+"."},
"numBlocksNeeded":function(d){return "Честитки! Ти ја заврши Загатката  "+locale.v(d,"puzzleNumber")+". (Сепак, ти можеше да ги искористш "+locale.p(d,"numBlocks",0,"mk",{"one":"1 блок","other":locale.n(d,"numBlocks")+" блокови"})+".)"},
"numLinesOfCodeWritten":function(d){return "Само што напиша "+locale.p(d,"numLines",0,"mk",{"one":"1 Линија","other":locale.n(d,"numLines")+" Линии"})+" на Кодови!"},
"play":function(d){return "Пушти"},
"print":function(d){return "Печати"},
"puzzleTitle":function(d){return "Загатка "+locale.v(d,"puzzle_number")+" на "+locale.v(d,"stage_total")},
"repeat":function(d){return "повтори"},
"resetProgram":function(d){return "Од почеток ,Ресетирање"},
"runProgram":function(d){return "Трчај"},
"runTooltip":function(d){return "Стартувај  ја програмата која е  дефинирана од страна на блоковите во просторот."},
"score":function(d){return "Резултат"},
"showCodeHeader":function(d){return "Прикажи го кодот"},
"showBlocksHeader":function(d){return "Покажи ги Блоковите"},
"showGeneratedCode":function(d){return "Покажи го кодот"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "Визуелна средина за рограмирање"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Ти ги користиш сите потребни видови на блокови но ,обидисе со други  видови на блокови  за да ја завршиш загатката."},
"tooManyBlocksMsg":function(d){return "Оваа загатка може да се реши со  <x id='START_SPAN'/><x id='END_SPAN'/> блокови."},
"tooMuchWork":function(d){return "Ти ме натера на многу работа!Ќе можеш ли да се обидеш да го пофториш неколку пати?"},
"toolboxHeader":function(d){return "Блокови"},
"openWorkspace":function(d){return "Како работи"},
"totalNumLinesOfCodeWritten":function(d){return "Севкупно време: "+locale.p(d,"numLines",0,"mk",{"one":"1 линија","other":locale.n(d,"numLines")+" линии"})+" на кодови."},
"tryAgain":function(d){return "Обиди се повторно"},
"hintRequest":function(d){return "Види тип"},
"backToPreviousLevel":function(d){return "Врати се на потвторно то Ниво"},
"saveToGallery":function(d){return "Зачувај во галерија"},
"savedToGallery":function(d){return "Зачувано во галерија!"},
"shareFailure":function(d){return "Извинете,ние неможеме да го сподлиме овој програм."},
"workspaceHeader":function(d){return "Соберете ѓи вашите блокови тука:"},
"workspaceHeaderJavaScript":function(d){return "Внесете го вашиот JavaScript код овде"},
"infinity":function(d){return "Бесконечно"},
"rotateText":function(d){return "Ротација на Вашиот уред."},
"orientationLock":function(d){return "Исклучување ориентација заклучување во прилагодувања на уредот."},
"wantToLearn":function(d){return "Сакаш да научиш да бидеш коде програмер?"},
"watchVideo":function(d){return "Погледни го видеото"},
"when":function(d){return "Кога"},
"whenRun":function(d){return "Кога трча"},
"tryHOC":function(d){return "Пробај еден час кодирање"},
"signup":function(d){return "Зачлени се за го посетиш воведувачкиот курс"},
"hintHeader":function(d){return "Еве еден совет :"},
"genericFeedback":function(d){return "Погледни како заврши и обиди се да го поправиш програмот."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};