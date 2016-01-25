var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "fai rimbalzare la palla"},
"bounceBallTooltip":function(d){return "Fa rimbalzare una palla lontano da un oggetto."},
"continue":function(d){return "Prosegui"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "O"},
"doCode":function(d){return "esegui"},
"elseCode":function(d){return "altrimenti"},
"finalLevel":function(d){return "Complimenti! Hai risolto l'esercizio finale."},
"heightParameter":function(d){return "altezza"},
"ifCode":function(d){return "se"},
"ifPathAhead":function(d){return "se c'è strada in avanti"},
"ifTooltip":function(d){return "Se c'è strada nella direzione specificata, allora fai alcune azioni."},
"ifelseTooltip":function(d){return "Se c'è strada nella direzione specificata, allora effettua il primo blocco di azioni. Altrimenti, effettua il secondo."},
"incrementOpponentScore":function(d){return "aggiungi un punto all'avversario"},
"incrementOpponentScoreTooltip":function(d){return "Aggiunge uno al punteggio attuale dell'avversario."},
"incrementPlayerScore":function(d){return "aggiungi un punto"},
"incrementPlayerScoreTooltip":function(d){return "Aggiunge uno al punteggio attuale del giocatore."},
"isWall":function(d){return "questo è un muro"},
"isWallTooltip":function(d){return "Restituisce vero se qui c'è un muro"},
"launchBall":function(d){return "lancia una nuova palla"},
"launchBallTooltip":function(d){return "Lancia una palla in gioco."},
"makeYourOwn":function(d){return "Costruisci la tua versione del Ping-Pong"},
"moveDown":function(d){return "sposta in basso"},
"moveDownTooltip":function(d){return "Sposta la racchetta in basso."},
"moveForward":function(d){return "vai avanti"},
"moveForwardTooltip":function(d){return "Sposta in avanti di una casella."},
"moveLeft":function(d){return "sposta a sinistra"},
"moveLeftTooltip":function(d){return "Sposta la racchetta a sinistra."},
"moveRight":function(d){return "sposta a destra"},
"moveRightTooltip":function(d){return "Sposta la racchetta a destra."},
"moveUp":function(d){return "sposta in alto"},
"moveUpTooltip":function(d){return "Sposta la racchetta in alto."},
"nextLevel":function(d){return "Complimenti! Hai completato questo esercizio."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "la strada è bloccata"},
"noPathLeft":function(d){return "nessuna strada a sinistra"},
"noPathRight":function(d){return "nessuna strada a destra"},
"numBlocksNeeded":function(d){return "Questo esercizio può essere risolto con %1 blocchi."},
"pathAhead":function(d){return "la strada davanti"},
"pathLeft":function(d){return "se c'è strada a sinistra"},
"pathRight":function(d){return "se c'è strada a destra"},
"pilePresent":function(d){return "c'è un mucchio"},
"playSoundCrunch":function(d){return "riproduci il suono di uno sgranocchiamento"},
"playSoundGoal1":function(d){return "riproduci il suono di un obiettivo raggiunto"},
"playSoundGoal2":function(d){return "riproduci il suono di un obiettivo raggiunto (versione alternativa)"},
"playSoundHit":function(d){return "riproduci il suono di un colpo"},
"playSoundLosePoint":function(d){return "riproduci il suono di un punto perso"},
"playSoundLosePoint2":function(d){return "riproduci il suono di un punto perso (versione alternativa)"},
"playSoundRetro":function(d){return "riproduci il suono di un fischio"},
"playSoundRubber":function(d){return "riproduci il suono di un rimbalzo"},
"playSoundSlap":function(d){return "riproduci il suono di uno schiaffo"},
"playSoundTooltip":function(d){return "Riproduce il suono scelto."},
"playSoundWinPoint":function(d){return "riproduci il suono di un punto vinto"},
"playSoundWinPoint2":function(d){return "riproduci il suono di un punto vinto (versione alternativa)"},
"playSoundWood":function(d){return "riproduci il suono di un tappo"},
"putdownTower":function(d){return "metti giù la torre"},
"reinfFeedbackMsg":function(d){return "Premi \"Riprova\" per ricominciare a giocare."},
"removeSquare":function(d){return "rimuovi un quadrato"},
"repeatUntil":function(d){return "ripeti fino a che"},
"repeatUntilBlocked":function(d){return "mentre c'è strada in avanti"},
"repeatUntilFinish":function(d){return "ripeti fino alla fine"},
"scoreText":function(d){return "Punteggio: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "imposta una scena scelta a caso"},
"setBackgroundHardcourt":function(d){return "imposta una scena tradizionale"},
"setBackgroundRetro":function(d){return "imposta una scena retrò"},
"setBackgroundTooltip":function(d){return "Imposta l'immagine per lo sfondo"},
"setBallRandom":function(d){return "imposta una palla scelta a caso"},
"setBallHardcourt":function(d){return "imposta una palla tradizionale"},
"setBallRetro":function(d){return "imposta una palla retrò"},
"setBallTooltip":function(d){return "Imposta l'immagine della palla"},
"setBallSpeedRandom":function(d){return "imposta per la palla una velocità scelta a caso"},
"setBallSpeedVerySlow":function(d){return "imposta per la palla una velocità molto lenta"},
"setBallSpeedSlow":function(d){return "imposta per la palla una velocità lenta"},
"setBallSpeedNormal":function(d){return "imposta per la palla una velocità normale"},
"setBallSpeedFast":function(d){return "imposta per la palla una velocità veloce"},
"setBallSpeedVeryFast":function(d){return "imposta per la palla una velocità molto veloce"},
"setBallSpeedTooltip":function(d){return "Imposta la velocità della palla"},
"setPaddleRandom":function(d){return "imposta una racchetta scelta a caso"},
"setPaddleHardcourt":function(d){return "imposta una racchetta tradizionale"},
"setPaddleRetro":function(d){return "imposta una racchetta retrò"},
"setPaddleTooltip":function(d){return "Imposta l'immagine della racchetta"},
"setPaddleSpeedRandom":function(d){return "imposta per la racchetta una velocità scelta a caso"},
"setPaddleSpeedVerySlow":function(d){return "imposta per la racchetta una velocità molto lenta"},
"setPaddleSpeedSlow":function(d){return "imposta per la racchetta una velocità lenta"},
"setPaddleSpeedNormal":function(d){return "imposta per la racchetta una velocità normale"},
"setPaddleSpeedFast":function(d){return "imposta per la racchetta una velocità veloce"},
"setPaddleSpeedVeryFast":function(d){return "imposta per la racchetta una velocità molto veloce"},
"setPaddleSpeedTooltip":function(d){return "Imposta la velocità della racchetta"},
"shareBounceTwitter":function(d){return "Guarda la versione di Ping-Pong che ho creato io. L'ho fatto per conto mio @codeorg @programmafuturo"},
"shareGame":function(d){return "Condividi il tuo gioco:"},
"turnLeft":function(d){return "gira a sinistra"},
"turnRight":function(d){return "gira a destra"},
"turnTooltip":function(d){return "Gira a sinistra o a destra di 90 gradi."},
"whenBallInGoal":function(d){return "quando la palla va in rete"},
"whenBallInGoalTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando la palla va in rete."},
"whenBallMissesPaddle":function(d){return "quando la palla manca la racchetta"},
"whenBallMissesPaddleTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando la palla manca la racchetta."},
"whenDown":function(d){return "quando si preme sulla freccia verso il basso"},
"whenDownTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso il basso\"."},
"whenGameStarts":function(d){return "quando inizia il gioco"},
"whenGameStartsTooltip":function(d){return "Esegue le azioni qua sotto quando si clicca su \"Esegui\"."},
"whenLeft":function(d){return "quando si preme sulla freccia verso sinistra"},
"whenLeftTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso sinistra\"."},
"whenPaddleCollided":function(d){return "quando la palla colpisce la racchetta"},
"whenPaddleCollidedTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando la palla colpisce la racchetta."},
"whenRight":function(d){return "quando si preme sulla freccia verso destra"},
"whenRightTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso destra\"."},
"whenUp":function(d){return "quando si preme sulla freccia verso l'alto"},
"whenUpTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso l'alto\"."},
"whenWallCollided":function(d){return "quando la palla colpisce il muro"},
"whenWallCollidedTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando una palla colpisce il muro."},
"whileMsg":function(d){return "mentre"},
"whileTooltip":function(d){return "Ripete le azioni incluse, smettendo quando diventa vera la condizione di arresto."},
"yes":function(d){return "Sì"}};