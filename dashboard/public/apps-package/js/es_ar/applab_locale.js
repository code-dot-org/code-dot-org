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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"catActions":function(d){return "Acciones"},
"catControl":function(d){return "Bucles"},
"catEvents":function(d){return "Eventos"},
"catLogic":function(d){return "Lógica"},
"catMath":function(d){return "Matemática"},
"catProcedures":function(d){return "Funciones"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "Variables"},
"continue":function(d){return "Continuar"},
"createHtmlBlock":function(d){return "crear un bloque html"},
"createHtmlBlockTooltip":function(d){return "Crea un bloque HTML en la aplicación."},
"finalLevel":function(d){return "¡Felicidades! Ha resuelto el rompecabezas final."},
"nextLevel":function(d){return "¡Felicidades! Has completado este puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Este rompecabezas puede resolverse con %1 bloques."},
"pause":function(d){return "Interrumpir"},
"reinfFeedbackMsg":function(d){return "Puede presionar el botón \"Intentarlo de nuevo\" para volver a ejecutar la aplicación."},
"repeatForever":function(d){return "Repetir para siempre"},
"repeatDo":function(d){return "hacer"},
"repeatForeverTooltip":function(d){return "Ejecutar las acciones en este bloque repetidamente mientras la aplicación se está ejecutando."},
"shareApplabTwitter":function(d){return "Revise la aplicación que he creado.  La escribí yo mismo con @codeorg"},
"shareGame":function(d){return "Comparte tu aplicación:"},
"stepIn":function(d){return "Entrar"},
"stepOver":function(d){return "Saltar"},
"stepOut":function(d){return "Salir"},
"viewData":function(d){return "Ver datos"},
"yes":function(d){return "Si"}};