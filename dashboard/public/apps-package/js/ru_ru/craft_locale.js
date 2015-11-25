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
"blockPlaceTorch":function(d){return "поставить факел"},
"blockPlaceXAheadAhead":function(d){return "вперёд"},
"blockPlaceXAheadPlace":function(d){return "поставить"},
"blockPlaceXPlace":function(d){return "поставить"},
"blockPlantCrop":function(d){return "посадить зерно"},
"blockShear":function(d){return "стричь"},
"blockTillSoil":function(d){return "пашня"},
"blockTurnLeft":function(d){return "повернуть налево"},
"blockTurnRight":function(d){return "повернуть направо"},
"blockTypeBedrock":function(d){return "коренная порода"},
"blockTypeBricks":function(d){return "кирпичи"},
"blockTypeClay":function(d){return "глина"},
"blockTypeClayHardened":function(d){return "обожженная глина"},
"blockTypeCobblestone":function(d){return "булыжник"},
"blockTypeDirt":function(d){return "земля"},
"blockTypeDirtCoarse":function(d){return "каменистая земля"},
"blockTypeEmpty":function(d){return "пусто"},
"blockTypeFarmlandWet":function(d){return "грядка"},
"blockTypeGlass":function(d){return "стекло"},
"blockTypeGrass":function(d){return "трава"},
"blockTypeGravel":function(d){return "гравий"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "бревно акации"},
"blockTypeLogBirch":function(d){return "берёзовое бревно"},
"blockTypeLogJungle":function(d){return "тропическое бревно"},
"blockTypeLogOak":function(d){return "дубовое бревно"},
"blockTypeLogSpruce":function(d){return "хвойное бревно"},
"blockTypeOreCoal":function(d){return "Угольная руда"},
"blockTypeOreDiamond":function(d){return "алмазная руда"},
"blockTypeOreEmerald":function(d){return "изумрудная руда"},
"blockTypeOreGold":function(d){return "золотая руда"},
"blockTypeOreIron":function(d){return "железная руда"},
"blockTypeOreLapis":function(d){return "лазуритовая руда"},
"blockTypeOreRedstone":function(d){return "руда красного камня"},
"blockTypePlanksAcacia":function(d){return "доски из акации"},
"blockTypePlanksBirch":function(d){return "берёзовые доски"},
"blockTypePlanksJungle":function(d){return "тропические доски"},
"blockTypePlanksOak":function(d){return "дубовые доски"},
"blockTypePlanksSpruce":function(d){return "хвойные доски"},
"blockTypeRail":function(d){return "рельсы"},
"blockTypeSand":function(d){return "песок"},
"blockTypeSandstone":function(d){return "песчаник"},
"blockTypeStone":function(d){return "камень"},
"blockTypeTnt":function(d){return "динамит"},
"blockTypeTree":function(d){return "дерево"},
"blockTypeWater":function(d){return "вода"},
"blockTypeWool":function(d){return "шерсть"},
"blockWhileXAheadAhead":function(d){return "вперёд"},
"blockWhileXAheadDo":function(d){return "выполнить"},
"blockWhileXAheadWhile":function(d){return "пока"},
"generatedCodeDescription":function(d){return "Путем перетаскивания и размещения блоков в этой головоломке, Вы создали набор инструкций на компьютерном языке, который называется JavaScript. Этот код указывает компьютерам, что показать на экране. Всё, что Вы видите и делаете в Minecraft, также начинается со строк компьютерного кода, таких, как эти."},
"houseSelectChooseFloorPlan":function(d){return "Выберите план для вашего дома."},
"houseSelectEasy":function(d){return "Легко"},
"houseSelectHard":function(d){return "Трудно"},
"houseSelectLetsBuild":function(d){return "Давайте строить дом."},
"houseSelectMedium":function(d){return "Средне"},
"keepPlayingButton":function(d){return "Продолжить игру"},
"level10FailureMessage":function(d){return "Закройте лаву, чтобы перейти через неё и добыть два железных блока на той стороне."},
"level11FailureMessage":function(d){return "Убедитесь, что положили впереди булыжники, если впереди есть лава. Это позволит вам безопасно добывать ресурсы."},
"level12FailureMessage":function(d){return "Убедитесь, что добыли 3 красного камня. Это будет означать, что вы научились при строительстве дома использовать оператор «если», чтобы избежать падения в лаву."},
"level13FailureMessage":function(d){return "Проложите рельсы вдоль грунтовой дороги, ведущей от вашей двери к краю карты."},
"level1FailureMessage":function(d){return "Вам нужно использовать команды, чтобы дойти к овце."},
"level1TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды, чтобы дойти к овце."},
"level2FailureMessage":function(d){return "Срубить дерево, дойти до его ствола и использовать команду «уничтожить блок»."},
"level2TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды, чтобы срубить дерево. Дойти до его ствола и использовать команду «уничтожить блок»."},
"level3FailureMessage":function(d){return "Для сбора шерсти с обоих овец, нужно дойти до каждой из них и использовать команду «стричь». Не забывайте использовать команду поворота на пути к овцам."},
"level3TooFewBlocksMessage":function(d){return "Попробуйте использовать другие команды для сбора шерсти с обоих овец. Подойдите к каждой из них и используйте команду «стричь»."},
"level4FailureMessage":function(d){return "Необходимо использовать команду «уничтожить блок» для каждого из трех стволов."},
"level5FailureMessage":function(d){return "Поместите ваши блоки вокруг земли, чтобы построить стену. Розовая команда «повторить» будет выполнять команды, помещенные внутри неё, так же как «поставить блок» и «пройти вперед»."},
"level6FailureMessage":function(d){return "Поместите блоки вокруг земли дома, чтобы завершить головоломку."},
"level7FailureMessage":function(d){return "Используйте команду «посадить», чтобы посадить зерна на каждый распаханный участок."},
"level8FailureMessage":function(d){return "Если вы коснётесь рептилии, то она взорвется. Прокрадитесь вокруг них и войдите в ваш дом."},
"level9FailureMessage":function(d){return "Не забудьте поставить как минимум 2 факела, чтобы осветить свой путь и добыть минимум 2 угля."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Задание "+craft_locale.v(d,"puzzleNumber")+" выполнено. Поздравляем!"},
"playerSelectChooseCharacter":function(d){return "Выберите свой персонаж."},
"playerSelectChooseSelectButton":function(d){return "выбрать"},
"playerSelectLetsGetStarted":function(d){return "Давайте начнем."},
"reinfFeedbackMsg":function(d){return "Вы можете нажать «Продолжить Игру», чтобы вернуться в игру."},
"replayButton":function(d){return "Повтор"},
"selectChooseButton":function(d){return "выбрать"},
"tooManyBlocksFail":function(d){return "Головоломка "+craft_locale.v(d,"puzzleNumber")+" завершена. Поздравляем! Также возможно завершить ее с "+craft_locale.p(d,"numBlocks",0,"ru",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};