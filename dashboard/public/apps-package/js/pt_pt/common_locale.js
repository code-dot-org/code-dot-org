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
"backToPreviousLevel":function(d){return "Voltar ao nível anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocos"},
"booleanFalse":function(d){return "falso"},
"booleanTrue":function(d){return "verdadeiro"},
"catActions":function(d){return "Ações"},
"catColour":function(d){return "Cor"},
"catLists":function(d){return "Listas"},
"catLogic":function(d){return "Lógica"},
"catLoops":function(d){return "Ciclos"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Recomeçar"},
"clearPuzzleConfirm":function(d){return "Esta ação irá repor o teu puzzle ao estado inicial e apagar todos os blocos que adicionaste ou alteraste."},
"clearPuzzleConfirmHeader":function(d){return "Tens a certeza de que pretendes recomeçar?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Vê o código gerado em Javascript."},
"completedWithoutRecommendedBlock":function(d){return "Parabéns! Acabaste de concluir o puzzle "+common_locale.v(d,"puzzleNumber")+". (Mas podias usar um bloco diferente para teres código mais eficiente.)"},
"continue":function(d){return "Continuar"},
"copy":function(d){return "Cópia"},
"defaultTwitterText":function(d){return "Veja o que eu fiz"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
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
"dropletBlock_mathRandom_description":function(d){return "Devolve um número aleatório entre 0 (inclusive) até, mas não incluíndo, 1 (exclusive)"},
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
"dropletBlock_randomNumber_param0_description":function(d){return "O número mínimo devolvido"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "O número máximo devolvido"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "retorno"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "A função "+common_locale.v(d,"name")+" tem uma entrada por preencher."},
"emptyBlockInVariable":function(d){return "A variável "+common_locale.v(d,"name")+" tem uma entrada por preencher."},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repetir\" ou \"Se\" precisam de incluir blocos dentro para funcionar. Garante que o bloco interno encaixa correctamente dentro do bloco que o contém."},
"emptyExampleBlockErrorMsg":function(d){return "Precisas de, pelo menos, um exemplo na função "+common_locale.v(d,"functionName")+". Certifica-te de que cada exemplo é chamado uma vez e devolve um resultado."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa de ter outros blocos dentro dele para funcionar."},
"emptyFunctionalBlock":function(d){return "Tens um bloco com um valor por preencher."},
"emptyTopLevelBlock":function(d){return "Não há nenhum bloco para executar. Tens de ligar um bloco ao bloco "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "terminar"},
"errorEmptyFunctionBlockModal":function(d){return "É necessário haver blocos dentro da definição da tua função. Clica em \"Editar\" e arrasta os blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clica em \"editar\" para teres a certeza de que não há blocos a faltar dentro da definição da função."},
"errorParamInputUnattached":function(d){return "Lembra-te de ligares um bloco a cada parâmetro de entrada no bloco da função da tua área de trabalho."},
"errorQuestionMarksInNumberField":function(d){return "Experimenta substituir \"???\" por um valor."},
"errorRequiredParamsMissing":function(d){return "Clica em \"Editar\" e adiciona os parâmetros de que precisares para criares um parâmetro para a tua função. Arrasta os blocos de parâmetros novos para dentro da definição da tua função."},
"errorUnusedFunction":function(d){return "Criaste uma função mas nunca a usaste no espaço de trabalho! Clica em \"Funções\" na caixa de ferramentas e certifica-te de que estás a usá-la no teu programa."},
"errorUnusedParam":function(d){return "Adicionaste um bloco de parâmetro, mas não o usaste na definição. Clica em \"Editar\" e arrasta o bloco de parâmetro para dentro do bloco verde para te certificares de que usas o teu parâmetro."},
"exampleErrorMessage":function(d){return "A função "+common_locale.v(d,"functionName")+" tem, pelo menos, um exemplo que precisa de ser ajustado. Certifica-te de que todos os exemplos correspondem à tua definição e respondem à pergunta."},
"examplesFailedOnClose":function(d){return "Pelo menos um dos teus exemplos não corresponde à tua definição. Verifica os teus exemplos antes fechares"},
"extraTopBlocks":function(d){return "Tens blocos desligados dos outros."},
"extraTopBlocksWhenRun":function(d){return "Há blocos desligados. Pretendes ligá-los ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Concluíste a etapa final."},
"finalStageTrophies":function(d){return "Parabéns! Concluíste a etapa final e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Terminar"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam código em blocos (por exemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Mas, na verdade, os blocos que juntaste podem ser vistos em JavaScript, que é a linguagem de programação mais utilizada no mundo:"},
"hashError":function(d){return "Desculpa, '%1' não corresponde a qualquer programa gravado."},
"help":function(d){return "Ajuda"},
"hideToolbox":function(d){return "(Ocultar)"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"hintRequest":function(d){return "Ver pista"},
"hintTitle":function(d){return "Pista:"},
"ignore":function(d){return "Ignorar"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "saltar"},
"keepPlaying":function(d){return "Continuar a jogar"},
"levelIncompleteError":function(d){return "Estás a usar todos os tipos necessários de blocos, mas não da forma certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Cria o teu próprio Flappy Bird"},
"missingRecommendedBlocksErrorMsg":function(d){return "Não propriamente. Tente utilizar um bloco que ainda não está a usar."},
"missingRequiredBlocksErrorMsg":function(d){return "Não propriamente. Tem de usar um bloco que ainda não está a utilizar."},
"nestedForSameVariable":function(d){return "Está a usar a mesma variável em mais do que um ciclo. Use nomes de variáveis únicos para evitar ciclos infinitos."},
"nextLevel":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+" e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"nextPuzzle":function(d){return "Desafio seguinte"},
"nextStage":function(d){return "Parabéns! Concluíste a etapa "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Concluíste a etapa "+common_locale.v(d,"stageName")+" e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+". (No entanto, podias ter usado apenas "+common_locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":common_locale.n(d,"numBlocks")+" blocos"})+".)"},
"numLinesOfCodeWritten":function(d){return "Acabaste de escrever "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código!"},
"openWorkspace":function(d){return "Como funciona"},
"orientationLock":function(d){return "Desativa o bloqueio de orientação em configurações do dispositivo."},
"play":function(d){return "jogar"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Desafio "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Ver apenas: "},
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Repor"},
"rotateText":function(d){return "Roda o teu dispositivo."},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Executa o programa definido pelos blocos na área de trabalho."},
"runtimeErrorMsg":function(d){return "Seu programa não foi executado com êxito. Por favor, remova a linha "+common_locale.v(d,"lineNumber")+" e tente novamente."},
"saveToGallery":function(d){return "Guardar na galeria"},
"savedToGallery":function(d){return "Guardado na galeria!"},
"score":function(d){return "pontuação"},
"sendToPhone":function(d){return "Enviar para o telefone"},
"shareFailure":function(d){return "Não é possível partilhar este programa."},
"shareWarningsAge":function(d){return "Por favor forneça sua idade abaixo e clique em OK para continuar."},
"shareWarningsMoreInfo":function(d){return "Mais informações"},
"shareWarningsStoreData":function(d){return "Este app construído no Code Studio armazena dados que podem ser visualizados por qualquer pessoa através deste link compartilhado, então haja com cautela caso seja solicitado suas informações pessoais."},
"showBlocksHeader":function(d){return "Mostrar blocos"},
"showCodeHeader":function(d){return "Mostrar o código"},
"showGeneratedCode":function(d){return "Mostrar o código"},
"showTextHeader":function(d){return "Mostrar texto"},
"showToolbox":function(d){return "Mostrar caixa de ferramentas"},
"showVersionsHeader":function(d){return "Histórico de versões"},
"signup":function(d){return "Inscreve-te no curso de iniciação"},
"stringEquals":function(d){return "Sequência de caracteres =?"},
"submit":function(d){return "OK"},
"submitYourProject":function(d){return "Envie o seu projeto"},
"submitYourProjectConfirm":function(d){return "Não poderá alterar o projeto depois de o submeter, confirma?"},
"unsubmit":function(d){return "Remover submissão"},
"unsubmitYourProject":function(d){return "Retirar o seu projeto"},
"unsubmitYourProjectConfirm":function(d){return "Remover o seu projeto irá alterar a data de submissão, deseja realmente remover?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"syntaxErrorMsg":function(d){return "O teu programa contém algum um erro de digitação. Por favor, remove a linha "+common_locale.v(d,"lineNumber")+" e tente novamente."},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Tens de corrigir um erro no teu programa antes de que o programa possa ser mostrado por blocos."},
"tooFewBlocksMsg":function(d){return "Estás a usar todos os tipos de blocos necessários, mas tenta usar mais alguns desses blocos para concluíres este desafio."},
"tooManyBlocksMsg":function(d){return "Este desafio pode ser resolvido com <x id='START_SPAN'/><x id='END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Fizeste-me ter muito trabalho! Podes tentar repetir menos vezes?"},
"toolboxHeader":function(d){return "Blocos"},
"toolboxHeaderDroplet":function(d){return "Caixa de ferramentas"},
"totalNumLinesOfCodeWritten":function(d){return "Total de todos os tempos: "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tentar novamente"},
"tryBlocksBelowFeedback":function(d){return "Tente usar um dos blocos abaixo:"},
"tryHOC":function(d){return "Exprimenta a Hora de Código"},
"unnamedFunction":function(d){return "Tens uma variável ou uma função sem nome. Não te esqueças de dar um nome descritivo a tudo."},
"wantToLearn":function(d){return "Queres aprender a programar?"},
"watchVideo":function(d){return "Vê o vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando executar"},
"workspaceHeaderShort":function(d){return "Espaço de trabalho: "}};