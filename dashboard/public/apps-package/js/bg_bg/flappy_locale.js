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
"continue":function(d){return "Напред"},
"doCode":function(d){return "прави"},
"elseCode":function(d){return "иначе"},
"endGame":function(d){return "прекрати игра"},
"endGameTooltip":function(d){return "Приключва играта."},
"finalLevel":function(d){return "Поздравления! Ти реши последния пъзел."},
"flap":function(d){return "плесни с крила"},
"flapRandom":function(d){return "пляскане с крила случаен брой пъти"},
"flapVerySmall":function(d){return "плесни на много малко разстояние"},
"flapSmall":function(d){return "плесни на малко разстояние"},
"flapNormal":function(d){return "плесни на нормално разстояние"},
"flapLarge":function(d){return "плесни на голямо разстояние"},
"flapVeryLarge":function(d){return "плесни на много голямо разстояние"},
"flapTooltip":function(d){return "Придвижва героя нагоре."},
"flappySpecificFail":function(d){return "Вашият код изглежда добре - героят ще пляска с всяко щракване. Но вие трябва да щракнете много пъти за да прелети до целта."},
"incrementPlayerScore":function(d){return "отбележи точка"},
"incrementPlayerScoreTooltip":function(d){return "Добавя една точка към текущия резултат на играча."},
"nextLevel":function(d){return "Поздравления! Ти завърши този пъзел."},
"no":function(d){return "Не"},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блока."},
"playSoundRandom":function(d){return "изпълни случаен звук"},
"playSoundBounce":function(d){return "изпълни звук \"Подскок\""},
"playSoundCrunch":function(d){return "изпълни звук на болка"},
"playSoundDie":function(d){return "изпълни тъжен звук"},
"playSoundHit":function(d){return "изпълни звук \"Размазване\""},
"playSoundPoint":function(d){return "изпълни звук \"Отбележи Точка\""},
"playSoundSwoosh":function(d){return "изпълни звук \"Фучене\""},
"playSoundWing":function(d){return "изпълни звук \"Плясък с Крила\""},
"playSoundJet":function(d){return "изпълни звук \"Реактивен Самолет\""},
"playSoundCrash":function(d){return "изпълни звук \"Катастрофа\""},
"playSoundJingle":function(d){return "изпълни звук \"Звънчета\""},
"playSoundSplash":function(d){return "изпълни звук \"Воден плясък\""},
"playSoundLaser":function(d){return "изпълни звук \"Лазер\""},
"playSoundTooltip":function(d){return "Възпроизвежда избраният звук."},
"reinfFeedbackMsg":function(d){return "Можеш да натиснеш бутона \"Опитай отново\", за да се върнеш към играта си."},
"scoreText":function(d){return "Резултат: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "задай сцена"},
"setBackgroundRandom":function(d){return "задай случайна сцена"},
"setBackgroundFlappy":function(d){return "задай сцена \"Град\" (ден)"},
"setBackgroundNight":function(d){return "задай сцена \"Град\" (нощ)"},
"setBackgroundSciFi":function(d){return "задай сцена \"Научна фантастика\""},
"setBackgroundUnderwater":function(d){return "задай сцена \"Под водата\""},
"setBackgroundCave":function(d){return "задай сцена \"Пещера\""},
"setBackgroundSanta":function(d){return "задай сцена \"Дядо Коледа\""},
"setBackgroundTooltip":function(d){return "Този блок променя изображението на фона на играта."},
"setGapRandom":function(d){return "задай случайна пролука"},
"setGapVerySmall":function(d){return "задай много малка пролука"},
"setGapSmall":function(d){return "задай малка пролука"},
"setGapNormal":function(d){return "задай нормална пролука"},
"setGapLarge":function(d){return "задай голяма пролука"},
"setGapVeryLarge":function(d){return "задай много голяма пролука"},
"setGapHeightTooltip":function(d){return "Задава големината на вертикалната пролука между препятствията"},
"setGravityRandom":function(d){return "задай гравитация случайна"},
"setGravityVeryLow":function(d){return "задай гравитация много малка"},
"setGravityLow":function(d){return "задай гравитация малка"},
"setGravityNormal":function(d){return "задай гравитация нормална"},
"setGravityHigh":function(d){return "задай гравитация силна"},
"setGravityVeryHigh":function(d){return "задай гравитация много силна"},
"setGravityTooltip":function(d){return "Задава силата на гравитацията"},
"setGround":function(d){return "задай терен"},
"setGroundRandom":function(d){return "задай терен случаен"},
"setGroundFlappy":function(d){return "задай терен \"Земя\""},
"setGroundSciFi":function(d){return "задай терен \"Научна фантастика\""},
"setGroundUnderwater":function(d){return "задай терен \"Под водата\""},
"setGroundCave":function(d){return "задай терен \"Пещера\""},
"setGroundSanta":function(d){return "задай терен \"Дядо Коледа\""},
"setGroundLava":function(d){return "задай терен \"Лава\""},
"setGroundTooltip":function(d){return "Този блок променя изображението на терена."},
"setObstacle":function(d){return "задай препятствие"},
"setObstacleRandom":function(d){return "задай случайно препятствие"},
"setObstacleFlappy":function(d){return "задай препятствие \"Тръба\""},
"setObstacleSciFi":function(d){return "задай препятствие \"Научна фантастика\""},
"setObstacleUnderwater":function(d){return "задай препятствие \"Растение\""},
"setObstacleCave":function(d){return "задай препятствие \"Пещера\""},
"setObstacleSanta":function(d){return "задай препятствие \"комин\""},
"setObstacleLaser":function(d){return "задай препятствие \"лазер\""},
"setObstacleTooltip":function(d){return "Задава типа на препяствията, които ще се появят от този момент до следващата промяна."},
"setPlayer":function(d){return "задай герой"},
"setPlayerRandom":function(d){return "задай случаен герой"},
"setPlayerFlappy":function(d){return "задай герой \"жълтата птица\""},
"setPlayerRedBird":function(d){return "задай герой \"червената птица\""},
"setPlayerSciFi":function(d){return "задай герой \"космически кораб\""},
"setPlayerUnderwater":function(d){return "задай герой \"риба\""},
"setPlayerCave":function(d){return "задай герой \"прилеп\""},
"setPlayerSanta":function(d){return "задай герой \"Дядо Коледа\""},
"setPlayerShark":function(d){return "задай герой \"акула\""},
"setPlayerEaster":function(d){return "задай герой \"Великденски Заек\""},
"setPlayerBatman":function(d){return "задай герой \"човекът прилеп\""},
"setPlayerSubmarine":function(d){return "задай герой \"подводница\""},
"setPlayerUnicorn":function(d){return "задай герой \"еднорог\""},
"setPlayerFairy":function(d){return "задай герой \"фея\""},
"setPlayerSuperman":function(d){return "задай герой \"Пляскащ Човек\""},
"setPlayerTurkey":function(d){return "задай герой \"пуйка\""},
"setPlayerTooltip":function(d){return "Задава вида на героя, от този момент до следващата промяна."},
"setScore":function(d){return "задай резултат"},
"setScoreTooltip":function(d){return "Променя броя точки на играча."},
"setSpeed":function(d){return "задай скорост"},
"setSpeedTooltip":function(d){return "Определя скоростта на играта."},
"shareFlappyTwitter":function(d){return "Вижте Flappy играта, която създадох. Написах я сам с @codeorg"},
"shareGame":function(d){return "Споделете играта си:"},
"soundRandom":function(d){return "случаен"},
"soundBounce":function(d){return "скача"},
"soundCrunch":function(d){return "криза"},
"soundDie":function(d){return "Тъжен"},
"soundHit":function(d){return "размазване"},
"soundPoint":function(d){return "точка"},
"soundSwoosh":function(d){return "разклащане"},
"soundWing":function(d){return "крило"},
"soundJet":function(d){return "струя"},
"soundCrash":function(d){return "катастрофа"},
"soundJingle":function(d){return "Звънене"},
"soundSplash":function(d){return "плясък"},
"soundLaser":function(d){return "лазер"},
"speedRandom":function(d){return "задай случайна скорост"},
"speedVerySlow":function(d){return "задай много бавна скорост"},
"speedSlow":function(d){return "задай бавна скорост"},
"speedNormal":function(d){return "задай нормална скорост"},
"speedFast":function(d){return "задай бърза скорост"},
"speedVeryFast":function(d){return "задай много бърза скорост"},
"whenClick":function(d){return "при кликване"},
"whenClickTooltip":function(d){return "При всяко кликване, компютърът ще изпълни действията, изброени под този блок."},
"whenCollideGround":function(d){return "при сблъсък с терена"},
"whenCollideGroundTooltip":function(d){return "Когато героят се сблъска със земната повърхност, компютърът ще изпълни изброените под този блок действия."},
"whenCollideObstacle":function(d){return "при сблъсък с препятствие"},
"whenCollideObstacleTooltip":function(d){return "Когато героят се сблъска с препятствие, компютърът ще изпълни изброените под този блок действия."},
"whenEnterObstacle":function(d){return "при преминато препятствие"},
"whenEnterObstacleTooltip":function(d){return "Когато героят премине препятсвие, компютърът ще изпълни изброените под този блок действия."},
"whenRunButtonClick":function(d){return "при стартиране на играта"},
"whenRunButtonClickTooltip":function(d){return "При стартиране на нова игра, компютърът ще изпълни действията изброени под този блок."},
"yes":function(d){return "Да"}};