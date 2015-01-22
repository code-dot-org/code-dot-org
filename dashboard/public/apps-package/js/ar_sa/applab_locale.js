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
"createHtmlBlock":function(d){return "create html block"},
"createHtmlBlockTooltip":function(d){return "Creates a block of HTML in the app."},
"finalLevel":function(d){return "تهانينا ! لقد قمت بحل اللغز الاخير."},
"nextLevel":function(d){return "تهانينا! لقد قمت بإكمال هذا اللغز."},
"no":function(d){return "لا"},
"numBlocksNeeded":function(d){return "يمكن حل هذا الغز ب  %1 من القطع."},
"pause":function(d){return "Break"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to running your app."},
"repeatForever":function(d){return "كرّر باستمرار"},
"repeatDo":function(d){return "نفّذ"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the app is running."},
"shareApplabTwitter":function(d){return "Check out the app I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your app:"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"viewData":function(d){return "View Data"},
"yes":function(d){return "نعم"}};