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
},"da":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Handlinger"},
"catControl":function(d){return "Løkker"},
"catEvents":function(d){return "Hændelser"},
"catLogic":function(d){return "Logik"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catText":function(d){return "Tekst"},
"catVariables":function(d){return "Variabler"},
"continue":function(d){return "Fortsæt"},
"container":function(d){return "Opret container"},
"containerTooltip":function(d){return "Opretter en divisionscontainer og angiver dens interne HTML."},
"finalLevel":function(d){return "Tillykke! Du har løst det sidste puslespil."},
"nextLevel":function(d){return "Tillykke! Du har fuldført denne opgave."},
"no":function(d){return "Nej"},
"numBlocksNeeded":function(d){return "Denne opgave kan løses med %1 blokke."},
"pause":function(d){return "Break"},
"reinfFeedbackMsg":function(d){return "Du kan trykke på \"Prøv igen\" knappen for at gå tilbage til at køre din app."},
"repeatForever":function(d){return "Gentag for evigt"},
"repeatDo":function(d){return "udfør"},
"repeatForeverTooltip":function(d){return "Udføre handlinger i denne blok gentagne gange mens app kører."},
"shareApplabTwitter":function(d){return "Tjek appen jeg lavede. Jeg skrev det selv med @codeorg"},
"shareGame":function(d){return "Del din app:"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"viewData":function(d){return "Vis Data"},
"yes":function(d){return "Ja"}};