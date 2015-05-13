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
"continue":function(d){return "Jarraitu"},
"doCode":function(d){return "egin"},
"elseCode":function(d){return "bestela"},
"endGame":function(d){return "bukatu jokua"},
"endGameTooltip":function(d){return "Jokoa bukatzen du."},
"finalLevel":function(d){return "Zorionak! Amaierako puzlea ebatzi duzu."},
"flap":function(d){return "hegoei eragin"},
"flapRandom":function(d){return "egoei eragin ausazko kopuruan"},
"flapVerySmall":function(d){return "hegoei eragin oso kopuru txikian"},
"flapSmall":function(d){return "hegoei eragin kopuru txikian"},
"flapNormal":function(d){return "hegoei eragin kopuru normal batean"},
"flapLarge":function(d){return "hegoei eragin kopuru handi batean"},
"flapVeryLarge":function(d){return "hegoei eragin kopuru oso handi batean"},
"flapTooltip":function(d){return "Heganarazi Flappy gora."},
"flappySpecificFail":function(d){return "Zure kodeak itxura ona dauka - Hegoa astinduko du klik bakoitzarekin. Baina gehiegitan klikatu behar duzu helburura iristeko."},
"incrementPlayerScore":function(d){return "lortu puntu bat"},
"incrementPlayerScoreTooltip":function(d){return "Gehitu bat jokalariaren markagailura."},
"nextLevel":function(d){return "Zorionak! Puzle hau osatu duzu."},
"no":function(d){return "Ez"},
"numBlocksNeeded":function(d){return "Puzle hau %1 blokeekin ebaz daiteke."},
"playSoundRandom":function(d){return "Jo ausazko soinua"},
"playSoundBounce":function(d){return "jo errebote soinua"},
"playSoundCrunch":function(d){return "jo karraska soinua"},
"playSoundDie":function(d){return "jo soinu tristea"},
"playSoundHit":function(d){return "jo danbada soinua"},
"playSoundPoint":function(d){return "jo puntu soinua"},
"playSoundSwoosh":function(d){return "jo txistu soinua"},
"playSoundWing":function(d){return "jo hegal soinua"},
"playSoundJet":function(d){return "jo hegazkin soinua"},
"playSoundCrash":function(d){return "jo talka soinua"},
"playSoundJingle":function(d){return "jo kaskabilo soinua"},
"playSoundSplash":function(d){return "jo zipristin soinua"},
"playSoundLaser":function(d){return "jo laser soinua"},
"playSoundTooltip":function(d){return "Jo aukeratutako soinua."},
"reinfFeedbackMsg":function(d){return "\"Berriro saiatu\" botoiean klikatu dezakezu zure jokora atzera egiteko."},
"scoreText":function(d){return "Markagailua: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "set scene"},
"setBackgroundRandom":function(d){return "Ezarri ausazko eszena"},
"setBackgroundFlappy":function(d){return "ezarri Hiri eszena (egunez)"},
"setBackgroundNight":function(d){return "ezarri Hiri eszena (gauez)"},
"setBackgroundSciFi":function(d){return "ezarri zientzia fikzio eszena"},
"setBackgroundUnderwater":function(d){return "ezarri ur azpiko eszena"},
"setBackgroundCave":function(d){return "ezarri haitzulo eszena"},
"setBackgroundSanta":function(d){return "ezarri Aita Noel eszena"},
"setBackgroundTooltip":function(d){return "Atzeko irudia ezartzen du"},
"setGapRandom":function(d){return "ezarri ausazko tartea"},
"setGapVerySmall":function(d){return "ezarri tarte oso txikia"},
"setGapSmall":function(d){return "ezarri tarte txikia"},
"setGapNormal":function(d){return "ezarri tarte normala"},
"setGapLarge":function(d){return "ezarri tarte handia"},
"setGapVeryLarge":function(d){return "ezarri oso tarte handia"},
"setGapHeightTooltip":function(d){return "Oztopoan tarte bertikala ezartezen du"},
"setGravityRandom":function(d){return "Ezarri ausazko grabitatea"},
"setGravityVeryLow":function(d){return "ezarri oso grabitate baxua"},
"setGravityLow":function(d){return "ezarri grabitate baxua"},
"setGravityNormal":function(d){return "ezarri grabitate normala"},
"setGravityHigh":function(d){return "ezarri grabitate altua"},
"setGravityVeryHigh":function(d){return "ezarri grabitate oso altua"},
"setGravityTooltip":function(d){return "Eszenatokiaren grabitatea ezartzen du"},
"setGround":function(d){return "set ground"},
"setGroundRandom":function(d){return "ezarri ausazko atzekaldea"},
"setGroundFlappy":function(d){return "ezarri Lur atzekaldea"},
"setGroundSciFi":function(d){return "ezarri Zientzia Fikzio atzekaldea"},
"setGroundUnderwater":function(d){return "ezarri Urazpi atzekaldea"},
"setGroundCave":function(d){return "ezarri Haitzulo atzekaldea"},
"setGroundSanta":function(d){return "ezarri Aita Noel atzekaldea"},
"setGroundLava":function(d){return "ezarri Laba atzekaldea"},
"setGroundTooltip":function(d){return "Atzekaldearen irudia ezartzen du"},
"setObstacle":function(d){return "set obstacle"},
"setObstacleRandom":function(d){return "ezarri Ausazko oztopoa"},
"setObstacleFlappy":function(d){return "ezarri Hodi oztopoa"},
"setObstacleSciFi":function(d){return "ezarri Zientzia Fikzio oztopoa"},
"setObstacleUnderwater":function(d){return "ezarri Landare oztopoa"},
"setObstacleCave":function(d){return "ezarri Haitzulo oztopoa"},
"setObstacleSanta":function(d){return "ezarri Tximinia oztopoa"},
"setObstacleLaser":function(d){return "ezarri Laser oztopoa"},
"setObstacleTooltip":function(d){return "Oztopoaren irudia ezartzen du"},
"setPlayer":function(d){return "set player"},
"setPlayerRandom":function(d){return "Ausazko jokalaria ezarri"},
"setPlayerFlappy":function(d){return "Txori Horia jokalaria ezarri"},
"setPlayerRedBird":function(d){return "Txori Gorria jokalaria ezarri"},
"setPlayerSciFi":function(d){return "Espaziuntzi jokalaria ezarri"},
"setPlayerUnderwater":function(d){return "Arrain jokalaria ezarri"},
"setPlayerCave":function(d){return "Saguzar jokalaria ezarri"},
"setPlayerSanta":function(d){return "Aita Noel jokalaria ezarri"},
"setPlayerShark":function(d){return "Marrazo jokalaria ezarri"},
"setPlayerEaster":function(d){return "Pazko Untxia jokalaria ezarri"},
"setPlayerBatman":function(d){return "Xaguzar Gizona jokalaria ezarri"},
"setPlayerSubmarine":function(d){return "Urpekuntzi jokalaria ezarri"},
"setPlayerUnicorn":function(d){return "adarbakar jokalaria ezarri"},
"setPlayerFairy":function(d){return "Maitagarri jokalaria ezarri"},
"setPlayerSuperman":function(d){return "Flappyman jokalaria ezarri"},
"setPlayerTurkey":function(d){return "Indioilar jokalaria ezarri"},
"setPlayerTooltip":function(d){return "Jokalariaren irudia ezartzen du"},
"setScore":function(d){return "ezarri markagailua"},
"setScoreTooltip":function(d){return "Jokalariaren markagailua ezartzen ud"},
"setSpeed":function(d){return "ezarri abiadura"},
"setSpeedTooltip":function(d){return "Eszenatokiaren abiadura ezartzen du"},
"shareFlappyTwitter":function(d){return "Nik sortutako Flappy jokoa begiratu. Nik bakarrik idatzi dut @codeorg-ekin"},
"shareGame":function(d){return "Partekatu zure jokoa:"},
"soundRandom":function(d){return "ausazkoa"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "sad"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "point"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "wing"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "ezarri ausazko abiadura"},
"speedVerySlow":function(d){return "ezarri abiadura oso motela"},
"speedSlow":function(d){return "ezarri abiadura motela"},
"speedNormal":function(d){return "ezarri abiadura normala"},
"speedFast":function(d){return "ezarri abiadura azkarra"},
"speedVeryFast":function(d){return "ezarri abiadura oso azkarra"},
"whenClick":function(d){return "klikatzean"},
"whenClickTooltip":function(d){return "Exekutatu azpiko ekintzak klik gertaera gertatzean."},
"whenCollideGround":function(d){return "Lurzorua jotzean"},
"whenCollideGroundTooltip":function(d){return "Exekutatu azpiko ekintzak Flappyk lurzorua jotzean."},
"whenCollideObstacle":function(d){return "oztopoa jotzean"},
"whenCollideObstacleTooltip":function(d){return "Exekutatu azpiko ekintzak oztopo bat jotzean."},
"whenEnterObstacle":function(d){return "oztopoa gainditzean"},
"whenEnterObstacleTooltip":function(d){return "Exekutatu azpiko ekintzak oztopo batean sartzean."},
"whenRunButtonClick":function(d){return "Jokoa hasten denean"},
"whenRunButtonClickTooltip":function(d){return "Jokoa hasten denean exekutatu ondorengo ekintzak."},
"yes":function(d){return "Bai"}};