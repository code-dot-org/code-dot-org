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
"blocksUsed":function(d){return "Lohkoja käytetty: %1"},
"branches":function(d){return "haarat"},
"catColour":function(d){return "Väri"},
"catControl":function(d){return "Silmukat"},
"catMath":function(d){return "Matematiikka"},
"catProcedures":function(d){return "Funktiot"},
"catTurtle":function(d){return "Toiminnot"},
"catVariables":function(d){return "Muuttujat"},
"catLogic":function(d){return "Logiikka"},
"colourTooltip":function(d){return "Muuttaa kynän väriä."},
"createACircle":function(d){return "Luo ympyrä"},
"createSnowflakeSquare":function(d){return "luo neliömäinen lumihiutale"},
"createSnowflakeParallelogram":function(d){return "luo suunnikkaan muotoinen lumihiutale"},
"createSnowflakeLine":function(d){return "luo viivamainen lumihiutale"},
"createSnowflakeSpiral":function(d){return "luo spiraalimainen lumihiutale"},
"createSnowflakeFlower":function(d){return "luo kukan muotoinen lumihiutale"},
"createSnowflakeFractal":function(d){return "luo fraktaalimainen lumihiutale"},
"createSnowflakeRandom":function(d){return "luo satunnainen lumihiutale"},
"createASnowflakeBranch":function(d){return "luo lumihiutalehaara"},
"degrees":function(d){return "astetta"},
"depth":function(d){return "syvyys"},
"dots":function(d){return "kuvapistettä"},
"drawACircle":function(d){return "piirrä ympyrä"},
"drawAFlower":function(d){return "piirrä kukka"},
"drawAHexagon":function(d){return "piirrä kuusikulmio"},
"drawAHouse":function(d){return "piirrä talo"},
"drawAPlanet":function(d){return "piirrä planeetta"},
"drawARhombus":function(d){return "piirrä vinoneliö"},
"drawARobot":function(d){return "piirrä robotti"},
"drawARocket":function(d){return "piirrä raketti"},
"drawASnowflake":function(d){return "piirrä lumihiutale"},
"drawASnowman":function(d){return "piirrä lumiukko"},
"drawASquare":function(d){return "piirrä neliö"},
"drawAStar":function(d){return "piirrä tähti"},
"drawATree":function(d){return "piirrä puu"},
"drawATriangle":function(d){return "piirrä kolmio"},
"drawUpperWave":function(d){return "piirrä ylempi aalto"},
"drawLowerWave":function(d){return "piirrä alempi aalto"},
"drawStamp":function(d){return "piirrä postimerkki"},
"heightParameter":function(d){return "korkeus"},
"hideTurtle":function(d){return "piilota taiteilija"},
"jump":function(d){return "hyppää"},
"jumpBackward":function(d){return "hyppää taaksepäin"},
"jumpForward":function(d){return "hyppää eteenpäin"},
"jumpTooltip":function(d){return "Liikuttaa taiteilijaa piirtämättä jälkeä."},
"jumpEastTooltip":function(d){return "Liikuttaa taiteilijaa itään piirtämättä jälkeä."},
"jumpNorthTooltip":function(d){return "Liikuttaa taiteilijaa pohjoiseen piirtämättä jälkeä."},
"jumpSouthTooltip":function(d){return "Liikuttaa taiteilijaa etelään piirtämättä jälkeä."},
"jumpWestTooltip":function(d){return "Liikuttaa taiteilijaa länteen piirtämättä jälkeä."},
"lengthFeedback":function(d){return "Sait tämän oikein lukuunottamatta siirtojen pituuksia."},
"lengthParameter":function(d){return "pituus"},
"loopVariable":function(d){return "laskuri"},
"moveBackward":function(d){return "liiku taaksepäin"},
"moveEastTooltip":function(d){return "Liikuttaa taiteilijaa itään."},
"moveForward":function(d){return "liiku eteenpäin"},
"moveForwardTooltip":function(d){return "Liikuttaa taiteilijaa eteenpäin."},
"moveNorthTooltip":function(d){return "Liikuta taiteilijaa pohjoiseen."},
"moveSouthTooltip":function(d){return "Liikuttaa taiteilijaa etelään."},
"moveWestTooltip":function(d){return "Liikuttaa taiteilijaa länteen."},
"moveTooltip":function(d){return "Liikuttaa taiteilijaa eteenpäin tai taaksepäin annetun etäisyyden."},
"notBlackColour":function(d){return "Tässä tehtävässä sinun täytyy käyttää jotain muuta kuin mustaa väriä."},
"numBlocksNeeded":function(d){return "Tämän tehtävän voi ratkaista %1 lohkolla. Käytit %2."},
"penDown":function(d){return "kynä alas"},
"penTooltip":function(d){return "Nostaa tai laskee kynän, aloittaakseen tai lopettaakseen piirtämisen."},
"penUp":function(d){return "kynä ylös"},
"reinfFeedbackMsg":function(d){return "Tässä on piirustuksesi! Jatka työstämistä sen parissa tai siirry seuraavaan tehtävään."},
"setAlpha":function(d){return "aseta läpinäkymättömyys"},
"setColour":function(d){return "aseta väri"},
"setPattern":function(d){return "määritä malli"},
"setWidth":function(d){return "aseta leveys"},
"shareDrawing":function(d){return "Jaa piirustuksesi:"},
"showMe":function(d){return "Näytä minulle"},
"showTurtle":function(d){return "näytä taiteilija"},
"sizeParameter":function(d){return "koko"},
"step":function(d){return "askel"},
"tooFewColours":function(d){return "Tässä pulmassa pitää käyttää ainakin %1 väriä. Käytit vain %2 väriä."},
"turnLeft":function(d){return "käänny vasemmalle"},
"turnRight":function(d){return "käänny oikealle"},
"turnRightTooltip":function(d){return "Kääntää taitelijaa oikealle annetun astemäärän."},
"turnTooltip":function(d){return "Kääntää taiteilijaa vasemmalle tai oikealle annetun astemäärän."},
"turtleVisibilityTooltip":function(d){return "Tekee taiteilijasta näkyvän tai näkymättömän."},
"widthTooltip":function(d){return "Muuttaa kynän paksuutta."},
"wrongColour":function(d){return "Kuvasi on väärän värinen. Tässä tehtävässä sen pitää olla %1."}};