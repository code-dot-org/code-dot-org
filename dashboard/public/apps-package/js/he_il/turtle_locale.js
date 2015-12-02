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
"blocksUsed":function(d){return "בלוקים בשימוש: %1"},
"branches":function(d){return "ענפים"},
"catColour":function(d){return "צבע"},
"catControl":function(d){return "חזרות"},
"catMath":function(d){return "מתמטיקה"},
"catProcedures":function(d){return "פונקציות"},
"catTurtle":function(d){return "פעולות"},
"catVariables":function(d){return "משתנים"},
"catLogic":function(d){return "לוגיקה"},
"colourTooltip":function(d){return "משנה את צבע העיפרון."},
"createACircle":function(d){return "צור עיגול"},
"createSnowflakeSquare":function(d){return "צור פתית שלג מסוג מרובע"},
"createSnowflakeParallelogram":function(d){return "צור פתית שלג מסוג מקבילית"},
"createSnowflakeLine":function(d){return "צור פתית שלג מסוג קו"},
"createSnowflakeSpiral":function(d){return "צור פתית שלג מסוג ספירלה"},
"createSnowflakeFlower":function(d){return "צור פתית שלג מסוג פרח"},
"createSnowflakeFractal":function(d){return "צור פתית שלג מסוג פרקטל"},
"createSnowflakeRandom":function(d){return "צור פתית שלג מסוג אקראי"},
"createASnowflakeBranch":function(d){return "צור ענף של פתית שלג"},
"degrees":function(d){return "מעלות"},
"depth":function(d){return "עומק"},
"dots":function(d){return "פיקסלים"},
"drawACircle":function(d){return "צייר מעגל"},
"drawAFlower":function(d){return "צייר פרח"},
"drawAHexagon":function(d){return "צייר משושה"},
"drawAHouse":function(d){return "צייר בית"},
"drawAPlanet":function(d){return "צייר כוכב לכת"},
"drawARhombus":function(d){return "צייר מעויין"},
"drawARobot":function(d){return "צייר רובוט"},
"drawARocket":function(d){return "צייר טיל"},
"drawASnowflake":function(d){return "צייר פתית שלג"},
"drawASnowman":function(d){return "צייר איש שלג"},
"drawASquare":function(d){return "צייר ריבוע"},
"drawAStar":function(d){return "צייר כוכב"},
"drawATree":function(d){return "צייר עץ"},
"drawATriangle":function(d){return "צייר משולש"},
"drawUpperWave":function(d){return "צייר גל עליון"},
"drawLowerWave":function(d){return "צייר גל תחתון"},
"drawStamp":function(d){return "צייר בול"},
"heightParameter":function(d){return "גובה"},
"hideTurtle":function(d){return "הסתר את האמן"},
"jump":function(d){return "קפוץ"},
"jumpBackward":function(d){return "קפוץ אחורה"},
"jumpForward":function(d){return "קפוץ קדימה"},
"jumpTooltip":function(d){return "להזיז את האמן מבלי להשאיר סימנים."},
"jumpEastTooltip":function(d){return "הזז/י את האומן מזרחה בלי להשאיר אף סימן."},
"jumpNorthTooltip":function(d){return "הזז/י את האומן צפונה בלי להשאיר אף סימן."},
"jumpSouthTooltip":function(d){return "הזז/י את האומן דרומה בלי להשאיר אף סימן."},
"jumpWestTooltip":function(d){return "הזז/י את האומן מערבה בלי להשאיר אף סימן."},
"lengthFeedback":function(d){return "תשובה נכונה, למעט אורכי התזוזה."},
"lengthParameter":function(d){return "אורך"},
"loopVariable":function(d){return "סופר"},
"moveBackward":function(d){return "הזז אחורה"},
"moveEastTooltip":function(d){return "מזיז את האומן מזרחה."},
"moveForward":function(d){return "הזז קדימה"},
"moveForwardTooltip":function(d){return "הזז את האמן קדימה."},
"moveNorthTooltip":function(d){return "מזיז את האומן צפונה."},
"moveSouthTooltip":function(d){return "מזיז את האומן דרומה."},
"moveWestTooltip":function(d){return "מזיז את האומן מערבה."},
"moveTooltip":function(d){return "מזיז את האמן קדימה או אחורה לפי הכמות שצוינה."},
"notBlackColour":function(d){return "צריך להשתמש בצבע ששונה משחור בשביל החידה הזאת."},
"numBlocksNeeded":function(d){return "את החידה הזאת אפשר לפתור עם %1 בלוקים. השתמשת ב %2."},
"penDown":function(d){return "הורד את העיפרון"},
"penTooltip":function(d){return "מרים או מוריד את העפרון, כדי להתחיל או להפסיק לצייר."},
"penUp":function(d){return "הרם את העיפרון"},
"reinfFeedbackMsg":function(d){return "הנה הציור שלך! המשך לעבוד עליו או המשך לחידה הבאה."},
"setAlpha":function(d){return "הגדר אלפא"},
"setColour":function(d){return "צבע קבוע"},
"setPattern":function(d){return "הגדר דפוס קבוע"},
"setWidth":function(d){return "העובי הקבוע"},
"shareDrawing":function(d){return "שתף את הציור שלך:"},
"showMe":function(d){return "הראה לי"},
"showTurtle":function(d){return "הראה את האמן"},
"sizeParameter":function(d){return "גודל"},
"step":function(d){return "צעד"},
"tooFewColours":function(d){return "צריך להשתמש בלפחות %1 צבעים שונים בשביל החידה הזאת. השתמשת רק ב %2."},
"turnLeft":function(d){return "פנה שמאלה"},
"turnRight":function(d){return "פנה ימינה"},
"turnRightTooltip":function(d){return "סובב את האמן ימינה במעלות המצויינות."},
"turnTooltip":function(d){return "סובב את האמן שמאלה או ימינה על פי מספר המעלות שמצויין."},
"turtleVisibilityTooltip":function(d){return "הפוך את האמן לנראה או בלתי-נראה."},
"widthTooltip":function(d){return "שנה את עובי העיפרון."},
"wrongColour":function(d){return "התמונה בצבע לא נכון. לחידה הזאת, היא צריכה להיות %1."}};