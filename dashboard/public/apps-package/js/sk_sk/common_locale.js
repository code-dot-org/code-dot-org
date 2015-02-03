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
"and":function(d){return "a"},
"booleanTrue":function(d){return "pravda"},
"booleanFalse":function(d){return "nepravda"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Akcie"},
"catColour":function(d){return "Farba"},
"catLogic":function(d){return "Logické"},
"catLists":function(d){return "Zoznamy"},
"catLoops":function(d){return "Cykly"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcie"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Premenné"},
"codeTooltip":function(d){return "Pozrieť vygenerovaný kód JavaScript."},
"continue":function(d){return "Pokračovať"},
"dialogCancel":function(d){return "Zrušiť"},
"dialogOK":function(d){return "ok"},
"directionNorthLetter":function(d){return "S"},
"directionSouthLetter":function(d){return "J"},
"directionEastLetter":function(d){return "V"},
"directionWestLetter":function(d){return "Z"},
"end":function(d){return "koniec"},
"emptyBlocksErrorMsg":function(d){return "Bloky \"Opakuj\" alebo \"Ak\" musia obsahovať ďalšie bloky vo vnútri, aby pracovali. Uistite sa, že vnútorný blok je správne umiestnený vo vnútri týchto blokov."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funkčný blok musí obsahovať ďalšie bloky vo vnútri, aby pracoval správne."},
"errorEmptyFunctionBlockModal":function(d){return "Musia existovať bloky vo vnútri tvojej definície funkcie. Kliknite na \"upraviť\" a presuňte bloky do vnútra zeleného bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknite na tlačidlo \"upraviť\" aby ste sa uistili, že nemáte žiadne chýbajúce bloky vnútri funkcie."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "You added a parameter block, but didn't use it in the definition. Make sure to use your parameter by clicking \"edit\" and placing the parameter block inside the green block."},
"errorRequiredParamsMissing":function(d){return "Create a parameter for your function by clicking \"edit\" and adding the necessary parameters. Drag the new parameter blocks into your function definition."},
"errorUnusedFunction":function(d){return "You created a function, but never used it on your workspace! Click on \"Functions\" in the toolbox and make sure you use it in your program."},
"errorQuestionMarksInNumberField":function(d){return "Skús vymeniť \"???\" za hodnotu."},
"extraTopBlocks":function(d){return "Máš nepripojené bloky. Chcel si ich pripojiť k bloku \"pri spustení\"?"},
"finalStage":function(d){return "Gratulujem! Dokončil si poslednú úroveň."},
"finalStageTrophies":function(d){return "Gratulujem! Dokončil si poslednú úroveň a vyhral "+locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofejí"})+"."},
"finish":function(d){return "Dokončiť"},
"generatedCodeInfo":function(d){return "Dokonca aj popredné univerzity učia programovanie založené na blokoch  (napríklad "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ale v skutočnosti  bloky, ktoré ste vytvorili, môžu byť tiež zobrazené v jazyku JavaScript, svetovo najpoužívanejšom programovacom jazyku:"},
"hashError":function(d){return "Prepáčte, '%1' nezodpovedá žiadnemu uloženému programu."},
"help":function(d){return "Pomoc"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "skoč"},
"levelIncompleteError":function(d){return "Používate všetky potrebné typy blokov, ale nie tým správnym spôsobom."},
"listVariable":function(d){return "zoznam"},
"makeYourOwnFlappy":function(d){return "Vytvor si svoju vlastnú \"Flappy\" hru"},
"missingBlocksErrorMsg":function(d){return "Skús použiť jeden alebo viac blokov uvedených nižšie pre vyriešenie tejto úlohy."},
"nextLevel":function(d){return "Gratulujem! Dokončil si úlohu "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulujem! Dokončil si úlohu "+locale.v(d,"puzzleNumber")+" a vyhral "+locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofejí"})+"."},
"nextStage":function(d){return "Gratulujem! Dokončil si "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulujem! Dokončil si "+locale.v(d,"stageName")+" a vyhral "+locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofejí"})+"."},
"numBlocksNeeded":function(d){return "Gratulujem! Dokončil si úlohu "+locale.v(d,"puzzleNumber")+". (Avšak, mohol si použiť iba "+locale.p(d,"numBlocks",0,"sk",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokov"})+".)"},
"numLinesOfCodeWritten":function(d){return "Už si napísal "+locale.p(d,"numLines",0,"sk",{"one":"1 riadok","other":locale.n(d,"numLines")+" riadkov"})+" kódu!"},
"play":function(d){return "hrať"},
"print":function(d){return "Tlačiť"},
"puzzleTitle":function(d){return "Úloha "+locale.v(d,"puzzle_number")+" z "+locale.v(d,"stage_total")},
"repeat":function(d){return "opakovať"},
"resetProgram":function(d){return "Obnoviť"},
"runProgram":function(d){return "Spustiť"},
"runTooltip":function(d){return "Spustiť program definovaný blokmi v pracovnom priestore."},
"score":function(d){return "skóre"},
"showCodeHeader":function(d){return "Zobraziť kód"},
"showBlocksHeader":function(d){return "Ukáž Bloky"},
"showGeneratedCode":function(d){return "Zobraziť kód"},
"stringEquals":function(d){return "reťazec =?"},
"subtitle":function(d){return "vizuálne programovacie prostredie"},
"textVariable":function(d){return "text"},
"tooFewBlocksMsg":function(d){return "Používaš všetky potrebné typy blokov, ale skús použiť viac týchto blokov na dokončenie tejto úlohy."},
"tooManyBlocksMsg":function(d){return "Táto úloha môže byť vyriešená s <x id='START_SPAN'/><x id='END_SPAN'/> blokmi."},
"tooMuchWork":function(d){return "Spravil si mi veľa práce!  Mohol by si skúsiť opakovať menej krát?"},
"toolboxHeader":function(d){return "Bloky"},
"openWorkspace":function(d){return "Ako to funguje"},
"totalNumLinesOfCodeWritten":function(d){return "Celkovo: "+locale.p(d,"numLines",0,"sk",{"one":"1 riadok","other":locale.n(d,"numLines")+" riadkov"})+" kódu."},
"tryAgain":function(d){return "Skúsiť znova"},
"hintRequest":function(d){return "Pozri nápovedu"},
"backToPreviousLevel":function(d){return "Späť na predchádzajúcu úlohu"},
"saveToGallery":function(d){return "Ulož do galérie"},
"savedToGallery":function(d){return "Uložené do galérie!"},
"shareFailure":function(d){return "Bohužiaľ tento program nie je možné zdieľať."},
"workspaceHeader":function(d){return "Zostav si svoje bloky sem: "},
"workspaceHeaderJavaScript":function(d){return "Zadajte sem svoj JavaScript kód"},
"infinity":function(d){return "Nekonečno"},
"rotateText":function(d){return "Otoč svoj prístroj."},
"orientationLock":function(d){return "Vypni uzamknutie orientácie v nastaveniach prístroja."},
"wantToLearn":function(d){return "Chceš sa naučiť programovať?"},
"watchVideo":function(d){return "Pozri si Video"},
"when":function(d){return "keď"},
"whenRun":function(d){return "pri spustení"},
"tryHOC":function(d){return "Vyskúšaj Hodinu Kódu"},
"signup":function(d){return "Prihlás sa do úvodného kurzu"},
"hintHeader":function(d){return "Tu je rada:"},
"genericFeedback":function(d){return "Pozri si ako to dopadlo a pokús sa opraviť svoj program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Check out what I made"}};