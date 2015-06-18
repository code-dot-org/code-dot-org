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
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Recomeçar"},
"clearPuzzleConfirm":function(d){return "Esta acção faz o teu puzzle voltar ao seu estado inicial apagando todos os blocos que adicionaste ou alteraste."},
"clearPuzzleConfirmHeader":function(d){return "Tens a certeza de que pretendes recomeçar?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Vê o código gerado em Javascript."},
"continue":function(d){return "Continuar"},
"defaultTwitterText":function(d){return "Check out what I made"},
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
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
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
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
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
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
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
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "retorno"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repetir\" ou \"Se\" precisam de incluir blocos dentro para funcionar. Garante que o bloco interno encaixa correctamente dentro do bloco que o contém."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa de ter outros blocos dentro dele para funcionar."},
"emptyFunctionalBlock":function(d){return "Há um bloco com um valor por preencher."},
"end":function(d){return "terminar"},
"errorEmptyFunctionBlockModal":function(d){return "É necessário haver blocos dentro da definição da sua função. Clique em \"editar\" e arraste blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clica em \"editar\" para teres a certeza de que não há blocos a faltar dentro da definição da função."},
"errorParamInputUnattached":function(d){return "Lembre-se de anexar um bloco para cada parâmetro de entrada no bloco da função na sua área de trabalho."},
"errorQuestionMarksInNumberField":function(d){return "Experimenta substituir \"???\" por um valor."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para a sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro para dentro da definição da sua função."},
"errorUnusedFunction":function(d){return "Criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e certifique-se que a usa no seu programa."},
"errorUnusedParam":function(d){return "Adicionou um bloco de parâmetro, mas não o usou na definição. Certifique-se que usa o seu parâmetro clicando em \"editar\" e pondo o bloco de parâmetro dentro do bloco verde."},
"extraTopBlocks":function(d){return "Há um bloco perdido."},
"extraTopBlocksWhenRun":function(d){return "Há blocos perdidos. Pretende anexá-los ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Concluíste a etapa final."},
"finalStageTrophies":function(d){return "Parabéns! Concluíste a etapa final e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Terminar"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam código em blocos (por exemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Mas, na verdade, os blocos que juntaste podem ser vistos em JavaScript, que é a linguagem de programação mais utilizada no mundo:"},
"genericFeedback":function(d){return "Vê como ficou e tenta que o teu programa funcione."},
"hashError":function(d){return "Desculpa, '%1' não corresponde a qualquer programa gravado."},
"help":function(d){return "Ajuda"},
"hideToolbox":function(d){return "(Esconder)"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"hintRequest":function(d){return "Ver pista"},
"hintTitle":function(d){return "Pista:"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "saltar"},
"keepPlaying":function(d){return "Continuar a jogar"},
"levelIncompleteError":function(d){return "Estás a usar todos os tipos necessários de blocos, mas não da forma certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Cria o teu próprio Flappy Bird"},
"missingBlocksErrorMsg":function(d){return "Tenta um ou mais blocos dos seguintes para resolver o puzzle."},
"nextLevel":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+" e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Parabéns! Concluíste a etapa "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Concluíste a etapa "+common_locale.v(d,"stageName")+" e ganhaste "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Concluíste o desafio "+common_locale.v(d,"puzzleNumber")+". (No entanto, podias ter usado apenas "+common_locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":common_locale.n(d,"numBlocks")+" blocos"})+".)"},
"numLinesOfCodeWritten":function(d){return "Acabaste de escrever "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código!"},
"openWorkspace":function(d){return "Como funciona"},
"orientationLock":function(d){return "Desativa o bloqueio de orientação em configurações do dispositivo."},
"play":function(d){return "Jogar"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Desafio "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Repor"},
"rotateText":function(d){return "Roda o teu dispositivo."},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Executa o programa definido pelos blocos na área de trabalho."},
"saveToGallery":function(d){return "Guardar na galeria"},
"savedToGallery":function(d){return "Guardado na galeria!"},
"score":function(d){return "pontuação"},
"shareFailure":function(d){return "Não é possível partilhar este programa."},
"showBlocksHeader":function(d){return "Mostrar os blocos"},
"showCodeHeader":function(d){return "Mostrar o código"},
"showGeneratedCode":function(d){return "Mostrar o código"},
"showTextHeader":function(d){return "Show Text"},
"showToolbox":function(d){return "Mostrar caixa de ferramentas"},
"signup":function(d){return "Inscreve-te no curso de iniciação"},
"stringEquals":function(d){return "Sequência de caracteres =?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Necessita de corrigir um erro no seu programa antes de que este possa ser mostrado como blocos."},
"tooFewBlocksMsg":function(d){return "Estás a usar todos os tipos de blocos necessários, mas tenta usar mais alguns desses blocos para concluíres este desafio."},
"tooManyBlocksMsg":function(d){return "Este puzzle pode ser resolvido com <x id='START_SPAN'/><x id='END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Fizeste-me ter muito trabalho! Podes tentar repetir menos vezes?"},
"toolboxHeader":function(d){return "blocos"},
"toolboxHeaderDroplet":function(d){return "Caixa de ferramentas"},
"totalNumLinesOfCodeWritten":function(d){return "Total de todos os tempos: "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Voltar a tentar"},
"tryHOC":function(d){return "Exprimenta a Hora de Código"},
"wantToLearn":function(d){return "Queres aprender a programar?"},
"watchVideo":function(d){return "Vê o vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando executar"},
"workspaceHeaderShort":function(d){return "Espaço de trabalho: "}};