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
"and":function(d){return "et"},
"backToPreviousLevel":function(d){return "Retour au niveau précédent"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "blocs"},
"booleanFalse":function(d){return "faux"},
"booleanTrue":function(d){return "vrai"},
"catActions":function(d){return "Actions"},
"catColour":function(d){return "Couleur"},
"catLists":function(d){return "Listes"},
"catLogic":function(d){return "Logique"},
"catLoops":function(d){return "Boucles"},
"catMath":function(d){return "Calculs"},
"catProcedures":function(d){return "Fonctions"},
"catText":function(d){return "texte"},
"catVariables":function(d){return "Variables"},
"clearPuzzle":function(d){return "Recommencer"},
"clearPuzzleConfirm":function(d){return "Cela va réinitialiser le puzzle à son état de départ et supprimer tous les blocs que tu as ajoutés ou changés."},
"clearPuzzleConfirmHeader":function(d){return "Es-tu certain(e) de vouloir recommencer ?"},
"codeMode":function(d){return "Code"},
"codeTooltip":function(d){return "Voir le code JavaScript généré."},
"completedWithoutRecommendedBlock":function(d){return "Félicitations ! Tu as terminé le Puzzle "+common_locale.v(d,"puzzleNumber")+". (Mais tu aurais pu utiliser un bloc différent pour un meilleur code)"},
"continue":function(d){return "Continuer"},
"copy":function(d){return "Copie"},
"defaultTwitterText":function(d){return "Découvre ce que j'ai fait"},
"designMode":function(d){return "Conception"},
"dialogCancel":function(d){return "Annuler"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "E"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionWestLetter":function(d){return "O"},
"dropletBlock_addOperator_description":function(d){return "Ajouter deux nombres"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Ajouter un opérateur"},
"dropletBlock_andOperator_description":function(d){return "Retourner vrai seulement quand les deux expressions sont vraies et faux sinon"},
"dropletBlock_andOperator_signatureOverride":function(d){return "opérateur booléen ET"},
"dropletBlock_assign_x_description":function(d){return "Assigne un valeur à une variable existante. Par exemple, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Le nom assigné à la variable"},
"dropletBlock_assign_x_param1":function(d){return "valeur"},
"dropletBlock_assign_x_param1_description":function(d){return "La valeur attribuée à la variable."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assigner une variable"},
"dropletBlock_callMyFunction_description":function(d){return "Appelle une fonction nommée qui ne prend aucun paramètre"},
"dropletBlock_callMyFunction_n_description":function(d){return "Appelle une fonction nommée qui prend un ou des paramètres"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Appeler une fonction avec des paramètres"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Appeler une fonction"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Les valeurs initiales du tableau"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Créer une variable pour la première fois"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Déclare que le code va maintenant utiliser une variable et lui assigne une valeur initiale fournie par l'utilisateur"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "« Entrer la valeur »"},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Demander une valeur à l'utilisateur et l'enregistrer"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "« Entrer la valeur »"},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Déclarer une variable"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Déclarer une variable"},
"dropletBlock_divideOperator_description":function(d){return "Diviser deux nombres"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Opérateur de division"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Définit une fonction avec des paramètres"},
"dropletBlock_functionParams_none_description":function(d){return "Un ensemble d'instructions qui effectuent une tâche ou calculent une valeur quand la fonction est appelée"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Définit une fonction"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare deux nombres"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "instruction si"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "instruction si/sinon"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Opérateur d'inégalité"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare deux nombres"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Opérateur inférieur"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "Un nombre arbitraire."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.absolu(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2, …, nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, …, nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2, …, nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, …, nX)"},
"dropletBlock_mathRandom_description":function(d){return "Renvoie un nombre aléatoire entre 0 (inclus) et 1 non inclus (exclusif)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.Random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "Un nombre arbitraire."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.arrondi(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiplie deux nombres"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Opérateur de multiplication"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "Opérateur booléen NON"},
"dropletBlock_orOperator_description":function(d){return "Renvoie vrai lorsque chacune des expressions est vraie et faux sinon"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Opérateur booléen OU"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number ranging from the first number (min) to the second number (max), including both numbers in the range"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Le nombre minimal renvoyé"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Le nombre maximal renvoyé"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "retour"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Soustrait deux nombres"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Opérateur de soustraction"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlockInFunction":function(d){return "La fonction "+common_locale.v(d,"name")+" a un paramètre non défini."},
"emptyBlockInVariable":function(d){return "La variable "+common_locale.v(d,"name")+" à une entrée non remplie."},
"emptyBlocksErrorMsg":function(d){return "Le bloc « Répéter » ou « si » doit contenir d'autres blocs pour fonctionner. Assure-toi que le bloc interne s'insère correctement à l'intérieur du bloc conteneur."},
"emptyExampleBlockErrorMsg":function(d){return "Il te faut au moins deux exemples dans la fonction "+common_locale.v(d,"functionName")+". Assure-toi que chaque exemple a un appel et un résultat."},
"emptyFunctionBlocksErrorMsg":function(d){return "Le bloc « Fonction » doit contenir d'autres blocs pour fonctionner."},
"emptyFunctionalBlock":function(d){return "Un de vos blocs ne contient pas d'entrée."},
"emptyTopLevelBlock":function(d){return "Il n'y a pas de blocs à exécuter. Tu dois joindre un bloc au bloc "+common_locale.v(d,"topLevelBlockName")+"."},
"end":function(d){return "fin"},
"errorEmptyFunctionBlockModal":function(d){return "Il faut des blocs dans ta définition de fonction. Clique sur \"modifier\" puis fais glisser les blocs dans le bloc vert."},
"errorIncompleteBlockInFunction":function(d){return "Clique sur \"modifier\" pour t'assurer qu'il ne manque pas de blocs dans ta définition de fonction."},
"errorParamInputUnattached":function(d){return "N'oublie pas de joindre un bloc à chaque paramètre passé au bloc de fonction dans ton espace de travail."},
"errorQuestionMarksInNumberField":function(d){return "Essaie de remplacer \"???\" avec un nombre."},
"errorRequiredParamsMissing":function(d){return "Crée un paramètre pour ta fonction en cliquant sur « modifier » et en ajoutant les paramètres nécessaires. Fais glisser les nouveaux blocs de paramètres dans ta définition de fonction."},
"errorUnusedFunction":function(d){return "Tu as créé une fonction mais ne l'as pas ajoutée à ton espace de travail ! Clique « Fonctions » dans la boîte à outils et assure-toi d'utiliser ta fonction dans le programme."},
"errorUnusedParam":function(d){return "Tu as ajouté un bloc de paramètres, mais il n'a pas été utilisé dans la définition. Assure-toi d'utiliser ton paramètre en cliquant sur « modifier » et de placer le bloc de paramètres dans le bloc vert."},
"exampleErrorMessage":function(d){return "La fonction "+common_locale.v(d,"functionName")+" a un ou plusieurs des exemples qui doivent être modifiés. Assure-toi qu'ils correspondent à ta définition et qu'ils répondent à la question."},
"examplesFailedOnClose":function(d){return "Un ou plusieurs de tes exemples ne correspondent pas à ta définition. Vérifie tes exemples avant de terminer"},
"extraTopBlocks":function(d){return "Certains blocs ne sont pas attachés."},
"extraTopBlocksWhenRun":function(d){return "Certains blocs ne sont pas attachés. Voulais-tu les rattacher au bloc « quand l'exécution commence » ?"},
"finalStage":function(d){return "Félicitations ! Tu as terminé l'étape finale."},
"finalStageTrophies":function(d){return "Félicitations ! Tu as terminé l'étape finale et gagné "+common_locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":common_locale.n(d,"numTrophies")+" trophées"})+"."},
"finish":function(d){return "Terminer"},
"generatedCodeInfo":function(d){return "Même les plus grandes universités enseignent la programmation basée sur les blocs. (ex., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Mais en y regardant de plus près, les blocs que tu as assemblés peuvent aussi être affichés en JavaScript, le langage de programmation le plus utilisé au monde:"},
"hashError":function(d){return "Désolé, '%1' ne correspond à aucun programme enregistré."},
"help":function(d){return "Aide"},
"hideToolbox":function(d){return "(Masquer)"},
"hintHeader":function(d){return "Voici une astuce :"},
"hintRequest":function(d){return "Voir l'astuce"},
"hintTitle":function(d){return "Indice :"},
"ignore":function(d){return "Ignorer"},
"infinity":function(d){return "Infini"},
"jump":function(d){return "sauter"},
"keepPlaying":function(d){return "Continuer à jouer"},
"levelIncompleteError":function(d){return "Tu utilises tous les types de blocs nécessaires, mais pas de la bonne manière."},
"listVariable":function(d){return "liste"},
"makeYourOwnFlappy":function(d){return "Réalise ton propre jeu Flappy Bird"},
"missingRecommendedBlocksErrorMsg":function(d){return "Pas tout à fait. Essaye d'utiliser un bloc que tu n'utilises pas encore."},
"missingRequiredBlocksErrorMsg":function(d){return "Pas tout à fait. Tu dois utiliser un bloc que tu n'utilises pas encore."},
"nestedForSameVariable":function(d){return "Tu utilises la même variable dans deux ou plusieurs boucles imbriquées. Utilise des noms de variables uniques pour éviter des boucles infinies."},
"nextLevel":function(d){return "Félicitations ! Tu as terminé le Puzzle "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Félicitations ! Tu as terminé le Puzzle "+common_locale.v(d,"puzzleNumber")+" et gagné "+common_locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":common_locale.n(d,"numTrophies")+" trophées"})+"."},
"nextPuzzle":function(d){return "Puzzle suivant"},
"nextStage":function(d){return "Félicitations ! Tu as terminé "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Félicitations ! Tu as terminé "+common_locale.v(d,"stageName")+" et gagné "+common_locale.p(d,"numTrophies",0,"fr",{"one":"un trophée","other":common_locale.n(d,"numTrophies")+" trophées"})+"."},
"numBlocksNeeded":function(d){return "Félicitations ! Tu as terminé le Puzzle "+common_locale.v(d,"puzzleNumber")+". (Toutefois, tu aurais pu utiliser seulement "+common_locale.p(d,"numBlocks",0,"fr",{"one":"1 bloc","other":common_locale.n(d,"numBlocks")+" blocs"})+".)"},
"numLinesOfCodeWritten":function(d){return "Tu viens d'écrire "+common_locale.p(d,"numLines",0,"fr",{"one":"1 ligne","other":common_locale.n(d,"numLines")+" lignes"})+" de code !"},
"openWorkspace":function(d){return "Comment ça marche"},
"orientationLock":function(d){return "Désactive le verrouillage de l'orientation dans les réglages de votre appareil."},
"play":function(d){return "jouer"},
"print":function(d){return "Imprimer"},
"puzzleTitle":function(d){return "Puzzle "+common_locale.v(d,"puzzle_number")+" sur "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Afficher uniquement : "},
"repeat":function(d){return "répéter"},
"resetProgram":function(d){return "Réinitialiser"},
"rotateText":function(d){return "Tourne ton appareil."},
"runProgram":function(d){return "Démarrer"},
"runTooltip":function(d){return "Exécuter le programme défini par les blocs dans l'espace de travail."},
"runtimeErrorMsg":function(d){return "Ton programme ne s'est pas exécuté avec succès. Supprime la ligne "+common_locale.v(d,"lineNumber")+" et réessaie."},
"saveToGallery":function(d){return "Sauvegarder dans la galerie"},
"savedToGallery":function(d){return "Enregistré dans la galerie !"},
"score":function(d){return "score"},
"sendToPhone":function(d){return "Envoyer vers le téléphone"},
"shareFailure":function(d){return "Désolé, nous ne pouvons pas partager ce programme."},
"shareWarningsAge":function(d){return "S'il-te-plaît, indique ton âge ci-dessous et clique sur OK pour continuer."},
"shareWarningsMoreInfo":function(d){return "Plus d'information"},
"shareWarningsStoreData":function(d){return "Cette application construite sur Studio Code stocke les données qui pourraient être consultées par n'importe qui avec ce lien de partage, alors sois prudent si tu es invité à fournir des renseignements personnels."},
"showBlocksHeader":function(d){return "Afficher les blocs"},
"showCodeHeader":function(d){return "Afficher le code"},
"showGeneratedCode":function(d){return "Afficher le code"},
"showTextHeader":function(d){return "Afficher le texte"},
"showToolbox":function(d){return "Voir la boîte à outils"},
"showVersionsHeader":function(d){return "Historique des versions"},
"signup":function(d){return "Inscris-toi au cours d'introduction"},
"stringEquals":function(d){return "Texte = ?"},
"submit":function(d){return "Envoyer"},
"submitYourProject":function(d){return "Soumets ton projet"},
"submitYourProjectConfirm":function(d){return "Tu ne peux plus modifier ton projet après l'avoir envoyé, veux-tu vraiment l'envoyer maintenant ?"},
"unsubmit":function(d){return "Ne plus soumettre le travail"},
"unsubmitYourProject":function(d){return "Annuler la soumission de ton projet"},
"unsubmitYourProjectConfirm":function(d){return "Annuler la soumission de ton projet va réinitialiser la date de soumission, es-tu sûr de vouloir annuler la soumission ?"},
"subtitle":function(d){return "un environnement de programmation visuelle"},
"syntaxErrorMsg":function(d){return "Ton programme contient une faute de frappe. Supprime la ligne "+common_locale.v(d,"lineNumber")+" et réessaie."},
"textVariable":function(d){return "texte"},
"toggleBlocksErrorMsg":function(d){return "Tu dois corriger une erreur dans ton programme avant qu'il ne puisse être présenté sous forme de blocs."},
"tooFewBlocksMsg":function(d){return "Tu utilises tous les types de blocs nécessaires, mais essaye d'utiliser plus de ces types de blocs pour compléter ce puzzle."},
"tooManyBlocksMsg":function(d){return "Ce puzzle peut être résolu avec <x id ='START_SPAN'/><x id='END_SPAN'/> blocs."},
"tooMuchWork":function(d){return "Tu m'as fait beaucoup travailler ! Peux-tu essayer en répétant moins de fois ?"},
"toolboxHeader":function(d){return "Blocs"},
"toolboxHeaderDroplet":function(d){return "Boîte à outils"},
"totalNumLinesOfCodeWritten":function(d){return "Production totale : "+common_locale.p(d,"numLines",0,"fr",{"one":"1 ligne","other":common_locale.n(d,"numLines")+" lignes"})+" de code."},
"tryAgain":function(d){return "Réessayer"},
"tryBlocksBelowFeedback":function(d){return "Essaye d'utiliser un des blocs ci-dessous :"},
"tryHOC":function(d){return "Essayer l'Heure de Code"},
"unnamedFunction":function(d){return "Une des variables ou fonctions n'a pas de nom. N'oublie pas d'utiliser des noms descriptifs."},
"wantToLearn":function(d){return "Tu souhaites apprendre à coder ?"},
"watchVideo":function(d){return "Voir la vidéo"},
"when":function(d){return "quand"},
"whenRun":function(d){return "quand l'exécution commence"},
"workspaceHeaderShort":function(d){return "Espace de travail :"}};