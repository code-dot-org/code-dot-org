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
"blockDestroyBlock":function(d){return "uništi blok"},
"blockIf":function(d){return "ako"},
"blockIfLavaAhead":function(d){return "ako je lava ispred"},
"blockMoveForward":function(d){return "idi naprijed"},
"blockPlaceTorch":function(d){return "postavite baklju"},
"blockPlaceXAheadAhead":function(d){return "ispred"},
"blockPlaceXAheadPlace":function(d){return "postavi"},
"blockPlaceXPlace":function(d){return "postavi"},
"blockPlantCrop":function(d){return "zasadite usjev"},
"blockShear":function(d){return "ošišaj"},
"blockTillSoil":function(d){return "prekopaj tlo"},
"blockTurnLeft":function(d){return "okreni lijevo"},
"blockTurnRight":function(d){return "okreni desno"},
"blockTypeBedrock":function(d){return "temelj"},
"blockTypeBricks":function(d){return "blokovi"},
"blockTypeClay":function(d){return "glina"},
"blockTypeClayHardened":function(d){return "tvrda glina"},
"blockTypeCobblestone":function(d){return "kaldrma"},
"blockTypeDirt":function(d){return "blato"},
"blockTypeDirtCoarse":function(d){return "krupno blato"},
"blockTypeEmpty":function(d){return "prazno"},
"blockTypeFarmlandWet":function(d){return "plodno tlo"},
"blockTypeGlass":function(d){return "staklo"},
"blockTypeGrass":function(d){return "trava"},
"blockTypeGravel":function(d){return "makadam"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "stablo bagrema"},
"blockTypeLogBirch":function(d){return "stablo breze"},
"blockTypeLogJungle":function(d){return "stablo džungle"},
"blockTypeLogOak":function(d){return "stablo hrasta"},
"blockTypeLogSpruce":function(d){return "stablo smreke"},
"blockTypeOreCoal":function(d){return "ruda ugljena"},
"blockTypeOreDiamond":function(d){return "ruda dijamanta"},
"blockTypeOreEmerald":function(d){return "ruda smaragda"},
"blockTypeOreGold":function(d){return "ruda zlata"},
"blockTypeOreIron":function(d){return "ruda željeza"},
"blockTypeOreLapis":function(d){return "lapis ruda"},
"blockTypeOreRedstone":function(d){return "ruda crvenog kamena"},
"blockTypePlanksAcacia":function(d){return "daska bagrema"},
"blockTypePlanksBirch":function(d){return "daska breze"},
"blockTypePlanksJungle":function(d){return "daska džungle"},
"blockTypePlanksOak":function(d){return "daska hrasta"},
"blockTypePlanksSpruce":function(d){return "daska smreke"},
"blockTypeRail":function(d){return "tračnica"},
"blockTypeSand":function(d){return "pijesak"},
"blockTypeSandstone":function(d){return "šljunak"},
"blockTypeStone":function(d){return "kamen"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "drvo"},
"blockTypeWater":function(d){return "voda"},
"blockTypeWool":function(d){return "vuna"},
"blockWhileXAheadAhead":function(d){return "ispred"},
"blockWhileXAheadDo":function(d){return "uradi"},
"blockWhileXAheadWhile":function(d){return "dok"},
"generatedCodeDescription":function(d){return "Premještajući i postavljajući blokove u ovoj zagonetci, kreirate niz instrukcija u programskom jeziku koji se naziva Javascirpt. Ovaj kod govori računaru šta da prikaže na ekranu. Sve što vidite ili radite u igri Minecraft takođe započinje linijama koda sličnim ovima."},
"houseSelectChooseFloorPlan":function(d){return "Odaberite plan za vašu kuću."},
"houseSelectEasy":function(d){return "Lahko"},
"houseSelectHard":function(d){return "Teško"},
"houseSelectLetsBuild":function(d){return "Izgradimo kuću."},
"houseSelectMedium":function(d){return "Srednje"},
"keepPlayingButton":function(d){return "Nastavi Igrati"},
"level10FailureMessage":function(d){return "Prekrijte lavu kako bi prešli preko iste, a onda izvadite dva bloka željeza sa druge strane."},
"level11FailureMessage":function(d){return "Morate postaviti kaldrmu ukoliko imate lavu ispred. Ovo vam omogučuje da sigurno vadite ove resurse."},
"level12FailureMessage":function(d){return "Morate iskopati 3 bloka crvenog kamena. Ovdje kombinujete ono što ste naučili u gradnji vaše kuće i korištenja \"ako\" naredbe da bi izbjegli da upadnete u lavu."},
"level13FailureMessage":function(d){return "Postavite \"tračnice\" preko puta koji vodi do vaših vrata na ivici mape."},
"level1FailureMessage":function(d){return "Morate koristiti komande kako bi ste došli do ovce."},
"level1TooFewBlocksMessage":function(d){return "Probajte da koristite više komandi kako bi došli do ovce."},
"level2FailureMessage":function(d){return "Kako bi ste isjekli drvo, idite do stabla i upotrijebite komandu \"uništi blok\"."},
"level2TooFewBlocksMessage":function(d){return "Probajte koristiti više komandi kako bi ste isjekli drvo. Krećite se do stabla i iskoristite komandu \"uništi blok\"."},
"level3FailureMessage":function(d){return "Kako bi ste prikupili vunu sa obje ovce, približite se svakoj ovci i upotrijebite komandu \"ošišati\". Ne zaboravite korisiti komandu zakreni kako bi ste došli do ovce."},
"level3TooFewBlocksMessage":function(d){return "Porbajte iskoristiti još komandi kako bi ste skupili vunu sa obje ovce. Priđite svakoj od njih i iskoristite komandu \"ošišati\"."},
"level4FailureMessage":function(d){return "Morate iskoristiti \"uništi blok\" komandu na svakom od tri stabla drveta."},
"level5FailureMessage":function(d){return "Postavite blokove na označeno mjesto kako bi ste napravili zid. Roza komanda \"ponovi\" pokrenut će komande unutar nje, kao \"postavi blok\" i \"idi naprijed\"."},
"level6FailureMessage":function(d){return "Postavite blokove na označeno tlo za kuću kako bi ste završili zagonetku."},
"level7FailureMessage":function(d){return "Koristite komandu \"zasadi\" kako bi ste zasadili usjeve na svaki komad tamnog zemljišta."},
"level8FailureMessage":function(d){return "Ukoliko dodirnete puzavca, eksplodirat će. Zaobiđite ga i uđite u svoju kuću."},
"level9FailureMessage":function(d){return "Ne zaboravite da postavite bar 2 baklje kako bi osvijetlili svoj put i iskopali barem 2 komada ugljena."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Zagonetka "+craft_locale.v(d,"puzzleNumber")+" završena. Čestitamo!"},
"playerSelectChooseCharacter":function(d){return "Odaberite svoj lik."},
"playerSelectChooseSelectButton":function(d){return "Odaberi"},
"playerSelectLetsGetStarted":function(d){return "Započnimo."},
"reinfFeedbackMsg":function(d){return "Možete kliknuti na \"Nastavi Igrati\" kako bi nastavili igru."},
"replayButton":function(d){return "Ponovi"},
"selectChooseButton":function(d){return "Odaberi"},
"tooManyBlocksFail":function(d){return "Zagonetka "+craft_locale.v(d,"puzzleNumber")+" završena. Čestitamo! Možete je završiti i sa "+craft_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};