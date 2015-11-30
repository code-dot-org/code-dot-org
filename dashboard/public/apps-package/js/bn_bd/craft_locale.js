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
"blockDestroyBlock":function(d){return "ধ্বংসকারী ব্লক।"},
"blockIf":function(d){return "যদী"},
"blockIfLavaAhead":function(d){return "যদি সামনে লাভা থাকে"},
"blockMoveForward":function(d){return "সামনে এগিয়ে যান"},
"blockPlaceTorch":function(d){return "মশাল বসান"},
"blockPlaceXAheadAhead":function(d){return "সামনে"},
"blockPlaceXAheadPlace":function(d){return "বসানো"},
"blockPlaceXPlace":function(d){return "বসানো"},
"blockPlantCrop":function(d){return "ফসল লাগানো"},
"blockShear":function(d){return "শেয়ার করা"},
"blockTillSoil":function(d){return "মাটি পর্যন্ত"},
"blockTurnLeft":function(d){return "বামে যান"},
"blockTurnRight":function(d){return "ডানে যান"},
"blockTypeBedrock":function(d){return "বেডরক (bedrock)"},
"blockTypeBricks":function(d){return "ইট"},
"blockTypeClay":function(d){return "কাদামাটি"},
"blockTypeClayHardened":function(d){return "শক্ত কাদামাটি"},
"blockTypeCobblestone":function(d){return "খোয়া"},
"blockTypeDirt":function(d){return "ময়লা"},
"blockTypeDirtCoarse":function(d){return "মোটা ময়লা"},
"blockTypeEmpty":function(d){return "খালি"},
"blockTypeFarmlandWet":function(d){return "কৃষিজমি"},
"blockTypeGlass":function(d){return "কাচ"},
"blockTypeGrass":function(d){return "ঘাস"},
"blockTypeGravel":function(d){return "নুড়ি"},
"blockTypeLava":function(d){return "লাভা"},
"blockTypeLogAcacia":function(d){return "বাবলার গুঁড়ি"},
"blockTypeLogBirch":function(d){return "বার্চের গুঁড়ি"},
"blockTypeLogJungle":function(d){return "জঙ্গলের গুড়ি"},
"blockTypeLogOak":function(d){return "ওকের গুড়ি"},
"blockTypeLogSpruce":function(d){return "স্প্রুস গাছের গুড়ি"},
"blockTypeOreCoal":function(d){return "কয়লার আকরিক"},
"blockTypeOreDiamond":function(d){return "হীরার খনি"},
"blockTypeOreEmerald":function(d){return "পান্না আকরিক"},
"blockTypeOreGold":function(d){return "স্বর্ণ আকরিক"},
"blockTypeOreIron":function(d){return "লোহার আকর"},
"blockTypeOreLapis":function(d){return "নীলকান্তমণি আকরিক"},
"blockTypeOreRedstone":function(d){return "লালপাথর আকরিক"},
"blockTypePlanksAcacia":function(d){return "বাবলার তক্তা"},
"blockTypePlanksBirch":function(d){return "বার্চের তক্তা"},
"blockTypePlanksJungle":function(d){return "জঙ্গলের তক্তা"},
"blockTypePlanksOak":function(d){return "ওকের তক্তা"},
"blockTypePlanksSpruce":function(d){return "স্প্রুসের তক্তা"},
"blockTypeRail":function(d){return "রেল"},
"blockTypeSand":function(d){return "বালি"},
"blockTypeSandstone":function(d){return "বেলেপাথর"},
"blockTypeStone":function(d){return "পাথর"},
"blockTypeTnt":function(d){return "টিনটি"},
"blockTypeTree":function(d){return "গাছ"},
"blockTypeWater":function(d){return "পানি"},
"blockTypeWool":function(d){return "পশম"},
"blockWhileXAheadAhead":function(d){return "সামনে"},
"blockWhileXAheadDo":function(d){return "করা"},
"blockWhileXAheadWhile":function(d){return "যখন"},
"generatedCodeDescription":function(d){return "এই ধাঁধায় টেনে এবং ব্লক স্থাপন করে, আপনি কম্পিউটারের ভাষায় নির্দেশের একটি সেট তৈরি করেছেন যাকে জাভাস্ক্রিপ্ট বলে । এই কোড কম্পিউটার কে বলে পর্দায় কি প্রদর্শন করতে হবে। আপনি মাইনক্রাফট (Minecraft) গেমে যা কিছু দেখে বা করে থাকেন সব কিছু এই রকম কম্পিউটার কোড দিয়ে শুরু হয়।"},
"houseSelectChooseFloorPlan":function(d){return "আপনার বাড়ির জন্য মেঝের বিন্যাস নির্বাচন করুন।"},
"houseSelectEasy":function(d){return "সহজ"},
"houseSelectHard":function(d){return "কঠিন"},
"houseSelectLetsBuild":function(d){return "আসুন একটি ঘর নির্মাণ করি।"},
"houseSelectMedium":function(d){return "মাঝারি"},
"keepPlayingButton":function(d){return "খেলতে থাকুন"},
"level10FailureMessage":function(d){return "হেটে পার হয়ে যেতে লাভা আবৃত করুন তারপর অন্য দিক থেকে আয়রন দুটি ব্লক খনন করুন।"},
"level11FailureMessage":function(d){return "সামনে এগিয়ে লাভার সম্মুখীন হলে খোয়াপাথর স্থাপন করার বিষয়ে নিশ্চিত হন। এইটি কমান্ডের  আপনাকে নিরাপদে এই সারিতে  সম্পদ খনন করতে সাহায্য করবে।"},
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
"minecraftBlock":function(d){return "বাধা"},
"nextLevelMsg":function(d){return "ধাঁধা "+craft_locale.v(d,"puzzleNumber")+" সম্পন্ন. অভিনন্দন!"},
"playerSelectChooseCharacter":function(d){return "আপনার চরিত্র নির্বাচন করুন।"},
"playerSelectChooseSelectButton":function(d){return "নির্বাচন করা"},
"playerSelectLetsGetStarted":function(d){return "চল শুরু করি।"},
"reinfFeedbackMsg":function(d){return "আপনি খেলায় ফিরে যেতে \"খেলতে থাকুন\" টিপতে পারেন।"},
"replayButton":function(d){return "আবার নতুন করে খেলা"},
"selectChooseButton":function(d){return "নির্বাচন করা"},
"tooManyBlocksFail":function(d){return "ধাঁধা "+craft_locale.v(d,"puzzleNumber")+" সম্পন্ন. অভিনন্দন! এটা "+craft_locale.p(d,"numBlocks",0,"bn",{"one":"1","other":craft_locale.n(d,"numBlocks")+" ব্লক"})+" দিয়ে তা সম্পন্ন করা সম্ভব।"}};