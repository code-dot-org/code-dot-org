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
"blockDestroyBlock":function(d){return "elpusztítani a blokkot"},
"blockIf":function(d){return "Ha"},
"blockIfLavaAhead":function(d){return "ha elől láva"},
"blockMoveForward":function(d){return "előrelépni"},
"blockPlaceTorch":function(d){return "elhelyezni egy fáklyát"},
"blockPlaceXAheadAhead":function(d){return "előtte"},
"blockPlaceXAheadPlace":function(d){return "elhelyez"},
"blockPlaceXPlace":function(d){return "elhelyez"},
"blockPlantCrop":function(d){return "magot ültetni"},
"blockShear":function(d){return "nyír"},
"blockTillSoil":function(d){return "legelő"},
"blockTurnLeft":function(d){return "fordulj balra"},
"blockTurnRight":function(d){return "fordulj jobbra"},
"blockTypeBedrock":function(d){return "alapkőzet"},
"blockTypeBricks":function(d){return "tégla"},
"blockTypeClay":function(d){return "agyag"},
"blockTypeClayHardened":function(d){return "keményített agyag"},
"blockTypeCobblestone":function(d){return "macskakő"},
"blockTypeDirt":function(d){return "föld"},
"blockTypeDirtCoarse":function(d){return "durva föld"},
"blockTypeEmpty":function(d){return "üres"},
"blockTypeFarmlandWet":function(d){return "termőföld"},
"blockTypeGlass":function(d){return "üveg"},
"blockTypeGrass":function(d){return "fű"},
"blockTypeGravel":function(d){return "kavics"},
"blockTypeLava":function(d){return "láva"},
"blockTypeLogAcacia":function(d){return "akác rönk"},
"blockTypeLogBirch":function(d){return "nyírfa rönk"},
"blockTypeLogJungle":function(d){return "trópusi rönk"},
"blockTypeLogOak":function(d){return "tölgyfa rönk"},
"blockTypeLogSpruce":function(d){return "fenyő rönk"},
"blockTypeOreCoal":function(d){return "szén érc"},
"blockTypeOreDiamond":function(d){return "gyémánt érc"},
"blockTypeOreEmerald":function(d){return "smaragd érc"},
"blockTypeOreGold":function(d){return "arany érc"},
"blockTypeOreIron":function(d){return "vasérc"},
"blockTypeOreLapis":function(d){return "lapis érc"},
"blockTypeOreRedstone":function(d){return "vöröskő érc"},
"blockTypePlanksAcacia":function(d){return "akác deszka"},
"blockTypePlanksBirch":function(d){return "nyírfa deszka"},
"blockTypePlanksJungle":function(d){return "trópusi deszka"},
"blockTypePlanksOak":function(d){return "tölgyfa deszka"},
"blockTypePlanksSpruce":function(d){return "fenyő deszka"},
"blockTypeRail":function(d){return "vasút"},
"blockTypeSand":function(d){return "homok"},
"blockTypeSandstone":function(d){return "homokkő"},
"blockTypeStone":function(d){return "kő"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "fa"},
"blockTypeWater":function(d){return "víz"},
"blockTypeWool":function(d){return "gyapjú"},
"blockWhileXAheadAhead":function(d){return "előtte"},
"blockWhileXAheadDo":function(d){return "csináld"},
"blockWhileXAheadWhile":function(d){return "amíg"},
"generatedCodeDescription":function(d){return "A puzzle-darabok elhelyezésével igazából utasításokat adtál ki, melyek a JavaScript nevű programozási nyelven íródtak. Ez az utasítás-sorozat (programkód) mondja meg a számítógépnek, hogy mit és hogyan jelenítsen meg a képernyőn. Bármi, amit a Minecraftban látsz és csinálsz ilyen programkódban íródott."},
"houseSelectChooseFloorPlan":function(d){return "Válassza ki a ház alaprajzát."},
"houseSelectEasy":function(d){return "Könnyű"},
"houseSelectHard":function(d){return "Kemény"},
"houseSelectLetsBuild":function(d){return "Építsünk házat."},
"houseSelectMedium":function(d){return "Közepes"},
"keepPlayingButton":function(d){return "Folytasd"},
"level10FailureMessage":function(d){return "Fedd le a lávát, hogy keresztül sétálj rajta, aztán bányássz ki két vas-blokkot a túloldalon."},
"level11FailureMessage":function(d){return "Győződj meg arról, hogy magad elé helyezted a macskakövet, ha magad előtt lávát találsz. Így biztonságosan bányászhatod ki ezt a sor erőforrást."},
"level12FailureMessage":function(d){return "Győződj meg róla, hogy kibányásztál 3 vöröskő blokkot. Ez azt fogja jelenteni, megtanultad a házadban használni a \"ha\" parancsot, hogy elkerüld a lávába esést."},
"level13FailureMessage":function(d){return "Helyezz el egy \"sínt\" a földúton, hogy az elvezessen a házad ajtajától a térkép széléhez."},
"level1FailureMessage":function(d){return "Parancsokat kell használnod ahhoz, hogy odasétálj a bárányhoz."},
"level1TooFewBlocksMessage":function(d){return "Próbálj ki további parancsokat is, hogy odamenj a juhhoz."},
"level2FailureMessage":function(d){return "A fa kivágásához menj oda a fa törzséhez és használd a \"blokk megsemmisítése\" parancsot."},
"level2TooFewBlocksMessage":function(d){return "Próbálj ki további parancsokat a fa kivágásához. Sétálj oda a fa törzséhez és alkalmazd a \"blokk megsemmisítése\" parancsot."},
"level3FailureMessage":function(d){return "Mind a két juh gyapjának begyűjtéséhez sétálj oda mindegyikőjükhöz és használd a \"nyírás\" parancsot. Ne feledd használni a fordulás parancsot a juhokhoz vehető úton."},
"level3TooFewBlocksMessage":function(d){return "Próbálj meg használni további parancsokat ahhoz, hogy gyapjút gyűjts a juhoktól. Sétálj oda mindegyikhez és használd a \"nyírás\" parancsot."},
"level4FailureMessage":function(d){return "A \"blokk megsemmisítése\" parancsot kell használnod mind a három fatörzsön."},
"level5FailureMessage":function(d){return "Helyezd a blokkokat a földdel kijelölt szakaszokra a fal felépítéséhez. A rózsaszín \"ismételd\" parancs fogja futtatni a benne lévő parancsokat, olyanokat, mint a \"blokk elhelyezése\" és az \"előrelépés\"."},
"level6FailureMessage":function(d){return "Helyezd a blokkokat a ház földdel kijelölt szakaszaira a feladvány megoldásához."},
"level7FailureMessage":function(d){return "Használd az \"elültetni\" parancsot minden egyes mag szántóföldbe való elvetéséhez."},
"level8FailureMessage":function(d){return "Ha hozzáérsz a kúszónövényekhez, azok fel fognak robbanni. Surranj el mellettük és osonj be a házadba."},
"level9FailureMessage":function(d){return "Ne felejts el elhelyezni legalább 2 fáklyát ahhoz, hogy megvilágítsd az utadat ÉS kibányássz legalább 2 szenet."},
"minecraftBlock":function(d){return "blokk"},
"nextLevelMsg":function(d){return "A "+craft_locale.v(d,"puzzleNumber")+". puzzle befejeződött. Ügyes vagy!"},
"playerSelectChooseCharacter":function(d){return "Válaszd ki a karaktered."},
"playerSelectChooseSelectButton":function(d){return "Válassz"},
"playerSelectLetsGetStarted":function(d){return "Kezdjük is el."},
"reinfFeedbackMsg":function(d){return "A \"Folytasd\" gomb megnyomásával tudod folytatni a játékod."},
"replayButton":function(d){return "Visszajátszás"},
"selectChooseButton":function(d){return "Válassz"},
"tooManyBlocksFail":function(d){return "A "+craft_locale.v(d,"puzzleNumber")+". puzzle befejeződött. Ügyes vagy! Egyébként ennyi blokkal is meg lehet csinálni: "+craft_locale.p(d,"numBlocks",0,"hu",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};