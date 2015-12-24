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
"blockDestroyBlock":function(d){return "purusta plokk"},
"blockIf":function(d){return "kui"},
"blockIfLavaAhead":function(d){return "kui ees on laava"},
"blockMoveForward":function(d){return "liigu edasi"},
"blockPlaceTorch":function(d){return "aseta tõrvik"},
"blockPlaceXAheadAhead":function(d){return "ees"},
"blockPlaceXAheadPlace":function(d){return "aseta"},
"blockPlaceXPlace":function(d){return "aseta"},
"blockPlantCrop":function(d){return "istuta vili"},
"blockShear":function(d){return "püga"},
"blockTillSoil":function(d){return "hari pinnast"},
"blockTurnLeft":function(d){return "pööra vasakule"},
"blockTurnRight":function(d){return "pööra paremale"},
"blockTypeBedrock":function(d){return "aluskivi"},
"blockTypeBricks":function(d){return "tellised"},
"blockTypeClay":function(d){return "savi"},
"blockTypeClayHardened":function(d){return "küpsetatud savi"},
"blockTypeCobblestone":function(d){return "munakivi"},
"blockTypeDirt":function(d){return "muld"},
"blockTypeDirtCoarse":function(d){return "jäme muld"},
"blockTypeEmpty":function(d){return "tühi"},
"blockTypeFarmlandWet":function(d){return "põllumaa"},
"blockTypeGlass":function(d){return "klaas"},
"blockTypeGrass":function(d){return "muru"},
"blockTypeGravel":function(d){return "kruus"},
"blockTypeLava":function(d){return "laava"},
"blockTypeLogAcacia":function(d){return "akaatsiapalk"},
"blockTypeLogBirch":function(d){return "kasepalk"},
"blockTypeLogJungle":function(d){return "džunglipuupalk"},
"blockTypeLogOak":function(d){return "tammepalk"},
"blockTypeLogSpruce":function(d){return "kuusepalk"},
"blockTypeOreCoal":function(d){return "söemaak"},
"blockTypeOreDiamond":function(d){return "teemandimaak"},
"blockTypeOreEmerald":function(d){return "smaragdimaak"},
"blockTypeOreGold":function(d){return "kullamaak"},
"blockTypeOreIron":function(d){return "rauamaak"},
"blockTypeOreLapis":function(d){return "lasuriidimaak"},
"blockTypeOreRedstone":function(d){return "punakivimaak"},
"blockTypePlanksAcacia":function(d){return "akaatsialauad"},
"blockTypePlanksBirch":function(d){return "kaselauad"},
"blockTypePlanksJungle":function(d){return "džunglipuulauad"},
"blockTypePlanksOak":function(d){return "tammelauad"},
"blockTypePlanksSpruce":function(d){return "kuuselauad"},
"blockTypeRail":function(d){return "rööbas"},
"blockTypeSand":function(d){return "liiv"},
"blockTypeSandstone":function(d){return "liivakivi"},
"blockTypeStone":function(d){return "kivi"},
"blockTypeTnt":function(d){return "dünamiit"},
"blockTypeTree":function(d){return "puu"},
"blockTypeWater":function(d){return "vesi"},
"blockTypeWool":function(d){return "vill"},
"blockWhileXAheadAhead":function(d){return "ees"},
"blockWhileXAheadDo":function(d){return "täida"},
"blockWhileXAheadWhile":function(d){return "tingimusel"},
"generatedCodeDescription":function(d){return "Selles mõistatuses lohistasid ja paigutasid plokke ning lõid juhiste komplekti sellises arvutikeeles, mille nimi on Javascript. See kood ütleb arvutile, mida ta peab ekraanil kuvama. Kõik, mida sa Minecraftis näed ja teed, algab samuti sellist tüüpi arvutikoodide reaga."},
"houseSelectChooseFloorPlan":function(d){return "Vali oma maja projekt."},
"houseSelectEasy":function(d){return "Lihtne"},
"houseSelectHard":function(d){return "Keeruline"},
"houseSelectLetsBuild":function(d){return "Nüüd ehitame maja."},
"houseSelectMedium":function(d){return "Keskmine"},
"keepPlayingButton":function(d){return "Jätka mängimist"},
"level10FailureMessage":function(d){return "Kata enne üle kõndimist laava kinni, seejärel kaevanda teiselt poolt kaks rauaplokki."},
"level11FailureMessage":function(d){return "Kui ees on laavat, siis aseta kindlasti enda ette munakivi. Nii saad sa turvaliselt seda ressursirida kaevandada."},
"level12FailureMessage":function(d){return "Kaevanda kindlasti 3 punakiviplokki. Laavasse kukkumise vältimiseks tuleb ühendada see, mida sa õppisid maja ehitamise juures ning „kui“ käskude kasutamine."},
"level13FailureMessage":function(d){return "Aseta „rööbas“ jalgteele, mis viib uksest kaardi ääreni."},
"level1FailureMessage":function(d){return "Lambani kõndimiseks pead kasutama käske."},
"level1TooFewBlocksMessage":function(d){return "Proovi kasutada rohkem käske, et lambani kõndida."},
"level2FailureMessage":function(d){return "Puu langetamiseks kõnni selle tüve juurde ja kasuta käsku „purusta plokk“"},
"level2TooFewBlocksMessage":function(d){return "Proovi kasutada rohkem käske, et puud langetada. Kõnni tüveni ja siis kasuta käsku „purusta plokk“."},
"level3FailureMessage":function(d){return "Villa korjamiseks kõnni iga lamba juurde ja kasuta käsku „püga“. Lammasteni jõudmiseks pea meeles kasutada pööramiskäske."},
"level3TooFewBlocksMessage":function(d){return "Proovi kasutada rohkem käske, et villa korjata. Kõnni iga lamba juurde ja kasuta käsku „püga“."},
"level4FailureMessage":function(d){return "Sa pead kasutama käsku „purusta plokk“ kõigi kolme puutüve juures."},
"level5FailureMessage":function(d){return "Seina ehitamiseks aseta plokid mullase kontuuri peale. Roosa käsk „korda“ käivitab selle sisse asetatud käsud, näiteks „aseta plokk“ ja „liigu edasi“."},
"level6FailureMessage":function(d){return "Mõistatuse lahendamiseks aseta plokid mullast majakontuuri peale."},
"level7FailureMessage":function(d){return "Taimede asetamiseks kasuta käsku „istuta“ iga haritud pinnast tähistava tumeda ruudu peal."},
"level8FailureMessage":function(d){return "Kui sa hirmutajat puutud, siis see plahvatab. Hiili neist mööda ja sisene majja."},
"level9FailureMessage":function(d){return "Ära unusta asetamast vähemalt 2 tõrvikut, et oma teed valgustada JA kaevanda vähemalt 2 sütt."},
"minecraftBlock":function(d){return "plokk"},
"nextLevelMsg":function(d){return "Mõistatus "+craft_locale.v(d,"puzzleNumber")+" on lahendatud. Tubli!"},
"playerSelectChooseCharacter":function(d){return "Vali oma tegelaskuju."},
"playerSelectChooseSelectButton":function(d){return "Vali"},
"playerSelectLetsGetStarted":function(d){return "Alustame!"},
"reinfFeedbackMsg":function(d){return "Tagasiliikumiseks ja mängu jätkamiseks saad vajutada nuppu „Jätka mängimist“."},
"replayButton":function(d){return "Uuesti"},
"selectChooseButton":function(d){return "Vali"},
"tooManyBlocksFail":function(d){return "Mõistatus "+craft_locale.v(d,"puzzleNumber")+" on lahendatud. Tubli! Seda on võimalik lahendada ka "+craft_locale.p(d,"numBlocks",0,"et",{"one":"1 ploki","other":craft_locale.n(d,"numBlocks")+" ploki"})+" abil."}};