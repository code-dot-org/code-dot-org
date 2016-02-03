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
"blocksUsed":function(d){return "Blocs utilitzats: %1"},
"branches":function(d){return "branques"},
"catColour":function(d){return "Color"},
"catControl":function(d){return "Bucles"},
"catMath":function(d){return "Matemàtiques"},
"catProcedures":function(d){return "Funcions"},
"catTurtle":function(d){return "Accions"},
"catVariables":function(d){return "Variables"},
"catLogic":function(d){return "Lògic"},
"colourTooltip":function(d){return "Canvia el color del llapis."},
"createACircle":function(d){return "crea un cercle"},
"createSnowflakeSquare":function(d){return "crea un floc de neu de tipus quadrat"},
"createSnowflakeParallelogram":function(d){return "crea un floc de neu de tipus paral·lelogram"},
"createSnowflakeLine":function(d){return "crea un floc de neu de tipus línia"},
"createSnowflakeSpiral":function(d){return "crea un floc de neu tipus espiral"},
"createSnowflakeFlower":function(d){return "crea un floc de neu de tipus flor"},
"createSnowflakeFractal":function(d){return "crea un floc de neu tipus fractal"},
"createSnowflakeRandom":function(d){return "crea un floc de neu de tipus aleatori"},
"createASnowflakeBranch":function(d){return "crear una branca de floc de neu"},
"degrees":function(d){return "graus"},
"depth":function(d){return "profunditat"},
"dots":function(d){return "píxels"},
"drawACircle":function(d){return "dibuixa un cercle"},
"drawAFlower":function(d){return "dibuixa una flor"},
"drawAHexagon":function(d){return "dibuixa un hexàgon"},
"drawAHouse":function(d){return "dibuixa una casa"},
"drawAPlanet":function(d){return "dibuixa un planeta"},
"drawARhombus":function(d){return "dibuixa un rombe"},
"drawARobot":function(d){return "dibuixa un robot"},
"drawARocket":function(d){return "dibuixa un coet"},
"drawASnowflake":function(d){return "dibuixa un floc de neu"},
"drawASnowman":function(d){return "dibuixa un ninot de neu"},
"drawASquare":function(d){return "dibuixa un quadrat"},
"drawAStar":function(d){return "dibuixa una estrella"},
"drawATree":function(d){return "dibuixa un arbre"},
"drawATriangle":function(d){return "dibuixa un triangle"},
"drawUpperWave":function(d){return "dibuixa una onada alta"},
"drawLowerWave":function(d){return "dibuixa una onada baixa"},
"drawStamp":function(d){return "dibuixa un segell"},
"heightParameter":function(d){return "alçcada"},
"hideTurtle":function(d){return "amaga l'artista"},
"jump":function(d){return "salt"},
"jumpBackward":function(d){return "salta cap enrere"},
"jumpForward":function(d){return "salta cap endevant"},
"jumpTooltip":function(d){return "Mou l'artista sense deixar ninguna marca."},
"jumpEastTooltip":function(d){return "Mou l'artista a l'est sense deixar cap marca."},
"jumpNorthTooltip":function(d){return "Desplaça l'artista al nord sense deixar cap marca."},
"jumpSouthTooltip":function(d){return "Mou l'artista al sud sense deixar cap marca."},
"jumpWestTooltip":function(d){return "Desplaça l'artista a l'oest sense deixar cap marca."},
"lengthFeedback":function(d){return "Ho has fet bé excepte per les longituds a moure's."},
"lengthParameter":function(d){return "longitud"},
"loopVariable":function(d){return "comptador"},
"moveBackward":function(d){return "retrocedeix"},
"moveEastTooltip":function(d){return "Mou l'artista cap a l'est."},
"moveForward":function(d){return "avança"},
"moveForwardTooltip":function(d){return "Mou l'artista endavant."},
"moveNorthTooltip":function(d){return "Desplaça l'artista cap al nord."},
"moveSouthTooltip":function(d){return "Mou l'artista cap al sud."},
"moveWestTooltip":function(d){return "Mou l'artista cap a l'oest."},
"moveTooltip":function(d){return "Avança o retrocedeix l'artista segons la quantitat especificada."},
"notBlackColour":function(d){return "Necessites definir un color que no sigui negre per a aquest puzzle."},
"numBlocksNeeded":function(d){return "Aquest puzzle pot ser resolt amb %1 blocs. Tu has utilitzat %2."},
"penDown":function(d){return "baixa el llapis"},
"penTooltip":function(d){return "Puja o baixa el llapis per començar o deixar de dibuixar."},
"penUp":function(d){return "puja el llapis"},
"reinfFeedbackMsg":function(d){return "Aquí tens el dibuix! Segueix treballant-hi o continua al puzzle següent."},
"setAlpha":function(d){return "establir alfa"},
"setColour":function(d){return "defineix color"},
"setPattern":function(d){return "defineix el patró"},
"setWidth":function(d){return "defineix l'amplada"},
"shareDrawing":function(d){return "Comparteix el teu dibuix:"},
"showMe":function(d){return "Mostra'm"},
"showTurtle":function(d){return "mostra l'artista"},
"sizeParameter":function(d){return "mida"},
"step":function(d){return "pas"},
"tooFewColours":function(d){return "Necessites utilitzar al menys %1 colors diferents per a aquest puzzle. Tu has utilitzat només %2."},
"turnLeft":function(d){return "gira a l'esquerra"},
"turnRight":function(d){return "gira a la dreta"},
"turnRightTooltip":function(d){return "Gira l'artista cap a la dreta amb l'angle especificat."},
"turnTooltip":function(d){return "Gira l'artista cap a l'esquerra o dreta segons el nombre especificat de graus."},
"turtleVisibilityTooltip":function(d){return "Fer l'artista visible o invisible."},
"widthTooltip":function(d){return "Canvia el gruix del llapis."},
"wrongColour":function(d){return "La teva imatge té el color malament. Per a aquest puzzle necessita ser %1."}};