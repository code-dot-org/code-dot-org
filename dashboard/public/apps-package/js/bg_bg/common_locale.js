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
"continue":function(d){return "Продължи"},
"defaultTwitterText":function(d){return "Вижте какво направих"},
"designMode":function(d){return "Дизайн"},
"designModeHeader":function(d){return "Режим на проектиране"},
"dialogCancel":function(d){return "Отказ"},
"dialogOK":function(d){return "OK"},
"directionEastLetter":function(d){return "И"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionWestLetter":function(d){return "З"},
"dropletBlock_addOperator_description":function(d){return "Добавете две числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Добавяне на оператор"},
"dropletBlock_andOperator_description":function(d){return "Връща истина, само когато и двата израза са верни или грешни"},
"dropletBlock_andOperator_signatureOverride":function(d){return "И оператор"},
"dropletBlock_arcLeft_description":function(d){return "Премества костенурка напред и в ляво в гладка кръгла дъга"},
"dropletBlock_arcLeft_param0":function(d){return "ъгъл"},
"dropletBlock_arcLeft_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcLeft_param1":function(d){return "радиус"},
"dropletBlock_arcLeft_param1_description":function(d){return "The radius of the circle that is placed left of the turtle. Must be >= 0."},
"dropletBlock_arcRight_description":function(d){return "Премества костенурка напред и отдясно в гладка кръгла дъг"},
"dropletBlock_arcRight_param0":function(d){return "ъгъл"},
"dropletBlock_arcRight_param0_description":function(d){return "The angle along the circle to move."},
"dropletBlock_arcRight_param1":function(d){return "радиус"},
"dropletBlock_arcRight_param1_description":function(d){return "The radius of the circle that is placed right of the turtle. Must be >= 0."},
"dropletBlock_assign_x_description":function(d){return "Задава стойност на съществуваща променлива. За пример, x = 0;"},
"dropletBlock_assign_x_param0":function(d){return "x"},
"dropletBlock_assign_x_param0_description":function(d){return "The variable name being assigned to"},
"dropletBlock_assign_x_param1":function(d){return "стойност"},
"dropletBlock_assign_x_param1_description":function(d){return "The value the variable is being assigned to."},
"dropletBlock_assign_x_signatureOverride":function(d){return "Присвояване на променлива"},
"dropletBlock_button_description":function(d){return "Създава бутон, върху който можете да щракнете. Бутонът ще показва текст, който може да се препраща от дадено ИД"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param0_description":function(d){return "A unique identifier for the button. The id is used for referencing the created button. For example, to assign event handlers."},
"dropletBlock_button_param1":function(d){return "текст"},
"dropletBlock_button_param1_description":function(d){return "The text displayed within the button."},
"dropletBlock_callMyFunction_description":function(d){return "Призовава по име функция, която е без параметри"},
"dropletBlock_callMyFunction_n_description":function(d){return "Извиква функция, която взима един или повече параметри"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Призовава функция с параметри"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Призовава функция"},
"dropletBlock_changeScore_description":function(d){return "Добавяне или премахване на точка към резултата."},
"dropletBlock_checkbox_description":function(d){return "Създайте кутия за чекване и й задайте ID"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "проверени"},
"dropletBlock_circle_description":function(d){return "Начертайте кръг на активното поле със зададени координати за център (x, y) и радиус"},
"dropletBlock_circle_param0":function(d){return "centerX"},
"dropletBlock_circle_param0_description":function(d){return "The x position in pixels of the center of the circle."},
"dropletBlock_circle_param1":function(d){return "centerY"},
"dropletBlock_circle_param1_description":function(d){return "The y position in pixels of the center of the circle."},
"dropletBlock_circle_param2":function(d){return "радиус"},
"dropletBlock_circle_param2_description":function(d){return "The radius of the circle, in pixels."},
"dropletBlock_clearCanvas_description":function(d){return "Изчистете всички данни на активното поле"},
"dropletBlock_clearInterval_description":function(d){return "Изчистване на съществуващите стойности на таймера и заменянето им със стойността, върната от setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "интервал"},
"dropletBlock_clearInterval_param0_description":function(d){return "The value returned by the setInterval function to clear."},
"dropletBlock_clearTimeout_description":function(d){return "Изчистване на настройките на таймера и замяна на стойността им с върната от setTimeout()"},
"dropletBlock_clearTimeout_param0":function(d){return "време на изчакване"},
"dropletBlock_clearTimeout_param0_description":function(d){return "The value returned by the setTimeout function to cancel."},
"dropletBlock_console.log_description":function(d){return "Показва низ или променлива в дисплея на конзолата"},
"dropletBlock_console.log_param0":function(d){return "съобщение"},
"dropletBlock_console.log_param0_description":function(d){return "The message string to display in the console."},
"dropletBlock_container_description":function(d){return "Създаване на отделен контейнер със ИД, както и избирателно задава свои вътрешни HTML"},
"dropletBlock_createCanvas_description":function(d){return "Създава поле с указано ИД и избирателно задава размер по ширина и височина"},
"dropletBlock_createCanvas_param0":function(d){return "canvasId"},
"dropletBlock_createCanvas_param0_description":function(d){return "The id of the new canvas element."},
"dropletBlock_createCanvas_param1":function(d){return "широчина"},
"dropletBlock_createCanvas_param1_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_createCanvas_param2":function(d){return "височина"},
"dropletBlock_createCanvas_param2_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_createRecord_description":function(d){return "При използване на  App Lab's таблицата за съхранение на данни, се създава запис с уникален ИД и предоставеното име в таблицата и призовава  callbackFunction когато действието приключи."},
"dropletBlock_createRecord_param0":function(d){return "table"},
"dropletBlock_createRecord_param0_description":function(d){return "The name of the table the record should be added to. `tableName` gets created if it doesn't exist."},
"dropletBlock_createRecord_param1":function(d){return "запис"},
"dropletBlock_createRecord_param2":function(d){return "функция"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Декларира променлива и я възлага на масив с първоначалните стойности"},
"dropletBlock_declareAssign_x_array_1_4_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_array_1_4_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_array_1_4_param1":function(d){return "1,2,3,4"},
"dropletBlock_declareAssign_x_array_1_4_param1_description":function(d){return "The initial values to the array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Декларира променлива, зададена на масив"},
"dropletBlock_declareAssign_x_description":function(d){return "Декларира променлива с даденото име след \"var\" и го задава на стойността от дясната страна на израза"},
"dropletBlock_declareAssign_x_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_param1":function(d){return "0"},
"dropletBlock_declareAssign_x_param1_description":function(d){return "The initial value of the variable"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Декларира, че кодът ще използва променлива и й присвоява първоначална стойност, предоставена от потребителя"},
"dropletBlock_declareAssign_x_prompt_param0":function(d){return "x"},
"dropletBlock_declareAssign_x_prompt_param0_description":function(d){return "The name you will use in the program to reference the variable"},
"dropletBlock_declareAssign_x_prompt_param1":function(d){return "\"Enter value\""},
"dropletBlock_declareAssign_x_prompt_param1_description":function(d){return "The string the user will see in the pop up when asked to enter a value"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Питай потребителя за стойност и я съхрани"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Декларира променлива"},
"dropletBlock_deleteElement_description":function(d){return "Изтриване на елемент със съответно id"},
"dropletBlock_deleteElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_deleteElement_param0_description":function(d){return "The id of the element to delete."},
"dropletBlock_deleteRecord_description":function(d){return "Използвайки таблицата за съхранение на данни в Ап Лаб, изтрийте записа на предоставения в tableName. запис на обект, който трябва да се идентифицира в полето с неговото ИД. Когато процедурата приключи, се извика callback функция."},
"dropletBlock_deleteRecord_param0":function(d){return "table"},
"dropletBlock_deleteRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_deleteRecord_param1":function(d){return "запис"},
"dropletBlock_deleteRecord_param2":function(d){return "функция"},
"dropletBlock_deleteRecord_param2_description":function(d){return "A function that is asynchronously called when the call to deleteRecord() is finished."},
"dropletBlock_divideOperator_description":function(d){return "Разделяне на две числа"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Разделител оператор"},
"dropletBlock_dot_description":function(d){return "Изчертава точка на мястото на костенурката с определен радиус"},
"dropletBlock_dot_param0":function(d){return "радиус"},
"dropletBlock_dot_param0_description":function(d){return "The radius of the dot to draw"},
"dropletBlock_drawImage_description":function(d){return "Изчертава указаното изображение или  елемент от активното платно на определената позиция, и по желание променя размера на елемента по определена ширина и височина"},
"dropletBlock_drawImage_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_drawImage_param0_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param1_description":function(d){return "The x position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param2_description":function(d){return "The y position in pixels of the upper left corner of the image to draw."},
"dropletBlock_drawImage_param3":function(d){return "широчина"},
"dropletBlock_drawImage_param4":function(d){return "височина"},
"dropletBlock_dropdown_description":function(d){return "Създайте падащ списък, присвоете й елемент идентификатор и го попълнете със елементи"},
"dropletBlock_dropdown_signatureOverride":function(d){return "падащо меню (dropdownID, option1, option2,..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Проверява дали две стойности са равни. Връща true, ако стойността от лявата страна на израза е равна стойността на дясната страна, и false в противен случай"},
"dropletBlock_equalityOperator_param0":function(d){return "x"},
"dropletBlock_equalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_equalityOperator_param1":function(d){return "y"},
"dropletBlock_equalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Оператор за равенство"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Създава цикъл, състоящ се от израз на инициализация, условен израз, израз от цели числа и блок от отчети изпълнен за всяко повторение в цикъла"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "за цикъл"},
"dropletBlock_functionParams_n_description":function(d){return "Набор от отчети, които се в един или повече параметри и изпълнява задача или изчислява стойност, когато функцията е извикана"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Дефинира функция с параметри"},
"dropletBlock_functionParams_none_description":function(d){return "Набор от отчети, които изпълняват дадена задача или изчислява стойност, когато функцията е извикана"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Дефинира функция"},
"dropletBlock_getAlpha_description":function(d){return "Връща сумата на алфа (непрозрачност) (в диапазона от 0 до 255) в цвят на пикселите, разположени в дадена x и y позиция в данните на изображение"},
"dropletBlock_getAlpha_param0":function(d){return "imageData"},
"dropletBlock_getAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getAttribute_description":function(d){return "Получава даден атрибут"},
"dropletBlock_getBlue_description":function(d){return "Получава сумата на синьо (в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция в дадени данни от изображение"},
"dropletBlock_getBlue_param0":function(d){return "imageData"},
"dropletBlock_getBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getChecked_description":function(d){return "Отчита състоянието на квадратче за отметка или радио бутон"},
"dropletBlock_getChecked_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getDirection_description":function(d){return "Връща текущата посока, в която костенурката е насочена. Отчита се от 0 градуса нагоре"},
"dropletBlock_getGreen_description":function(d){return "Получава сумата на зелено (в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция в дадени данни от изображението"},
"dropletBlock_getGreen_param0":function(d){return "imageData"},
"dropletBlock_getGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getImageData_description":function(d){return "Връща обект, представящ данните на изображението, намиращи се на полето в  диапазона от startX, startY до endX, endY"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param0_description":function(d){return "The x position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param1_description":function(d){return "The y position in pixels starting from the upper left corner of image to start the capture."},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param2_description":function(d){return "The x position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageData_param3":function(d){return "endX"},
"dropletBlock_getImageData_param3_description":function(d){return "The y position in pixels starting from the upper left corner of image to end the capture."},
"dropletBlock_getImageURL_description":function(d){return "Вземете URL за ИД на елемент на предоставеното изображение"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_getKeyValue_description":function(d){return "Извлича стойността, съхранена в предоставеното ключово име в  App Lab съхранените стойности в ключ/стойност данни. Стойността се връща като параметър на callbackFunction когато извличането завърши"},
"dropletBlock_getKeyValue_param0":function(d){return "ключ"},
"dropletBlock_getKeyValue_param0_description":function(d){return "The name of the key to be retrieved."},
"dropletBlock_getKeyValue_param1":function(d){return "функция"},
"dropletBlock_getRed_description":function(d){return "Получава стойността на червено (в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция в данните на изображението"},
"dropletBlock_getRed_param0":function(d){return "imageData"},
"dropletBlock_getRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_getText_description":function(d){return "Взима текста от указания елемент"},
"dropletBlock_getText_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getTime_description":function(d){return "Получава текущото време в милисекунди"},
"dropletBlock_getUserId_description":function(d){return "Получава уникален идентификатор за текущия потребител на това приложение"},
"dropletBlock_getXPosition_description":function(d){return "Получава позицията на елемента по x"},
"dropletBlock_getXPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getX_description":function(d){return "Получава текущата x координата в пиксели на костенурката"},
"dropletBlock_getYPosition_description":function(d){return "Получава позицията на елемента по y"},
"dropletBlock_getYPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_getY_description":function(d){return "Получава текущата y координата на костенурка в пиксели"},
"dropletBlock_greaterThanOperator_description":function(d){return "Проверява дали едно число е по-голямо от друго число. Връща true, ако стойността на лявата страна на израза е строго по-голяма от стойността на дясната страна на израза"},
"dropletBlock_greaterThanOperator_param0":function(d){return "x"},
"dropletBlock_greaterThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_greaterThanOperator_param1":function(d){return "y"},
"dropletBlock_greaterThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "\"По-голямо\"  оператор"},
"dropletBlock_hideElement_description":function(d){return "Скрива елемента с предоставения идентификатор, така че да не се показва на екрана"},
"dropletBlock_hideElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_hideElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_hide_description":function(d){return "Скрива костенурката, така че да не се показва на екрана"},
"dropletBlock_ifBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "Ако отчет"},
"dropletBlock_ifElseBlock_description":function(d){return "Изпълнява блок с отчети, ако указано условие е вярно; в противен случай блокът с отчетите се изпълнява спрямо посоченото в \"друго\" клаузата"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "ако/друго отчет"},
"dropletBlock_imageUploadButton_description":function(d){return "Създава бутон за качване на изображение и му го присвоява ИД на елемент"},
"dropletBlock_image_description":function(d){return "Показва изображението от предоставения url на екрана"},
"dropletBlock_image_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_image_param0_description":function(d){return "The id of the image element."},
"dropletBlock_image_param1":function(d){return "URL адрес"},
"dropletBlock_image_param1_description":function(d){return "The source URL of the image to be displayed on screen."},
"dropletBlock_inequalityOperator_description":function(d){return "Проверява дали две стойности не са равни. Връща true, ако стойността на лявата страна на израза не е равна на стойността на дясната страна на израза"},
"dropletBlock_inequalityOperator_param0":function(d){return "x"},
"dropletBlock_inequalityOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_inequalityOperator_param1":function(d){return "y"},
"dropletBlock_inequalityOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Оператор \"неравенство\""},
"dropletBlock_innerHTML_description":function(d){return "Задаване на вътрешен HTML за елемента с указания ИД"},
"dropletBlock_lessThanOperator_description":function(d){return "Проверява дали една стойност е по-малка от друга стойност. Връща true, ако стойността на лявата страна на израза е строго по-малка от стойността на дясната страна на израза"},
"dropletBlock_lessThanOperator_param0":function(d){return "x"},
"dropletBlock_lessThanOperator_param0_description":function(d){return "The first value to use for comparison."},
"dropletBlock_lessThanOperator_param1":function(d){return "y"},
"dropletBlock_lessThanOperator_param1_description":function(d){return "The second value to use for comparison."},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "\"По-малко\" оператор"},
"dropletBlock_line_description":function(d){return "Чертае линия на активното платно от x 1, y1 до x 2, y2."},
"dropletBlock_line_param0":function(d){return "x 1"},
"dropletBlock_line_param0_description":function(d){return "The x position in pixels of the beginning of the line."},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param1_description":function(d){return "The y position in pixels of the beginning of the line."},
"dropletBlock_line_param2":function(d){return "x 2"},
"dropletBlock_line_param2_description":function(d){return "The x position in pixels of the end of the line."},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_line_param3_description":function(d){return "The y position in pixels of the end of the line."},
"dropletBlock_mathAbs_description":function(d){return "Взема абсолютната стойност на x"},
"dropletBlock_mathAbs_param0":function(d){return "x"},
"dropletBlock_mathAbs_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.ABS(x)"},
"dropletBlock_mathMax_description":function(d){return "Взима максималната стойност от наколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMax_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMax_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.Max (n1, n2,..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Взема минималната стойност от няколко стойности на n1, n2,..., nX"},
"dropletBlock_mathMin_param0":function(d){return "n1, n2,..., nX"},
"dropletBlock_mathMin_param0_description":function(d){return "One or more numbers to compare."},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min (n1, n2,..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Закръглява число до най-близкото цяло число"},
"dropletBlock_mathRound_param0":function(d){return "x"},
"dropletBlock_mathRound_param0_description":function(d){return "An arbitrary number."},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.Round(x)"},
"dropletBlock_moveBackward_description":function(d){return "Премества костенурка обратно на определен брой пиксели в досегашната й посока"},
"dropletBlock_moveBackward_param0":function(d){return "пиксели"},
"dropletBlock_moveBackward_param0_description":function(d){return "The number of pixels to move the turtle back in its current direction. If not provided, the turtle will move back 25 pixels"},
"dropletBlock_moveForward_description":function(d){return "Премества костенурка напред на даден брой пиксели в досегашната й посока"},
"dropletBlock_moveForward_param0":function(d){return "пиксели"},
"dropletBlock_moveForward_param0_description":function(d){return "The number of pixels to move the turtle forward in its current direction. If not provided, the turtle will move forward 25 pixels"},
"dropletBlock_moveTo_description":function(d){return "Премества костенурка на конкретна x, y координата на екрана"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param0_description":function(d){return "The x coordinate on the screen to move the turtle."},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_moveTo_param1_description":function(d){return "The y coordinate on the screen to move the turtle."},
"dropletBlock_move_description":function(d){return "Премества костенурка от текущото й местоположение. Добавя x в х позицията на костенурката и y в y позицията на костенурката"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param0_description":function(d){return "The number of pixels to move the turtle right."},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_move_param1_description":function(d){return "The number of pixels to move the turtle down."},
"dropletBlock_multiplyOperator_description":function(d){return "Умножаване на две числа"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Оператор \"Умножение\""},
"dropletBlock_notOperator_description":function(d){return "Връща false ако изразът може да се преобразува на true; в противен случай връща true"},
"dropletBlock_notOperator_signatureOverride":function(d){return "НЕ булев оператор"},
"dropletBlock_onEvent_description":function(d){return "Изпълнява callbackFunction кода, когато определен тип събитие се дължи на указания елемент"},
"dropletBlock_onEvent_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_onEvent_param0_description":function(d){return "The ID of the UI control to which this function applies."},
"dropletBlock_onEvent_param1":function(d){return "събитие"},
"dropletBlock_onEvent_param1_description":function(d){return "The type of event to respond to."},
"dropletBlock_onEvent_param2":function(d){return "функция"},
"dropletBlock_onEvent_param2_description":function(d){return "A function to execute."},
"dropletBlock_orOperator_description":function(d){return "Връща true, когато или израз е true и false в противен случай"},
"dropletBlock_orOperator_signatureOverride":function(d){return "ИЛИ оператор"},
"dropletBlock_penColor_description":function(d){return "Задава цвета на линия зад костенурката, докато се движи"},
"dropletBlock_penColor_param0":function(d){return "цвят"},
"dropletBlock_penColor_param0_description":function(d){return "The color of the line left behind the turtle as it moves"},
"dropletBlock_penColour_description":function(d){return "Задава цвета на линия зад костенурката, докато се движи"},
"dropletBlock_penColour_param0":function(d){return "цвят"},
"dropletBlock_penDown_description":function(d){return "Създава линия, която се изчертава зад костенурката, докато се движи"},
"dropletBlock_penUp_description":function(d){return "Спира изчертаването на линия зад костенурката когато се премества"},
"dropletBlock_penWidth_description":function(d){return "Променя диаметъра на кръговете, направени зад костенурката, докато се движи"},
"dropletBlock_penWidth_param0":function(d){return "широчина"},
"dropletBlock_penWidth_param0_description":function(d){return "The diameter of the circles drawn behind the turtle as it moves"},
"dropletBlock_playSound_description":function(d){return "Възпроизвеждане на MP3, OGG или WAV звукови файлове от зададения URL адрес"},
"dropletBlock_playSound_param0":function(d){return "URL адрес"},
"dropletBlock_putImageData_description":function(d){return "Задава начално изображение върху полето на текущия елемент, започвайки от позиция startX, startY"},
"dropletBlock_putImageData_param0":function(d){return "imageData"},
"dropletBlock_putImageData_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_putImageData_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image to place the data on the canvas."},
"dropletBlock_radioButton_description":function(d){return "Създава радио бутон и го възлага на група за избор от предварително определен набор от опции. Само един бутон в една група може да бъде избран"},
"dropletBlock_radioButton_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_radioButton_param0_description":function(d){return "A unique identifier for the radio button. The id is used for referencing the radioButton control. For example, to assign event handlers."},
"dropletBlock_radioButton_param1":function(d){return "проверени"},
"dropletBlock_radioButton_param1_description":function(d){return "Whether the radio button is initially checked."},
"dropletBlock_radioButton_param2":function(d){return "Група"},
"dropletBlock_radioButton_param2_description":function(d){return "The group that the radio button is associated with. Only one button in a group can be checked at a time."},
"dropletBlock_randomNumber_max_description":function(d){return "Връща случайно число от нула до максимум, включително нула и max в диапазона"},
"dropletBlock_randomNumber_max_param0":function(d){return "max"},
"dropletBlock_randomNumber_max_param0_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Връща случайно число, вариращо от първоначална стойност(мин.) до крайна стойност (Макс), включително и двете стойности в диапазона"},
"dropletBlock_randomNumber_min_max_param0":function(d){return "min"},
"dropletBlock_randomNumber_min_max_param0_description":function(d){return "The minimum number returned"},
"dropletBlock_randomNumber_min_max_param1":function(d){return "max"},
"dropletBlock_randomNumber_min_max_param1_description":function(d){return "The maximum number returned"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Използвайки таблицата за съхранение на данни в на Ап Лаб, се изчитат записите, предоставени от tableName, които отговарят на searchTerms. Когато прегледът приключи, callbackFunction се извиква и се предава масив от записи."},
"dropletBlock_readRecords_param0":function(d){return "table"},
"dropletBlock_readRecords_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "функция"},
"dropletBlock_rect_description":function(d){return "Чертае правоъгълник в активният прозорец, разположен в upperLeftX и upperLeftY с размера на широчина и височина."},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param0_description":function(d){return "The x position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param1_description":function(d){return "The y position in pixels of the upper left corner of the rectangle."},
"dropletBlock_rect_param2":function(d){return "широчина"},
"dropletBlock_rect_param2_description":function(d){return "The horizontal width in pixels of the rectangle."},
"dropletBlock_rect_param3":function(d){return "височина"},
"dropletBlock_rect_param3_description":function(d){return "The vertical height in pixels of the rectangle."},
"dropletBlock_return_description":function(d){return "Връща стойност от функция"},
"dropletBlock_return_signatureOverride":function(d){return "връща"},
"dropletBlock_setActiveCanvas_description":function(d){return "Променя активните настройки на полето с указания ИД (други  команди засягат само активните полета)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "canvasId"},
"dropletBlock_setActiveCanvas_param0_description":function(d){return "The id of the canvas element to activate."},
"dropletBlock_setAlpha_description":function(d){return "Задава размера на алфа (непрозрачност) (в диапазона от 0 до 255) в цвят на пикселите, разположени в дадена x и y позиция в данни от изображението"},
"dropletBlock_setAlpha_param0":function(d){return "imageData"},
"dropletBlock_setAlpha_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAlpha_param3_description":function(d){return "The amount of alpha (opacity) (from 0 to 255) to set in the pixel."},
"dropletBlock_setAttribute_description":function(d){return "Задава дадена стойност"},
"dropletBlock_setBackground_description":function(d){return "Този блок променя изображението на фона на играта."},
"dropletBlock_setBlue_description":function(d){return "Задава количеството синьо в началото чрезblueValue(в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция в дадено изображение."},
"dropletBlock_setBlue_param0":function(d){return "imageData"},
"dropletBlock_setBlue_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setBlue_param3":function(d){return "blueValue"},
"dropletBlock_setBlue_param3_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setChecked_description":function(d){return "Отчита състоянието на квадратче за отметка или радио бутон"},
"dropletBlock_setChecked_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setChecked_param1":function(d){return "проверени"},
"dropletBlock_setFillColor_description":function(d){return "Задаване на цвета на запълване за активното поле"},
"dropletBlock_setFillColor_param0":function(d){return "цвят"},
"dropletBlock_setFillColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setGreen_description":function(d){return "Задава количеството зелено като стойност в greenValue(в диапазона от 0 до 255) в цвета на пикселите, разположени на дадена x и y позиция в дадено изображение."},
"dropletBlock_setGreen_param0":function(d){return "imageData"},
"dropletBlock_setGreen_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setGreen_param3":function(d){return "greenValue"},
"dropletBlock_setGreen_param3_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setImageURL_description":function(d){return "Вземете URL за ИД на елемент на предоставеното изображение"},
"dropletBlock_setImageURL_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setImageURL_param0_description":function(d){return "The id of the image element."},
"dropletBlock_setImageURL_param1":function(d){return "URL адрес"},
"dropletBlock_setImageURL_param1_description":function(d){return "TThe source URL of the image to be displayed on screen."},
"dropletBlock_setInterval_description":function(d){return "Изпълнява обратно повикване на код на функция всеки път, когато изтече определен брой милисекунди, докато не се спре"},
"dropletBlock_setInterval_param0":function(d){return "функция"},
"dropletBlock_setInterval_param0_description":function(d){return "A function to execute."},
"dropletBlock_setInterval_param1":function(d){return "милисекунди"},
"dropletBlock_setInterval_param1_description":function(d){return "The number of milliseconds between each execution of the function."},
"dropletBlock_setKeyValue_description":function(d){return "Съхранява двойка ключ/стойност в хранилището за ключ/стойност данни на АпЛаб и извиква callbackFunction когато действието приключи."},
"dropletBlock_setKeyValue_param0":function(d){return "ключ"},
"dropletBlock_setKeyValue_param0_description":function(d){return "The name of the key to be stored."},
"dropletBlock_setKeyValue_param1":function(d){return "стойност"},
"dropletBlock_setKeyValue_param1_description":function(d){return "The data to be stored."},
"dropletBlock_setKeyValue_param2":function(d){return "функция"},
"dropletBlock_setKeyValue_param2_description":function(d){return "A function that is asynchronously called when the call to setKeyValue is finished."},
"dropletBlock_setParent_description":function(d){return "Определя един елемент да бъде дете на родителски елемент"},
"dropletBlock_setPosition_description":function(d){return "Позиционира елемент по x, y координати, ширина и височина"},
"dropletBlock_setPosition_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "широчина"},
"dropletBlock_setPosition_param4":function(d){return "височина"},
"dropletBlock_setRGB_description":function(d){return "Задава RGB цветови стойности (в диапазона от 0 до 255) на пикселите, разположени на дадена x и y позиция в данни от изображението "},
"dropletBlock_setRGB_param0":function(d){return "imageData"},
"dropletBlock_setRGB_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRGB_param3":function(d){return "червено"},
"dropletBlock_setRGB_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param4":function(d){return "зелено"},
"dropletBlock_setRGB_param4_description":function(d){return "The amount of green (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param5":function(d){return "синьо"},
"dropletBlock_setRGB_param5_description":function(d){return "The amount of blue (from 0 to 255) to set in the pixel."},
"dropletBlock_setRGB_param6":function(d){return "alpha"},
"dropletBlock_setRGB_param6_description":function(d){return "Optional. The amount of opacity (from 0 to 255) to set in the pixel. Defaults to 255 (full opacity)."},
"dropletBlock_setRed_description":function(d){return "Задава стойността червено чрез redValue количество(в диапазона от 0 до 255) в цвета на пикселите, разположени в дадена x и y позиция от данните на картинката."},
"dropletBlock_setRed_param0":function(d){return "imageData"},
"dropletBlock_setRed_param0_description":function(d){return "The image data object that describes data captured from a canvas element (use [getImageData()](/applab/docs/getImageData))"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param1_description":function(d){return "The x position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param2_description":function(d){return "The y position in pixels starting from the upper left corner of image."},
"dropletBlock_setRed_param3":function(d){return "redValue"},
"dropletBlock_setRed_param3_description":function(d){return "The amount of red (from 0 to 255) to set in the pixel."},
"dropletBlock_setSpriteEmotion_description":function(d){return "Задава настроението на Актьора"},
"dropletBlock_setSpritePosition_description":function(d){return "Веднага придвижва актьор към указаното местоположение."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Задава скоростта на актьор"},
"dropletBlock_setSprite_description":function(d){return "Задава изображение на актьора"},
"dropletBlock_setStrokeColor_description":function(d){return "Задаване на stroke цвят за активното поле"},
"dropletBlock_setStrokeColor_param0":function(d){return "цвят"},
"dropletBlock_setStrokeColor_param0_description":function(d){return "The color name or hex value representing the color."},
"dropletBlock_setStrokeWidth_description":function(d){return "Задаване на ширината на линията за активните полета"},
"dropletBlock_setStrokeWidth_param0":function(d){return "широчина"},
"dropletBlock_setStrokeWidth_param0_description":function(d){return "The width in pixels with which to draw lines, circles, and rectangles."},
"dropletBlock_setStyle_description":function(d){return "Добавяне на CSS стил текст към елемент"},
"dropletBlock_setText_description":function(d){return "Задава текста за указания елемент"},
"dropletBlock_setText_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_setText_param1":function(d){return "текст"},
"dropletBlock_setTimeout_description":function(d){return "Задава таймер и изпълнява код, когато броят е изтекъл"},
"dropletBlock_setTimeout_param0":function(d){return "функция"},
"dropletBlock_setTimeout_param0_description":function(d){return "A function to execute."},
"dropletBlock_setTimeout_param1":function(d){return "милисекунди"},
"dropletBlock_setTimeout_param1_description":function(d){return "The number of milliseconds to wait before executing the function."},
"dropletBlock_showElement_description":function(d){return "Показва елемента с предоставеното ИД"},
"dropletBlock_showElement_param0":function(d){return "идентификатор(ИД)"},
"dropletBlock_showElement_param0_description":function(d){return "The id of the element to hide."},
"dropletBlock_show_description":function(d){return "Показва костенурка на екрана, като я прави видимо в текущото й местоположение"},
"dropletBlock_speed_description":function(d){return "Задава скоростта при стартиране на приложението, (която задава скоростта на костенурката). Очаква число от 1 до 100."},
"dropletBlock_speed_param0":function(d){return "стойност"},
"dropletBlock_speed_param0_description":function(d){return "The speed of the app's execution in the range of (1-100)"},
"dropletBlock_startWebRequest_description":function(d){return "Иска данни от интернет и изпълнява код, когато искането е завършено"},
"dropletBlock_startWebRequest_param0":function(d){return "URL адрес"},
"dropletBlock_startWebRequest_param0_description":function(d){return "The web address of a service that returns data."},
"dropletBlock_startWebRequest_param1":function(d){return "функция"},
"dropletBlock_startWebRequest_param1_description":function(d){return "A function to execute."},
"dropletBlock_subtractOperator_description":function(d){return "Изваждане на две числа"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Оператор \"изваждане\""},
"dropletBlock_textInput_description":function(d){return "Създава въвеждане на текст и да му присвоява ИД на елемент"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "текст"},
"dropletBlock_textLabel_description":function(d){return "Създава и показва текстов етикет. Текста на етикета се използва за показване на описание за следните контроли за въвеждане: радио бутони, квадратчета за отметка, текстово поле и падащи списъци"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param0_description":function(d){return "A unique identifier for the label control. The id is used for referencing the created label. For example, to assign event handlers."},
"dropletBlock_textLabel_param1":function(d){return "текст"},
"dropletBlock_textLabel_param1_description":function(d){return "The value to display for the label."},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_textLabel_param2_description":function(d){return "The id to associate the label with. Clicking the label is the same as clicking on the control."},
"dropletBlock_throw_description":function(d){return "Хвърляне на снаряд от определен актьор."},
"dropletBlock_turnLeft_description":function(d){return "Променя посоката на костенурка вляво от зададения ъгъл в градуси"},
"dropletBlock_turnLeft_param0":function(d){return "ъгъл"},
"dropletBlock_turnLeft_param0_description":function(d){return "The angle to turn left."},
"dropletBlock_turnRight_description":function(d){return "Променя посоката на костенурка вдясно от зададения ъгъл в градуси"},
"dropletBlock_turnRight_param0":function(d){return "ъгъл"},
"dropletBlock_turnRight_param0_description":function(d){return "The angle to turn right."},
"dropletBlock_turnTo_description":function(d){return "Променя посоката на костенурката на определен ъгъл. 0 е нагоре, 90 е дясно, 180 е надолу, и 270 е ляво"},
"dropletBlock_turnTo_param0":function(d){return "ъгъл"},
"dropletBlock_turnTo_param0_description":function(d){return "The new angle to set the turtle's direction to."},
"dropletBlock_updateRecord_description":function(d){return "Използвайки таблицата с данни за съхранение на  App Lab, актуализирай предоставеният запис в tableName. Записът трябва да се идентифицира с неговото ИД в полето. Когато индитифицирането приключи, се извиква callbackFunction"},
"dropletBlock_updateRecord_param0":function(d){return "tableName"},
"dropletBlock_updateRecord_param0_description":function(d){return "The name of the table from which the records should be searched and read."},
"dropletBlock_updateRecord_param1":function(d){return "запис"},
"dropletBlock_updateRecord_param2":function(d){return "функция"},
"dropletBlock_vanish_description":function(d){return "Изчезване на актьор."},
"dropletBlock_whileBlock_description":function(d){return "Създава цикъл, състоящ се от условен израз и блок на изпълнение за всяко взаимодействие в цикъла. Тоой ще продължава да се изпълнява, докато условието се промени на true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "\"докато\" цикъл"},
"dropletBlock_write_description":function(d){return "Зададеният текст се добавя към долната част на документа. Текстът също може да бъде форматиран като HTML."},
"dropletBlock_write_param0":function(d){return "текст"},
"dropletBlock_write_param0_description":function(d){return "The text or HTML you want appended to the bottom of your application"},
"emptyBlocksErrorMsg":function(d){return "Блоковете \"Повтори\" и \"или\" трябва да съдържат други блокове в себе си, за да работят. Уверете се, че вътрешния блок се вписва правилно във външния блок."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блокът за функция трябва да има други блокове вътре в себе си, за да работи."},
"emptyFunctionalBlock":function(d){return "Имате блок с незапълнено поле."},
"end":function(d){return "край"},
"errorEmptyFunctionBlockModal":function(d){return "Трябва да има блокове вътре във вашата дефиниция на функция. Щракнете върху \"Редактиране\" и плъзнете блокове вътре в зеления блок."},
"errorIncompleteBlockInFunction":function(d){return "Щракнете върху \"Опитате отново\", за да се уверете, че няма  липсващи блокове  вътре във вашата дефиниция на функция."},
"errorParamInputUnattached":function(d){return "Не забравяйте да прикачвате блок за въвеждане на параметри към блока на функцията във вашата работна област."},
"errorQuestionMarksInNumberField":function(d){return "Опитайте да замените \"???\" със стойност."},
"errorRequiredParamsMissing":function(d){return "Създайте параметър за вашата функция като щракнете върху \"Редактиране\" и добавите необходимите параметри. Плъзнете новите блокове за параметър в дефиницията на функцията ви."},
"errorUnusedFunction":function(d){return "Създали сте функция, но никога не сте я използвали във вашата работна област! Щракнете върху \"Функции\" в кутията с инструменти и се уверете, че можете да я използвате във вашата програма."},
"errorUnusedParam":function(d){return "Вие добавихте блок за параметър, но не го използвате в дефиницията. Не забравяйте да използвате вашия параметър като щракнете върху \"Редактиране\" и поставите блокът за параметър вътре в зеления блок."},
"extraTopBlocks":function(d){return "Имате неприкрепени блокове."},
"extraTopBlocksWhenRun":function(d){return "Имате неприкрепени блокове. Искате ли да се приложат към \"при стартиране\" блока?"},
"finalStage":function(d){return "Поздравления! Вие завършихте последния етап."},
"finalStageTrophies":function(d){return "Поздравления! Вие завършихте последния етап и спечелихте  "+common_locale.p(d,"numTrophies",0,"bg",{"one":"a trophy","other":common_locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Финал"},
"generatedCodeInfo":function(d){return "Дори най-добрите университети учат блок базирано програмиране(напр., "+common_locale.v(d,"berkeleyLink")+", "+common_locale.v(d,"harvardLink")+"). Но под капака, блоковете представляват кодове, написани на JavaScript, в света най-широко използваният за програмиране език:"},
"genericFeedback":function(d){return "Вижте какво сте въвели и се опитайте да коригирате вашата програма."},
"hashError":function(d){return "За съжаление '%1' не съответства на нито една запазена програма."},
"help":function(d){return "Помощ"},
"hideToolbox":function(d){return "(Скрий)"},
"hintHeader":function(d){return "Ето един съвет:"},
"hintRequest":function(d){return "Вижте съвета"},
"hintTitle":function(d){return "Подсказка:"},
"infinity":function(d){return "Безкрайност"},
"jump":function(d){return "скок"},
"keepPlaying":function(d){return "Продължете да играете"},
"levelIncompleteError":function(d){return "Използвате всички необходими видове блокове, но не по правилния начин."},
"listVariable":function(d){return "списък"},
"makeYourOwnFlappy":function(d){return "Направете своя собствена Flappy Bird игра"},
"missingBlocksErrorMsg":function(d){return "Опитайте един или повече блокове по-долу, за да решите този пъзел."},
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
"repeat":function(d){return "повтори"},
"resetProgram":function(d){return "Начално състояние"},
"rotateText":function(d){return "Завъртете устройството си."},
"runProgram":function(d){return "Старт"},
"runTooltip":function(d){return "Стартира програмата, определена от блоковете в работното поле."},
"saveToGallery":function(d){return "Записване в галерията"},
"savedToGallery":function(d){return "Записано в галерията!"},
"score":function(d){return "Резултат"},
"shareFailure":function(d){return "За съжаление, не можем да сподели тази програма."},
"showBlocksHeader":function(d){return "Покажи блоковете"},
"showCodeHeader":function(d){return "Покажи кода"},
"showGeneratedCode":function(d){return "Покажи кода"},
"showToolbox":function(d){return "Показване на инструменти"},
"signup":function(d){return "Регистрация във встъпителния курс"},
"stringEquals":function(d){return "низ =?"},
"subtitle":function(d){return "визуална среда за програмиране"},
"textVariable":function(d){return "текст"},
"toggleBlocksErrorMsg":function(d){return "Трябва да се коригира грешка във вашата програма, преди тя да бъде показана като блокове."},
"tooFewBlocksMsg":function(d){return "Използвали сте всички необходими видове блокове, но ще ви трябват още от същите видове, за да завършите този пъзел."},
"tooManyBlocksMsg":function(d){return "Този пъзел може да бъде решен с <x id='START_SPAN'/><x id='END_SPAN'/> блокове."},
"tooMuchWork":function(d){return "Вие ме накарахте да свърша много работа! Може ли да повторите няколко пъти?"},
"toolboxHeader":function(d){return "Блокове"},
"toolboxHeaderDroplet":function(d){return "Кутия с инструменти"},
"totalNumLinesOfCodeWritten":function(d){return "Общо: "+common_locale.p(d,"numLines",0,"bg",{"one":"1 line","other":common_locale.n(d,"numLines")+" lines"})+" код."},
"tryAgain":function(d){return "Опитайте отново"},
"tryHOC":function(d){return "Опитайте Часа на Кодирането"},
"wantToLearn":function(d){return "Искате ли да се научите да кодирате?"},
"watchVideo":function(d){return "Гледайте видеото"},
"when":function(d){return "Когато"},
"whenRun":function(d){return "при стартиране"},
"workspaceHeaderShort":function(d){return "Работна област: "}};