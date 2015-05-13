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
"continue":function(d){return "Fortsæt"},
"doCode":function(d){return "udfør"},
"elseCode":function(d){return "ellers"},
"endGame":function(d){return "afslut spil"},
"endGameTooltip":function(d){return "Aflutter spillet."},
"finalLevel":function(d){return "Tillykke! Du har løst den sidste opgave."},
"flap":function(d){return "bask"},
"flapRandom":function(d){return "bask med tilfældig styrke"},
"flapVerySmall":function(d){return "bask med meget lav styrke"},
"flapSmall":function(d){return "bask med lav styrke"},
"flapNormal":function(d){return "bask med normal styrke"},
"flapLarge":function(d){return "bask med høj styrke"},
"flapVeryLarge":function(d){return "bask med meget høj styrke"},
"flapTooltip":function(d){return "Flyv Flappy opad."},
"flappySpecificFail":function(d){return "Din kode ser godt ud - den vil baske ved hvert klik. Men du skal klikke mange gange for at baske til målet."},
"incrementPlayerScore":function(d){return "scor et point"},
"incrementPlayerScoreTooltip":function(d){return "Tilføj \"1\" til den aktuelle spillers score."},
"nextLevel":function(d){return "Tillykke! Du har fuldført denne opgave."},
"no":function(d){return "Nej"},
"numBlocksNeeded":function(d){return "Denne opgave kan løses med %1 blokke."},
"playSoundRandom":function(d){return "afspil tilfældig lyd"},
"playSoundBounce":function(d){return "afspil hoppelyd"},
"playSoundCrunch":function(d){return "afspil knaselyd"},
"playSoundDie":function(d){return "afspil trist lyd"},
"playSoundHit":function(d){return "afspil smadrelyd"},
"playSoundPoint":function(d){return "afspil pointlyd"},
"playSoundSwoosh":function(d){return "afspil svusjlyd"},
"playSoundWing":function(d){return "afspil vingelyd"},
"playSoundJet":function(d){return "afspil jetlyd"},
"playSoundCrash":function(d){return "afspil biluheldslyd"},
"playSoundJingle":function(d){return "afspil jingle"},
"playSoundSplash":function(d){return "afspil plaskelyd"},
"playSoundLaser":function(d){return "afspil laserlyd"},
"playSoundTooltip":function(d){return "Afspil den valgte lyd."},
"reinfFeedbackMsg":function(d){return "Du kan trykke på knappen \"Prøv igen\", for at gå tilbage til dit spil."},
"scoreText":function(d){return "Score: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "sæt scene"},
"setBackgroundRandom":function(d){return "Vælg tilfældig baggrund"},
"setBackgroundFlappy":function(d){return "Vælg By (dag) som baggrund"},
"setBackgroundNight":function(d){return "Vælg By (nat) som baggrund"},
"setBackgroundSciFi":function(d){return "Vælg Sci-Fi baggrund"},
"setBackgroundUnderwater":function(d){return "Vælg undervandsbaggrund"},
"setBackgroundCave":function(d){return "Vælg hulebaggrund"},
"setBackgroundSanta":function(d){return "Vælg julebaggrund"},
"setBackgroundTooltip":function(d){return "Indstiller baggrundsbilledet"},
"setGapRandom":function(d){return "Sæt tilfældigt mellemrum"},
"setGapVerySmall":function(d){return "Sæt et meget lille mellemrum"},
"setGapSmall":function(d){return "Sæt et lille mellemrum"},
"setGapNormal":function(d){return "Sæt et normalt mellemrum"},
"setGapLarge":function(d){return "Sæt et stort mellemrum"},
"setGapVeryLarge":function(d){return "Sæt et meget stort mellemrum"},
"setGapHeightTooltip":function(d){return "Sæt et lodret mellemrum i en forhindring"},
"setGravityRandom":function(d){return "Sæt tilfældig tyngdekraft"},
"setGravityVeryLow":function(d){return "Sæt tyngdekraften meget lavt"},
"setGravityLow":function(d){return "Sæt tyngdekraften lavt"},
"setGravityNormal":function(d){return "Sæt normal tyngdekraft"},
"setGravityHigh":function(d){return "Sæt høj tyngdekraft"},
"setGravityVeryHigh":function(d){return "Sæt meget høj tyngdekraft"},
"setGravityTooltip":function(d){return "Vælger banens tyngdekraft"},
"setGround":function(d){return "sæt jorden"},
"setGroundRandom":function(d){return "Sæt bunden tilfærdig"},
"setGroundFlappy":function(d){return "Sæt bunden til jord"},
"setGroundSciFi":function(d){return "Sæt bunden til Sci-Fi"},
"setGroundUnderwater":function(d){return "Sæt bunden til undervands"},
"setGroundCave":function(d){return "Sæt bunden til grotte"},
"setGroundSanta":function(d){return "Sæt bunden til julemand"},
"setGroundLava":function(d){return "Sæt bunden til lava"},
"setGroundTooltip":function(d){return "Sæt bundens til billede"},
"setObstacle":function(d){return "sæt forhindring"},
"setObstacleRandom":function(d){return "Sæt forhindring tilfældigt"},
"setObstacleFlappy":function(d){return "Sæt forhinding til rør"},
"setObstacleSciFi":function(d){return "Sæt forhinding til Sci-Fi"},
"setObstacleUnderwater":function(d){return "Sæt forhinding til plante"},
"setObstacleCave":function(d){return "Sæt forhinding til hule"},
"setObstacleSanta":function(d){return "Sæt forhinding til skorsten"},
"setObstacleLaser":function(d){return "Sæt forhinding til laserstråle"},
"setObstacleTooltip":function(d){return "Sæt forhinding til billede"},
"setPlayer":function(d){return "sæt spiller"},
"setPlayerRandom":function(d){return "Sæt spiller tilfældigt"},
"setPlayerFlappy":function(d){return "Sæt spiller til gul fugl"},
"setPlayerRedBird":function(d){return "sæt spiller til rød fugl"},
"setPlayerSciFi":function(d){return "sæt spiller til rumskib"},
"setPlayerUnderwater":function(d){return "Sæt spiller til fisk"},
"setPlayerCave":function(d){return "Sæt spiller til flagermus"},
"setPlayerSanta":function(d){return "Sæt spiller til julemand"},
"setPlayerShark":function(d){return "Sæt spiller til haj"},
"setPlayerEaster":function(d){return "Sæt spiller til påskehare"},
"setPlayerBatman":function(d){return "Sæt spiller til flagermuse-fyren"},
"setPlayerSubmarine":function(d){return "Sæt spiller til ubåd"},
"setPlayerUnicorn":function(d){return "Sæt spiller til enhjørning"},
"setPlayerFairy":function(d){return "Sæt spiller til fe"},
"setPlayerSuperman":function(d){return "Sæt spiller til Flappymanden"},
"setPlayerTurkey":function(d){return "Sæt spiller til kalkun"},
"setPlayerTooltip":function(d){return "Sæt spiller-billede"},
"setScore":function(d){return "sæt score"},
"setScoreTooltip":function(d){return "Angiver spillerens score"},
"setSpeed":function(d){return "indstille hastighed"},
"setSpeedTooltip":function(d){return "Indstiller dette niveaus hastighed"},
"shareFlappyTwitter":function(d){return "Se det Flappy spil jeg lavede. Jeg skrev det selv med @codeorg"},
"shareGame":function(d){return "Del dit spil:"},
"soundRandom":function(d){return "tilfældig"},
"soundBounce":function(d){return "hop"},
"soundCrunch":function(d){return "kravle"},
"soundDie":function(d){return "ked af det"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "point"},
"soundSwoosh":function(d){return "SwoosH"},
"soundWing":function(d){return "vinge"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "kendingsmelodi"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "Sæt hastigheden tilfældigt"},
"speedVerySlow":function(d){return "Sæt meget lav hastighed"},
"speedSlow":function(d){return "Sæt langsom hastighed"},
"speedNormal":function(d){return "Sæt normal hastighed"},
"speedFast":function(d){return "Sæt hurtig hastighed"},
"speedVeryFast":function(d){return "Sæt meget hurtig hastighed"},
"whenClick":function(d){return "Når du klikker"},
"whenClickTooltip":function(d){return "Udføre nedenstående handlinger når en klik begivenhed indtræffer."},
"whenCollideGround":function(d){return "Når jorden rammes"},
"whenCollideGroundTooltip":function(d){return "Udføre handlinger nedenfor når Flappy rammer jorden."},
"whenCollideObstacle":function(d){return "når en forhindring er ramt"},
"whenCollideObstacleTooltip":function(d){return "Udfør nedenstående handlinger når Flappy rammer en forhindring."},
"whenEnterObstacle":function(d){return "når en forhindring passeres"},
"whenEnterObstacleTooltip":function(d){return "Udfør nedenstående handlinger når Flappy rammer en forhindring."},
"whenRunButtonClick":function(d){return "når spillet starter"},
"whenRunButtonClickTooltip":function(d){return "Udfør nedenstående handlinger når spillet starter."},
"yes":function(d){return "Ja"}};