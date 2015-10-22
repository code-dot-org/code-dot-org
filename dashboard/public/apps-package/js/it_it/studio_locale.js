var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "personaggio"},
"addCharacter":function(d){return "aggiungere un"},
"addCharacterTooltip":function(d){return "Aggiungere un personaggio alla scena."},
"alienInvasion":function(d){return "Invasione aliena!"},
"backgroundBlack":function(d){return "nero"},
"backgroundCave":function(d){return "grotta"},
"backgroundCloudy":function(d){return "nuvoloso"},
"backgroundHardcourt":function(d){return "tradizionale"},
"backgroundNight":function(d){return "notte"},
"backgroundUnderwater":function(d){return "sottomarino"},
"backgroundCity":function(d){return "città"},
"backgroundDesert":function(d){return "deserto"},
"backgroundRainbow":function(d){return "arcobaleno"},
"backgroundSoccer":function(d){return "calcio"},
"backgroundSpace":function(d){return "spaziale"},
"backgroundTennis":function(d){return "campo da tennis"},
"backgroundWinter":function(d){return "inverno"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Azioni"},
"catControl":function(d){return "Ripetizioni"},
"catEvents":function(d){return "Eventi"},
"catLogic":function(d){return "Logica"},
"catMath":function(d){return "Matematica"},
"catProcedures":function(d){return "Funzioni"},
"catText":function(d){return "Testo"},
"catVariables":function(d){return "Variabili"},
"changeScoreTooltip":function(d){return "Aggiunge o toglie un punto al punteggio."},
"changeScoreTooltipK1":function(d){return "Aggiunge un punto al punteggio."},
"continue":function(d){return "Prosegui"},
"decrementPlayerScore":function(d){return "togli un punto"},
"defaultSayText":function(d){return "scrivi qua"},
"dropletBlock_addCharacter_description":function(d){return "Aggiungere un personaggio alla scena."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Aggiunge o toglie un punto al punteggio."},
"dropletBlock_changeScore_param0":function(d){return "punteggio"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slowly."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move quickly."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_playSound_description":function(d){return "Riproduce il suono scelto."},
"dropletBlock_playSound_param0":function(d){return "suono"},
"dropletBlock_playSound_param0_description":function(d){return "Il nome del suono da riprodurre."},
"dropletBlock_setBackground_description":function(d){return "Imposta l'immagine per lo sfondo"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "immagine"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "velocità"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Imposta l'umore del personaggio"},
"dropletBlock_setSpritePosition_description":function(d){return "Sposta istantaneamente un personaggio nella posizione specificata."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Imposta la velocità di un personaggio"},
"dropletBlock_setSprite_description":function(d){return "Imposta l'immagine del personaggio"},
"dropletBlock_setSprite_param0":function(d){return "indice"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "immagine"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('random', 'blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_throw_description":function(d){return "Lancia un proiettile dal personaggio specificato."},
"dropletBlock_vanish_description":function(d){return "Fa svanire il personaggio."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any character."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches man characters."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches pilot characters."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches pig characters."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches bird characters."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches mouse characters."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches roo characters."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches spider characters."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "umore"},
"finalLevel":function(d){return "Complimenti! Hai risolto l'esercizio finale."},
"for":function(d){return "per"},
"hello":function(d){return "ciao"},
"helloWorld":function(d){return "Ciao a tutti!"},
"incrementPlayerScore":function(d){return "aggiungi un punto"},
"itemBlueFireball":function(d){return "una palla di fuoco blu"},
"itemPurpleFireball":function(d){return "una palla di fuoco viola"},
"itemRedFireball":function(d){return "una palla di fuoco rossa"},
"itemYellowHearts":function(d){return "dei cuori gialli"},
"itemPurpleHearts":function(d){return "dei cuori viola"},
"itemRedHearts":function(d){return "dei cuori rossi"},
"itemRandom":function(d){return "a caso"},
"itemAnna":function(d){return "un gancio"},
"itemElsa":function(d){return "una scintilla"},
"itemHiro":function(d){return "un micro-robot"},
"itemBaymax":function(d){return "un razzo"},
"itemRapunzel":function(d){return "una padella"},
"itemCherry":function(d){return "una ciliegia"},
"itemIce":function(d){return "del ghiaccio"},
"itemDuck":function(d){return "un'anatra"},
"itemMan":function(d){return "uomo"},
"itemPilot":function(d){return "pilota"},
"itemPig":function(d){return "maiale"},
"itemBird":function(d){return "uccello"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "con sparizione"},
"makeProjectileBounce":function(d){return "con rimbalzo"},
"makeProjectileBlueFireball":function(d){return "fai una palla di fuoco blu"},
"makeProjectilePurpleFireball":function(d){return "fai una palla di fuoco viola"},
"makeProjectileRedFireball":function(d){return "fai una palla di fuoco rossa"},
"makeProjectileYellowHearts":function(d){return "fai dei cuori gialli"},
"makeProjectilePurpleHearts":function(d){return "fai dei cuori viola"},
"makeProjectileRedHearts":function(d){return "fai dei cuori rossi"},
"makeProjectileTooltip":function(d){return "Fa scomparire o rimbalzare ciò che ha appena urtato."},
"makeYourOwn":function(d){return "Costruisci il tuo Gioco col Laboratorio"},
"moveDirectionDown":function(d){return "in basso"},
"moveDirectionLeft":function(d){return "a sinistra"},
"moveDirectionRight":function(d){return "a destra"},
"moveDirectionUp":function(d){return "in alto"},
"moveDirectionRandom":function(d){return "a caso"},
"moveDistance25":function(d){return "25 pixel"},
"moveDistance50":function(d){return "50 pixel"},
"moveDistance100":function(d){return "100 pixel"},
"moveDistance200":function(d){return "200 pixel"},
"moveDistance400":function(d){return "400 pixel"},
"moveDistancePixels":function(d){return "pixel"},
"moveDistanceRandom":function(d){return "pixel scelti a caso"},
"moveDistanceTooltip":function(d){return "Sposta un personaggio della distanza specificata nella direzione specificata."},
"moveSprite":function(d){return "sposta"},
"moveSpriteN":function(d){return "sposta il personaggio "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "a x,y"},
"moveDown":function(d){return "sposta in basso"},
"moveDownTooltip":function(d){return "Sposta un personaggio verso il basso."},
"moveLeft":function(d){return "sposta a sinistra"},
"moveLeftTooltip":function(d){return "Sposta un personaggio verso sinistra."},
"moveRight":function(d){return "sposta a destra"},
"moveRightTooltip":function(d){return "Sposta un personaggio verso destra."},
"moveUp":function(d){return "sposta in alto"},
"moveUpTooltip":function(d){return "Sposta un personaggio verso l'alto."},
"moveTooltip":function(d){return "Sposta un personaggio."},
"nextLevel":function(d){return "Complimenti! Hai completato questo esercizio."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Questo esercizio può essere risolto con %1 blocchi."},
"onEventTooltip":function(d){return "Esegue il codice in risposta all'evento specificato."},
"ouchExclamation":function(d){return "Ahi!"},
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
"positionOutTopLeft":function(d){return "alla posizione a sinistra sopra la cima"},
"positionOutTopRight":function(d){return "alla posizione a destra sopra la cima"},
"positionTopOutLeft":function(d){return "alla posizione a sinistra esterna alla cima"},
"positionTopLeft":function(d){return "alla posizione in alto a sinistra"},
"positionTopCenter":function(d){return "alla posizione in alto al centro"},
"positionTopRight":function(d){return "alla posizione in alto a destra"},
"positionTopOutRight":function(d){return "alla posizione a destra esterna alla cima"},
"positionMiddleLeft":function(d){return "alla posizione nel mezzo a sinistra"},
"positionMiddleCenter":function(d){return "alla posizione nel mezzo al centro"},
"positionMiddleRight":function(d){return "alla posizione nel mezzo a destra"},
"positionBottomOutLeft":function(d){return "alla posizione a sinistra esterna al fondo"},
"positionBottomLeft":function(d){return "alla posizione in basso a sinistra"},
"positionBottomCenter":function(d){return "alla posizione in basso al centro"},
"positionBottomRight":function(d){return "alla posizione in basso a destra"},
"positionBottomOutRight":function(d){return "alla posizione a destra esterna al fondo"},
"positionOutBottomLeft":function(d){return "alla posizione a sinistra sotto il fondo"},
"positionOutBottomRight":function(d){return "alla posizione destra sotto il fondo"},
"positionRandom":function(d){return "alla posizione scelta a caso"},
"projectileBlueFireball":function(d){return "una palla di fuoco blu"},
"projectilePurpleFireball":function(d){return "una palla di fuoco viola"},
"projectileRedFireball":function(d){return "una palla di fuoco rossa"},
"projectileYellowHearts":function(d){return "dei cuori gialli"},
"projectilePurpleHearts":function(d){return "dei cuori viola"},
"projectileRedHearts":function(d){return "dei cuori rossi"},
"projectileRandom":function(d){return "un oggetto a caso"},
"projectileAnna":function(d){return "un gancio"},
"projectileElsa":function(d){return "una scintilla"},
"projectileHiro":function(d){return "un micro-robot"},
"projectileBaymax":function(d){return "un razzo"},
"projectileRapunzel":function(d){return "una padella"},
"projectileCherry":function(d){return "una ciliegia"},
"projectileIce":function(d){return "del ghiaccio"},
"projectileDuck":function(d){return "un'anatra"},
"reinfFeedbackMsg":function(d){return "Puoi premere il pulsante \"Riprova\" per tornare a giocare con la tua storia."},
"repeatForever":function(d){return "ripeti per sempre"},
"repeatDo":function(d){return "esegui"},
"repeatForeverTooltip":function(d){return "Esegue ripetutamente le azioni in questo blocco mentre la storia è in esecuzione."},
"saySprite":function(d){return "pronuncia"},
"saySpriteN":function(d){return "il personaggio "+studio_locale.v(d,"spriteIndex")+" dice"},
"saySpriteTooltip":function(d){return "Il personaggio specificato visualizza un fumetto con il testo indicato."},
"saySpriteChoices_0":function(d){return "Ciao!"},
"saySpriteChoices_1":function(d){return "Ciao a tutti!"},
"saySpriteChoices_2":function(d){return "Come va?"},
"saySpriteChoices_3":function(d){return "Buon giorno!"},
"saySpriteChoices_4":function(d){return "Buon pomeriggio!"},
"saySpriteChoices_5":function(d){return "Buona notte!"},
"saySpriteChoices_6":function(d){return "Buona sera!"},
"saySpriteChoices_7":function(d){return "Novità?"},
"saySpriteChoices_8":function(d){return "Cosa?"},
"saySpriteChoices_9":function(d){return "Dove?"},
"saySpriteChoices_10":function(d){return "Quando?"},
"saySpriteChoices_11":function(d){return "Bene!"},
"saySpriteChoices_12":function(d){return "Grande!"},
"saySpriteChoices_13":function(d){return "Va bene!"},
"saySpriteChoices_14":function(d){return "Non male..."},
"saySpriteChoices_15":function(d){return "Buona fortuna!"},
"saySpriteChoices_16":function(d){return "Sì"},
"saySpriteChoices_17":function(d){return "No"},
"saySpriteChoices_18":function(d){return "Ok!"},
"saySpriteChoices_19":function(d){return "Bel tiro!"},
"saySpriteChoices_20":function(d){return "Buona giornata!"},
"saySpriteChoices_21":function(d){return "Arrivederci!"},
"saySpriteChoices_22":function(d){return "Torno subito..."},
"saySpriteChoices_23":function(d){return "A domani!"},
"saySpriteChoices_24":function(d){return "A dopo!"},
"saySpriteChoices_25":function(d){return "Stammi bene!"},
"saySpriteChoices_26":function(d){return "Divertiti!"},
"saySpriteChoices_27":function(d){return "Devo andare..."},
"saySpriteChoices_28":function(d){return "Vuoi essere mio amico?"},
"saySpriteChoices_29":function(d){return "Ben fatto!"},
"saySpriteChoices_30":function(d){return "E vai!"},
"saySpriteChoices_31":function(d){return "Siiii!"},
"saySpriteChoices_32":function(d){return "Piacere!"},
"saySpriteChoices_33":function(d){return "Tutto bene!"},
"saySpriteChoices_34":function(d){return "Grazie!"},
"saySpriteChoices_35":function(d){return "No, grazie!"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Non importa..."},
"saySpriteChoices_38":function(d){return "Oggi"},
"saySpriteChoices_39":function(d){return "Domani"},
"saySpriteChoices_40":function(d){return "Ieri"},
"saySpriteChoices_41":function(d){return "Ti ho trovato!"},
"saySpriteChoices_42":function(d){return "Mi hai trovato!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Sei grande!"},
"saySpriteChoices_45":function(d){return "Sei divertente!"},
"saySpriteChoices_46":function(d){return "Sei sciocco! "},
"saySpriteChoices_47":function(d){return "Sei un buon amico!"},
"saySpriteChoices_48":function(d){return "Attento!"},
"saySpriteChoices_49":function(d){return "Fregato!"},
"saySpriteChoices_50":function(d){return "Preso!"},
"saySpriteChoices_51":function(d){return "Ohi!"},
"saySpriteChoices_52":function(d){return "Mi dispiace!"},
"saySpriteChoices_53":function(d){return "Fai attenzione!"},
"saySpriteChoices_54":function(d){return "Ehi!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "Mi hai quasi preso!"},
"saySpriteChoices_57":function(d){return "Bel tentativo!"},
"saySpriteChoices_58":function(d){return "Non mi prendi!"},
"scoreText":function(d){return "Punteggio: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "imposta uno sfondo"},
"setBackgroundRandom":function(d){return "imposta uno sfondo scelto a caso"},
"setBackgroundBlack":function(d){return "imposta uno sfondo nero"},
"setBackgroundCave":function(d){return "imposta uno sfondo cavernoso"},
"setBackgroundCloudy":function(d){return "imposta uno sfondo nuvoloso"},
"setBackgroundHardcourt":function(d){return "imposta uno sfondo tradizionale"},
"setBackgroundNight":function(d){return "imposta uno sfondo notturno"},
"setBackgroundUnderwater":function(d){return "imposta uno sfondo sottomarino"},
"setBackgroundCity":function(d){return "imposta uno sfondo cittadino"},
"setBackgroundDesert":function(d){return "imposta uno sfondo desertico"},
"setBackgroundRainbow":function(d){return "imposta uno sfondo con arcobaleno"},
"setBackgroundSoccer":function(d){return "imposta uno sfondo da campo da calcio"},
"setBackgroundSpace":function(d){return "imposta uno sfondo spaziale"},
"setBackgroundTennis":function(d){return "imposta uno sfondo da campo da tennis"},
"setBackgroundWinter":function(d){return "imposta uno sfondo invernale"},
"setBackgroundLeafy":function(d){return "imposta uno sfondo con foglie"},
"setBackgroundGrassy":function(d){return "imposta uno sfondo con erba"},
"setBackgroundFlower":function(d){return "imposta uno sfondo con fiori"},
"setBackgroundTile":function(d){return "imposta uno sfondo con piastrelle"},
"setBackgroundIcy":function(d){return "imposta uno sfondo con ghiaccio"},
"setBackgroundSnowy":function(d){return "imposta uno sfondo nevoso"},
"setBackgroundForest":function(d){return "imposta uno sfondo da foresta"},
"setBackgroundSnow":function(d){return "imposta uno sfondo con neve"},
"setBackgroundShip":function(d){return "imposta uno sfondo navale"},
"setBackgroundTooltip":function(d){return "Imposta l'immagine di sfondo"},
"setEnemySpeed":function(d){return "imposta la velocità del nemico"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "imposta la velocità del giocatore"},
"setScoreText":function(d){return "imposta il punteggio"},
"setScoreTextTooltip":function(d){return "Imposta il testo da visualizzare nell'area del punteggio."},
"setSpriteEmotionAngry":function(d){return "ad un umore arrabbiato"},
"setSpriteEmotionHappy":function(d){return "ad un umore felice"},
"setSpriteEmotionNormal":function(d){return "ad un umore normale"},
"setSpriteEmotionRandom":function(d){return "ad un umore scelto a caso"},
"setSpriteEmotionSad":function(d){return "ad un umore triste"},
"setSpriteEmotionTooltip":function(d){return "Imposta l'umore del personaggio"},
"setSpriteAlien":function(d){return "come un alieno"},
"setSpriteBat":function(d){return "come un pipistrello"},
"setSpriteBird":function(d){return "come un uccello"},
"setSpriteCat":function(d){return "come un gatto"},
"setSpriteCaveBoy":function(d){return "come un cavernicolo"},
"setSpriteCaveGirl":function(d){return "all'immagine di una cavernicola"},
"setSpriteDinosaur":function(d){return "come un dinosauro"},
"setSpriteDog":function(d){return "come un cane"},
"setSpriteDragon":function(d){return "come un drago"},
"setSpriteGhost":function(d){return "come un fantasma"},
"setSpriteHidden":function(d){return "come personaggio invisibile"},
"setSpriteHideK1":function(d){return "nascondi"},
"setSpriteAnna":function(d){return "come Anna"},
"setSpriteElsa":function(d){return "come Elsa"},
"setSpriteHiro":function(d){return "come Hiro"},
"setSpriteBaymax":function(d){return "come Baymax"},
"setSpriteRapunzel":function(d){return "come Raperonzolo"},
"setSpriteKnight":function(d){return "come un cavaliere"},
"setSpriteMonster":function(d){return "come un mostro"},
"setSpriteNinja":function(d){return "come un ninja mascherato"},
"setSpriteOctopus":function(d){return "come un polpo"},
"setSpritePenguin":function(d){return "all'immagine di un pinguino"},
"setSpritePirate":function(d){return "come un pirata"},
"setSpritePrincess":function(d){return "come una principessa"},
"setSpriteRandom":function(d){return "come personaggio scelto a caso"},
"setSpriteRobot":function(d){return "all'immagine di un robot"},
"setSpriteShowK1":function(d){return "mostra"},
"setSpriteSpacebot":function(d){return "come un robot spaziale"},
"setSpriteSoccerGirl":function(d){return "come una calciatrice"},
"setSpriteSoccerBoy":function(d){return "come un calciatore"},
"setSpriteSquirrel":function(d){return "come uno scoiattolo"},
"setSpriteTennisGirl":function(d){return "come una tennista"},
"setSpriteTennisBoy":function(d){return "come un tennista"},
"setSpriteUnicorn":function(d){return "come un unicorno"},
"setSpriteWitch":function(d){return "come una strega"},
"setSpriteWizard":function(d){return "come un mago"},
"setSpritePositionTooltip":function(d){return "Sposta istantaneamente un personaggio nella posizione specificata."},
"setSpriteK1Tooltip":function(d){return "Mostra o nasconde il personaggio specificato."},
"setSpriteTooltip":function(d){return "Definisce qual è il personaggio"},
"setSpriteSizeRandom":function(d){return "ad un valore casuale"},
"setSpriteSizeVerySmall":function(d){return "ad un valore molto piccolo"},
"setSpriteSizeSmall":function(d){return "ad un valore piccolo"},
"setSpriteSizeNormal":function(d){return "ad un valore normale"},
"setSpriteSizeLarge":function(d){return "ad un valore grande"},
"setSpriteSizeVeryLarge":function(d){return "ad un valore molto grande"},
"setSpriteSizeTooltip":function(d){return "Imposta la dimensione di un personaggio"},
"setSpriteSpeedRandom":function(d){return "a una velocità scelta a caso"},
"setSpriteSpeedVerySlow":function(d){return "a una velocità molto lenta"},
"setSpriteSpeedSlow":function(d){return "a una velocità lenta"},
"setSpriteSpeedNormal":function(d){return "a una velocità normale"},
"setSpriteSpeedFast":function(d){return "a una velocità veloce"},
"setSpriteSpeedVeryFast":function(d){return "a una velocità molto veloce"},
"setSpriteSpeedTooltip":function(d){return "Imposta la velocità di un personaggio"},
"setSpriteZombie":function(d){return "all'immagine di uno zombie"},
"setSpriteBot1":function(d){return "to bot1"},
"setSpriteBot2":function(d){return "to bot2"},
"setMap":function(d){return "set map"},
"setMapRandom":function(d){return "set random map"},
"setMapBlank":function(d){return "set blank map"},
"setMapCircle":function(d){return "set circle map"},
"setMapCircle2":function(d){return "set circle2 map"},
"setMapHorizontal":function(d){return "set horizontal map"},
"setMapGrid":function(d){return "set grid map"},
"setMapBlobs":function(d){return "set blobs map"},
"setMapTooltip":function(d){return "Changes the map in the scene"},
"shareStudioTwitter":function(d){return "Guarda la storia che ho creato io. L'ho fatta per conto mio @codeorg @programmafuturo"},
"shareGame":function(d){return "Condividi la tua storia:"},
"showCoordinates":function(d){return "mostra le coordinate"},
"showCoordinatesTooltip":function(d){return "Mostra le coordinate del protagonista sullo schermo"},
"showTitleScreen":function(d){return "mostra la schermata del titolo"},
"showTitleScreenTitle":function(d){return "titolo"},
"showTitleScreenText":function(d){return "testo"},
"showTSDefTitle":function(d){return "scrivi qua il titolo"},
"showTSDefText":function(d){return "scrivi qua il testo"},
"showTitleScreenTooltip":function(d){return "Mostra la schermata iniziale con titolo e testo."},
"size":function(d){return "dimensione"},
"setSprite":function(d){return "imposta"},
"setSpriteN":function(d){return "definisci il personaggio "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "sgranocchiamento"},
"soundGoal1":function(d){return "obiettivo raggiunto"},
"soundGoal2":function(d){return "obiettivo raggiunto (versione alternativa)"},
"soundHit":function(d){return "colpo"},
"soundLosePoint":function(d){return "punto perso"},
"soundLosePoint2":function(d){return "punto perso (versione alternativa)"},
"soundRetro":function(d){return "fischio"},
"soundRubber":function(d){return "rimbalzo"},
"soundSlap":function(d){return "schiaffo"},
"soundWinPoint":function(d){return "punto vinto"},
"soundWinPoint2":function(d){return "punto vinto (versione alternativa)"},
"soundWood":function(d){return "tappo"},
"speed":function(d){return "velocità"},
"startSetValue":function(d){return "inizio (funzione)"},
"startSetVars":function(d){return "game_vars (titolo, sottotitolo, sfondo, obiettivo, pericolo, giocatore)"},
"startSetFuncs":function(d){return "game_funcs (aggiorna-obiettivo, aggiorna-pericolo, aggiorna-giocatore, si-scontrano?, sullo-schermo?)"},
"stopSprite":function(d){return "ferma"},
"stopSpriteN":function(d){return "ferma il personaggio "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ferma il movimento di un personaggio."},
"throwSprite":function(d){return "lancia"},
"throwSpriteN":function(d){return "il personaggio "+studio_locale.v(d,"spriteIndex")+" lancia"},
"throwTooltip":function(d){return "Lancia un proiettile dal personaggio specificato."},
"vanish":function(d){return "fai svanire"},
"vanishActorN":function(d){return "fai svanire il personaggio "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Fa svanire il personaggio."},
"waitFor":function(d){return "aspetta per"},
"waitSeconds":function(d){return "secondi"},
"waitForClick":function(d){return "aspetta il clic"},
"waitForRandom":function(d){return "aspetta a caso"},
"waitForHalfSecond":function(d){return "aspetta per mezzo secondo"},
"waitFor1Second":function(d){return "aspetta per 1 secondo"},
"waitFor2Seconds":function(d){return "aspetta per 2 secondi"},
"waitFor5Seconds":function(d){return "aspetta per 5 secondi"},
"waitFor10Seconds":function(d){return "aspetta per 10 secondi"},
"waitParamsTooltip":function(d){return "Aspetta per il numero di secondi specificato (se è zero aspetta fino ad un clic)."},
"waitTooltip":function(d){return "Aspetta per il numero di secondi specificati o che il mouse venga cliccato."},
"whenArrowDown":function(d){return "si preme sulla freccia verso il basso"},
"whenArrowLeft":function(d){return "si preme sulla freccia verso sinistra"},
"whenArrowRight":function(d){return "si preme sulla freccia verso destra"},
"whenArrowUp":function(d){return "si preme sulla freccia verso l'alto"},
"whenArrowTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuta la freccia specificata."},
"whenDown":function(d){return "quando si preme sulla freccia verso il basso"},
"whenDownTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso il basso\"."},
"whenGameStarts":function(d){return "quando la storia inizia"},
"whenGameStartsTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando la storia inizia."},
"whenLeft":function(d){return "quando si preme sulla freccia verso sinistra"},
"whenLeftTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso sinistra\"."},
"whenRight":function(d){return "quando si preme sulla freccia verso destra"},
"whenRightTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso destra\"."},
"whenSpriteClicked":function(d){return "quando si clicca sul personaggio"},
"whenSpriteClickedN":function(d){return "quando si clicca sul personaggio "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando si clicca su un personaggio."},
"whenSpriteCollidedN":function(d){return "quando il personaggio "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando un personaggio tocca un altro personaggio."},
"whenSpriteCollidedWith":function(d){return "tocca"},
"whenSpriteCollidedWithAnyActor":function(d){return "tocca un qualunque personaggio"},
"whenSpriteCollidedWithAnyEdge":function(d){return "tocca un qualunque bordo"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "tocca un qualunque proiettile"},
"whenSpriteCollidedWithAnything":function(d){return "tocca una cosa qualunque"},
"whenSpriteCollidedWithN":function(d){return "tocca il personaggio "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "tocca la palla di fuoco blu"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "tocca la palla di fuoco viola"},
"whenSpriteCollidedWithRedFireball":function(d){return "tocca la palla di fuoco rossa"},
"whenSpriteCollidedWithYellowHearts":function(d){return "tocca i cuori gialli"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "tocca i cuori viola"},
"whenSpriteCollidedWithRedHearts":function(d){return "tocca i cuori rossi"},
"whenSpriteCollidedWithBottomEdge":function(d){return "tocca il bordo inferiore"},
"whenSpriteCollidedWithLeftEdge":function(d){return "tocca il bordo a sinistra"},
"whenSpriteCollidedWithRightEdge":function(d){return "tocca il bordo a destra"},
"whenSpriteCollidedWithTopEdge":function(d){return "tocca il bordo superiore"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "quando si preme sulla freccia verso l'alto"},
"whenUpTooltip":function(d){return "Esegue le azioni attaccate a questo blocco quando viene premuto il tasto o il pulsante \"freccia verso l'alto\"."},
"yes":function(d){return "Sì"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events."},
"dropletBlock_endGame_description":function(d){return "End the game."},
"dropletBlock_endGame_param0":function(d){return "type"},
"dropletBlock_endGame_param0_description":function(d){return "Whether the game was won or lost ('win', 'lose')."},
"loseMessage":function(d){return "You lose!"},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."}};