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
"blockDestroyBlock":function(d){return "destruir bloco"},
"blockIf":function(d){return "se"},
"blockIfLavaAhead":function(d){return "se lava à frente"},
"blockMoveForward":function(d){return "mover para a frente"},
"blockPlaceTorch":function(d){return "colocar tocha"},
"blockPlaceXAheadAhead":function(d){return "à frente"},
"blockPlaceXAheadPlace":function(d){return "colocar"},
"blockPlaceXPlace":function(d){return "colocar"},
"blockPlantCrop":function(d){return "colher planta"},
"blockShear":function(d){return "tosquiar"},
"blockTillSoil":function(d){return "até ao solo"},
"blockTurnLeft":function(d){return "virar à esquerda"},
"blockTurnRight":function(d){return "virar à direita"},
"blockTypeBedrock":function(d){return "rocha-mãe"},
"blockTypeBricks":function(d){return "tijolos"},
"blockTypeClay":function(d){return "argila"},
"blockTypeClayHardened":function(d){return "argila endurecida"},
"blockTypeCobblestone":function(d){return "pedra"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "terra grossa"},
"blockTypeEmpty":function(d){return "vazio"},
"blockTypeFarmlandWet":function(d){return "terra arada"},
"blockTypeGlass":function(d){return "vidro"},
"blockTypeGrass":function(d){return "vidro"},
"blockTypeGravel":function(d){return "cascalho"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "tronco de acácia"},
"blockTypeLogBirch":function(d){return "tronco de bétula"},
"blockTypeLogJungle":function(d){return "tronco de selva"},
"blockTypeLogOak":function(d){return "tronco de carvalho"},
"blockTypeLogSpruce":function(d){return "tronco de abeto"},
"blockTypeOreCoal":function(d){return "minério de carvão"},
"blockTypeOreDiamond":function(d){return "minério de diamante"},
"blockTypeOreEmerald":function(d){return "minério de esmeralda"},
"blockTypeOreGold":function(d){return "minério de ouro"},
"blockTypeOreIron":function(d){return "minério de ferro"},
"blockTypeOreLapis":function(d){return "minério de lápis lazuli"},
"blockTypeOreRedstone":function(d){return "minério de redstone"},
"blockTypePlanksAcacia":function(d){return "tábuas de acácia"},
"blockTypePlanksBirch":function(d){return "tábuas de bétula"},
"blockTypePlanksJungle":function(d){return "tábuas da selva"},
"blockTypePlanksOak":function(d){return "tábuas de carvalho"},
"blockTypePlanksSpruce":function(d){return "tábuas de abeto"},
"blockTypeRail":function(d){return "trilho"},
"blockTypeSand":function(d){return "areia"},
"blockTypeSandstone":function(d){return "arenito"},
"blockTypeStone":function(d){return "pedra"},
"blockTypeTnt":function(d){return "dinamite"},
"blockTypeTree":function(d){return "árvore"},
"blockTypeWater":function(d){return "água"},
"blockTypeWool":function(d){return "lã"},
"blockWhileXAheadAhead":function(d){return "à frente"},
"blockWhileXAheadDo":function(d){return "fazer"},
"blockWhileXAheadWhile":function(d){return "enquanto"},
"generatedCodeDescription":function(d){return "Arrastando e colocando blocos neste quebra-cabeça, crias-te um conjunto de instruções numa linguagem de programação chamada Javascript. Este código diz aos computadores o que exibir no ecran. Tudo o que vês e fazes no Minecraft também começa com linhas de código de computador, como estas."},
"houseSelectChooseFloorPlan":function(d){return "Escolha a planta para a sua casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Vamos construir uma casa."},
"houseSelectMedium":function(d){return "Médio"},
"keepPlayingButton":function(d){return "Continue jogando"},
"level10FailureMessage":function(d){return "Tape a lava para poder atravessar e, em seguida, minere dois blocos de ferro do outro lado."},
"level11FailureMessage":function(d){return "Certifique-se de colocar pedra, se existir lava à frente. Isso vai te deixar seguro para poder mineirar."},
"level12FailureMessage":function(d){return "Certifique-se de minar ao menos 3 blocos de redstone. Isso combina o que você aprendeu de construir a sua casa e usando o comando \"se\" para não cair na lava."},
"level13FailureMessage":function(d){return "Coloque o \"trilho\" ao longo do caminho de terra, coloque-o desde sua porta até borda do mapa."},
"level1FailureMessage":function(d){return "Você precisa usar comandos para caminhar até a ovelha."},
"level1TooFewBlocksMessage":function(d){return "Tente usar mais comandos para caminhar até a ovelha."},
"level2FailureMessage":function(d){return "Para cortar uma árvore, vá até ela e use o comando \"destruir bloco\"."},
"level2TooFewBlocksMessage":function(d){return "Tente usar mais comandos para cortar a árvore. Caminhe até ao tronco e use o comando \"destruir bloco\"."},
"level3FailureMessage":function(d){return "Para conseguir a lã de ambas as ovelhas, vá até cada uma e use o comando \"cortar\". Lembre-se de usar os comandos de virar para alcançar as ovelhas."},
"level3TooFewBlocksMessage":function(d){return "Tente usar mais comandos para conseguir a lã de ambas as ovelhas. ande até cada uma e use o comando \"cortar\"."},
"level4FailureMessage":function(d){return "Você deve usar o comando \"destruir bloco\" em cada um dos três troncos."},
"level5FailureMessage":function(d){return "Coloque seus blocos no contorno de terra para construir uma parede. O comando cor-de-rosa \"repetir\" vai executar comandos repetidamente colocados dentro dele, como \"colocar bloco\" e \"andar para frente\"."},
"level6FailureMessage":function(d){return "Coloque blocos no contorno de terra de sua casa para completar o desafio."},
"level7FailureMessage":function(d){return "Use o comando \"plantar\" para colocar plantas em cada pedaço do solo cultivado escuro."},
"level8FailureMessage":function(d){return "Se você tocar em um Creeper ele vai explodir. Desvia movendo-se em torno deles para entrar em sua casa."},
"level9FailureMessage":function(d){return "Não se esqueça de colocar pelo menos 2 tochas para iluminar o seu caminho e minerar pelo menos 2 de carvão."},
"minecraftBlock":function(d){return "bloco"},
"nextLevelMsg":function(d){return "Quebra-cabeça concluído. Parabéns!"},
"playerSelectChooseCharacter":function(d){return "Escolha seu personagem."},
"playerSelectChooseSelectButton":function(d){return "Selecione"},
"playerSelectLetsGetStarted":function(d){return "Vamos começar."},
"reinfFeedbackMsg":function(d){return "Você pode pressionar \"Continuar\" para voltar a sua jogada."},
"replayButton":function(d){return "Repetir"},
"selectChooseButton":function(d){return "Selecione"},
"tooManyBlocksFail":function(d){return "Desafio "+craft_locale.v(d,"puzzleNumber")+" concluído. Parabéns! Também é possível concluí-lo com "+craft_locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":craft_locale.n(d,"numBlocks")+" blocos"})+"."}};