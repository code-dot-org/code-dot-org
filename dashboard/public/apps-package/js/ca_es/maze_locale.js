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
"atHoneycomb":function(d){return "al rusc"},
"atFlower":function(d){return "a la flor"},
"avoidCowAndRemove":function(d){return "evita la vaca i elimina 1"},
"continue":function(d){return "Continuar"},
"dig":function(d){return "suprimeix 1"},
"digTooltip":function(d){return "suprimerix 1 unitat de brutícia"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "fes"},
"elseCode":function(d){return "en cas contrari"},
"fill":function(d){return "Ompleix 1"},
"fillN":function(d){return "ompli "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Omple les piles de forats "+maze_locale.v(d,"shovelfuls")},
"fillSquare":function(d){return "ompli el quadrat"},
"fillTooltip":function(d){return "Lloc d'unitat 1 de brutícia"},
"finalLevel":function(d){return "Felicitats! Has resolt el puzzle final."},
"flowerEmptyError":function(d){return "La flor on estàs no té més nèctar."},
"get":function(d){return "aconseguir"},
"heightParameter":function(d){return "alçcada"},
"holePresent":function(d){return "hi ha un forat"},
"honey":function(d){return "fer mel"},
"honeyAvailable":function(d){return "mel"},
"honeyTooltip":function(d){return "Fer mel del nèctar"},
"honeycombFullError":function(d){return "Aquest rusc no té espai per més mel."},
"ifCode":function(d){return "si"},
"ifInRepeatError":function(d){return "Necessites un bloc \"si\" a dins un bloc \"repetir\". Si estàs tenint problemes, torna a intentar el nivell anterior per veure com funcionava."},
"ifPathAhead":function(d){return "si camí endevant"},
"ifTooltip":function(d){return "Si hi ha un camí en la direcció especificada, fer algunes accions."},
"ifelseTooltip":function(d){return "Si hi ha un camí en la direcció específicada, fer el primer bloc d'accions. En cas contrari, fer el segon bloc d'accions."},
"ifFlowerTooltip":function(d){return "Si hi ha una flor/rusc en la direcció concreta, llavors fes algunes accions."},
"ifOnlyFlowerTooltip":function(d){return "Si hi ha alguna flor en la direcció especificada, llavors fes algunes accions."},
"ifelseFlowerTooltip":function(d){return "Si hi ha una flor/rusc en la direcció concreta, llavors féu el primer bloc d'accions. En cas contrari, fer el segon bloc d'accions."},
"insufficientHoney":function(d){return "Utilitzeu tots els blocs correctament, però cal fer la quantitat exacte de mel."},
"insufficientNectar":function(d){return "Estàs utilitzant correctament tots els blocs, però necessites recollir la quantitat exacte de nèctar."},
"make":function(d){return "fer"},
"moveBackward":function(d){return "retrocedir"},
"moveEastTooltip":function(d){return "Moure'm cap a l'est un espai."},
"moveForward":function(d){return "avança"},
"moveForwardTooltip":function(d){return "Mou-me un espai cap endevant."},
"moveNorthTooltip":function(d){return "Moure'm cap al nord un espai."},
"moveSouthTooltip":function(d){return "Moure'm al sud un espai."},
"moveTooltip":function(d){return "Em mou cap endavant/enrere un espai"},
"moveWestTooltip":function(d){return "Moure'm cap a l'est un espai."},
"nectar":function(d){return "obtenir nèctar"},
"nectarRemaining":function(d){return "nèctar"},
"nectarTooltip":function(d){return "Obtenir nèctar d'una flor"},
"nextLevel":function(d){return "Felicitats! Has complert aquest puzzle."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "el camí està bloquejat"},
"noPathLeft":function(d){return "no hi ha camí cap a l'esquerra"},
"noPathRight":function(d){return "no hi ha camí cap a la dreta"},
"notAtFlowerError":function(d){return "Només es pot obtenir nèctar d'una flor."},
"notAtHoneycombError":function(d){return "Només pot fer mel a un rusc."},
"numBlocksNeeded":function(d){return "Aquest puzzle pot res resolt amb %1 blocs."},
"pathAhead":function(d){return "camí endevant"},
"pathLeft":function(d){return "si camí cap a l'esquerra"},
"pathRight":function(d){return "si camí cap a la dreta"},
"pilePresent":function(d){return "hi ha un munt"},
"putdownTower":function(d){return "Posa la torre"},
"removeAndAvoidTheCow":function(d){return "elimina 1 i evita la vaca"},
"removeN":function(d){return "elimina"+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "treu la pila"},
"removeStack":function(d){return "treu la pila del munt de "+maze_locale.v(d,"shovelfuls")},
"removeSquare":function(d){return "elimina el quadrat"},
"repeatCarefullyError":function(d){return "Per solucionar això, pensar acuradament sobre el patró de dos moviments i un gir per posar en el bloc \"repetició\".  Està bé tenir un gir addicional al final."},
"repeatUntil":function(d){return "repeteix fins que"},
"repeatUntilBlocked":function(d){return "de mentres, camí cap endevant"},
"repeatUntilFinish":function(d){return "repeteix fins a acabar"},
"step":function(d){return "pas"},
"totalHoney":function(d){return "mel total"},
"totalNectar":function(d){return "Nèctar total"},
"turnLeft":function(d){return "gira a l'esquerra"},
"turnRight":function(d){return "gira a la dreta"},
"turnTooltip":function(d){return "Gira'm 90 graus cap a l'esquerra o cap a la dreta."},
"uncheckedCloudError":function(d){return "Assegureu-vos de comprovar tots els núvols per veure si són les flors o els ruscs."},
"uncheckedPurpleError":function(d){return "Assegureu-vos de comprovar totes les flors porpres per veure si tenen nèctar"},
"whileMsg":function(d){return "mentres"},
"whileTooltip":function(d){return "Repetiu les accions tancades fins que s'arribi al punt final."},
"word":function(d){return "Troba la paraula"},
"yes":function(d){return "Sí"},
"youSpelled":function(d){return "Has escrit"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};