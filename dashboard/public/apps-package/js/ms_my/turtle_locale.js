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
"blocksUsed":function(d){return "Blok-blok yang digunakan: %1"},
"branches":function(d){return "branches"},
"catColour":function(d){return "Warna"},
"catControl":function(d){return "Gelung"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fungsi"},
"catTurtle":function(d){return "Tindakan"},
"catVariables":function(d){return "Pembolehubah"},
"catLogic":function(d){return "Logik"},
"colourTooltip":function(d){return "Perubahan warna pensil."},
"createACircle":function(d){return "hasilkan satu bulatan"},
"createSnowflakeSquare":function(d){return "create a snowflake of type square"},
"createSnowflakeParallelogram":function(d){return "create a snowflake of type parallelogram"},
"createSnowflakeLine":function(d){return "create a snowflake of type line"},
"createSnowflakeSpiral":function(d){return "create a snowflake of type spiral"},
"createSnowflakeFlower":function(d){return "create a snowflake of type flower"},
"createSnowflakeFractal":function(d){return "create a snowflake of type fractal"},
"createSnowflakeRandom":function(d){return "create a snowflake of type random"},
"createASnowflakeBranch":function(d){return "create a snowflake branch"},
"degrees":function(d){return "darjah"},
"depth":function(d){return "depth"},
"dots":function(d){return "piksel"},
"drawASquare":function(d){return "lukis segi empat"},
"drawATriangle":function(d){return "draw a triangle"},
"drawACircle":function(d){return "draw a circle"},
"drawAFlower":function(d){return "draw a flower"},
"drawAHexagon":function(d){return "draw a hexagon"},
"drawAHouse":function(d){return "draw a house"},
"drawAPlanet":function(d){return "lukis satu planet"},
"drawARhombus":function(d){return "draw a rhombus"},
"drawARobot":function(d){return "draw a robot"},
"drawARocket":function(d){return "lukis satu roket"},
"drawASnowflake":function(d){return "draw a snowflake"},
"drawASnowman":function(d){return "lukis snowman"},
"drawAStar":function(d){return "draw a star"},
"drawATree":function(d){return "draw a tree"},
"drawUpperWave":function(d){return "draw upper wave"},
"drawLowerWave":function(d){return "draw lower wave"},
"drawStamp":function(d){return "draw stamp"},
"heightParameter":function(d){return "ketinggian"},
"hideTurtle":function(d){return "Sembunyi artis"},
"jump":function(d){return "lompat"},
"jumpBackward":function(d){return "lompat ke belakang dengan"},
"jumpForward":function(d){return "lompat ke hadapan dengan"},
"jumpTooltip":function(d){return "Gerakkan artis tanpa meninggalkan apa-apa tanda."},
"jumpEastTooltip":function(d){return "Moves the artist east without leaving any marks."},
"jumpNorthTooltip":function(d){return "Moves the artist north without leaving any marks."},
"jumpSouthTooltip":function(d){return "Moves the artist south without leaving any marks."},
"jumpWestTooltip":function(d){return "Moves the artist west without leaving any marks."},
"lengthFeedback":function(d){return "You got it right except for the lengths to move."},
"lengthParameter":function(d){return "panjang"},
"loopVariable":function(d){return "Kaunter"},
"moveBackward":function(d){return "bergerak ke belakang dengan"},
"moveEastTooltip":function(d){return "Moves the artist east."},
"moveForward":function(d){return "bergerak ke hadapan dengan"},
"moveForwardTooltip":function(d){return "Gerakkan artis ke hadapan."},
"moveNorthTooltip":function(d){return "Moves the artist north."},
"moveSouthTooltip":function(d){return "Moves the artist south."},
"moveWestTooltip":function(d){return "Moves the artist west."},
"moveTooltip":function(d){return "Gerakkan artis ke hadapan atau ke belakang dengan jumlah yang ditetapkan."},
"notBlackColour":function(d){return "Anda perlu tetapkan warna lain selain warna hitam bagi puzzle ini."},
"numBlocksNeeded":function(d){return "Puzzle ini dapat diselesaikan dengan %1 blok. Anda telah menggunakan %2."},
"penDown":function(d){return "pensil ke bawah"},
"penTooltip":function(d){return "Angakat atau rendahkan pensil, untuk mula atau berhenti melukis."},
"penUp":function(d){return "pensil di atas"},
"reinfFeedbackMsg":function(d){return "Here is your drawing! Keep working on it or continue to the next puzzle."},
"setColour":function(d){return "set warna"},
"setPattern":function(d){return "set pattern"},
"setWidth":function(d){return "set lebar"},
"shareDrawing":function(d){return "Kongsi lukisan anda:"},
"showMe":function(d){return "Tunjukkan saya"},
"showTurtle":function(d){return "tunjukkan artis"},
"sizeParameter":function(d){return "saiz"},
"step":function(d){return "step"},
"tooFewColours":function(d){return "Anda perlukan sekurang-kurangnya %1 warna berlainan untuk puzzle ini. Anda hanya gunakan %2."},
"turnLeft":function(d){return "belok kiri dengan"},
"turnRight":function(d){return "pusing kanan dengan"},
"turnRightTooltip":function(d){return "Pusing artis ke kanan dengan sudut yang ditentukan."},
"turnTooltip":function(d){return "Pusing artis kiri atau kanan dengan darjah nombor yang telah ditentukan."},
"turtleVisibilityTooltip":function(d){return "Jadikan artis kelihatan atau tidak kelihatan."},
"widthTooltip":function(d){return "Tukar lebar pensil."},
"wrongColour":function(d){return "Warna gambar anda salah. Untuk Puzzle ini, ianya perlukan %1."}};