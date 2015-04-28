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
"catActions":function(d){return "Akcije"},
"catControl":function(d){return "Petlje"},
"catEvents":function(d){return "Događaji"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkcije"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Varijable"},
"continue":function(d){return "Nastavi"},
"container":function(d){return "kreiraj kontejner"},
"containerTooltip":function(d){return "Kreira kontejner za dijeljenje i postavlja njegov unutarnji HTML."},
"finalLevel":function(d){return "Čestitamo! Riješen je posljednji zadatak."},
"nextLevel":function(d){return "Čestitamo! Ovaj zadatak je riješen."},
"no":function(d){return "Ne"},
"numBlocksNeeded":function(d){return "Ovaj zadatak se može riješiti s %1 blokova."},
"pause":function(d){return "Prekid"},
"reinfFeedbackMsg":function(d){return "Možeš kliknuti na \"Pokušaj ponovo\" da bi se vratio/la na pokretanje tvog programa."},
"repeatForever":function(d){return "ponavljaj zauvijek"},
"repeatDo":function(d){return "uradi"},
"repeatForeverTooltip":function(d){return "Ponavljaj komande u ovom bloku sve dok aplikacija radi."},
"shareApplabTwitter":function(d){return "Provjeri ovu aplikaciju koju sam napravio. Napisao sam je sam uz pomoć @codeorg"},
"shareGame":function(d){return "Podijeli svoju aplikaciju:"},
"stepIn":function(d){return "Ukoračaj u"},
"stepOver":function(d){return "Prekorači preko"},
"stepOut":function(d){return "Iskorači van"},
"viewData":function(d){return "Pregledaj Podatke"},
"yes":function(d){return "Da"}};