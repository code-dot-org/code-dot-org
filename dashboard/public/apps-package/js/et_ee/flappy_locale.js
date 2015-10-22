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
"continue":function(d){return "Jätka"},
"doCode":function(d){return "täida"},
"elseCode":function(d){return "muidu"},
"endGame":function(d){return "lõpeta mäng"},
"endGameTooltip":function(d){return "Lõpetab mängu."},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"flap":function(d){return "laksuta tiibu"},
"flapRandom":function(d){return "laksuta tiibu suvaline arv kordi"},
"flapVerySmall":function(d){return "laksuta tiibu väga lühikest aega"},
"flapSmall":function(d){return "laksuta tiibu lühikest aega"},
"flapNormal":function(d){return "laksuta tiibu tavaliselt"},
"flapLarge":function(d){return "laksuta tiibu kaua"},
"flapVeryLarge":function(d){return "laksuta tiibu väga kaua"},
"flapTooltip":function(d){return "Lennuta Flappy't kõrgemale."},
"flappySpecificFail":function(d){return "Sinu kood näeb hea välja- see laksutab tiibu iga klikiga. Aga sul tuleb klikkida mitu korda et jõuda sihtmärgini."},
"incrementPlayerScore":function(d){return "skoori punkt"},
"incrementPlayerScoreTooltip":function(d){return "Anna hetkemängijale üks punkt."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"playSoundRandom":function(d){return "mängi suvalist heli"},
"playSoundBounce":function(d){return "mängi põrkamise heli"},
"playSoundCrunch":function(d){return "lase heli \"krõbin\""},
"playSoundDie":function(d){return "mängi kurba heli"},
"playSoundHit":function(d){return "mängi lömastamise heli"},
"playSoundPoint":function(d){return "mängi punkti heli"},
"playSoundSwoosh":function(d){return "mängi puhangu heli"},
"playSoundWing":function(d){return "mängi tiiva heli"},
"playSoundJet":function(d){return "mängi lennuki heli"},
"playSoundCrash":function(d){return "mängi kokkupõrke heli"},
"playSoundJingle":function(d){return "mängi kilisemis heli"},
"playSoundSplash":function(d){return "mängi plärsatuse heli"},
"playSoundLaser":function(d){return "mängi laseri heli"},
"playSoundTooltip":function(d){return "Lase valitud heli."},
"reinfFeedbackMsg":function(d){return "Te võite vajutada \"Proovi uuesti\" nuppu, et minna tagasi oma mängu mängima."},
"scoreText":function(d){return "Tulemus: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "vali taust"},
"setBackgroundRandom":function(d){return "vali suvaline taust"},
"setBackgroundFlappy":function(d){return "vali taust Linn (päev)"},
"setBackgroundNight":function(d){return "vali taust Linn (öö)"},
"setBackgroundSciFi":function(d){return "vali taust Ulme"},
"setBackgroundUnderwater":function(d){return "vali taust Veealune"},
"setBackgroundCave":function(d){return "vali taust Koobas"},
"setBackgroundSanta":function(d){return "vali taust Jõuluvana"},
"setBackgroundTooltip":function(d){return "Valib taustapildi"},
"setGapRandom":function(d){return "määra juhuslik vahe"},
"setGapVerySmall":function(d){return "määra vahe väga väikseks"},
"setGapSmall":function(d){return "määra vahe väikseks"},
"setGapNormal":function(d){return "määra vahe tavaliseks"},
"setGapLarge":function(d){return "määra vahe suureks"},
"setGapVeryLarge":function(d){return "määra vahe väga suureks"},
"setGapHeightTooltip":function(d){return "Määrab takistuste vertikaalsed vahed"},
"setGravityRandom":function(d){return "vali suvaline gravitatsioonijõud"},
"setGravityVeryLow":function(d){return "vali väga väike gravitatsioonijõud"},
"setGravityLow":function(d){return "vali väike gravitatsioonijõud"},
"setGravityNormal":function(d){return "vali tavaline gravitatsioonijõud"},
"setGravityHigh":function(d){return "vali suur gravitatsioonijõud"},
"setGravityVeryHigh":function(d){return "vali väga suur gravitatsioonijõud"},
"setGravityTooltip":function(d){return "Määrab gravitatsioonijõu taseme"},
"setGround":function(d){return "määra maapind"},
"setGroundRandom":function(d){return "määra juhuslik maapind"},
"setGroundFlappy":function(d){return "vali baas maapind"},
"setGroundSciFi":function(d){return "määra maapind Ulmeline"},
"setGroundUnderwater":function(d){return "määra maapind Veealune"},
"setGroundCave":function(d){return "määra maapind Koobas"},
"setGroundSanta":function(d){return "määra maapind Jõuluvana"},
"setGroundLava":function(d){return "määra maapind Laava"},
"setGroundTooltip":function(d){return "Määrab maapinna pildi"},
"setObstacle":function(d){return "määra takistus"},
"setObstacleRandom":function(d){return "määra juhuslik takistus"},
"setObstacleFlappy":function(d){return "määra takistuseks Toru"},
"setObstacleSciFi":function(d){return "Määra takistuseks Ulme"},
"setObstacleUnderwater":function(d){return "määra takistuseks Taim"},
"setObstacleCave":function(d){return "määra takistuseks Koobas"},
"setObstacleSanta":function(d){return "määra takistuseks Korsten"},
"setObstacleLaser":function(d){return "määra takistuseks Laser"},
"setObstacleTooltip":function(d){return "Määrab takistuse pildi"},
"setPlayer":function(d){return "määra mängija karakter"},
"setPlayerRandom":function(d){return "määra mängija juhuslikult"},
"setPlayerFlappy":function(d){return "määra mängijaks Kollane Lind"},
"setPlayerRedBird":function(d){return "määra mängijaks Punane Lind"},
"setPlayerSciFi":function(d){return "määra mängijaks Kosmoselaev"},
"setPlayerUnderwater":function(d){return "määra mängijaks Kala"},
"setPlayerCave":function(d){return "määra mängijaks Nahkhiir"},
"setPlayerSanta":function(d){return "määra mängijaks Jõuluvana"},
"setPlayerShark":function(d){return "määra mängijaks Hai"},
"setPlayerEaster":function(d){return "määra mängijaks lihavõtte jänku"},
"setPlayerBatman":function(d){return "määra mängijaks Batman"},
"setPlayerSubmarine":function(d){return "määra mängijaks Allveelaev"},
"setPlayerUnicorn":function(d){return "määra mängijaks Ükssarvik"},
"setPlayerFairy":function(d){return "määra mängijaks Haldjas"},
"setPlayerSuperman":function(d){return "määra mängijaks Flappyman"},
"setPlayerTurkey":function(d){return "määra mängijaks Kalkun"},
"setPlayerTooltip":function(d){return "Määrab mängija pildi"},
"setScore":function(d){return "määra tulemus"},
"setScoreTooltip":function(d){return "Määrab mängija tulemuse"},
"setSpeed":function(d){return "määra kiirus"},
"setSpeedTooltip":function(d){return "Määrab taseme kiiruse"},
"shareFlappyTwitter":function(d){return "Tutvu Flappy mänguga, mille ma tegin. Ma kirjutasin selle ise @codeorg -is"},
"shareGame":function(d){return "Jaga oma mängu:"},
"soundRandom":function(d){return "juhuslik"},
"soundBounce":function(d){return "põrge"},
"soundCrunch":function(d){return "purustama"},
"soundDie":function(d){return "kurb"},
"soundHit":function(d){return "lömastama"},
"soundPoint":function(d){return "punkt"},
"soundSwoosh":function(d){return "puhang"},
"soundWing":function(d){return "tiib"},
"soundJet":function(d){return "lennuk"},
"soundCrash":function(d){return "kokkupõrge"},
"soundJingle":function(d){return "kilisemine"},
"soundSplash":function(d){return "plärtsatus"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "vali suvaline kiirus"},
"speedVerySlow":function(d){return "vali väga aeglane kiirus"},
"speedSlow":function(d){return "vali aeglane kiirus"},
"speedNormal":function(d){return "vali tavaline kiirus"},
"speedFast":function(d){return "vali suur kiirus"},
"speedVeryFast":function(d){return "vali väga suur kiirus"},
"whenClick":function(d){return "kui vajutada"},
"whenClickTooltip":function(d){return "Teostage tegevused allpool, kui klikkimis sündmus toimub."},
"whenCollideGround":function(d){return "kui kukub maha"},
"whenCollideGroundTooltip":function(d){return "Kui Flappy kukub maha, teosta järgmised toimingud."},
"whenCollideObstacle":function(d){return "kui põrkab kokku takistusega"},
"whenCollideObstacleTooltip":function(d){return "Kui Flappy põrkab kokku takistusega, teosta järgmised toimingud."},
"whenEnterObstacle":function(d){return "kui möödub takistusest"},
"whenEnterObstacleTooltip":function(d){return "Kui Flappy väljub takistusest, teosta järgmised toimingud."},
"whenRunButtonClick":function(d){return "kui mäng algab"},
"whenRunButtonClickTooltip":function(d){return "Kui mäng algab, teosta järgmised toimingud."},
"yes":function(d){return "Jah"}};