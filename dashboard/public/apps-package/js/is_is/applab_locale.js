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
  }},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Aðgerðir"},
"catControl":function(d){return "Lykkjur"},
"catEvents":function(d){return "Atvik"},
"catLogic":function(d){return "Rökvísi"},
"catMath":function(d){return "Reikningur"},
"catProcedures":function(d){return "Föll"},
"catText":function(d){return "texti"},
"catVariables":function(d){return "Breytur"},
"continue":function(d){return "Áfram"},
"container":function(d){return "búa til ílát"},
"containerTooltip":function(d){return "Býr til div ílát og setur HTML innihald í það."},
"finalLevel":function(d){return "Til hamingju! Þú hefur leyst síðustu þrautina."},
"nextLevel":function(d){return "Til hamingju! Þú hefur klárað þessa þraut."},
"no":function(d){return "Nei"},
"numBlocksNeeded":function(d){return "Þessa þraut er hægt að leysa með %1 kubbum."},
"pause":function(d){return "Rof"},
"reinfFeedbackMsg":function(d){return "Þú getur smellt á \"Reyna aftur\" hnappinn til að fara aftur í að keyra appið þitt."},
"repeatForever":function(d){return "endurtaka endalaust"},
"repeatDo":function(d){return "gera"},
"repeatForeverTooltip":function(d){return "Gera aðgerðirnar í þessum kubbi aftur og aftur á meðan appið keyrir."},
"shareApplabTwitter":function(d){return "Kíktu á appið sem ég bjó til. Ég skrifaði það sjálf/ur með @codeorg"},
"shareGame":function(d){return "Deila appinu þínu:"},
"stepIn":function(d){return "Stíga inn í"},
"stepOver":function(d){return "Stíga yfir"},
"stepOut":function(d){return "Stíga út úr"},
"viewData":function(d){return "Skoða gögn"},
"yes":function(d){return "Já"}};