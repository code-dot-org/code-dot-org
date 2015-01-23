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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"hu":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Műveletek"},
"catControl":function(d){return "Ciklusok"},
"catEvents":function(d){return "Események"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Függvények"},
"catText":function(d){return "szöveg"},
"catVariables":function(d){return "Változók"},
"continue":function(d){return "Tovább"},
"createHtmlBlock":function(d){return "html blokk készítése"},
"createHtmlBlockTooltip":function(d){return "HTML-ből álló blokkot készít az app-ban."},
"finalLevel":function(d){return "Gratulálok, megoldottad az utolsó feladatot."},
"nextLevel":function(d){return "Gratulálok! Ezt a feladatot megoldottad."},
"no":function(d){return "Nem"},
"numBlocksNeeded":function(d){return "Ez a feladat a(z) %1 blokkal megoldható."},
"pause":function(d){return "Törés"},
"reinfFeedbackMsg":function(d){return "Megnyomhatod az \"Újrapróbálás\" gombot hogy ismét futtasd az appod."},
"repeatForever":function(d){return "végtelen ismétlés"},
"repeatDo":function(d){return "csináld"},
"repeatForeverTooltip":function(d){return "A műveletek ismételt végrehajtása ebben a blokkban amíg az app fut."},
"shareWebappTwitter":function(d){return "Nézd meg az appot amit csináltam. Magam írtam a code.org felületén"},
"shareGame":function(d){return "App megosztása:"},
"stepIn":function(d){return "Belépés"},
"stepOver":function(d){return "Átlépés"},
"stepOut":function(d){return "Kilépés"},
"turnBlack":function(d){return "elsötétít"},
"turnBlackTooltip":function(d){return "Elsötétíti a képernyőt."},
"yes":function(d){return "Igen"}};