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
"and":function(d){return "и"},
"backToPreviousLevel":function(d){return "Вернуться на предыдущий уровень"},
"blocklyMessage":function(d){return "Блокли"},
"blocks":function(d){return "блоки"},
"booleanFalse":function(d){return "ложь"},
"booleanTrue":function(d){return "истина"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвет"},
"catLists":function(d){return "Списки"},
"catLogic":function(d){return "Логика"},
"catLoops":function(d){return "Циклы"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Процедуры"},
"catText":function(d){return "текст"},
"catVariables":function(d){return "Переменные"},
"clearPuzzle":function(d){return "Начать заново"},
"clearPuzzleConfirm":function(d){return "Так вы удалите все блоки, которые вы добавили или изменили, и начнёте головоломку сначала."},
"clearPuzzleConfirmHeader":function(d){return "Вы уверены, что хотите начать заново?"},
"codeMode":function(d){return "Код"},
"codeTooltip":function(d){return "Просмотреть созданный код JavaScript."},
"completedWithoutRecommendedBlock":function(d){return "Поздравляем! Ты завершил задачу "+common_locale.v(d,"puzzleNumber")+". (Но ты мог бы использовать другой блок для более надежного кода.)"},
"continue":function(d){return "Продолжить"},
"copy":function(d){return "копировать"},
"defaultTwitterText":function(d){return "Оцените, что я сделал"},
"designMode":function(d){return "Дизайн"},
"dialogCancel":function(d){return "Отмена"},
"dialogOK":function(d){return "Продолжить"},
"directionEastLetter":function(d){return "В"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionWestLetter":function(d){return "З"},
"dropletBlock_addOperator_description":function(d){return "Сложить два числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Добавить оператор"},
"dropletBlock_andOperator_description":function(d){return "Возвращает значение истина если оба выражения истины, и значение ложь в противном случае"},
"dropletBlock_andOperator_signatureOverride":function(d){return "И булев оператор"},
"dropletBlock_assign_x_description":function(d){return "Присваивает значение существующей переменной. Например, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Имя переменной, присваиваемое"},
"dropletBlock_assign_x_param1":function(d){return "значение"},
"dropletBlock_assign_x_param1_description":function(d){return "Значение переменной присваивается."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Задайте переменную"},
"dropletBlock_callMyFunction_description":function(d){return "Вызывает указанную функцию, которая не принимает никаких параметров"},
"dropletBlock_callMyFunction_n_description":function(d){return "Вызывает указанную функцию, которая принимает один или несколько параметров"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Назвать функцию с параметрами"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Назвать функцию"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Задает переменную и присваивает ей множество значений с заданными изначальными параметрами"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "Имя которое вы будете использовать в программе для ссылки на переменную"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Начальные значения массива"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Задает переменную с присвоенным множеством"},
"dropletBlock_declareAssign_x_description":function(d){return "Объявляет переменную с данным именем после \" Var \", и присваивает его значение на правой части выражения"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "Имя которое вы будете использовать в программе для ссылки на переменную"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Начальное значение переменной"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Объявляет, что код теперь будет использовать переменную и присваивает ей начальное значение, определенное пользователем"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "Имя которое вы будете использовать в программе для ссылки на переменную"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "«Введите значение»"},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "Всплывающая строка, которую увидит пользователь при вводе значения"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Запросить у пользователя значения и сохранить его"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "Имя которое вы будете использовать в программе для ссылки на переменную"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "«Введите значение»"},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "Всплывающая строка, которую увидит пользователь при вводе значения"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Объявить переменную"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Объявить переменную"},
"dropletBlock_divideOperator_description":function(d){return "Разделите два номера"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Оператор деления"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "цикл с параметром"},
"dropletBlock_functionParams_n_description":function(d){return "A set of statements that takes in one or more parameters, and performs a task or calculate a value when the function is called"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Определите функцию с параметрами"},
"dropletBlock_functionParams_none_description":function(d){return "Набор утверждений, которые выполняют задачу или вычисления значения, когда функция вызвана"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Определите функцию"},
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
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "команда \"если/иначе\""},
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
"dropletBlock_mathAbs_description":function(d){return "Возвращает модуль значения переменной x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Возвращает максимальное значение среди одного или нескольких значений n1, n2, ..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Возвращает минимальное значение среди одного или нескольких значений n1, n2, ..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Возвращает случайное число в интервале [0, 1)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.random()"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Перемножьте два числа"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Логический оператор ИЛИ"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Returns a random number in the closed range from min to max."},
"dropletBlock_randomNumber_param0":function(d){return "мин"},
"dropletBlock_randomNumber_param0_description":function(d){return "Было возвращено минимальное число"},
"dropletBlock_randomNumber_param1":function(d){return "макс"},
"dropletBlock_randomNumber_param1_description":function(d){return "Было возвращено максимальное число"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Возвращает значение функции"},
"dropletBlock_return_signatureOverride":function(d){return "возврат"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "цикл \"пока\""},
"emptyBlockInFunction":function(d){return "У функции "+common_locale.v(d,"name")+" есть незаполненные входные параметры."},
"emptyBlockInVariable":function(d){return "Переменная "+common_locale.v(d,"name")+" не определена."},
"emptyBlocksErrorMsg":function(d){return "Блокам \"повторять\" или \"если\" необходимо иметь внутри другие блоки для работы. Убедись  в том, что внутренний блок должным образом подходит к блоку, в котором он содержится."},
"emptyExampleBlockErrorMsg":function(d){return "Вам нужно хотя бы два примера в функции "+common_locale.v(d,"functionName")+". Убедитесь, что каждый пример содержит вызов функции и результат."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блок процедуры требует для работы другие блоки внутри себя."},
"emptyFunctionalBlock":function(d){return "У вас есть блок с незаполненными входными данными."},
"emptyTopLevelBlock":function(d){return "Нет блоков для запуска. Присоедини блок к блоку \""+common_locale.v(d,"topLevelBlockName")+"\"."},
"end":function(d){return "конец"},
"errorEmptyFunctionBlockModal":function(d){return "В определении вашей функции обязательно должны быть блоки. Нажмите \"Редактировать\" и поместите блоки внутри зеленого блока."},
"errorIncompleteBlockInFunction":function(d){return "Нажмите \"Редактировать\" чтобы убедиться, что вы не пропустили никаких блоков в определении функции."},
"errorParamInputUnattached":function(d){return "Не забудьте прикрепить блок к каждому входящему параметру блока функции в своем рабочем пространстве."},
"errorQuestionMarksInNumberField":function(d){return "Попробуйте изменить значение \"???\"."},
"errorRequiredParamsMissing":function(d){return "Создайте параметр для своей функции нажав \"Редактировать\" и добавив необходимые параметры. Перетащите новые блоки параметров в определение своей функции."},
"errorUnusedFunction":function(d){return "Вы создали функцию, но не использовали её в работе! Нажмите на «Функции» на панели инструментов и убедитесь, что вы используете её в своей программе."},
"errorUnusedParam":function(d){return "Вы добавили блок параметров, но не использовали его в определении функции. Чтобы убедиться, что вы используете ваш параметр, нажмите \"Редактировать\" и поместите блок параметра внутри зеленого блока."},
"exampleErrorMessage":function(d){return "Необходимо изменить один или более примеров в функции "+common_locale.v(d,"functionName")+". Убедитесь, что они соответствуют вашему определению и отвечают на поставленный вопрос."},
"examplesFailedOnClose":function(d){return "Один или более ваших примеров не соответствуют вашему определению. Проверьте ваши примеры перед окончанием работы"},
"extraTopBlocks":function(d){return "У вас остались неприсоединённые блоки."},
"extraTopBlocksWhenRun":function(d){return "У вас остались неприсоединённые блоки. Вы собирались присоединить их к блоку \"При запуске\"?"},
"finalStage":function(d){return "Наши поздравления! Вы завершили последний этап."},
"finalStageTrophies":function(d){return "Наши поздравления! Вы завершили последний этап и выиграли "+common_locale.p(d,"numTrophies",0,"ru",{"one":"трофей","other":common_locale.n(d,"numTrophies")+" трофеи"})+"."},
"finish":function(d){return "Готово"},
"generatedCodeInfo":function(d){return "Даже в лучших университетах изучают блочное программирование (например, "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Но на самом деле блоки, которые вы собирали, могут быть отображены на JavaScript, наиболее широко используемом в мире языке программирования:"},
"hashError":function(d){return "К сожалению, «%1» не соответствует какой-либо сохранённой программе."},
"help":function(d){return "Справка"},
"hideToolbox":function(d){return "(Скрыть)"},
"hintHeader":function(d){return "Подсказка:"},
"hintRequest":function(d){return "Посмотреть подсказку"},
"hintTitle":function(d){return "Подсказка:"},
"ignore":function(d){return "Игнорировать"},
"infinity":function(d){return "Бесконечность"},
"jump":function(d){return "прыгнуть"},
"keepPlaying":function(d){return "Продолжайте играть"},
"levelIncompleteError":function(d){return "Ты используешь все необходимые виды блоков, но неправильным способом."},
"listVariable":function(d){return "список"},
"makeYourOwnFlappy":function(d){return "Создайте свою Flappy игру"},
"missingRecommendedBlocksErrorMsg":function(d){return "Почти. Попробуй использовать тот блок, который ты еще не использовал."},
"missingRequiredBlocksErrorMsg":function(d){return "Не так. Ты должен использовать тот блок, который ты еще не использовал."},
"nestedForSameVariable":function(d){return "Вы используете одну и ту же переменную внутри нескольких вложенных циклов. Используйте уникальные имена переменных, чтобы избежать бесконечного зацикливания."},
"nextLevel":function(d){return "Поздравляю! Головоломка "+common_locale.v(d,"puzzleNumber")+" решена."},
"nextLevelTrophies":function(d){return "Поздравляю! Ты завершил головоломку "+common_locale.v(d,"puzzleNumber")+" и выиграл "+common_locale.p(d,"numTrophies",0,"ru",{"one":"кубок","other":common_locale.n(d,"numTrophies")+" кубков"})+"."},
"nextPuzzle":function(d){return "Следующая головоломка"},
"nextStage":function(d){return "Поздравляем! Вы закончили "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравляем! Вы выполнили "+common_locale.v(d,"stageName")+" и выиграли "+common_locale.p(d,"numTrophies",0,"ru",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравляю! Ты завершил головоломку "+common_locale.v(d,"puzzleNumber")+". (Однако, можно было обойтись всего  "+common_locale.p(d,"numBlocks",0,"ru",{"one":"1 блоком","other":common_locale.n(d,"numBlocks")+" блоками"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ты только что написал "+common_locale.p(d,"numLines",0,"ru",{"one":"1 строку","other":common_locale.n(d,"numLines")+" строки"})+" кода!"},
"openWorkspace":function(d){return "Как это работает"},
"orientationLock":function(d){return "Выключите блокировку ориентации в настройках устройства."},
"play":function(d){return "играть"},
"print":function(d){return "Печать"},
"puzzleTitle":function(d){return "Головоломка "+common_locale.v(d,"puzzle_number")+" из "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Только просмотр: "},
"repeat":function(d){return "повторить"},
"resetProgram":function(d){return "Сбросить"},
"rotateText":function(d){return "Поверните ваше устройство."},
"runProgram":function(d){return "Выполнить"},
"runTooltip":function(d){return "Запускает программу, заданную блоками в рабочей области."},
"runtimeErrorMsg":function(d){return "Ваша программа не запустилась. Пожалуйста, удалите линию "+common_locale.v(d,"lineNumber")+" и попробуйте снова."},
"saveToGallery":function(d){return "Сохранить в галерею"},
"savedToGallery":function(d){return "Сохранено в галерее!"},
"score":function(d){return "очки"},
"sendToPhone":function(d){return "Отправить на телефон"},
"shareFailure":function(d){return "К сожалению, мы не можем поделиться этой программой."},
"shareWarningsAge":function(d){return "Пожалуйста укажите ваш возраст ниже и нажмите ОК для продолжения."},
"shareWarningsMoreInfo":function(d){return "Больше информации"},
"shareWarningsStoreData":function(d){return "Данное приложение созданное в Code Studio содержит информацию, которая может быть доступна любому используя эту общую ссылку. Будьте внимательны, если вас просят предоставить личную информацию."},
"showBlocksHeader":function(d){return "Показать блоки"},
"showCodeHeader":function(d){return "Показать код"},
"showGeneratedCode":function(d){return "Показать код"},
"showTextHeader":function(d){return "Показать текст"},
"showToolbox":function(d){return "Показать панель инструментов"},
"showVersionsHeader":function(d){return "Журнал версий"},
"signup":function(d){return "Зарегистрируйтесь на вводный курс"},
"stringEquals":function(d){return "строка=?"},
"submit":function(d){return "Отправить"},
"submitYourProject":function(d){return "Отправить свой проект"},
"submitYourProjectConfirm":function(d){return "Вы не сможете изменить свой проект после его отправки, продолжить?"},
"unsubmit":function(d){return "Снять подтверждение"},
"unsubmitYourProject":function(d){return "Отозвать свой проект"},
"unsubmitYourProjectConfirm":function(d){return "Отзывая свой проект вы сбросите дату сдачи, точно отозвать?"},
"subtitle":function(d){return "среда визуального программирования"},
"syntaxErrorMsg":function(d){return "В вашей программе опечатка. Пожалуйста удалите строку "+common_locale.v(d,"lineNumber")+" и повторите попытку."},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Вам необходимо исправить ошибку в вашей программе, прежде чем она будет отображена в виде блоков."},
"tooFewBlocksMsg":function(d){return "Ты используешь все необходимые виды блоков, но попробуй использовать большее число этих типов блоков, чтобы завершить головоломку."},
"tooManyBlocksMsg":function(d){return "Эта головоломка может быть решена блоками <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Ты заставил меня попотеть! Может, будешь стараться делать меньше попыток?"},
"toolboxHeader":function(d){return "Блоки"},
"toolboxHeaderDroplet":function(d){return "Панель инструментов"},
"totalNumLinesOfCodeWritten":function(d){return "Общее количество: "+common_locale.p(d,"numLines",0,"ru",{"one":"1 строка","other":common_locale.n(d,"numLines")+" строки"})+" кода."},
"tryAgain":function(d){return "Попытаться ещё раз"},
"tryBlocksBelowFeedback":function(d){return "Попробуй добавить один из блоков внизу:"},
"tryHOC":function(d){return "Попробуйте Час кода"},
"unnamedFunction":function(d){return "Ты забыл дать имя переменной или функции. Не забывай давать им содержательные имена."},
"wantToLearn":function(d){return "Хочешь научиться программировать?"},
"watchVideo":function(d){return "Посмотреть видео"},
"when":function(d){return "когда"},
"whenRun":function(d){return "При запуске"},
"workspaceHeaderShort":function(d){return "Место сбора блоков: "},
"dropletBlock_randomNumber_description":function(d){return "Returns a random number in the closed range from min to max."}};