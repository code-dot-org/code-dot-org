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
"blockDestroyBlock":function(d){return "уништи блок"},
"blockIf":function(d){return "ако"},
"blockIfLavaAhead":function(d){return "ако је лава испред"},
"blockMoveForward":function(d){return "помери се напред"},
"blockPlaceTorch":function(d){return "постави бакљу"},
"blockPlaceXAheadAhead":function(d){return "испред"},
"blockPlaceXAheadPlace":function(d){return "постави"},
"blockPlaceXPlace":function(d){return "постави"},
"blockPlantCrop":function(d){return "посади биљни усев"},
"blockShear":function(d){return "ошишај"},
"blockTillSoil":function(d){return "орање тла"},
"blockTurnLeft":function(d){return "скрени лево"},
"blockTurnRight":function(d){return "скрени десно"},
"blockTypeBedrock":function(d){return "темељ"},
"blockTypeBricks":function(d){return "цигле"},
"blockTypeClay":function(d){return "глина"},
"blockTypeClayHardened":function(d){return "стврднута глина"},
"blockTypeCobblestone":function(d){return "калдрма"},
"blockTypeDirt":function(d){return "прљавштина"},
"blockTypeDirtCoarse":function(d){return "груба земља"},
"blockTypeEmpty":function(d){return "празно"},
"blockTypeFarmlandWet":function(d){return "обрадиво земљиште"},
"blockTypeGlass":function(d){return "стакло"},
"blockTypeGrass":function(d){return "трава"},
"blockTypeGravel":function(d){return "шљунак"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "цепаница багрема"},
"blockTypeLogBirch":function(d){return "цепаница брезе"},
"blockTypeLogJungle":function(d){return "дрво из џунгле"},
"blockTypeLogOak":function(d){return "цепаница храста"},
"blockTypeLogSpruce":function(d){return "цепаница смреке"},
"blockTypeOreCoal":function(d){return "руда угља"},
"blockTypeOreDiamond":function(d){return "руда дијаманта"},
"blockTypeOreEmerald":function(d){return "руда смарагда"},
"blockTypeOreGold":function(d){return "руда злата"},
"blockTypeOreIron":function(d){return "руда гвожђа"},
"blockTypeOreLapis":function(d){return "руда лапиза"},
"blockTypeOreRedstone":function(d){return "руда црвеног камена"},
"blockTypePlanksAcacia":function(d){return "багремова даска"},
"blockTypePlanksBirch":function(d){return "брезина даска"},
"blockTypePlanksJungle":function(d){return "дрвета из џунгле даска"},
"blockTypePlanksOak":function(d){return "храстова даска"},
"blockTypePlanksSpruce":function(d){return "смрекина даска"},
"blockTypeRail":function(d){return "пруга"},
"blockTypeSand":function(d){return "песак"},
"blockTypeSandstone":function(d){return "пешчар"},
"blockTypeStone":function(d){return "камен"},
"blockTypeTnt":function(d){return "ТНТ"},
"blockTypeTree":function(d){return "дрво"},
"blockTypeWater":function(d){return "вода"},
"blockTypeWool":function(d){return "вуна"},
"blockWhileXAheadAhead":function(d){return "испред"},
"blockWhileXAheadDo":function(d){return "уради"},
"blockWhileXAheadWhile":function(d){return "док"},
"generatedCodeDescription":function(d){return "By dragging and placing blocks in this puzzle, you've created a set of instructions in a computer language called Javascript. This code tells computers what to display on the screen. Everything you see and do in Minecraft also starts with lines of computer code like these."},
"houseSelectChooseFloorPlan":function(d){return "Одаберите план пода свог стана."},
"houseSelectEasy":function(d){return "Лако"},
"houseSelectHard":function(d){return "Тешко"},
"houseSelectLetsBuild":function(d){return "Хајде да направимо кућу."},
"houseSelectMedium":function(d){return "Средње"},
"keepPlayingButton":function(d){return "Настави игру"},
"level10FailureMessage":function(d){return "Покриј лаву да можеш да ходаш преко ње, а онда ископај два гвоздена блока на другој страни."},
"level11FailureMessage":function(d){return "Увери се да поставиш калдрму ако је лава испред. Ово ће омогућити да безбедно ископаш овај ред ресурса."},
"level12FailureMessage":function(d){return "Обавезно ископај 3 блока црвеног камена. Комбинуј оно шта си научио код прављења своје куће и користи \"ако\" наредбу да би избегао пад у лаву."},
"level13FailureMessage":function(d){return "Постави \"пругу\" дуж земљаног пута који води од врата до ивице мапе."},
"level1FailureMessage":function(d){return "You need to use commands to walk to the sheep."},
"level1TooFewBlocksMessage":function(d){return "Покушај да користиш више команди да дођеш до оваца."},
"level2FailureMessage":function(d){return "To chop down a tree, walk to its trunk and use the \"destroy block\" command."},
"level2TooFewBlocksMessage":function(d){return "Try using more commands to chop down the tree. Walk to its trunk and use the \"destroy block\" command."},
"level3FailureMessage":function(d){return "To gather wool from both sheep, walk to each one and use the \"shear\" command. Remember to use turn commands to reach the sheep."},
"level3TooFewBlocksMessage":function(d){return "Покушај да користиш више команди за прикупљање вуне од обе овце. Ходај према свакој и користи команду \"ошишај\"."},
"level4FailureMessage":function(d){return "Мораш користити команду \"уништи блок\" на сваком од три дебла."},
"level5FailureMessage":function(d){return "Постави своје блокове на земљу да саградиш зид. Роза \"понављај\" команда ће покренути команде стављене унутра, као \"постави блок\" и \"помери се напред\"."},
"level6FailureMessage":function(d){return "Постави блокове на земљану ивицу да саградиш кућу и решиш мозгалицу."},
"level7FailureMessage":function(d){return "Користи команду \"посади биљни усев\" да би поставио усеве на сваки део тамне изоране земље."},
"level8FailureMessage":function(d){return "Ако додирнеш крипера он ће експлодирати. Провуци се поред њих и уђи у своју кућу."},
"level9FailureMessage":function(d){return "Не заборави да поставиш најмање 2 бакље да осветлиш пут и ископаш најмање 2 угља."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations!"},
"playerSelectChooseCharacter":function(d){return "Одаберите свог лика."},
"playerSelectChooseSelectButton":function(d){return "Изабери"},
"playerSelectLetsGetStarted":function(d){return "Почнимо."},
"reinfFeedbackMsg":function(d){return "Можете притиснути \"Настави игру\" да се вратите на играње игре."},
"replayButton":function(d){return "Пусти поново"},
"selectChooseButton":function(d){return "Изабери"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"sr",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};