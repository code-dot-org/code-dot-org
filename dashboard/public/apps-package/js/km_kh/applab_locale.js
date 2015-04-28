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
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "សកម្មភាព"},
"catControl":function(d){return "រង្វិល​ជុំ"},
"catEvents":function(d){return "ព្រឹត្តិការណ៍"},
"catLogic":function(d){return "តក្ក"},
"catMath":function(d){return "គណិត​វិទ្យា"},
"catProcedures":function(d){return "អនុ​គមន៍"},
"catText":function(d){return "អត្ថ​​បទ"},
"catVariables":function(d){return "អ​ថេរ"},
"continue":function(d){return "បន្ត"},
"container":function(d){return "create container"},
"containerTooltip":function(d){return "Creates a division container and sets its inner HTML."},
"finalLevel":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​ចុង​ក្រោយ​ហើយ។"},
"nextLevel":function(d){return "សូម​អបអរ​សាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​នេះ​ហើយ។"},
"no":function(d){return "ទេ"},
"numBlocksNeeded":function(d){return "ល្បែង​ប្រាជ្ញា​នេះ​អាច​ត្រូវ​បាន​ដោះស្រាយ​ជាមួយ​ប្លុក​ចំនួន %1 ។"},
"pause":function(d){return "បញ្ឈប់"},
"reinfFeedbackMsg":function(d){return "អ្នក​អាច​ចុច​ប៊ូតុង \"ព្យាយាម​ម្ដង​ទៀត\" ដើម្បី​ត្រឡប់​ទៅ​ដំណើរការ​កម្មវិធី​របស់​អ្នក។"},
"repeatForever":function(d){return "ធ្វើ​ឡើង​វិញ​ជា​រៀង​រហូត"},
"repeatDo":function(d){return "ធ្វើ"},
"repeatForeverTooltip":function(d){return "ធ្វើ​សកម្មភាព​នានា​ដែល​មាន​ក្នុង​ប្លុក​នេះ​ម្ដង​ហើយ​ម្ដង​ទៀត នៅ​ពេល​កម្មវិធី​កំពុង​ដំណើរការ។"},
"shareApplabTwitter":function(d){return "ចូល​មើល​កម្មវិធី​ដែល​ខ្ញុំ​បាន​ធ្វើ។ ខ្ញុំ​បាន​បង្កើត​វា​ដោយ​ខ្លួន​ឯង​ជាមួយ @codeorg"},
"shareGame":function(d){return "ចែករំលែក​កម្មវិធី​របស់​អ្នក៖"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"viewData":function(d){return "មើល​ទិន្នន័យ"},
"yes":function(d){return "យល់ព្រម"}};