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
"blocksUsed":function(d){return "بلوک های استفاده شده: %1"},
"branches":function(d){return "شاخه"},
"catColour":function(d){return "رنگ"},
"catControl":function(d){return "حلقه‌ها"},
"catMath":function(d){return "حساب"},
"catProcedures":function(d){return "توابع"},
"catTurtle":function(d){return "عملیات"},
"catVariables":function(d){return "متغیرها"},
"catLogic":function(d){return "منطق"},
"colourTooltip":function(d){return "رنگ قلم را تغییر می دهد."},
"createACircle":function(d){return "ایجاد یک دایره"},
"createSnowflakeSquare":function(d){return "یک دانه برف از نوع مربع بساز"},
"createSnowflakeParallelogram":function(d){return "یک دانه ی برف از نوع متوازی الاضلاع بساز"},
"createSnowflakeLine":function(d){return "یک دانه برف از نوع خط ایجاد کن "},
"createSnowflakeSpiral":function(d){return "یک دانه ی برف مارپیچی ایجاد کن "},
"createSnowflakeFlower":function(d){return "یک دانه ی برف از نوع گل ایجاد کن"},
"createSnowflakeFractal":function(d){return "یک دانه ی برف از نوع فراکتال ایجاد کن "},
"createSnowflakeRandom":function(d){return "یک دانه ی برف تصادفی ایجاد کن "},
"createASnowflakeBranch":function(d){return "یک شاخه از دانه ی برف ایجاد کن"},
"degrees":function(d){return "درجه"},
"depth":function(d){return "عمق"},
"dots":function(d){return "پیکسل"},
"drawASquare":function(d){return "یک مربع بکشید"},
"drawATriangle":function(d){return "یک مثلث بکشید"},
"drawACircle":function(d){return "یک دایره بکشید"},
"drawAFlower":function(d){return "یک گل نقاشی بکن"},
"drawAHexagon":function(d){return "یک شش ضلعی بکش"},
"drawAHouse":function(d){return "یک خانه بکشید"},
"drawAPlanet":function(d){return "یک سیاره بکش"},
"drawARhombus":function(d){return "یک لوزی بکش"},
"drawARobot":function(d){return "یک ربات بکش"},
"drawARocket":function(d){return "یک موشک بکش"},
"drawASnowflake":function(d){return "یک دانه ی برف بکش"},
"drawASnowman":function(d){return "یک آدم برفی بکشید"},
"drawAStar":function(d){return "رسم یک ستاره"},
"drawATree":function(d){return "یک درخت بکشید"},
"drawUpperWave":function(d){return "موج بالایی را نقاشی کن"},
"drawLowerWave":function(d){return "موج پایینی را نقاشی کن"},
"drawStamp":function(d){return "مُهر را نقاشی کن"},
"heightParameter":function(d){return "ارتفاع"},
"hideTurtle":function(d){return "هنرمند را پنهان کن"},
"jump":function(d){return "پرش"},
"jumpBackward":function(d){return "پرش به عقب به اندازه"},
"jumpForward":function(d){return "پرش به جلو به اندازه"},
"jumpTooltip":function(d){return "هنرمند را حرکت می دهد بدون اینکه اثری جا بذارد."},
"jumpEastTooltip":function(d){return "هنرمند را به شرق ببر بدون این که اثری باقی بگذاری."},
"jumpNorthTooltip":function(d){return "هنرمند را به شمال ببر بدون این که اثری باقی بگذاری."},
"jumpSouthTooltip":function(d){return "هنرمند را به جنوب ببر بدون این که اثری باقی بگذاری."},
"jumpWestTooltip":function(d){return "هنرمند را به غرب ببر بدون این که اثری باقی بگذاری."},
"lengthFeedback":function(d){return "تو بجز طول حرکت آن را درست انجام دادی."},
"lengthParameter":function(d){return "طول"},
"loopVariable":function(d){return "شمارشگر"},
"moveBackward":function(d){return "انتقال به عقب با اندازه"},
"moveEastTooltip":function(d){return "هنرمند را به شرق ببر."},
"moveForward":function(d){return "انتقال به جلو به اندازه"},
"moveForwardTooltip":function(d){return "هنرمند رو به جلو حرکت می دهد."},
"moveNorthTooltip":function(d){return "هنرمند را به شمال ببر."},
"moveSouthTooltip":function(d){return "هنرمند را به جنوب ببر."},
"moveWestTooltip":function(d){return "هنرمند را به غرب ببر."},
"moveTooltip":function(d){return "هنرمند را به جلو یا عقب با مقدار مشخص شده حرکت می دهد."},
"notBlackColour":function(d){return "شما برای این پازل باید از رنگی به جز مشکی استفاده کنید."},
"numBlocksNeeded":function(d){return "این پازل به %1 بلوک برای تکمیل نیاز دارد. شما از %2 عدد استفاده کرده اید."},
"penDown":function(d){return "مداد پایین"},
"penTooltip":function(d){return "مداد را بالا و پایین میکشد، که نقاشی را شروع یا تمام کند."},
"penUp":function(d){return "مداد بالا"},
"reinfFeedbackMsg":function(d){return "این نقاشی تو است! همچنان روی آن کار کن یا به پازل بعدی برو."},
"setColour":function(d){return "رنگ را تعیین کنید"},
"setPattern":function(d){return "الگو را تعیین کن"},
"setWidth":function(d){return "عرض را تعیین کنید"},
"shareDrawing":function(d){return "نقاشی خود را به اشتراک بگذارید:"},
"showMe":function(d){return "نمایش بده"},
"showTurtle":function(d){return "نشان دادن هنرمند"},
"sizeParameter":function(d){return "اندازه"},
"step":function(d){return "گام"},
"tooFewColours":function(d){return "شما برای این پازل احتیاج حداقل نیاز به استفاده از  %1 رنگ دارید. شما فقط از %2 رنگ استفاده کرده اید."},
"turnLeft":function(d){return "چرخش به چپ به اندازه"},
"turnRight":function(d){return "چرخش به راست به اندازه"},
"turnRightTooltip":function(d){return "هنرمند را با زاویه مشخص به راست می چرخاند."},
"turnTooltip":function(d){return "هنرمند را با شماره درجه مشخص به راست یا چپ می چرخاند."},
"turtleVisibilityTooltip":function(d){return "هنرمند را قابل مشاهده یا مخفی می کند."},
"widthTooltip":function(d){return "عرض قلم را تغییر می دهد."},
"wrongColour":function(d){return "رنگ تصویر نادرست است. برای این پازل باید به رنگ %1 باشد."}};