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
"and":function(d){return "ir"},
"backToPreviousLevel":function(d){return "Grįžti į ankstesnį lygį"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokeliai"},
"booleanFalse":function(d){return "klaida"},
"booleanTrue":function(d){return "Taip"},
"catActions":function(d){return "Komandos"},
"catColour":function(d){return "Spalva"},
"catLists":function(d){return "Sąrašai"},
"catLogic":function(d){return "Logika"},
"catLoops":function(d){return "Kartojimas"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Komandų kūrimas"},
"catText":function(d){return "Tekstas"},
"catVariables":function(d){return "Kintamieji"},
"clearPuzzle":function(d){return "Pradėti iš naujo"},
"clearPuzzleConfirm":function(d){return "Visi tavo sudėlioti blokeliai bus panaikinti ir šį galvosūkį bus galima spręsti nuo pradžių."},
"clearPuzzleConfirmHeader":function(d){return "Ar tikrai norite pradėti iš naujo?"},
"codeMode":function(d){return "Kodavimas"},
"codeTooltip":function(d){return "Žiūrėti sukurtą JavaScript kodą."},
"completedWithoutRecommendedBlock":function(d){return "Sveikiname! Jūs pabaigėte galvosūkį "+common_locale.v(d,"puzzleNumber")+". (Bet galėjote panaudoti kitokius blokelius geresniam kodui.)"},
"continue":function(d){return "Tęsti"},
"copy":function(d){return "Copy"},
"defaultTwitterText":function(d){return "Pažiūrėkite, ką aš sukūriau"},
"designMode":function(d){return "Dizainas"},
"dialogCancel":function(d){return "Atšaukti"},
"dialogOK":function(d){return "Gerai"},
"directionEastLetter":function(d){return "R"},
"directionNorthLetter":function(d){return "Š"},
"directionSouthLetter":function(d){return "P"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Pridėti du skaičius"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Grąžina teisingą rezultatą tik tada, kai abu reiškiniai yra teisingi; klaidingą rezultatą, kai abu nėra teisingi"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Iškviečia funkciją be parametrų"},
"dropletBlock_callMyFunction_n_description":function(d){return "Iškviečia funkciją su vienu parametru"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Iškviečia funkciją su parametrais"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Iškviečia funkciją"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Pradiniai masyvo elementai"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Sukurti kintamąjį"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Sukurti kintamąjį"},
"dropletBlock_divideOperator_description":function(d){return "Padalinti du skaičius"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Dalybos operatorius"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Lygybės operatorius"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Sukurti funkciją su parametrais"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Sukurti funkciją"},
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
"dropletBlock_mathRandom_description":function(d){return "Grąžina atsitiktinį skaičių nuo 0 (imtinai) iki, bet neįskaitant 1 (išimtinai)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Matematika.atsitiktinis()"},
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
"dropletBlock_randomNumber_param0":function(d){return "mažiausias"},
"dropletBlock_randomNumber_param0_description":function(d){return "Grąžina mažiausią skaičių"},
"dropletBlock_randomNumber_param1":function(d){return "didžiausias"},
"dropletBlock_randomNumber_param1_description":function(d){return "Grąžina didžiausią skaičių"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "rezultatas = "},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funkcija "+common_locale.v(d,"name")+" turi neužpildytą įvestį."},
"emptyBlockInVariable":function(d){return "Kintamasis "+common_locale.v(d,"name")+" turi neužpildytą įvestį."},
"emptyBlocksErrorMsg":function(d){return "„Kartojimo“ arba „Jei“ blokelių viduje reikia įdėti kitus blokelius, kad jie veiktų. Įsitikink, kad jie yra gerai sukibę vienas su kitu."},
"emptyExampleBlockErrorMsg":function(d){return "Jums reikia bent dviejų pavyzdžių funkcijoje "+common_locale.v(d,"functionName")+". Įsitikinkite, kad kiekvienas pavyzdys turi funkcijos užklausą ir rezultatą."},
"emptyFunctionBlocksErrorMsg":function(d){return "Komandos apraše turi būti išvardintos komandos (įdėtas bent vienas blokas)."},
"emptyFunctionalBlock":function(d){return "Kažkuris blokelis yra tuščias."},
"emptyTopLevelBlock":function(d){return "Nėra blokų paleidimui. Jūs privalote pridėti bloką į "+common_locale.v(d,"topLevelBlockName")+" bloką."},
"end":function(d){return "pabaiga"},
"errorEmptyFunctionBlockModal":function(d){return "Tavo kuriamoje komandoje turi būti veiksmų. Spustelk \"taisyti\" ir įkelk veiksmų į žalią bloką."},
"errorIncompleteBlockInFunction":function(d){return "Spustelk \"taisyti\", kad įsitikintum, ar tavo kuriamoje komandoje netrūksta veiksmų."},
"errorParamInputUnattached":function(d){return "Naudodamas sukurtą komandą, neužmiršk duoti jai reikalingų duomenų - argumentų. Prikabink reikšmes prie atitinkmų komandos vietų."},
"errorQuestionMarksInNumberField":function(d){return "Pabandyk pakeisti \"???\" kokia nors reikšme."},
"errorRequiredParamsMissing":function(d){return "Norėdamas perduoti komandai duomenis, turi juos aprašyti - spausk \"redaguoti\" ir pridėk reikiamus argumentų laukelius. Nutempk \"naujų argumentų\" laukelius į kuriamos  komandos bloką."},
"errorUnusedFunction":function(d){return "Tu sukūrei naują komandą, bet jos nepanaudojai. Ją rasi kategorijoje \"Komandų kūrimas\"."},
"errorUnusedParam":function(d){return "Tu pridėjai argumento aprašą, bet argumento duomenų nenaudoji komandos veiksmuose..."},
"exampleErrorMessage":function(d){return "Funkcija "+common_locale.v(d,"functionName")+" turi vieną ar keletą pavyzdžių, kuriuos reikia pataisyti. Įsitikinkite, kad jie atitinka jūsų apibrėžimą ir atsako į klausimą."},
"examplesFailedOnClose":function(d){return "Vienas ar daugiau jūsų pavyzdžių neatitinka jūsų apibrėžimo. Patikrinkite savo pavyzdžius prieš uždarant"},
"extraTopBlocks":function(d){return "Tavo blokeliai nėra sujungti."},
"extraTopBlocksWhenRun":function(d){return "Tavo blokeliai nėra sujungti. Gal tu jų nesujungei su blokeliu „paleidus“?"},
"finalStage":function(d){return "Sveikinu! Tu baigei paskutinį etapą."},
"finalStageTrophies":function(d){return "Sveikinu! Tu užbaigei paskutinį lygį ir laimėjai "+common_locale.p(d,"numTrophies",0,"lt",{"one":"a trofėjų","other":common_locale.n(d,"numTrophies")+" trofėjus"})+"."},
"finish":function(d){return "Finišas"},
"generatedCodeInfo":function(d){return "Net ir aukščiausiai įvertinti universitetai Pasaulyje moko programavimo naudojant blokelius (pvz., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Tačiau tavo sudėlioti blokeliai gali būti atvaizduojami ir JavaScript - populiariausia programavimo kalba Pasaulyje:"},
"hashError":function(d){return "Atsiprašome, '%1' nesutampa su jokia įrašyta programa."},
"help":function(d){return "pagalba"},
"hideToolbox":function(d){return "(Slėpti)"},
"hintHeader":function(d){return "Štai patarimas:"},
"hintRequest":function(d){return "Užuomina"},
"hintTitle":function(d){return "Patarimas:"},
"ignore":function(d){return "Ignoruoti"},
"infinity":function(d){return "Begalybė"},
"jump":function(d){return "šok"},
"keepPlaying":function(d){return "Tęsti žaidimą"},
"levelIncompleteError":function(d){return "Tu naudoji visus būtinus blokelius, tačiau netinkamai."},
"listVariable":function(d){return "sąrašas"},
"makeYourOwnFlappy":function(d){return "Sukurk savo Flappy žaidimą"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ne visai. Bandykite panaudoti blokelį, kurio dar nenaudojote."},
"missingRequiredBlocksErrorMsg":function(d){return "Ne visai. Jūs turite panaudoti blokelį, kurio dar nenaudojote."},
"nestedForSameVariable":function(d){return "Jūs naudojate tą patį kintamąjį dviejuose ar daugiau, vienas į kitą įdėtų ciklų. Naudokite skirtingus kintamųjų pavadinimus, kad išvengti begalinių ciklų."},
"nextLevel":function(d){return "Sveikinu! Tu išsprendei galvosūkį "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Sveikinu! Užbaigėte galvosūkį "+common_locale.v(d,"puzzleNumber")+" ir laimėjote "+common_locale.p(d,"numTrophies",0,"lt",{"one":"trofėju","other":common_locale.n(d,"numTrophies")+" trofėjų"})+"."},
"nextPuzzle":function(d){return "Kitas Galvosukis"},
"nextStage":function(d){return "Sveikinu! Tu užbaigei "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Sveikinu! Tu užbaigei lygį "+common_locale.v(d,"stageName")+" ir laimėjai "+common_locale.p(d,"numTrophies",0,"lt",{"one":"trofėjų","other":common_locale.n(d,"numTrophies")+" trofėjus"})+"."},
"numBlocksNeeded":function(d){return "Sveikinu! Tu išsprendei "+common_locale.v(d,"puzzleNumber")+" užduotį. (Beje, galėjai panaudoti tik "+common_locale.p(d,"numBlocks",0,"lt",{"vieną":"1 blokelį","other":common_locale.n(d,"numBlocks")+" blokelių"})+".)"},
"numLinesOfCodeWritten":function(d){return "Tu parašei "+common_locale.p(d,"numLines",0,"lt",{"one":"1 eilutės","other":common_locale.n(d,"numLines")+" eilučių"})+" programą!"},
"openWorkspace":function(d){return "Kaip tai veikia"},
"orientationLock":function(d){return "Išjunk savo įrenginio ekrano pasukimą."},
"play":function(d){return "žaisti"},
"print":function(d){return "Spausdinti"},
"puzzleTitle":function(d){return "Užduotis "+common_locale.v(d,"puzzle_number")+" iš "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Rodyti tik: "},
"repeat":function(d){return "kartok"},
"resetProgram":function(d){return "Iš naujo"},
"rotateText":function(d){return "Pasuk savo įrenginį."},
"runProgram":function(d){return "Paleisti"},
"runTooltip":function(d){return "Paleisk programą, naudodamasis blokeliais."},
"runtimeErrorMsg":function(d){return "Jūsų programą įvykdyti sėkmingai nepavyko. Pašalinkite "+common_locale.v(d,"lineNumber")+" eilutę ir bandykite dar kartą."},
"saveToGallery":function(d){return "Įrašyti į galeriją"},
"savedToGallery":function(d){return "Įrašyta į galeriją!"},
"score":function(d){return "rezultatas"},
"sendToPhone":function(d){return "Send To Phone"},
"shareFailure":function(d){return "Deja, šios programos dalintis negalima."},
"shareWarningsAge":function(d){return "Prašome žemiau pateikti savo amžių ir spausti Gerai."},
"shareWarningsMoreInfo":function(d){return "Daugiau informacijos"},
"shareWarningsStoreData":function(d){return "Ši programėlė, sukurta su Code Sudio, saugo duomenis, kurie gali būti peržiūrėti visų, kas turi šią dalinimosi nuorodą, todėl būkite atsargūs jei jūsų prašo pateikti asmeninę informaciją."},
"showBlocksHeader":function(d){return "Rodyti blokus"},
"showCodeHeader":function(d){return "Rodyti kodą"},
"showGeneratedCode":function(d){return "Rodyti kodą"},
"showTextHeader":function(d){return "Parodyti tekstą"},
"showToolbox":function(d){return "Rodyti įrankinę"},
"showVersionsHeader":function(d){return "Versijos istorija"},
"signup":function(d){return "Užsiregistruok į kursą pradedantiesiems"},
"stringEquals":function(d){return "tekstas=?"},
"submit":function(d){return "Pateikti"},
"submitYourProject":function(d){return "Pateikite savo projektą"},
"submitYourProjectConfirm":function(d){return "Jūs nebegalėsite redaguoti savo projekto po pateikimo, ar tikrai pateikti?"},
"unsubmit":function(d){return "Atšaukti pateikimą"},
"unsubmitYourProject":function(d){return "Atšaukti projekto pateikimą"},
"unsubmitYourProjectConfirm":function(d){return "Atšaukus projekto pateikimą pasikeis ir pateikimo data, ar tikrai atšaukti?"},
"subtitle":function(d){return "Vizuali programavimo aplinka"},
"syntaxErrorMsg":function(d){return "Jūsų programoje yra rašybos klaida. Pašalinkite "+common_locale.v(d,"lineNumber")+" eilutę ir bandykite dar kartą."},
"textVariable":function(d){return "tekstas"},
"toggleBlocksErrorMsg":function(d){return "Programoje reikia ištaisyti klaidą, antraip ji nebus atvaizduojama blokeliais."},
"tooFewBlocksMsg":function(d){return "Tu naudoji visas reikiamas blokų rūšis, tačiau reikia panaudoti po daugiau kažkurių blokų."},
"tooManyBlocksMsg":function(d){return "Ši užduotis gali būti išspręsta su <x id='START_SPAN'/><x id='END_SPAN'/> blokais."},
"tooMuchWork":function(d){return "Tu privertei mane tiek daug dirbti! Ar galėtum atlikti užduotį su mažiau kartojimų?"},
"toolboxHeader":function(d){return "Blokeliai"},
"toolboxHeaderDroplet":function(d){return "Įrankinė"},
"totalNumLinesOfCodeWritten":function(d){return "Iš viso: "+common_locale.p(d,"numLines",0,"lt",{"one":"1 eilutė","other":common_locale.n(d,"numLines")+" eilučių"})+" kodo."},
"tryAgain":function(d){return "Pabandyk dar kartą"},
"tryBlocksBelowFeedback":function(d){return "Bandykite panaudoti vieną iš žemiau esančių blokelių:"},
"tryHOC":function(d){return "Išmėgink „Programavimo valandą“"},
"unnamedFunction":function(d){return "Turite napstovujį kintamąjį arba funkciją, kuri neturi pavadinimo. Nepamirškite suteikti viskam aprašomąjį pavadinimą."},
"wantToLearn":function(d){return "Nori išmokti programuoti?"},
"watchVideo":function(d){return "Peržiūrėk šį vaizdo įrašą"},
"when":function(d){return "kada"},
"whenRun":function(d){return "paleidus"},
"workspaceHeaderShort":function(d){return "Darbo laukas: "}};