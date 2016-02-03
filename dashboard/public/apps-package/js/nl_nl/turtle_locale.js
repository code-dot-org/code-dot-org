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
"blocksUsed":function(d){return "Blokken gebruikt: %1"},
"branches":function(d){return "vertakkingen"},
"catColour":function(d){return "Kleur"},
"catControl":function(d){return "Lussen"},
"catMath":function(d){return "Wiskunde"},
"catProcedures":function(d){return "Functies"},
"catTurtle":function(d){return "Acties"},
"catVariables":function(d){return "Variabelen"},
"catLogic":function(d){return "Logica"},
"colourTooltip":function(d){return "Verandert de kleur van het potlood."},
"createACircle":function(d){return "maak een cirkel"},
"createSnowflakeSquare":function(d){return "maak een sneeuwvlok van vierkanten"},
"createSnowflakeParallelogram":function(d){return "maak een sneeuwvlok van parallelogrammen"},
"createSnowflakeLine":function(d){return "maak een sneeuwvlok van lijnen"},
"createSnowflakeSpiral":function(d){return "maak een sneeuwvlok van spiralen"},
"createSnowflakeFlower":function(d){return "maak een sneeuwvlok van bloemen"},
"createSnowflakeFractal":function(d){return "maak een sneeuwvlok van fractalen"},
"createSnowflakeRandom":function(d){return "maak een willekeurig type sneeuwvlok"},
"createASnowflakeBranch":function(d){return "maak een vertakking van een sneeuwvlok"},
"degrees":function(d){return "graden"},
"depth":function(d){return "diepte"},
"dots":function(d){return "pixels"},
"drawACircle":function(d){return "teken een cirkel"},
"drawAFlower":function(d){return "teken een bloem"},
"drawAHexagon":function(d){return "teken een zeskant"},
"drawAHouse":function(d){return "teken een huis"},
"drawAPlanet":function(d){return "teken een planeet"},
"drawARhombus":function(d){return "teken een ruit"},
"drawARobot":function(d){return "teken een robot"},
"drawARocket":function(d){return "teken een raket"},
"drawASnowflake":function(d){return "teken een sneeuwvlok"},
"drawASnowman":function(d){return "teken een sneeuwpop"},
"drawASquare":function(d){return "teken een vierkant"},
"drawAStar":function(d){return "teken een ster"},
"drawATree":function(d){return "teken een boom"},
"drawATriangle":function(d){return "teken een driehoek"},
"drawUpperWave":function(d){return "teken een bovengolf"},
"drawLowerWave":function(d){return "teken een ondergolf"},
"drawStamp":function(d){return "teken een stempel"},
"heightParameter":function(d){return "hoogte"},
"hideTurtle":function(d){return "verberg kunstenaar"},
"jump":function(d){return "spring"},
"jumpBackward":function(d){return "spring achteruit met"},
"jumpForward":function(d){return "spring vooruit met"},
"jumpTooltip":function(d){return "Beweegt de tekenaar zonder sporen na te laten."},
"jumpEastTooltip":function(d){return "Beweegt de tekenaar richting oost zonder iets achter te laten."},
"jumpNorthTooltip":function(d){return "Beweegt de tekenaar richting noord zonder iets achter te laten."},
"jumpSouthTooltip":function(d){return "Beweegt de kunstenaar naar het zuiden zonder iets te tekenen."},
"jumpWestTooltip":function(d){return "Beweegt de kunstenaar naar het westen zonder iets te tekenen."},
"lengthFeedback":function(d){return "Het is goed, behalve de lengte van de beweging."},
"lengthParameter":function(d){return "lengte"},
"loopVariable":function(d){return "teller"},
"moveBackward":function(d){return "ga achteruit met"},
"moveEastTooltip":function(d){return "Beweegt de kunstenaar naar het oosten."},
"moveForward":function(d){return "ga vooruit met"},
"moveForwardTooltip":function(d){return "Beweegt de kunstenaar naar voren."},
"moveNorthTooltip":function(d){return "Beweegt de kunstenaar naar het noorden."},
"moveSouthTooltip":function(d){return "Beweegt de kunstenaar naar het zuiden."},
"moveWestTooltip":function(d){return "Beweegt de kunstenaar naar het westen."},
"moveTooltip":function(d){return "Beweegt de kunstenaar vooruit of achteruit met de opgegeven hoeveelheid."},
"notBlackColour":function(d){return "Je moet een andere kleur dan zwart instellen voor deze puzzel."},
"numBlocksNeeded":function(d){return "Deze puzzel kan worden opgelost met %1 blokken. Je hebt er %2 gebruikt."},
"penDown":function(d){return "potlood neer"},
"penTooltip":function(d){return "Optillen of laten zakken van het potlood, om te starten of stoppen met tekenen."},
"penUp":function(d){return "potlood optillen"},
"reinfFeedbackMsg":function(d){return "Hier is je tekening! Blijf er aan werken of ga verder naar de volgende puzzel."},
"setAlpha":function(d){return "zet doorzichtigheid"},
"setColour":function(d){return "kleur instellen"},
"setPattern":function(d){return "patroon instellen"},
"setWidth":function(d){return "dikte instellen"},
"shareDrawing":function(d){return "Deel je tekening:"},
"showMe":function(d){return "Laat zien"},
"showTurtle":function(d){return "laat kunstenaar zien"},
"sizeParameter":function(d){return "grootte"},
"step":function(d){return "stap"},
"tooFewColours":function(d){return "Je moet in ieder geval %1 verschillende kleuren gebruiken voor deze puzzel. Je hebt er %2 gebruikt."},
"turnLeft":function(d){return "draai links met"},
"turnRight":function(d){return "draai rechts met"},
"turnRightTooltip":function(d){return "Draait de kunstenaar rechts met de opgegeven hoek."},
"turnTooltip":function(d){return "Draait de kunstenaar links of rechts met het opgegeven aantal graden."},
"turtleVisibilityTooltip":function(d){return "Maakt de kunstenaar zichtbaar of onzichtbaar."},
"widthTooltip":function(d){return "Verandert de dikte van het potlood."},
"wrongColour":function(d){return "Je plaatje is de verkeerde kleur. Voor deze puzzel moet het %1 zijn."}};