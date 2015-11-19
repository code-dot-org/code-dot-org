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
"blockPlaceXAheadAhead":function(d){return "framundan"},
"blockPlaceXAheadPlace":function(d){return "setja"},
"blockPlaceXPlace":function(d){return "setja"},
"blockPlantCrop":function(d){return "planta jurt"},
"blockShear":function(d){return "rýja"},
"blockTillSoil":function(d){return "yrkja mold"},
"blockTurnLeft":function(d){return "snúa til vinstri"},
"blockTurnRight":function(d){return "snúa til hægri"},
"blockTypeBedrock":function(d){return "grunnklöpp"},
"blockTypeBricks":function(d){return "múrsteinar"},
"blockTypeClay":function(d){return "leir"},
"blockTypeClayHardened":function(d){return "hertur leir"},
"blockTypeCobblestone":function(d){return "hleðslusteinn"},
"blockTypeDirt":function(d){return "mold"},
"blockTypeDirtCoarse":function(d){return "gróf mold"},
"blockTypeEmpty":function(d){return "tómt"},
"blockTypeFarmlandWet":function(d){return "ræktarjörð"},
"blockTypeGlass":function(d){return "gler"},
"blockTypeGrass":function(d){return "gras"},
"blockTypeGravel":function(d){return "möl"},
"blockTypeLava":function(d){return "hraun"},
"blockTypeLogAcacia":function(d){return "akasíudrumbur"},
"blockTypeLogBirch":function(d){return "birkidrumbur"},
"blockTypeLogJungle":function(d){return "frumskógardrumbur"},
"blockTypeLogOak":function(d){return "eikardrumbur"},
"blockTypeLogSpruce":function(d){return "grenidrumbur"},
"blockTypeOreCoal":function(d){return "kolagrýti"},
"blockTypeOreDiamond":function(d){return "demantagrýti"},
"blockTypeOreEmerald":function(d){return "smaragðagrýti"},
"blockTypeOreGold":function(d){return "gullgrýti"},
"blockTypeOreIron":function(d){return "járngrýti"},
"blockTypeOreLapis":function(d){return "blásteinsgrýti"},
"blockTypeOreRedstone":function(d){return "roðasteinsgrýti"},
"blockTypePlanksAcacia":function(d){return "akasíuplankar"},
"blockTypePlanksBirch":function(d){return "birkiplankar"},
"blockTypePlanksJungle":function(d){return "frumskógarplankar"},
"blockTypePlanksOak":function(d){return "eikarplankar"},
"blockTypePlanksSpruce":function(d){return "greniplankar"},
"blockTypeRail":function(d){return "teinar"},
"blockTypeSand":function(d){return "sandur"},
"blockTypeSandstone":function(d){return "sandsteinn"},
"blockTypeStone":function(d){return "steinn"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "tré"},
"blockTypeWater":function(d){return "vatn"},
"blockTypeWool":function(d){return "ull"},
"blockWhileXAheadAhead":function(d){return "framundan"},
"blockWhileXAheadDo":function(d){return "gera"},
"blockWhileXAheadWhile":function(d){return "meðan"},
"generatedCodeDescription":function(d){return "Með því að draga og setja kubba í þessa þraut hefur þú búið til röð fyrirmæla á tölvutungumáli sem nefnist JavaScript. Það segir tölvum hvað á að sýna á skjánum. Allt sem þú sérð og gerir í MineCraft byrjar líka á svona línum af tölvukóða."},
"houseSelectChooseFloorPlan":function(d){return "Veldu grunnteikningu fyrir húsið þitt."},
"houseSelectEasy":function(d){return "Auðveld"},
"houseSelectHard":function(d){return "Erfið"},
"houseSelectLetsBuild":function(d){return "Förum að byggja hús."},
"houseSelectMedium":function(d){return "Miðlungs"},
"keepPlayingButton":function(d){return "Spila áfram"},
"level10FailureMessage":function(d){return "Fylltu upp í hraunið til að ganga yfir og grafðu svo út tvær járnblokkir hinum megin."},
"level11FailureMessage":function(d){return "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."},
"level12FailureMessage":function(d){return "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."},
"level13FailureMessage":function(d){return "Place \"rail\" along the dirt path leading from your door to the edge of the map."},
"level1FailureMessage":function(d){return "You need to use commands to walk to the sheep."},
"level1TooFewBlocksMessage":function(d){return "Try using more commands to walk to the sheep."},
"level2FailureMessage":function(d){return "To chop down a tree, walk to its trunk and use the \"destroy block\" command."},
"level2TooFewBlocksMessage":function(d){return "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command."},
"level3FailureMessage":function(d){return "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep."},
"level3TooFewBlocksMessage":function(d){return "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."},
"level4FailureMessage":function(d){return "You must use the \"destroy block\" command on each of the three tree trunks."},
"level5FailureMessage":function(d){return "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "If you touch a creeper it will explode. Sneak around them and enter your house."},
"level9FailureMessage":function(d){return "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal."},
"minecraftBlock":function(d){return "block"},
"nextLevelMsg":function(d){return "Þraut "+craft_locale.v(d,"puzzleNumber")+" lokið. Til hamingju!"},
"playerSelectChooseCharacter":function(d){return "Choose your character."},
"playerSelectChooseSelectButton":function(d){return "Select"},
"playerSelectLetsGetStarted":function(d){return "Let's get started."},
"reinfFeedbackMsg":function(d){return "Þú getur ýtt á \"Spila áfram\" til að fara aftur í að spila leikinn þinn."},
"replayButton":function(d){return "Replay"},
"selectChooseButton":function(d){return "Select"},
"tooManyBlocksFail":function(d){return "Þraut "+craft_locale.v(d,"puzzleNumber")+" lokið. Til hamingju! Það er líka hægt að ljúka henni með "+craft_locale.p(d,"numBlocks",0,"is",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};