var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Настави"},
"doCode":function(d){return "Уради"},
"elseCode":function(d){return "у супротном"},
"endGame":function(d){return "заврши игру"},
"endGameTooltip":function(d){return "Завршава игру."},
"finalLevel":function(d){return "Честитамо! Решили сте последњи проблем."},
"flap":function(d){return "маши крилима"},
"flapRandom":function(d){return "маши крилима насумичан број пута"},
"flapVerySmall":function(d){return "маши крилима врло мало"},
"flapSmall":function(d){return "маши крилима мало"},
"flapNormal":function(d){return "маши крилима нормално"},
"flapLarge":function(d){return "маши крилима много"},
"flapVeryLarge":function(d){return "маши крилима јако много"},
"flapTooltip":function(d){return "Flappy лети нагоре."},
"flappySpecificFail":function(d){return "Твој програм изледа добро - замахнуће крилима на сваки клик, али треба да кликнеш много пута да долетиш до циља."},
"incrementPlayerScore":function(d){return "освоји поен"},
"incrementPlayerScoreTooltip":function(d){return "Додајте један поен тренутном резултату играча."},
"nextLevel":function(d){return "Честитке! Завршили сте пузлу."},
"no":function(d){return "не"},
"numBlocksNeeded":function(d){return "Ова слагалица се може решити са %1 блокова."},
"playSoundRandom":function(d){return "свирај насумични звук"},
"playSoundBounce":function(d){return "свирај звук одскакања"},
"playSoundCrunch":function(d){return "свирај звук крцкања"},
"playSoundDie":function(d){return "свирај тужни звук"},
"playSoundHit":function(d){return "свирај звук смрскавања"},
"playSoundPoint":function(d){return "свирај звук поена"},
"playSoundSwoosh":function(d){return "свира звук пролетања"},
"playSoundWing":function(d){return "свирај звук замаха крилима"},
"playSoundJet":function(d){return "свирај звук млазњака"},
"playSoundCrash":function(d){return "свирај звук судара"},
"playSoundJingle":function(d){return "свирај звук прапораца"},
"playSoundSplash":function(d){return "свирај звук пљускања воде"},
"playSoundLaser":function(d){return "свирај звук ласера"},
"playSoundTooltip":function(d){return "Свирај одабрани звук."},
"reinfFeedbackMsg":function(d){return "Можете да притиснете \"Покушај поново\" дугме да се вратите у своју игру."},
"scoreText":function(d){return "Резултат: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "постави позадину"},
"setBackgroundRandom":function(d){return "Постави сцену Random"},
"setBackgroundFlappy":function(d){return "Постави сцену City (day)"},
"setBackgroundNight":function(d){return "Постави сцену City (night)"},
"setBackgroundSciFi":function(d){return "Постави сцену Sci-Fi"},
"setBackgroundUnderwater":function(d){return "Постави сцену Underwater"},
"setBackgroundCave":function(d){return "Постави сцену Пећина"},
"setBackgroundSanta":function(d){return "Постави сцену Деда Мраз"},
"setBackgroundTooltip":function(d){return "Поставља слику у позадини"},
"setGapRandom":function(d){return "Постави насумични размак"},
"setGapVerySmall":function(d){return "Постави врло мали размак"},
"setGapSmall":function(d){return "Постави мали размак"},
"setGapNormal":function(d){return "постави нормалан размак"},
"setGapLarge":function(d){return "постави велики размак"},
"setGapVeryLarge":function(d){return "постави врло велики размак"},
"setGapHeightTooltip":function(d){return "Поставља вертикални размак у препреку"},
"setGravityRandom":function(d){return "Постави насумичну гравитацију"},
"setGravityVeryLow":function(d){return "Постави врло ниску гравитацију"},
"setGravityLow":function(d){return "Постави ниску гравитацију"},
"setGravityNormal":function(d){return "Постави нормалну гравитацију"},
"setGravityHigh":function(d){return "Постави високу гравитацију"},
"setGravityVeryHigh":function(d){return "Постави врло високу гравитацију"},
"setGravityTooltip":function(d){return "Подешава ниво гравитације"},
"setGround":function(d){return "постави подлогу"},
"setGroundRandom":function(d){return "постави тло Насумично"},
"setGroundFlappy":function(d){return "постави тло Тло"},
"setGroundSciFi":function(d){return "постави тло Научна фантастика"},
"setGroundUnderwater":function(d){return "постави тло Испод воде"},
"setGroundCave":function(d){return "постави тло Пећина"},
"setGroundSanta":function(d){return "Постави тло Деда Мраз"},
"setGroundLava":function(d){return "постави тло Лава"},
"setGroundTooltip":function(d){return "Поставља слику тла"},
"setObstacle":function(d){return "постави препреку"},
"setObstacleRandom":function(d){return "поставља препреку Насумично"},
"setObstacleFlappy":function(d){return "поставља препреку Цев"},
"setObstacleSciFi":function(d){return "поставља препреку Научна фантастика"},
"setObstacleUnderwater":function(d){return "поставља препреку Биљка"},
"setObstacleCave":function(d){return "поставља препреку Пећина"},
"setObstacleSanta":function(d){return "поставља препреку Димњак"},
"setObstacleLaser":function(d){return "поставља препреку Ласер"},
"setObstacleTooltip":function(d){return "Поставља слику препреке"},
"setPlayer":function(d){return "постави лика"},
"setPlayerRandom":function(d){return "поставља плејер Насумично"},
"setPlayerFlappy":function(d){return "постави плејер Жута птица"},
"setPlayerRedBird":function(d){return "постави плејер Црвена птица"},
"setPlayerSciFi":function(d){return "постави плејер Свемирски брод"},
"setPlayerUnderwater":function(d){return "постави плејер Риба"},
"setPlayerCave":function(d){return "постави плејер Слепи миш"},
"setPlayerSanta":function(d){return "постави плејер Деда Мраз"},
"setPlayerShark":function(d){return "постави плејер Ајкула"},
"setPlayerEaster":function(d){return "постави плејер Ускршњи зека"},
"setPlayerBatman":function(d){return "постави плејер Бетмен"},
"setPlayerSubmarine":function(d){return "постави плејер Подморница"},
"setPlayerUnicorn":function(d){return "постави плејер Једнорог"},
"setPlayerFairy":function(d){return "постави плејер Вила"},
"setPlayerSuperman":function(d){return "постави плејер Флапи-човек"},
"setPlayerTurkey":function(d){return "постави плејер Ћурка"},
"setPlayerTooltip":function(d){return "Постави слику играча"},
"setScore":function(d){return "постави резултат"},
"setScoreTooltip":function(d){return "Поставља резултат играча"},
"setSpeed":function(d){return "постави брзину"},
"setSpeedTooltip":function(d){return "Поставља брзину нивоа"},
"shareFlappyTwitter":function(d){return "Испробај Флапи-игру коју сам направио/ла. Сам/а сам је написао/ла користећи @codeorg"},
"shareGame":function(d){return "Подели своју игру:"},
"soundRandom":function(d){return "насумичан"},
"soundBounce":function(d){return "одбиј се"},
"soundCrunch":function(d){return "крц"},
"soundDie":function(d){return "тужан звук"},
"soundHit":function(d){return "звук ломљења"},
"soundPoint":function(d){return "поен"},
"soundSwoosh":function(d){return "свуш"},
"soundWing":function(d){return "звук крила"},
"soundJet":function(d){return "звук млазњака"},
"soundCrash":function(d){return "ѕвук судара"},
"soundJingle":function(d){return "звоњење"},
"soundSplash":function(d){return "звук прскања"},
"soundLaser":function(d){return "звук ласера"},
"speedRandom":function(d){return "постави брзину насумично"},
"speedVerySlow":function(d){return "постави брзину на врло споро"},
"speedSlow":function(d){return "постави брзину на споро"},
"speedNormal":function(d){return "постави брзину на нормално"},
"speedFast":function(d){return "постави брзину на брзо"},
"speedVeryFast":function(d){return "постави брзину на врло брзо"},
"whenClick":function(d){return "када кликне"},
"whenClickTooltip":function(d){return "Изврши доње акције када се појави догађај кликнуто."},
"whenCollideGround":function(d){return "када удари у тло"},
"whenCollideGroundTooltip":function(d){return "Изврши доње акције када Флопи-птица удари у тло."},
"whenCollideObstacle":function(d){return "када удари у препреку"},
"whenCollideObstacleTooltip":function(d){return "Изврши доње акције када Флопи-птица удари у препреку."},
"whenEnterObstacle":function(d){return "када пређе препреку"},
"whenEnterObstacleTooltip":function(d){return "Изврши доње акције када Флопи-птица уђе у препреку."},
"whenRunButtonClick":function(d){return "када игра почне"},
"whenRunButtonClickTooltip":function(d){return "Изврши доње акције када игра почне."},
"yes":function(d){return "Да"}};