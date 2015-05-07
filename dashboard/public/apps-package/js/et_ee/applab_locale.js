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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Tegevused"},
"catControl":function(d){return "Tsüklid"},
"catEvents":function(d){return "Sündmused"},
"catLogic":function(d){return "Loogika"},
"catMath":function(d){return "Matemaatika"},
"catProcedures":function(d){return "Funktsioonid"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Muutujad"},
"continue":function(d){return "Jätka"},
"container":function(d){return "Loo konteiner"},
"containerTooltip":function(d){return "Loob jagamise konteineri ja määrab selle sisemise HTML-i."},
"finalLevel":function(d){return "Tubli! Sa lahendasid viimase mõistatuse."},
"nextLevel":function(d){return "Palju õnne! See ülesanne on lahendatud."},
"no":function(d){return "Ei"},
"numBlocksNeeded":function(d){return "Selle ülesande saab lahendada %1 pusletükiga."},
"pause":function(d){return "Paus"},
"reinfFeedbackMsg":function(d){return "Võite vajutada \"Proovi uuesti\" nuppu, et minna tagasi oma rakenduse juurde."},
"repeatForever":function(d){return "korda igavesti"},
"repeatDo":function(d){return "täida"},
"repeatForeverTooltip":function(d){return "Teostab ülesandeid korduvalt selles plokis, kui rakendus töötab."},
"shareApplabTwitter":function(d){return "Vaata seda rakendust, mis ma tegin. Kirjutasin selle ise @codeorg-is"},
"shareGame":function(d){return "Jaga oma rakendust:"},
"stepIn":function(d){return "Astu sisse"},
"stepOver":function(d){return "Astu üle"},
"stepOut":function(d){return "Astu välja"},
"viewData":function(d){return "Vaata infot"},
"yes":function(d){return "Jah"}};