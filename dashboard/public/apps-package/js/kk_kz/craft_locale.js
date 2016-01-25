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
"blockDestroyBlock":function(d){return "блокты жою"},
"blockIf":function(d){return "егер"},
"blockIfLavaAhead":function(d){return "Егер алда лава болса"},
"blockMoveForward":function(d){return "алдыға қозғалу"},
"blockPlaceTorch":function(d){return "Шам орнату"},
"blockPlaceXAheadAhead":function(d){return "алдында"},
"blockPlaceXAheadPlace":function(d){return "орнату"},
"blockPlaceXPlace":function(d){return "орнату"},
"blockPlantCrop":function(d){return "егін егу"},
"blockShear":function(d){return "жүн кесу"},
"blockTillSoil":function(d){return "топыраққа дейін"},
"blockTurnLeft":function(d){return "солға бұрылу"},
"blockTurnRight":function(d){return "оңға бұрылу"},
"blockTypeBedrock":function(d){return "топырақ"},
"blockTypeBricks":function(d){return "кірпіш"},
"blockTypeClay":function(d){return "Саз"},
"blockTypeClayHardened":function(d){return "шыңдалған саз"},
"blockTypeCobblestone":function(d){return "төселген"},
"blockTypeDirt":function(d){return "балшық"},
"blockTypeDirtCoarse":function(d){return "қатты балшық"},
"blockTypeEmpty":function(d){return "бос"},
"blockTypeFarmlandWet":function(d){return "ауыл шаруашылығы учаскесі"},
"blockTypeGlass":function(d){return "шыны"},
"blockTypeGrass":function(d){return "шөп"},
"blockTypeGravel":function(d){return "құмтас"},
"blockTypeLava":function(d){return "лава"},
"blockTypeLogAcacia":function(d){return "акация журналы"},
"blockTypeLogBirch":function(d){return "қайың"},
"blockTypeLogJungle":function(d){return "Тропикалық ағаштың діңгегі"},
"blockTypeLogOak":function(d){return "емен"},
"blockTypeLogSpruce":function(d){return "шырша"},
"blockTypeOreCoal":function(d){return "көмір кені"},
"blockTypeOreDiamond":function(d){return "алмас кені"},
"blockTypeOreEmerald":function(d){return "изумруд кені"},
"blockTypeOreGold":function(d){return "алтын кені"},
"blockTypeOreIron":function(d){return "темір кені"},
"blockTypeOreLapis":function(d){return "лазурит кені"},
"blockTypeOreRedstone":function(d){return "қызыл кен"},
"blockTypePlanksAcacia":function(d){return "ағаш тақталар"},
"blockTypePlanksBirch":function(d){return "қайың тақталар"},
"blockTypePlanksJungle":function(d){return "тропикалық ағаш тақталары"},
"blockTypePlanksOak":function(d){return "емен тақталар"},
"blockTypePlanksSpruce":function(d){return "шырша тақталар"},
"blockTypeRail":function(d){return "рельс"},
"blockTypeSand":function(d){return "құм"},
"blockTypeSandstone":function(d){return "құмтас"},
"blockTypeStone":function(d){return "тас"},
"blockTypeTnt":function(d){return "тротил"},
"blockTypeTree":function(d){return "ағаш"},
"blockTypeWater":function(d){return "су"},
"blockTypeWool":function(d){return "жүн"},
"blockWhileXAheadAhead":function(d){return "алдында"},
"blockWhileXAheadDo":function(d){return "жасау"},
"blockWhileXAheadWhile":function(d){return "болған кезде "},
"generatedCodeDescription":function(d){return "Сіз бұл тапсырмада блоктарды орнын ауыстыру және орналастыру арқылы  Javascript бағдарламалау тіліндегі нұсқаулықтар жиынын құрдыңыз. Бұл код компьютерге экранға не шығару қажеттігін көрсетеді. Сіз Minecratf-тан көретін және жасайтын барлық заттар да осы секілді компьютерлік кодтан басталады."},
"houseSelectChooseFloorPlan":function(d){return "Үйіңіздіт қабат жоспарыт таңдаңыз."},
"houseSelectEasy":function(d){return "оңай"},
"houseSelectHard":function(d){return "қиын"},
"houseSelectLetsBuild":function(d){return "Үй салып көрейік."},
"houseSelectMedium":function(d){return "Орта"},
"keepPlayingButton":function(d){return "Ойынды жалғастыру"},
"level10FailureMessage":function(d){return "Лавадан өту үшін оның бетін жабыңыз да, арғы жақтан екі темір блок табыңыз."},
"level11FailureMessage":function(d){return "Егер алдыңызда лава бар болса, міндетті түрде алдыңызға үлкен тастарды орналастырыңыз. Осылайша сіз ресурстарды қауіпсіз таба аласыз."},
"level12FailureMessage":function(d){return "Міндетті түрдк 3 қызыл тас блогын табыңыз. Ол үшін сізге үйді соғу кезіндегі үйренген біліміңіз және \"егер\" операторы қажет болады."},
"level13FailureMessage":function(d){return "Сіздің табалдырығыңыздан картаның шетіне дейін алып баратын жолдың бойына \"рельстерді\" орналастырыңыз."},
"level1FailureMessage":function(d){return "Қойға жақындау үшін сізге командаларды қолдану қажет."},
"level1TooFewBlocksMessage":function(d){return "Қойға жақындау үшін басқа командаларды қолданып көріңіз."},
"level2FailureMessage":function(d){return "Ағашты шабу үшін оның дініне жақындап, \"блокты жою\" командасын қолданыңыз."},
"level2TooFewBlocksMessage":function(d){return "Ағашты шабу үшін басқа командаларды қолданып көріңіз. Оның дініне жақындап \"блокты жою\" командасын қолданыңыз."},
"level3FailureMessage":function(d){return "Екі қойдың да жүнін жинап алу үшін оның әрқайсысына жақындап \"қырқу\" командасын қолданыңыз. Қойларға жақындау үшін бұрылу командасын қолдануды естен шығармаңыз."},
"level3TooFewBlocksMessage":function(d){return "Екі қойдығ да жүнін жинап алу үшін басқа командаларды қолданып көріңіз. Олардың әрқайсысына жақындап, \"қырқу\" командасын қолданыңыз."},
"level4FailureMessage":function(d){return "Үш діңнің әрқайсысына \"блокты жою\" командасын қолдану қажет."},
"level5FailureMessage":function(d){return "Қабырғаны соғу үшін жер контуры үстіне блоктарды орналастырыңыз. Қызғылт \"қайталау\" командасы өзінің ішінде орналастырылған \"блокты орналастыру\" және \"алдыға жүру\" секілді командаларды қайталауға мүмкіндік береді."},
"level6FailureMessage":function(d){return "Тапсырманы шешу үшін үйдің жер контурында блоктарды орналастырыңыз."},
"level7FailureMessage":function(d){return "Қара аударылған жер бөлігіне көшеттерді отырғызу үшін \"отырғызу\" командасын қолданыңыз."},
"level8FailureMessage":function(d){return "Егерде криперге тисетін болсаңыз ол жарылып кетеді. Оны сақтықпен айналып өтіп өз үйіңізге кіріңіз."},
"level9FailureMessage":function(d){return "Өз жолыңызды жарықтандыру үшін кем дегенде 2мшамшырақ орналастыруды ұмытпаңыз және кем дегенде 2 кқмір блогын табыңыз."},
"minecraftBlock":function(d){return "блок"},
"nextLevelMsg":function(d){return "Басқатырғыш "+craft_locale.v(d,"puzzleNumber")+" шешілді. Құттықтаймыз!"},
"playerSelectChooseCharacter":function(d){return "Кейіпкер таңдаңыз."},
"playerSelectChooseSelectButton":function(d){return "Таңдау"},
"playerSelectLetsGetStarted":function(d){return "Бастайық."},
"reinfFeedbackMsg":function(d){return "Ойынға қайта оралу үшін «Ойынды жалғастыру» батырмасына басыңыз."},
"replayButton":function(d){return "Ойынды қайталау"},
"selectChooseButton":function(d){return "Таңдау"},
"tooManyBlocksFail":function(d){return "Басқатырғыш "+craft_locale.v(d,"puzzleNumber")+" шешілді. Құттықтаймыз! Ее также можно решить с помощью "+craft_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};