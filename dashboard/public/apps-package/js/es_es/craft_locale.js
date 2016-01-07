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
"blockIfLavaAhead":function(d){return "si lava delante"},
"blockMoveForward":function(d){return "avanzar"},
"blockPlaceTorch":function(d){return "colocar antorcha"},
"blockPlaceXAheadAhead":function(d){return "delante"},
"blockPlaceXAheadPlace":function(d){return "colocar"},
"blockPlaceXPlace":function(d){return "colocar"},
"blockPlantCrop":function(d){return "plantar cultivo"},
"blockShear":function(d){return "trasquilar"},
"blockTillSoil":function(d){return "labrar suelo"},
"blockTurnLeft":function(d){return "girar a la izquierda"},
"blockTurnRight":function(d){return "girar a la derecha"},
"blockTypeBedrock":function(d){return "piedra base"},
"blockTypeBricks":function(d){return "ladrillos"},
"blockTypeClay":function(d){return "arcilla"},
"blockTypeClayHardened":function(d){return "arcilla endurecida"},
"blockTypeCobblestone":function(d){return "roca"},
"blockTypeDirt":function(d){return "Tierra"},
"blockTypeDirtCoarse":function(d){return "tierra basta"},
"blockTypeEmpty":function(d){return "vacío"},
"blockTypeFarmlandWet":function(d){return "tierra de cultivo"},
"blockTypeGlass":function(d){return "cristal"},
"blockTypeGrass":function(d){return "hierba"},
"blockTypeGravel":function(d){return "grava"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "tronco de acacia"},
"blockTypeLogBirch":function(d){return "tronco de abedul"},
"blockTypeLogJungle":function(d){return "tronco de jungla"},
"blockTypeLogOak":function(d){return "tronco de roble"},
"blockTypeLogSpruce":function(d){return "tronco de abeto"},
"blockTypeOreCoal":function(d){return "mena de carbón"},
"blockTypeOreDiamond":function(d){return "mena de diamante"},
"blockTypeOreEmerald":function(d){return "mineral de esmeralda"},
"blockTypeOreGold":function(d){return "mineral de oro"},
"blockTypeOreIron":function(d){return "mineral de hierro"},
"blockTypeOreLapis":function(d){return "mineral de lapislázuli"},
"blockTypeOreRedstone":function(d){return "mena de redstone"},
"blockTypePlanksAcacia":function(d){return "tablones de acacia"},
"blockTypePlanksBirch":function(d){return "tablones de abedul"},
"blockTypePlanksJungle":function(d){return "tablones de jungla"},
"blockTypePlanksOak":function(d){return "tablones de roble"},
"blockTypePlanksSpruce":function(d){return "tablones de abeto"},
"blockTypeRail":function(d){return "raíl"},
"blockTypeSand":function(d){return "arena"},
"blockTypeSandstone":function(d){return "arenisca"},
"blockTypeStone":function(d){return "piedra"},
"blockTypeTnt":function(d){return "dinamita"},
"blockTypeTree":function(d){return "árbol"},
"blockTypeWater":function(d){return "agua"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "delante"},
"blockWhileXAheadDo":function(d){return "haz"},
"blockWhileXAheadWhile":function(d){return "mientras"},
"generatedCodeDescription":function(d){return "Al colocar los bloques de este rompecabezas, has creado una serie de instrucciones en un lenguaje informático llamado JavaScript. Este código le dice al ordenador lo que debe mostrar en la pantalla. Todo cuanto haces y ves en Minecraft comienza por líneas de código de ordenador como estas."},
"houseSelectChooseFloorPlan":function(d){return "Elige un plano para la planta de tu casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Vamos a construir una casa."},
"houseSelectMedium":function(d){return "Media"},
"keepPlayingButton":function(d){return "Seguir jugando"},
"level10FailureMessage":function(d){return "Cubre la lava para cruzar y luego extrae dos de los bloques de hierro del otro lado."},
"level11FailureMessage":function(d){return "Asegúrate de colocar rocas delante si hay lava. Esto te permitirá extraer esta hilera de recursos sin peligro."},
"level12FailureMessage":function(d){return "No te olvides de extraer 3 bloques de redstone. Combina lo que has aprendido construyendo tu casa y el uso de sentencias \"si\" para no caer en la lava."},
"level13FailureMessage":function(d){return "Coloca \"raíl\" a lo largo del camino de tierra que va de tu puerta al borde del mapa."},
"level1FailureMessage":function(d){return "Debes usar comandos para caminar hasta la oveja."},
"level1TooFewBlocksMessage":function(d){return "Prueba a usar más comandos para caminar hasta la oveja."},
"level2FailureMessage":function(d){return "Para talar un árbol, acércate al tronco y usa el comando \"destruir bloque\"."},
"level2TooFewBlocksMessage":function(d){return "Prueba a usar más comandos para talar el árbol. Acércate al tronco y usa el comando \"destruir bloque\"."},
"level3FailureMessage":function(d){return "Para obtener la lana de las dos ovejas, acércate a cada una de ellas y usa el comando \"esquilar\". No te olvides de usar los comandos de giro para llegar hasta las ovejas."},
"level3TooFewBlocksMessage":function(d){return "Prueba a usar más comandos para obtener la lana de las dos ovejas. Acércate a cada una de ellas y usa el comando \"esquilar\"."},
"level4FailureMessage":function(d){return "Debes usar el comando \"destruir bloque\" en cada uno de los 3 troncos de árbol."},
"level5FailureMessage":function(d){return "Coloca los bloques en el contorno de tierra para crear un muro. El comando rosa \"repetir\" ejecutará los comandos de su interior, como \"colocar bloque\" y \"avanzar\"."},
"level6FailureMessage":function(d){return "Coloca bloques en el contorno de tierra de la casa para completar el rompecabezas."},
"level7FailureMessage":function(d){return "Usa el comando \"plantar\" para colocar cultivos en las parcelas de suelo labrado de color oscuro."},
"level8FailureMessage":function(d){return "Si tocas a un Creeper explotará. Rodéalos a hurtadillas y entra en tu casa."},
"level9FailureMessage":function(d){return "No olvides colocar al menos 2 antorchas para alumbrarte Y extraer al menos 2 de carbón."},
"minecraftBlock":function(d){return "bloque"},
"nextLevelMsg":function(d){return "Rompecabezas "+craft_locale.v(d,"puzzleNumber")+" completado. ¡Enhorabuena!"},
"playerSelectChooseCharacter":function(d){return "Elige un personaje."},
"playerSelectChooseSelectButton":function(d){return "Seleccionar"},
"playerSelectLetsGetStarted":function(d){return "Empecemos."},
"reinfFeedbackMsg":function(d){return "Puedes pulsar \"Seguir jugando\" para volver a la partida."},
"replayButton":function(d){return "Repetir"},
"selectChooseButton":function(d){return "Seleccionar"},
"tooManyBlocksFail":function(d){return "Rompecabezas "+craft_locale.v(d,"puzzleNumber")+" completado. ¡Enhorabuena! También puedes completarlo con "+craft_locale.p(d,"numBlocks",0,"es",{"one":"1 bloque","other":craft_locale.n(d,"numBlocks")+" bloques"})+"."}};