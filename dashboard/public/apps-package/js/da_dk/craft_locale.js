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
"blockDestroyBlock":function(d){return "ødelæg blok"},
"blockIf":function(d){return "hvis\n"},
"blockIfLavaAhead":function(d){return "hvis lava foran"},
"blockMoveForward":function(d){return "flyt fremad"},
"blockPlaceTorch":function(d){return "sæt fakkel"},
"blockPlaceXAheadAhead":function(d){return "foran"},
"blockPlaceXAheadPlace":function(d){return "sæt"},
"blockPlaceXPlace":function(d){return "sæt"},
"blockPlantCrop":function(d){return "plant afgrøde"},
"blockShear":function(d){return "klip"},
"blockTillSoil":function(d){return "markjord"},
"blockTurnLeft":function(d){return "drej til venstre"},
"blockTurnRight":function(d){return "drej til højre"},
"blockTypeBedrock":function(d){return "klippe"},
"blockTypeBricks":function(d){return "mursten"},
"blockTypeClay":function(d){return "ler"},
"blockTypeClayHardened":function(d){return "brændt ler"},
"blockTypeCobblestone":function(d){return "brosten"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "sandjord"},
"blockTypeEmpty":function(d){return "tom"},
"blockTypeFarmlandWet":function(d){return "mark"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "græs"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akaciestamme"},
"blockTypeLogBirch":function(d){return "birkestamme"},
"blockTypeLogJungle":function(d){return "jungletræstamme"},
"blockTypeLogOak":function(d){return "egetræsstamme"},
"blockTypeLogSpruce":function(d){return "grantræstamme"},
"blockTypeOreCoal":function(d){return "kulmalm"},
"blockTypeOreDiamond":function(d){return "diamantaflejring"},
"blockTypeOreEmerald":function(d){return "smaragdaflejring"},
"blockTypeOreGold":function(d){return "guldmalm"},
"blockTypeOreIron":function(d){return "jernmalm"},
"blockTypeOreLapis":function(d){return "lapismalm"},
"blockTypeOreRedstone":function(d){return "rødstensmalm"},
"blockTypePlanksAcacia":function(d){return "akacieplanker"},
"blockTypePlanksBirch":function(d){return "birkeplanker"},
"blockTypePlanksJungle":function(d){return "jungletræsplanker"},
"blockTypePlanksOak":function(d){return "egeplanker"},
"blockTypePlanksSpruce":function(d){return "granplanker"},
"blockTypeRail":function(d){return "jernbanespor"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandsten"},
"blockTypeStone":function(d){return "sten"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "træ"},
"blockTypeWater":function(d){return "vand"},
"blockTypeWool":function(d){return "uld"},
"blockWhileXAheadAhead":function(d){return "foran"},
"blockWhileXAheadDo":function(d){return "udfør"},
"blockWhileXAheadWhile":function(d){return "mens"},
"generatedCodeDescription":function(d){return "Ved at trække og placere brikker i denne opgave, har du oprettet et sæt med instruksioner i et programmeringssprog som hedder JavaScript. Denne kode fortæller computeren, hvad den skal vise på skærmen. Alt hvad du ser og gør i Minecraft, starter med linjer af kode som disse."},
"houseSelectChooseFloorPlan":function(d){return "Vælg grundplan for dit hus."},
"houseSelectEasy":function(d){return "Let"},
"houseSelectHard":function(d){return "Svær"},
"houseSelectLetsBuild":function(d){return "Byg et hus."},
"houseSelectMedium":function(d){return "Mellem"},
"keepPlayingButton":function(d){return "Fortsæt spillet"},
"level10FailureMessage":function(d){return "Dæk lavaen til for at gå over den. Udgrav så to jernblokke på den anden side."},
"level11FailureMessage":function(d){return "Husk at at sætte brosten foran dig, hvis der er lava foran dig. Så kan du udgrave blokkene på en sikker måde."},
"level12FailureMessage":function(d){return "Husk at udgrave 3 redstone blokke. Du skal kombinere hvad du har lært fra at bygge dit eget hus og hvordan du undgår lava med \"hvis\"-blokken."},
"level13FailureMessage":function(d){return "Læg \"jernbanespor\" langs grusvejen, der fører fra dit hus til kanten af kortet."},
"level1FailureMessage":function(d){return "Du skal bruge kommandoblokke for at gå hen til fåret."},
"level1TooFewBlocksMessage":function(d){return "Prøv at bruge flere kommandoblokke for at gå hen til fåret."},
"level2FailureMessage":function(d){return "Fæl træer ved at gå hen til stammen og brug \"ødelæg blok\" kommandoblokken."},
"level2TooFewBlocksMessage":function(d){return "Brug flere kommandoblokke for at fælde træet. Gå hen til stammen og brug \"ødelæg blok\" kommandoblokken."},
"level3FailureMessage":function(d){return "Saml uld fra begge får ved at gå hen til dem og brug \"klip\"-blokken. Husk at bruge \"drej\"-blokke for at komme hen til fårene."},
"level3TooFewBlocksMessage":function(d){return "Prøv at bruge flere blokke for at samle uld fra begge får. Gå til hver enkelt og brug \"klip\"-blokken."},
"level4FailureMessage":function(d){return "Du skal bruge \"ødelæg blok\" kommandoblokken på hver af de tre træstammer."},
"level5FailureMessage":function(d){return "Byg en væg ved at sætte dine blokke på grusvejen. Den lyserøde \"gentag\" kommandoblok udfører de kommandoblokke, der er sat inden i den. F. eks. \"sæt blok\" og \"gå frem\"."},
"level6FailureMessage":function(d){return "Sæt blokke på omridset af huset for at fuldføre opgaven."},
"level7FailureMessage":function(d){return "Brug \"så afgrøde\" kommandoblokken for at så afgrøder på alle pløjemarkerne."},
"level8FailureMessage":function(d){return "Creepers eksploderer hvis du rører ved dem. Snig dig forbi dem og gå ind i dit hus."},
"level9FailureMessage":function(d){return "Husk at placere mindst 2 fakler, så du kan se OG find mindst 2 stykker kul."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Opgave "+craft_locale.v(d,"puzzleNumber")+" er fuldført. Tillykke!"},
"playerSelectChooseCharacter":function(d){return "Vælg en person."},
"playerSelectChooseSelectButton":function(d){return "Vælg"},
"playerSelectLetsGetStarted":function(d){return "Lad os komme i gang."},
"reinfFeedbackMsg":function(d){return "Du kan trykke \"Fortsæt med at spille\"-knappen for at gå tilbage til at spille dit spil."},
"replayButton":function(d){return "Forfra"},
"selectChooseButton":function(d){return "Vælg"},
"tooManyBlocksFail":function(d){return "Opgave "+craft_locale.v(d,"puzzleNumber")+" er fuldført. Tillykke! Det er også muligt at fuldføre den med "+craft_locale.p(d,"numBlocks",0,"da",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};