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
"blocksUsed":function(d){return "Mga blokeng nagamit: %1"},
"branches":function(d){return "mga sanga"},
"catColour":function(d){return "Kulay"},
"catControl":function(d){return "Mga loop"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Mga function"},
"catTurtle":function(d){return "Mga aksyon"},
"catVariables":function(d){return "Mga variable"},
"catLogic":function(d){return "Lohika"},
"colourTooltip":function(d){return "Napalitan ang kulay ng lapis."},
"createACircle":function(d){return "gumawa ng bilog"},
"createSnowflakeSquare":function(d){return "lumikha ng isang snowflake na uri ng parisukat"},
"createSnowflakeParallelogram":function(d){return "lumikha ng isang snowflake na uri ng paralelogram"},
"createSnowflakeLine":function(d){return "lumikha ng isang snowflake na uri ng line"},
"createSnowflakeSpiral":function(d){return "lumikha ng isang Snowflake na uri ng spiral"},
"createSnowflakeFlower":function(d){return "lumikha ng isang snowflake na uri ng bulaklak"},
"createSnowflakeFractal":function(d){return "lumikha ng isang snowflake na uri fractal"},
"createSnowflakeRandom":function(d){return "lumikha ng isang snowflake na uri ng random"},
"createASnowflakeBranch":function(d){return "lumikha ng isang snowflake branch"},
"degrees":function(d){return "degrees"},
"depth":function(d){return "kalalim"},
"dots":function(d){return "pixels"},
"drawASquare":function(d){return "gumuhit ng parisukat"},
"drawATriangle":function(d){return "gumuhit ng tatsulok"},
"drawACircle":function(d){return "gumuhit ng bilog"},
"drawAFlower":function(d){return "gumuhit ng bulaklak"},
"drawAHexagon":function(d){return "gumuhit ng hexagon"},
"drawAHouse":function(d){return "gumuhit ng bahay"},
"drawAPlanet":function(d){return "gumuhit ng planeta"},
"drawARhombus":function(d){return "gumuhit ng rhombus"},
"drawARobot":function(d){return "gumuhit ng robot"},
"drawARocket":function(d){return "gumuhit ng rocket"},
"drawASnowflake":function(d){return "gumuhit ng snowflake"},
"drawASnowman":function(d){return "gumuhit ng taong niyebe"},
"drawAStar":function(d){return "gumuhit ng bituin"},
"drawATree":function(d){return "gumuhit ng puno"},
"drawUpperWave":function(d){return "gumuhit ng upper wave"},
"drawLowerWave":function(d){return "gumuhit ng lower wave"},
"drawStamp":function(d){return "gumuhit ng stamp"},
"heightParameter":function(d){return "taas"},
"hideTurtle":function(d){return "itago ang tagalikha"},
"jump":function(d){return "talon"},
"jumpBackward":function(d){return "tumalon paatras sa pamamagitan ng"},
"jumpForward":function(d){return "tumalon paabante sa pamamagitan ng"},
"jumpTooltip":function(d){return "Inililipat ang artist nang hindi nagiiwan ng anumang marka."},
"jumpEastTooltip":function(d){return "Inililipat ang artist sa silangan nang hindi nagiiwan ng anumang marka."},
"jumpNorthTooltip":function(d){return "Inililipat ang artist sa hilaga nang hindi nagiiwan ng anumang marka."},
"jumpSouthTooltip":function(d){return "Inililipat ang artist sa timog nang hindi nagiiwan ng anumang marka."},
"jumpWestTooltip":function(d){return "Inililipat ang artist sa kanluran nang hindi nagiiwan ng anumang marka."},
"lengthFeedback":function(d){return "tama ka maliban sa haba ng pagsulong."},
"lengthParameter":function(d){return "haba"},
"loopVariable":function(d){return "taga pag bilang"},
"moveBackward":function(d){return "umatras ng"},
"moveEastTooltip":function(d){return "Inililipat ang artist sa silangan."},
"moveForward":function(d){return "umabante ng"},
"moveForwardTooltip":function(d){return "Inililipat ang artist pasulong."},
"moveNorthTooltip":function(d){return "Inililipat ang artist sa hilaga."},
"moveSouthTooltip":function(d){return "Inililipat ang artist sa timog."},
"moveWestTooltip":function(d){return "Inililipat ang artist sa kanluran."},
"moveTooltip":function(d){return "Inililipat ang artist pasulong o paatras sa pamamagitan ng mga tinukoy na halaga."},
"notBlackColour":function(d){return "Kailangan mong i- set ang kulay maliban sa itim para sa palaisipan ."},
"numBlocksNeeded":function(d){return "Ang palaisipan ay maaaring malutas sa %1 block . Gumamit ka ng %2 ."},
"penDown":function(d){return "Ibaba ang lapis"},
"penTooltip":function(d){return "Iangat o ibaba ang lapis, pag mag-uumpisa o hihinto sa pag-guhit."},
"penUp":function(d){return "Itaas ang lapis"},
"reinfFeedbackMsg":function(d){return "Narito ang iyong mga guhit ! Panatilihin ang paggawa dito o magpatuloy sa susunod na palaisipan ."},
"setColour":function(d){return "itakda ang kulay"},
"setPattern":function(d){return "i-set ang pattern"},
"setWidth":function(d){return "Itakda ang lapad"},
"shareDrawing":function(d){return "Ibahagi ang iyong iginuhit:"},
"showMe":function(d){return "Ipakita sa akin"},
"showTurtle":function(d){return "Ipakita ang tagalikha"},
"sizeParameter":function(d){return "sukat"},
"step":function(d){return "hakbang"},
"tooFewColours":function(d){return "Kailangan mong gumamit ng %1 iba't ibang kulay para sa puzzle na ito. Ikaw ay gumamit lamang ng %2."},
"turnLeft":function(d){return "lumiko pakaliwa sa pamamagitan ng"},
"turnRight":function(d){return "lumiko pakanan ng"},
"turnRightTooltip":function(d){return "Pagliko ng artist pakanan ayon sa itinakdang anggulo."},
"turnTooltip":function(d){return "Pagliko ng artist pakaliwa o pakanan ayon sa itinakdang bilang ng degrees."},
"turtleVisibilityTooltip":function(d){return "Ipakita o huwag ipakita ang artist."},
"widthTooltip":function(d){return "Pagbabago ng lapad ng lapis."},
"wrongColour":function(d){return "Ang iyong larawan ay mali ang kulay. Para sa puzzle na ito ang kailangan ay %1."}};