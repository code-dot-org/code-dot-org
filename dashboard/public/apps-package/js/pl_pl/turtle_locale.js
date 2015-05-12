var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Użyte bloki: %1"},
"branches":function(d){return "rozgałęzienia"},
"catColour":function(d){return "Kolor"},
"catControl":function(d){return "Pętle"},
"catMath":function(d){return "Matematyka"},
"catProcedures":function(d){return "Funkcje"},
"catTurtle":function(d){return "Działania"},
"catVariables":function(d){return "Zmienne"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Zmienia kolor ołówka."},
"createACircle":function(d){return "utwórz okrąg"},
"createSnowflakeSquare":function(d){return "utwórz śnieżynkę typu kwadrat"},
"createSnowflakeParallelogram":function(d){return "utwórz śnieżynkę typu równoległobok"},
"createSnowflakeLine":function(d){return "utwórz śnieżynkę typu linia"},
"createSnowflakeSpiral":function(d){return "utwórz śnieżynkę typu spirala"},
"createSnowflakeFlower":function(d){return "utwórz śnieżynkę typu kwiat"},
"createSnowflakeFractal":function(d){return "utwórz śnieżynkę typu fraktal"},
"createSnowflakeRandom":function(d){return "utwórz śnieżynkę losowego typu"},
"createASnowflakeBranch":function(d){return "utwórz gałąź śnieżynki"},
"degrees":function(d){return "stopnie"},
"depth":function(d){return "głębokość"},
"dots":function(d){return "piksele"},
"drawASquare":function(d){return "narysuj kwadrat"},
"drawATriangle":function(d){return "narysuj trójkąt"},
"drawACircle":function(d){return "narysuj okrąg"},
"drawAFlower":function(d){return "narysuj kwiatka"},
"drawAHexagon":function(d){return "narysuj sześciokąt"},
"drawAHouse":function(d){return "narysuj dom"},
"drawAPlanet":function(d){return "narysuj planetę"},
"drawARhombus":function(d){return "narysuj romb"},
"drawARobot":function(d){return "narysuj robota"},
"drawARocket":function(d){return "narysuj rakietę"},
"drawASnowflake":function(d){return "narysuj płatek śniegu"},
"drawASnowman":function(d){return "narysuj bałwana"},
"drawAStar":function(d){return "narysuj gwiazdę"},
"drawATree":function(d){return "narysuj drzewo"},
"drawUpperWave":function(d){return "narysuj górna falę"},
"drawLowerWave":function(d){return "narysuj dolną falę"},
"drawStamp":function(d){return "narysuj stempel"},
"heightParameter":function(d){return "wysokość"},
"hideTurtle":function(d){return "ukryj artystę"},
"jump":function(d){return "skocz"},
"jumpBackward":function(d){return "skocz do tyłu o"},
"jumpForward":function(d){return "skocz do przodu o"},
"jumpTooltip":function(d){return "Przenosi artystę nie zostawiając żadnych śladów."},
"jumpEastTooltip":function(d){return "Przenosi artystę na wschód bez zostawiania śladów."},
"jumpNorthTooltip":function(d){return "Przenosi artystę na północ bez zostawiania śladów."},
"jumpSouthTooltip":function(d){return "Przenosi artystę na południe bez zostawiania śladów."},
"jumpWestTooltip":function(d){return "Przenosi artystę na zachód bez zostawiania śladów."},
"lengthFeedback":function(d){return "Zrobiłeś dobrze z wyjątkiem długości."},
"lengthParameter":function(d){return "długość"},
"loopVariable":function(d){return "licznik"},
"moveBackward":function(d){return "przesuń do tyłu o"},
"moveEastTooltip":function(d){return "Przenosi artystę na wschód."},
"moveForward":function(d){return "przesuń do przodu o"},
"moveForwardTooltip":function(d){return "Przenosi artystę do przodu."},
"moveNorthTooltip":function(d){return "Przenosi artystę na północ."},
"moveSouthTooltip":function(d){return "Przenosi artystę na południe."},
"moveWestTooltip":function(d){return "Przenosi artystę na zachód."},
"moveTooltip":function(d){return "Przenosi artystę do przodu lub do tyłu o określoną wielkość."},
"notBlackColour":function(d){return "Musisz ustalić kolor dla tej układanki inny niż czarny."},
"numBlocksNeeded":function(d){return "Ta łamigłówka może być rozwiązana przy użyciu %1 bloków. Ty użyłeś %2."},
"penDown":function(d){return "opuść ołówek"},
"penTooltip":function(d){return "Podnosi lub opuszcza ołówek, by zakończyć lub rozpocząć rysowanie."},
"penUp":function(d){return "podnieś ołówek"},
"reinfFeedbackMsg":function(d){return "Oto Twój rysunek! Pracuj nad nim dalej lub przejdź do następnej łamigłówki."},
"setColour":function(d){return "ustaw kolor"},
"setPattern":function(d){return "ustaw wzór "},
"setWidth":function(d){return "ustaw szerokość"},
"shareDrawing":function(d){return "Udostępnij swój rysunek:"},
"showMe":function(d){return "Pokaż mi"},
"showTurtle":function(d){return "pokaż artystę"},
"sizeParameter":function(d){return "rozmiar"},
"step":function(d){return "krok"},
"tooFewColours":function(d){return "Musisz użyć co najmniej %1 różnych kolorów w tej łamigłówce. Ty użyłeś jedynie %2."},
"turnLeft":function(d){return "obróć w lewo o"},
"turnRight":function(d){return "obróć w prawo o"},
"turnRightTooltip":function(d){return "Obraca artystę w prawo o określony kąt."},
"turnTooltip":function(d){return "Obraca artystę w lewo lub prawo o określoną liczbę stopni."},
"turtleVisibilityTooltip":function(d){return "Artysta staje się widoczny lub niewidoczny."},
"widthTooltip":function(d){return "Zmienia grubość ołówka."},
"wrongColour":function(d){return "Twój obrazek ma nieodpowiedni kolor. W tej łamigłówce musi to być %1."}};