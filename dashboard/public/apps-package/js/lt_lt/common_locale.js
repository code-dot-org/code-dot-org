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
"and":function(d){return "ir"},
"booleanTrue":function(d){return "Taip"},
"booleanFalse":function(d){return "klaida"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Komandos"},
"catColour":function(d){return "Spalva"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Sąrašai"},
"catLoops":function(d){return "Kartojimas"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Komandų kūrimas"},
"catText":function(d){return "Tekstas"},
"catVariables":function(d){return "Kintamieji"},
"codeTooltip":function(d){return "Žiūrėti sukurtą JavaScript kodą."},
"continue":function(d){return "Tęsti"},
"dialogCancel":function(d){return "Atšaukti"},
"dialogOK":function(d){return "Gerai"},
"directionNorthLetter":function(d){return "Š"},
"directionSouthLetter":function(d){return "P"},
"directionEastLetter":function(d){return "R"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "pabaiga"},
"emptyBlocksErrorMsg":function(d){return "„Kartojimo“ arba „Jei“ blokelių viduje reikia įdėti kitus blokelius, kad jie veiktų. Įsitikink, kad jie yra gerai sukibę vienas su kitu."},
"emptyFunctionBlocksErrorMsg":function(d){return "Komandos apraše turi būti išvardintos komandos (įdėtas bent vienas blokas)."},
"errorEmptyFunctionBlockModal":function(d){return "Tavo kuriamoje komandoje turi būti veiksmų. Spustelk \"taisyti\" ir įkelk veiksmų į žalią bloką."},
"errorIncompleteBlockInFunction":function(d){return "Spustelk \"taisyti\", kad įsitikintum, ar tavo kuriamoje komandoje netrūksta veiksmų."},
"errorParamInputUnattached":function(d){return "Naudodamas sukurtą komandą, neužmiršk duoti jai reikalingų duomenų - argumentų. Prikabink reikšmes prie atitinkmų komandos vietų."},
"errorUnusedParam":function(d){return "Tu pridėjai argumento aprašą, bet argumento duomenų nenaudoji komandos veiksmuose..."},
"errorRequiredParamsMissing":function(d){return "Norėdamas perduoti komandai duomenis, turi juos aprašyti - spausk \"redaguoti\" ir pridėk reikiamus argumentų laukelius. Nutempk \"naujų argumentų\" laukelius į kuriamos  komandos bloką."},
"errorUnusedFunction":function(d){return "Tu sukūrei naują komandą, bet jos nepanaudojai. Ją rasi kategorijoje \"Komandų kūrimas\"."},
"errorQuestionMarksInNumberField":function(d){return "Pabandyk pakeisti \"???\" kokia nors reikšme."},
"extraTopBlocks":function(d){return "Tu turi nesujungtų blokų. Gal norėjai juos prijungti prie bloko „paleidus“?"},
"finalStage":function(d){return "Sveikinu! Tu baigei paskutinį etapą."},
"finalStageTrophies":function(d){return "Sveikinu! Tu užbaigei paskutinį lygį ir laimėjai "+locale.p(d,"numTrophies",0,"lt",{"one":"a trofėjų","other":locale.n(d,"numTrophies")+" trofėjus"})+"."},
"finish":function(d){return "Finišas"},
"generatedCodeInfo":function(d){return "Net ir aukščiausiai įvertinti universitetai Pasaulyje moko programavimo naudojant blokelius (pvz., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Tačiau tavo sudėlioti blokeliai gali būti atvaizduojami ir JavaScript - populiariausia programavimo kalba Pasaulyje:"},
"hashError":function(d){return "Atsiprašome, '%1' nesutampa su jokia įrašyta programa."},
"help":function(d){return "pagalba"},
"hintTitle":function(d){return "Patarimas:"},
"jump":function(d){return "šok"},
"levelIncompleteError":function(d){return "Tu naudoji visus būtinus blokelius, tačiau netinkamai."},
"listVariable":function(d){return "sąrašas"},
"makeYourOwnFlappy":function(d){return "Sukurk savo Flappy žaidimą"},
"missingBlocksErrorMsg":function(d){return "Išmėgink vieną ar daugiau blokelių, esančių žemiau, kad išspręstum šią užduotį."},
"nextLevel":function(d){return "Sveikinu! Tu išsprendei galvosūkį "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Sveikinu! Užbaigėte galvosūkį "+locale.v(d,"puzzleNumber")+" ir laimėjote "+locale.p(d,"numTrophies",0,"lt",{"one":"trofėju","other":locale.n(d,"numTrophies")+" trofėjų"})+"."},
"nextStage":function(d){return "Sveikinu! Tu užbaigei "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Sveikinu! Tu užbaigei lygį "+locale.v(d,"stageName")+" ir laimėjai "+locale.p(d,"numTrophies",0,"lt",{"one":"trofėjų","other":locale.n(d,"numTrophies")+" trofėjus"})+"."},
"numBlocksNeeded":function(d){return "Sveikinu! Tu išsprendei "+locale.v(d,"puzzleNumber")+" užduotį. (Beje, galėjai panaudoti tik "+locale.p(d,"numBlocks",0,"lt",{"vieną":"1 blokelį","other":locale.n(d,"numBlocks")+" blokelių"})+".)"},
"numLinesOfCodeWritten":function(d){return "Tu sukūrei "+locale.p(d,"numLines",0,"lt",{"one":"1 eilutę","other":locale.n(d,"numLines")+" eilučių"})+" programą!"},
"play":function(d){return "žaisti"},
"print":function(d){return "Spausdinti"},
"puzzleTitle":function(d){return "Užduotis "+locale.v(d,"puzzle_number")+" iš "+locale.v(d,"stage_total")},
"repeat":function(d){return "kartok"},
"resetProgram":function(d){return "Iš naujo"},
"runProgram":function(d){return "Paleisti"},
"runTooltip":function(d){return "Paleisk programą, naudodamasis blokeliais."},
"score":function(d){return "rezultatas"},
"showCodeHeader":function(d){return "Rodyti kodą"},
"showBlocksHeader":function(d){return "Rodyti blokus"},
"showGeneratedCode":function(d){return "Rodyti kodą"},
"stringEquals":function(d){return "tekstas=?"},
"subtitle":function(d){return "Vizuali programavimo aplinka"},
"textVariable":function(d){return "tekstas"},
"tooFewBlocksMsg":function(d){return "Tu naudoji visas reikiamas blokų rūšis, tačiau reikia panaudoti po daugiau kažkurių blokų."},
"tooManyBlocksMsg":function(d){return "Ši užduotis gali būti išspręsta su <x id='START_SPAN'/><x id='END_SPAN'/> blokais."},
"tooMuchWork":function(d){return "Tu privertei mane tiek daug dirbti! Ar galėtum atlikti užduotį su mažiau kartojimų?"},
"toolboxHeader":function(d){return "Blokeliai"},
"openWorkspace":function(d){return "Kaip tai veikia"},
"totalNumLinesOfCodeWritten":function(d){return "Iš viso: "+locale.p(d,"numLines",0,"lt",{"one":"1 eilutė","other":locale.n(d,"numLines")+" eilučių"})+" kodo."},
"tryAgain":function(d){return "Pabandyk dar kartą"},
"hintRequest":function(d){return "Užuomina"},
"backToPreviousLevel":function(d){return "Grįžti į ankstesnį lygį"},
"saveToGallery":function(d){return "Įrašyti į galeriją"},
"savedToGallery":function(d){return "Įrašyta į galeriją!"},
"shareFailure":function(d){return "Deja, šios programos dalintis negalima."},
"workspaceHeader":function(d){return "Iš viso panaudojai blokelių: "},
"workspaceHeaderJavaScript":function(d){return "Čia rašykite savo JavaScript kodą."},
"infinity":function(d){return "Begalybė"},
"rotateText":function(d){return "Pasuk savo įrenginį."},
"orientationLock":function(d){return "Išjunk savo įrenginio ekrano pasukimą."},
"wantToLearn":function(d){return "Nori išmokti programuoti?"},
"watchVideo":function(d){return "Peržiūrėk šį vaizdo įrašą"},
"when":function(d){return "kada"},
"whenRun":function(d){return "paleidus"},
"tryHOC":function(d){return "Išmėgink „Programavimo valandą“"},
"signup":function(d){return "Užsiregistruok į kursą pradedantiesiems"},
"hintHeader":function(d){return "Štai patarimas:"},
"genericFeedback":function(d){return "Pažiūrėk, kaip pavyko ir pabandyk patobulinti programą."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Pažiūrėkite, ką aš sukūriau"}};