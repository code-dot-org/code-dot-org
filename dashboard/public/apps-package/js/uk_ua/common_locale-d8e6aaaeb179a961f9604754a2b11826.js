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
"and":function(d){return "та"},
"backToPreviousLevel":function(d){return "Повернутися до попереднього рівня"},
"blocklyMessage":function(d){return "Блоклі"},
"blocks":function(d){return "блоки"},
"booleanFalse":function(d){return "Хибність"},
"booleanTrue":function(d){return "Істина"},
"catActions":function(d){return "Дії"},
"catColour":function(d){return "Колір"},
"catLists":function(d){return "Списки"},
"catLogic":function(d){return "Логіка"},
"catLoops":function(d){return "Цикли"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функції"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Змінні"},
"clearPuzzle":function(d){return "Почати знову"},
"clearPuzzleConfirm":function(d){return "Це скине задачу до початкового стану, видаливши всі блоки, які ви додали чи змінили."},
"clearPuzzleConfirmHeader":function(d){return "Ви впевнені, що хочете почати все спочатку?"},
"codeMode":function(d){return "Код"},
"codeTooltip":function(d){return "Див. згенерований код JavaScript."},
"continue":function(d){return "Далі"},
"defaultTwitterText":function(d){return "Подивіться, що у мене вийшло"},
"designMode":function(d){return "Дизайн"},
"dialogCancel":function(d){return "Скасувати"},
"dialogOK":function(d){return "Гаразд"},
"directionEastLetter":function(d){return "Сх"},
"directionNorthLetter":function(d){return "Пн"},
"directionSouthLetter":function(d){return "Пд"},
"directionWestLetter":function(d){return "Зх"},
"dropletBlock_addOperator_description":function(d){return "Додати два числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Додати оператора"},
"dropletBlock_andOperator_description":function(d){return "Повертає \"так\", тільки тоді, коли обидва вирази є повертають \"так\", повертає \"ні\" в іншому випадку"},
"dropletBlock_andOperator_signatureOverride":function(d){return "Логічний оператор \"і\""},
"dropletBlock_assign_x_description":function(d){return "Поміняй змінну"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "значення"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Задайте змінну"},
"dropletBlock_callMyFunction_description":function(d){return "Викликає іменовану функцію яка не приймає параметрів"},
"dropletBlock_callMyFunction_n_description":function(d){return "Викликає іменовану функцію, яка приймає один або більше параметрів"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Викликає функцію з параметрами"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Виклик функції"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Задає змінну і привласнює їй безліч значень із заданими початковими параметрами"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Початкові значення масиву"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Задає змінну з присвоєною безліччю"},
"dropletBlock_declareAssign_x_description":function(d){return "Оголошує змінну з даним ім'ям після \"Var\", і привласнює його значення на правій частині виразу"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Початкове значення змінної"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Оголошує, що код тепер буде використовувати змінну і привласнює їй початкове значення, визначене користувачем"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Введіть значення\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Запросити у користувача значення і зберегти його"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Оголосити змінну"},
"dropletBlock_divideOperator_description":function(d){return "Розділіть два номери"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Оператор ділення"},
"dropletBlock_equalityOperator_description":function(d){return "Тест на рівність"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "у"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "for loop"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Function with a Parameter"},
"dropletBlock_functionParams_none_description":function(d){return "Create a function without an argument"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Визначити функцію"},
"dropletBlock_getTime_description":function(d){return "Отримати поточний час в мілісекундах"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "у"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "if/else statement"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "у"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "у"},
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
"dropletBlock_return_signatureOverride":function(d){return "повернути"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "while loop"},
"emptyBlocksErrorMsg":function(d){return "Блоки \"Повторити\" та \"Якщо\" повинні містити інші блоки. Переконайтесь, що внутрішній блок належно розміщений всередині зовнішнього."},
"emptyBlockInFunction":function(d){return "The function "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyBlockInVariable":function(d){return "The variable "+common_locale.v(d,"name")+" has an unfilled input."},
"emptyFunctionBlocksErrorMsg":function(d){return "Для функціонування цей блок повинен містити інші блоки."},
"emptyFunctionalBlock":function(d){return "У вас є блок з незаповненим вводом."},
"emptyTopLevelBlock":function(d){return "There are no blocks to run. You must attach a block to the "+common_locale.v(d,"topLevelBlockName")+" block."},
"end":function(d){return "кінець"},
"errorEmptyFunctionBlockModal":function(d){return "Потрібно розмістити блоки всередині блоку визначення функції. Клацніть \"Редагувати\" та перетягніть блоки всередину зеленого блоку."},
"errorIncompleteBlockInFunction":function(d){return "Натисніть кнопку \"Редагувати\", щоб переконатися, що всі потрібні блоки розміщено всередині визначення функції."},
"errorParamInputUnattached":function(d){return "Не забудьте вкласти блок для кожного вхідного параметра блоку функції на робочому просторі."},
"errorQuestionMarksInNumberField":function(d){return "Спробуйте замінити \"???\" на значення."},
"errorRequiredParamsMissing":function(d){return "Створіть параметр для функції, клацнувши \"Редагувати\" та додаючи відповідні параметри. Перетягніть нові блоки параметрів у визначення функції."},
"errorUnusedFunction":function(d){return "Ви створили функцію, але не скористалися нею у робочому просторі! Оберіть \"Функції\" на палітрі інструментів і переконайтеся, що ви використовуєте їх у своїй програмі."},
"errorUnusedParam":function(d){return "Ви додали блок параметра, але не використали його у визначенні функції. Не забудьте використати його, клацніть \"Редагувати\" та розмістіть блок параметра всередині зеленого блоку."},
"extraTopBlocks":function(d){return "У вас є неприкріплені блоки."},
"extraTopBlocksWhenRun":function(d){return "У вас залишились не приєднані блоки. Ви хотіли приєднати їх до блоку \"при запуску\"?"},
"finalStage":function(d){return "Вітання! Завершено останній етап."},
"finalStageTrophies":function(d){return "Вітання! Ви завершили останній етап і виграли "+common_locale.p(d,"numTrophies",0,"uk",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Кінець"},
"generatedCodeInfo":function(d){return "Навіть кращі університети навчають програмуванню на основі блоків (наприклад, "+common_locale.v(d,"berkeleyLink")+" "+common_locale.v(d,"harvardLink")+"). Але всередині ті блоки, які ви щойно склали, можуть показуватись у JavaScript, найпоширенішій мові програмування:"},
"genericFeedback":function(d){return "Подивіться, на чому ви зупинились і спробуйте виправити свою програму."},
"hashError":function(d){return "Шкода, але  '%1' не відповідає жодній збереженій програмі."},
"help":function(d){return "Довідка"},
"hideToolbox":function(d){return "(Приховати)"},
"hintHeader":function(d){return "Підказка:"},
"hintRequest":function(d){return "Подивитись підказку"},
"hintTitle":function(d){return "Підказка:"},
"infinity":function(d){return "Infiinty"},
"jump":function(d){return "стрибок"},
"keepPlaying":function(d){return "Продовжити"},
"levelIncompleteError":function(d){return "Використано усі необхідні типи блоків, але у неправильному порядку."},
"listVariable":function(d){return "список"},
"makeYourOwnFlappy":function(d){return "Створити свою власну гру в Пурха (Flappy Game)"},
"missingBlocksErrorMsg":function(d){return "Щоб розв'язати завдання, спробуйте один або кілька блоків нижче."},
"nextLevel":function(d){return "Вітання! Завершено завдання "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Вітання! Ви завершили завдання "+common_locale.v(d,"puzzleNumber")+" та виграли  "+common_locale.p(d,"numTrophies",0,"uk",{"one":"трофей","other":common_locale.n(d,"numTrophies")+" трофеїв"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Вітаємо! Ви завершили "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Вітаємо! Ви завершили етап "+common_locale.v(d,"stageName")+" та виграли "+common_locale.p(d,"numTrophies",0,"uk",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Вітаємо! Ви завершили завдання  "+common_locale.v(d,"puzzleNumber")+". (Проте, його можна було вирішити, використавши лише "+common_locale.p(d,"numBlocks",0,"uk",{"one":"1 блок","other":common_locale.n(d,"numBlocks")+" блоки"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ви щойно написали "+common_locale.p(d,"numLines",0,"uk",{"one":"1 рядок","other":common_locale.n(d,"numLines")+" рядків"})+" коду!"},
"openWorkspace":function(d){return "Як це працює"},
"orientationLock":function(d){return "Увімкніть блокування повороту у налаштування пристрою."},
"play":function(d){return "грати"},
"print":function(d){return "Друк"},
"puzzleTitle":function(d){return "Завдання "+common_locale.v(d,"puzzle_number")+" з "+common_locale.v(d,"stage_total")},
"repeat":function(d){return "повторити"},
"resetProgram":function(d){return "Скидання"},
"rotateText":function(d){return "Повертайте свій пристрій."},
"runProgram":function(d){return "Запустити"},
"runTooltip":function(d){return "Запустити програму, що складається з блоків робочої області."},
"saveToGallery":function(d){return "Зберегти в галереї"},
"savedToGallery":function(d){return "Збережено у галереї!"},
"score":function(d){return "рахунок"},
"shareFailure":function(d){return "На жаль, цією програмою не можна поділитись."},
"showBlocksHeader":function(d){return "Показати блоки"},
"showCodeHeader":function(d){return "Показати код"},
"showGeneratedCode":function(d){return "Показати код"},
"showTextHeader":function(d){return "Показати Текст"},
"showToolbox":function(d){return "Показати панель інструментів"},
"signup":function(d){return "Підпишіться на вступний курс"},
"stringEquals":function(d){return "рядок =?"},
"subtitle":function(d){return "Візуальне середовище програмування"},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Потрібно виправити помилки у програмі для того, щоб показати її блоками."},
"tooFewBlocksMsg":function(d){return "Ви використали усі необхідні типи блоків, але спробуйте використати більше таких блоків, щоб розв'язати завдання."},
"tooManyBlocksMsg":function(d){return "Це завдання можна розв'язати, використавши <x id='START_SPAN'/><x id='END_SPAN'/> блоків."},
"tooMuchWork":function(d){return "Ви змусили мене попрацювати! Може спробуємо менше повторів?"},
"toolboxHeader":function(d){return "блоки"},
"toolboxHeaderDroplet":function(d){return "Інструменти"},
"totalNumLinesOfCodeWritten":function(d){return "За весь час: "+common_locale.p(d,"numLines",0,"uk",{"one":"1 рядок","other":common_locale.n(d,"numLines")+" рядків"})+" коду."},
"tryAgain":function(d){return "Спробуй знову"},
"tryHOC":function(d){return "Спробуйте годину коду"},
"wantToLearn":function(d){return "Хочете навчитись програмувати?"},
"watchVideo":function(d){return "Переглянути відео"},
"when":function(d){return "коли"},
"whenRun":function(d){return "коли гра починається"},
"workspaceHeaderShort":function(d){return "Робоча область: "}};