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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Nastavi"},
"doCode":function(d){return "uradi"},
"elseCode":function(d){return "inače"},
"endGame":function(d){return "završi igru"},
"endGameTooltip":function(d){return "Završava igru."},
"finalLevel":function(d){return "Čestitamo! Riješen je posljednji zadatak."},
"flap":function(d){return "mahni krilima"},
"flapRandom":function(d){return "mahni krilima nasumično jako"},
"flapVerySmall":function(d){return "sasvim malo mahni krilima"},
"flapSmall":function(d){return "malo mahni krilima"},
"flapNormal":function(d){return "mahni krilima normalno"},
"flapLarge":function(d){return "jako mahni krilima"},
"flapVeryLarge":function(d){return "veoma jako mahni krilima"},
"flapTooltip":function(d){return "Neka Flappy leti prema gore."},
"flappySpecificFail":function(d){return "Tvoj kod izgleda dobro - na svaki klik će poletjeti. Ali problem je što trebaš kliknuti puno puta da bi došao do cilja."},
"incrementPlayerScore":function(d){return "osvoji poen"},
"incrementPlayerScoreTooltip":function(d){return "Povećaj broj bodova trenutnog igrača za jedan."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti s %1 blokova."},
"playSoundRandom":function(d){return "pusti nasumično odabrani zvuk"},
"playSoundBounce":function(d){return "pusti zvuk odskakanja"},
"playSoundCrunch":function(d){return "pokreni zvuk krckanja"},
"playSoundDie":function(d){return "pusti zvuk razočarenja"},
"playSoundHit":function(d){return "pusti zvuk razbijanja"},
"playSoundPoint":function(d){return "pusti zvuk osvajanja poena"},
"playSoundSwoosh":function(d){return "pusti zvuk prolijetanja"},
"playSoundWing":function(d){return "pusti zvuk krila"},
"playSoundJet":function(d){return "pusti zvuk mlaznjaka"},
"playSoundCrash":function(d){return "pusti zvuk lomljave"},
"playSoundJingle":function(d){return "pusti zvuk zvonceta"},
"playSoundSplash":function(d){return "pusti zvuk prskanja"},
"playSoundLaser":function(d){return "pusti zvuk lasera"},
"playSoundTooltip":function(d){return "Pusti odabrani zvuk."},
"reinfFeedbackMsg":function(d){return "Možeš pritisnuti gumb \"Pokušaj ponovno\" i vratiti se igrati svoju igru."},
"scoreText":function(d){return "Rezultat: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "postavi scenu"},
"setBackgroundRandom":function(d){return "postavi nasumično odabranu scenu"},
"setBackgroundFlappy":function(d){return "postavi Gradsku scenu (dan)"},
"setBackgroundNight":function(d){return "postavi Gradsku scenu (noć)"},
"setBackgroundSciFi":function(d){return "postavi naučno-fantastičnu scenu"},
"setBackgroundUnderwater":function(d){return "postavi Podvodnu scenu"},
"setBackgroundCave":function(d){return "postavi scenu Pećine"},
"setBackgroundSanta":function(d){return "postavi scenu Djeda Mraza"},
"setBackgroundTooltip":function(d){return "Postavlja pozadinsku sliku"},
"setGapRandom":function(d){return "postavi nasumični razmak"},
"setGapVerySmall":function(d){return "postavi veoma mali razmak"},
"setGapSmall":function(d){return "postavi mali razmak"},
"setGapNormal":function(d){return "postavi normalni razmak"},
"setGapLarge":function(d){return "postavi veliki razmak"},
"setGapVeryLarge":function(d){return "postavi veoma veliki razmak"},
"setGapHeightTooltip":function(d){return "Postavlja okomiti prolaz kroz prepreku"},
"setGravityRandom":function(d){return "postavi nasumičnu gravitaciju"},
"setGravityVeryLow":function(d){return "postavi veoma malu gravitaciju"},
"setGravityLow":function(d){return "postavi malu gravitaciju"},
"setGravityNormal":function(d){return "postavi normalnu gravitaciju"},
"setGravityHigh":function(d){return "postavi veliku gravitaciju"},
"setGravityVeryHigh":function(d){return "postavi veoma veliku gravitaciju"},
"setGravityTooltip":function(d){return "Postavlja gravitaciju na određeni nivo"},
"setGround":function(d){return "postavi tlo"},
"setGroundRandom":function(d){return "postavi nasumično odabrano tlo"},
"setGroundFlappy":function(d){return "postavi zemljano tlo"},
"setGroundSciFi":function(d){return "postavi naučno-fantastično tlo"},
"setGroundUnderwater":function(d){return "postavi podvodno tlo"},
"setGroundCave":function(d){return "postavi pećinsko tlo"},
"setGroundSanta":function(d){return "postavi tlo Djeda Mraza"},
"setGroundLava":function(d){return "postavi tlo od lave"},
"setGroundTooltip":function(d){return "Postavlja sliku tla"},
"setObstacle":function(d){return "postavi prepreku"},
"setObstacleRandom":function(d){return "postavi nasumično odabranu prepreku"},
"setObstacleFlappy":function(d){return "postavi prepreku u obliku cijevi"},
"setObstacleSciFi":function(d){return "postavi naučno-fantastičnu prepreku"},
"setObstacleUnderwater":function(d){return "postavi prepreku u obliku biljke"},
"setObstacleCave":function(d){return "postavi pećinsku prepreku"},
"setObstacleSanta":function(d){return "postavi prepreku u obliku dimnjaka"},
"setObstacleLaser":function(d){return "postavi lasersku prepreku"},
"setObstacleTooltip":function(d){return "Postavlja sliku prepreke"},
"setPlayer":function(d){return "postavi izgled igrača"},
"setPlayerRandom":function(d){return "postavi Nasumičnog igrača"},
"setPlayerFlappy":function(d){return "postavi Žutu Pticu za igrača"},
"setPlayerRedBird":function(d){return "postavi Crvenu Pticu za igrača"},
"setPlayerSciFi":function(d){return "postavi Svemirski Brod za igrača"},
"setPlayerUnderwater":function(d){return "postavi Ribu za igrača"},
"setPlayerCave":function(d){return "postavi Šišmiša za igrača"},
"setPlayerSanta":function(d){return "postavi Djeda Mraza za igrača"},
"setPlayerShark":function(d){return "postavi Ajkulu za igrača"},
"setPlayerEaster":function(d){return "postavi Uskršnjeg Zeca za igrača"},
"setPlayerBatman":function(d){return "Postavi Šišmiš-čovjeka za igrača"},
"setPlayerSubmarine":function(d){return "postavi Podmornicu za igrača"},
"setPlayerUnicorn":function(d){return "postavi Jednoroga za igrača"},
"setPlayerFairy":function(d){return "postavi Dobru Vilu za igrača"},
"setPlayerSuperman":function(d){return "postavi Flappy-čovjeka za igrača"},
"setPlayerTurkey":function(d){return "postavi Ćurku za igrača"},
"setPlayerTooltip":function(d){return "Postavlja sliku igrača"},
"setScore":function(d){return "postavi rezultat"},
"setScoreTooltip":function(d){return "Postavlja rezultat igrača"},
"setSpeed":function(d){return "postavi brzinu"},
"setSpeedTooltip":function(d){return "postavi brzinu nivoa"},
"shareFlappyTwitter":function(d){return "Provjeri ovu Flappy igricu koju sam osobno napravio uz pomoć @codeorg"},
"shareGame":function(d){return "Podijeli svoju igru:"},
"soundRandom":function(d){return "slučajno odabran"},
"soundBounce":function(d){return "odskoči"},
"soundCrunch":function(d){return "zvuk krckanja"},
"soundDie":function(d){return "tužan zvuk"},
"soundHit":function(d){return "zvuk razbijanja"},
"soundPoint":function(d){return "bod"},
"soundSwoosh":function(d){return "zvuk prolijetanja"},
"soundWing":function(d){return "krilo"},
"soundJet":function(d){return "zvuk mlaznjaka"},
"soundCrash":function(d){return "zvuk sudara"},
"soundJingle":function(d){return "zvuk zvonceta"},
"soundSplash":function(d){return "zvuk prskanja"},
"soundLaser":function(d){return "zvuk lasera"},
"speedRandom":function(d){return "postavi nasumičnu brzinu"},
"speedVerySlow":function(d){return "postavi veoma malu brzinu"},
"speedSlow":function(d){return "postavi malu brzinu"},
"speedNormal":function(d){return "postavi normalnu brzinu"},
"speedFast":function(d){return "postavi veliku brzinu"},
"speedVeryFast":function(d){return "postavi veoma veliku brzinu"},
"whenClick":function(d){return "na klik"},
"whenClickTooltip":function(d){return "Izvršava dolje navedene akcije kad se dogodi klik."},
"whenCollideGround":function(d){return "kada padne na tlo"},
"whenCollideGroundTooltip":function(d){return "Izvršava dolje navedene akcije kada Flappy dodirne tlo."},
"whenCollideObstacle":function(d){return "kada udari u prepreku"},
"whenCollideObstacleTooltip":function(d){return "Izvršava dolje navedene akcije kad Flappy udari u prepreku."},
"whenEnterObstacle":function(d){return "kada prođe prepreku"},
"whenEnterObstacleTooltip":function(d){return "Izvršava dolje navedene akcije kada Flappy uđe u prepreku."},
"whenRunButtonClick":function(d){return "na početku igre"},
"whenRunButtonClickTooltip":function(d){return "Izvršava dolje navedene radnje kada igra započne."},
"yes":function(d){return "Da"}};