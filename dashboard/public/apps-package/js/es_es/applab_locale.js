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
"catControl":function(d){return "vuelta"},
"catEvents":function(d){return "Eventos"},
"catLogic":function(d){return "Lógica"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "funciones"},
"catText":function(d){return "texto"},
"catVariables":function(d){return "variables"},
"continue":function(d){return "Continuar"},
"container":function(d){return "create container"},
"containerTooltip":function(d){return "Creates a division container and sets its inner HTML."},
"finalLevel":function(d){return "¡Felicidades! Has resuelto el puzzle final."},
"nextLevel":function(d){return "¡Felicidades! Has completado este puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "Este puzzle puede resolverse con %1 bloques."},
"pause":function(d){return "Interrumpir"},
"reinfFeedbackMsg":function(d){return "Puedes presionar el botón \"Intentar de nuevo\" para volver a ejecutar tu aplicación."},
"repeatForever":function(d){return "Repetir para siempre"},
"repeatDo":function(d){return "hacer"},
"repeatForeverTooltip":function(d){return "Ejecuta repetidamente las acciones en este bloque mientras la aplicación está ejecutando."},
"shareApplabTwitter":function(d){return "Échale un vistazo a la aplicación que hice. Yo mismo la escribí con @codeorg"},
"shareGame":function(d){return "Comparte tu aplicación:"},
"stepIn":function(d){return "Entrar"},
"stepOver":function(d){return "Esquivar"},
"stepOut":function(d){return "Salir"},
"viewData":function(d){return "Ver datos"},
"yes":function(d){return "Sí"}};