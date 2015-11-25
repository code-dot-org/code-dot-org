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
"blockDestroyBlock":function(d){return "تدمير المكعب البرمجي"},
"blockIf":function(d){return "إذا كان"},
"blockIfLavaAhead":function(d){return "لو الحمم البركانية امامك"},
"blockMoveForward":function(d){return "تحريك إلى الأمام"},
"blockPlaceTorch":function(d){return "وضع مشعل"},
"blockPlaceXAheadAhead":function(d){return "أمامك"},
"blockPlaceXAheadPlace":function(d){return "ضع"},
"blockPlaceXPlace":function(d){return "ضع"},
"blockPlantCrop":function(d){return "زراعة محصول"},
"blockShear":function(d){return "قصّ"},
"blockTillSoil":function(d){return "تقليب التربة"},
"blockTurnLeft":function(d){return "اتجه إلى اليسار"},
"blockTurnRight":function(d){return "اتجه إلى اليمين"},
"blockTypeBedrock":function(d){return "حجر الأساس"},
"blockTypeBricks":function(d){return "الطوب"},
"blockTypeClay":function(d){return "طين"},
"blockTypeClayHardened":function(d){return "طين صلب (مقوّى)"},
"blockTypeCobblestone":function(d){return "البلاط"},
"blockTypeDirt":function(d){return "الارض"},
"blockTypeDirtCoarse":function(d){return "أرض قاحلة"},
"blockTypeEmpty":function(d){return "فراغ"},
"blockTypeFarmlandWet":function(d){return "الأراضي الزراعية"},
"blockTypeGlass":function(d){return "الزجاج"},
"blockTypeGrass":function(d){return "العشب"},
"blockTypeGravel":function(d){return "الحصى"},
"blockTypeLava":function(d){return "الحمم البركانية"},
"blockTypeLogAcacia":function(d){return "اكاسيا"},
"blockTypeLogBirch":function(d){return "نبات القضبان"},
"blockTypeLogJungle":function(d){return "قطعة من أخشاب الأدغال"},
"blockTypeLogOak":function(d){return "قطعة البلوط"},
"blockTypeLogSpruce":function(d){return "قطعة من شجرة التنوب"},
"blockTypeOreCoal":function(d){return "فحم خام"},
"blockTypeOreDiamond":function(d){return "الماس خام"},
"blockTypeOreEmerald":function(d){return "الزمرد الخام"},
"blockTypeOreGold":function(d){return "الذهب الخام"},
"blockTypeOreIron":function(d){return "الحديد الخام"},
"blockTypeOreLapis":function(d){return "خام اللازورد"},
"blockTypeOreRedstone":function(d){return "ريدستون خام"},
"blockTypePlanksAcacia":function(d){return "ألواح اكاسيا"},
"blockTypePlanksBirch":function(d){return "ألواح شجرة القضبان"},
"blockTypePlanksJungle":function(d){return "ألواح الأدغال"},
"blockTypePlanksOak":function(d){return "ألواح البلوط"},
"blockTypePlanksSpruce":function(d){return "ألواح التنوب"},
"blockTypeRail":function(d){return "السكك الحديدية"},
"blockTypeSand":function(d){return "الرمال"},
"blockTypeSandstone":function(d){return "حجر رملي"},
"blockTypeStone":function(d){return "حجر"},
"blockTypeTnt":function(d){return "متفجرات"},
"blockTypeTree":function(d){return "شجرة"},
"blockTypeWater":function(d){return "المياه"},
"blockTypeWool":function(d){return "الصوف"},
"blockWhileXAheadAhead":function(d){return "أمامك"},
"blockWhileXAheadDo":function(d){return "نفّذ"},
"blockWhileXAheadWhile":function(d){return "أكرر طالما"},
"generatedCodeDescription":function(d){return "عن طريق سحب ووضع الكتل في هذا اللغز، قمت بإنشاء مجموعة من التعليمات في لغة الحاسوب التي تسمى جافا سكريبت. هذه التعليمات البرمجية تخبر الحاسوب ما يجب عرضه على الشاشة. كل شيء يمكنك رؤيته والقيام به في ماين كرافت يبدأ بأسطر من التعليمات البرمجية مثل هذه."},
"houseSelectChooseFloorPlan":function(d){return "إختر مخطط الطابق لمنزلك."},
"houseSelectEasy":function(d){return "سهل"},
"houseSelectHard":function(d){return "صعب"},
"houseSelectLetsBuild":function(d){return "دعونا نبني بيتا."},
"houseSelectMedium":function(d){return "متوسّط"},
"keepPlayingButton":function(d){return "استمر في اللعب"},
"level10FailureMessage":function(d){return "قم بتغطية الحمم البركانية لتتمكن من العبور، ثم استخرج قطعتين من الحديد من الجهة المقابلة."},
"level11FailureMessage":function(d){return "تأكد من وضع البلاط أمامك إذا كان هناك حمم تقابلك. هذا سوف يتيح لك الاستخراج بأمان في هذا الصف من الموارد."},
"level12FailureMessage":function(d){return "تأكد من استخراج 3 قطع ريدستون. هذا يجمع بين ما تعلمته من بناء منزلك، واستخدام التركيب \"إذا\" لتجنب الوقوع في الحمم البركانية."},
"level13FailureMessage":function(d){return "ضع \"السكك الحديدية\" على طول الطريق الترابية المؤدية من الباب الخاص بك إلى حافة الخريطة."},
"level1FailureMessage":function(d){return "أنت بحاجة إلى استخدام أوامر للمشي إلى الأغنام."},
"level1TooFewBlocksMessage":function(d){return "حاول استخدام المزيد من الأوامر للتقدم للأغنام."},
"level2FailureMessage":function(d){return "لإسقاط الشجرة، تقدم نحو جذعها و استخدم المقطع \"تدمير كتلة\"."},
"level2TooFewBlocksMessage":function(d){return "حاول استخدام مقاطع إضافية لإسقاط الشجرة. تقدّم إلى جذعها، ثم استخدم الأمر \"تدمير كتلة\"."},
"level3FailureMessage":function(d){return "لجمع الصوف من الأغنام، تقدّم إلى كل واحد واستخدم الأمر \"قص\". تذكر استخدام المقاطع \"استدر إلى\"  للوصول إلى الخراف."},
"level3TooFewBlocksMessage":function(d){return "حاول استخدام المزيد من الأوامر البرمجية لجمع الصوف من الأغنام. تقدّم إلى كل واحد منهما واستخدم الأمر \"قص\"."},
"level4FailureMessage":function(d){return "يجب استخدام المقطع \"تدمير كتلة\" على كل جذع من جذوع الأشجار الثلاثة."},
"level5FailureMessage":function(d){return "ضع القطع على جانب الأرض  لبناء جدار. المقطع البرمجي  الوردي \"تكرار\" سيشغل الأوامر الموضوعة داخله، مثل \"ضع كتلة\" و \"تقدّم إلى الأمام\"."},
"level6FailureMessage":function(d){return "ضع الكتل على جوانب المنزل لإكمال اللغز."},
"level7FailureMessage":function(d){return "استخدم الأمر \"إزرع\" لوضع المحاصيل على كل جزء من التربة الداكنة المحروثة."},
"level8FailureMessage":function(d){return "إذا لمست واحدة من الزواحف، ستنفجر. تجنبهم و ادخل منزلك."},
"level9FailureMessage":function(d){return "لا تنسى أن تضع مشعلين على الأقل لإضاءة  طريقك و استخرج على الأقل قطعتين من الفحم."},
"minecraftBlock":function(d){return "قطعة"},
"nextLevelMsg":function(d){return "أنهيت اللغز "+craft_locale.v(d,"puzzleNumber")+" . تهانينا!"},
"playerSelectChooseCharacter":function(d){return "إختر اللاعب المفضّل."},
"playerSelectChooseSelectButton":function(d){return "إختيار"},
"playerSelectLetsGetStarted":function(d){return "دعونا نبدأ."},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على \"الاستمرار في اللعب\" للعودة إلى لعبتك."},
"replayButton":function(d){return "اللعب من جديد"},
"selectChooseButton":function(d){return "إختيار"},
"tooManyBlocksFail":function(d){return "اللغز "+craft_locale.v(d,"puzzleNumber")+" إنتهى. تهانينا! من الممكن أيضا إستكماله مع  "+craft_locale.p(d,"numBlocks",0,"ar",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};