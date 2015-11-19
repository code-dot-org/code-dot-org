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
"atHoneycomb":function(d){return "c'è un favo"},
"atFlower":function(d){return "c'è un fiore"},
"avoidCowAndRemove":function(d){return "evita la mucca e rimuovi 1"},
"continue":function(d){return "Prosegui"},
"dig":function(d){return "rimuovi 1"},
"digTooltip":function(d){return "togli 1 palata di terra"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "esegui"},
"elseCode":function(d){return "altrimenti"},
"fill":function(d){return "riempi 1"},
"fillN":function(d){return "riempi "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "riempi una colonna di "+maze_locale.v(d,"shovelfuls")+" buche"},
"fillSquare":function(d){return "riempi un quadrato"},
"fillTooltip":function(d){return "metti 1 palata di terra"},
"finalLevel":function(d){return "Complimenti! Hai risolto l'esercizio finale."},
"flowerEmptyError":function(d){return "Il fiore su cui ti trovi non ha più nettare."},
"get":function(d){return "prendi"},
"heightParameter":function(d){return "altezza"},
"holePresent":function(d){return "c'è una buca"},
"honey":function(d){return "fai il miele"},
"honeyAvailable":function(d){return "miele"},
"honeyTooltip":function(d){return "Produce miele dal nettare"},
"honeycombFullError":function(d){return "Il favo non ha più spazio per altro miele."},
"ifCode":function(d){return "se"},
"ifInRepeatError":function(d){return "Hai bisogno di un blocco \"se\" all'interno di un blocco \"ripeti\". Se non ci riesci, prova di nuovo il livello precedente per vedere come funzionava."},
"ifPathAhead":function(d){return "se c'è strada in avanti"},
"ifTooltip":function(d){return "Se c'è strada nella direzione specificata, allora esegue alcune azioni."},
"ifelseTooltip":function(d){return "Se c'è strada nella direzione specificata, allora esegue il primo blocco di azioni. Altrimenti, esegue il secondo."},
"ifFlowerTooltip":function(d){return "Se c'è un fiore o un favo nella casella corrente, allora esegue alcune azioni."},
"ifOnlyFlowerTooltip":function(d){return "Se c'è un fiore nella casella corrente, allora esegue alcune azioni."},
"ifelseFlowerTooltip":function(d){return "Se c'è un fiore o un favo nella casella corrente, allora esegue il primo blocco di azioni. Altrimenti, esegue il secondo."},
"insufficientHoney":function(d){return "Stai utilizzando tutti i blocchi necessari, ma la quantità di miele raccolto è ancora insufficiente."},
"insufficientNectar":function(d){return "Stai utilizzando tutti i blocchi necessari, ma la quantità di miele raccolto è ancora insufficiente."},
"make":function(d){return "fai"},
"moveBackward":function(d){return "vai indietro"},
"moveEastTooltip":function(d){return "Sposta di una casella verso est."},
"moveForward":function(d){return "vai avanti"},
"moveForwardTooltip":function(d){return "Sposta in avanti di una casella."},
"moveNorthTooltip":function(d){return "Sposta di una casella verso nord."},
"moveSouthTooltip":function(d){return "Sposta di una casella verso sud."},
"moveTooltip":function(d){return "Sposta in avanti o all'indietro di una casella"},
"moveWestTooltip":function(d){return "Sposta di una casella verso ovest."},
"nectar":function(d){return "prendi il nettare"},
"nectarRemaining":function(d){return "nettare"},
"nectarTooltip":function(d){return "Prende il nettare dal fiore"},
"nextLevel":function(d){return "Complimenti! Hai completato questo esercizio."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "la strada è bloccata"},
"noPathLeft":function(d){return "nessuna strada a sinistra"},
"noPathRight":function(d){return "nessuna strada a destra"},
"notAtFlowerError":function(d){return "Puoi prendere il nettare solo quando sei sul fiore."},
"notAtHoneycombError":function(d){return "Puoi fare il miele solo quando sei sul favo."},
"numBlocksNeeded":function(d){return "Questo esercizio può essere risolto con %1 blocchi."},
"pathAhead":function(d){return "c'è strada in avanti"},
"pathLeft":function(d){return "se c'è strada a sinistra"},
"pathRight":function(d){return "se c'è strada a destra"},
"pilePresent":function(d){return "c'è un mucchio"},
"putdownTower":function(d){return "metti giù la torre"},
"removeAndAvoidTheCow":function(d){return "rimuovi 1 ed evita la mucca"},
"removeN":function(d){return "rimuovi "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "rimuovi il mucchio"},
"removeStack":function(d){return "rimuovi una colonna di "+maze_locale.v(d,"shovelfuls")+" mucchi"},
"removeSquare":function(d){return "rimuovi un quadrato"},
"repeatCarefullyError":function(d){return "Per risolvere questo esercizio, ripensa allo schema costituito da due spostamenti e una svolta e mettilo nel blocco \"ripeti\". Non fa niente se fai una svolta in più del necessario."},
"repeatUntil":function(d){return "ripeti fino a che"},
"repeatUntilBlocked":function(d){return "mentre c'è strada in avanti"},
"repeatUntilFinish":function(d){return "ripeti fino alla fine"},
"step":function(d){return "Fai un passo"},
"totalHoney":function(d){return "miele totale"},
"totalNectar":function(d){return "nettare totale"},
"turnLeft":function(d){return "gira a sinistra"},
"turnRight":function(d){return "gira a destra"},
"turnTooltip":function(d){return "Gira a sinistra o a destra di 90 gradi."},
"uncheckedCloudError":function(d){return "Assicurati di controllare tutte le nuvole per vedere se sono fiori o favi."},
"uncheckedPurpleError":function(d){return "Assicurati di controllare tutti i fiori viola per vedere se hanno il nettare"},
"whileMsg":function(d){return "mentre"},
"whileTooltip":function(d){return "Ripete le azioni incluse, smettendo quando diventa vera la condizione di arresto."},
"word":function(d){return "Scrivi la parola"},
"yes":function(d){return "Sì"},
"youSpelled":function(d){return "Hai scritto finora"}};