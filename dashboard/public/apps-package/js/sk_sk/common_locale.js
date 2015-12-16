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
"and":function(d){return "a"},
"backToPreviousLevel":function(d){return "Späť na predchádzajúcu úlohu"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "bloky"},
"booleanFalse":function(d){return "nepravda"},
"booleanTrue":function(d){return "pravda"},
"catActions":function(d){return "Akcie"},
"catColour":function(d){return "Farba"},
"catLists":function(d){return "Zoznamy"},
"catLogic":function(d){return "Logické"},
"catLoops":function(d){return "Cykly"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcie"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Premenné"},
"clearPuzzle":function(d){return "Začať odznova"},
"clearPuzzleConfirm":function(d){return "Toto vynuluje puzzle na štartovaciu pozíciu a vymaže všetky bloky, ktoré boli pridané alebo zmenené."},
"clearPuzzleConfirmHeader":function(d){return "Naozaj chceš začať odznova?"},
"codeMode":function(d){return "Kód"},
"codeTooltip":function(d){return "Pozrieť vygenerovaný kód JavaScript."},
"completedWithoutRecommendedBlock":function(d){return "Gratulujeme! Dokončili ste Puzzle "+common_locale.v(d,"puzzleNumber")+". (Môžete použiť rôzne bloky kódu pre náročnejší kód.)"},
"continue":function(d){return "Pokračovať"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Pozrite čo som vytvorila"},
"designMode":function(d){return "Dizajn"},
"dialogCancel":function(d){return "Zrušiť"},
"dialogOK":function(d){return "ok"},
"directionEastLetter":function(d){return "V"},
"directionNorthLetter":function(d){return "S"},
"directionSouthLetter":function(d){return "J"},
"directionWestLetter":function(d){return "Z"},
"dropletBlock_addOperator_description":function(d){return "Add two numbers"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters"},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a named function that takes one or more parameters"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Call a function"},
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
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
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
"dropletBlock_mathRandom_description":function(d){return "Vráti náhodné číslo od 0 (vrátane) vyššie ale okrem 1 (mimo)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Vrátený minimálny počet"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Vrátený maximálny počet"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "vráť"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funkcia "+common_locale.v(d,"name")+" má nevyplnené vstupy."},
"emptyBlockInVariable":function(d){return "Premenná "+common_locale.v(d,"name")+" má nevyplnené vstupy."},
"emptyBlocksErrorMsg":function(d){return "Aby bloky \"Opakuj\" alebo \"Ak\" pracovali, musia byť naplnené ďalšími blokmi. Uistite sa, že vnútorný blok je správne umiestnený vo vnútri týchto blokov."},
"emptyExampleBlockErrorMsg":function(d){return "Potrebuješ aspoň dva príklady vo funkcii "+common_locale.v(d,"functionName")+". Uisti sa, že každý príklad má volanie a výsledok."},
"emptyFunctionBlocksErrorMsg":function(d){return "Aby funkčný blok pracoval správne, musí obsahovať ďalšie bloky."},
"emptyFunctionalBlock":function(d){return "Máš blok s nevyplneným vstupom."},
"emptyTopLevelBlock":function(d){return "Nenašiel som bloky na spustenie. Pridajte nejaký blok k bloku "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "koniec"},
"errorEmptyFunctionBlockModal":function(d){return "V tvojej definícii funkcie musia byť nejaké bloky. Klikni na \"upraviť\" a presuň bloky do vnútra zeleného bloku."},
"errorIncompleteBlockInFunction":function(d){return "Kliknite na tlačidlo \"upraviť\" aby ste sa uistili, že nemáte žiadne chýbajúce bloky vnútri funkcie."},
"errorParamInputUnattached":function(d){return "Nezabudni pripojiť blok na každý vstupný parameter na funkčný blok v tvojom pracovnom priestore."},
"errorQuestionMarksInNumberField":function(d){return "Skús vymeniť \"???\" za hodnotu."},
"errorRequiredParamsMissing":function(d){return "Vytvor parameter pre tvoju funkciu kliknutím na tlačítko \"upraviť\" a pridaj potrebné parametre. Presuň nové parametrové bloky do tvojej definície funkcie."},
"errorUnusedFunction":function(d){return "Vytvoril si funkciu, ale nikdy si ju nepoužil vo svojejj pracovnej ploche! Klikni na \"Funkcie\" v Nástrojoch a uisti sa, že ich používaš vo svojom programe."},
"errorUnusedParam":function(d){return "Pridal si paramterický blok, ale nebol nikdy použitý v definícii. Na použitie tvojho parametru klikni na \"upraviť\" a umiestni parametrický blok do zeleného bloku."},
"exampleErrorMessage":function(d){return "Funkcia "+common_locale.v(d,"functionName")+" má jeden, alebo viac príkladov, ktoré potrebujú úpravu. Uistite sa, že sa zhodujú s vašou definíciou a odpovedajú na otázku."},
"examplesFailedOnClose":function(d){return "Jeden, alebo viac z vašich príkladov sa nezhoduje s vašou definíciou. Skontrolujte vaše príklady pred uzavretím"},
"extraTopBlocks":function(d){return "Máš nepripojené bloky."},
"extraTopBlocksWhenRun":function(d){return "Niektoré bloky sú nepripojené. Chcel si ich pripojiť ku blokom \"po spustení\"?"},
"finalStage":function(d){return "Gratulujem! Dokončil si poslednú úroveň."},
"finalStageTrophies":function(d){return "Gratulujem! Dokončil si poslednú úroveň a vyhral "+common_locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofejí"})+"."},
"finish":function(d){return "Dokončiť"},
"generatedCodeInfo":function(d){return "Dokonca aj popredné univerzity učia programovanie založené na blokoch  (napríklad "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ale v skutočnosti  bloky, ktoré ste vytvorili, môžu byť tiež zobrazené v jazyku JavaScript, svetovo najpoužívanejšom programovacom jazyku:"},
"hashError":function(d){return "Prepáčte, '%1' nezodpovedá žiadnemu uloženému programu."},
"help":function(d){return "Pomoc"},
"hideToolbox":function(d){return "(Skryť)"},
"hintHeader":function(d){return "Tu je rada:"},
"hintRequest":function(d){return "Pozri nápovedu"},
"hintTitle":function(d){return "Tip:"},
"ignore":function(d){return "Ignorovať"},
"infinity":function(d){return "Nekonečno"},
"jump":function(d){return "skoč"},
"keepPlaying":function(d){return "Hrať ďalej"},
"levelIncompleteError":function(d){return "Používate všetky potrebné typy blokov, ale nie tým správnym spôsobom."},
"listVariable":function(d){return "zoznam"},
"makeYourOwnFlappy":function(d){return "Vytvor si svoju vlastnú \"Flappy\" hru"},
"missingRecommendedBlocksErrorMsg":function(d){return "Nie tak celkom. Skúste použiť bloky kódu ktoré ste ešte nepoužili."},
"missingRequiredBlocksErrorMsg":function(d){return "Nie tak celkom. Musíte použiť blok kód ktorý ste ešte nepoužili."},
"nestedForSameVariable":function(d){return "Používaš rovnakú premennú vo vnútri dvoch, alebo viacerých cyklov. Používaj jedinečné názvy premenných, aby si sa vyhol nekonečnej slučke."},
"nextLevel":function(d){return "Gratulujem! Dokončil si úlohu "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulujem! Dokončil si úlohu "+common_locale.v(d,"puzzleNumber")+" a vyhral "+common_locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofejí"})+"."},
"nextPuzzle":function(d){return "Ďalšia skladačka"},
"nextStage":function(d){return "Gratulujem! Dokončil si "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulujem! Dokončil si "+common_locale.v(d,"stageName")+" a vyhral "+common_locale.p(d,"numTrophies",0,"sk",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofejí"})+"."},
"numBlocksNeeded":function(d){return "Gratulujem! Dokončil si úlohu "+common_locale.v(d,"puzzleNumber")+". (Avšak, mohol si použiť iba "+common_locale.p(d,"numBlocks",0,"sk",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" blokov"})+".)"},
"numLinesOfCodeWritten":function(d){return "Už si napísal "+common_locale.p(d,"numLines",0,"sk",{"one":"1 riadok","other":common_locale.n(d,"numLines")+" riadkov"})+" kódu!"},
"openWorkspace":function(d){return "Ako to funguje"},
"orientationLock":function(d){return "Vypni uzamknutie orientácie v nastaveniach prístroja."},
"play":function(d){return "hrať"},
"print":function(d){return "Tlačiť"},
"puzzleTitle":function(d){return "Úloha "+common_locale.v(d,"puzzle_number")+" z "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Len na prezeranie: "},
"repeat":function(d){return "opakovať"},
"resetProgram":function(d){return "Obnoviť"},
"rotateText":function(d){return "Otoč svoj prístroj."},
"runProgram":function(d){return "Spustiť"},
"runTooltip":function(d){return "Spustiť program definovaný blokmi v pracovnom priestore."},
"runtimeErrorMsg":function(d){return "Tvoj program sa nespustil úspešne. Odstráňte riadok "+common_locale.v(d,"lineNumber")+" a skúste znova."},
"saveToGallery":function(d){return "Ulož do galérie"},
"savedToGallery":function(d){return "Uložené do galérie!"},
"score":function(d){return "skóre"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Bohužiaľ tento program nie je možné zdieľať."},
"shareWarningsAge":function(d){return "Prosím zadajte sem svoj vek a pre pokračovanie kliknite na tlačidlo OK."},
"shareWarningsMoreInfo":function(d){return "Viac informácii"},
"shareWarningsStoreData":function(d){return "Táto aplikácia, postavená na Code Studio ukladá údaje, ktoré môžu byť videné s kýmkoľvek kto zdieľa tento odkaz, takže buďte opatrní, ak budete požiadaní o poskytnutie osobných informácií."},
"showBlocksHeader":function(d){return "Ukáž Bloky"},
"showCodeHeader":function(d){return "Zobraziť kód"},
"showGeneratedCode":function(d){return "Zobraziť kód"},
"showTextHeader":function(d){return "Ukázať text"},
"showToolbox":function(d){return "Zobraziť Nástroje"},
"showVersionsHeader":function(d){return "História verzie"},
"signup":function(d){return "Prihlásiť sa na úvodný kurz"},
"stringEquals":function(d){return "reťazec =?"},
"submit":function(d){return "Odoslať"},
"submitYourProject":function(d){return "Odovzdaj svoj projekt"},
"submitYourProjectConfirm":function(d){return "Po odovzdaní už nebudeš môcť upraviť svoj projekt, chceš ho odovzdať?"},
"unsubmit":function(d){return "Neodoslať"},
"unsubmitYourProject":function(d){return "Neodoslať projekt"},
"unsubmitYourProjectConfirm":function(d){return "Neodoslaný projekt zruší dátum pridania, naozaj neodoslať?"},
"subtitle":function(d){return "vizuálne programovacie prostredie"},
"syntaxErrorMsg":function(d){return "Tvoj program obsahuje preklep. Prosím odstráň riadok "+common_locale.v(d,"lineNumber")+" a skús znovu."},
"textVariable":function(d){return "text"},
"toggleBlocksErrorMsg":function(d){return "Musíš opraviť chybu vo tvojom programe predtým, než bude zobrazený v blokoch."},
"tooFewBlocksMsg":function(d){return "Používaš všetky potrebné typy blokov, ale skús použiť viac týchto blokov na dokončenie tejto úlohy."},
"tooManyBlocksMsg":function(d){return "Táto úloha môže byť vyriešená s <x id='START_SPAN'/><x id='END_SPAN'/> blokmi."},
"tooMuchWork":function(d){return "Spravil si mi veľa práce!  Mohol by si skúsiť opakovať menej krát?"},
"toolboxHeader":function(d){return "Bloky"},
"toolboxHeaderDroplet":function(d){return "Nástroje"},
"totalNumLinesOfCodeWritten":function(d){return "Celkovo: "+common_locale.p(d,"numLines",0,"sk",{"one":"1 riadok","other":common_locale.n(d,"numLines")+" riadkov"})+" kódu."},
"tryAgain":function(d){return "Skúsiť znova"},
"tryBlocksBelowFeedback":function(d){return "Skúste použiť niektorý z blokov kódu nižšie:"},
"tryHOC":function(d){return "Vyskúšaj Hodinu Kódu"},
"unnamedFunction":function(d){return "Máš premennú, alebo funkciu bez názvu. Nezabudni dať všetkému popisný názov."},
"wantToLearn":function(d){return "Chcete sa naučiť programovať?"},
"watchVideo":function(d){return "Pozrieť video"},
"when":function(d){return "keď"},
"whenRun":function(d){return "pri spustení"},
"workspaceHeaderShort":function(d){return "Pracovná plocha: "}};