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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || ((n % 10) >= 5 && (n % 10) <= 9) ||
      ((n % 100) >= 11 && (n % 100) <= 14) && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"hu":function(n){return "other"},"id":function(n){return "other"},"is":function(n){
    return ((n%10) === 1 && (n%100) !== 11) ? 'one' : 'other';
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "کردەوەکان"},
"catControl":function(d){return "گرێکان"},
"catEvents":function(d){return "Events"},
"catLogic":function(d){return "لۆژيك"},
"catMath":function(d){return "بیرکاری"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "دەق"},
"catVariables":function(d){return "گۆڕاوەکان"},
"continue":function(d){return "Continue"},
"container":function(d){return "دەفر دروست بكە"},
"containerTooltip":function(d){return "بەشی کۆنتینەر دروست بکە و inner HTML بۆ دابنێ."},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pause":function(d){return "وەستان"},
"reinfFeedbackMsg":function(d){return "تۆ دەتوانی دوکمەی \"دووبارە هەوڵبدە\" بۆ دووبارە بەگەڕخستنی ئاپەکەت."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "do"},
"repeatForeverTooltip":function(d){return "كارەكە جێبەجێ بكە لەم بلۆك بە شێوەيەكى بەردەوام لەو كاتەى بەرنامەكە کار دەكات."},
"shareApplabTwitter":function(d){return "ئەم ئاپەی دروستم کردووە بەسەر بکەوە. من نووسیوومە بە هاوکاری @codeorg."},
"shareGame":function(d){return "ئاپەکەت هاوبەش بکە:"},
"stepIn":function(d){return "هەنگاو بۆناو"},
"stepOver":function(d){return "هەنگاوێک لەسەر"},
"stepOut":function(d){return "هەنگاوێک دەرەوە"},
"viewData":function(d){return "بینینی زانیارییەکان"},
"yes":function(d){return "Yes"}};