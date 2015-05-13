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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Aktionen"},
"catControl":function(d){return "Schleifen"},
"catEvents":function(d){return "Ereignisse"},
"catLogic":function(d){return "Logik"},
"catMath":function(d){return "Mathematik"},
"catProcedures":function(d){return "Funktionen"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variablen"},
"continue":function(d){return "Weiter"},
"container":function(d){return "Container erstellen"},
"containerTooltip":function(d){return "Erzeugt einen Teil-Container und legt seine innere HTML fest."},
"finalLevel":function(d){return "Glückwunsch! Sie haben das letzte Puzzle gelöst."},
"nextLevel":function(d){return "Herzlichen Glückwunsch! Du hast dieses Puzzle abgeschlossen."},
"no":function(d){return "Nein"},
"numBlocksNeeded":function(d){return "Dieses Puzzle kann mit  %1 Bausteinen gelöst werden."},
"pause":function(d){return "Pause"},
"reinfFeedbackMsg":function(d){return "Du kannst die \"Nochmal versuchen\"-Taste drücken, um wieder zu Deiner App zurückzukommen."},
"repeatForever":function(d){return "ewig wiederholen"},
"repeatDo":function(d){return "machen"},
"repeatForeverTooltip":function(d){return "Führe die Aktionen in diesem Block die ganze Zeit während die App läuft aus."},
"shareApplabTwitter":function(d){return "Schau Dir die App an, die ich gemacht habe. Ich habe sie selbst mit @codeorg geschrieben"},
"shareGame":function(d){return "Teile Deine App:"},
"stepIn":function(d){return "Einzelschritt"},
"stepOver":function(d){return "Überspringen"},
"stepOut":function(d){return "Herausspringen"},
"viewData":function(d){return "Daten anzeigen"},
"yes":function(d){return "Ja"}};