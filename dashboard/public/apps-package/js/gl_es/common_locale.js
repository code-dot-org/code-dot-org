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
"and":function(d){return "e"},
"backToPreviousLevel":function(d){return "Voltar ao nivel anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "bloques"},
"booleanFalse":function(d){return "falso"},
"booleanTrue":function(d){return "verdadeiro"},
"catActions":function(d){return "Accións"},
"catColour":function(d){return "Cor"},
"catLists":function(d){return "Listas"},
"catLogic":function(d){return "Lóxica"},
"catLoops":function(d){return "Bucles"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "Funcións"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "Variables"},
"clearPuzzle":function(d){return "Empezar de novo"},
"clearPuzzleConfirm":function(d){return "Isto reiniciará o puzzle ó seu estado inicial e borrará tódolos bloques que xa teñas engadido ou cambiado."},
"clearPuzzleConfirmHeader":function(d){return "Estás seguro de que queres empezar de novo?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Ver o código JavaScript xerado."},
"completedWithoutRecommendedBlock":function(d){return "Parabéns! Completaches o Puzzle "+common_locale.v(d,"puzzleNumber")+". (Pero podes usar un bloque diferente para un código máis forte.)"},
"continue":function(d){return "Continuar"},
"copy":function(d){return "Copiar"},
"defaultTwitterText":function(d){return "Vexa o que eu fixen"},
"designMode":function(d){return "Deseño"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "L"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "O"},
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
"dropletBlock_mathRandom_description":function(d){return "Devolve un número aleatorio entre 0 (incluído) ata o 1 (non incluído)"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "O mínimo número devolto"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "O máximo número devolto"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "devolver"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "A función "+common_locale.v(d,"name")+" ten un parámetro non definido."},
"emptyBlockInVariable":function(d){return "A variable "+common_locale.v(d,"name")+" ten un parámetro non definido."},
"emptyBlocksErrorMsg":function(d){return "Os bloques \"Repetir\" or \"Si\" deben conter outros bloques no seu interior para funcionar. Asegúrate de que o bloque interno encaixe correctamente no bloque que o contén."},
"emptyExampleBlockErrorMsg":function(d){return "Precisas polo menos dous exemplos da función "+common_locale.v(d,"functionName")+". Asegúrate de que cada exemplo ten unha chamada e un resultado."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloque de función precisa conter outros bloques no seu interior para funcionar."},
"emptyFunctionalBlock":function(d){return "Tes un bloque con un parámetro non definido."},
"emptyTopLevelBlock":function(d){return "Non hai bloques que executar. Debes engadir un bloque ó bloque "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "fin"},
"errorEmptyFunctionBlockModal":function(d){return "Debe haber bloques contidos na túa definición de función. Fai click en Editar e arrastra bloques ó interior do bloque verde."},
"errorIncompleteBlockInFunction":function(d){return "Fai click en \"Editar\" para asegurarte de que non falta ningún bloque dentro da definición da función."},
"errorParamInputUnattached":function(d){return "Lémbrate de ligar un bloque a cada parámetro de entrada no bloque de función do teu espazo de traballo."},
"errorQuestionMarksInNumberField":function(d){return "Intenta reemplazar \"???\" con un valor."},
"errorRequiredParamsMissing":function(d){return "Crea un parámetro para a túa función facendo click en \"Editar\" e engadindo os parámetros necesarios. Arrastra os novos bloques de parámetros ó interior da definición da túa función."},
"errorUnusedFunction":function(d){return "Tes creada a función, pero nunca a usaches no teu espazo de traballo. Fai click en \"Funcións\" na caixa de ferramentas e asegúrate de que a usas no teu programa."},
"errorUnusedParam":function(d){return "Tes creado un bloque de parámetros, pero nunca o usaches na definición. Asegúrate de que usas o teu parámetro facendo click en \"Editar\" e situando o bloque de parámetros no interior do bloque verde."},
"exampleErrorMessage":function(d){return "A función "+common_locale.v(d,"functionName")+" ten un ou máis exemplos que necesitan algún axuste. Asegúrate de que encaixan coa definición e resposta á pregunta."},
"examplesFailedOnClose":function(d){return "Un ou máis dos teus exemplos non encaixan coa túa definición. Comproba os teus exemplos antes de pechar"},
"extraTopBlocks":function(d){return "Tes bloques desligados."},
"extraTopBlocksWhenRun":function(d){return "Tes bloques desligados. Queres ligalos ó bloque \"ó executar\"?"},
"finalStage":function(d){return "Parabéns! Completaches a etapa final."},
"finalStageTrophies":function(d){return "Parabéns! Completaches a etapa final e tes gañado "+common_locale.p(d,"numTrophies",0,"gl",{"one":"un trofeo","other":common_locale.n(d,"numTrophies")+" trofeos"})+"."},
"finish":function(d){return "Rematar"},
"generatedCodeInfo":function(d){return "Incluso as mellores universidades enseñan a programación baeada en bloques (por exemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Nembargantes, os bloques que tes creado tamén poden ser mostrados en JavaScript, a linguaxe de programación máis empregada no mundo:"},
"hashError":function(d){return "Sentímolo, '%1' non se corresponden con ningún programa gardado."},
"help":function(d){return "Axuda"},
"hideToolbox":function(d){return "(Ocultar)"},
"hintHeader":function(d){return "Aquí vai un consello:"},
"hintPrompt":function(d){return "Necesitas axuda?"},
"hintRequest":function(d){return "Ver pista"},
"hintReviewTitle":function(d){return "Review Your Hints"},
"hintSelectInstructions":function(d){return "Instructions and old hints"},
"hintSelectNewHint":function(d){return "Get a new hint"},
"hintTitle":function(d){return "Pista:"},
"ignore":function(d){return "Ignorar"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "saltar"},
"keepPlaying":function(d){return "Continúa xogando"},
"levelIncompleteError":function(d){return "Estás a empregar todos os tipos de bloques necesarios pero non do xeito correcto."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crea o teu propio xogo Flappy"},
"missingRecommendedBlocksErrorMsg":function(d){return "Non exáctamente. Proba mellor usando un bloque que ainda non estés a empregar."},
"missingRequiredBlocksErrorMsg":function(d){return "Non exáctamente. Tes que empregar un bloque que ainda non estás a usar."},
"nestedForSameVariable":function(d){return "Estás a usar a mesma variable en dous ou máis bucles anidados. Emprega nomes de variables únicos para evitar bucles infinitos."},
"nextLevel":function(d){return "Parabéns! Completaches o Puzzle "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Completaches o Puzzle "+common_locale.v(d,"puzzleNumber")+" e ganaches "+common_locale.p(d,"numTrophies",0,"gl",{"one":"un trofeo","other":common_locale.n(d,"numTrophies")+" trofeos"})+"."},
"nextPuzzle":function(d){return "Seguinte reto"},
"nextStage":function(d){return "Parabéns! Completaches "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Completaches "+common_locale.v(d,"stageName")+" e ganaches "+common_locale.p(d,"numTrophies",0,"gl",{"one":"un trofeo","other":common_locale.n(d,"numTrophies")+" trofeos"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Completaches o Puzzle "+common_locale.v(d,"puzzleNumber")+". (Nembargantes, podías ter empregado soamente "+common_locale.p(d,"numBlocks",0,"gl",{"one":"1 bloque","other":common_locale.n(d,"numBlocks")+" bloques"})+".)"},
"numLinesOfCodeWritten":function(d){return "Acabas de escribir "+common_locale.p(d,"numLines",0,"gl",{"one":"1 liña","other":common_locale.n(d,"numLines")+" liñas"})+" de código!"},
"openWorkspace":function(d){return "Como funciona"},
"orientationLock":function(d){return "Desactiva o bloqueo de orientación na configuración do dispositivo."},
"play":function(d){return "xogar"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Ver só: "},
"repeat":function(d){return "repetir"},
"resetProgram":function(d){return "Reiniciar"},
"rotateText":function(d){return "Xira o teu dispositivo."},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Executa o programa definido polos bloques do espazo de traballo."},
"runtimeErrorMsg":function(d){return "O teu programa non se executou correctamente. Por favor, elimina a liña "+common_locale.v(d,"lineNumber")+" e inténtao de novo."},
"saveToGallery":function(d){return "Gardar na Galería"},
"savedToGallery":function(d){return "Gardado na Galería!"},
"score":function(d){return "puntuación"},
"sendToPhone":function(d){return "Enviar ao teléfono"},
"shareFailure":function(d){return "Lamentablemente non podemos compartir este programa."},
"shareWarningsAge":function(d){return "Por favor, indica abaixo a túa idade e fai click en OK para continuar."},
"shareWarningsMoreInfo":function(d){return "Máis información"},
"shareWarningsStoreData":function(d){return "Esta aplicación desenvolta con Code Studio almacena datos que poden ser vistos por calquera que teña este enlace compartido, así que ten coidado se che solicitan información persoal."},
"showBlocksHeader":function(d){return "Mostrar bloques"},
"showCodeHeader":function(d){return "Mostrar o código"},
"showGeneratedCode":function(d){return "Mostrar o código"},
"showTextHeader":function(d){return "Mostrar o texto"},
"showToolbox":function(d){return "Mostrar a caixa de ferramentas"},
"showVersionsHeader":function(d){return "Histórico de versións"},
"signup":function(d){return "Inscríbete no curso de introdución"},
"stringEquals":function(d){return "cadea=?"},
"submit":function(d){return "Enviar"},
"submitYourProject":function(d){return "Envía o teu proxecto"},
"submitYourProjectConfirm":function(d){return "Non podes editar o teu proxecto unha vez o teñas enviado, desexas envialo agora?"},
"unsubmit":function(d){return "Cancelar envío"},
"unsubmitYourProject":function(d){return "Retirar o teu proxecto"},
"unsubmitYourProjectConfirm":function(d){return "Retirar o teu proxecto tamén restablecerá a data de envío, quérelo retirar?"},
"subtitle":function(d){return "un entorno de programación visual"},
"syntaxErrorMsg":function(d){return "O teu programa contén un error tipográfico. Por favor, elimina a liña "+common_locale.v(d,"lineNumber")+" e inténtao de novo."},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Precisas correxir un erro no teu programa antes de que se poida mostrar como bloques."},
"tooFewBlocksMsg":function(d){return "Estás a empregar todos os tipos necesarios de bloques, pero trata de empregar máis destes tipos para completar este puzzle."},
"tooManyBlocksMsg":function(d){return "Este puzzle pódese resolver con <x id='START_SPAN'/><x id='END_SPAN'/> bloques."},
"tooMuchWork":function(d){return "Fixéchesme traballar moito! Poderías tratar de repetir en menos ocasións?"},
"toolboxHeader":function(d){return "Bloques"},
"toolboxHeaderDroplet":function(d){return "Caixa de Ferramentas"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+common_locale.p(d,"numLines",0,"gl",{"one":"1 liña","other":common_locale.n(d,"numLines")+" liñas"})+" de código."},
"tryAgain":function(d){return "Inténtao de novo"},
"tryBlocksBelowFeedback":function(d){return "Intenta empregar un dos seguintes bloques:"},
"tryHOC":function(d){return "Proba a Hora do Código"},
"unnamedFunction":function(d){return "Tes unha variable ou función sen nome. Non te esquezas de darlle a todo un nome descriptivo."},
"wantToLearn":function(d){return "Queres aprender a programar?"},
"watchVideo":function(d){return "Mira o vídeo"},
"when":function(d){return "cando"},
"whenRun":function(d){return "cando se executa"},
"workspaceHeaderShort":function(d){return "Espazo de traballo: "}};