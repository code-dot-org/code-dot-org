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
"bounceBall":function(d){return "Секіру добы"},
"bounceBallTooltip":function(d){return "Допты нысанадан секіртіңіз."},
"continue":function(d){return "Жалғастыру"},
"dirE":function(d){return "Ш"},
"dirN":function(d){return "С"},
"dirS":function(d){return "О"},
"dirW":function(d){return "Б"},
"doCode":function(d){return "жасау"},
"elseCode":function(d){return "немесе"},
"finalLevel":function(d){return "Құттықтаймыз! Сіз соңғы басқатырғышты шештіңіз."},
"heightParameter":function(d){return "биіктік"},
"ifCode":function(d){return "егер"},
"ifPathAhead":function(d){return "егер алдыда жол болса"},
"ifTooltip":function(d){return "Егер көрсетілген бағытта жол болса, онда бірнеше іс-әрекеттер жасаңыз."},
"ifelseTooltip":function(d){return "Егер көрсетілген бағытта жол болса, онда бірінші бөлшек іс-әрекетін жасаңыз. Әйтпесе, екінші бөлшек іс-әрекетін жасаңыз."},
"incrementOpponentScore":function(d){return "Қарсылас ойыншының ұпайы"},
"incrementOpponentScoreTooltip":function(d){return "Қарсыластың қазіргі ұпайына бірді қосу."},
"incrementPlayerScore":function(d){return "ұпай"},
"incrementPlayerScoreTooltip":function(d){return "Ойыншының қазіргі ұпайына бірді қосу"},
"isWall":function(d){return "бұл қабырға ма?"},
"isWallTooltip":function(d){return "Егер мұнда қабырға болса ақиқат мәнін қайтарады"},
"launchBall":function(d){return "жаңа допты қосу"},
"launchBallTooltip":function(d){return "Допты ойынға қосу."},
"makeYourOwn":function(d){return "Өзіңіздің жеке Bounce ойыныңызды жасаңыз"},
"moveDown":function(d){return "төмен жүру"},
"moveDownTooltip":function(d){return "Ескекті төмен көшіру"},
"moveForward":function(d){return "алдыға қозғалу"},
"moveForwardTooltip":function(d){return "Мені алдыға қарай бір орынға жылжыту."},
"moveLeft":function(d){return "солға жүру"},
"moveLeftTooltip":function(d){return "Ескекті солға алып барыңыз"},
"moveRight":function(d){return "оңға жүру"},
"moveRightTooltip":function(d){return "Ескекті оңға алып барыңыз."},
"moveUp":function(d){return "жоғары жүру"},
"moveUpTooltip":function(d){return "Ескекті жоғары көтеріңіз."},
"nextLevel":function(d){return "Құттықтаймыз! Сіз бұл басқатырғышты шештіңіз."},
"no":function(d){return "Жоқ"},
"noPathAhead":function(d){return "жол жабылған"},
"noPathLeft":function(d){return "солға қарай жол жоқ"},
"noPathRight":function(d){return "оңға қарай жол жоқ"},
"numBlocksNeeded":function(d){return "Бұл басқатырғыш %1 бөлшекпен шешілуі мүмкін."},
"pathAhead":function(d){return "алдағы жол"},
"pathLeft":function(d){return "егер солға қарай жол болса"},
"pathRight":function(d){return "егер оңға қарай жол болса"},
"pilePresent":function(d){return "үйінді бар"},
"playSoundCrunch":function(d){return "күтірлек дыбысты ойнату"},
"playSoundGoal1":function(d){return "мақсатқа жету дыбысын ойнату"},
"playSoundGoal2":function(d){return "2 мақсатқа жету дыбысын ойнату"},
"playSoundHit":function(d){return "соққы дыбысын ойнату"},
"playSoundLosePoint":function(d){return "жеңілу дыбысын ойнату"},
"playSoundLosePoint2":function(d){return "2 жеңілу нүктсі дыбысын ойнату"},
"playSoundRetro":function(d){return "ретро дыбысты ойнату"},
"playSoundRubber":function(d){return "резіңке дысыын ойнату"},
"playSoundSlap":function(d){return "сартылдау дыбысын ойнату"},
"playSoundTooltip":function(d){return "таңдалған дыбысты ойнату"},
"playSoundWinPoint":function(d){return "жеңіс нүктесі дыбысн ойнату"},
"playSoundWinPoint2":function(d){return "2 жеңс нүктесі дыбысын ойнату"},
"playSoundWood":function(d){return "ағаш дыбысын ойнату"},
"putdownTower":function(d){return "мұнара орнату"},
"reinfFeedbackMsg":function(d){return " \"Қайта байқап көріңіз\" батырмасын басу арқылы ойынды қайта бастауыңызға болады."},
"removeSquare":function(d){return "шаршыны алып тастау"},
"repeatUntil":function(d){return "қайталау"},
"repeatUntilBlocked":function(d){return "алдыңғы жол"},
"repeatUntilFinish":function(d){return "аяқталғанша қайталау"},
"scoreText":function(d){return "Ұпай: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "кездейсоқ оқиғаны орнату"},
"setBackgroundHardcourt":function(d){return "хард оқыиғаны орнату"},
"setBackgroundRetro":function(d){return "ретро оқиғаны орнату"},
"setBackgroundTooltip":function(d){return "Фон суретін таңдау"},
"setBallRandom":function(d){return "кездейсоқ допты орнату"},
"setBallHardcourt":function(d){return "хард допты орнату"},
"setBallRetro":function(d){return "ретро допты орнату"},
"setBallTooltip":function(d){return "Доптың суретін орнатады"},
"setBallSpeedRandom":function(d){return "доптың қездейсоқ жылдамдығын орнату"},
"setBallSpeedVerySlow":function(d){return "доптың өте аз жылдамдығын орнату"},
"setBallSpeedSlow":function(d){return "доптың аз жылдамдығын орнату"},
"setBallSpeedNormal":function(d){return "доптың қалыпты жылдамдығын орнату"},
"setBallSpeedFast":function(d){return " доптың шапшаң жылдамдығын орнату"},
"setBallSpeedVeryFast":function(d){return " доптың өте шапшаң жылдамдығын орнату"},
"setBallSpeedTooltip":function(d){return "Доптың жылдамдығын орнатады"},
"setPaddleRandom":function(d){return "Кездейсоқ ескек орнату"},
"setPaddleHardcourt":function(d){return "хард екскекті орнату"},
"setPaddleRetro":function(d){return "ретро ескекті орнату "},
"setPaddleTooltip":function(d){return "Ескек суретін орнатады"},
"setPaddleSpeedRandom":function(d){return "ескектің кездейсоқ жылдамдығын орнату"},
"setPaddleSpeedVerySlow":function(d){return "ескектің өте аз жылдамдығын орнату"},
"setPaddleSpeedSlow":function(d){return "ескектің аз жылдамдығын орнату"},
"setPaddleSpeedNormal":function(d){return "ескектің қалыпты жылдамдығын орнату"},
"setPaddleSpeedFast":function(d){return "ескектің шапшаң жылдамдығын орнату"},
"setPaddleSpeedVeryFast":function(d){return "ескектің өте шапшаң жылдамдығын орнату"},
"setPaddleSpeedTooltip":function(d){return "Ескектің жылдамдығын орнатады"},
"shareBounceTwitter":function(d){return "@codeorg көмегімін менің жасаған Bounce ойынымды тексеріңіз"},
"shareGame":function(d){return "Ойыныңызбен бөлісіңіз:"},
"turnLeft":function(d){return "солға бұрылу"},
"turnRight":function(d){return "оңға бұрылу"},
"turnTooltip":function(d){return "Мені 90 градусқа солға немесе оңға бұру."},
"whenBallInGoal":function(d){return "доп нысанаға соқтыққан кезде"},
"whenBallInGoalTooltip":function(d){return "Доп нысана қақпасына соқтыққан кезде төмендегі іс-әрекеттерді орындау."},
"whenBallMissesPaddle":function(d){return "доп ескекке соқтыққан кезде"},
"whenBallMissesPaddleTooltip":function(d){return "Доп ескекке соқтыққан кезде келесі іс-әрекеттерді орындау"},
"whenDown":function(d){return "нұсқар төмен бағытталса"},
"whenDownTooltip":function(d){return "Төмен бағытталған нұсқары бар батырма басылған кезде төменде көрсетілген іс-әрекеттерді орындау."},
"whenGameStarts":function(d){return "ойын басталғанда"},
"whenGameStartsTooltip":function(d){return "Ойын басталғанда, төмендегі іс-әрекеттерді орындаңыз."},
"whenLeft":function(d){return "нұсқар солға бағытталса"},
"whenLeftTooltip":function(d){return "Солға бағытталған нұсқары бар батырма басылған кезде төменде көрсетілген іс-әрекеттерді орындау."},
"whenPaddleCollided":function(d){return "доп ескекке соқтыққан кезде"},
"whenPaddleCollidedTooltip":function(d){return "Доп ескекке соқтыққан кезде келесі іс-әрекеттерді орындау"},
"whenRight":function(d){return "нұсқар оңға бағытталса"},
"whenRightTooltip":function(d){return "Оңға бағытталған нұсқары бар батырма басылған кезде төменде көрсетілген іс-әрекеттерді орындау."},
"whenUp":function(d){return "нұсқар жоғары бағытталса"},
"whenUpTooltip":function(d){return "Жоғары бағытталған нұсқары бар батырма басылған кезде төменде көрсетілген іс-әрекеттерді орындау."},
"whenWallCollided":function(d){return "доп қабырғаға соқтығысса"},
"whenWallCollidedTooltip":function(d){return "Доп қабырғаға соқтыққан кезде келесі іс-әрекеттерді орындау"},
"whileMsg":function(d){return "болған кезде "},
"whileTooltip":function(d){return "Біріккен іс-әрекеттер аяқталғанша қайталаңыз."},
"yes":function(d){return "Иә"}};