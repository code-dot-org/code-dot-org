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
"bounceBall":function(d){return "hoppebold"},
"bounceBallTooltip":function(d){return "Hop med en bold på en ting."},
"continue":function(d){return "Fortsæt"},
"dirE":function(d){return "Ø"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "udfør"},
"elseCode":function(d){return "ellers"},
"finalLevel":function(d){return "Tillykke! Du har løst den sidste opgave."},
"heightParameter":function(d){return "højde"},
"ifCode":function(d){return "hvis"},
"ifPathAhead":function(d){return "hvis stien fortsætter"},
"ifTooltip":function(d){return "Hvis der er en sti i den angivne retning, så udfør nogle handlinger."},
"ifelseTooltip":function(d){return "Hvis der er en sti i den angivne retning, så udfør den første blok af handlinger. Ellers udfør den anden blok af handlinger."},
"incrementOpponentScore":function(d){return "modstanderen point"},
"incrementOpponentScoreTooltip":function(d){return "Tilføj \"1\" til den nuværende modstanders score."},
"incrementPlayerScore":function(d){return "score point"},
"incrementPlayerScoreTooltip":function(d){return "Tilføj en til den aktuelle spillers score."},
"isWall":function(d){return "er dette en væg"},
"isWallTooltip":function(d){return "Returnerer sand, hvis der er en væg her"},
"launchBall":function(d){return "affyr ny bold"},
"launchBallTooltip":function(d){return "Sæt bold i spil."},
"makeYourOwn":function(d){return "Lav dit eget hoppe-spil"},
"moveDown":function(d){return "Flyt ned"},
"moveDownTooltip":function(d){return "Flyt battet ned."},
"moveForward":function(d){return "flyt fremad"},
"moveForwardTooltip":function(d){return "Flyt mig en plads frem."},
"moveLeft":function(d){return "Flyt til venstre"},
"moveLeftTooltip":function(d){return "Flyt battet til venstre."},
"moveRight":function(d){return "Flyt til højre"},
"moveRightTooltip":function(d){return "Flyt battet til højre."},
"moveUp":function(d){return "Flyt op"},
"moveUpTooltip":function(d){return "Flyt battet op."},
"nextLevel":function(d){return "Tillykke! Du har fuldført denne opgave."},
"no":function(d){return "Nej"},
"noPathAhead":function(d){return "stien er blokeret"},
"noPathLeft":function(d){return "ingen sti til venstre"},
"noPathRight":function(d){return "ingen sti til højre"},
"numBlocksNeeded":function(d){return "Denne opgave kan løses med %1 blokke."},
"pathAhead":function(d){return "sti forude"},
"pathLeft":function(d){return "hvis sti til venstre"},
"pathRight":function(d){return "hvis sti til højre"},
"pilePresent":function(d){return "der er en bunke"},
"playSoundCrunch":function(d){return "afspil kvaselyd"},
"playSoundGoal1":function(d){return "afspil mål 1 lyd"},
"playSoundGoal2":function(d){return "afspil mål 2 lyd"},
"playSoundHit":function(d){return "afspil rammer lyd"},
"playSoundLosePoint":function(d){return "afspil tab point lyd"},
"playSoundLosePoint2":function(d){return "afspil tab point 2 lyd"},
"playSoundRetro":function(d){return "afspil retro lyd"},
"playSoundRubber":function(d){return "Afspil gummi lyd"},
"playSoundSlap":function(d){return "afspil klaske lyd"},
"playSoundTooltip":function(d){return "Afspil den valgte lyd."},
"playSoundWinPoint":function(d){return "afspil vind point lyd"},
"playSoundWinPoint2":function(d){return "afspil vind point 2 lyd"},
"playSoundWood":function(d){return "afspil træ lyd"},
"putdownTower":function(d){return "sæt tårn ned"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på knappen \"Prøv igen\", for at gå tilbage til dit spil."},
"removeSquare":function(d){return "fjern firkant"},
"repeatUntil":function(d){return "gentag indtil"},
"repeatUntilBlocked":function(d){return "mens sti forude"},
"repeatUntilFinish":function(d){return "gentag indtil færdig"},
"scoreText":function(d){return "Point: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "sæt tilfældig baggrund"},
"setBackgroundHardcourt":function(d){return "sæt hardcourt baggrund"},
"setBackgroundRetro":function(d){return "sæt retro baggrund"},
"setBackgroundTooltip":function(d){return "Vælger baggrundsbilledet"},
"setBallRandom":function(d){return "sæt tilfældig bold"},
"setBallHardcourt":function(d){return "sæt hardcourt bold"},
"setBallRetro":function(d){return "sæt retro bold"},
"setBallTooltip":function(d){return "Indstiller boldbilledet"},
"setBallSpeedRandom":function(d){return "sæt tilfældig boldhastighed"},
"setBallSpeedVerySlow":function(d){return "sæt meget langsom boldhastighed"},
"setBallSpeedSlow":function(d){return "sæt langsom boldhastighed"},
"setBallSpeedNormal":function(d){return "sæt normal boldhastighed"},
"setBallSpeedFast":function(d){return "sæt hurtig boldhastighed"},
"setBallSpeedVeryFast":function(d){return "sæt meget hurtig boldhastighed"},
"setBallSpeedTooltip":function(d){return "Indstiller boldens hastighed"},
"setPaddleRandom":function(d){return "sæt tilfældigt bat"},
"setPaddleHardcourt":function(d){return "sæt hardcourt bat"},
"setPaddleRetro":function(d){return "sæt retro bat"},
"setPaddleTooltip":function(d){return "Indstiller battets udseende"},
"setPaddleSpeedRandom":function(d){return "sæt tilfældig bat hastighed"},
"setPaddleSpeedVerySlow":function(d){return "sæt meget langsom bat hastighed"},
"setPaddleSpeedSlow":function(d){return "sæt langsom bat hastighed"},
"setPaddleSpeedNormal":function(d){return "sæt normal bat hastighed"},
"setPaddleSpeedFast":function(d){return "sæt hurtig bat hastighed"},
"setPaddleSpeedVeryFast":function(d){return "sæt meget hurtig bat hastighed"},
"setPaddleSpeedTooltip":function(d){return "Indstiller battets hastighed"},
"shareBounceTwitter":function(d){return "Se det hoppe-spil jeg lavede. Jeg skrev det selv med @codeorg"},
"shareGame":function(d){return "Del dit spil:"},
"turnLeft":function(d){return "drej til venstre"},
"turnRight":function(d){return "drej til højre"},
"turnTooltip":function(d){return "Vender mig venstre eller højre med 90 grader."},
"whenBallInGoal":function(d){return "Når bolden er i mål"},
"whenBallInGoalTooltip":function(d){return "Udfør nedenstående handlinger når bolden går i mål."},
"whenBallMissesPaddle":function(d){return "Når bolden misser battet"},
"whenBallMissesPaddleTooltip":function(d){return "Udfør handlingerne herunder når en bold misser battet."},
"whenDown":function(d){return "Når pil ned"},
"whenDownTooltip":function(d){return "Udfører handlingen herunder når der trykkes pil ned."},
"whenGameStarts":function(d){return "når spillet starter"},
"whenGameStartsTooltip":function(d){return "Udfør nedenstående handlinger når spillet starter."},
"whenLeft":function(d){return "Når venstre pil"},
"whenLeftTooltip":function(d){return "Udfører handlingen herunder når der trykkes venstre pil."},
"whenPaddleCollided":function(d){return "Når bolden rammer battet"},
"whenPaddleCollidedTooltip":function(d){return "Udfør handlingerne herunder når en bold rammer battet."},
"whenRight":function(d){return "Når højre pil"},
"whenRightTooltip":function(d){return "Udfører handlingen herunder når der trykkes højre pil."},
"whenUp":function(d){return "Når pil op"},
"whenUpTooltip":function(d){return "Udfører handlingen herunder når der trykkes pil op."},
"whenWallCollided":function(d){return "Når bolden rammer væggen"},
"whenWallCollidedTooltip":function(d){return "Udfør handlingerne herunder når bolden rammer en mur."},
"whileMsg":function(d){return "mens"},
"whileTooltip":function(d){return "Gentag de lukkede handlinger indtil målet er nået."},
"yes":function(d){return "Ja"}};