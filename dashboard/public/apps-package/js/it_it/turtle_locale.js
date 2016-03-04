var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Blocchi usati: %1"},
"branches":function(d){return "rami"},
"catColour":function(d){return "Colore"},
"catControl":function(d){return "Ripetizioni"},
"catMath":function(d){return "Matematica"},
"catProcedures":function(d){return "Funzioni"},
"catTurtle":function(d){return "Azioni"},
"catVariables":function(d){return "Variabili"},
"catLogic":function(d){return "Logica"},
"colourTooltip":function(d){return "Cambia il colore della matita."},
"createACircle":function(d){return "disegna un cerchio"},
"createSnowflakeSquare":function(d){return "disegna un fiocco di neve usando un quadrato"},
"createSnowflakeParallelogram":function(d){return "disegna un fiocco di neve usando un rombo"},
"createSnowflakeLine":function(d){return "disegna un fiocco di neve usando una linea"},
"createSnowflakeSpiral":function(d){return "disegna un fiocco di neve usando un cerchio"},
"createSnowflakeFlower":function(d){return "disegna un fiocco di neve a forma di fiore"},
"createSnowflakeFractal":function(d){return "disegna un fiocco di neve di aspetto frattale"},
"createSnowflakeRandom":function(d){return "disegna un fiocco di neve di forma scelta a caso"},
"createASnowflakeBranch":function(d){return "disegna un ramo di un fiocco di neve"},
"degrees":function(d){return "gradi"},
"depth":function(d){return "profondità"},
"dots":function(d){return "pixel"},
"drawACircle":function(d){return "disegna un cerchio"},
"drawAFlower":function(d){return "disegna un fiore"},
"drawAHexagon":function(d){return "disegna un esagono"},
"drawAHouse":function(d){return "disegna una casa"},
"drawAPlanet":function(d){return "disegna un pianeta"},
"drawARhombus":function(d){return "disegna un rombo"},
"drawARobot":function(d){return "disegna un robot"},
"drawARocket":function(d){return "disegna un razzo"},
"drawASnowflake":function(d){return "disegna un fiocco di neve"},
"drawASnowman":function(d){return "disegna un pupazzo di neve"},
"drawASquare":function(d){return "disegna un quadrato"},
"drawAStar":function(d){return "disegna una stella"},
"drawATree":function(d){return "disegna un albero"},
"drawATriangle":function(d){return "disegna un triangolo"},
"drawUpperWave":function(d){return "disegna un'onda in alto"},
"drawLowerWave":function(d){return "disegna un'onda in basso"},
"drawStamp":function(d){return "disegna il timbro"},
"heightParameter":function(d){return "altezza"},
"hideTurtle":function(d){return "nascondi l'artista"},
"jump":function(d){return "salta"},
"jumpBackward":function(d){return "salta all'indietro di"},
"jumpForward":function(d){return "salta in avanti di"},
"jumpTooltip":function(d){return "Sposta l'artista senza tracciare alcun segno."},
"jumpEastTooltip":function(d){return "Sposta l'artista verso est senza tracciare alcun segno."},
"jumpNorthTooltip":function(d){return "Sposta l'artista verso nord senza tracciare alcun segno."},
"jumpSouthTooltip":function(d){return "Sposta l'artista verso sud senza tracciare alcun segno."},
"jumpWestTooltip":function(d){return "Sposta l'artista verso ovest senza tracciare alcun segno."},
"lengthFeedback":function(d){return "L'hai fatto correttamente tranne che per la lunghezza del movimento."},
"lengthParameter":function(d){return "lunghezza"},
"loopVariable":function(d){return "contatore"},
"moveBackward":function(d){return "vai indietro di"},
"moveEastTooltip":function(d){return "Sposta l'artista verso est."},
"moveForward":function(d){return "vai avanti di"},
"moveForwardTooltip":function(d){return "Sposta l'artista in avanti."},
"moveNorthTooltip":function(d){return "Sposta l'artista verso nord."},
"moveSouthTooltip":function(d){return "Sposta l'artista verso sud."},
"moveWestTooltip":function(d){return "Sposta l'artista verso ovest."},
"moveTooltip":function(d){return "Sposta l'artista in avanti o all'indietro della quantità di pixel specificata."},
"notBlackColour":function(d){return "Devi impostare un colore diverso dal nero per questo esercizio."},
"numBlocksNeeded":function(d){return "Questo esercizio può essere risolto con %1 blocchi.  Tu ne hai usati %2."},
"penDown":function(d){return "Abbassa la matita"},
"penTooltip":function(d){return "Alza o abbassa la matita, per avviare o arrestare il disegno."},
"penUp":function(d){return "Alza la matita"},
"reinfFeedbackMsg":function(d){return "Ecco il tuo disegno! Continua a lavorarci sopra oppure passa al prossimo esercizio."},
"setAlpha":function(d){return "imposta la trasparenza"},
"setColour":function(d){return "Imposta il colore"},
"setPattern":function(d){return "imposta lo schema"},
"setWidth":function(d){return "imposta la larghezza"},
"shareDrawing":function(d){return "Condividi il tuo disegno:"},
"showMe":function(d){return "Mostrami"},
"showTurtle":function(d){return "Mostra l'artista"},
"sizeParameter":function(d){return "dimensione"},
"step":function(d){return "passo"},
"tooFewColours":function(d){return "Devi utilizzare almeno %1 diversi colori per questo esercizio.  Tu ne hai usati solo %2."},
"turnLeft":function(d){return "gira a sinistra di"},
"turnRight":function(d){return "gira a destra di"},
"turnRightTooltip":function(d){return "Gira l'artista a destra dell'angolo specificato."},
"turnTooltip":function(d){return "Gira l'artista a sinistra o a destra della quantità di gradi specificata."},
"turtleVisibilityTooltip":function(d){return "Rende l'artista visibile o invisibile."},
"widthTooltip":function(d){return "Cambia la larghezza della matita."},
"wrongColour":function(d){return "Il tuo disegno usa un colore sbagliato. Per questo esercizio, deve essere %1."}};