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
"and":function(d){return "en"},
"backToPreviousLevel":function(d){return "Terug naar het vorige niveau"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokken"},
"booleanFalse":function(d){return "onwaar"},
"booleanTrue":function(d){return "waar"},
"catActions":function(d){return "Acties"},
"catColour":function(d){return "Kleur"},
"catLists":function(d){return "Lijsten"},
"catLogic":function(d){return "Logica"},
"catLoops":function(d){return "Lussen"},
"catMath":function(d){return "Wiskunde"},
"catProcedures":function(d){return "Functies"},
"catText":function(d){return "tekst"},
"catVariables":function(d){return "Variabelen"},
"clearPuzzle":function(d){return "Begin opnieuw"},
"clearPuzzleConfirm":function(d){return "Hiermee breng je de puzzel terug naar zijn beginstaat en verwijder je alle blokken die je toegevoegd of veranderd hebt."},
"clearPuzzleConfirmHeader":function(d){return "Weet je zeker dat je opnieuw wilt beginnen?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Zie gegenereerde JavaScript-code."},
"completedWithoutRecommendedBlock":function(d){return "Gefeliciteerd! U heeft puzzel "+common_locale.v(d,"puzzleNumber")+" voltooid. (Maar u kunt andere blokken gebruiken voor een betere code)"},
"continue":function(d){return "Verder"},
"defaultTwitterText":function(d){return "Kijk wat ik gemaakt heb"},
"designMode":function(d){return "Ontwerp"},
"dialogCancel":function(d){return "Annuleren"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "O"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "Z"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Twee getallen optellen"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Optel operator"},
"dropletBlock_andOperator_description":function(d){return "Geeft waar als resultaat indien beide voorwaarden waar zijn en onwaar indien dit niet het geval is"},
"dropletBlock_andOperator_signatureOverride":function(d){return "EN booleaanse operator"},
"dropletBlock_assign_x_description":function(d){return "Geeft een waarde aan een bestaande variabele. Bijvoorbeeld: x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "De naam van de variabele wordt toegewezen aan"},
"dropletBlock_assign_x_param1":function(d){return "waarde"},
"dropletBlock_assign_x_param1_description":function(d){return "De waarde van de variabele wordt toegewezen aan."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Een variabele toewijzen"},
"dropletBlock_callMyFunction_description":function(d){return "Roept een functie aan die geen parameters verwacht"},
"dropletBlock_callMyFunction_n_description":function(d){return "Roept een functie aan die een of meer parameters verwacht"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Een functie aanroepen met parameters"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Een functie aanroepen"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Maak een variabele en initialiseer hem als array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Declareert een variabele met de naam die na het woordje 'var' komt en wijst er de waarde aan rechterzijde van de expressie aan toe"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "een variabele maken en hier een waarde aan toekennen door een prompt weer te geven"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Een variabele declareren"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Een variabele declareren"},
"dropletBlock_divideOperator_description":function(d){return "Twee getallen delen"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Deel operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test of twee waarden gelijk zijn. Geeft waar terug als de waarde aan de linkerkant van de expressie gelijk is aan de waarde aan de rechterkant van de expressie, anders onwaar"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Gelijk aan operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Hiermee wordt een lus gemaakt die bestaat uit het opstarten van een expressie, een voorwaardelijke expressie, een oplopende expressie en een blok met uit te voeren instructies dat uitgevoerd wordt voor iedere iteratie in de lus"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for-lus"},
"dropletBlock_functionParams_n_description":function(d){return "Een set van instructies die één of meer parameters nodig heeft en een taak of berekening uitvoert wanneer de functie is aangeroepen"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definieer een functie met parameters"},
"dropletBlock_functionParams_none_description":function(d){return "Een reeks instructies waarmee een taak of berekening wordt uitgevoerd wanneer de functie wordt aangeroepen"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Een functie definiëren"},
"dropletBlock_getTime_description":function(d){return "Verkrijg de huidige tijd in milliseconden"},
"dropletBlock_greaterThanOperator_description":function(d){return "Test of een getal groter is dan een ander getal. Geeft waar terug als de waarde aan de linkerkant van de expressie groter is de waarde aan de rechterkant van de expressie"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Groter dan operator"},
"dropletBlock_ifBlock_description":function(d){return "Dit voert een blok van instructies uit wanneer aan een specifieke voorwaarde is voldaan"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "als-statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Voert een blok statements uit wanneer de aangegeven voorwaarde geldt; anders wordt het blok statements in het 'anders'-blok uitgevoerd"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "als/dan-statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test of twee waarden niet gelijk zijn. Geeft waar terug als de waarde aan de linkerkant van de expressie niet gelijk is aan de waarde aan de rechterkant van de expressie"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Ongelijk aan operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Test of een waarde kleiner is dan een andere waarde. Geeft waar terug als de waarde aan de linkerkant van de expressie kleiner is de waarde aan de rechterkant van de expressie"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Kleiner dan operator"},
"dropletBlock_mathAbs_description":function(d){return "Neemt de absolute waarde van x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Neemt de maximumwaarde van één of meer waarden n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Neemt de minimumwaarde van één of meer waarden n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Geeft een willekeurig nummer tussen 0 tot 1, waarbij 1 niet is inbegrepen"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Afronden op het dichtstbijzijnde gehele getal"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Twee getallen vermenigvuldigen"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Vermenigvuldig operator"},
"dropletBlock_notOperator_description":function(d){return "Geeft onwaar terug als de expressie evalueert naar waar, en geeft anders waar terug"},
"dropletBlock_notOperator_signatureOverride":function(d){return "NIET booleaanse operator"},
"dropletBlock_orOperator_description":function(d){return "Dit geeft waar terug als de expressie waar is, anders wordt onwaar teruggegeven"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OF booleaanse operator"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Het minimum getal geretourneerd"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Het maximum getal geretourneerd"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Geef een waarde terug uit een functie"},
"dropletBlock_return_signatureOverride":function(d){return "uitvoer"},
"dropletBlock_setAttribute_description":function(d){return "Stel in op de opgegeven waarde"},
"dropletBlock_subtractOperator_description":function(d){return "Twee getallen aftrekken"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Aftrek operator"},
"dropletBlock_whileBlock_description":function(d){return "Hiermee maak je een lus die bestaat uit een voorwaardelijke expressie en een blok instructies uitgevoerd voor elke iteratie van de lus. De lus gaat door met uitvoeren zolang de gestelde voorwaarde waar is"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "'while' lus"},
"emptyBlockInFunction":function(d){return "De functie "+common_locale.v(d,"name")+" is niet ingevoerd."},
"emptyBlockInVariable":function(d){return "De variabele "+common_locale.v(d,"name")+" is niet helemaal ingevoerd."},
"emptyBlocksErrorMsg":function(d){return "De \"herhaal\" of \"als\" blokken hebben andere blokken in zich nodig om te werken. Zorg ervoor dat het binnenste blok correct past in het buitenste blok."},
"emptyExampleBlockErrorMsg":function(d){return "U moet in ieder geval twee voorbeelden hebben in de functie "+common_locale.v(d,"functionName")+". Zorg ervoor dat elk voorbeeld een roeping en een resultaat heeft."},
"emptyFunctionBlocksErrorMsg":function(d){return "Het functie-blok moet andere blokken bevatten om te werken."},
"emptyFunctionalBlock":function(d){return "Je hebt een blok zonder waarde."},
"emptyTopLevelBlock":function(d){return "Er zijn geen blokken om uit te voeren. Je moet een blok aan de "+common_locale.v(d,"topLevelBlockName")+"blok plakken."},
"end":function(d){return "einde"},
"errorEmptyFunctionBlockModal":function(d){return "In je functie-definitie moeten blokken staan . Klik op \"bewerk\" en sleep blokken  het groene blok in."},
"errorIncompleteBlockInFunction":function(d){return "Klik \"bewerk\" en zorg ervoor dat je geen blokken mist in je functie-definitie."},
"errorParamInputUnattached":function(d){return "Denk er aan om aan iedere parameter input op het functieblok in je werkruimte een blok toe te voegen."},
"errorQuestionMarksInNumberField":function(d){return "Vervang \"???\" door een waarde."},
"errorRequiredParamsMissing":function(d){return "Maak een parameter voor je functie door op \"bewerk\" te klikken en de nodige parameters toe te voegen. Sleep de nieuwe parameter blok in je functie-definitie."},
"errorUnusedFunction":function(d){return "Je maakte een functie  maar gebruikte deze nooit in je werkruimte! Klik op \"Functies\" in de gereedschapskist en zorg ervoor dat je ze gebruikt in je programma."},
"errorUnusedParam":function(d){return "Je voegde een parameter blok toe maar gebruikte deze niet in je functie. Zorg ervoor dat je je parameter gebruikt door op \"bewerk\" te klikken en de parameter blok binnen de groene blok te plaatsen."},
"exampleErrorMessage":function(d){return "De functie "+common_locale.v(d,"functionName")+" heeft één of meer voorbeelden die moeten worden aangepast. Zorg ervoor dat ze overeenkomen met uw definitie en beantwoord dan de vraag."},
"examplesFailedOnClose":function(d){return "Een of meer van uw voorbeelden komen niet overeen met uw definitie. Controleer uw voorbeelden voordat u afsluit"},
"extraTopBlocks":function(d){return "Je hebt niet-gekoppelde blokken."},
"extraTopBlocksWhenRun":function(d){return "Je hebt niet-gekoppelde blokken. Was het de bedoeling om deze te koppelen aan het \"bij uitvoeren\"-blok?"},
"finalStage":function(d){return "Gefeliciteerd! Je hebt de laatste fase voltooid."},
"finalStageTrophies":function(d){return "Gefeliciteerd! U hebt de laatste fase voltooid en won "+common_locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":common_locale.n(d,"numTrophies")+" trofeeën"})+"."},
"finish":function(d){return "Voltooien"},
"generatedCodeInfo":function(d){return "Zelfs op topuniversiteiten wordt les gegevens met programmeertalen die op blokken zijn gebaseerd (bijv. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Maar onder de motorkap kunnen de blokken waarmee je een programma hebt gemaakt ook getoond worden in JavaScript, de programmeertaal die wereldwijd het meest wordt gebruikt:"},
"hashError":function(d){return "Sorry, '%1' komt niet overeen met een opgeslagen programma."},
"help":function(d){return "Hulp"},
"hideToolbox":function(d){return "(Verbergen)"},
"hintHeader":function(d){return "Een tip:"},
"hintRequest":function(d){return "Bekijk tip"},
"hintTitle":function(d){return "Tip:"},
"ignore":function(d){return "Negeren"},
"infinity":function(d){return "Oneindig"},
"jump":function(d){return "spring"},
"keepPlaying":function(d){return "Doorgaan met spelen"},
"levelIncompleteError":function(d){return "Je gebruikt alle soorten blokken die nodig zijn, maar niet op de juiste manier."},
"listVariable":function(d){return "lijst"},
"makeYourOwnFlappy":function(d){return "Maak je eigen 'Flappy'-spel"},
"missingRecommendedBlocksErrorMsg":function(d){return "Niet helemaal. Probeer een blok te gebruiken die u nog niet hebt gebruikt."},
"missingRequiredBlocksErrorMsg":function(d){return "Niet helemaal. U moet een blok gebruiken die u nog niet gebruikt."},
"nestedForSameVariable":function(d){return "Je gebruikt dezelfde variabele in twee of meer geneste lussen. Gebruik unieke variabelenamen om oneindige lussen te vermijden."},
"nextLevel":function(d){return "Gefeliciteerd! Je hebt puzzel "+common_locale.v(d,"puzzleNumber")+" af."},
"nextLevelTrophies":function(d){return "Gefeliciteerd! Je hebt puzzel "+common_locale.v(d,"puzzleNumber")+" opgelost en je hebt "+common_locale.p(d,"numTrophies",0,"nl",{"one":"een trofee","other":common_locale.n(d,"numTrophies")+" trofeeën"})+" gewonnen."},
"nextPuzzle":function(d){return "Volgende puzzel"},
"nextStage":function(d){return "Gefeliciteerd! Je hebt "+common_locale.v(d,"stageName")+" af."},
"nextStageTrophies":function(d){return "Gefeliciteerd! Je hebt "+common_locale.v(d,"stageName")+" af en je hebt "+common_locale.p(d,"numTrophies",0,"nl",{"one":"een medaille","other":common_locale.n(d,"numTrophies")+" medailles"})+" gewonnen."},
"numBlocksNeeded":function(d){return "Gefeliciteerd! Je hebt puzzel "+common_locale.v(d,"puzzleNumber")+" opgelost. (Maar je had het het ook met "+common_locale.p(d,"numBlocks",0,"nl",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+" op kunnen lossen.)"},
"numLinesOfCodeWritten":function(d){return "Je schreef zojuist "+common_locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":common_locale.n(d,"numLines")+" regels"})+" code!"},
"openWorkspace":function(d){return "Hoe het werkt"},
"orientationLock":function(d){return "Schakel de oriëntatieblokkering uit in de instellingen van je apparaat."},
"play":function(d){return "afspelen"},
"print":function(d){return "Afdrukken"},
"puzzleTitle":function(d){return "Puzzel "+common_locale.v(d,"puzzle_number")+" van "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "alleen bekijken: "},
"repeat":function(d){return "herhaal"},
"resetProgram":function(d){return "Herstellen"},
"rotateText":function(d){return "Draai je apparaat."},
"runProgram":function(d){return "Start"},
"runTooltip":function(d){return "Voer het programma gedefinieerd door de blokken uit in de werkruimte."},
"runtimeErrorMsg":function(d){return "Je programma is niet met succes uitgevoerd. Verwijder regel "+common_locale.v(d,"lineNumber")+" en probeer het opnieuw."},
"saveToGallery":function(d){return "Opslaan in galerij"},
"savedToGallery":function(d){return "Opgeslagen in galerij!"},
"score":function(d){return "score"},
"shareFailure":function(d){return "Sorry, we kunnen dit programma niet delen."},
"shareWarningsAge":function(d){return "Voer hieronder je leetijd in en klik op OK om verder te gaan."},
"shareWarningsMoreInfo":function(d){return "Meer Info"},
"shareWarningsStoreData":function(d){return "Deze op Code Studio gebaseerde app slaat gegevens op die door iedereen met deze link bekeken kan worden, dus pas op wanneer je gevraagd wordt om persoonlijke gegevens."},
"showBlocksHeader":function(d){return "Toon blokken"},
"showCodeHeader":function(d){return "Code weergeven"},
"showGeneratedCode":function(d){return "Code weergeven"},
"showTextHeader":function(d){return "Bekijk tekst"},
"showToolbox":function(d){return "Toon Toolbox"},
"showVersionsHeader":function(d){return "Versiegeschiedenis"},
"signup":function(d){return "Neem deel aan de introductie cursus"},
"stringEquals":function(d){return "tekenreeks =?"},
"submit":function(d){return "Insturen"},
"submitYourProject":function(d){return "Project inleveren"},
"submitYourProjectConfirm":function(d){return "Je kunt je project niet meer aanpassen nadat je het ingeleverd hebt. Wil je het echt inleveren?"},
"unsubmit":function(d){return "Intrekken"},
"unsubmitYourProject":function(d){return "Unsubmit uw project"},
"unsubmitYourProjectConfirm":function(d){return "Als u het project unsubmit, reset u de datum. Weet u het zeker?"},
"subtitle":function(d){return "een visuele programmeeromgeving"},
"syntaxErrorMsg":function(d){return "Je programma heeft een tiepfout. Verwijder regel "+common_locale.v(d,"lineNumber")+" en probeer het nog eens."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "je moet een fout in je programma corrigeren voordat het kan worden weergeven in blokken."},
"tooFewBlocksMsg":function(d){return "Je gebruikt alle soorten blokken die je nodig hebt, maar probeer meer van deze blokken te gebruiken om deze puzzel op te lossen."},
"tooManyBlocksMsg":function(d){return "Deze puzzel kan worden opgelost met <x id='START_SPAN'/><x id='END_SPAN'/> blokken."},
"tooMuchWork":function(d){return "Je laat me veel werk doen! Kun je proberen minder te herhalen?"},
"toolboxHeader":function(d){return "blokken"},
"toolboxHeaderDroplet":function(d){return "Toolbox"},
"totalNumLinesOfCodeWritten":function(d){return "Totale tijd: "+common_locale.p(d,"numLines",0,"nl",{"one":"1 regel","other":common_locale.n(d,"numLines")+" regels"})+" code."},
"tryAgain":function(d){return "Probeer opnieuw"},
"tryBlocksBelowFeedback":function(d){return "Probeer het met een van de blokken hieronder:"},
"tryHOC":function(d){return "Probeer \"Hour of Code\""},
"unnamedFunction":function(d){return "Je hebt een variabele of functie die geen naam heeft. Vergeet niet alles een beschrijvende naam te geven."},
"wantToLearn":function(d){return "Wil je leren programmeren?"},
"watchVideo":function(d){return "Bekijk de video"},
"when":function(d){return "wanneer"},
"whenRun":function(d){return "als gestart"},
"workspaceHeaderShort":function(d){return "Werkplaats: "}};