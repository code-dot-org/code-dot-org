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
"bounceBall":function(d){return "одбиј лоптицу"},
"bounceBallTooltip":function(d){return "Одбиј лоптицу од предмета."},
"continue":function(d){return "Настави"},
"dirE":function(d){return "Исток"},
"dirN":function(d){return "Север"},
"dirS":function(d){return "Југ"},
"dirW":function(d){return "w"},
"doCode":function(d){return "уради"},
"elseCode":function(d){return "иначе"},
"finalLevel":function(d){return "Честитамо! Решили сте завршну слагалицу."},
"heightParameter":function(d){return "висина"},
"ifCode":function(d){return "ако"},
"ifPathAhead":function(d){return "ако путања испред"},
"ifTooltip":function(d){return "Ако постоји стаза у одређеном правцу, онда одрадите неке акције."},
"ifelseTooltip":function(d){return "Ако постоји стаза у одређеном правцу, онда одрадите први блок акција. У супротном, одрадите други блок акција."},
"incrementOpponentScore":function(d){return "противник осваја поен"},
"incrementOpponentScoreTooltip":function(d){return "Упиши поен у резултат противника."},
"incrementPlayerScore":function(d){return "освоји поен"},
"incrementPlayerScoreTooltip":function(d){return "Додајте један поен тренутном резултату играча."},
"isWall":function(d){return "да ли је ово зид"},
"isWallTooltip":function(d){return "Враћа \"истинито\" ако је овде зид"},
"launchBall":function(d){return "убаци нову лопту"},
"launchBallTooltip":function(d){return "Убаци лопту у игру."},
"makeYourOwn":function(d){return "Направи сам своју Bounce Game"},
"moveDown":function(d){return "помери доле"},
"moveDownTooltip":function(d){return "Помери рекет на доле."},
"moveForward":function(d){return "помери се напред"},
"moveForwardTooltip":function(d){return "Помери ме напред за једно место."},
"moveLeft":function(d){return "помери лево"},
"moveLeftTooltip":function(d){return "Помери рекет у лево."},
"moveRight":function(d){return "помери десно"},
"moveRightTooltip":function(d){return "Помери рекет у десно."},
"moveUp":function(d){return "помери се горе"},
"moveUpTooltip":function(d){return "Помери рекет на горе."},
"nextLevel":function(d){return "Честитамо! Завршили сте слагалицу."},
"no":function(d){return "Не"},
"noPathAhead":function(d){return "путања је блокирана"},
"noPathLeft":function(d){return "нема пута за лево"},
"noPathRight":function(d){return "нема пута за десно"},
"numBlocksNeeded":function(d){return "Ова слагалица може бити решена са %1 блоком."},
"pathAhead":function(d){return "пут напред"},
"pathLeft":function(d){return "ако пут на лево"},
"pathRight":function(d){return "ако пут на десно"},
"pilePresent":function(d){return "ту је гомила"},
"playSoundCrunch":function(d){return "свирај звук крцкања"},
"playSoundGoal1":function(d){return "одсвирај звук циља 1"},
"playSoundGoal2":function(d){return "одсвирај звук циља 2"},
"playSoundHit":function(d){return "одсвирај звук ударца"},
"playSoundLosePoint":function(d){return "одсвирај звук изгубљеног поена"},
"playSoundLosePoint2":function(d){return "одсвирај звук изгубљеног поена 2"},
"playSoundRetro":function(d){return "одсвирај старински звук"},
"playSoundRubber":function(d){return "одсвирај звук гуме"},
"playSoundSlap":function(d){return "одсвирај звук пљеска"},
"playSoundTooltip":function(d){return "Свирај одабрани звук."},
"playSoundWinPoint":function(d){return "одсвирај звук освојеног поена"},
"playSoundWinPoint2":function(d){return "одсвирај звук освојеног поена 2"},
"playSoundWood":function(d){return "одсвирај звук дрвета"},
"putdownTower":function(d){return "спусти кулу"},
"reinfFeedbackMsg":function(d){return "Можете да притиснете \"Покушај поново\" дугме да се вратите у своју игру."},
"removeSquare":function(d){return "уклони квадрат"},
"repeatUntil":function(d){return "понављај до испуњења"},
"repeatUntilBlocked":function(d){return "док је стаза испред"},
"repeatUntilFinish":function(d){return "понавлјај до цилја"},
"scoreText":function(d){return "Резултат: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "подеси насумичну сцену"},
"setBackgroundHardcourt":function(d){return "подеси тврду сцену"},
"setBackgroundRetro":function(d){return "подеси ретро сцену"},
"setBackgroundTooltip":function(d){return "Подешава позадинску слику"},
"setBallRandom":function(d){return "подеси насумичну лопту"},
"setBallHardcourt":function(d){return "подеси тврду лопту"},
"setBallRetro":function(d){return "подеси ретро лопту"},
"setBallTooltip":function(d){return "Поставља слику лопте"},
"setBallSpeedRandom":function(d){return "подеси насумичну брзину лопте"},
"setBallSpeedVerySlow":function(d){return "подеси веома спору брзину лопте"},
"setBallSpeedSlow":function(d){return "подеси спору брзину лопте"},
"setBallSpeedNormal":function(d){return "подеси нормалну брзину лопте"},
"setBallSpeedFast":function(d){return "подеси брзу брзину лопте"},
"setBallSpeedVeryFast":function(d){return "подеси веома брзу брзину лопте"},
"setBallSpeedTooltip":function(d){return "Поставља брзину лопте"},
"setPaddleRandom":function(d){return "подеси случајно одбијање"},
"setPaddleHardcourt":function(d){return "подеси одбијање од тврде површине"},
"setPaddleRetro":function(d){return "подеси одбијање уназад"},
"setPaddleTooltip":function(d){return "Подеси слику рекета"},
"setPaddleSpeedRandom":function(d){return "подеси насумичну брзину рекета"},
"setPaddleSpeedVerySlow":function(d){return "подеси врло спору брзину рекета"},
"setPaddleSpeedSlow":function(d){return "подеси спору брзину рекета"},
"setPaddleSpeedNormal":function(d){return "подеси нормалну брзину рекета"},
"setPaddleSpeedFast":function(d){return "подеси брзо кретање рекета"},
"setPaddleSpeedVeryFast":function(d){return "подеси врло брзо кретање рекета"},
"setPaddleSpeedTooltip":function(d){return "Подешава брзину кретања рекета"},
"shareBounceTwitter":function(d){return "Испробај Флопи-игру коју сам направио/ла. Написао/ла сам је сам/а са @codeorg"},
"shareGame":function(d){return "Подели своју игру:"},
"turnLeft":function(d){return "скрени лево"},
"turnRight":function(d){return "скрени десно"},
"turnTooltip":function(d){return "Закрене ме на лево или десно за 90 степени."},
"whenBallInGoal":function(d){return "када је лопта у голу"},
"whenBallInGoalTooltip":function(d){return "Изврши акције испод када лопта уђе у гол."},
"whenBallMissesPaddle":function(d){return "када лопта промаши рекет"},
"whenBallMissesPaddleTooltip":function(d){return "Изврши акције испод када лопта промаши рекет."},
"whenDown":function(d){return "кад је стрелица на доле"},
"whenDownTooltip":function(d){return "Изврши акције испод кад се притисне стрелица на доле."},
"whenGameStarts":function(d){return "када игра почне"},
"whenGameStartsTooltip":function(d){return "Изврши доње акције када игра почне."},
"whenLeft":function(d){return "када је стрелица на лево"},
"whenLeftTooltip":function(d){return "Изврши акције испод кад се притисне стрелица лево."},
"whenPaddleCollided":function(d){return "кад лоптица удари рекет"},
"whenPaddleCollidedTooltip":function(d){return "Изврши акције испод кад се лоптица судари са рекетом."},
"whenRight":function(d){return "кад је десна стрелица"},
"whenRightTooltip":function(d){return "Изврши акције испод кад се притисне стрелица десно."},
"whenUp":function(d){return "кад је стрелица на горе"},
"whenUpTooltip":function(d){return "Изврши акције испод кад се притисне стрелица на горе."},
"whenWallCollided":function(d){return "кад лоптица удари у зид"},
"whenWallCollidedTooltip":function(d){return "Изврши акције испод кад се лоптица судари са зидом."},
"whileMsg":function(d){return "док"},
"whileTooltip":function(d){return "Понавлјај затворену акцију док се не досегне циљна тачка."},
"yes":function(d){return "Да"}};