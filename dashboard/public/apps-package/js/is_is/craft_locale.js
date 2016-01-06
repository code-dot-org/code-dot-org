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
"blockDestroyBlock":function(d){return "eyða blokk"},
"blockIf":function(d){return "ef"},
"blockIfLavaAhead":function(d){return "ef hraun framundan"},
"blockMoveForward":function(d){return "færa áfram"},
"blockPlaceTorch":function(d){return "setja kyndil"},
"blockPlaceXAheadAhead":function(d){return "framfyrir"},
"blockPlaceXAheadPlace":function(d){return "setja"},
"blockPlaceXPlace":function(d){return "setja"},
"blockPlantCrop":function(d){return "planta jurt"},
"blockShear":function(d){return "rýja"},
"blockTillSoil":function(d){return "yrkja mold"},
"blockTurnLeft":function(d){return "snúa til vinstri"},
"blockTurnRight":function(d){return "snúa til hægri"},
"blockTypeBedrock":function(d){return "grunnklöpp"},
"blockTypeBricks":function(d){return "múrsteina"},
"blockTypeClay":function(d){return "leir"},
"blockTypeClayHardened":function(d){return "hertan leir"},
"blockTypeCobblestone":function(d){return "hleðslustein"},
"blockTypeDirt":function(d){return "mold"},
"blockTypeDirtCoarse":function(d){return "grófa mold"},
"blockTypeEmpty":function(d){return "ekkert"},
"blockTypeFarmlandWet":function(d){return "ræktarjörð"},
"blockTypeGlass":function(d){return "gler"},
"blockTypeGrass":function(d){return "gras"},
"blockTypeGravel":function(d){return "möl"},
"blockTypeLava":function(d){return "hraun"},
"blockTypeLogAcacia":function(d){return "akasíudrumb"},
"blockTypeLogBirch":function(d){return "birkidrumb"},
"blockTypeLogJungle":function(d){return "frumskógardrumb"},
"blockTypeLogOak":function(d){return "eikardrumb"},
"blockTypeLogSpruce":function(d){return "grenidrumb"},
"blockTypeOreCoal":function(d){return "kolagrýti"},
"blockTypeOreDiamond":function(d){return "demantagrýti"},
"blockTypeOreEmerald":function(d){return "smaragðagrýti"},
"blockTypeOreGold":function(d){return "gullgrýti"},
"blockTypeOreIron":function(d){return "járngrýti"},
"blockTypeOreLapis":function(d){return "blásteinsgrýti"},
"blockTypeOreRedstone":function(d){return "roðasteinsgrýti"},
"blockTypePlanksAcacia":function(d){return "akasíuplanka"},
"blockTypePlanksBirch":function(d){return "birkiplanka"},
"blockTypePlanksJungle":function(d){return "frumskógarplanka"},
"blockTypePlanksOak":function(d){return "eikarplanka"},
"blockTypePlanksSpruce":function(d){return "greniplanka"},
"blockTypeRail":function(d){return "teina"},
"blockTypeSand":function(d){return "sandur"},
"blockTypeSandstone":function(d){return "sandstein"},
"blockTypeStone":function(d){return "stein"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "tré"},
"blockTypeWater":function(d){return "vatn"},
"blockTypeWool":function(d){return "ull"},
"blockWhileXAheadAhead":function(d){return "framfyrir"},
"blockWhileXAheadDo":function(d){return "gera"},
"blockWhileXAheadWhile":function(d){return "meðan"},
"generatedCodeDescription":function(d){return "Með því að draga og setja kubba í þessa þraut hefur þú búið til röð fyrirmæla á tölvutungumáli sem nefnist JavaScript. Það segir tölvum hvað á að sýna á skjánum. Allt sem þú sérð og gerir í MineCraft byrjar líka á svona línum af tölvukóða."},
"houseSelectChooseFloorPlan":function(d){return "Veldu grunnteikningu fyrir húsið þitt."},
"houseSelectEasy":function(d){return "Auðveld"},
"houseSelectHard":function(d){return "Erfið"},
"houseSelectLetsBuild":function(d){return "Við skulum byggja hús."},
"houseSelectMedium":function(d){return "Miðlungs"},
"keepPlayingButton":function(d){return "Spila áfram"},
"level10FailureMessage":function(d){return "Fylltu upp í hraunið til að ganga yfir og grafðu svo út tvær járnblokkir hinum megin."},
"level11FailureMessage":function(d){return "Gættu þess að setja hleðslustein þegar hraun er framundan. Þá getur þú grafið út þessa röð af hráefni í öryggi."},
"level12FailureMessage":function(d){return "Gættu þess að grafa út 3 roðasteina. Þessi þraut sameinar það sem þú lærðir við að byggja húsið og það að nota „ef“ setningar til að forðast að falla í hraun."},
"level13FailureMessage":function(d){return "Leggðu teina eftir moldarslóðinni frá húsdyrunum út að jaðri kortsins."},
"level1FailureMessage":function(d){return "Þú verður að nota skipanir til að ganga að kindinni."},
"level1TooFewBlocksMessage":function(d){return "Reyndu að nota fleiri skipanir til að ganga að kindinni."},
"level2FailureMessage":function(d){return "Höggðu niður tré með því að ganga að stofni þess og nota \"eyða blokk\" skipunina."},
"level2TooFewBlocksMessage":function(d){return "Reyndu að nota fleiri skipanir til að höggva niður tréð. Gakktu að stofni þess og notaðu \"eyða blokk\" skipunina."},
"level3FailureMessage":function(d){return "Safnaðu ull af báðum kindunum með því að ganga að hvorri um sig og nota \"rýja\" skipunina. Mundu að nota \"snúa\" skipanir til að komast til kindanna."},
"level3TooFewBlocksMessage":function(d){return "Reyndu að nota fleiri skipanir til að safna ull af báðum kindunum. Gakktu að hvorri um sig og notaðu „rýja“ skipunina."},
"level4FailureMessage":function(d){return "Þú verður að nota \"eyða blokk\" skipunina á hvern af þessum þremur trjábolum."},
"level5FailureMessage":function(d){return "Settu blokkirnar á moldarútlínuna til að byggja vegg. Bleika \"endurtaka\" skipunin keyrir skipanir sem eru settar í hana, t.d. \"setja blokk\" og \"færa áfram\"."},
"level6FailureMessage":function(d){return "Settu blokkir á moldarútlínuna fyrir húsið til að ljúka þrautinni."},
"level7FailureMessage":function(d){return "Notaðu \"planta\" skipunina til að setja jurtir á hvern reit af dökkri plægðri mold."},
"level8FailureMessage":function(d){return "Ef þú snertir laumupúka mun hann springa. Laumastu framhjá þeim og farðu inn í húsið."},
"level9FailureMessage":function(d){return "Ekki gleyma að setja upp minnst 2 ljós til að lýsa leiðina OG grafa út minnst 2 af kolum."},
"minecraftBlock":function(d){return "blokk"},
"nextLevelMsg":function(d){return "Þraut "+craft_locale.v(d,"puzzleNumber")+" lokið. Til hamingju!"},
"playerSelectChooseCharacter":function(d){return "Veldu persónu."},
"playerSelectChooseSelectButton":function(d){return "Velja"},
"playerSelectLetsGetStarted":function(d){return "Komum okkur af stað."},
"reinfFeedbackMsg":function(d){return "Þú getur ýtt á \"Spila áfram\" til að fara aftur í að spila leikinn þinn."},
"replayButton":function(d){return "Spila aftur"},
"selectChooseButton":function(d){return "Velja"},
"tooManyBlocksFail":function(d){return "Þraut "+craft_locale.v(d,"puzzleNumber")+" lokið. Til hamingju! Það er líka hægt að ljúka henni með "+craft_locale.p(d,"numBlocks",0,"is",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};