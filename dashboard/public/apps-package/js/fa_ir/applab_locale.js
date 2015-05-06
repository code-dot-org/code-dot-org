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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "اقدامات"},
"catControl":function(d){return "حلقه‌ها"},
"catEvents":function(d){return "رویدادها"},
"catLogic":function(d){return "منطق"},
"catMath":function(d){return "محاسبات ریاضی"},
"catProcedures":function(d){return "توابع"},
"catText":function(d){return "متن"},
"catVariables":function(d){return "متغیرها"},
"continue":function(d){return "ادامه بده"},
"container":function(d){return "فضا سازی کنید"},
"containerTooltip":function(d){return "یک فضای جداسازی می سازد و داخلش را HTML قرار می دهد."},
"finalLevel":function(d){return "تبریک! شما پازل نهایی را حل کردید."},
"nextLevel":function(d){return "تبریک! شما این پازل را به اتمام رساندید."},
"no":function(d){return "نه"},
"numBlocksNeeded":function(d){return "این پازل می تواند با %1 از بلوکها حل شود."},
"pause":function(d){return "شکستن"},
"reinfFeedbackMsg":function(d){return "شما می توانید  دکمه ی \"Try again\" را فشار دهید تا به اجرای دوباره برنامه ی خود برگردید."},
"repeatForever":function(d){return "تکرار بی‌پایان"},
"repeatDo":function(d){return "انحام دادن"},
"repeatForeverTooltip":function(d){return "وقتی برنامه در حال اجراست، اقدامات داخل این بلوک را بطور پی در پی اجرا کن."},
"shareApplabTwitter":function(d){return "برنامه‌ای که ساخته‌ام را ببین. من خودم با @codeorg آن را نوشته‌ام"},
"shareGame":function(d){return "App خود را به اشتراک بگذارید:"},
"stepIn":function(d){return "به داخل قدم بگذار"},
"stepOver":function(d){return "از رویش قدم بردار"},
"stepOut":function(d){return "به بیرون قدم بگذار"},
"viewData":function(d){return "داده ها را ببین"},
"yes":function(d){return "بله"}};