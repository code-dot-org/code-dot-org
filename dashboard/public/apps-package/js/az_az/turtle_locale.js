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
"blocksUsed":function(d){return "İstifadə olunmuş bloklar: %1"},
"branches":function(d){return "branches"},
"catColour":function(d){return "Rəng"},
"catControl":function(d){return "dövrlər"},
"catMath":function(d){return "Riyaziyyat"},
"catProcedures":function(d){return "funksiyalar"},
"catTurtle":function(d){return "Əmrlər"},
"catVariables":function(d){return "dəyişənlər"},
"catLogic":function(d){return "Məntiq"},
"colourTooltip":function(d){return "Karandaşın rəngini dəyişir."},
"createACircle":function(d){return "bir çevrə çək"},
"createSnowflakeSquare":function(d){return "create a snowflake of type square"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "create a snowflake of type line"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "create a snowflake of type flower"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "dərəcə"},
"depth":function(d){return "dərinlik"},
"dots":function(d){return "piksel"},
"drawACircle":function(d){return "çevrə çək"},
"drawAFlower":function(d){return "gül çək"},
"drawAHexagon":function(d){return "altıbucaqlı çək"},
"drawAHouse":function(d){return "ev çək"},
"drawAPlanet":function(d){return "draw a planet"},
"drawARhombus":function(d){return "romb çək"},
"drawARobot":function(d){return "draw a robot"},
"drawARocket":function(d){return "draw a rocket"},
"drawASnowflake":function(d){return "qar dənəsi çək"},
"drawASnowman":function(d){return "qar adamı çək"},
"drawASquare":function(d){return "kvadrat çək"},
"drawAStar":function(d){return "bir ulduz çək"},
"drawATree":function(d){return "bir ağac çək"},
"drawATriangle":function(d){return "üçbucaq çək"},
"drawUpperWave":function(d){return "draw upper wave"},
"drawLowerWave":function(d){return "draw lower wave"},
"drawStamp":function(d){return "draw stamp"},
"heightParameter":function(d){return "hündürlük"},
"hideTurtle":function(d){return "rəssamı gizlət"},
"jump":function(d){return "atıl"},
"jumpBackward":function(d){return "geriyə atıl"},
"jumpForward":function(d){return "irəli atıl"},
"jumpTooltip":function(d){return "Heç bir iz qoymadan rəssamın yerini dəyişir."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "uzunluq"},
"loopVariable":function(d){return "sayğac"},
"moveBackward":function(d){return "geriyə get"},
"moveEastTooltip":function(d){return "Moves the artist east."},
"moveForward":function(d){return "irəli get"},
"moveForwardTooltip":function(d){return "Rəssamı irəli aparır."},
"moveNorthTooltip":function(d){return "Moves the artist north."},
"moveSouthTooltip":function(d){return "Moves the artist south."},
"moveWestTooltip":function(d){return "Moves the artist west."},
"moveTooltip":function(d){return "Rəssamı göstərilən qədər irəliyə və ya geriyə hərəkət etdirir."},
"notBlackColour":function(d){return "Bu tapmaca üçün qaradan başqa bir rəng seçməlisiniz."},
"numBlocksNeeded":function(d){return "Bu tapmaca %1 blokla həll oluna bilər. Siz isə %2 blokdan istifadə etdiniz."},
"penDown":function(d){return "karandaşı endir"},
"penTooltip":function(d){return "Şəkil çəkməyi başlamaq və ya dayandırmaq üçün karandaşı endirir və ya qaldırır."},
"penUp":function(d){return "karandaşı qaldır"},
"reinfFeedbackMsg":function(d){return "Bu da sizin rəsm əsəri! Üzərində işləməyə davam edin və ya növbəti tapmacaya keçin."},
"setAlpha":function(d){return "set alpha"},
"setColour":function(d){return "rəngi təyin et"},
"setPattern":function(d){return "set pattern"},
"setWidth":function(d){return "eni təyin et"},
"shareDrawing":function(d){return "Çəkdiyiniz şəkli bölüşün:"},
"showMe":function(d){return "Mənə göstər"},
"showTurtle":function(d){return "rəssamı göstər"},
"sizeParameter":function(d){return "ölçü"},
"step":function(d){return "addım"},
"tooFewColours":function(d){return "Bu tapmaca üçün ən azı %1 fərqli rəngdən istifadə etməlisiniz. Sizdə isə ancaq %2 rəngdir."},
"turnLeft":function(d){return "sola dön"},
"turnRight":function(d){return "sağa dön"},
"turnRightTooltip":function(d){return "Rəssamı göstərilən bucaq qədər sağa döndərir."},
"turnTooltip":function(d){return "Rəssamı qeyd olunmuş dərəcə qədər sola və ya sağa döndərir."},
"turtleVisibilityTooltip":function(d){return "Rəssamı görünən və ya görünməz edir."},
"widthTooltip":function(d){return "Karandaşın qalınlığını dəyişir."},
"wrongColour":function(d){return "Sizin şəkliniz səhv rəngdədir. Bu tapmaca üçün bu %1 olmalıdır."}};