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
"and":function(d){return "ja"},
"backToPreviousLevel":function(d){return "Takaisin edelliseen tasoon"},
"blocklyMessage":function(d){return "Blocky"},
"blocks":function(d){return "lohkot"},
"booleanFalse":function(d){return "epätosi"},
"booleanTrue":function(d){return "tosi"},
"catActions":function(d){return "Toiminnot"},
"catColour":function(d){return "Väri"},
"catLists":function(d){return "Listat"},
"catLogic":function(d){return "Logiikka"},
"catLoops":function(d){return "Silmukat"},
"catMath":function(d){return "Matematiikka"},
"catProcedures":function(d){return "Funktiot"},
"catText":function(d){return "teksti"},
"catVariables":function(d){return "Muuttujat"},
"clearPuzzle":function(d){return "Aloita alusta"},
"clearPuzzleConfirm":function(d){return "Tehtävä palautetaan alkutilaan, ja lisäämäsi tai muuttamasi lohkot poistetaan."},
"clearPuzzleConfirmHeader":function(d){return "Oletko varma, että haluat aloittaa alusta?"},
"codeMode":function(d){return "Koodi"},
"codeTooltip":function(d){return "Näytä tuotettu JavaScript-koodi."},
"completedWithoutRecommendedBlock":function(d){return "Onnittelut! Ratkaisit tehtävän "+common_locale.v(d,"puzzleNumber")+". (Voisit kuitenkin käyttää eri palikkaa luodaksesi vielä voimakkaampaa koodia.)"},
"continue":function(d){return "Jatka"},
"copy":function(d){return "Kopioi"},
"defaultTwitterText":function(d){return "Katso mitä tein"},
"designMode":function(d){return "Suunnittelu"},
"dialogCancel":function(d){return "Peru"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "I"},
"directionNorthLetter":function(d){return "P"},
"directionSouthLetter":function(d){return "E"},
"directionWestLetter":function(d){return "L"},
"dropletBlock_addOperator_description":function(d){return "Lisää kaksi numeroa"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "arvo"},
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
"dropletBlock_mathRandom_description":function(d){return "Palauttaa satunnaisluvun. Luku valitaan nollan ja yhden väliltä, mutta kuitenkin niin että luku 1 ei kuulu lukualueeseen."},
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
"dropletBlock_randomNumber_param0_description":function(d){return "Pienin palautettu luku"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Suurin palautettu luku"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "palauta"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while-silmukka"},
"emptyBlockInFunction":function(d){return "Funktion "+common_locale.v(d,"name")+" syötettä ei ole annettu."},
"emptyBlockInVariable":function(d){return "Muuttujan "+common_locale.v(d,"name")+" syötettä ei ole annettu."},
"emptyBlocksErrorMsg":function(d){return "\"Toista\" ja \"Jos\"-lohkot tarvitsevat toisen lohkon sisäänsä toimiakseen. Varmista, että sisempi lohko asettuu oikein ulompaan lohkoon."},
"emptyExampleBlockErrorMsg":function(d){return "Tarvitset ainakin kaksi esimerkkiä funktiossa "+common_locale.v(d,"functionName")+". Pidä huolta, että jokaisessa esimerkissä on funktiokutsu ja paluuarvo."},
"emptyFunctionBlocksErrorMsg":function(d){return "Lisää Funktio-lohkon sisään muita lohkoja saadaksesi koodi toimimaan oikein."},
"emptyFunctionalBlock":function(d){return "Sinulla on lohko, josta puuttuu syöte."},
"emptyTopLevelBlock":function(d){return "Ei ole suoritettavia lohkoja. Sinun täytyy liittää lohko "+common_locale.v(d,"topLevelBlockName")+" lohkoon."},
"end":function(d){return "loppu"},
"errorEmptyFunctionBlockModal":function(d){return "Funktiomäärittelysi sisällä täytyy olla lohkoja. Napsauta \"muokkaa\" ja raahaa lohkoja vihreän lohkon sisään."},
"errorIncompleteBlockInFunction":function(d){return "Napsauta \"muokkaa\" varmistaaksesi että sinulta ei puutu lohkoja funktion määritelmän sisältä."},
"errorParamInputUnattached":function(d){return "Muista liittää lohko jokaiseen syöteparametriin työtilasi funktiolohkossa."},
"errorQuestionMarksInNumberField":function(d){return "Korvaa \"???\" arvolla."},
"errorRequiredParamsMissing":function(d){return "Luo funktiollesi parametri painamalla \"muokkaa\" ja lisäämällä tarpeelliset parametrit. Raahaa uudet parametrilohkot funktiomäärittelyysi."},
"errorUnusedFunction":function(d){return "Teit Funktion, mutta et koskaan käyttänyt sitä työtilassasi! Napsauta \"Funktiot\" työkaluissa ja varmista että käytät sitä ohjelmassasi."},
"errorUnusedParam":function(d){return "Lisäsit parametrilohkon, mutta et käyttänyt sitä määrittelyssä. Varmista että käytät parametrejäsi napsauttamalla \"muokkaa\" ja laittamalla parametrilohko vihreän lohkon sisään."},
"exampleErrorMessage":function(d){return "Funktiolla "+common_locale.v(d,"functionName")+" on yksi tai useampi esimerkki, jotka tarvitsevat muokkaamista. Tarkista, että ne vastaavat määritelmää ja vastaavat kysymykseen."},
"examplesFailedOnClose":function(d){return "Yksi tai useampi esimerkeistäsi ei vastaa määritelmääsi. Tarkista esimerkkisi ennen sulkemista."},
"extraTopBlocks":function(d){return "Sinulla on kiinnittämättömiä lohkoja."},
"extraTopBlocksWhenRun":function(d){return "Sinulla on kiinnittämättömiä lohkoja. Oliko tarkoituksenasi kiinnittää ne \"suoritettaessa\"-lohkoon?"},
"finalStage":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen vaiheen."},
"finalStageTrophies":function(d){return "Onneksi olkoon! Olet suorittanut viimeisen vaiheen ja voittanut "+common_locale.p(d,"numTrophies",0,"fi",{"one":"pokaalin","other":common_locale.n(d,"numTrophies")+" pokaalia"})+"."},
"finish":function(d){return "Valmis"},
"generatedCodeInfo":function(d){return "Jopa huippuyliopistot opettavat lohkopohjaista ohjelmointia (esim. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"), mutta konepellin alla kokoamasi lohkot voidaan näyttää myös esim. JavaScript-kielellä. JavaScript on maailman eniten käytetty ohjelmointikieli:"},
"hashError":function(d){return "Valitan, '%1' ei vastaa mitään tallennettua ohjelmaa."},
"help":function(d){return "Ohje"},
"hideToolbox":function(d){return "(Piilota)"},
"hintHeader":function(d){return "Tässä on Vihje:"},
"hintRequest":function(d){return "Katso vihje"},
"hintTitle":function(d){return "Vihje:"},
"ignore":function(d){return "Hylkää"},
"infinity":function(d){return "Ääretön"},
"jump":function(d){return "hyppää"},
"keepPlaying":function(d){return "Jatka pelaamista"},
"levelIncompleteError":function(d){return "Käytät kaikkia oikeanlaisia lohkoja, mutta et oikealla tavalla."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Tee oma Flappy-pelisi"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ei aivan. Kokeile käyttää palikkaa, jota et ole vielä käyttänyt."},
"missingRequiredBlocksErrorMsg":function(d){return "Ei aivan. Sinun täytyy käyttää palikkaa, jota et ole vielä käyttänyt."},
"nestedForSameVariable":function(d){return "Käytät samaa muuttujaa kahdessa tai useammassa sisäkkäisessä silmukassa. Käytä yksilöllisiä muuttujannimiä, jotta vältät ikuiset silmukat."},
"nextLevel":function(d){return "Onneksi olkoon! Olet suorittanut "+common_locale.v(d,"puzzleNumber")+". tehtävän."},
"nextLevelTrophies":function(d){return "Oneness olkoon! Let suorittanut tehtävän "+common_locale.v(d,"puzzleNumber")+" ja voittanut "+common_locale.p(d,"numTrophies",0,"fi",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Seuraava ongelma"},
"nextStage":function(d){return "Onnittelut! Olet suorittanut tason "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Onnittelut! Olet suorittanut tason "+common_locale.v(d,"stageName")+" ja voitit "+common_locale.p(d,"numTrophies",0,"fi",{"one":"pokaalin","other":common_locale.n(d,"numTrophies")+" pokaalia"})+"."},
"numBlocksNeeded":function(d){return "Onneksi olkoon! Olet suorittanut "+common_locale.v(d,"puzzleNumber")+". pulman (olisit tosin voinut käyttää vain "+common_locale.p(d,"numBlocks",0,"fi",{"one":"yhden lohkon","other":common_locale.n(d,"numBlocks")+" lohkoa"})+")."},
"numLinesOfCodeWritten":function(d){return "Kirjoitit juuri "+common_locale.p(d,"numLines",0,"fi",{"one":"yhden rivin","other":common_locale.n(d,"numLines")+" riviä"})+" koodia!"},
"openWorkspace":function(d){return "Miten se toimii"},
"orientationLock":function(d){return "Poista laitteesi asentolukko."},
"play":function(d){return "pelaa"},
"print":function(d){return "Tulosta"},
"puzzleTitle":function(d){return "Tehtävä "+common_locale.v(d,"puzzle_number")+" / "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Näytä vain: "},
"repeat":function(d){return "toista"},
"resetProgram":function(d){return "Alusta"},
"rotateText":function(d){return "Käännä laitettasi."},
"runProgram":function(d){return "Suorita"},
"runTooltip":function(d){return "Suorittaa työtilassa olevien lohkojen määrittämän ohjelman."},
"runtimeErrorMsg":function(d){return "Ohjelmasi suoritus ei onnistunut. Poista rivi "+common_locale.v(d,"lineNumber")+" ja kokeile uudelleen."},
"saveToGallery":function(d){return "Tallenna galleriaan"},
"savedToGallery":function(d){return "Tallennettu galleriaan!"},
"score":function(d){return "pisteet"},
"sendToPhone":function(d){return "Lähetä puhelimeen"},
"shareFailure":function(d){return "Emme valitettavasti voi jakaa tätä ohjelmaa."},
"shareWarningsAge":function(d){return "Anna ikäsi alla ja jatka valitsemalla Ok."},
"shareWarningsMoreInfo":function(d){return "Lisätietoa"},
"shareWarningsStoreData":function(d){return "Tämä Code Studio -sovelma tallentaa dataa, jonka jokainen jaetun linkin saanut voi nähdä. Olethan varovainen, jos sinua pyydetään antamaan henkilökohtaisia tietoja."},
"showBlocksHeader":function(d){return "Näytä lohkot"},
"showCodeHeader":function(d){return "Näytä koodi"},
"showGeneratedCode":function(d){return "Näytä koodi"},
"showTextHeader":function(d){return "Näytä teksti"},
"showToolbox":function(d){return "Näytä työkalupakki"},
"showVersionsHeader":function(d){return "Versiohistoria"},
"signup":function(d){return "Rekisteröidy johdantokurssille"},
"stringEquals":function(d){return "merkkijono=?"},
"submit":function(d){return "Jatka"},
"submitYourProject":function(d){return "Lähetä projektisi."},
"submitYourProjectConfirm":function(d){return "Et voi muokata projektiasi lähetettyäsi sen. Haluatko varmasti lähettää sen?"},
"unsubmit":function(d){return "Peruuta lähetys"},
"unsubmitYourProject":function(d){return "Peruuta projektin lähettäminen."},
"unsubmitYourProjectConfirm":function(d){return "Projektin lähettämisen peruutus alustaa lähetyspäivän. Oletko varma että haluat peruuttaa lähetyksen?"},
"subtitle":function(d){return "visuaalinen ohjelmointiympäristö"},
"syntaxErrorMsg":function(d){return "Ohjelmassasi on kirjoitusvirhe. Poista rivi "+common_locale.v(d,"lineNumber")+" ja yritä uudelleen."},
"textVariable":function(d){return "teksti"},
"toggleBlocksErrorMsg":function(d){return "Sinun täytyy korjata virhe ohjelmassasi, ennen kuin se voidaan näyttää lohkoina."},
"tooFewBlocksMsg":function(d){return "Käytät kyllä kaikkia oikeanlaisia lohkoja, mutta yritä käyttää niitä lisää, jotta saat tehtävän ratkaistua."},
"tooManyBlocksMsg":function(d){return "Tämän tehtävän voi ratkaista <x id='START_SPAN'/><x id='END_SPAN'/> lohkolla."},
"tooMuchWork":function(d){return "Sait minut tekemään paljon töitä! Voisitko kokeilla samaa vähemmillä toistoilla?"},
"toolboxHeader":function(d){return "lohkot"},
"toolboxHeaderDroplet":function(d){return "Työkalupakki"},
"totalNumLinesOfCodeWritten":function(d){return "Kokonaismäärä: "+common_locale.p(d,"numLines",0,"fi",{"one":"yksi rivi","other":common_locale.n(d,"numLines")+" riviä"})+" koodia."},
"tryAgain":function(d){return "Yritä uudestaan"},
"tryBlocksBelowFeedback":function(d){return "Kokeile käyttää jotain allaolevista palikoista:"},
"tryHOC":function(d){return "Kokeile koodaustuntia"},
"unnamedFunction":function(d){return "Sinulla on muuttuja tai funktio, jolla ei ole nimeä. Muista nimetä ne kuvaavalla nimellä."},
"wantToLearn":function(d){return "Haluatko oppia koodaamaan?"},
"watchVideo":function(d){return "Katso video"},
"when":function(d){return "kun"},
"whenRun":function(d){return "suoritettaessa"},
"workspaceHeaderShort":function(d){return "Työtila: "},
"hintPrompt":function(d){return "Need help?"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"}};