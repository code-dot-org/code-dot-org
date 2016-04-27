var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "destruir bloque"},
"blockIf":function(d){return "si"},
"blockIfLavaAhead":function(d){return "si hay lava adelante"},
"blockMoveForward":function(d){return "avanzar"},
"blockPlaceTorch":function(d){return "colocar antorcha"},
"blockPlaceXAheadAhead":function(d){return "adelante"},
"blockPlaceXAheadPlace":function(d){return "colocar"},
"blockPlaceXPlace":function(d){return "colocar"},
"blockPlantCrop":function(d){return "plantar cultivo"},
"blockShear":function(d){return "tijeras"},
"blockTillSoil":function(d){return "labrar el suelo"},
"blockTurnLeft":function(d){return "girar a la izquierda"},
"blockTurnRight":function(d){return "girar a la derecha"},
"blockTypeBedrock":function(d){return "lecho de roca"},
"blockTypeBricks":function(d){return "ladrillos"},
"blockTypeClay":function(d){return "arcilla"},
"blockTypeClayHardened":function(d){return "arcilla endurecida"},
"blockTypeCobblestone":function(d){return "guijarro"},
"blockTypeDirt":function(d){return "tierra"},
"blockTypeDirtCoarse":function(d){return "tierra vasta"},
"blockTypeEmpty":function(d){return "vacío"},
"blockTypeFarmlandWet":function(d){return "tierra de cultivo"},
"blockTypeGlass":function(d){return "vidrio"},
"blockTypeGrass":function(d){return "hierba"},
"blockTypeGravel":function(d){return "gravilla"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "leño de acacia"},
"blockTypeLogBirch":function(d){return "leño de abedul"},
"blockTypeLogJungle":function(d){return "leño de la jungla"},
"blockTypeLogOak":function(d){return "leño de roble"},
"blockTypeLogSpruce":function(d){return "leño de abeto"},
"blockTypeOreCoal":function(d){return "mineral de carbón"},
"blockTypeOreDiamond":function(d){return "mineral de diamante"},
"blockTypeOreEmerald":function(d){return "mineral de esmeralda"},
"blockTypeOreGold":function(d){return "mineral de oro"},
"blockTypeOreIron":function(d){return "mineral de hierro"},
"blockTypeOreLapis":function(d){return "mineral de lapislázuli"},
"blockTypeOreRedstone":function(d){return "mineral de piedra rojiza"},
"blockTypePlanksAcacia":function(d){return "tablón de acacia"},
"blockTypePlanksBirch":function(d){return "tablón de abedul"},
"blockTypePlanksJungle":function(d){return "tablón de la jungla"},
"blockTypePlanksOak":function(d){return "tablón de roble"},
"blockTypePlanksSpruce":function(d){return "tablón de abeto"},
"blockTypeRail":function(d){return "riel"},
"blockTypeSand":function(d){return "arena"},
"blockTypeSandstone":function(d){return "arenisca"},
"blockTypeStone":function(d){return "piedra"},
"blockTypeTnt":function(d){return "dinamita"},
"blockTypeTree":function(d){return "árbol"},
"blockTypeWater":function(d){return "agua"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "adelante"},
"blockWhileXAheadDo":function(d){return "haz"},
"blockWhileXAheadWhile":function(d){return "mientras"},
"generatedCodeDescription":function(d){return "Al arrastrar y colocar los bloques, creaste un conjunto de instrucciones en un idioma informático llamado Javascript. Este código les indica a las computadoras qué mostrar en pantalla. Todo lo que ves y haces en Minecraft comienza con líneas de código como estas."},
"houseSelectChooseFloorPlan":function(d){return "Elige el plano del piso de tu casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Construyamos una casa."},
"houseSelectMedium":function(d){return "Medio"},
"keepPlayingButton":function(d){return "Seguir jugando"},
"level10FailureMessage":function(d){return "Cubre la lava para caminar sobre ella, luego mina dos de los bloques de hierro del otro lado."},
"level11FailureMessage":function(d){return "Asegúrate de ubicar guijarros si hay lava adelante. Te permitirá minar esta línea de recursos sin sufrir daño."},
"level12FailureMessage":function(d){return "Asegúrate de minar 3 bloques de piedra rojiza. Esto combina lo que aprendiste construyendo tu casa y usando declaraciones condicionales (con \"si\") para evitar caer en la lava."},
"level13FailureMessage":function(d){return "Ubica \"riel\" a lo largo del camino de tierra que va desde tu puerta hasta el límite del mapa."},
"level1FailureMessage":function(d){return "Debes usar comandos para caminar hacia las ovejas."},
"level1TooFewBlocksMessage":function(d){return "Intenta usar más comandos para caminar hacia las ovejas."},
"level2FailureMessage":function(d){return "Para talar un árbol, camina hacia el tronco y usa el comando \"destruir bloque\""},
"level2TooFewBlocksMessage":function(d){return "Intenta usar más comandos para talar el árbol. Camina hacia el tronco y usa el comando \"destruir bloque\"."},
"level3FailureMessage":function(d){return "Para obtener lana de las dos ovejas, camina hacia cada una y usa el comando \"tijeras\". Recuerda usar comandos de giro para llegar hasta las ovejas."},
"level3TooFewBlocksMessage":function(d){return "Intenta usar más comandos para obtener lana de las ovejas. Camina hacia cada una de ellas y usa el comando \"tijeras\"."},
"level4FailureMessage":function(d){return "Debes usar el comando \"destruir bloque\" en cada uno de los tres de troncos de árboles."},
"level5FailureMessage":function(d){return "Ubica los bloques en el contorno de tierra para construir una pared. El comando rosado \"repetir\" ejecutará los comandos que tiene adentro, como \"colocar bloque\" e \"ir hacia adelante\"."},
"level6FailureMessage":function(d){return "Ubica bloques en el contorno de tierra para completar el puzle."},
"level7FailureMessage":function(d){return "Usa el comando \"plantar\" para colocar cultivos en cada parche de suelo labrado oscuro."},
"level8FailureMessage":function(d){return "Si tocas un creeper, explotará. Escapa de ellos y entra en tu casa."},
"level9FailureMessage":function(d){return "No te olvides de colocar al menos 2 antorchas para iluminar el camino ni de minar al menos 2 carbones."},
"minecraftBlock":function(d){return "bloque"},
"nextLevelMsg":function(d){return "¡Puzle "+craft_locale.v(d,"puzzleNumber")+" completo! ¡Felicitaciones!"},
"playerSelectChooseCharacter":function(d){return "Elige un personaje."},
"playerSelectChooseSelectButton":function(d){return "Seleccionar"},
"playerSelectLetsGetStarted":function(d){return "Comencemos."},
"reinfFeedbackMsg":function(d){return "Puedes pulsar \"Seguir jugando\" para volver al juego. "},
"replayButton":function(d){return "Repetición"},
"selectChooseButton":function(d){return "Seleccionar"},
"tooManyBlocksFail":function(d){return "¡Puzle "+craft_locale.v(d,"puzzleNumber")+" completo! ¡Felicitaciones! También puedes completarlo con "+craft_locale.p(d,"numBlocks",0,"es",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};