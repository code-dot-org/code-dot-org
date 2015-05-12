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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "Використано блоків:  %1"},
"branches":function(d){return "гілочки"},
"catColour":function(d){return "Колір"},
"catControl":function(d){return "петлі"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функції"},
"catTurtle":function(d){return "Дії"},
"catVariables":function(d){return "змінні"},
"catLogic":function(d){return "Логіка"},
"colourTooltip":function(d){return "Змінює колір олівця."},
"createACircle":function(d){return "створити коло"},
"createSnowflakeSquare":function(d){return "створити сніжинку квадратного типу"},
"createSnowflakeParallelogram":function(d){return "створити сніжинку типу паралелограм"},
"createSnowflakeLine":function(d){return "створити сніжинку лінійного типу"},
"createSnowflakeSpiral":function(d){return "створити сніжинку спірального типу"},
"createSnowflakeFlower":function(d){return "створити сніжинку квіткового типу"},
"createSnowflakeFractal":function(d){return "створити сніжинку фрактального типу"},
"createSnowflakeRandom":function(d){return "створити сніжинку випадкового типу"},
"createASnowflakeBranch":function(d){return "створити гілочку сніжинки"},
"degrees":function(d){return "градусів"},
"depth":function(d){return "глибина"},
"dots":function(d){return "пікселів"},
"drawASquare":function(d){return "намалювати квадрат"},
"drawATriangle":function(d){return "намалювати трикутник"},
"drawACircle":function(d){return "намалювати коло"},
"drawAFlower":function(d){return "намалювати квітку"},
"drawAHexagon":function(d){return "намалювати шестикутник"},
"drawAHouse":function(d){return "намалювати будинок"},
"drawAPlanet":function(d){return "намалювати планету"},
"drawARhombus":function(d){return "намалювати ромб"},
"drawARobot":function(d){return "намалювати робота"},
"drawARocket":function(d){return "намалювати ракету"},
"drawASnowflake":function(d){return "намалювати сніжинку"},
"drawASnowman":function(d){return "намалювати сніговика"},
"drawAStar":function(d){return "намалювати зірку"},
"drawATree":function(d){return "намалювати дерево"},
"drawUpperWave":function(d){return "намалювати хвилю догори"},
"drawLowerWave":function(d){return "намалювати хвилю вниз"},
"drawStamp":function(d){return "намалювати штамп"},
"heightParameter":function(d){return "висота"},
"hideTurtle":function(d){return "приховати художника"},
"jump":function(d){return "стрибок"},
"jumpBackward":function(d){return "перескочити назад на"},
"jumpForward":function(d){return "перескочити вперед на"},
"jumpTooltip":function(d){return "Переміщує художника, не залишаючи слідів."},
"jumpEastTooltip":function(d){return "Переміщує художника на схід, не залишаючи сліду."},
"jumpNorthTooltip":function(d){return "Переміщує художника на північ, не залишаючи сліду."},
"jumpSouthTooltip":function(d){return "Переміщує художника на південь, не залишаючи сліду."},
"jumpWestTooltip":function(d){return "Переміщує художника на захід, не залишаючи сліду."},
"lengthFeedback":function(d){return "Правильно, але потрібно виправити довжину."},
"lengthParameter":function(d){return "довжина"},
"loopVariable":function(d){return "лічильник"},
"moveBackward":function(d){return "переміститись назад на"},
"moveEastTooltip":function(d){return "Переміщує художника на схід."},
"moveForward":function(d){return "переміститись вперед на"},
"moveForwardTooltip":function(d){return "Переміщує художника вперед."},
"moveNorthTooltip":function(d){return "Переміщує художника на північ."},
"moveSouthTooltip":function(d){return "Переміщує художника на південь."},
"moveWestTooltip":function(d){return "Переміщує художника на захід."},
"moveTooltip":function(d){return "Переміщує художника вперед або назад на вказану кількість клітинок."},
"notBlackColour":function(d){return "Потрібно вибрати колір, що відрізняється від чорного."},
"numBlocksNeeded":function(d){return "Це завдання можна розв'язати, використавши %1 блоків. Ви використали  %2."},
"penDown":function(d){return "опустити олівець"},
"penTooltip":function(d){return "Піднімає або опускає олівець, щоб почати або завершити малювання сліду."},
"penUp":function(d){return "підняти олівець"},
"reinfFeedbackMsg":function(d){return "Ось ваш малюнок! Продовжуйте роботу над ним, або перейдіть до наступної задачі."},
"setColour":function(d){return "встановити колір"},
"setPattern":function(d){return "встановити шаблон"},
"setWidth":function(d){return "встановити ширину"},
"shareDrawing":function(d){return "Поділіться своїм малюнком:"},
"showMe":function(d){return "Покажи мені"},
"showTurtle":function(d){return "показати художника"},
"sizeParameter":function(d){return "розмір"},
"step":function(d){return "крок"},
"tooFewColours":function(d){return "Потрібно використати принаймні %1 різних кольорів, щоб розв'язати завдання. Ви використали лише %2."},
"turnLeft":function(d){return "повернути ліворуч на"},
"turnRight":function(d){return "повернути праворуч на"},
"turnRightTooltip":function(d){return "Повертає художника праворуч на вказаний кут."},
"turnTooltip":function(d){return "Повертає художника ліворуч або праворуч на вказану кількість градусів."},
"turtleVisibilityTooltip":function(d){return "Приховує або показує художника."},
"widthTooltip":function(d){return "Змінює ширину олівця."},
"wrongColour":function(d){return "Ваша картинка неправильного кольору. Для цього завдання вона має бути %1."}};