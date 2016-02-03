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
"blocksUsed":function(d){return "Felhasznált blokkok: %1"},
"branches":function(d){return "ágak"},
"catColour":function(d){return "Szín"},
"catControl":function(d){return "hurkok"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "funkciók"},
"catTurtle":function(d){return "Műveletek"},
"catVariables":function(d){return "változók"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Megváltoztatja a ceruza színét."},
"createACircle":function(d){return "készíts kört"},
"createSnowflakeSquare":function(d){return "hozz létre egy négyzet típusú hópelyhet"},
"createSnowflakeParallelogram":function(d){return "hozz létre egy parallelogramma típusú hópelyhet"},
"createSnowflakeLine":function(d){return "hozz létre egy vonal típusú hópelyhet"},
"createSnowflakeSpiral":function(d){return "hozz létre egy spirális típusú hópelyhet"},
"createSnowflakeFlower":function(d){return "hozz létre egy virág típusú hópelyhet"},
"createSnowflakeFractal":function(d){return "hozz létre egy fraktál típusú hópelyhet"},
"createSnowflakeRandom":function(d){return "hozz létre egy véletlen típusú hópelyhet"},
"createASnowflakeBranch":function(d){return "hozz létre egy hópehely ágat"},
"degrees":function(d){return "fok"},
"depth":function(d){return "mélység"},
"dots":function(d){return "képpontok"},
"drawACircle":function(d){return "kör rajzolása"},
"drawAFlower":function(d){return "Rajzolj egy virágot"},
"drawAHexagon":function(d){return "Rajzolj hatszöget"},
"drawAHouse":function(d){return "rajzoljon egy házat"},
"drawAPlanet":function(d){return "Rajzolj egy bolygót"},
"drawARhombus":function(d){return "rajzolj egy rombuszt"},
"drawARobot":function(d){return "rajzolj egy robotot"},
"drawARocket":function(d){return "rajzolj egy rakétát"},
"drawASnowflake":function(d){return "rajzolj egy hópelyhet"},
"drawASnowman":function(d){return "rajzolj egy hóembert"},
"drawASquare":function(d){return "rajzoljon egy négyzetet"},
"drawAStar":function(d){return "rajzolj egy csillagot"},
"drawATree":function(d){return "rajzolj egy fát"},
"drawATriangle":function(d){return "Rajzolj egy háromszöget"},
"drawUpperWave":function(d){return "rajzolj felső hullámot"},
"drawLowerWave":function(d){return "rajzolj alsó hullámot"},
"drawStamp":function(d){return "rajzolj bélyeget"},
"heightParameter":function(d){return "magasság"},
"hideTurtle":function(d){return "művész elrejtése"},
"jump":function(d){return "Ugorj"},
"jumpBackward":function(d){return "ugrás hátra"},
"jumpForward":function(d){return "ugrás előre"},
"jumpTooltip":function(d){return "A művészt mozgatja rajzolás nélkül."},
"jumpEastTooltip":function(d){return "A művészt kelet felé mozgatja rajzolás nélkül."},
"jumpNorthTooltip":function(d){return "A művészt észak felé mozgatja rajzolás nélkül."},
"jumpSouthTooltip":function(d){return "A művészt dél felé mozgatja rajzolás nélkül."},
"jumpWestTooltip":function(d){return "A művészt nyugat felé mozgatja rajzolás nélkül."},
"lengthFeedback":function(d){return "Majdnem tökéletes, csak a mozgás hosszát gondold át újra."},
"lengthParameter":function(d){return "hossza"},
"loopVariable":function(d){return "számláló"},
"moveBackward":function(d){return "menj hátra"},
"moveEastTooltip":function(d){return "A művészt kelet felé mozgatja."},
"moveForward":function(d){return "menj előre"},
"moveForwardTooltip":function(d){return "A művészt előre mozgatja."},
"moveNorthTooltip":function(d){return "A művészt észak felé mozgatja."},
"moveSouthTooltip":function(d){return "A művészt dél felé mozgatja."},
"moveWestTooltip":function(d){return "A művészt nyugat felé mozgatja."},
"moveTooltip":function(d){return "A művészt egy meghatározott mértékben előre, vagy hátra mozgatja."},
"notBlackColour":function(d){return "Feketétől különbözőre kell állítania a színt a rejtvény megoldásához."},
"numBlocksNeeded":function(d){return "Ezt a feladatot meg lehet oldani %1 blokkal. Te %2 -t használtál."},
"penDown":function(d){return "ceruza le"},
"penTooltip":function(d){return "Felemeli vagy lejjebb viszi a ceruzát, hogy megállítsa vagy elindítsa a rajzolást."},
"penUp":function(d){return "ceruza fel"},
"reinfFeedbackMsg":function(d){return "Itt van a rajzod! Még dolgozhatsz rajta, de áttérhetsz a következő feladványra is."},
"setAlpha":function(d){return "alfa beállítása"},
"setColour":function(d){return "színbeállítások megadása"},
"setPattern":function(d){return "minta beállítása"},
"setWidth":function(d){return "szélesség beállítása"},
"shareDrawing":function(d){return "Oszd meg a rajzodat:"},
"showMe":function(d){return "Mutasd"},
"showTurtle":function(d){return "megmutatja a művészt"},
"sizeParameter":function(d){return "méret"},
"step":function(d){return "lépés"},
"tooFewColours":function(d){return "Legalább %1 különböző szint kell használnod a megoldáshoz. Te csak %2-t használtál ."},
"turnLeft":function(d){return "fordulj balra"},
"turnRight":function(d){return "fordulj jobbra"},
"turnRightTooltip":function(d){return "A művész jobbra fordul a megadott szögben."},
"turnTooltip":function(d){return "A művészt balra vagy jobbra fordul a megadott fokban."},
"turtleVisibilityTooltip":function(d){return "A művészt láthatóvá, vagy láthatatlanná teszi."},
"widthTooltip":function(d){return "A ceruza szélességének módosítása."},
"wrongColour":function(d){return "A kép színe hibás.  Ehhez a rejtvényhez %1 kell lennie."}};