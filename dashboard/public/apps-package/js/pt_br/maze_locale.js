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
"avoidCowAndRemove":function(d){return "desvie da vaca e remova 1"},
"continue":function(d){return "Continuar"},
"dig":function(d){return "remova 1"},
"digTooltip":function(d){return "remova 1 unidade de terra"},
"dirE":function(d){return "L"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "faça"},
"elseCode":function(d){return "se não"},
"fill":function(d){return "preencha 1"},
"fillN":function(d){return "preencha "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "preencha "+maze_locale.v(d,"shovelfuls")+" buracos"},
"fillSquare":function(d){return "preencha o quadrado"},
"fillTooltip":function(d){return "coloque 1 unidade de terra"},
"finalLevel":function(d){return "Parabéns! Você resolveu o último desafio."},
"flowerEmptyError":function(d){return "A flor em que você está não tem mais néctar."},
"get":function(d){return "obter"},
"heightParameter":function(d){return "altura"},
"holePresent":function(d){return "houver um buraco"},
"honey":function(d){return "faça mel"},
"honeyAvailable":function(d){return "mel"},
"honeyTooltip":function(d){return "Faça mel a partir do néctar"},
"honeycombFullError":function(d){return "Não cabe mais mel neste favo de mel."},
"ifCode":function(d){return "se"},
"ifInRepeatError":function(d){return "Você precisa de um bloco \"se\" dentro de um bloco \"repetir\". Se você está tendo problemas, tente o nível anterior novamente para ver como funcionava."},
"ifPathAhead":function(d){return "se houver caminho à frente"},
"ifTooltip":function(d){return "Se houver um caminho na direção especificada, realize algumas ações."},
"ifelseTooltip":function(d){return "Se há um caminho na direção especificada, então faça o primeiro bloco de ações. Caso contrário, faça o segundo bloco de ações."},
"ifFlowerTooltip":function(d){return "Se houver uma flor/colmeia na direção especificada, faça algumas ações."},
"ifOnlyFlowerTooltip":function(d){return "Se houver uma flor na direção especificada, realize algumas ações."},
"ifelseFlowerTooltip":function(d){return "Se houver uma flor/colmeia na direção especificada, faça o primeiro bloco de ações. Caso contrário, faça o segundo bloco de ações."},
"insufficientHoney":function(d){return "Você precisa fazer a quantidade certa de mel."},
"insufficientNectar":function(d){return "Você precisa coletar a quantidade certa de néctar."},
"make":function(d){return "faça"},
"moveBackward":function(d){return "mova para trás"},
"moveEastTooltip":function(d){return "Mova-me um espaço para leste."},
"moveForward":function(d){return "avance"},
"moveForwardTooltip":function(d){return "Mova-me um espaço para a frente."},
"moveNorthTooltip":function(d){return "Mova-me um espaço para o norte."},
"moveSouthTooltip":function(d){return "Mova-me um espaço para o sul."},
"moveTooltip":function(d){return "Mova-me para a frente/trás um espaço"},
"moveWestTooltip":function(d){return "Mova-me um espaço para o oeste."},
"nectar":function(d){return "obtenha néctar"},
"nectarRemaining":function(d){return "néctar"},
"nectarTooltip":function(d){return "Obtenha néctar de uma flor"},
"nextLevel":function(d){return "Parabéns! Você completou o desafio."},
"no":function(d){return "Não"},
"noPathAhead":function(d){return "o caminho está bloqueado"},
"noPathLeft":function(d){return "Não há caminho à esquerda"},
"noPathRight":function(d){return "Não há caminho à direita"},
"notAtFlowerError":function(d){return "Você só pode obter néctar de uma flor."},
"notAtHoneycombError":function(d){return "Você só pode fazer mel em um favo de mel."},
"numBlocksNeeded":function(d){return "Este desafio pode ser resolvido com %1 blocos."},
"pathAhead":function(d){return "se houver caminho à frente"},
"pathLeft":function(d){return "Se houver caminho à esquerda"},
"pathRight":function(d){return "Se houver caminho à direita"},
"pilePresent":function(d){return "há um monte"},
"putdownTower":function(d){return "derrube a torre"},
"removeAndAvoidTheCow":function(d){return "remova 1 e desvie da vaca"},
"removeN":function(d){return "remova "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "remova o monte"},
"removeStack":function(d){return "remova "+maze_locale.v(d,"shovelfuls")+" montes de terra"},
"removeSquare":function(d){return "remova o quadrado"},
"repeatCarefullyError":function(d){return "Para solucionar este desafio, avalie cuidadosamente o padrão andar dois e virar um para colocá-lo no bloco \"repetir\". Você pode ter mais um comando para virar no final."},
"repeatUntil":function(d){return "repita até"},
"repeatUntilBlocked":function(d){return "enquanto houver caminho em frente"},
"repeatUntilFinish":function(d){return "repita até terminar"},
"step":function(d){return "Passo"},
"totalHoney":function(d){return "mel total"},
"totalNectar":function(d){return "néctar total"},
"turnLeft":function(d){return "vire à esquerda"},
"turnRight":function(d){return "vire à direita"},
"turnTooltip":function(d){return "Vira 90 graus à esquerda ou à direita."},
"uncheckedCloudError":function(d){return "Verifique todas as nuvens para ver se são flores ou colmeias."},
"uncheckedPurpleError":function(d){return "Verifique todas as flores roxas para ver se elas têm néctar"},
"whileMsg":function(d){return "enquanto"},
"whileTooltip":function(d){return "Repita as ações até satisfazer a condição."},
"word":function(d){return "Encontre a palavra"},
"yes":function(d){return "Sim"},
"youSpelled":function(d){return "Você escreveu"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};