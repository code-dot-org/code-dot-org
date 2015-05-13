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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "كرة نطاطة"},
"bounceBallTooltip":function(d){return "اجعل الكرة تنط خارج الجسم."},
"continue":function(d){return "إستمرار"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "نفّذ"},
"elseCode":function(d){return "والا"},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"heightParameter":function(d){return "الأرتفاع"},
"ifCode":function(d){return "إذا"},
"ifPathAhead":function(d){return "إذا كان الطريق سالكا"},
"ifTooltip":function(d){return "إذا كان الطريق سالكا في الاتجاه المحدد , قم بتنفيذ بعض الاجراءات."},
"ifelseTooltip":function(d){return "إذا كان الطريق سالكا في الاتجاه المحدد , قم بتنفيذ القطعة الأولى من الاجراءات. والا, قم بتنفيذ القطعة الثانية من الاجراءات."},
"incrementOpponentScore":function(d){return "سجل نقطة الخصم"},
"incrementOpponentScoreTooltip":function(d){return "قم بإضافة واحد إلى نقاط الخصم الحالي."},
"incrementPlayerScore":function(d){return "تحصيل نقطة"},
"incrementPlayerScoreTooltip":function(d){return "اضف واحد إلى نتيجة الاعب الحالي."},
"isWall":function(d){return "هل هذا حائط"},
"isWallTooltip":function(d){return "يرجع \"true\" اذا كان هناك حائط"},
"launchBall":function(d){return "إطلاق كرة جديدة"},
"launchBallTooltip":function(d){return "إطلاق كرة في اللعب."},
"makeYourOwn":function(d){return "أصنع لعبة الوثب الخاصة بك"},
"moveDown":function(d){return "تحريك لأسفل"},
"moveDownTooltip":function(d){return "حرك المجداف الى الاسفل."},
"moveForward":function(d){return "تقدم للامام"},
"moveForwardTooltip":function(d){return "تقدم الاعب خطوة واحدة للامام ."},
"moveLeft":function(d){return "تحرك لليسار"},
"moveLeftTooltip":function(d){return "حرك المجداف الى اليسار."},
"moveRight":function(d){return "تحريك لليمين"},
"moveRightTooltip":function(d){return "حرك المجداف الى اليمين."},
"moveUp":function(d){return "تحريك لأعلى"},
"moveUpTooltip":function(d){return "حرك المجداف للاعلى."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"noPathAhead":function(d){return "الطريق مغلق"},
"noPathLeft":function(d){return "لايوجد طريق على اليسار"},
"noPathRight":function(d){return "لايوجد طريق على اليمين"},
"numBlocksNeeded":function(d){return "يمكن حل هذا الغز ب  %1 من القطع."},
"pathAhead":function(d){return "الطريق سالك"},
"pathLeft":function(d){return "إذا يوجد طريق على اليسار"},
"pathRight":function(d){return "إذا يوجد طريق على اليمين"},
"pilePresent":function(d){return "يوجد تكدس"},
"playSoundCrunch":function(d){return "تشغيل صوت انسحاق"},
"playSoundGoal1":function(d){return "تشغيل صوت الهدف 1"},
"playSoundGoal2":function(d){return "تشغيل صوت الهدف 2"},
"playSoundHit":function(d){return "تشغيل صوت ضرب"},
"playSoundLosePoint":function(d){return "تشغيل صوت فقد نقطة"},
"playSoundLosePoint2":function(d){return "تشغيل صوت فقد نقطة 2"},
"playSoundRetro":function(d){return "تشغيل صوت الرجعية"},
"playSoundRubber":function(d){return "تشغيل صوت المطاط"},
"playSoundSlap":function(d){return "تشغيل صوت صفعة"},
"playSoundTooltip":function(d){return "تشغيل الصوت المختار."},
"playSoundWinPoint":function(d){return "تشغيل صوت الفوز بنقطة"},
"playSoundWinPoint2":function(d){return "تشغيل صوت الفوز بنقطة 2"},
"playSoundWood":function(d){return "تشغيل صوت الخشب"},
"putdownTower":function(d){return "ضع البرج في الاسفل"},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \"حاول مرة أخرى\" للعودة للعب اللعبة الخاصة بك."},
"removeSquare":function(d){return "ازل المربع"},
"repeatUntil":function(d){return "كرّر حتى"},
"repeatUntilBlocked":function(d){return "أكرر طالما الطريق سالكا"},
"repeatUntilFinish":function(d){return "كرر حتى النهاية"},
"scoreText":function(d){return "نقاط: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "تعيين مشهد عشوائي"},
"setBackgroundHardcourt":function(d){return "تعيين مشهد صعب"},
"setBackgroundRetro":function(d){return "تعيين مشهد خلفي"},
"setBackgroundTooltip":function(d){return "تعيين صورة الخلفية"},
"setBallRandom":function(d){return "تعيين عشوائي للكرة"},
"setBallHardcourt":function(d){return "تعيين كرة صعبة"},
"setBallRetro":function(d){return "تعيين الكرة الخلفية"},
"setBallTooltip":function(d){return "تعيين صورة للكرة"},
"setBallSpeedRandom":function(d){return "تعيين عشوائي لسرعة الكرة"},
"setBallSpeedVerySlow":function(d){return "تعيين سرعة الكرة بطيء جداً"},
"setBallSpeedSlow":function(d){return "تعيين سرعة الكرة بطيء"},
"setBallSpeedNormal":function(d){return "تعيين سرعة عادية للكرة"},
"setBallSpeedFast":function(d){return "تعيين سرعة سريعة للكرة"},
"setBallSpeedVeryFast":function(d){return "تعيين سرعة للكرة سريعة جداً"},
"setBallSpeedTooltip":function(d){return "تعيين سرعة الكرة"},
"setPaddleRandom":function(d){return "تعيين مضرب عشوائي"},
"setPaddleHardcourt":function(d){return "تعيين مضرب صعب"},
"setPaddleRetro":function(d){return "تعيين مضرب خلفي"},
"setPaddleTooltip":function(d){return "تعيين صورة المضرب"},
"setPaddleSpeedRandom":function(d){return "تعيين سرعة المضرب عشوائي"},
"setPaddleSpeedVerySlow":function(d){return "تعيين سرعة بطيئة جداً للمضرب"},
"setPaddleSpeedSlow":function(d){return "تعيين سرعة بطيئة للمضرب"},
"setPaddleSpeedNormal":function(d){return "تعيين سرعة عادية للمضرب"},
"setPaddleSpeedFast":function(d){return "تعيين سرعة سريعة للمضرب"},
"setPaddleSpeedVeryFast":function(d){return "تعيين سرعة سريعة جداً للمضرب"},
"setPaddleSpeedTooltip":function(d){return "تعيين سرعة المضرب"},
"shareBounceTwitter":function(d){return "تحقق من لعبة الارتداد الذي قمت بها. لقد كتبتها بنفسي باستخدام @codeorg"},
"shareGame":function(d){return "شارك لعبتك:"},
"turnLeft":function(d){return "اتجه إلى اليسار"},
"turnRight":function(d){return "اتجه الى اليمين"},
"turnTooltip":function(d){return "تحويل اتجاه الرسام يمينا او يسارا بمقدار 90 درجة ."},
"whenBallInGoal":function(d){return "عندما تكون الكرة في الهدف"},
"whenBallInGoalTooltip":function(d){return "قم بتنفيذ الانشطة ادناه عندما تدخل كرة الى المرمى."},
"whenBallMissesPaddle":function(d){return "عندما لا تصيب الكرة المجداف"},
"whenBallMissesPaddleTooltip":function(d){return "يتم تنفيذ الاجراءات ادناها عندما لا تصيب المضرب الكرة."},
"whenDown":function(d){return "السهم لأسفل"},
"whenDownTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم لأسفل."},
"whenGameStarts":function(d){return "عند بدأ تشغيل اللعبة"},
"whenGameStartsTooltip":function(d){return "تنفيذ الإجراءات أدناه عند بدء تشغيل اللعبة."},
"whenLeft":function(d){return "السهم الايسر"},
"whenLeftTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيسر."},
"whenPaddleCollided":function(d){return "عندما تصيب الكرة المضرب"},
"whenPaddleCollidedTooltip":function(d){return "نفذ الأنشطة أدناه عندما تصطدم الكرة مع المجداف."},
"whenRight":function(d){return "السهم الأيمن"},
"whenRightTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيمن."},
"whenUp":function(d){return "عند الضغط على السهم لاعلى"},
"whenUpTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح سهم لأعلى."},
"whenWallCollided":function(d){return "عندما تضرب كرة الحائط"},
"whenWallCollidedTooltip":function(d){return "نفذ الانشطة ادناه عندما تصطدم كرة بالحائط."},
"whileMsg":function(d){return "أكرر طالما"},
"whileTooltip":function(d){return "أكرر الاجراءات المغلقة حتى الوصول الى نقطة النهاية."},
"yes":function(d){return "نعم"}};