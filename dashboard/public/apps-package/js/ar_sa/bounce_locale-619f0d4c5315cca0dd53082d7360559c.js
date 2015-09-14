var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "اقذف كرة"},
"bounceBallTooltip":function(d){return "اقذف الكرة على جسم لترتد عنه."},
"continue":function(d){return "استمرار"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "نفّذ"},
"elseCode":function(d){return "وإلا"},
"finalLevel":function(d){return "تهانينا! قمت بحل اللغز الأخير."},
"heightParameter":function(d){return "الارتفاع"},
"ifCode":function(d){return "إذا كان"},
"ifPathAhead":function(d){return "إذا كان الطريق سالكا"},
"ifTooltip":function(d){return "إذا كان هناك طريق في الإتجاه المحدد، قم بتنفيذ بعض الإجراءات."},
"ifelseTooltip":function(d){return "إذا كان الطريق سالكا في الاتجاه المحدد، قم بتنفيذ المربع البرمجي الأول من الإجراءات. وإلا، قم بتنفيذ المربع البرمجي الثاني من الإجراءات."},
"incrementOpponentScore":function(d){return "سجل نقطة الخصم"},
"incrementOpponentScoreTooltip":function(d){return "قم بإضافة نقطة إلى نتيجة الخصم الحالي."},
"incrementPlayerScore":function(d){return "تحصيل نقطة"},
"incrementPlayerScoreTooltip":function(d){return "أضف نقطة إلى نتيجة اللاعب الحالي."},
"isWall":function(d){return "هل هذا جدار"},
"isWallTooltip":function(d){return "إرجاع قيمة صحيح إذا كان هناك جدار"},
"launchBall":function(d){return "إطلاق كرة جديدة"},
"launchBallTooltip":function(d){return "إطلاق كرة في اللعب."},
"makeYourOwn":function(d){return "اصنع لعبة الارتداد الخاصة بك"},
"moveDown":function(d){return "تحريك لأسفل"},
"moveDownTooltip":function(d){return "تحريك المضرب إلى الأسفل."},
"moveForward":function(d){return "تحريك إلى الأمام"},
"moveForwardTooltip":function(d){return "تحريك اللاعب خطوة واحدة إلى الأمام."},
"moveLeft":function(d){return "تحريك إلى اليسار"},
"moveLeftTooltip":function(d){return "تحريك المضرب إلى اليسار."},
"moveRight":function(d){return "تحريك إلى اليمين"},
"moveRightTooltip":function(d){return "تحريك المضرب إلى اليمين."},
"moveUp":function(d){return "تحريك لأعلى"},
"moveUpTooltip":function(d){return "تحريك المضرب إلى أعلى."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"noPathAhead":function(d){return "الطريق مغلق"},
"noPathLeft":function(d){return "لايوجد طريق على اليسار"},
"noPathRight":function(d){return "لايوجد طريق على اليمين"},
"numBlocksNeeded":function(d){return "يمكن حل هذا اللغز باستخدام %1 مربعات برمجية."},
"pathAhead":function(d){return "الطريق سالك"},
"pathLeft":function(d){return "إذا يوجد طريق على اليسار"},
"pathRight":function(d){return "إذا يوجد طريق على اليمين"},
"pilePresent":function(d){return "يوجد تكدس"},
"playSoundCrunch":function(d){return "تشغيل صوت انسحاق"},
"playSoundGoal1":function(d){return "تشغيل صوت الهدف 1"},
"playSoundGoal2":function(d){return "تشغيل صوت الهدف 2"},
"playSoundHit":function(d){return "تشغيل صوت ضرب"},
"playSoundLosePoint":function(d){return "تشغيل صوت فقدان نقطة"},
"playSoundLosePoint2":function(d){return "تشغيل صوت فقدان نقطة 2"},
"playSoundRetro":function(d){return "تشغيل صوت الرجعية"},
"playSoundRubber":function(d){return "تشغيل صوت المطاط"},
"playSoundSlap":function(d){return "تشغيل صوت صفعة"},
"playSoundTooltip":function(d){return "تشغيل الصوت المختار."},
"playSoundWinPoint":function(d){return "تشغيل صوت الفوز بنقطة"},
"playSoundWinPoint2":function(d){return "تشغيل صوت الفوز بنقطة 2"},
"playSoundWood":function(d){return "تشغيل صوت الخشب"},
"putdownTower":function(d){return "ضع البرج في الأسفل"},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \"حاول مرة أخرى\" للعودة للعب اللعبة الخاصة بك."},
"removeSquare":function(d){return "إزالة مربع"},
"repeatUntil":function(d){return "التكرار حتى"},
"repeatUntilBlocked":function(d){return "التكرار طالما الطريق سالكا"},
"repeatUntilFinish":function(d){return "التكرار حتى النهاية"},
"scoreText":function(d){return "النتيجة: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "تعيين مشهد عشوائي"},
"setBackgroundHardcourt":function(d){return "تعيين مشهد الملعب"},
"setBackgroundRetro":function(d){return "تعيين مشهد رجعي"},
"setBackgroundTooltip":function(d){return "تعيين صورة الخلفية"},
"setBallRandom":function(d){return "تعيين كرة عشوائية"},
"setBallHardcourt":function(d){return "تعيين كرة الملعب"},
"setBallRetro":function(d){return "تعيين كرة رجعية"},
"setBallTooltip":function(d){return "تعيين صورة للكرة"},
"setBallSpeedRandom":function(d){return "تعيين عشوائي لسرعة الكرة"},
"setBallSpeedVerySlow":function(d){return "تعيين سرعة بطيئة جداً للكرة"},
"setBallSpeedSlow":function(d){return "تعيين سرعة بطيئة للكرة"},
"setBallSpeedNormal":function(d){return "تعيين سرعة عادية للكرة"},
"setBallSpeedFast":function(d){return "تعيين سرعة عالية للكرة"},
"setBallSpeedVeryFast":function(d){return "تعيين سرعة عالية جداً للكرة"},
"setBallSpeedTooltip":function(d){return "تعيين سرعة الكرة"},
"setPaddleRandom":function(d){return "تعيين مضرب عشوائي"},
"setPaddleHardcourt":function(d){return "تعيين مضرب للملعب"},
"setPaddleRetro":function(d){return "تعيين مضرب رجعي"},
"setPaddleTooltip":function(d){return "تعيين صورة المضرب"},
"setPaddleSpeedRandom":function(d){return "تعيين سرعة عشوائية للمضرب"},
"setPaddleSpeedVerySlow":function(d){return "تعيين سرعة بطيئة جداً للمضرب"},
"setPaddleSpeedSlow":function(d){return "تعيين سرعة بطيئة للمضرب"},
"setPaddleSpeedNormal":function(d){return "تعيين سرعة عادية للمضرب"},
"setPaddleSpeedFast":function(d){return "تعيين سرعة عالية للمضرب"},
"setPaddleSpeedVeryFast":function(d){return "تعيين سرعة عالية جداً للمضرب"},
"setPaddleSpeedTooltip":function(d){return "تعيين سرعة المضرب"},
"shareBounceTwitter":function(d){return "هل تريد تجربة لعبة الارتداد التي قمت بتصميمها؟ لقد كتبتها بنفسي باستخدام @codeorg"},
"shareGame":function(d){return "شارك لعبتك:"},
"turnLeft":function(d){return "اتجه إلى اليسار"},
"turnRight":function(d){return "اتجه إلى اليمين"},
"turnTooltip":function(d){return "تحويل اتجاه اللاعب يمينا أو يسارا بمقدار 90 درجة."},
"whenBallInGoal":function(d){return "عندما تكون الكرة في الهدف"},
"whenBallInGoalTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما تدخل الكرة في الهدف."},
"whenBallMissesPaddle":function(d){return "عندما لا تصيب الكرة المضرب"},
"whenBallMissesPaddleTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما لا تصيب الكرة المضرب."},
"whenDown":function(d){return "عند الضغط على السهم لأسفل"},
"whenDownTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم لأسفل."},
"whenGameStarts":function(d){return "عند بدء تشغيل اللعبة"},
"whenGameStartsTooltip":function(d){return "تنفيذ الإجراءات أدناه عند بدء تشغيل اللعبة."},
"whenLeft":function(d){return "عند الضغط على السهم الأيسر"},
"whenLeftTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيسر."},
"whenPaddleCollided":function(d){return "عندما تصيب الكرة المضرب"},
"whenPaddleCollidedTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما تصطدم الكرة بالمضرب."},
"whenRight":function(d){return "عند الضغط على السهم الأيمن"},
"whenRightTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيمن."},
"whenUp":function(d){return "عند الضغط على السهم لأعلى"},
"whenUpTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح سهم لأعلى."},
"whenWallCollided":function(d){return "عندما تضرب الكرة الجدار"},
"whenWallCollidedTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما تصطدم الكرة مع الجدار."},
"whileMsg":function(d){return "أكرر طالما"},
"whileTooltip":function(d){return "تكرار الإجراءات المغلقة حتى الوصول إلى نقطة النهاية."},
"yes":function(d){return "نعم"}};