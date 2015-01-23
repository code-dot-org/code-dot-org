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
}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "الاجراءات"},
"catControl":function(d){return "الجمل التكرارية"},
"catEvents":function(d){return "الأحداث"},
"catLogic":function(d){return "منطق"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "الدوال"},
"catText":function(d){return "نص"},
"catVariables":function(d){return "المتغيرات"},
"continue":function(d){return "أستمر"},
"createHtmlBlock":function(d){return "إنشاء قطعة html"},
"createHtmlBlockTooltip":function(d){return "إنشاء قطعة من HTML في التطبيق."},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا الغز ب  %1 من القطع."},
"pause":function(d){return "فاصل"},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \"حاول مرة أخرى\" للعودة إلى تشغيل التطبيق الخاص بك."},
"repeatForever":function(d){return "كرّر باستمرار"},
"repeatDo":function(d){return "نفّذ"},
"repeatForeverTooltip":function(d){return "تنفيذ الإجراءات في هذه المجموعة مرارا وتكرارا أثناء تشغيل التطبيق."},
"shareWebappTwitter":function(d){return "تحقق من التطبيق الذي برمجت. لقد كتبته بنفسي عن طريق @codeorg"},
"shareGame":function(d){return "شارك التطبيق الخاص بك:"},
"stepIn":function(d){return "خطوة للداخل"},
"stepOver":function(d){return "خطوة للأعلى"},
"stepOut":function(d){return "خطوة للخارج"},
"turnBlack":function(d){return "يتحول إلى اللون الأسود"},
"turnBlackTooltip":function(d){return "تحويل الشاشة للأسود."},
"yes":function(d){return "نعم"}};