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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"and":function(d){return "in"},
"booleanTrue":function(d){return "velja"},
"booleanFalse":function(d){return "ne velja"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Dejanja"},
"catColour":function(d){return "Barva"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Seznami"},
"catLoops":function(d){return "Zanke"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Besedilo"},
"catVariables":function(d){return "Spremenljivke"},
"codeTooltip":function(d){return "Poglej generirano kodo v JavaScriptu."},
"continue":function(d){return "Nadaljuj"},
"dialogCancel":function(d){return "Prekliči"},
"dialogOK":function(d){return "Vredu"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "konec"},
"emptyBlocksErrorMsg":function(d){return "Znotraj 'Ponovi' ali 'če' bloka morajo biti drugi bloki, da bo delovalo. Prepričaj se, da se notranji bloki ustrezno prilegajo zunanjemu bloku."},
"emptyFunctionBlocksErrorMsg":function(d){return "Da bi blok s funkcijo deloval, mora vsebovati druge bloke oz ukaze."},
"errorEmptyFunctionBlockModal":function(d){return "Funkcija mora vsebovati bloke z ukazi. Klikni \"uredi\" (ang.\"edit\") in povleci bloke z ukazi v zeleni blok."},
"errorIncompleteBlockInFunction":function(d){return "Klikni \"edit\" in preveri, če manjka kateri izmed blokov v tvoji funkciji."},
"errorParamInputUnattached":function(d){return "Ne pozabi v funkcijskem bloku dodati še bloka k vnosu vsakega parametra."},
"errorUnusedParam":function(d){return "Dodal/a si blok k parametru, a si ga pozabil/a uporabiti v opredelitvi. Klikni na \"uredi\" (ang. \"edit\") in dodaj v zeleni blok ustrezen blok povezan s parametrom."},
"errorRequiredParamsMissing":function(d){return "Klikni na \"uredi\" (ang. \"edit\") in dodaj v svojo funkcijopotreben parametre tako, da ustrezen blok povezan s parametrom povlečeš v opredelitev funkcije."},
"errorUnusedFunction":function(d){return "Usvaril/a si funkcijo, a si jo pozabil/a uporabiti v svojem delovnem prostoru. Klikni na \"Funkcije\" in poskrbi, da boš uporabil/a funkcijo v svojem programu."},
"errorQuestionMarksInNumberField":function(d){return "Poskusite zamenjati \"???\" z vrednostjo."},
"extraTopBlocks":function(d){return "Imaš nedodeljene bloke. Si jih želel dodeliti bloku \"ob zagonu\"?"},
"finalStage":function(d){return "Čestitke! Zaključil si zadnjo stopnjo."},
"finalStageTrophies":function(d){return "Čestitke! Zaključil/a si stopnjo "+locale.v(d,"stageNumber")+" in osvojil/a "+locale.p(d,"numTrophies",0,"sl",{"one":"trofejo","other":locale.n(d,"numTrophies")+" trofej"})+"."},
"finish":function(d){return "Končaj"},
"generatedCodeInfo":function(d){return "Celo najboljše univerze učijo programirati s pomočjo blokov (npr. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Pod pokrovom pa se skrivajo pravi programi, napisani v JavaScriptu, enem najbolj uporabljanih programskih jezikov:"},
"hashError":function(d){return "Žal, '%1' ne ustreza nobenemu shranjenemu programu."},
"help":function(d){return "Pomoč"},
"hintTitle":function(d){return "Namig:"},
"jump":function(d){return "skoči"},
"levelIncompleteError":function(d){return "Uporabljaš vse potrebne tipe blokov, a ne na pravi način."},
"listVariable":function(d){return "seznam"},
"makeYourOwnFlappy":function(d){return "Izdelaj svojo lastno igrico o Plahutaču (Flappyju)"},
"missingBlocksErrorMsg":function(d){return "Če boš uporabil/a vsaj en blok, ki ga najdeš spodaj, ali več, boš rešil/a uganko."},
"nextLevel":function(d){return "Čestitke! Rešil/a si uganko "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Čestitke! Rešil/a si uganko "+locale.v(d,"puzzleNumber")+" in osvojil/a "+locale.p(d,"numTrophies",0,"sl",{"one":"lovoriko","other":locale.n(d,"numTrophies")+" lovorik"})+"."},
"nextStage":function(d){return "Čestitke! Dokončal/a si "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Čestitke! Zaključil/a si stopnjo "+locale.v(d,"stageName")+" in osvojil/a "+locale.p(d,"numTrophies",0,"sl",{"one":"lovoriko","other":locale.n(d,"numTrophies")+" lovorik"})+"."},
"numBlocksNeeded":function(d){return "Čestitke! Zaključil/a si uganko "+locale.v(d,"puzzleNumber")+". (Vendar bi lahko uporabil samo  "+locale.p(d,"numBlocks",0,"sl",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokov"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ravnokar si napisal/a "+locale.p(d,"numLines",0,"sl",{"one":"1 vrstico","other":locale.n(d,"numLines")+" vrstic"})+" kode!"},
"play":function(d){return "igraj"},
"print":function(d){return "Natisni"},
"puzzleTitle":function(d){return "Uganka "+locale.v(d,"puzzle_number")+" od "+locale.v(d,"stage_total")},
"repeat":function(d){return "ponovi"},
"resetProgram":function(d){return "resetiraj"},
"runProgram":function(d){return "Zaženi program"},
"runTooltip":function(d){return "Zaženi program, definiran z bloki na delovni površini."},
"score":function(d){return "rezultat"},
"showCodeHeader":function(d){return "Pokaži kodo"},
"showBlocksHeader":function(d){return "Prikaži bloke"},
"showGeneratedCode":function(d){return "Pokaži kodo"},
"stringEquals":function(d){return "črkovni niz =?"},
"subtitle":function(d){return "vizualno programersko okolje"},
"textVariable":function(d){return "besedilo"},
"tooFewBlocksMsg":function(d){return "Uporabil/a si prave tipe blokov, a potrebuješ jih še več za rešitev te uganke."},
"tooManyBlocksMsg":function(d){return "Ta uganka je lahko rešena z <x id='START_SPAN'/><x id='END_SPAN'/> bloki."},
"tooMuchWork":function(d){return "Si me pa utrudil/a! Bi se lahko poskusil/a manjkrat ponavljati?"},
"toolboxHeader":function(d){return "Bloki"},
"openWorkspace":function(d){return "Kako deluje"},
"totalNumLinesOfCodeWritten":function(d){return "Seštevek vseh skupaj:  "+locale.p(d,"numLines",0,"sl",{"one":"1 vrstica","other":locale.n(d,"numLines")+" vrstic"})+" kode."},
"tryAgain":function(d){return "Poskusi ponovno"},
"hintRequest":function(d){return "Poglej namig"},
"backToPreviousLevel":function(d){return "Nazaj na prejšnjo raven"},
"saveToGallery":function(d){return "Shrani v galerijo"},
"savedToGallery":function(d){return "Shranjeno v galerijo!"},
"shareFailure":function(d){return "Žal, ne moremo objaviti tega programa."},
"workspaceHeader":function(d){return "Tukaj sestavi tvoje bloke: "},
"workspaceHeaderJavaScript":function(d){return "Vnesite kodo JavaScript"},
"infinity":function(d){return "Neskončnost"},
"rotateText":function(d){return "Zasukaj tvojo napravo."},
"orientationLock":function(d){return "Izključi zaklepanje orientacije v nastavitvah naprave."},
"wantToLearn":function(d){return "Se želiš naučiti programirati?"},
"watchVideo":function(d){return "Glej video"},
"when":function(d){return "ko"},
"whenRun":function(d){return "ob zagonu"},
"tryHOC":function(d){return "Poizkusi Uro za programiranje (Hour to Code)"},
"signup":function(d){return "Vpiši se za uvodni tečaj"},
"hintHeader":function(d){return "Tukaj je namig:"},
"genericFeedback":function(d){return "Poglej kako si končal in poizkusi popraviti svoj program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Poglej, kaj sem naredil"}};