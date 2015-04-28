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
"booleanTrue":function(d){return "истина"},
"booleanFalse":function(d){return "ложь"},
"blocks":function(d){return "блоки"},
"blocklyMessage":function(d){return "Блокли"},
"catActions":function(d){return "Действия"},
"catColour":function(d){return "Цвет"},
"catLogic":function(d){return "Логика"},
"catLists":function(d){return "Списки"},
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
"continue":function(d){return "Продолжить"},
"designMode":function(d){return "Дизайн"},
"designModeHeader":function(d){return "Режим дизайна"},
"dialogCancel":function(d){return "Отмена"},
"dialogOK":function(d){return "Продолжить"},
"directionNorthLetter":function(d){return "С"},
"directionSouthLetter":function(d){return "Ю"},
"directionEastLetter":function(d){return "В"},
"directionWestLetter":function(d){return "З"},
"dropletBlock_addOperator_description":function(d){return "Сложить два числа"},
"dropletBlock_addOperator_signatureOverride":function(d){return "Add operator"},
"dropletBlock_andOperator_description":function(d){return "Возвращает значение истина если оба выражения истины, и значение ложь в противном случае"},
"dropletBlock_andOperator_signatureOverride":function(d){return "И булев оператор"},
"dropletBlock_arcLeft_description":function(d){return "Подвиньте черепашку против часовой стрелки по арке, указав радиус и на сколько градусов надо её передвинуть"},
"dropletBlock_arcLeft_param0":function(d){return "angle"},
"dropletBlock_arcLeft_param1":function(d){return "радиус"},
"dropletBlock_arcRight_description":function(d){return "Подвиньте черепашку по часовой стрелки по арке, указав радиус и на сколько градусов надо её передвинуть"},
"dropletBlock_arcRight_param0":function(d){return "angle"},
"dropletBlock_arcRight_param1":function(d){return "радиус"},
"dropletBlock_assign_x_description":function(d){return "Поменяйте значение переменной"},
"dropletBlock_assign_x_signatureOverride":function(d){return "Assign a variable"},
"dropletBlock_button_description":function(d){return "Создайте кнопку и присвойте ей идентификатор элемента"},
"dropletBlock_button_param0":function(d){return "buttonId"},
"dropletBlock_button_param1":function(d){return "текст"},
"dropletBlock_callMyFunction_description":function(d){return "Вызывает указанную функцию, которая не принимает никаких параметров"},
"dropletBlock_callMyFunction_signatureOverride":function(d){return "Назвать функцию"},
"dropletBlock_callMyFunction_n_description":function(d){return "Вызывает указанную функцию, которая принимает один или несколько параметров"},
"dropletBlock_callMyFunction_n_signatureOverride":function(d){return "Назвать функцию с параметрами"},
"dropletBlock_changeScore_description":function(d){return "Добавить или отнять очко."},
"dropletBlock_checkbox_description":function(d){return "Создайте флажок и присвойте ему идентификатор элемента"},
"dropletBlock_checkbox_param0":function(d){return "checkboxId"},
"dropletBlock_checkbox_param1":function(d){return "checked"},
"dropletBlock_circle_description":function(d){return "Нарисуйте круг на холсте, указав координаты центра (x,y) и радиус"},
"dropletBlock_circle_param0":function(d){return "центрX"},
"dropletBlock_circle_param1":function(d){return "центрY"},
"dropletBlock_circle_param2":function(d){return "радиус"},
"dropletBlock_clearCanvas_description":function(d){return "Очистить все данные на активном холсте"},
"dropletBlock_clearInterval_description":function(d){return "Очистить существующий интервал таймера, указав значение, которое возвращает setInterval()"},
"dropletBlock_clearInterval_param0":function(d){return "interval"},
"dropletBlock_clearTimeout_description":function(d){return "Очистите существующее измерение времени возвращающееся из setTimeout ()"},
"dropletBlock_clearTimeout_param0":function(d){return "timeout"},
"dropletBlock_console.log_description":function(d){return "Отображает строку или переменную на дисплее консоля"},
"dropletBlock_console.log_param0":function(d){return "сообщение"},
"dropletBlock_container_description":function(d){return "Создайте разделение контейнера с указанным элементом идентификации (ID), и, по не обходимости, установите его внутренний HTML ( Язык Гипертекстовой Разметки )"},
"dropletBlock_createCanvas_description":function(d){return "Создать холст с указанным идентификатором, и, если возможно, установить параметры ширины и высоты"},
"dropletBlock_createCanvas_param0":function(d){return "холстидентификация"},
"dropletBlock_createCanvas_param1":function(d){return "ширина"},
"dropletBlock_createCanvas_param2":function(d){return "высота"},
"dropletBlock_createRecord_description":function(d){return "Использование программы лабораторной таблицы сохранения данных, создает запись с уникальным идентификатором в имени данной таблицы, и вызывает функцию \"обратный вызов\", когда действие завершено."},
"dropletBlock_createRecord_param0":function(d){return "имятаблицы"},
"dropletBlock_createRecord_param1":function(d){return "запись"},
"dropletBlock_createRecord_param2":function(d){return "функция"},
"dropletBlock_declareAssign_x_array_1_4_description":function(d){return "Create a variable and initialize it as an array"},
"dropletBlock_declareAssign_x_array_1_4_signatureOverride":function(d){return "Declare a variable assigned to an array"},
"dropletBlock_declareAssign_x_description":function(d){return "Объявляет переменную с данным именем после \" Var \", и присваивает его значение на правой части выражения"},
"dropletBlock_declareAssign_x_signatureOverride":function(d){return "Объявить переменную"},
"dropletBlock_declareAssign_x_prompt_description":function(d){return "Create a variable and assign it a value by displaying a prompt"},
"dropletBlock_declareAssign_x_prompt_signatureOverride":function(d){return "Prompt the user for a value and store it"},
"dropletBlock_deleteElement_description":function(d){return "Удалите элемент с указанным идентификатором"},
"dropletBlock_deleteElement_param0":function(d){return "идентификатор"},
"dropletBlock_deleteRecord_description":function(d){return "Deletes a record, identified by record.id."},
"dropletBlock_deleteRecord_param0":function(d){return "имятаблицы"},
"dropletBlock_deleteRecord_param1":function(d){return "запись"},
"dropletBlock_deleteRecord_param2":function(d){return "функция"},
"dropletBlock_divideOperator_description":function(d){return "Разделите два номера"},
"dropletBlock_divideOperator_signatureOverride":function(d){return "Divide operator"},
"dropletBlock_dot_description":function(d){return "Рисует точку с указанным радиусом на месте черепахи"},
"dropletBlock_dot_param0":function(d){return "радиус"},
"dropletBlock_drawImage_description":function(d){return "Draw an image on the active  canvas with the specified image element and x, y as the top left coordinates"},
"dropletBlock_drawImage_param0":function(d){return "идентификатор"},
"dropletBlock_drawImage_param1":function(d){return "x"},
"dropletBlock_drawImage_param2":function(d){return "y"},
"dropletBlock_drawImage_param3":function(d){return "ширина"},
"dropletBlock_drawImage_param4":function(d){return "высота"},
"dropletBlock_dropdown_description":function(d){return "Create a dropdown, assign it an element id, and populate it with a list of items"},
"dropletBlock_dropdown_signatureOverride":function(d){return "dropdown(dropdownID, option1, option2, ..., optionX)"},
"dropletBlock_equalityOperator_description":function(d){return "Test for equality"},
"dropletBlock_equalityOperator_signatureOverride":function(d){return "Equality operator"},
"dropletBlock_forLoop_i_0_4_description":function(d){return "Do something multiple times"},
"dropletBlock_forLoop_i_0_4_signatureOverride":function(d){return "цикл с параметром"},
"dropletBlock_functionParams_n_description":function(d){return "Create a function with an argument"},
"dropletBlock_functionParams_n_signatureOverride":function(d){return "Определите функцию с параметрами"},
"dropletBlock_functionParams_none_description":function(d){return "Набор утверждений, которые выполняют задачу или вычисления значения, когда функция вызвана"},
"dropletBlock_functionParams_none_signatureOverride":function(d){return "Определите функцию"},
"dropletBlock_getAlpha_description":function(d){return "Gets the alpha"},
"dropletBlock_getAlpha_param0":function(d){return "данныеизображения"},
"dropletBlock_getAlpha_param1":function(d){return "x"},
"dropletBlock_getAlpha_param2":function(d){return "y"},
"dropletBlock_getAttribute_description":function(d){return "Получает данный атрибут"},
"dropletBlock_getBlue_description":function(d){return "Gets the given blue value"},
"dropletBlock_getBlue_param0":function(d){return "данныеизображения"},
"dropletBlock_getBlue_param1":function(d){return "x"},
"dropletBlock_getBlue_param2":function(d){return "y"},
"dropletBlock_getChecked_description":function(d){return "Get the state of a checkbox or radio button"},
"dropletBlock_getChecked_param0":function(d){return "идентификатор"},
"dropletBlock_getDirection_description":function(d){return "Get the turtle's direction (0 degrees is pointing up)"},
"dropletBlock_getGreen_description":function(d){return "Gets the given green value"},
"dropletBlock_getGreen_param0":function(d){return "данныеизображения"},
"dropletBlock_getGreen_param1":function(d){return "x"},
"dropletBlock_getGreen_param2":function(d){return "y"},
"dropletBlock_getImageData_description":function(d){return "Get the ImageData for a rectangle (x, y, width, height) within the active  canvas"},
"dropletBlock_getImageData_param0":function(d){return "startX"},
"dropletBlock_getImageData_param1":function(d){return "startY"},
"dropletBlock_getImageData_param2":function(d){return "endX"},
"dropletBlock_getImageData_param3":function(d){return "endY"},
"dropletBlock_getImageURL_description":function(d){return "Get the URL associated with an image or image upload button"},
"dropletBlock_getImageURL_param0":function(d){return "imageID"},
"dropletBlock_getKeyValue_description":function(d){return "Reads the value associated with the key from the remote data store."},
"dropletBlock_getKeyValue_param0":function(d){return "ключ"},
"dropletBlock_getKeyValue_param1":function(d){return "функция"},
"dropletBlock_getRed_description":function(d){return "Gets the given red value"},
"dropletBlock_getRed_param0":function(d){return "данныеизображения"},
"dropletBlock_getRed_param1":function(d){return "x"},
"dropletBlock_getRed_param2":function(d){return "y"},
"dropletBlock_getText_description":function(d){return "Get the text from the specified element"},
"dropletBlock_getText_param0":function(d){return "идентификатор"},
"dropletBlock_getTime_description":function(d){return "Get the current time in milliseconds"},
"dropletBlock_getUserId_description":function(d){return "Gets a unique identifier for the current user of this app."},
"dropletBlock_getX_description":function(d){return "Get the turtle's x position"},
"dropletBlock_getXPosition_description":function(d){return "Get the element's x position"},
"dropletBlock_getXPosition_param0":function(d){return "идентификатор"},
"dropletBlock_getY_description":function(d){return "Get the turtle's y position"},
"dropletBlock_getYPosition_description":function(d){return "Get the element's y position"},
"dropletBlock_getYPosition_param0":function(d){return "идентификатор"},
"dropletBlock_greaterThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_greaterThanOperator_signatureOverride":function(d){return "Greater than operator"},
"dropletBlock_hide_description":function(d){return "Hide the turtle image"},
"dropletBlock_hideElement_description":function(d){return "Hide the element with the specified id"},
"dropletBlock_hideElement_param0":function(d){return "идентификатор"},
"dropletBlock_ifBlock_description":function(d){return "Do something only if a condition is true"},
"dropletBlock_ifBlock_signatureOverride":function(d){return "if statement"},
"dropletBlock_ifElseBlock_description":function(d){return "Do something if a condition is true, otherwise do something else"},
"dropletBlock_ifElseBlock_signatureOverride":function(d){return "команда \"если/иначе\""},
"dropletBlock_image_description":function(d){return "Create an image and assign it an element id"},
"dropletBlock_image_param0":function(d){return "идентификатор"},
"dropletBlock_image_param1":function(d){return "URL-адрес"},
"dropletBlock_imageUploadButton_description":function(d){return "Create an image upload button and assign it an element id"},
"dropletBlock_inequalityOperator_description":function(d){return "Test for inequality"},
"dropletBlock_inequalityOperator_signatureOverride":function(d){return "Inequality operator"},
"dropletBlock_innerHTML_description":function(d){return "Set the inner HTML for the element with the specified id"},
"dropletBlock_lessThanOperator_description":function(d){return "Compare two numbers"},
"dropletBlock_lessThanOperator_signatureOverride":function(d){return "Less than operator"},
"dropletBlock_line_description":function(d){return "Draw a line on the active canvas from x1, y1 to x2, y2"},
"dropletBlock_line_param0":function(d){return "x1"},
"dropletBlock_line_param1":function(d){return "y1"},
"dropletBlock_line_param2":function(d){return "x2"},
"dropletBlock_line_param3":function(d){return "y2"},
"dropletBlock_mathAbs_description":function(d){return "Возвращает модуль значения переменной x"},
"dropletBlock_mathAbs_signatureOverride":function(d){return "Math.abs(x)"},
"dropletBlock_mathMax_description":function(d){return "Возвращает максимальное значение среди одного или нескольких значений n1, n2, ..., nX"},
"dropletBlock_mathMax_signatureOverride":function(d){return "Math.max(n1, n2, ..., nX)"},
"dropletBlock_mathMin_description":function(d){return "Возвращает минимальное значение среди одного или нескольких значений n1, n2, ..., nX"},
"dropletBlock_mathMin_signatureOverride":function(d){return "Math.min(n1, n2, ..., nX)"},
"dropletBlock_mathRound_description":function(d){return "Round to the nearest integer"},
"dropletBlock_mathRound_signatureOverride":function(d){return "Math.round(x)"},
"dropletBlock_move_description":function(d){return "Move the turtle by the specified x and y coordinates"},
"dropletBlock_move_param0":function(d){return "x"},
"dropletBlock_move_param1":function(d){return "y"},
"dropletBlock_moveBackward_description":function(d){return "Move the turtle backward the specified distance"},
"dropletBlock_moveBackward_param0":function(d){return "точек"},
"dropletBlock_moveForward_description":function(d){return "Move the turtle forward the specified distance"},
"dropletBlock_moveForward_param0":function(d){return "точек"},
"dropletBlock_moveTo_description":function(d){return "Move the turtle to the specified x and y coordinates"},
"dropletBlock_moveTo_param0":function(d){return "x"},
"dropletBlock_moveTo_param1":function(d){return "y"},
"dropletBlock_multiplyOperator_description":function(d){return "Перемножьте два числа"},
"dropletBlock_multiplyOperator_signatureOverride":function(d){return "Multiply operator"},
"dropletBlock_notOperator_description":function(d){return "Logical NOT of a boolean"},
"dropletBlock_notOperator_signatureOverride":function(d){return "AND boolean operator"},
"dropletBlock_onEvent_description":function(d){return "Выполните код в ответ на определенное событие."},
"dropletBlock_onEvent_param0":function(d){return "идентификатор"},
"dropletBlock_onEvent_param1":function(d){return "событие"},
"dropletBlock_onEvent_param2":function(d){return "функция"},
"dropletBlock_orOperator_description":function(d){return "Logical OR of two booleans"},
"dropletBlock_orOperator_signatureOverride":function(d){return "Логический оператор ИЛИ"},
"dropletBlock_penColor_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColor_param0":function(d){return "цвет"},
"dropletBlock_penColour_description":function(d){return "Set the turtle to the specified pen color"},
"dropletBlock_penColour_param0":function(d){return "цвет"},
"dropletBlock_penDown_description":function(d){return "Set down the turtle's pen"},
"dropletBlock_penUp_description":function(d){return "Pick up the turtle's pen"},
"dropletBlock_penWidth_description":function(d){return "Set the turtle to the specified pen width"},
"dropletBlock_penWidth_param0":function(d){return "ширина"},
"dropletBlock_playSound_description":function(d){return "Play the MP3, OGG, or WAV sound file from the specified URL"},
"dropletBlock_playSound_param0":function(d){return "URL-адрес"},
"dropletBlock_putImageData_description":function(d){return "Set the ImageData for a rectangle within the active  canvas with x, y as the top left coordinates"},
"dropletBlock_putImageData_param0":function(d){return "данныеизображения"},
"dropletBlock_putImageData_param1":function(d){return "startX"},
"dropletBlock_putImageData_param2":function(d){return "startY"},
"dropletBlock_radioButton_description":function(d){return "Create a radio button and assign it an element id"},
"dropletBlock_radioButton_param0":function(d){return "идентификатор"},
"dropletBlock_radioButton_param1":function(d){return "checked"},
"dropletBlock_radioButton_param2":function(d){return "group"},
"dropletBlock_randomNumber_max_description":function(d){return "Get a random number between 0 and the specified maximum value"},
"dropletBlock_randomNumber_max_signatureOverride":function(d){return "randomNumber(max)"},
"dropletBlock_randomNumber_min_max_description":function(d){return "Get a random number between the specified minimum and maximum values"},
"dropletBlock_randomNumber_min_max_signatureOverride":function(d){return "randomNumber(min, max)"},
"dropletBlock_readRecords_description":function(d){return "Reads all records whose properties match those on the searchParams object."},
"dropletBlock_readRecords_param0":function(d){return "имятаблицы"},
"dropletBlock_readRecords_param1":function(d){return "searchParams"},
"dropletBlock_readRecords_param2":function(d){return "функция"},
"dropletBlock_rect_description":function(d){return "Draw a rectangle on the active  canvas with x, y, width, and height coordinates"},
"dropletBlock_rect_param0":function(d){return "upperLeftX"},
"dropletBlock_rect_param1":function(d){return "upperLeftY"},
"dropletBlock_rect_param2":function(d){return "ширина"},
"dropletBlock_rect_param3":function(d){return "высота"},
"dropletBlock_return_description":function(d){return "Возвращает значение функции"},
"dropletBlock_return_signatureOverride":function(d){return "возврат"},
"dropletBlock_setActiveCanvas_description":function(d){return "Set the canvas id for subsequent canvas commands (only needed when there are multiple canvas elements)"},
"dropletBlock_setActiveCanvas_param0":function(d){return "холстидентификация"},
"dropletBlock_setAlpha_description":function(d){return "Sets the given value"},
"dropletBlock_setAlpha_param0":function(d){return "данныеизображения"},
"dropletBlock_setAlpha_param1":function(d){return "x"},
"dropletBlock_setAlpha_param2":function(d){return "y"},
"dropletBlock_setAlpha_param3":function(d){return "alphaValue"},
"dropletBlock_setAttribute_description":function(d){return "Sets the given value"},
"dropletBlock_setBackground_description":function(d){return "Установить на задний план изображение"},
"dropletBlock_setBlue_description":function(d){return "Sets the given value"},
"dropletBlock_setBlue_param0":function(d){return "данныеизображения"},
"dropletBlock_setBlue_param1":function(d){return "x"},
"dropletBlock_setBlue_param2":function(d){return "y"},
"dropletBlock_setBlue_param3":function(d){return "синееЗначение"},
"dropletBlock_setChecked_description":function(d){return "Set the state of a checkbox or radio button"},
"dropletBlock_setChecked_param0":function(d){return "идентификатор"},
"dropletBlock_setChecked_param1":function(d){return "checked"},
"dropletBlock_setFillColor_description":function(d){return "Set the fill color for the active  canvas"},
"dropletBlock_setFillColor_param0":function(d){return "цвет"},
"dropletBlock_setGreen_description":function(d){return "Sets the given value"},
"dropletBlock_setGreen_param0":function(d){return "данныеизображения"},
"dropletBlock_setGreen_param1":function(d){return "x"},
"dropletBlock_setGreen_param2":function(d){return "y"},
"dropletBlock_setGreen_param3":function(d){return "зелёноеЗначение"},
"dropletBlock_setImageURL_description":function(d){return "Set the URL for the specified image element id"},
"dropletBlock_setImageURL_param0":function(d){return "идентификатор"},
"dropletBlock_setImageURL_param1":function(d){return "URL-адрес"},
"dropletBlock_setInterval_description":function(d){return "Continue to execute code each time the specified number of milliseconds has elapsed"},
"dropletBlock_setInterval_param0":function(d){return "callbackFunction"},
"dropletBlock_setInterval_param1":function(d){return "милисекунды"},
"dropletBlock_setKeyValue_description":function(d){return "Saves the value associated with the key to the remote data store."},
"dropletBlock_setKeyValue_param0":function(d){return "ключ"},
"dropletBlock_setKeyValue_param1":function(d){return "значение"},
"dropletBlock_setKeyValue_param2":function(d){return "функция"},
"dropletBlock_setParent_description":function(d){return "Set an element to become a child of a parent element"},
"dropletBlock_setPosition_description":function(d){return "Position an element with x, y, width, and height coordinates"},
"dropletBlock_setPosition_param0":function(d){return "идентификатор"},
"dropletBlock_setPosition_param1":function(d){return "x"},
"dropletBlock_setPosition_param2":function(d){return "y"},
"dropletBlock_setPosition_param3":function(d){return "ширина"},
"dropletBlock_setPosition_param4":function(d){return "высота"},
"dropletBlock_setRed_description":function(d){return "Sets the given value"},
"dropletBlock_setRed_param0":function(d){return "данныеизображения"},
"dropletBlock_setRed_param1":function(d){return "x"},
"dropletBlock_setRed_param2":function(d){return "y"},
"dropletBlock_setRed_param3":function(d){return "красноеЗначение"},
"dropletBlock_setRGB_description":function(d){return "Sets the RGB color values (ranging from 0 to 255) of the pixel located at the given x and y position in the given image data to the input red, green, blue amounts"},
"dropletBlock_setRGB_param0":function(d){return "данныеизображения"},
"dropletBlock_setRGB_param1":function(d){return "x"},
"dropletBlock_setRGB_param2":function(d){return "y"},
"dropletBlock_setRGB_param3":function(d){return "красного"},
"dropletBlock_setRGB_param4":function(d){return "зелёного"},
"dropletBlock_setRGB_param5":function(d){return "синий"},
"dropletBlock_setStrokeColor_description":function(d){return "Set the stroke color for the active  canvas"},
"dropletBlock_setStrokeColor_param0":function(d){return "цвет"},
"dropletBlock_setSprite_description":function(d){return "Установить изображение персонажа"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Установить настроение актера"},
"dropletBlock_setSpritePosition_description":function(d){return "Мгновенно перемещает персонажа в указанное место."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Установите скорость персонажа"},
"dropletBlock_setStrokeWidth_description":function(d){return "Set the line width for the active  canvas"},
"dropletBlock_setStrokeWidth_param0":function(d){return "ширина"},
"dropletBlock_setStyle_description":function(d){return "Добавьте текст с CSS стилем к элементу"},
"dropletBlock_setText_description":function(d){return "Set the text for the specified element"},
"dropletBlock_setText_param0":function(d){return "идентификатор"},
"dropletBlock_setText_param1":function(d){return "текст"},
"dropletBlock_setTimeout_description":function(d){return "Set a timer and execute code when that number of milliseconds has elapsed"},
"dropletBlock_setTimeout_param0":function(d){return "функция"},
"dropletBlock_setTimeout_param1":function(d){return "милисекунды"},
"dropletBlock_show_description":function(d){return "Show the turtle image at its current location"},
"dropletBlock_showElement_description":function(d){return "Show the element with the specified id"},
"dropletBlock_showElement_param0":function(d){return "идентификатор"},
"dropletBlock_speed_description":function(d){return "Change the execution speed of the program to the specified percentage value"},
"dropletBlock_speed_param0":function(d){return "значение"},
"dropletBlock_startWebRequest_description":function(d){return "Request data from the internet and execute code when the request is complete"},
"dropletBlock_startWebRequest_param0":function(d){return "URL-адрес"},
"dropletBlock_startWebRequest_param1":function(d){return "функция"},
"dropletBlock_subtractOperator_description":function(d){return "Subtract two numbers"},
"dropletBlock_subtractOperator_signatureOverride":function(d){return "Subtract operator"},
"dropletBlock_textInput_description":function(d){return "Create a text input and assign it an element id"},
"dropletBlock_textInput_param0":function(d){return "inputId"},
"dropletBlock_textInput_param1":function(d){return "текст"},
"dropletBlock_textLabel_description":function(d){return "Create a text label, assign it an element id, and bind it to an associated element"},
"dropletBlock_textLabel_param0":function(d){return "labelId"},
"dropletBlock_textLabel_param1":function(d){return "текст"},
"dropletBlock_textLabel_param2":function(d){return "forId"},
"dropletBlock_throw_description":function(d){return "Кидает снаряд от указанного персонажа."},
"dropletBlock_turnLeft_description":function(d){return "Turn the turtle counterclockwise by the specified number of degrees"},
"dropletBlock_turnLeft_param0":function(d){return "angle"},
"dropletBlock_turnRight_description":function(d){return "Turn the turtle clockwise by the specified number of degrees"},
"dropletBlock_turnRight_param0":function(d){return "angle"},
"dropletBlock_turnTo_description":function(d){return "Turn the turtle to the specified direction (0 degrees is pointing up)"},
"dropletBlock_turnTo_param0":function(d){return "angle"},
"dropletBlock_updateRecord_description":function(d){return "Updates a record, identified by record.id."},
"dropletBlock_updateRecord_param0":function(d){return "имятаблицы"},
"dropletBlock_updateRecord_param1":function(d){return "запись"},
"dropletBlock_updateRecord_param2":function(d){return "функция"},
"dropletBlock_vanish_description":function(d){return "Заставляет персонажа исчезнуть."},
"dropletBlock_whileBlock_description":function(d){return "Repeat something while a condition is true"},
"dropletBlock_whileBlock_signatureOverride":function(d){return "цикл \"пока\""},
"dropletBlock_write_description":function(d){return "Create a block of text"},
"dropletBlock_write_param0":function(d){return "текст"},
"end":function(d){return "конец"},
"emptyBlocksErrorMsg":function(d){return "Блокам \"повторять\" или \"если\" необходимо иметь внутри другие блоки для работы. Убедись  в том, что внутренний блок должным образом подходит к блоку, в котором он содержится."},
"emptyFunctionalBlock":function(d){return "У вас есть блок с незаполненными входными данными."},
"emptyFunctionBlocksErrorMsg":function(d){return "Блок процедуры требует для работы другие блоки внутри себя."},
"errorEmptyFunctionBlockModal":function(d){return "В определении вашей функции обязательно должны быть блоки. Нажмите \"Редактировать\" и поместите блоки внутри зеленого блока."},
"errorIncompleteBlockInFunction":function(d){return "Нажмите \"Редактировать\" чтобы убедиться, что вы не пропустили никаких блоков в определении функции."},
"errorParamInputUnattached":function(d){return "Не забудьте прикрепить блок к каждому входящему параметру блока функции в своем рабочем пространстве."},
"errorUnusedParam":function(d){return "Вы добавили блок параметров, но не использовали его в определении функции. Чтобы убедиться, что вы используете ваш параметр, нажмите \"Редактировать\" и поместите блок параметра внутри зеленого блока."},
"errorRequiredParamsMissing":function(d){return "Создайте параметр для своей функции нажав \"Редактировать\" и добавив необходимые параметры. Перетащите новые блоки параметров в определение своей функции."},
"errorUnusedFunction":function(d){return "Вы создали функцию, но не использовали её в работе! Нажмите на «Функции» на панели инструментов и убедитесь, что вы используете её в своей программе."},
"errorQuestionMarksInNumberField":function(d){return "Попробуйте изменить значение \"???\"."},
"extraTopBlocks":function(d){return "У вас остались неприсоединённые блоки."},
"extraTopBlocksWhenRun":function(d){return "У вас остались неприсоединённые блоки. Вы собирались присоединить их к блоку \"При запуске\"?"},
"finalStage":function(d){return "Поздравляю! Ты завершил последний этап."},
"finalStageTrophies":function(d){return "Поздравляю! Ты завершил последний этап и выиграл "+locale.p(d,"numTrophies",0,"ru",{"one":"кубок","other":locale.n(d,"numTrophies")+" кубков"})+"."},
"finish":function(d){return "Готово"},
"generatedCodeInfo":function(d){return "Даже в лучших университетах изучают блочное программирование (например, "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Но на самом деле блоки, которые вы собирали, могут быть отображены на JavaScript, наиболее широко используемом в мире языке программирования:"},
"hashError":function(d){return "К сожалению, «%1» не соответствует какой-либо сохранённой программе."},
"help":function(d){return "Справка"},
"hintTitle":function(d){return "Подсказка:"},
"jump":function(d){return "прыгнуть"},
"keepPlaying":function(d){return "Продолжайте играть"},
"levelIncompleteError":function(d){return "Ты используешь все необходимые виды блоков, но неправильным способом."},
"listVariable":function(d){return "список"},
"makeYourOwnFlappy":function(d){return "Создайте свою Flappy игру"},
"missingBlocksErrorMsg":function(d){return "Для решения этой головоломки попробуй один или несколько из следующих блоков:"},
"nextLevel":function(d){return "Поздравляю! Головоломка "+locale.v(d,"puzzleNumber")+" решена."},
"nextLevelTrophies":function(d){return "Поздравляю! Ты завершил головоломку "+locale.v(d,"puzzleNumber")+" и выиграл "+locale.p(d,"numTrophies",0,"ru",{"one":"кубок","other":locale.n(d,"numTrophies")+" кубков"})+"."},
"nextPuzzle":function(d){return "Next Puzzle"},
"nextStage":function(d){return "Поздравляем! Вы закончили "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Поздравляем! Вы выполнили "+locale.v(d,"stageName")+" и выиграли "+locale.p(d,"numTrophies",0,"ru",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Поздравляю! Ты завершил головоломку "+locale.v(d,"puzzleNumber")+". (Однако, можно было обойтись всего  "+locale.p(d,"numBlocks",0,"ru",{"one":"1 блоком","other":locale.n(d,"numBlocks")+" блоками"})+".)"},
"numLinesOfCodeWritten":function(d){return "Ты только что написал "+locale.p(d,"numLines",0,"ru",{"one":"1 строку","other":locale.n(d,"numLines")+" строки"})+" кода!"},
"play":function(d){return "играть"},
"print":function(d){return "Печать"},
"puzzleTitle":function(d){return "Головоломка "+locale.v(d,"puzzle_number")+" из "+locale.v(d,"stage_total")},
"repeat":function(d){return "повторить"},
"resetProgram":function(d){return "Сбросить"},
"runProgram":function(d){return "Выполнить"},
"runTooltip":function(d){return "Запускает программу, заданную блоками в рабочей области."},
"score":function(d){return "очки"},
"showCodeHeader":function(d){return "Показать код"},
"showBlocksHeader":function(d){return "Показать блоки"},
"showGeneratedCode":function(d){return "Показать код"},
"stringEquals":function(d){return "строка=?"},
"subtitle":function(d){return "среда визуального программирования"},
"textVariable":function(d){return "текст"},
"tooFewBlocksMsg":function(d){return "Ты используешь все необходимые виды блоков, но попробуй использовать большее число  блоков, чтобы завершить головоломку."},
"tooManyBlocksMsg":function(d){return "Эта головоломка может быть решена блоками <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "Ты заставил меня попотеть! Может, будешь стараться делать меньше попыток?"},
"toolboxHeader":function(d){return "Блоки"},
"toolboxHeaderDroplet":function(d){return "Панели инструментов"},
"hideToolbox":function(d){return "(Скрыть)"},
"showToolbox":function(d){return "Показать панель инструментов"},
"openWorkspace":function(d){return "Как это работает"},
"totalNumLinesOfCodeWritten":function(d){return "Общее количество: "+locale.p(d,"numLines",0,"ru",{"one":"1 строка","other":locale.n(d,"numLines")+" строки"})+" кода."},
"tryAgain":function(d){return "Попытаться ещё раз"},
"hintRequest":function(d){return "Посмотреть подсказку"},
"backToPreviousLevel":function(d){return "Вернуться на предыдущий уровень"},
"saveToGallery":function(d){return "Сохранить в галерею"},
"savedToGallery":function(d){return "Сохранено в галерее!"},
"shareFailure":function(d){return "К сожалению, мы не можем поделиться этой программой."},
"workspaceHeaderShort":function(d){return "Место сбора блоков: "},
"infinity":function(d){return "Бесконечность"},
"rotateText":function(d){return "Поверните ваше устройство."},
"orientationLock":function(d){return "Выключите блокировку ориентации в настройках устройства."},
"wantToLearn":function(d){return "Хочешь научиться программировать?"},
"watchVideo":function(d){return "Посмотреть видео"},
"when":function(d){return "когда"},
"whenRun":function(d){return "При запуске"},
"tryHOC":function(d){return "Попробуйте Час кода"},
"signup":function(d){return "Зарегистрируйтесь на вводный курс"},
"hintHeader":function(d){return "Подсказка:"},
"genericFeedback":function(d){return "Посмотрите, что у вас получилось, и попытайтесь исправить вашу программу."},
"toggleBlocksErrorMsg":function(d){return "Вам необходимо исправить ошибку в вашей программе, прежде чем она будет отображена в виде блоков."},
"defaultTwitterText":function(d){return "Оцените, что я сделал"}};