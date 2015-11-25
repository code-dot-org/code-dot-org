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
"blockPlantCrop":function(d){return "sembrar planta"},
"blockShear":function(d){return "esquilar"},
"blockTillSoil":function(d){return "Hasta el suelo"},
"blockTurnLeft":function(d){return "girar a la izquierda"},
"blockTurnRight":function(d){return "girar a la derecha"},
"blockTypeBedrock":function(d){return "Piedra base"},
"blockTypeBricks":function(d){return "ladrillo"},
"blockTypeClay":function(d){return "arcilla"},
"blockTypeClayHardened":function(d){return "Arcilla endurecida (ladrillo)"},
"blockTypeCobblestone":function(d){return "guijarro"},
"blockTypeDirt":function(d){return "Tierra"},
"blockTypeDirtCoarse":function(d){return "tierra gruesa"},
"blockTypeEmpty":function(d){return "vacío"},
"blockTypeFarmlandWet":function(d){return "tierra de cultivo"},
"blockTypeGlass":function(d){return "vidrio"},
"blockTypeGrass":function(d){return "pasto"},
"blockTypeGravel":function(d){return "grava"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "madera de Acacia"},
"blockTypeLogBirch":function(d){return "madera de abedul"},
"blockTypeLogJungle":function(d){return "madera de selva"},
"blockTypeLogOak":function(d){return "madera de roble"},
"blockTypeLogSpruce":function(d){return "madera de abeto"},
"blockTypeOreCoal":function(d){return "carbón"},
"blockTypeOreDiamond":function(d){return "diamante"},
"blockTypeOreEmerald":function(d){return "esmeralda"},
"blockTypeOreGold":function(d){return "oro"},
"blockTypeOreIron":function(d){return "hierro"},
"blockTypeOreLapis":function(d){return "lapislázuli"},
"blockTypeOreRedstone":function(d){return "redstone"},
"blockTypePlanksAcacia":function(d){return "tablas de acacia"},
"blockTypePlanksBirch":function(d){return "tablas de abedul"},
"blockTypePlanksJungle":function(d){return "madera pulida de selva"},
"blockTypePlanksOak":function(d){return "tablas de roble"},
"blockTypePlanksSpruce":function(d){return "tablas de abeto"},
"blockTypeRail":function(d){return "riel"},
"blockTypeSand":function(d){return "arena"},
"blockTypeSandstone":function(d){return "ladrillo de arenisca"},
"blockTypeStone":function(d){return "piedra"},
"blockTypeTnt":function(d){return "dinamita"},
"blockTypeTree":function(d){return "árbol"},
"blockTypeWater":function(d){return "agua"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "adelante"},
"blockWhileXAheadDo":function(d){return "haz"},
"blockWhileXAheadWhile":function(d){return "mientras"},
"generatedCodeDescription":function(d){return "Arrastrando y colocando bloques en este desafío, Has logrado crear un conjunto de instrucciones en un lenguaje de programación llamado JavaScript. Éste código le dice a los ordenadores lo que deben mostrar en pantalla. Todo lo que ves y haces en Minecraft comienza con líneas de código como estas."},
"houseSelectChooseFloorPlan":function(d){return "Escoge el plano de tu casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Vamos a construir una casa."},
"houseSelectMedium":function(d){return "Medio"},
"keepPlayingButton":function(d){return "Seguir Jugando"},
"level10FailureMessage":function(d){return "Cubre la lava para pasar sobre ella, luego obtén dos de los bloques de hierro al otro lado."},
"level11FailureMessage":function(d){return "Asegúrate de colocar adoquines delante tuyo si hay lava. Esto te permitirá llegar de forma segura a conseguir los recursos de la mina."},
"level12FailureMessage":function(d){return "Asegúrate de conseguir 3 bloques de redstone. Esto combina lo que aprendiste para construir tu casa y las sentencias \"si\" para evitar caer en la lava."},
"level13FailureMessage":function(d){return "Ubica rieles a lo largo del camino de tierra desde la puerta de tu casa hasta el borde del mapa."},
"level1FailureMessage":function(d){return "Necesitas utilizar los comandos para caminar hasta la oveja."},
"level1TooFewBlocksMessage":function(d){return "Trata de usar más comandos para caminar hasta la oveja."},
"level2FailureMessage":function(d){return "Para talar un árbol, camina hasta el tronco del mismo y usa el bloque \"destruir\"."},
"level2TooFewBlocksMessage":function(d){return "Trata de usar más comandos para talar el árbol. Camina hasta el tronco y usa el bloque \"destruir\"."},
"level3FailureMessage":function(d){return "Para obtener la lana de los dos corderos, camina hasta cada uno de ellos y usa el comando \"esquilar\". Recuerda usar el comando girar para llegar a la oveja."},
"level3TooFewBlocksMessage":function(d){return "Intenta usar más comandos para recoger la lana de ambas ovejas. Camina hasta cada una de ellas y usa el comando \"esquilar\"."},
"level4FailureMessage":function(d){return "Debes usar el comando \"destruir bloque\" en el tronco de cada uno de los tres árboles."},
"level5FailureMessage":function(d){return "Coloca tus bloques en el contorno de la tierra para construir un muro. El comando \"repetir\" de color de rosa ejecutará comandos colocados en su interior, como \"coloca el bloque\" y \"avanza\"."},
"level6FailureMessage":function(d){return "Coloca los bloques en el contorno de la tierra de la casa para completar el rompecabezas."},
"level7FailureMessage":function(d){return "Utiliza el comando \"planta\" para colocar los cultivos en cada parcela oscura del suelo labrado."},
"level8FailureMessage":function(d){return "Si toca un Creeper va a explotar. Serpentea alrededor de ellos y entra a tu casa."},
"level9FailureMessage":function(d){return "No olvides colocar al menos 2 antorchas para iluminar tu camino y pica al menos 2 carbones."},
"minecraftBlock":function(d){return "bloque"},
"nextLevelMsg":function(d){return "Desafío "+craft_locale.v(d,"puzzleNumber")+" completado. ¡ Felicidades!"},
"playerSelectChooseCharacter":function(d){return "Selecciona tu personaje"},
"playerSelectChooseSelectButton":function(d){return "Selecionar"},
"playerSelectLetsGetStarted":function(d){return "Vamos a empezar"},
"reinfFeedbackMsg":function(d){return "Puedes presionar \"Seguir Jugando\" para volver al juego."},
"replayButton":function(d){return "Volver a reproducior"},
"selectChooseButton":function(d){return "Selecionar"},
"tooManyBlocksFail":function(d){return "Desafío "+craft_locale.v(d,"puzzleNumber")+" completado. ¡Felicidades! También es posible completarlo con "+craft_locale.p(d,"numBlocks",0,"es",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};