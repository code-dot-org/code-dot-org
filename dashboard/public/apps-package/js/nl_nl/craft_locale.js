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
"blockDestroyBlock":function(d){return "vernietig blok"},
"blockIf":function(d){return "als"},
"blockIfLavaAhead":function(d){return "als lava voor je"},
"blockMoveForward":function(d){return "beweeg vooruit"},
"blockPlaceTorch":function(d){return "plaats fakkel"},
"blockPlaceXAheadAhead":function(d){return "vooruit"},
"blockPlaceXAheadPlace":function(d){return "plaats"},
"blockPlaceXPlace":function(d){return "plaats"},
"blockPlantCrop":function(d){return "plant gewas"},
"blockShear":function(d){return "schaar"},
"blockTillSoil":function(d){return "spit bodem om"},
"blockTurnLeft":function(d){return "Draai linksom"},
"blockTurnRight":function(d){return "Draai rechtsom"},
"blockTypeBedrock":function(d){return "bodemsteen"},
"blockTypeBricks":function(d){return "bakstenen"},
"blockTypeClay":function(d){return "klei"},
"blockTypeClayHardened":function(d){return "geharde klei"},
"blockTypeCobblestone":function(d){return "keisteen"},
"blockTypeDirt":function(d){return "aarde"},
"blockTypeDirtCoarse":function(d){return "grove aarde"},
"blockTypeEmpty":function(d){return "leeg"},
"blockTypeFarmlandWet":function(d){return "akkerland"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "gras"},
"blockTypeGravel":function(d){return "grind"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "acaciahout"},
"blockTypeLogBirch":function(d){return "berkenhout"},
"blockTypeLogJungle":function(d){return "oerwoudhout"},
"blockTypeLogOak":function(d){return "eikenhout"},
"blockTypeLogSpruce":function(d){return "sparrenhout"},
"blockTypeOreCoal":function(d){return "steenkoolerts"},
"blockTypeOreDiamond":function(d){return "diamanterts"},
"blockTypeOreEmerald":function(d){return "smaragderts"},
"blockTypeOreGold":function(d){return "gouderts"},
"blockTypeOreIron":function(d){return "ijzererts"},
"blockTypeOreLapis":function(d){return "lapis-erts"},
"blockTypeOreRedstone":function(d){return "redstone-erts"},
"blockTypePlanksAcacia":function(d){return "acacia planken"},
"blockTypePlanksBirch":function(d){return "berken planken"},
"blockTypePlanksJungle":function(d){return "jungle planken"},
"blockTypePlanksOak":function(d){return "eiken planken"},
"blockTypePlanksSpruce":function(d){return "sparren planken"},
"blockTypeRail":function(d){return "spoor"},
"blockTypeSand":function(d){return "zand"},
"blockTypeSandstone":function(d){return "zandsteen"},
"blockTypeStone":function(d){return "steen"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "boom"},
"blockTypeWater":function(d){return "water"},
"blockTypeWool":function(d){return "wol"},
"blockWhileXAheadAhead":function(d){return "vooruit"},
"blockWhileXAheadDo":function(d){return "voer uit"},
"blockWhileXAheadWhile":function(d){return "terwijl"},
"generatedCodeDescription":function(d){return "Door het slepen en plaatsen van blokken in deze puzzel heb je een lijst instructies gemaakt in een computertaal die JavaScript heet. Deze code vertelt computers wat er op het scherm moet komen. Alles wat je ziet en doet in Minecraft begint dan ook met regels computercode zoals deze."},
"houseSelectChooseFloorPlan":function(d){return "Kies een plattegrond voor je huis."},
"houseSelectEasy":function(d){return "Makkelijk"},
"houseSelectHard":function(d){return "Moeilijk"},
"houseSelectLetsBuild":function(d){return "Laten we een huis gaan bouwen."},
"houseSelectMedium":function(d){return "Normaal"},
"keepPlayingButton":function(d){return "Doorgaan met spelen"},
"level10FailureMessage":function(d){return "Bedek de lava om er overheen te lopen, graaf dan aan de andere kant 2 blokken ijzererts."},
"level11FailureMessage":function(d){return "Zorg ervoor dat je keistenen plaatst als er lava voor je is. hierdoor kun je in deze rij veilig graven naar de grondstoffen."},
"level12FailureMessage":function(d){return "Zorg ervoor dat je 3 redstone blokken opgraaft. Dit combineert wat je geleerd hebt met het bouwen van je huis en het gebruik van de \"als\" functie om te voorkomen dat je in de lava valt."},
"level13FailureMessage":function(d){return "Plaats \"spoor\" langs het zandpad van je huis naar de rand van de kaart."},
"level1FailureMessage":function(d){return "Je moet commando's gebruiken om naar de schaap te lopen."},
"level1TooFewBlocksMessage":function(d){return "Probeer meer commando's om naar de schaap te lopen."},
"level2FailureMessage":function(d){return "Als u een boom wilt omhakken, loop naar de stam en gebruik het commando \"vernietigen blok\"."},
"level2TooFewBlocksMessage":function(d){return "Probeer meer commando's om de boom om te hakken. Loop naar de stam en gebruik het commando \"vernietigen blok\"."},
"level3FailureMessage":function(d){return "Om wol van beide schapen te verzamelen, Loop naar ieder schaap en gebruik het commando \"schaar\". Vergeet niet om het \"draai\" commando te gebruiken om bij de schapen te komen."},
"level3TooFewBlocksMessage":function(d){return "Probeer meer commando's om wol te verzamelen van beide schapen. Loop naar ieder schaap en gebruik het \"schaar\" commando."},
"level4FailureMessage":function(d){return "Je moet het commando \"vernietigen blok\" gebruiken bij ieder van de drie boomstammen."},
"level5FailureMessage":function(d){return "Plaats blokken op de zanderige omtrek van het huis om een muur te bouwen. Het roze \"herhaal\" commando voert de commando's uit die er in geplaatst worden, zoals \"plaats blok\" en \"beweeg naar voren\"."},
"level6FailureMessage":function(d){return "Plaats blokken op de zanderige omtrek van het huis om de puzzel te voltooien."},
"level7FailureMessage":function(d){return "Gebruik de \"Plant\" opdracht (commando) om gewassen te planten op ieder stukje donkere bewerkte aarde."},
"level8FailureMessage":function(d){return "Als je een Creeper raakt dan ontploft hij. Sluip om ze heen en ga naar binnen in je huis."},
"level9FailureMessage":function(d){return "Vergeet niet om ten minste 2 fakkels te plaatsen om je weg te verlichten EN graaf ten minste 2 blokken kolen."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Puzzel "+craft_locale.v(d,"puzzleNumber")+" voltooid. Gefeliciteerd!"},
"playerSelectChooseCharacter":function(d){return "Kies je karakter."},
"playerSelectChooseSelectButton":function(d){return "Selecteer"},
"playerSelectLetsGetStarted":function(d){return "Laten we beginnen."},
"reinfFeedbackMsg":function(d){return "Je kunt op \"Blijf Spelen\" drukken om terug te gaan naar jouw spel."},
"replayButton":function(d){return "Opnieuw"},
"selectChooseButton":function(d){return "Selecteer"},
"tooManyBlocksFail":function(d){return "Puzzel "+craft_locale.v(d,"puzzleNumber")+" voltooid. Gefeliciteerd! Je kunt hem ook voltooien met "+craft_locale.p(d,"numBlocks",0,"nl",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};