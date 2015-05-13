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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Продолжи"},
"doCode":function(d){return "изврши"},
"elseCode":function(d){return "инаку"},
"endGame":function(d){return "Крај на играта"},
"endGameTooltip":function(d){return "Ја завршува играта."},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"flap":function(d){return "Мафтање"},
"flapRandom":function(d){return "Мафтај со случајна количина"},
"flapVerySmall":function(d){return "Мафтај со мала количина"},
"flapSmall":function(d){return "замавни со мала количина"},
"flapNormal":function(d){return "замавни со нормална количина"},
"flapLarge":function(d){return "замавни со голема количина"},
"flapVeryLarge":function(d){return "Замавни со најголема количина"},
"flapTooltip":function(d){return "летај со замвнување напред."},
"flappySpecificFail":function(d){return "Твојот код изгледа добро - тоа ќе размавта со секој клик. Но, вие треба да кликнете многу пати да се размавта до целта."},
"incrementPlayerScore":function(d){return "Постигни бод "},
"incrementPlayerScoreTooltip":function(d){return "Додадете  уште една на сегашниот играч на бодови."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"playSoundRandom":function(d){return "пушти случаен звук"},
"playSoundBounce":function(d){return "Пушти го звукот кој отскокнува"},
"playSoundCrunch":function(d){return "слушај звук на криза"},
"playSoundDie":function(d){return "Пушти тажен звук"},
"playSoundHit":function(d){return "Пушти го поттиснатиот звук"},
"playSoundPoint":function(d){return "Пушти го звукот за поени"},
"playSoundSwoosh":function(d){return "Пушти го swoosh звук"},
"playSoundWing":function(d){return "Пушти го звукот на крилото"},
"playSoundJet":function(d){return "Пушти го звукот на авион"},
"playSoundCrash":function(d){return "Пушти го звукот на несреќа"},
"playSoundJingle":function(d){return "Пушти го звукот за најава"},
"playSoundSplash":function(d){return "Пушти го поздравниот звук"},
"playSoundLaser":function(d){return "пушти го ласерскиот звук"},
"playSoundTooltip":function(d){return "Пушти го избраниот звук."},
"reinfFeedbackMsg":function(d){return "Можете да го притиснете \"Обиди се повторно\" копчето за да се врати во игра на својата игра."},
"scoreText":function(d){return "Резулта: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "постави сцена"},
"setBackgroundRandom":function(d){return "постави ја сцената по случајност"},
"setBackgroundFlappy":function(d){return "поставија сцената на градот(ден)"},
"setBackgroundNight":function(d){return "постави ја сцената на Градот(ноќ)"},
"setBackgroundSciFi":function(d){return "постави научнофантастична сцена"},
"setBackgroundUnderwater":function(d){return "поставија сцената  Подвода"},
"setBackgroundCave":function(d){return "поставија сцената на Пештерата"},
"setBackgroundSanta":function(d){return "поставија сцената на Дедо Мраз"},
"setBackgroundTooltip":function(d){return "Поставија сликата во позадина"},
"setGapRandom":function(d){return "постави случаен јаз"},
"setGapVerySmall":function(d){return "постави многу мал јаз"},
"setGapSmall":function(d){return "постави мал јаз"},
"setGapNormal":function(d){return "постави нормален јаз"},
"setGapLarge":function(d){return "постави голем јаз"},
"setGapVeryLarge":function(d){return "постави многу голем јаз"},
"setGapHeightTooltip":function(d){return " поставува вертикалната празнина во пречка"},
"setGravityRandom":function(d){return "поставија ја случајно гравитацијата"},
"setGravityVeryLow":function(d){return "поставија гравитацијата на многу ниско"},
"setGravityLow":function(d){return "поставија гравитацијата ниско"},
"setGravityNormal":function(d){return "постави ја гравитацијата на нормал "},
"setGravityHigh":function(d){return "поставија гравитацијата на високо"},
"setGravityVeryHigh":function(d){return "поставија гравитацијата на нај високо"},
"setGravityTooltip":function(d){return "Го поставува нивото на гравитацијата"},
"setGround":function(d){return "Поставете ги основните"},
"setGroundRandom":function(d){return "постави ја сцената случајно"},
"setGroundFlappy":function(d){return "Поставете основи Основи"},
"setGroundSciFi":function(d){return "да постават основни Sci-Fi"},
"setGroundUnderwater":function(d){return "да постават основн за Подводни"},
"setGroundCave":function(d){return "да се постави основа за Пештера"},
"setGroundSanta":function(d){return "постави основа за Дедо Мраз"},
"setGroundLava":function(d){return "постави основа за Лава"},
"setGroundTooltip":function(d){return "поставија основната слика"},
"setObstacle":function(d){return "постави пречка"},
"setObstacleRandom":function(d){return "поставија пречката случајно"},
"setObstacleFlappy":function(d){return "поставија пречката со цевки"},
"setObstacleSciFi":function(d){return "поставија пречката со Sci-Fi"},
"setObstacleUnderwater":function(d){return "Постави ја пречката Растение"},
"setObstacleCave":function(d){return "Постави ја пречката пештера"},
"setObstacleSanta":function(d){return "Постави ја пречката Оџак"},
"setObstacleLaser":function(d){return "Поставија пречката Ласер"},
"setObstacleTooltip":function(d){return "Постави ја пречката на слика"},
"setPlayer":function(d){return "избери играч"},
"setPlayerRandom":function(d){return "избери играч случајно"},
"setPlayerFlappy":function(d){return "ибери го играчот жолтата птица"},
"setPlayerRedBird":function(d){return "избери го играчот црвената птица"},
"setPlayerSciFi":function(d){return "избери го играчот Звезден брод"},
"setPlayerUnderwater":function(d){return "избери го играчот Риба"},
"setPlayerCave":function(d){return "избри го играчот Лилјак"},
"setPlayerSanta":function(d){return "избери играч Дедо мраз"},
"setPlayerShark":function(d){return "избери играч Ајкула"},
"setPlayerEaster":function(d){return "избери играч Велигденско Зајче"},
"setPlayerBatman":function(d){return "избери играч Лошиот чичко"},
"setPlayerSubmarine":function(d){return "избери играч Подморница"},
"setPlayerUnicorn":function(d){return "избери играч Еднорог"},
"setPlayerFairy":function(d){return "избери играч Самовила"},
"setPlayerSuperman":function(d){return "избери играч Човекот Флапи"},
"setPlayerTurkey":function(d){return "избери играч Турција"},
"setPlayerTooltip":function(d){return "Ја поставува сликата на играчот"},
"setScore":function(d){return "постави резултат"},
"setScoreTooltip":function(d){return "Го поставува резултатот на играчот"},
"setSpeed":function(d){return "поставува брзина"},
"setSpeedTooltip":function(d){return "ја поставува брзината нивото"},
"shareFlappyTwitter":function(d){return "Проверете ја  Flappy играта  јас  ја направив. Јас ја напишав во @codeorg"},
"shareGame":function(d){return "Споделија твојата игра:"},
"soundRandom":function(d){return "случајно"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "криза"},
"soundDie":function(d){return "тажен"},
"soundHit":function(d){return "Смачкан"},
"soundPoint":function(d){return "точка"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "крило"},
"soundJet":function(d){return "Авион"},
"soundCrash":function(d){return "судар"},
"soundJingle":function(d){return "звонче"},
"soundSplash":function(d){return "удар"},
"soundLaser":function(d){return "Ласер"},
"speedRandom":function(d){return "Постави ја брзината на случајно"},
"speedVerySlow":function(d){return "Постави ја брзината на многу бавно"},
"speedSlow":function(d){return "Постави ја брзината на бавно"},
"speedNormal":function(d){return "Постави ја брзината на нормално"},
"speedFast":function(d){return "Постави ја брзината на брзо"},
"speedVeryFast":function(d){return "Постави ја на многу брзо брзината"},
"whenClick":function(d){return "кога ќе кликнеш"},
"whenClickTooltip":function(d){return "Изврши  ѓи акциите подолу, кога  се појави клик настанот."},
"whenCollideGround":function(d){return "кога ја погоди земјата"},
"whenCollideGroundTooltip":function(d){return "Изврши акциите подолу кога Flappy удира на земјата."},
"whenCollideObstacle":function(d){return "кога ќе погоди пречка"},
"whenCollideObstacleTooltip":function(d){return "Изврши ѓи акциите подолу кога Flappy ќе удри во пречка."},
"whenEnterObstacle":function(d){return "кога ќе помине пречка"},
"whenEnterObstacleTooltip":function(d){return "Изврши ѓи акциите подолу кога Flappy ќе помине  пречка."},
"whenRunButtonClick":function(d){return "Кога играта започнува"},
"whenRunButtonClickTooltip":function(d){return "Извршување на активностите под кога играта почнува."},
"yes":function(d){return "Yes"}};