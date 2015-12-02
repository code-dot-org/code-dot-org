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
"blockIfLavaAhead":function(d){return "hvis der er lava forude"},
"blockMoveForward":function(d){return "flyt fremad"},
"blockPlaceTorch":function(d){return "placér fakkel"},
"blockPlaceXAheadAhead":function(d){return "forude"},
"blockPlaceXAheadPlace":function(d){return "placér"},
"blockPlaceXPlace":function(d){return "placér"},
"blockPlantCrop":function(d){return "plant afgrøde"},
"blockShear":function(d){return "klip"},
"blockTillSoil":function(d){return "pløj jord"},
"blockTurnLeft":function(d){return "drej til venstre"},
"blockTurnRight":function(d){return "drej til højre"},
"blockTypeBedrock":function(d){return "klippe"},
"blockTypeBricks":function(d){return "tegl"},
"blockTypeClay":function(d){return "ler"},
"blockTypeClayHardened":function(d){return "hærdet ler"},
"blockTypeCobblestone":function(d){return "brosten"},
"blockTypeDirt":function(d){return "jord"},
"blockTypeDirtCoarse":function(d){return "grov jord"},
"blockTypeEmpty":function(d){return "tom"},
"blockTypeFarmlandWet":function(d){return "landbrugsjord"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "græs"},
"blockTypeGravel":function(d){return "grus"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "akaciekævle"},
"blockTypeLogBirch":function(d){return "birkekævle"},
"blockTypeLogJungle":function(d){return "jungletræskævle"},
"blockTypeLogOak":function(d){return "egetræskævle"},
"blockTypeLogSpruce":function(d){return "grantræskævle"},
"blockTypeOreCoal":function(d){return "kulmalm"},
"blockTypeOreDiamond":function(d){return "diamantmalm"},
"blockTypeOreEmerald":function(d){return "smaragdmalm"},
"blockTypeOreGold":function(d){return "guldmalm"},
"blockTypeOreIron":function(d){return "jernmalm"},
"blockTypeOreLapis":function(d){return "lapismalm"},
"blockTypeOreRedstone":function(d){return "rødstensmalm"},
"blockTypePlanksAcacia":function(d){return "akacietræplanker"},
"blockTypePlanksBirch":function(d){return "birkeplanker"},
"blockTypePlanksJungle":function(d){return "jungletræsplanker"},
"blockTypePlanksOak":function(d){return "egetræsplanker"},
"blockTypePlanksSpruce":function(d){return "grantræsplanker"},
"blockTypeRail":function(d){return "skinne"},
"blockTypeSand":function(d){return "sand"},
"blockTypeSandstone":function(d){return "sandsten"},
"blockTypeStone":function(d){return "sten"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "træ"},
"blockTypeWater":function(d){return "vand"},
"blockTypeWool":function(d){return "uld"},
"blockWhileXAheadAhead":function(d){return "forude"},
"blockWhileXAheadDo":function(d){return "udfør"},
"blockWhileXAheadWhile":function(d){return "mens"},
"generatedCodeDescription":function(d){return "Ved at trække og placere blokke i dette hovedbrud har du skabt et sæt instruktioner i programmeringssproget Javascript. Denne kode fortæller computeren, hvad den skal vise på skærmen. Alt, du ser og gør i Minecraft, begynder med computerkode som denne."},
"houseSelectChooseFloorPlan":function(d){return "Vælg grundplan for dit hus."},
"houseSelectEasy":function(d){return "Let"},
"houseSelectHard":function(d){return "Svær"},
"houseSelectLetsBuild":function(d){return "Lad os bygge et hus."},
"houseSelectMedium":function(d){return "Mellem"},
"keepPlayingButton":function(d){return "Fortsæt med at spille"},
"level10FailureMessage":function(d){return "Dæk lavaen til, så du kan gå på den, og udvind så to jernblokke på den anden side."},
"level11FailureMessage":function(d){return "Sørg for at placere brosten, hvis der er lava forude. Så kan du udvinde ressourcer fra rækken i sikkerhed."},
"level12FailureMessage":function(d){return "Sørg for at udvinde tre rødstensblokke. Denne opgave kombinerer de ting, du har lært ved at bygge dit hus og ved at bruge \"hvis\"-kommandoer, så du undgår at falde i lavaen."},
"level13FailureMessage":function(d){return "Placér en \"skinne\" langs stien, der går fra din dør til kanten af kortet."},
"level1FailureMessage":function(d){return "Du skal bruge kommandoer for at få fåret til at gå."},
"level1TooFewBlocksMessage":function(d){return "Prøv at bruge kommandoer for at få fåret til at gå."},
"level2FailureMessage":function(d){return "Fæld et træ ved at gå hen til stammen og bruge \"ødelæg blok\"-kommandoen."},
"level2TooFewBlocksMessage":function(d){return "Prøv at bruge kommandoer for at fælde træet. Fæld et træ ved at gå hen til stammen og bruge \"ødelæg blok\"-kommandoen."},
"level3FailureMessage":function(d){return "Saml uld fra begge får ved at gå hen til hver af dem og bruge \"klip\"-kommandoen. Husk at bruge \"drej\"-kommandoer for at nå frem til fåret."},
"level3TooFewBlocksMessage":function(d){return "Prøv at bruge flere kommandoer for at samle uld fra begge får. Gå hen til hver af dem, og brug \"klip\"-kommandoen."},
"level4FailureMessage":function(d){return "Du skal bruge \"ødelæg blok\"-kommandoen på hver af de tre træstammer."},
"level5FailureMessage":function(d){return "Placér dine blokke på jordmarkeringerne for at bygge en væg. Den lyserøde \"gentag\"-kommando afvikler kommandoer, der placeres i den, såsom \"placér blok\" og \"ryk fremad\"."},
"level6FailureMessage":function(d){return "Placér blokke på jordmarkeringerne uden for huset for at gennemføre hovedbruddet."},
"level7FailureMessage":function(d){return "Brug \"plant\"-kommandoen for at plante afgrøder på hvert felt med mørkt, pløjet jord."},
"level8FailureMessage":function(d){return "Hvis du rører ved en sniger, eksploderer den. List dig rundt om dem, og kom ind i dit hus."},
"level9FailureMessage":function(d){return "Glem ikke at placere mindst to fakler for at give lys, OG udvind mindst to stykker kul."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Hovedbrud "+craft_locale.v(d,"puzzleNumber")+" gennemført. Tillykke!"},
"playerSelectChooseCharacter":function(d){return "Vælg din figur."},
"playerSelectChooseSelectButton":function(d){return "Vælg"},
"playerSelectLetsGetStarted":function(d){return "Lad os komme i gang."},
"reinfFeedbackMsg":function(d){return "Tryk på \"Fortsæt med at spille\" for at vende tilbage til dit spil."},
"replayButton":function(d){return "Spil igen"},
"selectChooseButton":function(d){return "Vælg"},
"tooManyBlocksFail":function(d){return "Hovedbrud "+craft_locale.v(d,"puzzleNumber")+" gennemført. Tillykke! Det er også muligt at gennemføre det med "+craft_locale.p(d,"numBlocks",0,"da",{"one":"1 blok","other":craft_locale.n(d,"numBlocks")+" blokke"})+"."}};