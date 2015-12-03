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
"continue":function(d){return "Jarraitu"},
"doCode":function(d){return "egin"},
"elseCode":function(d){return "bestela"},
"endGame":function(d){return "bukatu jokoa"},
"endGameTooltip":function(d){return "Jokoa bukatzen du."},
"finalLevel":function(d){return "Zorionak! Amaierako puzlea ebatzi duzu."},
"flap":function(d){return "hegoei eragin"},
"flapRandom":function(d){return "hegoei eragin ausazko kopuruan"},
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
"playSoundRandom":function(d){return "erreproduzitu ausazko soinua"},
"playSoundBounce":function(d){return "erreproduzitu errebote soinua"},
"playSoundCrunch":function(d){return "jo karraska soinua"},
"playSoundDie":function(d){return "erreproduzitu soinu tristea"},
"playSoundHit":function(d){return "erreproduzitu danbada soinua"},
"playSoundPoint":function(d){return "erreproduzitu puntu soinua"},
"playSoundSwoosh":function(d){return "erreproduzitu txistu soinua"},
"playSoundWing":function(d){return "erreproduzitu hegal soinua"},
"playSoundJet":function(d){return "erreproduzitu hegazkin soinua"},
"playSoundCrash":function(d){return "erreproduzitu talka soinua"},
"playSoundJingle":function(d){return "erreproduzitu kaskabilo soinua"},
"playSoundSplash":function(d){return "erreproduzitu zipristin soinua"},
"playSoundLaser":function(d){return "erreproduzitu laser soinua"},
"playSoundTooltip":function(d){return "Jo aukeratutako soinua."},
"reinfFeedbackMsg":function(d){return "\"Berriro saiatu\" botoiean klikatu dezakezu zure jokora atzera egiteko."},
"scoreText":function(d){return "Markagailua: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ezarri atzealdea"},
"setBackgroundRandom":function(d){return "ezarri ausazko atzealdea"},
"setBackgroundFlappy":function(d){return "ezarri Hiri atzealdea (egunez)"},
"setBackgroundNight":function(d){return "ezarri Hiri atzealdea (gauez)"},
"setBackgroundSciFi":function(d){return "ezarri zientzia fikzio atzealdea"},
"setBackgroundUnderwater":function(d){return "ezarri ur azpiko atzealdea"},
"setBackgroundCave":function(d){return "ezarri haitzulo atzealdea"},
"setBackgroundSanta":function(d){return "ezarri Aita Noel atzealdea"},
"setBackgroundTooltip":function(d){return "Atzeko irudia ezartzen du"},
"setGapRandom":function(d){return "ezarri ausazko tartea"},
"setGapVerySmall":function(d){return "ezarri oso tarte txikia"},
"setGapSmall":function(d){return "ezarri tarte txikia"},
"setGapNormal":function(d){return "ezarri tarte normala"},
"setGapLarge":function(d){return "ezarri tarte handia"},
"setGapVeryLarge":function(d){return "ezarri oso tarte handia"},
"setGapHeightTooltip":function(d){return "Oztopoan tarte bertikala ezartzen du"},
"setGravityRandom":function(d){return "Ezarri ausazko grabitatea"},
"setGravityVeryLow":function(d){return "ezarri oso grabitate baxua"},
"setGravityLow":function(d){return "ezarri grabitate baxua"},
"setGravityNormal":function(d){return "ezarri grabitate normala"},
"setGravityHigh":function(d){return "ezarri grabitate altua"},
"setGravityVeryHigh":function(d){return "ezarri grabitate oso altua"},
"setGravityTooltip":function(d){return "Eszenatokiaren grabitatea ezartzen du"},
"setGround":function(d){return "zorua ezarri"},
"setGroundRandom":function(d){return "ezarri ausazko zorua"},
"setGroundFlappy":function(d){return "ezarri Lur zorua"},
"setGroundSciFi":function(d){return "ezarri Zientzia Fikzio zorua"},
"setGroundUnderwater":function(d){return "ezarri Urazpi zorua"},
"setGroundCave":function(d){return "ezarri Haitzulo zorua"},
"setGroundSanta":function(d){return "ezarri Aita Noel zorua"},
"setGroundLava":function(d){return "ezarri Laba zorua"},
"setGroundTooltip":function(d){return "Zoruaren irudia ezartzen du"},
"setObstacle":function(d){return "ezarri oztopoa"},
"setObstacleRandom":function(d){return "ezarri Ausazko oztopoa"},
"setObstacleFlappy":function(d){return "ezarri Hodi oztopoa"},
"setObstacleSciFi":function(d){return "ezarri Zientzia Fikzio oztopoa"},
"setObstacleUnderwater":function(d){return "ezarri Landare oztopoa"},
"setObstacleCave":function(d){return "ezarri Haitzulo oztopoa"},
"setObstacleSanta":function(d){return "ezarri Tximinia oztopoa"},
"setObstacleLaser":function(d){return "ezarri Laser oztopoa"},
"setObstacleTooltip":function(d){return "Oztopoaren irudia ezartzen du"},
"setPlayer":function(d){return "ezarri jokalari"},
"setPlayerRandom":function(d){return "ezarri Ausazko jokalaria"},
"setPlayerFlappy":function(d){return "ezarri Txori Horia jokalaria"},
"setPlayerRedBird":function(d){return "ezarri Txori Gorria jokalaria"},
"setPlayerSciFi":function(d){return "ezarri Espazio-ontzi jokalaria"},
"setPlayerUnderwater":function(d){return "ezarri Arrain jokalaria"},
"setPlayerCave":function(d){return "ezarri Saguzar jokalaria"},
"setPlayerSanta":function(d){return "ezarri Aita Noel jokalaria"},
"setPlayerShark":function(d){return "ezarri Marrazo jokalaria"},
"setPlayerEaster":function(d){return "ezarri Pazko Untxia jokalaria"},
"setPlayerBatman":function(d){return "ezarri Xaguzar Gizona jokalaria"},
"setPlayerSubmarine":function(d){return "ezarri Urpekuntzi jokalaria"},
"setPlayerUnicorn":function(d){return "ezarri adarbakar jokalaria"},
"setPlayerFairy":function(d){return "ezarri Maitagarri jokalaria"},
"setPlayerSuperman":function(d){return "ezarri Flappyman jokalaria"},
"setPlayerTurkey":function(d){return "ezarri Indioilar jokalaria"},
"setPlayerTooltip":function(d){return "Jokalariaren irudia ezartzen du"},
"setScore":function(d){return "ezarri markagailua"},
"setScoreTooltip":function(d){return "Jokalariaren markagailua ezartzen du"},
"setSpeed":function(d){return "ezarri abiadura"},
"setSpeedTooltip":function(d){return "Eszenatokiaren abiadura ezartzen du"},
"shareFlappyTwitter":function(d){return "Azter ezazu nik sortutako Flappy jokoa. Nik bakarrik idatzi dut @codeorg-ekin"},
"shareGame":function(d){return "Partekatu zure jokoa:"},
"soundRandom":function(d){return "ausazkoa"},
"soundBounce":function(d){return "errebotatu"},
"soundCrunch":function(d){return "karraska"},
"soundDie":function(d){return "goibel"},
"soundHit":function(d){return "danbateko"},
"soundPoint":function(d){return "puntu"},
"soundSwoosh":function(d){return "txistu"},
"soundWing":function(d){return "hegoa"},
"soundJet":function(d){return "hegazkina"},
"soundCrash":function(d){return "Istripua"},
"soundJingle":function(d){return "Txintxin"},
"soundSplash":function(d){return "plisti-plasta"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "ezarri ausazko abiadura"},
"speedVerySlow":function(d){return "ezarri abiadura oso motela"},
"speedSlow":function(d){return "ezarri abiadura motela"},
"speedNormal":function(d){return "ezarri abiadura normala"},
"speedFast":function(d){return "ezarri abiadura azkarra"},
"speedVeryFast":function(d){return "ezarri abiadura oso azkarra"},
"whenClick":function(d){return "klikatzean"},
"whenClickTooltip":function(d){return "Exekutatu beheko ekintzak klik egitean."},
"whenCollideGround":function(d){return "Lurzorua jotzean"},
"whenCollideGroundTooltip":function(d){return "Exekutatu beheko ekintzak Flappyk lurzorua jotzean."},
"whenCollideObstacle":function(d){return "oztopoa jotzean"},
"whenCollideObstacleTooltip":function(d){return "Exekutatu beheko ekintzak oztopo bat jotzean."},
"whenEnterObstacle":function(d){return "oztopoa gainditzean"},
"whenEnterObstacleTooltip":function(d){return "Exekutatu beheko ekintzak oztopo batean sartzean."},
"whenRunButtonClick":function(d){return "Jokoa hasten denean"},
"whenRunButtonClickTooltip":function(d){return "Jokoa hasten denean exekutatu ondorengo ekintzak."},
"yes":function(d){return "Bai"}};