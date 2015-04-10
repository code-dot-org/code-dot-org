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
"catEvents":function(d){return "ঘটনাবলী"},
"catLogic":function(d){return "যুক্তি"},
"catMath":function(d){return "গণিত"},
"catProcedures":function(d){return "ফাংশনগুলি"},
"catText":function(d){return "পাঠ"},
"catVariables":function(d){return "চলকগুলো"},
"continue":function(d){return "চালিয়ে যান"},
"container":function(d){return "কনটেইনার তৈরি করুন"},
"containerTooltip":function(d){return "ডিভিশন কনটেইনার তৈরি করে এর মাঝে এইচটিএমএল কোড নির্ধারণ করে।"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pause":function(d){return "বিরতি"},
"reinfFeedbackMsg":function(d){return "\"ট্রাই এগেইন\" বোতাম চেপে আপনার অ্যাপটি পুনরায় সচল করতে পারেন।"},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "করা"},
"repeatForeverTooltip":function(d){return "অ্যাপটি সচল থাকা অবস্থায় ব্লকের কাজগুলো বারবার নির্বাহ করুন।"},
"shareApplabTwitter":function(d){return "@codeorg তে আমার তৈরি অ্যাপটি ব্যবহার করে দেখুন।"},
"shareGame":function(d){return "আপনার অ্যাপটি শেয়ার করুন:"},
"stepIn":function(d){return "প্রবেশ করুন"},
"stepOver":function(d){return "এড়িয়ে যান"},
"stepOut":function(d){return "বাহিরে যান"},
"viewData":function(d){return "ডেটা দেখুন"},
"yes":function(d){return "\"হ্যাঁ\""}};