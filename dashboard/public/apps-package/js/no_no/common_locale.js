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
"and":function(d){return "og"},
"booleanTrue":function(d){return "sann"},
"booleanFalse":function(d){return "usann"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farge"},
"catLogic":function(d){return "Logikk"},
"catLists":function(d){return "Lister"},
"catLoops":function(d){return "Løkker"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"codeTooltip":function(d){return "Se generert JavaScript-kode."},
"continue":function(d){return "Fortsett"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "Ø"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "slutt"},
"emptyBlocksErrorMsg":function(d){return "\"Gjenta\"- eller \"Hvis\"-blokken må ha andre blokker inne i seg for å fungere. Kontroller at den indre blokken sitter riktig på plass i blokken som er utenfor."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funksjonsblokken må ha andre blokker inni seg for å virke."},
"errorEmptyFunctionBlockModal":function(d){return "Det må være blokker i funksjonsdefinisjonen din. Klikk \"Rediger\" og dra blokker inn i den grønne blokken."},
"errorIncompleteBlockInFunction":function(d){return "Klikk \"Rediger\" for å sørge for at du ikke mangler noen blokker i funksjonsdefinisjonen din."},
"errorParamInputUnattached":function(d){return "Husk å feste en blokk til hvert av innverdiene på funksjonsblokken i arbeidsområdet."},
"errorUnusedParam":function(d){return "Du la til en parameterblokk, men bruke den ikke i definisjonen. Husk å bruke parameteren ved å klikke \"Rediger\" og sette parameterblokk innenfor den grønne blokken."},
"errorRequiredParamsMissing":function(d){return "Lag en parameter for funksjonen din ved å klikke \"Rediger\" og legge til de nødvendige parameterne. Dra de nye parameterblokkene til funksjonsdefinisjonen."},
"errorUnusedFunction":function(d){return "Du opprettet en funksjon, men brukte den ikke i arbeidsområdet! Klikk på \"Funksjoner\" i verktøykassen, og forsikre deg om at du bruker den i programmet ditt."},
"errorQuestionMarksInNumberField":function(d){return "Prøv å erstatte \"???\" med en verdi!"},
"extraTopBlocks":function(d){return "Du har ubrukte klosser. Vil du feste dem til \"start\"-klossen?"},
"finalStage":function(d){return "Gratulerer! Du har fullført siste nivå."},
"finalStageTrophies":function(d){return "Gratulerer! Du har fullført siste nivå og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":locale.n(d,"numTrophies")+" pokaler"})+"."},
"finish":function(d){return "Fullfør"},
"generatedCodeInfo":function(d){return "Selv topp universiteter lærer blokk-basert koding (f.eks "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Men under panseret, kan blokkene du har samlet også vises i JavaScript, verdens mest brukte kode språk:"},
"hashError":function(d){return "Beklager, '%1' samsvarer ikke med noe lagret program."},
"help":function(d){return "Hjelp"},
"hintTitle":function(d){return "Tips:"},
"jump":function(d){return "Hopp"},
"levelIncompleteError":function(d){return "Du bruker alle nødvendige typer blokker, men ikke på riktig måte."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lag ditt eget \"Sprette-Spill\""},
"missingBlocksErrorMsg":function(d){return "Forsøk en eller flere av blokkene under for å løse denne oppgaven."},
"nextLevel":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+" og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":locale.n(d,"numTrophies")+" pokaler"})+"."},
"nextStage":function(d){return "Gratulerer! Du fullførte "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulerer! Du har fullført "+locale.v(d,"stageName")+" og vunnet "+locale.p(d,"numTrophies",0,"no",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Gratulerer! Du har fullført oppgave "+locale.v(d,"puzzleNumber")+". (Men, du kunne ha brukt kun "+locale.p(d,"numBlocks",0,"no",{"one":"1 blokk","other":locale.n(d,"numBlocks")+" blokker"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har akkurat skrevet "+locale.p(d,"numLines",0,"no",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" med kode!"},
"play":function(d){return "spill av"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Oppgave "+locale.v(d,"puzzle_number")+" av "+locale.v(d,"stage_total")},
"repeat":function(d){return "gjenta"},
"resetProgram":function(d){return "Nullstill"},
"runProgram":function(d){return "Start"},
"runTooltip":function(d){return "Kjør programmet definert av blokkene i arbeidsområdet."},
"score":function(d){return "poengsum"},
"showCodeHeader":function(d){return "Vis kode"},
"showBlocksHeader":function(d){return "Vis blokker"},
"showGeneratedCode":function(d){return "Vis kode"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "et visuelt programmeringsopplegg"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Du bruker alle de nødvendige blokktypene, men forsøk å bruke flere av denne typen blokker for å løse denne oppgaven."},
"tooManyBlocksMsg":function(d){return "Denne oppgaven kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokker."},
"tooMuchWork":function(d){return "Du fikk meg til å gjøre masse arbeid! Kan du forsøke med mindre repetisjon?"},
"toolboxHeader":function(d){return "blokker"},
"openWorkspace":function(d){return "Slik fungerer det"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+locale.p(d,"numLines",0,"no",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" med kode."},
"tryAgain":function(d){return "Forsøk igjen"},
"hintRequest":function(d){return "Se hint"},
"backToPreviousLevel":function(d){return "Tilbake til forrige nivå"},
"saveToGallery":function(d){return "Lagre i galleriet"},
"savedToGallery":function(d){return "Lagret i galleriet!"},
"shareFailure":function(d){return "Beklager, vi kan ikke dele dette programmet."},
"workspaceHeader":function(d){return "Sett sammen blokkene dine her: "},
"workspaceHeaderJavaScript":function(d){return "Skriv inn JavaScript-koden din her"},
"infinity":function(d){return "Uendelig"},
"rotateText":function(d){return "Roter enheten din."},
"orientationLock":function(d){return "Skru av roteringslåsen på enheten din."},
"wantToLearn":function(d){return "Vil du lære å kode?"},
"watchVideo":function(d){return "Se videoen"},
"when":function(d){return "når"},
"whenRun":function(d){return "start"},
"tryHOC":function(d){return "Prøv Kodetimen"},
"signup":function(d){return "Registrer deg for introduksjonskurset"},
"hintHeader":function(d){return "Her er et tips:"},
"genericFeedback":function(d){return "Se hvordan du endte opp, og prøv å fikse programmet ditt."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Sjekk ut det jeg lagde"}};