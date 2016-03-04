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
"blocksUsed":function(d){return "Iskorišteno blokova: %1"},
"branches":function(d){return "grane"},
"catColour":function(d){return "Boja"},
"catControl":function(d){return "Petlje"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catTurtle":function(d){return "Akcije"},
"catVariables":function(d){return "Varijable"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Mijenja boju olovke."},
"createACircle":function(d){return "napravi krug"},
"createSnowflakeSquare":function(d){return "napravi snježnu pahuljicu od oblika kvadrat"},
"createSnowflakeParallelogram":function(d){return "napravi snježnu pahuljicu oblika paralelogram"},
"createSnowflakeLine":function(d){return "napravi sniježnu pahuljicu od tipa linija"},
"createSnowflakeSpiral":function(d){return "napravi sniježnu pahuljicu od oblika spirala"},
"createSnowflakeFlower":function(d){return "napravi sniježnu pahuljicu od oblika cvijet"},
"createSnowflakeFractal":function(d){return "napravi sniježnu pahuljicu od tipa fraktal"},
"createSnowflakeRandom":function(d){return "napravi sniježnu pahuljicu od nasumičnog tipa"},
"createASnowflakeBranch":function(d){return "napravi granu sniježne pahuljice"},
"degrees":function(d){return "stepeni"},
"depth":function(d){return "dubina"},
"dots":function(d){return "pikseli"},
"drawACircle":function(d){return "nacrtaj krug"},
"drawAFlower":function(d){return "nacrtaj cvijet"},
"drawAHexagon":function(d){return "nacrtaj šesterougao"},
"drawAHouse":function(d){return "nacrtaj kuću"},
"drawAPlanet":function(d){return "nacrtaj planetu"},
"drawARhombus":function(d){return "nacrtaj romb"},
"drawARobot":function(d){return "nacrtaj robota"},
"drawARocket":function(d){return "nacrtaj raketu"},
"drawASnowflake":function(d){return "nacrtaj pahuljicu"},
"drawASnowman":function(d){return "nacrtaj snješka bjelića"},
"drawASquare":function(d){return "nacrtaj kvadrat"},
"drawAStar":function(d){return "nacrtaj zvijezdu"},
"drawATree":function(d){return "nacrtaj drvo"},
"drawATriangle":function(d){return "nacrtaj trougao"},
"drawUpperWave":function(d){return "nacrtaj uzlazni val"},
"drawLowerWave":function(d){return "nacrtaj silazni val"},
"drawStamp":function(d){return "nacrtaj pečat"},
"heightParameter":function(d){return "visina"},
"hideTurtle":function(d){return "sakrij crtača"},
"jump":function(d){return "skoči"},
"jumpBackward":function(d){return "skoči unazad za"},
"jumpForward":function(d){return "skoči naprijed za"},
"jumpTooltip":function(d){return "Pomakni crtača bez ostavljanja ikakvih tragova."},
"jumpEastTooltip":function(d){return "Pomiče umjetnika na Istok bez ostavljanja traga."},
"jumpNorthTooltip":function(d){return "Pomiče umjetnika na Sjever bez ostavljanja traga."},
"jumpSouthTooltip":function(d){return "Pomiče umjetnika na Jug bez ostavljanja traga."},
"jumpWestTooltip":function(d){return "Pomiče umjetnika na Zapad bez ostavljanja traga."},
"lengthFeedback":function(d){return "Sve si dobro odradio/la osim dužine pomicanja."},
"lengthParameter":function(d){return "dužina"},
"loopVariable":function(d){return "brojač"},
"moveBackward":function(d){return "pomakni unazad za"},
"moveEastTooltip":function(d){return "Pomiče umjetnika na Istok."},
"moveForward":function(d){return "idi naprijed za"},
"moveForwardTooltip":function(d){return "Pomiče crtača naprijed."},
"moveNorthTooltip":function(d){return "Pomiče umjetnika na Sjever."},
"moveSouthTooltip":function(d){return "Pomiče umjetnika na Jug."},
"moveWestTooltip":function(d){return "Pomiče umjetnika na Zapad."},
"moveTooltip":function(d){return "Pomiče crtača naprijed ili nazad za zadani broj koraka."},
"notBlackColour":function(d){return "U ovom zadatku treba postaviti boju različitu od crne."},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti sa %1 blokova. Ti si koristio/la %2."},
"penDown":function(d){return "spusti olovku"},
"penTooltip":function(d){return "Podiže ili spušta olovku da bi počeo/la ili prestao/la crtati."},
"penUp":function(d){return "podigni olovku"},
"reinfFeedbackMsg":function(d){return "Evo tvog crteža! Nastavi raditi na njemu ili prijeđi na slijedeći zadatak."},
"setAlpha":function(d){return "postavi alfa"},
"setColour":function(d){return "postavi boju"},
"setPattern":function(d){return "postavi uzorak"},
"setWidth":function(d){return "postavi širinu"},
"shareDrawing":function(d){return "Podijeli svoj crtež:"},
"showMe":function(d){return "Pokaži mi"},
"showTurtle":function(d){return "pokaži crtača"},
"sizeParameter":function(d){return "veličina"},
"step":function(d){return "korak"},
"tooFewColours":function(d){return "U ovom zadatku treba koristiti bar %1 različitih boja. Ti si koristio/la samo %2."},
"turnLeft":function(d){return "okreni lijevo za"},
"turnRight":function(d){return "okreni desno za"},
"turnRightTooltip":function(d){return "Okreće crtača desno za zadani ugao."},
"turnTooltip":function(d){return "Okreće crtača lijevo ili desno za zadani broj stepeni."},
"turtleVisibilityTooltip":function(d){return "Pokazuje ili skriva crtača."},
"widthTooltip":function(d){return "Mijenja širinu olovke."},
"wrongColour":function(d){return "Tvoja slika je pogrešne boje. U ovom zadatku se treba koristiti boja %1."}};