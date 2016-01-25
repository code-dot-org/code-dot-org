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
"blocksUsed":function(d){return "المربعات البرمجية المستخدمة: %1"},
"branches":function(d){return "فروع"},
"catColour":function(d){return "اللون"},
"catControl":function(d){return "الحلقات"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "دوال"},
"catTurtle":function(d){return "الإجراءات"},
"catVariables":function(d){return "المتغيرات"},
"catLogic":function(d){return "المنطق"},
"colourTooltip":function(d){return "تغيير لون القلم."},
"createACircle":function(d){return "إنشاء دائرة"},
"createSnowflakeSquare":function(d){return "إنشاء ندفة ثلج من نوع مربع"},
"createSnowflakeParallelogram":function(d){return "إنشاء ندفة ثلج من نوع متوازي أضلاع"},
"createSnowflakeLine":function(d){return "إنشاء ندفة ثلج من نوع خط"},
"createSnowflakeSpiral":function(d){return "إنشاء ندفة ثلج من نوع دوامة"},
"createSnowflakeFlower":function(d){return "إنشاء ندفة ثلج من نوع زهرة"},
"createSnowflakeFractal":function(d){return "إنشاء ندفة ثلج من نوع هندسي متكرر"},
"createSnowflakeRandom":function(d){return "إنشاء ندفة ثلج من نوع عشوائي"},
"createASnowflakeBranch":function(d){return "إنشاء فرع ندفة الثلج"},
"degrees":function(d){return "درجات"},
"depth":function(d){return "عمق"},
"dots":function(d){return "بكسل"},
"drawACircle":function(d){return "رسم دائرة"},
"drawAFlower":function(d){return "رسم زهرة"},
"drawAHexagon":function(d){return "رسم شكل سداسي"},
"drawAHouse":function(d){return "رسم منزل"},
"drawAPlanet":function(d){return "رسم كوكب"},
"drawARhombus":function(d){return "رسم المعيّن"},
"drawARobot":function(d){return "رسم إنسان آلي"},
"drawARocket":function(d){return "رسم صاروخ"},
"drawASnowflake":function(d){return "رسم ندفة الثلج"},
"drawASnowman":function(d){return "رسم رجل الثلج"},
"drawASquare":function(d){return "رسم مربع"},
"drawAStar":function(d){return "رسم نجمة"},
"drawATree":function(d){return "رسم شجرة"},
"drawATriangle":function(d){return "رسم مثلث"},
"drawUpperWave":function(d){return "رسم الموجة العليا"},
"drawLowerWave":function(d){return "رسم الموجة السفلى"},
"drawStamp":function(d){return "رسم ختم"},
"heightParameter":function(d){return "الارتفاع"},
"hideTurtle":function(d){return "إخفاء الفنان"},
"jump":function(d){return "قفز"},
"jumpBackward":function(d){return "القفز إلى الخلف بمقدار"},
"jumpForward":function(d){return "القفز إلى الأمام بمقدار"},
"jumpTooltip":function(d){return "تحريك الفنان دون ترك أي علامات."},
"jumpEastTooltip":function(d){return "تحريك الفنان تجاه الشرق دون ترك أي علامات."},
"jumpNorthTooltip":function(d){return "تحريك الفنان تجاه الشَمال دون ترك أي علامات."},
"jumpSouthTooltip":function(d){return "تحريك الفنان تجاه الجنوب دون ترك أي علامات."},
"jumpWestTooltip":function(d){return "تحريك الفنان تجاه الغرب دون ترك أي علامات."},
"lengthFeedback":function(d){return "أحسنت، قمت بتنفيذها بشكل صحيح عدا ضبط طول التحرك."},
"lengthParameter":function(d){return "الطول"},
"loopVariable":function(d){return "العداد"},
"moveBackward":function(d){return "تحريك إلى الخلف بمقدار"},
"moveEastTooltip":function(d){return "تحريك الفنان تجاه الشرق."},
"moveForward":function(d){return "التقدم إلى الأمام بمقدار"},
"moveForwardTooltip":function(d){return "تحريك الفنان إلى الأمام."},
"moveNorthTooltip":function(d){return "تحريك الفنان تجاه الشَمال."},
"moveSouthTooltip":function(d){return "تحريك الفنان تجاه الجنوب."},
"moveWestTooltip":function(d){return "تحريك الفنان تجاه الغرب."},
"moveTooltip":function(d){return "تحريك الفنان إلى الأمام أو إلى الخلف بمقدار معين."},
"notBlackColour":function(d){return "يجب تعيين لون غير اللون الأسود لهذا اللغز."},
"numBlocksNeeded":function(d){return "من الممكن حل هذا اللغز باستخدام %1 مربع برمجي. لقد استخدمت %2."},
"penDown":function(d){return "خفض القلم"},
"penTooltip":function(d){return "رفع أو خفض القلم، لبدء أو إيقاف الرسم."},
"penUp":function(d){return "رفع القلم"},
"reinfFeedbackMsg":function(d){return "ها هي رسمتك! بإمكانك الاستمرار في العمل عليها أو التوجه إلى اللغز التالي."},
"setAlpha":function(d){return "تعيين \"alpha\""},
"setColour":function(d){return "تعيين اللون"},
"setPattern":function(d){return "تعيين النمط"},
"setWidth":function(d){return "تعيين العرض"},
"shareDrawing":function(d){return "أنشر رسمتك:"},
"showMe":function(d){return "أَرِني"},
"showTurtle":function(d){return "إظهار الفنان"},
"sizeParameter":function(d){return "الحجم"},
"step":function(d){return "خطوة"},
"tooFewColours":function(d){return "يجب استخدام %1 ألوان مختلفة على الأقل لهذا اللغز. قمت أنت باستخدام %2 فقط."},
"turnLeft":function(d){return "اتجه إلى اليسار بمقدار"},
"turnRight":function(d){return "اتجه إلى اليمين بمقدار"},
"turnRightTooltip":function(d){return "تحويل اتجاه الفنان إلى اليمين بمقدار الزاوية المحددة."},
"turnTooltip":function(d){return "تحويل اتجاه الفنان إلى اليسار أو اليمين بعدد الدرجات المحددة."},
"turtleVisibilityTooltip":function(d){return "إظهاِر أو إخفاء الفنان."},
"widthTooltip":function(d){return "تغيير عرض القلم."},
"wrongColour":function(d){return "لون صورتك خاطئ. لهذا اللغز، يجب أن يكون اللون %1."}};