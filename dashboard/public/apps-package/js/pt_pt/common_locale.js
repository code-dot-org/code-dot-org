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
"blocks":function(d){return "blocks"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Ações"},
"catColour":function(d){return "Cor"},
"catLogic":function(d){return "Lógica"},
"catLists":function(d){return "Listas"},
"catLoops":function(d){return "Ciclos"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funções"},
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variáveis"},
"clearPuzzle":function(d){return "Clear Puzzle"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Are you sure you want to clear the puzzle?"},
"codeTooltip":function(d){return "Vê o código gerado em Javascript."},
"continue":function(d){return "Continuar"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "O"},
"end":function(d){return "fim"},
"emptyBlocksErrorMsg":function(d){return "Os blocos \"Repetir\" ou \"Se\" precisam de incluir blocos dentro para funcionar. Garante que o bloco interno encaixa correctamente dentro do bloco que o contém."},
"emptyFunctionBlocksErrorMsg":function(d){return "O bloco de função precisa de ter outros blocos dentro dele para trabalhar."},
"errorEmptyFunctionBlockModal":function(d){return "É necessário haver blocos dentro da definição da sua função. Clique em \"editar\" e arraste blocos para dentro do bloco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clique em \"editar\" para ter a certeza de que não tem blocos a faltar dentro da definição da sua função."},
"errorParamInputUnattached":function(d){return "Lembre-se de anexar um bloco para cada parâmetro de entrada no bloco da função na sua área de trabalho."},
"errorUnusedParam":function(d){return "Adicionou um bloco de parâmetro, mas não o usou na definição. Certifique-se que usa o seu parâmetro clicando em \"editar\" e pondo o bloco de parâmetro dentro do bloco verde."},
"errorRequiredParamsMissing":function(d){return "Crie um parâmetro para a sua função clicando em \"editar\" e adicionando os parâmetros necessários. Arraste os novos blocos de parâmetro para dentro da definição da sua função."},
"errorUnusedFunction":function(d){return "Criou uma função, mas nunca a usou na sua área de trabalho! Clique em \"Funções\" na caixa de ferramentas e certifique-se que a usa no seu programa."},
"errorQuestionMarksInNumberField":function(d){return "Experimente substituir \"???\" por um valor."},
"extraTopBlocks":function(d){return "Tem blocos não ligados. Tencionava ligá-los ao bloco \"quando correr\"?"},
"finalStage":function(d){return "Parabéns! Completaste a etapa final."},
"finalStageTrophies":function(d){return "Parabéns! Completaste a etapa final e ganhaste "+locale.p(d,"numTrophies",0,"pt",{"one":"troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"finish":function(d){return "Acabe"},
"generatedCodeInfo":function(d){return "Mesmo as melhores universidades ensinam código em blocos (por exemplo, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Mas na verdade, os blocos que juntaste podem ser vistos em JavaScript, a linguagem de código mais usada em todo o mundo:"},
"hashError":function(d){return "Desculpa, '%1' não corresponde a qualquer programa gravado."},
"help":function(d){return "Ajuda"},
"hintTitle":function(d){return "Dica:"},
"jump":function(d){return "salto"},
"levelIncompleteError":function(d){return "Estás a usar todos os tipos necessários de blocos, mas não da forma certa."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Cria o teu próprio jogo Flappy"},
"missingBlocksErrorMsg":function(d){return "Tenta um ou mais blocos dos seguintes para resolver o puzzle."},
"nextLevel":function(d){return "Parabéns! Completaste o puzzle "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Parabéns! Completaste o puzzle "+locale.v(d,"puzzleNumber")+" e ganhaste "+locale.p(d,"numTrophies",0,"pt",{"one":"troféu","other":locale.n(d,"numTrophies")+" troféus"})+"."},
"nextStage":function(d){return "Parabéns! Completaste "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Parabéns! Completaste "+locale.v(d,"stageName")+" e ganhaste "+locale.p(d,"numTrophies",0,"pt",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Parabéns! Completaste o puzzle "+locale.v(d,"puzzleNumber")+". (Apesar disso, poderias ter usado somente "+locale.p(d,"numBlocks",0,"pt",{"one":"1 bloco","other":locale.n(d,"numBlocks")+" blocos"})+".)"},
"numLinesOfCodeWritten":function(d){return "Acabaste de escrever "+locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":locale.n(d,"numLines")+" linhas"})+" de código!"},
"play":function(d){return "play"},
"print":function(d){return "Print"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" de "+locale.v(d,"stage_total")},
"repeat":function(d){return "repita"},
"resetProgram":function(d){return "Repor"},
"runProgram":function(d){return "Run"},
"runTooltip":function(d){return "Executa o programa definido pelos blocos na área de trabalho."},
"score":function(d){return "score"},
"showCodeHeader":function(d){return "Mostrar o código"},
"showBlocksHeader":function(d){return "Show Blocks"},
"showGeneratedCode":function(d){return "Mostrar o código"},
"stringEquals":function(d){return "string=?"},
"subtitle":function(d){return "um ambiente de programação visual"},
"textVariable":function(d){return "texto"},
"tooFewBlocksMsg":function(d){return "Estás a usar todos os tipos de blocos necessários, mas tenta usar mais alguns desses blocos para completar este puzzle."},
"tooManyBlocksMsg":function(d){return "Este puzzle pode ser resolvido com <x id='START_SPAN'/><x id='END_SPAN'/> blocos."},
"tooMuchWork":function(d){return "Fizeste-me ter muito trabalho! Podes tentar repetir menos vezes?"},
"toolboxHeader":function(d){return "blocos"},
"openWorkspace":function(d){return "Como funciona"},
"totalNumLinesOfCodeWritten":function(d){return "Total de todos os tempos: "+locale.p(d,"numLines",0,"pt",{"one":"1 linha","other":locale.n(d,"numLines")+" linhas"})+" de código."},
"tryAgain":function(d){return "Tentar novamente"},
"hintRequest":function(d){return "See hint"},
"backToPreviousLevel":function(d){return "Voltar ao nível anterior"},
"saveToGallery":function(d){return "Grave na galeria"},
"savedToGallery":function(d){return "Guardado na galeria!"},
"shareFailure":function(d){return "Pedimos desculpa, mas não podemos partilhar este programa."},
"workspaceHeader":function(d){return "Monta os teus blocos aqui: "},
"workspaceHeaderJavaScript":function(d){return "Escreva o seu código de JavaScript aqui"},
"workspaceHeaderShort":function(d){return "Workspace: "},
"infinity":function(d){return "Infinito"},
"rotateText":function(d){return "Roda o teu dispositivo."},
"orientationLock":function(d){return "Desativa o bloqueio de orientação em configurações do dispositivo."},
"wantToLearn":function(d){return "Queres aprender a programar com código?"},
"watchVideo":function(d){return "Vê o vídeo"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando correr"},
"tryHOC":function(d){return "Exprimenta a Hora do Código"},
"signup":function(d){return "Inscreve-te para o curso de introdução"},
"hintHeader":function(d){return "Aqui vai uma dica:"},
"genericFeedback":function(d){return "Veja como ficou, e tente pôr o seu programa a funcionar."},
"toggleBlocksErrorMsg":function(d){return "Necessita de corrigir um erro no seu programa antes de que este possa ser mostrado como blocos."},
"defaultTwitterText":function(d){return "Check out what I made"}};