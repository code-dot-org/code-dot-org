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
"blocksUsed":function(d){return "Blocuri folosite: %1"},
"branches":function(d){return "ramuri"},
"catColour":function(d){return "Culoare"},
"catControl":function(d){return "Bucle"},
"catMath":function(d){return "Matematică"},
"catProcedures":function(d){return "Funcţii"},
"catTurtle":function(d){return "Acţiuni"},
"catVariables":function(d){return "Variabile"},
"catLogic":function(d){return "Logică"},
"colourTooltip":function(d){return "Schimbă culoarea creionului."},
"createACircle":function(d){return "crează un cerc"},
"createSnowflakeSquare":function(d){return "crează un fulg de nea, de tip pătrat"},
"createSnowflakeParallelogram":function(d){return "crează un fulg de nea, de tip paralelogram"},
"createSnowflakeLine":function(d){return "crează un fulg de nea, de tip linie"},
"createSnowflakeSpiral":function(d){return "crează un fulg de nea, de tip spirală"},
"createSnowflakeFlower":function(d){return "crează un fulg de nea, de tip floare"},
"createSnowflakeFractal":function(d){return "crează un fulg de nea, de tip fractal"},
"createSnowflakeRandom":function(d){return "crează un fulg de nea, de tip aleator"},
"createASnowflakeBranch":function(d){return "crează o ramură de fulg de nea"},
"degrees":function(d){return "grade"},
"depth":function(d){return "adâncime"},
"dots":function(d){return "pixeli"},
"drawASquare":function(d){return "desenează un pătrat"},
"drawATriangle":function(d){return "desenează un triunghi"},
"drawACircle":function(d){return "desenează un cerc"},
"drawAFlower":function(d){return "desenează o floare"},
"drawAHexagon":function(d){return "desenează un hexagon"},
"drawAHouse":function(d){return "desenează o casă"},
"drawAPlanet":function(d){return "desenează o planetă"},
"drawARhombus":function(d){return "desenează un romb"},
"drawARobot":function(d){return "desenează un robot"},
"drawARocket":function(d){return "desenează o rachetă"},
"drawASnowflake":function(d){return "desenează un fulg de zăpadă"},
"drawASnowman":function(d){return "desenează un om de zăpadă"},
"drawAStar":function(d){return "desenează o stea"},
"drawATree":function(d){return "desenează un copac"},
"drawUpperWave":function(d){return "desenează un val superior"},
"drawLowerWave":function(d){return "desenează un val inferior"},
"drawStamp":function(d){return "ștampilează"},
"heightParameter":function(d){return "înălțime"},
"hideTurtle":function(d){return "ascunde artistul"},
"jump":function(d){return "sari"},
"jumpBackward":function(d){return "sari înapoi cu"},
"jumpForward":function(d){return "Sari înainte cu"},
"jumpTooltip":function(d){return "Mută artistul fără a lăsa urme."},
"jumpEastTooltip":function(d){return "Mută artistul la est fără a lăsa urme."},
"jumpNorthTooltip":function(d){return "Mută artistul la nord fără a lăsa urme."},
"jumpSouthTooltip":function(d){return "Mută artistul la sud fără a lăsa urme."},
"jumpWestTooltip":function(d){return "Mută artistul la vest fără a lăsa urme."},
"lengthFeedback":function(d){return "Totul este corect cu excepţia distanţelor care trebuie parcurse."},
"lengthParameter":function(d){return "lungime"},
"loopVariable":function(d){return "numărător"},
"moveBackward":function(d){return "mută înapoi cu"},
"moveEastTooltip":function(d){return "Mută artistul la est."},
"moveForward":function(d){return "mută înainte cu"},
"moveForwardTooltip":function(d){return "Mută artistul înainte."},
"moveNorthTooltip":function(d){return "Mută artistul la nord."},
"moveSouthTooltip":function(d){return "Mută artistul la sud."},
"moveWestTooltip":function(d){return "Mută artistul la vest."},
"moveTooltip":function(d){return "Mută artistul înainte sau înapoi cu valoarea specificată."},
"notBlackColour":function(d){return "Trebuie să setezi o culoare diferită de negru pentru acest puzzle."},
"numBlocksNeeded":function(d){return "Acest puzzle poate fi rezolvat cu %1 blocuri. Tu ai folosit %2."},
"penDown":function(d){return "creionul jos"},
"penTooltip":function(d){return "Ridică sau coboară creionul, pentru a porni sau a înceta desenul."},
"penUp":function(d){return "creionul sus"},
"reinfFeedbackMsg":function(d){return "Aici este desenul dvs.! Continuaţi să lucrați la el sau continuați cu următorul puzzle."},
"setColour":function(d){return "setează culoarea"},
"setPattern":function(d){return "setează model"},
"setWidth":function(d){return "setează lăţimea"},
"shareDrawing":function(d){return "Imparte desenul tau:"},
"showMe":function(d){return "Arată-mi"},
"showTurtle":function(d){return "arată artistul"},
"sizeParameter":function(d){return "dimensiune"},
"step":function(d){return "pas"},
"tooFewColours":function(d){return "Trebuie să folosești cel puțin %1 culori diferite pentru acest puzzle.  Ai folosit doar %2."},
"turnLeft":function(d){return "întoarce la stânga cu"},
"turnRight":function(d){return "întoarce la dreapta cu"},
"turnRightTooltip":function(d){return "Întoarce artistul la dreapta în funcție de unghiul specificat."},
"turnTooltip":function(d){return "Întoarce artistul la stânga în funcție de unghiul specificat."},
"turtleVisibilityTooltip":function(d){return "Face artistul vizibil sau invizibil."},
"widthTooltip":function(d){return "Modifică lăţimea creionului."},
"wrongColour":function(d){return "Imaginea ta are culoarea greşită.  Pentru acest puzzle, aceasta trebuie să fie de %1."}};