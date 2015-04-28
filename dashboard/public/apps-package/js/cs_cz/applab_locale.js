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
}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Akce"},
"catControl":function(d){return "Smyčky"},
"catEvents":function(d){return "Události"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkce"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Proměnné"},
"continue":function(d){return "Pokračovat"},
"container":function(d){return "create container"},
"containerTooltip":function(d){return "Creates a division container and sets its inner HTML."},
"finalLevel":function(d){return "Dobrá práce! Vyřešil si poslední hádanku."},
"nextLevel":function(d){return "Dobrá práce! Dokončil jsi tuto hádanku."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena pomocí %1 bloků."},
"pause":function(d){return "Přerušit"},
"reinfFeedbackMsg":function(d){return "Můžete stisknout tlačítko \"Zkusit znovu\" a vrátit se ke spuštění vaší aplikace."},
"repeatForever":function(d){return "opakujte navždy"},
"repeatDo":function(d){return "dělej"},
"repeatForeverTooltip":function(d){return "Provést akce v tomto bloku opakovaně za běhu aplikace."},
"shareApplabTwitter":function(d){return "Podívejte se na aplikaci, kterou jsem udělal. Napsal jsem to sám s @codeorg"},
"shareGame":function(d){return "Sdílejte své aplikace:"},
"stepIn":function(d){return "Krok"},
"stepOver":function(d){return "Krok přes"},
"stepOut":function(d){return "Krok ven"},
"viewData":function(d){return "Zobrazit data"},
"yes":function(d){return "Ano"}};