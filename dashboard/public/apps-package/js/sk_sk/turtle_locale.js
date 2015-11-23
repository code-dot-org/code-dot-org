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
"blocksUsed":function(d){return "Použité bloky: %1"},
"branches":function(d){return "ramená"},
"catColour":function(d){return "Farba"},
"catControl":function(d){return "Opakovania"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcie"},
"catTurtle":function(d){return "Úlohy"},
"catVariables":function(d){return "Premenné"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Zmení farbu pera."},
"createACircle":function(d){return "vytvor kružnicu"},
"createSnowflakeSquare":function(d){return "vytvor vločku typu štvorec"},
"createSnowflakeParallelogram":function(d){return "vytvor vločku typu rovnobežník"},
"createSnowflakeLine":function(d){return "vytvor vločku typu čiara"},
"createSnowflakeSpiral":function(d){return "vytvor vločku typu špirála"},
"createSnowflakeFlower":function(d){return "vytvor vločku typu kvetina"},
"createSnowflakeFractal":function(d){return "vytvor vločku typu fraktál"},
"createSnowflakeRandom":function(d){return "vytvor vločku typu náhodná"},
"createASnowflakeBranch":function(d){return "vytvor rameno vločky"},
"degrees":function(d){return "stupňov"},
"depth":function(d){return "hĺbka"},
"dots":function(d){return "pixely"},
"drawACircle":function(d){return "nakresli kružnicu"},
"drawAFlower":function(d){return "nakresli kvetinu"},
"drawAHexagon":function(d){return "nakresli šesťuholník"},
"drawAHouse":function(d){return "nakresli dom"},
"drawAPlanet":function(d){return "nakresli planétu"},
"drawARhombus":function(d){return "nakresli kosoštvorec"},
"drawARobot":function(d){return "nakresli robota"},
"drawARocket":function(d){return "nakresli raketu"},
"drawASnowflake":function(d){return "nakresli snehovú vločku"},
"drawASnowman":function(d){return "nakresli snehuliaka"},
"drawASquare":function(d){return "nakresli štvorec"},
"drawAStar":function(d){return "nakresli hviezdu"},
"drawATree":function(d){return "nakresli strom"},
"drawATriangle":function(d){return "nakresli trojuholník"},
"drawUpperWave":function(d){return "nakresli hornú vlnu"},
"drawLowerWave":function(d){return "nakresli dolnú vlnu"},
"drawStamp":function(d){return "nakresli pečiatku"},
"heightParameter":function(d){return "výška"},
"hideTurtle":function(d){return "skry maliara"},
"jump":function(d){return "skoč"},
"jumpBackward":function(d){return "skoč dozadu o"},
"jumpForward":function(d){return "skoč dopredu o"},
"jumpTooltip":function(d){return "Posunie maliara bez zanechania stôp."},
"jumpEastTooltip":function(d){return "Posunie maliara na východ bez zanechania stôp."},
"jumpNorthTooltip":function(d){return "Posunie maliara na sever bez zanechania stôp."},
"jumpSouthTooltip":function(d){return "Posunie maliara na juh bez zanechania stôp."},
"jumpWestTooltip":function(d){return "Posunie maliara na západ bez zanechania stôp."},
"lengthFeedback":function(d){return "Je to správne okrem dĺžky pohybu."},
"lengthParameter":function(d){return "dĺžka"},
"loopVariable":function(d){return "počítadlo"},
"moveBackward":function(d){return "posun dozadu o"},
"moveEastTooltip":function(d){return "Posunie maliara na východ."},
"moveForward":function(d){return "posun dopredu o"},
"moveForwardTooltip":function(d){return "Posunie maliara dopredu."},
"moveNorthTooltip":function(d){return "Posunie maliara na sever."},
"moveSouthTooltip":function(d){return "Posunie maliara na juh."},
"moveWestTooltip":function(d){return "Posunie maliara na západ."},
"moveTooltip":function(d){return "Posunie maliara dopredu alebo dozadu o určitú vzdialenosť."},
"notBlackColour":function(d){return "Musíš nastaviť inú farbu ako čiernu v tejto úlohe."},
"numBlocksNeeded":function(d){return "Táto úloha sa dá vyriešiť pomocou %1 blokov. Použil si %2 blokov."},
"penDown":function(d){return "pero dolu"},
"penTooltip":function(d){return "Posúva pero hore alebo dole, aby maliar začal alebo prestal kresliť."},
"penUp":function(d){return "pero hore"},
"reinfFeedbackMsg":function(d){return "Tu je tvoja kresba! Môžeš na nej ďalej pracovať alebo pokračovať na ďalšiu hádanku."},
"setAlpha":function(d){return "nastav alfa"},
"setColour":function(d){return "nastav farbu"},
"setPattern":function(d){return "nastav vzor"},
"setWidth":function(d){return "nastav šírku"},
"shareDrawing":function(d){return "Zdieľajte Vašu kresbu:"},
"showMe":function(d){return "Ukáž mi"},
"showTurtle":function(d){return "zobraz maliara"},
"sizeParameter":function(d){return "veľkosť"},
"step":function(d){return "krok"},
"tooFewColours":function(d){return "Musíš použiť najmenej %1 odlišných farieb pre túto úlohu. Použil si len %2."},
"turnLeft":function(d){return "otoč vľavo o"},
"turnRight":function(d){return "otoč vpravo o"},
"turnRightTooltip":function(d){return "Otočí maliara vpravo o zadaný uhoľ."},
"turnTooltip":function(d){return "Otočí maliara vľavo alebo vpravo o zadaný počet stupňov."},
"turtleVisibilityTooltip":function(d){return "Zviditeľní alebo skryje maliara."},
"widthTooltip":function(d){return "Zmení šírku ceruzky."},
"wrongColour":function(d){return "Tvoj obrázok má nesprávnu farbu. V tejto úlohe to musí byť %1."}};