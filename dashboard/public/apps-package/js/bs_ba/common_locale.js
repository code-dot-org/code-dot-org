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
"and":function(d){return "i"},
"booleanTrue":function(d){return "istinito"},
"booleanFalse":function(d){return "neistinito"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Akcije"},
"catColour":function(d){return "Boja"},
"catLogic":function(d){return "Logika"},
"catLists":function(d){return "Liste"},
"catLoops":function(d){return "Petlje"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Varijable"},
"codeTooltip":function(d){return "Pogledaj stvoreni JavaScript kôd."},
"continue":function(d){return "Nastavi"},
"dialogCancel":function(d){return "Poništi"},
"dialogOK":function(d){return "U redu"},
"directionNorthLetter":function(d){return "Sjever"},
"directionSouthLetter":function(d){return "Jug"},
"directionEastLetter":function(d){return "Istok"},
"directionWestLetter":function(d){return "Zapad"},
"end":function(d){return "kraj"},
"emptyBlocksErrorMsg":function(d){return "Da bi blokovi \"Ponovi\" ili \"Ako\" radili, u njih treba ugraditi druge blokove. Provjeri uklapa li se unutarnji blok pravilno u vanjski blok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funkcijski blok treba u sebi sadržavati druge blokove da bi mogao raditi."},
"errorEmptyFunctionBlockModal":function(d){return "Moraš staviti blokove unutar definicije funkcije. Klikni na \"uredi\" i dovuci blokove unutar zelenog bloka."},
"errorIncompleteBlockInFunction":function(d){return "Klikni na \"uredi\" da budeš siguran da nijedan blok ne nedostaje unutar tvoje definicije funkcije."},
"errorParamInputUnattached":function(d){return "Sjeti se da prikačiš blok za svaki unos parametra na blok funkcije na svojoj radnoj površini."},
"errorUnusedParam":function(d){return "Dodao si blok parametara, ali ga nisi koristio u definiciji. Pobrini se da koristiš svoj parametar tako da klikneš na \"uredi\" i staviš blok parametara unutar zelenog bloka."},
"errorRequiredParamsMissing":function(d){return "Napravi parametar za svoju funkciju tako da što ćeš kliknuti na \"uredi\" i dodati neophodne parametre. Dovuci nove blokove parametara u svoju definiciju funkcije."},
"errorUnusedFunction":function(d){return "Napravio si funkciju, ali je nikad nisi koristio na svojoj radnoj površini! Klikni na \"Funkcije\" na alatnoj traci i pobrini se da je iskoristiš u svom programu."},
"errorQuestionMarksInNumberField":function(d){return "Pokušaj zamijeniti \"???\" sa nekom vrijednošću."},
"extraTopBlocks":function(d){return "Postoje otpojeni blokovi. Je li tvoja namjera bila da dodas ove blokove u  blok \"pri pokretanju\"?"},
"finalStage":function(d){return "Čestitamo! Posljednja faza je završena."},
"finalStageTrophies":function(d){return "Čestitamo! Završena je posljednja faza i osvajaš "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"finish":function(d){return "Završi"},
"generatedCodeInfo":function(d){return "Čak i vrhunski univerziteti podučavaju kodiranje pomoću blokova (npr. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Ali u suštini, blokovi koje si spojio se mogu prikazati kao kôd u JavaScript'u, najkorištenijem programskom jeziku na svijetu:"},
"hashError":function(d){return "Nažalost, '%1' ne odgovara nijednom snimljenom programu."},
"help":function(d){return "Pomoć"},
"hintTitle":function(d){return "Savjet:"},
"jump":function(d){return "skoči"},
"levelIncompleteError":function(d){return "Koristiš sve potrebne vrste blokova, ali na pogrešan način."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Napravi Svoju vlastitu Flappy igricu"},
"missingBlocksErrorMsg":function(d){return "Za rješavanje ovog zadatka isprobaj jedan ili više blokova koji se nalaze ispod."},
"nextLevel":function(d){return "Čestitamo! Zadatak "+locale.v(d,"puzzleNumber")+" je riješen."},
"nextLevelTrophies":function(d){return "Čestitamo! Riješivši Zadatak "+locale.v(d,"puzzleNumber")+" osvajaš "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"nextStage":function(d){return "Čestitke! Završio si "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Čestitamo! Završio si fazu "+locale.v(d,"stageName")+" i osvojio "+locale.p(d,"numTrophies",0,"en",{"one":"trofej","other":locale.n(d,"numTrophies")+" trofeja"})+"."},
"numBlocksNeeded":function(d){return "Čestitamo! Zadatak "+locale.v(d,"puzzleNumber")+" je riješen. (Međutim, mogao si samo iskoristiti "+locale.p(d,"numBlocks",0,"en",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokova"})+".)"},
"numLinesOfCodeWritten":function(d){return "Upravo si napisao "+locale.p(d,"numLines",0,"en",{"one":"1 liniju","other":locale.n(d,"numLines")+" linija"})+" kôda!"},
"play":function(d){return "igraj"},
"print":function(d){return "Isprintaj"},
"puzzleTitle":function(d){return "Zadatak "+locale.v(d,"puzzle_number")+" od "+locale.v(d,"stage_total")},
"repeat":function(d){return "ponovi"},
"resetProgram":function(d){return "Resetuj"},
"runProgram":function(d){return "Pokreni"},
"runTooltip":function(d){return "Pokreni program određen blokovima na radnom prostoru."},
"score":function(d){return "bodovi"},
"showCodeHeader":function(d){return "Pokaži Kôd"},
"showBlocksHeader":function(d){return "Pokaži Blokove"},
"showGeneratedCode":function(d){return "Pokaži kôd"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "grafičko okruženje za programiranje"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Koristiš sve neophodne vrste blokova, ali za rješavanje ovog zadatka pokušaj koristiti više ovakvih blokova."},
"tooManyBlocksMsg":function(d){return "Ovaj zadatak se može riješiti sa <x id='START_SPAN'/><x id='END_SPAN'/> blokova."},
"tooMuchWork":function(d){return "Uh, baš sam se naradio! Možeš li mi sada dati uputstva sa manje ponavljanja?"},
"toolboxHeader":function(d){return "Blokovi"},
"openWorkspace":function(d){return "Kako To Radi"},
"totalNumLinesOfCodeWritten":function(d){return "Sveukupno: "+locale.p(d,"numLines",0,"en",{"one":"1 linija","other":locale.n(d,"numLines")+" linija"})+" kôda."},
"tryAgain":function(d){return "Pokušaj ponovo"},
"hintRequest":function(d){return "Pogledaj savjet"},
"backToPreviousLevel":function(d){return "Povratak na prethodni nivo"},
"saveToGallery":function(d){return "Snimi u galeriju"},
"savedToGallery":function(d){return "Snimljeno u galeriju!"},
"shareFailure":function(d){return "Žalim, ali ne možemo dijeliti ovaj program."},
"workspaceHeader":function(d){return "Svoje blokove sastavi ovdje: "},
"workspaceHeaderJavaScript":function(d){return "Napiši svoj JavaScript kôd ovdje"},
"infinity":function(d){return "Beskonačnost"},
"rotateText":function(d){return "Okreni svoj uređaj."},
"orientationLock":function(d){return "U postavkama uređaja isključi blokadu orijentacije."},
"wantToLearn":function(d){return "Želiš li naučiti programirati?"},
"watchVideo":function(d){return "Pogledaj Video"},
"when":function(d){return "kada"},
"whenRun":function(d){return "pri pokretanju"},
"tryHOC":function(d){return "Isprobaj Sat Kodiranja"},
"signup":function(d){return "Registrirajte se na početni kurs"},
"hintHeader":function(d){return "Evo jedan savjet:"},
"genericFeedback":function(d){return "Pogledaj kako si završio i pokušaj popraviti svoj program."},
"toggleBlocksErrorMsg":function(d){return "Trebaš ispraviti grešku u svom programu prije nego što može biti prikazan u obliku blokova."},
"defaultTwitterText":function(d){return "Pogledaj šta sam napravio"}};