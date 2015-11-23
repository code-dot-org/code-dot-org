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
"blockDestroyBlock":function(d){return "摧毀方塊"},
"blockIf":function(d){return "如果"},
"blockIfLavaAhead":function(d){return "如果前方有岩漿"},
"blockMoveForward":function(d){return "向前移動"},
"blockPlaceTorch":function(d){return "放置火把"},
"blockPlaceXAheadAhead":function(d){return "向前"},
"blockPlaceXAheadPlace":function(d){return "放置"},
"blockPlaceXPlace":function(d){return "放置"},
"blockPlantCrop":function(d){return "種植作物"},
"blockShear":function(d){return "修剪"},
"blockTillSoil":function(d){return "耕種土壤"},
"blockTurnLeft":function(d){return "向左轉"},
"blockTurnRight":function(d){return "向右轉"},
"blockTypeBedrock":function(d){return "基石"},
"blockTypeBricks":function(d){return "磚塊"},
"blockTypeClay":function(d){return "黏土"},
"blockTypeClayHardened":function(d){return "硬化黏土"},
"blockTypeCobblestone":function(d){return "鵝卵石"},
"blockTypeDirt":function(d){return "泥土"},
"blockTypeDirtCoarse":function(d){return "粗泥"},
"blockTypeEmpty":function(d){return "空"},
"blockTypeFarmlandWet":function(d){return "農田"},
"blockTypeGlass":function(d){return "玻璃"},
"blockTypeGrass":function(d){return "草地"},
"blockTypeGravel":function(d){return "碎石"},
"blockTypeLava":function(d){return "岩漿"},
"blockTypeLogAcacia":function(d){return "acacia log"},
"blockTypeLogBirch":function(d){return "birch log"},
"blockTypeLogJungle":function(d){return "jungle log"},
"blockTypeLogOak":function(d){return "oak log"},
"blockTypeLogSpruce":function(d){return "spruce log"},
"blockTypeOreCoal":function(d){return "煤炭礦"},
"blockTypeOreDiamond":function(d){return "鑽石礦"},
"blockTypeOreEmerald":function(d){return "emerald ore"},
"blockTypeOreGold":function(d){return "金礦"},
"blockTypeOreIron":function(d){return "鐵礦"},
"blockTypeOreLapis":function(d){return "lapis ore"},
"blockTypeOreRedstone":function(d){return "紅石礦"},
"blockTypePlanksAcacia":function(d){return "acacia planks"},
"blockTypePlanksBirch":function(d){return "birch planks"},
"blockTypePlanksJungle":function(d){return "jungle planks"},
"blockTypePlanksOak":function(d){return "oak planks"},
"blockTypePlanksSpruce":function(d){return "spruce planks"},
"blockTypeRail":function(d){return "鐵路"},
"blockTypeSand":function(d){return "沙子"},
"blockTypeSandstone":function(d){return "砂岩"},
"blockTypeStone":function(d){return "石頭"},
"blockTypeTnt":function(d){return "炸彈"},
"blockTypeTree":function(d){return "樹"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "木材"},
"blockWhileXAheadAhead":function(d){return "向前"},
"blockWhileXAheadDo":function(d){return "執行"},
"blockWhileXAheadWhile":function(d){return "當"},
"generatedCodeDescription":function(d){return "在這個謎題中，透過拖曳跟放置程式積木的方式，你已經完成建立一種名叫 Javascript 電腦語言的系列指令。這些程式碼告訴電腦要將那些訊息顯示在電腦畫面上。你在\"當個創世神 Minecraft\" 中所見到跟做的任何事情也都是由一行一行的程式開始建構完成的。"},
"houseSelectChooseFloorPlan":function(d){return "Choose the floor plan for your house."},
"houseSelectEasy":function(d){return "輕易"},
"houseSelectHard":function(d){return "困難"},
"houseSelectLetsBuild":function(d){return "蓋一間房子吧!"},
"houseSelectMedium":function(d){return "一般"},
"keepPlayingButton":function(d){return "繼續玩"},
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
"level6FailureMessage":function(d){return "在房子周圍的泥地上放置方塊來完成這個關卡。"},
"level7FailureMessage":function(d){return "Use the \"種植\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "如果你碰觸到綠色爬蟲會使牠爆炸。以蛇行的方式繞過牠們進入你家。"},
"level9FailureMessage":function(d){return "別忘了至少要放置兩個火把來照亮你的道路，同時至少挖掘2個煤礦。"},
"minecraftBlock":function(d){return "block"},
"nextLevelMsg":function(d){return "恭喜你! 完成了謎題"+craft_locale.v(d,"puzzleNumber")+"。"},
"playerSelectChooseCharacter":function(d){return "選擇你的角色"},
"playerSelectChooseSelectButton":function(d){return "選擇"},
"playerSelectLetsGetStarted":function(d){return "讓我們開始吧:"},
"reinfFeedbackMsg":function(d){return "你可以按下\"繼續玩\"重新開始玩遊戲。"},
"replayButton":function(d){return "重新開始"},
"selectChooseButton":function(d){return "選擇"},
"tooManyBlocksFail":function(d){return "恭喜你! 完成了謎題"+craft_locale.v(d,"puzzleNumber")+"。但這個關卡可以只使用 "+craft_locale.p(d,"numBlocks",0,"zh",{"one":"1 個程式積木","other":craft_locale.n(d,"numBlocks")+" 個程式積木"})+"來完成。"}};