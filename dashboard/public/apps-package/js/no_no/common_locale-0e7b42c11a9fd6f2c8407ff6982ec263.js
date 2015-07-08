var common_locale = {lc:{"ar":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "og"},
"backToPreviousLevel":function(d){return "Tilbake til forrige nivå"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokker"},
"booleanFalse":function(d){return "usann"},
"booleanTrue":function(d){return "sann"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farge"},
"catLists":function(d){return "Lister"},
"catLogic":function(d){return "Logikk"},
"catLoops":function(d){return "Løkker"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjoner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"clearPuzzle":function(d){return "Start på nytt"},
"clearPuzzleConfirm":function(d){return "Dette nullstiller oppgaven og sletter alle blokkene du har lagt til eller endret."},
"clearPuzzleConfirmHeader":function(d){return "Er du sikker på at du vil starte på nytt?"},
"codeMode":function(d){return "Kode"},
"codeTooltip":function(d){return "Se generert JavaScript-kode."},
"continue":function(d){return "Fortsett"},
"defaultTwitterText":function(d){return "Sjekk ut det jeg lagde"},
"designMode":function(d){return "Utforming"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "Ø"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Legg til to tall"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Legg til operatør"},
"dropletBlock_andOperator_description":function(d){return "Returnerer TRUE når begge uttrykkene er sanne og FALSE ellers"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolsk operator"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "verdi"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Kaller en navngitt funksjon som ikke tar noen parametere"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kaller en navngitt funksjon som tar en eller flere parametre"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kaller en funksjon med parametre"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kall en funksjon"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Del to tall"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definer en funksjon med parametre"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definer en funksjon"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multipliser to tall"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Returnerer en verdi fra en funksjon"},
"dropletBlock_return_signatureOverride":function(d){return "returner"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "\"Gjenta\"- eller \"Hvis\"-blokken må ha andre blokker inne i seg for å fungere. Kontroller at den indre blokken sitter riktig på plass i blokken som er utenfor."},
"emptyBlockInFunction":function(d){return "Funksjonen "+common_locale.v(d,"name")+" har et tomt inndatafelt."},
"emptyBlockInVariable":function(d){return "Variabelen "+common_locale.v(d,"name")+" har et tomt inndatafelt."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funksjonsblokken må ha andre blokker inni seg for å virke."},
"emptyFunctionalBlock":function(d){return "Du har en blokk som mangler inndata."},
"emptyTopLevelBlock":function(d){return "Det er ingen blokker å kjøre. Du må feste en blokk til "+common_locale.v(d,"topLevelBlockName")+"-blokken."},
"end":function(d){return "slutt"},
"errorEmptyFunctionBlockModal":function(d){return "Det må være blokker inni funksjonsdefinisjonen din. Klikk \"Rediger\" og dra blokker inn i den grønne blokken."},
"errorIncompleteBlockInFunction":function(d){return "Klikk \"Rediger\" for å sørge for at du ikke mangler noen blokker inni funksjonsdefinisjonen din."},
"errorParamInputUnattached":function(d){return "Husk å feste en blokk til hver av innverdiene på funksjonsblokken i arbeidsområdet."},
"errorQuestionMarksInNumberField":function(d){return "Prøv å erstatte \"???\" med en verdi!"},
"errorRequiredParamsMissing":function(d){return "Lag en parameter for funksjonen din ved å klikke \"Rediger\" og legge til de nødvendige parameterne. Dra de nye parameterblokkene til funksjonsdefinisjonen."},
"errorUnusedFunction":function(d){return "Du opprettet en funksjon, men brukte den ikke i arbeidsområdet! Klikk på \"Funksjoner\" i verktøykassen, og forsikre deg om at du bruker den i programmet ditt."},
"errorUnusedParam":function(d){return "Du la til en parameterblokk, men bruke den ikke i definisjonen. Husk å bruke parameteren ved å klikke \"Rediger\" og sette parameterblokk innenfor den grønne blokken."},
"extraTopBlocks":function(d){return "Du har ledige blokker."},
"extraTopBlocksWhenRun":function(d){return "Du har ledige blokker. Mente du å knytte disse til \"når kjøre\" blokken?"},
"finalStage":function(d){return "Gratulerer! Du har fullført siste nivå."},
"finalStageTrophies":function(d){return "Gratulerer! Du har fullført siste nivå og vunnet "+common_locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":common_locale.n(d,"numTrophies")+" pokaler"})+"."},
"finish":function(d){return "Fullfør"},
"generatedCodeInfo":function(d){return "Selv topp universiteter lærer blokk-basert koding (f.eks "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Men under panseret, kan blokkene du har samlet også vises i JavaScript, verdens mest brukte kode språk:"},
"genericFeedback":function(d){return "Se hvordan du endte opp, og prøv å fikse programmet ditt."},
"hashError":function(d){return "Beklager, '%1' samsvarer ikke med noe lagret program."},
"help":function(d){return "Hjelp"},
"hideToolbox":function(d){return "(Skjul)"},
"hintHeader":function(d){return "Her er et tips:"},
"hintRequest":function(d){return "Se hint"},
"hintTitle":function(d){return "Tips:"},
"infinity":function(d){return "Uendelig"},
"jump":function(d){return "Hopp"},
"keepPlaying":function(d){return "Fortsett å spille"},
"levelIncompleteError":function(d){return "Du bruker alle nødvendige typer blokker, men ikke på riktig måte."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lag ditt eget \"Sprette-Spill\""},
"missingBlocksErrorMsg":function(d){return "Forsøk en eller flere av blokkene under for å løse denne oppgaven."},
"nextLevel":function(d){return "Gratulerer! Du har fullført oppgave "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulerer! Du har fullført oppgave "+common_locale.v(d,"puzzleNumber")+" og vunnet "+common_locale.p(d,"numTrophies",0,"no",{"one":"en pokal","other":common_locale.n(d,"numTrophies")+" pokaler"})+"."},
"nextPuzzle":function(d){return "Neste puslespill"},
"nextStage":function(d){return "Gratulerer! Du fullførte "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulerer! Du har fullført "+common_locale.v(d,"stageName")+" og vunnet "+common_locale.p(d,"numTrophies",0,"no",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Gratulerer! Du har fullført oppgave "+common_locale.v(d,"puzzleNumber")+". (Men, du kunne ha brukt kun "+common_locale.p(d,"numBlocks",0,"no",{"one":"1 blokk","other":common_locale.n(d,"numBlocks")+" blokker"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har akkurat skrevet "+common_locale.p(d,"numLines",0,"no",{"one":"1 linje","other":common_locale.n(d,"numLines")+" linjer"})+" med kode!"},
"openWorkspace":function(d){return "Slik fungerer det"},
"orientationLock":function(d){return "Skru av roteringslåsen på enheten din."},
"play":function(d){return "spill"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Oppgave "+common_locale.v(d,"puzzle_number")+" av "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "gjenta"},
"resetProgram":function(d){return "Nullstill"},
"rotateText":function(d){return "Roter enheten din."},
"runProgram":function(d){return "Kjør"},
"runTooltip":function(d){return "Kjør programmet definert av blokkene i arbeidsområdet."},
"saveToGallery":function(d){return "Lagre i galleriet"},
"savedToGallery":function(d){return "Lagret i galleriet!"},
"score":function(d){return "poengsum"},
"shareFailure":function(d){return "Beklager, vi kan ikke dele dette programmet."},
"showBlocksHeader":function(d){return "Vis blokker"},
"showCodeHeader":function(d){return "Vis kode"},
"showGeneratedCode":function(d){return "Vis kode"},
"showTextHeader":function(d){return "Vis tekst"},
"showToolbox":function(d){return "Vis verktøykasse"},
"signup":function(d){return "Registrer deg for introduksjonskurset"},
"stringEquals":function(d){return "streng =?"},
"subtitle":function(d){return "et visuelt programmeringsopplegg"},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Du må fikse en feil i programmet ditt før det kan vises som brikker."},
"tooFewBlocksMsg":function(d){return "Du bruker alle de nødvendige blokktypene, men forsøk å bruke flere av denne typen blokker for å løse denne oppgaven."},
"tooManyBlocksMsg":function(d){return "Denne oppgaven kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokker."},
"tooMuchWork":function(d){return "Du fikk meg til å gjøre masse arbeid! Kan du forsøke med mindre repetisjon?"},
"toolboxHeader":function(d){return "blokker"},
"toolboxHeaderDroplet":function(d){return "Verktøykasse"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+common_locale.p(d,"numLines",0,"no",{"one":"1 linje","other":common_locale.n(d,"numLines")+" linjer"})+" med kode."},
"tryAgain":function(d){return "Forsøk igjen"},
"tryHOC":function(d){return "Prøv Kodetimen"},
"wantToLearn":function(d){return "Vil du lære å kode?"},
"watchVideo":function(d){return "Se videoen"},
"when":function(d){return "når"},
"whenRun":function(d){return "når den kjører"},
"workspaceHeaderShort":function(d){return "Arbeidsområde: "}};