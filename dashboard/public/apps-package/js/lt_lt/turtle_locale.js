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
"blocksUsed":function(d){return "Panaudota blokelių: %1"},
"branches":function(d){return "šakos"},
"catColour":function(d){return "Spalva"},
"catControl":function(d){return "Kartojimas"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Komandų kūrimas"},
"catTurtle":function(d){return "Komandos"},
"catVariables":function(d){return "Kintamieji"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Pakeičia pieštuko spalvą."},
"createACircle":function(d){return "sukurk apskritimą"},
"createSnowflakeSquare":function(d){return "sukurk snaigę iš kvadratų"},
"createSnowflakeParallelogram":function(d){return "sukurk snaigę iš rombų"},
"createSnowflakeLine":function(d){return "sukurk snaigę iš spindulių"},
"createSnowflakeSpiral":function(d){return "sukurk snaigę kaip spiralę"},
"createSnowflakeFlower":function(d){return "sukurk snaigę kaip gėlę"},
"createSnowflakeFractal":function(d){return "sukurk snaigę iš fraktališkų šakų"},
"createSnowflakeRandom":function(d){return "sukurk snaigę bet kokią"},
"createASnowflakeBranch":function(d){return "sukurk snaigės šaką"},
"degrees":function(d){return "laipsnių"},
"depth":function(d){return "gylis"},
"dots":function(d){return "pikselių"},
"drawACircle":function(d){return "nubrėžk apskritimą"},
"drawAFlower":function(d){return "nupiešk gėlę"},
"drawAHexagon":function(d){return "nupiešk šešiakampį"},
"drawAHouse":function(d){return "namas"},
"drawAPlanet":function(d){return "nupiešk planetą"},
"drawARhombus":function(d){return "nupiešk rombą"},
"drawARobot":function(d){return "nupiešk robotą"},
"drawARocket":function(d){return "nupiešk raketą"},
"drawASnowflake":function(d){return "nupiešk snaigę"},
"drawASnowman":function(d){return "nupiešk sniego senį"},
"drawASquare":function(d){return "nubrėžk kvadratą"},
"drawAStar":function(d){return "nupiešk žvaigždę"},
"drawATree":function(d){return "nupiešk medį"},
"drawATriangle":function(d){return "nubrėžk trikampį"},
"drawUpperWave":function(d){return "nupiešk viršutinę bangą"},
"drawLowerWave":function(d){return "nupiešk apatinę bangą"},
"drawStamp":function(d){return "padėk antspaudą"},
"heightParameter":function(d){return "aukštis"},
"hideTurtle":function(d){return "slėpti menininką"},
"jump":function(d){return "šok"},
"jumpBackward":function(d){return "peršok atgal per"},
"jumpForward":function(d){return "peršok į priekį per"},
"jumpTooltip":function(d){return "Pajudina menininką jam nieko nepiešiant."},
"jumpEastTooltip":function(d){return "Pajudina menininką į rytus nepaliekant jokių piešimo žymių."},
"jumpNorthTooltip":function(d){return "Pajudina menininką į šiaurę nepaliekant jokių piešimo žymių."},
"jumpSouthTooltip":function(d){return "Pajudina menininką į pietus nepaliekant jokių piešimo žymių."},
"jumpWestTooltip":function(d){return "Pajudina menininką į vakarus nepaliekant jokių piešimo žymių."},
"lengthFeedback":function(d){return "Tu teisingai supratai, bet judėjimo atstumai yra netikslūs."},
"lengthParameter":function(d){return "n"},
"loopVariable":function(d){return "skaitiklis"},
"moveBackward":function(d){return "judėk atgal"},
"moveEastTooltip":function(d){return "Pajudina menininką į rytus."},
"moveForward":function(d){return "eik į priekį"},
"moveForwardTooltip":function(d){return "Pajudina menininką į priekį."},
"moveNorthTooltip":function(d){return "Pajudina menininką į šiaurę."},
"moveSouthTooltip":function(d){return "Pajudina menininką į pietus."},
"moveWestTooltip":function(d){return "Pajudina menininką į vakarus."},
"moveTooltip":function(d){return "Pajudina menininką į priekį arba atgal per nustatytą atstumą."},
"notBlackColour":function(d){return "Šios užduoties atlikimui reikia pasirinkti bet kurią spalvą, išskyrus juodą."},
"numBlocksNeeded":function(d){return "Ši užduotis yra išsprendžiama su %1 blokais. Tu panaudojai %2."},
"penDown":function(d){return "nuleisk pieštuką"},
"penTooltip":function(d){return "Pakelia arba nuleidžia pieštuką, kad pradėtų arba sustotų piešti."},
"penUp":function(d){return "pakelk pieštuką"},
"reinfFeedbackMsg":function(d){return "Štai tavo piešinys! Gali ir toliau piešti arba eik toliau prie kito galvosūkio."},
"setAlpha":function(d){return "nustatyti permatomumą"},
"setColour":function(d){return "spalva ="},
"setPattern":function(d){return "šablonas = "},
"setWidth":function(d){return "plotis = "},
"shareDrawing":function(d){return "Pasidalink savo piešiniu:"},
"showMe":function(d){return "Parodyk man"},
"showTurtle":function(d){return "rodyti menininką"},
"sizeParameter":function(d){return "dydis"},
"step":function(d){return "žingsnis"},
"tooFewColours":function(d){return "Reikia panaudoti bent %1 skirtingas spalvas šiai užduočiai atlikti. Tu panaudojai tik %2."},
"turnLeft":function(d){return "pasisuk į kairę"},
"turnRight":function(d){return "pasisuk į dešinę"},
"turnRightTooltip":function(d){return "Pasuka menininką į dešinę pasirinktu kampu."},
"turnTooltip":function(d){return "Pasuka menininką į kairę pasirinktu kampu laipsniais."},
"turtleVisibilityTooltip":function(d){return "Padaro menininką matomą arba nematomą."},
"widthTooltip":function(d){return "Pakeičia pieštuko plotį."},
"wrongColour":function(d){return "Tavo piešinys yra ne tokios spalvos. Šiai užduočiai atlikti, ji turi būti %1."}};