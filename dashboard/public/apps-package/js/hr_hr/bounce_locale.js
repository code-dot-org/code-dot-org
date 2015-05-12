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
"bounceBall":function(d){return "odbijanje loptice"},
"bounceBallTooltip":function(d){return "Odbijanje loptice od objekta."},
"continue":function(d){return "Nastavi"},
"dirE":function(d){return "Istok"},
"dirN":function(d){return "Sjever"},
"dirS":function(d){return "Jug"},
"dirW":function(d){return "Zapad"},
"doCode":function(d){return "napravi"},
"elseCode":function(d){return "inače"},
"finalLevel":function(d){return "Čestitamo ! Riješili ste posljednji zadatak."},
"heightParameter":function(d){return "visina"},
"ifCode":function(d){return "ako"},
"ifPathAhead":function(d){return "ako je put ispred"},
"ifTooltip":function(d){return "Ako staza ide u zadanom smjeru, onda napravi zadane radnje."},
"ifelseTooltip":function(d){return "Ako staza vodi u zadanom smjeru, onda napravi prvi grupu radnji, a inače napravi drugu grupu radnji."},
"incrementOpponentScore":function(d){return "dodaj bod protivniku"},
"incrementOpponentScoreTooltip":function(d){return "Dodaj jedan protivničkim bodovima."},
"incrementPlayerScore":function(d){return "dodaj bod"},
"incrementPlayerScoreTooltip":function(d){return "Povećava trenutni broj bodova za jedan."},
"isWall":function(d){return "jeli ovo zid"},
"isWallTooltip":function(d){return "Vraća \"točno\" ako je ovdje zid"},
"launchBall":function(d){return "ubaci novu loptu"},
"launchBallTooltip":function(d){return "Ubacuje loptu u igru."},
"makeYourOwn":function(d){return "Napravi svoju vlastitu igru Odbijanca"},
"moveDown":function(d){return "pomakni dolje"},
"moveDownTooltip":function(d){return "Pomakni reket dolje."},
"moveForward":function(d){return "idi naprijed"},
"moveForwardTooltip":function(d){return "Pomakni me naprijed za jedno polje."},
"moveLeft":function(d){return "pomakni lijevo"},
"moveLeftTooltip":function(d){return "Pomakni reket u lijevo."},
"moveRight":function(d){return "pomakni desno"},
"moveRightTooltip":function(d){return "Pomakni reket u desno."},
"moveUp":function(d){return "pomakni gore"},
"moveUpTooltip":function(d){return "Pomakni reket gore."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"noPathAhead":function(d){return "na stazi je prepreka"},
"noPathLeft":function(d){return "s lijeve strane nema staze"},
"noPathRight":function(d){return "s desne strane nema staze"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti s %1 blokova."},
"pathAhead":function(d){return "staza je ispred"},
"pathLeft":function(d){return "ako postoji staza s lijeve strane"},
"pathRight":function(d){return "ako postoji staza s desne strane"},
"pilePresent":function(d){return "ovdje je gomila"},
"playSoundCrunch":function(d){return "pokreni zvuk krckanja"},
"playSoundGoal1":function(d){return "pokreni zvuk cilj 1"},
"playSoundGoal2":function(d){return "pokreni zvuk cilj 2"},
"playSoundHit":function(d){return "pokreni zvuk udara"},
"playSoundLosePoint":function(d){return "pokreni zvuk gubitak boda"},
"playSoundLosePoint2":function(d){return "pokreni zvuk izgubljen bod 2"},
"playSoundRetro":function(d){return "pokreni retro zvuk"},
"playSoundRubber":function(d){return "pokreni zvuk gume"},
"playSoundSlap":function(d){return "pokreni zvuk pljeska"},
"playSoundTooltip":function(d){return "Pušta odrabrani zvuk."},
"playSoundWinPoint":function(d){return "pokreni zvuk dobiveni bod"},
"playSoundWinPoint2":function(d){return "pokreni zvuk dobiven bod 2"},
"playSoundWood":function(d){return "pokreni zvuk drvo"},
"putdownTower":function(d){return "spusti kulu"},
"reinfFeedbackMsg":function(d){return "Pritisni tipku \"Pokušaj ponovno\" da se vratiš na igru."},
"removeSquare":function(d){return "ukloni kvadrat"},
"repeatUntil":function(d){return "ponavljaj dok ne bude"},
"repeatUntilBlocked":function(d){return "dok je put ispred"},
"repeatUntilFinish":function(d){return "ponavljaj dok ne završiš"},
"scoreText":function(d){return "Bodovi: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "postavi nasumičnu scenu"},
"setBackgroundHardcourt":function(d){return "postavi scenu s tvrdom podlogom"},
"setBackgroundRetro":function(d){return "postavi retro scenu"},
"setBackgroundTooltip":function(d){return "Postavlja sliku pozadine"},
"setBallRandom":function(d){return "postavi nasumično odabranu loptu"},
"setBallHardcourt":function(d){return "postavi tvrdu loptu"},
"setBallRetro":function(d){return "postavi retro loptu"},
"setBallTooltip":function(d){return "Postavlja sliku lopte"},
"setBallSpeedRandom":function(d){return "postavi nasumično odabranu brzinu lopte"},
"setBallSpeedVerySlow":function(d){return "postavi vrlo malu brzinu lopte"},
"setBallSpeedSlow":function(d){return "postavi malu brzinu lopte"},
"setBallSpeedNormal":function(d){return "postavi normalnu brzinu lopte"},
"setBallSpeedFast":function(d){return "postavi veliku brzinu lopte"},
"setBallSpeedVeryFast":function(d){return "postavi vrlo veliku brzinu lopte"},
"setBallSpeedTooltip":function(d){return "Postavlja brzinu lopte"},
"setPaddleRandom":function(d){return "postavi nasumično odabran reket"},
"setPaddleHardcourt":function(d){return "postavi tvrdi reket"},
"setPaddleRetro":function(d){return "postavi retro reket"},
"setPaddleTooltip":function(d){return "Postavlja sliku reketa"},
"setPaddleSpeedRandom":function(d){return "postavi nasumično odabranu brzinu reketa"},
"setPaddleSpeedVerySlow":function(d){return "postavi vrlo sporu brzinu reketa"},
"setPaddleSpeedSlow":function(d){return "postavi sporu brzinu reketa"},
"setPaddleSpeedNormal":function(d){return "postavi normalnu brzinu reketa"},
"setPaddleSpeedFast":function(d){return "postavi veliku brzinu reketa"},
"setPaddleSpeedVeryFast":function(d){return "postavi vrlo veliku brzinu reketa"},
"setPaddleSpeedTooltip":function(d){return "Postavlja brzinu reketa"},
"shareBounceTwitter":function(d){return "Pogledaj igru Odskakanja koju sam napravio sam uz pomoć @codeorg"},
"shareGame":function(d){return "Podijeli svoju igru:"},
"turnLeft":function(d){return "okreni ulijevo"},
"turnRight":function(d){return "okreni udesno"},
"turnTooltip":function(d){return "Okreće me ulijevo ili udesno za 90 stupnjeva."},
"whenBallInGoal":function(d){return "kada je lopta u golu"},
"whenBallInGoalTooltip":function(d){return "Kad lopta uđe u gol, izvršava dolje navedene akcije."},
"whenBallMissesPaddle":function(d){return "kada lopta promaši reket"},
"whenBallMissesPaddleTooltip":function(d){return "Kad lopta promaši reket, izvršava dolje navedene akcije."},
"whenDown":function(d){return "kad strelica dolje"},
"whenDownTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne tipka dolje."},
"whenGameStarts":function(d){return "na početku igre"},
"whenGameStartsTooltip":function(d){return "Izvršava dolje navedene radnje na početku igre."},
"whenLeft":function(d){return "kad lijeva strelica"},
"whenLeftTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne lijeva strelica."},
"whenPaddleCollided":function(d){return "kada lopta pogodi reket"},
"whenPaddleCollidedTooltip":function(d){return "Kad lopta pogodi reket, izvršava dolje navedene akcije."},
"whenRight":function(d){return "kad desna strelica"},
"whenRightTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne desna strelica."},
"whenUp":function(d){return "kad strelica gore"},
"whenUpTooltip":function(d){return "Izvrši sljedeće akcije kad se pritisne strelica gore."},
"whenWallCollided":function(d){return "kada lopta pogodi zid"},
"whenWallCollidedTooltip":function(d){return "Kad lopta udari u zid, izvršava dolje navedene akcije."},
"whileMsg":function(d){return "dok"},
"whileTooltip":function(d){return "Ponavlja umetnute radnje dok se ne dosegne zadani cilj."},
"yes":function(d){return "Da"}};