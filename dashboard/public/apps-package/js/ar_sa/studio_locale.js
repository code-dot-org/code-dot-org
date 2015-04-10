var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "الممثل"},
"alienInvasion":function(d){return "غزو الكائنات الفضائية!"},
"backgroundBlack":function(d){return "الأسود"},
"backgroundCave":function(d){return "كهف"},
"backgroundCloudy":function(d){return "غائم"},
"backgroundHardcourt":function(d){return "الملاعب"},
"backgroundNight":function(d){return "ليلة"},
"backgroundUnderwater":function(d){return "تحت الماء"},
"backgroundCity":function(d){return "مدينة"},
"backgroundDesert":function(d){return "الصحراء"},
"backgroundRainbow":function(d){return "قوس الألوان"},
"backgroundSoccer":function(d){return "كرة القدم"},
"backgroundSpace":function(d){return "مسافة"},
"backgroundTennis":function(d){return "كرة المضرب"},
"backgroundWinter":function(d){return "فصل الشتاء"},
"catActions":function(d){return "الاجراءات"},
"catControl":function(d){return "الحلقات"},
"catEvents":function(d){return "الأحداث"},
"catLogic":function(d){return "العمليات المنطقية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "دوال"},
"catText":function(d){return "الجمل"},
"catVariables":function(d){return "المتغيرات"},
"changeScoreTooltip":function(d){return "إضافة أو إزالة نقطة ليسجل."},
"changeScoreTooltipK1":function(d){return "إضافة نقطة إلى النقاط."},
"continue":function(d){return "أستمر"},
"decrementPlayerScore":function(d){return "إزالة نقطة"},
"defaultSayText":function(d){return "اكتب هنا"},
"emotion":function(d){return "الحالة"},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"for":function(d){return "لـ"},
"hello":function(d){return "مرحباً"},
"helloWorld":function(d){return "مرحباً بالعالم!"},
"incrementPlayerScore":function(d){return "عدد النقاط"},
"makeProjectileDisappear":function(d){return "يختفي"},
"makeProjectileBounce":function(d){return "إرتداد"},
"makeProjectileBlueFireball":function(d){return "اصنع كرة نارية زرقاء"},
"makeProjectilePurpleFireball":function(d){return "اصنع كرة نارية بنفسجية"},
"makeProjectileRedFireball":function(d){return "اصنع كرة ملتهبة حمراء"},
"makeProjectileYellowHearts":function(d){return "إصنع قلوب صفراء"},
"makeProjectilePurpleHearts":function(d){return "اصنع قلوب بنفسجية"},
"makeProjectileRedHearts":function(d){return "إصنع قلوب حمراء"},
"makeProjectileTooltip":function(d){return "جعل القذيفة التي اصطدمت فقط تختفي أو ترتد."},
"makeYourOwn":function(d){return "اصنع تطبيق مختبر اللعب خاصتك"},
"moveDirectionDown":function(d){return "إلى أسفل"},
"moveDirectionLeft":function(d){return "اليسار"},
"moveDirectionRight":function(d){return "اليمين"},
"moveDirectionUp":function(d){return "لأعلى"},
"moveDirectionRandom":function(d){return "عشوائي"},
"moveDistance25":function(d){return "25 بكسل"},
"moveDistance50":function(d){return "50 بكسل"},
"moveDistance100":function(d){return "100 بكسل"},
"moveDistance200":function(d){return "200 بكسل"},
"moveDistance400":function(d){return "400 بكسل"},
"moveDistancePixels":function(d){return "بكسلات"},
"moveDistanceRandom":function(d){return " بكسل عشوائي"},
"moveDistanceTooltip":function(d){return "التحرك فاعل على مسافة محددة في الاتجاه المحدد."},
"moveSprite":function(d){return "تحرك"},
"moveSpriteN":function(d){return "تحريك الصورة "+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "إلى y,x"},
"moveDown":function(d){return "تحريك لأسفل"},
"moveDownTooltip":function(d){return "نقل عنصر فاعل إلى أسفل."},
"moveLeft":function(d){return "تحرك لليسار"},
"moveLeftTooltip":function(d){return "نقل عنصر فاعل إلى اليسار."},
"moveRight":function(d){return "تحريك لليمين"},
"moveRightTooltip":function(d){return "نقل عنصر فاعل إلى اليمين."},
"moveUp":function(d){return "تحريك لأعلى"},
"moveUpTooltip":function(d){return "تحريك عنصر فاعل لأعلى."},
"moveTooltip":function(d){return "نقل عنصر فاعل."},
"nextLevel":function(d){return "تهانينا ! لقد تم الانتهاء من اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا اللغز مع قطع %1."},
"onEventTooltip":function(d){return "نفذ الكود استجابة للحدث المحدَّد."},
"ouchExclamation":function(d){return "أي (الم) !"},
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
"positionOutTopLeft":function(d){return "إلى الموضع الأيسر العلوي أعلاه"},
"positionOutTopRight":function(d){return "إلى الموضع الأيمن العلوي أعلاه"},
"positionTopOutLeft":function(d){return "إلى الأعلى خارج الموضع الأيسر"},
"positionTopLeft":function(d){return "إلى أعلى يسار"},
"positionTopCenter":function(d){return "إلى أعلى المركز"},
"positionTopRight":function(d){return "إلى الأيمن العلوي"},
"positionTopOutRight":function(d){return "إلى الموضع الأيمن العلوي الخارجي"},
"positionMiddleLeft":function(d){return "إلى الوسط الأيسر"},
"positionMiddleCenter":function(d){return "إلى مركز الوسط"},
"positionMiddleRight":function(d){return "الى يمين الوسط"},
"positionBottomOutLeft":function(d){return "إلى الأسفل خارج الموضع الأيسر"},
"positionBottomLeft":function(d){return "إلى الأيسر السفلي"},
"positionBottomCenter":function(d){return "إلى مركز القاع"},
"positionBottomRight":function(d){return "إلى الأيمن السفلي"},
"positionBottomOutRight":function(d){return "إلى الأسفل خارج الموقف الايمن"},
"positionOutBottomLeft":function(d){return "لأسفل أسفل اليسار موقف"},
"positionOutBottomRight":function(d){return "لأدناه الموضع الأيمن السفلي"},
"positionRandom":function(d){return "إلى مكان عشوائي"},
"projectileBlueFireball":function(d){return "كرة ملتهبة زرقاء"},
"projectilePurpleFireball":function(d){return "كرة ملتهبة أرجوانية"},
"projectileRedFireball":function(d){return "كرة ملتهبة حمراء"},
"projectileYellowHearts":function(d){return "قلوب صفراء"},
"projectilePurpleHearts":function(d){return "قلوب أرجوانية"},
"projectileRedHearts":function(d){return "قلوب حمراء"},
"projectileRandom":function(d){return "عشوائي"},
"projectileAnna":function(d){return "خطاف"},
"projectileElsa":function(d){return "بريق"},
"projectileHiro":function(d){return "بوتات مجهرية"},
"projectileBaymax":function(d){return "صاروخ"},
"projectileRapunzel":function(d){return "مقلاة الصلصة"},
"projectileCherry":function(d){return "كرز"},
"projectileIce":function(d){return "ثلج"},
"projectileDuck":function(d){return "بطة"},
"reinfFeedbackMsg":function(d){return "يمكنك النقر على زر \"استمر بالتشغيل\" للعودة إلى تشغيل قصتك."},
"repeatForever":function(d){return "كرّر باستمرار"},
"repeatDo":function(d){return "نفّذ"},
"repeatForeverTooltip":function(d){return "تنفيذ الإجراءات في هذه الكتلة مرارا وتكرارا أثناء تشغيل القصة."},
"saySprite":function(d){return "قُل"},
"saySpriteN":function(d){return "تقول الشخصية "+appLocale.v(d,"spriteIndex")},
"saySpriteTooltip":function(d){return "يطفو على فقاعة كلام مع النص المرتبط به من الفاعل المحدد."},
"saySpriteChoices_0":function(d){return "مرحباً."},
"saySpriteChoices_1":function(d){return "مرحباً بكم جميعاً."},
"saySpriteChoices_2":function(d){return "كيف حالك؟"},
"saySpriteChoices_3":function(d){return "صباح الخير"},
"saySpriteChoices_4":function(d){return "بعد ظُهر الخير"},
"saySpriteChoices_5":function(d){return "ليل الخير"},
"saySpriteChoices_6":function(d){return "مساء الخير"},
"saySpriteChoices_7":function(d){return "ما الجديد ؟"},
"saySpriteChoices_8":function(d){return "ماذا؟"},
"saySpriteChoices_9":function(d){return "اين ؟"},
"saySpriteChoices_10":function(d){return "متى؟"},
"saySpriteChoices_11":function(d){return "جيد."},
"saySpriteChoices_12":function(d){return "عظيم!"},
"saySpriteChoices_13":function(d){return "حسناً."},
"saySpriteChoices_14":function(d){return "ليس سيئاً."},
"saySpriteChoices_15":function(d){return "حظاً جيداً."},
"saySpriteChoices_16":function(d){return "نعم"},
"saySpriteChoices_17":function(d){return "لا"},
"saySpriteChoices_18":function(d){return "حسناً"},
"saySpriteChoices_19":function(d){return "رميةٌ جيدةٌ!"},
"saySpriteChoices_20":function(d){return "اتمنى لك يوماً جيداً."},
"saySpriteChoices_21":function(d){return "باي."},
"saySpriteChoices_22":function(d){return "سأعود بعد قليل."},
"saySpriteChoices_23":function(d){return "اراك غداً!"},
"saySpriteChoices_24":function(d){return "اراك لاحقاً!"},
"saySpriteChoices_25":function(d){return "انتبه على نفسك!"},
"saySpriteChoices_26":function(d){return "استمتع!"},
"saySpriteChoices_27":function(d){return "يجب عليَّ الذهاب."},
"saySpriteChoices_28":function(d){return "اتريد ان نكون اصدقاء؟"},
"saySpriteChoices_29":function(d){return "احسنت!"},
"saySpriteChoices_30":function(d){return "هيييه!"},
"saySpriteChoices_31":function(d){return "يييي!"},
"saySpriteChoices_32":function(d){return "من اللطيف مقابلتك."},
"saySpriteChoices_33":function(d){return "حسناً!"},
"saySpriteChoices_34":function(d){return "شكراً"},
"saySpriteChoices_35":function(d){return "لا، شكراً"},
"saySpriteChoices_36":function(d){return "آااه!"},
"saySpriteChoices_37":function(d){return "لا عليك"},
"saySpriteChoices_38":function(d){return "اليوم"},
"saySpriteChoices_39":function(d){return "غداً"},
"saySpriteChoices_40":function(d){return "الأمس"},
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "You are funny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "You are a good friend!"},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "النقاط: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "تعيين خلفية"},
"setBackgroundRandom":function(d){return "تعيين خلفية عشوائية"},
"setBackgroundBlack":function(d){return "تعيين خلفية سوداء"},
"setBackgroundCave":function(d){return "تعيين خلفية المغارة"},
"setBackgroundCloudy":function(d){return "تعيين خلفية غائم"},
"setBackgroundHardcourt":function(d){return "تعيين خلفية الملاعب الصلبة"},
"setBackgroundNight":function(d){return "تعيين خلفية  الليل"},
"setBackgroundUnderwater":function(d){return "تعيين خلفية تحت الماء"},
"setBackgroundCity":function(d){return "قم بتعيين خلفية المدينة"},
"setBackgroundDesert":function(d){return "قم بتعيين خلفية صحراوية"},
"setBackgroundRainbow":function(d){return "قم بتعيين خلفية قوس القزح"},
"setBackgroundSoccer":function(d){return "وضع خلفية لكرة القدم"},
"setBackgroundSpace":function(d){return "وضع خلفية للفضاء"},
"setBackgroundTennis":function(d){return "وضع خلفية للتنس"},
"setBackgroundWinter":function(d){return "وضع خلفية الشتاء"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundTooltip":function(d){return "تعيين صورة الخلفية"},
"setEnemySpeed":function(d){return "حدد سرعة العدو"},
"setPlayerSpeed":function(d){return "حدد سرعة اللاعب"},
"setScoreText":function(d){return "تعيين نقاط"},
"setScoreTextTooltip":function(d){return "تعيين النص ليتم عرضها في منطقة نقاط."},
"setSpriteEmotionAngry":function(d){return "لمزاج غاضب"},
"setSpriteEmotionHappy":function(d){return "لمزاج سعيد"},
"setSpriteEmotionNormal":function(d){return "لمزاج معتدل"},
"setSpriteEmotionRandom":function(d){return "لمزاج عشوائي"},
"setSpriteEmotionSad":function(d){return "لمزاج حزين"},
"setSpriteEmotionTooltip":function(d){return "يحدد مزاج الممثل"},
"setSpriteAlien":function(d){return "إلى صورة مخلوق فضائي"},
"setSpriteBat":function(d){return "صورة الوطواط"},
"setSpriteBird":function(d){return "صورة العصفور"},
"setSpriteCat":function(d){return "إلى صورة القط"},
"setSpriteCaveBoy":function(d){return "لصورة فتى الكهف"},
"setSpriteCaveGirl":function(d){return "لصورة فتاة الكهف"},
"setSpriteDinosaur":function(d){return "إلى صورة ديناصور "},
"setSpriteDog":function(d){return "الى صورة الكلب"},
"setSpriteDragon":function(d){return "صورة التنين"},
"setSpriteGhost":function(d){return "إلى صورة شبح"},
"setSpriteHidden":function(d){return "إلى صورة مخفية"},
"setSpriteHideK1":function(d){return "إخفاء"},
"setSpriteAnna":function(d){return "إلى إحدى صور انا"},
"setSpriteElsa":function(d){return "إلى إحدى صور إلزا"},
"setSpriteHiro":function(d){return "إلى إحدى صور هيرو"},
"setSpriteBaymax":function(d){return "إلى إحدى صور بيماكس"},
"setSpriteRapunzel":function(d){return "إلى إحدى صور رابونزيل"},
"setSpriteKnight":function(d){return "إلى صورة فارس"},
"setSpriteMonster":function(d){return "إلى صورة وحش"},
"setSpriteNinja":function(d){return "إلى صورة نينجا مقنع"},
"setSpriteOctopus":function(d){return "إلى صورة الأخطبوط"},
"setSpritePenguin":function(d){return "إلى صورة البطريق"},
"setSpritePirate":function(d){return "إلى صورة قرصان"},
"setSpritePrincess":function(d){return "إلى صورة أميرة"},
"setSpriteRandom":function(d){return "إلى صورة عشوائية"},
"setSpriteRobot":function(d){return "إلى صورة إنسان آلي"},
"setSpriteShowK1":function(d){return "إظهار"},
"setSpriteSpacebot":function(d){return "إلى صورة إنسان آلي فضائي"},
"setSpriteSoccerGirl":function(d){return "لصورة فتاة كرة القدم"},
"setSpriteSoccerBoy":function(d){return "لصورة فتى كرة القدم"},
"setSpriteSquirrel":function(d){return "صورة السنجاب"},
"setSpriteTennisGirl":function(d){return "لصورة فتاة التنس"},
"setSpriteTennisBoy":function(d){return "لصورة فتى التنس"},
"setSpriteUnicorn":function(d){return "إلى صورة أحادي القرن"},
"setSpriteWitch":function(d){return "إلى صورة ساحرة"},
"setSpriteWizard":function(d){return "صورة الساحر"},
"setSpritePositionTooltip":function(d){return "على الفور تحرك فاعل للموقع المحدد."},
"setSpriteK1Tooltip":function(d){return "إظهار أو إخفاء الفاعل المحدد."},
"setSpriteTooltip":function(d){return "تعيين صورة الفاعل"},
"setSpriteSizeRandom":function(d){return "إلى حجم عشوائي"},
"setSpriteSizeVerySmall":function(d){return "إلى حجم صغير جداً"},
"setSpriteSizeSmall":function(d){return "إلى حجم صغير"},
"setSpriteSizeNormal":function(d){return "إلى حجم عادي"},
"setSpriteSizeLarge":function(d){return "إلى حجم كبير"},
"setSpriteSizeVeryLarge":function(d){return "إلى حجم كبير جداً"},
"setSpriteSizeTooltip":function(d){return "يحدد حجم الممثل"},
"setSpriteSpeedRandom":function(d){return "إلى سرعة عشوائية"},
"setSpriteSpeedVerySlow":function(d){return "بسرعة بطيئة جداً"},
"setSpriteSpeedSlow":function(d){return "بسرعة بطيئة"},
"setSpriteSpeedNormal":function(d){return "إلى سرعة العادية"},
"setSpriteSpeedFast":function(d){return "إلى سرعة"},
"setSpriteSpeedVeryFast":function(d){return "بسرعة سريعة جداً"},
"setSpriteSpeedTooltip":function(d){return "تعيين سرعة فاعل"},
"setSpriteZombie":function(d){return "إلى صورة زومبي"},
"shareStudioTwitter":function(d){return "تحقق من القصة الذي أدليت به. لقد كتبتها بنفسي ب@codeorg"},
"shareGame":function(d){return "شارك بقصك:"},
"showCoordinates":function(d){return "إظهار الإحداثيات"},
"showCoordinatesTooltip":function(d){return "إظهار إحداثيات البطل على الشاشة"},
"showTitleScreen":function(d){return "إظهار شاشة العنوان"},
"showTitleScreenTitle":function(d){return "العنوان"},
"showTitleScreenText":function(d){return "نص"},
"showTSDefTitle":function(d){return "ضع العنوان هنا"},
"showTSDefText":function(d){return "اكتب نصاً هنا"},
"showTitleScreenTooltip":function(d){return "إظهار شاشة عنوان مع عنوان المرتبطة بها، والنص."},
"size":function(d){return "الحجم"},
"setSprite":function(d){return "تعيين"},
"setSpriteN":function(d){return "تحديد موقع الصورة "+appLocale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "سحق"},
"soundGoal1":function(d){return "الهدف  رقم1"},
"soundGoal2":function(d){return "الهدف رقم 2"},
"soundHit":function(d){return "إضرب"},
"soundLosePoint":function(d){return "خسارة نقطة واحدة"},
"soundLosePoint2":function(d){return "نقطة الخسارة 2"},
"soundRetro":function(d){return "الرجعية"},
"soundRubber":function(d){return "المطاط"},
"soundSlap":function(d){return "الصفعة"},
"soundWinPoint":function(d){return "الفوز بنقطة"},
"soundWinPoint2":function(d){return "نقطة الفوز 2"},
"soundWood":function(d){return "الخشب"},
"speed":function(d){return "السرعة"},
"startSetValue":function(d){return "start (rocket-height function)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "وقف"},
"stopSpriteN":function(d){return "إيقاف الصورة "+appLocale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "توقف حركة عنصر فاعل."},
"throwSprite":function(d){return "رمي"},
"throwSpriteN":function(d){return "الممثل "+appLocale.v(d,"spriteIndex")+" رمى"},
"throwTooltip":function(d){return "يلقي قذيفة من الفاعل المحدد."},
"vanish":function(d){return "يختفي"},
"vanishActorN":function(d){return "يختفي الممثل "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "يختفي الممثل ."},
"waitFor":function(d){return "انتظر لمدة"},
"waitSeconds":function(d){return "ثوانٍ"},
"waitForClick":function(d){return "انتظر للنقر"},
"waitForRandom":function(d){return "انتظر عشوائي"},
"waitForHalfSecond":function(d){return "الانتظار لمدة نصف ثانية"},
"waitFor1Second":function(d){return "انتظر لمدة ثانية"},
"waitFor2Seconds":function(d){return "انتظر لمدة ثانيتين"},
"waitFor5Seconds":function(d){return "انتظر لمدة 5 ثواني"},
"waitFor10Seconds":function(d){return "انتظر لمدة 10 ثوان"},
"waitParamsTooltip":function(d){return "إنتظر لعدد محدد من الثواني او إستعمل الرقم صفر حتى تحدث النقرة."},
"waitTooltip":function(d){return "ينتظر لفترة محددة من الوقت، أو حتى يحدث نقرة."},
"whenArrowDown":function(d){return "السهم نحو الأسفل"},
"whenArrowLeft":function(d){return "السهم نحو اليسار"},
"whenArrowRight":function(d){return "السهم نحو اليمين"},
"whenArrowUp":function(d){return "سهم لأعلى"},
"whenArrowTooltip":function(d){return "قم بتنفيذ الإجراءات ادناه عندما يتم الضغط على المفتاح المحدد."},
"whenDown":function(d){return "عندما يكون السهم للاسفل"},
"whenDownTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم لأسفل."},
"whenGameStarts":function(d){return "عندما تبدأ القصة"},
"whenGameStartsTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما تبدأ القصة."},
"whenLeft":function(d){return "عندما يكون السهم الى اليسار"},
"whenLeftTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيسر."},
"whenRight":function(d){return "عندما يكون السهم الى الايمن"},
"whenRightTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيمن."},
"whenSpriteClicked":function(d){return "عند النقر على الشخصية"},
"whenSpriteClickedN":function(d){return "عندما يضغط الممثل "+appLocale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "تنفيذ الإجراءات أدناه عند النقر فوق عنصر فاعل."},
"whenSpriteCollidedN":function(d){return "عندما الممثل "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما يلامس فاعل فاعل آخر."},
"whenSpriteCollidedWith":function(d){return "لمسات"},
"whenSpriteCollidedWithAnyActor":function(d){return "يلمس أي شخصية"},
"whenSpriteCollidedWithAnyEdge":function(d){return "يلمس أي حافة"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "يلمس أي قذيفة"},
"whenSpriteCollidedWithAnything":function(d){return "يلمس أي شيء"},
"whenSpriteCollidedWithN":function(d){return "يلمس الممثل "+appLocale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "ألمس الكرة الملتهبة الزرقاء"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "ألمس الكرة الملتهبة الأرجوانية"},
"whenSpriteCollidedWithRedFireball":function(d){return "ألمس الكرة الملتهبة الحمراء"},
"whenSpriteCollidedWithYellowHearts":function(d){return "ألمس القلوب الصفراء"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "ألمس القلوب الأرجوانية"},
"whenSpriteCollidedWithRedHearts":function(d){return "ألمس القلوب الحمراء"},
"whenSpriteCollidedWithBottomEdge":function(d){return "عند ملامسة الحافة السفلية"},
"whenSpriteCollidedWithLeftEdge":function(d){return "يلمس الحافة اليسرى"},
"whenSpriteCollidedWithRightEdge":function(d){return "يلمس الحافة اليمنى"},
"whenSpriteCollidedWithTopEdge":function(d){return "يلمس الحافة العليا"},
"whenUp":function(d){return "عندما يكون السهم الى الاعلى"},
"whenUpTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح سهم لأعلى."},
"yes":function(d){return "نعم"}};