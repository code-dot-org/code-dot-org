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
"blockDestroyBlock":function(d){return "förstör block"},
"blockIf":function(d){return "om"},
"blockIfLavaAhead":function(d){return "om lava framför"},
"blockMoveForward":function(d){return "gå framåt"},
"blockPlaceTorch":function(d){return "placera fackla"},
"blockPlaceXAheadAhead":function(d){return "framåt"},
"blockPlaceXAheadPlace":function(d){return "placera"},
"blockPlaceXPlace":function(d){return "placera"},
"blockPlantCrop":function(d){return "plantera gröda"},
"blockShear":function(d){return "sax"},
"blockTillSoil":function(d){return "plöj jord"},
"blockTurnLeft":function(d){return "sväng vänster"},
"blockTurnRight":function(d){return "sväng höger"},
"blockTypeBedrock":function(d){return "berggrund"},
"blockTypeBricks":function(d){return "tegelstenar"},
"blockTypeClay":function(d){return "lera"},
"blockTypeClayHardened":function(d){return "härdad lera"},
"blockTypeCobblestone":function(d){return "kullersten"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "grov jord"},
"blockTypeEmpty":function(d){return "töm"},
"blockTypeFarmlandWet":function(d){return "åkerjord"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "gräs"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akaciastock"},
"blockTypeLogBirch":function(d){return "björkstock"},
"blockTypeLogJungle":function(d){return "djungelträstock"},
"blockTypeLogOak":function(d){return "ekstock"},
"blockTypeLogSpruce":function(d){return "granstock"},
"blockTypeOreCoal":function(d){return "kolmalm"},
"blockTypeOreDiamond":function(d){return "diamantmalm"},
"blockTypeOreEmerald":function(d){return "smaragdmalm"},
"blockTypeOreGold":function(d){return "guldmalm"},
"blockTypeOreIron":function(d){return "järnmalm"},
"blockTypeOreLapis":function(d){return "lasurmalm"},
"blockTypeOreRedstone":function(d){return "eldstensmalm"},
"blockTypePlanksAcacia":function(d){return "akaciaplankor"},
"blockTypePlanksBirch":function(d){return "björkplankor"},
"blockTypePlanksJungle":function(d){return "djungelplankor"},
"blockTypePlanksOak":function(d){return "ekplankor"},
"blockTypePlanksSpruce":function(d){return "granplankor"},
"blockTypeRail":function(d){return "räls"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandsten"},
"blockTypeStone":function(d){return "sten"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "träd"},
"blockTypeWater":function(d){return "vatten"},
"blockTypeWool":function(d){return "ull"},
"blockWhileXAheadAhead":function(d){return "framåt"},
"blockWhileXAheadDo":function(d){return "utför"},
"blockWhileXAheadWhile":function(d){return "medan"},
"generatedCodeDescription":function(d){return "Genom att dra och placera block i det här pusslet har du skapat instruktioner i datorspråket Javascript. Den här koden talar om för datorer vad de ska visa på skärmen. Allt du ser och gör i Minecraft börjar med datorkod som den här."},
"houseSelectChooseFloorPlan":function(d){return "Välj planritning för ditt hus."},
"houseSelectEasy":function(d){return "Lätt"},
"houseSelectHard":function(d){return "Svårt"},
"houseSelectLetsBuild":function(d){return "Nu bygger vi ett hus."},
"houseSelectMedium":function(d){return "Mellan"},
"keepPlayingButton":function(d){return "Fortsätt spela"},
"level10FailureMessage":function(d){return "Täck lavan för att kunna gå över, och bryt sedan två av järnblocken på andra sidan."},
"level11FailureMessage":function(d){return "Se till att placera kullersten längre fram om det finns lava där. Det låter dig bryta resurserna säkert."},
"level12FailureMessage":function(d){return "Bryt 3 eldstensblock. Det här kombinerar det du lärt dig av att bygga ditt hur med att använda \"om\"-satser för att undvika att falla ned i lava."},
"level13FailureMessage":function(d){return "Placera \"räls\" längs jordvägen från din dörr till kartans utkant."},
"level1FailureMessage":function(d){return "Du måste använda kommandon för att gå till fåret."},
"level1TooFewBlocksMessage":function(d){return "Försök använda fler kommandon för att gå till fåret."},
"level2FailureMessage":function(d){return "För att hugga ned ett träd, gå fram till stammen och använd kommandot \"förstör block\"."},
"level2TooFewBlocksMessage":function(d){return "Försök använda fler kommandon för att hugga ned trädet. Gå fram till stammen och använd kommandot \"förstör block\"\"."},
"level3FailureMessage":function(d){return "För att samla ull från båda får ska du gå fram till vart och ett och använda kommandot \"klipp\". Kom ihåg att använda turkommandon för att komma till fåret."},
"level3TooFewBlocksMessage":function(d){return "Försök använda fler kommandon för att samla ull från båda får. Gå fram till vart och ett och använd kommandot \"klipp\"."},
"level4FailureMessage":function(d){return "Du måste använda kommandot \"förstör block\" på alla tre stammar."},
"level5FailureMessage":function(d){return "Placera dina block på jordlinjen för att bygga en mur. Det rosa kommandot \"upprepa\" kommer köra alla kommandon du placerar i det, till exempel \"placera block\" och \"gå framåt\"."},
"level6FailureMessage":function(d){return "Placera block på jordgränsen utanför huset för att klara pusslet."},
"level7FailureMessage":function(d){return "Använd kommandot \"plantera\" för att placera grödor på varje bit plöjd jord."},
"level8FailureMessage":function(d){return "Om du nuddar en smygare kommer den explodera. Smyg förbi dem och ta dig in i ditt hus."},
"level9FailureMessage":function(d){return "Glöm inte att placera minst 2 facklor för att lysa upp vägen och bryt minst 2 kol."},
"minecraftBlock":function(d){return "Block"},
"nextLevelMsg":function(d){return "Pussel "+craft_locale.v(d,"puzzleNumber")+" avklarat. Grattis!"},
"playerSelectChooseCharacter":function(d){return "Välj karaktär."},
"playerSelectChooseSelectButton":function(d){return "Välj"},
"playerSelectLetsGetStarted":function(d){return "Nu börjar vi."},
"reinfFeedbackMsg":function(d){return "Du kan trycka på \"Fortsätt spela\" för att återgå till spelet."},
"replayButton":function(d){return "Spela om"},
"selectChooseButton":function(d){return "Välj"},
"tooManyBlocksFail":function(d){return "Pussel "+craft_locale.v(d,"puzzleNumber")+" avklarat. Grattis! Det är också möjligt att klara det med "+craft_locale.p(d,"numBlocks",0,"sv",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};