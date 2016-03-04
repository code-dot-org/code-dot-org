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
"bounceBall":function(d){return "sprett ball"},
"bounceBallTooltip":function(d){return "Sprett ein ball frå eit anna objekt."},
"continue":function(d){return "Hald fram"},
"dirE":function(d){return "A"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "gjer"},
"elseCode":function(d){return "ellers"},
"finalLevel":function(d){return "Gratulerer! Du har løyst den siste oppgåva."},
"heightParameter":function(d){return "høgd"},
"ifCode":function(d){return "viss"},
"ifPathAhead":function(d){return "dersom det er ein sti framfor"},
"ifTooltip":function(d){return "Dersom det er ein sti i den angjevne retninga, så gjer nokre handlingar."},
"ifelseTooltip":function(d){return "Dersom det er ein sti i den angjevne retninga, så gjer den fyrste blokka av handlingar. Viss det ikkje er det, så gjer den andre blokka av handlingar."},
"incrementOpponentScore":function(d){return "gi poeng til motstandar"},
"incrementOpponentScoreTooltip":function(d){return "Legg ein til poengsummen til motstandaren."},
"incrementPlayerScore":function(d){return "score poeng"},
"incrementPlayerScoreTooltip":function(d){return "Legg ein til poengsummen til spelaren."},
"isWall":function(d){return "er dette ein vegg"},
"isWallTooltip":function(d){return "Returnerer sann viss det er ein vegg her"},
"launchBall":function(d){return "skyt ut ny ball"},
"launchBallTooltip":function(d){return "Sender ein ny ball inn i spelet."},
"makeYourOwn":function(d){return "Lag ditt eige \"Sprette-spel\""},
"moveDown":function(d){return "flytt ned"},
"moveDownTooltip":function(d){return "Flytt rekkerten ned."},
"moveForward":function(d){return "gå framover"},
"moveForwardTooltip":function(d){return "Flytt meg ein plass framover."},
"moveLeft":function(d){return "flytt til venstre"},
"moveLeftTooltip":function(d){return "Flytt rekkerten til venstre."},
"moveRight":function(d){return "flytt høyre"},
"moveRightTooltip":function(d){return "Flytt rekkerten til høyre."},
"moveUp":function(d){return "flytt opp"},
"moveUpTooltip":function(d){return "Flytt rekkerten opp."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne oppgåva."},
"no":function(d){return "Nei"},
"noPathAhead":function(d){return "stien er blokkert"},
"noPathLeft":function(d){return "ingen sti til venstre"},
"noPathRight":function(d){return "ingen sti til høgre"},
"numBlocksNeeded":function(d){return "Denne oppgåva kan løysast med %1 blokker."},
"pathAhead":function(d){return "sti framfor"},
"pathLeft":function(d){return "viss sti til venstre"},
"pathRight":function(d){return "viss sti til høgre"},
"pilePresent":function(d){return "der er ein haug"},
"playSoundCrunch":function(d){return "Spel av knase-lyd"},
"playSoundGoal1":function(d){return "spel av mål-lyd 1"},
"playSoundGoal2":function(d){return "spel av mål-lyd 2"},
"playSoundHit":function(d){return "spel av treff-lyd"},
"playSoundLosePoint":function(d){return "spel av miste-poeng-lyd"},
"playSoundLosePoint2":function(d){return "spel av miste-poeng-lyd 2"},
"playSoundRetro":function(d){return "spel av retro-lyd"},
"playSoundRubber":function(d){return "spel av gummi-lyd"},
"playSoundSlap":function(d){return "spel av smekke-lyd"},
"playSoundTooltip":function(d){return "Spel av den valgte lyden."},
"playSoundWinPoint":function(d){return "spel av poeng-lyd"},
"playSoundWinPoint2":function(d){return "spel av poeng-lyd 2"},
"playSoundWood":function(d){return "Spel av tre-lyd"},
"putdownTower":function(d){return "set ned tårnet"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Prøv igjen\" for å gå tilbake til spelet ditt."},
"removeSquare":function(d){return "fjern kvadratet"},
"repeatUntil":function(d){return "gjenta til"},
"repeatUntilBlocked":function(d){return "så lenge det er ein sti framfor"},
"repeatUntilFinish":function(d){return "gjenta til ferdig"},
"scoreText":function(d){return "Resultat: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "vis ei tilfeldig scene"},
"setBackgroundHardcourt":function(d){return "vis grusbane-scene"},
"setBackgroundRetro":function(d){return "vis retro-scene"},
"setBackgroundTooltip":function(d){return "vis bakgrunnsbilde"},
"setBallRandom":function(d){return "vis ein tilfeldig ball"},
"setBallHardcourt":function(d){return "vis hard ball"},
"setBallRetro":function(d){return "vis retro-ball"},
"setBallTooltip":function(d){return "Set bildet av ballen"},
"setBallSpeedRandom":function(d){return "angi tilfeldig fart på ballen"},
"setBallSpeedVerySlow":function(d){return "angi veldig lita fart på ball"},
"setBallSpeedSlow":function(d){return "angi lita fart på ballen"},
"setBallSpeedNormal":function(d){return "angi normal fart på ballen"},
"setBallSpeedFast":function(d){return "angi stor fart på ball"},
"setBallSpeedVeryFast":function(d){return "angi svært stor fart på ballen"},
"setBallSpeedTooltip":function(d){return "Angir farta på ballen"},
"setPaddleRandom":function(d){return "velg tilfeldig rekkert"},
"setPaddleHardcourt":function(d){return "velg tennis-rekkert"},
"setPaddleRetro":function(d){return "velg retro-rekkert"},
"setPaddleTooltip":function(d){return "Vel bilde av rekkerten"},
"setPaddleSpeedRandom":function(d){return "angi tilfeldig fart på rekkerten"},
"setPaddleSpeedVerySlow":function(d){return "velg veldig lita fart på rekkerten"},
"setPaddleSpeedSlow":function(d){return "velg lita fart på rekkerten"},
"setPaddleSpeedNormal":function(d){return "velg middels fart på rekkerten"},
"setPaddleSpeedFast":function(d){return "velg stor fart på rekkerten"},
"setPaddleSpeedVeryFast":function(d){return "velg veldig stor fart på rekkerten"},
"setPaddleSpeedTooltip":function(d){return "Velg farta på rekkerten"},
"shareBounceTwitter":function(d){return "Sjekk ut Sprette-spelet eg har laga. Eg har laga det sjølv med @codeorg"},
"shareGame":function(d){return "Del spelet ditt:"},
"turnLeft":function(d){return "snu mot venstre"},
"turnRight":function(d){return "snu mot høgre"},
"turnTooltip":function(d){return "Snur meg 90 grader mot venstre eller høgre."},
"whenBallInGoal":function(d){return "når ballen går i mål"},
"whenBallInGoalTooltip":function(d){return "Utfør handlingane nedanfor når ein ball treff målet."},
"whenBallMissesPaddle":function(d){return "når ballen bommar på rekkerten"},
"whenBallMissesPaddleTooltip":function(d){return "Utfør handlingane nedanfor når ein ball bommar på rekkerten."},
"whenDown":function(d){return "når pil ned"},
"whenDownTooltip":function(d){return "Utfør handlingane nedanfor når pil-ned-tasten blir trykt."},
"whenGameStarts":function(d){return "når spelet startar"},
"whenGameStartsTooltip":function(d){return "Utfør handlingane nedanfor når spelet startar."},
"whenLeft":function(d){return "når venstre pil"},
"whenLeftTooltip":function(d){return "Utfør handlingane nedenfor når venstre-pil-tasten blir trykt."},
"whenPaddleCollided":function(d){return "når ballen treff rekkerten"},
"whenPaddleCollidedTooltip":function(d){return "Utfør handlingane under når ein ball treff ein rekkert."},
"whenRight":function(d){return "når høyre pil"},
"whenRightTooltip":function(d){return "Utfør handlingane nedanfor når høgre-pil-tasten blir trykt."},
"whenUp":function(d){return "når pil opp"},
"whenUpTooltip":function(d){return "Utfør handlingane nedanfor når pil-opp-tasten blir trykt."},
"whenWallCollided":function(d){return "når ballen treff veggen"},
"whenWallCollidedTooltip":function(d){return "Utfør handlingane nedanfor når ein ball kolliderer med ein vegg."},
"whileMsg":function(d){return "så lenge"},
"whileTooltip":function(d){return "Gjenta handlingene som er omslutta inntil målet blir nådd."},
"yes":function(d){return "Ja"}};