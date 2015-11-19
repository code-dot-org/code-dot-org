var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "na colmeia"},
"atFlower":function(d){return "na flor"},
"avoidCowAndRemove":function(d){return "evitar a vaca e remover 1"},
"continue":function(d){return "Continuar"},
"dig":function(d){return "remover 1"},
"digTooltip":function(d){return "remover 1 unidade de terra"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "fazer"},
"elseCode":function(d){return "se não"},
"fill":function(d){return "preencher 1"},
"fillN":function(d){return "preencher "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "preencher pilha de "+maze_locale.v(d,"shovelfuls")+" buracos"},
"fillSquare":function(d){return "preencher quadrado"},
"fillTooltip":function(d){return "colocar 1 unidade de terra"},
"finalLevel":function(d){return "Parabéns! Resolveste o desafio final."},
"flowerEmptyError":function(d){return "A flor em que estás já não tem mais néctar."},
"get":function(d){return "obter"},
"heightParameter":function(d){return "altura"},
"holePresent":function(d){return "há um buraco"},
"honey":function(d){return "fazer mel"},
"honeyAvailable":function(d){return "mel"},
"honeyTooltip":function(d){return "Fazer mel a partir do néctar"},
"honeycombFullError":function(d){return "Esta colmeia não tem espaço para mais mel."},
"ifCode":function(d){return "se"},
"ifInRepeatError":function(d){return "Precisas de um bloco \"se\" dentro de um bloco \"repetir\". Se estás a ter problemas, tenta o nível anterior outra vez para perceberes como funciona."},
"ifPathAhead":function(d){return "Se há caminho em frente"},
"ifTooltip":function(d){return "Se há caminho na direção especificada, faz algumas ações."},
"ifelseTooltip":function(d){return "Se há caminho na direção especificada, faz o primeiro bloco de ações. Senão, faz o segundo bloco de ações."},
"ifFlowerTooltip":function(d){return "Se existir alguma flor ou colmeia na direção especificada, então executa algumas ações."},
"ifOnlyFlowerTooltip":function(d){return "Se há uma flor na direção indicada então faz algumas ações."},
"ifelseFlowerTooltip":function(d){return "Se existir alguma flor ou colmeia na direção especificada, então executa o primeiro bloco de ações. Caso contrário, executa o segundo bloco de ações."},
"insufficientHoney":function(d){return "Estás a usar todos os blocos corretos, mas precisas de fazer a quantidade certa de mel."},
"insufficientNectar":function(d){return "Estás a usar todos os blocos corretos, mas precisas de colher a quantidade certa de néctar."},
"make":function(d){return "fazer"},
"moveBackward":function(d){return "mover para trás"},
"moveEastTooltip":function(d){return "Move-me um espaço para este."},
"moveForward":function(d){return "mover para a frente"},
"moveForwardTooltip":function(d){return "Move para a frente uma unidade."},
"moveNorthTooltip":function(d){return "Move-me para norte um espaço."},
"moveSouthTooltip":function(d){return "Move-me para sul um espaço."},
"moveTooltip":function(d){return "Move-me para a frente ou para trás um espaço"},
"moveWestTooltip":function(d){return "Move-me para oeste um espaço."},
"nectar":function(d){return "recolher néctar"},
"nectarRemaining":function(d){return "néctar"},
"nectarTooltip":function(d){return "Recolher néctar de uma flor"},
"nextLevel":function(d){return "Parabéns! Concluíste este desafio."},
"no":function(d){return "Não"},
"noPathAhead":function(d){return "caminho está bloqueado"},
"noPathLeft":function(d){return "Não há caminho para a esquerda"},
"noPathRight":function(d){return "não há caminho para a direita"},
"notAtFlowerError":function(d){return "Só podes obter néctar de uma flor."},
"notAtHoneycombError":function(d){return "Só podes fazer mel numa colmeia."},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos."},
"pathAhead":function(d){return "caminho em frente"},
"pathLeft":function(d){return "se há caminho para a esquerda"},
"pathRight":function(d){return "se há caminho para a direita"},
"pilePresent":function(d){return "há uma pilha"},
"putdownTower":function(d){return "coloca a torre em baixo"},
"removeAndAvoidTheCow":function(d){return "remove 1 e evita a vaca"},
"removeN":function(d){return "remove "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "Remove a pilha"},
"removeStack":function(d){return "remove o monte de pilhas de "+maze_locale.v(d,"shovelfuls")},
"removeSquare":function(d){return "remove o quadrado"},
"repeatCarefullyError":function(d){return "Para resolveres isto, pensa cuidadosamente no padrão de dois \"mover\" e um \"virar\" para colocar no bloco \"repetir\". Não há problema se tiveres um \"virar\" extra no final."},
"repeatUntil":function(d){return "repita até"},
"repeatUntilBlocked":function(d){return "enquanto houver caminho em frente"},
"repeatUntilFinish":function(d){return "repete até terminar"},
"step":function(d){return "Avançar"},
"totalHoney":function(d){return "mel total"},
"totalNectar":function(d){return "néctar total"},
"turnLeft":function(d){return "virar à esquerda"},
"turnRight":function(d){return "virar à direita"},
"turnTooltip":function(d){return "Vira à esquerda ou à direita 90 graus."},
"uncheckedCloudError":function(d){return "Não te esqueças de verificar todas as nuvens para veres se são flores ou colmeias."},
"uncheckedPurpleError":function(d){return "Não te esqueças de verificar todas as flores roxas para veres se têm néctar."},
"whileMsg":function(d){return "enquanto"},
"whileTooltip":function(d){return "Repete as ações seguintes até a condição de terminação ser alcançada."},
"word":function(d){return "Encontra a palavra"},
"yes":function(d){return "Sim"},
"youSpelled":function(d){return "Tu escreveste"}};