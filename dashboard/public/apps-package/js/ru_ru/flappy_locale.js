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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"continue":function(d){return "Продолжить"},
"doCode":function(d){return "выполнить"},
"elseCode":function(d){return "или"},
"endGame":function(d){return "закончить игру"},
"endGameTooltip":function(d){return "Завершает игру."},
"finalLevel":function(d){return "Поздравляю! Последняя головоломка решена."},
"flap":function(d){return "взмах крыльев"},
"flapRandom":function(d){return "Взлететь со случайной силой"},
"flapVerySmall":function(d){return "Подлететь с очень маленькой силой"},
"flapSmall":function(d){return "Подлететь с маленькой силой"},
"flapNormal":function(d){return "Подлететь с обычной силой"},
"flapLarge":function(d){return "Подлететь с большой силой"},
"flapVeryLarge":function(d){return "Подлететь с очень большой силой"},
"flapTooltip":function(d){return "Летите вверх."},
"flappySpecificFail":function(d){return "Твой код выглядит неплохо - она будет взлетать при клике мышкой. Но тебе прийдется кликать мышкой много раз, чтобы достичь цели."},
"incrementPlayerScore":function(d){return "выиграть очко"},
"incrementPlayerScoreTooltip":function(d){return "Добавить игроку одно очко."},
"nextLevel":function(d){return "Поздравляю! Головоломка решена."},
"no":function(d){return "Нет"},
"numBlocksNeeded":function(d){return "Эта головоломка может быть решена с помощью %1 блоков."},
"playSoundRandom":function(d){return "воспроизвести случайный звук"},
"playSoundBounce":function(d){return "воспроизвести звук отскока"},
"playSoundCrunch":function(d){return "проиграть звук хруста"},
"playSoundDie":function(d){return "воспроизвести грустный звук"},
"playSoundHit":function(d){return "воспроизвести звук разрушения"},
"playSoundPoint":function(d){return "проиграть звук преодоления препятствия"},
"playSoundSwoosh":function(d){return "воспроизвести звук \"выполнено\""},
"playSoundWing":function(d){return "воспроизвести звук размаха крыльев"},
"playSoundJet":function(d){return "воспроизвести звук двигателя"},
"playSoundCrash":function(d){return "воспроизвести звук крушения"},
"playSoundJingle":function(d){return "воспроизвести звук звонка"},
"playSoundSplash":function(d){return "вопроизвести звук всплеска"},
"playSoundLaser":function(d){return "воспроизвести звук лазера"},
"playSoundTooltip":function(d){return "Воспроизвести выбранный звук."},
"reinfFeedbackMsg":function(d){return "Вы можете нажать кнопку «Повторить», чтобы вернуться в игру."},
"scoreText":function(d){return "Оценка: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "задать сцену"},
"setBackgroundRandom":function(d){return "установить  сцену Случайная"},
"setBackgroundFlappy":function(d){return "установить сцену город (день)"},
"setBackgroundNight":function(d){return "задать сцену Город (ночь)"},
"setBackgroundSciFi":function(d){return "установить сцену Научно Фантастическая"},
"setBackgroundUnderwater":function(d){return "задать сцену Под Водой"},
"setBackgroundCave":function(d){return "задать сцену Пещера"},
"setBackgroundSanta":function(d){return "установить сцену Новогодняя"},
"setBackgroundTooltip":function(d){return "Установить на задний план изображение"},
"setGapRandom":function(d){return "установить случайное расстояние"},
"setGapVerySmall":function(d){return "установить очень маленькое расстояние"},
"setGapSmall":function(d){return "установить небольшой разрыв"},
"setGapNormal":function(d){return "установить обычное расстояние"},
"setGapLarge":function(d){return "установить большое расстояние"},
"setGapVeryLarge":function(d){return "установить очень большое расстояние"},
"setGapHeightTooltip":function(d){return "Задать вертикальный разрыв в препятствии"},
"setGravityRandom":function(d){return "Установить случайную гравитацию"},
"setGravityVeryLow":function(d){return "Установить очень низкую гравитацию"},
"setGravityLow":function(d){return "Установить низкую гравитацию"},
"setGravityNormal":function(d){return "Установить нормальную гравитацию"},
"setGravityHigh":function(d){return "Установить высокую гравитацию"},
"setGravityVeryHigh":function(d){return "Установить очень высокую гравитацию"},
"setGravityTooltip":function(d){return "Задать уровень сложности"},
"setGround":function(d){return "задать основание"},
"setGroundRandom":function(d){return "задать случайное основание"},
"setGroundFlappy":function(d){return "задать основание Земля"},
"setGroundSciFi":function(d){return "задать основание Научная Фантастика"},
"setGroundUnderwater":function(d){return "задать основание Под Водой"},
"setGroundCave":function(d){return "задать основание Пещера"},
"setGroundSanta":function(d){return "задать основание Санта"},
"setGroundLava":function(d){return "установить основание Лава"},
"setGroundTooltip":function(d){return "Задать основное изображение"},
"setObstacle":function(d){return "установка препятствий"},
"setObstacleRandom":function(d){return "задать случайное припятствие"},
"setObstacleFlappy":function(d){return "установить препятствие Труба"},
"setObstacleSciFi":function(d){return "установить препятствие Научная фантастика"},
"setObstacleUnderwater":function(d){return "установить препятствие Растение"},
"setObstacleCave":function(d){return "установить препятствие Пещера"},
"setObstacleSanta":function(d){return "установить препятствие Дымоход"},
"setObstacleLaser":function(d){return "установить препятствие Лазер"},
"setObstacleTooltip":function(d){return "Установить изображение препятствия"},
"setPlayer":function(d){return "выбрать игрока"},
"setPlayerRandom":function(d){return "установить игрока Случайный"},
"setPlayerFlappy":function(d){return "установить игрока Жёлтая Птица"},
"setPlayerRedBird":function(d){return "установить игрока Красная Птица"},
"setPlayerSciFi":function(d){return "установить игрока Космический Корабль"},
"setPlayerUnderwater":function(d){return "установить игрока Рыбка"},
"setPlayerCave":function(d){return "установить игрока Летучая Мышь"},
"setPlayerSanta":function(d){return "установить игрока Санта"},
"setPlayerShark":function(d){return "установить игрока Акула"},
"setPlayerEaster":function(d){return "установить игрока Пасхальный кролик"},
"setPlayerBatman":function(d){return "установить игрока Бэтмен"},
"setPlayerSubmarine":function(d){return "установить игрока Подводная Лодка"},
"setPlayerUnicorn":function(d){return "установить игрока Единорог"},
"setPlayerFairy":function(d){return "установить игрока Фея"},
"setPlayerSuperman":function(d){return "установить игрока Супермен"},
"setPlayerTurkey":function(d){return "установить игрока Индюшка"},
"setPlayerTooltip":function(d){return "установить изображение игрока"},
"setScore":function(d){return "задать счет"},
"setScoreTooltip":function(d){return "Установить счет игрока"},
"setSpeed":function(d){return "Задать скорость"},
"setSpeedTooltip":function(d){return "Установить уровень скорости"},
"shareFlappyTwitter":function(d){return "Поиграйте в мою игру Flappy Bird. Она написана мной с помощью  @codeorg"},
"shareGame":function(d){return "Поделиться твоей игрой:"},
"soundRandom":function(d){return "случайный"},
"soundBounce":function(d){return "отскочить"},
"soundCrunch":function(d){return "хруст"},
"soundDie":function(d){return "грустно"},
"soundHit":function(d){return "разбить"},
"soundPoint":function(d){return "очко"},
"soundSwoosh":function(d){return "галочка"},
"soundWing":function(d){return "крыло"},
"soundJet":function(d){return "реактивный"},
"soundCrash":function(d){return "сбой"},
"soundJingle":function(d){return "звон"},
"soundSplash":function(d){return "всплеск"},
"soundLaser":function(d){return "лазер"},
"speedRandom":function(d){return "установить случайную скорость"},
"speedVerySlow":function(d){return "задать очень медленную скорость"},
"speedSlow":function(d){return "задать медленную скорость"},
"speedNormal":function(d){return "задать нормальную скорость"},
"speedFast":function(d){return "задать быструю скорость"},
"speedVeryFast":function(d){return "задать очень быструю скорость"},
"whenClick":function(d){return "когда щёлкнете мышкой"},
"whenClickTooltip":function(d){return "Выполните действия ниже при возникновении события нажатия."},
"whenCollideGround":function(d){return "при ударе о землю"},
"whenCollideGroundTooltip":function(d){return "Выполните действия ниже когда Флэппи упадет на землю."},
"whenCollideObstacle":function(d){return "при попадании в препятствие"},
"whenCollideObstacleTooltip":function(d){return "Выполните действия ниже, когда Флэппи удариться о препятствие."},
"whenEnterObstacle":function(d){return "когда проходит препятствие"},
"whenEnterObstacleTooltip":function(d){return "Выполните действия ниже, когда Флэппи ударится о препятствие."},
"whenRunButtonClick":function(d){return "когда игра начнется"},
"whenRunButtonClickTooltip":function(d){return "Выполните действия ниже, когда игра начнется."},
"yes":function(d){return "Да"}};