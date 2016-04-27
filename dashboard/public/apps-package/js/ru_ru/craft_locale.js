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
"blockDestroyBlock":function(d){return "уничтожить блок"},
"blockIf":function(d){return "если"},
"blockIfLavaAhead":function(d){return "если впереди лава"},
"blockMoveForward":function(d){return "двигаться вперед"},
"blockPlaceTorch":function(d){return "разместить факел"},
"blockPlaceXAheadAhead":function(d){return "впереди"},
"blockPlaceXAheadPlace":function(d){return "разместить"},
"blockPlaceXPlace":function(d){return "разместить"},
"blockPlantCrop":function(d){return "посадить саженцы"},
"blockShear":function(d){return "стричь"},
"blockTillSoil":function(d){return "пахать землю"},
"blockTurnLeft":function(d){return "повернуть налево"},
"blockTurnRight":function(d){return "повернуть направо"},
"blockTypeBedrock":function(d){return "бедрок"},
"blockTypeBricks":function(d){return "кирпичи"},
"blockTypeClay":function(d){return "глина"},
"blockTypeClayHardened":function(d){return "обожженная глина"},
"blockTypeCobblestone":function(d){return "булыжник"},
"blockTypeDirt":function(d){return "земля"},
"blockTypeDirtCoarse":function(d){return "грубая земля"},
"blockTypeEmpty":function(d){return "пусто"},
"blockTypeFarmlandWet":function(d){return "пашня"},
"blockTypeGlass":function(d){return "стекло"},
"blockTypeGrass":function(d){return "трава"},
"blockTypeGravel":function(d){return "гравий"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "ствол акациевого дерева"},
"blockTypeLogBirch":function(d){return "березовый ствол"},
"blockTypeLogJungle":function(d){return "ствол тропического дерева"},
"blockTypeLogOak":function(d){return "дубовый ствол"},
"blockTypeLogSpruce":function(d){return "сосновый ствол "},
"blockTypeOreCoal":function(d){return "Угольная руда"},
"blockTypeOreDiamond":function(d){return "алмазная руда"},
"blockTypeOreEmerald":function(d){return "изумрудная руда"},
"blockTypeOreGold":function(d){return "золотая руда"},
"blockTypeOreIron":function(d){return "железная руда"},
"blockTypeOreLapis":function(d){return "лазуритовая руда"},
"blockTypeOreRedstone":function(d){return "красная руда"},
"blockTypePlanksAcacia":function(d){return "доски из акации"},
"blockTypePlanksBirch":function(d){return "березовые доски"},
"blockTypePlanksJungle":function(d){return "доски из тропического дерева"},
"blockTypePlanksOak":function(d){return "дубовые доски"},
"blockTypePlanksSpruce":function(d){return "сосновые доски"},
"blockTypeRail":function(d){return "рельсы"},
"blockTypeSand":function(d){return "песок"},
"blockTypeSandstone":function(d){return "песчаник"},
"blockTypeStone":function(d){return "камень"},
"blockTypeTnt":function(d){return "динамит"},
"blockTypeTree":function(d){return "дерево"},
"blockTypeWater":function(d){return "вода"},
"blockTypeWool":function(d){return "шерсть"},
"blockWhileXAheadAhead":function(d){return "впереди"},
"blockWhileXAheadDo":function(d){return "выполнить"},
"blockWhileXAheadWhile":function(d){return "пока"},
"generatedCodeDescription":function(d){return "Перетаскивая и размещая блоки в этой задачке, вы создали набор инструкций на компьютерном языке Javascript. Этот код сообщает компьютеру, что показывать на экране. Все, что вы видите и что делаете в Minecraft, также начинается с подобных строк компьютерного кода."},
"houseSelectChooseFloorPlan":function(d){return "Выберите поэтажный план для своего дома."},
"houseSelectEasy":function(d){return "Легко"},
"houseSelectHard":function(d){return "Сложно"},
"houseSelectLetsBuild":function(d){return "Давайте построим дом."},
"houseSelectMedium":function(d){return "Средне"},
"keepPlayingButton":function(d){return "Продолжить игру"},
"level10FailureMessage":function(d){return "Накройте лаву, чтобы перейти ее, затем добудьте два блока железа на той стороне."},
"level11FailureMessage":function(d){return "Обязательно размещайте булыжники перед собой, если впереди лава. Так вы сможете безопасно добывать эти ресурсы."},
"level12FailureMessage":function(d){return "Обязательно добудьте 3 блока красного камня. Для этого вам нужно будет использовать то, чему вы научились, строя дом, а также применять оператор «если», чтобы не свалиться в лаву."},
"level13FailureMessage":function(d){return "Разместите «рельсы» вдоль земляной дорожки, ведущей от вашей двери к краю карты."},
"level1FailureMessage":function(d){return "Чтобы подойти к овце, нужно использовать команды."},
"level1TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды, чтобы подойти к овце."},
"level2FailureMessage":function(d){return "Чтобы срубить дерево, подойдите к его стволу и используйте команду «уничтожить блок»."},
"level2TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды, чтобы срубить дерево. Подойдите к его стволу и используйте команду «уничтожить блок»."},
"level3FailureMessage":function(d){return "Чтобы собрать шерсть с обеих овец, подойдите к каждой из них и используйте команду «стричь». Не забывайте использовать команды поворота, чтобы приблизиться к овцам."},
"level3TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды, чтобы собрать шерсть с обеих овец. Подойдите к каждой из них и используйте команду «стричь»."},
"level4FailureMessage":function(d){return "Нужно применить команду «уничтожить блок» к каждому из трех стволов."},
"level5FailureMessage":function(d){return "Разместите блоки на земляном контуре, чтобы построить стену. Розовая команда «повтор» позволяет повторять команды внутри нее, такие как «разместить блок» и «двигаться вперед»."},
"level6FailureMessage":function(d){return "Разместите блоки на земляном контуре дома, чтобы решить задачу."},
"level7FailureMessage":function(d){return "Используйте команду «посадить», чтобы разместить саженцы на участках темной вспаханной земли."},
"level8FailureMessage":function(d){return "Если коснуться крипера, он взорвется. Осторожно обойдите его и войдите в свой дом."},
"level9FailureMessage":function(d){return "Не забудьте разместить не менее 2 факелов, чтобы освещать себе путь, И добыть не менее 2 блоков угля."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Задача "+craft_locale.v(d,"puzzleNumber")+" решена. Поздравляем!"},
"playerSelectChooseCharacter":function(d){return "Выберите себе персонажа."},
"playerSelectChooseSelectButton":function(d){return "Выбрать"},
"playerSelectLetsGetStarted":function(d){return "Начнем!"},
"reinfFeedbackMsg":function(d){return "Вы можете нажать «Продожить игру», чтобы вернуться к своей игре."},
"replayButton":function(d){return "Повторить"},
"selectChooseButton":function(d){return "Выбрать"},
"tooManyBlocksFail":function(d){return "Задача "+craft_locale.v(d,"puzzleNumber")+" решена. Поздравляем! Ее также можно решить с помощью "+craft_locale.p(d,"numBlocks",0,"ru",{"one":"1 блока","other":craft_locale.n(d,"numBlocks")+" блоков"})+"."}};