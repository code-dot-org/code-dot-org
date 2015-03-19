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
"and":function(d){return "ja"},
"booleanTrue":function(d){return "tõene"},
"booleanFalse":function(d){return "väär"},
"blocks":function(d){return "plokid"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Tegevused"},
"catColour":function(d){return "Värv"},
"catLogic":function(d){return "Loogika"},
"catLists":function(d){return "Loendid"},
"catLoops":function(d){return "Tsüklid"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Muutujad"},
"clearPuzzle":function(d){return "Clear Puzzle"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Are you sure you want to clear the puzzle?"},
"codeTooltip":function(d){return "Vaata loodud JavaScripti koodi."},
"continue":function(d){return "Jätka"},
"dialogCancel":function(d){return "Tühista"},
"dialogOK":function(d){return "Olgu"},
"directionNorthLetter":function(d){return "P"},
"directionSouthLetter":function(d){return "L"},
"directionEastLetter":function(d){return "I"},
"directionWestLetter":function(d){return "L"},
"end":function(d){return "lõpeta"},
"emptyBlocksErrorMsg":function(d){return "\"Korda\" või \"Kui\" ploki sees peavad olema teised plokid et see töötaks. Veendu et sisemine plokk sobib plokiga mille sees ta on."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktsiooni plokk peab sisaldama teisi plokke et ta töötaks."},
"errorEmptyFunctionBlockModal":function(d){return "Sinu funktsiooni definitsioonis peavad olema plokid. Vajuta \"muuda\" ja lohista plokid rohelise ploki sisse."},
"errorIncompleteBlockInFunction":function(d){return "Kliki nupul \"edit\" ja veendu et sul ei ole funktsiooni definitsioonist mõnda plokki puudu."},
"errorParamInputUnattached":function(d){return "Remember to attach a block to each parameter input on the function block in your workspace."},
"errorUnusedParam":function(d){return "Sa lisasid parameetriploki aga ei kasutanud seda oma definitsioonis. Ära unusta oma parameetrit kasutada, vajuta \"muuda\" ja pane parameetri plokk rohelise ploki sisse."},
"errorRequiredParamsMissing":function(d){return "Loo oma funktsioonile parameeter vajutades \"muuda\" ning lisades vajalikud parameetrid. Lohista uued parameetriplokid oma funktsiooni definitsiooni."},
"errorUnusedFunction":function(d){return "Sa lõid funktsiooni aga ei kasutanud seda oma tööruumis! Kliki \"Funktsioon\" nupule tööriistakastis ja veendu et sa seda oma programmis kasutad."},
"errorQuestionMarksInNumberField":function(d){return "Proovi asendada \"???\" väärtusega."},
"extraTopBlocks":function(d){return "Sul on lahtiseid plokke. Kas sa soovisid neid ühendada \"kui käib\" ploki külge?"},
"finalStage":function(d){return "Tubli! Sa läbisid viimase taseme."},
"finalStageTrophies":function(d){return "Palju õnne! Oled lõpetanud lõppfaasi ja võitsid"+locale.p(d,"numTrophies",0,"et",{"one":"a trofee","other":locale.n(d,"numTrophies")+"trofeed"})+"."},
"finish":function(d){return "Lõpeta"},
"generatedCodeInfo":function(d){return "Even top universities teach block-based coding (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). But under the hood, the blocks you have assembled can also be shown in JavaScript, the world's most widely used coding language:"},
"hashError":function(d){return "Vabandust, '%1' ei vasta ühelegi salvestatud programmile."},
"help":function(d){return "Abi"},
"hintTitle":function(d){return "Vihje:"},
"jump":function(d){return "hüppa"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Sa kasutad kõiki vajalikke plokke, aga mitte õiges järjekorras."},
"listVariable":function(d){return "loend"},
"makeYourOwnFlappy":function(d){return "Tee oma Flappy mäng"},
"missingBlocksErrorMsg":function(d){return "Selle mõistatuse lahendamiseks kasuta ühte või mitut allpool olevat plokki."},
"nextLevel":function(d){return "Tubli! Sa lahendasid mõistatuse nr."+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Õnnitlused! Lõpetasid pusle "+locale.v(d,"puzzleNumber")+" ja võitsid "+locale.p(d,"numTrophies",0,"et",{"one":"trofee","other":locale.n(d,"numTrophies")+" trofeed"})+"."},
"nextStage":function(d){return "Õnnitlused! Lõpetasid "+locale.v(d,"stageName")+" taseme."},
"nextStageTrophies":function(d){return "Õnnitlused! Lõpetasid "+locale.v(d,"stageName")+" ja võistid "+locale.p(d,"numTrophies",0,"et",{"one":"trofee","other":locale.n(d,"numTrophies")+" trofeed"})},
"numBlocksNeeded":function(d){return "Õnnitlused! Lõpetasid pusle "+locale.v(d,"puzzleNumber")+". (Siiski, sa oleks võinud kasutada ainult "+locale.p(d,"numBlocks",0,"et",{"one":"1 plokki","other":locale.n(d,"numBlocks")+" plokki"})+".)"},
"numLinesOfCodeWritten":function(d){return "Kirjutasin just "+locale.p(d,"numLines",0,"et",{"one":"1 rea","other":locale.n(d,"numLines")+" rida"})+" koodi!"},
"play":function(d){return "mängi"},
"print":function(d){return "Trüki välja"},
"puzzleTitle":function(d){return "Mõistatus "+locale.v(d,"puzzle_number")+"/"+locale.v(d,"stage_total")},
"repeat":function(d){return "korda"},
"resetProgram":function(d){return "Kustuta"},
"runProgram":function(d){return "Käivita"},
"runTooltip":function(d){return "Käivita programm mis on defineeritud plokkidena tööruumis."},
"score":function(d){return "tulemus"},
"showCodeHeader":function(d){return "Näita koodi"},
"showBlocksHeader":function(d){return "Näita plokke"},
"showGeneratedCode":function(d){return "Näita koodi"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "visuaalne programmeerimiskeskkond"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Sa kasutad kõiki vajalikke plokke, aga proovi selle mõistatuse lahendamiseks ka neid plokke."},
"tooManyBlocksMsg":function(d){return "Selle mõistatuse saab lahendada <x id='START_SPAN'/><x id='END_SPAN'/> ploki abil."},
"tooMuchWork":function(d){return "Ma tegin jube palju tööd! Kas sa saaksid hakkama vähemate kordustega?"},
"toolboxHeader":function(d){return "Plokid"},
"openWorkspace":function(d){return "Kuidas see töötab"},
"totalNumLinesOfCodeWritten":function(d){return "Kokku: "+locale.p(d,"numLines",0,"et",{"one":"1 rida","other":locale.n(d,"numLines")+" rida"})+" rida koodi."},
"tryAgain":function(d){return "Proovi uuesti"},
"hintRequest":function(d){return "Anna vihje"},
"backToPreviousLevel":function(d){return "Tagasi eelmisele tasemele"},
"saveToGallery":function(d){return "Salvesta galeriisse"},
"savedToGallery":function(d){return "Galeriisse salvestatud!"},
"shareFailure":function(d){return "Vabandust, me ei saa seda programmi jagada."},
"workspaceHeader":function(d){return "Ühenda oma plokid siin: "},
"workspaceHeaderJavaScript":function(d){return "Kirjuta oma JavaScripti kood siia"},
"workspaceHeaderShort":function(d){return "Tööruum: "},
"infinity":function(d){return "Lõpmatus"},
"rotateText":function(d){return "Pööra oma seadet."},
"orientationLock":function(d){return "Lülita  automaatne pööramine oma seadme seadetes välja."},
"wantToLearn":function(d){return "Tahad programmeerimist õppida?"},
"watchVideo":function(d){return "Vaata videot"},
"when":function(d){return "kui"},
"whenRun":function(d){return "kui käib"},
"tryHOC":function(d){return "Proovi Koodi Tundi"},
"signup":function(d){return "Pane ennast kirja sissejuhatavale kursusele"},
"hintHeader":function(d){return "Vihje:"},
"genericFeedback":function(d){return "Vaata, mis kokkuvõttes välja tuli, ja proovi oma programm korda teha."},
"toggleBlocksErrorMsg":function(d){return "Sa pead parandama vea oma programmis enne kui seda saab plokkidena kuvada."},
"defaultTwitterText":function(d){return "Check out what I made"}};