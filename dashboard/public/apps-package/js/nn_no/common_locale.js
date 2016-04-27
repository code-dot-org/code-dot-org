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
"backToPreviousLevel":function(d){return "Tilbake til førre nivå"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blokker"},
"booleanFalse":function(d){return "usann"},
"booleanTrue":function(d){return "sann"},
"catActions":function(d){return "Handlingar"},
"catColour":function(d){return "Farge"},
"catLists":function(d){return "Lister"},
"catLogic":function(d){return "Logikk"},
"catLoops":function(d){return "Løkker"},
"catMath":function(d){return "Matematikk"},
"catProcedures":function(d){return "Funksjonar"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Variablar"},
"clearPuzzle":function(d){return "Start på nytt"},
"clearPuzzleConfirm":function(d){return "Dette vil nullstille puslespelet og fjerne alle blokkene du har lagt til eller endra."},
"clearPuzzleConfirmHeader":function(d){return "Er du sikker på at du vil starte på nytt?"},
"codeMode":function(d){return "Kode"},
"codeTooltip":function(d){return "Sjå JavaScript-koden som har blitt laga."},
"completedWithoutRecommendedBlock":function(d){return "Gratulerer! Du har fullført oppgava "+common_locale.v(d,"puzzleNumber")+". (Men du kan bruke ei anna blokk for sterkare kode.)"},
"continue":function(d){return "Hald fram"},
"copy":function(d){return "Kopier"},
"defaultTwitterText":function(d){return "Sjekk ut det eg har laga"},
"designMode":function(d){return "Utforming"},
"dialogCancel":function(d){return "Avbryt"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "A"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "V"},
"dropletBlock_addOperator_description":function(d){return "Legg til to tall"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Legg til operatør"},
"dropletBlock_andOperator_description":function(d){return "Returnerer TRUE når begge uttrykkene er sanne og FALSE ellers"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolsk operator"},
"dropletBlock_assign_x_description":function(d){return "Assigns a value to an existing variable. For example, x = 0;"},
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
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Spør brukeren om å et tall og lagre det"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Lag en variabel"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Lager en variabel med navnet 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Lag en variabel"},
"dropletBlock_divideOperator_description":function(d){return "Del to tall"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divisjonsoperator"},
"dropletBlock_equalityOperator_description":function(d){return "Teste om to verdier er like. Returnerer 'true' hvis verdien på venstre side av uttrykket er lik verdien på høyre side, og 'false' e"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "Den første verdien du skal bruke til sammenligning."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "Den andre verdien i sammenligningen."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Likhets-operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Lager en løkke bestående av et start-utrykk, et betingelses-utrykk, et utrykk for å øke verdien, og en blokk med instruksjoner som blir gjentatt for hver gjentagelse av løkken"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for-løkke"},
"dropletBlock_functionParams_n_description":function(d){return "En rekke instruksjoner som får et eller flere input-parameter, og som utfører en oppgave eller beregner en verdi når funksjonen kalles"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Definer en funksjon med parametre"},
"dropletBlock_functionParams_none_description":function(d){return "En rekke instruksjoner som utfører en oppgave eller beregner en verdi når funksjonen kalles"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definer en funksjon"},
"dropletBlock_getTime_description":function(d){return "Få gjeldende tid i millisekunder"},
"dropletBlock_greaterThanOperator_description":function(d){return "Tester om et tall er større enn et annet tall. Returnerer 'true' hvis verdien på den venstre siden av uttrykket er større enn verdien på høyre side av uttrykket"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "Den første verdien du skal bruke til sammenligning."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "Den andre verdien i sammenligningen."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Større-enn operator"},
"dropletBlock_ifBlock_description":function(d){return "Utfører en blokk med instruksjoner hvis de angitte betingelsene er sanne"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "hvis-instruksjon"},
"dropletBlock_ifElseBlock_description":function(d){return "Utfører en blokk med instruksjoner hvis de angitte betingelsene er sanne. Ellers så blir den andre blokken av instruksjoner utført"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "hvis/ellers instruksjon"},
"dropletBlock_inequalityOperator_description":function(d){return "Undersøker om to verdier ikke er like. Returnerer 'true' hvis verdien på venstre side av uttrykket ikke er lik verdien på høyre side av uttrykket"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "Den første verdien du skal bruke til sammenligning."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "Den andre verdien i sammenligningen."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "ulikhet operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Tester om en verdi er mindre enn en annen verdi. Returnerer 'true' hvis verdien på venstre side av uttrykket er mindre enn verdien på høyre side av uttrykket"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "Den første verdien du skal bruke til sammenligning."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "Den andre verdien i sammenligningen."},
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
"dropletBlock_mathRandom_description":function(d){return "Returnerer eit tilfeldig tal i intervallet fra og med 0 (inkludert) opp til, men ikkje 1 (ekskludert)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Matte.tilfeldig()"},
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
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "minimum"},
"dropletBlock_randomNumber_param0_description":function(d){return "Det minste tallet returnert"},
"dropletBlock_randomNumber_param1":function(d){return "maksimum"},
"dropletBlock_randomNumber_param1_description":function(d){return "Det største talet returnert"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Returnerer en verdi fra en funksjon"},
"dropletBlock_return_signatureOverride":function(d){return "returner"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "Funksjonen "+common_locale.v(d,"name")+" har eit tomt inndatafelt."},
"emptyBlockInVariable":function(d){return "Variabelen "+common_locale.v(d,"name")+" har eit tomt datafelt."},
"emptyBlocksErrorMsg":function(d){return "\"Gjenta\"- eller \"Viss\"-blokkane må ha andre blokker inni for å fungere. Forviss deg om at blokkane passar inn."},
"emptyExampleBlockErrorMsg":function(d){return "Du treng minst to døme i funksjonen "+common_locale.v(d,"functionName")+". Vær sikker på at kvart døme har eit kall og eit resultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Funksjon-blokka må ha andre blokker inni for å fungere."},
"emptyFunctionalBlock":function(d){return "Du har ei blokk med uutfylt inndata."},
"emptyTopLevelBlock":function(d){return "Det er ingen blokker å køyre. Du må feste ei blokk til "+common_locale.v(d,"topLevelBlockName")+"-blokka."},
"end":function(d){return "slutt"},
"errorEmptyFunctionBlockModal":function(d){return "Det må være blokker innanfor funksjonsdefinisjonen din. Klikk \"rediger\" og dra blokker inn i den grøne blokka."},
"errorIncompleteBlockInFunction":function(d){return "Klikk på \"rediger\" for å sikre at du ikkje manglar nokre blokker inne i funksjonsdefinisjonen din."},
"errorParamInputUnattached":function(d){return "Hugs å feste ei blokk til kvar parameter-innput på funksjonsblokka i arbeidsområdet ditt."},
"errorQuestionMarksInNumberField":function(d){return "Prøv å erstatte \"???\" med ein verdi."},
"errorRequiredParamsMissing":function(d){return "Lag ein parameter for funksjonen din ved å klikke \"rediger\" og legg til dei nødvendige parametera. Dra dei nye parameterblokkene inn i funksjonsdefinisjonen din."},
"errorUnusedFunction":function(d){return "Du laga en funksjon, men brukte den ikkje i arbeidsområdet ditt! Klikk på \"funksjoner\" i verktøykassa og bruk den i programmet ditt."},
"errorUnusedParam":function(d){return "Du la til ei parameterblokk, men brukte den ikkje i definisjonen. Hugs å bruke parameteret ditt ved å klikke \"rediger\" og plasser parameterblokka inne i den grøne blokka."},
"exampleErrorMessage":function(d){return "Funksjonen "+common_locale.v(d,"functionName")+" har eit eller fleire døme som treng justering. Vær sikker på at dei stemmer med definisjonane dine og svarer på spørsmålet."},
"examplesFailedOnClose":function(d){return "Eit eller fleire av døma dine stemmer ikkje med definisjonen din. Sjekk eksempla dine før lukking"},
"extraTopBlocks":function(d){return "Du har lause blokker."},
"extraTopBlocksWhenRun":function(d){return "Du har lause blokker. Meinte du å feste desse til \"når køyrande\"-blokka?"},
"finalStage":function(d){return "Gratulerer! Du har fullført siste nivået."},
"finalStageTrophies":function(d){return "Gratulerer! Du har fullført siste nivået og vann "+common_locale.p(d,"numTrophies",0,"en",{"one":"ein pokal","other":common_locale.n(d,"numTrophies")+" pokalar"})+"."},
"finish":function(d){return "Fullfør"},
"generatedCodeInfo":function(d){return "Også leiande universitet underviser programmering med blokker (til dømes "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Men blokkene du har sett saman kan også visast som JavaScript, verdens mest brukte programmeringsspråk:"},
"hashError":function(d){return "Beklager, '%1' passar ikkje med noko lagra program."},
"help":function(d){return "Hjelp"},
"hideToolbox":function(d){return "(Skjul)"},
"hintHeader":function(d){return "Her er eit tips:"},
"hintRequest":function(d){return "Sjå tips"},
"hintTitle":function(d){return "Tips:"},
"ignore":function(d){return "Ignorer"},
"infinity":function(d){return "Uendeleg"},
"jump":function(d){return "hopp"},
"keepPlaying":function(d){return "Fortset å spele"},
"levelIncompleteError":function(d){return "Du bruker alle dei nødvendige blokkene, men ikkje på rett måte."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Lag ditt eige Flakse-spel"},
"missingRecommendedBlocksErrorMsg":function(d){return "Ikkje heilt rett. Prøv å bruke ein blokk du ikkje har brukt enda."},
"missingRequiredBlocksErrorMsg":function(d){return "Ikkje heilt rett. Prøv å bruke ei ubrukt blokk."},
"nestedForSameVariable":function(d){return "Du bruker den same variabelen inne i to eller fleire lekkjer inni einannan. Bruk unike variabelnavn for å unngå uendelege lekkjer."},
"nextLevel":function(d){return "Gratulerer! Du fullførte oppgåve "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Gratulerer! Du har fullført oppgåve "+common_locale.v(d,"puzzleNumber")+" og vunne "+common_locale.p(d,"numTrophies",0,"en",{"one":"ein pokal","other":common_locale.n(d,"numTrophies")+" pokalar"})+"."},
"nextPuzzle":function(d){return "Neste puslespel"},
"nextStage":function(d){return "Gratulerer! Du fullførte "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Gratulerer! Du har fullført "+common_locale.v(d,"stageName")+" og vunne "+common_locale.p(d,"numTrophies",0,"en",{"one":"ein pokal","other":common_locale.n(d,"numTrophies")+" pokalar"})+"."},
"numBlocksNeeded":function(d){return "Gratulerer! Du har fullført oppgåve "+common_locale.v(d,"puzzleNumber")+". (Men, du kunne ha brukt berre "+common_locale.p(d,"numBlocks",0,"en",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Du har akkurat skrive "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" med kode!"},
"openWorkspace":function(d){return "Slik fungerer det"},
"orientationLock":function(d){return "Skru av roteringslåsen på enheten din."},
"play":function(d){return "spel av"},
"print":function(d){return "Skriv ut"},
"puzzleTitle":function(d){return "Oppgåve "+common_locale.v(d,"puzzle_number")+" av "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Berre til lesing: "},
"repeat":function(d){return "gjenta"},
"resetProgram":function(d){return "Nullstill"},
"rotateText":function(d){return "Snu eininga di."},
"runProgram":function(d){return "Køyr"},
"runTooltip":function(d){return "Køyr programmet definert av blokkene i arbeidsområdet."},
"runtimeErrorMsg":function(d){return "Programmet ditt køyrde ikkje skikkeleg. Fjern line "+common_locale.v(d,"lineNumber")+" og prøv igjen."},
"saveToGallery":function(d){return "Lagre i galleriet"},
"savedToGallery":function(d){return "Lagra i galleriet!"},
"score":function(d){return "poengsum"},
"sendToPhone":function(d){return "Send til telefon"},
"shareFailure":function(d){return "Beklager, vi kan ikkje dele dette programmet."},
"shareWarningsAge":function(d){return "Skriv inn alder under og klikk OK for å halde fram."},
"shareWarningsMoreInfo":function(d){return "Meir info"},
"shareWarningsStoreData":function(d){return "Denne appen, som er bygd i Code Studio, lagrar data som kan sjåast av alle som har lenka, så ver varsam om du vert spurd om personleg informasjon."},
"showBlocksHeader":function(d){return "Vis blokker"},
"showCodeHeader":function(d){return "Vis kode"},
"showGeneratedCode":function(d){return "Vis kode"},
"showTextHeader":function(d){return "Vis tekst"},
"showToolbox":function(d){return "Vis verktøykasse"},
"showVersionsHeader":function(d){return "Versjonslogg"},
"signup":function(d){return "Registrer deg for introduksjonskurset"},
"stringEquals":function(d){return "streng=?"},
"submit":function(d){return "Send"},
"submitYourProject":function(d){return "Send inn ditt prosjekt"},
"submitYourProjectConfirm":function(d){return "Etter at du har sendt inn prosjektet kan du ikkje editere det, vil du verkeleg sende det?"},
"unsubmit":function(d){return "Trekk tilbake"},
"unsubmitYourProject":function(d){return "Av-publiser prosjektet ditt"},
"unsubmitYourProjectConfirm":function(d){return "Sletting av prosjektet slettar det som er lagra, vil du slette?"},
"subtitle":function(d){return "eit visuelt programmeringsmiljø"},
"syntaxErrorMsg":function(d){return "Programmet ditt inneheld ein skrivefeil. Fjern linje nummer "+common_locale.v(d,"lineNumber")+" og prøv på nytt."},
"textVariable":function(d){return "tekst"},
"toggleBlocksErrorMsg":function(d){return "Du må rette opp i ein feil i programmet ditt før det kan visast som blokker."},
"tooFewBlocksMsg":function(d){return "Du bruker alle dei nødvendige blokktypane, men prøv å bruke fleire av desse typane av blokker for å løyse denne oppgåva."},
"tooManyBlocksMsg":function(d){return "Denne oppgåva kan løysast med <x id='START_SPAN'/><x id='END_SPAN'/> blokker."},
"tooMuchWork":function(d){return "Du fekk meg til å gjere masse arbeid! Kan du forsøke med færre repetisjonar?"},
"toolboxHeader":function(d){return "Blokker"},
"toolboxHeaderDroplet":function(d){return "Verktøykasse"},
"totalNumLinesOfCodeWritten":function(d){return "Totalt: "+common_locale.p(d,"numLines",0,"en",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" med kode."},
"tryAgain":function(d){return "Prøv igjen"},
"tryBlocksBelowFeedback":function(d){return "Prøv å bruke ein av blokkene under:"},
"tryHOC":function(d){return "Prøv Kodetimen"},
"unnamedFunction":function(d){return "Du har ein variabel eller funksjon som ikkje har fått navn. Ikkje gløym å gje alt eit beskrivande navn."},
"wantToLearn":function(d){return "Vil du lære å kode?"},
"watchVideo":function(d){return "Sjå videoen"},
"when":function(d){return "når"},
"whenRun":function(d){return "når den køyrer"},
"workspaceHeaderShort":function(d){return "Arbeidsområde: "}};