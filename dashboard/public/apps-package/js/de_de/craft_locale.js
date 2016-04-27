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
"blockDestroyBlock":function(d){return "Block zerstören"},
"blockIf":function(d){return "wenn"},
"blockIfLavaAhead":function(d){return "wenn Lava voraus"},
"blockMoveForward":function(d){return "vorwärts bewegen"},
"blockPlaceTorch":function(d){return "Fackel platzieren"},
"blockPlaceXAheadAhead":function(d){return "voraus"},
"blockPlaceXAheadPlace":function(d){return "platziere"},
"blockPlaceXPlace":function(d){return "platziere"},
"blockPlantCrop":function(d){return "Getreide pflanzen"},
"blockShear":function(d){return "scheren"},
"blockTillSoil":function(d){return "Erde umgraben"},
"blockTurnLeft":function(d){return "nach links drehen"},
"blockTurnRight":function(d){return "nach rechts drehen"},
"blockTypeBedrock":function(d){return "Grundgestein"},
"blockTypeBricks":function(d){return "Ziegelsteine"},
"blockTypeClay":function(d){return "Ton"},
"blockTypeClayHardened":function(d){return "Gebrannter Ton"},
"blockTypeCobblestone":function(d){return "Bruchstein"},
"blockTypeDirt":function(d){return "Erde"},
"blockTypeDirtCoarse":function(d){return "Grobe Erde"},
"blockTypeEmpty":function(d){return "leer"},
"blockTypeFarmlandWet":function(d){return "Ackerland"},
"blockTypeGlass":function(d){return "Glas"},
"blockTypeGrass":function(d){return "Gras"},
"blockTypeGravel":function(d){return "Kies"},
"blockTypeLava":function(d){return "Lava"},
"blockTypeLogAcacia":function(d){return "Akazienstamm"},
"blockTypeLogBirch":function(d){return "Birkenstamm"},
"blockTypeLogJungle":function(d){return "Tropenholzstamm"},
"blockTypeLogOak":function(d){return "Eichenstamm"},
"blockTypeLogSpruce":function(d){return "Fichtenstamm"},
"blockTypeOreCoal":function(d){return "Steinkohle"},
"blockTypeOreDiamond":function(d){return "Diamanterz"},
"blockTypeOreEmerald":function(d){return "Smaragderz"},
"blockTypeOreGold":function(d){return "Golderz"},
"blockTypeOreIron":function(d){return "Eisenerz"},
"blockTypeOreLapis":function(d){return "Lapislazulierz"},
"blockTypeOreRedstone":function(d){return "rotes Steinerz"},
"blockTypePlanksAcacia":function(d){return "Akazienholzbretter"},
"blockTypePlanksBirch":function(d){return "Birkenholzbretter"},
"blockTypePlanksJungle":function(d){return "Tropenholzbretter"},
"blockTypePlanksOak":function(d){return "Eichenholzbretter"},
"blockTypePlanksSpruce":function(d){return "Fichtenholzbretter"},
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
"generatedCodeDescription":function(d){return "Du hast Blöcke in dieses Rätsel gezogen und platziert und so eine Anweisungskette in einer Computersprache namens JavaScript erstellt. Dieser Code sagt Computern, was sie auf dem Bildschirm anzeigen sollen. Alles, was du in Minecraft siehst und tust, basiert auch auf solchen Computercode-Zeilen."},
"houseSelectChooseFloorPlan":function(d){return "Wähle den Bauplan für dein Haus."},
"houseSelectEasy":function(d){return "Einfach"},
"houseSelectHard":function(d){return "Schwer"},
"houseSelectLetsBuild":function(d){return "Bauen wir ein Haus."},
"houseSelectMedium":function(d){return "Mittel"},
"keepPlayingButton":function(d){return "Weiterspielen"},
"level10FailureMessage":function(d){return "Decke die Lava ab, um sie zu überqueren. Baue dann auf der anderen Seite zwei Eisenblöcke ab."},
"level11FailureMessage":function(d){return "Platziere vor dir Bruchstein, wenn sich Lava auf deinem Weg befindet. So kannst du diese Reihe von Ressourcen gefahrlos abbauen."},
"level12FailureMessage":function(d){return "Du musst 3 Redstone-Blöcke abbauen. Dabei kombinierst du das, was du beim Bau deines Hauses gelernt hast, mit \"wenn\"-Anweisungen, um nicht in die Lava zu stürzen."},
"level13FailureMessage":function(d){return "Platziere eine \"Schiene\" entlang des Pfads von deiner Tür bis zum Rand der Karte."},
"level1FailureMessage":function(d){return "Du musst Befehle benutzen, um zu den Schafen zu gehen."},
"level1TooFewBlocksMessage":function(d){return "Benutze mehr Befehle, um zu den Schafen zu gehen."},
"level2FailureMessage":function(d){return "Um einen Baum zu fällen, gehe zu seinem Stamm und benutze den Befehl \"Block zerstören\"."},
"level2TooFewBlocksMessage":function(d){return "Benutze mehr Befehle, um den Baum zu fällen. Gehe zum Stamm und benutze den Befehl \"Block zerstören\"."},
"level3FailureMessage":function(d){return "Um Wolle von beiden Schafen zu sammeln, gehe zu jedem hin und benutze den Befehl \"scheren\". Benutze Richtungsänderungsbefehle, um zu den Schafen zu gelangen."},
"level3TooFewBlocksMessage":function(d){return "Benutze mehr Befehle, um Wolle von beiden Schafen zu sammeln. Gehe zu jedem hin und benutze den Befehl \"scheren\"."},
"level4FailureMessage":function(d){return "Du musst den Befehl \"Block zerstören\" bei jedem der drei Baumstämme anwenden."},
"level5FailureMessage":function(d){return "Platziere deine Blöcke auf dem Erdumriss, um eine Mauer zu bauen. Der rosa \"wiederholen\"-Befehl führt darin platzierte Befehle aus, wie \"Block platzieren\" und \"vorwärts\"."},
"level6FailureMessage":function(d){return "Platziere Blöcke auf dem Erdumriss des Hauses, um das Rätsel abzuschließen."},
"level7FailureMessage":function(d){return "Benutze den \"pflanzen\"-Befehl, um auf jedem Feld dunkler, umgegrabener Erde Getreide zu platzieren."},
"level8FailureMessage":function(d){return "Wenn du einen Creeper berührst, explodiert er. Schleich dich drum herum in dein Haus."},
"level9FailureMessage":function(d){return "Vergiss nicht, mindestens 2 Fackeln zum Beleuchten des Wegs zu platzieren UND mindestens 2 Kohleblöcke abzubauen."},
"minecraftBlock":function(d){return "Block"},
"nextLevelMsg":function(d){return "Rätsel "+craft_locale.v(d,"puzzleNumber")+" abgeschlossen. Glückwunsch!"},
"playerSelectChooseCharacter":function(d){return "Wähle deinen Charakter."},
"playerSelectChooseSelectButton":function(d){return "Auswählen"},
"playerSelectLetsGetStarted":function(d){return "Fangen wir an."},
"reinfFeedbackMsg":function(d){return "Mit \"Weiterspielen\" gelangst du zurück zum Spiel."},
"replayButton":function(d){return "Erneut spielen"},
"selectChooseButton":function(d){return "Auswählen"},
"tooManyBlocksFail":function(d){return "Rätsel "+craft_locale.v(d,"puzzleNumber")+" abgeschlossen. Glückwunsch! Ein Abschluss ist auch mit "+craft_locale.p(d,"numBlocks",0,"de",{"one":"1 Block","other":craft_locale.n(d,"numBlocks")+" Blöcke"})+" möglich."}};