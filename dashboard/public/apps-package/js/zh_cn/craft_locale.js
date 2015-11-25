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
"blockPlaceTorch":function(d){return "放置火把"},
"blockPlaceXAheadAhead":function(d){return "前面"},
"blockPlaceXAheadPlace":function(d){return "放置"},
"blockPlaceXPlace":function(d){return "放置"},
"blockPlantCrop":function(d){return "种植作物"},
"blockShear":function(d){return "修剪"},
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
"blockTypeEmpty":function(d){return "空的"},
"blockTypeFarmlandWet":function(d){return "耕地"},
"blockTypeGlass":function(d){return "玻璃"},
"blockTypeGrass":function(d){return "草方块"},
"blockTypeGravel":function(d){return "沙砾"},
"blockTypeLava":function(d){return "岩浆"},
"blockTypeLogAcacia":function(d){return "金合欢树原木"},
"blockTypeLogBirch":function(d){return "白桦树原木"},
"blockTypeLogJungle":function(d){return "丛林树原木"},
"blockTypeLogOak":function(d){return "橡树原木"},
"blockTypeLogSpruce":function(d){return "云杉树原木"},
"blockTypeOreCoal":function(d){return "煤矿"},
"blockTypeOreDiamond":function(d){return "钻石矿"},
"blockTypeOreEmerald":function(d){return "绿宝石矿"},
"blockTypeOreGold":function(d){return "金矿"},
"blockTypeOreIron":function(d){return "铁矿"},
"blockTypeOreLapis":function(d){return "青金石矿"},
"blockTypeOreRedstone":function(d){return "红石矿"},
"blockTypePlanksAcacia":function(d){return "金合欢木板"},
"blockTypePlanksBirch":function(d){return "白桦木板"},
"blockTypePlanksJungle":function(d){return "丛林木板"},
"blockTypePlanksOak":function(d){return "橡木木板"},
"blockTypePlanksSpruce":function(d){return "云杉木板"},
"blockTypeRail":function(d){return "铁轨"},
"blockTypeSand":function(d){return "沙子"},
"blockTypeSandstone":function(d){return "沙石"},
"blockTypeStone":function(d){return "石头"},
"blockTypeTnt":function(d){return "TNT炸药"},
"blockTypeTree":function(d){return "树"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "前面"},
"blockWhileXAheadDo":function(d){return "执行"},
"blockWhileXAheadWhile":function(d){return "当"},
"generatedCodeDescription":function(d){return "通过在这个智力游戏中拖动并放置模块，您已经创建了一段Javascript的程序代码。这段代码告诉计算机将什么显示到屏幕上。Minecraft中所有你能看到的和能做到的，都是这样的程序代码所完成的。"},
"houseSelectChooseFloorPlan":function(d){return "选择房子的平面图"},
"houseSelectEasy":function(d){return "容易"},
"houseSelectHard":function(d){return "困难"},
"houseSelectLetsBuild":function(d){return "开始建房子吧！"},
"houseSelectMedium":function(d){return "中等"},
"keepPlayingButton":function(d){return "继续玩"},
"level10FailureMessage":function(d){return "将岩浆覆盖后走到对面，然后挖两块铁矿。"},
"level11FailureMessage":function(d){return "如果前面有岩浆，你得在前面放上圆石才能安全的开采资源。"},
"level12FailureMessage":function(d){return "确保挖到三块红石矿。你不仅需要学习如何建造房子，也要学会如何使用“如果\"语句来避免掉到熔岩里。"},
"level13FailureMessage":function(d){return "将铁轨沿着泥路一直从门口铺到地图边缘。"},
"level1FailureMessage":function(d){return "你需要用模块来走到羊旁边。"},
"level1TooFewBlocksMessage":function(d){return "试着用更多的模块来走到羊旁边。"},
"level2FailureMessage":function(d){return "如果要砍倒一棵树，需要走到树干前，然后使用”摧毁方块“模块。"},
"level2TooFewBlocksMessage":function(d){return "试着用更多的模块来砍到树木。走到树干那里，然后使用”摧毁方块“模块。"},
"level3FailureMessage":function(d){return "走到每只羊旁边，用“修剪”模块来收集羊毛。记住使用”向左转“、”向右转“模块来走到羊旁边。"},
"level3TooFewBlocksMessage":function(d){return "试着用更多的模块来收集这两只羊的羊毛。走到每只羊旁边，然后使用”修剪“模块。"},
"level4FailureMessage":function(d){return "必须对三个树干都使用“摧毁方块”模块。"},
"level5FailureMessage":function(d){return "用方块按照泥地的轮廓建造一堵墙。粉色的“循环”模块可以重复执行里面的程序模块，例如，“放置方块”，“向前移动”等等。"},
"level6FailureMessage":function(d){return "在房子周围的泥地上放置方块来完成这个关卡。"},
"level7FailureMessage":function(d){return "使用”种植“命令来将庄稼种到每块黑色耕地上。"},
"level8FailureMessage":function(d){return "如果你碰到苦力怕，他就会爆炸。偷偷的绕过他们回到屋子里。"},
"level9FailureMessage":function(d){return "别忘了至少放置两个火把来照亮道路，并且挖掘至少两块煤。"},
"minecraftBlock":function(d){return "方块"},
"nextLevelMsg":function(d){return "祝贺你完成了第 "+craft_locale.v(d,"puzzleNumber")+" 关！"},
"playerSelectChooseCharacter":function(d){return "选择你的角色。"},
"playerSelectChooseSelectButton":function(d){return "选择"},
"playerSelectLetsGetStarted":function(d){return "让我们开始吧！"},
"reinfFeedbackMsg":function(d){return "您可以按”继续玩“继续游戏。"},
"replayButton":function(d){return "重新开始"},
"selectChooseButton":function(d){return "选择"},
"tooManyBlocksFail":function(d){return "谜团 "+craft_locale.v(d,"puzzleNumber")+" 解出。祝贺您！这也可能与 "+craft_locale.p(d,"numBlocks",0,"zh",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" 一起完成。"}};