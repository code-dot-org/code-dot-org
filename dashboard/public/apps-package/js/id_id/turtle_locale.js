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
"blocksUsed":function(d){return "Blok yang digunakan: %1"},
"branches":function(d){return "cabang"},
"catColour":function(d){return "Warna"},
"catControl":function(d){return "pengulangan"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "fungsi"},
"catTurtle":function(d){return "tindakan"},
"catVariables":function(d){return "variabel"},
"catLogic":function(d){return "Logika"},
"colourTooltip":function(d){return "Perubahan warna pensil."},
"createACircle":function(d){return "buatlah lingkaran"},
"createSnowflakeSquare":function(d){return "buatlah sebuah kepingan salju berbentuk persegi"},
"createSnowflakeParallelogram":function(d){return "buatlah kepingan salju berbentuk jajar genjang"},
"createSnowflakeLine":function(d){return "buatlah kepingan salju berbentuk garis"},
"createSnowflakeSpiral":function(d){return "buatlah sebuah kepingan salju berbentuk pilin (spiral)"},
"createSnowflakeFlower":function(d){return "buatlah sebuah kepingan salju berbentuk bunga"},
"createSnowflakeFractal":function(d){return "buatlah sebuah kepingan salju berbentuk fraktal"},
"createSnowflakeRandom":function(d){return "buatlah kepingan salju berbentuk acak"},
"createASnowflakeBranch":function(d){return "buatlah cabang kepingan salju"},
"degrees":function(d){return "derajat"},
"depth":function(d){return "kedalaman"},
"dots":function(d){return "piksel"},
"drawASquare":function(d){return "menggambar sebuah persegi empat"},
"drawATriangle":function(d){return "menggambar sebuah segitiga"},
"drawACircle":function(d){return "Gambar sebuah lingkaran"},
"drawAFlower":function(d){return "menggambar bunga"},
"drawAHexagon":function(d){return "menggambar segi enam"},
"drawAHouse":function(d){return "gambar sebuah rumah"},
"drawAPlanet":function(d){return "menggambar planet"},
"drawARhombus":function(d){return "menggambar ketupat"},
"drawARobot":function(d){return "menggambar robot"},
"drawARocket":function(d){return "menggambar roket"},
"drawASnowflake":function(d){return "menggambar kristal salju"},
"drawASnowman":function(d){return "Menggambar manusia salju"},
"drawAStar":function(d){return "menggambar bintang"},
"drawATree":function(d){return "Gambar sebuah pohon"},
"drawUpperWave":function(d){return "menggambar atas gelombang"},
"drawLowerWave":function(d){return "menggambar bawah gelombang"},
"drawStamp":function(d){return "gambar cap"},
"heightParameter":function(d){return "tinggi"},
"hideTurtle":function(d){return "sembunyikan artis"},
"jump":function(d){return "lompat"},
"jumpBackward":function(d){return "lompat ke belakang "},
"jumpForward":function(d){return "lompat maju "},
"jumpTooltip":function(d){return "Mengerakan artis tanpa meninggalkan bekas apapun."},
"jumpEastTooltip":function(d){return "Memindahkan karakter kearah timur tanpa ada bekas pada jalur yang dilalui."},
"jumpNorthTooltip":function(d){return "Memindahkan karakter kearah utara tanpa ada bekas pada jalur yang dilalui."},
"jumpSouthTooltip":function(d){return "Memindahkan karakter kearah selatan tanpa ada bekas pada jalur yang dilalui."},
"jumpWestTooltip":function(d){return "Memindahkan karakter kearah barat tanpa ada bekas pada jalur yang dilalui."},
"lengthFeedback":function(d){return "sudah benar sih, cuma jumlah langkah/geraknya perlu diperbaiki."},
"lengthParameter":function(d){return "panjang"},
"loopVariable":function(d){return "Pencacah"},
"moveBackward":function(d){return "gerak mundur"},
"moveEastTooltip":function(d){return "pindahkan karakter ke Timur."},
"moveForward":function(d){return "Gerak maju "},
"moveForwardTooltip":function(d){return "Artis bergerak maju."},
"moveNorthTooltip":function(d){return "pindahkan karakter ke Utara."},
"moveSouthTooltip":function(d){return "pindahkan karakter ke Selatan."},
"moveWestTooltip":function(d){return "pindahkan karakter ke Barat."},
"moveTooltip":function(d){return "Menggerak artis maju atau mundur oleh jumlah yang ditentukan."},
"notBlackColour":function(d){return "Anda perlu untuk mengatur warna selain hitam untuk teka-teki ini."},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok.  Anda menggunakan %2."},
"penDown":function(d){return "pensil kebawah"},
"penTooltip":function(d){return "Mengangkat atau menurunkan pensil, mulai atau berhenti menggambar."},
"penUp":function(d){return "pensil keatas"},
"reinfFeedbackMsg":function(d){return "Inilah gambar Anda! Teruslah mengerjakan atau lanjutan ke teka-teki berikutnya."},
"setColour":function(d){return "Atur warna"},
"setPattern":function(d){return "tetapkan pola"},
"setWidth":function(d){return "atur lebar"},
"shareDrawing":function(d){return "Bagikan gambar anda:"},
"showMe":function(d){return "Tunjukkan padaku"},
"showTurtle":function(d){return "tampilkan artis"},
"sizeParameter":function(d){return "ukuran"},
"step":function(d){return "langkah"},
"tooFewColours":function(d){return "Anda perlu menggunakan setidaknya %1 warna yang berbeda untuk teka-teki ini.  Anda menggunakan hanya %2."},
"turnLeft":function(d){return "Belok kiri"},
"turnRight":function(d){return "Belok kanan"},
"turnRightTooltip":function(d){return "Membelok artis ke kanan dengan sudut tertentu."},
"turnTooltip":function(d){return "Membelok artis ke kiri atau ke kanan dengan beberapa derajat."},
"turtleVisibilityTooltip":function(d){return "Membuat artis terlihat atau tidak terlihat."},
"widthTooltip":function(d){return "Merubah lebar pensil."},
"wrongColour":function(d){return "Gambar Anda memiliki warna yang salah.  Untuk teka-teki ini, perlu untuk menjadi %1."}};