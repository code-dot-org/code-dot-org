var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "топката отскача"},
"bounceBallTooltip":function(d){return "Отблъсни топката на разстояние от обекта."},
"continue":function(d){return "Напред"},
"dirE":function(d){return "И"},
"dirN":function(d){return "С"},
"dirS":function(d){return "Ю"},
"dirW":function(d){return "З"},
"doCode":function(d){return "правя"},
"elseCode":function(d){return "друго"},
"finalLevel":function(d){return "Поздравления! Вие решихте последния пъзел."},
"heightParameter":function(d){return "височина"},
"ifCode":function(d){return "ако"},
"ifPathAhead":function(d){return "ако има път напред"},
"ifTooltip":function(d){return "Ако има път в тази посока, то направи следните действия"},
"ifelseTooltip":function(d){return "Ако има път в тази посока,  извърши първия блок действия. Ако няма, извърши втория блок действия."},
"incrementOpponentScore":function(d){return "точка на противника"},
"incrementOpponentScoreTooltip":function(d){return "Добавя една към текущия резултат на противника."},
"incrementPlayerScore":function(d){return "точка"},
"incrementPlayerScoreTooltip":function(d){return "Добавя една точка към текущия резултат на играча."},
"isWall":function(d){return "ако това е стена"},
"isWallTooltip":function(d){return "Връща истина, ако има стена тук"},
"launchBall":function(d){return "пуска нова топка"},
"launchBallTooltip":function(d){return "Пуска топката в играта."},
"makeYourOwn":function(d){return "Направете своя собствена Bounce игра"},
"moveDown":function(d){return "премести надолу"},
"moveDownTooltip":function(d){return "Движи платформата надолу."},
"moveForward":function(d){return "върви напред"},
"moveForwardTooltip":function(d){return "Преместете ме напред с един ход."},
"moveLeft":function(d){return "премести наляво"},
"moveLeftTooltip":function(d){return "Движи платформата  наляво."},
"moveRight":function(d){return "премести надясно"},
"moveRightTooltip":function(d){return "Движи платформата надясно."},
"moveUp":function(d){return "премести нагоре"},
"moveUpTooltip":function(d){return "Движи платформата нагоре."},
"nextLevel":function(d){return "Поздравления! Вие завършихте този пъзел."},
"no":function(d){return "Не"},
"noPathAhead":function(d){return "пътя напред е блокиран"},
"noPathLeft":function(d){return "няма път наляво"},
"noPathRight":function(d){return "няма път надясно"},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блокове."},
"pathAhead":function(d){return "път напред"},
"pathLeft":function(d){return "ако има път наляво"},
"pathRight":function(d){return "ако има път надясно"},
"pilePresent":function(d){return "там има купчина"},
"playSoundCrunch":function(d){return "възпроизвеждане на звук за разбиване"},
"playSoundGoal1":function(d){return "възпроизвежда звук 1 за гол"},
"playSoundGoal2":function(d){return "възпроизвежда звук 2 за гол"},
"playSoundHit":function(d){return "възпроизвежда звук на удар"},
"playSoundLosePoint":function(d){return "възпроизвежда звук за загуба на точка"},
"playSoundLosePoint2":function(d){return "възпроизвежда звук 2 за загуба на точка"},
"playSoundRetro":function(d){return "възпроизвежда ретро звук"},
"playSoundRubber":function(d){return "възпроизвежда звук на ластик"},
"playSoundSlap":function(d){return "възпроизвежда звук от шамар"},
"playSoundTooltip":function(d){return "Възпроизвеждане на избраният звук."},
"playSoundWinPoint":function(d){return "възпроизвежда звук на победна точка"},
"playSoundWinPoint2":function(d){return "възпроизвежда звук 2 на победна точка"},
"playSoundWood":function(d){return "възпроизвежда звук от дърво"},
"putdownTower":function(d){return "спуска кулата"},
"reinfFeedbackMsg":function(d){return "Може да натиснете бутона \"Опитай отново\", за да се върнете да играете играта си."},
"removeSquare":function(d){return "премахва квадрата"},
"repeatUntil":function(d){return "повтаряй докато"},
"repeatUntilBlocked":function(d){return "докато има място напред"},
"repeatUntilFinish":function(d){return "повтаря докато приключи"},
"scoreText":function(d){return "Резултат: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "задава случайна сцена"},
"setBackgroundHardcourt":function(d){return "зарежда сцена с твърда настилка"},
"setBackgroundRetro":function(d){return "зарежда ретро сцената"},
"setBackgroundTooltip":function(d){return "Задава фоновото изображение"},
"setBallRandom":function(d){return "задава произволна топка"},
"setBallHardcourt":function(d){return "задава твърда топка"},
"setBallRetro":function(d){return "задава ретро топка"},
"setBallTooltip":function(d){return "задава изображение на топка"},
"setBallSpeedRandom":function(d){return "задава произволна скорост на топката"},
"setBallSpeedVerySlow":function(d){return "задава много бавна скорост на топката"},
"setBallSpeedSlow":function(d){return "задава бавна скорост на топката"},
"setBallSpeedNormal":function(d){return "задава нормална скорост на топката"},
"setBallSpeedFast":function(d){return "задава бърза скорост на топката"},
"setBallSpeedVeryFast":function(d){return "задава много бърза скорост на топката"},
"setBallSpeedTooltip":function(d){return "Задава скоростта на топката"},
"setPaddleRandom":function(d){return "задава произволна платформа"},
"setPaddleHardcourt":function(d){return "задава hardcourt платформа"},
"setPaddleRetro":function(d){return "задава ретро платформа"},
"setPaddleTooltip":function(d){return "Задава картинката на платформата"},
"setPaddleSpeedRandom":function(d){return "Задава произволна скорост на платформата"},
"setPaddleSpeedVerySlow":function(d){return "задава много бавна скорост на платформата"},
"setPaddleSpeedSlow":function(d){return "задава бавна скорост на платформата"},
"setPaddleSpeedNormal":function(d){return "задава нормална скорост на платформата"},
"setPaddleSpeedFast":function(d){return "задава бърза скорост на платформата"},
"setPaddleSpeedVeryFast":function(d){return "задава много бърза скорост на платформата"},
"setPaddleSpeedTooltip":function(d){return "Задава скоростта на платформата"},
"shareBounceTwitter":function(d){return "Вижте Flappy играта, която съм създал. Аз сам я написал с @codeorg"},
"shareGame":function(d){return "Споделете играта си:"},
"turnLeft":function(d){return "завий наляво"},
"turnRight":function(d){return "завий надясно"},
"turnTooltip":function(d){return "Завърта ме наляво или надясно на 90 градуса."},
"whenBallInGoal":function(d){return "когато топката е във вратата"},
"whenBallInGoalTooltip":function(d){return "Когато топката е във вратата, изпълни действията по-долу."},
"whenBallMissesPaddle":function(d){return "когато топката пропусне платформата"},
"whenBallMissesPaddleTooltip":function(d){return "Изпълни действията по-долу когато топката пропусне платформата."},
"whenDown":function(d){return "когато е натисната стрелка надолу"},
"whenDownTooltip":function(d){return "Следвайте действията по-долу когато е натисната стрелка надолу."},
"whenGameStarts":function(d){return "когато играта започва"},
"whenGameStartsTooltip":function(d){return "Изпълни действията по-долу при стартиране на играта."},
"whenLeft":function(d){return "когато е натисната стрелка наляво"},
"whenLeftTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка надолу."},
"whenPaddleCollided":function(d){return "когато топката удари платформата"},
"whenPaddleCollidedTooltip":function(d){return "Изпълни действията по-долу когато топката се сблъсква с платформата."},
"whenRight":function(d){return "когато е натисната стрелка надясно"},
"whenRightTooltip":function(d){return "Изпълнява действията по-долу когато е натиснат клавиша стрелка надясно."},
"whenUp":function(d){return "когато е натисната стрелка нагоре"},
"whenUpTooltip":function(d){return "Изпълнява действията по-долу когато е натисната стрелка нагоре."},
"whenWallCollided":function(d){return "когато топката удари стената"},
"whenWallCollidedTooltip":function(d){return "Изпълнява действията по-долу когато топката се сблъсква със стена."},
"whileMsg":function(d){return "докато"},
"whileTooltip":function(d){return "Повтаря поставените в блока действия, докато целта не бъде достигната."},
"yes":function(d){return "Да"}};