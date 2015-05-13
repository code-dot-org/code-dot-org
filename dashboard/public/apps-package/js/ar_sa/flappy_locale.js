var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "استمرار"},
"doCode":function(d){return "نفّذ"},
"elseCode":function(d){return "والا"},
"endGame":function(d){return "نهاية اللعبة"},
"endGameTooltip":function(d){return "تنتهي اللعبة."},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"flap":function(d){return "رفرف"},
"flapRandom":function(d){return "رفرف كمية عشوائية"},
"flapVerySmall":function(d){return "رفرف كمية صغيرة جداً"},
"flapSmall":function(d){return "رفرف كمية صغيرة"},
"flapNormal":function(d){return "رفرف كمية عادية"},
"flapLarge":function(d){return "رفرف كمية كبيرة"},
"flapVeryLarge":function(d){return "رفرف كمية كبيرة جداً"},
"flapTooltip":function(d){return "طير فلابي إلى الأعلى."},
"flappySpecificFail":function(d){return "الكود البرمجي الخاص بك يبدو جيداً - سوف يرفرف مع كل نقرة. ولاكن تحتاج إلى عدة نقرات للوصول إلى الهدف."},
"incrementPlayerScore":function(d){return "تسجيل نقطة"},
"incrementPlayerScoreTooltip":function(d){return "اضف واحد إلى نتيجة الاعب الحالي."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا اللغز مع  % 1 من الكتل."},
"playSoundRandom":function(d){return "تشغيل صوت عشوائي"},
"playSoundBounce":function(d){return "تشغيل صوت ارتداد"},
"playSoundCrunch":function(d){return "تشغيل صوت انسحاق"},
"playSoundDie":function(d){return "تشغيل صوت حزين"},
"playSoundHit":function(d){return "تشغيل صوت ضربة عنيفة"},
"playSoundPoint":function(d){return "تشغيل صوت ربح نقطة"},
"playSoundSwoosh":function(d){return "تشغيل صوت كاسح"},
"playSoundWing":function(d){return "تشغيل صوت الأجنحة"},
"playSoundJet":function(d){return "تشغيل صوت طائرة"},
"playSoundCrash":function(d){return "تشغيل صوت تحطيم"},
"playSoundJingle":function(d){return "تشغيل صوت خشخشة"},
"playSoundSplash":function(d){return "تشغيل صوت دفقة"},
"playSoundLaser":function(d){return "تشغيل صوت الليزر"},
"playSoundTooltip":function(d){return "تشغيل الصوت المختار."},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \"حاول مرة أخرى\" للعودة للعبة الخاصة بك."},
"scoreText":function(d){return "النقاط: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "تعيين المشهد"},
"setBackgroundRandom":function(d){return "تعيين مشهد عشوائي"},
"setBackgroundFlappy":function(d){return "تعيين مشهد المدينة (النهار)"},
"setBackgroundNight":function(d){return "تعيين مشهد المدينة (اليل)"},
"setBackgroundSciFi":function(d){return "تعيين مشهد الخيال العلمي"},
"setBackgroundUnderwater":function(d){return "تعيين مشهد تحت الماء"},
"setBackgroundCave":function(d){return "تعيين مشهد كهف"},
"setBackgroundSanta":function(d){return "تعيين مشهد سانتا"},
"setBackgroundTooltip":function(d){return "تحديد صورة الخلفية"},
"setGapRandom":function(d){return "وضع فجوة عشوائية"},
"setGapVerySmall":function(d){return "وضع فجوة صغيرة جداً"},
"setGapSmall":function(d){return "وضع فجوة صغيرة"},
"setGapNormal":function(d){return "وضع فجوة عادية"},
"setGapLarge":function(d){return "وضع فجوة كبيرة"},
"setGapVeryLarge":function(d){return "وضع فجوة كبيرة جداً"},
"setGapHeightTooltip":function(d){return "يعين الفراغ العمودي في عقبة"},
"setGravityRandom":function(d){return "تعيين جاذبية عشوائية"},
"setGravityVeryLow":function(d){return "تعيين جاذبية ضعيفة جدا"},
"setGravityLow":function(d){return "تعيين جاذبية ضعيفة"},
"setGravityNormal":function(d){return "تعيين جاذبية عادية"},
"setGravityHigh":function(d){return "تعيين جاذبية عالية"},
"setGravityVeryHigh":function(d){return "تعيين جاذبية عالية جدا"},
"setGravityTooltip":function(d){return "يعين مستوى الجاذبية"},
"setGround":function(d){return "تعيين الأرض"},
"setGroundRandom":function(d){return "تعيين عشوائي لسطح الأرض"},
"setGroundFlappy":function(d){return "تعيين الأرضية أرض"},
"setGroundSciFi":function(d){return "تعيين الأرضية أرض خيال علمي"},
"setGroundUnderwater":function(d){return "تعيين الأرضية تحت الماء"},
"setGroundCave":function(d){return "تعيين الأرضية كهف"},
"setGroundSanta":function(d){return "تعيين الأرضية سانتا"},
"setGroundLava":function(d){return "تعيين الأرضية حمم بركانية"},
"setGroundTooltip":function(d){return "تعيين الأرض صورة"},
"setObstacle":function(d){return "تعيين عقبة"},
"setObstacleRandom":function(d){return "تعيين عقبة عشوائية"},
"setObstacleFlappy":function(d){return "تعيين عقبة الأنابيب"},
"setObstacleSciFi":function(d){return "تعيين عقبة الخيال العلمي"},
"setObstacleUnderwater":function(d){return "تعيين عقبة النبات"},
"setObstacleCave":function(d){return "تعيين عقبة المغارة"},
"setObstacleSanta":function(d){return "تعيين عقبة المدخنة"},
"setObstacleLaser":function(d){return "تعيين عقبة الليزر"},
"setObstacleTooltip":function(d){return "يعين عقبة صورة"},
"setPlayer":function(d){return "تعيين لاعب"},
"setPlayerRandom":function(d){return "تعيين لاعب عشوائيا"},
"setPlayerFlappy":function(d){return "تعيين لاعب \"الطائر الأصفر\""},
"setPlayerRedBird":function(d){return "تعيين لاعب \"الطائر الأحمر\""},
"setPlayerSciFi":function(d){return "تعيين لاعب \"سفينة الفضاء\""},
"setPlayerUnderwater":function(d){return "تعيين لاعب \"سمكة\""},
"setPlayerCave":function(d){return "تعيين لاعب \"خفاش\""},
"setPlayerSanta":function(d){return "تعيين لاعب \"سانتا\""},
"setPlayerShark":function(d){return "تعيين لاعب \"سمكة القرش\""},
"setPlayerEaster":function(d){return "تعيين لاعب \"الأرنوب\""},
"setPlayerBatman":function(d){return "تعيين لاعب \"الرجل الخفاش\""},
"setPlayerSubmarine":function(d){return "تعيين لاعب \"الغواصة\""},
"setPlayerUnicorn":function(d){return "تعيين لاعب \"الحصان الخرافي\""},
"setPlayerFairy":function(d){return "تعيين لاعب \"جنية\""},
"setPlayerSuperman":function(d){return "تعيين لاعب \"الرجل فلابي\""},
"setPlayerTurkey":function(d){return "تعيين لاعب \"الديك الرومي\""},
"setPlayerTooltip":function(d){return "يعين صورة الاعب"},
"setScore":function(d){return "تعيين نقاط"},
"setScoreTooltip":function(d){return "يعين مجموع نقاط الاعب"},
"setSpeed":function(d){return "ضبط السرعة"},
"setSpeedTooltip":function(d){return "يحدد سرعة المستوى"},
"shareFlappyTwitter":function(d){return "إفحص لعبة 'Flappy' الخاصة بي. لقد صنعتها بنفسي عند codeorg@"},
"shareGame":function(d){return "شارك لعبتك:"},
"soundRandom":function(d){return "عشوائي"},
"soundBounce":function(d){return "ترتد"},
"soundCrunch":function(d){return "سحق"},
"soundDie":function(d){return "حزين"},
"soundHit":function(d){return "سحق"},
"soundPoint":function(d){return "نقطة"},
"soundSwoosh":function(d){return "سووش"},
"soundWing":function(d){return "الجناح"},
"soundJet":function(d){return "التدفق"},
"soundCrash":function(d){return "تحطم"},
"soundJingle":function(d){return "جلجل"},
"soundSplash":function(d){return "سبلاش"},
"soundLaser":function(d){return "الليزر"},
"speedRandom":function(d){return "ضبط السرعة عشوائيا"},
"speedVerySlow":function(d){return "ضبط سرعة ضئيلة جدا"},
"speedSlow":function(d){return "ضبط سرعة ضئيلة"},
"speedNormal":function(d){return "تعيين سرعة عادية"},
"speedFast":function(d){return "تعيين سرعة عالية"},
"speedVeryFast":function(d){return "تعيين سرعة عالية جداً"},
"whenClick":function(d){return "عند النقر"},
"whenClickTooltip":function(d){return "تنفيذ الإجراءات أدناه عند حدوث حدث النقر."},
"whenCollideGround":function(d){return "عند الإرتطام بالأرض"},
"whenCollideGroundTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما يرتطم فلابي بالأرض."},
"whenCollideObstacle":function(d){return "عند الإصطدام بعقبة"},
"whenCollideObstacleTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما يصطدم فلابي بعقبة."},
"whenEnterObstacle":function(d){return "عند مرور العقبة"},
"whenEnterObstacleTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما يدخل فلابي العقبة."},
"whenRunButtonClick":function(d){return "عند بدأ تشغيل اللعبة"},
"whenRunButtonClickTooltip":function(d){return "تنفيذ الإجراءات أدناه عند بدء تشغيل اللعبة."},
"yes":function(d){return "نعم"}};