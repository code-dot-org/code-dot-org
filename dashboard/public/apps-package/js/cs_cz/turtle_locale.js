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
"blocksUsed":function(d){return "Použité bloky: %1"},
"branches":function(d){return "větvení"},
"catColour":function(d){return "Barva"},
"catControl":function(d){return "smyčky"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "Funkce"},
"catTurtle":function(d){return "akce"},
"catVariables":function(d){return "Proměnné"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Změní barvu tužky."},
"createACircle":function(d){return "vytvořte kružnici"},
"createSnowflakeSquare":function(d){return "vytvořit vločku typu čtverec"},
"createSnowflakeParallelogram":function(d){return "vytvořte vločku typu rovnoběžník"},
"createSnowflakeLine":function(d){return "vytvořit vločku typu čára"},
"createSnowflakeSpiral":function(d){return "vytvořit vločku typu spirála"},
"createSnowflakeFlower":function(d){return "vytvořit vločku typu květina"},
"createSnowflakeFractal":function(d){return "vytvořit vločku typu fraktál"},
"createSnowflakeRandom":function(d){return "vytvořit vločku náhodného typu"},
"createASnowflakeBranch":function(d){return "vytvořte větev vločka"},
"degrees":function(d){return "stupňů"},
"depth":function(d){return "hloubka"},
"dots":function(d){return "pixely"},
"drawACircle":function(d){return "nakreslete kružnici"},
"drawAFlower":function(d){return "nakreslete květinu"},
"drawAHexagon":function(d){return "nakreslete šestiúhelník"},
"drawAHouse":function(d){return "nakresli dům"},
"drawAPlanet":function(d){return "nakreslete planetu"},
"drawARhombus":function(d){return "nakreslete kosočtverec"},
"drawARobot":function(d){return "nakreslete robota"},
"drawARocket":function(d){return "nakreslete raketu"},
"drawASnowflake":function(d){return "nakreslete sněhovou vločku"},
"drawASnowman":function(d){return "nakreslete sněhuláka"},
"drawASquare":function(d){return "nakreslete čtverec"},
"drawAStar":function(d){return "nakreslete hvězdu"},
"drawATree":function(d){return "nakreslete strom"},
"drawATriangle":function(d){return "nakresli trojúhelník"},
"drawUpperWave":function(d){return "nakreslete vrchní vlnku"},
"drawLowerWave":function(d){return "nakreslete dolní vlnku"},
"drawStamp":function(d){return "nakreslete razítko"},
"heightParameter":function(d){return "výška"},
"hideTurtle":function(d){return "skryjte malíře"},
"jump":function(d){return "skoč"},
"jumpBackward":function(d){return "skoč zpět o"},
"jumpForward":function(d){return "skoč vpřed o"},
"jumpTooltip":function(d){return "Posuny malíře bez zanechání stopy."},
"jumpEastTooltip":function(d){return "Posuny malíře na východ bez zanechání stopy."},
"jumpNorthTooltip":function(d){return "Posuny malíře na sever bez zanechání stopy."},
"jumpSouthTooltip":function(d){return "Posuny malíře na jih bez zanechání stopy."},
"jumpWestTooltip":function(d){return "Posuny malíře na západ bez zanechání stopy."},
"lengthFeedback":function(d){return "Máš to správně kromě délky pohybu."},
"lengthParameter":function(d){return "Délka"},
"loopVariable":function(d){return "Sčítač"},
"moveBackward":function(d){return "posun zpět o"},
"moveEastTooltip":function(d){return "Posuny malíře na východ."},
"moveForward":function(d){return "posun vpřed o"},
"moveForwardTooltip":function(d){return "Posuny malíře vpřed."},
"moveNorthTooltip":function(d){return "Posuny malíře na sever."},
"moveSouthTooltip":function(d){return "Posuny malíře na jih."},
"moveWestTooltip":function(d){return "Posuny malíře na západ."},
"moveTooltip":function(d){return "Posuny malíře vpřed či vzad o zadanou hodnotu."},
"notBlackColour":function(d){return "V této hádance je třeba nastavit jinou barvu než černou."},
"numBlocksNeeded":function(d){return "Tato hádanka může být vyřešena s %1 bloky.  Použil jsi %2."},
"penDown":function(d){return "položit tužku"},
"penTooltip":function(d){return "Přiložit či odložit tužku, začít nebo přestat kreslit."},
"penUp":function(d){return "odložit tužku"},
"reinfFeedbackMsg":function(d){return "Tady je tvoje kresba! Můžeš na ní dál pracovat nebo pokračovat k další hádance."},
"setAlpha":function(d){return "nastavení alfa"},
"setColour":function(d){return "nastav barvu"},
"setPattern":function(d){return "nastavte vzorek"},
"setWidth":function(d){return "nastav šířku"},
"shareDrawing":function(d){return "Sdílej svojí kresbu:"},
"showMe":function(d){return "Ukažte mi"},
"showTurtle":function(d){return "zobrazit umělce"},
"sizeParameter":function(d){return "velikost"},
"step":function(d){return "krok"},
"tooFewColours":function(d){return "V této hádance je třeba použít alespoň %1 různých barev. Nyní jsi použil pouze %2."},
"turnLeft":function(d){return "otočit vlevo o"},
"turnRight":function(d){return "otoč vpravo o"},
"turnRightTooltip":function(d){return "Otočit malíře vpravo o zadaný úhel."},
"turnTooltip":function(d){return "Otočit malíře vlevo či vpravo o zadaný počet stupňů."},
"turtleVisibilityTooltip":function(d){return "Zviditelnit nebo skrýt malíře."},
"widthTooltip":function(d){return "Změní tloušťku tužky."},
"wrongColour":function(d){return "Tvůj obrázek nemá správnou barvu. V této hádance to musí být %1."}};