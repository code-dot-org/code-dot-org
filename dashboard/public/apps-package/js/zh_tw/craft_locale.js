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
"blockDestroyBlock":function(d){return "破壞方塊"},
"blockIf":function(d){return "如果"},
"blockIfLavaAhead":function(d){return "若前有岩漿"},
"blockMoveForward":function(d){return "向前移動"},
"blockPlaceTorch":function(d){return "放置火把"},
"blockPlaceXAheadAhead":function(d){return "前方"},
"blockPlaceXAheadPlace":function(d){return "放置"},
"blockPlaceXPlace":function(d){return "放置"},
"blockPlantCrop":function(d){return "栽種農作物"},
"blockShear":function(d){return "剪下"},
"blockTillSoil":function(d){return "整地"},
"blockTurnLeft":function(d){return "向左轉"},
"blockTurnRight":function(d){return "向右轉"},
"blockTypeBedrock":function(d){return "基岩"},
"blockTypeBricks":function(d){return "紅磚"},
"blockTypeClay":function(d){return "黏土"},
"blockTypeClayHardened":function(d){return "硬化黏土"},
"blockTypeCobblestone":function(d){return "鵝卵石"},
"blockTypeDirt":function(d){return "泥土"},
"blockTypeDirtCoarse":function(d){return "粗泥"},
"blockTypeEmpty":function(d){return "空的"},
"blockTypeFarmlandWet":function(d){return "耕地"},
"blockTypeGlass":function(d){return "玻璃"},
"blockTypeGrass":function(d){return "草地"},
"blockTypeGravel":function(d){return "礫石"},
"blockTypeLava":function(d){return "岩漿"},
"blockTypeLogAcacia":function(d){return "相思樹原木"},
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
"blockTypeSandstone":function(d){return "沙岩"},
"blockTypeStone":function(d){return "石頭"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "樹木"},
"blockTypeWater":function(d){return "水"},
"blockTypeWool":function(d){return "羊毛"},
"blockWhileXAheadAhead":function(d){return "前方"},
"blockWhileXAheadDo":function(d){return "執行"},
"blockWhileXAheadWhile":function(d){return "當"},
"generatedCodeDescription":function(d){return "在這個遊戲板中拖曳與放置方塊，就能用名為 Javascript 的電腦語言建立一組指令。這種程式碼會告訴電腦在螢幕上顯示些什麼。您在 Minecraft 所見與所做的一切，也是從類似的電腦程式碼字行所開始的。"},
"houseSelectChooseFloorPlan":function(d){return "請為您的房屋選擇樓層平面圖。"},
"houseSelectEasy":function(d){return "簡單"},
"houseSelectHard":function(d){return "困難"},
"houseSelectLetsBuild":function(d){return "我們來蓋一棟房屋。"},
"houseSelectMedium":function(d){return "一般"},
"keepPlayingButton":function(d){return "繼續玩"},
"level10FailureMessage":function(d){return "請將岩漿覆蓋以便走過，接著在另一端開採兩個鐵方塊。"},
"level11FailureMessage":function(d){return "若前方有岩漿，務必在前方放置鵝卵石，這樣您就能安全地開採這一列資源。"},
"level12FailureMessage":function(d){return "記得要開採 3 個紅石方塊，如此可綜合您從搭建房屋所學，並請使用「若」陳述句以免掉進岩漿中。"},
"level13FailureMessage":function(d){return "請在從您的家門通到地圖邊緣的泥土路徑上沿線放置「鐵軌」。"},
"level1FailureMessage":function(d){return "您需要使用指令以走向綿羊。"},
"level1TooFewBlocksMessage":function(d){return "請試著使用更多指令以走向綿羊。"},
"level2FailureMessage":function(d){return "若要砍倒樹木，請走向它的樹幹，使用「破壞方塊」指令。"},
"level2TooFewBlocksMessage":function(d){return "請試著以更多指令砍倒樹木。請走向它的樹幹，使用「破壞方塊」指令。"},
"level3FailureMessage":function(d){return "若要從兩隻綿羊身上收集羊毛，請分別走向牠們，再使用「修剪」指令。別忘了使用轉向指令到達綿羊身邊。"},
"level3TooFewBlocksMessage":function(d){return "請試著以更多指令從兩隻綿羊身上收集羊毛，請分別走向牠們，再使用「修剪」指令。"},
"level4FailureMessage":function(d){return "您必須對三根樹幹分別使用「破壞方塊」指令。"},
"level5FailureMessage":function(d){return "請將方塊放置在泥土輪廓上，以便築牆。粉紅色的「重複」指令可執行放置在其中的指令，例如「放置方塊」和「往前」。"},
"level6FailureMessage":function(d){return "將方塊放置在房屋的泥土輪廓上可完成遊戲板。"},
"level7FailureMessage":function(d){return "使用「栽種」指令將農作物放置在每一塊整地過的深色地上。"},
"level8FailureMessage":function(d){return "若您碰觸 Creeper，它會爆炸。請在旁邊潛行，進入房屋。"},
"level9FailureMessage":function(d){return "別忘了放置至少 2 根火把將路照亮，並且開採至少 2 塊煤炭。"},
"minecraftBlock":function(d){return "方塊"},
"nextLevelMsg":function(d){return "遊戲板 "+craft_locale.v(d,"puzzleNumber")+" 已完成，恭喜！"},
"playerSelectChooseCharacter":function(d){return "請選擇您的角色。"},
"playerSelectChooseSelectButton":function(d){return "選擇"},
"playerSelectLetsGetStarted":function(d){return "我們開始吧。"},
"reinfFeedbackMsg":function(d){return "您可按「繼續玩」返回玩您的遊戲。"},
"replayButton":function(d){return "重玩"},
"selectChooseButton":function(d){return "選擇"},
"tooManyBlocksFail":function(d){return "遊戲板 "+craft_locale.v(d,"puzzleNumber")+" 已完成，恭喜！另外，用 "+craft_locale.p(d,"numBlocks",0,"zh",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" 也能完成."}};