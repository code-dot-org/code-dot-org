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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Število uporabljenih blokov: %1"},
"branches":function(d){return "veje"},
"catColour":function(d){return "Barva"},
"catControl":function(d){return "Zanke"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catTurtle":function(d){return "Dejanja"},
"catVariables":function(d){return "Spremenljivke"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Spremeni barvo pisala."},
"createACircle":function(d){return "ustvari krog"},
"createSnowflakeSquare":function(d){return "ustvari snežinko tipa kvadrat"},
"createSnowflakeParallelogram":function(d){return "ustvari snežinko tipa paralelogram"},
"createSnowflakeLine":function(d){return "ustvari snežinko tipa črta"},
"createSnowflakeSpiral":function(d){return "ustvari snežinko tipa spirala"},
"createSnowflakeFlower":function(d){return "ustvari snežinko tipa roža"},
"createSnowflakeFractal":function(d){return "ustvari snežinko tipa fraktal"},
"createSnowflakeRandom":function(d){return "ustvari snežinko naključnega tipa"},
"createASnowflakeBranch":function(d){return "nariši vejo snežinke"},
"degrees":function(d){return "stopinje"},
"depth":function(d){return "globina"},
"dots":function(d){return "piksli"},
"drawACircle":function(d){return "nariši krog"},
"drawAFlower":function(d){return "nariši rožo"},
"drawAHexagon":function(d){return "nariši šesterokotnik"},
"drawAHouse":function(d){return "nariši hišo"},
"drawAPlanet":function(d){return "nariši planet"},
"drawARhombus":function(d){return "nariši romb"},
"drawARobot":function(d){return "nariši robota"},
"drawARocket":function(d){return "nariši raketo"},
"drawASnowflake":function(d){return "nariši snežinko"},
"drawASnowman":function(d){return "nariši snežaka"},
"drawASquare":function(d){return "nariši kvadrat"},
"drawAStar":function(d){return "nariši zvezdo"},
"drawATree":function(d){return "nariši drevo"},
"drawATriangle":function(d){return "nariši trikotnik"},
"drawUpperWave":function(d){return "nariši zgornji val"},
"drawLowerWave":function(d){return "nariši nižji val"},
"drawStamp":function(d){return "pusti odtis"},
"heightParameter":function(d){return "višina"},
"hideTurtle":function(d){return "skrij umetnika"},
"jump":function(d){return "skoči"},
"jumpBackward":function(d){return "skoči nazaj za"},
"jumpForward":function(d){return "skoči naprej za"},
"jumpTooltip":function(d){return "Premakne umetnika brez puščanja kakih sledi."},
"jumpEastTooltip":function(d){return "Premakni umetnika vzhodno brez, da bi pustil sledi."},
"jumpNorthTooltip":function(d){return "Premakni umetnika severno brez, da bi pustil sledi."},
"jumpSouthTooltip":function(d){return "Premakni umetnika južno brez, da bi pustil sledi."},
"jumpWestTooltip":function(d){return "Premakni umetnika zahodno brez, da bi pustil sledi."},
"lengthFeedback":function(d){return "Dobro ti je šlo - le še dolžino popravi."},
"lengthParameter":function(d){return "dolžina"},
"loopVariable":function(d){return "števec"},
"moveBackward":function(d){return "premakni se nazaj za"},
"moveEastTooltip":function(d){return "Premakne umetnika vzhodno."},
"moveForward":function(d){return "premakni se naprej za"},
"moveForwardTooltip":function(d){return "Premakni umetnika naprej."},
"moveNorthTooltip":function(d){return "Premakne umetnika severno."},
"moveSouthTooltip":function(d){return "Premakne umetnika južno."},
"moveWestTooltip":function(d){return "Premakne umetnika zahodno."},
"moveTooltip":function(d){return "Premakne umetnika naprej ali nazaj za določeno količino."},
"notBlackColour":function(d){return "Za to uganko moraš izbrati kako drugo barvo kot črno."},
"numBlocksNeeded":function(d){return "To uganko je možno rešiti z %1 blokov. Ti si uporabil/a %2."},
"penDown":function(d){return "začni risati"},
"penTooltip":function(d){return "Dvigne ali spusti svinčnik, da začne ali neha risati."},
"penUp":function(d){return "nehaj risati"},
"reinfFeedbackMsg":function(d){return "Tukaj je tvoja risba! Lahko jo dopolniš ali pa rešiš naslednjo uganko."},
"setAlpha":function(d){return "nastavi prosojnost"},
"setColour":function(d){return "izberi barvo pisala"},
"setPattern":function(d){return "določi vzorec"},
"setWidth":function(d){return "določi debelino pisala"},
"shareDrawing":function(d){return "Deli svojo sliko:"},
"showMe":function(d){return "Pokaži mi"},
"showTurtle":function(d){return "pokaži umetnika"},
"sizeParameter":function(d){return "velikost"},
"step":function(d){return "korak"},
"tooFewColours":function(d){return "Moraš uporabiti vsaj %1 različnih barv za to uganko. Uporabil/a si jih samo %2."},
"turnLeft":function(d){return "obrni se levo za"},
"turnRight":function(d){return "obrni se desno za"},
"turnRightTooltip":function(d){return "Obrne umetnika desno pod določenim kotom."},
"turnTooltip":function(d){return "Obrne umetnika levo ali desno za določeno število stopinj."},
"turtleVisibilityTooltip":function(d){return "Naredi umetnika vidnega ali nevidnega."},
"widthTooltip":function(d){return "Spremeni debelino pisala."},
"wrongColour":function(d){return "Tvoja slika je napačne barve. Za to uganko mora biti %1."}};