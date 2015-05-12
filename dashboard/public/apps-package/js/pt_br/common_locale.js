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
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Começar do início"},
"clearPuzzleConfirm":function(d){return "Esta ação retornará o desafio a seu estado inicial e excluirá todos os blocos que você adicionou ou alterou."},
"clearPuzzleConfirmHeader":function(d){return "Tem certeza de que deseja começar do início?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Veja o código JavaScript gerado."},
"continue":function(d){return "Continue"},
"defaultTwitterText":function(d){return "Veja o que eu fiz"},
"designMode":function(d){return "Design"},
"designModeHeader":function(d){return "Modo de design"},
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
"dropletBlock_arcLeft_description":function(d){return "Move a tartaruga para a frente e para a esquerda em um arco circular suave"},
"dropletBlock_arcLeft_param0":function(d){return "ângulo"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "raio"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Move a tartaruga para a frente e para a direita em um arco circular suave"},
"dropletBlock_arcRight_param0":function(d){return "ângulo"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "raio"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Atribui um valor a uma variável existente. Por exemplo, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "valor"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Atribua uma variável"},
"dropletBlock_button_description":function(d){return "Cria um botão no qual você pode clicar. O botão vai exibir o texto fornecido e pode ser referenciado pelo id determinado"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "texto"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "Chama uma função nomeada que não recebe parâmetros"},
"dropletBlock_callMyFunction_n_description":function(d){return "Chama uma função nomeada que recebe um ou mais parâmetros"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Chamar uma função com parâmetros"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Chame uma função"},
"dropletBlock_changeScore_description":function(d){return "Adiciona ou remove um ponto."},
"dropletBlock_checkbox_description":function(d){return "Cria uma caixa de verificação e atribui a ela um id de elemento"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "verificado"},
"dropletBlock_circle_description":function(d){return "Desenha um círculo na tela ativa com as coordenadas especificadas para o centro (x, y) e o raio"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "raio"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Limpa todos os dados na tela ativa"},
"dropletBlock_clearInterval_description":function(d){return "Limpa um temporizador de intervalo existente passando o valor retornado por setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "intervalo"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Limpa um temporizador existente passando o valor retornado por setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "tempo limite"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Exibe a string ou a variável na tela do console"},
"dropletBlock_console.log_param0":function(d){return "mensagem"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Cria um contêiner de divisão com o id de elemento especificado e, opcionalmente, define seu HTML interno"},
"dropletBlock_createCanvas_description":function(d){return "Cria uma tela com o id especificado e, opcionalmente, define as dimensões de largura e altura"},
"dropletBlock_createCanvas_param0":function(d){return "telaId"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "largura"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "altura"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, cria um registro com um id único no nome da tabela fornecido e chama a callbackFunction quando a ação estiver terminada."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "registro"},
"dropletBlock_createRecord_param2":function(d){return "função"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Declare uma variável e atribua-a a um array com os valores iniciais fornecidos"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare uma variável atribuída a um array"},
"dropletBlock_declareAssign_x_description":function(d){return "Declara uma variável com o nome dado após \"var\" e atribui a ela o valor do lado direito da expressão"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Declara que o código vai usar uma variável e atribui a ela o valor inicial fornecido pelo usuário"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Solicite um valor ao usuário e armazene-o"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declarar uma variável"},
"dropletBlock_deleteElement_description":function(d){return "Exclui o elemento com o id especificado"},
"dropletBlock_deleteElement_param0":function(d){return "id"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, exclui o registro fornecido em tableName. O registro é um objeto que deve ser identificado de forma única com seu campo id. Quando a chamada estiver completa, callbackFunction é chamada."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "registro"},
"dropletBlock_deleteRecord_param2":function(d){return "função"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Divide dois números"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divida o operador"},
"dropletBlock_dot_description":function(d){return "Desenha um ponto na posição da tartaruga com o raio especificado"},
"dropletBlock_dot_param0":function(d){return "raio"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Desenha a imagem ou elemento de tela especificado na posição especificada da tela ativa e, opcionalmente, dimensiona o elemento com a altura e a largura especificadas"},
"dropletBlock_drawImage_param0":function(d){return "id"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "largura"},
"dropletBlock_drawImage_param4":function(d){return "altura"},
"dropletBlock_dropdown_description":function(d){return "Cria um menu suspenso, atribui um id de elemento a ele e preenche-o com uma lista de itens"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, opção1, opção2, ..., opçãoX)"},
"dropletBlock_equalityOperator_description":function(d){return "Testa se dois valores são iguais. Retorna verdadeiro se o valor do lado esquerdo da expressão for igual ao valor do lado direito da expressão e falso caso contrário"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operador de igualdade"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Cria um laço que consiste em uma expressão de inicialização, uma expressão condicional, uma expressão de incremento e um bloco de instruções executadas para cada repetição do laço"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "laço para"},
"dropletBlock_functionParams_n_description":function(d){return "Um conjunto de instruções que recebe um ou mais parâmetros e realiza uma tarefa ou calcula um valor quando a função for chamada"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Defina uma função com parâmetros"},
"dropletBlock_functionParams_none_description":function(d){return "Um conjunto de instruções que realizam uma tarefa ou calculam um valor quando a função for chamada"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Definir uma função"},
"dropletBlock_getAlpha_description":function(d){return "Retorna a quantidade de alfa (opacidade) (variando de 0 a 255) na cor do pixel localizado na determinada posição x e y da imagem dada"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Obtém o atributo dado"},
"dropletBlock_getBlue_description":function(d){return "Obtém a quantidade de azul (variando de 0 a 255) na cor do pixel localizado na determinada posição x e y da imagem dada"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Obtém o estado de um botão de rádio ou caixa de verificação"},
"dropletBlock_getChecked_param0":function(d){return "id"},
"dropletBlock_getDirection_description":function(d){return "Retorna a direção atual para a qual a tartaruga está virada. 0 grau aponta para cima"},
"dropletBlock_getGreen_description":function(d){return "Obtém a quantidade de verde (variando de 0 a 255) na cor do pixel localizado na determinada posição x e y da imagem dada"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Retorna um objeto representando a imagem capturada da tela no intervalo de coordenadas de startX, startY a endX, endY"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Obtém a URL para o id do elemento da imagem fornecida"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Recupera o valor armazenado na chave fornecida no par chave/valor do armazenamento de dados do Laboratório de Aplicativo. O valor é retornado como um parâmetro para callbackFunction quando a recuperação estiver concluída"},
"dropletBlock_getKeyValue_param0":function(d){return "chave"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "função"},
"dropletBlock_getRed_description":function(d){return "Obtém a quantidade de vermelho (variando de 0 a 255) na cor do pixel localizado na determinada posição x e y da imagem dada"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Obtém o texto do elemento especificado"},
"dropletBlock_getText_param0":function(d){return "id"},
"dropletBlock_getTime_description":function(d){return "Obtém o tempo atual em milissegundos"},
"dropletBlock_getUserId_description":function(d){return "Obtém um identificador único para o usuário atual desse aplicativo"},
"dropletBlock_getXPosition_description":function(d){return "Obtém a posição x do elemento"},
"dropletBlock_getXPosition_param0":function(d){return "id"},
"dropletBlock_getX_description":function(d){return "Obtém a coordenada x atual da tartaruga em pixels"},
"dropletBlock_getYPosition_description":function(d){return "Obtém a posição y do elemento"},
"dropletBlock_getYPosition_param0":function(d){return "id"},
"dropletBlock_getY_description":function(d){return "Obtém a coordenada y atual da tartaruga em pixels"},
"dropletBlock_greaterThanOperator_description":function(d){return "Testa se um número é maior que outro número. Retorna verdadeiro se o valor do lado esquerdo da expressão for estritamente maior que o valor do lado direito da expressão"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Operador maior que"},
"dropletBlock_hideElement_description":function(d){return "Oculta o elemento com o id fornecido para que ele não seja mostrado na tela"},
"dropletBlock_hideElement_param0":function(d){return "id"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Oculta a tartaruga para que ela não seja mostrada na tela"},
"dropletBlock_ifBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "instrução if"},
"dropletBlock_ifElseBlock_description":function(d){return "Executa um bloco de instruções se a condição especificada for verdadeira. Caso contrário, o bloco de instruções na cláusula senão é executado"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "instrução se/senão"},
"dropletBlock_imageUploadButton_description":function(d){return "Cria um botão de upload de imagem a atribui a ele um id de elemento"},
"dropletBlock_image_description":function(d){return "Exibe a imagem da url fornecida na tela"},
"dropletBlock_image_param0":function(d){return "id"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "url"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Testa se dois valores não são iguais. Retorna verdadeiro se o valor do lado esquerdo da expressão não for igual ao valor do lado direito da expressão"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Operador de desigualdade"},
"dropletBlock_innerHTML_description":function(d){return "Define o HTML interno para o elemento com o id especificado"},
"dropletBlock_lessThanOperator_description":function(d){return "Testa se um valor é menor que outro valor. Retorna verdadeiro se o valor do lado esquerdo da expressão for estritamente menor que o valor do lado direito da expressão"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Operador menor que"},
"dropletBlock_line_description":function(d){return "Desenha uma linha na tela ativa de x1, y1 até x2, y2."},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
"dropletBlock_mathAbs_description":function(d){return "Pega o valor absoluto de x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Pega o valor máximo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Pega o valor mínimo entre um ou mais valores n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Arredonda um número para o inteiro mais próximo"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Move a tartaruga para trás um dado número de pixels em sua direção atual"},
"dropletBlock_moveBackward_param0":function(d){return "pixels"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Move a tartaruga para a frente um dado número de pixels em sua direção atual"},
"dropletBlock_moveForward_param0":function(d){return "pixels"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Move a tartaruga para uma coordenada x, y específica na tela"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Move a tartaruga de sua posição atual. Adiciona x à posição x da tartaruga e y à posição y da tartaruga"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplica dois números"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Operador de multiplicação"},
"dropletBlock_notOperator_description":function(d){return "Retorna falso se a expressão puder ser convertida em verdadeiro. Caso contrário, retorna verdadeiro"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operador booleano NÃO"},
"dropletBlock_onEvent_description":function(d){return "Executa o código da callbackFunction quando um evento específico ocorrer para o elemento especificado"},
"dropletBlock_onEvent_param0":function(d){return "id"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "evento"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "função"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_orOperator_description":function(d){return "Retorna verdadeiro se qualquer expressão for verdadeira e falso caso contrário"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Operador booleano OU"},
"dropletBlock_penColor_description":function(d){return "Define a cor da linha desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penColor_param0":function(d){return "cor"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penColour_description":function(d){return "Define a cor da linha desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penColour_param0":function(d){return "cor"},
"dropletBlock_penDown_description":function(d){return "Faz com que uma linha seja desenhada atrás da tartaruga conforme ela se move"},
"dropletBlock_penUp_description":function(d){return "Para de desenhar uma linha atrás da tartaruga conforme ela se move"},
"dropletBlock_penWidth_description":function(d){return "Altera o diâmetro dos círculos desenhados atrás da tartaruga conforme ela se move"},
"dropletBlock_penWidth_param0":function(d){return "largura"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Reproduz o arquivo de som MP3, OGG ou WAV da URL especificada"},
"dropletBlock_playSound_param0":function(d){return "url"},
"dropletBlock_putImageData_description":function(d){return "Coloca os dados da imagem de entrada no elemento da tela atual iniciando na posição startX, startY"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Cria um botão de rádio e o atribui a um grupo para a escolha a partir de um conjunto predefinido de opções. Apenas um botão de rádio pode ser selecionado por vez em um grupo"},
"dropletBlock_radioButton_param0":function(d){return "id"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "verificado"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "grupo"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_randomNumber_max_description":function(d){return "Retorna um número aleatório do intervalo de zero até o valor máximo, incluindo zero e o valor máximo no intervalo"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Retorna um número aleatório do intervalo que vai do primeiro número (min) até o segundo número (max), incluindo ambos os números no intervalo"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, lê os registros da tableName fornecida que correspondem a searchTerms. Quando a chamada estiver completa, callbackFunction é chamada e o array de registros é passado."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "função"},
"dropletBlock_rect_description":function(d){return "Desenha um retângulo na tela ativa posicionado em upperLeftX e upperLeftY, com tamanho, largura e altura."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "largura"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "altura"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Retorna um valor de uma função"},
"dropletBlock_return_signatureOverride":function(d){return "retorno"},
"dropletBlock_setActiveCanvas_description":function(d){return "Altera a tela ativa para a tela com o id especificado (outros comandos de tela afetam apenas a tela ativa)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Define a quantidade de alfa (opacidade) (variando de 0 a 255) na cor do pixel localizado na determinada posição x e y da imagem dada"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Define o valor dado"},
"dropletBlock_setBackground_description":function(d){return "Define a imagem de fundo"},
"dropletBlock_setBlue_description":function(d){return "Define a quantidade de azul (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada blueValue."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Define o estado de um botão de rádio ou caixa de verificação"},
"dropletBlock_setChecked_param0":function(d){return "id"},
"dropletBlock_setChecked_param1":function(d){return "verificado"},
"dropletBlock_setFillColor_description":function(d){return "Define a cor de preenchimento da tela ativa"},
"dropletBlock_setFillColor_param0":function(d){return "cor"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Define a quantidade de verde (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada greenValue."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Define a URL para o id do elemento da imagem fornecida"},
"dropletBlock_setImageURL_param0":function(d){return "id"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "url"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Executa o código da função de callback toda vez que um certo número de milissegundos passar, até que ela seja cancelada"},
"dropletBlock_setInterval_param0":function(d){return "função"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "milissegundos"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Armazena um par chave/valor no Laboratório de Aplicativo e chama callbackFunction quando a ação estiver concluída."},
"dropletBlock_setKeyValue_param0":function(d){return "chave"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "valor"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "função"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Define um elemento para se tornar o filho de um elemento pai"},
"dropletBlock_setPosition_description":function(d){return "Posiciona um elemento com as coordenadas x, y, largura e altura"},
"dropletBlock_setPosition_param0":function(d){return "id"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "largura"},
"dropletBlock_setPosition_param4":function(d){return "altura"},
"dropletBlock_setRGB_description":function(d){return "Define os valores de cor RGB (variando de 0 a 255) do pixel localizado na determinada posição x e y da imagem dada com as quantidades de entrada de vermelho, verde e azul"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "vermelho"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "verde"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "azul"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Define a quantidade de vermelho (no intervalo de 0 a 255) na cor do pixel localizado em uma dada posição x e y nos dados da imagem com o valor da entrada redValue."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Define o humor do personagem"},
"dropletBlock_setSpritePosition_description":function(d){return "Move um personagem instantaneamente para o local especificado."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Define a velocidade de um personagem"},
"dropletBlock_setSprite_description":function(d){return "Define a imagem do personagem"},
"dropletBlock_setStrokeColor_description":function(d){return "Define a cor do traço para a tela ativa"},
"dropletBlock_setStrokeColor_param0":function(d){return "cor"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Define a largura da linha para a tela ativa"},
"dropletBlock_setStrokeWidth_param0":function(d){return "largura"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Adiciona estilo de texto CSS a um elemento"},
"dropletBlock_setText_description":function(d){return "Define o texto para o elemento especificado"},
"dropletBlock_setText_param0":function(d){return "id"},
"dropletBlock_setText_param1":function(d){return "texto"},
"dropletBlock_setTimeout_description":function(d){return "Define um temporizador e executa o código quando o número de milissegundos tiver passado"},
"dropletBlock_setTimeout_param0":function(d){return "função"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "milissegundos"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Mostra o elemento com o id fornecido"},
"dropletBlock_showElement_param0":function(d){return "id"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Mostra a tartaruga na tela, tornando-a visível em sua posição atual"},
"dropletBlock_speed_description":function(d){return "Define a velocidade de execução para todo o aplicativo (o que inclui a velocidade da tartaruga). Espera um número entre 1 e 100."},
"dropletBlock_speed_param0":function(d){return "valor"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Solicita dados da internet e executa o código quando a solicitação estiver completa"},
"dropletBlock_startWebRequest_param0":function(d){return "url"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "função"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Subtrai dois números"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Operador de subtração"},
"dropletBlock_textInput_description":function(d){return "Cria uma entrada de texto e atribui a ela um id de elemento"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "texto"},
"dropletBlock_textLabel_description":function(d){return "Cria e exibe um rótulo de texto. O rótulo de texto é usado para exibir uma descrição para os seguintes controles de entrada: botões de rádio, caixas de verificação, entradas de texto e menus suspensos"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "texto"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "Lança um projétil com o personagem especificado."},
"dropletBlock_turnLeft_description":function(d){return "Altera a direção da tartaruga para a esquerda usando o ângulo especificado em graus"},
"dropletBlock_turnLeft_param0":function(d){return "ângulo"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Altera a direção da tartaruga para a direita usando o ângulo especificado em graus"},
"dropletBlock_turnRight_param0":function(d){return "ângulo"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Altera a direção da tartaruga para um ângulo específico. 0 é para cima, 90 é para a direita, 180 é para baixo e 270 é para a direita"},
"dropletBlock_turnTo_param0":function(d){return "ângulo"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Usando a tabela de armazenamento de dados do Laboratório de Aplicativo, atualiza o registro fornecido em tableName. O registro deve ser identificado de forma única com seu campo id. Quando a chamada estiver completa, callbackFunction é chamada"},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "registro"},
"dropletBlock_updateRecord_param2":function(d){return "função"},
"dropletBlock_vanish_description":function(d){return "Faz o personagem desaparecer."},
"dropletBlock_whileBlock_description":function(d){return "Cria um laço que consiste em uma expressão condicional e um bloco de instruções executadas para cada repetição do laço. A execução do laço continua enquanto a condição for verdadeira"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "laço enquanto"},
"dropletBlock_write_description":function(d){return "Anexa o texto especificado ao final do documento. O texto também pode ser formatado como HTML."},
"dropletBlock_write_param0":function(d){return "texto"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repita\" ou \"Se\" precisam de outros blocos para funcionar. Verifique se o bloco de dentro se ajusta corretamente ao bloco principal."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa ter outros blocos dentro dele para funcionar."},
"emptyFunctionalBlock":function(d){return "Você tem um bloco com uma entrada sem preencher."},
"end":function(d){return "fim"},
"errorEmptyFunctionBlockModal":function(d){return "Deve haver blocos dentro de sua definição de função. Clique em \"editar\" e arraste os blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clique em \"editar\" para verificar se não faltam blocos em sua definição de função."},
"errorParamInputUnattached":function(d){return "Lembre-se de associar um bloco a cada parâmetro de entrada no bloco de função em sua área de trabalho."},
"errorQuestionMarksInNumberField":function(d){return "Tente substituir \"???\" por um valor."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro em sua definição de função."},
"errorUnusedFunction":function(d){return "Você criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e não deixe de usá-la em seu programa."},
"errorUnusedParam":function(d){return "Você adicionou um bloco de parâmetro, mas não o usou na definição. Não deixe de usar seu parâmetro, clique em \"editar\" e coloque o bloco de parâmetro dentro do bloco verde."},
"extraTopBlocks":function(d){return "Você tem blocos não anexados."},
"extraTopBlocksWhenRun":function(d){return "Você tem blocos não anexados. Você queria anexar esses blocos ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Você concluiu a fase final."},
"finalStageTrophies":function(d){return "Parabéns! Você concluiu a última fase e ganhou "+common_locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":common_locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Concluir"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam codificação em blocos (por exemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Mas na verdade, os blocos que você juntou podem ser vistos em JavaScript, a linguagem de codificação mais usada em todo o mundo:"},
"genericFeedback":function(d){return "Veja como você terminou e tente consertar seu programa."},
"hashError":function(d){return "Nenhum programa salvo corresponde a '%1'."},
"help":function(d){return "Ajuda"},
"hideToolbox":function(d){return "(Ocultar)"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"hintRequest":function(d){return "Veja a dica"},
"hintTitle":function(d){return "Dica:"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "pule"},
"keepPlaying":function(d){return "Continuar"},
"levelIncompleteError":function(d){return "Você está usando todos os tipos de blocos necessários, mas não na ordem certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crie seu próprio jogo Flappy bird"},
"missingBlocksErrorMsg":function(d){return "Tente usar um ou mais dos blocos abaixo para resolver esse desafio."},
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
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Recomeçar"},
"rotateText":function(d){return "Gire seu dispositivo."},
"runProgram":function(d){return "Executar"},
"runTooltip":function(d){return "Execute o programa definido pelos blocos na área de trabalho."},
"saveToGallery":function(d){return "Salvar na galeria"},
"savedToGallery":function(d){return "Salvo na galeria!"},
"score":function(d){return "pontuação"},
"shareFailure":function(d){return "Desculpe, não é possível compartilhar esse programa."},
"showBlocksHeader":function(d){return "Mostrar blocos"},
"showCodeHeader":function(d){return "Mostrar código"},
"showGeneratedCode":function(d){return "Mostrar código"},
"showToolbox":function(d){return "Mostrar caixa de ferramentas"},
"signup":function(d){return "Cadastre-se para o curso introdutório"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Você precisa corrigir um erro em seu programa antes que ele possa ser mostrado como blocos."},
"tooFewBlocksMsg":function(d){return "Você está usando todos os tipos necessários de blocos, mas tente usar mais tipos de blocos para completar esse desafio."},
"tooManyBlocksMsg":function(d){return "Esse desafio pode ser resolvido com < x id='START_SPAN'/>< x id= 'END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Você me fez trabalhar bastante! Podemos tentar repetindo menos vezes?"},
"toolboxHeader":function(d){return "blocos"},
"toolboxHeaderDroplet":function(d){return "Caixa de ferramentas"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+common_locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":common_locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tente novamente"},
"tryHOC":function(d){return "Tente a Hora do Código"},
"wantToLearn":function(d){return "Quer aprender a programar?"},
"watchVideo":function(d){return "Assista ao vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando executar"},
"workspaceHeaderShort":function(d){return "Área de trabalho: "}};