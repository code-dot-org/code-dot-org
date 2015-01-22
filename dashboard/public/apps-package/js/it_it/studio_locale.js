var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "personaggio"},
"alienInvasion":function(d){return "Invasione aliena!"},
"backgroundBlack":function(d){return "nero"},
"backgroundCave":function(d){return "grotta"},
"backgroundCloudy":function(d){return "nuvoloso"},
"backgroundHardcourt":function(d){return "polo"},
"backgroundNight":function(d){return "notte"},
"backgroundUnderwater":function(d){return "sottomarino"},
"backgroundCity":function(d){return "città"},
"backgroundDesert":function(d){return "deserto"},
"backgroundRainbow":function(d){return "arcobaleno"},
"backgroundSoccer":function(d){return "calcio"},
"backgroundSpace":function(d){return "spaziale"},
"backgroundTennis":function(d){return "campo da tennis"},
"backgroundWinter":function(d){return "inverno"},
"catActions":function(d){return "Azioni"},
"catControl":function(d){return "Ripetizioni"},
"catEvents":function(d){return "Eventi"},
"catLogic":function(d){return "Logica"},
"catMath":function(d){return "Matematica"},
"catProcedures":function(d){return "Funzioni"},
"catText":function(d){return "Testo"},
"catVariables":function(d){return "Variabili"},
"changeScoreTooltip":function(d){return "Aggiungi o togli un punto al punteggio."},
"changeScoreTooltipK1":function(d){return "Aggiungi un punto al punteggio."},
"continue":function(d){return "Prosegui"},
"decrementPlayerScore":function(d){return "togli un punto"},
"defaultSayText":function(d){return "scrivi qua"},
"emotion":function(d){return "umore"},
"finalLevel":function(d){return "Complimenti! Hai risolto l'esercizio finale."},
"for":function(d){return "per"},
"hello":function(d){return "ciao"},
"helloWorld":function(d){return "Ciao a tutti!"},
"incrementPlayerScore":function(d){return "aggiungi un punto"},
"makeProjectileDisappear":function(d){return "scompari"},
"makeProjectileBounce":function(d){return "rimbalzo"},
"makeProjectileBlueFireball":function(d){return "fai una palla di fuoco blu"},
"makeProjectilePurpleFireball":function(d){return "fai una palla di fuoco viola"},
"makeProjectileRedFireball":function(d){return "fai una palla di fuoco rossa"},
"makeProjectileYellowHearts":function(d){return "fai dei cuori gialli"},
"makeProjectilePurpleHearts":function(d){return "fai dei cuori viola"},
"makeProjectileRedHearts":function(d){return "fai dei cuori rossi"},
"makeProjectileTooltip":function(d){return "Fai scomparire o rimbalzare il proiettile appena urta."},
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
"moveSpriteN":function(d){return "sposta il personaggio "+appLocale.v(d,"spriteIndex")},
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
"ouchExclamation":function(d){return "Ahi!"},
"playSoundCrunch":function(d){return "riproduci il suono di uno sgranocchiamento"},
"playSoundGoal1":function(d){return "riproduci il suono per un obiettivo raggiunto"},
"playSoundGoal2":function(d){return "riproduci il suono per un obiettivo raggiunto (versione alternativa)"},
"playSoundHit":function(d){return "riproduci il suono di un colpo"},
"playSoundLosePoint":function(d){return "riproduci il suono di un punto perso"},
"playSoundLosePoint2":function(d){return "riproduci il suono di un punto perso (versione alternativa)"},
"playSoundRetro":function(d){return "riproduci un suono retrò"},
"playSoundRubber":function(d){return "riproduci il suono della gomma"},
"playSoundSlap":function(d){return "riproduci il suono di uno schiaffo"},
"playSoundTooltip":function(d){return "Riproduci il suono scelto."},
"playSoundWinPoint":function(d){return "riproduci il suono di un punto vinto"},
"playSoundWinPoint2":function(d){return "riproduci il suono di un punto vinto (versione alternativa)"},
"playSoundWood":function(d){return "riproduci il suono del legno"},
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
"projectileBlueFireball":function(d){return "palla di fuoco blu"},
"projectilePurpleFireball":function(d){return "palla di fuoco viola"},
"projectileRedFireball":function(d){return "palla di fuoco rossa"},
"projectileYellowHearts":function(d){return "cuori gialli"},
"projectilePurpleHearts":function(d){return "cuori viola"},
"projectileRedHearts":function(d){return "cuori rossi"},
"projectileRandom":function(d){return "casuale"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Raperonzolo"},
"reinfFeedbackMsg":function(d){return "Premi \"Riprova\" per ricominciare a giocare."},
"repeatForever":function(d){return "ripeti per sempre"},
"repeatDo":function(d){return "esegui"},
"repeatForeverTooltip":function(d){return "Esegui ripetutamente le azioni in questo blocco mentre la storia è in esecuzione."},
"saySprite":function(d){return "pronuncia"},
"saySpriteN":function(d){return "il personaggio "+appLocale.v(d,"spriteIndex")+" dice"},
"saySpriteTooltip":function(d){return "Il personaggio specificato visualizza un fumetto con il testo indicato."},
"scoreText":function(d){return "Punteggio: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "imposta lo sfondo"},
"setBackgroundRandom":function(d){return "imposta uno sfondo scelto a caso"},
"setBackgroundBlack":function(d){return "imposta lo sfondo nero"},
"setBackgroundCave":function(d){return "imposta lo sfondo Grotta"},
"setBackgroundCloudy":function(d){return "imposta lo sfondo nuvoloso"},
"setBackgroundHardcourt":function(d){return "imposta lo sfondo per polo"},
"setBackgroundNight":function(d){return "imposta lo sfondo notturno"},
"setBackgroundUnderwater":function(d){return "imposta lo sfondo Sottomarino"},
"setBackgroundCity":function(d){return "imposta lo sfondo Città"},
"setBackgroundDesert":function(d){return "imposta lo sfondo Deserto"},
"setBackgroundRainbow":function(d){return "imposta lo sfondo Arcobaleno"},
"setBackgroundSoccer":function(d){return "imposta lo sfondo Campo da Calcio"},
"setBackgroundSpace":function(d){return "imposta lo sfondo Spaziale"},
"setBackgroundTennis":function(d){return "imposta lo sfondo Campo da Tennis"},
"setBackgroundWinter":function(d){return "imposta lo sfondo Inverno"},
"setBackgroundTooltip":function(d){return "Imposta l'immagine di sfondo"},
"setEnemySpeed":function(d){return "imposta la velocità del nemico"},
"setPlayerSpeed":function(d){return "imposta la velocità del giocatore"},
"setScoreText":function(d){return "imposta il punteggio"},
"setScoreTextTooltip":function(d){return "Imposta il testo da visualizzare nell'area del punteggio."},
"setSpriteEmotionAngry":function(d){return "ad un umore arrabbiato"},
"setSpriteEmotionHappy":function(d){return "ad un umore felice"},
"setSpriteEmotionNormal":function(d){return "ad un umore normale"},
"setSpriteEmotionRandom":function(d){return "ad un umore scelto a caso"},
"setSpriteEmotionSad":function(d){return "ad un umore triste"},
"setSpriteEmotionTooltip":function(d){return "Imposta l'umore del personaggio"},
"setSpriteAlien":function(d){return "all'immagine di un alieno"},
"setSpriteBat":function(d){return "all'immagine di un pipistrello"},
"setSpriteBird":function(d){return "all'immagine di un uccello"},
"setSpriteCat":function(d){return "all'immagine di un gatto"},
"setSpriteCaveBoy":function(d){return "all'immagine di un cavernicolo"},
"setSpriteCaveGirl":function(d){return "all'immagine di una cavernicola"},
"setSpriteDinosaur":function(d){return "all'immagine di un dinosauro"},
"setSpriteDog":function(d){return "all'immagine di un gatto"},
"setSpriteDragon":function(d){return "all'immagine di un drago"},
"setSpriteGhost":function(d){return "all'immagine di un fantasma"},
"setSpriteHidden":function(d){return "a un'immagine nascosta"},
"setSpriteHideK1":function(d){return "nascondi"},
"setSpriteAnna":function(d){return "a un'immagine di Anna"},
"setSpriteElsa":function(d){return "all'immagine di Elsa"},
"setSpriteHiro":function(d){return "all'immagine di Hiro"},
"setSpriteBaymax":function(d){return "all'immagine di Baymax"},
"setSpriteRapunzel":function(d){return "all'immagine di Raperonzolo"},
"setSpriteKnight":function(d){return "all'immagine di un cavaliere"},
"setSpriteMonster":function(d){return "all'immagine di un mostro"},
"setSpriteNinja":function(d){return "all'immagine di un ninja mascherato"},
"setSpriteOctopus":function(d){return "all'immagine di un polpo"},
"setSpritePenguin":function(d){return "all'immagine di un pinguino"},
"setSpritePirate":function(d){return "all'immagine di un pirata"},
"setSpritePrincess":function(d){return "all'immagine di una principessa"},
"setSpriteRandom":function(d){return "a un'immagine scelta a caso"},
"setSpriteRobot":function(d){return "all'immagine di un robot"},
"setSpriteShowK1":function(d){return "mostra"},
"setSpriteSpacebot":function(d){return "all'immagine di un robot spaziale"},
"setSpriteSoccerGirl":function(d){return "all'immagine di una calciatrice"},
"setSpriteSoccerBoy":function(d){return "all'immagine di un calciatore"},
"setSpriteSquirrel":function(d){return "all'immagine di uno scoiattolo"},
"setSpriteTennisGirl":function(d){return "all'immagine di una tennista"},
"setSpriteTennisBoy":function(d){return "all'immagine di un tennista"},
"setSpriteUnicorn":function(d){return "all'immagine di un unicorno"},
"setSpriteWitch":function(d){return "all'immagine di una strega"},
"setSpriteWizard":function(d){return "all'immagine di un mago"},
"setSpritePositionTooltip":function(d){return "Sposta istantaneamente un personaggio nella posizione specificata."},
"setSpriteK1Tooltip":function(d){return "Mostra o nascondi il personaggio specificato."},
"setSpriteTooltip":function(d){return "Imposta l'immagine del personaggio"},
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
"setSpriteN":function(d){return "imposta il personaggio "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "sgranocchiamento"},
"soundGoal1":function(d){return "obiettivo raggiunto"},
"soundGoal2":function(d){return "obiettivo raggiunto (versione alternativa)"},
"soundHit":function(d){return "colpo"},
"soundLosePoint":function(d){return "punto perso"},
"soundLosePoint2":function(d){return "punto perso (versione alternativa)"},
"soundRetro":function(d){return "retrò"},
"soundRubber":function(d){return "gomma"},
"soundSlap":function(d){return "schiaffo"},
"soundWinPoint":function(d){return "punto vinto"},
"soundWinPoint2":function(d){return "punto vinto (versione alternativa)"},
"soundWood":function(d){return "legno"},
"speed":function(d){return "velocità"},
"startSetValue":function(d){return "start (rocket-height function)"},
"stopSprite":function(d){return "ferma"},
"stopSpriteN":function(d){return "ferma il personaggio "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ferma il movimento di un personaggio."},
"throwSprite":function(d){return "lancia"},
"throwSpriteN":function(d){return "il personaggio "+appLocale.v(d,"spriteIndex")+" lancia"},
"throwTooltip":function(d){return "Lancia un proiettile dal personaggio specificato."},
"vanish":function(d){return "fai svanire"},
"vanishActorN":function(d){return "fai svanire il personaggio "+appLocale.v(d,"spriteIndex")},
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
"whenArrowDown":function(d){return "freccia in basso"},
"whenArrowLeft":function(d){return "freccia a sinistra"},
"whenArrowRight":function(d){return "freccia a destra"},
"whenArrowUp":function(d){return "freccia in alto"},
"whenArrowTooltip":function(d){return "Esegui le azioni sotto indicate quando viene premuta la freccia specificata."},
"whenDown":function(d){return "quando la freccia in basso"},
"whenDownTooltip":function(d){return "Esegue le azioni qua sotto quando viene premuto il tasto \"freccia in basso\"."},
"whenGameStarts":function(d){return "quando la storia inizia"},
"whenGameStartsTooltip":function(d){return "Esegue le azioni qua sotto quando la storia inizia."},
"whenLeft":function(d){return "quando la freccia a sinistra"},
"whenLeftTooltip":function(d){return "Esegue le azioni qua sotto quando viene premuto il tasto \"freccia a sinistra\"."},
"whenRight":function(d){return "quando la freccia a destra"},
"whenRightTooltip":function(d){return "Esegue le azioni qua sotto quando viene premuto il tasto \"freccia a destra\"."},
"whenSpriteClicked":function(d){return "quando si clicca sul personaggio"},
"whenSpriteClickedN":function(d){return "quando si clicca sul personaggio "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "Esegui le azioni qua sotto quando si clicca su un personaggio."},
"whenSpriteCollidedN":function(d){return "quando il personaggio "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Esegui le azioni qua sotto quando un personaggio tocca un altro personaggio."},
"whenSpriteCollidedWith":function(d){return "tocca"},
"whenSpriteCollidedWithAnyActor":function(d){return "tocca un qualunque personaggio"},
"whenSpriteCollidedWithAnyEdge":function(d){return "tocca un qualunque bordo"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "tocca un qualunque proiettile"},
"whenSpriteCollidedWithAnything":function(d){return "tocca una cosa qualunque"},
"whenSpriteCollidedWithN":function(d){return "tocca il personaggio "+appLocale.v(d,"spriteIndex")},
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
"whenUp":function(d){return "quando la freccia in alto"},
"whenUpTooltip":function(d){return "Esegue le azioni qua sotto quando viene premuto il tasto \"freccia in alto\"."},
"yes":function(d){return "Sì"}};