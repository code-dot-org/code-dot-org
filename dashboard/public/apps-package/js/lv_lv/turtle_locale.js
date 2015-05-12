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
"blocksUsed":function(d){return "Izmantotie bloki: %1"},
"branches":function(d){return "zari"},
"catColour":function(d){return "Krāsa"},
"catControl":function(d){return "Cikli"},
"catMath":function(d){return "Matemātika"},
"catProcedures":function(d){return "Funkcijas"},
"catTurtle":function(d){return "Darbības"},
"catVariables":function(d){return "Mainīgie"},
"catLogic":function(d){return "Loģika"},
"colourTooltip":function(d){return "Nomaina zīmuļa krāsu."},
"createACircle":function(d){return "Izveidot apli"},
"createSnowflakeSquare":function(d){return "Izveidot kvadrātveida sniegpārslu"},
"createSnowflakeParallelogram":function(d){return "Izveidot paralelogramveida sniegpārslu"},
"createSnowflakeLine":function(d){return "izveidot līnijveida sniegpārslu"},
"createSnowflakeSpiral":function(d){return "izveidot spirālveida sniegpārslu"},
"createSnowflakeFlower":function(d){return "izveidot zieda tipa sniegpārslu"},
"createSnowflakeFractal":function(d){return "izveidot fraktāļu tipa sniegpārslu"},
"createSnowflakeRandom":function(d){return "Izveidot nejaušā tipa sniegpārslu"},
"createASnowflakeBranch":function(d){return "Izveidot zaru sniegpārslu"},
"degrees":function(d){return "grādiem"},
"depth":function(d){return "dziļums"},
"dots":function(d){return "punktiem"},
"drawASquare":function(d){return "zīmēt kvadrātu"},
"drawATriangle":function(d){return "zīmēt trīsstūri"},
"drawACircle":function(d){return "zīmēt apli"},
"drawAFlower":function(d){return "zīmēt puķi"},
"drawAHexagon":function(d){return "zimēt sešstūri"},
"drawAHouse":function(d){return "zīmēt māju"},
"drawAPlanet":function(d){return "zīmēt planētu"},
"drawARhombus":function(d){return "zīmēt rombu"},
"drawARobot":function(d){return "zīmēt robotu"},
"drawARocket":function(d){return "zīmēt raķeti"},
"drawASnowflake":function(d){return "zīmēt sniegpārslu"},
"drawASnowman":function(d){return "zīmēt sniegavīru"},
"drawAStar":function(d){return "zīmet zvaigzni"},
"drawATree":function(d){return "zīmēt koku"},
"drawUpperWave":function(d){return "zīmēt augšējo vilni"},
"drawLowerWave":function(d){return "zīmēt apakšējo vilni"},
"drawStamp":function(d){return "zīmēt nospiedumu"},
"heightParameter":function(d){return "augstums"},
"hideTurtle":function(d){return "paslēpt tēlu"},
"jump":function(d){return "lēkt"},
"jumpBackward":function(d){return "lekt atpakaļ par"},
"jumpForward":function(d){return "lekt uz priekšu par"},
"jumpTooltip":function(d){return "Pārvieto zīmējumu neatstājot pēdas."},
"jumpEastTooltip":function(d){return "Pārvieto zīmējumu uz austrumiem neatstājot pēdas."},
"jumpNorthTooltip":function(d){return "Pārvieto zīmējumu uz ziemeļiem neatstājot pēdas."},
"jumpSouthTooltip":function(d){return "Pārvieto zīmējumu uz dienvidiem neatstājot pēdas."},
"jumpWestTooltip":function(d){return "Pārvieto zīmējumu uz rietumiem neatstājot pēdas."},
"lengthFeedback":function(d){return "Viss ir pareizi, izņemot gājiena garums."},
"lengthParameter":function(d){return "garums"},
"loopVariable":function(d){return "cikla mainīgais"},
"moveBackward":function(d){return "pārvietot atpakaļ par"},
"moveEastTooltip":function(d){return "Pārvieto zīmejumu uz austrumiem."},
"moveForward":function(d){return "pārvietoties uz priekšu par"},
"moveForwardTooltip":function(d){return "Pārvieto zīmejumu uz priekšu."},
"moveNorthTooltip":function(d){return "Pārvieto zīmejumu uz ziemeļiem."},
"moveSouthTooltip":function(d){return "Pārvieto zīmejumu uz dienvidiem."},
"moveWestTooltip":function(d){return "Pārvieto zīmejumu uz rietumiem."},
"moveTooltip":function(d){return "Pārvieto zīmējumu uz priekšu vai uz atpakaļu par noteiktu dadzumu."},
"notBlackColour":function(d){return "Priekš puzles jums jāuzstāda cita krāsa, nevis melna."},
"numBlocksNeeded":function(d){return "Ši puzle var tik atrisināta ar %1 blokiem. Tu izmantoji %2."},
"penDown":function(d){return "zīmulis piespiests"},
"penTooltip":function(d){return "Paceļ vai noliek zīmuli, lai sāktu vai partrauktu zīmēt."},
"penUp":function(d){return "zīmuli pacelts"},
"reinfFeedbackMsg":function(d){return "Šeit ir tavs zīmējums! Turpini darbu pie tā, vai sāc darbu pie nākamās puzles."},
"setColour":function(d){return "uzstādīt krāsu"},
"setPattern":function(d){return "uzstādīt rakstu"},
"setWidth":function(d){return "uzstādīt platumu"},
"shareDrawing":function(d){return "Ieteikt savu zīmējumu:"},
"showMe":function(d){return "Pārādīt man"},
"showTurtle":function(d){return "parādīt zīmējumu"},
"sizeParameter":function(d){return "izmērs"},
"step":function(d){return "solis"},
"tooFewColours":function(d){return "Tev jāzimanto vismaz %1 dažādas krāsas noteiktajai puzlei. Tu izmantoji tikai %2."},
"turnLeft":function(d){return "pagriezt pa kreisi par"},
"turnRight":function(d){return "pagriezt pa labi par"},
"turnRightTooltip":function(d){return "Pagriež zīmējumu pa labi par noteiktu leņķi."},
"turnTooltip":function(d){return "Pagriezt zīmējumu pa labi par noteiktiem grādiem."},
"turtleVisibilityTooltip":function(d){return "Padara zīmējumu redzamu vai neredzamu."},
"widthTooltip":function(d){return "Nomaina zīmuļa platumu."},
"wrongColour":function(d){return "Tava bilde ir nepareizajā krāsā. Šai puzlei nepieciešama šāda krāsa %1."}};