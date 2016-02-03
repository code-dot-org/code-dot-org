var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Continuar"},
"doCode":function(d){return "haz"},
"elseCode":function(d){return "sino"},
"endGame":function(d){return "terminar el juego"},
"endGameTooltip":function(d){return "Termina el juego."},
"finalLevel":function(d){return "¡ Felicidades! Ha resuelto el rompecabezas final."},
"flap":function(d){return "aletear"},
"flapRandom":function(d){return "aletear una cantidad aleatoria"},
"flapVerySmall":function(d){return "aletea con una cantidad pequena"},
"flapSmall":function(d){return "aletear suavemente"},
"flapNormal":function(d){return "aletear normalmente"},
"flapLarge":function(d){return "aletear fuerte"},
"flapVeryLarge":function(d){return "aletear muy fuerte"},
"flapTooltip":function(d){return "Hacer volar a Flappy."},
"flappySpecificFail":function(d){return "Tú código se ve bien - aleteará con cada clic. Pero tienes que hacer clic varias veces para aletear hacia la meta."},
"incrementPlayerScore":function(d){return "anotar un punto"},
"incrementPlayerScoreTooltip":function(d){return "Añadir uno a la puntuación actual del jugador."},
"nextLevel":function(d){return "¡Felicidades! Has completado este puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Este puzzle puede resolverse con %1 bloques."},
"playSoundRandom":function(d){return "reproducir sonido aleatorio"},
"playSoundBounce":function(d){return "Reproducir sonido de rebote"},
"playSoundCrunch":function(d){return "reproduce un sonido de crujido"},
"playSoundDie":function(d){return "reproducir sonido triste"},
"playSoundHit":function(d){return "reproducir sonido de aplastar"},
"playSoundPoint":function(d){return "reproducir sonido de punto"},
"playSoundSwoosh":function(d){return "reproducir sonido de crujido"},
"playSoundWing":function(d){return "reproducir sonido de aleteo"},
"playSoundJet":function(d){return "reproducir sonido de avión"},
"playSoundCrash":function(d){return "reproducir sonido de choque"},
"playSoundJingle":function(d){return "reproducir sonido de cascabel"},
"playSoundSplash":function(d){return "reproducir sonido de aplastamiento"},
"playSoundLaser":function(d){return "reproducir sonido de láser"},
"playSoundTooltip":function(d){return "Reproduce el sonido seleccionado."},
"reinfFeedbackMsg":function(d){return "Puede pulsar el botón \"Inténtalo de nuevo\" para volver a jugar su juego."},
"scoreText":function(d){return "Puntuación: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "establecer escena"},
"setBackgroundRandom":function(d){return "establecer escena al azar"},
"setBackgroundFlappy":function(d){return "establecer escena de ciudad (día)"},
"setBackgroundNight":function(d){return "establecer escena de ciudad (noche)"},
"setBackgroundSciFi":function(d){return "establecer escena de Sci-Fi"},
"setBackgroundUnderwater":function(d){return "establecer escena debajo del agua"},
"setBackgroundCave":function(d){return "establecer escena de cueva"},
"setBackgroundSanta":function(d){return "establecer escena de Santa Claus"},
"setBackgroundTooltip":function(d){return "Establece la imagen de fondo"},
"setGapRandom":function(d){return "establecer un espacio al azar"},
"setGapVerySmall":function(d){return "establecer un espacio muy pequeño"},
"setGapSmall":function(d){return "establecer un espacio pequeño"},
"setGapNormal":function(d){return "establecer un espacio normal"},
"setGapLarge":function(d){return "establecer un espacio grande"},
"setGapVeryLarge":function(d){return "establecer un espacio muy grande"},
"setGapHeightTooltip":function(d){return "Establece el espacio vertical en un obstáculo"},
"setGravityRandom":function(d){return "Establecer la gravedad al azar"},
"setGravityVeryLow":function(d){return "Establecer la gravedad muy baja"},
"setGravityLow":function(d){return "Establecer la gravedad baja"},
"setGravityNormal":function(d){return "Establecer la gravedad normal"},
"setGravityHigh":function(d){return "Establecer la gravedad alta"},
"setGravityVeryHigh":function(d){return "Establecer la gravedad muy alta"},
"setGravityTooltip":function(d){return "Establecer la gravedad del nivel"},
"setGround":function(d){return "establecer el suelo"},
"setGroundRandom":function(d){return "establecer suelo al azar"},
"setGroundFlappy":function(d){return "establecer fondo Tierra"},
"setGroundSciFi":function(d){return "establecer fondo Sci-Fi"},
"setGroundUnderwater":function(d){return "establecer fondo bajo el agua"},
"setGroundCave":function(d){return "establecer fondo Cueva"},
"setGroundSanta":function(d){return "establecer fondo Santa Claus"},
"setGroundLava":function(d){return "establecer fondo Lava"},
"setGroundTooltip":function(d){return "Establecer la imagen de fondo"},
"setObstacle":function(d){return "establecer obstáculo"},
"setObstacleRandom":function(d){return "establecer obstáculo aleatorio"},
"setObstacleFlappy":function(d){return "establecer obstáculo Tubo"},
"setObstacleSciFi":function(d){return "establecer obstáculo  Sci-Fi"},
"setObstacleUnderwater":function(d){return "establecer obstáculo planta"},
"setObstacleCave":function(d){return "establecer obstáculo Cueva"},
"setObstacleSanta":function(d){return "establecer obstáculo Chimenea"},
"setObstacleLaser":function(d){return "establecer obstáculo Láser"},
"setObstacleTooltip":function(d){return "Establece la imagen del obstáculo"},
"setPlayer":function(d){return "establecer el jugador"},
"setPlayerRandom":function(d){return "establecer jugador al azar"},
"setPlayerFlappy":function(d){return "establecer jugador a Pájaro amarillo"},
"setPlayerRedBird":function(d){return "establecer jugador a Pájaro rojo"},
"setPlayerSciFi":function(d){return "establecer jugador a Nave espacial"},
"setPlayerUnderwater":function(d){return "establecer jugador a Pez"},
"setPlayerCave":function(d){return "establecer jugador a Murciélago"},
"setPlayerSanta":function(d){return "establecer jugador a Santa Claus"},
"setPlayerShark":function(d){return "establecer jugador a Tiburón"},
"setPlayerEaster":function(d){return "establecer jugador a Conejo de Pascua"},
"setPlayerBatman":function(d){return "establecer jugador a Chico murciélago"},
"setPlayerSubmarine":function(d){return "establecer jugador a Submarino"},
"setPlayerUnicorn":function(d){return "establecer jugador a Unicornio"},
"setPlayerFairy":function(d){return "establecer jugador a Hada"},
"setPlayerSuperman":function(d){return "establecer jugador a Flappyman"},
"setPlayerTurkey":function(d){return "establecer jugador a Pavo"},
"setPlayerTooltip":function(d){return "Establece la imagen del jugador"},
"setScore":function(d){return "Establece el puntaje"},
"setScoreTooltip":function(d){return "Establece la puntuación del jugador"},
"setSpeed":function(d){return "establecer velocidad"},
"setSpeedTooltip":function(d){return "Establecer la velocidad del nivel"},
"shareFlappyTwitter":function(d){return "Mira el juego Flappy que hice. Lo escribí con @codeorg"},
"shareGame":function(d){return "Comparte tu juego:"},
"soundRandom":function(d){return "al azar"},
"soundBounce":function(d){return "rebotar"},
"soundCrunch":function(d){return "aplastar"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "pegar"},
"soundPoint":function(d){return "punto"},
"soundSwoosh":function(d){return "silbido"},
"soundWing":function(d){return "ala"},
"soundJet":function(d){return "avión"},
"soundCrash":function(d){return "choque"},
"soundJingle":function(d){return "tintineo"},
"soundSplash":function(d){return "salpicar"},
"soundLaser":function(d){return "láser"},
"speedRandom":function(d){return "establecer velocidad al azar"},
"speedVerySlow":function(d){return "establecer velocidad muy lenta"},
"speedSlow":function(d){return "establecer velocidad lenta"},
"speedNormal":function(d){return "establecer velocidad normal"},
"speedFast":function(d){return "establecer velocidad rápida"},
"speedVeryFast":function(d){return "establecer velocidad muy rápida"},
"whenClick":function(d){return "Cuando haga clic"},
"whenClickTooltip":function(d){return "Ejecutar las siguientes acciones cuando se produce un evento de clic."},
"whenCollideGround":function(d){return "cuando toca el suelo"},
"whenCollideGroundTooltip":function(d){return "Ejecutar las siguientes acciones cuando Flappy toque el suelo."},
"whenCollideObstacle":function(d){return "cuando choca con un obstáculo"},
"whenCollideObstacleTooltip":function(d){return "Ejecutar las acciones siguientes cuando Flappy choca con un obstáculo."},
"whenEnterObstacle":function(d){return "cuando pase un obstáculo"},
"whenEnterObstacleTooltip":function(d){return "Ejecutar las acciones siguientes cuando Flappy choca con un obstáculo."},
"whenRunButtonClick":function(d){return "cuando el juego comience"},
"whenRunButtonClickTooltip":function(d){return "Ejecutar las acciones indicadas debajo cuando comience el juego."},
"yes":function(d){return "Sí"}};