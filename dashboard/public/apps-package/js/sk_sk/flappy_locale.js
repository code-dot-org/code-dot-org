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
"continue":function(d){return "Pokračovať"},
"doCode":function(d){return "vykonaj"},
"elseCode":function(d){return "inak"},
"endGame":function(d){return "koniec hry"},
"endGameTooltip":function(d){return "Ukončí hru."},
"finalLevel":function(d){return "Gratulujem! Vyriešili ste posledné puzzle."},
"flap":function(d){return "mávni"},
"flapRandom":function(d){return "mávni náhodný počet krát"},
"flapVerySmall":function(d){return "mávni veľmi malý počet krát"},
"flapSmall":function(d){return "mávni malý počet krát"},
"flapNormal":function(d){return "mávni normálny počet krát"},
"flapLarge":function(d){return "mávni veľký počet krát"},
"flapVeryLarge":function(d){return "mávni veľmi veľký počet krát"},
"flapTooltip":function(d){return "Leť Flappym smerom nahor."},
"flappySpecificFail":function(d){return "Tvoj kód vyzerá dobre - vták mávne krídlami pri každom kliknutí, ale musíš kliknúť viac krát, aby si sa dostal k cieľu. "},
"incrementPlayerScore":function(d){return "získaj bod"},
"incrementPlayerScoreTooltip":function(d){return "Pridaj jednu k aktuálnemu skóre."},
"nextLevel":function(d){return "Gratulujem! Vyriešil si hádanku."},
"no":function(d){return "Nie"},
"numBlocksNeeded":function(d){return "Táto hádanka môže byť vyriešená s %1 blokmi."},
"playSoundRandom":function(d){return "prehrať náhodný zvuk"},
"playSoundBounce":function(d){return "prehrať zvuk odrazenia"},
"playSoundCrunch":function(d){return "prehrať zvuk chrumnutia"},
"playSoundDie":function(d){return "prehrať zvuk smútku"},
"playSoundHit":function(d){return "prehrať zvuk rozbitia"},
"playSoundPoint":function(d){return "prehrať zvuk získania bodu"},
"playSoundSwoosh":function(d){return "prehrať zvuk šuchotania"},
"playSoundWing":function(d){return "prehrať zvuk krídiel"},
"playSoundJet":function(d){return "prehrať zvuk stíhačky"},
"playSoundCrash":function(d){return "prehrať zvuk zrážky"},
"playSoundJingle":function(d){return "prehrať zvuk zvonca"},
"playSoundSplash":function(d){return "prehrať zvuk šplechnutia"},
"playSoundLaser":function(d){return "prehrať zvuk lasera"},
"playSoundTooltip":function(d){return "Prehraj vybraný zvuk."},
"reinfFeedbackMsg":function(d){return "Pre návrat k svojej hre môžeš stlačiť tlačidlo \"Skúsiť znova\"."},
"scoreText":function(d){return "Počet bodov: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "Nastaviť prostredie"},
"setBackgroundRandom":function(d){return "nastaviť prostredie náhodne"},
"setBackgroundFlappy":function(d){return "nastaviť prostredie Mesto (deň)"},
"setBackgroundNight":function(d){return "nastaviť prostredie Mesto (noc)"},
"setBackgroundSciFi":function(d){return "nastaviť prostredie Sci-Fi"},
"setBackgroundUnderwater":function(d){return "nastaviť prostredie Pod vodou"},
"setBackgroundCave":function(d){return "nastaviť prostredie Jaskyňa"},
"setBackgroundSanta":function(d){return "nastaviť prostredie Mikuláš"},
"setBackgroundTooltip":function(d){return "Nastaví obrázok pozadia"},
"setGapRandom":function(d){return "Nastav náhodnú veľkosť medzery"},
"setGapVerySmall":function(d){return "nastav veľmi malú medzeru"},
"setGapSmall":function(d){return "nastav malú medzeru"},
"setGapNormal":function(d){return "nastav normálnu medzeru"},
"setGapLarge":function(d){return "nastav veľkú medzeru"},
"setGapVeryLarge":function(d){return "nastav veľmi veľkú medzeru"},
"setGapHeightTooltip":function(d){return "Nastavuje zvislú medzeru v prekážke"},
"setGravityRandom":function(d){return "nastaviť náhodnú tiaž"},
"setGravityVeryLow":function(d){return "nastaviť veľmi nízku tiaž"},
"setGravityLow":function(d){return "nastaviť nízku tiaž"},
"setGravityNormal":function(d){return "nastaviť normálnu tiaž"},
"setGravityHigh":function(d){return "nastaviť vysokú tiaž"},
"setGravityVeryHigh":function(d){return "nastaviť veľmi vysokú tiaž"},
"setGravityTooltip":function(d){return "Nastaví úroveň tiaže"},
"setGround":function(d){return "nastaviť terén"},
"setGroundRandom":function(d){return "nastaviť terén Náhodne"},
"setGroundFlappy":function(d){return "nastaviť terén Zem"},
"setGroundSciFi":function(d){return "nastaviť terén Sci-Fi"},
"setGroundUnderwater":function(d){return "nastaviť terén Pod vodou"},
"setGroundCave":function(d){return "nastaviť terén Jaskyňa"},
"setGroundSanta":function(d){return "nastaviť terén Mikuláš"},
"setGroundLava":function(d){return "nastaviť terén Láva"},
"setGroundTooltip":function(d){return "Nastaví obrázok terénu"},
"setObstacle":function(d){return "nastaviť prekážku"},
"setObstacleRandom":function(d){return "nastaviť prekážku Náhodne"},
"setObstacleFlappy":function(d){return "nastaviť prekážku Potrubie"},
"setObstacleSciFi":function(d){return "nastaviť prekážku Sci-Fi"},
"setObstacleUnderwater":function(d){return "nastaviť prekážku Rastlina"},
"setObstacleCave":function(d){return "nastaviť prekážku Jaskyňa"},
"setObstacleSanta":function(d){return "nastaviť prekážku Komín"},
"setObstacleLaser":function(d){return "nastaviť prekážku Laser"},
"setObstacleTooltip":function(d){return "Nastaví obrázok prekážky"},
"setPlayer":function(d){return "nastaviť hráča"},
"setPlayerRandom":function(d){return "nastaviť hráča Náhodne"},
"setPlayerFlappy":function(d){return "nastaviť hráča Žltý vták"},
"setPlayerRedBird":function(d){return "nastaviť hráča Červený vták"},
"setPlayerSciFi":function(d){return "nastaviť hráča Vesmírna raketa"},
"setPlayerUnderwater":function(d){return "nastaviť hráča Ryba"},
"setPlayerCave":function(d){return "nastaviť hráča Netopier"},
"setPlayerSanta":function(d){return "nastaviť hráča Mikuláš"},
"setPlayerShark":function(d){return "nastaviť hráča Žralok"},
"setPlayerEaster":function(d){return "nastaviť hráča Veľkonočný zajačik"},
"setPlayerBatman":function(d){return "nastaviť hráča Batman"},
"setPlayerSubmarine":function(d){return "nastaviť hráča Ponorka"},
"setPlayerUnicorn":function(d){return "nastaviť hráča Jednorožec"},
"setPlayerFairy":function(d){return "nastaviť hráča Víla"},
"setPlayerSuperman":function(d){return "nastaviť hráča Flappyman"},
"setPlayerTurkey":function(d){return "nastaviť hráča Moriak"},
"setPlayerTooltip":function(d){return "nastaviť hráčov obrázok"},
"setScore":function(d){return "nastaviť skóre"},
"setScoreTooltip":function(d){return "Nastaví hráčovo skóre"},
"setSpeed":function(d){return "nastaviť rýchlosť"},
"setSpeedTooltip":function(d){return "nastaviť úroveň rýchlosti"},
"shareFlappyTwitter":function(d){return "Pozrite sa na Flappy hru, čo som urobil. Napísal som to sám s @codeorg"},
"shareGame":function(d){return "Zdieľaj svoju hru:"},
"soundRandom":function(d){return "náhodný"},
"soundBounce":function(d){return "skok"},
"soundCrunch":function(d){return "chrúmať"},
"soundDie":function(d){return "smutný"},
"soundHit":function(d){return "rozbiť sa"},
"soundPoint":function(d){return "bod"},
"soundSwoosh":function(d){return "šuchotanie"},
"soundWing":function(d){return "krídlo"},
"soundJet":function(d){return "lietadlo"},
"soundCrash":function(d){return "Zrážka"},
"soundJingle":function(d){return "štrngot"},
"soundSplash":function(d){return "šplech"},
"soundLaser":function(d){return "laserové"},
"speedRandom":function(d){return "nastav náhodnú rýchlosť"},
"speedVerySlow":function(d){return "nastav veľmi pomalú rýchlosť"},
"speedSlow":function(d){return "nastav pomalú rýchlosť"},
"speedNormal":function(d){return "nastav normálnu rýchlosť"},
"speedFast":function(d){return "nastav vysokú rýchlosť"},
"speedVeryFast":function(d){return "nastav veľmi vysokú rýchlosť"},
"whenClick":function(d){return "pri kliknutí"},
"whenClickTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď sa klikne."},
"whenCollideGround":function(d){return "keď dopadne na zem"},
"whenCollideGroundTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď Flappy sa dotkne zeme."},
"whenCollideObstacle":function(d){return "keď narazí na prekážku"},
"whenCollideObstacleTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď Flappy narazí na prekážku."},
"whenEnterObstacle":function(d){return "keď obíde prekážku"},
"whenEnterObstacleTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď Flappy sa dostane k prekážke."},
"whenRunButtonClick":function(d){return "keď začne hra"},
"whenRunButtonClickTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď hra začne."},
"yes":function(d){return "Áno"}};