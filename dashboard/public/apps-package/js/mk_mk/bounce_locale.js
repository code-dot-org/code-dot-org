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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "отскокнувачка топка"},
"bounceBallTooltip":function(d){return "Отскокнување на топката надвор од објектот."},
"continue":function(d){return "Продолжи"},
"dirE":function(d){return "Исток"},
"dirN":function(d){return "Север"},
"dirS":function(d){return "Југ"},
"dirW":function(d){return "Запад"},
"doCode":function(d){return "изврши"},
"elseCode":function(d){return "инаку"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"heightParameter":function(d){return "height"},
"ifCode":function(d){return "ако"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "Поени на противникот"},
"incrementOpponentScoreTooltip":function(d){return "Додадете една на сегашната од спртовната цел ."},
"incrementPlayerScore":function(d){return "Освој бодови"},
"incrementPlayerScoreTooltip":function(d){return "Додадете  уште една на сегашниот играч на бодови."},
"isWall":function(d){return "Дали ова е ѕид"},
"isWallTooltip":function(d){return "Се враќа ако постои ѕид овде"},
"launchBall":function(d){return "Додај нова топка"},
"launchBallTooltip":function(d){return "Стартување на топката во игра."},
"makeYourOwn":function(d){return "Направете свој игра на Отскокнување"},
"moveDown":function(d){return "Оди надолу"},
"moveDownTooltip":function(d){return "Движи ја лопатката надолу"},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "движи  се лево"},
"moveLeftTooltip":function(d){return "Движи ја лоптката на лево."},
"moveRight":function(d){return "движи се десно"},
"moveRightTooltip":function(d){return "Движи ја лопатката на десно."},
"moveUp":function(d){return "движи се нагоре"},
"moveUpTooltip":function(d){return "движија лопатката нагоре."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "path ahead"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "there is a pile"},
"playSoundCrunch":function(d){return "слушај звук на криза"},
"playSoundGoal1":function(d){return "Пушти го  goal 1 звукот"},
"playSoundGoal2":function(d){return "Пушти го  goal 2 звукот"},
"playSoundHit":function(d){return "пушти го hit звукот"},
"playSoundLosePoint":function(d){return "Пушти го lose point звукот"},
"playSoundLosePoint2":function(d){return "Пушти го lose point 2 звукот"},
"playSoundRetro":function(d){return "Пушти го retro звукот"},
"playSoundRubber":function(d){return "Пушти го звукот од гума"},
"playSoundSlap":function(d){return "пушти го звукот со удар"},
"playSoundTooltip":function(d){return "Пушти го избраниот звук."},
"playSoundWinPoint":function(d){return "пушти го win point звукот"},
"playSoundWinPoint2":function(d){return "пушти го вин поинт звукот"},
"playSoundWood":function(d){return "пушти го звукот на дрво "},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "Можете да го притиснете \"Обиди се повторно\" копчето за да се врати во игра на својата игра."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "повтори додека"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "Поени : "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "постави било која слика"},
"setBackgroundHardcourt":function(d){return "намести hardcourt scene"},
"setBackgroundRetro":function(d){return "намести ретро сцена"},
"setBackgroundTooltip":function(d){return "Поставија сликата во позадина"},
"setBallRandom":function(d){return "постави ја случајно топката"},
"setBallHardcourt":function(d){return "постави set random топки"},
"setBallRetro":function(d){return "постави ретро топки"},
"setBallTooltip":function(d){return "поставија сликата на топката"},
"setBallSpeedRandom":function(d){return "наместија брзината на топката"},
"setBallSpeedVerySlow":function(d){return "Постави ја брзината на топката на бавно"},
"setBallSpeedSlow":function(d){return "поставија на бавно брзината на топката"},
"setBallSpeedNormal":function(d){return "поставија брзината на нормала на топката"},
"setBallSpeedFast":function(d){return "поставија на брзо брзината на топката"},
"setBallSpeedVeryFast":function(d){return "постави ја брзината на топката на  многу брзо "},
"setBallSpeedTooltip":function(d){return "Постави ја брзината на топката"},
"setPaddleRandom":function(d){return "поставија случајно лопатката"},
"setPaddleHardcourt":function(d){return "поставија  на hardcourt  лопатката"},
"setPaddleRetro":function(d){return "поставија ретро лопатката"},
"setPaddleTooltip":function(d){return "Постави ја сликата на лопатката"},
"setPaddleSpeedRandom":function(d){return "постави ја по случаен избор брзината на лопатката"},
"setPaddleSpeedVerySlow":function(d){return "поставија брзината на лопатката на многу бавно"},
"setPaddleSpeedSlow":function(d){return "Намести бавна брзина на лопатката "},
"setPaddleSpeedNormal":function(d){return "Напарви нормална брзина на лоптаката"},
"setPaddleSpeedFast":function(d){return "Поставија бризината на лопатката на брзо"},
"setPaddleSpeedVeryFast":function(d){return "Поставија брзината на лопатката на многу брзо"},
"setPaddleSpeedTooltip":function(d){return "Поставија брзината на лопатката"},
"shareBounceTwitter":function(d){return "Проверете  ја Отскокнувачката игра која јас ја напрвив . Јас лично ја  напишав  со @codeorg"},
"shareGame":function(d){return "Споделија твојата игра:"},
"turnLeft":function(d){return "turn left"},
"turnRight":function(d){return "turn right"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "Кога топката е во целта "},
"whenBallInGoalTooltip":function(d){return "Извршување на активностите под кога топката ќе влезе во целта."},
"whenBallMissesPaddle":function(d){return "кога топката ке ја промаши лопатка"},
"whenBallMissesPaddleTooltip":function(d){return "Извршување на активностите под кога топката ја погодува својата лопатка."},
"whenDown":function(d){return "кога стрелката  е надолу"},
"whenDownTooltip":function(d){return "Изврши ѓи акциите подолу кога ќе се притисне копче со стрелка надолу ."},
"whenGameStarts":function(d){return "Кога играта започнува"},
"whenGameStartsTooltip":function(d){return "Извршување на активностите под кога играта почнува."},
"whenLeft":function(d){return "кога левата стрелка"},
"whenLeftTooltip":function(d){return "Изврши ѓи акциите подолу кога ќе се притисне на копчето со лева стрелка ."},
"whenPaddleCollided":function(d){return "Кога топката ке ја погоди лоптаката"},
"whenPaddleCollidedTooltip":function(d){return "Извршување на активностите под кога топката се судира со лопатката."},
"whenRight":function(d){return "Кога десната стрелка"},
"whenRightTooltip":function(d){return "Изврши ѓи акциите подолу кога ќе се притисне на копчето со десна стрелка."},
"whenUp":function(d){return "кога стрелка нагоре"},
"whenUpTooltip":function(d){return "Изврши ѓи акциите подолу кога ќе се притисне копче со стрелка нагоре."},
"whenWallCollided":function(d){return "кога топката ќе удри во ѕид "},
"whenWallCollidedTooltip":function(d){return "Извршување на активностите под кога топката се судира со лопатката."},
"whileMsg":function(d){return "Додека"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "Yes"}};