var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "у стільнику"},
"atFlower":function(d){return "у квітці"},
"avoidCowAndRemove":function(d){return "уникнути корови і видалити 1"},
"continue":function(d){return "Далі"},
"dig":function(d){return "видалити 1"},
"digTooltip":function(d){return "видалити 1 відро землі"},
"dirE":function(d){return "Сх"},
"dirN":function(d){return "Пн"},
"dirS":function(d){return "Пд"},
"dirW":function(d){return "Зх"},
"doCode":function(d){return "робити"},
"elseCode":function(d){return "інакше"},
"fill":function(d){return "заповнити 1"},
"fillN":function(d){return "заповнити "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "заповнити всі "+maze_locale.v(d,"shovelfuls")+" ямок"},
"fillSquare":function(d){return "заповнити квадрат"},
"fillTooltip":function(d){return "поставити 1 відро землі"},
"finalLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"flowerEmptyError":function(d){return "У квітки, на якій ви перебуваєте, більше немає нектару."},
"get":function(d){return "отримати"},
"heightParameter":function(d){return "висота"},
"holePresent":function(d){return "є ямка"},
"honey":function(d){return "зробити мед"},
"honeyAvailable":function(d){return "мед"},
"honeyTooltip":function(d){return "Зробити мед з нектару"},
"honeycombFullError":function(d){return "У цьому стільнику більше немає місця для меду."},
"ifCode":function(d){return "якщо"},
"ifInRepeatError":function(d){return "Потрібен блок \"Якщо\" всередині блоку \"Повторити\". Якщо виникли неполадки, спробуй знову попередній рівень, щоб побачити, як це працює."},
"ifPathAhead":function(d){return "якщо є шлях вперед"},
"ifTooltip":function(d){return "Якщо є шлях у вказаному напрямку, то виконуй певні дії."},
"ifelseTooltip":function(d){return "Якщо є шлях у вказаному напрямку, то виконуй перший блок дій. У протилежному випадку, виконуй другий блок дій."},
"ifFlowerTooltip":function(d){return "Якщо у вказаному напрямку є квітка або стільник, то виконувати певні дії."},
"ifOnlyFlowerTooltip":function(d){return "Якщо у вказаному напрямку є квітка, то виконуй певні дії."},
"ifelseFlowerTooltip":function(d){return "Якщо у вказаному напрямку є квітка або стільник, то виконувати перший блок дій. У протилежному випадку, виконувати другий блок дій."},
"insufficientHoney":function(d){return "Потрібно виготовити вказану кількість меду."},
"insufficientNectar":function(d){return "Потрібно виготовити вказану кількість нектару."},
"make":function(d){return "зробити"},
"moveBackward":function(d){return "рухатися назад"},
"moveEastTooltip":function(d){return "Перемісти мене на одну позицію на схід."},
"moveForward":function(d){return "рухатись вперед"},
"moveForwardTooltip":function(d){return "Перемісти мене на одну клітинку вперед."},
"moveNorthTooltip":function(d){return "Перемісти мене на одну позицію на північ."},
"moveSouthTooltip":function(d){return "Перемісти мене на одну позицію на південь."},
"moveTooltip":function(d){return "Перемісти мене вперед або назад на один крок"},
"moveWestTooltip":function(d){return "Перемісти мене на одну позицію на захід."},
"nectar":function(d){return "взяти нектар"},
"nectarRemaining":function(d){return "нектар"},
"nectarTooltip":function(d){return "Взяти нектар з квітки"},
"nextLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"no":function(d){return "Ні"},
"noPathAhead":function(d){return "шлях заблоковано"},
"noPathLeft":function(d){return "ліворуч немає шляху"},
"noPathRight":function(d){return "праворуч немає шляху"},
"notAtFlowerError":function(d){return "Отримати нектар можна тільки з квітки."},
"notAtHoneycombError":function(d){return "Взяти мед можна лише зі стільника."},
"numBlocksNeeded":function(d){return "Це завдання можна розв'язати за допомогою %1 блоків."},
"pathAhead":function(d){return "шлях вперед"},
"pathLeft":function(d){return "якщо є шлях ліворуч"},
"pathRight":function(d){return "якщо є шлях праворуч"},
"pilePresent":function(d){return "є купа"},
"putdownTower":function(d){return "зруйнувати башту"},
"removeAndAvoidTheCow":function(d){return "видалити 1 і уникнути корови"},
"removeN":function(d){return "видалити "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "видалити купу"},
"removeStack":function(d){return "видалити купу з "+maze_locale.v(d,"shovelfuls")+" елементів"},
"removeSquare":function(d){return "видалити квадрат"},
"repeatCarefullyError":function(d){return "Щоб розв'язати цю задачу, уважно подумайте про шаблон з двох ходів та повороту, який потрібно розмістити у блоці \"повтори\". Можна використати додатковий поворот в кінці."},
"repeatUntil":function(d){return "повторювати до"},
"repeatUntilBlocked":function(d){return "поки є шлях вперед"},
"repeatUntilFinish":function(d){return "повторювати до кінця"},
"step":function(d){return "Крок"},
"totalHoney":function(d){return "всього меду"},
"totalNectar":function(d){return "всього нектару"},
"turnLeft":function(d){return "повернути ліворуч"},
"turnRight":function(d){return "повернути праворуч"},
"turnTooltip":function(d){return "Повертає мене ліворуч або праворуч на 90 градусів."},
"uncheckedCloudError":function(d){return "Обов'язково перевірте усі хмари, чи є у них квіти чи стільники."},
"uncheckedPurpleError":function(d){return "Не забудьте перевірити всі фіолетові квіти, чи є у них нектар"},
"whileMsg":function(d){return "поки"},
"whileTooltip":function(d){return "Повторювати вказані дії поки не досягнуто кінцевої точки."},
"word":function(d){return "Знайти слово"},
"yes":function(d){return "Так"},
"youSpelled":function(d){return "Ви написали"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};