var common_locale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"ga":function(n){return n==1?"one":(n==2?"two":"other")},"gl":function(n){return n===1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
},"mk":function(n){return (n%10)==1&&n!=11?"one":"other"},"mr":function(n){return n===1?"one":"other"},"ms":function(n){return "other"},"mt":function(n){
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
v:function(d,k){common_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:(k=common_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){common_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).common_locale = {
"and":function(d){return "y"},
"animationMode":function(d){return "Animación"},
"backToPreviousLevel":function(d){return "Volver al nivel anterior"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "bloques"},
"booleanFalse":function(d){return "falso"},
"booleanTrue":function(d){return "verdadero"},
"catActions":function(d){return "Acciones"},
"catColour":function(d){return "Color"},
"catLists":function(d){return "Listas"},
"catLogic":function(d){return "Lógica"},
"catLoops":function(d){return "Bucles"},
"catMath":function(d){return "Matemáticas"},
"catProcedures":function(d){return "Funciones"},
"catText":function(d){return "Texto"},
"catVariables":function(d){return "Variables"},
"choosePrefix":function(d){return "Elegir..."},
"clearPuzzle":function(d){return "Volver a empezar"},
"clearPuzzleConfirm":function(d){return "Esto reiniciará el desafio a su estado inicial y borrará todos los bloques que hayas agregado o cambiado."},
"clearPuzzleConfirmHeader":function(d){return "¿Seguro que quieres empezar de nuevo?"},
"codeMode":function(d){return "Código"},
"codeTooltip":function(d){return "Ver el código JavaScript generado."},
"completedWithoutRecommendedBlock":function(d){return "¡Felicitaciones! Has completado el Puzzle "+common_locale.v(d,"puzzleNumber")+". (Pero puedes usar un bloque diferente para un código más fuerte.)"},
"continue":function(d){return "Continuar"},
"copy":function(d){return "Copiar"},
"currentVersion":function(d){return "Versión Actual"},
"debugConsoleHeader":function(d){return "Debug Console"},
"debugCommandsHeaderWhenOpen":function(d){return "Debug Commands"},
"debugCommandsHeaderWhenClosed":function(d){return "Show Debug Commands"},
"debugWatchHeader":function(d){return "Mirar"},
"debugWatchNotAvailable":function(d){return "<no disponible>"},
"defaultTwitterText":function(d){return "Comprueba lo que hice"},
"designMode":function(d){return "Diseño"},
"dialogCancel":function(d){return "Cancelar"},
"dialogOK":function(d){return "Aceptar"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "O"},
"dropletBlock_addOperator_description":function(d){return "Suma dos números"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Añade un operador"},
"dropletBlock_andOperator_description":function(d){return "Es verdadero solo si las dos expresiones son verdaderas de otra manera es falso"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Operador boleano \"AND\""},
"dropletBlock_assign_x_description":function(d){return "Asigna un valor a una variable existente. Por ejemplo, x = 0;"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Asignar una variable"},
"dropletBlock_callMyFunction_description":function(d){return "Llama a una función nombrada que no tiene parámetros"},
"dropletBlock_callMyFunction_n_description":function(d){return "Llama a una función nombrada que tiene uno o más parámetros"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Llamar a una función con parámetros"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Llamar una función"},
"dropletBlock_comment_description":function(d){return "Escriba una descripción del código"},
"dropletBlock_comment_signatureOverride":function(d){return "comentario"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Defina una variable y asignela a una secuencia, con su valor inicial  "},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Defina una variable asignada a una secuencia"},
"dropletBlock_declareAssign_x_description":function(d){return "Declara una variable con el nombre dado después de 'var', y le asigna el valor en el lado derecho de la expresión"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare una variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Defina como el code podra usar la variable y asignarle un valor inicial dado por el usuario"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Solicite al usuario un valor y almacenelo"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare una variable"},
"dropletBlock_divideOperator_description":function(d){return "Dividir dos números"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Operador divisor"},
"dropletBlock_equalityOperator_description":function(d){return "Comprueba si dos valores son iguales. Devuelve true si el valor del lado izquierdo de la expresión es igual al valor en el lado derecho de la expresión y false en caso contrario"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Operador de igualdad"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Crea un bucle que consiste en una expresión de inicialización, una expresión condicional, una expresión incremental y un bloque de instrucciones los cuales se ejecutan con cada iteración del bucle"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "bucle \"for\""},
"dropletBlock_functionParams_n_description":function(d){return "Un conjunto de instrucciones que toma uno o mas parámetros y realiza una tarea o calcula un valor, cuando se manda llamar la función"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Define una función con parametros"},
"dropletBlock_functionParams_none_description":function(d){return "Un conjunto de instrucciones que realiza una tarea o calcula un valor, cuando se manda llamar la función"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Define una función"},
"dropletBlock_getTime_description":function(d){return "Obtener la hora actual en milisegundos"},
"dropletBlock_greaterThanOperator_description":function(d){return "Comprueba si un número es mayor que otro número. Devuelve true si el valor del lado izquierdo de la expresión es estrictamente mayor que el valor en el lado derecho de la expresión"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Operador mayor que"},
"dropletBlock_greaterThanOrEqualOperator_description":function(d){return "Tests whether a value is greater than or equal to another value. Returns true if the value on the left-hand side of the expression is greater than or equal to the value on the right-hand side of the expression."},
"dropletBlock_greaterThanOrEqualOperator_signatureOverride":function(d){return "Operador mayor o igual"},
"dropletBlock_ifBlock_description":function(d){return "Se ejecuta un bloque de sentencias si la condición especificada es verdadera"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "instrucción \"if\""},
"dropletBlock_ifElseBlock_description":function(d){return "Se ejecuta un bloque de sentencias si la condición especificada es verdadera; de lo contrario, se ejecutan el bloque de sentencias en la cláusula else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "Instruccion \"if/else\""},
"dropletBlock_inequalityOperator_description":function(d){return "Comprueba si dos valores no son iguales. Devuelve true si el valor del lado izquierdo de la expresión no es igual al valor en el lado derecho de la expresión"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Operador de desigualdad"},
"dropletBlock_lessThanOperator_description":function(d){return "Comprueba si un valor es menor que otro valor. Devuelve true si el valor del lado izquierdo de la expresión es estrictamente menor que el valor en el lado derecho de la expresión"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Operador menor que"},
"dropletBlock_lessThanOrEqualOperator_description":function(d){return "Comprueba si un valor es menor o igual que otro. Devuelve verdadero si el calor del lado izquierdo de la expresión es inferior al valor del lado derecho de la expresión."},
"dropletBlock_lessThanOrEqualOperator_signatureOverride":function(d){return "Operador menor o igual"},
"dropletBlock_mathAbs_description":function(d){return "Devuelve el valor absoluto de x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "Un número arbitrario."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Devuelve el valor mínimo entre uno o mas valores n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "Uno o más números para comparar."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Devuelve el valor mínimo entre uno o mas valores n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "Uno o más números para comparar."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Devuelve un número aleatorio desde 0 (incluido) hasta 1 (no incluido)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Redondea un número al entero más cercano"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "Un número arbitrario."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplicar dos números"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Operador de multiplicación"},
"dropletBlock_notOperator_description":function(d){return "Devuelve false si la expresión se puede convertir a verdadero; de lo contrario, devuelve verdadero"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Operador booleano NOT"},
"dropletBlock_orOperator_description":function(d){return "Devuelve verdadero cuando cualquier expresión es verdadero y falso si no"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Operador boleano \"OR\""},
"dropletBlock_randomNumber_description":function(d){return "Devuelve un número aleatorio en un rango cerrado desde min a max."},
"dropletBlock_randomNumber_param0":function(d){return "mín."},
"dropletBlock_randomNumber_param0_description":function(d){return "El mínimo número devuelto"},
"dropletBlock_randomNumber_param1":function(d){return "máx."},
"dropletBlock_randomNumber_param1_description":function(d){return "El número máximo devuelto"},
"dropletBlock_return_description":function(d){return "Regresa un valor de la función"},
"dropletBlock_return_signatureOverride":function(d){return "volver"},
"dropletBlock_setAttribute_description":function(d){return "Establece el valor dado"},
"dropletBlock_subtractOperator_description":function(d){return "Resta dos numeros"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Operador de resta"},
"dropletBlock_whileBlock_description":function(d){return "Crea un bucle que consta de una expresión condicional y un bloque de comandos ejecutados en cada iteración del bucle. El bucle continúa ejecutar mientras la condición se evalúa como true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "bucle \"while\""},
"emptyBlockInFunction":function(d){return "La función "+common_locale.v(d,"name")+" tiene una entrada sin rellenar."},
"emptyBlockInVariable":function(d){return "La variable "+common_locale.v(d,"name")+" tiene una entrada sin rellenar."},
"emptyBlocksErrorMsg":function(d){return "Los bloques \"repetir\" o \"si\" deben tener otros bloques dentro de ellos para funcionar. Asegúrate de que el bloque interno quede correctamente dentro del bloque que lo contiene."},
"emptyExampleBlockErrorMsg":function(d){return "Necesita al menos dos ejemplos de la función "+common_locale.v(d,"functionName")+". Asegúrate de que cada ejemplo tiene una llamada y un resultado."},
"emptyFunctionBlocksErrorMsg":function(d){return "El bloque de función necesita tener otros bloques en su interior para funcionar."},
"emptyFunctionalBlock":function(d){return "Tienes un bloque con una entrada vacía."},
"emptyTopLevelBlock":function(d){return "No hay bloques que ejecutar. Debes añadir un bloque al bloque "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "fin"},
"errorEmptyFunctionBlockModal":function(d){return "Deben haber bloques dentro de tu definición de función. Haz clic en Editar y arrastra bloques dentro del bloque verde."},
"errorIncompleteBlockInFunction":function(d){return "Haz clic en \"Editar\" para asegurarte de que no falta ningún bloque dentro de tu definición de función."},
"errorGenericLintError":function(d){return "Tu programa contiene un aviso en el editor que requiere ser arreglado. Pasa el cursos sobre los íconos cerca de los números en el editor para saber más."},
"errorParamInputUnattached":function(d){return "Recuerda adjuntar un bloque a cada parámetro de entrada en el bloque función en tu espacio de trabajo."},
"errorQuestionMarksInNumberField":function(d){return "Intenta reemplazar \"???\" con un valor."},
"errorRequiredParamsMissing":function(d){return "Crea un parámetro para tu función haciendo clic en Editar y añadiendo los parámetros necesarios. Arrastra los nuevos bloques parámetro a la definición de tu función."},
"errorUnusedFunction":function(d){return "Has creado una función pero nunca la has usado en tu espacio de trabajo. Haz clic en Funciones en la caja de herramientas y asegúrate de que la usas en tu programa."},
"errorUnusedParam":function(d){return "Añadiste un bloque parámetro pero no lo usaste en la definición. Asegúrate de que usas tu parámetro haciendo clic en Editar y situando el bloque parámetro dentro del bloque verde."},
"exampleErrorMessage":function(d){return "La función "+common_locale.v(d,"functionName")+" tiene uno o más ejemplos que necesitan ajuste. Asegúrate de que coincide con su definición y responde a la pregunta."},
"examplesFailedOnClose":function(d){return "Uno o más de sus ejemplos no coinciden con su definición. Comprueba tus ejemplos antes de cerrar"},
"extraTopBlocks":function(d){return "Tienes bloques con entradas vacías."},
"extraTopBlocksWhenRun":function(d){return "Tienes bloques sin ataduras. ¿Quisiste decir fijar estos al bloque \"cuando se ejecuta\"?"},
"finalStage":function(d){return "¡Felicitaciones! Has completado la etapa final."},
"finalStageTrophies":function(d){return "¡Felicitaciones! Has completado la etapa final y ganaste "+common_locale.p(d,"numTrophies",0,"es",{"one":"un trofeo","other":common_locale.n(d,"numTrophies")+" trofeos"})+"."},
"finish":function(d){return "Terminar"},
"generatedCodeInfo":function(d){return "Incluso las mejores universidades enseñan programación basada en bloques (por ejemplo, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Pero, por debajo, los bloques que has programado también se pueden mostrar en JavaScript, el lenguaje de programación más utilizado en el mundo:"},
"hashError":function(d){return "Lo sentimos, '%1' no se corresponde con ningún programa guardado."},
"help":function(d){return "Ayuda"},
"hideToolbox":function(d){return "(Ocultar)"},
"hintHeader":function(d){return "Aquí hay un consejo:"},
"hintPrompt":function(d){return "¿Necesitas ayuda?"},
"hintRequest":function(d){return "Ver sugerencia"},
"hintReviewTitle":function(d){return "Revisa tus sugerencias"},
"hintSelectInstructions":function(d){return "Instrucciones y sugerencias anteriores"},
"hintSelectNewHint":function(d){return "Recibe una nueva sugerencia"},
"hintTitle":function(d){return "Sugerencia:"},
"iconSearchPlaceholder":function(d){return "Busca un ícono..."},
"ignore":function(d){return "Ignorar"},
"infinity":function(d){return "Infinito"},
"jump":function(d){return "salta"},
"keepPlaying":function(d){return "Seguir jugando"},
"levelIncompleteError":function(d){return "Estás utilizando todos los tipos necesarios de bloques pero no de la manera correcta."},
"listVariable":function(d){return "lista"},
"makeYourOwnFlappy":function(d){return "Crea tu propio juego Flappy"},
"missingRecommendedBlocksErrorMsg":function(d){return "No exactamente. Prueba usando un bloque que aún no estés usando."},
"missingRequiredBlocksErrorMsg":function(d){return "No exactamente. Tienes que usar un bloque que no hayas usado todavía."},
"nestedForSameVariable":function(d){return "Estás usando la misma variable en dos o más ciclos anidados. Utiliza nombres de variables únicos para evitar ciclos infinitos."},
"nextLevel":function(d){return "¡Felicitaciones! Completaste el rompecabezas "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "¡Felicitaciones! Completaste el rompecabezas "+common_locale.v(d,"puzzleNumber")+" y ganaste "+common_locale.p(d,"numTrophies",0,"es",{"one":"un trofeo","other":common_locale.n(d,"numTrophies")+" trofeos"})+"."},
"nextPuzzle":function(d){return "Siguiente problema"},
"nextStage":function(d){return "¡Felicitaciones! Completaste "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "¡Felicitaciones! Completaste "+common_locale.v(d,"stageName")+" y ganaste "+common_locale.p(d,"numTrophies",0,"es",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"noIconsFound":function(d){return "No se encontraron íconos"},
"numBlocksNeeded":function(d){return "¡Felicitaciones! Completaste el rompecabezas "+common_locale.v(d,"puzzleNumber")+". (Sin embargo, podrías haber usado sólo "+common_locale.p(d,"numBlocks",0,"es",{"one":"1 bloque","other":common_locale.n(d,"numBlocks")+" bloques"})+".)"},
"numLinesOfCodeWritten":function(d){return "¡Acabas de escribir "+common_locale.p(d,"numLines",0,"es",{"one":"una línea","other":common_locale.n(d,"numLines")+" líneas"})+" de código!"},
"openWorkspace":function(d){return "Cómo funciona"},
"orientationLock":function(d){return "Desactiva el bloqueo de orientación en la configuración del dispositivo."},
"pause":function(d){return "Break"},
"play":function(d){return "jugar"},
"print":function(d){return "Imprimir"},
"projectWarning":function(d){return "Nota: Estás en un nivel que es parte de un proyecto extenso. Los cambios hechos en este nivel también aparecerán en otros niveles en el proyecto."},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" de "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Sólo ver: "},
"recommendedBlockContextualHintTitle":function(d){return "Trate de usar un bloque como este para resolver el rompecabezas."},
"repeat":function(d){return "repetir"},
"resetProgram":function(d){return "Reiniciar"},
"restoreThisVersion":function(d){return "Restaura esta Versión"},
"rotateText":function(d){return "Gira tu dispositivo."},
"runProgram":function(d){return "Ejecutar"},
"runTooltip":function(d){return "Ejecuta el programa definido por los bloques del espacio de trabajo."},
"runtimeErrorMsg":function(d){return "Tu programa no se ejecutó correctamente. Elimina la línea "+common_locale.v(d,"lineNumber")+" e inténtalo de nuevo."},
"saveToGallery":function(d){return "Guardar en Galería"},
"savedToGallery":function(d){return "¡Guardado en la Galería!"},
"score":function(d){return "puntuación"},
"sendToPhone":function(d){return "Enviar al teléfono"},
"shareFailure":function(d){return "Perdón, no podemos compartir este programa."},
"shareWarningsAge":function(d){return "Indica abajo tu edad y haz clic en Aceptar para continuar."},
"shareWarningsMoreInfo":function(d){return "Más información"},
"shareWarningsStoreData":function(d){return "Esta aplicación desarrollada con Code Studio almacena datos que pueden ser vistos por cualquiera que comparta este enlace, así que ten cuidado si se te pide que proporciones información personal."},
"showBlock":function(d){return "Obtén un bloque"},
"showBlocksHeader":function(d){return "Mostrar bloques"},
"showCodeHeader":function(d){return "Mostrar el código"},
"showGeneratedCode":function(d){return "Mostrar el código"},
"showTextHeader":function(d){return "Mostrar texto"},
"showToolbox":function(d){return "Mostrar el cuadro de herramientas"},
"showVersionsHeader":function(d){return "Historial de versiones"},
"signup":function(d){return "Únete al curso de introducción"},
"stepIn":function(d){return "Step in"},
"stepOver":function(d){return "Step over"},
"stepOut":function(d){return "Step out"},
"stringEquals":function(d){return "cadena =?"},
"submit":function(d){return "Enviar"},
"submitYourProject":function(d){return "Envía tu proyecto"},
"submitYourProjectConfirm":function(d){return "No puedes editar tu proyecto después de enviarlo, ¿deseas enviarlo ahora?"},
"unsubmit":function(d){return "NO enviado"},
"unsubmitYourProject":function(d){return "Retirar tu proyecto"},
"unsubmitYourProjectConfirm":function(d){return "Retirar tu proyecto también reiniciará la fecha de envío, ¿quieres retirarlo?"},
"subtitle":function(d){return "un entorno de programación visual"},
"syntaxErrorMsg":function(d){return "Tu programa contiene un error tipográfico. Elimina la línea "+common_locale.v(d,"lineNumber")+" e inténtalo de nuevo."},
"textVariable":function(d){return "texto"},
"toggleBlocksErrorMsg":function(d){return "Tienes que corregir un error en tu programa antes de que se pueda mostrar como bloques."},
"tooManyBlocksMsg":function(d){return "Puedes resolver este rompecabezas con <x id='START_SPAN'/><x id='END_SPAN'/> bloques."},
"tooMuchWork":function(d){return "¡Me has hecho trabajar mucho! ¿Podrías tratar de repetir menos veces?"},
"toolboxHeader":function(d){return "Bloques"},
"toolboxHeaderDroplet":function(d){return "Caja de Herramientas"},
"totalNumLinesOfCodeWritten":function(d){return "Total: "+common_locale.p(d,"numLines",0,"es",{"one":"1 línea","other":common_locale.n(d,"numLines")+" lineas"})+" de código."},
"tryAgain":function(d){return "Vuelve a intentarlo"},
"tryBlocksBelowFeedback":function(d){return "Prueba usando uno de los siguientes bloques:"},
"tryHOC":function(d){return "Prueba la Hora del Code"},
"unnamedFunction":function(d){return "Tienes una variable o función sin nombre. No olvides dar un nombre descriptivo a todo."},
"wantToLearn":function(d){return "¿Quieres aprender a programar?"},
"watchVideo":function(d){return "Mira el Video"},
"when":function(d){return "cuando"},
"whenRun":function(d){return "cuando se ejecuta"},
"workspaceHeaderShort":function(d){return "Espacio de trabajo: "}};