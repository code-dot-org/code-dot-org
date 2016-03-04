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
"blocksUsed":function(d){return "Brugte blokke: %1"},
"branches":function(d){return "grene"},
"catColour":function(d){return "Farve"},
"catControl":function(d){return "Løkker"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Funktioner"},
"catTurtle":function(d){return "Handlinger"},
"catVariables":function(d){return "Variabler"},
"catLogic":function(d){return "Logik"},
"colourTooltip":function(d){return "Ændrer farven på blyanten."},
"createACircle":function(d){return "oprette en cirkel"},
"createSnowflakeSquare":function(d){return "opret et snefnug af typen square-firkant"},
"createSnowflakeParallelogram":function(d){return "Opret et snefnug af typen parallelogram"},
"createSnowflakeLine":function(d){return "Opret et snefnug af typen linje"},
"createSnowflakeSpiral":function(d){return "Opret et snefnug af typen spiral"},
"createSnowflakeFlower":function(d){return "Opret et snefnug typen blomst"},
"createSnowflakeFractal":function(d){return "Opret et snefnug af typen fraktal"},
"createSnowflakeRandom":function(d){return "Opret et snefnug af typen tilfældige"},
"createASnowflakeBranch":function(d){return "Opret et snefnug gren"},
"degrees":function(d){return "grader"},
"depth":function(d){return "dybde"},
"dots":function(d){return "pixels"},
"drawACircle":function(d){return "tegn en cirkel"},
"drawAFlower":function(d){return "tegn en blomst"},
"drawAHexagon":function(d){return "tegn en sekskant"},
"drawAHouse":function(d){return "tegn et hus"},
"drawAPlanet":function(d){return "tegn en planet"},
"drawARhombus":function(d){return "tegn et rhombe"},
"drawARobot":function(d){return "tegn en robot"},
"drawARocket":function(d){return "tegn en raket"},
"drawASnowflake":function(d){return "tegn et snefnug"},
"drawASnowman":function(d){return "tegn en snemand"},
"drawASquare":function(d){return "tegn en firkant"},
"drawAStar":function(d){return "tegn en stjerne"},
"drawATree":function(d){return "tegn et træ"},
"drawATriangle":function(d){return "tegn en trekant"},
"drawUpperWave":function(d){return "tegn øvre bølge"},
"drawLowerWave":function(d){return "tegn lavere bølge"},
"drawStamp":function(d){return "tegne stempel"},
"heightParameter":function(d){return "højde"},
"hideTurtle":function(d){return "skjul kunstner"},
"jump":function(d){return "hop"},
"jumpBackward":function(d){return "hop baglæns ved"},
"jumpForward":function(d){return "hop fremad ved"},
"jumpTooltip":function(d){return "Flytter kunstneren uden at efterlade nogen mærker."},
"jumpEastTooltip":function(d){return "Flytter markør øst uden at efterlade spor."},
"jumpNorthTooltip":function(d){return "Flytter markør nord uden at efterlade spor."},
"jumpSouthTooltip":function(d){return "Flytter markør syd uden at efterlade spor."},
"jumpWestTooltip":function(d){return "Flytter markør vest uden at efterlade spor."},
"lengthFeedback":function(d){return "Du har lavet det rigtige, undtagen længden du flytter."},
"lengthParameter":function(d){return "længde"},
"loopVariable":function(d){return "tæller"},
"moveBackward":function(d){return "flyt bagud med"},
"moveEastTooltip":function(d){return "Flytter markøren øst."},
"moveForward":function(d){return "flyt fremad med"},
"moveForwardTooltip":function(d){return "Flytter kunstneren fremad."},
"moveNorthTooltip":function(d){return "Flytter markøren nord."},
"moveSouthTooltip":function(d){return "Flytter markøren syd."},
"moveWestTooltip":function(d){return "Flytter markøren vest."},
"moveTooltip":function(d){return "Bevæger kunstneren fremad eller bagud med et specifikt antal."},
"notBlackColour":function(d){return "Du skal angive en anden farve end sort i denne opgave."},
"numBlocksNeeded":function(d){return "Denne opgave kan løses ved brug af %1 blokke. Du brugte %2."},
"penDown":function(d){return "blyant ned"},
"penTooltip":function(d){return "Lyfter eller sænker blyanten for at starte eller stoppe tegning."},
"penUp":function(d){return "blyant op"},
"reinfFeedbackMsg":function(d){return "Her er din tegning! Fortsæt med at arbejde på den eller gå videre til næste opgave."},
"setAlpha":function(d){return "sæt alfa"},
"setColour":function(d){return "sæt farve"},
"setPattern":function(d){return "juster mønster"},
"setWidth":function(d){return "indstil bredde"},
"shareDrawing":function(d){return "Del dine tegninger:"},
"showMe":function(d){return "Vis mig"},
"showTurtle":function(d){return "Vis kunstner"},
"sizeParameter":function(d){return "størrelse"},
"step":function(d){return "trin"},
"tooFewColours":function(d){return "Du skal bruge mindst %1 forskellige farver til denne opgave. Du brugte kun %2."},
"turnLeft":function(d){return "drej til venstre med"},
"turnRight":function(d){return "drej til højre med"},
"turnRightTooltip":function(d){return "Drejer figuren til højre med en angivet vinkel."},
"turnTooltip":function(d){return "Drejer figuren  til venstre eller højre med det angivne antal grader."},
"turtleVisibilityTooltip":function(d){return "Gør kunstneren synlig eller usynlig."},
"widthTooltip":function(d){return "Ændrer bredden på blyanten."},
"wrongColour":function(d){return "Dit billede har den forkerte farve.  Til denne opgave skal det være %1."}};