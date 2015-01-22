var locale = {lc:{"ar":function(n){
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
  },"it":function(n){return n===1?"one":"other"},"ja":function(n){return "other"},"ko":function(n){return "other"},"lt":function(n){
  if ((n % 10) == 1 && ((n % 100) < 11 || (n % 100) > 19)) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 9 &&
      ((n % 100) < 11 || (n % 100) > 19) && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"lv":function(n){
  if (n === 0) {
    return 'zero';
  }
  if ((n % 10) == 1 && (n % 100) != 11) {
    return 'one';
  }
  return 'other';
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || ((n % 100) >= 2 && (n % 100) <= 4 && n == Math.floor(n))) {
    return 'few';
  }
  if ((n % 100) >= 11 && (n % 100) <= 19 && n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"nl":function(n){return n===1?"one":"other"},"no":function(n){return n===1?"one":"other"},"pl":function(n){
  if (n == 1) {
    return 'one';
  }
  if ((n % 10) >= 2 && (n % 10) <= 4 &&
      ((n % 100) < 12 || (n % 100) > 14) && n == Math.floor(n)) {
    return 'few';
  }
  if ((n % 10) === 0 || n != 1 && (n % 10) == 1 ||
      ((n % 10) >= 5 && (n % 10) <= 9 || (n % 100) >= 12 && (n % 100) <= 14) &&
      n == Math.floor(n)) {
    return 'many';
  }
  return 'other';
},"pt":function(n){return n===1?"one":"other"},"ro":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n === 0 || n != 1 && (n % 100) >= 1 &&
      (n % 100) <= 19 && n == Math.floor(n)) {
    return 'few';
  }
  return 'other';
},"ru":function(n){
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
},"sk":function(n){
  if (n == 1) {
    return 'one';
  }
  if (n == 2 || n == 3 || n == 4) {
    return 'few';
  }
  return 'other';
},"sl":function(n){
  if ((n % 100) == 1) {
    return 'one';
  }
  if ((n % 100) == 2) {
    return 'two';
  }
  if ((n % 100) == 3 || (n % 100) == 4) {
    return 'few';
  }
  return 'other';
},"sq":function(n){return n===1?"one":"other"},"sr":function(n){
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
},"sv":function(n){return n===1?"one":"other"},"ta":function(n){return n===1?"one":"other"},"th":function(n){return "other"},"tr":function(n){return n===1?"one":"other"},"uk":function(n){
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
},"ur":function(n){return n===1?"one":"other"},"vi":function(n){return "other"},"zh":function(n){return "other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "y"},
"booleanTrue":function(d){return "verdadero"},
"booleanFalse":function(d){return "falso"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Acciones"},
"catColour":function(d){return "Color"},
"catLogic":function(d){return "Lógica"},
"catLists":function(d){return "Listas"},
"catLoops":function(d){return "Iteraciones"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "Funciones"},
"catText":function(d){return "texto"},
"catVariables":function(d){return "Variables"},
"codeTooltip":function(d){return "Ver el código JavaScript generado."},
"continue":function(d){return "Continuar"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "O"},
"end":function(d){return "fin"},
"emptyBlocksErrorMsg":function(d){return "Los bloques \"repetir\" o \"si\" deben tener otros bloques dentro de ellos para funcionar. Asegúrate que el bloque interno quede correctamente dentro del bloque que lo contiene."},
"emptyFunctionBlocksErrorMsg":function(d){return "El bloque de función necesita tener otros bloques en su interior para funcionar."},
"errorEmptyFunctionBlockModal":function(d){return "Deben haber bloques dentro de tu definición de función. Haga clic en Editar y arrastre bloques dentro del bloque verde."},
"errorIncompleteBlockInFunction":function(d){return "Haga clic en \"Editar\" para asegurarse de que no tienes ningún bloque desaparecido dentro de su definición de función."},
"errorParamInputUnattached":function(d){return "Recuerda adjuntar un bloque a cada parámetro de entrada en el bloque función en tu espacio de trabajo."},
"errorUnusedParam":function(d){return "Añadiste un bloque parámetro pero no lo usaste en la definición. Asegúrate de que usas tu parámetro haciendo clic en Editar y situando el bloque parámetro dentro del bloque verde."},
"errorRequiredParamsMissing":function(d){return "Crea un parámetro para tu función haciendo clic en Editar y añadiendo los parámetros necesarios. Arrastra los nuevos bloques parámetro a la definición de tu función."},
"errorUnusedFunction":function(d){return "Has creado una función pero nunca la has usado en tu espacio de trabajo. Haz clic en Funciones en la caja de herramientas y asegúrate que la usas en tu programa."},
"errorQuestionMarksInNumberField":function(d){return "Intenta reemplazar \"???\" con un valor."},
"extraTopBlocks":function(d){return "Tienes bloques sueltos. ¿Quisiste adjuntarlos al bloque \"Cuando se ejecuta\"?"},
"finalStage":function(d){return "¡Felicidades! Has completado la etapa final."},
"finalStageTrophies":function(d){return "¡Felicidades! Has completado la etapa final y ganaste  "+locale.p(d,"numTrophies",0,"es",{"one":"un trofeo","other":locale.n(d,"numTrophies")+" trofeos"})+"."},
"finish":function(d){return "Terminar"},
"generatedCodeInfo":function(d){return "Incluso las mejores universidades enseñan programación basada en bloques (por ejemplo, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Pero, por debajo, los bloques que has programado también se pueden mostrar en JavaScript, el lenguaje de programación más utilizado en el mundo:"},
"hashError":function(d){return "Lo sentimos, '%1' no se corresponde con ningún programa guardado."},
"help":function(d){return "Ayuda"},
"hintTitle":function(d){return "Sugerencia:"},
"jump":function(d){return "salta"},
"levelIncompleteError":function(d){return "Estás utilizando todos los tipos necesarios de bloques pero no de la manera correcta."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crea tu propio juego Flappy Bird"},
"missingBlocksErrorMsg":function(d){return "Trata de resolver este puzzle usando uno o más de los bloques de abajo."},
"nextLevel":function(d){return "¡Felicidades! Completaste el Puzzle "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "¡Felicidades! Completaste el puzzle "+locale.v(d,"puzzleNumber")+" y ganaste "+locale.p(d,"numTrophies",0,"es",{"one":"un trofeo","other":locale.n(d,"numTrophies")+" trofeos"})+"."},
"nextStage":function(d){return "¡ Felicidades! Completaste "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "¡Felicidades! Completaste la etapa "+locale.v(d,"stageName")+" y ganaste "+locale.p(d,"numTrophies",0,"es",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "¡Felicidades! Completaste el puzzle "+locale.v(d,"puzzleNumber")+". (Sin embargo, podrías haber usado sólo "+locale.p(d,"numBlocks",0,"es",{"one":"1 bloque","other":locale.n(d,"numBlocks")+" bloques"})+".)"},
"numLinesOfCodeWritten":function(d){return "¡Acabas de escribir "+locale.p(d,"numLines",0,"es",{"one":"una línea","other":locale.n(d,"numLines")+" líneas"})+" de código!"},
"play":function(d){return "jugar"},
"print":function(d){return "Imprimir"},
"puzzleTitle":function(d){return "Puzzle "+locale.v(d,"puzzle_number")+" de "+locale.v(d,"stage_total")},
"repeat":function(d){return "repetir"},
"resetProgram":function(d){return "Reiniciar"},
"runProgram":function(d){return "Ejecutar"},
"runTooltip":function(d){return "Ejecuta el programa definido por los bloques del espacio de trabajo."},
"score":function(d){return "puntuación"},
"showCodeHeader":function(d){return "Mostrar el código"},
"showBlocksHeader":function(d){return "Mostrar bloques"},
"showGeneratedCode":function(d){return "Mostrar el código"},
"stringEquals":function(d){return "cadena =?"},
"subtitle":function(d){return "un entorno de programación visual"},
"textVariable":function(d){return "texto"},
"tooFewBlocksMsg":function(d){return "Estás utilizando todos los tipos necesarios de bloques, pero trata de usar más de estos tipos de bloques para completar este puzzle."},
"tooManyBlocksMsg":function(d){return "Puedes resolver este puzzle con <x id='START_SPAN'/><x id='END_SPAN'/> bloques."},
"tooMuchWork":function(d){return "¡Me has hecho trabajar mucho!  ¿Podrías tratar de repetir menos veces?"},
"toolboxHeader":function(d){return "bloques"},
"openWorkspace":function(d){return "Cómo funciona"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+locale.p(d,"numLines",0,"es",{"one":"1 línea","other":locale.n(d,"numLines")+" lineas"})+" de código."},
"tryAgain":function(d){return "Vuelve a intentarlo"},
"hintRequest":function(d){return "Ver pista"},
"backToPreviousLevel":function(d){return "Volver al nivel anterior"},
"saveToGallery":function(d){return "Guardar en la Galería"},
"savedToGallery":function(d){return "¡Guardado en la Galería!"},
"shareFailure":function(d){return "Perdón, no podemos compartir este programa."},
"workspaceHeader":function(d){return "Coloca tus bloques aquí:"},
"workspaceHeaderJavaScript":function(d){return "Escribe tu código JavaScript aquí"},
"infinity":function(d){return "Infinito"},
"rotateText":function(d){return "Gira tu dispositivo."},
"orientationLock":function(d){return "Desactiva el bloqueo de orientación en la configuración del dispositivo."},
"wantToLearn":function(d){return "¿Quieres aprender a programar?"},
"watchVideo":function(d){return "Mira el Video"},
"when":function(d){return "cuando"},
"whenRun":function(d){return "cuando se ejecuta"},
"tryHOC":function(d){return "Prueba la Hora del Código"},
"signup":function(d){return "Únete al curso de introducción"},
"hintHeader":function(d){return "Aquí hay un consejo:"},
"genericFeedback":function(d){return "Mira como terminaste, y trata de reparar tu programa."},
"toggleBlocksErrorMsg":function(d){return "Tienes que corregir un error en tu programa antes de que se pueda mostrar como bloques."},
"defaultTwitterText":function(d){return "Mira lo que hice"}};