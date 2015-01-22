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
"continue":function(d){return "Fortsett"},
"doCode":function(d){return "gjør"},
"elseCode":function(d){return "ellers"},
"endGame":function(d){return "avslutt spelet"},
"endGameTooltip":function(d){return "Avsluttar spelet."},
"finalLevel":function(d){return "Gratulerer! Du har løst den siste oppgaven."},
"flap":function(d){return "flaks"},
"flapRandom":function(d){return "flaks tilfeldig"},
"flapVerySmall":function(d){return "flaks veldig lit"},
"flapSmall":function(d){return "flaks lite"},
"flapNormal":function(d){return "flaks middels"},
"flapLarge":function(d){return "flaks mykje"},
"flapVeryLarge":function(d){return "flaks veldig mykje"},
"flapTooltip":function(d){return "Flyg Flappy oppover."},
"flappySpecificFail":function(d){return "Koden ser bra - det vil flappe ved hvert klikk. Men du må klikke mange ganger for å flappe til målet."},
"incrementPlayerScore":function(d){return "skåre eit poeng"},
"incrementPlayerScoreTooltip":function(d){return "Legg til en til nåværende spillers poengsum."},
"nextLevel":function(d){return "Gratulerer! Du har fullført denne utfordringen."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Denne utfordringen kan bli løst med %1 blokker."},
"playSoundRandom":function(d){return "spel tilfeldig lyd"},
"playSoundBounce":function(d){return "spel sprette-lyd"},
"playSoundCrunch":function(d){return "Spill knase-lyd"},
"playSoundDie":function(d){return "spel trist lyd"},
"playSoundHit":function(d){return "spel knuse-lyd"},
"playSoundPoint":function(d){return "spel poeng-lyd"},
"playSoundSwoosh":function(d){return "spel svosj-lyd"},
"playSoundWing":function(d){return "spel flakse-lyd"},
"playSoundJet":function(d){return "spel jet-lyd"},
"playSoundCrash":function(d){return "spel krasj-lyd"},
"playSoundJingle":function(d){return "spel bjelle-lyd"},
"playSoundSplash":function(d){return "spel plaske-lyd"},
"playSoundLaser":function(d){return "spel laser-lyd"},
"playSoundTooltip":function(d){return "Spill den valgte lyden."},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Prøv igjen\" for å gå tilbake til spillet ditt."},
"scoreText":function(d){return "Poengsum: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "angi scene"},
"setBackgroundRandom":function(d){return "Angi scene Tilfeldig"},
"setBackgroundFlappy":function(d){return "Angi scenen By (dag)"},
"setBackgroundNight":function(d){return "Angi scena By (natt)"},
"setBackgroundSciFi":function(d){return "vis scena Sci-Fi"},
"setBackgroundUnderwater":function(d){return "vis scena Havbotn"},
"setBackgroundCave":function(d){return "vis scena Hole"},
"setBackgroundSanta":function(d){return "vis scena Julenissen"},
"setBackgroundTooltip":function(d){return "Angir bakgrunnsbilde"},
"setGapRandom":function(d){return "set tilfeldig mellomrom"},
"setGapVerySmall":function(d){return "set svært lite mellomrom"},
"setGapSmall":function(d){return "set lite mellomrom"},
"setGapNormal":function(d){return "set middels mellomrom"},
"setGapLarge":function(d){return "set stort mellomrom"},
"setGapVeryLarge":function(d){return "set veldig stort mellomrom"},
"setGapHeightTooltip":function(d){return "Set størrelsen på åpninga i ei hindring"},
"setGravityRandom":function(d){return "set tilfeldig tyngdekraft"},
"setGravityVeryLow":function(d){return "set svært svak tyngdekraft"},
"setGravityLow":function(d){return "set svak tyngdekraft"},
"setGravityNormal":function(d){return "set middels tyngdekraft"},
"setGravityHigh":function(d){return "set sterk tyngdekraft"},
"setGravityVeryHigh":function(d){return "set svært sterk tyngdekraft"},
"setGravityTooltip":function(d){return "Set styrken på tyngdekrafta"},
"setGround":function(d){return "vis bakken"},
"setGroundRandom":function(d){return "set bakken tilfeldig"},
"setGroundFlappy":function(d){return "set bakken Bakke"},
"setGroundSciFi":function(d){return "set bakken Sci-Fi"},
"setGroundUnderwater":function(d){return "set bakken Havbotn"},
"setGroundCave":function(d){return "set bakken Hole"},
"setGroundSanta":function(d){return "set bakken Julenissen"},
"setGroundLava":function(d){return "set bakken Lavastein"},
"setGroundTooltip":function(d){return "set bakken bilde"},
"setObstacle":function(d){return "set hinder"},
"setObstacleRandom":function(d){return "set hinder tilfeldig"},
"setObstacleFlappy":function(d){return "set hinder Rør"},
"setObstacleSciFi":function(d){return "set hinder Sci-Fi"},
"setObstacleUnderwater":function(d){return "set hinder Plante"},
"setObstacleCave":function(d){return "set hinder Hule"},
"setObstacleSanta":function(d){return "set hinder Skorstein"},
"setObstacleLaser":function(d){return "set hinder Laser"},
"setObstacleTooltip":function(d){return "Set utsjånaden på hindringane"},
"setPlayer":function(d){return "vis avatar"},
"setPlayerRandom":function(d){return "vis avatar tilfeldig"},
"setPlayerFlappy":function(d){return "vis avatar Gul Fugl"},
"setPlayerRedBird":function(d){return "vis avatar Raud Fugl"},
"setPlayerSciFi":function(d){return "vis avatar Romskip"},
"setPlayerUnderwater":function(d){return "vis avatar Fisk"},
"setPlayerCave":function(d){return "vis avatar Flaggermus"},
"setPlayerSanta":function(d){return "vis avatar Julenisse"},
"setPlayerShark":function(d){return "vis avatar Hai"},
"setPlayerEaster":function(d){return "vis avatar Påskehare"},
"setPlayerBatman":function(d){return "vis avatar Flaggermus gut"},
"setPlayerSubmarine":function(d){return "vis avatar Ubåt"},
"setPlayerUnicorn":function(d){return "vis avatar Einhjørning"},
"setPlayerFairy":function(d){return "vis avatar Fe"},
"setPlayerSuperman":function(d){return "vis avatar Flaksemann"},
"setPlayerTurkey":function(d){return "vis avatar Kalkun"},
"setPlayerTooltip":function(d){return "Angir utsjånaden til avataren"},
"setScore":function(d){return "Angi poengsum"},
"setScoreTooltip":function(d){return "Set poengsummen til spelaren"},
"setSpeed":function(d){return "set fart"},
"setSpeedTooltip":function(d){return "Set farta på dette nivået"},
"shareFlappyTwitter":function(d){return "Sjekk ut Flappy-spillet eg har laga! Eg laga det sjølv med @codeorg"},
"shareGame":function(d){return "Del ditt spill:"},
"soundRandom":function(d){return "tilfeldig"},
"soundBounce":function(d){return "sprett"},
"soundCrunch":function(d){return "knørve"},
"soundDie":function(d){return "trist"},
"soundHit":function(d){return "knus"},
"soundPoint":function(d){return "peik"},
"soundSwoosh":function(d){return "svosj"},
"soundWing":function(d){return "vinge"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "krasj"},
"soundJingle":function(d){return "trudelutt"},
"soundSplash":function(d){return "plask"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "set farta Tilfeldig"},
"speedVerySlow":function(d){return "set farta veldig sakte"},
"speedSlow":function(d){return "set farta sakte"},
"speedNormal":function(d){return "set farta middels"},
"speedFast":function(d){return "set farta hurtig"},
"speedVeryFast":function(d){return "set farta veldig hurtig"},
"whenClick":function(d){return "når klikk"},
"whenClickTooltip":function(d){return "Utfør setningane nedanfor når det blir klikka."},
"whenCollideGround":function(d){return "når bakken blir treft"},
"whenCollideGroundTooltip":function(d){return "Utfør setningane nedanfor når Flappy treff bakken."},
"whenCollideObstacle":function(d){return "når ein hindring blir treft"},
"whenCollideObstacleTooltip":function(d){return "Utfør handlingane nedanfor når Flappy treff ei hindring."},
"whenEnterObstacle":function(d){return "når passerer hindring"},
"whenEnterObstacleTooltip":function(d){return "Utfør handlingane nedanfor når Flappy passerar ei hindring."},
"whenRunButtonClick":function(d){return "når spillet starter"},
"whenRunButtonClickTooltip":function(d){return "Utfør handlingene nedenfor når spillet starter."},
"yes":function(d){return "Ja"}};