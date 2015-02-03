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
"codeTooltip":function(d){return "Veja o código JavaScript gerado."},
"continue":function(d){return "Continue"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "L"},
"directionWestLetter":function(d){return "O"},
"end":function(d){return "fim"},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repita\" ou \"Se\" precisam de outros blocos para funcionar. Verifique se o bloco de dentro se ajusta corretamente ao bloco principal."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa ter outros blocos dentro dele para funcionar."},
"errorEmptyFunctionBlockModal":function(d){return "Deve haver blocos dentro de sua definição de função. Clique em \"editar\" e arraste os blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clique em \"editar\" para verificar se não faltam blocos em sua definição de função."},
"errorParamInputUnattached":function(d){return "Lembre-se de associar um bloco a cada parâmetro de entrada no bloco de função em sua área de trabalho."},
"errorUnusedParam":function(d){return "Você adicionou um bloco de parâmetro, mas não o usou na definição. Não deixe de usar seu parâmetro, clique em \"editar\" e coloque o bloco de parâmetro dentro do bloco verde."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro em sua definição de função."},
"errorUnusedFunction":function(d){return "Você criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e não deixe de usá-la em seu programa."},
"errorQuestionMarksInNumberField":function(d){return "Tente substituir \"???\" por um valor."},
"extraTopBlocks":function(d){return "Alguns de seus blocos estão soltos. Você gostaria de conectá-los ao bloco \"quando executar\"?"},
"finalStage":function(d){return "Parabéns! Você concluiu a fase final."},
"finalStageTrophies":function(d){return "Parabéns! Você concluiu a última fase e ganhou "+locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Concluir"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam codificação em blocos (por exemplo, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Mas na verdade, os blocos que você juntou podem ser vistos em JavaScript, a linguagem de codificação mais usada em todo o mundo:"},
"hashError":function(d){return "Nenhum programa salvo corresponde a '%1'."},
"help":function(d){return "Ajuda"},
"hintTitle":function(d){return "Dica:"},
"jump":function(d){return "pule"},
"levelIncompleteError":function(d){return "Você está usando todos os tipos de blocos necessários, mas não na ordem certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crie seu próprio jogo Flappy bird"},
"missingBlocksErrorMsg":function(d){return "Tente usar um ou mais dos blocos abaixo para resolver esse desafio."},
"nextLevel":function(d){return "Parabéns! Você completou o Desafio "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Você completou o Desafio "+locale.v(d,"puzzleNumber")+" e ganhou "+locale.p(d,"numTrophies",0,"pt",{"one":"um troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
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
"openWorkspace":function(d){return "Como funciona"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tente novamente"},
"hintRequest":function(d){return "Veja a dica"},
"backToPreviousLevel":function(d){return "Voltar ao nível anterior"},
"saveToGallery":function(d){return "Salvar na galeria"},
"savedToGallery":function(d){return "Salvo na galeria!"},
"shareFailure":function(d){return "Desculpe, não é possível compartilhar esse programa."},
"workspaceHeader":function(d){return "Monte seus blocos aqui: "},
"workspaceHeaderJavaScript":function(d){return "Insira seu código JavaScript aqui"},
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