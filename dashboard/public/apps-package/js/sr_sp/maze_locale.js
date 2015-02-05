var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"atHoneycomb":function(d){return "на саћу"},
"atFlower":function(d){return "на цвету"},
"avoidCowAndRemove":function(d){return "избегни краву и уклони 1"},
"continue":function(d){return "Настави"},
"dig":function(d){return "уклони 1"},
"digTooltip":function(d){return "уклони 1 јединицу земље"},
"dirE":function(d){return "Исток"},
"dirN":function(d){return "Север"},
"dirS":function(d){return "Југ"},
"dirW":function(d){return "w"},
"doCode":function(d){return "уради"},
"elseCode":function(d){return "иначе"},
"fill":function(d){return "испуни 1"},
"fillN":function(d){return "испуни "+appLocale.v(d,"shovelfuls")},
"fillStack":function(d){return "испуни низ од  "+appLocale.v(d,"shovelfuls")+" рупа"},
"fillSquare":function(d){return "попуните квадрат"},
"fillTooltip":function(d){return "постави 1 комад земље"},
"finalLevel":function(d){return "Честитамо! Решили сте финалну слагалицу."},
"flowerEmptyError":function(d){return "Цвет на којем се налазиш нема више нектара."},
"get":function(d){return "узми"},
"heightParameter":function(d){return "висина"},
"holePresent":function(d){return "ту је рупа"},
"honey":function(d){return "направи мед"},
"honeyAvailable":function(d){return "мед"},
"honeyTooltip":function(d){return "Направи мед од нектара"},
"honeycombFullError":function(d){return "Ово саће више нема места за мед."},
"ifCode":function(d){return "ако"},
"ifInRepeatError":function(d){return "Потребан ти је \"ако\" блок унутар \"понови\" блока. Ако имаш проблем, уради претходни ниво опет, како бих видео како је функционисао."},
"ifPathAhead":function(d){return "ако постоји путања напред"},
"ifTooltip":function(d){return "ако постоји путања у наведеном смеру, онда покрени неке акције."},
"ifelseTooltip":function(d){return "ако постоји путања у наведеном смеру, онда уради први блок акција. У супротном, уради други блок акција."},
"ifFlowerTooltip":function(d){return "Ако у наведеном смеру постоји цвет или саће, онда направи неку акцију."},
"ifelseFlowerTooltip":function(d){return "Ако у наведеном смеру постоји цвет или саће, онда изврши први блок акција. Иначе, изврши други блок акција."},
"insufficientHoney":function(d){return "Користиш све одговарајуће блокове, али требаш направити задату количину меда."},
"insufficientNectar":function(d){return "You're using all the right blocks, but you need to collect the right amount of nectar."},
"make":function(d){return "make"},
"moveBackward":function(d){return "move backward"},
"moveEastTooltip":function(d){return "Move me east one space."},
"moveForward":function(d){return "помери се напред"},
"moveForwardTooltip":function(d){return "Помери ме за једно поље."},
"moveNorthTooltip":function(d){return "Move me north one space."},
"moveSouthTooltip":function(d){return "Move me south one space."},
"moveTooltip":function(d){return "Move me forward/backward one space"},
"moveWestTooltip":function(d){return "Move me west one space."},
"nectar":function(d){return "get nectar"},
"nectarRemaining":function(d){return "nectar"},
"nectarTooltip":function(d){return "Get nectar from a flower"},
"nextLevel":function(d){return "Честитамо! Завршили сте слагалицу."},
"no":function(d){return "не"},
"noPathAhead":function(d){return "путања је затворена"},
"noPathLeft":function(d){return "нема путање на лево"},
"noPathRight":function(d){return "нема путање на десно"},
"notAtFlowerError":function(d){return "You can only get nectar from a flower."},
"notAtHoneycombError":function(d){return "You can only make honey at a honeycomb."},
"numBlocksNeeded":function(d){return "Ова слагалица може бити решена са %1 блоком."},
"pathAhead":function(d){return "путања напред"},
"pathLeft":function(d){return "ако постоји путања лево"},
"pathRight":function(d){return "ако постоји путања десно"},
"pilePresent":function(d){return "тамо је гомила"},
"putdownTower":function(d){return "сруши кулу"},
"removeAndAvoidTheCow":function(d){return "уклони 1 и избегни краву"},
"removeN":function(d){return "уклони "+appLocale.v(d,"shovelfuls")},
"removePile":function(d){return "уклони гомилу"},
"removeStack":function(d){return "уклони гомилу од "+appLocale.v(d,"shovelfuls")+" лопата"},
"removeSquare":function(d){return "уклони квадрат"},
"repeatCarefullyError":function(d){return "To solve this, think carefully about the pattern of two moves and one turn to put in the \"repeat\" block.  It's okay to have an extra turn at the end."},
"repeatUntil":function(d){return "понављај до испуњења"},
"repeatUntilBlocked":function(d){return "док је путања напред"},
"repeatUntilFinish":function(d){return "понављај до завршетка"},
"step":function(d){return "Step"},
"totalHoney":function(d){return "total honey"},
"totalNectar":function(d){return "total nectar"},
"turnLeft":function(d){return "скрени лево"},
"turnRight":function(d){return "скрени десно"},
"turnTooltip":function(d){return "Окрени ме у лево или десно за 90 степени."},
"uncheckedCloudError":function(d){return "Make sure to check all clouds to see if they're flowers or honeycombs."},
"uncheckedPurpleError":function(d){return "Make sure to check all purple flowers to see if they have nectar"},
"whileMsg":function(d){return "док"},
"whileTooltip":function(d){return "Понови акције у загради док се не постигне последњи поен."},
"word":function(d){return "Find the word"},
"yes":function(d){return "Да"},
"youSpelled":function(d){return "You spelled"}};