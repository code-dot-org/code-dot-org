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
"blockDestroyBlock":function(d){return "distruggi blocco"},
"blockIf":function(d){return "se"},
"blockIfLavaAhead":function(d){return "se lava davanti"},
"blockMoveForward":function(d){return "vai avanti"},
"blockPlaceTorch":function(d){return "posiziona torcia"},
"blockPlaceXAheadAhead":function(d){return "davanti"},
"blockPlaceXAheadPlace":function(d){return "posiziona"},
"blockPlaceXPlace":function(d){return "posiziona"},
"blockPlantCrop":function(d){return "pianta coltura"},
"blockShear":function(d){return "tosa"},
"blockTillSoil":function(d){return "ara terreno"},
"blockTurnLeft":function(d){return "gira a sinistra"},
"blockTurnRight":function(d){return "gira a destra"},
"blockTypeBedrock":function(d){return "substrato roccioso"},
"blockTypeBricks":function(d){return "mattoni"},
"blockTypeClay":function(d){return "argilla"},
"blockTypeClayHardened":function(d){return "argilla indurita"},
"blockTypeCobblestone":function(d){return "lastra di pietra"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "terra grezza"},
"blockTypeEmpty":function(d){return "vuoto"},
"blockTypeFarmlandWet":function(d){return "zolla"},
"blockTypeGlass":function(d){return "vetro"},
"blockTypeGrass":function(d){return "erba"},
"blockTypeGravel":function(d){return "ghiaia"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "legno di acacia"},
"blockTypeLogBirch":function(d){return "legno di betulla"},
"blockTypeLogJungle":function(d){return "legno della giungla"},
"blockTypeLogOak":function(d){return "legno di quercia"},
"blockTypeLogSpruce":function(d){return "legno di abete"},
"blockTypeOreCoal":function(d){return "minerale carbone"},
"blockTypeOreDiamond":function(d){return "minerale di diamante"},
"blockTypeOreEmerald":function(d){return "minerale di smeraldo"},
"blockTypeOreGold":function(d){return "minerale d'oro"},
"blockTypeOreIron":function(d){return "ferro grezzo"},
"blockTypeOreLapis":function(d){return "minerale di lapislazzulo"},
"blockTypeOreRedstone":function(d){return "minerale pietra rossa"},
"blockTypePlanksAcacia":function(d){return "assi di acacia"},
"blockTypePlanksBirch":function(d){return "assi di betulla"},
"blockTypePlanksJungle":function(d){return "assi della giungla"},
"blockTypePlanksOak":function(d){return "assi di quercia"},
"blockTypePlanksSpruce":function(d){return "assi di abete"},
"blockTypeRail":function(d){return "binari"},
"blockTypeSand":function(d){return "sabbia"},
"blockTypeSandstone":function(d){return "arenaria"},
"blockTypeStone":function(d){return "pietra"},
"blockTypeTnt":function(d){return "dinamite"},
"blockTypeTree":function(d){return "albero"},
"blockTypeWater":function(d){return "acqua"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "davanti"},
"blockWhileXAheadDo":function(d){return "esegui"},
"blockWhileXAheadWhile":function(d){return "mentre"},
"generatedCodeDescription":function(d){return "Trascinando e posizionando blocchi in questo puzzle, hai creato una serie di istruzioni all'interno di un linguaggio per computer chiamato Javascript. Questo codice indica al computer cosa visualizzare sullo schermo. Anche tutto quello che vedi o fai in Minecraft ha origine da codici come questi."},
"houseSelectChooseFloorPlan":function(d){return "Scegli una pianta per la tua casa."},
"houseSelectEasy":function(d){return "Facile"},
"houseSelectHard":function(d){return "Difficile"},
"houseSelectLetsBuild":function(d){return "Costruisci una casa."},
"houseSelectMedium":function(d){return "Medio"},
"keepPlayingButton":function(d){return "Continua a giocare"},
"level10FailureMessage":function(d){return "Ricopri la lava nel punto in cui vuoi passare, quindi estrai due blocchi di ferro dall'altra parte."},
"level11FailureMessage":function(d){return "Ricorda di posizionare dei ciottoli sopra la lava, così da poter estrarre le risorse in tutta sicurezza."},
"level12FailureMessage":function(d){return "Estrai tre blocchi di pietra rossa. Questo combina ciò che hai imparato dalla costruzione della casa e dall'uso delle dichiarazioni \"se\" per non cadere nella lava."},
"level13FailureMessage":function(d){return "Posiziona i \"binari\" lungo il sentiero che va dalla tua porta al margine della mappa."},
"level1FailureMessage":function(d){return "Devi usare i comandi per camminare fino alla pecora."},
"level1TooFewBlocksMessage":function(d){return "Prova a usare più comandi per raggiungere la pecora."},
"level2FailureMessage":function(d){return "Per abbattere un albero, raggiungi il tronco e usa il comando \"distruggi blocco\""},
"level2TooFewBlocksMessage":function(d){return "Prova a usare più comandi per abbattere l'albero. Raggiungi il tronco e usa il comando \"distruggi blocco\"."},
"level3FailureMessage":function(d){return "Per raccogliere la lana dalle pecore, avvicinati a esse e usa il comando \"tosa\". Ricorda di usare i comandi di movimento per raggiungere le pecore."},
"level3TooFewBlocksMessage":function(d){return "Prova a usare più comandi per raccogliere la lana da entrambe le pecore. Avvicinati a ciascuna e usa il comando \"tosa\"."},
"level4FailureMessage":function(d){return "Devi usare il comando \"distruggi blocco\" su ciascuno dei tre tronchi."},
"level5FailureMessage":function(d){return "Posiziona i blocchi sulla striscia di terra per costruire un muro. Il comando rosa \"ripeti\" attiverà tutti i comandi al suo interno, come \"posiziona blocco\" e \"muovi avanti\"."},
"level6FailureMessage":function(d){return "Posiziona i blocchi sulla striscia di terra della casa per risolvere il puzzle."},
"level7FailureMessage":function(d){return "Usa il comando \"pianta\" per posizionare le colture nel terreno arato."},
"level8FailureMessage":function(d){return "Se tocchi un creeper, questo esploderà. Aggirali per entrare in casa."},
"level9FailureMessage":function(d){return "Ricorda di posizionare almeno due torce per illuminare la strada e di estrarre almeno due pezzi di carbone."},
"minecraftBlock":function(d){return "blocco"},
"nextLevelMsg":function(d){return "Esercizio "+craft_locale.v(d,"puzzleNumber")+" completato. Complimenti!"},
"playerSelectChooseCharacter":function(d){return "Scegli il tuo personaggio."},
"playerSelectChooseSelectButton":function(d){return "Seleziona"},
"playerSelectLetsGetStarted":function(d){return "Cominciamo!"},
"reinfFeedbackMsg":function(d){return "Puoi selezionare \"Continua a giocare\" per tornare alla tua partita."},
"replayButton":function(d){return "Riprova"},
"selectChooseButton":function(d){return "Seleziona"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completato. Congratulazioni! È anche possibile completarlo con "+craft_locale.p(d,"numBlocks",0,"it",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};