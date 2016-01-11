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
"fillN":function(d){return "испуни "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "испуни низ од  "+maze_locale.v(d,"shovelfuls")+" рупа"},
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
"ifOnlyFlowerTooltip":function(d){return "Ако постоји цвет у наведеном правцу, онда одрадите неке акције."},
"ifelseFlowerTooltip":function(d){return "Ако у наведеном смеру постоји цвет или саће, онда изврши први блок акција. Иначе, изврши други блок акција."},
"insufficientHoney":function(d){return "Користиш све одговарајуће блокове, али требаш направити задату количину меда."},
"insufficientNectar":function(d){return "Користиш све исправне блокове, али треба да сакупиш праву количину нектара."},
"make":function(d){return "направи"},
"moveBackward":function(d){return "помери уназад"},
"moveEastTooltip":function(d){return "Помери ме источно за једно поље."},
"moveForward":function(d){return "помери се напред"},
"moveForwardTooltip":function(d){return "Помери ме за једно поље."},
"moveNorthTooltip":function(d){return "Помери ме северно за једно поље."},
"moveSouthTooltip":function(d){return "Помери ме јушно за једно поље."},
"moveTooltip":function(d){return "Помери ме напред/назад за једно полје"},
"moveWestTooltip":function(d){return "Помери ме западно за једно поље."},
"nectar":function(d){return "узми нектар"},
"nectarRemaining":function(d){return "нектар"},
"nectarTooltip":function(d){return "Узми нектар из цвета"},
"nextLevel":function(d){return "Честитамо! Завршили сте слагалицу."},
"no":function(d){return "не"},
"noPathAhead":function(d){return "путања је затворена"},
"noPathLeft":function(d){return "нема путање на лево"},
"noPathRight":function(d){return "нема путање на десно"},
"notAtFlowerError":function(d){return "Можеш узети нектар само из цвета."},
"notAtHoneycombError":function(d){return "Само у саћу можеш правити мед."},
"numBlocksNeeded":function(d){return "Ова слагалица може бити решена са %1 блоком."},
"pathAhead":function(d){return "путања напред"},
"pathLeft":function(d){return "ако постоји путања лево"},
"pathRight":function(d){return "ако постоји путања десно"},
"pilePresent":function(d){return "тамо је гомила"},
"putdownTower":function(d){return "сруши кулу"},
"removeAndAvoidTheCow":function(d){return "уклони 1 и избегни краву"},
"removeN":function(d){return "уклони "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "уклони гомилу"},
"removeStack":function(d){return "уклони гомилу од "+maze_locale.v(d,"shovelfuls")+" лопата"},
"removeSquare":function(d){return "уклони квадрат"},
"repeatCarefullyError":function(d){return "Да бисте решили ово, пажљиво размислите о комбинацији два померања и једног скретања, које ћете ставити у \"понављај\" блок. У реду је да имате додатни окрет на крају."},
"repeatUntil":function(d){return "понављај до испуњења"},
"repeatUntilBlocked":function(d){return "док је путања напред"},
"repeatUntilFinish":function(d){return "понављај док се не заврши"},
"step":function(d){return "Корак"},
"totalHoney":function(d){return "укупан мед"},
"totalNectar":function(d){return "укупан нектар"},
"turnLeft":function(d){return "скрени лево"},
"turnRight":function(d){return "скрени десно"},
"turnTooltip":function(d){return "Окрени ме у лево или десно за 90 степени."},
"uncheckedCloudError":function(d){return "Пази да провериш све облачиће да видиш да ли су светови или саће."},
"uncheckedPurpleError":function(d){return "Обавезно проверите све љубичасте цветове да видите да ли имају нектар"},
"whileMsg":function(d){return "док"},
"whileTooltip":function(d){return "Понови акције у загради док се не постигне последњи поен."},
"word":function(d){return "Пронађите реч"},
"yes":function(d){return "Да"},
"youSpelled":function(d){return "Написали сте"}};