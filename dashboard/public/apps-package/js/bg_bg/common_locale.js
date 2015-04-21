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
"and":function(d){return "и"},
"booleanTrue":function(d){return "вярно"},
"booleanFalse":function(d){return "грешно"},
"blocks":function(d){return "блокове"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвят"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Списъци"},
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
"continue":function(d){return "Продължи"},
"designMode":function(d){return "Дизайн"},
"designModeHeader":function(d){return "Режим на проектиране"},
"dialogCancel":function(d){return "Отказ"},
"dialogOK":function(d){return "OK"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionEastLetter":function(d){return "И"},
"directionWestLetter":function(d){return "З"},
"dropletBlock_addOperator_description":function(d){return "Добавете две числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Връща истина, само когато и двата израза са верни или грешни"},
"dropletBlock_andOperator_signatureOverride":function(d){return "И оператор"},
"dropletBlock_arcLeft_description":function(d){return "Преместете костенурката по дъгата в посока обратно на часовниковата стрелка, използвайки зададения брой степени и радиус"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "радиус"},
"dropletBlock_arcRight_description":function(d){return "Преместете костенурката в дъга по посока на часовниковата стрелка с помощта на определен брой степени и радиус"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "радиус"},
"dropletBlock_assign_x_description":function(d){return "Повторно възлагане на променлива"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Създайте бутон и му дайте ID"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "текст"},
"dropletBlock_callMyFunction_description":function(d){return "Призовава по име функция, която е без параметри"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Призовава функция"},
"dropletBlock_callMyFunction_n_description":function(d){return "Извиква функция, която взима един или повече параметри"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Призовава функция с параметри"},
"dropletBlock_changeScore_description":function(d){return "Добавяне или премахване на точка към резултата."},
"dropletBlock_checkbox_description":function(d){return "Създайте кутия за чекване и й задайте ID"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Начертайте кръг на активното поле със зададени координати за център (x, y) и радиус"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param2":function(d){return "радиус"},
"dropletBlock_clearCanvas_description":function(d){return "Изчистете всички данни на активното поле"},
"dropletBlock_clearInterval_description":function(d){return "Изчистване на съществуващите стойности на таймера и заменянето им със стойността, върната от setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Изчистване на настройките на таймера и замяна на стойността им с върната от setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Показва низ или променлива в дисплея на конзолата"},
"dropletBlock_console.log_param0":function(d){return "съобщение"},
"dropletBlock_container_description":function(d){return "Създаване на отделен контейнер със ИД, както и избирателно задава свои вътрешни HTML"},
"dropletBlock_createCanvas_description":function(d){return "Създава поле с указано ИД и избирателно задава размер по ширина и височина"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param1":function(d){return "широчина"},
"dropletBlock_createCanvas_param2":function(d){return "височина"},
"dropletBlock_createRecord_description":function(d){return "При използване на  App Lab's таблицата за съхранение на данни, се създава запис с уникален ИД и предоставеното име в таблицата и призовава  callbackFunction когато действието приключи."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param1":function(d){return "запис"},
"dropletBlock_createRecord_param2":function(d){return "функция"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Създайте променлива и я инициализирайте като масив"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Декларира променлива с даденото име след \"var\" и го задава на стойността от дясната страна на израза"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Декларира променлива"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Създайте променлива и й присвоете стойност чрез показването на ред"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Изтриване на елемент със съответно id"},
"dropletBlock_deleteElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_deleteRecord_description":function(d){return "Използвайки таблицата за съхранение на данни в Ап Лаб, изтрийте записа на предоставения в tableName. запис на обект, който трябва да се идентифицира в полето с неговото ИД. Когато процедурата приключи, се извика callback функция."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param1":function(d){return "запис"},
"dropletBlock_deleteRecord_param2":function(d){return "функция"},
"dropletBlock_divideOperator_description":function(d){return "Разделяне на две числа"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Изчертава точка на мястото на костенурката с определен радиус"},
"dropletBlock_dot_param0":function(d){return "радиус"},
"dropletBlock_drawImage_description":function(d){return "Начертай изображение в горния ляв ъгъл на активното поле по указан елемент и x, y координати"},
"dropletBlock_drawImage_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "широчина"},
"dropletBlock_drawImage_param4":function(d){return "височина"},
"dropletBlock_dropdown_description":function(d){return "Създайте падащ списък, присвоете й елемент идентификатор и го попълнете със елементи"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Тест за равенство"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Създава цикъл, състоящ се от израз на инициализация, условен израз, израз от цели числа и блок от отчети изпълнен за всяко повторение в цикъла"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "за цикъл"},
"dropletBlock_functionParams_n_description":function(d){return "Набор от отчети, които се в един или повече параметри и изпълнява задача или изчислява стойност, когато функцията е извикана"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Дефинира функция с параметри"},
"dropletBlock_functionParams_none_description":function(d){return "Набор от отчети, които изпълняват дадена задача или изчислява стойност, когато функцията е извикана"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Дефинира функция"},
"dropletBlock_getAlpha_description":function(d){return "Получава алфа"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Получава даден атрибут"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Отчита състоянието на квадратче за отметка или радио бутон"},
"dropletBlock_getChecked_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getDirection_description":function(d){return "Отчита посоката на костенурката (0 градуса сочи нагоре)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Вземи ImageData за правоъгълник (x, y, ширина, височина) в рамките на активното поле"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Вземете URL адрес, свързан с изображение или бутон за качване на изображения"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "ключ"},
"dropletBlock_getKeyValue_param1":function(d){return "функция"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Взима текста от указания елемент"},
"dropletBlock_getText_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getTime_description":function(d){return "Получава текущото време в милисекунди"},
"dropletBlock_getUserId_description":function(d){return "Получава уникален идентификатор за текущия потребител на това приложение"},
"dropletBlock_getX_description":function(d){return "Получава текущата x координата в пиксели на костенурката"},
"dropletBlock_getXPosition_description":function(d){return "Получава позицията на елемента по x"},
"dropletBlock_getXPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getY_description":function(d){return "Получава текущата y координата на костенурка в пиксели"},
"dropletBlock_getYPosition_description":function(d){return "Получава позицията на елемента по y"},
"dropletBlock_getYPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_greaterThanOperator_description":function(d){return "Сравнение на две числа"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Скрива костенурката, така че да не се показва на екрана"},
"dropletBlock_hideElement_description":function(d){return "Скрива елемента с указания ИД"},
"dropletBlock_hideElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_ifBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "Ако отчет"},
"dropletBlock_ifElseBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно; в противен случай блокът с отчетите се изпълнява спрямо посоченото в \"друго\" клаузата"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ако/друго отчет"},
"dropletBlock_image_description":function(d){return "Създава изображение и му присвоява  ИД на елемент"},
"dropletBlock_image_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_image_param1":function(d){return "URL адрес"},
"dropletBlock_imageUploadButton_description":function(d){return "Създава бутон за качване на изображение и му го присвоява ИД на елемент"},
"dropletBlock_inequalityOperator_description":function(d){return "Тест за неравенството"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Задаване на вътрешен HTML за елемента с указания ИД"},
"dropletBlock_lessThanOperator_description":function(d){return "Сравнение на две числа"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Чертае линия на активното платно от x 1, y1 до x 2, y2."},
"dropletBlock_line_param0":function(d){return "x 1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x 2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Взема абсолютната стойност на x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Взима максималната стойност от наколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Взема минималната стойност от няколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1, n2,..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Закръгли до най-близкото цяло число"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Премества костенурка от текущото й местоположение. Добавя x в х позицията на костенурката и y в y позицията на костенурката"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Премества костенурка обратно на определен брой пиксели в досегашната й посока"},
"dropletBlock_moveBackward_param0":function(d){return "пиксели"},
"dropletBlock_moveForward_description":function(d){return "Премества костенурка напред на даден брой пиксели в досегашната й посока"},
"dropletBlock_moveForward_param0":function(d){return "пиксели"},
"dropletBlock_moveTo_description":function(d){return "Премества костенурка на конкретна x, y координата на екрана"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Умножаване на две числа"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Връща false ако изразът може да се преобразува на true; в противен случай връща true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "И оператор"},
"dropletBlock_onEvent_description":function(d){return "Изпълнение на код в отговор на дадено събитие."},
"dropletBlock_onEvent_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_onEvent_param1":function(d){return "събитие"},
"dropletBlock_onEvent_param2":function(d){return "функция"},
"dropletBlock_orOperator_description":function(d){return "Връща true, когато или израз е true и false в противен случай"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ИЛИ оператор"},
"dropletBlock_penColor_description":function(d){return "Задава цвета на линия зад костенурката, докато се движи"},
"dropletBlock_penColor_param0":function(d){return "цвят"},
"dropletBlock_penColour_description":function(d){return "Задава цвета на линия зад костенурката, докато се движи"},
"dropletBlock_penColour_param0":function(d){return "цвят"},
"dropletBlock_penDown_description":function(d){return "Създава линия, която се изчертава зад костенурката, докато се движи"},
"dropletBlock_penUp_description":function(d){return "Спира изчертаването на линия зад костенурката когато се премества"},
"dropletBlock_penWidth_description":function(d){return "Задайте ширина на молива на костенурката"},
"dropletBlock_penWidth_param0":function(d){return "широчина"},
"dropletBlock_playSound_description":function(d){return "Възпроизвеждане на MP3, OGG или WAV звукови файлове от зададения URL адрес"},
"dropletBlock_playSound_param0":function(d){return "URL адрес"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Създава радио бутон и му присвоява ИД на елемент"},
"dropletBlock_radioButton_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Вземи случайно число между 0 и указаната максимална стойност"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Вземи случайно число между определени минимални и максимални стойности"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Използвайки таблицата за съхранение на данни в на Ап Лаб, се изчитат записите, предоставени от tableName, които отговарят на searchTerms. Когато прегледът приключи, callbackFunction се извиква и се предава масив от записи."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "функция"},
"dropletBlock_rect_description":function(d){return "Чертае правоъгълник в активният прозорец, разположен в upperLeftX и upperLeftY с размера на широчина и височина."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "широчина"},
"dropletBlock_rect_param3":function(d){return "височина"},
"dropletBlock_return_description":function(d){return "Връща стойност от функция"},
"dropletBlock_return_signatureOverride":function(d){return "връща"},
"dropletBlock_setActiveCanvas_description":function(d){return "Задава ИД на полето за следващи команди (необходимо е, когато има няколко елемента в полето)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setAlpha_description":function(d){return "Задава дадена стойност"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Задава дадена стойност"},
"dropletBlock_setBackground_description":function(d){return "Този блок променя изображението на фона на играта."},
"dropletBlock_setBlue_description":function(d){return "Задава количеството синьо в началото чрезblueValue(в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция в дадено изображение."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setChecked_description":function(d){return "Отчита състоянието на квадратче за отметка или радио бутон"},
"dropletBlock_setChecked_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Задаване на цвета на запълване за активното поле"},
"dropletBlock_setFillColor_param0":function(d){return "цвят"},
"dropletBlock_setGreen_description":function(d){return "Задава количеството зелено като стойност в greenValue(в диапазона от 0 до 255) в цвета на пикселите, разположени на дадена x и y позиция в дадено изображение."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setImageURL_description":function(d){return "Задава URL адрес за ИД на елемент на указаното изображение"},
"dropletBlock_setImageURL_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setImageURL_param1":function(d){return "URL адрес"},
"dropletBlock_setInterval_description":function(d){return "Продължава да изпълнява код всеки път, когато зададения брой милисекунди е изтекъл"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "милисекунди"},
"dropletBlock_setKeyValue_description":function(d){return "Съхранява двойка ключ/стойност в хранилището за ключ/стойност данни на АпЛаб и извиква callbackFunction когато действието приключи."},
"dropletBlock_setKeyValue_param0":function(d){return "ключ"},
"dropletBlock_setKeyValue_param1":function(d){return "стойност"},
"dropletBlock_setKeyValue_param2":function(d){return "функция"},
"dropletBlock_setParent_description":function(d){return "Определя един елемент да бъде дете на родителски елемент"},
"dropletBlock_setPosition_description":function(d){return "Позиционира елемент по x, y координати, ширина и височина"},
"dropletBlock_setPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "широчина"},
"dropletBlock_setPosition_param4":function(d){return "височина"},
"dropletBlock_setRed_description":function(d){return "Задава стойността червено чрез redValue количество(в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция от данните на картинката."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "червено"},
"dropletBlock_setRGB_param4":function(d){return "зелено"},
"dropletBlock_setRGB_param5":function(d){return "синьо"},
"dropletBlock_setStrokeColor_description":function(d){return "Задаване на stroke цвят за активното поле"},
"dropletBlock_setStrokeColor_param0":function(d){return "цвят"},
"dropletBlock_setSprite_description":function(d){return "Задава изображение на актьора"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Задава настроението на Актьора"},
"dropletBlock_setSpritePosition_description":function(d){return "Веднага придвижва актьор към указаното местоположение."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Задава скоростта на актьор"},
"dropletBlock_setStrokeWidth_description":function(d){return "Задаване на ширината на линията за активните полета"},
"dropletBlock_setStrokeWidth_param0":function(d){return "широчина"},
"dropletBlock_setStyle_description":function(d){return "Добавяне на CSS стил текст към елемент"},
"dropletBlock_setText_description":function(d){return "Задава текста за указания елемент"},
"dropletBlock_setText_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setText_param1":function(d){return "текст"},
"dropletBlock_setTimeout_description":function(d){return "Задава таймер и изпълнява код, когато броят е изтекъл"},
"dropletBlock_setTimeout_param0":function(d){return "функция"},
"dropletBlock_setTimeout_param1":function(d){return "милисекунди"},
"dropletBlock_show_description":function(d){return "Показва костенурка на екрана, като я прави видимо в текущото й местоположение"},
"dropletBlock_showElement_description":function(d){return "Показва елемента с указаното ИД"},
"dropletBlock_showElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_speed_description":function(d){return "Променя скоростта на изпълнение на програмата на определен процент стойност"},
"dropletBlock_speed_param0":function(d){return "стойност"},
"dropletBlock_startWebRequest_description":function(d){return "Иска данни от интернет и изпълнява код, когато искането е завършено"},
"dropletBlock_startWebRequest_param0":function(d){return "URL адрес"},
"dropletBlock_startWebRequest_param1":function(d){return "функция"},
"dropletBlock_subtractOperator_description":function(d){return "Изваждане на две числа"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Създава въвеждане на текст и да му присвоява ИД на елемент"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "текст"},
"dropletBlock_textLabel_description":function(d){return "Създайте текстов етикет, и му присвоете елемент ИД и го свържете със сроден елемент"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "текст"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Хвърляне на снаряд от определен актьор."},
"dropletBlock_turnLeft_description":function(d){return "Завърта костенурка обратно на часовниковата стрелка на зададените градуси"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Завърта костенурка по часовниковата стрелка на зададените градуси"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Завърта костенурка в указаната посока (0 градуса сочи нагоре)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param1":function(d){return "запис"},
"dropletBlock_updateRecord_param2":function(d){return "функция"},
"dropletBlock_vanish_description":function(d){return "Изчезване на актьор."},
"dropletBlock_whileBlock_description":function(d){return "Създава цикъл, състоящ се от условен израз и блок на изпълнение за всяко взаимодействие в цикъла. Тоой ще продължава да се изпълнява, докато условието се промени на true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "\"докато\" цикъл"},
"dropletBlock_write_description":function(d){return "Създаване на блок от текст"},
"dropletBlock_write_param0":function(d){return "текст"},
"end":function(d){return "край"},
"emptyBlocksErrorMsg":function(d){return "Блоковете \"Повтори\" и \"или\" трябва да съдържат други блокове в себе си, за да работят. Уверете се, че вътрешния блок се вписва правилно във външния блок."},
"emptyFunctionalBlock":function(d){return "Имате блок с незапълнено поле."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блокът за функция трябва да има други блокове вътре в себе си, за да работи."},
"errorEmptyFunctionBlockModal":function(d){return "Трябва да има блокове вътре във вашата дефиниция на функция. Щракнете върху \"Редактиране\" и плъзнете блокове вътре в зеления блок."},
"errorIncompleteBlockInFunction":function(d){return "Щракнете върху \"Опитате отново\", за да се уверете, че няма  липсващи блокове  вътре във вашата дефиниция на функция."},
"errorParamInputUnattached":function(d){return "Не забравяйте да прикачвате блок за въвеждане на параметри към блока на функцията във вашата работна област."},
"errorUnusedParam":function(d){return "Вие добавихте блок за параметър, но не го използвате в дефиницията. Не забравяйте да използвате вашия параметър като щракнете върху \"Редактиране\" и поставите блокът за параметър вътре в зеления блок."},
"errorRequiredParamsMissing":function(d){return "Създайте параметър за вашата функция като щракнете върху \"Редактиране\" и добавите необходимите параметри. Плъзнете новите блокове за параметър в дефиницията на функцията ви."},
"errorUnusedFunction":function(d){return "Създали сте функция, но никога не сте я използвали във вашата работна област! Щракнете върху \"Функции\" в кутията с инструменти и се уверете, че можете да я използвате във вашата програма."},
"errorQuestionMarksInNumberField":function(d){return "Опитайте да замените \"???\" със стойност."},
"extraTopBlocks":function(d){return "Имате неприкрепени блокове."},
"extraTopBlocksWhenRun":function(d){return "Имате неприкрепени блокове. Искате ли да се приложат към \"при стартиране\" блока?"},
"finalStage":function(d){return "Поздравления! Вие завършихте последния етап."},
"finalStageTrophies":function(d){return "Поздравления! Вие завършихте последния етап и спечелихте  "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Финал"},
"generatedCodeInfo":function(d){return "Дори най-добрите университети учат блок базирано програмиране(напр., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Но под капака, блоковете представляват кодове, написани на JavaScript, в света най-широко използваният за програмиране език:"},
"hashError":function(d){return "За съжаление '%1' не съответства на нито една запазена програма."},
"help":function(d){return "Помощ"},
"hintTitle":function(d){return "Подсказка:"},
"jump":function(d){return "скок"},
"keepPlaying":function(d){return "Продължете да играете"},
"levelIncompleteError":function(d){return "Използвате всички необходими видове блокове, но не по правилния начин."},
"listVariable":function(d){return "списък"},
"makeYourOwnFlappy":function(d){return "Направете своя собствена Flappy Bird игра"},
"missingBlocksErrorMsg":function(d){return "Опитайте един или повече блокове по-долу, за да решите този пъзел."},
"nextLevel":function(d){return "Поздравления! Приключите пъзел "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Поздравления! Завършихте пъзел "+locale.v(d,"puzzleNumber")+" и спечелихте "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Поздравления! Вие завършихте "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравления! Завършихте етап "+locale.v(d,"stageName")+" и спечелихте "+locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравления! Приключихте пъзел "+locale.v(d,"puzzleNumber")+". (Въпреки това, можехте да използвате само "+locale.p(d,"numBlocks",0,"bg",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "Вие написахте "+locale.p(d,"numLines",0,"bg",{"one":"1line","other":locale.n(d,"numLines")+" lines"})+" код!"},
"play":function(d){return "играй"},
"print":function(d){return "Печат"},
"puzzleTitle":function(d){return "Пъзел "+locale.v(d,"puzzle_number")+" от "+locale.v(d,"stage_total")},
"repeat":function(d){return "повтори"},
"resetProgram":function(d){return "Начално състояние"},
"runProgram":function(d){return "Старт"},
"runTooltip":function(d){return "Стартира програмата, определена от блоковете в работното поле."},
"score":function(d){return "Резултат"},
"showCodeHeader":function(d){return "Покажи кода"},
"showBlocksHeader":function(d){return "Покажи блоковете"},
"showGeneratedCode":function(d){return "Покажи кода"},
"stringEquals":function(d){return "низ =?"},
"subtitle":function(d){return "визуална среда за програмиране"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Използвали сте всички необходими видове блокове, но ще ви трябват още от същите видове, за да завършите този пъзел."},
"tooManyBlocksMsg":function(d){return "Този пъзел може да бъде решен с <x id='START_SPAN'/><x id='END_SPAN'/> блокове."},
"tooMuchWork":function(d){return "Вие ме накарахте да свърша много работа! Може ли да повторите няколко пъти?"},
"toolboxHeader":function(d){return "Блокове"},
"toolboxHeaderDroplet":function(d){return "Кутия с инструменти"},
"hideToolbox":function(d){return "(Скрий)"},
"showToolbox":function(d){return "Показване на инструменти"},
"openWorkspace":function(d){return "Как работи"},
"totalNumLinesOfCodeWritten":function(d){return "Общо: "+locale.p(d,"numLines",0,"bg",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" код."},
"tryAgain":function(d){return "Опитайте отново"},
"hintRequest":function(d){return "Вижте съвета"},
"backToPreviousLevel":function(d){return "Обратно към предишното ниво"},
"saveToGallery":function(d){return "Записване в галерията"},
"savedToGallery":function(d){return "Записано в галерията!"},
"shareFailure":function(d){return "За съжаление, не можем да сподели тази програма."},
"workspaceHeaderShort":function(d){return "Работна област: "},
"infinity":function(d){return "Безкрайност"},
"rotateText":function(d){return "Завъртете устройството си."},
"orientationLock":function(d){return "Изключете заключването на ориентацията от опциите на устройството."},
"wantToLearn":function(d){return "Искате ли да се научите да кодирате?"},
"watchVideo":function(d){return "Гледайте видеото"},
"when":function(d){return "Когато"},
"whenRun":function(d){return "при стартиране"},
"tryHOC":function(d){return "Опитайте Часа на Кодирането"},
"signup":function(d){return "Регистрация във встъпителния курс"},
"hintHeader":function(d){return "Ето един съвет:"},
"genericFeedback":function(d){return "Вижте какво сте въвели и се опитайте да коригирате вашата програма."},
"toggleBlocksErrorMsg":function(d){return "Трябва да се коригира грешка във вашата програма, преди тя да бъде показана като блокове."},
"defaultTwitterText":function(d){return "Вижте какво направих"}};