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
"blocksUsed":function(d){return "Notaðir kubbar: %1"},
"branches":function(d){return "greinar"},
"catColour":function(d){return "Litir"},
"catControl":function(d){return "Lykkjur"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catTurtle":function(d){return "Aðgerðir"},
"catVariables":function(d){return "Breytur"},
"catLogic":function(d){return "Rökvísi"},
"colourTooltip":function(d){return "Breytir litnum á penslinum."},
"createACircle":function(d){return "búa til hring"},
"createSnowflakeSquare":function(d){return "búa til snjókorn af gerð ferningur"},
"createSnowflakeParallelogram":function(d){return "búa til snjókorn af gerð samsíðungur"},
"createSnowflakeLine":function(d){return "búa til snjókorn af gerð lína"},
"createSnowflakeSpiral":function(d){return "búa til snjókorn af gerð spírall"},
"createSnowflakeFlower":function(d){return "búa til snjókorn af gerð blóm"},
"createSnowflakeFractal":function(d){return "búa til snjókorn af gerð brotamynd"},
"createSnowflakeRandom":function(d){return "búa til snjókorn af gerð handahóf"},
"createASnowflakeBranch":function(d){return "búa til grein snjókorns"},
"degrees":function(d){return "gráður"},
"depth":function(d){return "dýpt"},
"dots":function(d){return "díla"},
"drawASquare":function(d){return "teikna ferning"},
"drawATriangle":function(d){return "teikna þríhyrning"},
"drawACircle":function(d){return "teikna hring"},
"drawAFlower":function(d){return "teikna blóm"},
"drawAHexagon":function(d){return "teikna sexkant"},
"drawAHouse":function(d){return "teikna hús"},
"drawAPlanet":function(d){return "teikna plánetu"},
"drawARhombus":function(d){return "teikna tígul"},
"drawARobot":function(d){return "teikna vélmenni"},
"drawARocket":function(d){return "teikna eldflaug"},
"drawASnowflake":function(d){return "teikna snjókorn"},
"drawASnowman":function(d){return "teikna snjókarl"},
"drawAStar":function(d){return "teikna stjörnu"},
"drawATree":function(d){return "teikna tré"},
"drawUpperWave":function(d){return "teikna efri bylgju"},
"drawLowerWave":function(d){return "teikna neðri bylgju"},
"drawStamp":function(d){return "teikna stimpil"},
"heightParameter":function(d){return "hæð"},
"hideTurtle":function(d){return "fela listamann"},
"jump":function(d){return "stökkva"},
"jumpBackward":function(d){return "hoppa afturábak um"},
"jumpForward":function(d){return "hoppa fram um"},
"jumpTooltip":function(d){return "Færir listamanninn án þess að skilja eftir slóð."},
"jumpEastTooltip":function(d){return "Færir listamanninn austur án þess að skilja eftir slóð."},
"jumpNorthTooltip":function(d){return "Færir listamanninn norður án þess að skilja eftir slóð."},
"jumpSouthTooltip":function(d){return "Færir listamanninn suður án þess að skilja eftir slóð."},
"jumpWestTooltip":function(d){return "Færir listamanninn vestur án þess að skilja eftir slóð."},
"lengthFeedback":function(d){return "Þetta er rétt hjá þér nema vegalengdin sem á að færa."},
"lengthParameter":function(d){return "lengd"},
"loopVariable":function(d){return "teljari"},
"moveBackward":function(d){return "færa aftur um"},
"moveEastTooltip":function(d){return "Færir listamanninn í austurátt."},
"moveForward":function(d){return "færa áfram um"},
"moveForwardTooltip":function(d){return "Færir listamanninn áfram."},
"moveNorthTooltip":function(d){return "Færir listamanninn í norðurátt."},
"moveSouthTooltip":function(d){return "Færir listamanninn í suðurátt."},
"moveWestTooltip":function(d){return "Færir listamanninn í vesturátt."},
"moveTooltip":function(d){return "Færir listamanninn áfram eða aftur á bak um tiltekna vegalengd."},
"notBlackColour":function(d){return "Þú verður að velja annan lit en svartan fyrir þessa þraut."},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum. Þú notaðir %2."},
"penDown":function(d){return "pensill niður"},
"penTooltip":function(d){return "Lyftir eða lækkar pensilinn til að byrja eða hætta að teikna."},
"penUp":function(d){return "pensill upp"},
"reinfFeedbackMsg":function(d){return "Hér er teikningin þín! Haltu áfram með hana eða farðu í næstu þraut."},
"setColour":function(d){return "stilla lit"},
"setPattern":function(d){return "stilla mynstur"},
"setWidth":function(d){return "stilla breidd"},
"shareDrawing":function(d){return "Deildu teikningunni:"},
"showMe":function(d){return "Sýna mig"},
"showTurtle":function(d){return "sýna listamanninn"},
"sizeParameter":function(d){return "stærð"},
"step":function(d){return "þrep"},
"tooFewColours":function(d){return "Þú verður að nota a.m.k. %1 mismunandi liti í þessari þraut. Þú notaðir aðeins %2."},
"turnLeft":function(d){return "snúa til vinstri um"},
"turnRight":function(d){return "snúa til hægri um"},
"turnRightTooltip":function(d){return "Snýr listamanninum til hægri um tiltekið horn."},
"turnTooltip":function(d){return "Snýr listamanninum til vinstri eða hægri um tiltekinn fjölda gráða."},
"turtleVisibilityTooltip":function(d){return "Gerir listamanninn sýnilegan eða ósýnilegan."},
"widthTooltip":function(d){return "Breytir breidd pensilsins."},
"wrongColour":function(d){return "Myndin þín er í röngum lit. Í þessari þraut þarf að nota %1."}};