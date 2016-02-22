var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "ара ұясында"},
"atFlower":function(d){return "гүлде"},
"avoidCowAndRemove":function(d){return "сиырдан қашу және 1 алып тастау"},
"continue":function(d){return "Жалғастыру"},
"dig":function(d){return "1 алып тастау"},
"digTooltip":function(d){return "1 жер қыртысын алып тастау"},
"dirE":function(d){return "Ш"},
"dirN":function(d){return "С"},
"dirS":function(d){return "О"},
"dirW":function(d){return "Б"},
"doCode":function(d){return "жасау"},
"elseCode":function(d){return "немесе"},
"fill":function(d){return "1 толтыру"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" толтыру"},
"fillStack":function(d){return maze_locale.v(d,"shovelfuls")+" саңылауды толтыру"},
"fillSquare":function(d){return "шаршыны толтыру"},
"fillTooltip":function(d){return "1 жер қыртысын қою"},
"finalLevel":function(d){return "Құттықтаймыз! Сіз соңғы басқатырғышты шештіңіз."},
"flowerEmptyError":function(d){return "Cіздегі гүлде мүлде шырын қалған жоқ."},
"get":function(d){return "алу"},
"heightParameter":function(d){return "биіктік"},
"holePresent":function(d){return "саңылау бар"},
"honey":function(d){return "бал жасау"},
"honeyAvailable":function(d){return "бал"},
"honeyTooltip":function(d){return "Шырыннан бал жасау"},
"honeycombFullError":function(d){return "Бал арасы ұясында бал сақтау үшін орын жоқ."},
"ifCode":function(d){return "егер"},
"ifInRepeatError":function(d){return "Сізге \"қайталау\" бөлшегі ішінде \"егер\" бөлшегі керек. Егер қиындықтар туса, онда қайталап көру үшін алдыңғы деңгейге оралыңыз."},
"ifPathAhead":function(d){return "егер алдыда жол болса"},
"ifTooltip":function(d){return "Егер көрсетілген бағытта жол болса, онда бірнеше іс-әрекеттер жасаңыз."},
"ifelseTooltip":function(d){return "Егер көрсетілген бағытта жол болса, онда бірінші бөлшек іс-әрекетін жасаңыз. Әйтпесе, екінші бөлшек іс-әрекетін жасаңыз."},
"ifFlowerTooltip":function(d){return "Егер көрсетілген бағытта гүл/балауыз болса, онда бірнеше іс-әрекеттер жасаңыз."},
"ifOnlyFlowerTooltip":function(d){return "Егер көрсетілген бағытта гүл болса, онда бірнеше іс-әрекеттер жасаңыз."},
"ifelseFlowerTooltip":function(d){return "Егер көрсетілген бағытта гүл/балауыз болса, онда бірінші бөлшек іс-әрекетін жасаңыз. Әйтпесе, екінші бөлшек іс-әрекетін жасаңыз."},
"insufficientHoney":function(d){return "Сіз барлық дұрыс бөлшектерді пайдаландыңыз, бірақ сізге керекті мөлшерде бал жинау керек."},
"insufficientNectar":function(d){return "Сіз барлық дұрыс бөлшектерді пайдаландыңыз, бірақ сізге керекті мөлшерде шырын жинау керек."},
"make":function(d){return "жасау"},
"moveBackward":function(d){return "артқа қозғалу"},
"moveEastTooltip":function(d){return "Мені шығысқа қарай бір орынға жылжыту."},
"moveForward":function(d){return "алдыға қозғалу"},
"moveForwardTooltip":function(d){return "Мені алдыға қарай бір орынға жылжыту."},
"moveNorthTooltip":function(d){return "Мені солтүстікке қарай бір орынға жылжыту."},
"moveSouthTooltip":function(d){return "Мені оңтүстікке қарай бір орынға жылжыту."},
"moveTooltip":function(d){return "Мені алдыға/артқа қарай бір орынға жылжыту"},
"moveWestTooltip":function(d){return "Мені батысқа қарай бір орынға жылжыту."},
"nectar":function(d){return "шырынды алу"},
"nectarRemaining":function(d){return "шырын"},
"nectarTooltip":function(d){return "Гүлден шырын алу"},
"nextLevel":function(d){return "Құттықтаймыз! Сіз бұл басқатырғышты шештіңіз."},
"no":function(d){return "Жоқ"},
"noPathAhead":function(d){return "жол жабылған"},
"noPathLeft":function(d){return "солға қарай жол жоқ"},
"noPathRight":function(d){return "оңға қарай жол жоқ"},
"notAtFlowerError":function(d){return "Сіз гүлден ғана шырын ала аласыз."},
"notAtHoneycombError":function(d){return "Сіз тек бал арасы ұясында ғана бал жасай аласыз."},
"numBlocksNeeded":function(d){return "Бұл басқатырғыш %1 бөлшекпен шешілуі мүмкін."},
"pathAhead":function(d){return "алдағы жол"},
"pathLeft":function(d){return "егер солға қарай жол болса"},
"pathRight":function(d){return "егер оңға қарай жол болса"},
"pilePresent":function(d){return "үйінді бар"},
"putdownTower":function(d){return "мұнара орнату"},
"removeAndAvoidTheCow":function(d){return "1 алып тастау және сиырдан қашу"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+" алып тастау"},
"removePile":function(d){return "үйіндіні алып тастау"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+" үйіндіден алып тастау"},
"removeSquare":function(d){return "шаршыны алып тастау"},
"repeatCarefullyError":function(d){return "Бұны шешу барысында, \"қайталау\" бөлшегіндегі екі орынға жылжу және бұрылу үлгісі туралы жақсылап ойланыңыз. Бұл ойын соңында қосымша жүріс алуға мүмкіндік береді."},
"repeatUntil":function(d){return "қайталау"},
"repeatUntilBlocked":function(d){return "алдыңғы жол"},
"repeatUntilFinish":function(d){return "аяқталғанша қайталау"},
"step":function(d){return "Қадам"},
"totalHoney":function(d){return "бал саны"},
"totalNectar":function(d){return "шырын саны"},
"turnLeft":function(d){return "солға бұрылу"},
"turnRight":function(d){return "оңға бұрылу"},
"turnTooltip":function(d){return "Мені 90 градусқа солға немесе оңға бұру."},
"uncheckedCloudError":function(d){return "Барлық бұлттарды гүл немесе бал арасы бар екендігіне тексеріңіз."},
"uncheckedPurpleError":function(d){return "Барлық күлгін гүлдерді шырын бар екендігіне тексеріңіз"},
"whileMsg":function(d){return "болған кезде "},
"whileTooltip":function(d){return "Біріккен іс-әрекеттер аяқталғанша қайталаңыз."},
"word":function(d){return "Сөзді табу"},
"yes":function(d){return "Иә"},
"youSpelled":function(d){return "Сіздің жазғаныңыз"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};