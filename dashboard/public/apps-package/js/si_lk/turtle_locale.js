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
"blocksUsed":function(d){return "Blocks used: %1"},
"branches":function(d){return "branches"},
"catColour":function(d){return "පාට"},
"catControl":function(d){return "ලූපයන්"},
"catMath":function(d){return "ගණිත"},
"catProcedures":function(d){return "ශ්‍රිතයන්"},
"catTurtle":function(d){return "ක්‍රියාවන්"},
"catVariables":function(d){return "විචල්‍යන්"},
"catLogic":function(d){return "තර්කය"},
"colourTooltip":function(d){return "පැන්සලයෙ පාට වෙනස් වේ."},
"createACircle":function(d){return "රවුමක් නිර්මාන කරන්න"},
"createSnowflakeSquare":function(d){return "create a snowflake of type square"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "create a snowflake of type line"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "create a snowflake of type flower"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "අංශක​"},
"depth":function(d){return "ගැඹුර​"},
"dots":function(d){return "පික්සල"},
"drawACircle":function(d){return "රවුමක් අඳින්න"},
"drawAFlower":function(d){return "මලක් අඳින්න"},
"drawAHexagon":function(d){return "ෂඩස්‍රයක් අඳින්න"},
"drawAHouse":function(d){return "ගෙයක් අඳින්න"},
"drawAPlanet":function(d){return "draw a planet"},
"drawARhombus":function(d){return "draw a rhombus"},
"drawARobot":function(d){return "රොබෝවෙක් අදින්න"},
"drawARocket":function(d){return "රොකටයක් අදින්න"},
"drawASnowflake":function(d){return "draw a snowflake"},
"drawASnowman":function(d){return "draw a snowman"},
"drawASquare":function(d){return "draw a square"},
"drawAStar":function(d){return "තරුවක් අඳින්න"},
"drawATree":function(d){return "ගසක් අඳින්න"},
"drawATriangle":function(d){return "ත්‍රිකොණයක් අඳින්න"},
"drawUpperWave":function(d){return "draw upper wave"},
"drawLowerWave":function(d){return "draw lower wave"},
"drawStamp":function(d){return "draw stamp"},
"heightParameter":function(d){return "උස"},
"hideTurtle":function(d){return "hide artist"},
"jump":function(d){return "පනින්න"},
"jumpBackward":function(d){return "jump backward by"},
"jumpForward":function(d){return "jump forward by"},
"jumpTooltip":function(d){return "Moves the artist without leaving any marks."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "දිග"},
"loopVariable":function(d){return "counter"},
"moveBackward":function(d){return "move backward by"},
"moveEastTooltip":function(d){return "Moves the artist east."},
"moveForward":function(d){return "move forward by"},
"moveForwardTooltip":function(d){return "Moves the artist forward."},
"moveNorthTooltip":function(d){return "Moves the artist north."},
"moveSouthTooltip":function(d){return "Moves the artist south."},
"moveWestTooltip":function(d){return "Moves the artist west."},
"moveTooltip":function(d){return "Moves the artist forward or backward by the specified amount."},
"notBlackColour":function(d){return "You need to set a color other than black for this puzzle."},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks.  You used %2."},
"penDown":function(d){return "පැන්සල පහතට"},
"penTooltip":function(d){return "Lifts or lowers the pencil, to start or stop drawing."},
"penUp":function(d){return "පැන්සල උඩට"},
"reinfFeedbackMsg":function(d){return "Here is your drawing! Keep working on it or continue to the next puzzle."},
"setAlpha":function(d){return "set alpha"},
"setColour":function(d){return "පැහැය සකසන්න"},
"setPattern":function(d){return "set pattern"},
"setWidth":function(d){return "පළල සකසන්න"},
"shareDrawing":function(d){return "Share your drawing:"},
"showMe":function(d){return "මාව පෙන්වන්න"},
"showTurtle":function(d){return "show artist"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "පියවර"},
"tooFewColours":function(d){return "You need to use at least %1 different colors for this puzzle.  You used only %2."},
"turnLeft":function(d){return "turn left by"},
"turnRight":function(d){return "turn right by"},
"turnRightTooltip":function(d){return "Turns the artist right by the specified angle."},
"turnTooltip":function(d){return "Turns the artist left or right by the specified number of degrees."},
"turtleVisibilityTooltip":function(d){return "Makes the artist visible or invisible."},
"widthTooltip":function(d){return "Changes the width of the pencil."},
"wrongColour":function(d){return "Your picture is the wrong color.  For this puzzle, it needs to be %1."}};