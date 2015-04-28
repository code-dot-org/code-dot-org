var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "actor"},
"alienInvasion":function(d){return "¡Invasión de aliens!"},
"backgroundBlack":function(d){return "negro"},
"backgroundCave":function(d){return "cueva"},
"backgroundCloudy":function(d){return "nublado"},
"backgroundHardcourt":function(d){return "pista dura"},
"backgroundNight":function(d){return "noche"},
"backgroundUnderwater":function(d){return "bajo el agua"},
"backgroundCity":function(d){return "ciudad"},
"backgroundDesert":function(d){return "desierto"},
"backgroundRainbow":function(d){return "arco iris"},
"backgroundSoccer":function(d){return "fútbol"},
"backgroundSpace":function(d){return "espacio"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "invierno"},
"catActions":function(d){return "Acciones"},
"catControl":function(d){return "Iteraciones"},
"catEvents":function(d){return "Eventos"},
"catLogic":function(d){return "Lógica"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "Funciones"},
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variables"},
"changeScoreTooltip":function(d){return "Agregar o quitar un punto a la puntuación."},
"changeScoreTooltipK1":function(d){return "Agregar un punto a la puntuación."},
"continue":function(d){return "Continuar"},
"decrementPlayerScore":function(d){return "Quitar punto"},
"defaultSayText":function(d){return "Escriba aquí"},
"emotion":function(d){return "estado de ánimo"},
"finalLevel":function(d){return "¡ Felicidades! Ha resuelto el rompecabezas final."},
"for":function(d){return "para"},
"hello":function(d){return "hola"},
"helloWorld":function(d){return "¡Hola mundo!"},
"incrementPlayerScore":function(d){return "Puntuación punto"},
"makeProjectileDisappear":function(d){return "desaparecer"},
"makeProjectileBounce":function(d){return "rebotar"},
"makeProjectileBlueFireball":function(d){return "hacer bola de fuego azul"},
"makeProjectilePurpleFireball":function(d){return "hacer bola de fuego púrpura"},
"makeProjectileRedFireball":function(d){return "hacer bola de fuego roja"},
"makeProjectileYellowHearts":function(d){return "hacer corazones amarillos"},
"makeProjectilePurpleHearts":function(d){return "hacer corazones morados"},
"makeProjectileRedHearts":function(d){return "hacer corazones rojos"},
"makeProjectileTooltip":function(d){return "Hacer que el proyectil que acaba de chocar desaparezca o rebote."},
"makeYourOwn":function(d){return "Haz Tu Propia Aplicación de Laboratorio de Juego"},
"moveDirectionDown":function(d){return "abajo"},
"moveDirectionLeft":function(d){return "izquierda"},
"moveDirectionRight":function(d){return "derecha"},
"moveDirectionUp":function(d){return "arriba"},
"moveDirectionRandom":function(d){return "aleatorio"},
"moveDistance25":function(d){return "25 píxeles"},
"moveDistance50":function(d){return "50 píxeles"},
"moveDistance100":function(d){return "100 píxeles"},
"moveDistance200":function(d){return "200 píxeles"},
"moveDistance400":function(d){return "400 píxeles"},
"moveDistancePixels":function(d){return "pixeles"},
"moveDistanceRandom":function(d){return "pixeles aleatorios"},
"moveDistanceTooltip":function(d){return "Mover un actor una distancia específica en la dirección especificada."},
"moveSprite":function(d){return "mover"},
"moveSpriteN":function(d){return "mover actor "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "a x, y"},
"moveDown":function(d){return "Bajar"},
"moveDownTooltip":function(d){return "Mover un actor hacia abajo."},
"moveLeft":function(d){return "mover hacia la izquierda"},
"moveLeftTooltip":function(d){return "Mover un actor a la izquierda."},
"moveRight":function(d){return "mover hacia la derecha"},
"moveRightTooltip":function(d){return "Mover un actor hacia la derecha."},
"moveUp":function(d){return "mueva hacia arriba"},
"moveUpTooltip":function(d){return "Mover un actor hacia arriba."},
"moveTooltip":function(d){return "Mover un actor."},
"nextLevel":function(d){return "¡Felicidades! Has completado este puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Este puzzle puede resolverse con %1 bloques."},
"onEventTooltip":function(d){return "Ejecuta el código en respuesta al evento especificado."},
"ouchExclamation":function(d){return "¡Ay!"},
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
"positionOutTopLeft":function(d){return "a la posición superior izquierda"},
"positionOutTopRight":function(d){return "a la posición superior derecha"},
"positionTopOutLeft":function(d){return "a la posición superior izquierda externa"},
"positionTopLeft":function(d){return "Hacia la posición superior izquierda"},
"positionTopCenter":function(d){return "Hacia la posición superior central"},
"positionTopRight":function(d){return "Hacia la posición superior derecha"},
"positionTopOutRight":function(d){return "a la posición superior derecha externa"},
"positionMiddleLeft":function(d){return "Hacia la posición media izquierda"},
"positionMiddleCenter":function(d){return "Hacia la posición media central"},
"positionMiddleRight":function(d){return "Hacia la posición media derecha"},
"positionBottomOutLeft":function(d){return "a la posición inferior izquierda externa"},
"positionBottomLeft":function(d){return "Hacia la posición inferior izquierda"},
"positionBottomCenter":function(d){return "Hacia la posición inferior central"},
"positionBottomRight":function(d){return "Hacia la posición inferior derecha"},
"positionBottomOutRight":function(d){return "a la posición inferior derecha externa"},
"positionOutBottomLeft":function(d){return "a la posición inferior izquierda"},
"positionOutBottomRight":function(d){return "a la posición inferior derecha"},
"positionRandom":function(d){return "Hacia una posición al azar"},
"projectileBlueFireball":function(d){return "bola de fuego azul"},
"projectilePurpleFireball":function(d){return "bola de fuego morada"},
"projectileRedFireball":function(d){return "bola de fuego roja"},
"projectileYellowHearts":function(d){return "corazones amarillos"},
"projectilePurpleHearts":function(d){return "corazones morados"},
"projectileRedHearts":function(d){return "corazones rojos"},
"projectileRandom":function(d){return "aleatorio"},
"projectileAnna":function(d){return "gancho"},
"projectileElsa":function(d){return "chispa"},
"projectileHiro":function(d){return "micro-robots"},
"projectileBaymax":function(d){return "cohete"},
"projectileRapunzel":function(d){return "cazo"},
"projectileCherry":function(d){return "cereza"},
"projectileIce":function(d){return "hielo"},
"projectileDuck":function(d){return "pato"},
"reinfFeedbackMsg":function(d){return "Puedes presionar el botón \"Seguir Jugando\" para volver a jugar tu historia."},
"repeatForever":function(d){return "Repetir para siempre"},
"repeatDo":function(d){return "haz"},
"repeatForeverTooltip":function(d){return "Ejecutar las acciones de este bloque repetidamente mientras la historia se esté ejecutando."},
"saySprite":function(d){return "decir"},
"saySpriteN":function(d){return "actor "+appLocale.v(d,"spriteIndex")+" dice"},
"saySpriteTooltip":function(d){return "Haz salir una burbuja de diálogo con el texto asociado desde el actor especificado."},
"saySpriteChoices_0":function(d){return "Hola."},
"saySpriteChoices_1":function(d){return "Hola a todos."},
"saySpriteChoices_2":function(d){return "¿Cómo te va?"},
"saySpriteChoices_3":function(d){return "Buenos días"},
"saySpriteChoices_4":function(d){return "Buenas tardes"},
"saySpriteChoices_5":function(d){return "Buenas noches"},
"saySpriteChoices_6":function(d){return "Buenas noches"},
"saySpriteChoices_7":function(d){return "¿Qué hay de nuevo?"},
"saySpriteChoices_8":function(d){return "¿Qué?"},
"saySpriteChoices_9":function(d){return "¿Dónde?"},
"saySpriteChoices_10":function(d){return "¿Cuándo?"},
"saySpriteChoices_11":function(d){return "Bien."},
"saySpriteChoices_12":function(d){return "¡Grandioso!"},
"saySpriteChoices_13":function(d){return "Todo bien."},
"saySpriteChoices_14":function(d){return "No está mal."},
"saySpriteChoices_15":function(d){return "Buena suerte."},
"saySpriteChoices_16":function(d){return "Sí"},
"saySpriteChoices_17":function(d){return "No"},
"saySpriteChoices_18":function(d){return "De acuerdo"},
"saySpriteChoices_19":function(d){return "Buen tiro!"},
"saySpriteChoices_20":function(d){return "Que tengas un buen día."},
"saySpriteChoices_21":function(d){return "Adiós."},
"saySpriteChoices_22":function(d){return "Volveré pronto."},
"saySpriteChoices_23":function(d){return "¡Te veo mañana!"},
"saySpriteChoices_24":function(d){return "¡Te veo luego!"},
"saySpriteChoices_25":function(d){return "¡Cuídate!"},
"saySpriteChoices_26":function(d){return "¡Disfruta!"},
"saySpriteChoices_27":function(d){return "Me tengo que ir."},
"saySpriteChoices_28":function(d){return "¿Quieres que seamos amigos?"},
"saySpriteChoices_29":function(d){return "¡Buen trabajo!"},
"saySpriteChoices_30":function(d){return "¡Yuhu!"},
"saySpriteChoices_31":function(d){return "¡Yay!"},
"saySpriteChoices_32":function(d){return "Encantado de conocerte."},
"saySpriteChoices_33":function(d){return "¡Todo bien!"},
"saySpriteChoices_34":function(d){return "Gracias"},
"saySpriteChoices_35":function(d){return "No, gracias"},
"saySpriteChoices_36":function(d){return "¡Aaaaaah!"},
"saySpriteChoices_37":function(d){return "No importa"},
"saySpriteChoices_38":function(d){return "Hoy"},
"saySpriteChoices_39":function(d){return "Mañana"},
"saySpriteChoices_40":function(d){return "Ayer"},
"saySpriteChoices_41":function(d){return "¡Te encontré!"},
"saySpriteChoices_42":function(d){return "¡Me encontraste!"},
"saySpriteChoices_43":function(d){return "¡10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "¡Eres genial!"},
"saySpriteChoices_45":function(d){return "¡Eres divertido!"},
"saySpriteChoices_46":function(d){return "¡Eres tonto! "},
"saySpriteChoices_47":function(d){return "¡Eres un buen amigo!"},
"saySpriteChoices_48":function(d){return "¡Cuidado!"},
"saySpriteChoices_49":function(d){return "¡Pato!"},
"saySpriteChoices_50":function(d){return "Te Pille!"},
"saySpriteChoices_51":function(d){return "Auch!"},
"saySpriteChoices_52":function(d){return "¡Lo siento!"},
"saySpriteChoices_53":function(d){return "¡Cuidado!"},
"saySpriteChoices_54":function(d){return "¡Vaya!"},
"saySpriteChoices_55":function(d){return "¡Uy!"},
"saySpriteChoices_56":function(d){return "¡Casi me atrapas!"},
"saySpriteChoices_57":function(d){return "Buen intento!"},
"saySpriteChoices_58":function(d){return "¡No puedes atraparme!"},
"scoreText":function(d){return "Puntuación: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "fijar fondo"},
"setBackgroundRandom":function(d){return "Establecer fondo al azar"},
"setBackgroundBlack":function(d){return "Establecer fondo negro"},
"setBackgroundCave":function(d){return "Establecer fondo de cueva"},
"setBackgroundCloudy":function(d){return "establecer fondo nublado"},
"setBackgroundHardcourt":function(d){return "Establecer fondo de pista dura"},
"setBackgroundNight":function(d){return "Establecer fondo nocturno"},
"setBackgroundUnderwater":function(d){return "establecer fondo submarino"},
"setBackgroundCity":function(d){return "establecer fondo de ciudad"},
"setBackgroundDesert":function(d){return "establecer fondo de desierto"},
"setBackgroundRainbow":function(d){return "establecer fondo de arco iris"},
"setBackgroundSoccer":function(d){return "establecer fondo de fútbol"},
"setBackgroundSpace":function(d){return "establecer fondo en el espacio"},
"setBackgroundTennis":function(d){return "establecer fondo de tenis"},
"setBackgroundWinter":function(d){return "establecer fondo de invierno"},
"setBackgroundLeafy":function(d){return "establecer el fondo de hojas"},
"setBackgroundGrassy":function(d){return "establecer el fondo de hierba"},
"setBackgroundFlower":function(d){return "establecer el fondo de flores"},
"setBackgroundTile":function(d){return "establecer el fondo de azulejos"},
"setBackgroundIcy":function(d){return "establecer el fondo de hielo"},
"setBackgroundSnowy":function(d){return "establecer el fondo de nieve"},
"setBackgroundTooltip":function(d){return "Establece la imagen de fondo"},
"setEnemySpeed":function(d){return "establecer velocidad del enemigo"},
"setPlayerSpeed":function(d){return "establecer la velocidad del jugador"},
"setScoreText":function(d){return "Establece el puntaje"},
"setScoreTextTooltip":function(d){return "Establece el texto que se va a mostrar en el área de puntaje."},
"setSpriteEmotionAngry":function(d){return "para alguien malhumorado"},
"setSpriteEmotionHappy":function(d){return "a un estado de ánimo feliz"},
"setSpriteEmotionNormal":function(d){return "a un estado de ánimo normal"},
"setSpriteEmotionRandom":function(d){return "a un estado de ánimo al azar"},
"setSpriteEmotionSad":function(d){return "a un estado de ánimo triste"},
"setSpriteEmotionTooltip":function(d){return "Define el estado de ánimo del actor"},
"setSpriteAlien":function(d){return "a una imagen alienigena"},
"setSpriteBat":function(d){return "a una imagen de un murcielago"},
"setSpriteBird":function(d){return "a una imagen de un pajaro"},
"setSpriteCat":function(d){return "a una imagen de un gato"},
"setSpriteCaveBoy":function(d){return "a la imagen del niño de las cavernas"},
"setSpriteCaveGirl":function(d){return "a la imagen de la niña de las cavernas"},
"setSpriteDinosaur":function(d){return "a una imagen de un dinosaurio"},
"setSpriteDog":function(d){return "a una imagen de un perro"},
"setSpriteDragon":function(d){return "a una imagen de un dragón"},
"setSpriteGhost":function(d){return "a una imagen de un fantasma"},
"setSpriteHidden":function(d){return "a una imagen oculta"},
"setSpriteHideK1":function(d){return "ocultar"},
"setSpriteAnna":function(d){return "para una imagen de Anna"},
"setSpriteElsa":function(d){return "para una imagen de Elsa"},
"setSpriteHiro":function(d){return "a una imagen de Hiro"},
"setSpriteBaymax":function(d){return "a una imagen de Baymax"},
"setSpriteRapunzel":function(d){return "a una imagen de Rapunzel"},
"setSpriteKnight":function(d){return "a la imagen de un caballero"},
"setSpriteMonster":function(d){return "a la imagen de un monstruo"},
"setSpriteNinja":function(d){return "a la imagen de un ninja enmascarado"},
"setSpriteOctopus":function(d){return "a una imagen de un pulpo"},
"setSpritePenguin":function(d){return "a la imagen de un pingüino"},
"setSpritePirate":function(d){return "a la imagen de un pirata"},
"setSpritePrincess":function(d){return "a la imagen de una princesa"},
"setSpriteRandom":function(d){return "a una imagen al azar"},
"setSpriteRobot":function(d){return "a la imagen de un robot"},
"setSpriteShowK1":function(d){return "mostrar"},
"setSpriteSpacebot":function(d){return "a la imagen de un robot espacial"},
"setSpriteSoccerGirl":function(d){return "a la imagen de una futbolista"},
"setSpriteSoccerBoy":function(d){return "a la imagen de un futbolista"},
"setSpriteSquirrel":function(d){return "a una imagen de una ardilla"},
"setSpriteTennisGirl":function(d){return "a la imagen de una jugadora de tenis"},
"setSpriteTennisBoy":function(d){return "a la imagen de un jugador de tenis"},
"setSpriteUnicorn":function(d){return "a la imagen de un unicornio"},
"setSpriteWitch":function(d){return "a una imagen de una bruja"},
"setSpriteWizard":function(d){return "a una imagen de un mago"},
"setSpritePositionTooltip":function(d){return "Mueve instantáneamente un actor a la posición especificada."},
"setSpriteK1Tooltip":function(d){return "Muestra u oculta el actor especificado."},
"setSpriteTooltip":function(d){return "Establece la imagen del actor"},
"setSpriteSizeRandom":function(d){return "a un tamaño al azar"},
"setSpriteSizeVerySmall":function(d){return "a un tamaño muy pequeño"},
"setSpriteSizeSmall":function(d){return "a un tamaño pequeño"},
"setSpriteSizeNormal":function(d){return "a un tamaño normal"},
"setSpriteSizeLarge":function(d){return "a un tamaño grande"},
"setSpriteSizeVeryLarge":function(d){return "a un tamaño muy grande"},
"setSpriteSizeTooltip":function(d){return "Establece el tamaño de un actor"},
"setSpriteSpeedRandom":function(d){return "a una velocidad al azar"},
"setSpriteSpeedVerySlow":function(d){return "a una velocidad muy baja"},
"setSpriteSpeedSlow":function(d){return "a una velocidad baja"},
"setSpriteSpeedNormal":function(d){return "a una velocidad normal"},
"setSpriteSpeedFast":function(d){return "a una velocidad rápida"},
"setSpriteSpeedVeryFast":function(d){return "a una velocidad muy rápida"},
"setSpriteSpeedTooltip":function(d){return "Ajusta la velocidad de un actor"},
"setSpriteZombie":function(d){return "a la imagen de un zombie"},
"shareStudioTwitter":function(d){return "Checa la historia que hice. La escribí yo mismo con @codeorg"},
"shareGame":function(d){return "Comparte tu historia:"},
"showCoordinates":function(d){return "mostrar coordenadas"},
"showCoordinatesTooltip":function(d){return "Mostrar las coordenadas del protagonista en la pantalla"},
"showTitleScreen":function(d){return "Mostrar la pantalla de título"},
"showTitleScreenTitle":function(d){return "Título"},
"showTitleScreenText":function(d){return "texto"},
"showTSDefTitle":function(d){return "escribe el título aquí"},
"showTSDefText":function(d){return "escribe el texto aquí"},
"showTitleScreenTooltip":function(d){return "Muestra una pantalla de título con el título y texto asociados."},
"size":function(d){return "tamaño"},
"setSprite":function(d){return "establecer"},
"setSpriteN":function(d){return "definir actor "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "aplastar"},
"soundGoal1":function(d){return "meta 1"},
"soundGoal2":function(d){return "meta 2"},
"soundHit":function(d){return "golpe"},
"soundLosePoint":function(d){return "pierde punto"},
"soundLosePoint2":function(d){return "pierde punto 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "goma"},
"soundSlap":function(d){return "bofetada"},
"soundWinPoint":function(d){return "ganar punto"},
"soundWinPoint2":function(d){return "ganar punto 2"},
"soundWood":function(d){return "madera"},
"speed":function(d){return "velocidad"},
"startSetValue":function(d){return "Inicio (función)"},
"startSetVars":function(d){return "variables_del_juego (título, subtítulo, fondo, blanco, peligro, jugador)"},
"startSetFuncs":function(d){return "funciones_del_juego (actualizar-blanco, actualizar-peligro, actualizar-jugador, ¿choca?, ¿en-pantalla?)"},
"stopSprite":function(d){return "Parar"},
"stopSpriteN":function(d){return "detener actor "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Detener el movimiento del actor."},
"throwSprite":function(d){return "lanzar"},
"throwSpriteN":function(d){return "lanzamiento del actor "+appLocale.v(d,"spriteIndex")},
"throwTooltip":function(d){return "Lanza un proyectil desde el actor especificado."},
"vanish":function(d){return "desaparecer"},
"vanishActorN":function(d){return "desaparecer actor "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "desaparece el actor."},
"waitFor":function(d){return "espera por"},
"waitSeconds":function(d){return "segundos"},
"waitForClick":function(d){return "espera un clic"},
"waitForRandom":function(d){return "espera al azar"},
"waitForHalfSecond":function(d){return "esperar medio segundo"},
"waitFor1Second":function(d){return "esperar 1 segundo"},
"waitFor2Seconds":function(d){return "esperar 2 segundos"},
"waitFor5Seconds":function(d){return "esperar 5 segundos"},
"waitFor10Seconds":function(d){return "esperar 10 segudos"},
"waitParamsTooltip":function(d){return "Espera una cantidad especificada de segundos, o usa cero para esperar hasta que ocurra un clic."},
"waitTooltip":function(d){return "Espera una cantidad especificada de tiempo o hasta que ocurra un clic."},
"whenArrowDown":function(d){return "flecha hacia abajo"},
"whenArrowLeft":function(d){return "flecha izquierda"},
"whenArrowRight":function(d){return "flecha derecha"},
"whenArrowUp":function(d){return "flecha hacia arriba"},
"whenArrowTooltip":function(d){return "Ejecutar las acciones mostradas debajo, cuando se presione la tecla de flecha especificada."},
"whenDown":function(d){return "cuando la flecha apunte abajo"},
"whenDownTooltip":function(d){return "Realiza las instrucciones de abajo cuando se presiona la tecla de fecha hacia abajo."},
"whenGameStarts":function(d){return "cuando comience la historia"},
"whenGameStartsTooltip":function(d){return "Ejecuta las acciones, mostradas abajo, cuando comienza la historia."},
"whenLeft":function(d){return "Cuando la izquierda flecha"},
"whenLeftTooltip":function(d){return "Ejecuta las acciones, mostradas abajo, cuando se presiona la tecla de flecha izquierda."},
"whenRight":function(d){return "cuando la tecla flecha derecha"},
"whenRightTooltip":function(d){return "Ejecuta las acciones, mostradas debajo, cuando la tecla de flecha derecha se presiona."},
"whenSpriteClicked":function(d){return "cuando se hace clic en el actor"},
"whenSpriteClickedN":function(d){return "cuando se hace clic en el actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Ejecutar las acciones que están debajo cuando se hace clic en un actor."},
"whenSpriteCollidedN":function(d){return "cuando el actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Ejecutar las acciones que están debajo cuando un actor toca otro actor."},
"whenSpriteCollidedWith":function(d){return "toca"},
"whenSpriteCollidedWithAnyActor":function(d){return "toca cualquier actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "toca cualquier borde"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "toca cualquier proyectil"},
"whenSpriteCollidedWithAnything":function(d){return "toca cualquier cosa"},
"whenSpriteCollidedWithN":function(d){return "toca el actor "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "toca la bola de fuego azul"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "toca la bola de fuego morada"},
"whenSpriteCollidedWithRedFireball":function(d){return "toca la bola de fuego roja"},
"whenSpriteCollidedWithYellowHearts":function(d){return "toca los corazones amarillos"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "toca los corazones morados"},
"whenSpriteCollidedWithRedHearts":function(d){return "toca los corazones rojos"},
"whenSpriteCollidedWithBottomEdge":function(d){return "toca el borde inferior"},
"whenSpriteCollidedWithLeftEdge":function(d){return "toca el borde izquierdo"},
"whenSpriteCollidedWithRightEdge":function(d){return "toca el borde derecho"},
"whenSpriteCollidedWithTopEdge":function(d){return "toca el borde superior"},
"whenUp":function(d){return "Cuando flecha arriba"},
"whenUpTooltip":function(d){return "Realiza las instrucciones de abajo cuando se presiona la tecla de fecha hacia arriba."},
"yes":function(d){return "Sí"}};