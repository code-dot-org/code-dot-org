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
"and":function(d){return "и"},
"booleanTrue":function(d){return "истина"},
"booleanFalse":function(d){return "ложь"},
"blocklyMessage":function(d){return "Блокли"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвет"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Списки"},
"catLoops":function(d){return "Циклы"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Процедуры"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Переменные"},
"codeTooltip":function(d){return "Просмотреть созданный код JavaScript."},
"continue":function(d){return "Продолжить"},
"dialogCancel":function(d){return "Отмена"},
"dialogOK":function(d){return "Продолжить"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionEastLetter":function(d){return "В"},
"directionWestLetter":function(d){return "З"},
"end":function(d){return "конец"},
"emptyBlocksErrorMsg":function(d){return "Блокам \"повторять\" или \"если\" необходимо иметь внутри другие блоки для работы. Убедись  в том, что внутренний блок должным образом подходит к блоку, в котором он содержится."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блок процедуры требует для работы другие блоки внутри себя."},
"errorEmptyFunctionBlockModal":function(d){return "В определении твоей функции обязательно должны быть блоки. Нажми \"Редактировать\" и перетащи блоки внутрь зеленого блока."},
"errorIncompleteBlockInFunction":function(d){return "Нажми \"Редактировать\" чтобы убедиться, что ты не пропустил никакие блоки в определении функции."},
"errorParamInputUnattached":function(d){return "Не забудь прикрепить блок к каждому входящему параметру блока функции в своем рабочем пространстве."},
"errorUnusedParam":function(d){return "Ты добавил блок параметра но не использовал его в определении функции. Чтобы убедиться, что используешь параметр, нажми на \"Редактировать\" и помести блок параметра внутрь зеленого блока."},
"errorRequiredParamsMissing":function(d){return "Создай параметр для твоей функции нажав \"Редактировать\" и добавив необходимые параметры. Перетащи новые блоки параметров в определение твоей функции."},
"errorUnusedFunction":function(d){return "Вы создали функцию, но не использовали её в работе! Нажмите на «Функции» на панели инструментов и убедитесь, что вы используете его в своей программе."},
"errorQuestionMarksInNumberField":function(d){return "Попробуйте изменить значение \"???\"."},
"extraTopBlocks":function(d){return "У тебя остались неприсоединённые блоки. Ты собирался присоединить их к блоку \"При запуске\"?"},
"finalStage":function(d){return "Поздравляю! Ты завершил последний этап."},
"finalStageTrophies":function(d){return "Поздравляю! Ты завершил последний этап и выиграл "+locale.p(d,"numTrophies",0,"ru",{"one":"кубок","other":locale.n(d,"numTrophies")+" кубков"})+"."},
"finish":function(d){return "Готово"},
"generatedCodeInfo":function(d){return "Даже в лучших университетах изучают блочное программирование (например, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Но на самом деле блоки, которые вы собирали, могут быть отображены на JavaScript, наиболее широко используемом в мире языке программирования:"},
"hashError":function(d){return "К сожалению, «%1» не соответствует какой-либо сохранённой программе."},
"help":function(d){return "Справка"},
"hintTitle":function(d){return "Подсказка:"},
"jump":function(d){return "прыгнуть"},
"levelIncompleteError":function(d){return "Ты используешь все необходимые виды блоков, но неправильным способом."},
"listVariable":function(d){return "список"},
"makeYourOwnFlappy":function(d){return "Создайте свою Flappy игру"},
"missingBlocksErrorMsg":function(d){return "Для решения этой головоломки попробуй один или несколько из следующих блоков:"},
"nextLevel":function(d){return "Поздравляю! Головоломка "+locale.v(d,"puzzleNumber")+" решена."},
"nextLevelTrophies":function(d){return "Поздравляю! Ты завершил головоломку "+locale.v(d,"puzzleNumber")+" и выиграл "+locale.p(d,"numTrophies",0,"ru",{"one":"кубок","other":locale.n(d,"numTrophies")+" кубков"})+"."},
"nextStage":function(d){return "Поздравляем! Вы закончили "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравляем! Вы выполнили "+locale.v(d,"stageName")+" и выиграли "+locale.p(d,"numTrophies",0,"ru",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравляю! Ты завершил головоломку "+locale.v(d,"puzzleNumber")+". (Однако, можно было обойтись всего  "+locale.p(d,"numBlocks",0,"ru",{"one":"1 блоком","other":locale.n(d,"numBlocks")+" блоками"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ты только что написал "+locale.p(d,"numLines",0,"ru",{"one":"1 строку","other":locale.n(d,"numLines")+" строки"})+" кода!"},
"play":function(d){return "играть"},
"print":function(d){return "Печать"},
"puzzleTitle":function(d){return "Головоломка "+locale.v(d,"puzzle_number")+" из "+locale.v(d,"stage_total")},
"repeat":function(d){return "повторить"},
"resetProgram":function(d){return "Сбросить"},
"runProgram":function(d){return "Выполнить"},
"runTooltip":function(d){return "Запускает программу, заданную блоками в рабочей области."},
"score":function(d){return "очки"},
"showCodeHeader":function(d){return "Показать код"},
"showBlocksHeader":function(d){return "Показать блоки"},
"showGeneratedCode":function(d){return "Показать код"},
"stringEquals":function(d){return "строка=?"},
"subtitle":function(d){return "среда визуального программирования"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Ты используешь все необходимые виды блоков, но попробуй использовать большее число  блоков, чтобы завершить головоломку."},
"tooManyBlocksMsg":function(d){return "Эта головоломка может быть решена блоками <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Ты заставил меня попотеть! Может, будешь стараться делать меньше попыток?"},
"toolboxHeader":function(d){return "блоков"},
"openWorkspace":function(d){return "Как это работает"},
"totalNumLinesOfCodeWritten":function(d){return "Общее количество: "+locale.p(d,"numLines",0,"ru",{"one":"1 строка","other":locale.n(d,"numLines")+" строки"})+" кода."},
"tryAgain":function(d){return "Попытаться ещё раз"},
"hintRequest":function(d){return "Посмотреть подсказку"},
"backToPreviousLevel":function(d){return "Вернуться на предыдущий уровень"},
"saveToGallery":function(d){return "Сохранить в галерею"},
"savedToGallery":function(d){return "Сохранено в галерее!"},
"shareFailure":function(d){return "К сожалению, мы не можем поделиться этой программой."},
"workspaceHeader":function(d){return "Место сбора блоков: "},
"workspaceHeaderJavaScript":function(d){return "Введите ваш JavaScript код здесь"},
"infinity":function(d){return "Бесконечность"},
"rotateText":function(d){return "Поверните ваше устройство."},
"orientationLock":function(d){return "Выключите блокировку ориентации в настройках устройства."},
"wantToLearn":function(d){return "Хочешь научиться программировать?"},
"watchVideo":function(d){return "Посмотреть видео"},
"when":function(d){return "когда"},
"whenRun":function(d){return "При запуске"},
"tryHOC":function(d){return "Попробуйте Час кода"},
"signup":function(d){return "Зарегистрируйтесь на вводный курс"},
"hintHeader":function(d){return "Подсказка:"},
"genericFeedback":function(d){return "Посмотрите, что у вас получилось, и попытайтесь исправить вашу программу."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Проверить, что я сделал"}};