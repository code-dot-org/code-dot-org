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
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "ক্রিয়া"},
"catControl":function(d){return "Loops"},
"catEvents":function(d){return "Events"},
"catLogic":function(d){return "যুক্তি"},
"catMath":function(d){return "গণিত"},
"catProcedures":function(d){return "ফাংশনগুলি"},
"catText":function(d){return "পাঠ"},
"catVariables":function(d){return "চলকগুলো"},
"continue":function(d){return "চালিয়ে যান"},
"createHtmlBlock":function(d){return "html ব্লক তৈরি করুন"},
"createHtmlBlockTooltip":function(d){return "অ্যাপে একটি HTML ব্লক তৈরি করে।"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pause":function(d){return "বিরতি"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to running your app."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "করা"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the app is running."},
"shareWebappTwitter":function(d){return "Check out the app I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "আপনার অ্যাপটি শেয়ার করুন:"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"turnBlack":function(d){return "turn black"},
"turnBlackTooltip":function(d){return "Turns the screen black."},
"yes":function(d){return "\"হ্যাঁ\""}};