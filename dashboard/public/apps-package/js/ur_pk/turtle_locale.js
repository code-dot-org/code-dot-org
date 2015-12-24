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
"blocksUsed":function(d){return "استعمال کیے گۓ بلاک: %1"},
"branches":function(d){return "شاخیں"},
"catColour":function(d){return "رنگ بھریں"},
"catControl":function(d){return "Loops"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Functions"},
"catTurtle":function(d){return "Actions"},
"catVariables":function(d){return "Variables"},
"catLogic":function(d){return "Logic"},
"colourTooltip":function(d){return "پنسل کا رنگ تبدیل کرتا ہے."},
"createACircle":function(d){return "ایک دائرہ بنائیں"},
"createSnowflakeSquare":function(d){return "create a snowflake of type square"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "create a snowflake of type line"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "create a snowflake of type flower"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "degrees"},
"depth":function(d){return "گہرائی"},
"dots":function(d){return "pixels"},
"drawACircle":function(d){return "ایک دائرہ بنائیں"},
"drawAFlower":function(d){return "ایک پھول بنائیں"},
"drawAHexagon":function(d){return "ایک مسدس بنائیں"},
"drawAHouse":function(d){return "ایک گھر بنائیں"},
"drawAPlanet":function(d){return "ایک سیّارہ بنائیں"},
"drawARhombus":function(d){return "ایک معین بنائیں"},
"drawARobot":function(d){return "ایک روبوٹ بنائیں"},
"drawARocket":function(d){return "ایک راکٹ بنائیں"},
"drawASnowflake":function(d){return "draw a snowflake"},
"drawASnowman":function(d){return "ایک برف کا آدمی بنائیں"},
"drawASquare":function(d){return "ایک مربع بنائیں"},
"drawAStar":function(d){return "ایک ستارہ بنائیں"},
"drawATree":function(d){return "ایک درخت بنائیں"},
"drawATriangle":function(d){return "ایک مثلث بنائیں"},
"drawUpperWave":function(d){return "draw upper wave"},
"drawLowerWave":function(d){return "draw lower wave"},
"drawStamp":function(d){return "draw stamp"},
"heightParameter":function(d){return "height"},
"hideTurtle":function(d){return "فن کار چھپائیں"},
"jump":function(d){return "jump"},
"jumpBackward":function(d){return "پیچھے کی طرف چھلانگ لگائیں"},
"jumpForward":function(d){return "آگے کی طرف چھلانگ لگائیں"},
"jumpTooltip":function(d){return "Moves the artist without leaving any marks."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "لمبائی"},
"loopVariable":function(d){return "گنتی کرنے والا"},
"moveBackward":function(d){return "move backward by"},
"moveEastTooltip":function(d){return "مصور کو مشرق کی طرف بڑھاتا ہے."},
"moveForward":function(d){return "move forward by"},
"moveForwardTooltip":function(d){return "Moves the artist forward."},
"moveNorthTooltip":function(d){return "مصور کو جنوب کی طرف بڑھاتا ہے."},
"moveSouthTooltip":function(d){return "مصور کو جنوب کی طرف بڑھاتا ہے."},
"moveWestTooltip":function(d){return "مصور کو مغرب کی طرف بڑھاتا ہے."},
"moveTooltip":function(d){return "مصور کو آگے یا پیچھے کی طرف بتائی گئی مقدار کے مطابق بڑھاتا ہے."},
"notBlackColour":function(d){return "You need to set a color other than black for this puzzle."},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks.  You used %2."},
"penDown":function(d){return "پنسل نیچے"},
"penTooltip":function(d){return "پنسل کو اپر یا نیچے کرتا ہے، ڈرائنگ کرنے یا روکنے کے لیے."},
"penUp":function(d){return "پنسل اوپر"},
"reinfFeedbackMsg":function(d){return "یہاں ہے آپ کی ڈرائنگ! اس پر کام کرتے رہیں یا اگلے سوال پر چلیں."},
"setAlpha":function(d){return "مقررہ Alpha"},
"setColour":function(d){return "مقررہ رنگ"},
"setPattern":function(d){return "مقررہ ڈیزائن"},
"setWidth":function(d){return "مقررہ چوڑائی"},
"shareDrawing":function(d){return "اپنی ڈرائنگ دوسروں کو دکھائیں:"},
"showMe":function(d){return "مجھے دکھاؤ"},
"showTurtle":function(d){return "فن کار دکھاؤ"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "قدم"},
"tooFewColours":function(d){return "You need to use at least %1 different colors for this puzzle.  You used only %2."},
"turnLeft":function(d){return "بائیں طرف پلٹیں"},
"turnRight":function(d){return "دائیں طرف پلٹیں"},
"turnRightTooltip":function(d){return "مصور کو مخصوص زاویہ سے دائیں جانب موڑتا ہے."},
"turnTooltip":function(d){return "مصورکو بتائے گۓ ڈگری کے مطابق بائیں یا دائیں موڑتا ہے."},
"turtleVisibilityTooltip":function(d){return "مصور کو دکھاتا یا اندیکھا بناتا ہے."},
"widthTooltip":function(d){return "پنسل کی چوڑائی بدلتا ہے."},
"wrongColour":function(d){return "آپ کی تصویر غلط رنگ کی ہے. اس سوال کے لیے، اسے %1 ہونا چاہئیے."}};