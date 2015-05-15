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
"continue":function(d){return "Kontynuuj"},
"doCode":function(d){return "wykonaj"},
"elseCode":function(d){return "w przeciwnym razie"},
"endGame":function(d){return "zakończ grę"},
"endGameTooltip":function(d){return "Kończy grę."},
"finalLevel":function(d){return "Gratulacje! Rozwiązałeś końcową łamigłówkę."},
"flap":function(d){return "pofruń"},
"flapRandom":function(d){return "pofruń na losową wysokość"},
"flapVerySmall":function(d){return "pofruń na bardzo małą wysokość"},
"flapSmall":function(d){return "pofruń na małą wysokość"},
"flapNormal":function(d){return "pofruń na normalną wysokość"},
"flapLarge":function(d){return "pofruń na dużą wysokość"},
"flapVeryLarge":function(d){return "pofruń na bardzo dużą wysokość"},
"flapTooltip":function(d){return "Fruń Flappy do góry."},
"flappySpecificFail":function(d){return "Twój kod wygląda naprawdę dobrze - latać możesz za pomocą kliknięcia. Pamiętaj, że aby utrzymać się w powietrzu, musisz kliknąć wiele razy."},
"incrementPlayerScore":function(d){return "zdobywasz punkt"},
"incrementPlayerScoreTooltip":function(d){return "Dodaj jeden do bieżącego wyniku gracza."},
"nextLevel":function(d){return "Gratulacje! Ukończyłeś tę łamigłówkę."},
"no":function(d){return "Nie"},
"numBlocksNeeded":function(d){return "Ta łamigłówka może być rozwiązana z użyciem %1 bloków."},
"playSoundRandom":function(d){return "zagraj losowy dźwięk"},
"playSoundBounce":function(d){return "zagraj dźwięk odbicia"},
"playSoundCrunch":function(d){return "zagraj dźwięk chrupania"},
"playSoundDie":function(d){return "zagraj smutny dźwięk"},
"playSoundHit":function(d){return "zagraj dźwięk uderzenia"},
"playSoundPoint":function(d){return "zagraj dźwięk punktowy"},
"playSoundSwoosh":function(d){return "zagraj dźwięk szumu"},
"playSoundWing":function(d){return "zagraj dźwięk trzepotania skrzydeł"},
"playSoundJet":function(d){return "zagraj dźwięk odrzutu"},
"playSoundCrash":function(d){return "zagraj dźwięk zderzenia"},
"playSoundJingle":function(d){return "zagraj dźwięk dzwonka"},
"playSoundSplash":function(d){return "zagraj dźwięk plusku"},
"playSoundLaser":function(d){return "zagraj dźwięk lasera"},
"playSoundTooltip":function(d){return "Zagraj wybrany dźwięk."},
"reinfFeedbackMsg":function(d){return "Możesz nacisnąć przycisk Spróbuj ponownie, aby powrócić do swojej gry."},
"scoreText":function(d){return "Wynik: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ustaw scenę"},
"setBackgroundRandom":function(d){return "ustaw scenę losową"},
"setBackgroundFlappy":function(d){return "ustaw scenę miasto (dzień)"},
"setBackgroundNight":function(d){return "ustaw scenę miasto (noc)"},
"setBackgroundSciFi":function(d){return "ustaw scenę Fantastyki"},
"setBackgroundUnderwater":function(d){return "ustaw scenę podwodną"},
"setBackgroundCave":function(d){return "ustaw scenę w jaskini"},
"setBackgroundSanta":function(d){return "ustaw scenę z Mikołajem"},
"setBackgroundTooltip":function(d){return "Ustawia obraz w tle"},
"setGapRandom":function(d){return "ustaw losową szczelinę"},
"setGapVerySmall":function(d){return "ustaw bardzo małą szczelinę"},
"setGapSmall":function(d){return "ustaw małą szczelinę"},
"setGapNormal":function(d){return "ustaw normalną szczelinę"},
"setGapLarge":function(d){return "ustaw dużą szczelinę"},
"setGapVeryLarge":function(d){return "ustaw bardzo dużą szczelinę"},
"setGapHeightTooltip":function(d){return "Ustawia pionową szczelinę w przeszkodzie"},
"setGravityRandom":function(d){return "ustaw losowe przyciąganie"},
"setGravityVeryLow":function(d){return "ustaw bardzo małe przyciąganie"},
"setGravityLow":function(d){return "ustaw małe przyciąganie"},
"setGravityNormal":function(d){return "ustaw normalne przyciąganie"},
"setGravityHigh":function(d){return "ustaw duże przyciąganie"},
"setGravityVeryHigh":function(d){return "ustaw bardzo duże przyciąganie"},
"setGravityTooltip":function(d){return "Ustawia poziom przyciągania"},
"setGround":function(d){return "ustaw podłoże"},
"setGroundRandom":function(d){return "ustaw losowe podłoże"},
"setGroundFlappy":function(d){return "ustaw podłoże Ziemia"},
"setGroundSciFi":function(d){return "ustaw podłoże Fantatyka"},
"setGroundUnderwater":function(d){return "ustaw podłoże Pod wodą"},
"setGroundCave":function(d){return "ustaw podłoże Jaskinia"},
"setGroundSanta":function(d){return "ustaw podłoże Święty Mikołaj"},
"setGroundLava":function(d){return "ustaw podłoże Lawa"},
"setGroundTooltip":function(d){return "Ustawia obrazek tła"},
"setObstacle":function(d){return "ustaw przeszkodę"},
"setObstacleRandom":function(d){return "ustaw losową przeszkodę"},
"setObstacleFlappy":function(d){return "ustaw przeszkodę Rura"},
"setObstacleSciFi":function(d){return "ustaw przeszkodę Fantastyka"},
"setObstacleUnderwater":function(d){return "ustaw przeszkodę Roślina"},
"setObstacleCave":function(d){return "ustaw przeszkodę Jaskina"},
"setObstacleSanta":function(d){return "ustaw przeszkodę Kominek"},
"setObstacleLaser":function(d){return "ustaw przeszkodę Laser"},
"setObstacleTooltip":function(d){return "Ustawia obraz przeszkody"},
"setPlayer":function(d){return "ustaw  gracza"},
"setPlayerRandom":function(d){return "ustaw losowego gracza"},
"setPlayerFlappy":function(d){return "ustaw gracza Żółty Ptak"},
"setPlayerRedBird":function(d){return "ustaw gracza Czerwony Ptak"},
"setPlayerSciFi":function(d){return "ustaw gracza Statek Kosmiczny"},
"setPlayerUnderwater":function(d){return "ustaw gracza Ryba"},
"setPlayerCave":function(d){return "ustaw gracza Nietoperz"},
"setPlayerSanta":function(d){return "ustaw gracza Mikołaj"},
"setPlayerShark":function(d){return "ustaw gracza Rekin"},
"setPlayerEaster":function(d){return "ustaw gracza Królik Wielkanocny"},
"setPlayerBatman":function(d){return "ustaw gracza Nietoperz"},
"setPlayerSubmarine":function(d){return "ustaw gracza Okręt Podwodny"},
"setPlayerUnicorn":function(d){return "ustaw gracza Jednorożec"},
"setPlayerFairy":function(d){return "ustaw gracza Wróżka"},
"setPlayerSuperman":function(d){return "ustaw gracza Flappy"},
"setPlayerTurkey":function(d){return "ustaw gracza Indyk"},
"setPlayerTooltip":function(d){return "Ustawia obrazek gracza"},
"setScore":function(d){return "ustaw wynik"},
"setScoreTooltip":function(d){return "Ustawia wynik gracza"},
"setSpeed":function(d){return "ustaw prędkości"},
"setSpeedTooltip":function(d){return "Ustawia prędkość poziomu"},
"shareFlappyTwitter":function(d){return "Sprawdź grę Flappy, którą wykonałem. Napisałem ją samodzielnie korzystając z @codeorg"},
"shareGame":function(d){return "Udostępnij swoją grę:"},
"soundRandom":function(d){return "losowy"},
"soundBounce":function(d){return "odbicie"},
"soundCrunch":function(d){return "chrzęst"},
"soundDie":function(d){return "smutny"},
"soundHit":function(d){return "zgnieć"},
"soundPoint":function(d){return "punkt"},
"soundSwoosh":function(d){return "szum"},
"soundWing":function(d){return "skrzydło"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "wypadek"},
"soundJingle":function(d){return "brzęk"},
"soundSplash":function(d){return "plusk"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "ustaw prędkość losową"},
"speedVerySlow":function(d){return "ustaw prędkość bardzo wolną "},
"speedSlow":function(d){return "ustaw prędkość małą "},
"speedNormal":function(d){return "ustaw prędkość normalną"},
"speedFast":function(d){return "ustaw prędkość szybką"},
"speedVeryFast":function(d){return "ustaw prędkość bardzo szybką"},
"whenClick":function(d){return "po kliknięciu"},
"whenClickTooltip":function(d){return "Wykonaj czynności poniżej po kliknięciu."},
"whenCollideGround":function(d){return "kiedy spadnie na ziemię"},
"whenCollideGroundTooltip":function(d){return "Wykonaj czynności poniżej, kiedy Flappy spadnie na ziemię."},
"whenCollideObstacle":function(d){return "kiedy uderzy w przeszkodę"},
"whenCollideObstacleTooltip":function(d){return "Wykonaj czynności poniżej, kiedy Flappy uderzy w przeszkodę."},
"whenEnterObstacle":function(d){return "kiedy minie przeszkodę"},
"whenEnterObstacleTooltip":function(d){return "Wykonaj czynności poniżej, kiedy Flappy wejdzie do przeszkody."},
"whenRunButtonClick":function(d){return "gdy gra się zaczyna"},
"whenRunButtonClickTooltip":function(d){return "Wykonaj czynności poniżej, kiedy gra się zaczyna."},
"yes":function(d){return "Tak"}};