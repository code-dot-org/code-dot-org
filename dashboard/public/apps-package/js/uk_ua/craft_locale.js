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
"blockDestroyBlock":function(d){return "знищити блок"},
"blockIf":function(d){return "якщо"},
"blockIfLavaAhead":function(d){return "якщо попереду лава"},
"blockMoveForward":function(d){return "рухатись вперед"},
"blockPlaceTorch":function(d){return "поставити факел"},
"blockPlaceXAheadAhead":function(d){return "попереду"},
"blockPlaceXAheadPlace":function(d){return "поставити"},
"blockPlaceXPlace":function(d){return "поставити"},
"blockPlantCrop":function(d){return "посадити рослину"},
"blockShear":function(d){return "стригти"},
"blockTillSoil":function(d){return "орати землю"},
"blockTurnLeft":function(d){return "повернути ліворуч"},
"blockTurnRight":function(d){return "повернути праворуч"},
"blockTypeBedrock":function(d){return "скеля"},
"blockTypeBricks":function(d){return "цеглини"},
"blockTypeClay":function(d){return "глина"},
"blockTypeClayHardened":function(d){return "загартована глина"},
"blockTypeCobblestone":function(d){return "бруківка"},
"blockTypeDirt":function(d){return "земля"},
"blockTypeDirtCoarse":function(d){return "грубий бруд"},
"blockTypeEmpty":function(d){return "пусто"},
"blockTypeFarmlandWet":function(d){return "поле"},
"blockTypeGlass":function(d){return "скло"},
"blockTypeGrass":function(d){return "трава"},
"blockTypeGravel":function(d){return "гравій"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "акацієва колода"},
"blockTypeLogBirch":function(d){return "березова колода"},
"blockTypeLogJungle":function(d){return "тропічна колода"},
"blockTypeLogOak":function(d){return "дубова колода"},
"blockTypeLogSpruce":function(d){return "ялинова колода"},
"blockTypeOreCoal":function(d){return "вугільна руда"},
"blockTypeOreDiamond":function(d){return "діамантова руда"},
"blockTypeOreEmerald":function(d){return "смарагдова руда"},
"blockTypeOreGold":function(d){return "золота руда"},
"blockTypeOreIron":function(d){return "залізна руда"},
"blockTypeOreLapis":function(d){return "лазуритова руда"},
"blockTypeOreRedstone":function(d){return "червона руда"},
"blockTypePlanksAcacia":function(d){return "акацієві дошки"},
"blockTypePlanksBirch":function(d){return "березові дошки"},
"blockTypePlanksJungle":function(d){return "тропічні дошки"},
"blockTypePlanksOak":function(d){return "дубові дошки"},
"blockTypePlanksSpruce":function(d){return "ялинові дошки"},
"blockTypeRail":function(d){return "колія"},
"blockTypeSand":function(d){return "пісок"},
"blockTypeSandstone":function(d){return "пісковик"},
"blockTypeStone":function(d){return "камінь"},
"blockTypeTnt":function(d){return "динаміт"},
"blockTypeTree":function(d){return "дерево"},
"blockTypeWater":function(d){return "вода"},
"blockTypeWool":function(d){return "вовна"},
"blockWhileXAheadAhead":function(d){return "попереду"},
"blockWhileXAheadDo":function(d){return "робити"},
"blockWhileXAheadWhile":function(d){return "поки"},
"generatedCodeDescription":function(d){return "Перетягуючи блоки у цьому завданні, можна створити набір інструкцій мовою програмування JavaScript. Цей код вкаже комп'ютеру, що саме відображати на екрані. Все, що ти бачиш і робиш у Майнкрафт також починається з рядків коду, схожих на цей."},
"houseSelectChooseFloorPlan":function(d){return "Обери план будинку."},
"houseSelectEasy":function(d){return "Легкий"},
"houseSelectHard":function(d){return "Складний"},
"houseSelectLetsBuild":function(d){return "Збудуємо будинок."},
"houseSelectMedium":function(d){return "Середній"},
"keepPlayingButton":function(d){return "Продовжити"},
"level10FailureMessage":function(d){return "Прикрий лаву, щоб можна було пройти, а тоді добудь два залізні блоки з іншого боку."},
"level11FailureMessage":function(d){return "Переконайся, що шлях попереду замощений бруківкою, якщо там лава. Це дозволить безпечно добути цей рядок ресурсів."},
"level12FailureMessage":function(d){return "Не забудь добути 3 блоки червогої руди. Це поєднує вже вивчене під час будівництва будинку з використанням команди \"якщо\", щоб запобігти падінню у лаву."},
"level13FailureMessage":function(d){return "Розмісти \"колію\" вздовж шляху від дверей будинку до краю карти."},
"level1FailureMessage":function(d){return "Потрібно використати команди, щоб дістатись до вівці."},
"level1TooFewBlocksMessage":function(d){return "Спробуй використати більше команд, щоб дістатись до вівці."},
"level2FailureMessage":function(d){return "Щоб зрубати дерево, підійди до стовбура і використай команду \"знищити блок\"."},
"level2TooFewBlocksMessage":function(d){return "Спробуй використати більше команд, щоб зрубати дерево. Підійди до стовбура і використай команду \"знищити блок\"."},
"level3FailureMessage":function(d){return "Щоб зібрати вовну з обох овець, підійди до кожної з них і використай команду \"стригти\". Не забудь використати команду повороту, щоб дістатись до кожної вівці."},
"level3TooFewBlocksMessage":function(d){return "Спробуй використати більше команд, щоб зібрати вовну з обох овець. Підійди до кожної і використай команду \"стригти\"."},
"level4FailureMessage":function(d){return "Потрібно використати команду \"знищити блок\" на кожному з трьох стовбурів дерев."},
"level5FailureMessage":function(d){return "Розмісти блоки на земляних обрисах, щоб збудувати стіну. Рожева команда \"повторити\" виконуватиме команди, розміщені всередині, такі як \"поставити блок\" та \"рухатись вперед\"."},
"level6FailureMessage":function(d){return "Розмісти блоки на земляних обрисах будинку, щоб виконати завдання."},
"level7FailureMessage":function(d){return "Використай команду \"посадити\", щоб посадити рослини на кожному блоці темного обробленого ґрунту."},
"level8FailureMessage":function(d){return "Якщо торкнешся плазуна, він вибухне. Проберись повз них і дістанься дому."},
"level9FailureMessage":function(d){return "Не забудь розмістити принаймні 2 факели, щоб освітити шлях І добути принаймні 2 блоки вугілля."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Завдання "+craft_locale.v(d,"puzzleNumber")+" виконано. Вітаємо!"},
"playerSelectChooseCharacter":function(d){return "Обери персонажа."},
"playerSelectChooseSelectButton":function(d){return "Обрати"},
"playerSelectLetsGetStarted":function(d){return "Розпочнемо."},
"reinfFeedbackMsg":function(d){return "Можеш натиснути \"Грати далі\", щоб повернутись до своєї гри."},
"replayButton":function(d){return "Повторити"},
"selectChooseButton":function(d){return "Обрати"},
"tooManyBlocksFail":function(d){return "Завдання "+craft_locale.v(d,"puzzleNumber")+" виконано. Вітаємо! Це завдання можна виконати "+craft_locale.p(d,"numBlocks",0,"uk",{"one":"1 блоком","other":craft_locale.n(d,"numBlocks")+" блоками"})+"."}};