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
"blocksUsed":function(d){return "Bloques usados: %1"},
"branches":function(d){return "ramos"},
"catColour":function(d){return "Cor"},
"catControl":function(d){return "Bucles"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "Funcións"},
"catTurtle":function(d){return "Accións"},
"catVariables":function(d){return "Variables"},
"catLogic":function(d){return "Lóxica"},
"colourTooltip":function(d){return "Altera a cor do lapis."},
"createACircle":function(d){return "cree un círculo"},
"createSnowflakeSquare":function(d){return "cree unha folerpa de neve do tipo cadrado"},
"createSnowflakeParallelogram":function(d){return "cree unha folerpa de neve do tipo paralelogramo"},
"createSnowflakeLine":function(d){return "cree unha folerpa de neve do tipo recta"},
"createSnowflakeSpiral":function(d){return "cree unha folerpa de neve do tipo espiral"},
"createSnowflakeFlower":function(d){return "cree unha folerpa de neve do tipo flor"},
"createSnowflakeFractal":function(d){return "cree unha folerpa de neve do tipo fractal"},
"createSnowflakeRandom":function(d){return "cree unha folerpa de neve do tipo aleatorio"},
"createASnowflakeBranch":function(d){return "cree unha folerpa de neve do tipo ramificado"},
"degrees":function(d){return "graos"},
"depth":function(d){return "profundidade"},
"dots":function(d){return "pixels"},
"drawACircle":function(d){return "debuxar un círculo"},
"drawAFlower":function(d){return "debuxe unha flor"},
"drawAHexagon":function(d){return "debuxe un hexágono"},
"drawAHouse":function(d){return "debuxe unha casa"},
"drawAPlanet":function(d){return "debuxe un planeta"},
"drawARhombus":function(d){return "debuxe un rombo"},
"drawARobot":function(d){return "debuxe un robot"},
"drawARocket":function(d){return "debuxe un foguete"},
"drawASnowflake":function(d){return "debuxe unha folerpa de neve"},
"drawASnowman":function(d){return "debuxar un boneco de neve"},
"drawASquare":function(d){return "debuxar un cadrado"},
"drawAStar":function(d){return "debuxe unha estrela"},
"drawATree":function(d){return "debuxe unha árbore"},
"drawATriangle":function(d){return "debuxar un triángulo"},
"drawUpperWave":function(d){return "debuxe a onda superior"},
"drawLowerWave":function(d){return "debuxe a onda inferior"},
"drawStamp":function(d){return "debuxar selo"},
"heightParameter":function(d){return "altura"},
"hideTurtle":function(d){return "oculte o artista"},
"jump":function(d){return "saltar"},
"jumpBackward":function(d){return "chimpe para trás por"},
"jumpForward":function(d){return "chimpe para diante por"},
"jumpTooltip":function(d){return "Move o artista sen deixar marcas."},
"jumpEastTooltip":function(d){return "Move o artista para o leste sen deixar marcas."},
"jumpNorthTooltip":function(d){return "Move o artista para o norte sen deixar marcas."},
"jumpSouthTooltip":function(d){return "Move o artista para o sur sen deixar marcas."},
"jumpWestTooltip":function(d){return "Move o artista para o oeste sen deixar marcas."},
"lengthFeedback":function(d){return "Vostede fixo todo ben, excepto polo longo do movimento."},
"lengthParameter":function(d){return "longo"},
"loopVariable":function(d){return "contador"},
"moveBackward":function(d){return "volte"},
"moveEastTooltip":function(d){return "Move o artista para o leste."},
"moveForward":function(d){return "avance por"},
"moveForwardTooltip":function(d){return "Move o artista para diante."},
"moveNorthTooltip":function(d){return "Move o artista para o norte."},
"moveSouthTooltip":function(d){return "Move o artista para o sur."},
"moveWestTooltip":function(d){return "Move o artista para o oeste."},
"moveTooltip":function(d){return "Move o artista para diante ou para trás pola cantidade especificada."},
"notBlackColour":function(d){return "Vostede precisa definir unha cor que non sexa negra para este desafío."},
"numBlocksNeeded":function(d){return "Este desafío pode ser resolvido con %1 bloques. Vostede usou %2."},
"penDown":function(d){return "baixe o lapis"},
"penTooltip":function(d){return "Levanta ou baixa o lapis, para comezar ou parar de debuxar."},
"penUp":function(d){return "levante o lapis"},
"reinfFeedbackMsg":function(d){return "Aquí está o seu debuxo! Continúe a traballar nel, ou siga para o próximo desafío."},
"setAlpha":function(d){return "definir alfa"},
"setColour":function(d){return "definir cor"},
"setPattern":function(d){return "definir padrón"},
"setWidth":function(d){return "definir o longo"},
"shareDrawing":function(d){return "Comparta o seu debuxo:"},
"showMe":function(d){return "Móstreme"},
"showTurtle":function(d){return "mostre o artista"},
"sizeParameter":function(d){return "tamaño"},
"step":function(d){return "paso"},
"tooFewColours":function(d){return "Vostede precisa usar polo menos %1 cores diferentes neste desafío. Vostede usou só %2."},
"turnLeft":function(d){return "vire á esquerda por"},
"turnRight":function(d){return "vire á dereita por"},
"turnRightTooltip":function(d){return "Vira o artista á direta de acordo co ángulo especificado."},
"turnTooltip":function(d){return "Vira o artista á dereita ou á esquerda usando o número especificado de graos."},
"turtleVisibilityTooltip":function(d){return "Fai que o artista fique visíbel ou invisíbel."},
"widthTooltip":function(d){return "Altera o longo do lapis."},
"wrongColour":function(d){return "A súa figura está coa cor errónea. Para este desafío necesita ser %1."}};