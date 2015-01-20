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
"and":function(d){return "och"},
"booleanTrue":function(d){return "sant"},
"booleanFalse":function(d){return "falskt"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Handlingar"},
"catColour":function(d){return "Färg"},
"catLogic":function(d){return "Logik"},
"catLists":function(d){return "Listor"},
"catLoops":function(d){return "Loopar"},
"catMath":function(d){return "Matte"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variabler"},
"codeTooltip":function(d){return "Se genererad JavaScript-kod."},
"continue":function(d){return "Fortsätt"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "Ok"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "Ö"},
"directionWestLetter":function(d){return "V"},
"end":function(d){return "slut"},
"emptyBlocksErrorMsg":function(d){return "\"Upprepa\" eller \"Om\" blocken måste ha andra block inuti sig för att fungera. Se till att det inre blocket sitter rätt inuti blocket."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktionsblocket måste ha andra block i sig för att fungera."},
"errorEmptyFunctionBlockModal":function(d){return "Det måste finnas block inuti din funktionsdefinition. Klicka på \"redigera\" och dra block in i det gröna blocket."},
"errorIncompleteBlockInFunction":function(d){return "Klicka på \"Redigera\" för att se till att  någon block inte saknas inuti din funktionsdefinition."},
"errorParamInputUnattached":function(d){return "Kom ihåg att bifoga ett block på varje parameter i blockets funktion på din arbetsyta."},
"errorUnusedParam":function(d){return "Du har lagt till ett parameterblock, men använder inte det i definitionen. Se till att använda parametern genom att klicka på \"Redigera\" och placera parameterblocket inuti gröna blocket."},
"errorRequiredParamsMissing":function(d){return "Skapa en parameter för din funktion genom att klicka på \"redigera\" och lägga till de nödvändiga parametrarna. Dra de nya parameterblocken in i din funktionsdefinition."},
"errorUnusedFunction":function(d){return "Du skapade en funktion, men använde det aldrig på din arbetsyta! Klicka på \"Funktioner\" i verktygslådan och kontrollera att du använder det i ditt program."},
"errorQuestionMarksInNumberField":function(d){return "Prova att ersätta \"???\" med ett värde."},
"extraTopBlocks":function(d){return "Du har okopplade block. Menade du att fästa dessa till \"när startat\" blocket?"},
"finalStage":function(d){return "Grattis! Du har slutfört den sista nivån."},
"finalStageTrophies":function(d){return "Grattis! Du har slutfört den sista nivån och vann "+locale.p(d,"numTrophies",0,"sv",{"en":"en trofé","other":locale.n(d,"numTrophies")+" troféer"})+"."},
"finish":function(d){return "Avsluta"},
"generatedCodeInfo":function(d){return "Även toppuniversitet lär ut blockbaserad programmering (t.ex. "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Men under ytan kan blocken du har byggt ihop också visas som JavaScript, världens mest använda programmeringsspråk:"},
"hashError":function(d){return "Tyvärr, '%1' finns inte bland dina sparade program."},
"help":function(d){return "Hjälp"},
"hintTitle":function(d){return "Tips:"},
"jump":function(d){return "hoppa"},
"levelIncompleteError":function(d){return "Du använder alla nödvändiga typer av block, men inte på rätt sätt."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Gör ditt eget Flappy-spel"},
"missingBlocksErrorMsg":function(d){return "Prova att använda ett eller flera av blocken nedan för att lösa pusslet."},
"nextLevel":function(d){return "Grattis! Du slutförde pussel "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Grattis! Du slutförde pussel "+locale.v(d,"puzzleNumber")+" och vann "+locale.p(d,"numTrophies",0,"sv",{"one":"en trofé","other":locale.n(d,"numTrophies")+" troféer"})+"."},
"nextStage":function(d){return "Grattis! Du har klarat "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Grattis! Du klarade "+locale.v(d,"stageName")+" och har fått "+locale.p(d,"numTrophies",0,"sv",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Grattis! Du klarade pussel "+locale.v(d,"puzzleNumber")+". (Men du borde bara behövt använda "+locale.p(d,"numBlocks",0,"sv",{"one":"1 block","other":locale.n(d,"numBlocks")+" block"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du skrev "+locale.p(d,"numLines",0,"sv",{"one":"1 rad","other":locale.n(d,"numLines")+" rader"})+" kod!"},
"play":function(d){return "spela"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Pussel "+locale.v(d,"puzzle_number")+" av "+locale.v(d,"stage_total")},
"repeat":function(d){return "upprepa"},
"resetProgram":function(d){return "Återställ"},
"runProgram":function(d){return "Kör"},
"runTooltip":function(d){return "Starta programmet som gjorts av blocken på arbetsytan."},
"score":function(d){return "poäng"},
"showCodeHeader":function(d){return "Visa kod"},
"showBlocksHeader":function(d){return "Visa block"},
"showGeneratedCode":function(d){return "Visa kod"},
"stringEquals":function(d){return "sträng =?"},
"subtitle":function(d){return "en visuell programmeringsmiljö"},
"textVariable":function(d){return "text"},
"tooFewBlocksMsg":function(d){return "Du använder alla sorters block du behöver, prova att använda fler av samma sorter för att göra klart pusslet."},
"tooManyBlocksMsg":function(d){return "Detta pusslet kan lösas med <x id='START_SPAN'/><x id='END_SPAN'/> block."},
"tooMuchWork":function(d){return "Du fick mig att göra en hel del arbete!  Du kan försöka upprepa färre gånger?"},
"toolboxHeader":function(d){return "bitar"},
"openWorkspace":function(d){return "Hur det fungerar"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+locale.p(d,"numLines",0,"sv",{"one":"1 rad","other":locale.n(d,"numLines")+" rader"})+" kod."},
"tryAgain":function(d){return "Försök igen"},
"hintRequest":function(d){return "Se tips"},
"backToPreviousLevel":function(d){return "Gå tillbaka till föregående nivå"},
"saveToGallery":function(d){return "Spara till galleriet"},
"savedToGallery":function(d){return "Sparad i galleriet!"},
"shareFailure":function(d){return "Tyvärr kan inte vi dela detta program."},
"workspaceHeader":function(d){return "Sätt ihop dina block här: "},
"workspaceHeaderJavaScript":function(d){return "Skriv din JavaScript-kod här"},
"infinity":function(d){return "Oändligt"},
"rotateText":function(d){return "Rotera din enhet."},
"orientationLock":function(d){return "Stäng av orienterings låset i enhetsinställningar."},
"wantToLearn":function(d){return "Vill du lära dig att programmera?"},
"watchVideo":function(d){return "Titta på videon"},
"when":function(d){return "när"},
"whenRun":function(d){return "när startat"},
"tryHOC":function(d){return "Prova Kodtimmen"},
"signup":function(d){return "Registrera dig för introduktionskursen"},
"hintHeader":function(d){return "Här är ett tips:"},
"genericFeedback":function(d){return "Se vad det blev, och försök fixa ditt program."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Kolla vad jag gjorde"}};