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
"blockDestroyBlock":function(d){return "sirain ang bloke"},
"blockIf":function(d){return "kung"},
"blockIfLavaAhead":function(d){return "kapag may lava sa unahan"},
"blockMoveForward":function(d){return "umabante"},
"blockPlaceTorch":function(d){return "lagay ng tanglaw"},
"blockPlaceXAheadAhead":function(d){return "unahan"},
"blockPlaceXAheadPlace":function(d){return "lagay"},
"blockPlaceXPlace":function(d){return "lagay"},
"blockPlantCrop":function(d){return "mananim ng halaman"},
"blockShear":function(d){return "gupitan"},
"blockTillSoil":function(d){return "till soil"},
"blockTurnLeft":function(d){return "kumaliwa"},
"blockTurnRight":function(d){return "kumanan"},
"blockTypeBedrock":function(d){return "bedrock"},
"blockTypeBricks":function(d){return "laryo"},
"blockTypeClay":function(d){return "luad"},
"blockTypeClayHardened":function(d){return "tumigas na luad"},
"blockTypeCobblestone":function(d){return "magulong bato"},
"blockTypeDirt":function(d){return "lupa"},
"blockTypeDirtCoarse":function(d){return "magaspang na lupa"},
"blockTypeEmpty":function(d){return "bakante"},
"blockTypeFarmlandWet":function(d){return "bukiran"},
"blockTypeGlass":function(d){return "salamin"},
"blockTypeGrass":function(d){return "damo"},
"blockTypeGravel":function(d){return "graba"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "trosong akasya"},
"blockTypeLogBirch":function(d){return "trosong birch"},
"blockTypeLogJungle":function(d){return "trosong gubat"},
"blockTypeLogOak":function(d){return "trosong oak"},
"blockTypeLogSpruce":function(d){return "trosong spruce"},
"blockTypeOreCoal":function(d){return "mineral ng uling"},
"blockTypeOreDiamond":function(d){return "mineral ng dyamante"},
"blockTypeOreEmerald":function(d){return "mineral ng esmeralda"},
"blockTypeOreGold":function(d){return "mineral ng ginto"},
"blockTypeOreIron":function(d){return "mineral ng bakal"},
"blockTypeOreLapis":function(d){return "mineral ng asul na pangulay"},
"blockTypeOreRedstone":function(d){return "mineral ng redstone"},
"blockTypePlanksAcacia":function(d){return "tablang akasya"},
"blockTypePlanksBirch":function(d){return "tablang birch"},
"blockTypePlanksJungle":function(d){return "tablang kahoy ng gubat"},
"blockTypePlanksOak":function(d){return "tablang oak"},
"blockTypePlanksSpruce":function(d){return "tablang spruce"},
"blockTypeRail":function(d){return "riles"},
"blockTypeSand":function(d){return "buhangin"},
"blockTypeSandstone":function(d){return "matigas na buhangin"},
"blockTypeStone":function(d){return "bato"},
"blockTypeTnt":function(d){return "bomba"},
"blockTypeTree":function(d){return "puno"},
"blockTypeWater":function(d){return "tubig"},
"blockTypeWool":function(d){return "lana"},
"blockWhileXAheadAhead":function(d){return "unahan"},
"blockWhileXAheadDo":function(d){return "gawin"},
"blockWhileXAheadWhile":function(d){return "habang"},
"generatedCodeDescription":function(d){return "Sa pamagitan ng dragging at placing ng bloke sa puzzle na ito, ika'y nakagawa ng mga instruksyon sa loob ng isang linguahe na ginagamit ng kompyuter na tawag ay JavaScript. Ang code ay ang nagsasabi sa mga kompyuter kung ano ang kinakailangan ipakita sa screen. Lahat ng kinakailang mong makita at gawin sa Minecraft ay nagsisimula rin sa mga linya ng computer code na ganito."},
"houseSelectChooseFloorPlan":function(d){return "Pumili ng plano para sa sahig ng iyong bahay."},
"houseSelectEasy":function(d){return "Madali"},
"houseSelectHard":function(d){return "Mahirap"},
"houseSelectLetsBuild":function(d){return "Tayo ay magtayo ng bahay."},
"houseSelectMedium":function(d){return "Medium"},
"keepPlayingButton":function(d){return "Panantilihan ang Linalaro"},
"level10FailureMessage":function(d){return "I-cover ang lava para maka daan, pagkatapos, i-mina ang dalawang bloke ng bakal sa kabilang gilid."},
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
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations!"},
"playerSelectChooseCharacter":function(d){return "Choose your character."},
"playerSelectChooseSelectButton":function(d){return "Select"},
"playerSelectLetsGetStarted":function(d){return "Let's get started."},
"reinfFeedbackMsg":function(d){return "You can press \"Keep Playing\" to go back to playing your game."},
"replayButton":function(d){return "Replay"},
"selectChooseButton":function(d){return "Select"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"fil",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};