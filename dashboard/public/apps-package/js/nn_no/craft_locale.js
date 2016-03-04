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
"blockDestroyBlock":function(d){return "øydelegg blokk"},
"blockIf":function(d){return "viss"},
"blockIfLavaAhead":function(d){return "viss lava foran"},
"blockMoveForward":function(d){return "gå framover"},
"blockPlaceTorch":function(d){return "plasser fakkel"},
"blockPlaceXAheadAhead":function(d){return "foran"},
"blockPlaceXAheadPlace":function(d){return "plasser"},
"blockPlaceXPlace":function(d){return "plasser"},
"blockPlantCrop":function(d){return "plant avling"},
"blockShear":function(d){return "klipp"},
"blockTillSoil":function(d){return "pløy åker"},
"blockTurnLeft":function(d){return "snu mot venstre"},
"blockTurnRight":function(d){return "snu mot høgre"},
"blockTypeBedrock":function(d){return "grunnfjell"},
"blockTypeBricks":function(d){return "murstein"},
"blockTypeClay":function(d){return "leire"},
"blockTypeClayHardened":function(d){return "herda leire"},
"blockTypeCobblestone":function(d){return "brustein"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "grov jord"},
"blockTypeEmpty":function(d){return "tom"},
"blockTypeFarmlandWet":function(d){return "åker"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "gras"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akasiekubbe"},
"blockTypeLogBirch":function(d){return "bjørkekubbe"},
"blockTypeLogJungle":function(d){return "jungelkubbe"},
"blockTypeLogOak":function(d){return "eikekubbe"},
"blockTypeLogSpruce":function(d){return "grankubbe"},
"blockTypeOreCoal":function(d){return "kolåre"},
"blockTypeOreDiamond":function(d){return "diamantåre"},
"blockTypeOreEmerald":function(d){return "smaragdåre"},
"blockTypeOreGold":function(d){return "gullåre"},
"blockTypeOreIron":function(d){return "jernåre"},
"blockTypeOreLapis":function(d){return "lapisåre"},
"blockTypeOreRedstone":function(d){return "redstoneåre"},
"blockTypePlanksAcacia":function(d){return "akasieplanker"},
"blockTypePlanksBirch":function(d){return "bjørkeplanker"},
"blockTypePlanksJungle":function(d){return "jungelplanker"},
"blockTypePlanksOak":function(d){return "eikeplanker"},
"blockTypePlanksSpruce":function(d){return "granplanker"},
"blockTypeRail":function(d){return "spor"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandstein"},
"blockTypeStone":function(d){return "stein"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "tre"},
"blockTypeWater":function(d){return "vatn"},
"blockTypeWool":function(d){return "ull"},
"blockWhileXAheadAhead":function(d){return "foran"},
"blockWhileXAheadDo":function(d){return "gjer"},
"blockWhileXAheadWhile":function(d){return "så lenge"},
"generatedCodeDescription":function(d){return "Ved å dra og plassere blokker i denne oppgåva, har du òg laga eit sett med instruksjonar i et programmeringsspråk som heiter Javascript. Koden fortel datamaskina kva han skal vise på skjermen. Alt du ser og gjer i Minecraft startar og med slik kode."},
"houseSelectChooseFloorPlan":function(d){return "Velg plantegninen for huset ditt."},
"houseSelectEasy":function(d){return "Enkel"},
"houseSelectHard":function(d){return "Vanskelig"},
"houseSelectLetsBuild":function(d){return "La oss bygge eit hus."},
"houseSelectMedium":function(d){return "Middels"},
"keepPlayingButton":function(d){return "Fortset å spele"},
"level10FailureMessage":function(d){return "Dekk til lavaen og gå over slik at du kan utvinne jern frå to blokker på den andre sida."},
"level11FailureMessage":function(d){return "Pass på å plassere brustein foran deg om det er lava der. Da kan du trygt grave ut denne raden med ressursar."},
"level12FailureMessage":function(d){return "Pass på at du utvinn tre redstone-blokker. Kombiner kva du lærte når du bygde huset ditt med \"viss\"-tester for å unngå å falle i lavaen."},
"level13FailureMessage":function(d){return "Plasser skinner langs stien frå døra din og heilt ut til kanten!"},
"level1FailureMessage":function(d){return "Bruk kommandoar for å gå til sauen."},
"level1TooFewBlocksMessage":function(d){return "Prøv å bruke fleire kommandoar for å gå til sauen!"},
"level2FailureMessage":function(d){return "For å kutte ned eit tre, må du gå til stammen og bruke \"øydelegg blokk\"-kommandoen."},
"level2TooFewBlocksMessage":function(d){return "Prøv å bruke fleire kommandoar for å hugge ned treet! Gå til stammen og bruk \"øydeleg blokk\"-kommandoen."},
"level3FailureMessage":function(d){return "For å samle ull frå begge sauene, må du gå til begge og bruke \"klipp\"-kommandoen. Husk å bruke \"snu\"-kommandoar for å kome fram til sauene!"},
"level3TooFewBlocksMessage":function(d){return "Prøv å bruke fleire kommandoar for å samle ull frå begge sauane! Gå til ein og ein og bruk \"klipp\"-kommandoen!"},
"level4FailureMessage":function(d){return "Du må bruke \"øydeleg blokk\"-kommandoen på alle tre trestammane."},
"level5FailureMessage":function(d){return "Plasser blokkene dine på omrisset på bakken for å byggje ein vegg! Den rosa \"gjenta\"-kommandoen vil repetere kommandoane som står inne i den. Slike som \"plasser blokk\" og \"gå framover\"."},
"level6FailureMessage":function(d){return "Plasser blokker på omrisset av huset for å fullføre oppgåva!"},
"level7FailureMessage":function(d){return "Bruk kommandoen \"plant avling\" for å plante på kvart felt med mørk, pløyd jord."},
"level8FailureMessage":function(d){return "Dersom du kjem borti ein Creeper, vil den eksplodere. Snik deg rundt dei og gå inn i huset ditt!"},
"level9FailureMessage":function(d){return "Gløym ikkje å plassere minst to faklar for å lyse opp vegen din, og du må utvinne minst to kol for å fullføre dette nivået."},
"minecraftBlock":function(d){return "blokk"},
"nextLevelMsg":function(d){return "Oppgåve "+craft_locale.v(d,"puzzleNumber")+" er fullført. Gratulerer!"},
"playerSelectChooseCharacter":function(d){return "Vel ein avatar!"},
"playerSelectChooseSelectButton":function(d){return "Vel"},
"playerSelectLetsGetStarted":function(d){return "Lat oss begynne."},
"reinfFeedbackMsg":function(d){return "Du kan trykke \"Fortsett å spele\" for å gå tilbake til spelet ditt."},
"replayButton":function(d){return "Prøv igjen"},
"selectChooseButton":function(d){return "Vel"},
"tooManyBlocksFail":function(d){return "Oppgåve "+craft_locale.v(d,"puzzleNumber")+" er fullført. Gratulerer! Det er og mulig å fullføre den med "+craft_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};