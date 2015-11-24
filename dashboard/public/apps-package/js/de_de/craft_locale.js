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
"blockDestroyBlock":function(d){return "zerstöre den Block"},
"blockIf":function(d){return "wenn"},
"blockIfLavaAhead":function(d){return "wenn Lava voraus"},
"blockMoveForward":function(d){return "vorwärts bewegen"},
"blockPlaceTorch":function(d){return "Platziere Fackel"},
"blockPlaceXAheadAhead":function(d){return "voraus"},
"blockPlaceXAheadPlace":function(d){return "platziere"},
"blockPlaceXPlace":function(d){return "platziere"},
"blockPlantCrop":function(d){return "Feldfrüchte anpflanzen"},
"blockShear":function(d){return "scheren"},
"blockTillSoil":function(d){return "Boden beackern"},
"blockTurnLeft":function(d){return "nach links drehen"},
"blockTurnRight":function(d){return "nach rechts drehen"},
"blockTypeBedrock":function(d){return "Grundgestein"},
"blockTypeBricks":function(d){return "Backsteine"},
"blockTypeClay":function(d){return "Ton"},
"blockTypeClayHardened":function(d){return "gehärteter Ton"},
"blockTypeCobblestone":function(d){return "Pflasterstein"},
"blockTypeDirt":function(d){return "Dreck"},
"blockTypeDirtCoarse":function(d){return "grobe Erde"},
"blockTypeEmpty":function(d){return "leer"},
"blockTypeFarmlandWet":function(d){return "Ackerland"},
"blockTypeGlass":function(d){return "Glas"},
"blockTypeGrass":function(d){return "Gras"},
"blockTypeGravel":function(d){return "Kies"},
"blockTypeLava":function(d){return "Lava"},
"blockTypeLogAcacia":function(d){return "Akazien Holzscheit"},
"blockTypeLogBirch":function(d){return "Birken Holzscheit"},
"blockTypeLogJungle":function(d){return "Dschungel Holzscheit"},
"blockTypeLogOak":function(d){return "Eichen Holzscheit"},
"blockTypeLogSpruce":function(d){return "Fichten Holzscheit"},
"blockTypeOreCoal":function(d){return "Kohleerz"},
"blockTypeOreDiamond":function(d){return "Diamanterz"},
"blockTypeOreEmerald":function(d){return "Smaragderz"},
"blockTypeOreGold":function(d){return "Golderz"},
"blockTypeOreIron":function(d){return "Eisenerz"},
"blockTypeOreLapis":function(d){return "Lapiserz"},
"blockTypeOreRedstone":function(d){return "rotes Steinerz"},
"blockTypePlanksAcacia":function(d){return "Akazienbretter"},
"blockTypePlanksBirch":function(d){return "Birkenbretter"},
"blockTypePlanksJungle":function(d){return "Dschungelbretter"},
"blockTypePlanksOak":function(d){return "Eichenbretter"},
"blockTypePlanksSpruce":function(d){return "Fichtenbretter"},
"blockTypeRail":function(d){return "Schiene"},
"blockTypeSand":function(d){return "Sand"},
"blockTypeSandstone":function(d){return "Sandstein"},
"blockTypeStone":function(d){return "Stein"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "Baum"},
"blockTypeWater":function(d){return "Wasser"},
"blockTypeWool":function(d){return "Wolle"},
"blockWhileXAheadAhead":function(d){return "voraus"},
"blockWhileXAheadDo":function(d){return "mache"},
"blockWhileXAheadWhile":function(d){return "solange"},
"generatedCodeDescription":function(d){return "Wenn du in diesem Puzzle Blöcke ziehst oder platzierst, erstellst du eine Liste von Anweisungen in der Computersprache \"JavaScript\". Dieser Code sagt Computern, was sie auf dem Bildschirm anzeigen sollen. Alles, was du bei Minecraft siehst und tust, beginnt mit Programmiercode wie diesen."},
"houseSelectChooseFloorPlan":function(d){return "Wähle den Grundriss für Dein Haus."},
"houseSelectEasy":function(d){return "Leicht"},
"houseSelectHard":function(d){return "Schwer"},
"houseSelectLetsBuild":function(d){return "Lass uns ein Haus bauen."},
"houseSelectMedium":function(d){return "Normal"},
"keepPlayingButton":function(d){return "weiter spielen"},
"level10FailureMessage":function(d){return "Decke die Lava ab, um drüber gehen zu können; dann baue zwei von den Eisenblöcken auf der anderen Seite ab."},
"level11FailureMessage":function(d){return "Stelle sicher, dass Du Pflastersteine vor der Lava platzierst. Dadurch kannst Du diese Reihe mit Ressourcen sicher abbauen."},
"level12FailureMessage":function(d){return "Baue drei Redstoneblöcke ab. Dabei kannst du dein Wissen vom Hausbau und über die Benutzung der \"wenn\"-Anweisung verwenden, um nicht in die Lava zu fallen."},
"level13FailureMessage":function(d){return "Platziere Schienen entlang des Pfades von deiner Tür zum Rand der Karte."},
"level1FailureMessage":function(d){return "Du musst Befehle verwenden, um zu den Schafen zu laufen."},
"level1TooFewBlocksMessage":function(d){return "Versuche, mehr Befehle zu verwenden, um zum Schaf zu laufen."},
"level2FailureMessage":function(d){return "Um einen Baum zu fällen, laufe zu seinem Stamm und verwende den \"Block zerstören\" Befehl."},
"level2TooFewBlocksMessage":function(d){return "Versuche, mehr Befehle zu verwenden, um den Baum zu fällen. Laufe zu seinem Stamm und verwende den \"Block zerstören\" Befehl."},
"level3FailureMessage":function(d){return "Um Wolle von beiden Schafen zu sammeln, musst du zu jedem der Schafe laufen und den \"scheren\" Befehl verwenden. Denk daran, den \"drehen\" Befehl zu verwenden, um die Schafe zu erreichen."},
"level3TooFewBlocksMessage":function(d){return "Versuche, mehr Befehle zu verwenden, um Wolle von beiden Schafen zu sammeln. Laufe zu jedem Schaf und verwende den \"scheren\" Befehl."},
"level4FailureMessage":function(d){return "Du musst den \"Block zerstören\" Befehl an jedem der drei Baumstämme anwenden."},
"level5FailureMessage":function(d){return "Platziere deine Blöcke auf der Erdlinie, um eine Mauer zu errichten. Die rosa \"wiederhole\"-Anweisung führt die Befehle aus, die darin platziert sind, wie beispielsweise \"platziere Block\" oder \"gehe vorwärts\"."},
"level6FailureMessage":function(d){return "Platziere Blöcke auf dem Hausgrundriss aus Erde, um das Puzzle abzuschließen."},
"level7FailureMessage":function(d){return "Benutze den \"pflanzen\" Befehl, um Nutzpflanzen auf jedem der dunklen Ackerboden Felder zu platzieren."},
"level8FailureMessage":function(d){return "Wenn du einen Creeper berührst, explodiert er. Schleiche dich um sie herum, um in dein Haus zu kommen."},
"level9FailureMessage":function(d){return "Vergiss nicht, mindestens 2 Fackeln zu platzieren, um deinen Weg zu beleuchten UND mindestens 2 Kohle-Erze abzubauen."},
"minecraftBlock":function(d){return "Block"},
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" abgeschlossen. Herzlichen Glückwunsch!"},
"playerSelectChooseCharacter":function(d){return "Wähle deine Spielfigur."},
"playerSelectChooseSelectButton":function(d){return "Wähle"},
"playerSelectLetsGetStarted":function(d){return "Los geht's."},
"reinfFeedbackMsg":function(d){return "Du kannst \"Zurück zum Spiel\" drücken, um dein Spiel weiter zu spielen."},
"replayButton":function(d){return "Wiederholen"},
"selectChooseButton":function(d){return "Wähle"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" abgeschlossen. Herzlichen Glückwunsch! Es ist auch möglich das Puzzle mit "+craft_locale.p(d,"numBlocks",0,"de",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" zu vervollständigen."}};