var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "كتلة التدمير"},
"blockIf":function(d){return "إذا كان"},
"blockIfLavaAhead":function(d){return "في حالة وجود حمم أمامك"},
"blockMoveForward":function(d){return "تحريك إلى الأمام"},
"blockPlaceTorch":function(d){return "ضع المصباح"},
"blockPlaceXAheadAhead":function(d){return "في الأمام"},
"blockPlaceXAheadPlace":function(d){return "ضع"},
"blockPlaceXPlace":function(d){return "ضع"},
"blockPlantCrop":function(d){return "ازرع المحصول"},
"blockShear":function(d){return "قص"},
"blockTillSoil":function(d){return "احرث التربة"},
"blockTurnLeft":function(d){return "اتجه إلى اليسار"},
"blockTurnRight":function(d){return "اتجه إلى اليمين"},
"blockTypeBedrock":function(d){return "صخر الأديم"},
"blockTypeBricks":function(d){return "الطوب"},
"blockTypeClay":function(d){return "الطين"},
"blockTypeClayHardened":function(d){return "كتلة صلدة"},
"blockTypeCobblestone":function(d){return "حصاة"},
"blockTypeDirt":function(d){return "كتلة ترابية"},
"blockTypeDirtCoarse":function(d){return "كتلة ترابية خشنة"},
"blockTypeEmpty":function(d){return "فارغ"},
"blockTypeFarmlandWet":function(d){return "أرض زراعية"},
"blockTypeGlass":function(d){return "زجاج"},
"blockTypeGrass":function(d){return "عشب"},
"blockTypeGravel":function(d){return "حصى"},
"blockTypeLava":function(d){return "حمم"},
"blockTypeLogAcacia":function(d){return "خشب السنط"},
"blockTypeLogBirch":function(d){return "خشب البتولا"},
"blockTypeLogJungle":function(d){return "خشب الغابات"},
"blockTypeLogOak":function(d){return "خشب البلوط"},
"blockTypeLogSpruce":function(d){return "خشب أبيض"},
"blockTypeOreCoal":function(d){return "خام الفحم"},
"blockTypeOreDiamond":function(d){return "خام الماس"},
"blockTypeOreEmerald":function(d){return "خام الزمرد"},
"blockTypeOreGold":function(d){return "خام الذهب"},
"blockTypeOreIron":function(d){return "خام الحديد"},
"blockTypeOreLapis":function(d){return "خام الحصاة"},
"blockTypeOreRedstone":function(d){return "خام الحجر الأحمر"},
"blockTypePlanksAcacia":function(d){return "ألواح خشب السنط"},
"blockTypePlanksBirch":function(d){return "ألواح خشب البتولا"},
"blockTypePlanksJungle":function(d){return "ألواح خشب الغابات"},
"blockTypePlanksOak":function(d){return "ألواح خشب البلوط"},
"blockTypePlanksSpruce":function(d){return "ألواح الخشب الأبيض"},
"blockTypeRail":function(d){return "قضيب"},
"blockTypeSand":function(d){return "رمل"},
"blockTypeSandstone":function(d){return "حجر رملي"},
"blockTypeStone":function(d){return "حجر"},
"blockTypeTnt":function(d){return "تي. إن. تي"},
"blockTypeTree":function(d){return "شجرة"},
"blockTypeWater":function(d){return "ماء"},
"blockTypeWool":function(d){return "صوف"},
"blockWhileXAheadAhead":function(d){return "في الأمام"},
"blockWhileXAheadDo":function(d){return "نفّذ"},
"blockWhileXAheadWhile":function(d){return "أكرر طالما"},
"generatedCodeDescription":function(d){return "بسحب الكتل ووضعها في هذا اللغز، فإنك بذلك قد تمكّنت من إنشاء مجموعة من التعليمات بإحدى لغات الكمبيوتر التي تعرف باسم Javascript. وتخبر هذه التعليمات البرمجية أجهزة الكمبيوتر بما يجب عرضه على الشاشة. وكذلك كل ما تراه وتنفّذه في Minecraft يبدأ بأسطر تعليمات برمجية كهذه."},
"houseSelectChooseFloorPlan":function(d){return "اختر مخطط الطابق الخاص بمنزلك."},
"houseSelectEasy":function(d){return "سهل"},
"houseSelectHard":function(d){return "صعب"},
"houseSelectLetsBuild":function(d){return "هيا بنا نبني منزلاً."},
"houseSelectMedium":function(d){return "متوسط"},
"keepPlayingButton":function(d){return "مواصلة اللعب"},
"level10FailureMessage":function(d){return "قم بتغطية الحمم للسير عليها، ثم احفر للحصول على كتلتين حديديتين على الجانب الآخر."},
"level11FailureMessage":function(d){return "في حالة وجود حمم أمامك، تأكد من وضع الحصاة أمامك. يتيح لك ذلك حفر صف الموارد المعني بأمان."},
"level12FailureMessage":function(d){return "تأكد من حفر 3 كتل من الحجر الأحمر. ويجمع ذلك ما تعلمته من بناء منزلك واستخدام عبارات \"if\" لتجنب السقوط في الحمم."},
"level13FailureMessage":function(d){return "ضع \"rail\" على طول مسار الكتل الترابية من بابك حتى حدود الخريطة."},
"level1FailureMessage":function(d){return "يجب عليك استخدام أوامر للسير باتجاه الخراف."},
"level1TooFewBlocksMessage":function(d){return "جرّب استخدام المزيد من الأوامر للسير باتجاه الخراف."},
"level2FailureMessage":function(d){return "لقطع شجرة، تحرّك للوصول إلى جذعها واستخدم الأمر \"destroy block\"."},
"level2TooFewBlocksMessage":function(d){return "جرّب استخدام المزيد من الأوامر لقطع شجرة. تحرّك للوصول إلى جذعها واستخدم الأمر \"destroy block\"."},
"level3FailureMessage":function(d){return "لتجميع الصوف من الخروفين، تحرّك تجاه كل منهما واستخدم الأمر \"shear\". تذكر استخدام أوامر الاتجاهات للوصول إلى الخروفين."},
"level3TooFewBlocksMessage":function(d){return "جرّب استخدام المزيد من الأوامر لتجميع الصوف من الخروفين. تحرّك تجاه كل منهما واستخدم الأمر \"shear\"."},
"level4FailureMessage":function(d){return "يتعين عليك استخدام الأمر \"destroy block\" عند كل جذع من جذوع الشجرات الثلاث."},
"level5FailureMessage":function(d){return "ضع الكتل على حدود الكتل الترابية لبناء جدار. سيعمل الأمر \"repeat\" القرنفلي على تشغيل أوامر موجودة بداخله، مثل \"place block\" و\"move forward\"."},
"level6FailureMessage":function(d){return "ضع الكتل داخل حدود الكتل الترابية الخاصة بالمنزل لإكمال اللغز."},
"level7FailureMessage":function(d){return "استخدم الأمر \"plant\" لوضع المحاصيل بكل رقعة من التربة المحروثة الداكنة."},
"level8FailureMessage":function(d){return "إذا لمست أحد المخلوقات العدائية، فسينفجر. تسلل حول تلك المخلوقات وأدخل منزلك."},
"level9FailureMessage":function(d){return "لا تنس وضع مصباحين على الأقل لإضاءة طريقك وكذلك الحفر لاستخراج كتلتين من الفحم على الأقل."},
"minecraftBlock":function(d){return "كتلة"},
"nextLevelMsg":function(d){return "اكتمل اللغز "+craft_locale.v(d,"puzzleNumber")+". تهانينا!"},
"playerSelectChooseCharacter":function(d){return "اختر شخصيتك."},
"playerSelectChooseSelectButton":function(d){return "تحديد"},
"playerSelectLetsGetStarted":function(d){return "لنبدأ."},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على \"Keep Playing\" للعودة إلى ممارسة اللعبة."},
"replayButton":function(d){return "إعادة تشغيل"},
"selectChooseButton":function(d){return "تحديد"},
"tooManyBlocksFail":function(d){return "اكتمل اللغز "+craft_locale.v(d,"puzzleNumber")+". تهانينا! يمكنك أيضًا إكماله من خلال "+craft_locale.p(d,"numBlocks",0,"ar",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};