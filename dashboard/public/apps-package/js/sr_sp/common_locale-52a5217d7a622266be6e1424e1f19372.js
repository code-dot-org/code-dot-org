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
"and":function(d){return "И"},
"backToPreviousLevel":function(d){return "Натраг на претходни ниво"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "Blokovi"},
"booleanFalse":function(d){return "нетачно"},
"booleanTrue":function(d){return "тачно"},
"catActions":function(d){return "Акције"},
"catColour":function(d){return "Боја"},
"catLists":function(d){return "Листе"},
"catLogic":function(d){return "Логика"},
"catLoops":function(d){return "Петље"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функције"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Променљиве"},
"clearPuzzle":function(d){return "Počni ponovo"},
"clearPuzzleConfirm":function(d){return "Ovo će resetovati puzlu na početno stanje i obrisati sve blokove koje ste dodali ili promenili."},
"clearPuzzleConfirmHeader":function(d){return "Da li ste sigurni da želite da počnete ponovo?"},
"codeMode":function(d){return "Kod"},
"codeTooltip":function(d){return "Погледајте генерисани код JavaScript-а."},
"continue":function(d){return "Настави"},
"defaultTwitterText":function(d){return "Check out what I made"},
"designMode":function(d){return "Dizajn"},
"dialogCancel":function(d){return "Откажи"},
"dialogOK":function(d){return "У реду"},
"directionEastLetter":function(d){return "Исток"},
"directionNorthLetter":function(d){return "Север"},
"directionSouthLetter":function(d){return "Југ"},
"directionWestLetter":function(d){return "Запад"},
"dropletBlock_addOperator_description":function(d){return "Dodajte dva broja"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Dodajte operatera"},
"dropletBlock_andOperator_description":function(d){return "Logical AND of two booleans"},
"dropletBlock_andOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_assign_x_description":function(d){return "Reassign a variable"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "value"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_callMyFunction_description":function(d){return "Use a function without an argument"},
"dropletBlock_callMyFunction_n_description":function(d){return "Use a function with argument"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Pozovi funciju sa parametrima"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Pozovite funkciju"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Create a variable for the first time"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Declare a variable"},
"dropletBlock_divideOperator_description":function(d){return "Divide two numbers"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Function Definition"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_mathAbs_description":function(d){return "Absolute value"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Maximum value"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Minimum value"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Multiply two numbers"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "OR boolean operator"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Return a value from a function"},
"dropletBlock_return_signatureOverride":function(d){return "Вратити"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "Да би блок \"Понављај\" или  \"Ако\" радио, у њега треба уградити друге блокове. Постарајте се да је унутрашњи блок правилно убачен у спољни блок."},
"emptyBlockInFunction":function(d){return "Функција "+common_locale.v(d,"name")+" има непопуњен улазни податак."},
"emptyBlockInVariable":function(d){return "Променљива "+common_locale.v(d,"name")+" има непопуњен улазни податак."},
"emptyExampleBlockErrorMsg":function(d){return "You need at least one example in function "+common_locale.v(d,"functionName")+". Make sure each example has a call and a result."},
"emptyFunctionBlocksErrorMsg":function(d){return "Тело функције треба да се састоји из блокова како би радило."},
"emptyFunctionalBlock":function(d){return "Имате блок са непопуњеним улазним податком."},
"emptyTopLevelBlock":function(d){return "Нема блокова за покретање. Морате да прикључите блок на "+common_locale.v(d,"topLevelBlockName")+" блок."},
"end":function(d){return "крај"},
"errorEmptyFunctionBlockModal":function(d){return "Треба да буде блокова унутар твоје дефиниције функције. Кликни \"измени\" и превуци блокове унутар зеленог блока."},
"errorIncompleteBlockInFunction":function(d){return "Кликни \"измени\" да би осигурао да немаш недостајућих блокова унутар твоје дефиниције функције."},
"errorParamInputUnattached":function(d){return "Запамти да спојиш неки блок сваком улазном параметру функцијског параметра у твом радном простору."},
"errorQuestionMarksInNumberField":function(d){return "Покушај да замениш \"???\" неком вредношћу."},
"errorRequiredParamsMissing":function(d){return "Направи параметар за своју функцију кликом на \"измени\" и додадањем неопходних параметара. Превуци нови параметарске блокове у своју дефиницију функције."},
"errorUnusedFunction":function(d){return "Направио си функцију, али је ниси користио нигде у свом радном простору! Кликни на \"Функције\" у кутији алатки и користи је у свом програму."},
"errorUnusedParam":function(d){return "Додао си параметарски блок, али га ниси користио у дефиницији. Користи параметар тако што ћеш кликнути \"измени\" и поставити блок параметра унутар зеленог блока."},
"exampleErrorMessage":function(d){return "The function "+common_locale.v(d,"functionName")+" has one or more examples that need adjusting. Make sure they match your definition and answer the question."},
"examplesFailedOnClose":function(d){return "One or more of your examples do not match your definition. Check your examples before closing"},
"extraTopBlocks":function(d){return "Имате неповезане блокове."},
"extraTopBlocksWhenRun":function(d){return "Имате неповезане блокове. Да ли мислите да их повежете у блок \"покретања\"?"},
"finalStage":function(d){return "Честитамо! Завршили сте последњу етапу."},
"finalStageTrophies":function(d){return "Честитамо! Завршио-ла си последњи ниво и освојио-ла  "+common_locale.p(d,"numTrophies",0,"sr",{"one":"трофеј","other":common_locale.n(d,"numTrophies")+" трофеја"})+"."},
"finish":function(d){return "Заврши"},
"generatedCodeInfo":function(d){return "Чак и најбољи универзитети уче блок-базирано кодирање (нпр. "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Али блокови су постављени тако да их можете видети у JavaScript, светском најкоришћенијем програмском језику:"},
"genericFeedback":function(d){return "Погледај како си завршио и пробај да поправиш свој програм."},
"hashError":function(d){return "Жао нам је, '%1' не одговара ни једном сачуваном програму."},
"help":function(d){return "Помоћ"},
"hideToolbox":function(d){return "(Сакриј)"},
"hintHeader":function(d){return "Ево предлога:"},
"hintRequest":function(d){return "Види предлог"},
"hintTitle":function(d){return "Савет:"},
"ignore":function(d){return "Ignore"},
"infinity":function(d){return "Бесконачно"},
"jump":function(d){return "скок"},
"keepPlaying":function(d){return "Настави игру"},
"levelIncompleteError":function(d){return "Користиш све неопходне типове блокова, али не на прави начин."},
"listVariable":function(d){return "листа"},
"makeYourOwnFlappy":function(d){return "Направи своју Flappy игру"},
"missingBlocksErrorMsg":function(d){return "Пробај један или више понуђених блокова како би решио-ла мозгалицу."},
"nextLevel":function(d){return "Честитамо! Решио-ла си мозгалицу "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Честитамо! Решили сте Слагалицу "+common_locale.v(d,"puzzleNumber")+" и освојили "+common_locale.p(d,"numTrophies",0,"sr",{"one":"трофеј","other":common_locale.n(d,"numTrophies")+" трофеја"})+"."},
"nextPuzzle":function(d){return "Следећа слагалица"},
"nextStage":function(d){return "Честитамо! Завршили сте "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Честитамо! Завршили сте "+common_locale.v(d,"stageName")+" и освојили "+common_locale.p(d,"numTrophies",0,"sr",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Честитамо! Решио-ла си мозгалицу "+common_locale.v(d,"puzzleNumber")+". (Међутим, постоји програм са само "+common_locale.p(d,"numBlocks",0,"sr",{"one":"једним блоком","other":common_locale.n(d,"numBlocks")+" блокова"})+".)"},
"numLinesOfCodeWritten":function(d){return "Управо си написао-ла "+common_locale.p(d,"numLines",0,"sr",{"one":"1 линију","other":common_locale.n(d,"numLines")+" линија"})+" кода!"},
"openWorkspace":function(d){return "Како то ради"},
"orientationLock":function(d){return "У подешавањима уређаја искључи блокаду оријентације."},
"play":function(d){return "играј"},
"print":function(d){return "Одштампај"},
"puzzleTitle":function(d){return "Мозгалица "+common_locale.v(d,"puzzle_number")+" од "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "View only: "},
"repeat":function(d){return "понављај"},
"resetProgram":function(d){return "Почни поново"},
"rotateText":function(d){return "Окрените ваш уређај."},
"runProgram":function(d){return "Изврши"},
"runTooltip":function(d){return "Покрени програм састављен уз помоћ блокова у радном простору."},
"saveToGallery":function(d){return "Сачувај у галерији"},
"savedToGallery":function(d){return "Сачувано у галерији!"},
"score":function(d){return "Резултат"},
"shareFailure":function(d){return "Извините, не можемо да поделимо овај програм."},
"showBlocksHeader":function(d){return "Покажи блокове"},
"showCodeHeader":function(d){return "Покажи Програмски код"},
"showGeneratedCode":function(d){return "Покажи код програма"},
"showTextHeader":function(d){return "Прикажи текст"},
"showVersionsHeader":function(d){return "Version History"},
"showToolbox":function(d){return "Прикажи палету алата"},
"signup":function(d){return "Региструј се за уводни курс"},
"stringEquals":function(d){return "текст=?"},
"subtitle":function(d){return "графичко окружење за програмирање"},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Морате да исправите грешку у свом програму да би га видели у блоковима."},
"tooFewBlocksMsg":function(d){return "Користиш све неопходне типове блокова, али покушај да искористиш више ових блокова да завршиш мозгалицу."},
"tooManyBlocksMsg":function(d){return "Ова мозгалица може да се реши са <x id='START_SPAN'/><x id='END_SPAN'/> блокова."},
"tooMuchWork":function(d){return "Задао си ми много посла! Покушај са мање понављања."},
"toolboxHeader":function(d){return "блокови"},
"toolboxHeaderDroplet":function(d){return "Палета алата"},
"totalNumLinesOfCodeWritten":function(d){return "Укупно : "+common_locale.p(d,"numLines",0,"sr",{"one":"1 линија","other":common_locale.n(d,"numLines")+" линија"})+" кода."},
"tryAgain":function(d){return "Покушај поново"},
"tryHOC":function(d){return "Испробај \"Hour of Code\""},
"unnamedFunction":function(d){return "You have a variable or function that does not have a name. Don't forget to give everything a descriptive name."},
"wantToLearn":function(d){return "Желиш да научиш да програмираш?"},
"watchVideo":function(d){return "Погледај видео"},
"when":function(d){return "када"},
"whenRun":function(d){return "када се извршава"},
"workspaceHeaderShort":function(d){return "Радни простор: "},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Declare a variable"},
"nestedForSameVariable":function(d){return "You're using the same variable inside two or more nested loops. Use unique variable names to avoid infinite loops."},
"submit":function(d){return "Submit"},
"submitYourProject":function(d){return "Submit your project"},
"submitYourProjectConfirm":function(d){return "You cannot edit your project after submitting it, really submit?"}};