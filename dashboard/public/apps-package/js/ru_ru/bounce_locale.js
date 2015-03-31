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
"bounceBall":function(d){return "отскок мяча"},
"bounceBallTooltip":function(d){return "Отскок мяча от объекта."},
"continue":function(d){return "Продолжить"},
"dirE":function(d){return "В"},
"dirN":function(d){return "С"},
"dirS":function(d){return "Ю"},
"dirW":function(d){return "З"},
"doCode":function(d){return "выполнить"},
"elseCode":function(d){return "иначе"},
"finalLevel":function(d){return "Поздравляю! Последняя головоломка решена."},
"heightParameter":function(d){return "высота"},
"ifCode":function(d){return "если"},
"ifPathAhead":function(d){return "если можно пройти вперед"},
"ifTooltip":function(d){return "если можно пройти в данном направлении, тогда исполнить следующие действия."},
"ifelseTooltip":function(d){return "Если в данном направлении продвижение возможно, тогда выполняется первый блок команд. Иначе, выполняется второй блок."},
"incrementOpponentScore":function(d){return "Противника заработал один балл"},
"incrementOpponentScoreTooltip":function(d){return "Добавьте один балл к текущему счёту соперника."},
"incrementPlayerScore":function(d){return "оценка точки"},
"incrementPlayerScoreTooltip":function(d){return "Добавить игроку одно очко."},
"isWall":function(d){return "Это стена?"},
"isWallTooltip":function(d){return "Возвращает значение true, если здесь есть стена"},
"launchBall":function(d){return "запустить новый шарик"},
"launchBallTooltip":function(d){return "Запустить шарик в игру."},
"makeYourOwn":function(d){return "Создай Свою Игру Про Шарики"},
"moveDown":function(d){return "Переместить вниз"},
"moveDownTooltip":function(d){return "Переместить платформу вниз."},
"moveForward":function(d){return "двигаться вперед"},
"moveForwardTooltip":function(d){return "Передвигает меня вперед на одну клетку."},
"moveLeft":function(d){return "переместить влево"},
"moveLeftTooltip":function(d){return "Переместить платформу влево."},
"moveRight":function(d){return "Переместить вправо"},
"moveRightTooltip":function(d){return "Переместить платформу вправо."},
"moveUp":function(d){return "переместить вверх"},
"moveUpTooltip":function(d){return "Переместить платформу вверх."},
"nextLevel":function(d){return "Поздравляю! Головоломка решена."},
"no":function(d){return "Нет"},
"noPathAhead":function(d){return "путь закрыт"},
"noPathLeft":function(d){return "нет пути налево"},
"noPathRight":function(d){return "нет пути направо"},
"numBlocksNeeded":function(d){return "Эта головоломка может быть решена с помощью %1 блоков."},
"pathAhead":function(d){return "путь впереди"},
"pathLeft":function(d){return "если путь налево"},
"pathRight":function(d){return "если путь направо"},
"pilePresent":function(d){return "здесь есть куча"},
"playSoundCrunch":function(d){return "исполнить звук хруста"},
"playSoundGoal1":function(d){return "исполнить звук цели 1"},
"playSoundGoal2":function(d){return "исполнить звук цели 2"},
"playSoundHit":function(d){return "исполнить звук удара"},
"playSoundLosePoint":function(d){return "исполнить звук потери очка"},
"playSoundLosePoint2":function(d){return "исполнить звук потери очка 2"},
"playSoundRetro":function(d){return "исполнить звук ретро"},
"playSoundRubber":function(d){return "исполнить звук резины"},
"playSoundSlap":function(d){return "исполнить звук шлепка"},
"playSoundTooltip":function(d){return "Исполнить выбранный звук."},
"playSoundWinPoint":function(d){return "исполнить звук выигрыша очка"},
"playSoundWinPoint2":function(d){return "исполнить звук выигрыша очка 2"},
"playSoundWood":function(d){return "исполнить звук дерева"},
"putdownTower":function(d){return "положить башню"},
"reinfFeedbackMsg":function(d){return "Вы можете нажать кнопку «Повторить», чтобы вернуться в игру."},
"removeSquare":function(d){return "разбросать квадрат"},
"repeatUntil":function(d){return "повторять до"},
"repeatUntilBlocked":function(d){return "пока можно пройти вперёд"},
"repeatUntilFinish":function(d){return "повторять до окончания"},
"scoreText":function(d){return "Счёт: "+appLocale.v(d,"playerScore")+" : "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "задать случайную сцену"},
"setBackgroundHardcourt":function(d){return "задать сцену с твердым покрытием"},
"setBackgroundRetro":function(d){return "задать ретро сцену"},
"setBackgroundTooltip":function(d){return "Задать изображение фона"},
"setBallRandom":function(d){return "задать случайный шарик"},
"setBallHardcourt":function(d){return "задать шар с твердым покрытием"},
"setBallRetro":function(d){return "задать ретро шарик"},
"setBallTooltip":function(d){return "Задать изображение шарика"},
"setBallSpeedRandom":function(d){return "задать случайную скорость шарика"},
"setBallSpeedVerySlow":function(d){return "задать очень медленную  скорость шарика"},
"setBallSpeedSlow":function(d){return "задать медленную скорость шарика"},
"setBallSpeedNormal":function(d){return "задать нормальную скорость шарика"},
"setBallSpeedFast":function(d){return "задать быструю скорость шарика"},
"setBallSpeedVeryFast":function(d){return "задать очень быструю скорость шарика"},
"setBallSpeedTooltip":function(d){return "Задать скорость шарика"},
"setPaddleRandom":function(d){return "задать случайную платформу"},
"setPaddleHardcourt":function(d){return "задать платформу с твердым покрытием"},
"setPaddleRetro":function(d){return "задать платформу с ретро покрытием"},
"setPaddleTooltip":function(d){return "Задать изображение платформы"},
"setPaddleSpeedRandom":function(d){return "задать случайную скорость платформы"},
"setPaddleSpeedVerySlow":function(d){return "задать очень медленную скорость платформы"},
"setPaddleSpeedSlow":function(d){return "задать медленную скорость платформы"},
"setPaddleSpeedNormal":function(d){return "задать нормальную скорость платформы"},
"setPaddleSpeedFast":function(d){return "задать быструю скорость платформы"},
"setPaddleSpeedVeryFast":function(d){return "задать очень быструю скорость платформы"},
"setPaddleSpeedTooltip":function(d){return "Задаёт скорость платформы"},
"shareBounceTwitter":function(d){return "Оцените созданную мной игру \"Шарики\"! Я написал её с помощью @codeorg"},
"shareGame":function(d){return "Поделитесь вашей игрой:"},
"turnLeft":function(d){return "повернуть налево"},
"turnRight":function(d){return "повернуть направо"},
"turnTooltip":function(d){return "Поворачивает меня налево или направо на 90 градусов."},
"whenBallInGoal":function(d){return "когда мяч попал в цель"},
"whenBallInGoalTooltip":function(d){return "Выполнить указанные ниже действия, когда мяч достигнет цели."},
"whenBallMissesPaddle":function(d){return "когда мяч не сталкивается с платформой"},
"whenBallMissesPaddleTooltip":function(d){return "Выполнить действия, указанные ниже, когда мяч не сталкивается с платформой."},
"whenDown":function(d){return "когда стрелка вниз"},
"whenDownTooltip":function(d){return "Выполните действия ниже, когда когда будет нажата клавиша стрелка вниз."},
"whenGameStarts":function(d){return "Когда игра начнется"},
"whenGameStartsTooltip":function(d){return "Выполняет действия ниже, когда игра начнётся."},
"whenLeft":function(d){return "когда стрелка влево"},
"whenLeftTooltip":function(d){return "Выполните действия ниже, когда нажата клавиша стрелка влево."},
"whenPaddleCollided":function(d){return "когда мяч ударяется о платформу"},
"whenPaddleCollidedTooltip":function(d){return "Выполнить действия, указанные ниже, когда мяч сталкивается с платформой."},
"whenRight":function(d){return "когда стрелка справа"},
"whenRightTooltip":function(d){return "Выполните действия ниже, когда нажата клавиша стрелка вправо."},
"whenUp":function(d){return "когда стрелка вверх"},
"whenUpTooltip":function(d){return "Выпонить действия, указанные ниже, когда нажата клавиша вверх."},
"whenWallCollided":function(d){return "когда мяч ударяется о стену"},
"whenWallCollidedTooltip":function(d){return "Выполнить действия, указанные ниже, когда мяч сталкивается со стеной."},
"whileMsg":function(d){return "пока"},
"whileTooltip":function(d){return "Повторяет действия до достижения конечной точки."},
"yes":function(d){return "Да"}};