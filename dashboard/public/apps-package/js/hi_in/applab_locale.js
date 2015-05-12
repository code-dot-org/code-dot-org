var applab_locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "क्रियाएँ"},
"catControl":function(d){return "फंदे"},
"catEvents":function(d){return "Events"},
"catLogic":function(d){return "तर्क"},
"catMath":function(d){return "गणित"},
"catProcedures":function(d){return "कार्य"},
"catText":function(d){return "पाठ"},
"catVariables":function(d){return "चर"},
"continue":function(d){return "जारी रखें"},
"container":function(d){return "कंटेनर बनाएँ"},
"containerTooltip":function(d){return "एक प्रभाग कंटेनर बनाता है और इसकी भीतरी HTML सेट करता है।"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pause":function(d){return "तोड़ें"},
"reinfFeedbackMsg":function(d){return "आप \"Try again\" बटन दबा सकते हैं अपने app पर वापस जाने कए लिये."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "do"},
"repeatForeverTooltip":function(d){return "जब app चल रहां हो तो इस ब्लॉक के ऑक्शंस को बार-बार निष्पादित करें।"},
"shareApplabTwitter":function(d){return "मेरें बनाये गए app को देखें। मैंने इसे खुद लिखा हैं @code.org पर"},
"shareGame":function(d){return "अपना app शेयर करें:"},
"stepIn":function(d){return "अंदर देखें"},
"stepOver":function(d){return "ऊपर देखें"},
"stepOut":function(d){return "बाहर देखें"},
"viewData":function(d){return "डेटा देखें"},
"yes":function(d){return "Yes"}};