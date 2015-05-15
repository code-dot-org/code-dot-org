var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Lanjutkan"},
"doCode":function(d){return "kerjakan"},
"elseCode":function(d){return "jika tidak"},
"endGame":function(d){return "akhir dari permainan"},
"endGameTooltip":function(d){return "Akhiri permainan."},
"finalLevel":function(d){return "Horee! Anda telah memecahkan teka-teki akhir."},
"flap":function(d){return "kepakkan"},
"flapRandom":function(d){return "Kepakkan secara acak"},
"flapVerySmall":function(d){return "kepakkan dengan sangat perlahan"},
"flapSmall":function(d){return "kepakkan dengan perlahan"},
"flapNormal":function(d){return "kepakkan dengan biasa"},
"flapLarge":function(d){return "kepakkan dengan kuat"},
"flapVeryLarge":function(d){return "kepakkan dengan sangat kuat"},
"flapTooltip":function(d){return "Terbangkan Flappy keatas."},
"flappySpecificFail":function(d){return "Kode kamu terlihat baik - Burung itu akan mengepak setiap kali diklik. Tapi kamu perlu mengklik sebanyak mungkin untuk terbang menuju target."},
"incrementPlayerScore":function(d){return "raih point"},
"incrementPlayerScoreTooltip":function(d){return "Tambah satu pada skor pemain saat ini."},
"nextLevel":function(d){return "Horee! Anda telah menyelesaikan teka-teki ini."},
"no":function(d){return "Tidak"},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok."},
"playSoundRandom":function(d){return "Mainkan bunyi secara acak"},
"playSoundBounce":function(d){return "mainkan bunyi \"pantulan\""},
"playSoundCrunch":function(d){return "mainkan bunyi \"crunch\""},
"playSoundDie":function(d){return "mainkan bunyi \"sedih\""},
"playSoundHit":function(d){return "mainkan bunyi \"tabrakan\""},
"playSoundPoint":function(d){return "Mainkan bunyi \"point\""},
"playSoundSwoosh":function(d){return "mainkan bunyi \"swoosh\""},
"playSoundWing":function(d){return "mainkan bunyi \"sayap\""},
"playSoundJet":function(d){return "mainkan bunyi \"jet\""},
"playSoundCrash":function(d){return "mainkan bunyi \"tubrukan\""},
"playSoundJingle":function(d){return "mainkan bunyi \"berdentang\""},
"playSoundSplash":function(d){return "mainkan bunyi \"cipratan\""},
"playSoundLaser":function(d){return "mainkan bunyi \"laser\""},
"playSoundTooltip":function(d){return "Mainkan bunyi pilihan."},
"reinfFeedbackMsg":function(d){return "Anda dapat menekan tombol \"Coba lagi\" untuk kembali bermain."},
"scoreText":function(d){return "Nilai: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "atur adegan"},
"setBackgroundRandom":function(d){return "atur adegan secara acak"},
"setBackgroundFlappy":function(d){return "atur adegan kota (hari)"},
"setBackgroundNight":function(d){return "atur adegan kota (malam)"},
"setBackgroundSciFi":function(d){return "atur adegan Sci-Fi"},
"setBackgroundUnderwater":function(d){return "atur adegan dalam air"},
"setBackgroundCave":function(d){return "atur adegan gua"},
"setBackgroundSanta":function(d){return "atur adegan Santa"},
"setBackgroundTooltip":function(d){return "tetapkan latar belakang gambar"},
"setGapRandom":function(d){return "atur celah secara acak"},
"setGapVerySmall":function(d){return "atur celah sangat kecil"},
"setGapSmall":function(d){return "atur celah kecil"},
"setGapNormal":function(d){return "atur celah normal"},
"setGapLarge":function(d){return "atur celah besar"},
"setGapVeryLarge":function(d){return "atur celah sangat besar"},
"setGapHeightTooltip":function(d){return "atur celah vertikal dalam hambatan"},
"setGravityRandom":function(d){return "atur gravitasi secara acak"},
"setGravityVeryLow":function(d){return "atur gravitasi sangat rendah"},
"setGravityLow":function(d){return "atur gravitasi rendah"},
"setGravityNormal":function(d){return "atur gravitasi normal"},
"setGravityHigh":function(d){return "atur gravitasi tinggi"},
"setGravityVeryHigh":function(d){return "atur gravitasi sangat tinggi"},
"setGravityTooltip":function(d){return "atur tingkat gravitasi"},
"setGround":function(d){return "tetapkan dasar"},
"setGroundRandom":function(d){return "atur permukaan secara acak"},
"setGroundFlappy":function(d){return "atur permukaan tanah "},
"setGroundSciFi":function(d){return "atur permukaan Sci-Fi"},
"setGroundUnderwater":function(d){return "atur permukaan \"dalam air\""},
"setGroundCave":function(d){return "atur permukaan gua"},
"setGroundSanta":function(d){return "tetapkan permukaan Santa"},
"setGroundLava":function(d){return "tetapkan permukaan lava"},
"setGroundTooltip":function(d){return "atur gambar permukaan"},
"setObstacle":function(d){return "atur hambatan"},
"setObstacleRandom":function(d){return "atur hambatan secara acak"},
"setObstacleFlappy":function(d){return "tetapkan pipa penghalang"},
"setObstacleSciFi":function(d){return "tetapkan hambatan Sci-Fi"},
"setObstacleUnderwater":function(d){return "tetapkan hambatan tanaman"},
"setObstacleCave":function(d){return "tetapkan hambatan gua"},
"setObstacleSanta":function(d){return "tetapkan hambatan cerobong asap"},
"setObstacleLaser":function(d){return "tetapkan hambatan laser"},
"setObstacleTooltip":function(d){return "atur gambar hambatan "},
"setPlayer":function(d){return "atur pemain"},
"setPlayerRandom":function(d){return "atur pemain secara acak"},
"setPlayerFlappy":function(d){return "atur pemain \"burung kuning\""},
"setPlayerRedBird":function(d){return "atur pemain \"burung merah\""},
"setPlayerSciFi":function(d){return "atur pemain \"pesawat ruang angkasa\""},
"setPlayerUnderwater":function(d){return "atur pemain \"ikan\""},
"setPlayerCave":function(d){return "atur pemain \"kelelawar\""},
"setPlayerSanta":function(d){return "atur pemain Santa"},
"setPlayerShark":function(d){return "atur pemain hiu"},
"setPlayerEaster":function(d){return "atur pemain Kelinci Paskah"},
"setPlayerBatman":function(d){return "atur pemain kelelawar pria"},
"setPlayerSubmarine":function(d){return "atur pemain kapal selam"},
"setPlayerUnicorn":function(d){return "atur pemain unicorn"},
"setPlayerFairy":function(d){return "atur pemain peri"},
"setPlayerSuperman":function(d){return "atur pemain Flappyman"},
"setPlayerTurkey":function(d){return "atur pemain Kalkun"},
"setPlayerTooltip":function(d){return "atur gambar pemain"},
"setScore":function(d){return "atur nilai"},
"setScoreTooltip":function(d){return "Tetapkan skor pemain"},
"setSpeed":function(d){return "tetapkan kecepatan"},
"setSpeedTooltip":function(d){return "tetapkan tingkat kecepatan"},
"shareFlappyTwitter":function(d){return "Ayo coba permainan Flappy yang kubuat. Saya menulis sendiri dengan @codeorg"},
"shareGame":function(d){return "Bagikan permainanmu:"},
"soundRandom":function(d){return "acak"},
"soundBounce":function(d){return "melambung"},
"soundCrunch":function(d){return "menjongkok"},
"soundDie":function(d){return "sedih"},
"soundHit":function(d){return "pukulan"},
"soundPoint":function(d){return "poin"},
"soundSwoosh":function(d){return "tiupan"},
"soundWing":function(d){return "sayap"},
"soundJet":function(d){return "Jet"},
"soundCrash":function(d){return "hantaman"},
"soundJingle":function(d){return "gerincing"},
"soundSplash":function(d){return "cemplung"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "tetapkan kecepatan secara acak"},
"speedVerySlow":function(d){return "tetapkan kecepatan sangat lambat"},
"speedSlow":function(d){return "tetapkan kecepatan lambat"},
"speedNormal":function(d){return "tetapkan kecepatan normal"},
"speedFast":function(d){return "tetapkan kecepatan cepat"},
"speedVeryFast":function(d){return "tetapkan kecepatan sangat cepat"},
"whenClick":function(d){return "ketika menklik"},
"whenClickTooltip":function(d){return "kerjakan tindakan dibawah ini ketika terjadi sebuah klik."},
"whenCollideGround":function(d){return "ketika jatuh ke permukaan"},
"whenCollideGroundTooltip":function(d){return "Jalankan aksi dibawah ketika Flappy jatuh ke permukaan."},
"whenCollideObstacle":function(d){return "ketika menabrak hambatan"},
"whenCollideObstacleTooltip":function(d){return "Jalankan aksi dibawah ketika Flappy menabrak hambatan."},
"whenEnterObstacle":function(d){return "ketika melalui hambatan"},
"whenEnterObstacleTooltip":function(d){return "Jalankan aksi dibawah jika Flappy memasuki hambatan."},
"whenRunButtonClick":function(d){return "jika permainan dimulai"},
"whenRunButtonClickTooltip":function(d){return "Jalankan aksi dibawah ketika permainan dimulai."},
"yes":function(d){return "Ya"}};