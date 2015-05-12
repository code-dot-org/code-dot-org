var bounce_locale = {lc:{"ar":function(n){
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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "Pantul bola"},
"bounceBallTooltip":function(d){return "Pantulkan bola dari sebuah benda."},
"continue":function(d){return "lanjutkan"},
"dirE":function(d){return "T"},
"dirN":function(d){return "U"},
"dirS":function(d){return "S"},
"dirW":function(d){return "B"},
"doCode":function(d){return "kerjakan"},
"elseCode":function(d){return "jika tidak"},
"finalLevel":function(d){return "Selamat! Anda telah menyelesaikan teka-teki terakhir."},
"heightParameter":function(d){return "tinggi"},
"ifCode":function(d){return "Jika (if)"},
"ifPathAhead":function(d){return "Jika jalan ke depan"},
"ifTooltip":function(d){return "Jika ada jalan ke arah yang ditentukan, lakukan beberapa perintah."},
"ifelseTooltip":function(d){return "Jika ada jalan ke arah yang ditentukan, maka lakukan perintah yang berada di blok pertama. Jika tidak ada, maka lakukan perintah yang berada di blok kedua."},
"incrementOpponentScore":function(d){return "Skor titik lawan"},
"incrementOpponentScoreTooltip":function(d){return "Tambah satu pada skor lawan saat ini."},
"incrementPlayerScore":function(d){return "Mengukur titik"},
"incrementPlayerScoreTooltip":function(d){return "tambahkan satu pada pemain saat ini."},
"isWall":function(d){return "apa ini dinding"},
"isWallTooltip":function(d){return "Tampilkan 'true' bila ada dinding di sini"},
"launchBall":function(d){return "Luncurkan bola baru"},
"launchBallTooltip":function(d){return "Luncuran bola untuk bermain."},
"makeYourOwn":function(d){return "Buat permainan Bouncing anda sendiri"},
"moveDown":function(d){return "Pindahkan ke bawah"},
"moveDownTooltip":function(d){return "Gerak kayuh ke bawah."},
"moveForward":function(d){return "Gerak maju"},
"moveForwardTooltip":function(d){return "Bergerak maju satu kotak."},
"moveLeft":function(d){return "gerak kiri"},
"moveLeftTooltip":function(d){return "Gerak kayuh ke kiri."},
"moveRight":function(d){return "pindah kanan"},
"moveRightTooltip":function(d){return "Gerak kayuh ke kanan."},
"moveUp":function(d){return "gerak ke atas"},
"moveUpTooltip":function(d){return "Gerak kayuh ke atas."},
"nextLevel":function(d){return "Selamat! Kamu telah menyelesaikan teka-teki ini."},
"no":function(d){return "Tidak"},
"noPathAhead":function(d){return "jalan diblokir"},
"noPathLeft":function(d){return "tidak ada jalan ke kiri"},
"noPathRight":function(d){return "tidak ada jalan ke kanan"},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok."},
"pathAhead":function(d){return "jalan ke depan"},
"pathLeft":function(d){return "Jika jalur ke kiri"},
"pathRight":function(d){return "Jika jalur ke kanan"},
"pilePresent":function(d){return "ada tumpukan"},
"playSoundCrunch":function(d){return "mainkan bunyi \"crunch\""},
"playSoundGoal1":function(d){return "Mainkan suara gol 1"},
"playSoundGoal2":function(d){return "Mainkan suara gol 2"},
"playSoundHit":function(d){return "Mainkan suara pukulan"},
"playSoundLosePoint":function(d){return "Mainkan suara kehilangan poin"},
"playSoundLosePoint2":function(d){return "Mainkan suara kehilangan poin 2"},
"playSoundRetro":function(d){return "Mainkan suara retro "},
"playSoundRubber":function(d){return "Mainkan suara karet"},
"playSoundSlap":function(d){return "Putar suara tamparan"},
"playSoundTooltip":function(d){return "mainkan bunyi pilihan."},
"playSoundWinPoint":function(d){return "Putar suara  titik menang"},
"playSoundWinPoint2":function(d){return "Putar suara titik menang 2"},
"playSoundWood":function(d){return "Bermain suara kayu "},
"putdownTower":function(d){return "letakkan tower"},
"reinfFeedbackMsg":function(d){return "Anda dapat menekan tombol \"Coba lagi\" untuk kembali bermain."},
"removeSquare":function(d){return "hapus persegi empat"},
"repeatUntil":function(d){return "Ulangi sampai"},
"repeatUntilBlocked":function(d){return "Selagi ada jalan ke depan"},
"repeatUntilFinish":function(d){return "Ulangi sampai selesai"},
"scoreText":function(d){return "Skor: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "Tetapkan adegan secara acak"},
"setBackgroundHardcourt":function(d){return "tetapkan adegan 'hardcourt'"},
"setBackgroundRetro":function(d){return "tetapkan adegan retro"},
"setBackgroundTooltip":function(d){return "Atur gambar latar belakang"},
"setBallRandom":function(d){return "tetapkan bola secara acak"},
"setBallHardcourt":function(d){return "tetapkan bola 'hardcourt'"},
"setBallRetro":function(d){return "tetapkan bola retro"},
"setBallTooltip":function(d){return "tetapkan gambar bola"},
"setBallSpeedRandom":function(d){return "tetapkan bola dengan kecepatan acak"},
"setBallSpeedVerySlow":function(d){return "tetapkan bola dengan kecepatan sangat lambat"},
"setBallSpeedSlow":function(d){return "tetapkan bola dengan kecepatan lambat"},
"setBallSpeedNormal":function(d){return "tetapkan bola dengan kecepatan normal"},
"setBallSpeedFast":function(d){return "tetapkan bola dengan kecepatan cepat"},
"setBallSpeedVeryFast":function(d){return "tetapkan bola dengan kecepatan sangat cepat"},
"setBallSpeedTooltip":function(d){return "Tetapkan kecepatan bola"},
"setPaddleRandom":function(d){return "tetapkan dayung secara acak"},
"setPaddleHardcourt":function(d){return "tetapkan dayung 'hardcourt' "},
"setPaddleRetro":function(d){return "tetapkan dayung retro"},
"setPaddleTooltip":function(d){return "Tetapkan gambar dayung"},
"setPaddleSpeedRandom":function(d){return "Tetapkan kecepatan dayung secara acak"},
"setPaddleSpeedVerySlow":function(d){return "Tetapkan dayung dengan kecepatan sangat lambat"},
"setPaddleSpeedSlow":function(d){return "tetapkan dayung dengan kecepatan lambat"},
"setPaddleSpeedNormal":function(d){return "tetapkan dayung dengan kecepatan normal"},
"setPaddleSpeedFast":function(d){return "tetapkan dayung dengan kecepatan cepat"},
"setPaddleSpeedVeryFast":function(d){return "tetapkan dayung dengan kecepatan sangat cepat"},
"setPaddleSpeedTooltip":function(d){return "Tetapkan kecepatan dayung"},
"shareBounceTwitter":function(d){return "Ayo coba permainan Flappy yang kubuat. Saya menulis sendiri dengan @codeorg"},
"shareGame":function(d){return "Bagikan permainanmu:"},
"turnLeft":function(d){return "belok kiri"},
"turnRight":function(d){return "belok kanan"},
"turnTooltip":function(d){return "Belok ke kiri atau ke kanan 90 derajat."},
"whenBallInGoal":function(d){return "Ketika bola di tujuan"},
"whenBallInGoalTooltip":function(d){return "Melaksanakan aksi-aksi di bawah ini ketika bola memasuki tujuan."},
"whenBallMissesPaddle":function(d){return "Ketika bola tidak terkena kayuh"},
"whenBallMissesPaddleTooltip":function(d){return "Laksanakan aksi-aksi dibawah ketika bola tidak mengenai kayuh."},
"whenDown":function(d){return "Ketika panah bawah"},
"whenDownTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kebawah ditekan."},
"whenGameStarts":function(d){return "ketika permainan dimulai"},
"whenGameStartsTooltip":function(d){return "Jalankan aksi dibawah ketika permainan dimulai."},
"whenLeft":function(d){return "Ketika anak panah kiri"},
"whenLeftTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kiri ditekan."},
"whenPaddleCollided":function(d){return "ketika bola menyentuh kayuh"},
"whenPaddleCollidedTooltip":function(d){return "Laksanakan aksi-aksi di bawah ini ketika bola bertabrakan dengan dayung."},
"whenRight":function(d){return "Ketika anak panah kanan"},
"whenRightTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kanan ditekan."},
"whenUp":function(d){return "Bila tanda panah atas"},
"whenUpTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah keatas ditekan."},
"whenWallCollided":function(d){return "ketika bola menyentuh dinding"},
"whenWallCollidedTooltip":function(d){return "Laksanakan aksi-aksi dibawah ini ketika bola bertabrakan dengan dinding."},
"whileMsg":function(d){return "Selagi"},
"whileTooltip":function(d){return "Ulangi perintah sampai tujuan tercapai."},
"yes":function(d){return "Ya"}};