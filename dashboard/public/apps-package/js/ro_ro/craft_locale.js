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
"blockDestroyBlock":function(d){return "distruge bloc"},
"blockIf":function(d){return "dacă"},
"blockIfLavaAhead":function(d){return "dacă in fata ai lavă"},
"blockMoveForward":function(d){return "mută înainte"},
"blockPlaceTorch":function(d){return "plaseaza torta"},
"blockPlaceXAheadAhead":function(d){return "inainte"},
"blockPlaceXAheadPlace":function(d){return "plaseaza"},
"blockPlaceXPlace":function(d){return "plaseaza"},
"blockPlantCrop":function(d){return "planteaza recolta"},
"blockShear":function(d){return "taie"},
"blockTillSoil":function(d){return "la sol"},
"blockTurnLeft":function(d){return "ia-o la stânga"},
"blockTurnRight":function(d){return "ia-o la dreapta"},
"blockTypeBedrock":function(d){return "roca"},
"blockTypeBricks":function(d){return "caramizi"},
"blockTypeClay":function(d){return "lut"},
"blockTypeClayHardened":function(d){return "lut intarit"},
"blockTypeCobblestone":function(d){return "pietruite"},
"blockTypeDirt":function(d){return "noroi"},
"blockTypeDirtCoarse":function(d){return "murdărie mare"},
"blockTypeEmpty":function(d){return "gol"},
"blockTypeFarmlandWet":function(d){return "terenuri agricole"},
"blockTypeGlass":function(d){return "sticlă"},
"blockTypeGrass":function(d){return "iarba"},
"blockTypeGravel":function(d){return "pietris"},
"blockTypeLava":function(d){return "lavă"},
"blockTypeLogAcacia":function(d){return "salcâm"},
"blockTypeLogBirch":function(d){return "mesteacan"},
"blockTypeLogJungle":function(d){return "jungla"},
"blockTypeLogOak":function(d){return "stejar"},
"blockTypeLogSpruce":function(d){return "molid"},
"blockTypeOreCoal":function(d){return "minereu de cărbune"},
"blockTypeOreDiamond":function(d){return "minereu de diamant"},
"blockTypeOreEmerald":function(d){return "minereu de smarald"},
"blockTypeOreGold":function(d){return "minereu de aur"},
"blockTypeOreIron":function(d){return "minereu de fier"},
"blockTypeOreLapis":function(d){return "minereu de lapis"},
"blockTypeOreRedstone":function(d){return "minereu de pietre rosii"},
"blockTypePlanksAcacia":function(d){return "cherestea de salcam"},
"blockTypePlanksBirch":function(d){return "cherestea de mesteacan"},
"blockTypePlanksJungle":function(d){return "scanduri"},
"blockTypePlanksOak":function(d){return "cherestea de stejar"},
"blockTypePlanksSpruce":function(d){return "cherestea de molid"},
"blockTypeRail":function(d){return "feroviar"},
"blockTypeSand":function(d){return "nisip"},
"blockTypeSandstone":function(d){return "gresie"},
"blockTypeStone":function(d){return "piatra"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "copac"},
"blockTypeWater":function(d){return "apă"},
"blockTypeWool":function(d){return "lână"},
"blockWhileXAheadAhead":function(d){return "inainte"},
"blockWhileXAheadDo":function(d){return "fă"},
"blockWhileXAheadWhile":function(d){return "în timp ce"},
"generatedCodeDescription":function(d){return "Prin glisarea şi plasarea de blocuri în acest puzzle, ai creat un set de instrucţiuni într-un limbaj de calculator numit Javascript. Acest cod le spune calculatoarelor ce să afişeze pe ecran. Tot ceea ce vezi şi faci în Minecraft începe, de asemenea, cu linii de cod pentru calculator ca acestea."},
"houseSelectChooseFloorPlan":function(d){return "Alege planul de etaj pentru casa ta."},
"houseSelectEasy":function(d){return "Uşor"},
"houseSelectHard":function(d){return "Greu"},
"houseSelectLetsBuild":function(d){return "Hai să construim o casă."},
"houseSelectMedium":function(d){return "Medium"},
"keepPlayingButton":function(d){return "Joacă în continuare"},
"level10FailureMessage":function(d){return "Acopera lava pentru a merge peste ea, apoi pune 2 blocuri de fier pe partea cealalta."},
"level11FailureMessage":function(d){return "Asigura-te sa plasezi pietrele in fata daca exista lava. Acestea te vor lasa sa pastrezi in siguranta resursele."},
"level12FailureMessage":function(d){return "Asigura-te sa ai 3 blocuri de minereu rosu. Aceasta miscare combina ce ai invatat din construirea casei tale si folosind \"daca\" pentru a evita caderea in lava."},
"level13FailureMessage":function(d){return "Aseaza \"feroviar\" pe calea de noroi ce duce de la usa ta pana la marginea hartii."},
"level1FailureMessage":function(d){return "Trebuie sa folosesti comenzi pentru a ajunge la oi."},
"level1TooFewBlocksMessage":function(d){return "Incercati mai multe comenzi pentru a ajunge la oi."},
"level2FailureMessage":function(d){return "Pentru a taia un copac, mergi pana la baza lui si foloseste comanda \"distruge bloc\"."},
"level2TooFewBlocksMessage":function(d){return "Încercaţi să utilizaţi mai multe comenzi pentru taia copacul. Mergeti catre baza lui si folositi blocul \"distruge\"."},
"level3FailureMessage":function(d){return "Pentru a aduna lana de la ambele oi, mergeti catre ele si utilizati comanda \"forfcare\". Amintiti-va sa folositi comanda \"intoarcere\" pentru a ajunge la oi."},
"level3TooFewBlocksMessage":function(d){return "Incearca sa folosesti mai multe comenzi pentru a aduna lana de la ambele oi. Mergi catre fiecare si utilizeaza comanda \"forfecare\"."},
"level4FailureMessage":function(d){return "Trebuie sa folosesti blocul \"distruge\" pentru cele 3 trunchiuri."},
"level5FailureMessage":function(d){return "Aseaza-ti blocurile pe conturul de noroi pentru a face un zid. Comanda roz \"repeta\" va rula comenzile incluse in el, ca si \"pune blocul\" sau \"mergi inainte\"."},
"level6FailureMessage":function(d){return "Pune blocurile pe conturul de noroi din fata casei pentru a completa puzzle-ul."},
"level7FailureMessage":function(d){return "Foloseste comanda \"planteaza\" pentru a cultiva pe fiecare parte de sol inchis la culoare."},
"level8FailureMessage":function(d){return "Daca atingi un vierme va exploda. Strecoara-te in jurul lor si intra in casa ta."},
"level9FailureMessage":function(d){return "Nu uita sa asezi cel putin 2 torte pentru a-ti lumina drumul si pune cel putin 2 carbuni."},
"minecraftBlock":function(d){return "bloc"},
"nextLevelMsg":function(d){return "Puzzle-ul "+craft_locale.v(d,"puzzleNumber")+" finalizat. Felicitări!"},
"playerSelectChooseCharacter":function(d){return "Alege-ti personajul."},
"playerSelectChooseSelectButton":function(d){return "Selectare"},
"playerSelectLetsGetStarted":function(d){return "Haideţi să începem."},
"reinfFeedbackMsg":function(d){return "Poți apăsa \"Joacă în continuare\" pentru a reveni la jocul tău."},
"replayButton":function(d){return "Reluare"},
"selectChooseButton":function(d){return "Selectare"},
"tooManyBlocksFail":function(d){return "Puzzle-ul "+craft_locale.v(d,"puzzleNumber")+" finalizat. Felicitări! De asemenea, este posibil să îl completezi cu "+craft_locale.p(d,"numBlocks",0,"ro",{"one":"1 bloc","other":craft_locale.n(d,"numBlocks")+" blocuri"})+"."}};