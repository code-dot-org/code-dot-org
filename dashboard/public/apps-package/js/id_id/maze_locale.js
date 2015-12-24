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
"atHoneycomb":function(d){return "di sarang lebah"},
"atFlower":function(d){return "di bunga"},
"avoidCowAndRemove":function(d){return "Hindari sapi dan pindahkan 1"},
"continue":function(d){return "lanjutkan"},
"dig":function(d){return "Pindahkan 1"},
"digTooltip":function(d){return "Pindahkan 1 unit tanah"},
"dirE":function(d){return "T"},
"dirN":function(d){return "U"},
"dirS":function(d){return "S"},
"dirW":function(d){return "B"},
"doCode":function(d){return "kerjakan"},
"elseCode":function(d){return "jika tidak"},
"fill":function(d){return "Timbun 1"},
"fillN":function(d){return "Timbun "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "Isi "+maze_locale.v(d,"shovelfuls")+" lubang dengan tumpukan "},
"fillSquare":function(d){return "isi persegi empat"},
"fillTooltip":function(d){return "tempat 1 unit tanah"},
"finalLevel":function(d){return "Selamat! Anda telah menyelesaikan teka-teki terakhir."},
"flowerEmptyError":function(d){return "Bunga dimana anda berada sekarang tidak memiliki madu lebih."},
"get":function(d){return "dapatkan"},
"heightParameter":function(d){return "tinggi"},
"holePresent":function(d){return "ada lubang"},
"honey":function(d){return "membuat madu"},
"honeyAvailable":function(d){return "madu"},
"honeyTooltip":function(d){return "Membuat madu dari nektar"},
"honeycombFullError":function(d){return "Sarang lebah ini tidak memiliki ruang untuk madu lagi."},
"ifCode":function(d){return "Jika (if)"},
"ifInRepeatError":function(d){return "Anda perlu blok \"jika\" (if) didalam blok \"ulangi\" (repeat). Jika anda mengalami kesulitan, cobalah level sebelumnya untuk mengulang kembali pelajarannya."},
"ifPathAhead":function(d){return "jika ada jalan di depan"},
"ifTooltip":function(d){return "jika ada jalan di arah yang ditentukan, lakukan beberapa tindakan."},
"ifelseTooltip":function(d){return "jika ada jalan di arah yang sudah ditentukan, lakukan blok perintah pertama. Jika tidak, lakukan blok perintah ke dua."},
"ifFlowerTooltip":function(d){return "Jika ada bunga/sarang lebah ke arah yang ditentukan, kemudian lakukan beberapa aksi."},
"ifOnlyFlowerTooltip":function(d){return "Jika ada bunga pada arah yang ditentukan, lakukan beberapa perintah."},
"ifelseFlowerTooltip":function(d){return "Jika ada bunga/sarang lebah di arahan yang telah ditetapkan, maka lakukan blok pertama dari aksi. Jika tidak, melakukan blok kedua aksi."},
"insufficientHoney":function(d){return "Anda menggunakan semua blok kanan, tetapi anda perlu membuat jumlah madu yang tepat."},
"insufficientNectar":function(d){return "Anda menggunakan semua blok dengan tepat, tetapi anda perlu mengumpulkan madu dengan jumlah yang tepat."},
"make":function(d){return "membuat"},
"moveBackward":function(d){return "bergerak mundur"},
"moveEastTooltip":function(d){return "Pindahkan saya ke Timur satu langkah."},
"moveForward":function(d){return "Gerak maju"},
"moveForwardTooltip":function(d){return "Gerak maju satu petak."},
"moveNorthTooltip":function(d){return "Pindahkan saya ke Utara satu langkah."},
"moveSouthTooltip":function(d){return "Pindahkan saya ke Selatan satu langkah."},
"moveTooltip":function(d){return "Gerakkan saya maju/mundur satu petak"},
"moveWestTooltip":function(d){return "Pindahkan saya ke Barat satu langkah."},
"nectar":function(d){return "Dapatkan madu"},
"nectarRemaining":function(d){return "madu"},
"nectarTooltip":function(d){return "Dapatkan madu dari bunga"},
"nextLevel":function(d){return "Selamat! Kamu telah menyelesaikan teka-teki ini."},
"no":function(d){return "Tidak"},
"noPathAhead":function(d){return "jalur terhalang"},
"noPathLeft":function(d){return "tidak ada jalur ke kiri"},
"noPathRight":function(d){return "tidak ada jalur ke kanan"},
"notAtFlowerError":function(d){return "Anda hanya bisa mendapatkan madu dari bunga."},
"notAtHoneycombError":function(d){return "Anda hanya dapat membuat madu di sarang lebah."},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok."},
"pathAhead":function(d){return "jalur ke depan"},
"pathLeft":function(d){return "Jika jalur ke kiri"},
"pathRight":function(d){return "Jika jalur ke kanan"},
"pilePresent":function(d){return "ada tumpukan"},
"putdownTower":function(d){return "letakkan tower"},
"removeAndAvoidTheCow":function(d){return "Pindahkan 1 dan hindari sapi"},
"removeN":function(d){return "Pindahkan "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "hapus tumpukan"},
"removeStack":function(d){return "pindahkan "+maze_locale.v(d,"shovelfuls")+" tumpukan"},
"removeSquare":function(d){return "hapus persegi empat"},
"repeatCarefullyError":function(d){return "Untuk memecahkan masalah ini, berpikirlah hati-hati tentang pola satu dan dua gerakkan untuk menempatkan blok \"Ulangi\".  Tidak apa-apa memiliki gerakkan ekstra pada bagian akhir."},
"repeatUntil":function(d){return "Ulangi sampai"},
"repeatUntilBlocked":function(d){return "Selagi ada jalur ke depan"},
"repeatUntilFinish":function(d){return "Ulangi sampai selesai"},
"step":function(d){return "Langkah"},
"totalHoney":function(d){return "total madu"},
"totalNectar":function(d){return "total nektar"},
"turnLeft":function(d){return "belok kiri"},
"turnRight":function(d){return "belok kanan"},
"turnTooltip":function(d){return "Belok ke kiri atau ke kanan 90 derajat."},
"uncheckedCloudError":function(d){return "Pastikan untuk memeriksa semua awan untuk melihat apakah terdapat beberapa bunga atau sarang lebah."},
"uncheckedPurpleError":function(d){return "Pastikan untuk memeriksa semua bunga-bunga ungu untuk melihat apakah memiliki nektar"},
"whileMsg":function(d){return "Selagi"},
"whileTooltip":function(d){return "Ulangi aksi sampai tujuan tercapai."},
"word":function(d){return "Cari kata"},
"yes":function(d){return "Ya"},
"youSpelled":function(d){return "Anda mengejanya"}};