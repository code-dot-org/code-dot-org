var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "Rebotar pelota"},
"bounceBallTooltip":function(d){return "Rebotar una pelota contra un objeto."},
"continue":function(d){return "Continuar"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "haz"},
"elseCode":function(d){return "si no"},
"finalLevel":function(d){return "¡ Felicidades! Ha resuelto el rompecabezas final."},
"heightParameter":function(d){return "altura"},
"ifCode":function(d){return "si"},
"ifPathAhead":function(d){return "si hay un camino delante"},
"ifTooltip":function(d){return "Si hay un camino en la dirección especificada, hacer algunas acciones."},
"ifelseTooltip":function(d){return "Si hay un camino en la dirección especificada, hacer el primer bloque de acciones. De lo contrario, hacer el segundo bloque de acciones."},
"incrementOpponentScore":function(d){return "Anota un punto al oponente"},
"incrementOpponentScoreTooltip":function(d){return "Añadir uno a la puntuación actual del oponente."},
"incrementPlayerScore":function(d){return "Puntuación punto"},
"incrementPlayerScoreTooltip":function(d){return "Añadir uno a la puntuación actual del jugador."},
"isWall":function(d){return "¿Es esto una pared?"},
"isWallTooltip":function(d){return "Devuelve verdadero si hay un muro"},
"launchBall":function(d){return "lanzar nueva pelota"},
"launchBallTooltip":function(d){return "Lanza una pelota en el juego."},
"makeYourOwn":function(d){return "Crea tu Propio Bounce Game"},
"moveDown":function(d){return "Bajar"},
"moveDownTooltip":function(d){return "Mover la paleta hacia abajo."},
"moveForward":function(d){return "avanzar"},
"moveForwardTooltip":function(d){return "Avanzar un espacio."},
"moveLeft":function(d){return "mover hacia la izquierda"},
"moveLeftTooltip":function(d){return "Mover la paleta a la izquierda."},
"moveRight":function(d){return "mover hacia la derecha"},
"moveRightTooltip":function(d){return "Mover la paleta a la derecha."},
"moveUp":function(d){return "mueva hacia arriba"},
"moveUpTooltip":function(d){return "Mover la paleta hacia arriba."},
"nextLevel":function(d){return "¡Felicidades! Has completado este puzzle."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "el camino está bloqueado"},
"noPathLeft":function(d){return "no hay camino a la izquierda"},
"noPathRight":function(d){return "no hay camino a la derecha"},
"numBlocksNeeded":function(d){return "Este puzzle puede resolverse con %1 bloques."},
"pathAhead":function(d){return "camino hacia adelante"},
"pathLeft":function(d){return "si hay camino a la izquierda"},
"pathRight":function(d){return "si hay camino a la derecha"},
"pilePresent":function(d){return "hay una pila"},
"playSoundCrunch":function(d){return "reproducir sonido de crujido"},
"playSoundGoal1":function(d){return "reproducir sonido meta 1"},
"playSoundGoal2":function(d){return "reproducir sonido meta 2"},
"playSoundHit":function(d){return "reproducir sonido golpe"},
"playSoundLosePoint":function(d){return "Reproducir sonido punto perdido"},
"playSoundLosePoint2":function(d){return "Reproducir sonido punto perdido 2"},
"playSoundRetro":function(d){return "reproducir sonido retro"},
"playSoundRubber":function(d){return "emitir sonido de goma"},
"playSoundSlap":function(d){return "emitir  sonido cachetada"},
"playSoundTooltip":function(d){return "Reproduce el sonido seleccionado."},
"playSoundWinPoint":function(d){return "Reproducir sonido punto ganado"},
"playSoundWinPoint2":function(d){return "Reproducir sonido punto ganado 2"},
"playSoundWood":function(d){return "Reproducir sonido de madera"},
"putdownTower":function(d){return "poner en el suelo la torre"},
"reinfFeedbackMsg":function(d){return "Puede pulsar el botón \"Inténtalo de nuevo\" para volver a jugar su juego."},
"removeSquare":function(d){return "elimina cuadrado"},
"repeatUntil":function(d){return "repetir hasta"},
"repeatUntilBlocked":function(d){return "mientras haya camino delante"},
"repeatUntilFinish":function(d){return "repetir hasta terminar"},
"scoreText":function(d){return "Puntuación: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "Establecer escena al azar"},
"setBackgroundHardcourt":function(d){return "Establecer escena en cancha dura"},
"setBackgroundRetro":function(d){return "Establecer escena retro"},
"setBackgroundTooltip":function(d){return "Establece la imagen de fondo"},
"setBallRandom":function(d){return "Establecer pelota al azar"},
"setBallHardcourt":function(d){return "Establecer bola para pista dura"},
"setBallRetro":function(d){return "Establecer pelota retro"},
"setBallTooltip":function(d){return "Establece la imagen de la pelota"},
"setBallSpeedRandom":function(d){return "Establecer velocidad de pelota al azar"},
"setBallSpeedVerySlow":function(d){return "Establecer velocidad de pelota muy lenta"},
"setBallSpeedSlow":function(d){return "Establecer velocidad de pelota lenta"},
"setBallSpeedNormal":function(d){return "Establecer velocidad de pelota normal"},
"setBallSpeedFast":function(d){return "Establecer velocidad de pelota rápida"},
"setBallSpeedVeryFast":function(d){return "Establecer velocidad de pelota muy rápida"},
"setBallSpeedTooltip":function(d){return "Establece la velocidad de la pelota"},
"setPaddleRandom":function(d){return "Establecer paleta al azar"},
"setPaddleHardcourt":function(d){return "Establecer paleta para cancha dura"},
"setPaddleRetro":function(d){return "Establecer paleta retro"},
"setPaddleTooltip":function(d){return "Establece la imagen de la paleta"},
"setPaddleSpeedRandom":function(d){return "Establecer velocidad de paleta al azar"},
"setPaddleSpeedVerySlow":function(d){return "Establecer velocidad de paleta muy lenta"},
"setPaddleSpeedSlow":function(d){return "Establecer velocidad de paleta lenta"},
"setPaddleSpeedNormal":function(d){return "Establecer velocidad de paleta normal"},
"setPaddleSpeedFast":function(d){return "Establecer velocidad de paleta rápida"},
"setPaddleSpeedVeryFast":function(d){return "Establecer velocidad de paleta muy rápida"},
"setPaddleSpeedTooltip":function(d){return "Establece la velocidad de la paleta de juego"},
"shareBounceTwitter":function(d){return "Echa un vistazo al juego Bounce game que he creado. Lo escribí yo mismo con @codeorg"},
"shareGame":function(d){return "Comparte tu juego:"},
"turnLeft":function(d){return "girar a la izquierda"},
"turnRight":function(d){return "girar a la derecha"},
"turnTooltip":function(d){return "Me gira a la izquierda o a la derecha 90 grados."},
"whenBallInGoal":function(d){return "Cuando la pelota esté en la portería"},
"whenBallInGoalTooltip":function(d){return "Ejecuta las instrucciones siguientes cuando la pelota entra en la portería."},
"whenBallMissesPaddle":function(d){return "cuando la paleta no golpea a la pelota"},
"whenBallMissesPaddleTooltip":function(d){return "Ejecuta las instrucciones siguientes cuando la paleta no golpea la pelota."},
"whenDown":function(d){return "cuando se pulse la tecla de flecha hacia abajo"},
"whenDownTooltip":function(d){return "Realiza las instrucciones de abajo cuando se presiona la tecla de fecha hacia abajo."},
"whenGameStarts":function(d){return "cuando el juego comienza"},
"whenGameStartsTooltip":function(d){return "Ejecutar las acciones siguientes cuando empieza el juego."},
"whenLeft":function(d){return "cuando se pulse la tecla de flecha izquierda"},
"whenLeftTooltip":function(d){return "Ejecuta las acciones, mostradas abajo, cuando se presiona la tecla de flecha izquierda."},
"whenPaddleCollided":function(d){return "cuando la paleta golpea la pelota"},
"whenPaddleCollidedTooltip":function(d){return "Ejecuta las instrucciones siguientes cuando la paleta golpea la pelota."},
"whenRight":function(d){return "cuando la tecla flecha derecha"},
"whenRightTooltip":function(d){return "Ejecuta las acciones, mostradas debajo, cuando la tecla de flecha derecha se presiona."},
"whenUp":function(d){return "Cuando flecha arriba"},
"whenUpTooltip":function(d){return "Realiza las instrucciones de abajo cuando se presiona la tecla de fecha hacia arriba."},
"whenWallCollided":function(d){return "cuando la pelota golpea la pared"},
"whenWallCollidedTooltip":function(d){return "Ejecuta las instrucciones siguientes cuando la pelota choca con una pared."},
"whileMsg":function(d){return "mientras"},
"whileTooltip":function(d){return "Repetir las acciones dentro del bloque hasta alcanzar el punto final."},
"yes":function(d){return "Sí"}};