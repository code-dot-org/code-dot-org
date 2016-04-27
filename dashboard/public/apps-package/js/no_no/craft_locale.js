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
"blockPlaceTorch":function(d){return "plasser fakkel"},
"blockPlaceXAheadAhead":function(d){return "foran"},
"blockPlaceXAheadPlace":function(d){return "plasser"},
"blockPlaceXPlace":function(d){return "plasser"},
"blockPlantCrop":function(d){return "plant avling"},
"blockShear":function(d){return "klipp"},
"blockTillSoil":function(d){return "kultiver jord"},
"blockTurnLeft":function(d){return "snu mot venstre"},
"blockTurnRight":function(d){return "snu mot høyre"},
"blockTypeBedrock":function(d){return "grunnfjell"},
"blockTypeBricks":function(d){return "teglsteiner"},
"blockTypeClay":function(d){return "leire"},
"blockTypeClayHardened":function(d){return "herdet leire"},
"blockTypeCobblestone":function(d){return "brostein"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "grov jord"},
"blockTypeEmpty":function(d){return "tom"},
"blockTypeFarmlandWet":function(d){return "dyrkbar jord"},
"blockTypeGlass":function(d){return "glass"},
"blockTypeGrass":function(d){return "gress"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akasiekubbe"},
"blockTypeLogBirch":function(d){return "bjørkekubbe"},
"blockTypeLogJungle":function(d){return "jungeltrekubbe"},
"blockTypeLogOak":function(d){return "eikekubbe"},
"blockTypeLogSpruce":function(d){return "grankubbe"},
"blockTypeOreCoal":function(d){return "kullmalm"},
"blockTypeOreDiamond":function(d){return "diamantmalm"},
"blockTypeOreEmerald":function(d){return "smaragdmalm"},
"blockTypeOreGold":function(d){return "gullmalm"},
"blockTypeOreIron":function(d){return "jernmalm"},
"blockTypeOreLapis":function(d){return "lasurmalm"},
"blockTypeOreRedstone":function(d){return "rødsteinmalm"},
"blockTypePlanksAcacia":function(d){return "akasieplanker"},
"blockTypePlanksBirch":function(d){return "bjørkeplanker"},
"blockTypePlanksJungle":function(d){return "jungeltreplanker"},
"blockTypePlanksOak":function(d){return "eikeplanker"},
"blockTypePlanksSpruce":function(d){return "granplanker"},
"blockTypeRail":function(d){return "skinne"},
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
"generatedCodeDescription":function(d){return "Ved å dra og plassere blokker i denne oppgaven har du skapt instruksjoner i programmeringsspråket Javascript. Denne programmeringskoden forteller datamaskiner hva de skal vise på skjermen. Alt du ser og gjør i Minecraft, begynner også med kodelinjer som dette."},
"houseSelectChooseFloorPlan":function(d){return "Velg planløsning for huset ditt."},
"houseSelectEasy":function(d){return "Lett"},
"houseSelectHard":function(d){return "Vanskelig"},
"houseSelectLetsBuild":function(d){return "La oss bygge et hus."},
"houseSelectMedium":function(d){return "Middels"},
"keepPlayingButton":function(d){return "Fortsett å spille"},
"level10FailureMessage":function(d){return "Dekk til lavaen for å komme deg over den. Så utvinner du to av jernblokkene på den andre siden."},
"level11FailureMessage":function(d){return "Husk å plassere brostein foran deg hvis det er lava der. Da kan du trygt utvinne denne raden med ressurser."},
"level12FailureMessage":function(d){return "Du må utvinne 3 rødsteinblokker. Dette utgjør en kombinasjon av det du lærte da du bygde huset, og bruk av \"hvis\"-kommandoer for å ikke falle ned i lavaen."},
"level13FailureMessage":function(d){return "Plasser \"skinne\" langs jordstien som går fra huset ditt til enden av kartet."},
"level1FailureMessage":function(d){return "Du må bruke kommandoer for å gå til sauen."},
"level1TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å gå til sauen."},
"level2FailureMessage":function(d){return "For å hugge ned et tre går du til stammen og bruker kommandoen \"ødelegg blokk\"."},
"level2TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å hugge ned treet. Gå til stammen og bruk kommandoen \"ødelegg blokk\"."},
"level3FailureMessage":function(d){return "For å samle ull fra begge sauene går du til hver av dem og bruker kommandoen \"klipp\". Husk å bruke snu-kommandoer for å komme deg til sauen."},
"level3TooFewBlocksMessage":function(d){return "Prøv å bruke flere kommandoer for å samle ull fra begge sauene. Gå til hver av dem og bruk kommandoen \"klipp\"."},
"level4FailureMessage":function(d){return "Du må bruke kommandoen \"ødelegg blokk\" på hver av de tre trestammene."},
"level5FailureMessage":function(d){return "Plasser blokkene på jordomrisset for å bygge en vegg. Den rosa \"gjenta\"-kommandoen utfører kommandoer som er plassert inni den, slik som \"plasser blokk\" og \"flytt fremover\"."},
"level6FailureMessage":function(d){return "Plasser blokker på husets jordomriss for å fullføre oppgaven."},
"level7FailureMessage":function(d){return "Bruk kommandoen \"plant\" for å plassere avlinger på hver lapp med mørk, kultivert jord."},
"level8FailureMessage":function(d){return "Smygere eksploderer hvis du kommer borti dem. Snik deg rundt dem og gå inn i huset."},
"level9FailureMessage":function(d){return "Ikke glem å plassere minst 2 fakler til å lyse opp, OG utvinne minst to kull."},
"minecraftBlock":function(d){return "blokk"},
"nextLevelMsg":function(d){return "Oppgave "+craft_locale.v(d,"puzzleNumber")+" er fullført. Gratulerer!"},
"playerSelectChooseCharacter":function(d){return "Velg en figur."},
"playerSelectChooseSelectButton":function(d){return "Velg"},
"playerSelectLetsGetStarted":function(d){return "La oss komme i gang."},
"reinfFeedbackMsg":function(d){return "Du kan trykke \"Fortsett å spille\" for å fortsette med spillet ditt."},
"replayButton":function(d){return "Spill en gang til"},
"selectChooseButton":function(d){return "Velg"},
"tooManyBlocksFail":function(d){return "Oppgave "+craft_locale.v(d,"puzzleNumber")+" fullført. Gratulerer! Du er også mulig å fullføre oppgaven med "+craft_locale.p(d,"numBlocks",0,"no",{"one":"1 blokk","other":craft_locale.n(d,"numBlocks")+" blokker"})+"."}};