var locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "und"},
"booleanTrue":function(d){return "wahr"},
"booleanFalse":function(d){return "falsch"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Aktionen"},
"catColour":function(d){return "Farbe"},
"catLogic":function(d){return "Logik"},
"catLists":function(d){return "Listen"},
"catLoops":function(d){return "Schleifen"},
"catMath":function(d){return "Mathematik"},
"catProcedures":function(d){return "Funktionen"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variablen"},
"codeTooltip":function(d){return "Erzeugten JavaScript-Code ansehen."},
"continue":function(d){return "Weiter"},
"dialogCancel":function(d){return "Abbrechen"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "O"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "Ende"},
"emptyBlocksErrorMsg":function(d){return "Die \"Wiederholen\"- und die \"Wenn\"-Bausteine benötigten im Inneren andere Bausteine um zu funktionieren. Stelle sicher, dass der innere Baustein in den umschließenden Baustein passt."},
"emptyFunctionBlocksErrorMsg":function(d){return "Der Funktionsblock muss andere Blöcke beinhalten, um zu funktionieren."},
"errorEmptyFunctionBlockModal":function(d){return "Es müssen Blöcke innerhalb deiner Funktionsdefinition sein. Klicke auf \"Bearbeiten\", und ziehe die Blöcke in den grünen Block."},
"errorIncompleteBlockInFunction":function(d){return "Klicke auf \"Bearbeiten\", um sicherzustellen, dass kein Block innerhalb deiner Funktionsdefinition fehlt."},
"errorParamInputUnattached":function(d){return "Vergiss nicht, im Funktionsblock in deinem Arbeitsbereich zu jeder Parametereingabe einen Block zu verknüpfen."},
"errorUnusedParam":function(d){return "Sie einen Parameterblock hinzugefügt, aber nicht in der Definition zu verwendet. Stellen Sie sicher, Ihre Parameter zu verwenden, indem Sie auf \"Bearbeiten\" klicken und den Parameterblock im grünen Block zu plazieren."},
"errorRequiredParamsMissing":function(d){return "Erstellen Sie einen Parameter für die Funktion, indem Sie auf \"Bearbeiten\" klicken und fügen sie die erforderlichen Parameter hinzu. Ziehen Sie die neuen Parameter-Blöcke in die Funktionsdefinition."},
"errorUnusedFunction":function(d){return "Sie haben eine Funktion erstellt, aber sie nie im Arbeitsbereich verwendet! Klicken Sie auf \"Funktionen\" in der Toolbox, und stellen Sie sicher, dass sie es in Ihrem Programm verwenden."},
"errorQuestionMarksInNumberField":function(d){return "Versuchen sie \"???\" mit einem Wert zu ersetzen."},
"extraTopBlocks":function(d){return "Einige Blöcke sind nicht verbunden. Wolltest Du diese mit dem \"Wenn ausführen\" Block verbinden?"},
"finalStage":function(d){return "Glückwunsch! Du hast das letzte Level erfolgreich abgeschlossen."},
"finalStageTrophies":function(d){return "Glückwunsch! Du hast das letzte Level erfolgreich abgeschlossen und "+locale.p(d,"numTrophies",0,"de",{"one":"eine Trophäe","other":locale.n(d,"numTrophies")+" Trophäen"})+" gewonnen."},
"finish":function(d){return "Abschließen"},
"generatedCodeInfo":function(d){return "Selbst Eliteuniversitäten unterrichten blockbasiertes Programmieren (z.B. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Allerdings können die von Dir zusammengefügten Blöcke auch in JavaScript, der weltweit meistverbreiteten Programmierspache, dargestellt werden:"},
"hashError":function(d){return "Ups, '%1' stimmt mit keinem gespeicherten Programm überein."},
"help":function(d){return "Hilfe"},
"hintTitle":function(d){return "Hinweis:"},
"jump":function(d){return "springen"},
"levelIncompleteError":function(d){return "Du benutzt alle nötigen Bausteine, aber noch nicht auf die richtige Weise."},
"listVariable":function(d){return "Liste"},
"makeYourOwnFlappy":function(d){return "Programmiere Dein eigenes \"Flappy\"-Spiel"},
"missingBlocksErrorMsg":function(d){return "Versuche einen, oder mehrere Bausteine von unten zu verwenden, um dieses Puzzle zu lösen."},
"nextLevel":function(d){return "Glückwunsch! Du hast Puzzle "+locale.v(d,"puzzleNumber")+" erfolgreich abgeschlossen."},
"nextLevelTrophies":function(d){return "Glückwunsch! Du hast Puzzle "+locale.v(d,"puzzleNumber")+" erfolgreich abgeschlossen und "+locale.p(d,"numTrophies",0,"de",{"one":"eine Trophäe","other":locale.n(d,"numTrophies")+" Trophäen"})+" gewonnen."},
"nextStage":function(d){return "Glückwunsch! "+locale.v(d,"stageName")+" abgeschlossen."},
"nextStageTrophies":function(d){return "Glückwunsch! "+locale.v(d,"stageName")+" abgeschlossen und "+locale.p(d,"numTrophies",0,"de",{"eine":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" gewonnen."},
"numBlocksNeeded":function(d){return "Glückwunsch! Du hast Puzzle "+locale.v(d,"puzzleNumber")+" fertig gestellt. (Du hättest jedoch nur "+locale.p(d,"numBlocks",0,"de",{"one":"1 Baustein","other":locale.n(d,"numBlocks")+" Bausteine"})+" gebraucht.)"},
"numLinesOfCodeWritten":function(d){return "Du hast soeben "+locale.p(d,"numLines",0,"de",{"one":"eine Zeile","other":locale.n(d,"numLines")+" Zeilen"})+" Code geschrieben!"},
"play":function(d){return "spielen"},
"print":function(d){return "Drucken"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" von "+locale.v(d,"stage_total")},
"repeat":function(d){return "wiederhole"},
"resetProgram":function(d){return "Zurücksetzen"},
"runProgram":function(d){return "Ausführen"},
"runTooltip":function(d){return "Starte das Programm, das durch die Bausteine in deinem Arbeitsbereich festgelegt ist."},
"score":function(d){return "Punktestand"},
"showCodeHeader":function(d){return "Programm anzeigen"},
"showBlocksHeader":function(d){return "Zeige Blöcke"},
"showGeneratedCode":function(d){return "Programm anzeigen"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "eine visuelle Programmierumgebung"},
"textVariable":function(d){return "Text"},
"tooFewBlocksMsg":function(d){return "Du verwendest alle nötigen Baustein-Typen. Versuche jedoch mehr von diesen Baustein-Typen zu verwenden, um dieses Puzzle fertigzustellen."},
"tooManyBlocksMsg":function(d){return "Dieses Puzzle kann mit <x id='START_SPAN'/><x id='END_SPAN'/> Bausteinen gelöst werden."},
"tooMuchWork":function(d){return "Du lässt mich ganz schön arbeiten! Könntest du versuchen es seltener zu wiederholen?"},
"toolboxHeader":function(d){return "Bausteine"},
"openWorkspace":function(d){return "Wie es funktioniert"},
"totalNumLinesOfCodeWritten":function(d){return "Insgesamt: "+locale.p(d,"numLines",0,"de",{"one":"Eine Zeile","other":locale.n(d,"numLines")+" Zeilen"})+" Code."},
"tryAgain":function(d){return "Versuche es noch einmal"},
"hintRequest":function(d){return "Hinweis anzeigen"},
"backToPreviousLevel":function(d){return "Zurück zum vorherigen Level"},
"saveToGallery":function(d){return "In die Galerie abspeichern"},
"savedToGallery":function(d){return "In der Galerie gespeichert!"},
"shareFailure":function(d){return "Leider können wir dieses Programm nicht freigeben."},
"workspaceHeader":function(d){return "Setze die Bausteine hier zusammen: "},
"workspaceHeaderJavaScript":function(d){return "Gib hier Deinen JavaScript-Code ein"},
"infinity":function(d){return "Unendlichkeit"},
"rotateText":function(d){return "Drehen Sie ihr Gerät."},
"orientationLock":function(d){return "Deaktivieren Sie die Dreh-Möglichkeit des Bildschirms in den Geräteeinstellungen."},
"wantToLearn":function(d){return "Möchtest du programmieren lernen?"},
"watchVideo":function(d){return "Video anschauen"},
"when":function(d){return "wenn"},
"whenRun":function(d){return "wenn ausführen"},
"tryHOC":function(d){return "Probiere \"The Hour of Code\" aus"},
"signup":function(d){return "Für den Einführungskurs anmelden"},
"hintHeader":function(d){return "Hier ein Tipp:"},
"genericFeedback":function(d){return "Sieh Dir Dein Ergebnis an und versuche, Programmierfehler zu beheben."},
"toggleBlocksErrorMsg":function(d){return "Du musst einen Fehler in deinem Programm beheben, bevor es als Bausteine angezeigt werden kann."},
"defaultTwitterText":function(d){return "Sieh was ich gemacht habe"}};