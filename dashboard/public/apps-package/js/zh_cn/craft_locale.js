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
"blockDestroyBlock":function(d){return "摧毁方块"},
"blockIf":function(d){return "如果"},
"blockIfLavaAhead":function(d){return "如果前面有熔岩"},
"blockMoveForward":function(d){return "向前移动"},
"blockPlaceTorch":function(d){return "放下火把"},
"blockPlaceXAheadAhead":function(d){return "前面"},
"blockPlaceXAheadPlace":function(d){return "放下"},
"blockPlaceXPlace":function(d){return "放下"},
"blockPlantCrop":function(d){return "种植作物"},
"blockShear":function(d){return "剪"},
"blockTillSoil":function(d){return "耕地"},
"blockTurnLeft":function(d){return "向左转"},
"blockTurnRight":function(d){return "向右转"},
"blockTypeBedrock":function(d){return "基岩"},
"blockTypeBricks":function(d){return "砖块"},
"blockTypeClay":function(d){return "粘土块"},
"blockTypeClayHardened":function(d){return "硬化粘土"},
"blockTypeCobblestone":function(d){return "圆石"},
"blockTypeDirt":function(d){return "泥土"},
"blockTypeDirtCoarse":function(d){return "砂土"},
"blockTypeEmpty":function(d){return "空"},
"blockTypeFarmlandWet":function(d){return "耕地"},
"blockTypeGlass":function(d){return "玻璃"},
"blockTypeGrass":function(d){return "草丛"},
"blockTypeGravel":function(d){return "砂砾"},
"blockTypeLava":function(d){return "岩浆"},
"blockTypeLogAcacia":function(d){return "金合欢木"},
"blockTypeLogBirch":function(d){return "桦树木"},
"blockTypeLogJungle":function(d){return "丛林木"},
"blockTypeLogOak":function(d){return "橡树木"},
"blockTypeLogSpruce":function(d){return "云杉木"},
"blockTypeOreCoal":function(d){return "煤矿石"},
"blockTypeOreDiamond":function(d){return "钻石矿石"},
"blockTypeOreEmerald":function(d){return "绿宝石矿石"},
"blockTypeOreGold":function(d){return "金矿石"},
"blockTypeOreIron":function(d){return "铁矿石"},
"blockTypeOreLapis":function(d){return "青金矿石"},
"blockTypeOreRedstone":function(d){return "红石矿石"},
"blockTypePlanksAcacia":function(d){return "金合欢木板"},
"blockTypePlanksBirch":function(d){return "桦木板"},
"blockTypePlanksJungle":function(d){return "丛林木板"},
"blockTypePlanksOak":function(d){return "橡木板"},
"blockTypePlanksSpruce":function(d){return "云杉木板"},
"blockTypeRail":function(d){return "铁轨"},
"blockTypeSand":function(d){return "沙子"},
"blockTypeSandstone":function(d){return "沙石"},
"blockTypeStone":function(d){return "石头"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "树"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "前面"},
"blockWhileXAheadDo":function(d){return "执行"},
"blockWhileXAheadWhile":function(d){return "当"},
"generatedCodeDescription":function(d){return "通过在这个谜题中拖动和放置方块，你就已经用一种名为 Javascript 的计算机语言建立了一组指令。此代码会告诉计算机在屏幕上显示什么内容。你在 我的世界 中见到和所做的事情，也是从这样的计算机代码行开始的。"},
"houseSelectChooseFloorPlan":function(d){return "为你的房子选择平面图。"},
"houseSelectEasy":function(d){return "简单"},
"houseSelectHard":function(d){return "困难"},
"houseSelectLetsBuild":function(d){return "我们来建一座房子。"},
"houseSelectMedium":function(d){return "中等"},
"keepPlayingButton":function(d){return "继续游戏"},
"level10FailureMessage":function(d){return "覆盖住要走过的岩浆，然后开采另一边的两个铁块。"},
"level11FailureMessage":function(d){return "如果前面有岩浆，一定要将圆石放在前面。这样做可以让你安全开采这排资源。"},
"level12FailureMessage":function(d){return "一定要开采 3 块红石块。这能将你从建造房子以及使用 \"如果\" 语句避免掉入岩浆中所学到的知识组合起来。"},
"level13FailureMessage":function(d){return "沿泥土路放下 \"铁轨\"，从你的门口一直铺到地图边缘。"},
"level1FailureMessage":function(d){return "你需要使用命令走到羊那里。"},
"level1TooFewBlocksMessage":function(d){return "试试用更多命令走到羊那里。"},
"level2FailureMessage":function(d){return "要砍倒一颗树，走到树干处，使用 \"摧毁方块\" 命令。"},
"level2TooFewBlocksMessage":function(d){return "试试用更多命令砍倒树。走到树干处，使用 \"摧毁方块\" 命令。"},
"level3FailureMessage":function(d){return "要从两只羊身上收集羊毛，走到每只羊身边使用 \"剪\" 命令。记住可以使用转向命令到达羊所在位置。"},
"level3TooFewBlocksMessage":function(d){return "试试用更多命令从两只羊身上收集羊毛。走到每只羊身边使用 \"剪\" 命令。"},
"level4FailureMessage":function(d){return "你必须对三根树干分别使用 \"摧毁方块\" 命令。"},
"level5FailureMessage":function(d){return "将方块放在泥土轮廓上可以建造一堵墙。粉色的 \"重复\" 命令会运行放置在其中的命令，比如 \"放下方块\" 和 \"向前移动\"。"},
"level6FailureMessage":function(d){return "将方块放在房子的泥土轮廓上，完成谜题。"},
"level7FailureMessage":function(d){return "使用 \"种植\" 命令，将作物放在黑色已耕地的每个小块上。"},
"level8FailureMessage":function(d){return "如果你接触到爬行者，它会发生爆炸。在它们附近悄悄活动，进入自己的房子。"},
"level9FailureMessage":function(d){return "别忘记放下至少 2 根火把，照亮你的道路，并且至少开采 2 块煤炭。"},
"minecraftBlock":function(d){return "方块"},
"nextLevelMsg":function(d){return "谜题 "+craft_locale.v(d,"puzzleNumber")+" 已完成，恭喜！"},
"playerSelectChooseCharacter":function(d){return "选择你的角色。"},
"playerSelectChooseSelectButton":function(d){return "选择"},
"playerSelectLetsGetStarted":function(d){return "我们开始吧。"},
"reinfFeedbackMsg":function(d){return "你可以按 \"继续游戏\"，返回继续进行游戏。"},
"replayButton":function(d){return "回放"},
"selectChooseButton":function(d){return "选择"},
"tooManyBlocksFail":function(d){return "谜题 "+craft_locale.v(d,"puzzleNumber")+" 已完成，恭喜！你也可以使用 "+craft_locale.p(d,"numBlocks",0,"zh",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" 来完成."}};