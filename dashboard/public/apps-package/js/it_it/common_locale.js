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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
"booleanTrue":function(d){return "vero"},
"booleanFalse":function(d){return "falso"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Azioni"},
"catColour":function(d){return "Colore"},
"catLogic":function(d){return "Logica"},
"catLists":function(d){return "Liste"},
"catLoops":function(d){return "Ripetizioni"},
"catMath":function(d){return "Matematica"},
"catProcedures":function(d){return "Funzioni"},
"catText":function(d){return "Testo"},
"catVariables":function(d){return "Variabili"},
"codeTooltip":function(d){return "Guarda il codice JavaScript generato."},
"continue":function(d){return "Prosegui"},
"dialogCancel":function(d){return "Annulla"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "O"},
"end":function(d){return "fine"},
"emptyBlocksErrorMsg":function(d){return "Il blocco \"ripeti\" o \"se\" deve avere all'interno altri blocchi per poter funzionare. Assicurati che i blocchi siano inseriti correttamente all'interno del blocco contenente."},
"emptyFunctionBlocksErrorMsg":function(d){return "Un blocco funzione deve avere all'interno altri blocchi per poter funzionare."},
"errorEmptyFunctionBlockModal":function(d){return "Ci devono essere dei blocchi all'interno della tua funzione. Clicca su \"Modifica\" e trascina dei blocchi all'interno del blocco verde."},
"errorIncompleteBlockInFunction":function(d){return "Clicca su \"Modifica\" per essere sicuro di non avere alcun blocco mancante nella tua funzione."},
"errorParamInputUnattached":function(d){return "Ricordati di attaccare un blocco a ciascun parametro di ingresso della funzione presente nella tua area di lavoro."},
"errorUnusedParam":function(d){return "Hai aggiunto un blocco di parametri, ma non l'hai utilizzato nella definizione. Assicurati di utilizzare il parametro cliccando su \"Modifica\" e mettendo il blocco dei parametri all'interno del blocco verde."},
"errorRequiredParamsMissing":function(d){return "Crea un parametro per la tua funzione cliccando su \"Modifica\" ed aggiungendo i parametri necessari. Trascina i nuovi blocchi dei parametri nella tua definizione di funzione."},
"errorUnusedFunction":function(d){return "Hai creato una funzione, ma non l'hai mai usata nella tua area di lavoro! Clicca su \"Funzioni\" nella cassetta degli attrezzi e assicurati di usarla nel tuo programma."},
"errorQuestionMarksInNumberField":function(d){return "Prova a sostituire \"???\" con un valore."},
"extraTopBlocks":function(d){return "Ci sono dei blocchi non collegati agli altri. Volevi forse attaccarli al blocco 'quando si clicca su \"Esegui\" '?"},
"finalStage":function(d){return "Complimenti! Hai completato l'ultima lezione."},
"finalStageTrophies":function(d){return "Complimenti! Hai completato l'ultima lezione e vinto "+locale.p(d,"numTrophies",0,"it",{"one":"un trofeo","other":locale.n(d,"numTrophies")+" trofei"})+"."},
"finish":function(d){return "Condividi"},
"generatedCodeInfo":function(d){return "Anche le migliori università (p.es., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+") insegnano la programmazione visuale con i blocchi. Ma i blocchi che metti insieme possono essere rappresentati anche in JavaScript, uno dei linguaggi di programmazione più usati al mondo:"},
"hashError":function(d){return "Siamo spiacenti, '%1' non corrisponde ad alcun programma salvato."},
"help":function(d){return "Aiuto"},
"hintTitle":function(d){return "Suggerimento:"},
"jump":function(d){return "salta"},
"levelIncompleteError":function(d){return "Stai usando tutti i tipi di blocchi necessari, ma non nel modo giusto."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Costruisci la tua versione del gioco Flappy"},
"missingBlocksErrorMsg":function(d){return "Prova uno o più dei blocchi che trovi qui sotto per risolvere questo esercizio."},
"nextLevel":function(d){return "Complimenti! Hai completato l'esercizio "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Complimenti! Hai completato l'esercizio "+locale.v(d,"puzzleNumber")+" e vinto "+locale.p(d,"numTrophies",0,"it",{"one":"un trofeo","other":locale.n(d,"numTrophies")+" trofei"})+"."},
"nextStage":function(d){return "Complimenti! Hai completato la lezione "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Complimenti! Hai completato la lezione "+locale.v(d,"stageName")+" e vinto "+locale.p(d,"numTrophies",0,"it",{"one":"un trofeo","other":locale.n(d,"numTrophies")+" trofei"})+"."},
"numBlocksNeeded":function(d){return "Complimenti! Hai completato l'esercizio "+locale.v(d,"puzzleNumber")+". (Avresti però potuto usare solo "+locale.p(d,"numBlocks",0,"it",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Hai appena scritto "+locale.p(d,"numLines",0,"it",{"one":"1 linea","other":locale.n(d,"numLines")+" linee"})+" di codice!"},
"play":function(d){return "inizia"},
"print":function(d){return "Stampa"},
"puzzleTitle":function(d){return "Esercizio "+locale.v(d,"puzzle_number")+" di "+locale.v(d,"stage_total")},
"repeat":function(d){return "ripeti"},
"resetProgram":function(d){return "Ricomincia"},
"runProgram":function(d){return "Esegui"},
"runTooltip":function(d){return "Esegui il programma definito dai blocchi presenti nell'area di lavoro."},
"score":function(d){return "punteggio"},
"showCodeHeader":function(d){return "Mostra il codice"},
"showBlocksHeader":function(d){return "Mostra i blocchi"},
"showGeneratedCode":function(d){return "Mostra il codice"},
"stringEquals":function(d){return "stringa = ?"},
"subtitle":function(d){return "un ambiente di programmazione visuale"},
"textVariable":function(d){return "testo"},
"tooFewBlocksMsg":function(d){return "Stai usando tutti i tipi di blocchi necessari, ma prova usando più blocchi o usandoli diversamente."},
"tooManyBlocksMsg":function(d){return "Questo esercizio può essere risolto con <x id='START_SPAN'/><x id='END_SPAN'/> blocchi."},
"tooMuchWork":function(d){return "Mi hai fatto fare un sacco di lavoro!  Puoi provare a farmi fare meno ripetizioni?"},
"toolboxHeader":function(d){return "Blocchi"},
"openWorkspace":function(d){return "Come funziona"},
"totalNumLinesOfCodeWritten":function(d){return "Totale complessivo: "+locale.p(d,"numLines",0,"it",{"one":"1 linea","other":locale.n(d,"numLines")+" linee"})+" di codice."},
"tryAgain":function(d){return "Riprova"},
"hintRequest":function(d){return "Vedi il suggerimento"},
"backToPreviousLevel":function(d){return "Torna al livello precedente"},
"saveToGallery":function(d){return "Salva nella collezione"},
"savedToGallery":function(d){return "Salvato nella collezione!"},
"shareFailure":function(d){return "Ci dispiace, non possiamo condividere questo programma."},
"workspaceHeader":function(d){return "Assembla i tuoi blocchi qui: "},
"workspaceHeaderJavaScript":function(d){return "Scrivi qua il tuo codice JavaScript"},
"infinity":function(d){return "Infinito"},
"rotateText":function(d){return "Ruota il dispositivo."},
"orientationLock":function(d){return "Disattiva il blocco dell'orientamento nelle impostazioni del dispositivo."},
"wantToLearn":function(d){return "Vuoi imparare a programmare?"},
"watchVideo":function(d){return "Guarda il video"},
"when":function(d){return "quando"},
"whenRun":function(d){return "quando si clicca su \"Esegui\""},
"tryHOC":function(d){return "Prova l'Ora del Codice"},
"signup":function(d){return "Iscriviti al corso introduttivo"},
"hintHeader":function(d){return "Ecco un suggerimento:"},
"genericFeedback":function(d){return "Verifica il risultato e prova a correggere il tuo programma."},
"toggleBlocksErrorMsg":function(d){return "You need to correct an error in your program before it can be shown as blocks."},
"defaultTwitterText":function(d){return "Guarda cosa ho fatto"}};