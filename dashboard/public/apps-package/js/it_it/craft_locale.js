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
"blockDestroyBlock":function(d){return "distruggere il blocco"},
"blockIf":function(d){return "se"},
"blockIfLavaAhead":function(d){return "se c'è lava avanti"},
"blockMoveForward":function(d){return "vai avanti"},
"blockPlaceTorch":function(d){return "metti torcia"},
"blockPlaceXAheadAhead":function(d){return "avanti"},
"blockPlaceXAheadPlace":function(d){return "posto"},
"blockPlaceXPlace":function(d){return "posto"},
"blockPlantCrop":function(d){return "coltura"},
"blockShear":function(d){return "tosare"},
"blockTillSoil":function(d){return "fino a terra"},
"blockTurnLeft":function(d){return "gira a sinistra"},
"blockTurnRight":function(d){return "gira a destra"},
"blockTypeBedrock":function(d){return "suolo"},
"blockTypeBricks":function(d){return "mattoni"},
"blockTypeClay":function(d){return "argilla"},
"blockTypeClayHardened":function(d){return "argilla indurita"},
"blockTypeCobblestone":function(d){return "ciottolo"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "sporco grossolano"},
"blockTypeEmpty":function(d){return "vuoto"},
"blockTypeFarmlandWet":function(d){return "terreno agricolo"},
"blockTypeGlass":function(d){return "vetro"},
"blockTypeGrass":function(d){return "erba"},
"blockTypeGravel":function(d){return "ghiaia"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "tronco di acacia"},
"blockTypeLogBirch":function(d){return "tronco di betulla"},
"blockTypeLogJungle":function(d){return "legno di giungla"},
"blockTypeLogOak":function(d){return "tronco di rovere"},
"blockTypeLogSpruce":function(d){return "tronco di abete rosso"},
"blockTypeOreCoal":function(d){return "carbone grezzo"},
"blockTypeOreDiamond":function(d){return "diamante grezzo"},
"blockTypeOreEmerald":function(d){return "smeraldo grezzo"},
"blockTypeOreGold":function(d){return "pepita d'oro"},
"blockTypeOreIron":function(d){return "minerale di ferro"},
"blockTypeOreLapis":function(d){return "minerale di Lapis"},
"blockTypeOreRedstone":function(d){return "pietrarossa grezza"},
"blockTypePlanksAcacia":function(d){return "asse di acacia"},
"blockTypePlanksBirch":function(d){return "asse di betulla"},
"blockTypePlanksJungle":function(d){return "assi di giungla"},
"blockTypePlanksOak":function(d){return "asse di quercia"},
"blockTypePlanksSpruce":function(d){return "assi di abete rosso"},
"blockTypeRail":function(d){return "ferrovia"},
"blockTypeSand":function(d){return "sabbia"},
"blockTypeSandstone":function(d){return "arenaria"},
"blockTypeStone":function(d){return "pietra"},
"blockTypeTnt":function(d){return "dinamite"},
"blockTypeTree":function(d){return "albero"},
"blockTypeWater":function(d){return "acqua"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "avanti"},
"blockWhileXAheadDo":function(d){return "esegui"},
"blockWhileXAheadWhile":function(d){return "mentre"},
"generatedCodeDescription":function(d){return "Unendo i blocchi colorati che rappresentano dei comandi per il calcolatore, hai creato in questo esercizio un insieme di istruzioni in un linguaggio di programmazione chiamato JavaScript. Questo codice dice al computer che cosa mostrare sullo schermo. Tutto quello che vedi e fai in Minecraft ha inizio da linee di codice come queste."},
"houseSelectChooseFloorPlan":function(d){return "Scegli il piano piano per la tua casa."},
"houseSelectEasy":function(d){return "Facile"},
"houseSelectHard":function(d){return "Difficile"},
"houseSelectLetsBuild":function(d){return "Costruiamo una casa."},
"houseSelectMedium":function(d){return "Medio"},
"keepPlayingButton":function(d){return "Continua a giocare"},
"level10FailureMessage":function(d){return "Ricopri la lava per passarci sopra, poi scava due dei blocchi di ferro sull'altra sponda."},
"level11FailureMessage":function(d){return "Assicurati di piazzare il pietrame più avanti se c'è della lava in vista. Ciò ti permetterà di scavare questa fila di risorse in sicurezza."},
"level12FailureMessage":function(d){return "Sii certo di estrarre 3 blocchi di pietra rossa. Questo combina quello che hai imparato dal costruire la tua casa e utilizzando istruzioni \"se\" per evitare di cadere nella lava."},
"level13FailureMessage":function(d){return "Piazza la \"rotaia\" lungo il sentiero sterrato che porta dalla tua porta al bordo della mappa."},
"level1FailureMessage":function(d){return "Devi utilizzare i comandi per raggiungere le pecore."},
"level1TooFewBlocksMessage":function(d){return "Prova a utilizzare più comandi per raggiungere le pecore."},
"level2FailureMessage":function(d){return "Per abbattere un albero, avvicinati al suo tronco e usa il comando \"distruggi il blocco\"."},
"level2TooFewBlocksMessage":function(d){return "Prova ad usare più comandi per abbattere un albero. Avvicinati al tronco e usa il comando \"distruggi il blocco\"."},
"level3FailureMessage":function(d){return "Per tosare la lana di entrambe le pecore, avvicinati a ciascuna e usa il comando \"tosa\". Ricorda di utilizzare i tasti freccia per raggiungere le pecore."},
"level3TooFewBlocksMessage":function(d){return "Prova ad usare più comandi per tosare la lana di entrambe le pecore. Avvicinati a ciascuna e usa il comando \"tosa\"."},
"level4FailureMessage":function(d){return "È necessario utilizzare il comando di \"distruggere il blocco\" su ciascuno dei tronchi d'albero."},
"level5FailureMessage":function(d){return "Posizionare i blocchi sul contorno di terra per costruire un muro. Il comando rosa \"ripetere\" eseguirà i comandi collocati all'interno di esso, come \"posizionare blocco\" e \"andare avanti\"."},
"level6FailureMessage":function(d){return "Inserire blocchi sul contorno terroso della casa per completare il puzzle."},
"level7FailureMessage":function(d){return "Utilizzare il comando di \"pianta\" per posizionare colture su ogni pezzodi terreno lavorato."},
"level8FailureMessage":function(d){return "Se tocchi un rettile, esploderà. Aggirali ed entra nella tua casa."},
"level9FailureMessage":function(d){return "Non dimenticare di collocare almeno due torce per illuminare il percorso ED estrarre almeno 2 minerali."},
"minecraftBlock":function(d){return "blocco"},
"nextLevelMsg":function(d){return "Esercizio "+craft_locale.v(d,"puzzleNumber")+" completato. Complimenti!"},
"playerSelectChooseCharacter":function(d){return "Scegli il tuo personaggio."},
"playerSelectChooseSelectButton":function(d){return "Seleziona"},
"playerSelectLetsGetStarted":function(d){return "Cominciamo."},
"reinfFeedbackMsg":function(d){return "Puoi premere su \"Continua a giocare\" per tornare a giocare."},
"replayButton":function(d){return "Riprova"},
"selectChooseButton":function(d){return "Seleziona"},
"tooManyBlocksFail":function(d){return "Esercizio "+craft_locale.v(d,"puzzleNumber")+" completato. Complimenti! È possibile completarlo anche usando "+craft_locale.p(d,"numBlocks",0,"it",{"one":"1 blocco","other":craft_locale.n(d,"numBlocks")+" blocchi"})+"."}};