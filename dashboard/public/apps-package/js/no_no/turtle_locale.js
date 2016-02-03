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
"blocksUsed":function(d){return "Blokker brukt: %1"},
"branches":function(d){return "grener"},
"catColour":function(d){return "Farge"},
"catControl":function(d){return "Løkker"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catTurtle":function(d){return "Handlinger"},
"catVariables":function(d){return "Variabler"},
"catLogic":function(d){return "Logikk"},
"colourTooltip":function(d){return "Endrer fargen på blyanten."},
"createACircle":function(d){return "lag en sirkel"},
"createSnowflakeSquare":function(d){return "lag et snøflak av den firkantete typen"},
"createSnowflakeParallelogram":function(d){return "Lag et snøflak av typen parallellogram"},
"createSnowflakeLine":function(d){return "lag et snøflak av typen linje"},
"createSnowflakeSpiral":function(d){return "lag et snøflak av typen spiral"},
"createSnowflakeFlower":function(d){return "lag et snøflak av typen blomst"},
"createSnowflakeFractal":function(d){return "lag et snøflak av typen fraktal"},
"createSnowflakeRandom":function(d){return "lag et snøflak av typen tilfeldig"},
"createASnowflakeBranch":function(d){return "lag en snøflakgren"},
"degrees":function(d){return "grader"},
"depth":function(d){return "dybde"},
"dots":function(d){return "piksler"},
"drawACircle":function(d){return "tegn en sirkel"},
"drawAFlower":function(d){return "tegn en blomst"},
"drawAHexagon":function(d){return "tegn en sekskant"},
"drawAHouse":function(d){return "tegn et hus"},
"drawAPlanet":function(d){return "tegn en planet"},
"drawARhombus":function(d){return "tegne en rombe"},
"drawARobot":function(d){return "tegn en robot"},
"drawARocket":function(d){return "tegn en rakett"},
"drawASnowflake":function(d){return "tegn et snøfnugg"},
"drawASnowman":function(d){return "tegn en snømann"},
"drawASquare":function(d){return "tegn en firkant"},
"drawAStar":function(d){return "tegn en stjerne"},
"drawATree":function(d){return "tegn et tre"},
"drawATriangle":function(d){return "tegn en trekant"},
"drawUpperWave":function(d){return "tegn den øvre bølge"},
"drawLowerWave":function(d){return "tegn den nedre bølge"},
"drawStamp":function(d){return "tegn stempel"},
"heightParameter":function(d){return "høyde"},
"hideTurtle":function(d){return "skjul artist"},
"jump":function(d){return "Hopp"},
"jumpBackward":function(d){return "hopp bakover med"},
"jumpForward":function(d){return "hopp fremover med"},
"jumpTooltip":function(d){return "Flytter kunstneren uten å tegne noe."},
"jumpEastTooltip":function(d){return "Flytter artisten øst uten noen spor."},
"jumpNorthTooltip":function(d){return "Flytter artisten nord uten noen spor."},
"jumpSouthTooltip":function(d){return "Flytter artisten sør uten noen spor."},
"jumpWestTooltip":function(d){return "Flytter artisten vest uten noen spor."},
"lengthFeedback":function(d){return "Du fikk den rett bortsett fra lengden å flytte."},
"lengthParameter":function(d){return "lengde"},
"loopVariable":function(d){return "teller"},
"moveBackward":function(d){return "flytt bakover med"},
"moveEastTooltip":function(d){return "Flytter artisten øst."},
"moveForward":function(d){return "flytt fremover med"},
"moveForwardTooltip":function(d){return "Flytter kunstneren fremover."},
"moveNorthTooltip":function(d){return "Flytter artisten nord."},
"moveSouthTooltip":function(d){return "Flytter artisten sør."},
"moveWestTooltip":function(d){return "Flytter artisten vest."},
"moveTooltip":function(d){return "Flytter kunstneren fremover eller bakover med det gitte antallet."},
"notBlackColour":function(d){return "Du må velge en annen farge enn svart for denne oppgaven."},
"numBlocksNeeded":function(d){return "Denne oppgaven kan løses med %1 blokker.  Du brukte %2."},
"penDown":function(d){return "penn ned"},
"penTooltip":function(d){return "Løfter eller senker pennen, for å starte eller slutte å tegne."},
"penUp":function(d){return "penn opp"},
"reinfFeedbackMsg":function(d){return "Her er tegningen din! Fortsett å jobbe på den eller fortsett til neste oppgave."},
"setAlpha":function(d){return "angi gjennomsiktighet"},
"setColour":function(d){return "angi farge"},
"setPattern":function(d){return "angi mønster"},
"setWidth":function(d){return "angi bredde"},
"shareDrawing":function(d){return "Del tegningen din:"},
"showMe":function(d){return "Vis meg"},
"showTurtle":function(d){return "vis kunstner"},
"sizeParameter":function(d){return "størrelse"},
"step":function(d){return "Trinn"},
"tooFewColours":function(d){return "Du trenger minst %1 forskjellige farger for denne oppgaven.  Du brukte kun %2."},
"turnLeft":function(d){return "snu mot venstre med"},
"turnRight":function(d){return "snu mot høyre med"},
"turnRightTooltip":function(d){return "Snur kunstneren mot høyre med den angitte vinkelen."},
"turnTooltip":function(d){return "Snur kunstneren mot venstre eller høyre med den angitte vinkelen."},
"turtleVisibilityTooltip":function(d){return "Gjør kunstneren synlig eller usynlig."},
"widthTooltip":function(d){return "Endrer bredden på blyanten."},
"wrongColour":function(d){return "Ditt bilde har feil farge. For denne oppgaven skal fargen være %1."}};