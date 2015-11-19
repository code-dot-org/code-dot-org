var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Verwendete Bausteine: 1%"},
"branches":function(d){return "Zweige"},
"catColour":function(d){return "Farbe"},
"catControl":function(d){return "Schleifen"},
"catMath":function(d){return "Mathematik"},
"catProcedures":function(d){return "Funktionen"},
"catTurtle":function(d){return "Aktionen"},
"catVariables":function(d){return "Variablen"},
"catLogic":function(d){return "Logik"},
"colourTooltip":function(d){return "Ändert die Farbe des Stiftes."},
"createACircle":function(d){return "Erzeuge einen Kreis"},
"createSnowflakeSquare":function(d){return "Erzeuge eine Schneeflocke in Form eines Quadrats"},
"createSnowflakeParallelogram":function(d){return "Erzeuge eine Schneeflocke in Form eines Parallelogramms"},
"createSnowflakeLine":function(d){return "Erzeuge eine Schneeflocke in Form einer Linie"},
"createSnowflakeSpiral":function(d){return "Erzeuge eine Schneeflocke in Form einer Spirale"},
"createSnowflakeFlower":function(d){return "Erzeuge eine Schneeflocke in Form einer Blume"},
"createSnowflakeFractal":function(d){return "Erzeuge eine Schneeflocke in Form eines Fraktals"},
"createSnowflakeRandom":function(d){return "Erzeuge eine Schneeflocke in zufälliger Form"},
"createASnowflakeBranch":function(d){return "Erzeuge eine Schneeflocke in Form eines Zweiges"},
"degrees":function(d){return "Grad"},
"depth":function(d){return "Tiefe"},
"dots":function(d){return "Pixel"},
"drawACircle":function(d){return "Zeichne einen Kreis"},
"drawAFlower":function(d){return "Zeichne eine Blume"},
"drawAHexagon":function(d){return "Zeichne ein Sechseck"},
"drawAHouse":function(d){return "Zeichne ein Haus"},
"drawAPlanet":function(d){return "Zeichne einen Planeten"},
"drawARhombus":function(d){return "Zeichne eine Raute"},
"drawARobot":function(d){return "Zeichne einen Roboter"},
"drawARocket":function(d){return "Zeichne eine Rakete"},
"drawASnowflake":function(d){return "Zeichne eine Schneeflocke"},
"drawASnowman":function(d){return "Zeichne einen Schneemann"},
"drawASquare":function(d){return "Zeichne ein Quadrat"},
"drawAStar":function(d){return "Zeichne einen Stern"},
"drawATree":function(d){return "Zeichne einen Baum"},
"drawATriangle":function(d){return "Zeichne ein Dreieck"},
"drawUpperWave":function(d){return "Zeichne obere Welle"},
"drawLowerWave":function(d){return "Zeichne untere Welle"},
"drawStamp":function(d){return "Male einen Stempel"},
"heightParameter":function(d){return "Höhe"},
"hideTurtle":function(d){return "Künstler ausblenden"},
"jump":function(d){return "springen"},
"jumpBackward":function(d){return "springe rückwärts um"},
"jumpForward":function(d){return "springe vorwärts um"},
"jumpTooltip":function(d){return "Bewegt den Künstler ohne Spuren zu hinterlassen."},
"jumpEastTooltip":function(d){return "Bewegt den Künstler nach Osten ohne Spuren zurück zulassen."},
"jumpNorthTooltip":function(d){return "Bewegt den Künstler nach Norden ohne Spuren zurück zulassen."},
"jumpSouthTooltip":function(d){return "Bewegt den Künstler nach Süden ohne Spuren zurück zulassen."},
"jumpWestTooltip":function(d){return "Bewegt den Künstler nach Westen ohne Spuren zurück zulassen."},
"lengthFeedback":function(d){return "Die Länge der Bewegung muss noch korrigiert werden."},
"lengthParameter":function(d){return "Länge"},
"loopVariable":function(d){return "Zähler"},
"moveBackward":function(d){return "rückwärts bewegen um"},
"moveEastTooltip":function(d){return "Bewegt den Künstler nach Osten."},
"moveForward":function(d){return "vorwärts bewegen um"},
"moveForwardTooltip":function(d){return "Bewege den Künstler vorwärts."},
"moveNorthTooltip":function(d){return "Bewegt den Künstler nach Norden."},
"moveSouthTooltip":function(d){return "Bewegt den Künstler nach Süden."},
"moveWestTooltip":function(d){return "Bewegt den Künstler nach Westen."},
"moveTooltip":function(d){return "Bewegt den Künstler um den angegebenen Betrag vor- oder rückwärts."},
"notBlackColour":function(d){return "Du musst eine andere Farbe als schwarz für diese Aufgabe angeben."},
"numBlocksNeeded":function(d){return "Diese Aufgabe kann mit %1 Bausteinen gelöst werden. Du hast %2 benutzt."},
"penDown":function(d){return "Stift aufsetzen"},
"penTooltip":function(d){return "Hebt oder senkt den Stift um das Zeichnen zu starten oder zu beenden."},
"penUp":function(d){return "Stift anheben"},
"reinfFeedbackMsg":function(d){return "Dein Bild ist fertig! Arbeite weiter daran oder gehe zur nächsten Aufgabe."},
"setAlpha":function(d){return "setze Transparenz"},
"setColour":function(d){return "Farbe festlegen"},
"setPattern":function(d){return "Muster einstellen"},
"setWidth":function(d){return "Breite festlegen"},
"shareDrawing":function(d){return "Teile deine Zeichnung:"},
"showMe":function(d){return "Zeigen"},
"showTurtle":function(d){return "Künstler zeigen"},
"sizeParameter":function(d){return "Größe"},
"step":function(d){return "Schritt"},
"tooFewColours":function(d){return "Du musst mindestens %1 verschiedene Farben für diese Aufgabe verwenden. Du hast nur %2 verwendet."},
"turnLeft":function(d){return "nach links drehen um"},
"turnRight":function(d){return "nach rechts drehen um"},
"turnRightTooltip":function(d){return "Dreht den Künstler um den angegebenen Winkel."},
"turnTooltip":function(d){return "Dreht den Künstler nach links oder rechts um den angegebenen Winkel."},
"turtleVisibilityTooltip":function(d){return "Macht den Künstler sichtbar oder unsichtbar."},
"widthTooltip":function(d){return "Ändert die Breite des Stiftes."},
"wrongColour":function(d){return "Ihr Bild hat die falsche Farbe. In dieser Aufgabe muss es %1 sein."}};