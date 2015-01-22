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
},"en":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Əmrlər"},
"catControl":function(d){return "Dövlər"},
"catEvents":function(d){return "Hadisələr"},
"catLogic":function(d){return "Məntiq"},
"catMath":function(d){return "Riyaziyyat"},
"catProcedures":function(d){return "Funksiyalar"},
"catText":function(d){return "mətn"},
"catVariables":function(d){return "Dəyişənlər"},
"continue":function(d){return "Davam et"},
"createHtmlBlock":function(d){return "create html block"},
"createHtmlBlockTooltip":function(d){return "Creates a block of HTML in the app."},
"finalLevel":function(d){return "Təbriklər! Axırıncı tapmacanı da tapdınız."},
"nextLevel":function(d){return "Təbriklər! Siz bu tapmacanı tamamladınız."},
"no":function(d){return "Xeyr"},
"numBlocksNeeded":function(d){return "Bu  tapmaca %1 blokla həll oluna bilər."},
"pause":function(d){return "Break"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to running your app."},
"repeatForever":function(d){return "təkrar et sonsuz"},
"repeatDo":function(d){return "et"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the app is running."},
"shareApplabTwitter":function(d){return "Check out the app I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your app:"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"viewData":function(d){return "View Data"},
"yes":function(d){return "Bəli"}};