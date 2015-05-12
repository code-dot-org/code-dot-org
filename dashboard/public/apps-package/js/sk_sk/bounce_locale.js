var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "odraziť loptu"},
"bounceBallTooltip":function(d){return "Odraziť loptu od predmetu."},
"continue":function(d){return "Pokračovať"},
"dirE":function(d){return "V"},
"dirN":function(d){return "S"},
"dirS":function(d){return "J"},
"dirW":function(d){return "Z"},
"doCode":function(d){return "vykonaj"},
"elseCode":function(d){return "ináč"},
"finalLevel":function(d){return "Gratulujem! Vyriešil si poslednú úlohu."},
"heightParameter":function(d){return "výška"},
"ifCode":function(d){return "ak"},
"ifPathAhead":function(d){return "ak je cesta vpred"},
"ifTooltip":function(d){return "Ak sa tam nachádza cesta v určenom smere, sprav niektoré opatrenia."},
"ifelseTooltip":function(d){return "Ak je v určenom smere cesta, potom vykonaj prvý blok akcií. V opačnom prípade vykonaj druhý blok akcií."},
"incrementOpponentScore":function(d){return "pridať bod súperovi"},
"incrementOpponentScoreTooltip":function(d){return "Pridá bod ku skóre súpera."},
"incrementPlayerScore":function(d){return "získať bod"},
"incrementPlayerScoreTooltip":function(d){return "Pridaj jednu k aktuálnemu skóre."},
"isWall":function(d){return "je toto stena"},
"isWallTooltip":function(d){return "Vráti true, ak je tu stena"},
"launchBall":function(d){return "pridať novú loptu"},
"launchBallTooltip":function(d){return "Pridá loptu do hry."},
"makeYourOwn":function(d){return "Vytvor svoju vlastnú odrážaciu hru"},
"moveDown":function(d){return "posunúť nadol"},
"moveDownTooltip":function(d){return "Posuň pálku nahor."},
"moveForward":function(d){return "posunúť dopredu"},
"moveForwardTooltip":function(d){return "Presunúť ma jedno pole vpred."},
"moveLeft":function(d){return "posunúť doľava"},
"moveLeftTooltip":function(d){return "Posuň pálku doľava."},
"moveRight":function(d){return "posunúť doprava"},
"moveRightTooltip":function(d){return "Posuň pálku doprava."},
"moveUp":function(d){return "posunúť nahor"},
"moveUpTooltip":function(d){return "Posuň pálku nahor."},
"nextLevel":function(d){return "Gratulujem! Vyriešil si hádanku."},
"no":function(d){return "Nie"},
"noPathAhead":function(d){return "cesta je blokovaná"},
"noPathLeft":function(d){return "žiadna cesta vľavo"},
"noPathRight":function(d){return "žiadna cesta vpravo"},
"numBlocksNeeded":function(d){return "Táto hádanka môže byť vyriešená s %1 blokmi."},
"pathAhead":function(d){return "cesta vpred"},
"pathLeft":function(d){return "ak je cesta vľavo"},
"pathRight":function(d){return "ak je cesta vpravo"},
"pilePresent":function(d){return "tu je hromada"},
"playSoundCrunch":function(d){return "prehrať zvuk chrumnutia"},
"playSoundGoal1":function(d){return "prehraj zvuk gól 1"},
"playSoundGoal2":function(d){return "prehraj zvuk gól 2"},
"playSoundHit":function(d){return "prehraj zvuk úderu"},
"playSoundLosePoint":function(d){return "prehraj zvuk straty bodu"},
"playSoundLosePoint2":function(d){return "prehraj zvuk straty bodu 2"},
"playSoundRetro":function(d){return "prehraj retro zvuk"},
"playSoundRubber":function(d){return "prehraj gumený zvuk"},
"playSoundSlap":function(d){return "prehraj zvuk plesknutia"},
"playSoundTooltip":function(d){return "Prehraj vybraný zvuk."},
"playSoundWinPoint":function(d){return "prehraj so zvukom bodu"},
"playSoundWinPoint2":function(d){return "prehraj so zvukom bodu 2"},
"playSoundWood":function(d){return "prehraj drevený zvuk"},
"putdownTower":function(d){return "daj dole vežu"},
"reinfFeedbackMsg":function(d){return "Pre návrat k svojej hre môžeš stlačiť tlačidlo \"Skúsiť znova\"."},
"removeSquare":function(d){return "odstrániť štvorec"},
"repeatUntil":function(d){return "opakovať dokiaľ"},
"repeatUntilBlocked":function(d){return "pokiaľ je cesta vpred"},
"repeatUntilFinish":function(d){return "opakovať do konca"},
"scoreText":function(d){return "Skóre: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "nastav náhodné pozadie"},
"setBackgroundHardcourt":function(d){return "nastav kurt na pozadie"},
"setBackgroundRetro":function(d){return "nastaviť retro scénu"},
"setBackgroundTooltip":function(d){return "Nastaví obrázok pozadia"},
"setBallRandom":function(d){return "nastaviť náhodnú loptu"},
"setBallHardcourt":function(d){return "nastaviť loptu pre tvrdý povrch"},
"setBallRetro":function(d){return "nastaviť retro loptu"},
"setBallTooltip":function(d){return "Nastaví obraz lopty"},
"setBallSpeedRandom":function(d){return "nastaviť náhodnú rýchlosť lopty"},
"setBallSpeedVerySlow":function(d){return "nastaviť veľmi malú rýchlosť lopty"},
"setBallSpeedSlow":function(d){return "nastaviť malú rýchlosť lopty"},
"setBallSpeedNormal":function(d){return "nastaviť normálnu rýchlosť lopty"},
"setBallSpeedFast":function(d){return "nastaviť veľkú rýchlosť lopty"},
"setBallSpeedVeryFast":function(d){return "nastaviť veľmi veľkú rýchlosť lopty"},
"setBallSpeedTooltip":function(d){return "nastaviť rýchlosť lopty"},
"setPaddleRandom":function(d){return "nastaviť náhodné pádlo"},
"setPaddleHardcourt":function(d){return "nastaviť pádlo pre tvrdý povrch"},
"setPaddleRetro":function(d){return "nastaviť retro pádlo"},
"setPaddleTooltip":function(d){return "Nastaví obraz pádla"},
"setPaddleSpeedRandom":function(d){return "nastaviť náhodnú rýchlosť pádla"},
"setPaddleSpeedVerySlow":function(d){return "nastaviť veľmi pomalú rýchlosť pádla"},
"setPaddleSpeedSlow":function(d){return "nastaviť pomalú rýchlosť pádla"},
"setPaddleSpeedNormal":function(d){return "nastaviť normálnu rýchlosť pádla"},
"setPaddleSpeedFast":function(d){return "nastaviť rýchlu rýchlosť pádla"},
"setPaddleSpeedVeryFast":function(d){return "nastaviť veľmi rýchlu rýchlosť pádla"},
"setPaddleSpeedTooltip":function(d){return "Nastaví rýchlosť pádla"},
"shareBounceTwitter":function(d){return "Pozrite sa na Bounce hru, čo som urobil. Napísal som to sám s @codeorg"},
"shareGame":function(d){return "Zdieľaj svoju hru:"},
"turnLeft":function(d){return "otočiť vľavo"},
"turnRight":function(d){return "otočiť vpravo"},
"turnTooltip":function(d){return "Obráti ma doľava alebo doprava o 90 stupňov."},
"whenBallInGoal":function(d){return "keď loptu je v bránke"},
"whenBallInGoalTooltip":function(d){return "Vykonaj akciu nižšie, keď lopta je v bránke."},
"whenBallMissesPaddle":function(d){return "keď lopta netrafí pádlo"},
"whenBallMissesPaddleTooltip":function(d){return "Vykonať akcie nižšie keď lopta netrafí pádlo."},
"whenDown":function(d){return "keď šípka nadol"},
"whenDownTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky dole."},
"whenGameStarts":function(d){return "keď začne hra"},
"whenGameStartsTooltip":function(d){return "Vykonať akcie uvedené nižšie, keď hra začne."},
"whenLeft":function(d){return "keď šípka vľavo"},
"whenLeftTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vľavo."},
"whenPaddleCollided":function(d){return "keď lopta trafí pádlo"},
"whenPaddleCollidedTooltip":function(d){return "Vykonať akcie nižšie, keď lopta sa trafí pádlo."},
"whenRight":function(d){return "keď šípka vpravo"},
"whenRightTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky vpravo."},
"whenUp":function(d){return "keď šípka nahor"},
"whenUpTooltip":function(d){return "Vykonať akcie nižšie pri stlačení šípky hore."},
"whenWallCollided":function(d){return "keď lopta narazí do steny"},
"whenWallCollidedTooltip":function(d){return "Vykonať akcie nižšie keď lopta trafí stenu."},
"whileMsg":function(d){return "pokiaľ"},
"whileTooltip":function(d){return "Opakujte priložené činnosti dokým dosiahnete cieľový bod."},
"yes":function(d){return "Áno"}};