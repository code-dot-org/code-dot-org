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
"blocksUsed":function(d){return "Пайдаланылған бөлшек: %1"},
"branches":function(d){return "бұтақтар"},
"catColour":function(d){return "Түс"},
"catControl":function(d){return "Ілмек"},
"catMath":function(d){return "Математика"},
"catProcedures":function(d){return "Functions"},
"catTurtle":function(d){return "Іс-әрекеттер"},
"catVariables":function(d){return "Айнымалылар"},
"catLogic":function(d){return "Логика"},
"colourTooltip":function(d){return "Қарындаш түсін өзгерту."},
"createACircle":function(d){return "шеңбер жасау"},
"createSnowflakeSquare":function(d){return "шаршы түріндегі қар ұшқынын жасау"},
"createSnowflakeParallelogram":function(d){return "параллелограмм түріндегі қар ұшқынын жасау"},
"createSnowflakeLine":function(d){return "сызық түріндегі қар ұшқынын жасау"},
"createSnowflakeSpiral":function(d){return "спираль түріндегі қар ұшқынын жасау"},
"createSnowflakeFlower":function(d){return "гүл түріндегі қар ұшқынын жасау"},
"createSnowflakeFractal":function(d){return "фрактал түріндегі қар ұшқынын жасау"},
"createSnowflakeRandom":function(d){return "кездейсоқ түрдегі қар ұшқынын жасау"},
"createASnowflakeBranch":function(d){return "тармақ түріндегі қар ұшқынын жасау"},
"degrees":function(d){return "градус"},
"depth":function(d){return "тереңдік"},
"dots":function(d){return "пиксел"},
"drawACircle":function(d){return "Шеңбер салу"},
"drawAFlower":function(d){return "гүл салу"},
"drawAHexagon":function(d){return "алтыбұрыш салу"},
"drawAHouse":function(d){return "үй салу"},
"drawAPlanet":function(d){return "планета салу"},
"drawARhombus":function(d){return "ромб салу"},
"drawARobot":function(d){return "робот салу"},
"drawARocket":function(d){return "рокета салу"},
"drawASnowflake":function(d){return "қар бүршігін салу"},
"drawASnowman":function(d){return "аққала салу"},
"drawASquare":function(d){return "төртбұрыш салу"},
"drawAStar":function(d){return "жұлдыз салу"},
"drawATree":function(d){return "ағаш салу"},
"drawATriangle":function(d){return "үшбұрыш салу"},
"drawUpperWave":function(d){return "жоғарғы толқын салу"},
"drawLowerWave":function(d){return "төменгі толқын салу"},
"drawStamp":function(d){return "мөр салу"},
"heightParameter":function(d){return "биіктік"},
"hideTurtle":function(d){return "ойыншыны жасыру"},
"jump":function(d){return "секіру"},
"jumpBackward":function(d){return "артқа қарай секіру"},
"jumpForward":function(d){return "алдыға қарай секіру"},
"jumpTooltip":function(d){return "Ешқандай белгі қалдырмастан ойыншыны қозғалту."},
"jumpEastTooltip":function(d){return "Ешқандай белгі қалдырмастан ойыншыны шығысқа қарай қозғалту."},
"jumpNorthTooltip":function(d){return "Ешқандай белгі қалдырмастан ойыншыны солтүстікке қарай қозғалту."},
"jumpSouthTooltip":function(d){return "Ешқандай белгі қалдырмастан ойыншыны оңтүстікке қарай қозғалту."},
"jumpWestTooltip":function(d){return "Ешқандай белгі қалдырмастан ойыншыны батысқа қарай қозғалту."},
"lengthFeedback":function(d){return "Cіз қозғалу ұзындығынан басқасына қол жеткіздіңіз."},
"lengthParameter":function(d){return "ұзындық"},
"loopVariable":function(d){return "санағыш"},
"moveBackward":function(d){return "артқа қарай қозғалту"},
"moveEastTooltip":function(d){return "Ойыншыны шығысқа қарай қозғалту."},
"moveForward":function(d){return "алдыға қарай қозғалту"},
"moveForwardTooltip":function(d){return "Ойыншыны алдыға қарай қозғалту."},
"moveNorthTooltip":function(d){return "Ойыншыны солтүстікке қарай қозғалту."},
"moveSouthTooltip":function(d){return "Ойыншыны оңтүстікке қарай қозғалту."},
"moveWestTooltip":function(d){return "Ойыншыны батысқа қарай қозғалту."},
"moveTooltip":function(d){return "Ойыншыны берілген сан мөлшерінде алдыға немесе артқа қарай қозғалту."},
"notBlackColour":function(d){return "Сізге бұл басқатырғыш үшін, қара түстен басқа түсті таңдауыңыз керек."},
"numBlocksNeeded":function(d){return "Бұл басқатырғышты %1 бөлшекпен шешуге болады. Сіз %2 бөлшекті пайдаландыңыз."},
"penDown":function(d){return "қарындашты түсіру"},
"penTooltip":function(d){return "Сурет салу немесе тоқтату үшін тиісінше түсіріңіз немесе көтеріңіз."},
"penUp":function(d){return "қарындашты көтеру"},
"reinfFeedbackMsg":function(d){return "Сіздің салған суретіңіз! Сурет салуды жалғастырыңыз немесе келесі басқатырғышты бастаңыз."},
"setAlpha":function(d){return "альфаны орнату"},
"setColour":function(d){return "түсті орнату"},
"setPattern":function(d){return "үлгіні орнату"},
"setWidth":function(d){return "еніy орнату"},
"shareDrawing":function(d){return "Суретпен бөлісіңіз:"},
"showMe":function(d){return "Маған көрсетіңіз"},
"showTurtle":function(d){return "ойыншыны көрсету"},
"sizeParameter":function(d){return "шама"},
"step":function(d){return "қадам"},
"tooFewColours":function(d){return "Бұл басқатырғыш үшін сіз %1 кем әртүрлі түстерді пайдалануыңыз керек. Сіз тек %2 ғана пайдаландыңыз."},
"turnLeft":function(d){return "солға қарай"},
"turnRight":function(d){return "оңға қарай"},
"turnRightTooltip":function(d){return "Ойыншыны берілген бұрышқа оңға бұрыңыз."},
"turnTooltip":function(d){return "Берілген бұрыш мөлшерінде ойыншыны оңға немесе солға қарай бұру."},
"turtleVisibilityTooltip":function(d){return "Ойыншыны көрінетін немесе көрінбейтін қылу."},
"widthTooltip":function(d){return "Қарындаш енін өзгерту."},
"wrongColour":function(d){return "Сіз қате түс таңдадыңыз. Бұл басқатырғыш үшін %1 керек."}};