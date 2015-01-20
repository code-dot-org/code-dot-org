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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "פעולות"},
"catControl":function(d){return "לולאות"},
"catEvents":function(d){return "אירועים"},
"catLogic":function(d){return "הגיון"},
"catMath":function(d){return "מתמטיקה"},
"catProcedures":function(d){return "פונקציות"},
"catText":function(d){return "טקסט"},
"catVariables":function(d){return "משתנים"},
"continue":function(d){return "המשך"},
"createHtmlBlock":function(d){return "צור בלוק html"},
"createHtmlBlockTooltip":function(d){return "יוצר בלוק HTML באפליקציה."},
"finalLevel":function(d){return "כל הכבוד! פתרת את החידה האחרונה."},
"nextLevel":function(d){return "כל הכבוד! השלמת את החידה הזה."},
"no":function(d){return "לא"},
"numBlocksNeeded":function(d){return "ניתן לפתור את החידה עם %1 של אבני בנייה."},
"pause":function(d){return "שבור"},
"reinfFeedbackMsg":function(d){return "באפשרותך להקיש על לחצן \"נסה שוב\" כדי לחזור ולהריץ את האפליקציה שלך."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "בצע"},
"repeatForeverTooltip":function(d){return "בצע את הפעולות בבלוק הזה שוב ושוב כל עוד האפליקציה רצה."},
"shareWebappTwitter":function(d){return "תראו את האפליקציה שהכנתי. אני כתבתי אותה בעצמי עם @codeorg"},
"shareGame":function(d){return "שתף את האפליקציה שלך:"},
"stepIn":function(d){return "היכנס"},
"stepOver":function(d){return "עבור מעל"},
"stepOut":function(d){return "צא"},
"turnBlack":function(d){return "השחר"},
"turnBlackTooltip":function(d){return "הופך את המסך לשחור."},
"yes":function(d){return "כן"}};