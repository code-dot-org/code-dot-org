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
"blockDestroyBlock":function(d){return "унищожи блок"},
"blockIf":function(d){return "ако"},
"blockIfLavaAhead":function(d){return "Ако има лава отпред"},
"blockMoveForward":function(d){return "върви напред"},
"blockPlaceTorch":function(d){return "постави факел"},
"blockPlaceXAheadAhead":function(d){return "отпред"},
"blockPlaceXAheadPlace":function(d){return "постави"},
"blockPlaceXPlace":function(d){return "постави"},
"blockPlantCrop":function(d){return "засади растение"},
"blockShear":function(d){return "острижи"},
"blockTillSoil":function(d){return "обработване на почвата"},
"blockTurnLeft":function(d){return "завърти наляво"},
"blockTurnRight":function(d){return "завърти надясно"},
"blockTypeBedrock":function(d){return "скала"},
"blockTypeBricks":function(d){return "тухли"},
"blockTypeClay":function(d){return "глина"},
"blockTypeClayHardened":function(d){return "втвърдена глина"},
"blockTypeCobblestone":function(d){return "калдъръм"},
"blockTypeDirt":function(d){return "земя"},
"blockTypeDirtCoarse":function(d){return "камениста почва"},
"blockTypeEmpty":function(d){return "празно"},
"blockTypeFarmlandWet":function(d){return "земеделска земя"},
"blockTypeGlass":function(d){return "стъкло"},
"blockTypeGrass":function(d){return "трева"},
"blockTypeGravel":function(d){return "чакъл"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "акациев дънер"},
"blockTypeLogBirch":function(d){return "брезов дънер"},
"blockTypeLogJungle":function(d){return "дънер от джунглата"},
"blockTypeLogOak":function(d){return "дъбов дънер"},
"blockTypeLogSpruce":function(d){return "смърчов дънер"},
"blockTypeOreCoal":function(d){return "въглища"},
"blockTypeOreDiamond":function(d){return "диаманти"},
"blockTypeOreEmerald":function(d){return "изумруди"},
"blockTypeOreGold":function(d){return "златна руда"},
"blockTypeOreIron":function(d){return "желязна руда"},
"blockTypeOreLapis":function(d){return "лапис руда"},
"blockTypeOreRedstone":function(d){return "червени камъни"},
"blockTypePlanksAcacia":function(d){return "акациеви дъски"},
"blockTypePlanksBirch":function(d){return "брезови дъски"},
"blockTypePlanksJungle":function(d){return "джунглови дъски"},
"blockTypePlanksOak":function(d){return "дъбови дъски"},
"blockTypePlanksSpruce":function(d){return "смърчови дъски"},
"blockTypeRail":function(d){return "релса"},
"blockTypeSand":function(d){return "пясък"},
"blockTypeSandstone":function(d){return "пясъчник"},
"blockTypeStone":function(d){return "камък"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "дърво"},
"blockTypeWater":function(d){return "вода"},
"blockTypeWool":function(d){return "вълна"},
"blockWhileXAheadAhead":function(d){return "отпред"},
"blockWhileXAheadDo":function(d){return "правя"},
"blockWhileXAheadWhile":function(d){return "докато"},
"generatedCodeDescription":function(d){return "Чрез плъзгане и пускане на блокове в този пъзел, Вие ще създавате набор от инструкции на компютърен език, наречен Javascript. Този код казва на компютрите какво да се показва на екрана. Всичко, което видите и направите в Minecraft, също започва с редове на компютърен код като тези."},
"houseSelectChooseFloorPlan":function(d){return "Изберете план за къщата си."},
"houseSelectEasy":function(d){return "Лесно"},
"houseSelectHard":function(d){return "Трудно"},
"houseSelectLetsBuild":function(d){return "Нека да построим къща."},
"houseSelectMedium":function(d){return "Средно"},
"keepPlayingButton":function(d){return "Продължете да играете"},
"level10FailureMessage":function(d){return "Покрий лавата, за да прекосиш. След това изкопай два железни блока от другата страна."},
"level11FailureMessage":function(d){return "Не забравяйте да поставите калдъръм, ако има лава напред. Така безопасно ще копаете ресурси на този ред."},
"level12FailureMessage":function(d){return "Не забравяй да откриеш 3 блока с \"червен камък\". Това комбинира всичко, което си научил от изграждане на къщата си, а с помощта на \"ако\" функцията ще избегнеш падането в лавата."},
"level13FailureMessage":function(d){return "Постави \"релса\" по пясъчния път, която да води от твоята врата до границата на картата."},
"level1FailureMessage":function(d){return "Трябва да използваш командите, за да отидеш до овцете."},
"level1TooFewBlocksMessage":function(d){return "Опитай се да използваш повече команди, за да стигнеш до овцете."},
"level2FailureMessage":function(d){return "За да отсечете дърво, отидете до основата му и използвайте командата \"унищожи блок\"."},
"level2TooFewBlocksMessage":function(d){return "Опитайте да използвате повече команди, за да отрежете дървото. Използвайте командата \"унищожи блок\"."},
"level3FailureMessage":function(d){return "За да съберете вълната от двете овци, отидете до всяка и използвайте команда \"острижи\". Не забравяйте да използвате командата \"завърти\", за да достигнете до овцата."},
"level3TooFewBlocksMessage":function(d){return "Опитайте да използвате още команди, за да съберете вълна. Когато отидете до всяка овца използвайте командата \"острижи\"."},
"level4FailureMessage":function(d){return "Трябва да използвате командата \"унищожи блок\" на всеки от трите ствола."},
"level5FailureMessage":function(d){return "Поставете блоковете върху очертания план, за да построите стена. Розовата команда \"повтори\" ще изпълни всички команди, вмъкнати в блока ѝ, като \"постави блок\" и \"върви напред\"."},
"level6FailureMessage":function(d){return "Поставете блокове върху очертаният план за къща, за да завършите пъзела."},
"level7FailureMessage":function(d){return "Използвайте командата \"засади\", за да поставите посеви в разораната земя."},
"level8FailureMessage":function(d){return "Ако докоснете пълзящите растения, те ще експлодират. Промъкнете се около тях, за да влезете в къщата."},
"level9FailureMessage":function(d){return "Не забравайте да поставите 2 факли да осветяват пътя и да добиете поне 2 парчета въглища."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Пъзел "+craft_locale.v(d,"puzzleNumber")+" завършен. Поздравления!"},
"playerSelectChooseCharacter":function(d){return "Изберете герой."},
"playerSelectChooseSelectButton":function(d){return "Изберете"},
"playerSelectLetsGetStarted":function(d){return "Нека да започнем."},
"reinfFeedbackMsg":function(d){return "Можете да натиснете \"Запази игра\", за да играете отново играта си."},
"replayButton":function(d){return "Повтори"},
"selectChooseButton":function(d){return "Изберете"},
"tooManyBlocksFail":function(d){return "Пъзел "+craft_locale.v(d,"puzzleNumber")+" завършен. Поздравления! Той може да се завърши с "+craft_locale.p(d,"numBlocks",0,"bg",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};