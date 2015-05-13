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
"continue":function(d){return "Далі"},
"doCode":function(d){return "робити"},
"elseCode":function(d){return "інакше"},
"endGame":function(d){return "завершити гру"},
"endGameTooltip":function(d){return "Завершує гру."},
"finalLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"flap":function(d){return "махати"},
"flapRandom":function(d){return "махати випадкову кількість"},
"flapVerySmall":function(d){return "махати дуже мало"},
"flapSmall":function(d){return "махати мало"},
"flapNormal":function(d){return "махати нормально"},
"flapLarge":function(d){return "махати багато"},
"flapVeryLarge":function(d){return "махати дуже багато"},
"flapTooltip":function(d){return "Полетіти вгору."},
"flappySpecificFail":function(d){return "Ваш код виглядає добре - крила махають за кожним кліком. Але потрібно клацнути багато разів, щоб дістатися до мети."},
"incrementPlayerScore":function(d){return "отримати очко"},
"incrementPlayerScoreTooltip":function(d){return "Додати один бал до рахунку гравця."},
"nextLevel":function(d){return "Вітання! Ви розв'язали останнє завдання."},
"no":function(d){return "Ні"},
"numBlocksNeeded":function(d){return "Це завдання можна розв'язати за допомогою %1 блоків."},
"playSoundRandom":function(d){return "грати випадковий звук"},
"playSoundBounce":function(d){return "грати звук відбивання"},
"playSoundCrunch":function(d){return "грати звук хрускоту"},
"playSoundDie":function(d){return "грати сумний звук"},
"playSoundHit":function(d){return "грати звук розбивання"},
"playSoundPoint":function(d){return "грати звук точки"},
"playSoundSwoosh":function(d){return "грати звук вихору"},
"playSoundWing":function(d){return "грати звук крила"},
"playSoundJet":function(d){return "грати звук літака"},
"playSoundCrash":function(d){return "грати звук трощення"},
"playSoundJingle":function(d){return "грати звук дзвіночків"},
"playSoundSplash":function(d){return "грати звук сплеску"},
"playSoundLaser":function(d){return "грати звук лазера"},
"playSoundTooltip":function(d){return "Відтворити обраний звук."},
"reinfFeedbackMsg":function(d){return "Можна натиснути кнопку \"Спробувати знову\", щоб повернутися і пограти у свою гру."},
"scoreText":function(d){return "Рахунок: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "встановити сцену"},
"setBackgroundRandom":function(d){return "встановити сцену Випадково"},
"setBackgroundFlappy":function(d){return "встановити сцену Місто (день)"},
"setBackgroundNight":function(d){return "встановити сцену Місто (ніч)"},
"setBackgroundSciFi":function(d){return "встановити сцену Наукова фантастика"},
"setBackgroundUnderwater":function(d){return "встановити сцену Підводний світ"},
"setBackgroundCave":function(d){return "встановити сцену Печера"},
"setBackgroundSanta":function(d){return "встановити сцену Санта"},
"setBackgroundTooltip":function(d){return "Встановлює фонове зображення"},
"setGapRandom":function(d){return "задає випадковий розрив"},
"setGapVerySmall":function(d){return "встановити дуже малий розрив"},
"setGapSmall":function(d){return "встановити малий розрив"},
"setGapNormal":function(d){return "встановити нормальний розрив"},
"setGapLarge":function(d){return "встановити великий розрив"},
"setGapVeryLarge":function(d){return "встановити дуже великий розрив"},
"setGapHeightTooltip":function(d){return "Встановлює вертикальний розрив у перешкоді"},
"setGravityRandom":function(d){return "встановити випадкове тяжіння"},
"setGravityVeryLow":function(d){return "встановити дуже мале тяжіння"},
"setGravityLow":function(d){return "встановити мале тяжіння"},
"setGravityNormal":function(d){return "встановити нормальне тяжіння"},
"setGravityHigh":function(d){return "встановити велике тяжіння"},
"setGravityVeryHigh":function(d){return "встановити дуже велике тяжіння"},
"setGravityTooltip":function(d){return "Встановлює рівень тяжіння"},
"setGround":function(d){return "встановити землю"},
"setGroundRandom":function(d){return "встановити землю Випадково"},
"setGroundFlappy":function(d){return "встановити землю Земля"},
"setGroundSciFi":function(d){return "встановити землю Наукова фантастика"},
"setGroundUnderwater":function(d){return "встановити землю Підводний світ"},
"setGroundCave":function(d){return "встановити землю Печера"},
"setGroundSanta":function(d){return "встановити землю Санта"},
"setGroundLava":function(d){return "встановити землю Лава"},
"setGroundTooltip":function(d){return "Встановлює зображення землі"},
"setObstacle":function(d){return "встановити перешкоду"},
"setObstacleRandom":function(d){return "встановити перешкоду Випадкова"},
"setObstacleFlappy":function(d){return "встановити перешкоду Труба"},
"setObstacleSciFi":function(d){return "встановити перешкоду Наукова фантастика"},
"setObstacleUnderwater":function(d){return "встановити перешкоду Рослина"},
"setObstacleCave":function(d){return "встановити перешкоду Печера"},
"setObstacleSanta":function(d){return "встановити перешкоду Димар"},
"setObstacleLaser":function(d){return "встановити перешкоду Лазер"},
"setObstacleTooltip":function(d){return "Встановлює зображення перешкоди"},
"setPlayer":function(d){return "встановити гравця"},
"setPlayerRandom":function(d){return "встановити гравця Випадково"},
"setPlayerFlappy":function(d){return "встановити гравця Жовтий птах"},
"setPlayerRedBird":function(d){return "встановити гравця Червоний птах"},
"setPlayerSciFi":function(d){return "встановити гравця Ракета"},
"setPlayerUnderwater":function(d){return "встановити гравця Риба"},
"setPlayerCave":function(d){return "встановити гравця Кажан"},
"setPlayerSanta":function(d){return "встановити гравця Санта"},
"setPlayerShark":function(d){return "встановити гравця Акула"},
"setPlayerEaster":function(d){return "встановити гравця Кролик"},
"setPlayerBatman":function(d){return "встановити гравця Бетмена"},
"setPlayerSubmarine":function(d){return "встановити гравця Підводний човен"},
"setPlayerUnicorn":function(d){return "встановити гравця Єдиноріг"},
"setPlayerFairy":function(d){return "встановити гравця Фея"},
"setPlayerSuperman":function(d){return "встановити гравця Супермен"},
"setPlayerTurkey":function(d){return "встановити гравця Індичка"},
"setPlayerTooltip":function(d){return "Встановлює зображення гравця"},
"setScore":function(d){return "встановити рахунок"},
"setScoreTooltip":function(d){return "Встановлює рахунок гравця"},
"setSpeed":function(d){return "встановити швидкість"},
"setSpeedTooltip":function(d){return "Встановлює швидкість гравця"},
"shareFlappyTwitter":function(d){return "Подивіться на гру в Пурха, яку я зробив! Я написав її сам разом з @codeorg"},
"shareGame":function(d){return "Поділитись своєю грою:"},
"soundRandom":function(d){return "випадковий"},
"soundBounce":function(d){return "відбитись"},
"soundCrunch":function(d){return "хрускіт"},
"soundDie":function(d){return "сумний"},
"soundHit":function(d){return "розбивання"},
"soundPoint":function(d){return "точка"},
"soundSwoosh":function(d){return "вихор"},
"soundWing":function(d){return "крило"},
"soundJet":function(d){return "літак"},
"soundCrash":function(d){return "трощення"},
"soundJingle":function(d){return "дзвіночок"},
"soundSplash":function(d){return "сплеск"},
"soundLaser":function(d){return "лазер"},
"speedRandom":function(d){return "встановити випадкову швидкість"},
"speedVerySlow":function(d){return "встановити дуже повільну швидкість"},
"speedSlow":function(d){return "встановити повільну швидкість"},
"speedNormal":function(d){return "встановити нормальну швидкість"},
"speedFast":function(d){return "встановити високу швидкість"},
"speedVeryFast":function(d){return "встановити дуже високу швидкість"},
"whenClick":function(d){return "коли клацнули"},
"whenClickTooltip":function(d){return "Виконання дій, поданих нижче, після події клацання мишкою."},
"whenCollideGround":function(d){return "коли впав на землю"},
"whenCollideGroundTooltip":function(d){return "Виконання дій, поданих нижче, після події удару Пурха об землю."},
"whenCollideObstacle":function(d){return "коли влучив у перешкоду"},
"whenCollideObstacleTooltip":function(d){return "Виконання дій, поданих нижче, після події удару Пурха об перешкоду."},
"whenEnterObstacle":function(d){return "коли минув перешкоду"},
"whenEnterObstacleTooltip":function(d){return "Виконання дій, поданих нижче, коли Пурх входить в перешкоду."},
"whenRunButtonClick":function(d){return "коли гра починається"},
"whenRunButtonClickTooltip":function(d){return "Виконання дій, поданих нижче, коли починається гра."},
"yes":function(d){return "Так"}};