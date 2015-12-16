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
"backToPreviousLevel":function(d){return "Tilbage til forrige niveau"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokke"},
"booleanFalse":function(d){return "falsk"},
"booleanTrue":function(d){return "sandt"},
"catActions":function(d){return "Handlinger"},
"catColour":function(d){return "Farve"},
"catLists":function(d){return "Lister"},
"catLogic":function(d){return "Logik"},
"catLoops":function(d){return "Sløjfer"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabler"},
"clearPuzzle":function(d){return "Start forfra"},
"clearPuzzleConfirm":function(d){return "Dette vil nulstille programmet og slette alle de blokke, du har tilføjet eller ændret."},
"clearPuzzleConfirmHeader":function(d){return "Sikker på, at du vil starte forfra?"},
"codeMode":function(d){return "Kode"},
"codeTooltip":function(d){return "Se genererede JavaScript-kode."},
"completedWithoutRecommendedBlock":function(d){return "Tillykke! Du har fuldført puslespillet "+common_locale.v(d,"puzzleNumber")+". (Men du kan bruge en anden blok for en stærkere kode.)"},
"continue":function(d){return "Fortsæt"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Se hvad jeg har lavet"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "Annuller"},
"dialogOK":function(d){return "Ok"},
"directionEastLetter":function(d){return "Ø"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Tilføj to numre"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Tilføj operatør"},
"dropletBlock_andOperator_description":function(d){return "Returnerer sand, når begge udtryk er sande ellers falsk"},
"dropletBlock_andOperator_signatureOverride":function(d){return "OG boolesk operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "værdi"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Kalder en navngiven funktion, der ikke tager parametre"},
"dropletBlock_callMyFunction_n_description":function(d){return "Kalder en navngiven funktion, der tager en eller flere parametre"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Kald en funktion med parametre"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Kald en funktion"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Opret en variabel og initialisér den som en matrix"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Erklærer en variabel med navnet efter 'var', og tildeler værdien på højre side af udtrykket"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Opret en variabel og tilknyt den en værdi ved at vise en prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Angiv værdi\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Angiv værdi\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Erklære en variabel"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Erklære en variabel"},
"dropletBlock_divideOperator_description":function(d){return "Opdel to tal"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divider operatør"},
"dropletBlock_equalityOperator_description":function(d){return "Test for lighed"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Opretter en løkke, bestående af en initialisering udtryk, et betinget udtryk, en stigende udtryk og en sætningsblok henrettet for hver gentagelse af løkken"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for-løkke"},
"dropletBlock_functionParams_n_description":function(d){return "En række erklæringer, der tager i en eller flere parametre, og udfører en opgave eller beregne en værdi, når funktionen kaldes"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definerer en funktion med parametre"},
"dropletBlock_functionParams_none_description":function(d){return "En række sætninger, der udfører en opgave eller beregne en værdi, når funktionen kaldes"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definerer en funktion"},
"dropletBlock_getTime_description":function(d){return "Få den aktuelle tid i millisekunder"},
"dropletBlock_greaterThanOperator_description":function(d){return "Sammenligne to tal"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Udfører en sætningsblok, hvis den angivne betingelse er sand"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "hvis sætning"},
"dropletBlock_ifElseBlock_description":function(d){return "Udfører en sætningsblok, hvis den angivne betingelse er sand; ellers udføres sætningsblokken i delsætningen ELLERS"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "Hvis/ellers erklæring"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for ulighed"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Sammenligne to tal"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Tager den absolutte værdi af x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Tager den maksimale værdi blandt en eller flere værdier n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max(n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Tager minimumsværdien blandt en eller flere værdier n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.Min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Returnerer et tilfældig tal i intervallet fra og med 0 (inkluderet) op til men ikke med 1 (ekskluderet)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Afrund til nærmeste heltal"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplicere to tal"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Returnerer falsk, hvis udtrykket kan omregnes til sandt; ellers returneres sandt"},
"dropletBlock_notOperator_signatureOverride":function(d){return "OG boolesk operator"},
"dropletBlock_orOperator_description":function(d){return "Returnerer sand, når begge udtryk er sande, og ellers falsk"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ELLER boolesk operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Det mindste tal returneret"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Det største tal returneret"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Returnerer en værdi fra en funktion"},
"dropletBlock_return_signatureOverride":function(d){return "vend tilbage"},
"dropletBlock_setAttribute_description":function(d){return "Sætter den angivne værdi"},
"dropletBlock_subtractOperator_description":function(d){return "Subtrahér to numre"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Opretter en løkke, bestående af et betinget udtryk og en sætningsblok, der eksekveres for hver gentagelse af løkken. Løkken fortsætter eksekvering så længe betingelsen evalueres er sand"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "imens løkke"},
"emptyBlockInFunction":function(d){return "Funktionen "+common_locale.v(d,"name")+" har manglende input."},
"emptyBlockInVariable":function(d){return "Variablen "+common_locale.v(d,"name")+" har manglende input."},
"emptyBlocksErrorMsg":function(d){return "\"Gentag\" eller \"Hvis\" blokkene skal have andre blokke inden i for at virke. Kontroller, at den indre blok passer ordentligt inde i blokken."},
"emptyExampleBlockErrorMsg":function(d){return "Du har brug for mindst to eksempler på funktion "+common_locale.v(d,"functionName")+". Sørg for hvert eksempel er et kald og et resultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funktion blokken skal have andre blokke inde i den for at virke."},
"emptyFunctionalBlock":function(d){return "Du har en blok med et ikke-udfyldt input."},
"emptyTopLevelBlock":function(d){return "Der er ingen blokke til at køre. Du skal vedhæfte en blok til "+common_locale.v(d,"topLevelBlockName")+" blokken."},
"end":function(d){return "slut"},
"errorEmptyFunctionBlockModal":function(d){return "Der skal være blokke i din definition af en funktion. Klik på \"Rediger\" og træk blokke ind i den grønne blok."},
"errorIncompleteBlockInFunction":function(d){return "Klik på \"Rediger\" for at sikre at der ikke mangler nogen blokke i din definition af funktionen."},
"errorParamInputUnattached":function(d){return "Husk at knytte en blok til hvert parameter-felt på funktions-blokken i dit arbejdsområde."},
"errorQuestionMarksInNumberField":function(d){return "Prøv at erstatte \"???\" med en værdi."},
"errorRequiredParamsMissing":function(d){return "Opret en parameter for din funktion ved at klikke på \"Rediger\" og tilføje de nødvendige parametre. Træk de nye parameter-blokke til din definitionen af din funktion."},
"errorUnusedFunction":function(d){return "Du har oprettet en funktion, men ikke brugt den i dit arbejdsområde! Klik på \"Funktioner\" i værktøjskassen, og sørg for du bruger den i dit program."},
"errorUnusedParam":function(d){return "Du har tilføjet en parameterblok, men ikke brugt den i definitionen. Klik på \"Rediger\" og placer parameterblokken inden i den grønne blok, for at bruge din parameter."},
"exampleErrorMessage":function(d){return "Funktion "+common_locale.v(d,"functionName")+" har en eller flere eksempler, der har brug for en justering. Kontroller om de passer til din definition og besvare spørgsmålet."},
"examplesFailedOnClose":function(d){return "En eller flere af dine forslag passer ikke til din definition. Kontroller dine forslag før du lukker"},
"extraTopBlocks":function(d){return "Du har separate blokke."},
"extraTopBlocksWhenRun":function(d){return "Du har separate blokke. Var det din mening at hæfte disse til \"ved kørsel\"-blokken?"},
"finalStage":function(d){return "Tillykke! Du har fuldført det sidste trin."},
"finalStageTrophies":function(d){return "Tillykke! Du har afsluttet det sidste trin og vundet "+common_locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":common_locale.n(d,"numTrophies")+" trofæer"})+"."},
"finish":function(d){return "Færdig"},
"generatedCodeInfo":function(d){return "Selv top-universiteter underviser i blok-baseret programmering (f.eks. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Men under kølerhjelmen, kan de blokke du har samlet også vises i JavaScript, verdens mest udbredte programmeringssprog:"},
"hashError":function(d){return "Beklager, '%1' svarer ikke til noget gemt program."},
"help":function(d){return "Hjælp"},
"hideToolbox":function(d){return "(Skjul)"},
"hintHeader":function(d){return "Her er et tip:"},
"hintRequest":function(d){return "Se hjælp"},
"hintTitle":function(d){return "Tip:"},
"ignore":function(d){return "Ignorer"},
"infinity":function(d){return "Uendelig"},
"jump":function(d){return "hop"},
"keepPlaying":function(d){return "Fortsæt med at spille"},
"levelIncompleteError":function(d){return "Du bruger alle de nødvendige typer af blokke, men ikke på den rigtige måde."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lav dit eget Flappy spil"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ikke helt korrekt. Prøv at bruge en blok du ikke har brugt endnu."},
"missingRequiredBlocksErrorMsg":function(d){return "Ikke helt korrekt. Du skal bruge en blok du ikke har brugt endnu."},
"nestedForSameVariable":function(d){return "Du bruger den samme variabel inde i to eller flere indlejrede løkker. Brug unikke variabelnavne for at undgå uendelige løkker."},
"nextLevel":function(d){return "Tillykke! Du har løst opgave "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Tillykke! Du har løst opgave "+common_locale.v(d,"puzzleNumber")+" og vandt "+common_locale.p(d,"numTrophies",0,"da",{"one":"et trofæ","other":common_locale.n(d,"numTrophies")+" trofæer"})+"."},
"nextPuzzle":function(d){return "Næste puslespil"},
"nextStage":function(d){return "Tillykke! Du gennemførte "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Tillykke! Du gennemførte "+common_locale.v(d,"stageName")+" og vandt "+common_locale.p(d,"numTrophies",0,"da",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Tillykke! Du har løst opgave "+common_locale.v(d,"puzzleNumber")+". (Men du kunne have løst den med "+common_locale.p(d,"numBlocks",0,"da",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" blokke"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har lige skrevet "+common_locale.p(d,"numLines",0,"da",{"one":"1 linje","other":common_locale.n(d,"numLines")+" linjer"})+" kode!"},
"openWorkspace":function(d){return "Sådan fungerer det"},
"orientationLock":function(d){return "Slå orienterings-lås fra i Enhedsindstillinger."},
"play":function(d){return "afspil"},
"print":function(d){return "Udskriv"},
"puzzleTitle":function(d){return "Opgave "+common_locale.v(d,"puzzle_number")+" af "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Se kun: "},
"repeat":function(d){return "gentag"},
"resetProgram":function(d){return "Nulstil"},
"rotateText":function(d){return "Drej din enhed."},
"runProgram":function(d){return "Kør"},
"runTooltip":function(d){return "Kør programmet defineret af blokkene i arbejdsområdet."},
"runtimeErrorMsg":function(d){return "Dit program kunne ikke køre. Fjern linje "+common_locale.v(d,"lineNumber")+" og prøv igen."},
"saveToGallery":function(d){return "Gem"},
"savedToGallery":function(d){return "Gemt!"},
"score":function(d){return "score"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Beklager, vi kan ikke dele dette program."},
"shareWarningsAge":function(d){return "Angiv din alder nedenfor og klik OK for at fortsætte."},
"shareWarningsMoreInfo":function(d){return "Mere Info"},
"shareWarningsStoreData":function(d){return "Denne app, bygget med Code Studio, gemmer data, som potentielt kan ses af alle med dette link, så vær forsigtig hvis du bliver bedt om at indtaste personlige oplysninger."},
"showBlocksHeader":function(d){return "Vis blokke"},
"showCodeHeader":function(d){return "Vis kode"},
"showGeneratedCode":function(d){return "Vis kode"},
"showTextHeader":function(d){return "Vis tekst"},
"showToolbox":function(d){return "Vis værktøjskasse"},
"showVersionsHeader":function(d){return "Versionshistorik for"},
"signup":function(d){return "Tilmeld til Introduktion kursus"},
"stringEquals":function(d){return "streng =?"},
"submit":function(d){return "Indsend"},
"submitYourProject":function(d){return "Indsend dit projekt"},
"submitYourProjectConfirm":function(d){return "Du kan ikke redigere projektet efter du har indsendt det, så vil du virkelig indsende nu?"},
"unsubmit":function(d){return "Fortryd indsendelse"},
"unsubmitYourProject":function(d){return "Af-publicer dit projekt"},
"unsubmitYourProjectConfirm":function(d){return "Af-publicering af dit projekt vil nulstille publiseringdatoen, vil du virkelig af-publicere?"},
"subtitle":function(d){return "et visuelt programmerings miljø"},
"syntaxErrorMsg":function(d){return "Dit program indeholder en fejl. Fjern linje "+common_locale.v(d,"lineNumber")+" og prøv igen."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Du skal rette en fejl i dit program, før det kan blive vist som blokke."},
"tooFewBlocksMsg":function(d){return "Du bruger alle de nødvendige typer af blokke, men prøv at bruge flere af disse typer blokke til at fuldføre dette puslespil."},
"tooManyBlocksMsg":function(d){return "Denne opgave kan løses med <x id='START_SPAN'/><x id='END_SPAN'/> blokke."},
"tooMuchWork":function(d){return "Du fik mig til at gøre en masse arbejde! Kunne du prøve at gentage færre gange?"},
"toolboxHeader":function(d){return "Blokke"},
"toolboxHeaderDroplet":function(d){return "Værktøjskasse"},
"totalNumLinesOfCodeWritten":function(d){return "I alt: "+common_locale.p(d,"numLines",0,"da",{"one":"1 linje","other":common_locale.n(d,"numLines")+" linjer"})+" af kode."},
"tryAgain":function(d){return "Prøv igen"},
"tryBlocksBelowFeedback":function(d){return "Prøv at bruge en af blokkene nedenfor:"},
"tryHOC":function(d){return "Prøv Hour of Code"},
"unnamedFunction":function(d){return "Du har en variabel eller en funktion, der ikke har et navn. Husk at give alt et beskrivende navn."},
"wantToLearn":function(d){return "Vil du lære at kode?"},
"watchVideo":function(d){return "Se videoen"},
"when":function(d){return "når"},
"whenRun":function(d){return "når programmet kører"},
"workspaceHeaderShort":function(d){return "Arbejdsområde: "},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};