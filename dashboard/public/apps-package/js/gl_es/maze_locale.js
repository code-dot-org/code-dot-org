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
"atHoneycomb":function(d){return "na colmea"},
"atFlower":function(d){return "na flor"},
"avoidCowAndRemove":function(d){return "desvíe da vaca e remova 1"},
"continue":function(d){return "Continuar"},
"dig":function(d){return "remova 1"},
"digTooltip":function(d){return "remova 1 unidade de terra"},
"dirE":function(d){return "L"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "faga"},
"elseCode":function(d){return "se non"},
"fill":function(d){return "cubra 1"},
"fillN":function(d){return "cubra "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "cubra "+maze_locale.v(d,"shovelfuls")+" buracos"},
"fillSquare":function(d){return "cubra o cadrado"},
"fillTooltip":function(d){return "coloque 1 unidade de terra"},
"finalLevel":function(d){return "Parabéns! Vostede resolveu o último desafío."},
"flowerEmptyError":function(d){return "A flor en que vostede está non ten máis néctar."},
"get":function(d){return "obter"},
"heightParameter":function(d){return "altura"},
"holePresent":function(d){return "houbese un buraco"},
"honey":function(d){return "faga mel"},
"honeyAvailable":function(d){return "mel"},
"honeyTooltip":function(d){return "faga mel a partir do néctar"},
"honeycombFullError":function(d){return "Non cabe máis mel neste painel de mel."},
"ifCode":function(d){return "se"},
"ifInRepeatError":function(d){return "Vostede precisa un bloque \"se\" dentro dun bloque \"repetir\". Se vostede está tendo problemas, tente o nivel anterior novamente para ver como funcionaba."},
"ifPathAhead":function(d){return "se houbese camiño diante"},
"ifTooltip":function(d){return "Se houbese un camiño na dirección especificada, realice algunhas accións."},
"ifelseTooltip":function(d){return "Se hai un camiño na dirección especificada, entón faga o primeiro bloque de accións. No caso contrario, faga o segundo bloque de accións."},
"ifFlowerTooltip":function(d){return "Se houbese unha flor/colmea na dirección especificada, faga algunhas accións."},
"ifOnlyFlowerTooltip":function(d){return "Se houbese unha flor na dirección especificada, realice algunhas accións."},
"ifelseFlowerTooltip":function(d){return "Se houbese unha flor/colmea na dirección especificada, faga o primeiro bloque de accións. No caso contrario, faga o segundo bloque de accións."},
"insufficientHoney":function(d){return "Vostede precisa facer a cantidade certa de mel."},
"insufficientNectar":function(d){return "Vostede precisa recoller a cantidade certa de néctar."},
"make":function(d){return "faga"},
"moveBackward":function(d){return "mova para trás"},
"moveEastTooltip":function(d){return "Móvame un espazo para leste."},
"moveForward":function(d){return "avance"},
"moveForwardTooltip":function(d){return "Móvame un espazo para diante."},
"moveNorthTooltip":function(d){return "Móvame un espazo para o norte."},
"moveSouthTooltip":function(d){return "Móvame un espazo para o sur."},
"moveTooltip":function(d){return "Móvame para diante/trás un espazo"},
"moveWestTooltip":function(d){return "Móvame un espazo para o oeste."},
"nectar":function(d){return "obteña néctar"},
"nectarRemaining":function(d){return "néctar"},
"nectarTooltip":function(d){return "Obteña néctar de unha flor"},
"nextLevel":function(d){return "Parabéns! Vostede completou o desafío."},
"no":function(d){return "Non"},
"noPathAhead":function(d){return "o camiño está bloqueado"},
"noPathLeft":function(d){return "Non hai camiño á esquerda"},
"noPathRight":function(d){return "Non hai camiño á dereita"},
"notAtFlowerError":function(d){return "Vostede só pode obter néctar de unha flor."},
"notAtHoneycombError":function(d){return "Vostede só pode facer mel nun painel de mel."},
"numBlocksNeeded":function(d){return "Este desafío pode ser resolvido com %1 bloques."},
"pathAhead":function(d){return "se houbese camiño diante"},
"pathLeft":function(d){return "Se houbese camiño á esquerda"},
"pathRight":function(d){return "Se houbese camiño á dereita"},
"pilePresent":function(d){return "hai un monte"},
"putdownTower":function(d){return "derrube a torre"},
"removeAndAvoidTheCow":function(d){return "remova 1 e desvíe da vaca"},
"removeN":function(d){return "remova "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "remova o monte"},
"removeStack":function(d){return "remova "+maze_locale.v(d,"shovelfuls")+" montes de terra"},
"removeSquare":function(d){return "remova o cadrado"},
"repeatCarefullyError":function(d){return "Para solucionar este desafío, avalíe coidadosamente o padrón andar dous e virar un para colocalo no bloque \"repetir\". Vostede pode ter máis un comando para virar no final."},
"repeatUntil":function(d){return "repita até"},
"repeatUntilBlocked":function(d){return "mentres houbese camiño en frente"},
"repeatUntilFinish":function(d){return "repita até terminar"},
"step":function(d){return "Paso"},
"totalHoney":function(d){return "mel total"},
"totalNectar":function(d){return "néctar total"},
"turnLeft":function(d){return "vire á esquerda"},
"turnRight":function(d){return "vire á dereita"},
"turnTooltip":function(d){return "Vira 90 graos á esquerda ou á dereita."},
"uncheckedCloudError":function(d){return "Verifique todas as nubes para ver se son flores ou colmeas."},
"uncheckedPurpleError":function(d){return "Verifique todas as flores moradas para ver se teñen néctar"},
"whileMsg":function(d){return "mentras"},
"whileTooltip":function(d){return "Repita as accións até satisfacer a condición."},
"word":function(d){return "Encontre a palabra"},
"yes":function(d){return "Si"},
"youSpelled":function(d){return "Vostede escribiu"}};