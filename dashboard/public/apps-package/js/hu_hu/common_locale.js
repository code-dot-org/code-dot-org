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
"and":function(d){return "és"},
"backToPreviousLevel":function(d){return "Vissza az előző szintre"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokkok"},
"booleanFalse":function(d){return "hamis"},
"booleanTrue":function(d){return "igaz"},
"catActions":function(d){return "Műveletek"},
"catColour":function(d){return "Szín"},
"catLists":function(d){return "Listák"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Ciklusok"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkciók"},
"catText":function(d){return "szöveg"},
"catVariables":function(d){return "Változók"},
"clearPuzzle":function(d){return "Újrakezdés"},
"clearPuzzleConfirm":function(d){return "Visszaállítja a kiindulási állapotot és töröl minden blokkot, amit hozzáadtál a programhoz, vagy amit megváltoztattál."},
"clearPuzzleConfirmHeader":function(d){return "Biztosan újra szeretnéd kezdeni?"},
"codeMode":function(d){return "Kód"},
"codeTooltip":function(d){return "Lássuk a generált JavaScript kódot."},
"completedWithoutRecommendedBlock":function(d){return "Gratulálunk! Teljesítetted ezt a feladványt: "+common_locale.v(d,"puzzleNumber")+". (De használhatsz más blokkot egy elegánsabb kódhoz.)"},
"continue":function(d){return "Tovább"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Nézd meg, mit csináltam"},
"designMode":function(d){return "Megjelenés"},
"dialogCancel":function(d){return "Mégsem"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "Kelet"},
"directionNorthLetter":function(d){return "Észak"},
"directionSouthLetter":function(d){return "Dél"},
"directionWestLetter":function(d){return "Nyugat"},
"dropletBlock_addOperator_description":function(d){return "Adjon meg két értéket"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "ÉS logikai operátor"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Calls a named function that takes no parameters"},
"dropletBlock_callMyFunction_n_description":function(d){return "Calls a named function that takes one or more parameters"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Call a function with parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Függvény meghívása"},
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
"dropletBlock_mathRandom_description":function(d){return "Egy véletlenszerű számot ad 0-tól 1-ig, 0-t beleértve (inkluzív), de 1-et nem (exkluzív)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Mat.véletlen()"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "A legkisebb visszaadott szám"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "A legnagyobb visszaadott szám"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "eredmény"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "A funkció "+common_locale.v(d,"name")+" üres bemenettel rendelkezik."},
"emptyBlockInVariable":function(d){return "A változó "+common_locale.v(d,"name")+" üres bemenettel rendelkezik."},
"emptyBlocksErrorMsg":function(d){return "Ahhoz hogy az \"Ismételd\" vagy a \"Ha\" blokkok működjenek, más blokkoknak is kell bennük lenni. Győződj meg arról, hogy a belső blokk megfelelően illeszkedik a külső befogadó blokkhoz."},
"emptyExampleBlockErrorMsg":function(d){return "Legalább két példára van szükséged a funkcióban "+common_locale.v(d,"functionName")+". Győződj meg róla, hogy mindkettőben van hívás és visszatérési érték."},
"emptyFunctionBlocksErrorMsg":function(d){return "A függvény blokkon belül lenni kell más blokkoknak is ahhoz, hogy működjön."},
"emptyFunctionalBlock":function(d){return "Van egy blokkod kitöltetlen bemenettel."},
"emptyTopLevelBlock":function(d){return "Nincs blokk a futtatáshoz. Hozzá kell adnod egy "+common_locale.v(d,"topLevelBlockName")+" blokkot."},
"end":function(d){return "vége"},
"errorEmptyFunctionBlockModal":function(d){return "A függvénydeklarációdban blokkoknak kell lenni. Kattints a \"szerkesztés\" gombra, és húzd be a blokkokat a zöld blokkba."},
"errorIncompleteBlockInFunction":function(d){return "Kattints a \"szerkesztés\"-re, hogy pótold az esetlegesen hiányzó blokkokat a függvénydeklarációdból."},
"errorParamInputUnattached":function(d){return "Ne felejts a munkaterületen levő függvények minden bemenő paraméteréhez egy blokkot illeszteni."},
"errorQuestionMarksInNumberField":function(d){return "Próbálj a \"???\" helyére értéket írni."},
"errorRequiredParamsMissing":function(d){return "Hozz létre egy paramétert a függvényed számára a \"szerkesztés\"-re kattintva, és hozzáadva a szükséges paramétereket! Húzd az új paraméterblokkokat a függvénydeklarációdra!"},
"errorUnusedFunction":function(d){return "Létrehoztál egy függvényt, de soha sem használtad fel azt a munkaterületeden! Kattints a \"Függvények\"-re az eszközkészleten, és győződj meg róla, hogy használod a függvényt a programodban."},
"errorUnusedParam":function(d){return "Hozzáadtál egy paraméterblokkot, de nem használtad fel azt a deklarálásodban. Győződj meg róla, hogy használod a paraméteredet, rákattintva a \"szerkesztés\"-re  és arról is, hogy bele van-e illesztve a paraméterblokkod a zöld blokkba!"},
"exampleErrorMessage":function(d){return "A funkció "+common_locale.v(d,"functionName")+" egy vagy több példával is rendelkezik, melyet módosítanod kell. Győződj meg róla, hogy a meghatározás és a válasz a kérdésre egyezik."},
"examplesFailedOnClose":function(d){return "Egy vagy több példa nem egyezik meg a meghatározásokkal. Ellenőrizni kell bezárás előtt a példákat"},
"extraTopBlocks":function(d){return "Vannak nem csatolt blokkjaid."},
"extraTopBlocksWhenRun":function(d){return "Vannak nem csatolt blokkjaid. Úgy véled, hogy ezeket a blokkokat \"futtatáskor\" csatolod?"},
"finalStage":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt."},
"finalStageTrophies":function(d){return "Gratulálok! Teljesítetted az utolsó szakaszt és nyertél "+common_locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":common_locale.n(d,"numTrophies")+" trófeát"})+"."},
"finish":function(d){return "Kész"},
"generatedCodeInfo":function(d){return "Még a legjobb egyetemeken (pl. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+") is tanítanak blokk alapú programozást, de a felszín alatt az általad összeállított blokkok is megjeleníthetők JavaScriptben, a világ legszélesebb körben használt programozási nyelvén:"},
"hashError":function(d){return "Sajnálom, de \"%1\" nem felel meg egyetlen mentett programnak sem."},
"help":function(d){return "Segítség"},
"hideToolbox":function(d){return "(Elrejtés)"},
"hintHeader":function(d){return "Itt egy ötlet:"},
"hintRequest":function(d){return "Segítség"},
"hintTitle":function(d){return "Tanács:"},
"ignore":function(d){return "Mellőzd"},
"infinity":function(d){return "Végtelen"},
"jump":function(d){return "Ugorj"},
"keepPlaying":function(d){return "Folytasd"},
"levelIncompleteError":function(d){return "Minden szükséges blokkot felhasználtál, de nem megfelelően."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Készíts saját Flappy játékot"},
"missingRecommendedBlocksErrorMsg":function(d){return "Majdnem jó, de inkább próbáld meg egy olyan blokkal, amit eddig még nem használtál."},
"missingRequiredBlocksErrorMsg":function(d){return "Nem egészen. Használnod kell egy elemet, amit nem használtál még."},
"nestedForSameVariable":function(d){return "Ugyanaz a változó két vagy több egymásba ágyazott cikluson belül van használva. Használjon egyedi változóneveket a végtelen ciklusok elkerülése végett."},
"nextLevel":function(d){return "Gratulálok! Megoldottad a "+common_locale.v(d,"puzzleNumber")+". feladványt."},
"nextLevelTrophies":function(d){return "Gratulálok! Megoldottad a "+common_locale.v(d,"puzzleNumber")+". feladványt és nyertél "+common_locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":common_locale.n(d,"numTrophies")+" trófeát"})+"."},
"nextPuzzle":function(d){return "Következő feladvány"},
"nextStage":function(d){return "Gratulálok! Teljesítetted a(z) "+common_locale.v(d,"stageName")+" szakaszt."},
"nextStageTrophies":function(d){return "Gratulálok! Teljesítetted a(z) "+common_locale.v(d,"stageNumber")+". szintet és nyertél "+common_locale.p(d,"numTrophies",0,"hu",{"one":"egy trófeát","other":common_locale.n(d,"numTrophies")+" trófeát"})+"."},
"numBlocksNeeded":function(d){return "Gratulálok! Megoldottad a "+common_locale.v(d,"puzzleNumber")+". feladványt. (Habár megoldható csupán "+common_locale.p(d,"numBlocks",0,"hu",{"one":"1 blokk","other":common_locale.n(d,"numBlocks")+" blokk"})+" használatával.)"},
"numLinesOfCodeWritten":function(d){return "Éppen most írtál újabb "+common_locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":common_locale.n(d,"numLines")+" sor"})+" kódot!"},
"openWorkspace":function(d){return "Hogyan is működik"},
"orientationLock":function(d){return "Kapcsold ki a tájolási zárat az eszközbeállításokban."},
"play":function(d){return "lejátszás"},
"print":function(d){return "Nyomtatás"},
"puzzleTitle":function(d){return common_locale.v(d,"puzzle_number")+"/"+common_locale.v(d,"stage_total")+". feladvány"},
"readonlyWorkspaceHeader":function(d){return "Csak megtekinteni: "},
"repeat":function(d){return "ismételd"},
"resetProgram":function(d){return "Visszaállítás"},
"rotateText":function(d){return "Fordítsd el a készüléked."},
"runProgram":function(d){return "Futtatás"},
"runTooltip":function(d){return "A munkalapon összeépített program futtatása."},
"runtimeErrorMsg":function(d){return "A program nem fut megfelelően. Kérjük, távolítsa el a(z) "+common_locale.v(d,"lineNumber")+"-ik sort, és próbálkozzon újra."},
"saveToGallery":function(d){return "Mentés a galériába"},
"savedToGallery":function(d){return "Elmentve a galériába!"},
"score":function(d){return "pontszám"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Sajnálom, de nem tudjuk megosztani ezt a programot."},
"shareWarningsAge":function(d){return "Kérem adja meg az életkorát az alábbi mezőben, és kattintson az OK gombra a folytatáshoz."},
"shareWarningsMoreInfo":function(d){return "További információ"},
"shareWarningsStoreData":function(d){return "Ez a Kód Studióban készült app adatokat tárol, amelyeket bárki megtekinthet az adott megosztási linken, ezért legyünk óvatosak, ha a személyes adatokat kérünk be."},
"showBlocksHeader":function(d){return "Blokkok megjelenítése"},
"showCodeHeader":function(d){return "Kód megjelenítése"},
"showGeneratedCode":function(d){return "Kód megjelenítése"},
"showTextHeader":function(d){return "Szöveg megjelenítése"},
"showToolbox":function(d){return "Eszközkészlet megjelenítése"},
"showVersionsHeader":function(d){return "Verziók"},
"signup":function(d){return "Regisztrálj a bevezető képzésre"},
"stringEquals":function(d){return "string =?"},
"submit":function(d){return "Elküldés"},
"submitYourProject":function(d){return "Projekt küldése"},
"submitYourProjectConfirm":function(d){return "Nem szerkesztheti a projektet, miután beküldte azt, tényleg beküldi?"},
"unsubmit":function(d){return "Visszavon"},
"unsubmitYourProject":function(d){return "Projekt elküldésének visszavonása"},
"unsubmitYourProjectConfirm":function(d){return "A visszavonás törli az elküldés dátumát. Biztosan visszavonod?"},
"subtitle":function(d){return "vizuális programozási felület"},
"syntaxErrorMsg":function(d){return "A program gépelési hibát tartalmaz. Kérlek távolítsd el a "+common_locale.v(d,"lineNumber")+" sort és próbáld újra."},
"textVariable":function(d){return "szöveg"},
"toggleBlocksErrorMsg":function(d){return "Ki kell javítanod egy hibát a programodban, mielőtt blokként megjelenhetne."},
"tooFewBlocksMsg":function(d){return "A megfelelő blokkokat használod, de próbálj meg többet használni belőlük, hogy megoldd a feladványt."},
"tooManyBlocksMsg":function(d){return "Ez a feladvány megoldható <x id='START_SPAN'/><x id='END_SPAN'/> blokkal."},
"tooMuchWork":function(d){return "Sokat dolgoztattál. Megpróbálnád egy kicsit kevesebb ismétléssel?"},
"toolboxHeader":function(d){return "blokkok"},
"toolboxHeaderDroplet":function(d){return "Eszközkészlet"},
"totalNumLinesOfCodeWritten":function(d){return "Összesített eredmény: "+common_locale.p(d,"numLines",0,"hu",{"one":"1 sor","other":common_locale.n(d,"numLines")+" sor"})+" kód."},
"tryAgain":function(d){return "Próbáld újra"},
"tryBlocksBelowFeedback":function(d){return "Próbáld inkább ezeket a blokkokat:"},
"tryHOC":function(d){return "Próbáld ki a Kódolás Óráját"},
"unnamedFunction":function(d){return "Az egyik változónak vagy függvénynek nem adtál nevet. Ne felejts el mindennek beszédes elnevezést adni!"},
"wantToLearn":function(d){return "Szeretnél megtanulni programozni?"},
"watchVideo":function(d){return "Nézd meg a videót"},
"when":function(d){return "amikor"},
"whenRun":function(d){return "futtatáskor"},
"workspaceHeaderShort":function(d){return "Munkaterület: "}};