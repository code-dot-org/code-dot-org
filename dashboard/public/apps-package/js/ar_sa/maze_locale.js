var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "في قرص العسل"},
"atFlower":function(d){return "في زهرة"},
"avoidCowAndRemove":function(d){return "تجنب البقرة وازل 1"},
"continue":function(d){return "إستمرار"},
"dig":function(d){return "ازل 1"},
"digTooltip":function(d){return "ازل وحدة 1 من التراب"},
"dirE":function(d){return "ش"},
"dirN":function(d){return "شم"},
"dirS":function(d){return "ج"},
"dirW":function(d){return "شر"},
"doCode":function(d){return "نفّذ"},
"elseCode":function(d){return "والا"},
"fill":function(d){return "املأ 1"},
"fillN":function(d){return "املأ "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "ملء كومة من "+maze_locale.v(d,"shovelfuls")+" الثقوب"},
"fillSquare":function(d){return "املأ المربع"},
"fillTooltip":function(d){return "ضع وحدة 1 من التراب"},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"flowerEmptyError":function(d){return "الزهر التي تقف عليها لا تحتوي المزيد من الرحيق."},
"get":function(d){return "احصل على"},
"heightParameter":function(d){return "الأرتفاع"},
"holePresent":function(d){return "هناك حفرة"},
"honey":function(d){return "جعل العسل"},
"honeyAvailable":function(d){return "العسل"},
"honeyTooltip":function(d){return "جعل العسل من رحيق"},
"honeycombFullError":function(d){return "قُرص العسل هذا لا يتسع لمزيد من العسل."},
"ifCode":function(d){return "إذا"},
"ifInRepeatError":function(d){return "أنت تحتاج ان تستخدم قطعة \" اذا كان \" داخل قطعة \" أكرر \" . اذا واجهت اي مشكلة, حاول ان تستخدم الطريقة السابقة مرة اخرى من اجل معرفة كيف تعمل."},
"ifPathAhead":function(d){return "إذا كان الطريق سالكا"},
"ifTooltip":function(d){return "إذا كان هناك طريق في الإتجاه المحدد، قم بتنفيذ بعض الإجراءات."},
"ifelseTooltip":function(d){return "اذا كان هناك ممر في الأتجاه المحدد, إذن قم بتنفيذ أول أمر موجود, غير ذلك, قم بتنفيذ ثاني أمر موحود."},
"ifFlowerTooltip":function(d){return "اذا لم يكن هناك زهرة / عسل في الاتجاه المحدد , عندها قم ببعض الاجراءات ."},
"ifelseFlowerTooltip":function(d){return "إذا كان هناك زهرة / العسل في الاتجاه المحدد فاكتب الكتلة الأول من الإجراءات. خلاف ذلك،قم بكتابة كتلة الثاني من الإجراءات."},
"insufficientHoney":function(d){return "أنت تستخدم جميع القطع الصحيحة , لكنك بحاجة إلى وضع الكمية الصحيحة من العسل ."},
"insufficientNectar":function(d){return "أنت تستخدم جميع القطع الصحيحة , لكنك بحاجة إلى جمع الكمية الصحيحة من الرحيق ."},
"make":function(d){return "إجعل"},
"moveBackward":function(d){return "انتقل الى الخلف"},
"moveEastTooltip":function(d){return "نقل للشرق مسافة واحدة."},
"moveForward":function(d){return "تقدم للامام"},
"moveForwardTooltip":function(d){return "حركني للأمام خطوة واحدة"},
"moveNorthTooltip":function(d){return "نقل للشمال مسافة واحدة."},
"moveSouthTooltip":function(d){return "نقل للجنوب مسافة واحدة."},
"moveTooltip":function(d){return "انقل لي مساحة واحدة الى الامام و الى الوراء"},
"moveWestTooltip":function(d){return "نقل للغرب مسافة واحدة."},
"nectar":function(d){return "الحصول على الرحيق"},
"nectarRemaining":function(d){return "رحيق"},
"nectarTooltip":function(d){return "الحصول على الرحيق من زهرة"},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"noPathAhead":function(d){return "الممر مغلق"},
"noPathLeft":function(d){return "لايوجد ممر على اليسار"},
"noPathRight":function(d){return "لايوجد ممر على اليمين"},
"notAtFlowerError":function(d){return "يمكنك فقط الحصول على الرحيق من زهرة."},
"notAtHoneycombError":function(d){return "يمكنك فقط الحصول على العسل من قُرص العسل."},
"numBlocksNeeded":function(d){return "يمكن حل هذا الغز ب  %1 من القطع."},
"pathAhead":function(d){return "الممر سالك"},
"pathLeft":function(d){return "إذا يوجد ممر على اليسار"},
"pathRight":function(d){return "إذا يوجد ممر على اليمين"},
"pilePresent":function(d){return "هناك كومة"},
"putdownTower":function(d){return "ضع البرج"},
"removeAndAvoidTheCow":function(d){return "ازل 1 و تجنب البقرة"},
"removeN":function(d){return "ازالة "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "ازل الكدس"},
"removeStack":function(d){return "ازالة تكدس الاتربة بواسطة "+maze_locale.v(d,"shovelfuls")},
"removeSquare":function(d){return "قم بازالة المربع"},
"repeatCarefullyError":function(d){return "لحل هذه المشكلة ، فكر بعناية بنمط يتكون من حركتين والتفاف واحد لوضعه في مجموعة \"تكرار\". لا بأس من عمل التفاف إضافي في النهاية."},
"repeatUntil":function(d){return "كرّر حتى"},
"repeatUntilBlocked":function(d){return "بينما الممر للامام"},
"repeatUntilFinish":function(d){return "كرر حتى النهاية"},
"step":function(d){return "الخطوة"},
"totalHoney":function(d){return "مجموع العسل"},
"totalNectar":function(d){return "مجموع الرحيق"},
"turnLeft":function(d){return "اتجه إلى اليسار"},
"turnRight":function(d){return "اتجه الى اليمين"},
"turnTooltip":function(d){return "اتجه بي الي اليمين أو اليسار ب90 درجة."},
"uncheckedCloudError":function(d){return "تاكد من التحقق من جميع الغيوم لمعرفة فيما اذا كانت ازهاراً او عسلاً."},
"uncheckedPurpleError":function(d){return "تاكد من تحقق من جميع الزهور البنفسجية لمعرفة فيما اذا كان فيها رحيق"},
"whileMsg":function(d){return "أكرر طالما"},
"whileTooltip":function(d){return "كرر الاجراءات المغلقة حتى الوصول الى نقطة النهاية."},
"word":function(d){return "ابحث عن الكلمة"},
"yes":function(d){return "نعم"},
"youSpelled":function(d){return "ما قلته سابقا"}};