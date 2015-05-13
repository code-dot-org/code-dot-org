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
"blocksUsed":function(d){return "Използвани блокове: %1"},
"branches":function(d){return "заготовки"},
"catColour":function(d){return "Цвят"},
"catControl":function(d){return "Повторения"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функции"},
"catTurtle":function(d){return "Действия"},
"catVariables":function(d){return "Променливи"},
"catLogic":function(d){return "Логика"},
"colourTooltip":function(d){return "Променя цвета на молива."},
"createACircle":function(d){return "създайте кръг"},
"createSnowflakeSquare":function(d){return "създаване на снежинка с основа квадрат"},
"createSnowflakeParallelogram":function(d){return "създаване на снежинка с основа успоредник"},
"createSnowflakeLine":function(d){return "създаване на снежинка на основата на линия"},
"createSnowflakeSpiral":function(d){return "създаване на снежинка от тип спирала"},
"createSnowflakeFlower":function(d){return "създаване на снежинка от тип цвете"},
"createSnowflakeFractal":function(d){return "създаване на снежинка от тип фрактали"},
"createSnowflakeRandom":function(d){return "Създайте снежинка от случаен тип"},
"createASnowflakeBranch":function(d){return "създаване клонче на снежинка"},
"degrees":function(d){return "градуса"},
"depth":function(d){return "дълбочина"},
"dots":function(d){return "пиксели"},
"drawASquare":function(d){return "чертае квадрат"},
"drawATriangle":function(d){return "чертае триъгълник"},
"drawACircle":function(d){return "чертае кръг"},
"drawAFlower":function(d){return "чертае цвете"},
"drawAHexagon":function(d){return "чертае шестоъгълник"},
"drawAHouse":function(d){return "рисува къща"},
"drawAPlanet":function(d){return "рисува планета"},
"drawARhombus":function(d){return "чертае ромб"},
"drawARobot":function(d){return "рисува робот"},
"drawARocket":function(d){return "рисува ракета"},
"drawASnowflake":function(d){return "рисува снежинка"},
"drawASnowman":function(d){return "рисува снежен човек"},
"drawAStar":function(d){return "рисува звезда"},
"drawATree":function(d){return "рисува дърво"},
"drawUpperWave":function(d){return "рисува горната вълна"},
"drawLowerWave":function(d){return "рисува долна вълна"},
"drawStamp":function(d){return "начертайте щампа"},
"heightParameter":function(d){return "височина"},
"hideTurtle":function(d){return "скрива художника"},
"jump":function(d){return "скок"},
"jumpBackward":function(d){return "скок назад с"},
"jumpForward":function(d){return "скок напред с"},
"jumpTooltip":function(d){return "Премества художника без да оставя никакви следи."},
"jumpEastTooltip":function(d){return "Премества художника на изток без да оставя следи."},
"jumpNorthTooltip":function(d){return "Премества художникът на север без да оставя следи."},
"jumpSouthTooltip":function(d){return "Премества художника на изток без да оставя следи."},
"jumpWestTooltip":function(d){return "Премества художникът на север без да оставя следи."},
"lengthFeedback":function(d){return "Вие го правите правилно с изключение на дължината на преместване."},
"lengthParameter":function(d){return "дължина"},
"loopVariable":function(d){return "брояч"},
"moveBackward":function(d){return "премества назад с"},
"moveEastTooltip":function(d){return "Премества художника на изток."},
"moveForward":function(d){return "премества напред с"},
"moveForwardTooltip":function(d){return "Премества художника напред."},
"moveNorthTooltip":function(d){return "Премества художника на север."},
"moveSouthTooltip":function(d){return "Премества художника на юг."},
"moveWestTooltip":function(d){return "Премества художника на запад."},
"moveTooltip":function(d){return "Премества художника напред или назад на зададеното разстояние."},
"notBlackColour":function(d){return "Трябва да зададете цвят различен от черен за този пъзел."},
"numBlocksNeeded":function(d){return "Този пъзел може да бъде решен с %1 блокове.  Вие използвахте %2."},
"penDown":function(d){return "молив надолу"},
"penTooltip":function(d){return "Вдига или сваля молива, за да започнете или да спрете да чертаете."},
"penUp":function(d){return "молив нагоре"},
"reinfFeedbackMsg":function(d){return "Тук е вашата рисунка! Продължете да работите върху нея или преминете към следващия пъзел."},
"setColour":function(d){return "задава цвят"},
"setPattern":function(d){return "определен шаблон"},
"setWidth":function(d){return "задава дебелина"},
"shareDrawing":function(d){return "Споделете вашата рисунка:"},
"showMe":function(d){return "Покажи ми"},
"showTurtle":function(d){return "показва художника"},
"sizeParameter":function(d){return "размер"},
"step":function(d){return "стъпка"},
"tooFewColours":function(d){return "Трябва да използвате поне %1 различни цветове за този пъзел. Използвали сте само %2."},
"turnLeft":function(d){return "завърта наляво на"},
"turnRight":function(d){return "завърта надясно на"},
"turnRightTooltip":function(d){return "Завърта художника надясно на определен ъгъл."},
"turnTooltip":function(d){return "Завърта художника наляво или надясно на определен ъгъл."},
"turtleVisibilityTooltip":function(d){return "Прави художника видим или невидим."},
"widthTooltip":function(d){return "Променя дебелината на молива."},
"wrongColour":function(d){return "Вашата картина е в грешен цвят. За този пъзел, тя трябва да е %1."}};