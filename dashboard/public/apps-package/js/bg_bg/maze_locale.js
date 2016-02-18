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
"atHoneycomb":function(d){return "в пчелната пита"},
"atFlower":function(d){return "на цвете"},
"avoidCowAndRemove":function(d){return "избeгни кравата и премахни 1"},
"continue":function(d){return "Напред"},
"dig":function(d){return "премахни 1"},
"digTooltip":function(d){return "премахни 1 купчинка земя"},
"dirE":function(d){return "И"},
"dirN":function(d){return "С"},
"dirS":function(d){return "Ю"},
"dirW":function(d){return "З"},
"doCode":function(d){return "правя"},
"elseCode":function(d){return "иначе"},
"fill":function(d){return "запълни 1"},
"fillN":function(d){return "запълва "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Запълнва всички "+maze_locale.v(d,"shovelfuls")+" дупки"},
"fillSquare":function(d){return "запълва квадрата"},
"fillTooltip":function(d){return "поставя 1 купчина пръст"},
"finalLevel":function(d){return "Поздравления! Вие решихте последния пъзел."},
"flowerEmptyError":function(d){return "Цветето, на което се намираш, няма повече нектар."},
"get":function(d){return "взима"},
"heightParameter":function(d){return "височина"},
"holePresent":function(d){return "има дупка"},
"honey":function(d){return "прави мед"},
"honeyAvailable":function(d){return "мед"},
"honeyTooltip":function(d){return "Направи мед от нектар"},
"honeycombFullError":function(d){return "Тази медена пита няма място за повече мед."},
"ifCode":function(d){return "ако"},
"ifInRepeatError":function(d){return "Трябва Ви блокче \"Ако\" в блокчето \"Повтори\". Ако имате проблем, пробвайте предишното ниво пак, за да видите как работи."},
"ifPathAhead":function(d){return "ако има път напред"},
"ifTooltip":function(d){return "Ако има път в тази посока, то направи следните действия."},
"ifelseTooltip":function(d){return "Ако има път в тази посока,  извърши първия блок действия. Ако няма, извърши втория блок действия."},
"ifFlowerTooltip":function(d){return "Ако има цвете/пчелна пита в определената посока,  извършете определени действия."},
"ifOnlyFlowerTooltip":function(d){return "Ако има цвете в тази посока, то направи следните действия."},
"ifelseFlowerTooltip":function(d){return "Ако има цвете/пчелна пита в тази посока,  извърши действията от първия блок. Ако няма, извърши действията от втория блок."},
"insufficientHoney":function(d){return "Използвате всички правилни блокове, но трябва да направите точното количество мед."},
"insufficientNectar":function(d){return "Използвате всички правилни блокове, но трябва да съберете нужното количество нектар."},
"make":function(d){return "прави"},
"moveBackward":function(d){return "премести назад"},
"moveEastTooltip":function(d){return "Преместете ме на изток с един ход."},
"moveForward":function(d){return "върви напред"},
"moveForwardTooltip":function(d){return "Преместете ме напред с един ход."},
"moveNorthTooltip":function(d){return "Преместете ме на север един ход."},
"moveSouthTooltip":function(d){return "Преместете ме на юг един ход."},
"moveTooltip":function(d){return "Премести ме напред/назад едно пространство"},
"moveWestTooltip":function(d){return "Преместете ме изток един ход."},
"nectar":function(d){return "вземи нектар"},
"nectarRemaining":function(d){return "нектар"},
"nectarTooltip":function(d){return "Получава нектар от цвете"},
"nextLevel":function(d){return "Поздравления! Вие завършихте този пъзел."},
"no":function(d){return "Не"},
"noPathAhead":function(d){return "пътя напред е блокиран"},
"noPathLeft":function(d){return "няма път наляво"},
"noPathRight":function(d){return "няма път надясно"},
"notAtFlowerError":function(d){return "Можете да получите нектар от цветето."},
"notAtHoneycombError":function(d){return "Можете да правите мед  само в питата."},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блокове."},
"pathAhead":function(d){return "път напред"},
"pathLeft":function(d){return "ако има път наляво"},
"pathRight":function(d){return "ако има път надясно"},
"pilePresent":function(d){return "там има купчинка"},
"putdownTower":function(d){return "спуска кулата"},
"removeAndAvoidTheCow":function(d){return "премахни 1 и избегни кравата"},
"removeN":function(d){return "премахва "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "премахва купчината"},
"removeStack":function(d){return "премахва натрупаните "+maze_locale.v(d,"shovelfuls")+" купчини"},
"removeSquare":function(d){return "премахва квадрата"},
"repeatCarefullyError":function(d){return "За да решите това, обмислете внимателно модел от два хода и едно завъртане, които да се поставят в блок за \"повторение\".  Би било добре на края да сложите блок за завъртане."},
"repeatUntil":function(d){return "повтаряй докато"},
"repeatUntilBlocked":function(d){return "докато има място напред"},
"repeatUntilFinish":function(d){return "повтаряй докато приключи"},
"step":function(d){return "Стъпка"},
"totalHoney":function(d){return "общо мед"},
"totalNectar":function(d){return "общо нектар"},
"turnLeft":function(d){return "завърти наляво"},
"turnRight":function(d){return "завърти надясно"},
"turnTooltip":function(d){return "Завърта ме наляво или надясно на 90 градуса."},
"uncheckedCloudError":function(d){return "Не забравяйте да проверите всички облаци, за да видите дали те са цветя или пчелни пити."},
"uncheckedPurpleError":function(d){return "Не забравяйте да проверите всички лилави цветя, за да видите дали имат нектар"},
"whileMsg":function(d){return "докато"},
"whileTooltip":function(d){return "Повтори поставените в блока действия, докато целта не бъде достигната."},
"word":function(d){return "Намерете думата"},
"yes":function(d){return "Да"},
"youSpelled":function(d){return "ти образува думи"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};