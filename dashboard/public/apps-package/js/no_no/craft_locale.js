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
"blockDestroyBlock":function(d){return "ødelegg blokk"},
"blockIf":function(d){return "hvis"},
"blockIfLavaAhead":function(d){return "hvis lava foran"},
"blockMoveForward":function(d){return "gå fremover"},
"blockPlaceTorch":function(d){return "sett fakkel"},
"blockPlaceXAheadAhead":function(d){return "foran"},
"blockPlaceXAheadPlace":function(d){return "sted"},
"blockPlaceXPlace":function(d){return "sted"},
"blockPlantCrop":function(d){return "plant avling"},
"blockShear":function(d){return "klipp"},
"blockTillSoil":function(d){return "pløy åker"},
"blockTurnLeft":function(d){return "snu mot venstre"},
"blockTurnRight":function(d){return "snu mot høyre"},
"blockTypeBedrock":function(d){return "grunnfjell"},
"blockTypeBricks":function(d){return "murstein"},
"blockTypeClay":function(d){return "leire"},
"blockTypeClayHardened":function(d){return "herdet leire"},
"blockTypeCobblestone":function(d){return "brostein"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "grovkornet jord"},
"blockTypeEmpty":function(d){return "tom"},
"blockTypeFarmlandWet":function(d){return "åker"},
"blockTypeGlass":function(d){return "glass"},
"blockTypeGrass":function(d){return "gress"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akasiestamme"},
"blockTypeLogBirch":function(d){return "bjørkestamme"},
"blockTypeLogJungle":function(d){return "jungeltrestamme"},
"blockTypeLogOak":function(d){return "eikestamme"},
"blockTypeLogSpruce":function(d){return "granstamme"},
"blockTypeOreCoal":function(d){return "kullmalm"},
"blockTypeOreDiamond":function(d){return "diamantklump"},
"blockTypeOreEmerald":function(d){return "smaragdklump"},
"blockTypeOreGold":function(d){return "gullmalm"},
"blockTypeOreIron":function(d){return "jernmalm"},
"blockTypeOreLapis":function(d){return "lapisklump"},
"blockTypeOreRedstone":function(d){return "rødsteinmalm"},
"blockTypePlanksAcacia":function(d){return "akasieplanker"},
"blockTypePlanksBirch":function(d){return "bjørkeplanker"},
"blockTypePlanksJungle":function(d){return "jungeltreplanker"},
"blockTypePlanksOak":function(d){return "eikeplanker"},
"blockTypePlanksSpruce":function(d){return "granplanker"},
"blockTypeRail":function(d){return "jernbaneskinner"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandstein"},
"blockTypeStone":function(d){return "stein"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "tre"},
"blockTypeWater":function(d){return "vann"},
"blockTypeWool":function(d){return "ull"},
"blockWhileXAheadAhead":function(d){return "foran"},
"blockWhileXAheadDo":function(d){return "gjør"},
"blockWhileXAheadWhile":function(d){return "så lenge"},
"generatedCodeDescription":function(d){return "Ved å dra og plassere brikker i denne oppgaven har du opprettet et sett med instruksjoner i et programmeringsspråk som heter JavaScript. Denne koden forteller datamaskinen hva den skal vise på skjermen. Alt du ser og gjør i Minecraft starter også med slike linjer med kode."},
"houseSelectChooseFloorPlan":function(d){return "Velg plantegning til huset ditt."},
"houseSelectEasy":function(d){return "Enkel"},
"houseSelectHard":function(d){return "Vanskelig"},
"houseSelectLetsBuild":function(d){return "La oss bygge et hus!"},
"houseSelectMedium":function(d){return "Middels"},
"keepPlayingButton":function(d){return "Spill mer"},
"level10FailureMessage":function(d){return "Dekk til lavaen for å kunne gå over, sånn at du kan utvinne jern fra to blokker på den andre siden."},
"level11FailureMessage":function(d){return "Hvis det er lava foran deg må du plassere brostein. Da kan du trygt utvinne denne raden med ressurser."},
"level12FailureMessage":function(d){return "Pass på at du utvinner tre rødsteinbokker. Dette kombinerer det du har lært av å bygge hus og bruke \"hvis\"-koder for å unngå å falle i lavaen."},
"level13FailureMessage":function(d){return "Plasser jernbaneskinner på jordveien fra huset ditt og helt ut til kanten."},
"level1FailureMessage":function(d){return "Bruk kommandoer for å gå til sauen."},
"level1TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å gå til sauen."},
"level2FailureMessage":function(d){return "For å kutte ned et tre må du gå til stammen og bruke \"ødelegg blokk\"-kommandoen."},
"level2TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å hugge ned treet. Gå til stammen og bruk \"ødelegg blokk\"-kommandoen."},
"level3FailureMessage":function(d){return "For å samle ull fra begge sauene må du gå til begge og bruke \"klipp\"-kommandoen. Husk å snu for å komme fram til sauene."},
"level3TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å samle ull fra begge sauene. Gå til begge og bruk \"klipp\"-kommandoen."},
"level4FailureMessage":function(d){return "Du må bruke \"ødelegg blokk\"-kommandoen på alle tre trestammene."},
"level5FailureMessage":function(d){return "Plasser blokkene dine på jordlinjen for å bygge en vegg. Den rosa \"gjenta\"-kommandoen vil repetere kommandoene inne i den, som \"plasser blokk\" og \"gå fremover\"."},
"level6FailureMessage":function(d){return "Plasser blokker på omrisset av huset for å fullføre oppgaven."},
"level7FailureMessage":function(d){return "Bruk kommandoen \"plant avling\" for å plassere planter på hvert av feltene med mørk, pløyd jord."},
"level8FailureMessage":function(d){return "Hvis du kommer borti en Creeper vil den eksplodere. Snik deg rundt dem og gå inn i huset ditt."},
"level9FailureMessage":function(d){return "For å kunne se må du plassere minst to fakler og du må utvinne minst to kull for å fullføre dette nivået."},
"minecraftBlock":function(d){return "blokk"},
"nextLevelMsg":function(d){return "Oppgave "+craft_locale.v(d,"puzzleNumber")+" er fullført. Gratulerer!"},
"playerSelectChooseCharacter":function(d){return "Velg en avatar."},
"playerSelectChooseSelectButton":function(d){return "Velg"},
"playerSelectLetsGetStarted":function(d){return "La oss begynne."},
"reinfFeedbackMsg":function(d){return "Du kan trykke \"Fortsett å spille\" for å gå tilbake og fortsette spillet ditt."},
"replayButton":function(d){return "Prøv igjen"},
"selectChooseButton":function(d){return "Velg"},
"tooManyBlocksFail":function(d){return "Oppgave "+craft_locale.v(d,"puzzleNumber")+" er fullført. Gratulerer! Det er også mulig å fullføre den med"+craft_locale.p(d,"numBlocks",0,"no",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};