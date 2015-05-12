var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Prosegui"},
"doCode":function(d){return "esegui"},
"elseCode":function(d){return "altrimenti"},
"endGame":function(d){return "fine del gioco"},
"endGameTooltip":function(d){return "Termina il gioco."},
"finalLevel":function(d){return "Complimenti! Hai risolto l'esercizio finale."},
"flap":function(d){return "sbatti le ali"},
"flapRandom":function(d){return "sbatti le ali per un numero di volte scelto a caso"},
"flapVerySmall":function(d){return "sbatti le ali per un numero di volte molto piccolo"},
"flapSmall":function(d){return "sbatti le ali per un numero di volte piccolo"},
"flapNormal":function(d){return "sbatti le ali per un numero di volte normale"},
"flapLarge":function(d){return "sbatti le ali per un numero di volte grande"},
"flapVeryLarge":function(d){return "sbatti le ali per un numero di volte molto grande"},
"flapTooltip":function(d){return "fai volare Flappy verso l'alto."},
"flappySpecificFail":function(d){return "Il tuo codice sembra buono - Flappy sbatte le ali ad ogni clic. Ma devi cliccare molte volte per volare fino al bersaglio."},
"incrementPlayerScore":function(d){return "aggiungi un punto"},
"incrementPlayerScoreTooltip":function(d){return "Aggiunge uno al punteggio attuale del giocatore."},
"nextLevel":function(d){return "Complimenti! Hai completato questo esercizio."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Questo esercizio può essere risolto con %1 blocchi."},
"playSoundRandom":function(d){return "riproduci un suono scelto a caso"},
"playSoundBounce":function(d){return "riproduci il suono di un rimbalzo"},
"playSoundCrunch":function(d){return "riproduci il suono di uno sgranocchiamento"},
"playSoundDie":function(d){return "riproduci un suono triste"},
"playSoundHit":function(d){return "riproduci il suono di uno schiacciamento"},
"playSoundPoint":function(d){return "riproduci il suono di un punto"},
"playSoundSwoosh":function(d){return "riproduci il suono di un risucchio"},
"playSoundWing":function(d){return "riproduci il suono di un'ala"},
"playSoundJet":function(d){return "riproduci il suono di un aereo a reazione"},
"playSoundCrash":function(d){return "riproduci il suono di qualcosa che si rompe"},
"playSoundJingle":function(d){return "riproduci il suono di un tintinnio"},
"playSoundSplash":function(d){return "riproduci il suono di un tuffo nell'acqua"},
"playSoundLaser":function(d){return "riproduci il suono di un raggio laser"},
"playSoundTooltip":function(d){return "Riproduci il suono scelto."},
"reinfFeedbackMsg":function(d){return "Premi \"Riprova\" per ricominciare a giocare."},
"scoreText":function(d){return "Punteggio: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "imposta la scena"},
"setBackgroundRandom":function(d){return "imposta una scena scelta a caso"},
"setBackgroundFlappy":function(d){return "impostare la scena Città di giorno"},
"setBackgroundNight":function(d){return "imposta la scena Città di notte"},
"setBackgroundSciFi":function(d){return "imposta la scena Fantascienza"},
"setBackgroundUnderwater":function(d){return "imposta la scena Sottomarina"},
"setBackgroundCave":function(d){return "imposta la scena Grotta"},
"setBackgroundSanta":function(d){return "imposta la scena Natale"},
"setBackgroundTooltip":function(d){return "Imposta l'immagine per lo sfondo"},
"setGapRandom":function(d){return "imposta una distanza scelta a caso"},
"setGapVerySmall":function(d){return "imposta una distanza molto piccola"},
"setGapSmall":function(d){return "imposta una distanza piccola"},
"setGapNormal":function(d){return "imposta una distanza normale"},
"setGapLarge":function(d){return "imposta una distanza grande"},
"setGapVeryLarge":function(d){return "imposta una distanza molto grande"},
"setGapHeightTooltip":function(d){return "Imposta la distanza verticale in un ostacolo"},
"setGravityRandom":function(d){return "imposta una gravità scelta a caso"},
"setGravityVeryLow":function(d){return "imposta la gravità molto bassa"},
"setGravityLow":function(d){return "imposta la gravità bassa"},
"setGravityNormal":function(d){return "imposta la gravità normale"},
"setGravityHigh":function(d){return "imposta la gravità alta"},
"setGravityVeryHigh":function(d){return "imposta la gravità molto alta"},
"setGravityTooltip":function(d){return "Imposta il livello della gravità"},
"setGround":function(d){return "imposta il terreno"},
"setGroundRandom":function(d){return "imposta un terreno scelto a caso"},
"setGroundFlappy":function(d){return "imposta il terreno Normale"},
"setGroundSciFi":function(d){return "imposta il terreno Fantascienza"},
"setGroundUnderwater":function(d){return "imposta il terreno Sottomarino"},
"setGroundCave":function(d){return "imposta il terreno Grotta"},
"setGroundSanta":function(d){return "Imposta il terreno Natale"},
"setGroundLava":function(d){return "imposta il terreno Lava"},
"setGroundTooltip":function(d){return "Imposta l'immagine per il terreno"},
"setObstacle":function(d){return "imposta l'ostacolo"},
"setObstacleRandom":function(d){return "imposta un ostacolo scelto a caso"},
"setObstacleFlappy":function(d){return "imposta l'ostacolo Tubo"},
"setObstacleSciFi":function(d){return "imposta l'ostacolo Fantascienza"},
"setObstacleUnderwater":function(d){return "imposta l'ostacolo Pianta"},
"setObstacleCave":function(d){return "imposta l'ostacolo Grotta"},
"setObstacleSanta":function(d){return "imposta l'ostacolo Camino"},
"setObstacleLaser":function(d){return "imposta l'ostacolo Raggio Laser"},
"setObstacleTooltip":function(d){return "Imposta l'immagine per l'ostacolo"},
"setPlayer":function(d){return "imposta il giocatore"},
"setPlayerRandom":function(d){return "imposta un giocatore scelto a caso"},
"setPlayerFlappy":function(d){return "imposta il giocatore Uccello Giallo"},
"setPlayerRedBird":function(d){return "imposta il giocatore Uccello Rosso"},
"setPlayerSciFi":function(d){return "imposta il giocatore Astronave"},
"setPlayerUnderwater":function(d){return "imposta il giocatore Pesce"},
"setPlayerCave":function(d){return "imposta il giocatore Pipistrello"},
"setPlayerSanta":function(d){return "imposta il giocatore Babbo Natale"},
"setPlayerShark":function(d){return "imposta il giocatore Squalo"},
"setPlayerEaster":function(d){return "imposta il giocatore Coniglietto"},
"setPlayerBatman":function(d){return "imposta il giocatore Batman"},
"setPlayerSubmarine":function(d){return "imposta il giocatore Sottomarino"},
"setPlayerUnicorn":function(d){return "imposta il giocatore Unicorno"},
"setPlayerFairy":function(d){return "imposta il giocatore Fatina"},
"setPlayerSuperman":function(d){return "imposta il giocatore Superman"},
"setPlayerTurkey":function(d){return "imposta il giocatore Tacchino"},
"setPlayerTooltip":function(d){return "Imposta l'immagine per il giocatore"},
"setScore":function(d){return "imposta il punteggio"},
"setScoreTooltip":function(d){return "Imposta il punteggio del giocatore"},
"setSpeed":function(d){return "Imposta la velocità"},
"setSpeedTooltip":function(d){return "Imposta la velocità con cui Flappy sbatte le ali"},
"shareFlappyTwitter":function(d){return "Guarda la versione di Flappy che ho creato io. L'ho fatto per conto mio @codeorg @programmafuturo"},
"shareGame":function(d){return "Condividi il tuo gioco:"},
"soundRandom":function(d){return "casuale"},
"soundBounce":function(d){return "rimbalzo"},
"soundCrunch":function(d){return "sgranocchiamento"},
"soundDie":function(d){return "triste"},
"soundHit":function(d){return "schiacciamento"},
"soundPoint":function(d){return "punto"},
"soundSwoosh":function(d){return "risucchio"},
"soundWing":function(d){return "ala"},
"soundJet":function(d){return "aereo a reazione"},
"soundCrash":function(d){return "qualcosa che si rompe"},
"soundJingle":function(d){return "tintinnio"},
"soundSplash":function(d){return "tuffo nell'acqua"},
"soundLaser":function(d){return "raggio laser"},
"speedRandom":function(d){return "imposta una velocità scelta a caso"},
"speedVerySlow":function(d){return "imposta una velocità molto lenta"},
"speedSlow":function(d){return "imposta una velocità lenta"},
"speedNormal":function(d){return "imposta una velocità normale"},
"speedFast":function(d){return "imposta una velocità veloce"},
"speedVeryFast":function(d){return "imposta una velocità molto veloce"},
"whenClick":function(d){return "quando si clicca"},
"whenClickTooltip":function(d){return "Esegue le azioni qua sotto quando si verifica l'evento \"clic\"."},
"whenCollideGround":function(d){return "quando precipita a terra"},
"whenCollideGroundTooltip":function(d){return "Esegue le azioni qua sotto quando Flappy precipita a terra."},
"whenCollideObstacle":function(d){return "quando colpisce un ostacolo"},
"whenCollideObstacleTooltip":function(d){return "Esegue le azioni qua sotto quando Flappy colpisce un ostacolo."},
"whenEnterObstacle":function(d){return "quando supera un ostacolo"},
"whenEnterObstacleTooltip":function(d){return "Esegue le azioni qua sotto quando Flappy incontra un ostacolo."},
"whenRunButtonClick":function(d){return "quando si clicca su \"Esegui\""},
"whenRunButtonClickTooltip":function(d){return "Esegue le azioni qua sotto quando si clicca su \"Esegui\"."},
"yes":function(d){return "Sì"}};