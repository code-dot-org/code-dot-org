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
"blocksUsed":function(d){return "பயன்படுத்திய தொகுதிகள்: %1"},
"branches":function(d){return "branches"},
"catColour":function(d){return "நிறம்"},
"catControl":function(d){return "சுழற்சிகள்"},
"catMath":function(d){return "கணிதம்"},
"catProcedures":function(d){return "செயல்பாடுகள்"},
"catTurtle":function(d){return "செயல்கள்"},
"catVariables":function(d){return "மாறிலிகள்"},
"catLogic":function(d){return "தர்க்கம்"},
"colourTooltip":function(d){return "Changes the color of the pencil."},
"createACircle":function(d){return "வட்டம் வரைக"},
"createSnowflakeSquare":function(d){return "சதுரமானப் பணிப்டிவம் வரைக"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "கோடு போன்ற பணிப்டிவம் வரைக"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "மலர் போன்ற பணிப்டிவம் வரைக"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "கோணங்கள்"},
"depth":function(d){return "ஆழம்"},
"dots":function(d){return "படப்புள்ளிகள்"},
"drawACircle":function(d){return "ஒரு வட்டத்தை வரையவும்"},
"drawAFlower":function(d){return "மலர் வரைக"},
"drawAHexagon":function(d){return "அறுங்கோணம் வரைக"},
"drawAHouse":function(d){return "ஒரு வீட்டை வரையவும்"},
"drawAPlanet":function(d){return "விண்கோள் வரைக"},
"drawARhombus":function(d){return "சாய்சதுரம் வரைக"},
"drawARobot":function(d){return "எந்திரன் வரைக"},
"drawARocket":function(d){return "விண்வெளிக்கலன் வரைக"},
"drawASnowflake":function(d){return "பனிமலர் வரைக"},
"drawASnowman":function(d){return "ஒரு பனி மனிதனை வரையவும்"},
"drawASquare":function(d){return "ஒரு சதுரத்தை வரையவும்"},
"drawAStar":function(d){return "நட்சத்திரம் வரைக"},
"drawATree":function(d){return "ஒரு மரத்தை வரையவும்"},
"drawATriangle":function(d){return "ஒரு முக்கோணத்தை வரையவும்"},
"drawUpperWave":function(d){return "மேல் அலை வரைக"},
"drawLowerWave":function(d){return "கீழ் அலை வரைக"},
"drawStamp":function(d){return "முத்திரை வரைக"},
"heightParameter":function(d){return "உயரம்"},
"hideTurtle":function(d){return "கலைஞரை மறை"},
"jump":function(d){return "jump"},
"jumpBackward":function(d){return "பின்னோக்கி தாவு"},
"jumpForward":function(d){return "முன்னோக்கி தாவு"},
"jumpTooltip":function(d){return "Moves the artist without leaving any marks."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "நீளம்"},
"loopVariable":function(d){return "கணக்கிடுகிளவன்"},
"moveBackward":function(d){return "பின்னே நகர்"},
"moveEastTooltip":function(d){return "Moves the artist east."},
"moveForward":function(d){return "முன்னே நகர்"},
"moveForwardTooltip":function(d){return "Moves the artist forward."},
"moveNorthTooltip":function(d){return "Moves the artist north."},
"moveSouthTooltip":function(d){return "Moves the artist south."},
"moveWestTooltip":function(d){return "Moves the artist west."},
"moveTooltip":function(d){return "Moves the artist forward or backward by the specified amount."},
"notBlackColour":function(d){return "நீங்கள் இப் புதிருக்கு கறுப்பு தவிர்ந்த வேறு நிறத்தை அமைக்க வேண்டும்."},
"numBlocksNeeded":function(d){return "இப் புதிரை %1 தொகுதிகளினால் தீர்க்கலாம். நீங்கள் பயன்படுத்தியது %2."},
"penDown":function(d){return "pencil down"},
"penTooltip":function(d){return "Lifts or lowers the pencil, to start or stop drawing."},
"penUp":function(d){return "pencil up"},
"reinfFeedbackMsg":function(d){return "Here is your drawing! Keep working on it or continue to the next puzzle."},
"setAlpha":function(d){return "set alpha"},
"setColour":function(d){return "நிறத்தை அமை"},
"setPattern":function(d){return "set pattern"},
"setWidth":function(d){return "அகலத்தை அமை"},
"shareDrawing":function(d){return "உங்கள் சித்திரத்தை பகிரவும்:"},
"showMe":function(d){return "எனக்கு காட்டு"},
"showTurtle":function(d){return "கலைஞரை காண்பி"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "step"},
"tooFewColours":function(d){return "இப் புதிருக்கு நீங்கள் குறைந்தது %1 வெவ்வேறு நிறங்களை பயன்படுத்த வேண்டும். நீங்க %2 மட்டுமே பயன்படுத்தினீர்கள்."},
"turnLeft":function(d){return "turn left by"},
"turnRight":function(d){return "turn right by"},
"turnRightTooltip":function(d){return "Turns the artist right by the specified angle."},
"turnTooltip":function(d){return "Turns the artist left or right by the specified number of degrees."},
"turtleVisibilityTooltip":function(d){return "Makes the artist visible or invisible."},
"widthTooltip":function(d){return "Changes the width of the pencil."},
"wrongColour":function(d){return "Your picture is the wrong color.  For this puzzle, it needs to be %1."}};