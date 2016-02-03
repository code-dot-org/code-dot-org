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
"continue":function(d){return "Áfram"},
"doCode":function(d){return "gera"},
"elseCode":function(d){return "annars"},
"endGame":function(d){return "ljúka leik"},
"endGameTooltip":function(d){return "Lýkur leiknum."},
"finalLevel":function(d){return "Til hamingju! Þú hefur leyst síðustu þrautina."},
"flap":function(d){return "blaka"},
"flapRandom":function(d){return "blaka af handahófi"},
"flapVerySmall":function(d){return "blaka vængjum mjög lítið"},
"flapSmall":function(d){return "blaka vængjum lítið"},
"flapNormal":function(d){return "blaka vængjum eðlilega"},
"flapLarge":function(d){return "blaka vængjum mikið"},
"flapVeryLarge":function(d){return "blaka vængjum mjög mikið"},
"flapTooltip":function(d){return "Fljúga Flappy upp á við."},
"flappySpecificFail":function(d){return "Kóðinn þinn lítur vel út - fuglinn flögrar við hvern smell. En þú þarft að smella oft til að flögra að endamarkinu."},
"incrementPlayerScore":function(d){return "skora stig"},
"incrementPlayerScoreTooltip":function(d){return "Bæta 1 við núverandi skor leikmanns."},
"nextLevel":function(d){return "Til hamingju! Þú hefur klárað þessa þraut."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum."},
"playSoundRandom":function(d){return "spila hljóð af handahófi"},
"playSoundBounce":function(d){return "spila skopphljóð"},
"playSoundCrunch":function(d){return "spila brothljóð"},
"playSoundDie":function(d){return "spila sorgarhljóð"},
"playSoundHit":function(d){return "spila bardagahljóð"},
"playSoundPoint":function(d){return "spila stigahljóð"},
"playSoundSwoosh":function(d){return "spila sveifluhljóð"},
"playSoundWing":function(d){return "spila vængjahljóð"},
"playSoundJet":function(d){return "spila þotuhljóð"},
"playSoundCrash":function(d){return "spila áreksturshljóð"},
"playSoundJingle":function(d){return "spila tónahljóð"},
"playSoundSplash":function(d){return "spila vatnshljóð"},
"playSoundLaser":function(d){return "spila laser-hljóð"},
"playSoundTooltip":function(d){return "Spila valið hljóð."},
"reinfFeedbackMsg":function(d){return "Þú getur smellt á \"Reyna aftur\" hnappinn til þess að spila leikinn aftur."},
"scoreText":function(d){return "Stig alls: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "stilla sviðið"},
"setBackgroundRandom":function(d){return "umhverfi - af handahófi"},
"setBackgroundFlappy":function(d){return "umhverfi - borg (að degi)"},
"setBackgroundNight":function(d){return "umhverfi - borg (að nóttu)"},
"setBackgroundSciFi":function(d){return "umhverfi - geimur"},
"setBackgroundUnderwater":function(d){return "umhverfi - neðansjávar"},
"setBackgroundCave":function(d){return "umhverfi - hellir"},
"setBackgroundSanta":function(d){return "umhverfi - jól"},
"setBackgroundTooltip":function(d){return "Stillir bakgrunninn"},
"setGapRandom":function(d){return "op af handahófi"},
"setGapVerySmall":function(d){return "mjög lítið op"},
"setGapSmall":function(d){return "lítið op"},
"setGapNormal":function(d){return "venjulegt op"},
"setGapLarge":function(d){return "stórt op"},
"setGapVeryLarge":function(d){return "mjög stórt op"},
"setGapHeightTooltip":function(d){return "Stillir lóðrétta opið í hindrun"},
"setGravityRandom":function(d){return "þyngdarafl af handahófi"},
"setGravityVeryLow":function(d){return "mjög lítið þyngdarafl"},
"setGravityLow":function(d){return "lítið þyngdarafl"},
"setGravityNormal":function(d){return "venjulegt þyngdarafl"},
"setGravityHigh":function(d){return "mikið þyngdarafl"},
"setGravityVeryHigh":function(d){return "mjög mikið þyngdarafl"},
"setGravityTooltip":function(d){return "Stillir styrkleika þyngdarafls"},
"setGround":function(d){return "stilla jörðina"},
"setGroundRandom":function(d){return "jörð - af handahófi"},
"setGroundFlappy":function(d){return "jörð - venjuleg"},
"setGroundSciFi":function(d){return "jörð - geimur"},
"setGroundUnderwater":function(d){return "jörð - neðansjávar"},
"setGroundCave":function(d){return "jörð - hellir"},
"setGroundSanta":function(d){return "jörð - jól"},
"setGroundLava":function(d){return "jörð - hraun"},
"setGroundTooltip":function(d){return "Stillir jörðina í leiknum"},
"setObstacle":function(d){return "stilla hindrun"},
"setObstacleRandom":function(d){return "hindrun - af handahófi"},
"setObstacleFlappy":function(d){return "hindrun - rör"},
"setObstacleSciFi":function(d){return "hindrun - geimur"},
"setObstacleUnderwater":function(d){return "hindrun - planta"},
"setObstacleCave":function(d){return "hindrun - hellir"},
"setObstacleSanta":function(d){return "hindrun - strompur"},
"setObstacleLaser":function(d){return "hindrun - leysir"},
"setObstacleTooltip":function(d){return "Stillir útlit hindrana"},
"setPlayer":function(d){return "stilla leikmann"},
"setPlayerRandom":function(d){return "leikmaður - af handahófi"},
"setPlayerFlappy":function(d){return "leikmaður - gulur fugl"},
"setPlayerRedBird":function(d){return "leikmaður - rauður fugl"},
"setPlayerSciFi":function(d){return "leikmaður - geimskip"},
"setPlayerUnderwater":function(d){return "leikmaður - fiskur"},
"setPlayerCave":function(d){return "leikmaður - leðurblaka"},
"setPlayerSanta":function(d){return "leikmaður - jólasveinn"},
"setPlayerShark":function(d){return "leikmaður - hákarl"},
"setPlayerEaster":function(d){return "leikmaður - páskakanína"},
"setPlayerBatman":function(d){return "leikmaður - leðurblökumaður"},
"setPlayerSubmarine":function(d){return "leikmaður - kafbátur"},
"setPlayerUnicorn":function(d){return "leikmaður - einhyrningur"},
"setPlayerFairy":function(d){return "leikmaður - álfadís"},
"setPlayerSuperman":function(d){return "leikmaður - Flappyman"},
"setPlayerTurkey":function(d){return "leikmaður - kalkúnn"},
"setPlayerTooltip":function(d){return "Stillir útlit leikmanns"},
"setScore":function(d){return "setja stig á"},
"setScoreTooltip":function(d){return "Stillir stig leikmanns"},
"setSpeed":function(d){return "stilla hraða"},
"setSpeedTooltip":function(d){return "Stillir hraða áfangans"},
"shareFlappyTwitter":function(d){return "Kíktu á Flappy leikinn sem ég bjó til. Ég forritaði hann á vefnum @codeorg"},
"shareGame":function(d){return "Deildu leiknum þínum:"},
"soundRandom":function(d){return "af handahófi"},
"soundBounce":function(d){return "skoppa"},
"soundCrunch":function(d){return "kremja"},
"soundDie":function(d){return "sorg"},
"soundHit":function(d){return "brot"},
"soundPoint":function(d){return "stig"},
"soundSwoosh":function(d){return "sveifla"},
"soundWing":function(d){return "vængur"},
"soundJet":function(d){return "þota"},
"soundCrash":function(d){return "árekstur"},
"soundJingle":function(d){return "tónar"},
"soundSplash":function(d){return "vatn"},
"soundLaser":function(d){return "leysir"},
"speedRandom":function(d){return "hraði af handahófi"},
"speedVerySlow":function(d){return "mjög lítill hraði"},
"speedSlow":function(d){return "lítill hraði"},
"speedNormal":function(d){return "venjulegur hraði"},
"speedFast":function(d){return "mikill hraði"},
"speedVeryFast":function(d){return "mjög mikill hraði"},
"whenClick":function(d){return "þegar smellt"},
"whenClickTooltip":function(d){return "Gera aðgerðirnar hér fyrir neðan þegar \"smella\" atvik á sér stað."},
"whenCollideGround":function(d){return "þegar rekst á jörðina"},
"whenCollideGroundTooltip":function(d){return "Gera aðgerðirnar hér fyrir neðan þegar Flappy rekst á jörðina."},
"whenCollideObstacle":function(d){return "þegar rekst á hindrun"},
"whenCollideObstacleTooltip":function(d){return "Gera aðgerðirnar hér fyrir neðan þegar Flappy rekst á hindrun."},
"whenEnterObstacle":function(d){return "þegar gegnum hindrun"},
"whenEnterObstacleTooltip":function(d){return "Gera aðgerðirnar hér fyrir neðan þegar Flappy fer inn í hindrun."},
"whenRunButtonClick":function(d){return "þegar leikur byrjar"},
"whenRunButtonClickTooltip":function(d){return "Gera aðgerðirnar fyrir neðan þegar leikurinn byrjar."},
"yes":function(d){return "Já"}};