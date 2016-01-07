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
"blockDestroyBlock":function(d){return "iznīcināt bloku"},
"blockIf":function(d){return "Ja"},
"blockIfLavaAhead":function(d){return "ja priekšā atrodas lava"},
"blockMoveForward":function(d){return "pārvietot uz priekšu"},
"blockPlaceTorch":function(d){return "nolikt lāpu"},
"blockPlaceXAheadAhead":function(d){return "priekšā"},
"blockPlaceXAheadPlace":function(d){return "nolikt"},
"blockPlaceXPlace":function(d){return "nolikt"},
"blockPlantCrop":function(d){return "iestādīt labību"},
"blockShear":function(d){return "apgriezt"},
"blockTillSoil":function(d){return "till soil"},
"blockTurnLeft":function(d){return "pagriezt pa kreisi"},
"blockTurnRight":function(d){return "pagriezt pa labi"},
"blockTypeBedrock":function(d){return "bedroks"},
"blockTypeBricks":function(d){return "ķieģeļi"},
"blockTypeClay":function(d){return "māls"},
"blockTypeClayHardened":function(d){return "ciets māls"},
"blockTypeCobblestone":function(d){return "cobblestone"},
"blockTypeDirt":function(d){return "zeme"},
"blockTypeDirtCoarse":function(d){return "rupja zeme"},
"blockTypeEmpty":function(d){return "tukšums"},
"blockTypeFarmlandWet":function(d){return "uzrakta zeme"},
"blockTypeGlass":function(d){return "stikls"},
"blockTypeGrass":function(d){return "zāle"},
"blockTypeGravel":function(d){return "grants"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akācijas baļķis"},
"blockTypeLogBirch":function(d){return "bērza baļķis"},
"blockTypeLogJungle":function(d){return "džungļu baļķis"},
"blockTypeLogOak":function(d){return "ozola baļķis"},
"blockTypeLogSpruce":function(d){return "egles baļķis"},
"blockTypeOreCoal":function(d){return "ogles"},
"blockTypeOreDiamond":function(d){return "dimanta rūda"},
"blockTypeOreEmerald":function(d){return "smaragda rūda"},
"blockTypeOreGold":function(d){return "zelta rūda"},
"blockTypeOreIron":function(d){return "dzelža rūda"},
"blockTypeOreLapis":function(d){return "lazurīta rūda"},
"blockTypeOreRedstone":function(d){return "sarkanakmeņa rūda"},
"blockTypePlanksAcacia":function(d){return "akācijas dēļi"},
"blockTypePlanksBirch":function(d){return "bērza dēļi"},
"blockTypePlanksJungle":function(d){return "džungļu dēļi"},
"blockTypePlanksOak":function(d){return "ozola dēļi"},
"blockTypePlanksSpruce":function(d){return "egles dēļi"},
"blockTypeRail":function(d){return "sliedes"},
"blockTypeSand":function(d){return "smiltis"},
"blockTypeSandstone":function(d){return "smilšakmens"},
"blockTypeStone":function(d){return "akmens"},
"blockTypeTnt":function(d){return "dinamīts"},
"blockTypeTree":function(d){return "koks"},
"blockTypeWater":function(d){return "ūdens"},
"blockTypeWool":function(d){return "vilna"},
"blockWhileXAheadAhead":function(d){return "priekšā"},
"blockWhileXAheadDo":function(d){return "darīt"},
"blockWhileXAheadWhile":function(d){return "kamēr"},
"generatedCodeDescription":function(d){return "Velkot un pārvietojot blokus šajā uzdevumā, tu izveidoju instrukciju virkni \"javascript\" datoru valodā. Šī instrukcija, jeb kods, norāda datoram ko attēlot uz ekrāna. Visu ko tu redzi un dari Minecraft spēlē arī sākas ar līdzīgām koda virknēm."},
"houseSelectChooseFloorPlan":function(d){return "Izvēlies savas mājas grīdas plānu."},
"houseSelectEasy":function(d){return "Viegls"},
"houseSelectHard":function(d){return "Grūts"},
"houseSelectLetsBuild":function(d){return "Uzbūvēsim māju."},
"houseSelectMedium":function(d){return "Vidējs"},
"keepPlayingButton":function(d){return "Turpināt spēlēt"},
"level10FailureMessage":function(d){return "Aizsedz lavu, lai tiktu pāri, tad saroc divus dzelža rūdas."},
"level11FailureMessage":function(d){return "Make sure to place cobblestone ahead if there is lava ahead. This will let you safely mine this row of resources."},
"level12FailureMessage":function(d){return "Be sure to mine 3 redstone blocks. This combines what you learned from building your house and using \"if\" statements to avoid falling in lava."},
"level13FailureMessage":function(d){return "Place \"rail\" along the dirt path leading from your door to the edge of the map."},
"level1FailureMessage":function(d){return "You need to use commands to walk to the sheep."},
"level1TooFewBlocksMessage":function(d){return "Try using more commands to walk to the sheep."},
"level2FailureMessage":function(d){return "To chop down a tree, walk to its trunk and use the \"destroy block\" command."},
"level2TooFewBlocksMessage":function(d){return "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command."},
"level3FailureMessage":function(d){return "Lai savāktu vilnu no abām aitām, piej pie katras un izmanto \"apcirpt\" komandu. Neaizmirsti izmantot pagriešanās komandas, lai sasniegtu aitas."},
"level3TooFewBlocksMessage":function(d){return "Try using more commands to gather wool from both sheep. Walk to each one and use the \"shear\" command."},
"level4FailureMessage":function(d){return "You must use the \"destroy block\" command on each of the three tree trunks."},
"level5FailureMessage":function(d){return "Place your blocks on the dirt outline to build a wall. The pink \"repeat\" command will run commands placed inside it, like \"place block\" and \"move forward\"."},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "If you touch a creeper it will explode. Sneak around them and enter your house."},
"level9FailureMessage":function(d){return "Neaizmirsti uzlikt vismaz 2 lāpas, lai izgaismotu savu ceļu un saroc vismaz 2 ogles."},
"minecraftBlock":function(d){return "bloks"},
"nextLevelMsg":function(d){return "Uzdevums "+craft_locale.v(d,"puzzleNumber")+" ir veiksmīgi pabeigts. Apsveicam!"},
"playerSelectChooseCharacter":function(d){return "Izvēlies savu tēlu."},
"playerSelectChooseSelectButton":function(d){return "Izvēlēties"},
"playerSelectLetsGetStarted":function(d){return "Let's get started."},
"reinfFeedbackMsg":function(d){return "Spied \"Turpināt spēli\" lai atgrieztos pie spēles."},
"replayButton":function(d){return "Atkārtot"},
"selectChooseButton":function(d){return "Izvēlēties"},
"tooManyBlocksFail":function(d){return "Uzdevums "+craft_locale.v(d,"puzzleNumber")+" ir pabeigts. Apsveicam! Šo uzdevumu ir iespējams izpildīt arī ar "+craft_locale.p(d,"numBlocks",0,"lv",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};