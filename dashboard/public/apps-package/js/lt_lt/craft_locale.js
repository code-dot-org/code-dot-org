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
"blockDestroyBlock":function(d){return "sunaikinti bloką"},
"blockIf":function(d){return "jei"},
"blockIfLavaAhead":function(d){return "jei lava priekyje"},
"blockMoveForward":function(d){return "ženk į priekį"},
"blockPlaceTorch":function(d){return "padėti deglą"},
"blockPlaceXAheadAhead":function(d){return "priekyje"},
"blockPlaceXAheadPlace":function(d){return "padėti"},
"blockPlaceXPlace":function(d){return "padėti"},
"blockPlantCrop":function(d){return "sodinti pasėlius"},
"blockShear":function(d){return "kirpti"},
"blockTillSoil":function(d){return "sukasti dirvą"},
"blockTurnLeft":function(d){return "pasisuk į kairę"},
"blockTurnRight":function(d){return "pasisuk į dešinę"},
"blockTypeBedrock":function(d){return "pamatinė uoliena"},
"blockTypeBricks":function(d){return "plytos"},
"blockTypeClay":function(d){return "molis"},
"blockTypeClayHardened":function(d){return "grūdintas molis"},
"blockTypeCobblestone":function(d){return "grindinys"},
"blockTypeDirt":function(d){return "žemė"},
"blockTypeDirtCoarse":function(d){return "rupi žemė"},
"blockTypeEmpty":function(d){return "tuščias"},
"blockTypeFarmlandWet":function(d){return "dirva"},
"blockTypeGlass":function(d){return "stiklas"},
"blockTypeGrass":function(d){return "žolė"},
"blockTypeGravel":function(d){return "žvyras"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akacijos rąstas"},
"blockTypeLogBirch":function(d){return "beržo rąstas"},
"blockTypeLogJungle":function(d){return "džiunglių rąstas"},
"blockTypeLogOak":function(d){return "ąžuolo rąstas"},
"blockTypeLogSpruce":function(d){return "eglės rąstas"},
"blockTypeOreCoal":function(d){return "anglies rūda"},
"blockTypeOreDiamond":function(d){return "deimanto rūda"},
"blockTypeOreEmerald":function(d){return "smaragdo rūda"},
"blockTypeOreGold":function(d){return "aukso rūda"},
"blockTypeOreIron":function(d){return "geležies rūda"},
"blockTypeOreLapis":function(d){return "lazurito rūda"},
"blockTypeOreRedstone":function(d){return "raudono akmens rūda"},
"blockTypePlanksAcacia":function(d){return "akacijos lentos"},
"blockTypePlanksBirch":function(d){return "beržo lentos"},
"blockTypePlanksJungle":function(d){return "džiunglių lentos"},
"blockTypePlanksOak":function(d){return "ąžuolo lentos"},
"blockTypePlanksSpruce":function(d){return "eglės lentos"},
"blockTypeRail":function(d){return "bėgiai"},
"blockTypeSand":function(d){return "smėlis"},
"blockTypeSandstone":function(d){return "smiltainis"},
"blockTypeStone":function(d){return "akmuo"},
"blockTypeTnt":function(d){return "dinamitas"},
"blockTypeTree":function(d){return "medis"},
"blockTypeWater":function(d){return "vanduo"},
"blockTypeWool":function(d){return "vilna"},
"blockWhileXAheadAhead":function(d){return "priekyje"},
"blockWhileXAheadDo":function(d){return " "},
"blockWhileXAheadWhile":function(d){return "kol"},
"generatedCodeDescription":function(d){return "Tempdamas ir dėliodamas blokelius šiame galvosūkyje, tu sukūrei instrukcijų rinkinį kompiuterine kalba Javascript. Šis instrukcijų rinkinys (arba kitaip – kodas) pasako kompiuteriui, ką rodyti ekrane. Viskas, ką tu matai ir darai žaidime Minecraft, taip pat prasideda su panašiomis kompiuterinio kodo eilutėmis."},
"houseSelectChooseFloorPlan":function(d){return "Pasirink savo namo planą."},
"houseSelectEasy":function(d){return "Lengvas"},
"houseSelectHard":function(d){return "Sunkus"},
"houseSelectLetsBuild":function(d){return "Pastatykime namą."},
"houseSelectMedium":function(d){return "Vidutinis"},
"keepPlayingButton":function(d){return "Žaisti toliau"},
"level10FailureMessage":function(d){return "Uždenk lavą, kad galėtum pereiti, o tada iškask du geležies blokus kitoje pusėje."},
"level11FailureMessage":function(d){return "Nepamiršk priekyje padėti grindinio, jei ten yra lava. Tokiu būdu tu galėsi saugiai iškasti šią išteklių eilę."},
"level12FailureMessage":function(d){return "Būtinai iškask 3 raudono akmens blokus. Tai apjungia visa tai, ką tu išmokai statydamas savo namą ir naudodamas „jei“ sakinį, kad neįkristum į lavą."},
"level13FailureMessage":function(d){return "Padėk „bėgius“ ant tako, vedančio nuo tavo namo durų iki žemėlapio krašto."},
"level1FailureMessage":function(d){return "Norint nueiti prie avies, reikia naudoti komandas."},
"level1TooFewBlocksMessage":function(d){return "Pabandyk panaudoti daugiau komandų, kad nueitum prie avies."},
"level2FailureMessage":function(d){return "Norėdamas nukirsti medį, prieik prie jo kamieno ir panaudok komandą „sunaikinti bloką“."},
"level2TooFewBlocksMessage":function(d){return "Pabandyk panaudoti daugiau komandų, kad nukirstum medį. Prieik prie jo kamieno ir panaudok komandą „sunaikinti bloką“."},
"level3FailureMessage":function(d){return "Norėdamas nukirpti vilną nuo abiejų avių, prieik prie kiekvienos ir panaudok komandą „kirpti“. Nepamiršk panaudoti pasisukimo komandų, kad pasiektum avis."},
"level3TooFewBlocksMessage":function(d){return "Pabandyk panaudoti daugiau komandų, kad nukirptum vilną nuo abiejų avių. Prieik prie kiekvienos ir panaudok komandą „kirpti“."},
"level4FailureMessage":function(d){return "Reikia panaudoti komandą „sunaikinti bloką“ visiems trims medžio kamienams."},
"level5FailureMessage":function(d){return "Norėdamas pastatyti sieną, išdėliok savo blokus ant kontūro iš žemių. Rausva komanda „kartoti“ vykdys kitas į ją įdėtas komandas, tokias kaip „padėti bloką“ arba „eiti pirmyn“."},
"level6FailureMessage":function(d){return "Norėdamas išspręsti galvosūkį, išdėliok blokus ant namo kontūro iš žemių."},
"level7FailureMessage":function(d){return "Norėdamas pasodinti pasėlius, ant kiekvienos sukastos dirvos naudok komandą „sodinti“."},
"level8FailureMessage":function(d){return "Jei tu paliesi kryperį (creeper), jis susprogs. Prasėlink pro juos ir įeik į savo namą."},
"level9FailureMessage":function(d){return "Nepamiršk padėti bent 2 deglus, kad apšviestum savo kelią ir iškask BENT 2 anglies."},
"minecraftBlock":function(d){return "blokas"},
"nextLevelMsg":function(d){return "Galvosūkis "+craft_locale.v(d,"puzzleNumber")+" baigtas. Sveikiname!"},
"playerSelectChooseCharacter":function(d){return "Pasirinkite savo veikėją."},
"playerSelectChooseSelectButton":function(d){return "Pasirinkti"},
"playerSelectLetsGetStarted":function(d){return "Pradėkime."},
"reinfFeedbackMsg":function(d){return "Paspausk \"Tęsti Žaidimą\" jei nori grįžti į žaidimą."},
"replayButton":function(d){return "Pakartoti"},
"selectChooseButton":function(d){return "Pasirinkti"},
"tooManyBlocksFail":function(d){return "Galvosūkis "+craft_locale.v(d,"puzzleNumber")+" baigtas. Sveikiname! Jį įmanoma išspręsti ir panaudojant "+craft_locale.p(d,"numBlocks",0,"lt",{"one":"1 blokelį","other":craft_locale.n(d,"numBlocks")+" blokelius"})+"."}};