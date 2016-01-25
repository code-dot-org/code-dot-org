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
"continue":function(d){return "Жалғастыру"},
"doCode":function(d){return "жасау"},
"elseCode":function(d){return "немесе"},
"endGame":function(d){return "ойын аяқталды"},
"endGameTooltip":function(d){return "Ойын аяқталды."},
"finalLevel":function(d){return "Құттықтаймыз! Сіз соңғы басқатырғышты шештіңіз."},
"flap":function(d){return "қанат қағу"},
"flapRandom":function(d){return "кездейсоқ қанат қағу саны"},
"flapVerySmall":function(d){return "өте аз қанат қағу саны"},
"flapSmall":function(d){return "аз қанат қағу саны"},
"flapNormal":function(d){return "орташа қанат қағу саны"},
"flapLarge":function(d){return "үлкен мөлшерде қанат қағу саны"},
"flapVeryLarge":function(d){return "өте үлкен мөлшерде қанат қағу саны"},
"flapTooltip":function(d){return "Fly Flappy қозғалысы."},
"flappySpecificFail":function(d){return "Сіздің кодыңыз жақсарды - енді әрбір шерту кезінде құс қанатын қағады. Бірақ нысанаға жету үшін сізге көбірек шертуге тура келеді."},
"incrementPlayerScore":function(d){return "ұпай қосу"},
"incrementPlayerScoreTooltip":function(d){return "Ойыншының қазіргі ұпайына бірді қосу"},
"nextLevel":function(d){return "Құттықтаймыз! Сіз бұл басқатырғышты шештіңіз."},
"no":function(d){return "Жоқ"},
"numBlocksNeeded":function(d){return "Бұл басқатырғыш %1 бөлшекпен шешілуі мүмкін."},
"playSoundRandom":function(d){return "кездейсоқ әуенді ойнау"},
"playSoundBounce":function(d){return "кері қайту әуенін ойнау"},
"playSoundCrunch":function(d){return "күтірлек дыбысты ойнату"},
"playSoundDie":function(d){return "көңілсіз әуен ойнау"},
"playSoundHit":function(d){return "сыну әуенін ойнау"},
"playSoundPoint":function(d){return "ұпай алу әуенін ойнау"},
"playSoundSwoosh":function(d){return "ысқыру әуенін ойнау"},
"playSoundWing":function(d){return "қанат қағу әуенін ойнау"},
"playSoundJet":function(d){return "жылдамдық әуенін ойнау"},
"playSoundCrash":function(d){return "соғылу әуенін ойнау"},
"playSoundJingle":function(d){return "қоңырау әуенін ойнау"},
"playSoundSplash":function(d){return "шашырау әуенін ойнау"},
"playSoundLaser":function(d){return "лазер әуенін ойнау"},
"playSoundTooltip":function(d){return "таңдалған дыбысты ойнату"},
"reinfFeedbackMsg":function(d){return " \"Қайта байқап көріңіз\" батырмасын басу арқылы ойынды қайта бастауыңызға болады."},
"scoreText":function(d){return "Ұпай саны: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ойнайтын жерді таңдау"},
"setBackgroundRandom":function(d){return "ойнайтын жерді Кездейсоқ таңдау"},
"setBackgroundFlappy":function(d){return "Қала (күндіз) ойын орнын таңдау"},
"setBackgroundNight":function(d){return "Қала (түн) ойын орнын таңдау"},
"setBackgroundSciFi":function(d){return "Фантастика ойын орнын таңдау"},
"setBackgroundUnderwater":function(d){return "Суасты ойын орнын таңдау"},
"setBackgroundCave":function(d){return "Үңгір ойын орнын таңдау"},
"setBackgroundSanta":function(d){return "Аяз Ата ойын орнын таңдау"},
"setBackgroundTooltip":function(d){return "Фон суретін таңдау"},
"setGapRandom":function(d){return "арақашықтықты кездейсоқ таңдау"},
"setGapVerySmall":function(d){return "арақашықтықты өте жақынға орнату"},
"setGapSmall":function(d){return "арақашықтықты жақынға орнату"},
"setGapNormal":function(d){return "арақашықтықты орташаға орнату"},
"setGapLarge":function(d){return "арақашықтықты алыс орнату"},
"setGapVeryLarge":function(d){return "арақашықтықты өте алыс орнату"},
"setGapHeightTooltip":function(d){return "Кедергі арасындағы арақашықтықты орнату"},
"setGravityRandom":function(d){return "тартылыс күшін кездейсоқ таңдау"},
"setGravityVeryLow":function(d){return "тартылыс күшін өте азға орнату"},
"setGravityLow":function(d){return "тартылыс күшін азға орнату"},
"setGravityNormal":function(d){return "тартылыс күшін орташаға орнату"},
"setGravityHigh":function(d){return "тартылыс күшін үлкенге орнату"},
"setGravityVeryHigh":function(d){return "тартылыс күшін өте үлкенге орнату"},
"setGravityTooltip":function(d){return "Ойын деңгейінің тартылыс күшін орнату"},
"setGround":function(d){return "жер фонын орнату"},
"setGroundRandom":function(d){return "жер фонын кездейсоқ орнату"},
"setGroundFlappy":function(d){return "Жер үсті фонын таңдау"},
"setGroundSciFi":function(d){return "Фантастика фонын таңдау"},
"setGroundUnderwater":function(d){return "Суасты фонын таңдау"},
"setGroundCave":function(d){return "Үңгір фонын таңдау"},
"setGroundSanta":function(d){return "Аяз ата фонын таңдау"},
"setGroundLava":function(d){return "Лава фонын таңдау"},
"setGroundTooltip":function(d){return "Фон суретін таңдау"},
"setObstacle":function(d){return "кедергіні орнату"},
"setObstacleRandom":function(d){return "кедергіні кездейсоқ орнату"},
"setObstacleFlappy":function(d){return "Құбыр кедергісін таңдау"},
"setObstacleSciFi":function(d){return "Фантастика кедергісін таңдау"},
"setObstacleUnderwater":function(d){return "Өсімдіктер кедергісін таңдау"},
"setObstacleCave":function(d){return "Үңгір кедергісін таңдау"},
"setObstacleSanta":function(d){return "Мұржа кедергісін таңдау"},
"setObstacleLaser":function(d){return "Лазер кедергісін таңдау"},
"setObstacleTooltip":function(d){return "Кедергі суретін таңдау"},
"setPlayer":function(d){return "ойыншыны таңдау"},
"setPlayerRandom":function(d){return "ойыншыны кездейсоқ таңдау"},
"setPlayerFlappy":function(d){return "ойыншы ретінде Сары Құсты таңдау"},
"setPlayerRedBird":function(d){return "ойыншы ретінде Қызыл Құсты таңдау"},
"setPlayerSciFi":function(d){return "ойыншы ретінде Ғарыш Кемесін таңдау"},
"setPlayerUnderwater":function(d){return "ойыншы ретінде Балықты таңдау"},
"setPlayerCave":function(d){return "ойыншы ретінде Жарғанатты таңдау"},
"setPlayerSanta":function(d){return "ойыншы ретінде Аяз Атаны таңдау"},
"setPlayerShark":function(d){return "ойыншы ретінде Акуланы таңдау"},
"setPlayerEaster":function(d){return "ойыншы ретінде Пасха Банниді таңдау"},
"setPlayerBatman":function(d){return "ойыншы ретінде Бұзық Баланы таңдау"},
"setPlayerSubmarine":function(d){return "ойыншы ретінде Сүңгуір қайықты таңдау"},
"setPlayerUnicorn":function(d){return "ойыншы ретінде Жалғыз Мүйіздіні қайықты таңдау"},
"setPlayerFairy":function(d){return "ойыншы ретінде Періні таңдау"},
"setPlayerSuperman":function(d){return "ойыншы ретінде Құс Адамды таңдау"},
"setPlayerTurkey":function(d){return "ойыншы ретінде Тауықты таңдау"},
"setPlayerTooltip":function(d){return "Ойыншы суретін таңдау"},
"setScore":function(d){return "ұпайды орнату"},
"setScoreTooltip":function(d){return "Ойыншыларға ұпай беруді орнату"},
"setSpeed":function(d){return "жылдамдықты орнату"},
"setSpeedTooltip":function(d){return "Деңгей жылдамдығын орнату"},
"shareFlappyTwitter":function(d){return "Мен жасаған Flappy ойынын ойнап көріңіз. Мен бұны @codeorg-та жасадым"},
"shareGame":function(d){return "Ойыныңызбен бөлісіңіз:"},
"soundRandom":function(d){return "кездейсоқ"},
"soundBounce":function(d){return "кері серпіліс"},
"soundCrunch":function(d){return "шағылу"},
"soundDie":function(d){return "көңілсіз"},
"soundHit":function(d){return "сыну"},
"soundPoint":function(d){return "ұпай алу"},
"soundSwoosh":function(d){return "ысқыру"},
"soundWing":function(d){return "қанат қағу"},
"soundJet":function(d){return "жылдамдық"},
"soundCrash":function(d){return "соғылу"},
"soundJingle":function(d){return "қоңырау"},
"soundSplash":function(d){return "шашырау"},
"soundLaser":function(d){return "лазер"},
"speedRandom":function(d){return "жылдамдықты кездейсоқ орнату"},
"speedVerySlow":function(d){return "жылдамдықты өте азға орнату"},
"speedSlow":function(d){return "аз жылдамдыққа орнату"},
"speedNormal":function(d){return "орташа жылдамдыққа орнату"},
"speedFast":function(d){return "тез жылдамдыққа орнату"},
"speedVeryFast":function(d){return "өте тез жылдамдыққа орнату"},
"whenClick":function(d){return "шерту кезінде"},
"whenClickTooltip":function(d){return "Шерту оқиғасы болған кезде төмендегі іс-әрекеттерді орындаңыз."},
"whenCollideGround":function(d){return "жерге құлау кезінде"},
"whenCollideGroundTooltip":function(d){return "Flappy жерге құлаған кезде төмендегі іс-әрекеттерді орындаңыз."},
"whenCollideObstacle":function(d){return "кедергіге соғылған кезде"},
"whenCollideObstacleTooltip":function(d){return "Flappy кедергіге соғылған кезде төмендегі іс-әрекеттерді орындаңыз."},
"whenEnterObstacle":function(d){return "кедергіден өткен кезде"},
"whenEnterObstacleTooltip":function(d){return "Flappy кедергіге арасына кірген кезде төмендегі іс-әрекеттерді орындаңыз."},
"whenRunButtonClick":function(d){return "ойын басталғанда"},
"whenRunButtonClickTooltip":function(d){return "Ойын басталғанда, төмендегі іс-әрекеттерді орындаңыз."},
"yes":function(d){return "Иә"}};