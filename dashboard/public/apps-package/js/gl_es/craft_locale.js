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
"blockDestroyBlock":function(d){return "destrúa o bloque"},
"blockIf":function(d){return "se"},
"blockIfLavaAhead":function(d){return "se lava diante"},
"blockMoveForward":function(d){return "avance"},
"blockPlaceTorch":function(d){return "coloque a antorcha"},
"blockPlaceXAheadAhead":function(d){return "diante"},
"blockPlaceXAheadPlace":function(d){return "colocar"},
"blockPlaceXPlace":function(d){return "colocar"},
"blockPlantCrop":function(d){return "plantar"},
"blockShear":function(d){return "tosquiar"},
"blockTillSoil":function(d){return "arar o solo"},
"blockTurnLeft":function(d){return "vire á esquerda"},
"blockTurnRight":function(d){return "vire á dereita"},
"blockTypeBedrock":function(d){return "rocha matriz"},
"blockTypeBricks":function(d){return "ladrillos"},
"blockTypeClay":function(d){return "arxila"},
"blockTypeClayHardened":function(d){return "arxila endurecida"},
"blockTypeCobblestone":function(d){return "pedregullo"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "terra gorda"},
"blockTypeEmpty":function(d){return "baleiro"},
"blockTypeFarmlandWet":function(d){return "terra arada"},
"blockTypeGlass":function(d){return "vidro"},
"blockTypeGrass":function(d){return "herba"},
"blockTypeGravel":function(d){return "cascallo"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "madeira de acacia"},
"blockTypeLogBirch":function(d){return "madeira de eucalipto"},
"blockTypeLogJungle":function(d){return "madeira da selva"},
"blockTypeLogOak":function(d){return "madeira de carballo"},
"blockTypeLogSpruce":function(d){return "madeira de piñeiro"},
"blockTypeOreCoal":function(d){return "mineral de carbón"},
"blockTypeOreDiamond":function(d){return "mineral de diamante"},
"blockTypeOreEmerald":function(d){return "mineral de esmeralda"},
"blockTypeOreGold":function(d){return "mineral de ouro"},
"blockTypeOreIron":function(d){return "mineral de ferro"},
"blockTypeOreLapis":function(d){return "mineral de lapis-lazuli"},
"blockTypeOreRedstone":function(d){return "mineral de pedra vermella"},
"blockTypePlanksAcacia":function(d){return "táboas de acacia"},
"blockTypePlanksBirch":function(d){return "táboas de eucalipto"},
"blockTypePlanksJungle":function(d){return "táboas da selva"},
"blockTypePlanksOak":function(d){return "táboas de carballo"},
"blockTypePlanksSpruce":function(d){return "táboas de piñeiro"},
"blockTypeRail":function(d){return "raíl"},
"blockTypeSand":function(d){return "area"},
"blockTypeSandstone":function(d){return "areniña"},
"blockTypeStone":function(d){return "pedra"},
"blockTypeTnt":function(d){return "dinamita"},
"blockTypeTree":function(d){return "árbore"},
"blockTypeWater":function(d){return "auga"},
"blockTypeWool":function(d){return "lá"},
"blockWhileXAheadAhead":function(d){return "diante"},
"blockWhileXAheadDo":function(d){return "faga"},
"blockWhileXAheadWhile":function(d){return "mentras"},
"generatedCodeDescription":function(d){return "Ao arrastrar e colocar os bloques neste quebra-cabezas, creou unha serie de instrucións nunha linguaxe de programación chamada Javascript. Este código di aos computadores o que exhibir na pantalla. Todo o que ve ou fai no Minecraft tamén comeza com liñas de código como esta."},
"houseSelectChooseFloorPlan":function(d){return "Escolla a planta da súa casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Imos construír unha casa."},
"houseSelectMedium":function(d){return "Medio"},
"keepPlayingButton":function(d){return "Continuar xogando"},
"level10FailureMessage":function(d){return "Cubra a lava para poder atravesar e, de seguida, extraia dous bloques de ferro do outro lado."},
"level11FailureMessage":function(d){return "Lémbrese de colocar pedregullos diante se houbese lava no camiño. Iso permitirá que extraia esta fila de recursos con seguridade."},
"level12FailureMessage":function(d){return "Lémbrese de extraer 3 bloques de pedra vermella. Isto combina o que aprendeu ao construír a súa casa e usar comandos \"se\" para evitar caer na lava."},
"level13FailureMessage":function(d){return "Coloque \"raíl\" ao longo do camiño de terra que vai da súa porta até a beira do mapa."},
"level1FailureMessage":function(d){return "Debe usar comandos para andar até a ovella."},
"level1TooFewBlocksMessage":function(d){return "Tente usar máis comandos para andar até a ovella."},
"level2FailureMessage":function(d){return "Para derrubar unha árbore, ande até o seu tronco e use o comando \"destruír bloque\"."},
"level2TooFewBlocksMessage":function(d){return "Tente usar máis comandos para derrubar a árbore. Ande até o tronco e use o comando \"destruír bloque\"."},
"level3FailureMessage":function(d){return "Para obter a lá das dúas ovellas, ande até cada unha e use o comando \"tosquiar\". Lémbrese de usar os comandos para virar para chegar até a ovella."},
"level3TooFewBlocksMessage":function(d){return "Tente usar máis comandos para obter a lá das dúas ovellas. Ande até cada unha e use o comando \"tosquiar\"."},
"level4FailureMessage":function(d){return "Debe usar o comando \"destrúa o bloque\" en cada un dos tres troncos de árbore."},
"level5FailureMessage":function(d){return "Coloque os seus bloques no contorno de terra para construír unha parede. O comando \"repetir\" en rosa executará os comandos colocados dentro del como \"colocar bloque\" e \"andar adiante\"."},
"level6FailureMessage":function(d){return "Coloque os bloques no contorno de terra da casa para concluír o quebra-cabezas."},
"level7FailureMessage":function(d){return "Use o comando \"plantar\" para colocar plantas en cada espazo de terra arada escura."},
"level8FailureMessage":function(d){return "Se toca nun creeper explotará. Evíteos e entre na súa casa."},
"level9FailureMessage":function(d){return "Non esqueza colocar polo menos 2 antorchas para iluminar o camiño E extraer polo menos 2 carbóns."},
"minecraftBlock":function(d){return "bloque"},
"nextLevelMsg":function(d){return "Quebra-cabezas "+craft_locale.v(d,"puzzleNumber")+" concluído. Parabéns!"},
"playerSelectChooseCharacter":function(d){return "Escolla o seu personaxe."},
"playerSelectChooseSelectButton":function(d){return "Seleccione"},
"playerSelectLetsGetStarted":function(d){return "Imos comezar."},
"reinfFeedbackMsg":function(d){return "Pode presionar \"Continuar xogando\" para voltar a xogar o seu jogo."},
"replayButton":function(d){return "Xogar novamente"},
"selectChooseButton":function(d){return "Seleccione"},
"tooManyBlocksFail":function(d){return "Desafío "+craft_locale.v(d,"puzzleNumber")+" concluído. Parabéns! Tamé é posíbel concluílo con "+craft_locale.p(d,"numBlocks",0,"gl",{"one":"1 bloque","other":craft_locale.n(d,"numBlocks")+" bloques"})+"."}};