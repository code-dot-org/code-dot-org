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
"and":function(d){return "та"},
"booleanTrue":function(d){return "Істина"},
"booleanFalse":function(d){return "Хибність"},
"blocklyMessage":function(d){return "Блоклі"},
"catActions":function(d){return "Дії"},
"catColour":function(d){return "Колір"},
"catLogic":function(d){return "Логіка"},
"catLists":function(d){return "Списки"},
"catLoops":function(d){return "Цикли"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функції"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Змінні"},
"codeTooltip":function(d){return "Див. згенерований код JavaScript."},
"continue":function(d){return "Далі"},
"dialogCancel":function(d){return "Скасувати"},
"dialogOK":function(d){return "Гаразд"},
"directionNorthLetter":function(d){return "Пн"},
"directionSouthLetter":function(d){return "Пд"},
"directionEastLetter":function(d){return "Сх"},
"directionWestLetter":function(d){return "Зх"},
"end":function(d){return "кінець"},
"emptyBlocksErrorMsg":function(d){return "Блоки \"Повторити\" та \"Якщо\" повинні містити інші блоки. Переконайтесь, що внутрішній блок належно розміщений всередині зовнішнього."},
"emptyFunctionBlocksErrorMsg":function(d){return "Для функціонування цей блок повинен містити інші блоки."},
"errorEmptyFunctionBlockModal":function(d){return "Потрібно розмістити блоки всередині блоку визначення функції. Клацніть \"Редагувати\" та перетягніть блоки всередину зеленого блоку."},
"errorIncompleteBlockInFunction":function(d){return "Натисніть кнопку \"Редагувати\", щоб переконатися, що всі потрібні блоки розміщено всередині визначення функції."},
"errorParamInputUnattached":function(d){return "Не забудьте вкласти блок для кожного вхідного параметра блоку функції на робочому просторі."},
"errorUnusedParam":function(d){return "Ви додали блок параметра, але не використали його у визначенні функції. Не забудьте використати його, клацніть \"Редагувати\" та розмістіть блок параметра всередині зеленого блоку."},
"errorRequiredParamsMissing":function(d){return "Створіть параметр для функції, клацнувши \"Редагувати\" та додаючи відповідні параметри. Перетягніть нові блоки параметрів у визначення функції."},
"errorUnusedFunction":function(d){return "Ви створили функцію, але не скористалися нею у робочому просторі! Оберіть \"Функції\" на палітрі інструментів і переконайтеся, що ви використовуєте їх у своїй програмі."},
"errorQuestionMarksInNumberField":function(d){return "Спробуйте замінити \"???\" на значення."},
"extraTopBlocks":function(d){return "У вас залишились зайві блоки. Ви збирались їх прикріпити до блоку \"під час виконання\"?"},
"finalStage":function(d){return "Вітання! Завершено останній етап."},
"finalStageTrophies":function(d){return "Вітання! Ви завершили останній етап і виграли "+locale.p(d,"numTrophies",0,"uk",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Кінець"},
"generatedCodeInfo":function(d){return "Навіть кращі університети навчають програмуванню на основі блоків (наприклад, "+locale.v(d,"berkeleyLink")+" "+locale.v(d,"harvardLink")+"). Але всередині ті блоки, які ви щойно склали, можуть показуватись у JavaScript, найпоширенішій мові програмування:"},
"hashError":function(d){return "Шкода, але  '%1' не відповідає жодній збереженій програмі."},
"help":function(d){return "Довідка"},
"hintTitle":function(d){return "Підказка:"},
"jump":function(d){return "стрибок"},
"levelIncompleteError":function(d){return "Використано усі необхідні типи блоків, але у неправильному порядку."},
"listVariable":function(d){return "список"},
"makeYourOwnFlappy":function(d){return "Створити свою власну гру в Пурха (Flappy Game)"},
"missingBlocksErrorMsg":function(d){return "Щоб розв'язати завдання, спробуйте один або кілька блоків нижче."},
"nextLevel":function(d){return "Вітання! Завершено завдання "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Вітання! Ви завершили завдання "+locale.v(d,"puzzleNumber")+" та виграли  "+locale.p(d,"numTrophies",0,"uk",{"one":"трофей","other":locale.n(d,"numTrophies")+" трофеїв"})+"."},
"nextStage":function(d){return "Вітаємо! Ви завершили "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Вітаємо! Ви завершили етап "+locale.v(d,"stageName")+" та виграли "+locale.p(d,"numTrophies",0,"uk",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Вітаємо! Ви завершили завдання  "+locale.v(d,"puzzleNumber")+". (Проте, його можна було вирішити, використавши лише "+locale.p(d,"numBlocks",0,"uk",{"one":"1 блок","other":locale.n(d,"numBlocks")+" блоки"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ви щойно написали "+locale.p(d,"numLines",0,"uk",{"one":"1 рядок","other":locale.n(d,"numLines")+" рядків"})+" коду!"},
"play":function(d){return "грати"},
"print":function(d){return "Друк"},
"puzzleTitle":function(d){return "Завдання "+locale.v(d,"puzzle_number")+" з "+locale.v(d,"stage_total")},
"repeat":function(d){return "повторити"},
"resetProgram":function(d){return "Скидання"},
"runProgram":function(d){return "Запустити"},
"runTooltip":function(d){return "Запустити програму, що складається з блоків робочої області."},
"score":function(d){return "рахунок"},
"showCodeHeader":function(d){return "Показати код"},
"showBlocksHeader":function(d){return "Показати блоки"},
"showGeneratedCode":function(d){return "Показати код"},
"stringEquals":function(d){return "рядок =?"},
"subtitle":function(d){return "Візуальне середовище програмування"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Ви використали усі необхідні типи блоків, але спробуйте використати більше таких блоків, щоб розв'язати завдання."},
"tooManyBlocksMsg":function(d){return "Це завдання можна розв'язати, використавши <x id='START_SPAN'/><x id='END_SPAN'/> блоків."},
"tooMuchWork":function(d){return "Ви змусили мене попрацювати! Може спробуємо менше повторів?"},
"toolboxHeader":function(d){return "блоки"},
"openWorkspace":function(d){return "Як це працює"},
"totalNumLinesOfCodeWritten":function(d){return "За весь час: "+locale.p(d,"numLines",0,"uk",{"one":"1 рядок","other":locale.n(d,"numLines")+" рядків"})+" коду."},
"tryAgain":function(d){return "Спробуй знову"},
"hintRequest":function(d){return "Подивитись підказку"},
"backToPreviousLevel":function(d){return "Повернутися до попереднього рівня"},
"saveToGallery":function(d){return "Зберегти в галереї"},
"savedToGallery":function(d){return "Збережено у галереї!"},
"shareFailure":function(d){return "На жаль, цією програмою не можна поділитись."},
"workspaceHeader":function(d){return "Збирайте свої блоки тут: "},
"workspaceHeaderJavaScript":function(d){return "Введіть свій код JavaScript тут"},
"infinity":function(d){return "Нескінченність"},
"rotateText":function(d){return "Повертайте свій пристрій."},
"orientationLock":function(d){return "Увімкніть блокування повороту у налаштування пристрою."},
"wantToLearn":function(d){return "Хочете навчитись програмувати?"},
"watchVideo":function(d){return "Переглянути відео"},
"when":function(d){return "коли"},
"whenRun":function(d){return "під час виконання"},
"tryHOC":function(d){return "Спробуйте годину коду"},
"signup":function(d){return "Підпишіться на вступний курс"},
"hintHeader":function(d){return "Підказка:"},
"genericFeedback":function(d){return "Подивіться, на чому ви зупинились і спробуйте виправити свою програму."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Подивіться, що у мене вийшло"}};