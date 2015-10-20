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
"blocksUsed":function(d){return "Blocos usados: %1"},
"branches":function(d){return "ramos"},
"catColour":function(d){return "Cor"},
"catControl":function(d){return "ciclos"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catTurtle":function(d){return "Ações"},
"catVariables":function(d){return "variáveis"},
"catLogic":function(d){return "Lógica"},
"colourTooltip":function(d){return "Altera a cor do lápis."},
"createACircle":function(d){return "criar um círculo"},
"createSnowflakeSquare":function(d){return "criar um floco de neve do tipo quadrado"},
"createSnowflakeParallelogram":function(d){return "criar um floco de neve do tipo paralelogramo"},
"createSnowflakeLine":function(d){return "criar um floco de neve do tipo reta"},
"createSnowflakeSpiral":function(d){return "criar um floco de neve do tipo espiral"},
"createSnowflakeFlower":function(d){return "criar um floco de neve do tipo flor"},
"createSnowflakeFractal":function(d){return "criar um floco de neve do tipo fractal"},
"createSnowflakeRandom":function(d){return "criar um floco de neve do tipo aleatório"},
"createASnowflakeBranch":function(d){return "criar um floco de neve do tipo ramificado"},
"degrees":function(d){return "graus"},
"depth":function(d){return "profundidade"},
"dots":function(d){return "píxeis"},
"drawACircle":function(d){return "desenhar um círculo"},
"drawAFlower":function(d){return "desenhar uma flor"},
"drawAHexagon":function(d){return "desenhar um hexágono"},
"drawAHouse":function(d){return "desenhar uma casa"},
"drawAPlanet":function(d){return "desenhar um planeta"},
"drawARhombus":function(d){return "desenhar um losango"},
"drawARobot":function(d){return "desenhar um robô"},
"drawARocket":function(d){return "desenhar um foguetão"},
"drawASnowflake":function(d){return "desenhar um floco de neve"},
"drawASnowman":function(d){return "desenhar um boneco de neve"},
"drawASquare":function(d){return "desenhar um quadrado"},
"drawAStar":function(d){return "desenhar uma estrela"},
"drawATree":function(d){return "desenhar uma árvore"},
"drawATriangle":function(d){return "desenhar um triângulo"},
"drawUpperWave":function(d){return "desenhar a onda superior"},
"drawLowerWave":function(d){return "desenhar a onda inferior"},
"drawStamp":function(d){return "desenhar o selo"},
"heightParameter":function(d){return "altura"},
"hideTurtle":function(d){return "ocultar o artista"},
"jump":function(d){return "saltar"},
"jumpBackward":function(d){return "saltar para trás por"},
"jumpForward":function(d){return "saltar para a frente por"},
"jumpTooltip":function(d){return "Move o artista sem deixar marcas."},
"jumpEastTooltip":function(d){return "Move o artista para este sem deixar marcas."},
"jumpNorthTooltip":function(d){return "Move o artista para norte sem deixar marcas."},
"jumpSouthTooltip":function(d){return "Move o artista para sul sem deixar marcas."},
"jumpWestTooltip":function(d){return "Move o artista para oeste sem deixar marcas."},
"lengthFeedback":function(d){return "Acertaste em tudo, exceto no comprimento do movimento."},
"lengthParameter":function(d){return "comprimento"},
"loopVariable":function(d){return "contador"},
"moveBackward":function(d){return "mover para trás por"},
"moveEastTooltip":function(d){return "Move o artista para este."},
"moveForward":function(d){return "mover para a frente por"},
"moveForwardTooltip":function(d){return "Move o artista para a frente."},
"moveNorthTooltip":function(d){return "Move o artista para norte."},
"moveSouthTooltip":function(d){return "Move o artista para sul."},
"moveWestTooltip":function(d){return "Move o artista para oeste."},
"moveTooltip":function(d){return "Move o artista para a frente ou para trás pela quantidade especificada."},
"notBlackColour":function(d){return "Tens de definir uma cor diferente do preto para este desafio."},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos. Tu usaste %2."},
"penDown":function(d){return "baixar o lápis"},
"penTooltip":function(d){return "Levanta ou baixa o lápis, para iniciar ou parar de desenhar."},
"penUp":function(d){return "levantar o lápis"},
"reinfFeedbackMsg":function(d){return "Aqui está o teu desenho! Continua a aperfeiçoá-lo ou continua para o próximo desafio."},
"setAlpha":function(d){return "definir transparência"},
"setColour":function(d){return "definir cor"},
"setPattern":function(d){return "definir padrão"},
"setWidth":function(d){return "definir largura"},
"shareDrawing":function(d){return "Partilha o teu desenho:"},
"showMe":function(d){return "Mostrem-me"},
"showTurtle":function(d){return "mostrar o artista"},
"sizeParameter":function(d){return "tamanho"},
"step":function(d){return "passo"},
"tooFewColours":function(d){return "Tens de usar, pelo menos, %1 cores diferentes neste desafio. Só usaste %2."},
"turnLeft":function(d){return "virar à esquerda por"},
"turnRight":function(d){return "virar à direita por"},
"turnRightTooltip":function(d){return "Vira o artista à direta de acordo com o ângulo especificado."},
"turnTooltip":function(d){return "Vira o artista à direita ou à esquerda de acordo com o número de graus especificado."},
"turtleVisibilityTooltip":function(d){return "Torna o artista visível ou invisível."},
"widthTooltip":function(d){return "Altera a largura do lápis."},
"wrongColour":function(d){return "A tua imagem está na cor errada. Neste desafio tem de ser %1."}};