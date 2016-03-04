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
"continue":function(d){return "Doorgaan"},
"doCode":function(d){return "voer uit"},
"elseCode":function(d){return "anders"},
"endGame":function(d){return "beëindig spel"},
"endGameTooltip":function(d){return "Beëindigt het spel."},
"finalLevel":function(d){return "Gefeliciteerd! je hebt de laatste puzzel opgelost."},
"flap":function(d){return "flapperen"},
"flapRandom":function(d){return "flapper een willekeurig aantal keer"},
"flapVerySmall":function(d){return "een heel klein beetje flapperen"},
"flapSmall":function(d){return "een klein beetje flapperen"},
"flapNormal":function(d){return "normaal flapperen"},
"flapLarge":function(d){return "hard flapperen"},
"flapVeryLarge":function(d){return "heel hard flapperen"},
"flapTooltip":function(d){return "Flappy hoger laten vliegen."},
"flappySpecificFail":function(d){return "Je programma ziet er goed uit - bij elke klik zal hij flapperen. Maak je moet nu heel vaak klikken om naar het doel te flapperen."},
"incrementPlayerScore":function(d){return "een punt scoren"},
"incrementPlayerScoreTooltip":function(d){return "Een punt toevoegen aan de score van de huidige speler."},
"nextLevel":function(d){return "Gefeliciteerd! Je hebt de puzzel voltooid."},
"no":function(d){return "Nee"},
"numBlocksNeeded":function(d){return "Deze puzzel kan worden opgelost met %1 blokken."},
"playSoundRandom":function(d){return "willekeurig geluid afspelen"},
"playSoundBounce":function(d){return "stuiter geluid afspelen"},
"playSoundCrunch":function(d){return "krakend geluid afspelen"},
"playSoundDie":function(d){return "triest geluid afspelen"},
"playSoundHit":function(d){return "plettend geluid afspelen"},
"playSoundPoint":function(d){return "scorend geluid afspelen"},
"playSoundSwoosh":function(d){return "swoosh geluid afspelen"},
"playSoundWing":function(d){return "vleugel geluid afspelen"},
"playSoundJet":function(d){return "straaljager geluid afspelen"},
"playSoundCrash":function(d){return "crash geluid afspelen"},
"playSoundJingle":function(d){return "jingle geluid afspelen"},
"playSoundSplash":function(d){return "plons geluid afspelen"},
"playSoundLaser":function(d){return "laser geluid afspelen"},
"playSoundTooltip":function(d){return "Speel het gekozen geluid af."},
"reinfFeedbackMsg":function(d){return "Klik 'Probeer opnieuw' om terug te gaan naar uw spel."},
"scoreText":function(d){return "Punten: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "Kies scene"},
"setBackgroundRandom":function(d){return "willekeurige achtergrond instellen"},
"setBackgroundFlappy":function(d){return "stad (dag) als achtergrond instellen"},
"setBackgroundNight":function(d){return "stad (nacht) als achtergrond instellen"},
"setBackgroundSciFi":function(d){return "science fiction achtergrond instellen"},
"setBackgroundUnderwater":function(d){return "onderwaterwereld als achtergrond instellen"},
"setBackgroundCave":function(d){return "grot als achtergrond instellen"},
"setBackgroundSanta":function(d){return "kerst als achtergrond instellen"},
"setBackgroundTooltip":function(d){return "Hiermee stel je de achtergrondafbeelding in"},
"setGapRandom":function(d){return "instellen van een willekeurig gat"},
"setGapVerySmall":function(d){return "een heel kleine opening instellen"},
"setGapSmall":function(d){return "een kleine opening instellen"},
"setGapNormal":function(d){return "een normale opening instellen"},
"setGapLarge":function(d){return "een grote opening instellen"},
"setGapVeryLarge":function(d){return "een heel grote opening instellen"},
"setGapHeightTooltip":function(d){return "De 'doorvlieg'-opening instellen"},
"setGravityRandom":function(d){return "zwaartekracht willekeurig instellen"},
"setGravityVeryLow":function(d){return "zwaartekracht heel zwak instellen"},
"setGravityLow":function(d){return "zwaartekracht zwak instellen"},
"setGravityNormal":function(d){return "zwaartekracht normaal instellen"},
"setGravityHigh":function(d){return "zwaartekracht sterk instellen"},
"setGravityVeryHigh":function(d){return "zwaartekracht heel sterk instellen"},
"setGravityTooltip":function(d){return "Stelt de zwaartekracht in"},
"setGround":function(d){return "ondergrond kiezen"},
"setGroundRandom":function(d){return "Plaats grond willekeurig"},
"setGroundFlappy":function(d){return "ondergrond kiezen"},
"setGroundSciFi":function(d){return "planeet als ondergrond kiezen"},
"setGroundUnderwater":function(d){return "Plaats grond onderwater\n"},
"setGroundCave":function(d){return "grot als ondergrond kiezen"},
"setGroundSanta":function(d){return "besneeuwde daken als ondergrond kiezen"},
"setGroundLava":function(d){return "lava als ondergrond kiezen"},
"setGroundTooltip":function(d){return "Stelt de ondergrond in"},
"setObstacle":function(d){return "kies obstakel"},
"setObstacleRandom":function(d){return "Willekeurige obstakels instellen"},
"setObstacleFlappy":function(d){return "Pijpen als obstakels instellen"},
"setObstacleSciFi":function(d){return "Science fiction obstakels instellen"},
"setObstacleUnderwater":function(d){return "Planten als obstakels instellen"},
"setObstacleCave":function(d){return "Rotsen als obstakel instellen"},
"setObstacleSanta":function(d){return "Schoorstenen als obstakels instellen"},
"setObstacleLaser":function(d){return "Lasers als obstakels instellen"},
"setObstacleTooltip":function(d){return "Bepaalt wat je als obstakels ziet"},
"setPlayer":function(d){return "kies speler"},
"setPlayerRandom":function(d){return "Willekeurige spelers-afbeelding"},
"setPlayerFlappy":function(d){return "Stel gele vogel als speler in"},
"setPlayerRedBird":function(d){return "Stel rode vogel als speler in"},
"setPlayerSciFi":function(d){return "Stel ruimteschip als speler in"},
"setPlayerUnderwater":function(d){return "Stel vis als speler in"},
"setPlayerCave":function(d){return "Stel vleermuis als speler in"},
"setPlayerSanta":function(d){return "Stel kerstman als speler in"},
"setPlayerShark":function(d){return "Stel haai als speler in"},
"setPlayerEaster":function(d){return "Stel paashaas als speler in"},
"setPlayerBatman":function(d){return "speler als vleermuis instellen"},
"setPlayerSubmarine":function(d){return "Stel onderzeeer als speler in"},
"setPlayerUnicorn":function(d){return "Stel eenhoorn als speler in"},
"setPlayerFairy":function(d){return "Stel elfje als speler in"},
"setPlayerSuperman":function(d){return "Stel Flappyman als speler in"},
"setPlayerTurkey":function(d){return "Stel kalkoen als speler in"},
"setPlayerTooltip":function(d){return "Stelt in hoe de speler er uit ziet"},
"setScore":function(d){return "score instellen"},
"setScoreTooltip":function(d){return "Stelt de score van de speler in"},
"setSpeed":function(d){return "stel snelheid in"},
"setSpeedTooltip":function(d){return "Stelt de snelheid van de speler in"},
"shareFlappyTwitter":function(d){return "Speel hier het Flappy spel dat ik zelf heb gemaakt. Ik maakte het met @codeorg"},
"shareGame":function(d){return "Deel je spel met anderen:"},
"soundRandom":function(d){return "willekeurig"},
"soundBounce":function(d){return "stuiter"},
"soundCrunch":function(d){return "kraak"},
"soundDie":function(d){return "verdrietig"},
"soundHit":function(d){return "slaan"},
"soundPoint":function(d){return "punt"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "vleugel"},
"soundJet":function(d){return "straaljager"},
"soundCrash":function(d){return "bots"},
"soundJingle":function(d){return "rinkel"},
"soundSplash":function(d){return "plons"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "stel snelheid willekeurig in"},
"speedVerySlow":function(d){return "stel snelheid in op erg traag"},
"speedSlow":function(d){return "stel snelheid in op traag"},
"speedNormal":function(d){return "stel snelheid in op normaal"},
"speedFast":function(d){return "stel snelheid in op snel"},
"speedVeryFast":function(d){return "stel snelheid in op heel snel"},
"whenClick":function(d){return "bij een klik"},
"whenClickTooltip":function(d){return "Voer de acties hieronder uit wanneer een klik wordt opgemerkt."},
"whenCollideGround":function(d){return "als de grond wordt geraakt"},
"whenCollideGroundTooltip":function(d){return "Voer de onderstaande acties uit als Flappy de grond raakt."},
"whenCollideObstacle":function(d){return "als obstakel geraakt"},
"whenCollideObstacleTooltip":function(d){return "De onderstaande acties uitvoeren als Flappy een obstakel raakt."},
"whenEnterObstacle":function(d){return "als een obstakel wordt gepasseerd"},
"whenEnterObstacleTooltip":function(d){return "De onderstaande acties uitvoeren als Flappy een obstakel raakt."},
"whenRunButtonClick":function(d){return "als het spel start"},
"whenRunButtonClickTooltip":function(d){return "Voer de onderstaande acties uit als het spel start."},
"yes":function(d){return "Ja"}};