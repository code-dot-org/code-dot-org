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
"blocksUsed":function(d){return "Bloques utilizados: %1"},
"branches":function(d){return "ramas"},
"catColour":function(d){return "Color"},
"catControl":function(d){return "vuelta"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "funciones"},
"catTurtle":function(d){return "Acciones"},
"catVariables":function(d){return "variables"},
"catLogic":function(d){return "Lógica"},
"colourTooltip":function(d){return "Cambia el color del lápiz."},
"createACircle":function(d){return "crear un círculo"},
"createSnowflakeSquare":function(d){return "crear un copo de nieve del tipo cuadrado"},
"createSnowflakeParallelogram":function(d){return "crear un copo de nieve del tipo paralelogramo"},
"createSnowflakeLine":function(d){return "crear un copo de nieve del tipo línea"},
"createSnowflakeSpiral":function(d){return "crear un copo de nieve del tipo espiral"},
"createSnowflakeFlower":function(d){return "crear un copo de nieve del tipo flor"},
"createSnowflakeFractal":function(d){return "crear un copo de nieve del tipo fractal"},
"createSnowflakeRandom":function(d){return "crear un copo de nieve del tipo aleatorio"},
"createASnowflakeBranch":function(d){return "crear un copo de nieve del tipo rama"},
"degrees":function(d){return "grados"},
"depth":function(d){return "profundidad"},
"dots":function(d){return "pixeles"},
"drawASquare":function(d){return "Dibuje un cuadrado"},
"drawATriangle":function(d){return "dibujar un triángulo"},
"drawACircle":function(d){return "dibujar un círculo"},
"drawAFlower":function(d){return "dibujar una flor"},
"drawAHexagon":function(d){return "dibujar un hexágono"},
"drawAHouse":function(d){return "dibujar una casa"},
"drawAPlanet":function(d){return "dibujar un planeta"},
"drawARhombus":function(d){return "dibujar un rombo"},
"drawARobot":function(d){return "dibujar un robot"},
"drawARocket":function(d){return "dibujar un cohete"},
"drawASnowflake":function(d){return "dibujar un copo de nieve"},
"drawASnowman":function(d){return "dibuje un muñeco de nieve"},
"drawAStar":function(d){return "dibujar una estrella"},
"drawATree":function(d){return "dibujar un árbol"},
"drawUpperWave":function(d){return "dibujar la onda superior"},
"drawLowerWave":function(d){return "dibujar la onda mas baja"},
"drawStamp":function(d){return "dibujar sello"},
"heightParameter":function(d){return "altura"},
"hideTurtle":function(d){return "ocultar artista"},
"jump":function(d){return "salta"},
"jumpBackward":function(d){return "saltar hacia atrás"},
"jumpForward":function(d){return "saltar hacia adelante"},
"jumpTooltip":function(d){return "Mueve el artista sin dejar ninguna marca."},
"jumpEastTooltip":function(d){return "Mueve al artista hacia el este sin dejar ninguna marca."},
"jumpNorthTooltip":function(d){return "Mueve al artista hacia el norte sin dejar ninguna marca."},
"jumpSouthTooltip":function(d){return "Mueve al artista hacia el sur sin dejar ninguna marca."},
"jumpWestTooltip":function(d){return "Mueve al artista hacia el oeste sin dejar ninguna marca."},
"lengthFeedback":function(d){return "Está correcto, excepto por las longitudes a moverse."},
"lengthParameter":function(d){return "longitud"},
"loopVariable":function(d){return "contador"},
"moveBackward":function(d){return "mover hacia atrás"},
"moveEastTooltip":function(d){return "Mueve al artista al este."},
"moveForward":function(d){return "mover hacia adelante"},
"moveForwardTooltip":function(d){return "Avanza el artista."},
"moveNorthTooltip":function(d){return "Mueve al artista al norte."},
"moveSouthTooltip":function(d){return "Mueve al artista al sur."},
"moveWestTooltip":function(d){return "Mueve al artista al oeste."},
"moveTooltip":function(d){return "Mueve el artista hacia adelante o atrás en la cantidad especificada."},
"notBlackColour":function(d){return "Tienes que establecer un color que no sea negro para este nivel."},
"numBlocksNeeded":function(d){return "Este nivel puede resolverse con %1 bloques.  Usaste %2."},
"penDown":function(d){return "bajar lápiz"},
"penTooltip":function(d){return "Levanta o baja el lápiz, para empezar o dejar de dibujar."},
"penUp":function(d){return "levantar lápiz"},
"reinfFeedbackMsg":function(d){return "¡Aquí está tu dibujo! Sigue trabajando en él o continúa al siguiente Puzzle."},
"setColour":function(d){return "definir color"},
"setPattern":function(d){return "establecer patrón"},
"setWidth":function(d){return "definir ancho"},
"shareDrawing":function(d){return "Comparte tu dibujo:"},
"showMe":function(d){return "Muéstrame"},
"showTurtle":function(d){return "mostrar artista"},
"sizeParameter":function(d){return "tamaño"},
"step":function(d){return "paso"},
"tooFewColours":function(d){return "Debes utilizar al menos %1 colores diferentes en este nivel.  Sólo utilizaste %2."},
"turnLeft":function(d){return "girar a la izquierda por"},
"turnRight":function(d){return "girar a la derecha por"},
"turnRightTooltip":function(d){return "Gira el artista hacia la derecha en el ángulo especificado."},
"turnTooltip":function(d){return "Gira el artista a la izquierda o la derecha en la cantidad de grados especificada."},
"turtleVisibilityTooltip":function(d){return "Hace que el artista sea visible o invisible."},
"widthTooltip":function(d){return "Cambia el ancho del lápiz."},
"wrongColour":function(d){return "Tu imagen es de un color incorrecto.  Para este nivel, debe ser %1."}};