var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "an der Honigwabe"},
"atFlower":function(d){return "an der Blume"},
"avoidCowAndRemove":function(d){return "vermeide die Kuh und entferne 1"},
"continue":function(d){return "Fortfahren"},
"dig":function(d){return "1 entfernen"},
"digTooltip":function(d){return "einen Teil der Erde entfernen"},
"dirE":function(d){return "O"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "mache"},
"elseCode":function(d){return "ansonsten"},
"fill":function(d){return "1 hinzufügen"},
"fillN":function(d){return "fülle "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Das Loch mit "+maze_locale.v(d,"shovelfuls")+" Schaufeln Erde befüllen"},
"fillSquare":function(d){return "Viereck füllen"},
"fillTooltip":function(d){return "Lege eine Einheit Schmutz auf den Boden"},
"finalLevel":function(d){return "Glückwunsch! Du hast die letzte Aufgabe abgeschlossen."},
"flowerEmptyError":function(d){return "Die Blume auf der du bist, hat keinen Nektar mehr."},
"get":function(d){return "Nehme"},
"heightParameter":function(d){return "Höhe"},
"holePresent":function(d){return "dort ist ein Loch"},
"honey":function(d){return "Honig herstellen"},
"honeyAvailable":function(d){return "Honig"},
"honeyTooltip":function(d){return "Erzeuge Honig aus Nektar"},
"honeycombFullError":function(d){return "Die Honigwabe hat keinen Platz mehr für Honig."},
"ifCode":function(d){return "wenn"},
"ifInRepeatError":function(d){return "Du benötigst einen \"wenn\"-Baustein in einem \"wiederhole\"-Baustein. Wenn du Probleme hast, dann versuche nochmals das vorherige Level und schau wie es dort läuft."},
"ifPathAhead":function(d){return "Wenn Weg voraus"},
"ifTooltip":function(d){return "Wenn ein Weg in die benannte Richtung existiert, dann führe ein paar Aktionen aus."},
"ifelseTooltip":function(d){return "Wenn ein Weg in die benannte Richtung existiert, beginne mit dem ersten Block, ansonsten den zweiten Block vor."},
"ifFlowerTooltip":function(d){return "Wenn es eine Blume/Honigwabe in der angegebenen Richtung gibt, dann führe einige Aktionen aus."},
"ifOnlyFlowerTooltip":function(d){return "Wenn eine Blume in der angegebenen Richtung ist, dann führe bestimmte Aktionen aus."},
"ifelseFlowerTooltip":function(d){return "Ist eine Blume/Waben in der angegebenen Richtung, dann führe den ersten Block der Aktionen aus. Andernfalls führe den zweiten Block der Aktionen aus."},
"insufficientHoney":function(d){return "Du benutzt die richtigten Bausteine, aber du hast nicht die richtige Menge an Honig."},
"insufficientNectar":function(d){return "Du benutzt die richtigten Bausteine, aber du hast nicht die richtige Menge an Nektar."},
"make":function(d){return "machen"},
"moveBackward":function(d){return "rückwärts bewegen"},
"moveEastTooltip":function(d){return "Bewege mich ein Feld Richtung Osten."},
"moveForward":function(d){return "vorwärts bewegen"},
"moveForwardTooltip":function(d){return "Bewege mich ein Feld nach vorne."},
"moveNorthTooltip":function(d){return "Bewege mich ein Feld Richtung Norden."},
"moveSouthTooltip":function(d){return "Bewege mich ein Feld Richtung Süden."},
"moveTooltip":function(d){return "Bewege mich vorwärts/rückwärts um einen Platz"},
"moveWestTooltip":function(d){return "Bewege mich ein Feld Richtung Westen."},
"nectar":function(d){return "nimm Nektar"},
"nectarRemaining":function(d){return "Nektar"},
"nectarTooltip":function(d){return "Nektar aus einer Blume erhalten"},
"nextLevel":function(d){return "Glückwunsch! Du hast diese Aufgabe abgeschlossen."},
"no":function(d){return "Nein"},
"noPathAhead":function(d){return "Pfad ist blockiert"},
"noPathLeft":function(d){return "kein Pfad auf der linken Seite"},
"noPathRight":function(d){return "kein Pfad auf der rechten Seite"},
"notAtFlowerError":function(d){return "Du kannst Nektar nur aus einer Blume bekommen."},
"notAtHoneycombError":function(d){return "Du kannst Honig nur an der Honigwabe herstellen."},
"numBlocksNeeded":function(d){return "Diese Aufgabe kann mit %1 Bausteinen gelöst werden."},
"pathAhead":function(d){return "Pfad voraus"},
"pathLeft":function(d){return "falls auf der linken Seite ein Pfad ist"},
"pathRight":function(d){return "falls auf der rechten Seite ein Pfad ist"},
"pilePresent":function(d){return "Da ist ein Stapel"},
"putdownTower":function(d){return "Stelle den Turm ab"},
"removeAndAvoidTheCow":function(d){return "entferne 1 und vermeide die Kuh"},
"removeN":function(d){return "Entferne "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "Haufen entfernen"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+" Schaufeln Erde vom Haufen entfernen"},
"removeSquare":function(d){return "Viereck entfernen"},
"repeatCarefullyError":function(d){return "Um dieses Level zu schaffen, musst du auf das Muster von zwei Bewegungen und einer Drehung achten, die du in einen \"wiederhole\"-Block setzt. Es ist in Ordnung, wenn du nach dieser Runde noch Züge übrig hast."},
"repeatUntil":function(d){return "Wiederhole bis"},
"repeatUntilBlocked":function(d){return "Solange ein Weg vor dir liegt"},
"repeatUntilFinish":function(d){return "Wiederholen bis abgeschlossen"},
"step":function(d){return "Schritt"},
"totalHoney":function(d){return "Gesamter Honig"},
"totalNectar":function(d){return "Gesamter Nektar"},
"turnLeft":function(d){return "nach links drehen"},
"turnRight":function(d){return "nach rechts drehen"},
"turnTooltip":function(d){return "Dreht mich nach links oder rechts um 90 Grad."},
"uncheckedCloudError":function(d){return "Stelle sicher, dass du alle Wolken auf Blumen oder Bienenwaben überprüfst."},
"uncheckedPurpleError":function(d){return "Stelle sicher, dass du alle lila Blumen nach Nektar durchsucht hast"},
"whileMsg":function(d){return "solange"},
"whileTooltip":function(d){return "Wiederhole die umschlossenen Aktionen bis der Endpunkt erreicht ist."},
"word":function(d){return "Finde das Wort"},
"yes":function(d){return "Ja"},
"youSpelled":function(d){return "Du hast geschrieben"}};