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
"bounceBall":function(d){return "Flummi"},
"bounceBallTooltip":function(d){return "Ball von einem Objekt abprallen lassen."},
"continue":function(d){return "Fortfahren"},
"dirE":function(d){return "O"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "mache"},
"elseCode":function(d){return "ansonsten"},
"finalLevel":function(d){return "Glückwunsch! Sie haben das letzte Puzzle gelöst."},
"heightParameter":function(d){return "Höhe"},
"ifCode":function(d){return "wenn"},
"ifPathAhead":function(d){return "Wenn Weg voraus"},
"ifTooltip":function(d){return "Wenn ein Weg in die benannte Richtung existiert, dann führe ein paar Aktionen aus."},
"ifelseTooltip":function(d){return "Wenn ein Weg in die benannte Richtung existiert, beginnen Sie mit dem ersten Block, ansonsten nehmen Sie sich den zweiten Block vor."},
"incrementOpponentScore":function(d){return "Punkt für den Gegner"},
"incrementOpponentScoreTooltip":function(d){return "Einen Punkt zum gegnerischen Punktestand hinzufügen."},
"incrementPlayerScore":function(d){return "Punkt erzielen"},
"incrementPlayerScoreTooltip":function(d){return "Erhöhe den Punktestand um 1."},
"isWall":function(d){return "ist das eine Wand"},
"isWallTooltip":function(d){return "Gibt \"true\" zurück, falls sich hier eine Wand befindet"},
"launchBall":function(d){return "Bringe neuen Ball"},
"launchBallTooltip":function(d){return "Einen Ball ins Spiel bringen."},
"makeYourOwn":function(d){return "Erstelle dein eigenes Bounce-Spiel"},
"moveDown":function(d){return "nach unten bewegen"},
"moveDownTooltip":function(d){return "Bewege das Paddel nach unten."},
"moveForward":function(d){return "vorwärts bewegen"},
"moveForwardTooltip":function(d){return "Bewegen Sie mich ein Feld nach vorne."},
"moveLeft":function(d){return "nach links bewegen"},
"moveLeftTooltip":function(d){return "Verschieben Sie das Paddel auf der linken Seite."},
"moveRight":function(d){return "nach rechts bewegen"},
"moveRightTooltip":function(d){return "Verschieben Sie das Paddel auf der rechten Seite."},
"moveUp":function(d){return "nach oben bewegen"},
"moveUpTooltip":function(d){return "Bewege das Paddel nach oben."},
"nextLevel":function(d){return "Herzlichen Glückwunsch! Du hast dieses Puzzle abgeschlossen."},
"no":function(d){return "Nein"},
"noPathAhead":function(d){return "Pfad ist blockiert"},
"noPathLeft":function(d){return "kein Pfad zur linken Seite"},
"noPathRight":function(d){return "kein Pfad zur rechten Seite"},
"numBlocksNeeded":function(d){return "Dieses Puzzle kann mit  %1 Bausteinen gelöst werden."},
"pathAhead":function(d){return "Weg voraus"},
"pathLeft":function(d){return "Wenn Weg auf der linken Seite"},
"pathRight":function(d){return "Wenn Weg auf der rechten Seite"},
"pilePresent":function(d){return "Auf einem Haufen"},
"playSoundCrunch":function(d){return "Crunch sound abspielen"},
"playSoundGoal1":function(d){return "Ton für Tor 1 abspielen"},
"playSoundGoal2":function(d){return "Ton für Tor 2 abspielen"},
"playSoundHit":function(d){return "Trefferton abspielen"},
"playSoundLosePoint":function(d){return "Ton für Punktverlust abspielen"},
"playSoundLosePoint2":function(d){return "Alternativen Ton für Punktverlust abspielen"},
"playSoundRetro":function(d){return "Retroton abspielen"},
"playSoundRubber":function(d){return "Ton für Gummi abspielen"},
"playSoundSlap":function(d){return "Schlagsound abspielen"},
"playSoundTooltip":function(d){return "Den ausgewählten Sound abspielen."},
"playSoundWinPoint":function(d){return "Gewinnton abspielen"},
"playSoundWinPoint2":function(d){return "Alternativen Gewinnton abspielen"},
"playSoundWood":function(d){return "Holzton abspielen"},
"putdownTower":function(d){return "Stellen Sie den Turm ab"},
"reinfFeedbackMsg":function(d){return "Du kannst den \"Versuche erneut\"-Button drücken, um weiterzuspielen."},
"removeSquare":function(d){return "Viereck entfernen"},
"repeatUntil":function(d){return "Wiederhole bis"},
"repeatUntilBlocked":function(d){return "Solange ein Weg vor dir liegt"},
"repeatUntilFinish":function(d){return "Wiederholen bis abgeschlossen"},
"scoreText":function(d){return "Punktestand: "+appLocale.v(d,"playerScore")+" : "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "Setze zufälligen Hintergrund"},
"setBackgroundHardcourt":function(d){return "Setze Hartplatz als Hintergrund"},
"setBackgroundRetro":function(d){return "Setze retro Hintergrund"},
"setBackgroundTooltip":function(d){return "Hintergrundbild auswählen"},
"setBallRandom":function(d){return "Setze zufälligen Ball"},
"setBallHardcourt":function(d){return "Setze Hartplatz-Ball"},
"setBallRetro":function(d){return "Setze retro Ball"},
"setBallTooltip":function(d){return "Legt das Ball-Bild fest"},
"setBallSpeedRandom":function(d){return "Setze zufällige Ballgeschwindigkeit"},
"setBallSpeedVerySlow":function(d){return "Setze sehr langsame Ballgeschwindigkeit"},
"setBallSpeedSlow":function(d){return "Setze langsame Ballgeschwindigkeit"},
"setBallSpeedNormal":function(d){return "Setze normale Ballgeschwindigkeit"},
"setBallSpeedFast":function(d){return "Setze schnelle Ballgeschwindigkeit"},
"setBallSpeedVeryFast":function(d){return "Setze sehr schnelle Ballgeschwindigkeit"},
"setBallSpeedTooltip":function(d){return "Legt die Ballgeschwindigkeit fest"},
"setPaddleRandom":function(d){return "Setze zufälligen Schläger"},
"setPaddleHardcourt":function(d){return "Setze Hartplatz-Schläger"},
"setPaddleRetro":function(d){return "Setze retro Schläger"},
"setPaddleTooltip":function(d){return "Legt das Bild für den Schläger fest"},
"setPaddleSpeedRandom":function(d){return "Setze zufällige Schlägergeschwindigkeit"},
"setPaddleSpeedVerySlow":function(d){return "Setze sehr langsame Schlägergeschwindigkeit"},
"setPaddleSpeedSlow":function(d){return "Setze langsame Schlägergeschwindigkeit"},
"setPaddleSpeedNormal":function(d){return "Setze normale Schlägergeschwindigkeit"},
"setPaddleSpeedFast":function(d){return "Setze schnelle Schlägergeschwindigkeit"},
"setPaddleSpeedVeryFast":function(d){return "Setze sehr schnelle Schlägergeschwindigkeit"},
"setPaddleSpeedTooltip":function(d){return "Legt die Schlägergeschwindigkeit fest"},
"shareBounceTwitter":function(d){return "Schau dir das Bounce-Spiel an, welches ich gemacht habe. Ich habe es selbst mit @codeorg programmiert"},
"shareGame":function(d){return "Teile dein Spiel:"},
"turnLeft":function(d){return "nach links drehen"},
"turnRight":function(d){return "nach rechts drehen"},
"turnTooltip":function(d){return "Dreht mich nach links oder rechts um 90 Grad."},
"whenBallInGoal":function(d){return "Wenn Ball im Tor"},
"whenBallInGoalTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn der Ball im Tor ist."},
"whenBallMissesPaddle":function(d){return "Wenn der Ball den Schläger verpasst"},
"whenBallMissesPaddleTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn ein Ball den Schläger verpasst."},
"whenDown":function(d){return "Wenn Pfeil-nach-unten"},
"whenDownTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-runter-Taste gedrückt wird."},
"whenGameStarts":function(d){return "Wenn Spiel gestartet wird"},
"whenGameStartsTooltip":function(d){return "Führe die Aktionen unten aus, wenn das Spiel startet."},
"whenLeft":function(d){return "Wenn Pfeil-nach-links"},
"whenLeftTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-links-Taste gedrückt wird."},
"whenPaddleCollided":function(d){return "Wenn Ball den Schläger trifft"},
"whenPaddleCollidedTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn ein Ball einen Schläger trifft."},
"whenRight":function(d){return "Wenn Pfeil-nach-rechts"},
"whenRightTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-rechts-Taste gedrückt wird."},
"whenUp":function(d){return "wenn Pfeil-nach-oben"},
"whenUpTooltip":function(d){return "Führe die nachfolgenden Aktionen aus, wenn die Pfeil-nach-oben-Taste gedrückt wird."},
"whenWallCollided":function(d){return "Wenn der Ball eine Wand berührt"},
"whenWallCollidedTooltip":function(d){return "Führe untere Aktion aus wenn ein Ball eine Wand berührt."},
"whileMsg":function(d){return "solange"},
"whileTooltip":function(d){return "Wiederhole diese Aktionen bis das Ziel erreicht ist."},
"yes":function(d){return "Ja"}};