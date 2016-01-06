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
"blocksUsed":function(d){return "Коришћени блокови:%1"},
"branches":function(d){return "гране"},
"catColour":function(d){return "Боја"},
"catControl":function(d){return "Петље"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Функције"},
"catTurtle":function(d){return "Акције"},
"catVariables":function(d){return "Променљиве"},
"catLogic":function(d){return "Логика"},
"colourTooltip":function(d){return "Мења боју оловке."},
"createACircle":function(d){return "направи круг"},
"createSnowflakeSquare":function(d){return "направите пахуљицу у облику квадрата"},
"createSnowflakeParallelogram":function(d){return "направите пахуљицу у облику паралелограма"},
"createSnowflakeLine":function(d){return "направите пахуљицу у облику линије"},
"createSnowflakeSpiral":function(d){return "направите пахуљицу у облику спирале"},
"createSnowflakeFlower":function(d){return "направите пахуљицу у облику цвета"},
"createSnowflakeFractal":function(d){return "направите пахуљицу у облику фрактала"},
"createSnowflakeRandom":function(d){return "направите пахуљицу случајног облика"},
"createASnowflakeBranch":function(d){return "направи грану пахуљице"},
"degrees":function(d){return "степени"},
"depth":function(d){return "дубина"},
"dots":function(d){return "пиксели"},
"drawACircle":function(d){return "нацртај круг"},
"drawAFlower":function(d){return "нацртајте цвет"},
"drawAHexagon":function(d){return "нацртајте шестоугао"},
"drawAHouse":function(d){return "нацртај кућу"},
"drawAPlanet":function(d){return "нацртајте планету"},
"drawARhombus":function(d){return "нацртајте ромб (дијамант)"},
"drawARobot":function(d){return "нацртајте робота"},
"drawARocket":function(d){return "нацртајте ракету"},
"drawASnowflake":function(d){return "нацртајте пахуљицу"},
"drawASnowman":function(d){return "нацртај Снешка Белића"},
"drawASquare":function(d){return "нацртај коцку"},
"drawAStar":function(d){return "нацртајте звезду"},
"drawATree":function(d){return "Нацртај дрво"},
"drawATriangle":function(d){return "нацртај троугао"},
"drawUpperWave":function(d){return "нацртајте горњи талас"},
"drawLowerWave":function(d){return "нацртајте доњи талас"},
"drawStamp":function(d){return "нацртајте печат"},
"heightParameter":function(d){return "висина"},
"hideTurtle":function(d){return "сакриј аутора"},
"jump":function(d){return "скок"},
"jumpBackward":function(d){return "скоћи назад за"},
"jumpForward":function(d){return "скоћи напред за"},
"jumpTooltip":function(d){return "Помера уметника без да остави трагове."},
"jumpEastTooltip":function(d){return "Померите уметника источно а да не оставите никакав траг."},
"jumpNorthTooltip":function(d){return "Померите уметника северно а да не оставите никакав траг."},
"jumpSouthTooltip":function(d){return "Померите уметника јужно а да не оставите никакав траг."},
"jumpWestTooltip":function(d){return "Померите уметника западно а да не оставите никакав траг."},
"lengthFeedback":function(d){return "Успешно извршено осим дужине помицања."},
"lengthParameter":function(d){return "дужина"},
"loopVariable":function(d){return "бројач"},
"moveBackward":function(d){return "помери назад за"},
"moveEastTooltip":function(d){return "Померите уметника источно."},
"moveForward":function(d){return "помери напред за"},
"moveForwardTooltip":function(d){return "Помера уметника напред."},
"moveNorthTooltip":function(d){return "Померите уметника ка северу."},
"moveSouthTooltip":function(d){return "Померите уметника ка југу."},
"moveWestTooltip":function(d){return "Померите уметника ка западу."},
"moveTooltip":function(d){return "Помера уметника напред или назад за одређени износ."},
"notBlackColour":function(d){return "Морате поставити боју која није црна за ову пузлу."},
"numBlocksNeeded":function(d){return "Ова пузла се може решити са %1 блоком. Можете користити %2."},
"penDown":function(d){return "Спусти оловку"},
"penTooltip":function(d){return "листа лјубителја оловке, да почну или престану цртати."},
"penUp":function(d){return "Узми оловку"},
"reinfFeedbackMsg":function(d){return "Овде је Ваш цртеж! Наставите да радите на њему или наставите даље."},
"setAlpha":function(d){return "поставите алфа"},
"setColour":function(d){return "постави боју"},
"setPattern":function(d){return "поставите шаблон"},
"setWidth":function(d){return "постави ширину"},
"shareDrawing":function(d){return "Подели свој цртеж:"},
"showMe":function(d){return "Покажи"},
"showTurtle":function(d){return "покажи уметника"},
"sizeParameter":function(d){return "dimenzija"},
"step":function(d){return "корак"},
"tooFewColours":function(d){return "Морате користити барем %1 другачију боје за ову слагалицу. Ви сте користили само %2."},
"turnLeft":function(d){return "скрени лево за"},
"turnRight":function(d){return "скрени десно за"},
"turnRightTooltip":function(d){return "Закреће уметника удесно за одређени угао."},
"turnTooltip":function(d){return "Закреће уметника улево или удесно за одређени број степени."},
"turtleVisibilityTooltip":function(d){return "Чини уметника видлјивим или невидлјивим."},
"widthTooltip":function(d){return "Менја ширину оловке."},
"wrongColour":function(d){return "Ваша је слика погрешне боје. За пузлу, мора бити %1."}};