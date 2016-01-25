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
"backToPreviousLevel":function(d){return "Torna al nivell anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocs"},
"booleanFalse":function(d){return "fals"},
"booleanTrue":function(d){return "cert"},
"catActions":function(d){return "Accions"},
"catColour":function(d){return "Color"},
"catLists":function(d){return "Llistes"},
"catLogic":function(d){return "Lògic"},
"catLoops":function(d){return "Bucles"},
"catMath":function(d){return "Mates"},
"catProcedures":function(d){return "Funcions"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variables"},
"clearPuzzle":function(d){return "Torna a començar"},
"clearPuzzleConfirm":function(d){return "Això reiniciarà el puzzle al seu estat inicial i esborrarà tots els blocs que hagis afegit o canviat."},
"clearPuzzleConfirmHeader":function(d){return "Estàs segur que vols tornar a començar?"},
"codeMode":function(d){return "ModeCodi"},
"codeTooltip":function(d){return "Vegeu el codi JavaScript generat."},
"completedWithoutRecommendedBlock":function(d){return "Enhorabona! Has completat el trencaclosques "+common_locale.v(d,"puzzleNumber")+". (Però podries have utilitzat un bloc diferent per fer el codi més fort.)"},
"continue":function(d){return "Continuar"},
"copy":function(d){return "Copiar"},
"defaultTwitterText":function(d){return "Comprova el que he fet"},
"designMode":function(d){return "ModeDiseny"},
"dialogCancel":function(d){return "Cancel·lar"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "W"},
"dropletBlock_addOperator_description":function(d){return "Afegeix dos numeros"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Afegir operador"},
"dropletBlock_andOperator_description":function(d){return "Retorna veritat només quan les dues expressions són certes o són falses"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operador booleà AND"},
"dropletBlock_assign_x_description":function(d){return "Assigna el valor a una variable existent. Per exemple, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Nom de la variable que està sent assignada"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "El valor de la variable que està sent assignada."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assignar una variable"},
"dropletBlock_callMyFunction_description":function(d){return "Crida a una funció nombrada que no té paràmetres"},
"dropletBlock_callMyFunction_n_description":function(d){return "Crida una funció nombrada que té un o més paràmetres"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Crida una funció amb paràmetres"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Crida una funció"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Crear una variable i inicialitza-la com una matriu"},
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
"dropletBlock_divideOperator_description":function(d){return "Divideix dos nombres"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "bucle for"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "A set of statements that perform a task or calculate a value when the function is called"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Defineix una funció"},
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
"dropletBlock_mathRandom_description":function(d){return "Retorna un nombre aleatori entre 0 (inclòs) fins però sense incloure 1 (exclusiu)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.aleatori()"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "El nombre mínim de retornats"},
"dropletBlock_randomNumber_param1":function(d){return "màx"},
"dropletBlock_randomNumber_param1_description":function(d){return "El nombre màxim de retornats"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "retorna"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "La funció "+common_locale.v(d,"name")+" té una entrada buida."},
"emptyBlockInVariable":function(d){return "La variable "+common_locale.v(d,"name")+" té una entrada buida."},
"emptyBlocksErrorMsg":function(d){return "Els blocs \"Repetir\" o el \"Si\" necessiten tenir altres blocs dins per a treballar. Assegureu-vos que el bloc interior encaixa bé dins del bloc que conté."},
"emptyExampleBlockErrorMsg":function(d){return "Necessita, com a mínim, dos exemples en funció "+common_locale.v(d,"functionName")+". Assegureu-vos que cada exemple té una trucada i un resultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "El bloc funció ha de tenir altres blocs dins de treballar."},
"emptyFunctionalBlock":function(d){return "Tens un bloc amb una entrada buida."},
"emptyTopLevelBlock":function(d){return "No hi ha blocs per executar. Has de connectar un bloc al bloc de "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "final"},
"errorEmptyFunctionBlockModal":function(d){return "Cal que hi hagi blocs dins de la definició de la teva funció. Fes clic a \"Edita\" i arrossega els blocs que calgui dins del bloc verd."},
"errorIncompleteBlockInFunction":function(d){return "Feu clic a \"Edita\" per assegurar-vos que no us falta cap bloc a la definició de funció."},
"errorParamInputUnattached":function(d){return "Recordeu d'afegir un bloc a cada entrada de paràmetre al bloc de funcions en el vostre espai de treball."},
"errorQuestionMarksInNumberField":function(d){return "Prova substituint \"???\" per un valor."},
"errorRequiredParamsMissing":function(d){return "Crea un paràmetre per a la funció fent clic a \"edita\" i afegint els paràmetres necessaris. Arrossega els nous blocs de paràmetres a la definició de funció."},
"errorUnusedFunction":function(d){return "Heu creat una funció però no l'heu utilitzat al vostre espai de treball! Feu clic a \"Funcions\" a la caixa d'eines i assegureu-vos d'utilitzar-la en el programa."},
"errorUnusedParam":function(d){return "Has afegit un bloc de paràmetre, però no l'has utilitzat a la definició. Assegura't d'utilitzar el paràmetre fent clic a \"edita\" i col·locant el bloc de paràmetre dins del bloc verd."},
"exampleErrorMessage":function(d){return "La funció "+common_locale.v(d,"functionName")+" té un o més exemples que necessiten adaptar-se. Assegureu-vos que coincideixen amb la definició i resposta a la pregunta."},
"examplesFailedOnClose":function(d){return "Un o més dels seuse exemples no coincideixen amb la definició. Comprovi els seus exemples abans de tancar"},
"extraTopBlocks":function(d){return "Tens blocs sense connectar."},
"extraTopBlocksWhenRun":function(d){return "Tens blocs sense connectar. Vols dir que no els hauries de connectar al bloc \"quan s'executa\"?"},
"finalStage":function(d){return "Enhorabona! Has completat l'etapa final."},
"finalStageTrophies":function(d){return "Enhorabona! Has completat l'etapa final i guanyat "+common_locale.p(d,"numTrophies",0,"ca",{"un":"trofeu","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Finalitza"},
"generatedCodeInfo":function(d){return "Fins i tot les millors universitats ensenyen programació basada en blocs (per exemple, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Però sota el capó, els blocs que tu has reunit també es poden mostrar en JavaScript, la llengua de programació més utilitzada al món:"},
"hashError":function(d){return "Ho sentim, '%1' no correspon amb ningun programa guardat."},
"help":function(d){return "Ajuda"},
"hideToolbox":function(d){return "(Amaga)"},
"hintHeader":function(d){return "Aquí tens una pista:"},
"hintPrompt":function(d){return "Necessites ajuda?"},
"hintRequest":function(d){return "Veure pista"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"},
"hintTitle":function(d){return "Consell:"},
"ignore":function(d){return "Ignorar"},
"infinity":function(d){return "Infinit"},
"jump":function(d){return "salt"},
"keepPlaying":function(d){return "Continua jugant"},
"levelIncompleteError":function(d){return "Estàs utilitzant tots els tipus de blocs necessaris, però no de la manera correcta."},
"listVariable":function(d){return "llista"},
"makeYourOwnFlappy":function(d){return "Fes el teu propi joc Flappy"},
"missingRecommendedBlocksErrorMsg":function(d){return "No del tot. Proveu d'utilitzar un bloc que no hàgiu fet servir encara."},
"missingRequiredBlocksErrorMsg":function(d){return "No del tot. Ha d'utilitzar un bloc que no hàgiu fet servir encara."},
"nestedForSameVariable":function(d){return "Està utilitzant la mateixa variable dis de dos o més bucles ennierats. Utilitza noms de variable únics per evitar bucles infinits."},
"nextLevel":function(d){return "Enhorabona! Has acabat el Puzzle! "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Felicitats! Has acabat el Puzzle "+common_locale.v(d,"puzzleNumber")+" i has guanyat "+common_locale.p(d,"numTrophies",0,"ca",{"one":"un trofeu","other":common_locale.n(d,"numTrophies")+" trofeus"})+"."},
"nextPuzzle":function(d){return "Següent puzzle"},
"nextStage":function(d){return "Enhorabona! Heu completat "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Enhorabona! Has acabat "+common_locale.v(d,"stageName")+" i has guanyat "+common_locale.p(d,"numTrophies",0,"ca",{"un":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Enhorabona! Has acabat el Puzzle "+common_locale.v(d,"puzzleNumber")+". (Tot i que podries haver utilitzat un "+common_locale.p(d,"numBlocks",0,"ca",{"one":"1 bloc","other":common_locale.n(d,"numBlocks")+" blocs"})+".)"},
"numLinesOfCodeWritten":function(d){return "Has escrit "+common_locale.p(d,"numLines",0,"ca",{"one":"1 línia","other":common_locale.n(d,"numLines")+" línies"})+" de codi!"},
"openWorkspace":function(d){return "Com funciona"},
"orientationLock":function(d){return "Desactiva el bloqueig d'orientació en els ajustos del teu dispositiu."},
"play":function(d){return "reprodueix"},
"print":function(d){return "Imprimeix"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Veure només: "},
"repeat":function(d){return "repeteix"},
"resetProgram":function(d){return "Reiniciar"},
"rotateText":function(d){return "Gira el teu dispositiu."},
"runProgram":function(d){return "executa"},
"runTooltip":function(d){return "Executa el programa definit per els blocs en l'àrea de treball."},
"runtimeErrorMsg":function(d){return "El seu programa no ha funcionat correctament. Tregui la línia "+common_locale.v(d,"lineNumber")+" i torneu-ho a provar."},
"saveToGallery":function(d){return "Desa a la galeria"},
"savedToGallery":function(d){return "Desat a la galeria!"},
"score":function(d){return "puntuació"},
"sendToPhone":function(d){return "Enviar al telèfon"},
"shareFailure":function(d){return "Ho sentim, no podem compartir aquest programa."},
"shareWarningsAge":function(d){return "Si us plau, proporcioneu la seva edat a sota i feu clic a D'acord per a continuar."},
"shareWarningsMoreInfo":function(d){return "Més informació"},
"shareWarningsStoreData":function(d){return "Aquesta aplicació construïda en Code Studio emmagatzema dades que poden ser vistes per qualsevol amb aquest enllaç compartit, així que tingueu cura si se li demana de proporcionar informació personal."},
"showBlocksHeader":function(d){return "Mostra els blocs"},
"showCodeHeader":function(d){return "Mostra el Codi"},
"showGeneratedCode":function(d){return "Mostra el Codi"},
"showTextHeader":function(d){return "Mostra el text"},
"showToolbox":function(d){return "Mostra la caixa d'eines"},
"showVersionsHeader":function(d){return "Historial de versions"},
"signup":function(d){return "Inscriu-te al curs d'introducció"},
"stringEquals":function(d){return "cadena=?"},
"submit":function(d){return "Envia"},
"submitYourProject":function(d){return "Trameti el seu projecte"},
"submitYourProjectConfirm":function(d){return "No pot editar el seu projecte després de trametre'l, realment el vol trametre?"},
"unsubmit":function(d){return "Unsubmit"},
"unsubmitYourProject":function(d){return "No trametre el seu projecte"},
"unsubmitYourProjectConfirm":function(d){return "No trametre el seu projecte restablirà la data de tramesa, realment no el vol trametre?"},
"subtitle":function(d){return "un entorn de programació visual"},
"syntaxErrorMsg":function(d){return "El seu programa conté un error tipogràfic. Tregui la línia "+common_locale.v(d,"lineNumber")+" i torneu-ho a provar."},
"textVariable":function(d){return "text"},
"toggleBlocksErrorMsg":function(d){return "Cal corregir un error en el programa abans que pugui mostrar-se com blocs."},
"tooFewBlocksMsg":function(d){return "Estàs utilitzant tots els tipus de blocs necessaris, però prova d'utilitzar més d'aquest altre tipus per a completar el puzzle."},
"tooManyBlocksMsg":function(d){return "Aquest puzzle pot ser resolt amb <x id='START_SPAN'/><x id='END_SPAN'/> blocs."},
"tooMuchWork":function(d){return "Em fas fer molta feina! Podries intentar repetir menys vegades?"},
"toolboxHeader":function(d){return "Blocs"},
"toolboxHeaderDroplet":function(d){return "Caixa d'eines"},
"totalNumLinesOfCodeWritten":function(d){return "Total de tots els temps: "+common_locale.p(d,"numLines",0,"ca",{"one":"1 línia","other":common_locale.n(d,"numLines")+" línies"})+" de codi."},
"tryAgain":function(d){return "Torna a intentar-ho"},
"tryBlocksBelowFeedback":function(d){return "Proveu d'utilitzar un dels blocs següents:"},
"tryHOC":function(d){return "Proveu l'Hora de programació"},
"unnamedFunction":function(d){return "Teniu una variable o funció que no té nom. No oblideu de donar un nom descriptiu a tot."},
"wantToLearn":function(d){return "Vols aprendre a programar?"},
"watchVideo":function(d){return "Mira el vídeo"},
"when":function(d){return "quan"},
"whenRun":function(d){return "quan s'executa"},
"workspaceHeaderShort":function(d){return "Zona de treball: "}};