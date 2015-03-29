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
"catControl":function(d){return "الحلقات"},
"catEvents":function(d){return "الأحداث"},
"catLogic":function(d){return "العمليات المنطقية"},
"catMath":function(d){return "العمليات الحسابية"},
"catProcedures":function(d){return "دوال"},
"catText":function(d){return "الجمل"},
"catVariables":function(d){return "المتغيرات"},
"continue":function(d){return "أستمر"},
"container":function(d){return "إنشاء حاوية"},
"containerTooltip":function(d){return "Creates a division container and sets its inner HTML."},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"nextLevel":function(d){return "تهانينا ! لقد تم الانتهاء من اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا اللغز مع قطع %1."},
"pause":function(d){return "فاصل"},
"reinfFeedbackMsg":function(d){return "يمكنك الضغط على زر \"حاول مرة أخرى\" للعودة إلى تشغيل التطبيق الخاص بك."},
"repeatForever":function(d){return "كرّر باستمرار"},
"repeatDo":function(d){return "نفّذ"},
"repeatForeverTooltip":function(d){return "تنفيذ الإجراءات في هذه المجموعة مرارا وتكرارا أثناء تشغيل التطبيق."},
"shareApplabTwitter":function(d){return "تحقق من التطبيق الذي برمجت. لقد كتبته بنفسي عن طريق @codeorg"},
"shareGame":function(d){return "شارك التطبيق الخاص بك:"},
"stepIn":function(d){return "خطوة للداخل"},
"stepOver":function(d){return "خطوة للأعلى"},
"stepOut":function(d){return "خطوة للخارج"},
"viewData":function(d){return "عرض البيانات"},
"yes":function(d){return "نعم"}};