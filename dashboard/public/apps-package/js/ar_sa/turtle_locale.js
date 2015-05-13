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
"blocksUsed":function(d){return "القطع المستخدمة : %1"},
"branches":function(d){return "فروع"},
"catColour":function(d){return "لون"},
"catControl":function(d){return "الحلقات"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "دوال"},
"catTurtle":function(d){return "الاجراءات"},
"catVariables":function(d){return "المتغيرات"},
"catLogic":function(d){return "منطق"},
"colourTooltip":function(d){return "تغيير لون القلم."},
"createACircle":function(d){return "إنشاء دائرة"},
"createSnowflakeSquare":function(d){return "أنشء ندفة الثلج مربع الشكل"},
"createSnowflakeParallelogram":function(d){return "أنشئ ندفة الثلج من نوع متوازي أضلاع"},
"createSnowflakeLine":function(d){return "أنشئء ندفة الثلج على شكل خط"},
"createSnowflakeSpiral":function(d){return "أنشئ ندفة الثلج على شكل دوامة"},
"createSnowflakeFlower":function(d){return "أنشئ ندفة الثلج على شكل زهرة"},
"createSnowflakeFractal":function(d){return "أنشئ ندفة الثلج من النوع النمطي هندسي متكرر"},
"createSnowflakeRandom":function(d){return "أنشئ ندفة الثلج نوع عشوائي"},
"createASnowflakeBranch":function(d){return "إنشاء فرع رقاقة الثلج"},
"degrees":function(d){return "درجات"},
"depth":function(d){return "عمق"},
"dots":function(d){return "بكسلات"},
"drawASquare":function(d){return "رسم مربع"},
"drawATriangle":function(d){return "رسم مثلث"},
"drawACircle":function(d){return "رسم دائرة"},
"drawAFlower":function(d){return "إرسم زهرة"},
"drawAHexagon":function(d){return "إرسم شكل سداسي"},
"drawAHouse":function(d){return "ارسم بيت"},
"drawAPlanet":function(d){return "إرسم كوكب"},
"drawARhombus":function(d){return "إرسم المعين"},
"drawARobot":function(d){return "إرسم إنسان آلي"},
"drawARocket":function(d){return "إرسم صاروخ"},
"drawASnowflake":function(d){return "إرسم ندفة الثلج"},
"drawASnowman":function(d){return "ارسم رجل الثلج"},
"drawAStar":function(d){return "إرسم نجمة"},
"drawATree":function(d){return "ارسم شجرة"},
"drawUpperWave":function(d){return "إرسم الموجة العليا"},
"drawLowerWave":function(d){return "إرسم الموجة السفلى"},
"drawStamp":function(d){return "أرسم طابع"},
"heightParameter":function(d){return "الأرتفاع"},
"hideTurtle":function(d){return "اخفاء الاعب"},
"jump":function(d){return "قفز"},
"jumpBackward":function(d){return "القفز الى الخلف بعدد"},
"jumpForward":function(d){return "القفز الى الامام بعدد"},
"jumpTooltip":function(d){return "تحريك الاعب بدون ترك اي علامات."},
"jumpEastTooltip":function(d){return "حرك الفنان للشرق دون ترك أي علامات."},
"jumpNorthTooltip":function(d){return "حرك الفنان للشمال دون ترك أي علامات."},
"jumpSouthTooltip":function(d){return "حرك الفنان للجنوب دون ترك أي علامات."},
"jumpWestTooltip":function(d){return "يتحرك الفنان للغرب دون ترك أي علامات."},
"lengthFeedback":function(d){return "لقد عملتها بشكل صحيح عدا ضبط طول التحرك."},
"lengthParameter":function(d){return "الطول"},
"loopVariable":function(d){return "عداد"},
"moveBackward":function(d){return "تقدم  الى الخلف بعدد"},
"moveEastTooltip":function(d){return "أنقل الفنان للشرق."},
"moveForward":function(d){return "تقدم الى الامام بعدد"},
"moveForwardTooltip":function(d){return "تقدم الاعب الى الامام."},
"moveNorthTooltip":function(d){return "حرك الفنان للشمال."},
"moveSouthTooltip":function(d){return "حرك الفنان للجنوب."},
"moveWestTooltip":function(d){return "حرك الفنان للغرب."},
"moveTooltip":function(d){return "تقدم الاعب الى الامام او الى الخلف بمقدار معين."},
"notBlackColour":function(d){return "أنت تحتاج الى تعيين لون غير اللون الاسود لهذا اللغز."},
"numBlocksNeeded":function(d){return "يمكنك حل هذا اللغز بواسطة %1 من القطع . انت استخدمت %2 ."},
"penDown":function(d){return "أخفض القلم"},
"penTooltip":function(d){return "أرفع أو أخفض القلم , لبدء أو ايقاف الرسم."},
"penUp":function(d){return "رفع القلم"},
"reinfFeedbackMsg":function(d){return "ها هو الرسم الخاص بك! إستمر في العمل عليه  أو توجه إلى اللغز التالي."},
"setColour":function(d){return "تعيين اللون"},
"setPattern":function(d){return "تعيين نمط"},
"setWidth":function(d){return "تعيين العرض"},
"shareDrawing":function(d){return "أنشر رسمك :"},
"showMe":function(d){return "أرني"},
"showTurtle":function(d){return "اظهار الاعب"},
"sizeParameter":function(d){return "الحجم"},
"step":function(d){return "خطوة"},
"tooFewColours":function(d){return "يجب عليك على الاقل استخدام %1 من مختلف الالوان لهذا اللغز . أنت استخدمت فقط %2 ."},
"turnLeft":function(d){return "أتجه الى اليسار بدرجة"},
"turnRight":function(d){return "أتجه إلى اليمين بدرجة"},
"turnRightTooltip":function(d){return "تحويل اتجاه الاعب الى اليمين بزاوية معينة."},
"turnTooltip":function(d){return "تحويل اتجاه الاعب الى اليسار او الى اليمين بالمقدار المحدد من الدرجات."},
"turtleVisibilityTooltip":function(d){return "جعل الاعب مرئي او مخفي ."},
"widthTooltip":function(d){return "تغيير عرض القلم."},
"wrongColour":function(d){return "لون صورتك خاطئ. لهذا اللغز، يجب أن يكون %1."}};