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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "И"},
"booleanTrue":function(d){return "тачно"},
"booleanFalse":function(d){return "нетачно"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Акције"},
"catColour":function(d){return "Боја"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Листе"},
"catLoops":function(d){return "Петље"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функције"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Променљиве"},
"codeTooltip":function(d){return "Погледајте генерисани код JavaScript-а."},
"continue":function(d){return "Настави"},
"dialogCancel":function(d){return "Откажи"},
"dialogOK":function(d){return "У реду"},
"directionNorthLetter":function(d){return "Север"},
"directionSouthLetter":function(d){return "Југ"},
"directionEastLetter":function(d){return "Исток"},
"directionWestLetter":function(d){return "Запад"},
"end":function(d){return "крај"},
"emptyBlocksErrorMsg":function(d){return "Да би блок \"Понављај\" или  \"Ако\" радио, у њега треба уградити друге блокове. Постарајте се да је унутрашњи блок правилно убачен у спољни блок."},
"emptyFunctionBlocksErrorMsg":function(d){return "Тело функције треба да се састоји из блокова како би радило."},
"errorEmptyFunctionBlockModal":function(d){return "Треба да буде блокова унутар твоје дефиниције функције. Кликни \"измени\" и превуци блокове унутар зеленог блока."},
"errorIncompleteBlockInFunction":function(d){return "Кликни \"измени\" да би осигурао да немаш недостајућих блокова унутар твоје дефиниције функције."},
"errorParamInputUnattached":function(d){return "Запамти да спојиш неки блок сваком улазном параметру функцијског параметра у твом радном простору."},
"errorUnusedParam":function(d){return "Додао си параметарски блок, али га ниси користио у дефиницији. Користи параметар тако што ћеш кликнути \"измени\" и поставити блок параметра унутар зеленог блока."},
"errorRequiredParamsMissing":function(d){return "Направи параметар за своју функцију кликом на \"измени\" и додадањем неопходних параметара. Превуци нови параметарске блокове у своју дефиницију функције."},
"errorUnusedFunction":function(d){return "Направио си функцију, али је ниси користио нигде у свом радном простору! Кликни на \"Функције\" у кутији алатки и користи је у свом програму."},
"errorQuestionMarksInNumberField":function(d){return "Покушај да замениш \"???\" неком вредношћу."},
"extraTopBlocks":function(d){return "Имате незакачене блокове. Да ли сте хтели да их закачите за \"када се извршава\" блок?"},
"finalStage":function(d){return "Честитамо! Завршили сте последњу етапу."},
"finalStageTrophies":function(d){return "Честитамо! Завршио-ла си последњи ниво и освојио-ла  "+locale.p(d,"numTrophies",0,"sr",{"one":"трофеј","other":locale.n(d,"numTrophies")+" трофеја"})+"."},
"finish":function(d){return "Заврши"},
"generatedCodeInfo":function(d){return "Чак и најбољи универзитети уче блок-базирано кодирање (нпр. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Али блокови су постављени тако да их можете видети у JavaScript, светском најкоришћенијем програмском језику:"},
"hashError":function(d){return "Жао нам је, '%1' не одговара ни једном сачуваном програму."},
"help":function(d){return "Помоћ"},
"hintTitle":function(d){return "Савет:"},
"jump":function(d){return "скок"},
"levelIncompleteError":function(d){return "Користиш све неопходне типове блокова, али не на прави начин."},
"listVariable":function(d){return "листа"},
"makeYourOwnFlappy":function(d){return "Направи своју Flappy игру"},
"missingBlocksErrorMsg":function(d){return "Пробај један или више понуђених блокова како би решио-ла мозгалицу."},
"nextLevel":function(d){return "Честитамо! Решио-ла си мозгалицу "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Честитамо! Решили сте Слагалицу "+locale.v(d,"puzzleNumber")+" и освојили "+locale.p(d,"numTrophies",0,"sr",{"one":"трофеј","other":locale.n(d,"numTrophies")+" трофеја"})+"."},
"nextStage":function(d){return "Честитамо! Завршили сте "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Честитамо! Завршили сте "+locale.v(d,"stageName")+" и освојили "+locale.p(d,"numTrophies",0,"sr",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Честитамо! Решио-ла си мозгалицу "+locale.v(d,"puzzleNumber")+". (Међутим, постоји програм са само "+locale.p(d,"numBlocks",0,"sr",{"one":"једним блоком","other":locale.n(d,"numBlocks")+" блокова"})+".)"},
"numLinesOfCodeWritten":function(d){return "Управо си написао-ла "+locale.p(d,"numLines",0,"sr",{"one":"1 линију","other":locale.n(d,"numLines")+" линија"})+" кода!"},
"play":function(d){return "играј"},
"print":function(d){return "Одштампај"},
"puzzleTitle":function(d){return "Мозгалица "+locale.v(d,"puzzle_number")+" од "+locale.v(d,"stage_total")},
"repeat":function(d){return "понављај"},
"resetProgram":function(d){return "Почни поново"},
"runProgram":function(d){return "Изврши"},
"runTooltip":function(d){return "Покрени програм састављен уз помоћ блокова у радном простору."},
"score":function(d){return "Резултат"},
"showCodeHeader":function(d){return "Покажи Програмски код"},
"showBlocksHeader":function(d){return "Покажи блокове"},
"showGeneratedCode":function(d){return "Покажи код програма"},
"stringEquals":function(d){return "текст=?"},
"subtitle":function(d){return "графичко окружење за програмирање"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Користиш све неопходне типове блокова, али покушај да искористиш више ових блокова да завршиш мозгалицу."},
"tooManyBlocksMsg":function(d){return "Ова мозгалица може да се реши са <x id='START_SPAN'/><x id='END_SPAN'/> блокова."},
"tooMuchWork":function(d){return "Задао си ми много посла! Покушај са мање понављања."},
"toolboxHeader":function(d){return "блокови"},
"openWorkspace":function(d){return "Како то ради"},
"totalNumLinesOfCodeWritten":function(d){return "Укупно : "+locale.p(d,"numLines",0,"sr",{"one":"1 линија","other":locale.n(d,"numLines")+" линија"})+" кода."},
"tryAgain":function(d){return "Покушај поново"},
"hintRequest":function(d){return "Види предлог"},
"backToPreviousLevel":function(d){return "Натраг на претходни ниво"},
"saveToGallery":function(d){return "Сачувај у галерији"},
"savedToGallery":function(d){return "Сачувано у галерији!"},
"shareFailure":function(d){return "Извините, не можемо да поделимо овај програм."},
"workspaceHeader":function(d){return "Склопи своје блокове овде: "},
"workspaceHeaderJavaScript":function(d){return "Укуцајте ваш JavaScript овде"},
"infinity":function(d){return "Бесконачно"},
"rotateText":function(d){return "Окрените ваш уређај."},
"orientationLock":function(d){return "У подешавањима уређаја искључи блокаду оријентације."},
"wantToLearn":function(d){return "Желиш да научиш да програмираш?"},
"watchVideo":function(d){return "Погледај видео"},
"when":function(d){return "када"},
"whenRun":function(d){return "када се извршава"},
"tryHOC":function(d){return "Испробај \"Hour of Code\""},
"signup":function(d){return "Региструј се за уводни курс"},
"hintHeader":function(d){return "Ево предлога:"},
"genericFeedback":function(d){return "Погледај како си завршио и пробај да поправиш свој програм."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};