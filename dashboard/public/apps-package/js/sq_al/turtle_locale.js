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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Blloqet e përdorur: %1"},
"branches":function(d){return "degët"},
"catColour":function(d){return "Ngjyra"},
"catControl":function(d){return "perseritje"},
"catMath":function(d){return "Matematikë"},
"catProcedures":function(d){return "funksionet"},
"catTurtle":function(d){return "Veprimet"},
"catVariables":function(d){return "variabla"},
"catLogic":function(d){return "Logjika"},
"colourTooltip":function(d){return "Ndryshon ngjyrën e lapsit."},
"createACircle":function(d){return "krijo një rreth"},
"createSnowflakeSquare":function(d){return "krijo një flok dëbore në formën e katrorit"},
"createSnowflakeParallelogram":function(d){return "krijo një flok dëbore në formën e paralelogramit"},
"createSnowflakeLine":function(d){return "krijo një flok dëbore në formën e vijës"},
"createSnowflakeSpiral":function(d){return "krijo një flok dëbore në formën e spirales"},
"createSnowflakeFlower":function(d){return "krijo një flok dëbore si lule"},
"createSnowflakeFractal":function(d){return "krijo një flok dëbore në formën fraktale"},
"createSnowflakeRandom":function(d){return "krijo një flok dëbore të çfarëdoshme"},
"createASnowflakeBranch":function(d){return "krijo një degë floku prej dëbore"},
"degrees":function(d){return "Gradë"},
"depth":function(d){return "thellësi"},
"dots":function(d){return "piksela"},
"drawASquare":function(d){return "vizato nje katror"},
"drawATriangle":function(d){return "vizato nje trekendesh"},
"drawACircle":function(d){return "vizato nje rreth"},
"drawAFlower":function(d){return "vizato një lule"},
"drawAHexagon":function(d){return "vizato një gjashtëkëndësh"},
"drawAHouse":function(d){return "vizato një shtëpi"},
"drawAPlanet":function(d){return "vizato një planet"},
"drawARhombus":function(d){return "vizato një romb"},
"drawARobot":function(d){return "vizato një robot"},
"drawARocket":function(d){return "vizato një raketë"},
"drawASnowflake":function(d){return "vizato një flok dëbore"},
"drawASnowman":function(d){return "vizato nje njeri debore"},
"drawAStar":function(d){return "vizato një yll"},
"drawATree":function(d){return "Vizato një pemë"},
"drawUpperWave":function(d){return "vizato një valë të sipërme"},
"drawLowerWave":function(d){return "vizato një valë të ulët"},
"drawStamp":function(d){return "vizato vulë"},
"heightParameter":function(d){return "gjatësia"},
"hideTurtle":function(d){return "fshih artistin"},
"jump":function(d){return "hidhu"},
"jumpBackward":function(d){return "kërce mbrapa me"},
"jumpForward":function(d){return "kërce përpara me"},
"jumpTooltip":function(d){return "Zhvendose artistin pa lënë shenjë."},
"jumpEastTooltip":function(d){return "Lëviz artistin në lindje pa lënë asnjë shenjë."},
"jumpNorthTooltip":function(d){return "Lëviz artistin në veri pa lënë asnjë shenjë."},
"jumpSouthTooltip":function(d){return "Lëviz artistin në jug pa lënë asnjë shenjë."},
"jumpWestTooltip":function(d){return "Lëviz artistin në perëndim pa lënë asnjë shenjë."},
"lengthFeedback":function(d){return "E bëre mirë, me përjashtim të largësisë së mundur për të lëvizur."},
"lengthParameter":function(d){return "gjatesi"},
"loopVariable":function(d){return "numërues"},
"moveBackward":function(d){return "lëviz mbrapa me"},
"moveEastTooltip":function(d){return "Lëviz artistin në lindje."},
"moveForward":function(d){return "lëviz përpara me"},
"moveForwardTooltip":function(d){return "E zhvendos artistin përpara."},
"moveNorthTooltip":function(d){return "Lëviz artistin në veri."},
"moveSouthTooltip":function(d){return "Lëviz artistin në jug."},
"moveWestTooltip":function(d){return "Lëviz artistin në perëndim."},
"moveTooltip":function(d){return "E zhvendos artistin përpara ose mbrapa në varësi të sasisë."},
"notBlackColour":function(d){return "Ju duhet të zgjidhni një ngjyrë të ndryshme nga e zeza për këtë enigmë."},
"numBlocksNeeded":function(d){return "Ky puzzle mund të zgjidhet me %1 të blloqeve. Ju përdorët %2."},
"penDown":function(d){return "Lapsi poshtë"},
"penTooltip":function(d){return "Ngri ose ul lapsin, për të filluar ose për të ndaluar vizatimin."},
"penUp":function(d){return "lapsin lart"},
"reinfFeedbackMsg":function(d){return "Ja ku është dhe vizatimi yt! Vazhdo puno me të ose vazhdo tek puzzle tjetër."},
"setColour":function(d){return "vendos ngjyren"},
"setPattern":function(d){return "vendos modelin"},
"setWidth":function(d){return "vendos gjeresine"},
"shareDrawing":function(d){return "Shpërndaje vizatimin tënd:"},
"showMe":function(d){return "Ma trego"},
"showTurtle":function(d){return "shfaq artistin"},
"sizeParameter":function(d){return "madhësia"},
"step":function(d){return "ec"},
"tooFewColours":function(d){return "Ti duhet të përdorësh të paktën %1 ngjyra të ndryshme për këtë puzzle. Ti ke përdorur vetëm %2."},
"turnLeft":function(d){return "kthehu majtas nga"},
"turnRight":function(d){return "kthehu djathtas nga"},
"turnRightTooltip":function(d){return "Kthen artistin djathtas nga këndi i përcaktuar."},
"turnTooltip":function(d){return "Kthen artistin majtas ose djathtas nga numri i përcaktuar i gradëve."},
"turtleVisibilityTooltip":function(d){return "Bën artistin të dukshëm ose të padukshëm."},
"widthTooltip":function(d){return "Ndryshon gjerësinë e lapsit."},
"wrongColour":function(d){return "Figura jote është në ngjyrën e gabuar. Për këtë puzzle duhet të jetë %1."}};