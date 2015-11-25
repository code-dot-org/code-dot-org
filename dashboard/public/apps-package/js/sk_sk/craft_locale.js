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
"blockDestroyBlock":function(d){return "znič blok"},
"blockIf":function(d){return "ak"},
"blockIfLavaAhead":function(d){return "ak je pred tebou láva"},
"blockMoveForward":function(d){return "posunúť dopredu"},
"blockPlaceTorch":function(d){return "umiestni fakľu"},
"blockPlaceXAheadAhead":function(d){return "oproti"},
"blockPlaceXAheadPlace":function(d){return "umiestniť"},
"blockPlaceXPlace":function(d){return "umiestniť"},
"blockPlantCrop":function(d){return "zasaď plodinu"},
"blockShear":function(d){return "ostrihaj"},
"blockTillSoil":function(d){return "zorať pôdu"},
"blockTurnLeft":function(d){return "otočiť vľavo"},
"blockTurnRight":function(d){return "otočiť vpravo"},
"blockTypeBedrock":function(d){return "skalné podložie"},
"blockTypeBricks":function(d){return "tehly"},
"blockTypeClay":function(d){return "íl"},
"blockTypeClayHardened":function(d){return "tvrdený íl"},
"blockTypeCobblestone":function(d){return "kameň"},
"blockTypeDirt":function(d){return "hlina"},
"blockTypeDirtCoarse":function(d){return "neplodná pôda"},
"blockTypeEmpty":function(d){return "prázdne"},
"blockTypeFarmlandWet":function(d){return "poľnohospodárska pôda"},
"blockTypeGlass":function(d){return "sklo"},
"blockTypeGrass":function(d){return "tráva"},
"blockTypeGravel":function(d){return "štrk"},
"blockTypeLava":function(d){return "láva"},
"blockTypeLogAcacia":function(d){return "agátové brvno"},
"blockTypeLogBirch":function(d){return "brezové brvno"},
"blockTypeLogJungle":function(d){return "brvno tropického dreva"},
"blockTypeLogOak":function(d){return "dubové brvno"},
"blockTypeLogSpruce":function(d){return "smrekové brvno"},
"blockTypeOreCoal":function(d){return "ruda uhlia"},
"blockTypeOreDiamond":function(d){return "ruda diamantu"},
"blockTypeOreEmerald":function(d){return "ruda smaragdu"},
"blockTypeOreGold":function(d){return "ruda zlata"},
"blockTypeOreIron":function(d){return "ruda železa"},
"blockTypeOreLapis":function(d){return "ruda lapizu"},
"blockTypeOreRedstone":function(d){return "ruda ruditu"},
"blockTypePlanksAcacia":function(d){return "agátové dosky"},
"blockTypePlanksBirch":function(d){return "brezové dosky"},
"blockTypePlanksJungle":function(d){return "dosky tropického dreva"},
"blockTypePlanksOak":function(d){return "dubové dosky"},
"blockTypePlanksSpruce":function(d){return "smrekové dosky"},
"blockTypeRail":function(d){return "koľajnica"},
"blockTypeSand":function(d){return "piesok"},
"blockTypeSandstone":function(d){return "pieskovec"},
"blockTypeStone":function(d){return "kameň"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "strom"},
"blockTypeWater":function(d){return "voda"},
"blockTypeWool":function(d){return "vlna"},
"blockWhileXAheadAhead":function(d){return "oproti"},
"blockWhileXAheadDo":function(d){return "vykonaj"},
"blockWhileXAheadWhile":function(d){return "pokiaľ"},
"generatedCodeDescription":function(d){return "Pretiahnutím a umiestnením blokov v tejto skladačke ste vytvorili sadu inštrukcií v počítačovom jazyku zvanom JavaScript. Tento kód povie počítaču, čo má zobraziť na obrazovke. Všetko, čo vidíte a robíte v Minecrafte tiež začína riadkami v počítačovom kóde ako sú tieto."},
"houseSelectChooseFloorPlan":function(d){return "Vyberte pôdorys pre váš dom."},
"houseSelectEasy":function(d){return "Jednoduché"},
"houseSelectHard":function(d){return "Ťažké"},
"houseSelectLetsBuild":function(d){return "Postavme dom."},
"houseSelectMedium":function(d){return "Stredná"},
"keepPlayingButton":function(d){return "Hrať ďalej"},
"level10FailureMessage":function(d){return "Aby si mohol prejsť, tak zakry lávu. Potom na druhej strane vyťaž dva bloky železa."},
"level11FailureMessage":function(d){return "Ak je pred tebou láva, tak pred seba polož dlažobný kameň. To ti umožní bezpečne vyťažiť tento riadok blokov."},
"level12FailureMessage":function(d){return "Vyťaž 3 bloky redstonu. Tu využiješ poznatky získané pri stavaní domu a podmienok \"ak\" pomocou ktorých si sa vyhýbal láve."},
"level13FailureMessage":function(d){return "Polož \"koľaje\" pozdĺž cesty, ktorá vedie od dverí tvojho domu k okraju mapy."},
"level1FailureMessage":function(d){return "Aby ste prišli k ovci, musíte použiť príkazy."},
"level1TooFewBlocksMessage":function(d){return "Skús použiť viac príkazov aby si sa dostal k ovci."},
"level2FailureMessage":function(d){return "Strom zotneš tak, že prídeš k nemu a použiješ príkaz \"znič blok\"."},
"level2TooFewBlocksMessage":function(d){return "Skús použiť viac príkazov na zoťatie stromu. Choď ku stromu a použi príkaz \"znič blok\"."},
"level3FailureMessage":function(d){return "Vlnu z oviec získaš tak, že podídeš ku každej ovci a použiješ príkaz \"ostrihaj\". Nezabudni použiť príkazy na zmenu smeru."},
"level3TooFewBlocksMessage":function(d){return "Skús použiť viac príkazov na získanie vlny z oviec. Choď ku každej a použi príkaz \"ostrihaj\"."},
"level4FailureMessage":function(d){return "Pri každom z troch stromov musíš použiť príkaz \"znič blok\"."},
"level5FailureMessage":function(d){return "Postav stenu položením blokov na pruh hliny. Pomocou ružového príkazu \"opakuj\" môžeš opakovane vykonať príkazy, ktoré do neho vložíš, napríklad \"polož blok\" a \"choď vpred\"."},
"level6FailureMessage":function(d){return "Úlohu vyrieš položením blokov na hlinený obrys domu."},
"level7FailureMessage":function(d){return "Použi príkaz \"zasaď plodinu\" na zasadenie plodín na každý štvorček zoranej zeme."},
"level8FailureMessage":function(d){return "Keď sa dotkneš creepera tak vybuchne. Prekĺzni sa okolo nich a vojdi do svojho domu."},
"level9FailureMessage":function(d){return "Nezabudni si osvetliť cestu aspoň dvoma fakľami a vyťažiť aspoň 2 kusy uhlia."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Úloha "+craft_locale.v(d,"puzzleNumber")+" vyriešená. Gratulujeme!"},
"playerSelectChooseCharacter":function(d){return "Vyber si svoju postavu."},
"playerSelectChooseSelectButton":function(d){return "Vybrať"},
"playerSelectLetsGetStarted":function(d){return "Začnime."},
"reinfFeedbackMsg":function(d){return "Stlačením \"Hrať ďalej\" sa vrátiš k tvojej hre."},
"replayButton":function(d){return "Opakovať"},
"selectChooseButton":function(d){return "Vybrať"},
"tooManyBlocksFail":function(d){return "Hlavolam "+craft_locale.v(d,"puzzleNumber")+" vyriešený. Gratulujeme! Je ho tiež možné dokončiť s "+craft_locale.p(d,"numBlocks",0,"sk",{"one":"1 blokom","other":craft_locale.n(d,"numBlocks")+" blokmi"})+"."}};