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
"blockPlaceXAheadAhead":function(d){return "於前面"},
"blockPlaceXAheadPlace":function(d){return "放置"},
"blockPlaceXPlace":function(d){return "放置"},
"blockPlantCrop":function(d){return "種植作物"},
"blockShear":function(d){return "剪下"},
"blockTillSoil":function(d){return "耕地"},
"blockTurnLeft":function(d){return "向左轉"},
"blockTurnRight":function(d){return "向右轉"},
"blockTypeBedrock":function(d){return "基石"},
"blockTypeBricks":function(d){return "磚塊"},
"blockTypeClay":function(d){return "黏土"},
"blockTypeClayHardened":function(d){return "硬化黏土"},
"blockTypeCobblestone":function(d){return "鵝卵石"},
"blockTypeDirt":function(d){return "泥土"},
"blockTypeDirtCoarse":function(d){return "粗泥"},
"blockTypeEmpty":function(d){return "空的"},
"blockTypeFarmlandWet":function(d){return "農田"},
"blockTypeGlass":function(d){return "玻璃"},
"blockTypeGrass":function(d){return "草地"},
"blockTypeGravel":function(d){return "礫石"},
"blockTypeLava":function(d){return "岩漿"},
"blockTypeLogAcacia":function(d){return "相思原木"},
"blockTypeLogBirch":function(d){return "樺木原木"},
"blockTypeLogJungle":function(d){return "叢林原木"},
"blockTypeLogOak":function(d){return "橡木原木"},
"blockTypeLogSpruce":function(d){return "杉木原木"},
"blockTypeOreCoal":function(d){return "煤礦"},
"blockTypeOreDiamond":function(d){return "鑽石礦"},
"blockTypeOreEmerald":function(d){return "綠寶石礦"},
"blockTypeOreGold":function(d){return "金礦"},
"blockTypeOreIron":function(d){return "鐵礦"},
"blockTypeOreLapis":function(d){return "青金石礦"},
"blockTypeOreRedstone":function(d){return "紅石礦"},
"blockTypePlanksAcacia":function(d){return "相思木材"},
"blockTypePlanksBirch":function(d){return "樺木材"},
"blockTypePlanksJungle":function(d){return "叢林木材"},
"blockTypePlanksOak":function(d){return "橡木材"},
"blockTypePlanksSpruce":function(d){return "杉木材"},
"blockTypeRail":function(d){return "鐵軌"},
"blockTypeSand":function(d){return "沙"},
"blockTypeSandstone":function(d){return "砂岩"},
"blockTypeStone":function(d){return "石頭"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "樹木"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "於前面"},
"blockWhileXAheadDo":function(d){return "執行"},
"blockWhileXAheadWhile":function(d){return "當"},
"generatedCodeDescription":function(d){return "在這個課程中，透過拖曳跟放置程式積木的方式，你也同時建立了一種名叫 JavaScript 的電腦語言的一系列程式碼。這些程式碼告訴電腦要將那些訊息顯示在電腦畫面上。你在 \"當個創世神 Minecraft\" 中所見到跟做的任何事情也都是像這樣，由一行一行的程式碼開始建構完成的。"},
"houseSelectChooseFloorPlan":function(d){return "選擇房子的平面圖"},
"houseSelectEasy":function(d){return "簡單"},
"houseSelectHard":function(d){return "困難"},
"houseSelectLetsBuild":function(d){return "蓋一間房子吧!"},
"houseSelectMedium":function(d){return "一般"},
"keepPlayingButton":function(d){return "繼續玩"},
"level10FailureMessage":function(d){return "覆蓋熔岩以走到對面，然後在那裏挖掘兩個鐵礦。"},
"level11FailureMessage":function(d){return "如果前方有岩漿，請務必在前方放置鵝卵石。這將使你可以安全的開採資源。"},
"level12FailureMessage":function(d){return "一定要挖掘三個紅石礦。這關卡結合了你在建造房子以及使用\"若\"程式積木以防止掉到岩漿等學到的語法技巧。\n"},
"level13FailureMessage":function(d){return "沿著你門前到地圖邊緣的泥路上放置\"鐵軌\""},
"level1FailureMessage":function(d){return "你需要使用程式積木讓主角走到羊的身邊。"},
"level1TooFewBlocksMessage":function(d){return "試著使用更多的程式積木讓主角走到羊的身邊。"},
"level2FailureMessage":function(d){return "走到樹木前面，使用\"摧毀方塊\"程式積木將它砍下。"},
"level2TooFewBlocksMessage":function(d){return "試著使用更多的程式積木砍下樹木。走到樹幹前使用\"摧毀方塊\"程式積木。"},
"level3FailureMessage":function(d){return "分別走到兩隻羊的身邊，使用\"剪下\"程式積木收集羊隻身上的羊毛。記得使用\"向左轉\"、\"向右轉\"等程式積木以到達羊隻身邊。"},
"level3TooFewBlocksMessage":function(d){return "試著使用更多的程式積木來收集羊毛。走到每一隻羊身旁然後使用\"剪下\"程式積木。"},
"level4FailureMessage":function(d){return "你必須在這三個樹幹上分別使用\"摧毀方塊\"程式積木。"},
"level5FailureMessage":function(d){return "在泥地外圍放置方塊來建造一堵牆。你可以將\"放置方塊\"及\"向前移動\"等程式積木放在粉紅色的\"重覆\"程式積木中來執行它們。"},
"level6FailureMessage":function(d){return "在房子周圍的泥地上放置方塊來完成這個關卡。"},
"level7FailureMessage":function(d){return "使用  \"種植\" 程式積木將作物放置在每塊黑色耕地上。"},
"level8FailureMessage":function(d){return "如果你碰到苦力怕的話會爆炸喔。想辦法繞過他們回到屋子裡。"},
"level9FailureMessage":function(d){return "別忘了至少要放置兩個火把來照亮你的道路，同時至少挖掘兩個煤礦。"},
"minecraftBlock":function(d){return "方塊"},
"nextLevelMsg":function(d){return "恭喜！你完成了第 "+craft_locale.v(d,"puzzleNumber")+" 關。"},
"playerSelectChooseCharacter":function(d){return "請選擇您的角色。"},
"playerSelectChooseSelectButton":function(d){return "選擇"},
"playerSelectLetsGetStarted":function(d){return "讓我們開始吧！"},
"reinfFeedbackMsg":function(d){return "你可以按下「繼續玩」回到遊戲中。"},
"replayButton":function(d){return "再玩一次"},
"selectChooseButton":function(d){return "選擇"},
"tooManyBlocksFail":function(d){return "恭喜！你完成了第 "+craft_locale.v(d,"puzzleNumber")+" 關。不過這個關卡也可以只使用 "+craft_locale.p(d,"numBlocks",0,"zh",{"one":"1 個程式積木","other":craft_locale.n(d,"numBlocks")+" 個程式積木"})+"來完成喔。"}};