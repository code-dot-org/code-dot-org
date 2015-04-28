var locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "e"},
"booleanTrue":function(d){return "verdadeiro"},
"booleanFalse":function(d){return "falso"},
"blocks":function(d){return "blocos"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Ações"},
"catColour":function(d){return "Cor"},
"catLogic":function(d){return "Lógica"},
"catLists":function(d){return "Listas"},
"catLoops":function(d){return "Laços"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Começar do início"},
"clearPuzzleConfirm":function(d){return "Esta ação retornará o desafio a seu estado inicial e excluirá todos os blocos que você adicionou ou alterou."},
"clearPuzzleConfirmHeader":function(d){return "Tem certeza de que deseja começar do início?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Veja o código JavaScript gerado."},
"continue":function(d){return "Continue"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Modo de design"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "L"},
"directionWestLetter":function(d){return "O"},
"dropletBlock_addOperator_description":function(d){return "Adiciona dois números"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Retorna verdadeiro somente quando ambas as expressões forem verdadeiras e falso caso contrário"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operador booleano E"},
"dropletBlock_arcLeft_description":function(d){return "Move a tartaruga em um arco no sentido anti-horário usando o número de graus e o raio especificados"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "raio"},
"dropletBlock_arcRight_description":function(d){return "Move a tartaruga em um arco no sentido horário usando o número de graus e o raio especificados"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "raio"},
"dropletBlock_assign_x_description":function(d){return "Altera a atribuição de uma variável"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Cria um botão e atribui a ele um id de elemento"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "texto"},
"dropletBlock_callMyFunction_description":function(d){return "Chama uma função nomeada que não recebe parâmetros"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Chame uma função"},
"dropletBlock_callMyFunction_n_description":function(d){return "Chama uma função nomeada que recebe um ou mais parâmetros"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Chamar uma função com parâmetros"},
"dropletBlock_changeScore_description":function(d){return "Adiciona ou remove um ponto."},
"dropletBlock_checkbox_description":function(d){return "Cria uma caixa de verificação e atribui a ela um id de elemento"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Desenha um círculo na tela ativa com as coordenadas especificadas para o centro (x, y) e o raio"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "raio"},
"dropletBlock_clearCanvas_description":function(d){return "Limpa todos os dados na tela ativa"},
"dropletBlock_clearInterval_description":function(d){return "Limpa um temporizador de intervalo existente passando o valor retornado por setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Limpa um temporizador existente passando o valor retornado por setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Exibe a string ou a variável na tela do console"},
"dropletBlock_console.log_param0":function(d){return "mensagem"},
"dropletBlock_container_description":function(d){return "Cria um contêiner de divisão com o id de elemento especificado e, opcionalmente, define seu HTML interno"},
"dropletBlock_createCanvas_description":function(d){return "Cria uma tela com o id especificado e, opcionalmente, define as dimensões de largura e altura"},
"dropletBlock_createCanvas_param0":function(d){return "telaId"},
"dropletBlock_createCanvas_param1":function(d){return "largura"},
"dropletBlock_createCanvas_param2":function(d){return "altura"},
"dropletBlock_createRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, cria um registro com um id único no nome da tabela fornecido e chama a callbackFunction quando a ação estiver terminada."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "registro"},
"dropletBlock_createRecord_param2":function(d){return "função"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Cria uma variável e a inicializa como um array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Declara uma variável com o nome dado após \"var\" e atribui a ela o valor do lado direito da expressão"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declarar uma variável"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Cria uma variável e atribui a ela um valor por meio da exibição de uma janela para a inserção do valor"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Exclui o elemento com o id especificado"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, exclui o registro fornecido em tableName. O registro é um objeto que deve ser identificado de forma única com seu campo id. Quando a chamada estiver completa, callbackFunction é chamada."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "registro"},
"dropletBlock_deleteRecord_param2":function(d){return "função"},
"dropletBlock_divideOperator_description":function(d){return "Divide dois números"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Desenha um ponto na posição da tartaruga com o raio especificado"},
"dropletBlock_dot_param0":function(d){return "raio"},
"dropletBlock_drawImage_description":function(d){return "Desenha uma imagem na tela ativa com o elemento de imagem especificado e x, y como as coordenadas superiores esquerdas"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "largura"},
"dropletBlock_drawImage_param4":function(d){return "altura"},
"dropletBlock_dropdown_description":function(d){return "Cria um menu suspenso, atribui um id de elemento a ele e preenche-o com uma lista de itens"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Teste de igualdade"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Cria um laço que consiste em uma expressão de inicialização, uma expressão condicional, uma expressão de incremento e um bloco de instruções executadas para cada repetição do laço"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "laço para"},
"dropletBlock_functionParams_n_description":function(d){return "Um conjunto de instruções que recebe um ou mais parâmetros e realiza uma tarefa ou calcula um valor quando a função for chamada"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Defina uma função com parâmetros"},
"dropletBlock_functionParams_none_description":function(d){return "Um conjunto de instruções que realizam uma tarefa ou calculam um valor quando a função for chamada"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definir uma função"},
"dropletBlock_getAlpha_description":function(d){return "Obtém o alfa"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Obtém o atributo dado"},
"dropletBlock_getBlue_description":function(d){return "Obtém a quantidade de azul (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem."},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Obtém o estado de um botão de rádio ou caixa de verificação"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Obtém a direção da tartaruga (0 grau aponta para cima)"},
"dropletBlock_getGreen_description":function(d){return "Obtém a quantidade de verde (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem."},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Obtém os dados de imagem de um retângulo (x, y, largura, altura) dentro da tela ativa"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Obtém a URL associada a uma imagem ou botão de upload de imagem"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Recupera o valor armazenado na chave fornecida no armazenamento chave/valor do Laboratório de Aplicativo. O valor é retornado como um parâmetro para callbackFunction quando a recuperação for finalizada."},
"dropletBlock_getKeyValue_param0":function(d){return "chave"},
"dropletBlock_getKeyValue_param1":function(d){return "função"},
"dropletBlock_getRed_description":function(d){return "Obtém a quantidade de vermelho (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem."},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Obtém o texto do elemento especificado"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Obtém o tempo atual em milissegundos"},
"dropletBlock_getUserId_description":function(d){return "Obtém um identificador único para o usuário atual desse aplicativo"},
"dropletBlock_getX_description":function(d){return "Obtém a coordenada x atual da tartaruga em pixels"},
"dropletBlock_getXPosition_description":function(d){return "Obtém a posição x do elemento"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Obtém a coordenada y atual da tartaruga em pixels"},
"dropletBlock_getYPosition_description":function(d){return "Obtém a posição y do elemento"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compara dois números"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Oculta a tartaruga para que ela não seja mostrada na tela"},
"dropletBlock_hideElement_description":function(d){return "Oculta o elemento com o id especificado"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_ifBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "instrução if"},
"dropletBlock_ifElseBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira. Caso contrário, o bloco de instruções na cláusula senão é executado"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "instrução se/senão"},
"dropletBlock_image_description":function(d){return "Cria uma imagem e atribui a ela um id de elemento"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_imageUploadButton_description":function(d){return "Cria um botão de upload de imagem a atribui a ele um id de elemento"},
"dropletBlock_inequalityOperator_description":function(d){return "Teste de desigualdade"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Define o HTML interno para o elemento com o id especificado"},
"dropletBlock_lessThanOperator_description":function(d){return "Compara dois números"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Desenha uma linha na tela ativa de x1, y1 até x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Pega o valor absoluto de x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Pega o valor máximo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Pega o valor mínimo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Arredonda para o inteiro mais próximo"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Move a tartaruga de sua posição atual. Adiciona x à posição x da tartaruga e y à posição y da tartaruga"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move a tartaruga para trás um dado número de pixels em sua direção atual"},
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_description":function(d){return "Move a tartaruga para a frente um dado número de pixels em sua direção atual"},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveTo_description":function(d){return "Move a tartaruga para uma coordenada x, y específica na tela"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplica dois números"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Retorna falso se a expressão puder ser convertida em verdadeiro. Caso contrário, retorna verdadeiro"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operador booleano E"},
"dropletBlock_onEvent_description":function(d){return "Execute o código em resposta ao evento especificado."},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param1":function(d){return "evento"},
"dropletBlock_onEvent_param2":function(d){return "função"},
"dropletBlock_orOperator_description":function(d){return "Retorna verdadeiro se qualquer expressão for verdadeira e falso caso contrário"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Operador booleano OU"},
"dropletBlock_penColor_description":function(d){return "Define a cor da linha desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penColor_param0":function(d){return "cor"},
"dropletBlock_penColour_description":function(d){return "Define a cor da linha desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penColour_param0":function(d){return "cor"},
"dropletBlock_penDown_description":function(d){return "Faz com que uma linha seja desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penUp_description":function(d){return "Para de desenhar uma linha atrás da tartaruga conforme ela se move"},
"dropletBlock_penWidth_description":function(d){return "Define a tartaruga com a largura de caneta especificada"},
"dropletBlock_penWidth_param0":function(d){return "largura"},
"dropletBlock_playSound_description":function(d){return "Reproduz o arquivo de som MP3, OGG ou WAV da URL especificada"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Define a ImageData para um retângulo dentro da tela ativa com x, y como as coordenadas superiores esquerdas"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Cria um botão de rádio e atribui a ele um id de elemento"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Obtém um número aleatório entre 0 e o valor máximo especificado"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Obtém um número aleatório entre o valor mínimo e o valor máximo especificados"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, lê os registros da tableName fornecida que correspondem a searchTerms. Quando a chamada estiver completa, callbackFunction é chamada e o array de registros é passado."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "função"},
"dropletBlock_rect_description":function(d){return "Desenha um retângulo na tela ativa posicionado em upperLeftX e upperLeftY, com tamanho, largura e altura."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "largura"},
"dropletBlock_rect_param3":function(d){return "altura"},
"dropletBlock_return_description":function(d){return "Retorna um valor de uma função"},
"dropletBlock_return_signatureOverride":function(d){return "retorno"},
"dropletBlock_setActiveCanvas_description":function(d){return "Define o id da tela para comandos de tela subsequentes (somente necessário quando há vários elementos de tela)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setAlpha_description":function(d){return "Define o valor dado"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Define o valor dado"},
"dropletBlock_setBackground_description":function(d){return "Define a imagem de fundo"},
"dropletBlock_setBlue_description":function(d){return "Define a quantidade de azul (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada blueValue."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Define o estado de um botão de rádio ou caixa de verificação"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Define a cor de preenchimento para a tela ativa"},
"dropletBlock_setFillColor_param0":function(d){return "cor"},
"dropletBlock_setGreen_description":function(d){return "Define a quantidade de verde (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada greenValue."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Define a URL para o id de elemento da imagem especificada"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setInterval_description":function(d){return "Continua a executar o código toda vez que passar um número específico de milissegundos"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "milissegundos"},
"dropletBlock_setKeyValue_description":function(d){return "Armazena um par chave/valor no Laboratório de Aplicativo e chama callbackFunction quando a ação estiver concluída."},
"dropletBlock_setKeyValue_param0":function(d){return "chave"},
"dropletBlock_setKeyValue_param1":function(d){return "valor"},
"dropletBlock_setKeyValue_param2":function(d){return "função"},
"dropletBlock_setParent_description":function(d){return "Define um elemento para se tornar o filho de um elemento pai"},
"dropletBlock_setPosition_description":function(d){return "Posiciona um elemento com as coordenadas x, y, largura e altura"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "largura"},
"dropletBlock_setPosition_param4":function(d){return "altura"},
"dropletBlock_setRed_description":function(d){return "Define a quantidade de vermelho (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada redValue."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "vermelho"},
"dropletBlock_setRGB_param4":function(d){return "verde"},
"dropletBlock_setRGB_param5":function(d){return "azul"},
"dropletBlock_setStrokeColor_description":function(d){return "Define a cor do traço para a tela ativa"},
"dropletBlock_setStrokeColor_param0":function(d){return "cor"},
"dropletBlock_setSprite_description":function(d){return "Define a imagem do personagem"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Define o humor do personagem"},
"dropletBlock_setSpritePosition_description":function(d){return "Move um personagem instantaneamente para o local especificado."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Define a velocidade de um personagem"},
"dropletBlock_setStrokeWidth_description":function(d){return "Define a largura da linha para a tela ativa"},
"dropletBlock_setStrokeWidth_param0":function(d){return "largura"},
"dropletBlock_setStyle_description":function(d){return "Adiciona estilo de texto CSS a um elemento"},
"dropletBlock_setText_description":function(d){return "Define o texto para o elemento especificado"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "texto"},
"dropletBlock_setTimeout_description":function(d){return "Define um temporizador e executa o código quando o número de milissegundos tiver passado"},
"dropletBlock_setTimeout_param0":function(d){return "função"},
"dropletBlock_setTimeout_param1":function(d){return "milissegundos"},
"dropletBlock_show_description":function(d){return "Mostra a tartaruga na tela, tornando-a visível em sua posição atual"},
"dropletBlock_showElement_description":function(d){return "Mostra o elemento com o id especificado"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_speed_description":function(d){return "Altera a velocidade de execução do programa para o valor de porcentagem especificado"},
"dropletBlock_speed_param0":function(d){return "valor"},
"dropletBlock_startWebRequest_description":function(d){return "Solicita dados da internet e executa o código quando a solicitação estiver completa"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param1":function(d){return "função"},
"dropletBlock_subtractOperator_description":function(d){return "Subtrai dois números"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Cria uma entrada de texto e atribui a ela um id de elemento"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "texto"},
"dropletBlock_textLabel_description":function(d){return "Cria um rótulo de texto, atribui a ele um id de elemento e vincula-o a um elemento associado"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "texto"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Lança um projétil com o personagem especificado."},
"dropletBlock_turnLeft_description":function(d){return "Vira a tartaruga em sentido anti-horário de acordo com o número de graus especificado"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Vira a tartaruga em sentido horário de acordo com o número de graus especificado"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Vira a tartaruga na direção especificada (0 grau aponta para cima)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, atualiza o registro fornecido em tableName. O registro deve ser identificado de forma única com seu campo id. Quando a chamada estiver completa, callbackFunction é chamada"},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "registro"},
"dropletBlock_updateRecord_param2":function(d){return "função"},
"dropletBlock_vanish_description":function(d){return "Faz o personagem desaparecer."},
"dropletBlock_whileBlock_description":function(d){return "Cria um laço que consiste em uma expressão condicional e um bloco de instruções executadas para cada repetição do laço. A execução do laço continua enquanto a condição for verdadeira"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "laço enquanto"},
"dropletBlock_write_description":function(d){return "Cria um bloco de texto"},
"dropletBlock_write_param0":function(d){return "texto"},
"end":function(d){return "fim"},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repita\" ou \"Se\" precisam de outros blocos para funcionar. Verifique se o bloco de dentro se ajusta corretamente ao bloco principal."},
"emptyFunctionalBlock":function(d){return "Você tem um bloco com uma entrada sem preencher."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa ter outros blocos dentro dele para funcionar."},
"errorEmptyFunctionBlockModal":function(d){return "Deve haver blocos dentro de sua definição de função. Clique em \"editar\" e arraste os blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clique em \"editar\" para verificar se não faltam blocos em sua definição de função."},
"errorParamInputUnattached":function(d){return "Lembre-se de associar um bloco a cada parâmetro de entrada no bloco de função em sua área de trabalho."},
"errorUnusedParam":function(d){return "Você adicionou um bloco de parâmetro, mas não o usou na definição. Não deixe de usar seu parâmetro, clique em \"editar\" e coloque o bloco de parâmetro dentro do bloco verde."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro em sua definição de função."},
"errorUnusedFunction":function(d){return "Você criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e não deixe de usá-la em seu programa."},
"errorQuestionMarksInNumberField":function(d){return "Tente substituir \"???\" por um valor."},
"extraTopBlocks":function(d){return "Você tem blocos não anexados."},
"extraTopBlocksWhenRun":function(d){return "Você tem blocos não anexados. Você queria anexar esses blocos ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Você concluiu a fase final."},
"finalStageTrophies":function(d){return "Parabéns! Você concluiu a última fase e ganhou "+locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Concluir"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam codificação em blocos (por exemplo, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Mas na verdade, os blocos que você juntou podem ser vistos em JavaScript, a linguagem de codificação mais usada em todo o mundo:"},
"hashError":function(d){return "Nenhum programa salvo corresponde a '%1'."},
"help":function(d){return "Ajuda"},
"hintTitle":function(d){return "Dica:"},
"jump":function(d){return "pule"},
"keepPlaying":function(d){return "Continuar"},
"levelIncompleteError":function(d){return "Você está usando todos os tipos de blocos necessários, mas não na ordem certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crie seu próprio jogo Flappy bird"},
"missingBlocksErrorMsg":function(d){return "Tente usar um ou mais dos blocos abaixo para resolver esse desafio."},
"nextLevel":function(d){return "Parabéns! Você completou o Desafio "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Você completou o Desafio "+locale.v(d,"puzzleNumber")+" e ganhou "+locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Parabéns! Você completou "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Você completou "+locale.v(d,"stageName")+" e ganhou "+locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Você completou o Desafio "+locale.v(d,"puzzleNumber")+". (Mas você poderia ter usado apenas "+locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":locale.n(d,"numBlocks")+" blocos"})+")."},
"numLinesOfCodeWritten":function(d){return "Você escreveu "+locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":locale.n(d,"numLines")+" linhas"})+" de código!"},
"play":function(d){return "jogue"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Desafio "+locale.v(d,"puzzle_number")+" de "+locale.v(d,"stage_total")},
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Recomeçar"},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Execute o programa definido pelos blocos na área de trabalho."},
"score":function(d){return "pontuação"},
"showCodeHeader":function(d){return "Mostrar código"},
"showBlocksHeader":function(d){return "Mostrar blocos"},
"showGeneratedCode":function(d){return "Mostrar código"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"textVariable":function(d){return "texto"},
"tooFewBlocksMsg":function(d){return "Você está usando todos os tipos necessários de blocos, mas tente usar mais tipos de blocos para completar esse desafio."},
"tooManyBlocksMsg":function(d){return "Esse desafio pode ser resolvido com < x id='START_SPAN'/>< x id= 'END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Você me fez trabalhar bastante! Podemos tentar repetindo menos vezes?"},
"toolboxHeader":function(d){return "blocos"},
"toolboxHeaderDroplet":function(d){return "Caixa de ferramentas"},
"hideToolbox":function(d){return "(Ocultar)"},
"showToolbox":function(d){return "Mostrar caixa de ferramentas"},
"openWorkspace":function(d){return "Como funciona"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tente novamente"},
"hintRequest":function(d){return "Veja a dica"},
"backToPreviousLevel":function(d){return "Voltar ao nível anterior"},
"saveToGallery":function(d){return "Salvar na galeria"},
"savedToGallery":function(d){return "Salvo na galeria!"},
"shareFailure":function(d){return "Desculpe, não é possível compartilhar esse programa."},
"workspaceHeaderShort":function(d){return "Área de trabalho: "},
"infinity":function(d){return "Infinito"},
"rotateText":function(d){return "Gire seu dispositivo."},
"orientationLock":function(d){return "Desative o bloqueio de orientação nas configurações do dispositivo."},
"wantToLearn":function(d){return "Quer aprender a programar?"},
"watchVideo":function(d){return "Assista ao vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando executar"},
"tryHOC":function(d){return "Tente a Hora do Código"},
"signup":function(d){return "Cadastre-se para o curso introdutório"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"genericFeedback":function(d){return "Veja como você terminou e tente consertar seu programa."},
"toggleBlocksErrorMsg":function(d){return "Você precisa corrigir um erro em seu programa antes que ele possa ser mostrado como blocos."},
"defaultTwitterText":function(d){return "Veja o que eu fiz"}};