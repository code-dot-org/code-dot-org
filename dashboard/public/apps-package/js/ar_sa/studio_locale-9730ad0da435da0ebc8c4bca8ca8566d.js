var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "الممثل"},
"addItems1":function(d){return "أضف عنصر واحد من نوع"},
"addItems2":function(d){return "إضافة عنصران من نوع"},
"addItems3":function(d){return "إضافة 3 عناصر من نوع"},
"addItems5":function(d){return "إضافة 5 عناصر من نوع"},
"addItems10":function(d){return "إضافة 10 عناصر من نوع"},
"addItemsRandom":function(d){return "إضافة عناصر عشوائية من نوع"},
"addItemsTooltip":function(d){return "إضافة عناصر إلى المشهد."},
"alienInvasion":function(d){return "غزو الكائنات الفضائية!"},
"backgroundBlack":function(d){return "أسود"},
"backgroundCave":function(d){return "كهف"},
"backgroundCloudy":function(d){return "غائم"},
"backgroundHardcourt":function(d){return "الملعب"},
"backgroundNight":function(d){return "ليل"},
"backgroundUnderwater":function(d){return "تحت الماء"},
"backgroundCity":function(d){return "مدينة"},
"backgroundDesert":function(d){return "صحراء"},
"backgroundRainbow":function(d){return "قوس قزح"},
"backgroundSoccer":function(d){return "كرة القدم"},
"backgroundSpace":function(d){return "الفضاء"},
"backgroundTennis":function(d){return "كرة المضرب"},
"backgroundWinter":function(d){return "الشتاء"},
"catActions":function(d){return "الإجراءات"},
"catControl":function(d){return "الحلقات"},
"catEvents":function(d){return "الأحداث"},
"catLogic":function(d){return "العمليات المنطقية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "دوال"},
"catText":function(d){return "النص"},
"catVariables":function(d){return "المتغيرات"},
"changeScoreTooltip":function(d){return "إضافة أو إزالة نقطة للنتيجة."},
"changeScoreTooltipK1":function(d){return "إضافة نقطة إلى النتيجة."},
"continue":function(d){return "استمرار"},
"decrementPlayerScore":function(d){return "إزالة نقطة"},
"defaultSayText":function(d){return "اكتب هنا"},
"dropletBlock_changeScore_description":function(d){return "إضافة أو إزالة نقطة للنتيجة."},
"dropletBlock_penColour_description":function(d){return "تعيين لون الخط المرسوم خلف السلحفاة وهي تتحرك"},
"dropletBlock_penColour_param0":function(d){return "لون"},
"dropletBlock_setBackground_description":function(d){return "تعيين صورة الخلفية"},
"dropletBlock_setSpriteEmotion_description":function(d){return "تعيين مزاج الممثل"},
"dropletBlock_setSpritePosition_description":function(d){return "تحريك الممثل فوراً للموقع المحدد."},
"dropletBlock_setSpriteSpeed_description":function(d){return "تعيين سرعة الممثل"},
"dropletBlock_setSprite_description":function(d){return "تعيين صورة الممثل"},
"dropletBlock_throw_description":function(d){return "إلقاء قذيفة من الممثل المحدد."},
"dropletBlock_vanish_description":function(d){return "إخفاء الممثل."},
"emotion":function(d){return "المزاج"},
"finalLevel":function(d){return "تهانينا! لقد قمت بحل اللغز الأخير."},
"for":function(d){return "لأجل"},
"hello":function(d){return "مرحباً"},
"helloWorld":function(d){return "مرحباً بالعالم!"},
"incrementPlayerScore":function(d){return "تحصيل نقطة"},
"itemBlueFireball":function(d){return "كرة ملتهبة زرقاء"},
"itemPurpleFireball":function(d){return "كرة ملتهبة بنفسجية"},
"itemRedFireball":function(d){return "كرة ملتهبة حمراء"},
"itemYellowHearts":function(d){return "قلوب صفراء"},
"itemPurpleHearts":function(d){return "قلوب بنفسجية"},
"itemRedHearts":function(d){return "قلوب حمراء"},
"itemRandom":function(d){return "عشوائي"},
"itemAnna":function(d){return "خطاف"},
"itemElsa":function(d){return "بريق"},
"itemHiro":function(d){return "بوتات مجهرية"},
"itemBaymax":function(d){return "صاروخ"},
"itemRapunzel":function(d){return "مقلاة الصلصة"},
"itemCherry":function(d){return "كرز"},
"itemIce":function(d){return "الجليد"},
"itemDuck":function(d){return "بطة"},
"makeProjectileDisappear":function(d){return "اختفاء"},
"makeProjectileBounce":function(d){return "ارتداد"},
"makeProjectileBlueFireball":function(d){return "اصنع كرة ملتهبة زرقاء"},
"makeProjectilePurpleFireball":function(d){return "اصنع كرة ملتهبة بنفسجية"},
"makeProjectileRedFireball":function(d){return "اصنع كرة ملتهبة حمراء"},
"makeProjectileYellowHearts":function(d){return "اصنع قلوب صفراء"},
"makeProjectilePurpleHearts":function(d){return "اصنع قلوب بنفسجية"},
"makeProjectileRedHearts":function(d){return "اصنع قلوب حمراء"},
"makeProjectileTooltip":function(d){return "إخفاء أو ارتداد القذيفة التي اصطدمت الآن."},
"makeYourOwn":function(d){return "اصنع تطبيقك الخاص لمختبر اللعب"},
"moveDirectionDown":function(d){return "الأسفل"},
"moveDirectionLeft":function(d){return "اليسار"},
"moveDirectionRight":function(d){return "اليمين"},
"moveDirectionUp":function(d){return "الأعلى"},
"moveDirectionRandom":function(d){return "عشوائي"},
"moveDistance25":function(d){return "25 بكسل"},
"moveDistance50":function(d){return "50 بكسل"},
"moveDistance100":function(d){return "100 بكسل"},
"moveDistance200":function(d){return "200 بكسل"},
"moveDistance400":function(d){return "400 بكسل"},
"moveDistancePixels":function(d){return "بكسل"},
"moveDistanceRandom":function(d){return " بكسل عشوائي"},
"moveDistanceTooltip":function(d){return "تحريك الممثل مسافة محددة في الاتجاه المحدد."},
"moveSprite":function(d){return "تحريك"},
"moveSpriteN":function(d){return "تحريك الممثل "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "إلى y,x"},
"moveDown":function(d){return "تحريك لأسفل"},
"moveDownTooltip":function(d){return "تحريك الممثل إلى أسفل."},
"moveLeft":function(d){return "تحرك لليسار"},
"moveLeftTooltip":function(d){return "تحريك الممثل إلى اليسار."},
"moveRight":function(d){return "تحريك لليمين"},
"moveRightTooltip":function(d){return "تحريك الممثل إلى اليمين."},
"moveUp":function(d){return "تحريك لأعلى"},
"moveUpTooltip":function(d){return "تحريك الممثل إلى أعلى."},
"moveTooltip":function(d){return "تحريك الممثل."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا اللغز باستخدام %1 مربعات برمجية."},
"onEventTooltip":function(d){return "تنفيذ التعليمات البرمجية في استجابة للحدث المحدد."},
"ouchExclamation":function(d){return "آخ (ألم) !"},
"playSoundCrunch":function(d){return "تشغيل صوت انسحاق"},
"playSoundGoal1":function(d){return "تشغيل صوت الهدف 1"},
"playSoundGoal2":function(d){return "تشغيل صوت الهدف 2"},
"playSoundHit":function(d){return "تشغيل صوت ضرب"},
"playSoundLosePoint":function(d){return "تشغيل صوت فقدان نقطة"},
"playSoundLosePoint2":function(d){return "تشغيل صوت فقدان نقطة 2"},
"playSoundRetro":function(d){return "تشغيل صوت رجعي"},
"playSoundRubber":function(d){return "تشغيل صوت المطاط"},
"playSoundSlap":function(d){return "تشغيل صوت صفعة"},
"playSoundTooltip":function(d){return "تشغيل الصوت المختار."},
"playSoundWinPoint":function(d){return "تشغيل صوت الفوز بنقطة"},
"playSoundWinPoint2":function(d){return "تشغيل صوت الفوز بنقطة 2"},
"playSoundWood":function(d){return "تشغيل صوت الخشب"},
"positionOutTopLeft":function(d){return "إلى الموضع الأيسر العلوي أعلاه"},
"positionOutTopRight":function(d){return "إلى الموضع الأيمن العلوي أعلاه"},
"positionTopOutLeft":function(d){return "إلى الموضع الأعلى الأيسر الخارجي"},
"positionTopLeft":function(d){return "إلى الموضع اليساري الأعلى"},
"positionTopCenter":function(d){return "إلى الموضع المتوسط الأعلى"},
"positionTopRight":function(d){return "إلى الموضع الأيمن الأعلى"},
"positionTopOutRight":function(d){return "إلى الموضع الأعلى الأيمن الخارجي"},
"positionMiddleLeft":function(d){return "إلى الموضع الأوسط الأيسر"},
"positionMiddleCenter":function(d){return "إلى الموضع الأوسط المتوسط"},
"positionMiddleRight":function(d){return "إلى الموضع الأوسط الأيمن"},
"positionBottomOutLeft":function(d){return "إلى الموضع الأسفل الأيسر الخارجي"},
"positionBottomLeft":function(d){return "إلى الموضع الأيسر السفلي"},
"positionBottomCenter":function(d){return "إلى مركز القاع"},
"positionBottomRight":function(d){return "إلى الموضع الأيمن السفلي"},
"positionBottomOutRight":function(d){return "إلى الموضع الأسفل الأيمن الخارجي"},
"positionOutBottomLeft":function(d){return "إلى الموضع الأسفل الأيسر السفلي"},
"positionOutBottomRight":function(d){return "إلى الموضع الأسفل الأيمن السفلي"},
"positionRandom":function(d){return "إلى موضع عشوائي"},
"projectileBlueFireball":function(d){return "كرة ملتهبة زرقاء"},
"projectilePurpleFireball":function(d){return "كرة ملتهبة بنفسجية"},
"projectileRedFireball":function(d){return "كرة ملتهبة حمراء"},
"projectileYellowHearts":function(d){return "قلوب صفراء"},
"projectilePurpleHearts":function(d){return "قلوب بنفسجية"},
"projectileRedHearts":function(d){return "قلوب حمراء"},
"projectileRandom":function(d){return "عشوائي"},
"projectileAnna":function(d){return "خطاف"},
"projectileElsa":function(d){return "بريق"},
"projectileHiro":function(d){return "بوتات مجهرية"},
"projectileBaymax":function(d){return "صاروخ"},
"projectileRapunzel":function(d){return "مقلاة الصلصة"},
"projectileCherry":function(d){return "كرز"},
"projectileIce":function(d){return "الجليد"},
"projectileDuck":function(d){return "بطة"},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \""+studio_locale.v(d,"backButton")+"\" للعودة إلى تشغيل قصتك."},
"repeatForever":function(d){return "التكرار للأبد"},
"repeatDo":function(d){return "نفّذ"},
"repeatForeverTooltip":function(d){return "تنفيذ الإجراءات في المربع البرمجي هذا بتكرار أثناء تشغيل القصة."},
"saySprite":function(d){return "قُل"},
"saySpriteN":function(d){return "يقول الممثل "+studio_locale.v(d,"spriteIndex")},
"saySpriteTooltip":function(d){return "إظهار فقاعة كلام مع النص المرتبط به من الممثل المحدد."},
"saySpriteChoices_0":function(d){return "مرحباً."},
"saySpriteChoices_1":function(d){return "مرحباً بكم جميعاً."},
"saySpriteChoices_2":function(d){return "كيف حالكم؟"},
"saySpriteChoices_3":function(d){return "صباح الخير"},
"saySpriteChoices_4":function(d){return "مساء الخير"},
"saySpriteChoices_5":function(d){return "طابت ليلتكم"},
"saySpriteChoices_6":function(d){return "مساء الخير"},
"saySpriteChoices_7":function(d){return "ما الجديد ؟"},
"saySpriteChoices_8":function(d){return "ماذا؟"},
"saySpriteChoices_9":function(d){return "أين؟"},
"saySpriteChoices_10":function(d){return "متى؟"},
"saySpriteChoices_11":function(d){return "جيد."},
"saySpriteChoices_12":function(d){return "عظيم!"},
"saySpriteChoices_13":function(d){return "حسناً."},
"saySpriteChoices_14":function(d){return "لا بأس."},
"saySpriteChoices_15":function(d){return "حظاً موفقاً."},
"saySpriteChoices_16":function(d){return "نعم"},
"saySpriteChoices_17":function(d){return "لا"},
"saySpriteChoices_18":function(d){return "حسناً"},
"saySpriteChoices_19":function(d){return "رميةٌ جيدةٌ!"},
"saySpriteChoices_20":function(d){return "اتمنى لك يوماً جيداً."},
"saySpriteChoices_21":function(d){return "وداعاً."},
"saySpriteChoices_22":function(d){return "سأعود بعد قليل."},
"saySpriteChoices_23":function(d){return "أراك غدًا!"},
"saySpriteChoices_24":function(d){return "أراك لاحقًا!"},
"saySpriteChoices_25":function(d){return "انتبه على نفسك!"},
"saySpriteChoices_26":function(d){return "استمتع!"},
"saySpriteChoices_27":function(d){return "يجب أن أذهب."},
"saySpriteChoices_28":function(d){return "أتريد أن نصبح أصدقاء؟"},
"saySpriteChoices_29":function(d){return "أحسنت!"},
"saySpriteChoices_30":function(d){return "هيييه!"},
"saySpriteChoices_31":function(d){return "رائع !"},
"saySpriteChoices_32":function(d){return "تشرفنا."},
"saySpriteChoices_33":function(d){return "حسناً!"},
"saySpriteChoices_34":function(d){return "شكراً"},
"saySpriteChoices_35":function(d){return "لا، شكراً"},
"saySpriteChoices_36":function(d){return "آااه!"},
"saySpriteChoices_37":function(d){return "لا عليك"},
"saySpriteChoices_38":function(d){return "اليوم"},
"saySpriteChoices_39":function(d){return "غداً"},
"saySpriteChoices_40":function(d){return "الأمس"},
"saySpriteChoices_41":function(d){return "لقد وجدتك!"},
"saySpriteChoices_42":function(d){return "لقد وجدتني!"},
"saySpriteChoices_43":function(d){return "1، 2، 3، 4، 5، 6، 7، 8، 9، 10 !"},
"saySpriteChoices_44":function(d){return "أنت عظيم !"},
"saySpriteChoices_45":function(d){return "أنت مضحك !"},
"saySpriteChoices_46":function(d){return "أنت مرح !"},
"saySpriteChoices_47":function(d){return "أنت صديق جيد !"},
"saySpriteChoices_48":function(d){return "انتبه !"},
"saySpriteChoices_49":function(d){return "بطة!"},
"saySpriteChoices_50":function(d){return "مسكتك !"},
"saySpriteChoices_51":function(d){return "آه !"},
"saySpriteChoices_52":function(d){return "آسف !"},
"saySpriteChoices_53":function(d){return "حذراً !"},
"saySpriteChoices_54":function(d){return "يا للهول !"},
"saySpriteChoices_55":function(d){return "المعذرة !"},
"saySpriteChoices_56":function(d){return "كدت أن تنال مني !"},
"saySpriteChoices_57":function(d){return "محاولة جيدة !"},
"saySpriteChoices_58":function(d){return "لا يمكنك الإمساك بي !"},
"scoreText":function(d){return "النتيجة: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "تعيين خلفية"},
"setBackgroundRandom":function(d){return "تعيين خلفية عشوائية"},
"setBackgroundBlack":function(d){return "تعيين خلفية سوداء"},
"setBackgroundCave":function(d){return "تعيين خلفية الكهف"},
"setBackgroundCloudy":function(d){return "تعيين خلفية غائمة"},
"setBackgroundHardcourt":function(d){return "تعيين خلفية الملاعب"},
"setBackgroundNight":function(d){return "تعيين خلفية  الليل"},
"setBackgroundUnderwater":function(d){return "تعيين خلفية تحت الماء"},
"setBackgroundCity":function(d){return "تعيين خلفية المدينة"},
"setBackgroundDesert":function(d){return "تعيين خلفية صحراوية"},
"setBackgroundRainbow":function(d){return "تعيين خلفية قوس قزح"},
"setBackgroundSoccer":function(d){return "تعيين خلفية كرة القدم"},
"setBackgroundSpace":function(d){return "تعيين خلفية الفضاء"},
"setBackgroundTennis":function(d){return "تعيين خلفية كرة المضرب"},
"setBackgroundWinter":function(d){return "تعيين خلفية الشتاء"},
"setBackgroundLeafy":function(d){return "تعيين الخلفية ورق الشجر"},
"setBackgroundGrassy":function(d){return "تعيين خلفية العشب"},
"setBackgroundFlower":function(d){return "تعيين خلفية الزهرة"},
"setBackgroundTile":function(d){return "تعيين خلفية البلاط"},
"setBackgroundIcy":function(d){return "تعيين خلفية الجليدية"},
"setBackgroundSnowy":function(d){return "تعيين خلفية الثلجية"},
"setBackgroundTooltip":function(d){return "تعيين صورة الخلفية"},
"setEnemySpeed":function(d){return "تعيين سرعة العدو"},
"setPlayerSpeed":function(d){return "تعيين سرعة اللاعب"},
"setScoreText":function(d){return "تعيين النتيجة"},
"setScoreTextTooltip":function(d){return "تعيين النص ليتم عرضه في منطقة النتيجة."},
"setSpriteEmotionAngry":function(d){return "إلى مزاج غاضب"},
"setSpriteEmotionHappy":function(d){return "إلى مزاج سعيد"},
"setSpriteEmotionNormal":function(d){return "إلى مزاج عادي"},
"setSpriteEmotionRandom":function(d){return "إلى مزاج عشوائي"},
"setSpriteEmotionSad":function(d){return "إلى مزاج حزين"},
"setSpriteEmotionTooltip":function(d){return "تعيين مزاج الممثل"},
"setSpriteAlien":function(d){return "إلى صورة مخلوق فضائي"},
"setSpriteBat":function(d){return "إلى صورة خفاش"},
"setSpriteBird":function(d){return "إلى صورة طير"},
"setSpriteCat":function(d){return "إلى صورة قطة"},
"setSpriteCaveBoy":function(d){return "إلى صورة فتى الكهف"},
"setSpriteCaveGirl":function(d){return "إلى صورة فتاة الكهف (ياسمين)"},
"setSpriteDinosaur":function(d){return "إلى صورة ديناصور "},
"setSpriteDog":function(d){return "الى صورة كلب"},
"setSpriteDragon":function(d){return "إلى صورة تنين"},
"setSpriteGhost":function(d){return "إلى صورة شبح"},
"setSpriteHidden":function(d){return "إلى صورة مخفية"},
"setSpriteHideK1":function(d){return "إخفاء"},
"setSpriteAnna":function(d){return "إلى صورة آنا"},
"setSpriteElsa":function(d){return "إلى صورة إلسا"},
"setSpriteHiro":function(d){return "إلى صورة هيرو"},
"setSpriteBaymax":function(d){return "إلى صورة بيماكس"},
"setSpriteRapunzel":function(d){return "إلى صورة رابونزيل"},
"setSpriteKnight":function(d){return "إلى صورة فارس"},
"setSpriteMonster":function(d){return "إلى صورة وحش"},
"setSpriteNinja":function(d){return "إلى صورة نينجا مقنع"},
"setSpriteOctopus":function(d){return "إلى صورة أخطبوط"},
"setSpritePenguin":function(d){return "إلى صورة بطريق (وادلز)"},
"setSpritePirate":function(d){return "إلى صورة قرصان"},
"setSpritePrincess":function(d){return "إلى صورة أميرة"},
"setSpriteRandom":function(d){return "إلى صورة عشوائية"},
"setSpriteRobot":function(d){return "إلى صورة إنسان آلي"},
"setSpriteShowK1":function(d){return "إظهار"},
"setSpriteSpacebot":function(d){return "إلى صورة إنسان آلي فضائي"},
"setSpriteSoccerGirl":function(d){return "إلى صورة فتاة كرة القدم"},
"setSpriteSoccerBoy":function(d){return "إلى صورة فتى كرة القدم"},
"setSpriteSquirrel":function(d){return "إلى صورة سنجاب"},
"setSpriteTennisGirl":function(d){return "إلى صورة فتاة كرة المضرب"},
"setSpriteTennisBoy":function(d){return "إلى صورة فتى كرة المضرب"},
"setSpriteUnicorn":function(d){return "إلى صورة أحادي القرن"},
"setSpriteWitch":function(d){return "إلى صورة ساحرة"},
"setSpriteWizard":function(d){return "إلى صورة ساحر"},
"setSpritePositionTooltip":function(d){return "تحريك الممثل فوراً للموقع المحدد."},
"setSpriteK1Tooltip":function(d){return "إظهار أو إخفاء الممثل المحدد."},
"setSpriteTooltip":function(d){return "تعيين صورة الممثل"},
"setSpriteSizeRandom":function(d){return "إلى حجم عشوائي"},
"setSpriteSizeVerySmall":function(d){return "إلى حجم صغير جداً"},
"setSpriteSizeSmall":function(d){return "إلى حجم صغير"},
"setSpriteSizeNormal":function(d){return "إلى حجم عادي"},
"setSpriteSizeLarge":function(d){return "إلى حجم كبير"},
"setSpriteSizeVeryLarge":function(d){return "إلى حجم كبير جداً"},
"setSpriteSizeTooltip":function(d){return "تعيين حجم الممثل"},
"setSpriteSpeedRandom":function(d){return "إلى سرعة عشوائية"},
"setSpriteSpeedVerySlow":function(d){return "إلى سرعة بطيئة جداً"},
"setSpriteSpeedSlow":function(d){return "إلى سرعة بطيئة"},
"setSpriteSpeedNormal":function(d){return "إلى السرعة العادية"},
"setSpriteSpeedFast":function(d){return "إلى السرعة العالية"},
"setSpriteSpeedVeryFast":function(d){return "إلى السرعة العالية جداً"},
"setSpriteSpeedTooltip":function(d){return "تعيين سرعة الممثل"},
"setSpriteZombie":function(d){return "إلى صورة زومبي"},
"shareStudioTwitter":function(d){return "هل نريد رؤية القصة التي أنتجتها؟ لقد كتبتها بنفسي باستخدام @codeorg"},
"shareGame":function(d){return "شارك قصتك:"},
"showCoordinates":function(d){return "إظهار الإحداثيات"},
"showCoordinatesTooltip":function(d){return "إظهار إحداثيات البطل على الشاشة"},
"showTitleScreen":function(d){return "إظهار شاشة العنوان"},
"showTitleScreenTitle":function(d){return "العنوان"},
"showTitleScreenText":function(d){return "النص"},
"showTSDefTitle":function(d){return "اكتب العنوان هنا"},
"showTSDefText":function(d){return "اكتب النص هنا"},
"showTitleScreenTooltip":function(d){return "إظهار شاشة عنوان مع العنوان والنص المرتبطان بها."},
"size":function(d){return "الحجم"},
"setSprite":function(d){return "تعيين"},
"setSpriteN":function(d){return "تعيين الممثل "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "سحق"},
"soundGoal1":function(d){return "الهدف 1"},
"soundGoal2":function(d){return "الهدف 2"},
"soundHit":function(d){return "ضرب"},
"soundLosePoint":function(d){return "خسارة نقطة واحدة"},
"soundLosePoint2":function(d){return "خسارة نقطة 2"},
"soundRetro":function(d){return "رجعي"},
"soundRubber":function(d){return "المطاط"},
"soundSlap":function(d){return "الصفعة"},
"soundWinPoint":function(d){return "الفوز بنقطة"},
"soundWinPoint2":function(d){return "الفوز بنقطة 2"},
"soundWood":function(d){return "الخشب"},
"speed":function(d){return "السرعة"},
"startSetValue":function(d){return "بدء (الدالة)"},
"startSetVars":function(d){return "game_vars (العنوان، العنوان الفرعي، الخلفية، الهدف، الخطر، اللاعب)"},
"startSetFuncs":function(d){return "game_funcs (هدف التحديث، التحديث--خطر، والتحديث--تشغيل، تصطدم؟، والتي تظهر على الشاشة؟)"},
"stopSprite":function(d){return "قف"},
"stopSpriteN":function(d){return "إيقاف الممثل "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "إيقاف حركة ممثل."},
"throwSprite":function(d){return "رمي"},
"throwSpriteN":function(d){return "الممثل "+studio_locale.v(d,"spriteIndex")+" رمى"},
"throwTooltip":function(d){return "إلقاء قذيفة من الممثل المحدد."},
"vanish":function(d){return "إخفاء"},
"vanishActorN":function(d){return "إخفاء الممثل "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "إخفاء الممثل."},
"waitFor":function(d){return "الانتظار لمدة"},
"waitSeconds":function(d){return "ثوان"},
"waitForClick":function(d){return "انتظار النقرة"},
"waitForRandom":function(d){return "انتظار عشوائي"},
"waitForHalfSecond":function(d){return "الانتظار لمدة نصف ثانية"},
"waitFor1Second":function(d){return "انتظر لمدة ثانية"},
"waitFor2Seconds":function(d){return "انتظر لمدة ثانيتين"},
"waitFor5Seconds":function(d){return "الانتظار لمدة 5 ثوان"},
"waitFor10Seconds":function(d){return "الانتظار لمدة 10 ثوان"},
"waitParamsTooltip":function(d){return "الانتظار لعدد محدد من الثوان أو استخدام الرقم صفر لحين حدوث النقرة."},
"waitTooltip":function(d){return "ينتظر لفترة محددة من الوقت، أو حتى يحدث نقرة."},
"whenArrowDown":function(d){return "سهم لأسفل"},
"whenArrowLeft":function(d){return "سهم لليسار"},
"whenArrowRight":function(d){return "سهم لليمين"},
"whenArrowUp":function(d){return "سهم لأعلى"},
"whenArrowTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم المحدد."},
"whenDown":function(d){return "عند الضغط على السهم لأسفل"},
"whenDownTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم لأسفل."},
"whenGameStarts":function(d){return "عندما تبدأ القصة"},
"whenGameStartsTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما تبدأ القصة."},
"whenLeft":function(d){return "عند الضغط على السهم الأيسر"},
"whenLeftTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيسر."},
"whenRight":function(d){return "عند الضغط على السهم الأيمن"},
"whenRightTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح السهم الأيمن."},
"whenSpriteClicked":function(d){return "عند النقر على الممثل"},
"whenSpriteClickedN":function(d){return "عند النقر على الممثل "+studio_locale.v(d,"spriteIndex")},
"whenSpriteClickedTooltip":function(d){return "تنفيذ الإجراءات أدناه عند النقر فوق الممثل."},
"whenSpriteCollidedN":function(d){return "عندما الممثل "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "تنفيذ الإجراءات أدناه عندما يلامس ممثل ممثل آخر."},
"whenSpriteCollidedWith":function(d){return "يلامس"},
"whenSpriteCollidedWithAnyActor":function(d){return "يلمس أي ممثل"},
"whenSpriteCollidedWithAnyEdge":function(d){return "يلمس أي حافة"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "يلمس أي قذيفة"},
"whenSpriteCollidedWithAnything":function(d){return "يلمس أي شيء"},
"whenSpriteCollidedWithN":function(d){return "يلمس الممثل "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "يلمس الكرة الملتهبة الزرقاء"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "يلمس الكرة الملتهبة البنفسجية"},
"whenSpriteCollidedWithRedFireball":function(d){return "ألمس الكرة الملتهبة الحمراء"},
"whenSpriteCollidedWithYellowHearts":function(d){return "يلمس القلوب الصفراء"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "يلمس القلوب البنفسجية"},
"whenSpriteCollidedWithRedHearts":function(d){return "يلمس القلوب الحمراء"},
"whenSpriteCollidedWithBottomEdge":function(d){return "يلمس الحافة السفلية"},
"whenSpriteCollidedWithLeftEdge":function(d){return "يلمس الحافة اليسرى"},
"whenSpriteCollidedWithRightEdge":function(d){return "يلمس الحافة اليمنى"},
"whenSpriteCollidedWithTopEdge":function(d){return "يلمس الحافة العليا"},
"whenUp":function(d){return "عند الضغط على السهم لاعلى"},
"whenUpTooltip":function(d){return "تنفيذ الإجراءات أدناه عند الضغط على مفتاح سهم لأعلى."},
"yes":function(d){return "نعم"},
"itemItem1":function(d){return "Item1"},
"itemItem2":function(d){return "Item2"},
"itemItem3":function(d){return "Item3"},
"itemItem4":function(d){return "Item4"},
"setBackgroundBackground1":function(d){return "set background1 background"},
"setBackgroundBackground2":function(d){return "set background2 background"},
"setBackgroundBackground3":function(d){return "set background3 background"},
"setSpriteCharacter1":function(d){return "to item1"},
"setSpriteCharacter2":function(d){return "to item2"}};