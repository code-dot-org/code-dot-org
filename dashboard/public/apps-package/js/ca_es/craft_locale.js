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
"blockDestroyBlock":function(d){return "destruir bloc"},
"blockIf":function(d){return "si"},
"blockIfLavaAhead":function(d){return "si hi ha lava a davant"},
"blockMoveForward":function(d){return "avança"},
"blockPlaceTorch":function(d){return "posa una torxa"},
"blockPlaceXAheadAhead":function(d){return "endavant"},
"blockPlaceXAheadPlace":function(d){return "posa"},
"blockPlaceXPlace":function(d){return "posa"},
"blockPlantCrop":function(d){return "cultiu de plantes"},
"blockShear":function(d){return "tallar"},
"blockTillSoil":function(d){return "fins a terra"},
"blockTurnLeft":function(d){return "gira a l'esquerra"},
"blockTurnRight":function(d){return "gira a la dreta"},
"blockTypeBedrock":function(d){return "roca mare"},
"blockTypeBricks":function(d){return "maons"},
"blockTypeClay":function(d){return "argila"},
"blockTypeClayHardened":function(d){return "argila endurida (maons)"},
"blockTypeCobblestone":function(d){return "empedrat"},
"blockTypeDirt":function(d){return "terra"},
"blockTypeDirtCoarse":function(d){return "coarse dirt"},
"blockTypeEmpty":function(d){return "buit"},
"blockTypeFarmlandWet":function(d){return "farmland"},
"blockTypeGlass":function(d){return "vidre"},
"blockTypeGrass":function(d){return "herba"},
"blockTypeGravel":function(d){return "grava"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "acacia log"},
"blockTypeLogBirch":function(d){return "birch log"},
"blockTypeLogJungle":function(d){return "jungle log"},
"blockTypeLogOak":function(d){return "oak log"},
"blockTypeLogSpruce":function(d){return "spruce log"},
"blockTypeOreCoal":function(d){return "coal ore"},
"blockTypeOreDiamond":function(d){return "diamond ore"},
"blockTypeOreEmerald":function(d){return "emerald ore"},
"blockTypeOreGold":function(d){return "gold ore"},
"blockTypeOreIron":function(d){return "iron ore"},
"blockTypeOreLapis":function(d){return "lapis ore"},
"blockTypeOreRedstone":function(d){return "redstone ore"},
"blockTypePlanksAcacia":function(d){return "acacia planks"},
"blockTypePlanksBirch":function(d){return "birch planks"},
"blockTypePlanksJungle":function(d){return "jungle planks"},
"blockTypePlanksOak":function(d){return "oak planks"},
"blockTypePlanksSpruce":function(d){return "spruce planks"},
"blockTypeRail":function(d){return "rail"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandstone"},
"blockTypeStone":function(d){return "stone"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "tree"},
"blockTypeWater":function(d){return "water"},
"blockTypeWool":function(d){return "wool"},
"blockWhileXAheadAhead":function(d){return "endavant"},
"blockWhileXAheadDo":function(d){return "fes"},
"blockWhileXAheadWhile":function(d){return "mentres"},
"generatedCodeDescription":function(d){return "By dragging and placing blocks in this puzzle, you've created a set of instructions in a computer language called Javascript. This code tells computers what to display on the screen. Everything you see and do in Minecraft also starts with lines of computer code like these."},
"houseSelectChooseFloorPlan":function(d){return "Tria la planta de la teva casa."},
"houseSelectEasy":function(d){return "Senzill"},
"houseSelectHard":function(d){return "Difícil"},
"houseSelectLetsBuild":function(d){return "Construïm una casa."},
"houseSelectMedium":function(d){return "Mitjà"},
"keepPlayingButton":function(d){return "Keep Playing"},
"level10FailureMessage":function(d){return "Cover up the lava to walk across, then mine two of the iron blocks on the other side."},
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
"nextLevelMsg":function(d){return "Trencaclosques "+craft_locale.v(d,"puzzleNumber")+" completat. Felicitats!"},
"playerSelectChooseCharacter":function(d){return "Tria el teu personatge."},
"playerSelectChooseSelectButton":function(d){return "Tria"},
"playerSelectLetsGetStarted":function(d){return "Som-hi."},
"reinfFeedbackMsg":function(d){return "You can press \"Keep Playing\" to go back to playing your game."},
"replayButton":function(d){return "Repeteix"},
"selectChooseButton":function(d){return "Tria"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"ca",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};