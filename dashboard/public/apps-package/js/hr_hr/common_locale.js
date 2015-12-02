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
"and":function(d){return "i"},
"backToPreviousLevel":function(d){return "Povratak na prethodni nivo"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokovi"},
"booleanFalse":function(d){return "netočno"},
"booleanTrue":function(d){return "točno"},
"catActions":function(d){return "Akcije"},
"catColour":function(d){return "Boja"},
"catLists":function(d){return "Liste"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Petlje"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Varijable"},
"clearPuzzle":function(d){return "Počni ispočetka"},
"clearPuzzleConfirm":function(d){return "Ovo će vratiti zadatak na početno stanje i izbrisati sve blokove koje ste dodali ili promijenili."},
"clearPuzzleConfirmHeader":function(d){return "Jeste li sigurni da želite početi iznova?"},
"codeMode":function(d){return "Kôd"},
"codeTooltip":function(d){return "Pogledaj stvoreni JavaScript kôd."},
"completedWithoutRecommendedBlock":function(d){return "Congratulations! You completed Puzzle "+common_locale.v(d,"puzzleNumber")+". (But you could use a different block for stronger code.)"},
"continue":function(d){return "Nastavi"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Pogledaj što sam napravio"},
"designMode":function(d){return "Dizajn"},
"dialogCancel":function(d){return "Odustani"},
"dialogOK":function(d){return "U redu"},
"directionEastLetter":function(d){return "Istok"},
"directionNorthLetter":function(d){return "Sjever"},
"directionSouthLetter":function(d){return "Jug"},
"directionWestLetter":function(d){return "Zapad"},
"dropletBlock_addOperator_description":function(d){return "Dodati dva broja"},
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
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Stvori varijablu i inicijaliziraj ju kao polje"},
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
"dropletBlock_divideOperator_description":function(d){return "Podijeliti dva broja"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test za jednakost"},
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
"dropletBlock_mathRandom_description":function(d){return "Returns a random number ranging from 0 (inclusive) up to but not including 1 (exclusive)"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "vrati"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funkcija "+common_locale.v(d,"name")+" ima nepopunjeno polje za unos."},
"emptyBlockInVariable":function(d){return "Varijabla "+common_locale.v(d,"name")+" ima nepopunjeno polje za unos."},
"emptyBlocksErrorMsg":function(d){return "Da bi blokovi \"Ponovi\" ili \"Ako\" radili, u njih treba ugraditi druge blokove. Provjeri uklapa li se unutarnji blok pravilno u vanjski blok."},
"emptyExampleBlockErrorMsg":function(d){return "Trebate najmanje dva primjera u funkciji "+common_locale.v(d,"functionName")+". Provjerite da svaki primjer ima poziv i rezultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funkcijski blok treba unutra imati druge blokove da bi mogao raditi."},
"emptyFunctionalBlock":function(d){return "Imate blok s neispunjenom ulaznom vrijednosti."},
"emptyTopLevelBlock":function(d){return "Nemate blokove za pokretanje. Blok mora spojiti na "+common_locale.v(d,"topLevelBlockName")+" blok."},
"end":function(d){return "kraj"},
"errorEmptyFunctionBlockModal":function(d){return "Mora se staviti blokove unutar definicije funkcije. Klikni na \"uredi\" i dovuci blokove unutar zelenog bloka."},
"errorIncompleteBlockInFunction":function(d){return "Klikni na \"uredi\" da budeš siguran da nijedan blok ne nedostaje unutar tvoje definicije funkcije."},
"errorParamInputUnattached":function(d){return "Sjeti se da prikačiš blok za svaki unos parametara na bloku funkcije na svojoj radnoj površini."},
"errorQuestionMarksInNumberField":function(d){return "Pokušaj zamijeniti \"???\" s vrijednošću."},
"errorRequiredParamsMissing":function(d){return "Napravi parametar za svoju funkciju tako da klikneš na \"uredi\" i dodaš neophodne parametre. Dovuci nove blokove parametara u svoju definiciju funkcije."},
"errorUnusedFunction":function(d){return "Napravio si funkciju, ali je nikad nisi koristio na svojoj radnoj površini! Klikni na \"Funkcije\" na alatnoj traci i pobrini se da je iskoristiš u svom programu."},
"errorUnusedParam":function(d){return "Dodao si blok parametara, ali ga nisi koristio u definiciji. Pobrini se da koristiš svoj parametar tako da klikneš na \"uredi\" i staviš blok parametara unutar zelenog bloka."},
"exampleErrorMessage":function(d){return "Funkcija "+common_locale.v(d,"functionName")+" ima jedan ili više primjera koje treba prilagoditi. Provjerite odgovaraju li vašoj definiciji te odgovorite na pitanje."},
"examplesFailedOnClose":function(d){return "Jedan ili više od vaših primjera ne odgovaraju vašoj definiciji. Provjerite svoje primjere prije zatvaranja"},
"extraTopBlocks":function(d){return "Imate blokove koji nisu spojeni."},
"extraTopBlocksWhenRun":function(d){return "Imate blokove koji nisu spojeni. Da li ste ih htjeli spojiti sa blokom za evaluaciju?"},
"finalStage":function(d){return "Čestitamo! Posljednja etapa je završena."},
"finalStageTrophies":function(d){return "Čestitamo! Završena je posljednja etapa i osvajaš "+common_locale.p(d,"numTrophies",0,"hr",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"finish":function(d){return "Kraj"},
"generatedCodeInfo":function(d){return "Čak i vrhunska sveučilišta podučavaju kodiranje pomoću blokova (npr. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Ali u suštini, blokovi koje si spojio se mogu prikazati kao kôd u JavaScriptu, najkorištenijem programskom jeziku na svijetu:"},
"hashError":function(d){return "Nažalost, '%1' ne odgovara nijednom spremljenom programu."},
"help":function(d){return "Pomoć"},
"hideToolbox":function(d){return "(Sakrij)"},
"hintHeader":function(d){return "Evo savjeta:"},
"hintRequest":function(d){return "Pogledaj naputak"},
"hintTitle":function(d){return "Savjet:"},
"ignore":function(d){return "Zanemari"},
"infinity":function(d){return "Beskonačnost"},
"jump":function(d){return "skoči"},
"keepPlaying":function(d){return "Nastaviti igrati"},
"levelIncompleteError":function(d){return "Koristiš sve potrebne vrste blokova, ali na pogrešan način."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Napravi vlastitu Flappy igricu"},
"missingRecommendedBlocksErrorMsg":function(d){return "Not quite. Try using a block you aren’t using yet."},
"missingRequiredBlocksErrorMsg":function(d){return "Not quite. You have to use a block you aren’t using yet."},
"nestedForSameVariable":function(d){return "Koristite istu varijablu unutar dviju ili više ugniježđenih petlji. Korištenjem jedinstvenih naziva varijabli izbjeći ćete beskonačne petlje."},
"nextLevel":function(d){return "Čestitamo! Zadatak "+common_locale.v(d,"puzzleNumber")+" je riješen."},
"nextLevelTrophies":function(d){return "Čestitamo! Riješivši Zadatak "+common_locale.v(d,"puzzleNumber")+" osvajaš "+common_locale.p(d,"numTrophies",0,"hr",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"nextPuzzle":function(d){return "Sljedeći zadatak"},
"nextStage":function(d){return "Čestitke! Završio si "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Čestitamo! Završio si etapu "+common_locale.v(d,"stageName")+" i osvojio "+common_locale.p(d,"numTrophies",0,"hr",{"one":"trofej","other":common_locale.n(d,"numTrophies")+" trofeja"})+"."},
"numBlocksNeeded":function(d){return "Čestitamo! Zadatak "+common_locale.v(d,"puzzleNumber")+" je riješen. (Međutim, moglo se iskoristiti samo "+common_locale.p(d,"numBlocks",0,"hr",{"one":"1 blok","other":common_locale.n(d,"numBlocks")+" blokova"})+".)"},
"numLinesOfCodeWritten":function(d){return "Upravo si napisao "+common_locale.p(d,"numLines",0,"hr",{"one":"1 liniju","other":common_locale.n(d,"numLines")+" linija"})+" kôda!"},
"openWorkspace":function(d){return "Kako to radi"},
"orientationLock":function(d){return "U postavkama uređaja isključi blokadu orijentacije."},
"play":function(d){return "igraj"},
"print":function(d){return "Piši"},
"puzzleTitle":function(d){return "Zadatak "+common_locale.v(d,"puzzle_number")+" od "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Samo vidi: "},
"repeat":function(d){return "ponovi"},
"resetProgram":function(d){return "Ispočetka"},
"rotateText":function(d){return "Okreni svoj uređaj."},
"runProgram":function(d){return "Pokreni"},
"runTooltip":function(d){return "Pokreće program određen blokovima na radnom prostoru."},
"runtimeErrorMsg":function(d){return "Tvoj program se nije uspješno pokrenuo. Ukloni "+common_locale.v(d,"lineNumber")+". redak i pokušaj ponovno."},
"saveToGallery":function(d){return "Spremi u galeriju"},
"savedToGallery":function(d){return "Spremljeno u galeriju!"},
"score":function(d){return "bodovi"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Žalim, ne možemo dijeliti ovaj program."},
"shareWarningsAge":function(d){return "Ispod napiši koliko imaš godina i za nastavak klikni na 'U redu'."},
"shareWarningsMoreInfo":function(d){return "Više informacija"},
"shareWarningsStoreData":function(d){return "Ovaj program, napravljen pomoću Code Studio, mogu vidjeti svi koji imaju ovu poveznicu za dijeljenje, pa budi oprezan ako se od tebe traže tvoji osobni podaci."},
"showBlocksHeader":function(d){return "Pokaži Blokove"},
"showCodeHeader":function(d){return "Pokaži kôd"},
"showGeneratedCode":function(d){return "Pokaži kôd"},
"showTextHeader":function(d){return "Prikaži Tekst"},
"showToolbox":function(d){return "Pokaži Alate"},
"showVersionsHeader":function(d){return "Povijest inačica"},
"signup":function(d){return "Registrirajte se na početni tečaj"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Pošalji"},
"submitYourProject":function(d){return "Pošaljite svoj projekt"},
"submitYourProjectConfirm":function(d){return "Nakon slanja nećete moći više uređivati svoj projekt. Zbilja želite poslati?"},
"unsubmit":function(d){return "Poništi objavu"},
"unsubmitYourProject":function(d){return "Unsubmit your project"},
"unsubmitYourProjectConfirm":function(d){return "Unsubmitting your project will reset the submitted date, really unsubmit?"},
"subtitle":function(d){return "grafičko okruženje za programiranje"},
"syntaxErrorMsg":function(d){return "Vaš program sadrži grešku. Molimo uklonite redak "+common_locale.v(d,"lineNumber")+" i pokušajte ponovo."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Trebaš ispraviti greške u svom programu prije nego što može biti prikazan u obliku blokova."},
"tooFewBlocksMsg":function(d){return "Koristiš sve neophodne vrste blokova, ali za rješavanje ovog zadatka pokušaj koristiti više ovakvih blokova."},
"tooManyBlocksMsg":function(d){return "Ovaj zadatak se može riješiti s <x id='START_SPAN'/><x id='END_SPAN'/> blokova."},
"tooMuchWork":function(d){return "Napravio si puno posla za mene! Možeš li manje puta ponavljati?"},
"toolboxHeader":function(d){return "Blokovi"},
"toolboxHeaderDroplet":function(d){return "Alati"},
"totalNumLinesOfCodeWritten":function(d){return "Ukupno: "+common_locale.p(d,"numLines",0,"hr",{"one":"1 linija","other":common_locale.n(d,"numLines")+" linija"})+" kôda."},
"tryAgain":function(d){return "Pokušaj ponovno"},
"tryBlocksBelowFeedback":function(d){return "Try using one of the blocks below:"},
"tryHOC":function(d){return "Isprobaj Hour of Code"},
"unnamedFunction":function(d){return "Imate varijablu ili funkciju koje nema ime. Ne zaboravite svakom elementu dati opisni naziv."},
"wantToLearn":function(d){return "Želiš li naučiti programirati?"},
"watchVideo":function(d){return "Pogledaj filmić"},
"when":function(d){return "kada"},
"whenRun":function(d){return "pri pokretanju"},
"workspaceHeaderShort":function(d){return "Radna površina: "}};