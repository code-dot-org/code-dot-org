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
"booleanTrue":function(d){return "вярно"},
"booleanFalse":function(d){return "грешно"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвят"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Списъци"},
"catLoops":function(d){return "Цикли"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функции"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Променливи"},
"codeTooltip":function(d){return "Виж генерирания JavaScript код."},
"continue":function(d){return "Продължи"},
"dialogCancel":function(d){return "Отмяна"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionEastLetter":function(d){return "И"},
"directionWestLetter":function(d){return "З"},
"end":function(d){return "край"},
"emptyBlocksErrorMsg":function(d){return "Блоковете за повторение и \"ако\" трябва да съдържат други блокове в себе си, за да работят. Уверете се, че вътрешния блок е захванат правилно към външния блок."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блокът за функция трябва да има други блокове вътре в себе си, за да работи."},
"errorEmptyFunctionBlockModal":function(d){return "Трябва да има блокове вътре във вашата дефиниция на функция. Щракнете върху \"Редактиране\" и плъзнете блокове вътре в зеления блок."},
"errorIncompleteBlockInFunction":function(d){return "Щракнете върху \"Опитате отново\", за да се уверете, че няма  липсващи блокове  вътре във вашата дефиниция на функция."},
"errorParamInputUnattached":function(d){return "Не забравяйте да прикачвате блок за въвеждане на параметри към блока на функцията във вашата работна област."},
"errorUnusedParam":function(d){return "Вие добавихте блок за параметър, но не го използвате в дефиницията. Не забравяйте да използвате вашия параметър като щракнете върху \"Редактиране\" и поставите блокът за параметър вътре в зеления блок."},
"errorRequiredParamsMissing":function(d){return "Създайте параметър за вашата функция като щракнете върху \"Редактиране\" и добавите необходимите параметри. Плъзнете новите блокове за параметър в дефиницията на функцията ви."},
"errorUnusedFunction":function(d){return "Създали сте функция, но никога не сте я използвали във вашата работна област! Щракнете върху \"Функции\" в кутията с инструменти и се уверете, че можете да я използвате във вашата програма."},
"errorQuestionMarksInNumberField":function(d){return "Опитайте да замените \"???\" със стойност."},
"extraTopBlocks":function(d){return "Имате не закачени блокове. Искате ли да ги закачите към блока \"при стартиране\" ?"},
"finalStage":function(d){return "Поздравления! Вие завършихте последния етап."},
"finalStageTrophies":function(d){return "Поздравления! Вие завършихте последния етап и спечелихте  "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Финал"},
"generatedCodeInfo":function(d){return "Дори най-добрите университети учат блок базирано програмиране(напр., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Но под капака, блоковете представляват кодове, написани на JavaScript, в света най-широко използваният за програмиране език:"},
"hashError":function(d){return "За съжаление, '%1' не съответства на нито една запазена програма."},
"help":function(d){return "Помощ"},
"hintTitle":function(d){return "Съвет:"},
"jump":function(d){return "скок"},
"levelIncompleteError":function(d){return "Използвате всички необходими блокове, но не по правилния начин."},
"listVariable":function(d){return "списък"},
"makeYourOwnFlappy":function(d){return "Направете своя собствена Flappy Bird игра"},
"missingBlocksErrorMsg":function(d){return "Опитайте един или повече блокове по-долу, за да решите този пъзел."},
"nextLevel":function(d){return "Поздравления! Приключихте пъзел "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Поздравления! Завършихте пъзел "+locale.v(d,"puzzleNumber")+" и спечелихте "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "Поздравления! Вие завършихте "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравления! Завършихте етап "+locale.v(d,"stageName")+" и спечелихте "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравления! Приключихте пъзел "+locale.v(d,"puzzleNumber")+". (Въпреки това, можехте да използвате само "+locale.p(d,"numBlocks",0,"bg",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Вие написахте "+locale.p(d,"numLines",0,"bg",{"one":"1line","other":locale.n(d,"numLines")+" lines"})+" код!"},
"play":function(d){return "играй"},
"print":function(d){return "Печат"},
"puzzleTitle":function(d){return "Пъзел "+locale.v(d,"puzzle_number")+" от "+locale.v(d,"stage_total")},
"repeat":function(d){return "повтарям"},
"resetProgram":function(d){return "Начално състояние"},
"runProgram":function(d){return "Старт"},
"runTooltip":function(d){return "Стартира програмата, определена от блоковете в работното поле."},
"score":function(d){return "резултат"},
"showCodeHeader":function(d){return "Покажи код"},
"showBlocksHeader":function(d){return "Покажи блоковете"},
"showGeneratedCode":function(d){return "Покажи кода"},
"stringEquals":function(d){return "низ =?"},
"subtitle":function(d){return "визуална среда за програмиране"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Използвали сте всички необходими видове блокове, но ще ви трябват още от същите видове, за да завършите този пъзел."},
"tooManyBlocksMsg":function(d){return "Този пъзел може да бъде решен с <x id='START_SPAN'/><x id='END_SPAN'/> блокове."},
"tooMuchWork":function(d){return "Накара ме да се изпотя! Може ли да пробваме, но с по-малко повторения?"},
"toolboxHeader":function(d){return "Блокове"},
"openWorkspace":function(d){return "Как работи"},
"totalNumLinesOfCodeWritten":function(d){return "Общо: "+locale.p(d,"numLines",0,"bg",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" код."},
"tryAgain":function(d){return "Опитайте отново"},
"hintRequest":function(d){return "Вижте съвета"},
"backToPreviousLevel":function(d){return "Обратно към предишното ниво"},
"saveToGallery":function(d){return "Записване в галерията"},
"savedToGallery":function(d){return "Записано в галерията!"},
"shareFailure":function(d){return "За съжаление, не можем да сподели тази програма."},
"workspaceHeader":function(d){return "Сглобете вашите блокове тук: "},
"workspaceHeaderJavaScript":function(d){return "Въведете вашия JavaScript код тук"},
"infinity":function(d){return "Безкрайност"},
"rotateText":function(d){return "Завъртете устройството си."},
"orientationLock":function(d){return "Изключете заключването на ориентацията от опциите на устройството."},
"wantToLearn":function(d){return "Искате ли да се научите да кодирате?"},
"watchVideo":function(d){return "Гледайте видеото"},
"when":function(d){return "когато"},
"whenRun":function(d){return "при стартиране"},
"tryHOC":function(d){return "Опитайте Часа на Кодирането"},
"signup":function(d){return "Регистрирайте се във встъпителния курс"},
"hintHeader":function(d){return "Ето един съвет:"},
"genericFeedback":function(d){return "Вижте какво сте въвели и се опитайте да коригирате вашата програма."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Вижте какво направих"}};