var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Использовано блоков: %1"},
"branches":function(d){return "ветви"},
"catColour":function(d){return "Цвет"},
"catControl":function(d){return "Циклы"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "функции"},
"catTurtle":function(d){return "Действия"},
"catVariables":function(d){return "переменные"},
"catLogic":function(d){return "Логика"},
"colourTooltip":function(d){return "Меняет цвет карандаша."},
"createACircle":function(d){return "создать круг"},
"createSnowflakeSquare":function(d){return "создать квадратную снежинку"},
"createSnowflakeParallelogram":function(d){return "создание снежинки-параллелограмма"},
"createSnowflakeLine":function(d){return "создание снежинки-линии"},
"createSnowflakeSpiral":function(d){return "создание снежинки-спирали"},
"createSnowflakeFlower":function(d){return "создать снежинку-цветок"},
"createSnowflakeFractal":function(d){return "создать снежинку-фрактал"},
"createSnowflakeRandom":function(d){return "создать случайную снежинку"},
"createASnowflakeBranch":function(d){return "создать снежинку-ветвь"},
"degrees":function(d){return "градусов"},
"depth":function(d){return "глубина"},
"dots":function(d){return "точек"},
"drawACircle":function(d){return "нарисовать окружность"},
"drawAFlower":function(d){return "нарисовать цветок"},
"drawAHexagon":function(d){return "нарисовать шестиугольник"},
"drawAHouse":function(d){return "нарисовать дом"},
"drawAPlanet":function(d){return "нарисовать планету"},
"drawARhombus":function(d){return "нарисовать ромб"},
"drawARobot":function(d){return "нарисовать робота"},
"drawARocket":function(d){return "нарисовать ракету"},
"drawASnowflake":function(d){return "нарисовать снежинку"},
"drawASnowman":function(d){return "нарисовать снеговика"},
"drawASquare":function(d){return "нарисовать квадрат"},
"drawAStar":function(d){return "нарисовать звезду"},
"drawATree":function(d){return "нарисовать дерево"},
"drawATriangle":function(d){return "нарисовать треугольник"},
"drawUpperWave":function(d){return "нарисовать верхнюю волну"},
"drawLowerWave":function(d){return "нарисовать нижнюю волну"},
"drawStamp":function(d){return "создать штамп"},
"heightParameter":function(d){return "высота"},
"hideTurtle":function(d){return "скрыть художника"},
"jump":function(d){return "прыгнуть"},
"jumpBackward":function(d){return "прыгнуть назад на"},
"jumpForward":function(d){return "прыгнуть вперед на"},
"jumpTooltip":function(d){return "Перемещает художника, не оставляя следов."},
"jumpEastTooltip":function(d){return "Перемещает художника на восток, не оставляя следов."},
"jumpNorthTooltip":function(d){return "Перемещает художника на север, не оставляя следов."},
"jumpSouthTooltip":function(d){return "Перемещает художника на юг, не оставляя следов."},
"jumpWestTooltip":function(d){return "Перемещает художника на запад, не оставляя следов."},
"lengthFeedback":function(d){return "У вас всё правильно, кроме длин перемещений."},
"lengthParameter":function(d){return "длина"},
"loopVariable":function(d){return "счётчик"},
"moveBackward":function(d){return "двигаться назад на"},
"moveEastTooltip":function(d){return "Перемещает художника на восток."},
"moveForward":function(d){return "двигаться вперёд на"},
"moveForwardTooltip":function(d){return "Перемещает художника вперед."},
"moveNorthTooltip":function(d){return "Перемещает художника на север."},
"moveSouthTooltip":function(d){return "Перемещает художника на юг."},
"moveWestTooltip":function(d){return "Перемещает художника на запад."},
"moveTooltip":function(d){return "Перемещает художника вперед или назад на заданное расстояние."},
"notBlackColour":function(d){return "Для этой головоломки нужно выбрать цвет, отличный от чёрного."},
"numBlocksNeeded":function(d){return "Головоломка может быть решена с помощью %1 блоков. Использовано %2."},
"penDown":function(d){return "опустить карандаш"},
"penTooltip":function(d){return "Поднимает или опускает карандаш для того, чтобы начать или закончить рисовать."},
"penUp":function(d){return "поднять карандаш"},
"reinfFeedbackMsg":function(d){return "Вот ваш рисунок! Продолжайте работать или перейдите к следующей головоломке."},
"setAlpha":function(d){return "Установить прозрачность"},
"setColour":function(d){return "выбрать цвет"},
"setPattern":function(d){return "установить шаблон"},
"setWidth":function(d){return "задать ширину"},
"shareDrawing":function(d){return "Поделитесь вашим рисунком:"},
"showMe":function(d){return "Показать"},
"showTurtle":function(d){return "показать художника"},
"sizeParameter":function(d){return "размер"},
"step":function(d){return "шаг"},
"tooFewColours":function(d){return "Необходимо использовать хотя бы %1 разных цветов для этой головоломки. Использовано только %2."},
"turnLeft":function(d){return "повернуть влево на"},
"turnRight":function(d){return "повернуть вправо на"},
"turnRightTooltip":function(d){return "Поворачивает художника вправо на указанный угол."},
"turnTooltip":function(d){return "Поворачивает художника влево или вправо на указанный угол в градусах."},
"turtleVisibilityTooltip":function(d){return "Делает художника видимым или невидимым."},
"widthTooltip":function(d){return "Изменяет ширину карандаша."},
"wrongColour":function(d){return "Неправильный цвет картинки. Для этой головоломки он должен быть %1."}};