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
"blocksUsed":function(d){return "Blocos utilizados: %1"},
"branches":function(d){return "branches"},
"catColour":function(d){return "Cor"},
"catControl":function(d){return "ciclos"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catTurtle":function(d){return "Ações"},
"catVariables":function(d){return "variáveis"},
"catLogic":function(d){return "Lógica"},
"colourTooltip":function(d){return "Altera a cor do lápis."},
"createACircle":function(d){return "create a circle"},
"createSnowflakeSquare":function(d){return "create a snowflake of type square"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "create a snowflake of type line"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "create a snowflake of type flower"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "graus"},
"depth":function(d){return "depth"},
"dots":function(d){return "pixels"},
"drawASquare":function(d){return "desenhar um quadrado"},
"drawATriangle":function(d){return "desenha um triângulo"},
"drawACircle":function(d){return "desenha um círculo"},
"drawAFlower":function(d){return "draw a flower"},
"drawAHexagon":function(d){return "draw a hexagon"},
"drawAHouse":function(d){return "desenha uma casa"},
"drawAPlanet":function(d){return "draw a planet"},
"drawARhombus":function(d){return "draw a rhombus"},
"drawARobot":function(d){return "draw a robot"},
"drawARocket":function(d){return "draw a rocket"},
"drawASnowflake":function(d){return "draw a snowflake"},
"drawASnowman":function(d){return "desenha um boneco de neve"},
"drawAStar":function(d){return "draw a star"},
"drawATree":function(d){return "desenha uma árvore"},
"drawUpperWave":function(d){return "draw upper wave"},
"drawLowerWave":function(d){return "draw lower wave"},
"drawStamp":function(d){return "draw stamp"},
"heightParameter":function(d){return "altura"},
"hideTurtle":function(d){return "ocultar o artista"},
"jump":function(d){return "saltar"},
"jumpBackward":function(d){return "salta para trás por"},
"jumpForward":function(d){return "salta para a frente por"},
"jumpTooltip":function(d){return "Move a artista sem deixar marcas."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "comprimento"},
"loopVariable":function(d){return "contador"},
"moveBackward":function(d){return "move para trás por"},
"moveEastTooltip":function(d){return "Moves the artist east."},
"moveForward":function(d){return "move para a frente por"},
"moveForwardTooltip":function(d){return "Move o artista para a frente."},
"moveNorthTooltip":function(d){return "Moves the artist north."},
"moveSouthTooltip":function(d){return "Moves the artist south."},
"moveWestTooltip":function(d){return "Moves the artist west."},
"moveTooltip":function(d){return "Move o artista para a frente ou para trás pela quantidade especificada."},
"notBlackColour":function(d){return "Precisas de definir uma cor diferente de preto para este quebra-cabeças."},
"numBlocksNeeded":function(d){return "Este quebra-cabeças pode ser resolvido com blocos de %1. Usaste %2."},
"penDown":function(d){return "lápis para baixo"},
"penTooltip":function(d){return "Levanta ou baixa o lápis, para iniciar ou parar de desenhar."},
"penUp":function(d){return "lápis para cima"},
"reinfFeedbackMsg":function(d){return "Here is your drawing! Keep working on it or continue to the next puzzle."},
"setColour":function(d){return "definir cor"},
"setPattern":function(d){return "set pattern"},
"setWidth":function(d){return "definir largura"},
"shareDrawing":function(d){return "Partilha o teu desenho:"},
"showMe":function(d){return "Mostra-me"},
"showTurtle":function(d){return "mostra o artista"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "step"},
"tooFewColours":function(d){return "Precisará de usar pelo menos %1 cores diferentes para este quebra-cabeças.  Usaste apenas %2."},
"turnLeft":function(d){return "vira à esquerda por"},
"turnRight":function(d){return "vira à direita por"},
"turnRightTooltip":function(d){return "Roda o artista à direita pelo ângulo especificado."},
"turnTooltip":function(d){return "Roda o artista à esquerda ou à direita pelo número especificado de graus."},
"turtleVisibilityTooltip":function(d){return "Torna o artista visível ou invisível."},
"widthTooltip":function(d){return "Altera a largura do lápis."},
"wrongColour":function(d){return "A tua imagem está na cor errada. Para este quebra-cabeças, terá que ser %1."}};