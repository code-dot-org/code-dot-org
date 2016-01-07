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
"bounceBallTooltip":function(d){return "Sprett en ball mot en ting."},
"continue":function(d){return "Fortsett"},
"dirE":function(d){return "Ø"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "V"},
"doCode":function(d){return "gjør"},
"elseCode":function(d){return "ellers"},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste utfordringen."},
"heightParameter":function(d){return "høyde"},
"ifCode":function(d){return "hvis"},
"ifPathAhead":function(d){return "hvis det er sti foran"},
"ifTooltip":function(d){return "Hvis det er en sti i den angitte retningen, så utfør noen handlinger."},
"ifelseTooltip":function(d){return "Hvis det er en sti i den angitte retningen, så utfør den første blokken med handlinger. Ellers, utfør den andre blokken med handlinger."},
"incrementOpponentScore":function(d){return "Øk motstanderens poeng"},
"incrementOpponentScoreTooltip":function(d){return "Legg til en til den nåværende motstanderens poengsum."},
"incrementPlayerScore":function(d){return "score poeng"},
"incrementPlayerScoreTooltip":function(d){return "Legg til en til nåværende spillers poengsum."},
"isWall":function(d){return "er dette en vegg"},
"isWallTooltip":function(d){return "Returnerer sann hvis det er en vegg her"},
"launchBall":function(d){return "Skyt ut ny ball"},
"launchBallTooltip":function(d){return "Sender en ny ball inn i spillet."},
"makeYourOwn":function(d){return "Lag ditt eget \"Sprette-Spill\""},
"moveDown":function(d){return "flytt ned"},
"moveDownTooltip":function(d){return "Flytt rekkerten ned."},
"moveForward":function(d){return "gå fremover"},
"moveForwardTooltip":function(d){return "Flytt meg en plass fremover."},
"moveLeft":function(d){return "flytt til venstre"},
"moveLeftTooltip":function(d){return "Flytt rekkerten til venstre."},
"moveRight":function(d){return "flytt til høyre"},
"moveRightTooltip":function(d){return "Flytt rekkerten til høyre."},
"moveUp":function(d){return "flytt opp"},
"moveUpTooltip":function(d){return "Flytt rekkerten opp."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne utfordringen."},
"no":function(d){return "Nei"},
"noPathAhead":function(d){return "stien er blokkert"},
"noPathLeft":function(d){return "ingen sti til venstre"},
"noPathRight":function(d){return "ingen sti til høyre"},
"numBlocksNeeded":function(d){return "Denne utfordringen kan bli løst med %1 blokker."},
"pathAhead":function(d){return "sti foran"},
"pathLeft":function(d){return "hvis sti til venstre"},
"pathRight":function(d){return "hvis sti til høyre"},
"pilePresent":function(d){return "det er en haug"},
"playSoundCrunch":function(d){return "spill knase-lyd"},
"playSoundGoal1":function(d){return "spill mål-lyd 1"},
"playSoundGoal2":function(d){return "spill mål-lyd 2"},
"playSoundHit":function(d){return "spill treff-lyd"},
"playSoundLosePoint":function(d){return "spille miste poeng lyd"},
"playSoundLosePoint2":function(d){return "spille miste poeng 2 lyd"},
"playSoundRetro":function(d){return "spille retro lyd"},
"playSoundRubber":function(d){return "spill gummi-lyd"},
"playSoundSlap":function(d){return "spill smekke-lyd"},
"playSoundTooltip":function(d){return "Spill den valgte lyden."},
"playSoundWinPoint":function(d){return "spill poeng-lyd"},
"playSoundWinPoint2":function(d){return "spill poeng-lyd 2"},
"playSoundWood":function(d){return "Spill tre-lyd"},
"putdownTower":function(d){return "sett ned tårn"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Try Again\" knappen for å gå tilbake til ditt spill."},
"removeSquare":function(d){return "fjern kvadratet"},
"repeatUntil":function(d){return "gjenta til"},
"repeatUntilBlocked":function(d){return "så lenge det er en sti foran"},
"repeatUntilFinish":function(d){return "gjenta til ferdig"},
"scoreText":function(d){return "Resultat: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "Angi en tilfeldig scene"},
"setBackgroundHardcourt":function(d){return "angi asfalt-scene"},
"setBackgroundRetro":function(d){return "velg retro-scene"},
"setBackgroundTooltip":function(d){return "Angir bakgrunnsbilde"},
"setBallRandom":function(d){return "Angi en tilfeldig ball"},
"setBallHardcourt":function(d){return "Velg asfaltball"},
"setBallRetro":function(d){return "velg retro-ball"},
"setBallTooltip":function(d){return "angi ball-bilde"},
"setBallSpeedRandom":function(d){return "angi tilfeldig ball-hastighet"},
"setBallSpeedVerySlow":function(d){return "velg veldig treg ballhastighet"},
"setBallSpeedSlow":function(d){return "Angi langsom ballhastighet"},
"setBallSpeedNormal":function(d){return "Angi normal ballhastighet"},
"setBallSpeedFast":function(d){return "Angi rask ballhastighet"},
"setBallSpeedVeryFast":function(d){return "Angi svært rask ballhastighet"},
"setBallSpeedTooltip":function(d){return "Angir ballhastigheten"},
"setPaddleRandom":function(d){return "Velg tilfeldig rekkert"},
"setPaddleHardcourt":function(d){return "Velg asfaltrekkert"},
"setPaddleRetro":function(d){return "velg retro-rekkert"},
"setPaddleTooltip":function(d){return "Velger rekkertbilde"},
"setPaddleSpeedRandom":function(d){return "angi tilfeldig rekkerthastighet"},
"setPaddleSpeedVerySlow":function(d){return "velg veldig treg rekkerthastighet"},
"setPaddleSpeedSlow":function(d){return "velg langsom rekkerthastighet"},
"setPaddleSpeedNormal":function(d){return "velg normal rekkerthastighet"},
"setPaddleSpeedFast":function(d){return "velg rask rekkerthastighet"},
"setPaddleSpeedVeryFast":function(d){return "velg veldig rask rekkerthastighet"},
"setPaddleSpeedTooltip":function(d){return "Velger rekkerthastighet"},
"shareBounceTwitter":function(d){return "Sjekk ut Sprette-spillet jeg har laget! Jeg laget det selv med @codeorg"},
"shareGame":function(d){return "Del ditt spill:"},
"turnLeft":function(d){return "snu mot venstre"},
"turnRight":function(d){return "snu mot høyre"},
"turnTooltip":function(d){return "Snur meg mot venstre eller høyre med 90 grader."},
"whenBallInGoal":function(d){return "Når ballen er i mål"},
"whenBallInGoalTooltip":function(d){return "Utfør handlingene nedenfor når en ball treffer målet."},
"whenBallMissesPaddle":function(d){return "når ballen bommer på rekkerten"},
"whenBallMissesPaddleTooltip":function(d){return "Utfør handlingene under når en ball bommer på rekkerten."},
"whenDown":function(d){return "når pil ned"},
"whenDownTooltip":function(d){return "Utfør handlingene nedenfor når pil ned-tasten trykkes."},
"whenGameStarts":function(d){return "Når spillet starter"},
"whenGameStartsTooltip":function(d){return "Utfør handlingene nedenfor når spillet starter."},
"whenLeft":function(d){return "når pil venstre"},
"whenLeftTooltip":function(d){return "Utfør handlingene nedenfor når venstre pil-tasten trykkes."},
"whenPaddleCollided":function(d){return "når ball treffer rekkert"},
"whenPaddleCollidedTooltip":function(d){return "Utfør handlingene under når en ball treffer en rekkert."},
"whenRight":function(d){return "når pil høyre"},
"whenRightTooltip":function(d){return "Utfør handlingene nedenfor når du trykker piltasten høyre."},
"whenUp":function(d){return "når pil opp"},
"whenUpTooltip":function(d){return "Utfør handlingene nedenfor når pil opp-tasten trykkes."},
"whenWallCollided":function(d){return "Når ballen treffer veggen"},
"whenWallCollidedTooltip":function(d){return "Utfør handlingene nedenfor når en ball treffer en vegg."},
"whileMsg":function(d){return "så lenge"},
"whileTooltip":function(d){return "Gjenta disse handlingene inntil målet er nådd."},
"yes":function(d){return "Ja"}};