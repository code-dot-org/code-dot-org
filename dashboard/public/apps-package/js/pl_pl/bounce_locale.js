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
"bounceBall":function(d){return "odbij piłkę"},
"bounceBallTooltip":function(d){return "Odbij piłkę od obiektu."},
"continue":function(d){return "Kontynuuj"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "wykonaj"},
"elseCode":function(d){return "w przeciwnym razie"},
"finalLevel":function(d){return "Gratulacje! Rozwiązałeś końcową łamigłówkę."},
"heightParameter":function(d){return "wysokość"},
"ifCode":function(d){return "jeśli"},
"ifPathAhead":function(d){return "jeśli jest ścieżka do przodu"},
"ifTooltip":function(d){return "Jeśli jest ścieżka w określonym kierunku, to wykonaj pewne działania."},
"ifelseTooltip":function(d){return "Jeśli jest ścieżka w określonym kierunku, to wykonaj pierwszy blok działań. W przeciwnym razie, wykonaj drugi blok działań."},
"incrementOpponentScore":function(d){return "punkt dla przeciwnika"},
"incrementOpponentScoreTooltip":function(d){return "Dodaj jeden do bieżącego wyniku przeciwnika."},
"incrementPlayerScore":function(d){return "punkt wyniku"},
"incrementPlayerScoreTooltip":function(d){return "Dodać jeden do bieżącego wyniku gracza."},
"isWall":function(d){return "czy to jest ściana"},
"isWallTooltip":function(d){return "Zwraca prawdę, jeżeli tutaj jest ściana"},
"launchBall":function(d){return "weź nową piłkę"},
"launchBallTooltip":function(d){return "Weź piłkę do gry."},
"makeYourOwn":function(d){return "Utwórz własną grę w Odbijanie"},
"moveDown":function(d){return "przesuń w dół"},
"moveDownTooltip":function(d){return "Przesuń paletkę w dół."},
"moveForward":function(d){return "idź do przodu"},
"moveForwardTooltip":function(d){return "Przenieś mnie do przodu o jedno miejsce."},
"moveLeft":function(d){return "idź w lewo"},
"moveLeftTooltip":function(d){return "Przesuń paletkę w lewo."},
"moveRight":function(d){return "idź w prawo"},
"moveRightTooltip":function(d){return "Przesuń paletkę w prawo."},
"moveUp":function(d){return "przesuń w górę"},
"moveUpTooltip":function(d){return "Przesuń paletkę w górę."},
"nextLevel":function(d){return "Gratulacje! Ukończyłeś tę zagadkę."},
"no":function(d){return "Nie"},
"noPathAhead":function(d){return "ścieżka jest zablokowana"},
"noPathLeft":function(d){return "nie ma ścieżki w lewo"},
"noPathRight":function(d){return "nie ma ścieżki w prawo"},
"numBlocksNeeded":function(d){return "Ta zagadka może być rozwiązana z użyciem %1 bloków."},
"pathAhead":function(d){return "ścieżka do przodu"},
"pathLeft":function(d){return "jeśli jest ścieżka w lewo"},
"pathRight":function(d){return "jeśli jest ścieżka w prawo"},
"pilePresent":function(d){return "jest tam sterta"},
"playSoundCrunch":function(d){return "zagraj dźwięk chrupania"},
"playSoundGoal1":function(d){return "zagraj dźwięk gola nr 1"},
"playSoundGoal2":function(d){return "zagraj dźwięk gola nr 2"},
"playSoundHit":function(d){return "zagraj dźwięk trafienia"},
"playSoundLosePoint":function(d){return "zagraj dźwięk utraty punktu"},
"playSoundLosePoint2":function(d){return "zagraj dźwięk utraty punktu nr 2"},
"playSoundRetro":function(d){return "zagraj dźwięk retro"},
"playSoundRubber":function(d){return "zagraj dźwięk gumy"},
"playSoundSlap":function(d){return "zagraj klaśnięcie"},
"playSoundTooltip":function(d){return "Zagraj wybrany dźwięk."},
"playSoundWinPoint":function(d){return "zagraj dźwięk zdobycia punktu"},
"playSoundWinPoint2":function(d){return "zagraj dźwięk zdobycia punktu 2"},
"playSoundWood":function(d){return "zagraj dźwięk drewniany"},
"putdownTower":function(d){return "postaw wieżę"},
"reinfFeedbackMsg":function(d){return "Możesz nacisnąć przycisk Spróbuj ponownie, aby powrócić do swojej gry."},
"removeSquare":function(d){return "usuń kwadrat"},
"repeatUntil":function(d){return "powtarzaj aż"},
"repeatUntilBlocked":function(d){return "dopóki jest ścieżka do przodu"},
"repeatUntilFinish":function(d){return "powtarzaj, aż będzie koniec"},
"scoreText":function(d){return "Wynik: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "ustaw losową scenę"},
"setBackgroundHardcourt":function(d){return "ustaw boisko do tenisa"},
"setBackgroundRetro":function(d){return "ustaw scenę retro"},
"setBackgroundTooltip":function(d){return "Ustawia obraz w tle"},
"setBallRandom":function(d){return "ustaw losową piłkę"},
"setBallHardcourt":function(d){return "ustaw piłkę do tenisa"},
"setBallRetro":function(d){return "ustaw piłkę retro"},
"setBallTooltip":function(d){return "Ustawia obraz piłki"},
"setBallSpeedRandom":function(d){return "ustaw losową prędkość piłki"},
"setBallSpeedVerySlow":function(d){return "ustaw bardzo wolną prędkość piłki"},
"setBallSpeedSlow":function(d){return "ustaw wolną prędkość piłki"},
"setBallSpeedNormal":function(d){return "ustaw normalną prędkość piłki"},
"setBallSpeedFast":function(d){return "ustaw szybką prędkość piłki"},
"setBallSpeedVeryFast":function(d){return "ustaw bardzo szybką prędkość piłki"},
"setBallSpeedTooltip":function(d){return "Ustawia prędkość piłki"},
"setPaddleRandom":function(d){return "ustaw losową paletkę"},
"setPaddleHardcourt":function(d){return "ustaw paletkę do tenisa"},
"setPaddleRetro":function(d){return "ustaw paletkę retro"},
"setPaddleTooltip":function(d){return "Ustawia obraz paletki"},
"setPaddleSpeedRandom":function(d){return "ustaw losową prędkość paletki"},
"setPaddleSpeedVerySlow":function(d){return "ustaw bardzo wolną prędkość paletki"},
"setPaddleSpeedSlow":function(d){return "ustaw wolną prędkość paletki"},
"setPaddleSpeedNormal":function(d){return "ustaw normalną prędkość paletki"},
"setPaddleSpeedFast":function(d){return "ustaw szybką prędkość paletki"},
"setPaddleSpeedVeryFast":function(d){return "ustaw bardzo szybką prędkość paletki"},
"setPaddleSpeedTooltip":function(d){return "Ustawia prędkość paletki"},
"shareBounceTwitter":function(d){return "Sprawdź grę w Odbijanie, którą utworzyłem. Napisałem ją samodzielnie z użyciem @codeorg"},
"shareGame":function(d){return "Podziel się swoją grą:"},
"turnLeft":function(d){return "skręć w lewo"},
"turnRight":function(d){return "skręć w prawo"},
"turnTooltip":function(d){return "Obraca mnie w lewo lub w prawo o 90 stopni."},
"whenBallInGoal":function(d){return "kiedy piłka jest w bramce"},
"whenBallInGoalTooltip":function(d){return "Wykonaj działania poniżej, kiedy piłka wpadnie do bramki."},
"whenBallMissesPaddle":function(d){return "kiedy piłka omija paletkę"},
"whenBallMissesPaddleTooltip":function(d){return "Wykonaj akcje poniżej, kiedy piłka omija paletkę."},
"whenDown":function(d){return "gdy strzałka w dół"},
"whenDownTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty jest klawisz strzałki w dół."},
"whenGameStarts":function(d){return "kiedy gra się zacznie"},
"whenGameStartsTooltip":function(d){return "Wykonaj czynności poniżej, kiedy rozpocznie się gra."},
"whenLeft":function(d){return "gdy strzałka w lewo"},
"whenLeftTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty jest klawisz strzałki w lewo."},
"whenPaddleCollided":function(d){return "kiedy piłka uderza w paletkę"},
"whenPaddleCollidedTooltip":function(d){return "Wykonaj poniższe czynności, gdy piłka zderza się z paletką."},
"whenRight":function(d){return "gdy strzałka w prawo"},
"whenRightTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty jest klawisz strzałki w prawo."},
"whenUp":function(d){return "gdy strzałka w górę"},
"whenUpTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty jest klawisz strzałki w górę."},
"whenWallCollided":function(d){return "kiedy piłka uderza w ścianę"},
"whenWallCollidedTooltip":function(d){return "Wykonaj poniższe czynności, gdy piłka uderza w ścianę."},
"whileMsg":function(d){return "dopóki"},
"whileTooltip":function(d){return "Powtarzaj załączone czynności, aż do osiągnięcia końca."},
"yes":function(d){return "Tak"}};