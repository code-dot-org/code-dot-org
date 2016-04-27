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
"blockIfLavaAhead":function(d){return "als lava voor je is"},
"blockMoveForward":function(d){return "beweeg vooruit"},
"blockPlaceTorch":function(d){return "plaats toorts"},
"blockPlaceXAheadAhead":function(d){return "voor"},
"blockPlaceXAheadPlace":function(d){return "plaats"},
"blockPlaceXPlace":function(d){return "plaats"},
"blockPlantCrop":function(d){return "plant gewas"},
"blockShear":function(d){return "knip"},
"blockTillSoil":function(d){return "ploeg grond"},
"blockTurnLeft":function(d){return "Draai linksom"},
"blockTurnRight":function(d){return "Draai rechtsom"},
"blockTypeBedrock":function(d){return "bodemsteen"},
"blockTypeBricks":function(d){return "bakstenen"},
"blockTypeClay":function(d){return "klei"},
"blockTypeClayHardened":function(d){return "uitgeharde klei"},
"blockTypeCobblestone":function(d){return "keien"},
"blockTypeDirt":function(d){return "aarde"},
"blockTypeDirtCoarse":function(d){return "ruwe aarde"},
"blockTypeEmpty":function(d){return "leeg"},
"blockTypeFarmlandWet":function(d){return "akkerland"},
"blockTypeGlass":function(d){return "glas"},
"blockTypeGrass":function(d){return "gras"},
"blockTypeGravel":function(d){return "grind"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "acaciahout"},
"blockTypeLogBirch":function(d){return "berkenhout"},
"blockTypeLogJungle":function(d){return "junglehout"},
"blockTypeLogOak":function(d){return "eikenhout"},
"blockTypeLogSpruce":function(d){return "sparrenhout"},
"blockTypeOreCoal":function(d){return "steenkoolerts"},
"blockTypeOreDiamond":function(d){return "diamanterts"},
"blockTypeOreEmerald":function(d){return "smaragderts"},
"blockTypeOreGold":function(d){return "gouderts"},
"blockTypeOreIron":function(d){return "ijzererts"},
"blockTypeOreLapis":function(d){return "lapis-erts"},
"blockTypeOreRedstone":function(d){return "redstone-erts"},
"blockTypePlanksAcacia":function(d){return "acaciaplanken"},
"blockTypePlanksBirch":function(d){return "berkenhouten planken"},
"blockTypePlanksJungle":function(d){return "junglehouten planken"},
"blockTypePlanksOak":function(d){return "eikenhouten planken"},
"blockTypePlanksSpruce":function(d){return "sparrenhouten planken"},
"blockTypeRail":function(d){return "spoor"},
"blockTypeSand":function(d){return "zand"},
"blockTypeSandstone":function(d){return "zandsteen"},
"blockTypeStone":function(d){return "steen"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "boom"},
"blockTypeWater":function(d){return "water"},
"blockTypeWool":function(d){return "wol"},
"blockWhileXAheadAhead":function(d){return "voor"},
"blockWhileXAheadDo":function(d){return "voer uit"},
"blockWhileXAheadWhile":function(d){return "terwijl"},
"generatedCodeDescription":function(d){return "Door in deze puzzel blokken te plaatsen en te verschuiven, heb je een set instructies gevormd in de computertaal Javascript. Deze code vertelt computers wat ze op het scherm moeten laten zien. Alles wat je in Minecraft ziet en doet, begint met dit soort regels computercode."},
"houseSelectChooseFloorPlan":function(d){return "Kies de plattegrond voor je huis."},
"houseSelectEasy":function(d){return "Makkie"},
"houseSelectHard":function(d){return "Lastig"},
"houseSelectLetsBuild":function(d){return "Laten we een huis bouwen."},
"houseSelectMedium":function(d){return "Middelgroot"},
"keepPlayingButton":function(d){return "Verder spelen"},
"level10FailureMessage":function(d){return "Bedek de lava om over te steken, delf dan twee van de ijzeren blokken aan de overkant."},
"level11FailureMessage":function(d){return "Zorg dat je keien plaatst als er lava voor je is. Zo kun je veilig deze rij grondstoffen delven."},
"level12FailureMessage":function(d){return "Zorg dat je 3 redstoneblokken delft. Hier wordt wat je leerde toen je je huis bouwde, gecombineerd met het commando \"als\" om te voorkomen dat je in de lava valt."},
"level13FailureMessage":function(d){return "Plaats \"spoor\" langs het zandpad dat van je deur naar de rand van de kaart loopt."},
"level1FailureMessage":function(d){return "Je moet commando's gebruiken om naar het schaap te lopen."},
"level1TooFewBlocksMessage":function(d){return "Probeer meer commando's te gebruiken om naar het schaap te lopen."},
"level2FailureMessage":function(d){return "Als je de boom wilt omhakken, moet je naar de stam lopen en het commando \"vernietig blok\" gebruiken."},
"level2TooFewBlocksMessage":function(d){return "Probeer meer commando's te gebruiken om de boom om te hakken. Loop naar de stam en gebruik het commando \"vernietig blok\"."},
"level3FailureMessage":function(d){return "Als je wol van beide schapen wilt verzamelen, moet je naar elk schaap lopen en het commando \"knip\" gebruiken. Vergeet niet de draai-commando's te gebruiken om de schapen te bereiken."},
"level3TooFewBlocksMessage":function(d){return "Probeer meer commando's te gebruiken om wol van beide schapen te verzamelen. Loop naar elk schaap en gebruik het commando \"knip\"."},
"level4FailureMessage":function(d){return "Je moet het commando \"vernietig blok\" gebruiken op alle drie boomstammen."},
"level5FailureMessage":function(d){return "Plaats je blokken op de zandlijn om een muur te bouwen. Het roze commando \"herhaal\" gebruikt de commando's die erin geplaatst zijn, zoals \"plaats blok\" en \"beweeg vooruit\"."},
"level6FailureMessage":function(d){return "Plaats blokken op de zandlijnen van het huis om de puzzel te voltooien."},
"level7FailureMessage":function(d){return "Gebruik het commando \"plant\" om gewassen te planten op elk donker stuk omgeploegde grond."},
"level8FailureMessage":function(d){return "Als je een Creeper aanraakt, zal hij ontploffen. Sluip om hem heen om je huis binnen te gaan."},
"level9FailureMessage":function(d){return "Vergeet niet minstens 2 fakkels te plaatsen om je weg te verlichten EN delf minstens 2 steenkool."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Puzzel "+craft_locale.v(d,"puzzleNumber")+" voltooid. Gefeliciteerd!"},
"playerSelectChooseCharacter":function(d){return "Kies je personage."},
"playerSelectChooseSelectButton":function(d){return "Selecteren"},
"playerSelectLetsGetStarted":function(d){return "Laten we beginnen."},
"reinfFeedbackMsg":function(d){return "Druk op \"Verder spelen\" om verder te gaan met je spel."},
"replayButton":function(d){return "Nog een keer spelen"},
"selectChooseButton":function(d){return "Selecteren"},
"tooManyBlocksFail":function(d){return "Puzzel "+craft_locale.v(d,"puzzleNumber")+" voltooid. Gefeliciteerd! Dit is ook mogelijk met "+craft_locale.p(d,"numBlocks",0,"nl",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blockken"})+"."}};