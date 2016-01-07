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
"continue":function(d){return "Tovább"},
"doCode":function(d){return "csináld"},
"elseCode":function(d){return "különben"},
"endGame":function(d){return "játék vége"},
"endGameTooltip":function(d){return "Vége a játéknak."},
"finalLevel":function(d){return "Gratulálok! A megoldottad az utolsó feladványt."},
"flap":function(d){return "csapj"},
"flapRandom":function(d){return "véletlen nagyságút csap"},
"flapVerySmall":function(d){return "nagyon kicsit csap"},
"flapSmall":function(d){return "kicsit csap"},
"flapNormal":function(d){return "átlagosat csap"},
"flapLarge":function(d){return "nagyot csap"},
"flapVeryLarge":function(d){return "nagyon nagyot csap"},
"flapTooltip":function(d){return "Szálljon Flappy felfelé."},
"flappySpecificFail":function(d){return "A kódod nem rossz - Csap minden egyes kattintásra. De sokszor kell kattintania, hogy eljusson a célba."},
"incrementPlayerScore":function(d){return "nőjön eggyel a pontszám"},
"incrementPlayerScoreTooltip":function(d){return "Adjon egyet az aktuális játékos pontjaihoz."},
"nextLevel":function(d){return "Gratulálunk! Kész vagy ezzel a kirakóval."},
"no":function(d){return "Nem"},
"numBlocksNeeded":function(d){return "Ez a kirakó az elemek 1 %-ával megoldható"},
"playSoundRandom":function(d){return "játssz le véletlen hangot"},
"playSoundBounce":function(d){return "játssz le pattogó hangot"},
"playSoundCrunch":function(d){return "recsegő hang lejátszása"},
"playSoundDie":function(d){return "játssz le szomorú hangot"},
"playSoundHit":function(d){return "játssz le reccsenő hangot"},
"playSoundPoint":function(d){return "játssz le éles hangot"},
"playSoundSwoosh":function(d){return "játssz le suhanó hangot"},
"playSoundWing":function(d){return "játssz le szárnycsapás hangot"},
"playSoundJet":function(d){return "játssz le repülő hangot"},
"playSoundCrash":function(d){return "játssz le csattanás hangot"},
"playSoundJingle":function(d){return "játssz le csilingelő hangot"},
"playSoundSplash":function(d){return "játssz le csobbanás hangot"},
"playSoundLaser":function(d){return "játssz le lézer hangot"},
"playSoundTooltip":function(d){return "Kiválasztott hang lejátszása."},
"reinfFeedbackMsg":function(d){return "Nyomd meg az \"Próbáld újra\" gombot hogy visszatérj a játékodhoz."},
"scoreText":function(d){return "Pontszám: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "jelenet kiválasztása"},
"setBackgroundRandom":function(d){return "Jelenet kiválasztása: Véletlen"},
"setBackgroundFlappy":function(d){return "Jelenet kiválasztása: Város (nappal)"},
"setBackgroundNight":function(d){return "Jelenet kiválasztása: Város (éjjel)"},
"setBackgroundSciFi":function(d){return "Jelenet kiválasztása: Sci-fi"},
"setBackgroundUnderwater":function(d){return "jelenet kiválasztása: Víz alatti"},
"setBackgroundCave":function(d){return "Jelenet kiválasztása: Barlang"},
"setBackgroundSanta":function(d){return "Jelenet kiválasztása: Santa"},
"setBackgroundTooltip":function(d){return "Add meg a háttér képet"},
"setGapRandom":function(d){return "rés beállítása : Véletlen"},
"setGapVerySmall":function(d){return "rés beállítása : Nagyon kicsi"},
"setGapSmall":function(d){return "rés beállítása : Kicsi"},
"setGapNormal":function(d){return "rés beállítása : Normál"},
"setGapLarge":function(d){return "rés beállítása : Nagy"},
"setGapVeryLarge":function(d){return "rés beállítása : Nagyon nagy"},
"setGapHeightTooltip":function(d){return "Az akadályok közötti rés magasságának  beállítása"},
"setGravityRandom":function(d){return "Véletlenszerű gravitáció beállítása"},
"setGravityVeryLow":function(d){return "Nagyon gyenge gravitáció beállítása"},
"setGravityLow":function(d){return "Gyenge gravitáció beállítása"},
"setGravityNormal":function(d){return "Normál gravitáció beállítása"},
"setGravityHigh":function(d){return "Erős gravitáció beállítása"},
"setGravityVeryHigh":function(d){return "Nagyon erős gravitáció beállítása"},
"setGravityTooltip":function(d){return "A pálya gravitációjának beállítása"},
"setGround":function(d){return "talaj típusa"},
"setGroundRandom":function(d){return "Talaj beállítása: Véletlenszerű"},
"setGroundFlappy":function(d){return "Talaj beállítása: Föld"},
"setGroundSciFi":function(d){return "Talaj beállítása: Sci-Fi"},
"setGroundUnderwater":function(d){return "Talaj beállítása: Vízalatti"},
"setGroundCave":function(d){return "Talaj beállítása: Barlang"},
"setGroundSanta":function(d){return "talaj típusa: Mikulás"},
"setGroundLava":function(d){return "Talaj típusa: Láva"},
"setGroundTooltip":function(d){return "Beállítja a talaj típusát"},
"setObstacle":function(d){return "akadály beállítása"},
"setObstacleRandom":function(d){return "akadály beállítása: véletlenszerű"},
"setObstacleFlappy":function(d){return "Akadály beállítása: cső"},
"setObstacleSciFi":function(d){return "Akadály beállítása: Sci-Fi"},
"setObstacleUnderwater":function(d){return "Akadály beállítása: Növény"},
"setObstacleCave":function(d){return "Akadály beállítása: Barlang"},
"setObstacleSanta":function(d){return "Akadály beállítása: Kémény"},
"setObstacleLaser":function(d){return "Akadály beállítása: Lézer"},
"setObstacleTooltip":function(d){return "Akadály képének beállítása"},
"setPlayer":function(d){return "karakter beállítása"},
"setPlayerRandom":function(d){return "karakter beállítása: Véletlenszerű"},
"setPlayerFlappy":function(d){return "Karakter beállítása: Sárga madár"},
"setPlayerRedBird":function(d){return "karakter beállítása: Piros madár"},
"setPlayerSciFi":function(d){return "Karakter beállítása: Űrhajó"},
"setPlayerUnderwater":function(d){return "Karakter beállítása: Hal"},
"setPlayerCave":function(d){return "Karakter beállítása: Denevér"},
"setPlayerSanta":function(d){return "Karakter beállítása: Mikulás"},
"setPlayerShark":function(d){return "Karakter beállítása: Cápa"},
"setPlayerEaster":function(d){return "Karakter beállítása: Húsvéti nyuszi"},
"setPlayerBatman":function(d){return "karakter típusa: Denevérember"},
"setPlayerSubmarine":function(d){return "Karakter beállítása: Tengeralattjáró"},
"setPlayerUnicorn":function(d){return "Karakter beállítása: Egyszarvú"},
"setPlayerFairy":function(d){return "Karakter beállítása: Tündér"},
"setPlayerSuperman":function(d){return "Karakter beállítása: Madárember"},
"setPlayerTurkey":function(d){return "Karakter beállítása: Pulyka"},
"setPlayerTooltip":function(d){return "Karakter képének beállítása"},
"setScore":function(d){return "Pontszám beállítása"},
"setScoreTooltip":function(d){return "Játékos pontszámának beállítása"},
"setSpeed":function(d){return "Sebesség beállítása"},
"setSpeedTooltip":function(d){return "A szint sebességének beállítása"},
"shareFlappyTwitter":function(d){return "Nézd, ezt a Flappy Bird játékot csináltam! Én magam írtam a @codeorg oldalon."},
"shareGame":function(d){return "Oszd meg a játékodat:"},
"soundRandom":function(d){return "véletlen"},
"soundBounce":function(d){return "ugrál"},
"soundCrunch":function(d){return "ropogás"},
"soundDie":function(d){return "szomorú"},
"soundHit":function(d){return "összezúzás"},
"soundPoint":function(d){return "mutatás"},
"soundSwoosh":function(d){return "süvítés"},
"soundWing":function(d){return "szárny"},
"soundJet":function(d){return "süvítés"},
"soundCrash":function(d){return "csattanás"},
"soundJingle":function(d){return "csilingelés"},
"soundSplash":function(d){return "fröccsenés"},
"soundLaser":function(d){return "lézer"},
"speedRandom":function(d){return "véletlenszerű sebesség beállítása"},
"speedVerySlow":function(d){return "nagyon kis sebesség beállítása"},
"speedSlow":function(d){return "kis sebesség beállítása"},
"speedNormal":function(d){return "Normál sebesség beállítása"},
"speedFast":function(d){return "Magas sebesség beállítása"},
"speedVeryFast":function(d){return "Nagyon magas sebesség beállítása"},
"whenClick":function(d){return "kattintáskor"},
"whenClickTooltip":function(d){return "Kattintáskor a lenti műveleteket hajtsa végre."},
"whenCollideGround":function(d){return "ha becsapódik a talajba"},
"whenCollideGroundTooltip":function(d){return "Hajtsd végre a lenti műveleteket, ha Flappy becsapódik a talajba."},
"whenCollideObstacle":function(d){return "ha akadálynak ütközik"},
"whenCollideObstacleTooltip":function(d){return "Hajtsd végre a lenti műveleteket, ha Flappy beleütközik egy akadályba."},
"whenEnterObstacle":function(d){return "ha átjut egy akadályon"},
"whenEnterObstacleTooltip":function(d){return "Hajtsa végre a lenti műveleteket, ha Flappy átjut egy akadályon."},
"whenRunButtonClick":function(d){return "amikor a játék elindul"},
"whenRunButtonClickTooltip":function(d){return "Végrehajtja a lenti utasításokat, ha a játék elindul."},
"yes":function(d){return "Igen"}};