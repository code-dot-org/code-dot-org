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
"continue":function(d){return "Fortfahren"},
"doCode":function(d){return "machen"},
"elseCode":function(d){return "ansonsten"},
"endGame":function(d){return "Ende des Spiels"},
"endGameTooltip":function(d){return "Beendet das Spiel."},
"finalLevel":function(d){return "Glückwunsch! Sie haben das letzte Puzzle gelöst."},
"flap":function(d){return "flattern"},
"flapRandom":function(d){return "zufällig stark flattern"},
"flapVerySmall":function(d){return "sehr wenig flattern"},
"flapSmall":function(d){return "wenig flattern"},
"flapNormal":function(d){return "normal flattern"},
"flapLarge":function(d){return "ein bisschen mehr flattern"},
"flapVeryLarge":function(d){return "sehr stark flattern"},
"flapTooltip":function(d){return "Nach oben fliegen."},
"flappySpecificFail":function(d){return "Dein Code sieht gut aus - er wird bei jedem Klick die Flügel schlagen. Aber du musst viele Male klicken, um zum Ziel zu flattern."},
"incrementPlayerScore":function(d){return "Erziele einen Punkt"},
"incrementPlayerScoreTooltip":function(d){return "Punktestand des Spielers um eins erhöhen."},
"nextLevel":function(d){return "Herzlichen Glückwunsch! Du hast dieses Puzzle abgeschlossen."},
"no":function(d){return "Nein"},
"numBlocksNeeded":function(d){return "Dieses Puzzle kann mit %1 Blöcken gelöst werden."},
"playSoundRandom":function(d){return "spiele zufälligen Sound"},
"playSoundBounce":function(d){return "spiele Bounce Sound"},
"playSoundCrunch":function(d){return "Knirschgeräusch abspielen"},
"playSoundDie":function(d){return "spiele traurigen Sound"},
"playSoundHit":function(d){return "spiele Smash Sound"},
"playSoundPoint":function(d){return "spiele Punkt Sound"},
"playSoundSwoosh":function(d){return "spiele Swoosh Sound"},
"playSoundWing":function(d){return "spiele Flügel Sound"},
"playSoundJet":function(d){return "spiele Jet Sound"},
"playSoundCrash":function(d){return "spiele Absturz Sound"},
"playSoundJingle":function(d){return "spiele Jingle Sound"},
"playSoundSplash":function(d){return "spiele Splash Sound"},
"playSoundLaser":function(d){return "spiele Laser Sound"},
"playSoundTooltip":function(d){return "Den ausgewählten Ton abspielen."},
"reinfFeedbackMsg":function(d){return "Du kannst den \"Versuche erneut\"-Button drücken, um weiterzuspielen."},
"scoreText":function(d){return "Punktestand: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "Hintergrund einstellen"},
"setBackgroundRandom":function(d){return "zufälligen Hintergrund einstellen"},
"setBackgroundFlappy":function(d){return "Stadt (Tag) Hintergrund einstellen"},
"setBackgroundNight":function(d){return "Stadt (Nacht) Hintergrund einstellen"},
"setBackgroundSciFi":function(d){return "Sci-Fi Hintergrund einstellen"},
"setBackgroundUnderwater":function(d){return "Unterwasser Hintergrund einstellen"},
"setBackgroundCave":function(d){return "Höhle Hintergrund einstellen"},
"setBackgroundSanta":function(d){return "Santa Hintergrund einstellen"},
"setBackgroundTooltip":function(d){return "Hintergrundbild setzen"},
"setGapRandom":function(d){return "Zufällige Lücke setzen"},
"setGapVerySmall":function(d){return "Sehr kleine Lücke setzen"},
"setGapSmall":function(d){return "Kleine Lücke setzen"},
"setGapNormal":function(d){return "Normale Lücke setzen"},
"setGapLarge":function(d){return "Große Lücke setzen"},
"setGapVeryLarge":function(d){return "Sehr große Lücke setzen"},
"setGapHeightTooltip":function(d){return "Vertikaler Abstand eines Hindernisses setzen"},
"setGravityRandom":function(d){return "Setze Schwerkraft auf zufällig"},
"setGravityVeryLow":function(d){return "Setze Schwerkraft auf sehr tief"},
"setGravityLow":function(d){return "Setze Schwerkraft auf tief"},
"setGravityNormal":function(d){return "Setze Schwerkraft auf normal"},
"setGravityHigh":function(d){return "Setze Schwerkraft auf hoch"},
"setGravityVeryHigh":function(d){return "Setze Schwerkraft auf sehr hoch"},
"setGravityTooltip":function(d){return "Setzt die Schwerkraft des Levels"},
"setGround":function(d){return "Boden setzen"},
"setGroundRandom":function(d){return "Setzt den Boden auf zufällig"},
"setGroundFlappy":function(d){return "Setzt den Boden auf Boden"},
"setGroundSciFi":function(d){return "Setzt den Boden auf zufällig"},
"setGroundUnderwater":function(d){return "Setzt den Boden auf Unterwasser"},
"setGroundCave":function(d){return "Setzt den Boden auf Höhle"},
"setGroundSanta":function(d){return "Setzt den Boden auf Weihnachtsmann"},
"setGroundLava":function(d){return "Setzt den Boden auf Lava"},
"setGroundTooltip":function(d){return "Setzt den Boden auf ein bestimmtes Bild"},
"setObstacle":function(d){return "Hindernis setzen"},
"setObstacleRandom":function(d){return "Setzt das Hindernis auf zufällig"},
"setObstacleFlappy":function(d){return "Setzt das Hindernis auf Röhre"},
"setObstacleSciFi":function(d){return "Setzt das Hindernis auf Sci-Fi"},
"setObstacleUnderwater":function(d){return "Setzt das Hindernis auf Pflanze"},
"setObstacleCave":function(d){return "Setzt das Hindernis auf Höhle"},
"setObstacleSanta":function(d){return "Setzt das Hindernis auf Kamin"},
"setObstacleLaser":function(d){return "Setzt das Hindernis auf Laser"},
"setObstacleTooltip":function(d){return "Setzt das Hindernis auf ein bestimmtes Bild"},
"setPlayer":function(d){return "Spieler setzen"},
"setPlayerRandom":function(d){return "Setzt den Spieler auf zufällig"},
"setPlayerFlappy":function(d){return "Setzt den Spieler auf gelben Vogel"},
"setPlayerRedBird":function(d){return "Setzt den Spieler auf roten Vogel"},
"setPlayerSciFi":function(d){return "Setzt den Spieler auf Raumschiff"},
"setPlayerUnderwater":function(d){return "Setzt den Spieler auf Fisch"},
"setPlayerCave":function(d){return "Setzt den Spieler auf Fledermaus"},
"setPlayerSanta":function(d){return "Setzt den Spieler auf Weihnachtsmann"},
"setPlayerShark":function(d){return "Setzt den Spieler auf Haifisch"},
"setPlayerEaster":function(d){return "Setzt den Spieler auf Osterhase"},
"setPlayerBatman":function(d){return "Setzt den Spieler auf Batman"},
"setPlayerSubmarine":function(d){return "Setzt den Spieler auf U-Boot"},
"setPlayerUnicorn":function(d){return "Setzt den Spieler auf Steinbock"},
"setPlayerFairy":function(d){return "Setzt den Spieler auf Fee"},
"setPlayerSuperman":function(d){return "Setzt den Spieler auf Flappymann"},
"setPlayerTurkey":function(d){return "Setzt den Spieler auf Truthahn"},
"setPlayerTooltip":function(d){return "Setzt den Spieler auf ein bestimmtes Bild"},
"setScore":function(d){return "Punktestand setzen"},
"setScoreTooltip":function(d){return "Setzt den Punktestand des Spielers"},
"setSpeed":function(d){return "Stellt Geschwindigkeit ein"},
"setSpeedTooltip":function(d){return "Stellt die Levelgeschwindigkeit ein"},
"shareFlappyTwitter":function(d){return "Schau dir das Flappy Spiel an, das ich gemacht habe. Ich habe es selbst mit @codeorg programmiert"},
"shareGame":function(d){return "Teile dein Spiel:"},
"soundRandom":function(d){return "zufällig"},
"soundBounce":function(d){return "abprallen"},
"soundCrunch":function(d){return "knirschen"},
"soundDie":function(d){return "traurig"},
"soundHit":function(d){return "Schlag"},
"soundPoint":function(d){return "Punkt"},
"soundSwoosh":function(d){return "Swoosh"},
"soundWing":function(d){return "Flügelsound"},
"soundJet":function(d){return "Jet"},
"soundCrash":function(d){return "Crash"},
"soundJingle":function(d){return "Jingle"},
"soundSplash":function(d){return "Splashen"},
"soundLaser":function(d){return "Laser"},
"speedRandom":function(d){return "Stelle zufällige Geschwindigkeit ein"},
"speedVerySlow":function(d){return "Stelle sehr niedrige Geschwindigkeit ein"},
"speedSlow":function(d){return "Stelle niedrige Geschwindigkeit ein"},
"speedNormal":function(d){return "Stelle normale Geschwindigkeit ein"},
"speedFast":function(d){return "Stelle hohe Geschwindigkeit ein"},
"speedVeryFast":function(d){return "Stelle sehr hohe Geschwindigkeit ein"},
"whenClick":function(d){return "Beim Klicken"},
"whenClickTooltip":function(d){return "Führe die Aktionen unten aus, wenn ein Klick-Event passiert."},
"whenCollideGround":function(d){return "Wenn auf Boden gestürzt"},
"whenCollideGroundTooltip":function(d){return "Führe die Aktionen unten aus, wenn Flappy den Boden berührt."},
"whenCollideObstacle":function(d){return "Wenn ein Hindernis getroffen wird"},
"whenCollideObstacleTooltip":function(d){return "Führe die Aktionen unten aus, wenn Flappy ein Hindernis berührt."},
"whenEnterObstacle":function(d){return "Wenn Hindernis passiert wird"},
"whenEnterObstacleTooltip":function(d){return "Führen sie die unteren Aktionen aus, wenn Flappy ein Hindernis betritt."},
"whenRunButtonClick":function(d){return "Wenn das Spiel beginnt"},
"whenRunButtonClickTooltip":function(d){return "Führe die folgenden Aktionen aus, wenn das Spiel beginnt."},
"yes":function(d){return "Ja"}};