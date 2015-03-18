var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"blocksUsed":function(d){return "Kasutatud plokke: %1"},
"branches":function(d){return "harud"},
"catColour":function(d){return "Värv"},
"catControl":function(d){return "Tsüklid"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catTurtle":function(d){return "Tegevused"},
"catVariables":function(d){return "Muutujad"},
"catLogic":function(d){return "Loogika"},
"colourTooltip":function(d){return "Muudab pliiatsi värvi."},
"createACircle":function(d){return "loo ring"},
"createSnowflakeSquare":function(d){return "loo lumehelves, mis koosneb ruutudest"},
"createSnowflakeParallelogram":function(d){return "loo lumehelves, mis koosneb rööpkülikutest"},
"createSnowflakeLine":function(d){return "loo lumehelves, mis koosneb joontest"},
"createSnowflakeSpiral":function(d){return "loo lumehelves, mis koosneb ringjoontest"},
"createSnowflakeFlower":function(d){return "loo lumehelves, mis koosneb õielehtedest"},
"createSnowflakeFractal":function(d){return "loo lumehelves, mis koosneb fraktalist"},
"createSnowflakeRandom":function(d){return "loo lumehelves, mis koosneb juhuslikust elemendist"},
"createASnowflakeBranch":function(d){return "Tee lumehelbe haru"},
"degrees":function(d){return "kraadi"},
"depth":function(d){return "sügavus"},
"dots":function(d){return "piksli võrra"},
"drawASquare":function(d){return "joonista ruut"},
"drawATriangle":function(d){return "joonista kolmnurk"},
"drawACircle":function(d){return "joonista ring"},
"drawAFlower":function(d){return "joonista lill"},
"drawAHexagon":function(d){return "joonista kuusnurk"},
"drawAHouse":function(d){return "joonista maja"},
"drawAPlanet":function(d){return "joonista planeet"},
"drawARhombus":function(d){return "joonista romb"},
"drawARobot":function(d){return "joonista robot"},
"drawARocket":function(d){return "joonista rakett"},
"drawASnowflake":function(d){return "joonista lumehelves"},
"drawASnowman":function(d){return "joonista lumememm"},
"drawAStar":function(d){return "joonista täht"},
"drawATree":function(d){return "joonista puu"},
"drawUpperWave":function(d){return "joonista ülemine laine"},
"drawLowerWave":function(d){return "joonista alumine laine"},
"drawStamp":function(d){return "Joonista tempel"},
"heightParameter":function(d){return "kõrgus"},
"hideTurtle":function(d){return "peida kunstnik"},
"jump":function(d){return "hüppa"},
"jumpBackward":function(d){return "hüppa tagasi"},
"jumpForward":function(d){return "hüppa edasi"},
"jumpTooltip":function(d){return "Liigutab kunstnikku joont tõmbamata."},
"jumpEastTooltip":function(d){return "Liigutab kunstnikku ida suunas joont tõmbamata."},
"jumpNorthTooltip":function(d){return "Liigutab kunstnikku põhja suunas joont tõmbamata."},
"jumpSouthTooltip":function(d){return "Liigutab kunstnikku lõuna suunas joont tõmbamata."},
"jumpWestTooltip":function(d){return "Liigutab kunstnikku lääne suunas joont tõmbamata."},
"lengthFeedback":function(d){return "Kõik oli õige peale liikumiste arvu."},
"lengthParameter":function(d){return "pikkus"},
"loopVariable":function(d){return "loendur"},
"moveBackward":function(d){return "liigu tagasi"},
"moveEastTooltip":function(d){return "Liigutab kunstnikku ida suunas."},
"moveForward":function(d){return "liigu edasi"},
"moveForwardTooltip":function(d){return "Liigutab kunstnikku edasi."},
"moveNorthTooltip":function(d){return "Liigutab kunstnikku põhja suunas."},
"moveSouthTooltip":function(d){return "Liigutab kunstnikku lõuna suunas."},
"moveWestTooltip":function(d){return "Liigutab kunstnikku lääne suunas."},
"moveTooltip":function(d){return "Liigutab kunstnikku edasi või tagasi etteantud sammude võrra."},
"notBlackColour":function(d){return "Selle mõistatuse jaoks tuleb valida mõni muu värv peale musta."},
"numBlocksNeeded":function(d){return "Seda mõistatust on võimalik lahendada %1 ploki abil. Sa kasutasid %2 plokki."},
"penDown":function(d){return "pliiats alla"},
"penTooltip":function(d){return "tõstab või langetab pliiatsi joonistamise alustamiseks või lõpetamiseks."},
"penUp":function(d){return "pliiats üles"},
"reinfFeedbackMsg":function(d){return "Siin on sinu joonistus! Jätka selle kallal töötamist või alusta järgmise ülesandega."},
"setColour":function(d){return "vali värv"},
"setPattern":function(d){return "vali muster"},
"setWidth":function(d){return "vali laius"},
"shareDrawing":function(d){return "Jaga oma joonistust:"},
"showMe":function(d){return "Näita"},
"showTurtle":function(d){return "näita kunstnikku"},
"sizeParameter":function(d){return "suurus"},
"step":function(d){return "samm"},
"tooFewColours":function(d){return "Selle mõistatuse jaoks tuleb kasutada vähemalt %1 erinevat värvi. Sa kasutasid ainult %2."},
"turnLeft":function(d){return "pööra vasakule"},
"turnRight":function(d){return "pööra paremale"},
"turnRightTooltip":function(d){return "Pöörab kunstnikku etteantud nurga võrra."},
"turnTooltip":function(d){return "Pöörab kunstnikku vasakule või paremale etteantud nurga võrra."},
"turtleVisibilityTooltip":function(d){return "Teeb kunstniku nähtavaks või peidab selle."},
"widthTooltip":function(d){return "Muudab pliiatsi laiust."},
"wrongColour":function(d){return "Sinu pilt on valet värvi. Selle mõistatuse jaoks peab värv olema %1."}};