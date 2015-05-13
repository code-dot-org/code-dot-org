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
},"en":function(n){return n===1?"one":"other"},"bg":function(n){return n===1?"one":"other"},"bn":function(n){return n===1?"one":"other"},"ca":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){applab_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:(k=applab_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){applab_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).applab_locale = {
"catActions":function(d){return "Accions"},
"catControl":function(d){return "Bucles"},
"catEvents":function(d){return "Esdeveniments"},
"catLogic":function(d){return "Lògic"},
"catMath":function(d){return "Matemàtiques"},
"catProcedures":function(d){return "Funcions"},
"catText":function(d){return "text"},
"catVariables":function(d){return "Variables"},
"continue":function(d){return "Continuar"},
"container":function(d){return "Crear contenidor"},
"containerTooltip":function(d){return "Crea un contenidor de divisió i estableix el seu HTML interior."},
"finalLevel":function(d){return "Felicitats! Has resolt el puzzle final."},
"nextLevel":function(d){return "Felicitats! Has complert aquest puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Aquest puzzle pot res resolt amb %1 blocs."},
"pause":function(d){return "Trencar"},
"reinfFeedbackMsg":function(d){return "Podeu prémer el botó \"Torna-ho a provar\" per tornar a executar la teva app."},
"repeatForever":function(d){return "repetir per sempre"},
"repeatDo":function(d){return "fer"},
"repeatForeverTooltip":function(d){return "Executa les accions en aquest bloc repetidament mentre l'app s'està executant."},
"shareApplabTwitter":function(d){return "Comprova l'app que he fet. Vaig crear-la jo amb @codeorg"},
"shareGame":function(d){return "Comparteix la teva app:"},
"stepIn":function(d){return "ficar-se"},
"stepOver":function(d){return "esquivar"},
"stepOut":function(d){return "Abandonar"},
"viewData":function(d){return "Veure dades"},
"yes":function(d){return "Sí"}};