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
"blockIfLavaAhead":function(d){return "se houver lava à frente"},
"blockMoveForward":function(d){return "mover para a frente"},
"blockPlaceTorch":function(d){return "colocar tocha"},
"blockPlaceXAheadAhead":function(d){return "à frente"},
"blockPlaceXAheadPlace":function(d){return "colocar"},
"blockPlaceXPlace":function(d){return "colocar"},
"blockPlantCrop":function(d){return "plantar plantação"},
"blockShear":function(d){return "tosquiar"},
"blockTillSoil":function(d){return "arar terreno"},
"blockTurnLeft":function(d){return "virar à esquerda"},
"blockTurnRight":function(d){return "virar à direita"},
"blockTypeBedrock":function(d){return "rocha-mãe"},
"blockTypeBricks":function(d){return "tijolos"},
"blockTypeClay":function(d){return "barro"},
"blockTypeClayHardened":function(d){return "barro endurecido"},
"blockTypeCobblestone":function(d){return "empedrado"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "terra infértil"},
"blockTypeEmpty":function(d){return "vazio"},
"blockTypeFarmlandWet":function(d){return "terra arada"},
"blockTypeGlass":function(d){return "vidro"},
"blockTypeGrass":function(d){return "relva"},
"blockTypeGravel":function(d){return "gravilha"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "tronco de acácia"},
"blockTypeLogBirch":function(d){return "tronco de bétula"},
"blockTypeLogJungle":function(d){return "tronco de madeira da selva"},
"blockTypeLogOak":function(d){return "tronco de carvalho"},
"blockTypeLogSpruce":function(d){return "tronco de abeto"},
"blockTypeOreCoal":function(d){return "minério de carvão"},
"blockTypeOreDiamond":function(d){return "minério de diamante"},
"blockTypeOreEmerald":function(d){return "minério de esmeralda"},
"blockTypeOreGold":function(d){return "minério de ouro"},
"blockTypeOreIron":function(d){return "minério de ferro"},
"blockTypeOreLapis":function(d){return "minério de lápis-lazúli"},
"blockTypeOreRedstone":function(d){return "minério de redstone"},
"blockTypePlanksAcacia":function(d){return "pranchas de acácia"},
"blockTypePlanksBirch":function(d){return "pranchas de bétula"},
"blockTypePlanksJungle":function(d){return "pranchas de madeira da selva"},
"blockTypePlanksOak":function(d){return "pranchas de carvalho"},
"blockTypePlanksSpruce":function(d){return "pranchas de abeto"},
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
"generatedCodeDescription":function(d){return "Ao arrastares e colocares blocos neste quebra-cabeças, criaste um conjunto de instruções numa linguagem de programação chamada Javascript. Esta linguagem diz aos computadores o que devem apresentar no ecrã. Tudo o que vires e fizeres em Minecraft começa também com linhas de programação como estas."},
"houseSelectChooseFloorPlan":function(d){return "Escolhe a planta da tua casa."},
"houseSelectEasy":function(d){return "Fácil"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Vamos construir uma casa."},
"houseSelectMedium":function(d){return "Intermédio"},
"keepPlayingButton":function(d){return "Continuar a Jogar"},
"level10FailureMessage":function(d){return "Tapa a lava para poderes atravessar, e depois escava dois blocos de ferro no outro lado."},
"level11FailureMessage":function(d){return "Certifica-te de que colocas empedrado à frente se houver lava. Isto vai permitir-te escavar esta fieira de recursos em segurança."},
"level12FailureMessage":function(d){return "Certifica-te de que escavas 3 blocos de redstone. Isto combina o que aprendeste a construir a tua casa e a usar declarações de \"se\" para evitares cair na lava."},
"level13FailureMessage":function(d){return "Coloca \"carril\" ao longo do caminho de terra que vai da tua porta à orla do mapa."},
"level1FailureMessage":function(d){return "Tens de utilizar comandos para caminhar até às ovelhas."},
"level1TooFewBlocksMessage":function(d){return "Tenta utilizar mais comandos para caminhar até às ovelhas."},
"level2FailureMessage":function(d){return "Para abateres uma árvore, caminha até ao seu tronco e utiliza o comando \"destruir bloco\"."},
"level2TooFewBlocksMessage":function(d){return "Tenta utilizar mais comandos para abateres a árvore. Caminha até ao seu tronco e utiliza o comando \"destruir bloco\"."},
"level3FailureMessage":function(d){return "Para recolheres lã das duas ovelhas, caminha até cada uma delas e utiliza o comando \"tosquiar\". Lembra-te de utilizar os comandos de virar para alcançares as ovelhas."},
"level3TooFewBlocksMessage":function(d){return "Tenta utilizar mais comandos para recolheres lã das duas ovelhas. Caminha até cada uma delas e utiliza o comando \"tosquiar\"."},
"level4FailureMessage":function(d){return "Tens de utilizar o comando \"destruir bloco\" em cada um dos três troncos de árvore."},
"level5FailureMessage":function(d){return "Coloca os teus blocos no contorno da terra para construíres uma parede. O comando cor-de-rosa \"repetir\" vai fazer correr os comandos colocados dentro dele, como \"colocar bloco\" e \"mover para a frente\"."},
"level6FailureMessage":function(d){return "Coloca blocos no contorno da terra da casa para concluíres o quebra-cabeças."},
"level7FailureMessage":function(d){return "Utiliza o comando \"plantar\" para colocares plantações em cada pedaço de terreno escuro arado."},
"level8FailureMessage":function(d){return "Se tocares num creeper, este explode. Esgueira-te deles e entra na tua casa."},
"level9FailureMessage":function(d){return "Não te esqueças de colocar pelo menos 2 tochas para iluminares o teu caminho e escava pelo menos 2 carvões."},
"minecraftBlock":function(d){return "bloco"},
"nextLevelMsg":function(d){return "Quebra-cabeças "+craft_locale.v(d,"puzzleNumber")+" concluído. Parabéns!"},
"playerSelectChooseCharacter":function(d){return "Escolhe a tua personagem."},
"playerSelectChooseSelectButton":function(d){return "Selecione"},
"playerSelectLetsGetStarted":function(d){return "Vamos começar."},
"reinfFeedbackMsg":function(d){return "Podes premir \"continuar a jogar\" para voltares a jogar o teu jogo."},
"replayButton":function(d){return "Repetir"},
"selectChooseButton":function(d){return "Selecione"},
"tooManyBlocksFail":function(d){return "Quebra-cabeças "+craft_locale.v(d,"puzzleNumber")+" concluído. Parabéns! Também é possível concluí-lo com "+craft_locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":craft_locale.n(d,"numBlocks")+" blocos"})+"."}};