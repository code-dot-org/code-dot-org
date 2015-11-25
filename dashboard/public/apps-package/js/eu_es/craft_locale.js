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
"blockDestroyBlock":function(d){return "deuseztatu blokea"},
"blockIf":function(d){return "baldin"},
"blockIfLavaAhead":function(d){return "aurrean laba badago"},
"blockMoveForward":function(d){return "mugitu aurrera"},
"blockPlaceTorch":function(d){return "argi-zuzia kokatu"},
"blockPlaceXAheadAhead":function(d){return "aurrean"},
"blockPlaceXAheadPlace":function(d){return "kokatu"},
"blockPlaceXPlace":function(d){return "kokatu"},
"blockPlantCrop":function(d){return "uzta landatu"},
"blockShear":function(d){return "ilea moztu"},
"blockTillSoil":function(d){return "lurra landu"},
"blockTurnLeft":function(d){return "biratu ezkerrera"},
"blockTurnRight":function(d){return "biratu eskuinera"},
"blockTypeBedrock":function(d){return "harkaitz"},
"blockTypeBricks":function(d){return "adreiluak"},
"blockTypeClay":function(d){return "buztin"},
"blockTypeClayHardened":function(d){return "buztin lehorra"},
"blockTypeCobblestone":function(d){return "galtzada-harri"},
"blockTypeDirt":function(d){return "lurra"},
"blockTypeDirtCoarse":function(d){return "lur zakarra"},
"blockTypeEmpty":function(d){return "huts"},
"blockTypeFarmlandWet":function(d){return "laborantzako lurra"},
"blockTypeGlass":function(d){return "beira"},
"blockTypeGrass":function(d){return "belarra"},
"blockTypeGravel":function(d){return "hartxintxar"},
"blockTypeLava":function(d){return "laba"},
"blockTypeLogAcacia":function(d){return "akazia egurra"},
"blockTypeLogBirch":function(d){return "urki egurra"},
"blockTypeLogJungle":function(d){return "oihaneko zuhaitzen egurra"},
"blockTypeLogOak":function(d){return "haritz egurra"},
"blockTypeLogSpruce":function(d){return "izei egurra"},
"blockTypeOreCoal":function(d){return "ikatz mineral"},
"blockTypeOreDiamond":function(d){return "diamante mineral"},
"blockTypeOreEmerald":function(d){return "esmeralda mineral"},
"blockTypeOreGold":function(d){return "urre mineral"},
"blockTypeOreIron":function(d){return "burdin mineral"},
"blockTypeOreLapis":function(d){return "lapis mineral"},
"blockTypeOreRedstone":function(d){return "harri gorrixka mea"},
"blockTypePlanksAcacia":function(d){return "akazia oholak"},
"blockTypePlanksBirch":function(d){return "urki oholak"},
"blockTypePlanksJungle":function(d){return "oihaneko zuhaitzen oholak"},
"blockTypePlanksOak":function(d){return "haritz oholak"},
"blockTypePlanksSpruce":function(d){return "izei oholak"},
"blockTypeRail":function(d){return "erraila"},
"blockTypeSand":function(d){return "hondarra"},
"blockTypeSandstone":function(d){return "hareharria"},
"blockTypeStone":function(d){return "harria"},
"blockTypeTnt":function(d){return "dinamita"},
"blockTypeTree":function(d){return "zuhaitza"},
"blockTypeWater":function(d){return "ura"},
"blockTypeWool":function(d){return "artile"},
"blockWhileXAheadAhead":function(d){return "aurrean"},
"blockWhileXAheadDo":function(d){return "egin"},
"blockWhileXAheadWhile":function(d){return "bitartean"},
"generatedCodeDescription":function(d){return "Ariketa honetan blokeak arrastatu eta kokatuz, Javascript izeneko konputagailu lengoaia batean agindu sekuentzia bat sortu duzu. Kode honek ordenagailuari esaten dio zer azaldu pantailan. Minecraften ikusi eta egiten duzun guztia honelako konputagailu kode batekin hasten da."},
"houseSelectChooseFloorPlan":function(d){return "Aukeratu zure etxerako planoa."},
"houseSelectEasy":function(d){return "Erraza"},
"houseSelectHard":function(d){return "Zaila"},
"houseSelectLetsBuild":function(d){return "Eraiki dezagun etxe bat."},
"houseSelectMedium":function(d){return "Ertaina"},
"keepPlayingButton":function(d){return "Jarraitu jolasten"},
"level10FailureMessage":function(d){return "Estali laba, gainetik pasatzeko. Orduan, suntsitu beste aldean dauden burdin blokeetako bi."},
"level11FailureMessage":function(d){return "Ziurtatu galtzada-harriak zure aurretik jartzen dituzula, aurrean laba baldin badago. Horri esker, baliabide lerro hau suntsitu ahal izango duzu."},
"level12FailureMessage":function(d){return "Ziurtatu harri gorrixkaren 3 bloke suntsitu dituzula. Horrekin, zure etxea eraikitzen ikasi duzuna konbinatu egiten da \"baldin\" aginduen erabilerarekin, laban erortzen saihesteko."},
"level13FailureMessage":function(d){return "Kokatu \"errail\" bat zure atetik mapako mugaraino doan lurrezko bidean."},
"level1FailureMessage":function(d){return "Aginduak erabili behar dituzu ardiarenganaino joateko."},
"level1TooFewBlocksMessage":function(d){return "Saiatu agindu gehiago erabiltzen ardiarenganaino iristeko."},
"level2FailureMessage":function(d){return "Zuhaitz bat botatzeko, joan bere enborreraino eta erabili \"txikitu blokea\" agindua."},
"level2TooFewBlocksMessage":function(d){return "Saiatu agindu gehiago erabiltzen zuhaitza botatzeko. Joan bere enborreraino eta erabili \"txikitu blokea\" agindua."},
"level3FailureMessage":function(d){return "Bi ardiengandik artilea biltzeko, joan bakoitzarenganaino eta erabili \"moztu\" agindua. Gogoratu biraketa aginduak erabili beharko dituzula ardienganaino iristeko."},
"level3TooFewBlocksMessage":function(d){return "Saiatu agindu gehiago erabiltzen artilea biltzeko bi ardiengandik. Joan bakoitzarenganaino eta erabili \"moztu\" agindua."},
"level4FailureMessage":function(d){return "\"txikitu blokea\" agindua erabili behar duzu hiru zuhaitzen enborretan."},
"level5FailureMessage":function(d){return "Kokatu zure blokeak lurrezko lerroan, horma bat eraikitzeko. \"errepikatu\" agindu arrosak egikarituko ditu bere barruan kokaturiko aginduak, \"kokatu blokea\" eta \"mugitu aurrera\" bezalakoak."},
"level6FailureMessage":function(d){return "Kokatu blokeak etxearen perimetroko lurrezko marran, ariketa amaitzeko."},
"level7FailureMessage":function(d){return "Erabili \"landatu\" agindua landareak kokatzeko ilundutako zoruko sail bakoitzean."},
"level8FailureMessage":function(d){return "Landare igokari bat ukitzen baduzu, lehertu egingo da. Saihestu itzazu eta sartu zure etxean."},
"level9FailureMessage":function(d){return "Ez ahaztu gutxienez 2 lastargi kokatzeaz zure bidea argitzeko ETA 2 ikatz erauzteaz."},
"minecraftBlock":function(d){return "bloke"},
"nextLevelMsg":function(d){return craft_locale.v(d,"puzzleNumber")+" puzzlea osatuta. Zorionak!"},
"playerSelectChooseCharacter":function(d){return "Aukeratu zure pertsonaia."},
"playerSelectChooseSelectButton":function(d){return "Aukeratu"},
"playerSelectLetsGetStarted":function(d){return "Has gaitezen."},
"reinfFeedbackMsg":function(d){return "\"Jokatzen jarraitu\" sakatu dezakezu zure jokuan jokatzen jarraitzeko."},
"replayButton":function(d){return "Errepikatu"},
"selectChooseButton":function(d){return "Aukeratu"},
"tooManyBlocksFail":function(d){return craft_locale.v(d,"puzzleNumber")+" puzlea osatu da. Zorionak! bloke. "+craft_locale.p(d,"numBlocks",0,"eu",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" ekin ere osatu daiteke."}};