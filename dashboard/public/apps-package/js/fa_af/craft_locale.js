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
"blockDestroyBlock":function(d){return "نابود کردن بلوک"},
"blockIf":function(d){return "اگر"},
"blockIfLavaAhead":function(d){return "اگر گدازه ها جلو بودند"},
"blockMoveForward":function(d){return "به جلو حرکت کردن"},
"blockPlaceTorch":function(d){return "مشعل را قرار بده"},
"blockPlaceXAheadAhead":function(d){return "جلو"},
"blockPlaceXAheadPlace":function(d){return "قرار دادن"},
"blockPlaceXPlace":function(d){return "قرار دادن"},
"blockPlantCrop":function(d){return "چیدن گیاه"},
"blockShear":function(d){return "چیدن پشم گوسفندان"},
"blockTillSoil":function(d){return "تا خاک"},
"blockTurnLeft":function(d){return "بپیچ به چپ"},
"blockTurnRight":function(d){return "بپیچ به راست"},
"blockTypeBedrock":function(d){return "سنگ بستر"},
"blockTypeBricks":function(d){return "آجر"},
"blockTypeClay":function(d){return "خشت"},
"blockTypeClayHardened":function(d){return "خاک رس سخت شده"},
"blockTypeCobblestone":function(d){return "سنگ فرش"},
"blockTypeDirt":function(d){return "خاک"},
"blockTypeDirtCoarse":function(d){return "خاک درشت"},
"blockTypeEmpty":function(d){return "خالی"},
"blockTypeFarmlandWet":function(d){return "زمین کشاورزی"},
"blockTypeGlass":function(d){return "شیشه"},
"blockTypeGrass":function(d){return "علف"},
"blockTypeGravel":function(d){return "سنگ ریزه"},
"blockTypeLava":function(d){return "گدازه"},
"blockTypeLogAcacia":function(d){return "شاخه اقاقیا"},
"blockTypeLogBirch":function(d){return "کنده درخت توس"},
"blockTypeLogJungle":function(d){return "جنگل"},
"blockTypeLogOak":function(d){return "ورود بلوط"},
"blockTypeLogSpruce":function(d){return "spruce log"},
"blockTypeOreCoal":function(d){return "سنگ معدن ذغال سنگ"},
"blockTypeOreDiamond":function(d){return "سنگ معدن الماس"},
"blockTypeOreEmerald":function(d){return "سنگ معدن زمرد"},
"blockTypeOreGold":function(d){return "سنگ معدن طلا"},
"blockTypeOreIron":function(d){return "سنگ معدن اهن"},
"blockTypeOreLapis":function(d){return "lapis ore"},
"blockTypeOreRedstone":function(d){return "سنگ معدن ردستون"},
"blockTypePlanksAcacia":function(d){return "acacia planks"},
"blockTypePlanksBirch":function(d){return "birch planks"},
"blockTypePlanksJungle":function(d){return "چوب جنگلی"},
"blockTypePlanksOak":function(d){return "چوب بلوط"},
"blockTypePlanksSpruce":function(d){return "spruce planks"},
"blockTypeRail":function(d){return "راه آهن"},
"blockTypeSand":function(d){return "شن"},
"blockTypeSandstone":function(d){return "بلوک شن"},
"blockTypeStone":function(d){return "سنگ"},
"blockTypeTnt":function(d){return "تی ان تی"},
"blockTypeTree":function(d){return "درخت"},
"blockTypeWater":function(d){return "آب"},
"blockTypeWool":function(d){return "پشم"},
"blockWhileXAheadAhead":function(d){return "جلو"},
"blockWhileXAheadDo":function(d){return "انجام بده"},
"blockWhileXAheadWhile":function(d){return "هنگامیکه"},
"generatedCodeDescription":function(d){return "By dragging and placing blocks in this puzzle, you've created a set of instructions in a computer language called Javascript. This code tells computers what to display on the screen. Everything you see and do in Minecraft also starts with lines of computer code like these."},
"houseSelectChooseFloorPlan":function(d){return "چوب دلخواه را برای ساخت خانه خود را انتخاب کنید"},
"houseSelectEasy":function(d){return "آسان"},
"houseSelectHard":function(d){return "سخت"},
"houseSelectLetsBuild":function(d){return "بیایید خونه بسازیم"},
"houseSelectMedium":function(d){return "متوسط"},
"keepPlayingButton":function(d){return "به بازی کردن ادامه دهید"},
"level10FailureMessage":function(d){return "سرپوش بگذارید روی مواد مذاب و نابود کنید دو سنگ معدن اهن در طرف دیگر"},
"level11FailureMessage":function(d){return "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."},
"level12FailureMessage":function(d){return "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."},
"level13FailureMessage":function(d){return "راه اهن قرار دهید در مسیر خاک از در خونه به گوشه نقشه"},
"level1FailureMessage":function(d){return "You need to use commands to walk to the sheep."},
"level1TooFewBlocksMessage":function(d){return "Try using more commands to walk to the sheep."},
"level2FailureMessage":function(d){return "حرکت کنید به سمت تنه درخت و نابود کنید تنه درخت را با استفاده از کامند \"نابود کردن بلوک\""},
"level2TooFewBlocksMessage":function(d){return "با دستورات بیشتری حرکت کنید به سمت تنه درخت و نابود کنید تنه درخت را با استفاده از کامند \"نابود کردن بلوک\""},
"level3FailureMessage":function(d){return "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep."},
"level3TooFewBlocksMessage":function(d){return "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."},
"level4FailureMessage":function(d){return "با استفاده از کامند\"نابود کردن بلوک\" سه تنه درخت را نابود کنید"},
"level5FailureMessage":function(d){return "قرار دهید بلوک های خود را در طرح خاک برای ساخت دیوار. در کامند \"تکرار\" ، کامتد های \"کذاشتن بلوک\" و \"رفتن به جلو\" قرار میگیرد."},
"level6FailureMessage":function(d){return "بگذارید بلوک در طرح خاک تا کامل کنید پازل را"},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "اگر شما به کریپر بخورید منفجر خواهد شد. حرکت کنید در اطراف انها و به خانه وارد شوید"},
"level9FailureMessage":function(d){return "فراموش نکنید که به جای حداقل 2 مشعل راه خود را به نور و معدن حداقل 2 ذغال سنگ است."},
"minecraftBlock":function(d){return "بلوک"},
"nextLevelMsg":function(d){return craft_locale.v(d,"puzzleNumber")+" پازل تکمیل شد. تبریک میگم!"},
"playerSelectChooseCharacter":function(d){return "شخصیت خود را انتخاب کنید."},
"playerSelectChooseSelectButton":function(d){return "انتخاب"},
"playerSelectLetsGetStarted":function(d){return "بیایید شروع کنید."},
"reinfFeedbackMsg":function(d){return "شما می توانید دکمه \"نگه داشتن بازی\" را برای بازگشت به بازی خود فشار دهید."},
"replayButton":function(d){return "تکرار"},
"selectChooseButton":function(d){return "انتخاب"},
"tooManyBlocksFail":function(d){return craft_locale.v(d,"puzzleNumber")+" تکمیل پازل. تبریک میگم! همچنین ممکن است برای تکمیل آن با است "+craft_locale.p(d,"numBlocks",0,"fa",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};