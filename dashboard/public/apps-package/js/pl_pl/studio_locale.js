var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "postać"},
"alienInvasion":function(d){return "Inwazja obcych!"},
"backgroundBlack":function(d){return "czarny"},
"backgroundCave":function(d){return "jaskinia"},
"backgroundCloudy":function(d){return "pochmurno"},
"backgroundHardcourt":function(d){return "utwardzony kort"},
"backgroundNight":function(d){return "noc"},
"backgroundUnderwater":function(d){return "podwodny"},
"backgroundCity":function(d){return "miasto"},
"backgroundDesert":function(d){return "pustynia"},
"backgroundRainbow":function(d){return "tęcza"},
"backgroundSoccer":function(d){return "piłka nożna"},
"backgroundSpace":function(d){return "przestrzeń"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "zima"},
"catActions":function(d){return "Działania"},
"catControl":function(d){return "Pętle"},
"catEvents":function(d){return "Zdarzenia"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematyka"},
"catProcedures":function(d){return "Funkcje"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Zmienne"},
"changeScoreTooltip":function(d){return "Dodaj lub usuń punkt do/z wyniku."},
"changeScoreTooltipK1":function(d){return "Dodaj punkt do wyniku."},
"continue":function(d){return "Kontynuuj"},
"decrementPlayerScore":function(d){return "usuń punkt"},
"defaultSayText":function(d){return "pisz tutaj"},
"emotion":function(d){return "nastrój"},
"finalLevel":function(d){return "Gratulacje! Rozwiązałeś końcową łamigłówkę."},
"for":function(d){return "dla"},
"hello":function(d){return "cześć"},
"helloWorld":function(d){return "Witaj świecie!"},
"incrementPlayerScore":function(d){return "wynik punktowy"},
"makeProjectileDisappear":function(d){return "zniknij"},
"makeProjectileBounce":function(d){return "odbij się"},
"makeProjectileBlueFireball":function(d){return "utwórz niebieską kulę ognia"},
"makeProjectilePurpleFireball":function(d){return "utwórz fioletową kulę ognia"},
"makeProjectileRedFireball":function(d){return "utwórz czerwoną kulę ognia"},
"makeProjectileYellowHearts":function(d){return "utwórz żółte serca"},
"makeProjectilePurpleHearts":function(d){return "utwórz fioletowe serca"},
"makeProjectileRedHearts":function(d){return "utwórz czerwone serca"},
"makeProjectileTooltip":function(d){return "Spraw by pocisk, który właśnie się zderzył, zniknął lub odbił się."},
"makeYourOwn":function(d){return "Utwórz swoją własną aplikację Play Lab"},
"moveDirectionDown":function(d){return "dół"},
"moveDirectionLeft":function(d){return "lewo"},
"moveDirectionRight":function(d){return "prawo"},
"moveDirectionUp":function(d){return "góra"},
"moveDirectionRandom":function(d){return "losowy"},
"moveDistance25":function(d){return "25 pikseli"},
"moveDistance50":function(d){return "50 pikseli"},
"moveDistance100":function(d){return "100 pikseli"},
"moveDistance200":function(d){return "200 pikseli"},
"moveDistance400":function(d){return "400 pikseli"},
"moveDistancePixels":function(d){return "piksele"},
"moveDistanceRandom":function(d){return "losowe piksele"},
"moveDistanceTooltip":function(d){return "Przesuń postać o określoną odległość w zadanym kierunku."},
"moveSprite":function(d){return "przesuń"},
"moveSpriteN":function(d){return "przenieś postać "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "do x,y"},
"moveDown":function(d){return "przesuń w dół"},
"moveDownTooltip":function(d){return "Przesuń postać w dół."},
"moveLeft":function(d){return "przesuń w lewo"},
"moveLeftTooltip":function(d){return "Przesuń postać w lewo."},
"moveRight":function(d){return "przesuń w prawo"},
"moveRightTooltip":function(d){return "Przesuń postać w prawo."},
"moveUp":function(d){return "przesuń w górę"},
"moveUpTooltip":function(d){return "Przesuń postać w górę."},
"moveTooltip":function(d){return "Przesuń postać."},
"nextLevel":function(d){return "Gratulacje! Ukończyłeś tę łamigłówkę."},
"no":function(d){return "Nie"},
"numBlocksNeeded":function(d){return "Ta łamigłówka może być rozwiązana z użyciem %1 bloków."},
"onEventTooltip":function(d){return "Wykonaj kod w odpowiedzi na wskazane zdarzenie."},
"ouchExclamation":function(d){return "Ojej!"},
"playSoundCrunch":function(d){return "odtwórz dźwięk chrupania"},
"playSoundGoal1":function(d){return "odtwórz dźwięk gola nr 1"},
"playSoundGoal2":function(d){return "odtwórz dźwięk gola nr 2"},
"playSoundHit":function(d){return "odtwórz dźwięk trafienia"},
"playSoundLosePoint":function(d){return "zagraj dźwięk utraty punktu"},
"playSoundLosePoint2":function(d){return "zagraj dźwięk utraty punktu nr 2"},
"playSoundRetro":function(d){return "zagraj dźwięk retro"},
"playSoundRubber":function(d){return "zagraj dźwięk gumy"},
"playSoundSlap":function(d){return "zagraj dźwięk klaśnięcia"},
"playSoundTooltip":function(d){return "Odtwórz wybrany dźwięk."},
"playSoundWinPoint":function(d){return "zagraj dźwięk zdobycia punktu"},
"playSoundWinPoint2":function(d){return "zagraj dźwięk zdobycia punktu nr 2"},
"playSoundWood":function(d){return "zagraj dźwięk drewna"},
"positionOutTopLeft":function(d){return "do powyżej górnej pozycji z lewej"},
"positionOutTopRight":function(d){return "do powyżej górnej pozycji z prawej"},
"positionTopOutLeft":function(d){return "do górnej zewnętrznej pozycji z lewej "},
"positionTopLeft":function(d){return "do górnej pozycji z lewej"},
"positionTopCenter":function(d){return "do górnej pozycji z centrum"},
"positionTopRight":function(d){return "do górnej pozycji z prawej"},
"positionTopOutRight":function(d){return "do górnej pozycji na zewnątrz z prawej"},
"positionMiddleLeft":function(d){return "do środkowej pozycji z lewej"},
"positionMiddleCenter":function(d){return "do środkowej pozycji w centrum"},
"positionMiddleRight":function(d){return "do środkowej pozycji po prawej"},
"positionBottomOutLeft":function(d){return "do dolnej pozycji na zewnątrz z lewej"},
"positionBottomLeft":function(d){return "do dolnej pozycji z lewej"},
"positionBottomCenter":function(d){return "do dolnej pozycji w centrum"},
"positionBottomRight":function(d){return "do dolnej pozycji z prawej"},
"positionBottomOutRight":function(d){return "do dolnej pozycji na zewnątrz z prawej"},
"positionOutBottomLeft":function(d){return "do poniżej dolnej pozycji z lewej"},
"positionOutBottomRight":function(d){return "do poniżej dolnej pozycji z prawej"},
"positionRandom":function(d){return "do losowej pozycji"},
"projectileBlueFireball":function(d){return "niebieska kula ognia"},
"projectilePurpleFireball":function(d){return "purpurowa kula ognia"},
"projectileRedFireball":function(d){return "czerwona kula ognista"},
"projectileYellowHearts":function(d){return "zółte serca"},
"projectilePurpleHearts":function(d){return "fioletowe serca"},
"projectileRedHearts":function(d){return "czerwone serca"},
"projectileRandom":function(d){return "losowy"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "rakieta"},
"projectileRapunzel":function(d){return "patelnia"},
"projectileCherry":function(d){return "wiśnia"},
"projectileIce":function(d){return "lód"},
"projectileDuck":function(d){return "kaczka"},
"reinfFeedbackMsg":function(d){return "Możesz nacisnąć przycisk Spróbuj ponownie, aby powrócić do swojej opowieści."},
"repeatForever":function(d){return "powtarzaj w nieskończoność"},
"repeatDo":function(d){return "wykonaj"},
"repeatForeverTooltip":function(d){return "Wykonuj akcje w tym bloku bez przerwy, dopóki trwa opowieść."},
"saySprite":function(d){return "powiedz"},
"saySpriteN":function(d){return "postać "+studio_locale.v(d,"spriteIndex")+" mówi"},
"saySpriteTooltip":function(d){return "Wyświetl dymek z odpowiednim tekstem od określonej postaci."},
"saySpriteChoices_0":function(d){return "Cześć."},
"saySpriteChoices_1":function(d){return "Witam wszystkich."},
"saySpriteChoices_2":function(d){return "Jak leci?"},
"saySpriteChoices_3":function(d){return "Dzień dobry"},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Dobranoc"},
"saySpriteChoices_6":function(d){return "Dobry wieczór"},
"saySpriteChoices_7":function(d){return "Co nowego?"},
"saySpriteChoices_8":function(d){return "Co?"},
"saySpriteChoices_9":function(d){return "Gdzie?"},
"saySpriteChoices_10":function(d){return "Kiedy?"},
"saySpriteChoices_11":function(d){return "Dobrze."},
"saySpriteChoices_12":function(d){return "Świetnie!"},
"saySpriteChoices_13":function(d){return "W porządku."},
"saySpriteChoices_14":function(d){return "Nieźle."},
"saySpriteChoices_15":function(d){return "Powodzenia."},
"saySpriteChoices_16":function(d){return "Tak"},
"saySpriteChoices_17":function(d){return "Nie"},
"saySpriteChoices_18":function(d){return "OK"},
"saySpriteChoices_19":function(d){return "Dobry rzut!"},
"saySpriteChoices_20":function(d){return "Miłego dnia."},
"saySpriteChoices_21":function(d){return "Na razie."},
"saySpriteChoices_22":function(d){return "Będę z powrotem."},
"saySpriteChoices_23":function(d){return "Do zobaczenia jutro!"},
"saySpriteChoices_24":function(d){return "Do zobaczenia!"},
"saySpriteChoices_25":function(d){return "Trzymaj się!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "Muszę iść."},
"saySpriteChoices_28":function(d){return "Zaprzyjaźnimy się?"},
"saySpriteChoices_29":function(d){return "Świetna robota!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Miło cię poznać."},
"saySpriteChoices_33":function(d){return "W porządku!"},
"saySpriteChoices_34":function(d){return "Dziękujemy"},
"saySpriteChoices_35":function(d){return "Nie, dziękuję"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Nic nie szkodzi"},
"saySpriteChoices_38":function(d){return "Dzisiaj"},
"saySpriteChoices_39":function(d){return "Jutro"},
"saySpriteChoices_40":function(d){return "Wczoraj"},
"saySpriteChoices_41":function(d){return "Znalazłem Cię!"},
"saySpriteChoices_42":function(d){return "Znalazłeś mnie!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Jesteś wielki!"},
"saySpriteChoices_45":function(d){return "Jesteś zabawny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "Jesteś dobrym przyjacielem!"},
"saySpriteChoices_48":function(d){return "Uważaj!"},
"saySpriteChoices_49":function(d){return "Kaczka!"},
"saySpriteChoices_50":function(d){return "Mam cię!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Przepraszam!"},
"saySpriteChoices_53":function(d){return "Ostrożnie!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Ojej!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "Wynik: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "ustaw tło"},
"setBackgroundRandom":function(d){return "ustaw losowe tło"},
"setBackgroundBlack":function(d){return "ustaw czarne tło"},
"setBackgroundCave":function(d){return "ustaw tło jaskini"},
"setBackgroundCloudy":function(d){return "ustaw pochmurne tło"},
"setBackgroundHardcourt":function(d){return "ustaw tło boiska do tenisa"},
"setBackgroundNight":function(d){return "ustaw nocne tło"},
"setBackgroundUnderwater":function(d){return "ustaw tło podwodne"},
"setBackgroundCity":function(d){return "ustaw tło miasta"},
"setBackgroundDesert":function(d){return "ustaw tło pustyni"},
"setBackgroundRainbow":function(d){return "ustaw tło tęczy"},
"setBackgroundSoccer":function(d){return "ustaw tło boiska do piłki nożnej"},
"setBackgroundSpace":function(d){return "ustaw tło kosmosu"},
"setBackgroundTennis":function(d){return "ustaw tło kortu tenisowego"},
"setBackgroundWinter":function(d){return "ustaw tło zimowe"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "ustaw lodowe tłow"},
"setBackgroundSnowy":function(d){return "ustaw śnieżne tło"},
"setBackgroundTooltip":function(d){return "Ustawia obraz w tle"},
"setEnemySpeed":function(d){return "ustaw prędkość wroga"},
"setPlayerSpeed":function(d){return "ustaw prędkość gracza"},
"setScoreText":function(d){return "ustaw wynik"},
"setScoreTextTooltip":function(d){return "Ustawia tekst, który będzie wyświetlany w obszarze wyniku."},
"setSpriteEmotionAngry":function(d){return "na zły nastrój"},
"setSpriteEmotionHappy":function(d){return "na szczęśliwy nastrój"},
"setSpriteEmotionNormal":function(d){return "na normalny nastrój"},
"setSpriteEmotionRandom":function(d){return "na losowy nastrój"},
"setSpriteEmotionSad":function(d){return "na smutny nastrój"},
"setSpriteEmotionTooltip":function(d){return "Ustawia nastój postaci"},
"setSpriteAlien":function(d){return "do obcego obrazka"},
"setSpriteBat":function(d){return "do obrazka nietoperza"},
"setSpriteBird":function(d){return "do obrazka ptaka"},
"setSpriteCat":function(d){return "do obrazka kota"},
"setSpriteCaveBoy":function(d){return "do obrazka chłopca z jaskini"},
"setSpriteCaveGirl":function(d){return "do obrazka dziewczynki z jaskini"},
"setSpriteDinosaur":function(d){return "do obrazka dinozaura"},
"setSpriteDog":function(d){return "do obrazka psa"},
"setSpriteDragon":function(d){return "do obrazka smoka"},
"setSpriteGhost":function(d){return "do obrazka ducha"},
"setSpriteHidden":function(d){return "do ukrytego obrazka"},
"setSpriteHideK1":function(d){return "ukryj"},
"setSpriteAnna":function(d){return "do obrazka Anny"},
"setSpriteElsa":function(d){return "do obrazka Elsy"},
"setSpriteHiro":function(d){return "do obrazka Hira"},
"setSpriteBaymax":function(d){return "do obrazka Baymaxa"},
"setSpriteRapunzel":function(d){return "do obrazka z Roszpunką"},
"setSpriteKnight":function(d){return "do obrazka rycerza"},
"setSpriteMonster":function(d){return "do obrazka potwora"},
"setSpriteNinja":function(d){return "do obrazka zamaskowanego ninja"},
"setSpriteOctopus":function(d){return "do obrazka ośmiornicy"},
"setSpritePenguin":function(d){return "do obrazka pingwina"},
"setSpritePirate":function(d){return "do obrazka pirata"},
"setSpritePrincess":function(d){return "do obrazka księżniczki"},
"setSpriteRandom":function(d){return "do losowego obrazka"},
"setSpriteRobot":function(d){return "do obrazka robota"},
"setSpriteShowK1":function(d){return "pokaż"},
"setSpriteSpacebot":function(d){return "do obrazka spacebota"},
"setSpriteSoccerGirl":function(d){return "do obrazka piłkarki"},
"setSpriteSoccerBoy":function(d){return "do obrazu piłkarza"},
"setSpriteSquirrel":function(d){return "do obrazka wiewiórki"},
"setSpriteTennisGirl":function(d){return "do obrazka tenisistki"},
"setSpriteTennisBoy":function(d){return "do obrazka tenisisty"},
"setSpriteUnicorn":function(d){return "do obrazka jednorożca"},
"setSpriteWitch":function(d){return "do obrazka czarownicy"},
"setSpriteWizard":function(d){return "do obrazka kreatora"},
"setSpritePositionTooltip":function(d){return "Natychmiast przenosi postać do określonej lokalizacji."},
"setSpriteK1Tooltip":function(d){return "Pokazuje lub ukrywa określoną postać ."},
"setSpriteTooltip":function(d){return "Ustawia obrazek postaci"},
"setSpriteSizeRandom":function(d){return "do losowego rozmiaru"},
"setSpriteSizeVerySmall":function(d){return "do bardzo małego rozmiaru"},
"setSpriteSizeSmall":function(d){return "do małego rozmiaru"},
"setSpriteSizeNormal":function(d){return "do normalnego rozmiaru"},
"setSpriteSizeLarge":function(d){return "do dużego rozmiaru"},
"setSpriteSizeVeryLarge":function(d){return "do bardzo dużego rozmiaru"},
"setSpriteSizeTooltip":function(d){return "Ustawia rozmiar postaci"},
"setSpriteSpeedRandom":function(d){return "na losową prędkość"},
"setSpriteSpeedVerySlow":function(d){return "na bardzo wolną prędkość"},
"setSpriteSpeedSlow":function(d){return "na wolną prędkość"},
"setSpriteSpeedNormal":function(d){return "na normalną prędkość"},
"setSpriteSpeedFast":function(d){return "na szybką prędkość"},
"setSpriteSpeedVeryFast":function(d){return "na bardzo szybką prędkość"},
"setSpriteSpeedTooltip":function(d){return "Ustawia prędkość postaci"},
"setSpriteZombie":function(d){return "do obrazka z zombie"},
"shareStudioTwitter":function(d){return "Zapoznaj się z opowieścią, którą wykonałem. Utworzyłem ją sam z @codeorg"},
"shareGame":function(d){return "Udostępnij swoją opowieść:"},
"showCoordinates":function(d){return "pokaż współrzędne"},
"showCoordinatesTooltip":function(d){return "pokaż współrzędne bohatera na ekranie"},
"showTitleScreen":function(d){return "wyświetl ekran tytułowy"},
"showTitleScreenTitle":function(d){return "tytuł"},
"showTitleScreenText":function(d){return "tekst"},
"showTSDefTitle":function(d){return "wpisz tutaj tytuł"},
"showTSDefText":function(d){return "wpisz tutaj tekst"},
"showTitleScreenTooltip":function(d){return "Wyświetl tytułowy ekran i związany z nim tytuł i tekst."},
"size":function(d){return "rozmiar"},
"setSprite":function(d){return "przypisz"},
"setSpriteN":function(d){return "ustaw postać "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "chrzęst"},
"soundGoal1":function(d){return "cel (gol) 1"},
"soundGoal2":function(d){return "cel (gol) 2"},
"soundHit":function(d){return "trafienie (hit)"},
"soundLosePoint":function(d){return "stracić punkt"},
"soundLosePoint2":function(d){return "stracić punkt 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "guma"},
"soundSlap":function(d){return "policzek"},
"soundWinPoint":function(d){return "wygraj punkt"},
"soundWinPoint2":function(d){return "wygraj punkt 2"},
"soundWood":function(d){return "drewno"},
"speed":function(d){return "prędkość"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "zatrzymaj"},
"stopSpriteN":function(d){return "zatrzymaj postać "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Zatrzymuje ruch postaci."},
"throwSprite":function(d){return "rzuć"},
"throwSpriteN":function(d){return "rzut "+studio_locale.v(d,"spriteIndex")+" postaci"},
"throwTooltip":function(d){return "Wyrzuca pocisk z określonej postaci."},
"vanish":function(d){return "znika"},
"vanishActorN":function(d){return "znika postać "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Wymazuje postać."},
"waitFor":function(d){return "czekaj przez"},
"waitSeconds":function(d){return "sekundy"},
"waitForClick":function(d){return "czekaj na kliknięcie"},
"waitForRandom":function(d){return "poczekaj na losowe"},
"waitForHalfSecond":function(d){return "czekaj pół sekundy"},
"waitFor1Second":function(d){return "poczekaj sekundę"},
"waitFor2Seconds":function(d){return "poczekaj 2 sekundy"},
"waitFor5Seconds":function(d){return "poczekaj 5 sekund"},
"waitFor10Seconds":function(d){return "poczekaj 10 sekund"},
"waitParamsTooltip":function(d){return "Czeka określoną liczbę sekund lub stosuje zero, czekając aż nastąpi kliknięcie."},
"waitTooltip":function(d){return "Czeka przez określony czas lub do momentu kliknięcia."},
"whenArrowDown":function(d){return "strzałka w dół"},
"whenArrowLeft":function(d){return "strzałka w lewo"},
"whenArrowRight":function(d){return "strzałka w prawo"},
"whenArrowUp":function(d){return "strzałka w górę"},
"whenArrowTooltip":function(d){return "Wykonaj akcje poniżej, gdy naciśnięty zostaje określony klawisz ze strzałką."},
"whenDown":function(d){return "kiedy strzałka w dół"},
"whenDownTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty zostaje klawisz strzałki w dół."},
"whenGameStarts":function(d){return "gdy opowieść się zaczyna"},
"whenGameStartsTooltip":function(d){return "Wykonaj poniższe czynności, wraz z rozpoczęciem opowieści."},
"whenLeft":function(d){return "kiedy strzałka w lewo"},
"whenLeftTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty zostaje klawisz strzałki w lewo."},
"whenRight":function(d){return "kiedy strzałka w prawo"},
"whenRightTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty zostaje klawisz strzałki w prawo."},
"whenSpriteClicked":function(d){return "gdy postać kliknie"},
"whenSpriteClickedN":function(d){return "gdy postać "+studio_locale.v(d,"spriteIndex")+" kliknie"},
"whenSpriteClickedTooltip":function(d){return "Wykonaj czynności poniżej po kliknięciu na postaci."},
"whenSpriteCollidedN":function(d){return "kiedy postać "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Wykonaj poniższe akcje, gdy postać dotknie inną postać."},
"whenSpriteCollidedWith":function(d){return "dotyka"},
"whenSpriteCollidedWithAnyActor":function(d){return "dotyka kogoś innego"},
"whenSpriteCollidedWithAnyEdge":function(d){return "dotyka jakiejś krawędzi"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "dotyka jakiegoś pocisku"},
"whenSpriteCollidedWithAnything":function(d){return "dotyka czegoś"},
"whenSpriteCollidedWithN":function(d){return "dotyka postaci "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "dotyka niebieskiej kuli ognia"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "dotyka fioletowej kuli ognia"},
"whenSpriteCollidedWithRedFireball":function(d){return "dotyka czerwonej kuli ognia"},
"whenSpriteCollidedWithYellowHearts":function(d){return "dotyka żółtych serc"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "dotyka fioletowych serc"},
"whenSpriteCollidedWithRedHearts":function(d){return "dotyka czerwonych serc"},
"whenSpriteCollidedWithBottomEdge":function(d){return "dotyka dolnej krawędzi"},
"whenSpriteCollidedWithLeftEdge":function(d){return "dotyka lewej krawędzi"},
"whenSpriteCollidedWithRightEdge":function(d){return "dotyka prawej krawędzi"},
"whenSpriteCollidedWithTopEdge":function(d){return "dotyka górnej krawędzi"},
"whenUp":function(d){return "kiedy strzałka w górę"},
"whenUpTooltip":function(d){return "Wykonaj poniższe czynności, gdy naciśnięty zostaje klawisz strzałki w górę."},
"yes":function(d){return "Tak"}};