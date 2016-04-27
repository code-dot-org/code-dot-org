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
"catLoops":function(d){return "Laços"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Começar do início"},
"clearPuzzleConfirm":function(d){return "Esta ação retornará o desafio a seu estado inicial e excluirá todos os blocos que você adicionou ou alterou."},
"clearPuzzleConfirmHeader":function(d){return "Tem certeza de que deseja começar do início?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Veja o código JavaScript gerado."},
"completedWithoutRecommendedBlock":function(d){return "Parabéns! Você completou o desafio "+common_locale.v(d,"puzzleNumber")+". (Mas você poderia usar um bloco diferente para melhorar seu código)."},
"continue":function(d){return "Continue"},
"copy":function(d){return "Copiar"},
"defaultTwitterText":function(d){return "Veja o que eu fiz"},
"designMode":function(d){return "Design"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "L"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "O"},
"dropletBlock_addOperator_description":function(d){return "Adiciona dois números"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Adicione um operador"},
"dropletBlock_andOperator_description":function(d){return "Retorna verdadeiro somente quando ambas as expressões forem verdadeiras e falso caso contrário"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operador booleano E"},
"dropletBlock_assign_x_description":function(d){return "Atribui um valor a uma variável existente. Por exemplo, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "O nome da variável a ser atribuída o valor"},
"dropletBlock_assign_x_param1":function(d){return "valor"},
"dropletBlock_assign_x_param1_description":function(d){return "O valor atribuído à variável."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Atribua uma variável"},
"dropletBlock_callMyFunction_description":function(d){return "Chama uma função nomeada que não recebe parâmetros"},
"dropletBlock_callMyFunction_n_description":function(d){return "Chama uma função nomeada que recebe um ou mais parâmetros"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Chamar uma função com parâmetros"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Chame uma função"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Declare uma variável e atribua-a a um array com os valores iniciais fornecidos"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "O nome que você vai usar no programa para referenciar a variável"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1, 2, 3, 4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Os valores iniciais do array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare uma variável atribuída a um array"},
"dropletBlock_declareAssign_x_description":function(d){return "Declara uma variável com o nome dado após \"var\" e atribui a ela o valor do lado direito da expressão"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "O nome que você vai usar no programa para referenciar a variável"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "O valor inicial da variável"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Declara que o código vai usar uma variável e atribui a ela o valor inicial fornecido pelo usuário"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "O nome que você vai usar no programa para referenciar a variável"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Insira o valor\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "A string que o usuário vai ver quando surgir o campo para ele inserir um valor"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Solicite um valor ao usuário e armazene-o"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "O nome que você vai usar no programa para referenciar a variável"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Insira o valor\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "A string que o usuário vai ver quando surgir o campo para ele inserir um valor"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declarar uma variável"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declarar uma variável"},
"dropletBlock_divideOperator_description":function(d){return "Divide dois números"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divida o operador"},
"dropletBlock_equalityOperator_description":function(d){return "Testa se dois valores são iguais. Retorna verdadeiro se o valor do lado esquerdo da expressão for igual ao valor do lado direito da expressão e falso caso contrário"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "O primeiro valor usado para comparação."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "O segundo valor usado para comparação."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operador de igualdade"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Cria um laço que consiste em uma expressão de inicialização, uma expressão condicional, uma expressão de incremento e um bloco de instruções executadas para cada repetição do laço"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "laço para"},
"dropletBlock_functionParams_n_description":function(d){return "Um conjunto de instruções que recebe um ou mais parâmetros e realiza uma tarefa ou calcula um valor quando a função for chamada"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Defina uma função com parâmetros"},
"dropletBlock_functionParams_none_description":function(d){return "Um conjunto de instruções que realizam uma tarefa ou calculam um valor quando a função for chamada"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definir uma função"},
"dropletBlock_getTime_description":function(d){return "Obtém o tempo atual em milissegundos"},
"dropletBlock_greaterThanOperator_description":function(d){return "Testa se um número é maior que outro número. Retorna verdadeiro se o valor do lado esquerdo da expressão for estritamente maior que o valor do lado direito da expressão"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "O primeiro valor usado para comparação."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "O segundo valor usado para comparação."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Operador maior que"},
"dropletBlock_ifBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "instrução if"},
"dropletBlock_ifElseBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira. Caso contrário, o bloco de instruções na cláusula senão é executado"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "instrução se/senão"},
"dropletBlock_inequalityOperator_description":function(d){return "Testa se dois valores não são iguais. Retorna verdadeiro se o valor do lado esquerdo da expressão não for igual ao valor do lado direito da expressão"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "O primeiro valor usado para comparação."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "O segundo valor usado para comparação."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Operador de desigualdade"},
"dropletBlock_lessThanOperator_description":function(d){return "Testa se um valor é menor que outro valor. Retorna verdadeiro se o valor do lado esquerdo da expressão for estritamente menor que o valor do lado direito da expressão"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "O primeiro valor usado para comparação."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "O segundo valor usado para comparação."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Operador menor que"},
"dropletBlock_mathAbs_description":function(d){return "Pega o valor absoluto de x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "Um número arbitrário."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Pega o valor máximo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "Um ou mais números para comparar."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Pega o valor mínimo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "Um ou mais números para comparar."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Retorna um número aleatório, variando de 0 (inclusivo) até, mas não incluindo, 1 (exclusivo)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Arredonda um número para o inteiro mais próximo"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "Um número arbitrário."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplica dois números"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Operador de multiplicação"},
"dropletBlock_notOperator_description":function(d){return "Retorna falso se a expressão puder ser convertida em verdadeiro. Caso contrário, retorna verdadeiro"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operador booleano NÃO"},
"dropletBlock_orOperator_description":function(d){return "Retorna verdadeiro se qualquer expressão for verdadeira e falso caso contrário"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Operador booleano OU"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Retorna um número aleatório do intervalo que vai do primeiro número (min) até o segundo número (max), incluindo ambos os números no intervalo"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "O número mínimo retornado"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "O número máximo retornado"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Retorna um valor de uma função"},
"dropletBlock_return_signatureOverride":function(d){return "retorno"},
"dropletBlock_setAttribute_description":function(d){return "Define o valor dado"},
"dropletBlock_subtractOperator_description":function(d){return "Subtrai dois números"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Operador de subtração"},
"dropletBlock_whileBlock_description":function(d){return "Cria um laço que consiste em uma expressão condicional e um bloco de instruções executadas para cada repetição do laço. A execução do laço continua enquanto a condição for verdadeira"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "laço enquanto"},
"emptyBlockInFunction":function(d){return "A função "+common_locale.v(d,"name")+" tem uma entrada não preenchida."},
"emptyBlockInVariable":function(d){return "A variável "+common_locale.v(d,"name")+" tem uma entrada não preenchida."},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repita\" ou \"Se\" precisam de outros blocos para funcionar. Verifique se o bloco de dentro se ajusta corretamente ao bloco principal."},
"emptyExampleBlockErrorMsg":function(d){return "Você precisa de pelo menos dois exemplos na função "+common_locale.v(d,"functionName")+". Verifique se cada exemplo tem uma chamada e um resultado."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa ter outros blocos dentro dele para funcionar."},
"emptyFunctionalBlock":function(d){return "Você tem um bloco com uma entrada sem preencher."},
"emptyTopLevelBlock":function(d){return "Não há blocos para executar. Você deve anexar um bloco ao bloco "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "fim"},
"errorEmptyFunctionBlockModal":function(d){return "Deve haver blocos dentro de sua definição de função. Clique em \"editar\" e arraste os blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clique em \"editar\" para verificar se não faltam blocos em sua definição de função."},
"errorParamInputUnattached":function(d){return "Lembre-se de associar um bloco a cada parâmetro de entrada no bloco de função em sua área de trabalho."},
"errorQuestionMarksInNumberField":function(d){return "Tente substituir \"???\" por um valor."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro em sua definição de função."},
"errorUnusedFunction":function(d){return "Você criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e não deixe de usá-la em seu programa."},
"errorUnusedParam":function(d){return "Você adicionou um bloco de parâmetro, mas não o usou na definição. Não deixe de usar seu parâmetro, clique em \"editar\" e coloque o bloco de parâmetro dentro do bloco verde."},
"exampleErrorMessage":function(d){return "A função "+common_locale.v(d,"functionName")+" tem um ou mais exemplos que precisam de ajuste. Verifique se correspondem à definição e responda à pergunta."},
"examplesFailedOnClose":function(d){return "Um ou mais dos seus exemplos não correspondem à definição. Verifique seus exemplos antes de fechar"},
"extraTopBlocks":function(d){return "Você tem blocos não anexados."},
"extraTopBlocksWhenRun":function(d){return "Você tem blocos não anexados. Você queria anexar esses blocos ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Você concluiu a etapa final."},
"finalStageTrophies":function(d){return "Parabéns! Você concluiu a fase final e ganhou "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Concluir"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam codificação em blocos (por exemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Mas na verdade, os blocos que você juntou podem ser vistos em JavaScript, a linguagem de codificação mais usada em todo o mundo:"},
"hashError":function(d){return "Nenhum programa salvo corresponde a '%1'."},
"help":function(d){return "Ajuda"},
"hideToolbox":function(d){return "(Ocultar)"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"hintRequest":function(d){return "Veja a dica"},
"hintTitle":function(d){return "Dica:"},
"ignore":function(d){return "Ignorar"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "pule"},
"keepPlaying":function(d){return "Continuar"},
"levelIncompleteError":function(d){return "Você está usando todos os tipos de blocos necessários, mas não na ordem certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crie seu próprio jogo Flappy bird"},
"missingRecommendedBlocksErrorMsg":function(d){return "Não é bem assim. Tente usar um bloco que você ainda não esteja usando."},
"missingRequiredBlocksErrorMsg":function(d){return "Não é bem assim. Você tem que usar um bloco que ainda não está usando."},
"nestedForSameVariable":function(d){return "Você está usando a mesma variável dentro de dois ou mais laços aninhados. Use variáveis de nome único para evitar laços infinitos."},
"nextLevel":function(d){return "Parabéns! Você completou o Desafio "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Você completou o Desafio "+common_locale.v(d,"puzzleNumber")+" e ganhou "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"nextPuzzle":function(d){return "Próximo desafio"},
"nextStage":function(d){return "Parabéns! Você completou "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Você completou "+common_locale.v(d,"stageName")+" e ganhou "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Você completou o Desafio "+common_locale.v(d,"puzzleNumber")+". (Mas você poderia ter usado apenas "+common_locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":common_locale.n(d,"numBlocks")+" blocos"})+")."},
"numLinesOfCodeWritten":function(d){return "Você escreveu "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código!"},
"openWorkspace":function(d){return "Como funciona"},
"orientationLock":function(d){return "Desative o bloqueio de orientação nas configurações do dispositivo."},
"play":function(d){return "jogue"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Desafio "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Apenas visualizar: "},
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Recomeçar"},
"rotateText":function(d){return "Gire seu dispositivo."},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Execute o programa definido pelos blocos na área de trabalho."},
"runtimeErrorMsg":function(d){return "Seu programa não foi executado com sucesso. Remova a linha "+common_locale.v(d,"lineNumber")+" e tente novamente."},
"saveToGallery":function(d){return "Salvar na galeria"},
"savedToGallery":function(d){return "Salvo na galeria!"},
"score":function(d){return "pontuação"},
"sendToPhone":function(d){return "Enviar para o telefone"},
"shareFailure":function(d){return "Desculpe, não é possível compartilhar esse programa."},
"shareWarningsAge":function(d){return "Informe abaixo sua idade e clique em OK para continuar."},
"shareWarningsMoreInfo":function(d){return "Mais informações"},
"shareWarningsStoreData":function(d){return "Este aplicativo do Code Studio armazena informações que podem ser visualizadas por qualquer pessoa com este link de compartilhamento. Portanto, tenha cuidado caso seja solicitado que você forneça informações pessoais."},
"showBlocksHeader":function(d){return "Mostrar blocos"},
"showCodeHeader":function(d){return "Mostrar código"},
"showGeneratedCode":function(d){return "Mostrar código"},
"showTextHeader":function(d){return "Mostrar texto"},
"showToolbox":function(d){return "Mostrar caixa de ferramentas"},
"showVersionsHeader":function(d){return "Histórico de Versões"},
"signup":function(d){return "Cadastre-se para o curso introdutório"},
"stringEquals":function(d){return "string=?"},
"submit":function(d){return "Enviar"},
"submitYourProject":function(d){return "Enviar seu projeto"},
"submitYourProjectConfirm":function(d){return "Você não pode editar seu projeto depois de enviá-lo, deseja mesmo enviar?"},
"unsubmit":function(d){return "Cancelar envio"},
"unsubmitYourProject":function(d){return "Cancelar o envio do seu projeto"},
"unsubmitYourProjectConfirm":function(d){return "Desfazer o envio de seu projeto apagará a data de envio, tem certeza de que deseja fazer isso?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"syntaxErrorMsg":function(d){return "Seu programa contém um erro de digitação. Remova a linha "+common_locale.v(d,"lineNumber")+" e tente novamente."},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Você precisa corrigir um erro em seu programa antes que ele possa ser mostrado como blocos."},
"tooFewBlocksMsg":function(d){return "Você está usando todos os tipos necessários de blocos, mas tente usar mais estes tipos de blocos para completar este desafio."},
"tooManyBlocksMsg":function(d){return "Esse desafio pode ser resolvido com < x id='START_SPAN'/>< x id= 'END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Você me fez trabalhar bastante! Podemos tentar repetindo menos vezes?"},
"toolboxHeader":function(d){return "Blocos"},
"toolboxHeaderDroplet":function(d){return "Caixa de ferramentas"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tente novamente"},
"tryBlocksBelowFeedback":function(d){return "Tente usar um dos blocos abaixo:"},
"tryHOC":function(d){return "Tente a Hora do Código"},
"unnamedFunction":function(d){return "Você tem uma variável ou função que não tem nome. Não se esqueça de sempre usar nomes descritivos."},
"wantToLearn":function(d){return "Quer aprender a programar?"},
"watchVideo":function(d){return "Assista ao vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando executar"},
"workspaceHeaderShort":function(d){return "Área de trabalho: "}};