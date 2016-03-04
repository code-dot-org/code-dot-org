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
"continue":function(d){return "Nadaljuj"},
"doCode":function(d){return "izvrši"},
"elseCode":function(d){return "drugače"},
"endGame":function(d){return "konec igre"},
"endGameTooltip":function(d){return "Konča igro."},
"finalLevel":function(d){return "Čestitke! Rešil/a si zadnjo uganko."},
"flap":function(d){return "plahutaj"},
"flapRandom":function(d){return "plahutaj naključno dolgo"},
"flapVerySmall":function(d){return "zamahni z zelo majhno močjo"},
"flapSmall":function(d){return "zamahni z majhno močjo"},
"flapNormal":function(d){return "zamahni z normalno močjo"},
"flapLarge":function(d){return "zamahni z veliko močjo"},
"flapVeryLarge":function(d){return "zamahni z zelo veliko močjo"},
"flapTooltip":function(d){return "Poleti z Flappy-jem navzgor."},
"flappySpecificFail":function(d){return "Vaša koda izgleda super - z vsakim klikom boste poleteli za en zamah. Ampak da dosežete tarčo morate klikniti večkrat zaporedoma."},
"incrementPlayerScore":function(d){return "Doseči točko"},
"incrementPlayerScoreTooltip":function(d){return "Dodaj ena k trenutnemu dosežku."},
"nextLevel":function(d){return "Čestitke! Zaključil/a si to uganko."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ta uganka je lahko rešena z %1 bloki."},
"playSoundRandom":function(d){return "Zaigraj naključni zvok"},
"playSoundBounce":function(d){return "Predvajaj zvok poskoka"},
"playSoundCrunch":function(d){return "predvajaj zvok drobljenja"},
"playSoundDie":function(d){return "Predvajaja žalostni zvok"},
"playSoundHit":function(d){return "Predvajaj zvok treščiti"},
"playSoundPoint":function(d){return "Predvajaj zvok pridobljene točke"},
"playSoundSwoosh":function(d){return "Predvajaj zvok prepiha"},
"playSoundWing":function(d){return "Predvajaj zvok krila"},
"playSoundJet":function(d){return "predvajaj zvok letala"},
"playSoundCrash":function(d){return "predvajaj zvok nesreče"},
"playSoundJingle":function(d){return "predvajaj jingle"},
"playSoundSplash":function(d){return "Predvajaj zvok škroplenja"},
"playSoundLaser":function(d){return "Predvajaj laserski zvok"},
"playSoundTooltip":function(d){return "Predvajaj izbrani zvok."},
"reinfFeedbackMsg":function(d){return "Lahko pritisnete gumb \"Poskusi znova\" in se vrnete nazaj k igranju svoje igre."},
"scoreText":function(d){return "Dosežek: "+flappy_locale.v(d,"playerScore")+" (Uporabnikove točke)"},
"setBackground":function(d){return "Izberi odzdadje"},
"setBackgroundRandom":function(d){return "izberi naključno odzadje"},
"setBackgroundFlappy":function(d){return "Izberi mestno(podnevi) odzadje"},
"setBackgroundNight":function(d){return "Izberi mestno(nočno) odzadje"},
"setBackgroundSciFi":function(d){return "Izberi znanstveno fantastično odzadje"},
"setBackgroundUnderwater":function(d){return "Izberi podvodno odzadje"},
"setBackgroundCave":function(d){return "Izberi jamsko odzadje"},
"setBackgroundSanta":function(d){return "Izberi božično odzadje"},
"setBackgroundTooltip":function(d){return "Nastavite sliko ozadja"},
"setGapRandom":function(d){return "Nastavite poljubno vrzel"},
"setGapVerySmall":function(d){return "Nastavite zelo majhno vrzel"},
"setGapSmall":function(d){return "Nastavite majhno vrzel"},
"setGapNormal":function(d){return "Nastavite normalno vrzel"},
"setGapLarge":function(d){return "Nastavite veliko vrzel"},
"setGapVeryLarge":function(d){return "nastavi zelo veliko vrzel"},
"setGapHeightTooltip":function(d){return "Nastavi navpično vrzel v oviro"},
"setGravityRandom":function(d){return "težnost naključna"},
"setGravityVeryLow":function(d){return "težnost zelo majhna"},
"setGravityLow":function(d){return "težnost majhna"},
"setGravityNormal":function(d){return "težnost normalna"},
"setGravityHigh":function(d){return "težnost velika"},
"setGravityVeryHigh":function(d){return "težnost zelo velika"},
"setGravityTooltip":function(d){return "Nastavi težnost za ta nivo"},
"setGround":function(d){return "nastavi ozadje"},
"setGroundRandom":function(d){return "nastavi naključno ozadje"},
"setGroundFlappy":function(d){return "nastavi ozadje Ozadje"},
"setGroundSciFi":function(d){return "nastavi ZF ozadje"},
"setGroundUnderwater":function(d){return "nastavi podvodno ozadje"},
"setGroundCave":function(d){return "nastavi jamsko ozadje"},
"setGroundSanta":function(d){return "nastavi božično ozadje"},
"setGroundLava":function(d){return "nastavi vulkansko ozadje"},
"setGroundTooltip":function(d){return "Nastavi sliko ozadja"},
"setObstacle":function(d){return "nastavi ovire"},
"setObstacleRandom":function(d){return "določi oviro naključno"},
"setObstacleFlappy":function(d){return "določi cevi kot oviro"},
"setObstacleSciFi":function(d){return "določi SF sliko kot oviro"},
"setObstacleUnderwater":function(d){return "določi rastlino kot oviro"},
"setObstacleCave":function(d){return "določi jamo kot oviro"},
"setObstacleSanta":function(d){return "določi dimnik kot oviro"},
"setObstacleLaser":function(d){return "določi laser kot oviro"},
"setObstacleTooltip":function(d){return "Nastavi sliko ovire"},
"setPlayer":function(d){return "določi igralca"},
"setPlayerRandom":function(d){return "določi igralca naključno"},
"setPlayerFlappy":function(d){return "določi rumenega ptiča za igralca"},
"setPlayerRedBird":function(d){return "določi rdečega ptiča za igralca"},
"setPlayerSciFi":function(d){return "določi vesoljsko ladjo za igralca"},
"setPlayerUnderwater":function(d){return "določi ribo za igralca"},
"setPlayerCave":function(d){return "določi netopirja za igralca"},
"setPlayerSanta":function(d){return "določi božička za igralca"},
"setPlayerShark":function(d){return "določi morskega psa za igralca"},
"setPlayerEaster":function(d){return "določi velikonočnega zajca za igralca"},
"setPlayerBatman":function(d){return "določi človeka-netopirja za igralca"},
"setPlayerSubmarine":function(d){return "določi podmornico za igralca"},
"setPlayerUnicorn":function(d){return "določi enoroga za igralca"},
"setPlayerFairy":function(d){return "določi vilo za igralca"},
"setPlayerSuperman":function(d){return "določi Plahutavca za igralca"},
"setPlayerTurkey":function(d){return "določi purana za igralca"},
"setPlayerTooltip":function(d){return "Nastavi sliko igralca"},
"setScore":function(d){return "nastavi rezultat"},
"setScoreTooltip":function(d){return "Nastavi igralčeve točke"},
"setSpeed":function(d){return "nastavi hitrost"},
"setSpeedTooltip":function(d){return "Nastavi hitrost tega nivoja"},
"shareFlappyTwitter":function(d){return "Oglej si igrico Flappy, ki sem jo sam izdelal. Napisal sem jo z @codeorg"},
"shareGame":function(d){return "Delite vašo igro z ostalimi:"},
"soundRandom":function(d){return "naključno"},
"soundBounce":function(d){return "poskočiti"},
"soundCrunch":function(d){return "hrustati"},
"soundDie":function(d){return "žalostno"},
"soundHit":function(d){return "treščiti"},
"soundPoint":function(d){return "točka"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "krilo"},
"soundJet":function(d){return "letalo"},
"soundCrash":function(d){return "nesreča"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "poškropiti"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "nastavi hitrost na naključno"},
"speedVerySlow":function(d){return "nastavi hitrost na zelo počasno"},
"speedSlow":function(d){return "nastavi hitrost na počasno"},
"speedNormal":function(d){return "nastavi hitrost na normalno"},
"speedFast":function(d){return "nastavi hitrost na hitro"},
"speedVeryFast":function(d){return "nastavi hitrost na zelo hitro"},
"whenClick":function(d){return "ko kliknjen"},
"whenClickTooltip":function(d){return "Ko se zgodi klik, naredi spodaj navedeno."},
"whenCollideGround":function(d){return "kadar zadene tla"},
"whenCollideGroundTooltip":function(d){return "Ko Flappy zadene tla, naredi spodaj navedeno."},
"whenCollideObstacle":function(d){return "ko zadene oviro"},
"whenCollideObstacleTooltip":function(d){return "Ko Flappy zadene oviro, naredi spodaj navedeno."},
"whenEnterObstacle":function(d){return "kadar mimo ovire"},
"whenEnterObstacleTooltip":function(d){return "Ko Flappy doseže oviro, naredi spodaj navedeno."},
"whenRunButtonClick":function(d){return "ko se igra začne"},
"whenRunButtonClickTooltip":function(d){return "Izvedite spodnja dejanja, ko se igra začne."},
"yes":function(d){return "Da"}};