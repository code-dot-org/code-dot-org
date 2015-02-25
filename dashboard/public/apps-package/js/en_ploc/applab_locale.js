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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "!!-Actions-!!"},
"catControl":function(d){return "!!-Loops-!!"},
"catEvents":function(d){return "!!-Events-!!"},
"catLogic":function(d){return "!!-Logic-!!"},
"catMath":function(d){return "!!-Math-!!"},
"catProcedures":function(d){return "!!-Functions-!!"},
"catText":function(d){return "!!-Text-!!"},
"catVariables":function(d){return "!!-Variables-!!"},
"continue":function(d){return "!!-Continue-!!"},
"container":function(d){return "!!-create container-!!"},
"containerTooltip":function(d){return "!!-Creates a division container and sets its inner HTML.-!!"},
"finalLevel":function(d){return "!!-Congratulations! You have solved the final puzzle.-!!"},
"nextLevel":function(d){return "!!-Congratulations! You have completed this puzzle.-!!"},
"no":function(d){return "!!-No-!!"},
"numBlocksNeeded":function(d){return "!!-This puzzle can be solved with %1 blocks.-!!"},
"pause":function(d){return "!!-Break-!!"},
"reinfFeedbackMsg":function(d){return "!!-You can press the \"Try again\" button to go back to running your app.-!!"},
"repeatForever":function(d){return "!!-repeat forever-!!"},
"repeatDo":function(d){return "!!-do-!!"},
"repeatForeverTooltip":function(d){return "!!-Execute the actions in this block repeatedly while the app is running.-!!"},
"shareApplabTwitter":function(d){return "!!-Check out the app I made. I wrote it myself with @codeorg-!!"},
"shareGame":function(d){return "!!-Share your app:-!!"},
"stepIn":function(d){return "!!-Step in-!!"},
"stepOver":function(d){return "!!-Step over-!!"},
"stepOut":function(d){return "!!-Step out-!!"},
"viewData":function(d){return "!!-View Data-!!"},
"yes":function(d){return "!!-Yes-!!"}};