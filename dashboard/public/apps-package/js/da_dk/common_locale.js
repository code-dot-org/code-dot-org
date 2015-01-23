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
"booleanTrue":function(d){return "sandt"},
"booleanFalse":function(d){return "falsk"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farve"},
"catLogic":function(d){return "Logik"},
"catLists":function(d){return "Lister"},
"catLoops":function(d){return "Sløjfer"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"codeTooltip":function(d){return "Se genererede JavaScript-kode."},
"continue":function(d){return "Fortsæt"},
"dialogCancel":function(d){return "Annuller"},
"dialogOK":function(d){return "Ok"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "Ø"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "slut"},
"emptyBlocksErrorMsg":function(d){return "\"Gentag\" eller \"Hvis\" blokkene skal have andre blokke inden i for at virke. Kontroller, at den indre blok passer ordentligt inde i blokken."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktionen blok skal have andre blokke inde i det for at virke."},
"errorEmptyFunctionBlockModal":function(d){return "Der skal være blokke i din definition af en funktion. Klik på \"Rediger\" og træk blokke ind i den grønne blok."},
"errorIncompleteBlockInFunction":function(d){return "Klik på \"Rediger\" for at sikre at der ikke mangler nogen blokke i din definition af funktionen."},
"errorParamInputUnattached":function(d){return "Husk at knytte en blok til hvert parameter-felt på funktions-blokken i dit arbejdsområde."},
"errorUnusedParam":function(d){return "Du har tilføjet en parameterblok, men ikke brugt den i definitionen. Klik på \"Rediger\" og placer parameterblokken inden i den grønne blok, for at bruge din parameter."},
"errorRequiredParamsMissing":function(d){return "Opret en parameter for din funktion ved at klikke på \"Rediger\" og tilføje de nødvendige parametre. Træk de nye parameter-blokke til din definitionen af din funktion."},
"errorUnusedFunction":function(d){return "Du har oprettet en funktion, men ikke brugt den i dit arbejdsområde! Klik på \"Funktioner\" i værktøjskassen, og sørg for du bruger den i dit program."},
"errorQuestionMarksInNumberField":function(d){return "Prøv at erstatte \"???\" med en værdi."},
"extraTopBlocks":function(d){return "Du har blokke, som ikke er knyttet til andre. Ville du fastgøre dem  til \"når programmet kører\"-blokken?"},
"finalStage":function(d){return "Tillykke! Du har fuldført det sidste trin."},
"finalStageTrophies":function(d){return "Tillykke! Du har afsluttet det sidste trin og vundet "+locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":locale.n(d,"numTrophies")+" trofæer"})+"."},
"finish":function(d){return "Færdig"},
"generatedCodeInfo":function(d){return "Selv top-universiteter underviser i blok-baseret programmering (f.eks. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Men under kølerhjelmen, kan de blokke du har samlet også vises i JavaScript, verdens mest udbredte programmeringssprog:"},
"hashError":function(d){return "Beklager, '%1' svarer ikke til noget gemt program."},
"help":function(d){return "Hjælp"},
"hintTitle":function(d){return "Tip:"},
"jump":function(d){return "hop"},
"levelIncompleteError":function(d){return "Du bruger alle de nødvendige typer af blokke, men ikke på den rigtige måde."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lav dit eget Flappy spil"},
"missingBlocksErrorMsg":function(d){return "Prøv en eller flere af blokkene nedenfor for at løse denne opgave."},
"nextLevel":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+" og vandt "+locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":locale.n(d,"numTrophies")+" trofæer"})+"."},
"nextStage":function(d){return "Tillykke! Du gennemførte "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Tillykke! Du gennemførte "+locale.v(d,"stageName")+" og vandt "+locale.p(d,"numTrophies",0,"da",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Tillykke! Du har løst opgave "+locale.v(d,"puzzleNumber")+". (Men du kunne have løst den med "+locale.p(d,"numBlocks",0,"da",{"one":"1 blok","other":locale.n(d,"numBlocks")+" blokke"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har lige skrevet "+locale.p(d,"numLines",0,"da",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" kode!"},
"play":function(d){return "afspil"},
"print":function(d){return "Udskriv"},
"puzzleTitle":function(d){return "Opgave "+locale.v(d,"puzzle_number")+" af "+locale.v(d,"stage_total")},
"repeat":function(d){return "gentag"},
"resetProgram":function(d){return "Nulstil"},
"runProgram":function(d){return "Kør"},
"runTooltip":function(d){return "Kør programmet defineret af blokkene i arbejdsområdet."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Vis kode"},
"showBlocksHeader":function(d){return "Vis blokke"},
"showGeneratedCode":function(d){return "Vis kode"},
"stringEquals":function(d){return "streng =?"},
"subtitle":function(d){return "et visuelt programmerings miljø"},
"textVariable":function(d){return "tekst"},
"tooFewBlocksMsg":function(d){return "Du bruger alle de nødvendige typer blokke, men prøv at bruge flere af disse blokke for at løse opgaven."},
"tooManyBlocksMsg":function(d){return "Denne opgave kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokke."},
"tooMuchWork":function(d){return "Du fik mig til at gøre en masse arbejde! Kunne du prøve at gentage færre gange?"},
"toolboxHeader":function(d){return "blokke"},
"openWorkspace":function(d){return "Sådan fungerer det"},
"totalNumLinesOfCodeWritten":function(d){return "I alt: "+locale.p(d,"numLines",0,"da",{"one":"1 linje","other":locale.n(d,"numLines")+" linjer"})+" af kode."},
"tryAgain":function(d){return "Prøv igen"},
"hintRequest":function(d){return "Se hjælp"},
"backToPreviousLevel":function(d){return "Tilbage til forrige niveau"},
"saveToGallery":function(d){return "Gem"},
"savedToGallery":function(d){return "Gemt!"},
"shareFailure":function(d){return "Beklager, ikke kan vi dele dette program."},
"workspaceHeader":function(d){return "Saml dine blokke her: "},
"workspaceHeaderJavaScript":function(d){return "Skriv din JavaScript-kode her"},
"infinity":function(d){return "Uendelig"},
"rotateText":function(d){return "Drej din enhed."},
"orientationLock":function(d){return "Slå orienterings-lås fra i Enhedsindstillinger."},
"wantToLearn":function(d){return "Vil du lære at kode?"},
"watchVideo":function(d){return "Se denne video"},
"when":function(d){return "når"},
"whenRun":function(d){return "når programmet kører"},
"tryHOC":function(d){return "Prøv Hour of Code"},
"signup":function(d){return "Tilmeld til Introduktion kursus"},
"hintHeader":function(d){return "Her er et tip:"},
"genericFeedback":function(d){return "Se hvordan du endte, og prøve at rette dit program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Se hvad jeg har lavet"}};