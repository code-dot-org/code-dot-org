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
"continue":function(d){return "Continuar"},
"doCode":function(d){return "fer"},
"elseCode":function(d){return "en cas contrari"},
"endGame":function(d){return "finalitza la partida"},
"endGameTooltip":function(d){return "Acaba el joc."},
"finalLevel":function(d){return "Felicitats! Has resolt el puzzle final."},
"flap":function(d){return "aleteig"},
"flapRandom":function(d){return "aleteja una quantitat aleatòria"},
"flapVerySmall":function(d){return "aleteja una quantitat molt petita"},
"flapSmall":function(d){return "aleteja una quantitat petita"},
"flapNormal":function(d){return "aleteja una quantitat normal"},
"flapLarge":function(d){return "aleteja una quantitat gran"},
"flapVeryLarge":function(d){return "aleteja una quantitat molt gran"},
"flapTooltip":function(d){return "Fes volar al Flappy cap amunt."},
"flappySpecificFail":function(d){return "El teu codi sembla correcte - aletejarà amb cada clic. Però necessites fer molts clics per aletejar a la meta."},
"incrementPlayerScore":function(d){return "aconsegueix un punt"},
"incrementPlayerScoreTooltip":function(d){return "Afegeix u a la puntuació del jugador."},
"nextLevel":function(d){return "Felicitats! Has complert aquest puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Aquest puzzle pot res resolt amb blocs de %1."},
"playSoundRandom":function(d){return "reprodueix un so aleatori"},
"playSoundBounce":function(d){return "reprodueix un so de rebot"},
"playSoundCrunch":function(d){return "reprodueix so de cruixit"},
"playSoundDie":function(d){return "reprodueix un so trist"},
"playSoundHit":function(d){return "reprodueix un so d'aixafar"},
"playSoundPoint":function(d){return "reprodueix un so de puntuació"},
"playSoundSwoosh":function(d){return "reprodueix un so de xiulet"},
"playSoundWing":function(d){return "reprodueix un so d'ala"},
"playSoundJet":function(d){return "reprodueix un so de jet"},
"playSoundCrash":function(d){return "reprodueix un so de xoc"},
"playSoundJingle":function(d){return "reprodueix un so de tintineig"},
"playSoundSplash":function(d){return "reprodueix un so d'esquitxada"},
"playSoundLaser":function(d){return "reprodueix un so de laser"},
"playSoundTooltip":function(d){return "reprodueix so de l'elegit."},
"reinfFeedbackMsg":function(d){return "Pots clicar el botó de \"Try again\" per tornar a començar"},
"scoreText":function(d){return "Puntuació: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "estableix el fons"},
"setBackgroundRandom":function(d){return "estableix un fons aleatori"},
"setBackgroundFlappy":function(d){return "estableix l'escena de Ciutat (dia)"},
"setBackgroundNight":function(d){return "estableix l'escena de Ciutat (nit)"},
"setBackgroundSciFi":function(d){return "estableix l'escena de Ciència ficció"},
"setBackgroundUnderwater":function(d){return "estableix l'escena de Fons marí"},
"setBackgroundCave":function(d){return "estableix l'escena de Cova"},
"setBackgroundSanta":function(d){return "estableix l'escena de Pare Noel"},
"setBackgroundTooltip":function(d){return "Estableix l'imatge de l'escena"},
"setGapRandom":function(d){return "estableix un buit a l'atzar"},
"setGapVerySmall":function(d){return "estableix un buit molt petit"},
"setGapSmall":function(d){return "estableix un buit petit"},
"setGapNormal":function(d){return "estableix un buit normal"},
"setGapLarge":function(d){return "estableix un buit gran"},
"setGapVeryLarge":function(d){return "estableix un buit molt gran"},
"setGapHeightTooltip":function(d){return "Estableix un buit vertical en un obstacle"},
"setGravityRandom":function(d){return "estableix la gravetat en aleatori"},
"setGravityVeryLow":function(d){return "estableix la gravetat a molt baixa"},
"setGravityLow":function(d){return "estableix la gravetat a baixa"},
"setGravityNormal":function(d){return "estableix la gravetat a normal"},
"setGravityHigh":function(d){return "estableix la gravetat a alta"},
"setGravityVeryHigh":function(d){return "estableix la gravetat a molt alta"},
"setGravityTooltip":function(d){return "Estableix la gravetat del nivell"},
"setGround":function(d){return "posa un terra"},
"setGroundRandom":function(d){return "posa un terra aletori"},
"setGroundFlappy":function(d){return "posa el terra Terra"},
"setGroundSciFi":function(d){return "posa el terra Ciència ficció"},
"setGroundUnderwater":function(d){return "posa el terra Fons del mar"},
"setGroundCave":function(d){return "posa el terra Cova"},
"setGroundSanta":function(d){return "posa el terra Pare Noel"},
"setGroundLava":function(d){return "posa el terra Lava"},
"setGroundTooltip":function(d){return "posa l'imatge del terra"},
"setObstacle":function(d){return "estableix obstacle"},
"setObstacleRandom":function(d){return "estableix un obstacle en aleatori"},
"setObstacleFlappy":function(d){return "estableix obstacle en Canonada"},
"setObstacleSciFi":function(d){return "estableix obstacle en Ciència ficció"},
"setObstacleUnderwater":function(d){return "estableix obstacle en Planta"},
"setObstacleCave":function(d){return "estableix obstacle en Cova"},
"setObstacleSanta":function(d){return "estableix obstacle en Xemeneia"},
"setObstacleLaser":function(d){return "estableix obstacle en Laser"},
"setObstacleTooltip":function(d){return "Estableix l'imatge de l'obstacle"},
"setPlayer":function(d){return "estableix el jugador"},
"setPlayerRandom":function(d){return "estableix un jugador aleatori"},
"setPlayerFlappy":function(d){return "estableix el jugador Ocell groc"},
"setPlayerRedBird":function(d){return "estableix el jugador Ocell vermell"},
"setPlayerSciFi":function(d){return "estableix el jugador Nau espacial"},
"setPlayerUnderwater":function(d){return "estableix el jugador Peix"},
"setPlayerCave":function(d){return "estableix el jugador Ratpenat"},
"setPlayerSanta":function(d){return "estableix el jugador Pare Noel"},
"setPlayerShark":function(d){return "estableix el jugador Tauró"},
"setPlayerEaster":function(d){return "estableix el jugador Conill de Pascua"},
"setPlayerBatman":function(d){return "estableix el jugador Home ratpenat"},
"setPlayerSubmarine":function(d){return "estableix el jugador Submarí"},
"setPlayerUnicorn":function(d){return "estableix el jugador Unicorn"},
"setPlayerFairy":function(d){return "estableix el jugador Fada"},
"setPlayerSuperman":function(d){return "estableix el jugador Flappyman"},
"setPlayerTurkey":function(d){return "estableix el jugador Gall d'indi"},
"setPlayerTooltip":function(d){return "estableix l'imatge del jugador"},
"setScore":function(d){return "assigna la puntuació"},
"setScoreTooltip":function(d){return "Estableix la puntuació del jugador"},
"setSpeed":function(d){return "estableix la velocitat"},
"setSpeedTooltip":function(d){return "Estableix la velocitat del nivell"},
"shareFlappyTwitter":function(d){return "Mira el \"Flappy game\" que he fet. L'he escrit jo mateix amb @codeorg"},
"shareGame":function(d){return "Comparteix el teu joc:"},
"soundRandom":function(d){return "atzar"},
"soundBounce":function(d){return "rebot"},
"soundCrunch":function(d){return "cruixit"},
"soundDie":function(d){return "trist"},
"soundHit":function(d){return "aixafar"},
"soundPoint":function(d){return "punt"},
"soundSwoosh":function(d){return "xiulet"},
"soundWing":function(d){return "ala"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "xoc"},
"soundJingle":function(d){return "tintineig"},
"soundSplash":function(d){return "esquitxada"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "estableix una velocitat aletòria"},
"speedVerySlow":function(d){return "estableix velocitat a molt lenta"},
"speedSlow":function(d){return "estableix velocitat a lenta"},
"speedNormal":function(d){return "estableix velocitat a normal"},
"speedFast":function(d){return "estableix velocitat a ràpida"},
"speedVeryFast":function(d){return "estableix velocitat a molt ràpida"},
"whenClick":function(d){return "quan cliques"},
"whenClickTooltip":function(d){return "Executar les accions de sota quan es produeix un esdeveniment de clic."},
"whenCollideGround":function(d){return "quan arribi a terra"},
"whenCollideGroundTooltip":function(d){return "Executar les accions de sota quan Flappy arribi a terra."},
"whenCollideObstacle":function(d){return "quan xoca amb un obstacle"},
"whenCollideObstacleTooltip":function(d){return "Executar les accions de sota quan Flappy xoca amb un obstacle."},
"whenEnterObstacle":function(d){return "quan passa un obstacle"},
"whenEnterObstacleTooltip":function(d){return "Executar les accions de sota quan Flappy entra en un obstacle."},
"whenRunButtonClick":function(d){return "quan s'inicia el joc"},
"whenRunButtonClickTooltip":function(d){return "Executar les accions de sota quan s'inicia el joc."},
"yes":function(d){return "Sí"}};