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
"blocksUsed":function(d){return "Använda block: %1"},
"branches":function(d){return "grenar"},
"catColour":function(d){return "Färg"},
"catControl":function(d){return "loopar"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "funktioner"},
"catTurtle":function(d){return "Åtgärder"},
"catVariables":function(d){return "variabler"},
"catLogic":function(d){return "Logik"},
"colourTooltip":function(d){return "Ändrar färgen på pennan."},
"createACircle":function(d){return "skapa en cirkel"},
"createSnowflakeSquare":function(d){return "skapa en snöflinga av typen kvadrat"},
"createSnowflakeParallelogram":function(d){return "skapa en snöflinga av typen parallellogram"},
"createSnowflakeLine":function(d){return "skapa en snöflinga av typen linje"},
"createSnowflakeSpiral":function(d){return "skapa en snöflinga av typen spiral"},
"createSnowflakeFlower":function(d){return "skapa en snöflinga av typen blomma"},
"createSnowflakeFractal":function(d){return "skapa en snöflinga av typen fraktal"},
"createSnowflakeRandom":function(d){return "skapa en snöflinga av typen slumpmässig"},
"createASnowflakeBranch":function(d){return "skapa en snöflinge-gren"},
"degrees":function(d){return "grader"},
"depth":function(d){return "djup"},
"dots":function(d){return "pixlar"},
"drawACircle":function(d){return "rita en circel"},
"drawAFlower":function(d){return "rita en blomma"},
"drawAHexagon":function(d){return "rita en hexagon"},
"drawAHouse":function(d){return "rita ett hus"},
"drawAPlanet":function(d){return "rita en planet"},
"drawARhombus":function(d){return "rita en romb"},
"drawARobot":function(d){return "rita en robot"},
"drawARocket":function(d){return "rita en raket"},
"drawASnowflake":function(d){return "rita en snöflinga"},
"drawASnowman":function(d){return "rita en snögubbe"},
"drawASquare":function(d){return "rita en kvadrat"},
"drawAStar":function(d){return "rita en stjärna"},
"drawATree":function(d){return "Rita ett träd"},
"drawATriangle":function(d){return "rita en triangel"},
"drawUpperWave":function(d){return "rita övre våg"},
"drawLowerWave":function(d){return "rita nedre vågen"},
"drawStamp":function(d){return "Rita stämpel"},
"heightParameter":function(d){return "höjd"},
"hideTurtle":function(d){return "dölj konstnär"},
"jump":function(d){return "hoppa"},
"jumpBackward":function(d){return "hoppa bakåt med"},
"jumpForward":function(d){return "hoppa framåt med"},
"jumpTooltip":function(d){return "Flyttar konstnären utan att lämna några spår."},
"jumpEastTooltip":function(d){return "Flyttar konstnären åt öster utan att lämna några märken."},
"jumpNorthTooltip":function(d){return "Flyttar konstnären åt norr utan att lämna några märken."},
"jumpSouthTooltip":function(d){return "Flyttar konstnären åt söder utan att lämna några märken."},
"jumpWestTooltip":function(d){return "Flyttar konstnären åt väster utan att lämna några märken."},
"lengthFeedback":function(d){return "Det blev rätt, förutom hur långt det ska flyttas."},
"lengthParameter":function(d){return "längd"},
"loopVariable":function(d){return "räknare"},
"moveBackward":function(d){return "gå bakåt med"},
"moveEastTooltip":function(d){return "Flyttar konstnären österut."},
"moveForward":function(d){return "gå framåt med"},
"moveForwardTooltip":function(d){return "Flyttar konstnären framåt."},
"moveNorthTooltip":function(d){return "Flyttar konstnären norrut."},
"moveSouthTooltip":function(d){return "Flyttar konstnären söderut."},
"moveWestTooltip":function(d){return "Flyttar konstnären västerut."},
"moveTooltip":function(d){return "Flyttar konstnären framåt eller bakåt med den angivna mängden."},
"notBlackColour":function(d){return "Du måste ange en annan färg än svart för detta pusslet."},
"numBlocksNeeded":function(d){return "Detta pussel kan lösas med %1 block.  Du har använt %2."},
"penDown":function(d){return "Sänk pennan"},
"penTooltip":function(d){return "Lyfter eller sänker pennan, för att börja eller sluta rita."},
"penUp":function(d){return "lyft pennan"},
"reinfFeedbackMsg":function(d){return "Här är din teckning! Fortsätt jobba med den eller gå vidare till nästa pussel."},
"setAlpha":function(d){return "sätt alfa"},
"setColour":function(d){return "Ställ in färg"},
"setPattern":function(d){return "Ställ in mönster"},
"setWidth":function(d){return "Ställ in bredd"},
"shareDrawing":function(d){return "Dela din teckning:"},
"showMe":function(d){return "Visa mig"},
"showTurtle":function(d){return "Visa konstnär"},
"sizeParameter":function(d){return "storlek"},
"step":function(d){return "steg"},
"tooFewColours":function(d){return "Du måste använda minst %1 olika färger för detta pussel. Du använde bara %2."},
"turnLeft":function(d){return "sväng vänster med"},
"turnRight":function(d){return "sväng höger med"},
"turnRightTooltip":function(d){return "Svänger konstnären höger med en viss vinkel."},
"turnTooltip":function(d){return "Svänger konstnären vänster eller höger med en viss vinkel i grader."},
"turtleVisibilityTooltip":function(d){return "Gör konstnären synlig/osynlig."},
"widthTooltip":function(d){return "Ändrar tjockleken på pennan."},
"wrongColour":function(d){return "Din bild är i fel färg. För det här pusslet måste den vara %1."}};