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
"backToPreviousLevel":function(d){return "Обратно към предишното ниво"},
"blocklyMessage":function(d){return "Blockly"},
"blocks":function(d){return "блокове"},
"booleanFalse":function(d){return "грешно"},
"booleanTrue":function(d){return "вярно"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвят"},
"catLists":function(d){return "Списъци"},
"catLogic":function(d){return "Логика"},
"catLoops":function(d){return "Цикли"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функции"},
"catText":function(d){return "Текст"},
"catVariables":function(d){return "Променливи"},
"clearPuzzle":function(d){return "Стартиране отначало"},
"clearPuzzleConfirm":function(d){return "Това ще рестартира пъзела в начално състояние и ще изтрие всички блокове, които сте добавили или променили."},
"clearPuzzleConfirmHeader":function(d){return "Наистина ли искате да започнете отначало?"},
"codeMode":function(d){return "Код"},
"codeTooltip":function(d){return "Виж генерирания JavaScript код."},
"completedWithoutRecommendedBlock":function(d){return "Поздравления! Вие завършихте пъзел "+common_locale.v(d,"puzzleNumber")+". (Но можехте да използвате различни блокове за по-силен код.)"},
"continue":function(d){return "Продължи"},
"defaultTwitterText":function(d){return "Вижте какво направих"},
"designMode":function(d){return "Дизайн"},
"dialogCancel":function(d){return "Отмени"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "И"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionWestLetter":function(d){return "З"},
"dropletBlock_addOperator_description":function(d){return "Добавете две числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Добавяне на оператор"},
"dropletBlock_andOperator_description":function(d){return "Връща истина, само когато и двата израза са верни или грешни"},
"dropletBlock_andOperator_signatureOverride":function(d){return "И оператор"},
"dropletBlock_assign_x_description":function(d){return "Задава стойност на съществуваща променлива. За пример, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "Името на променливата, което ѝ е асоциирано"},
"dropletBlock_assign_x_param1":function(d){return "стойност"},
"dropletBlock_assign_x_param1_description":function(d){return "Да се присвоява стойността на променливата."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Присвояване на променлива"},
"dropletBlock_callMyFunction_description":function(d){return "Призовава по име функция, която е без параметри"},
"dropletBlock_callMyFunction_n_description":function(d){return "Извиква функция, която взима един или повече параметри"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Призовава функция с параметри"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Призовава функция"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Декларира променлива и я възлага на масив с първоначалните стойности"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "Името, което ще използвате в програмата за адресиране на променливата"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "Началните стойности в масива"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Декларира променлива, зададена на масив"},
"dropletBlock_declareAssign_x_description":function(d){return "Декларира променлива с даденото име след \"var\" и го задава на стойността от дясната страна на израза"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "Името, което ще използвате в програмата за адресиране на променливата"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "Първоначалната стойност на променливата"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Декларира, че кодът ще използва променлива и ѝ присвоява първоначална стойност, предоставена от потребителя"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "Името, което ще използвате в програмата за адресиране на променливата"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Въведете стойност\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "Низът, който потребителят ще види в балон, когато иска да се въведе стойност"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Питай потребителя за стойност и я съхрани"},
"dropletBlock_declareAssign_x_promptNum_description":function(d){return "Declares that the code will now use a variable and assign it an initial numerical value provided by the user"},
"dropletBlock_declareAssign_x_promptNum_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_promptNum_param0_description":function(d){return "Името, което ще използвате в програмата за адресиране на променливата"},
"dropletBlock_declareAssign_x_promptNum_param1":function(d){return "\"Въведете стойност\""},
"dropletBlock_declareAssign_x_promptNum_param1_description":function(d){return "Низът, който потребителят ще види в балон, когато иска да се въведе стойност"},
"dropletBlock_declareAssign_x_promptNum_signatureOverride":function(d){return "Prompt the user for a numerical value and store it"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Декларира променлива"},
"dropletBlock_declareNoAssign_x_description":function(d){return "Declares a variable with the given name after 'var'"},
"dropletBlock_declareNoAssign_x_signatureOverride":function(d){return "Декларира променлива"},
"dropletBlock_divideOperator_description":function(d){return "Разделяне на две числа"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Оператор за \"делене\""},
"dropletBlock_equalityOperator_description":function(d){return "Проверява дали две стойности са равни. Връща истина, ако стойността от лявата страна на израза е равна на стойността на дясната страна, и лъжа в противен случай"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "Първата стойност да се използва за сравнение."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "Втората стойност да се използва за сравнение."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Оператор за равенство"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Създава цикъл, състоящ се от израз на инициализация, условен израз, израз от цели числа и блок от отчети, изпълнен за всяко повторение в цикъла"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "\"за\" цикъл"},
"dropletBlock_functionParams_n_description":function(d){return "Набор от отчети, които са в един или повече параметри и изпълняват задача или изчисляват стойност, когато функцията е извикана"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Дефинира функция с параметри"},
"dropletBlock_functionParams_none_description":function(d){return "Набор от отчети, които изпълняват дадена задача или изчисляват стойност, когато функцията е извикана"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Дефинира функция"},
"dropletBlock_getTime_description":function(d){return "Получава текущото време в милисекунди"},
"dropletBlock_greaterThanOperator_description":function(d){return "Проверява дали едно число е по-голямо от друго число. Връща true, ако стойността на лявата страна на израза е строго по-голяма от стойността на дясната страна на израза"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "Първата стойност да се използва за сравнение."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "Втората стойност да се използва за сравнение."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "\"По-голямо\"  оператор"},
"dropletBlock_ifBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "\"Ако\" отчет"},
"dropletBlock_ifElseBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно; в противен случай блокът с отчетите се изпълнява спрямо посоченото в \"друго\" клаузата"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ако/иначе отчет"},
"dropletBlock_inequalityOperator_description":function(d){return "Проверява дали две стойности не са равни. Връща истина, ако стойността на лявата страна на израза не е равна на стойността на дясната страна на израза"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "Първата стойност да се използва за сравнение."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "Втората стойност да се използва за сравнение."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Оператор \"неравенство\""},
"dropletBlock_lessThanOperator_description":function(d){return "Проверява дали една стойност е по-малка от друга стойност. Връща истина, ако стойността на лявата страна на израза е строго по-малка от стойността на дясната страна на израза"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "Първата стойност да се използва за сравнение."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "Втората стойност да се използва за сравнение."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "\"По-малко\" оператор"},
"dropletBlock_mathAbs_description":function(d){return "Взема абсолютната стойност на x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "Произволно число."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Взима максималната стойност от наколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "N1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "Едно или повече числа за сравнение."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Взема минималната стойност от няколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "N1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "Едно или повече числа за сравнение."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1, n2,..., nX)"},
"dropletBlock_mathRandom_description":function(d){return "Връща случайно число в диапазона от 0 (включително) до 1 (не се включва)"},
"dropletBlock_mathRandom_signatureOverride":function(d){return "Math.Random()"},
"dropletBlock_mathRound_description":function(d){return "Закръглява число до най-близкото цяло число"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "Произволно число."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.Round(x)"},
"dropletBlock_multiplyOperator_description":function(d){return "Умножаване на две числа"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Оператор \"Умножение\""},
"dropletBlock_notOperator_description":function(d){return "Връща лъжа ако изразът може да се преобразува на true; в противен случай връща истина"},
"dropletBlock_notOperator_signatureOverride":function(d){return "НЕ булев оператор"},
"dropletBlock_orOperator_description":function(d){return "Връща истина, когато или израз е истина и лъжа в противен случай"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ИЛИ оператор"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Връща случайно число, вариращо от първоначална стойност(мин.) до крайна стойност (Макс), включително и двете стойности в диапазона"},
"dropletBlock_randomNumber_param0":function(d){return "min"},
"dropletBlock_randomNumber_param0_description":function(d){return "Връща най-малкото число"},
"dropletBlock_randomNumber_param1":function(d){return "max"},
"dropletBlock_randomNumber_param1_description":function(d){return "Връща най-голямото число"},
"dropletBlock_randomNumber_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_return_description":function(d){return "Връща стойност от функция"},
"dropletBlock_return_signatureOverride":function(d){return "връща"},
"dropletBlock_setAttribute_description":function(d){return "Задава дадена стойност"},
"dropletBlock_subtractOperator_description":function(d){return "Изваждане на две числа"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Оператор \"изваждане\""},
"dropletBlock_whileBlock_description":function(d){return "Създава цикъл, състоящ се от условен израз и блок на изпълнение за всяко взаимодействие в цикъла. Той ще продължава да се изпълнява, докато условието се промени на истина"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "\"докато\" цикъл"},
"emptyBlockInFunction":function(d){return "Функцията "+common_locale.v(d,"name")+" има незапълнен вход."},
"emptyBlockInVariable":function(d){return "Променливата "+common_locale.v(d,"name")+" има незапълнен вход."},
"emptyBlocksErrorMsg":function(d){return "Блоковете \"Повтори\" и \"или\" трябва да съдържат други блокове в себе си, за да работят. Уверете се, че вътрешния блок се вписва правилно във външния блок."},
"emptyExampleBlockErrorMsg":function(d){return "Трябва Ви поне един пример за функция "+common_locale.v(d,"functionName")+". Проверете дали всеки пример има повикване и резултат."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блокът за функция трябва да има други блокове вътре в себе си, за да работи."},
"emptyFunctionalBlock":function(d){return "Имате блок с незапълнено поле."},
"emptyTopLevelBlock":function(d){return "Няма блокове, които да се изпълняват. Трябва да прикачите блок към "+common_locale.v(d,"topLevelBlockName")+" блок."},
"end":function(d){return "край"},
"errorEmptyFunctionBlockModal":function(d){return "Трябва да има блокове вътре във вашата дефиниция на функция. Щракнете върху \"Редактиране\" и плъзнете блокове вътре в зеления блок."},
"errorIncompleteBlockInFunction":function(d){return "Щракнете върху \"Опитайте отново\", за да се уверите, че няма  липсващи блокове  вътре във вашата дефиниция на функция."},
"errorParamInputUnattached":function(d){return "Не забравяйте да прикачвате блок за въвеждане на параметри към блока на функцията във вашата работна област."},
"errorQuestionMarksInNumberField":function(d){return "Опитайте да замените \"???\" със стойност."},
"errorRequiredParamsMissing":function(d){return "Създайте параметър за вашата функция като щракнете върху \"Редактиране\" и добавите необходимите параметри. Плъзнете новите блокове за параметър в дефиницията на функцията Ви."},
"errorUnusedFunction":function(d){return "Създали сте функция, но  не сте я извадили във вашата работна област! Щракнете върху \"Функции\" в кутията с инструменти и  я използвайте във Вашата програма."},
"errorUnusedParam":function(d){return "Вие добавихте блок за параметър, но не го използвате в дефиницията. Не забравяйте да използвате вашия параметър като щракнете върху \"Редактиране\" и поставите блокът за параметър вътре в зеления блок."},
"exampleErrorMessage":function(d){return "Функцията "+common_locale.v(d,"functionName")+" има един или повече примери, които се нуждаят от коригиране. Уверете се, че сте свързали вашата дефиниция отговора на въпроса."},
"examplesFailedOnClose":function(d){return "Един или повече от примерите Ви не отговарят на дефиницията. Проверете примерите преди да затворите прозореца"},
"extraTopBlocks":function(d){return "Имате неприкрепени блокове."},
"extraTopBlocksWhenRun":function(d){return "Имате неприкрепени блокове. Искате ли да се приложат към \"при стартиране\" блока?"},
"finalStage":function(d){return "Поздравления! Вие завършихте последния етап."},
"finalStageTrophies":function(d){return "Поздравления! Вие завършихте последния етап и спечелихте  "+common_locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Финал"},
"generatedCodeInfo":function(d){return "Дори най-добрите университети учат блок базирано програмиране(напр., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Но под капака, блоковете представляват кодове, написани на JavaScript, в света най-широко използваният за програмиране език:"},
"hashError":function(d){return "За съжаление '%1' не съответства на нито една запазена програма."},
"help":function(d){return "Помощ"},
"hideToolbox":function(d){return "(Скрий)"},
"hintHeader":function(d){return "Ето един съвет:"},
"hintRequest":function(d){return "Вижте съвета"},
"hintTitle":function(d){return "Съвет:"},
"ignore":function(d){return "Игнорирай"},
"infinity":function(d){return "Инфинити"},
"jump":function(d){return "скок"},
"keepPlaying":function(d){return "Продължете да играете"},
"levelIncompleteError":function(d){return "Използвате всички необходими видове блокове, но не по правилния начин."},
"listVariable":function(d){return "списък"},
"makeYourOwnFlappy":function(d){return "Направете своя собствена Flappy Bird игра"},
"missingRecommendedBlocksErrorMsg":function(d){return "Не е точно. Опитайте да използвате блок, който не сте включвали още."},
"missingRequiredBlocksErrorMsg":function(d){return "Не е точно. Вие трябва да използвате блок, който не сте включили в кода си още."},
"nestedForSameVariable":function(d){return "Вие използвате една и съща променлива вътре в два или повече вложени цикъла. Използвайте уникални имена за променливите, за да се избегнат безкрайни повторения."},
"nextLevel":function(d){return "Поздравления! Приключите пъзел "+common_locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Поздравления! Завършихте пъзел "+common_locale.v(d,"puzzleNumber")+" и спечелихте "+common_locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Следващ пъзел"},
"nextStage":function(d){return "Поздравления! Вие завършихте "+common_locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравления! Завършихте етап "+common_locale.v(d,"stageName")+" и спечелихте "+common_locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравления! Приключихте пъзел "+common_locale.v(d,"puzzleNumber")+". (Въпреки това, можехте да използвате само "+common_locale.p(d,"numBlocks",0,"bg",{"one":"1 block","other":common_locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Вие написахте "+common_locale.p(d,"numLines",0,"bg",{"one":"1line","other":common_locale.n(d,"numLines")+" lines"})+" код!"},
"openWorkspace":function(d){return "Как работи"},
"orientationLock":function(d){return "Изключете заключването на ориентацията от опциите на устройството."},
"play":function(d){return "играй"},
"print":function(d){return "Печат"},
"puzzleTitle":function(d){return "Пъзел "+common_locale.v(d,"puzzle_number")+" от "+common_locale.v(d,"stage_total")},
"readonlyWorkspaceHeader":function(d){return "Само за преглед: "},
"repeat":function(d){return "повтори"},
"resetProgram":function(d){return "Начално състояние"},
"rotateText":function(d){return "Завъртете устройството си."},
"runProgram":function(d){return "Старт"},
"runTooltip":function(d){return "Стартира програмата, определена от блоковете в работното поле."},
"runtimeErrorMsg":function(d){return "Вашата програма не се изпълни успешно. Моля, премахнете ред "+common_locale.v(d,"lineNumber")+" и опитайте отново."},
"saveToGallery":function(d){return "Записване в галерията"},
"savedToGallery":function(d){return "Записано в галерията!"},
"score":function(d){return "точки"},
"shareFailure":function(d){return "За съжаление, не можем да споделим тази програма."},
"shareWarningsAge":function(d){return "Въведете вашата възраст по-долу и щракнете върху OK, за да продължите."},
"shareWarningsMoreInfo":function(d){return "Повече информация"},
"shareWarningsStoreData":function(d){return "Тази версия на Студиото по кодиране съдържа данни, които могат да се видят от всеки с тази споделена връзка, така че бъдете внимателни, когато предоставяте лична информация."},
"showBlocksHeader":function(d){return "Покажи блоковете"},
"showCodeHeader":function(d){return "Покажи кода"},
"showGeneratedCode":function(d){return "Покажи кода"},
"showTextHeader":function(d){return "Показване на текст"},
"showToolbox":function(d){return "Показване на инструменти"},
"showVersionsHeader":function(d){return "Хронология на версиите"},
"signup":function(d){return "Регистрация във встъпителния курс"},
"stringEquals":function(d){return "низ =?"},
"submit":function(d){return "Изпрати"},
"submitYourProject":function(d){return "Изпратете вашия проект"},
"submitYourProjectConfirm":function(d){return "Не можете да редактирате Вашия проект след подаване, да продължа ли?"},
"unsubmit":function(d){return "Не е добавено"},
"unsubmitYourProject":function(d){return "Не сте подали Вашия проект"},
"unsubmitYourProjectConfirm":function(d){return "Не сте подали Вашия проект, това ще премахне датата за регистрация, наистина ли ще прекратите качването?"},
"subtitle":function(d){return "визуална среда за програмиране"},
"syntaxErrorMsg":function(d){return "Вашата програма съдържа правописна грешка. Моля, премахнете линия "+common_locale.v(d,"lineNumber")+" и опитайте отново."},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Трябва да се коригира грешка във вашата програма, преди тя да бъде показана като блокове."},
"tooFewBlocksMsg":function(d){return "Използвали сте всички необходими видове блокове, но ще ви трябват още от същите видове, за да завършите този пъзел."},
"tooManyBlocksMsg":function(d){return "Този пъзел може да бъде решен с <x id='START_SPAN'/><x id='END_SPAN'/> блокове."},
"tooMuchWork":function(d){return "Вие ме накарахте да свърша много работа! Може ли да повторите няколко пъти?"},
"toolboxHeader":function(d){return "Блокове"},
"toolboxHeaderDroplet":function(d){return "Кутия с инструменти"},
"totalNumLinesOfCodeWritten":function(d){return "Общо: "+common_locale.p(d,"numLines",0,"bg",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" код."},
"tryAgain":function(d){return "Опитайте отново"},
"tryBlocksBelowFeedback":function(d){return "Опитайте да използвате един от блоковете по-долу:"},
"tryHOC":function(d){return "Опитайте Часа на Кодирането"},
"unnamedFunction":function(d){return "Имате променлива или функция, която няма име. Не забравяйте да дадете подробно описателно име."},
"wantToLearn":function(d){return "Искате ли да се научите да пишете код?"},
"watchVideo":function(d){return "Гледайте видеото"},
"when":function(d){return "когато"},
"whenRun":function(d){return "при стартиране"},
"workspaceHeaderShort":function(d){return "Работна област: "},
"copy":function(d){return "Copy"},
"sendToPhone":function(d){return "Send To Phone"}};