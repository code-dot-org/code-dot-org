var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"actor":function(d){return "aktor"},
"alienInvasion":function(d){return "Serangan Alien!"},
"backgroundBlack":function(d){return "hitam"},
"backgroundCave":function(d){return "gua"},
"backgroundCloudy":function(d){return "berawan"},
"backgroundHardcourt":function(d){return "kasar"},
"backgroundNight":function(d){return "malam"},
"backgroundUnderwater":function(d){return "di dalam air"},
"backgroundCity":function(d){return "Kota"},
"backgroundDesert":function(d){return "gurun"},
"backgroundRainbow":function(d){return "Pelangi"},
"backgroundSoccer":function(d){return "sepak bola"},
"backgroundSpace":function(d){return "Luar Angkasa"},
"backgroundTennis":function(d){return "Tenis"},
"backgroundWinter":function(d){return "musim dingin"},
"catActions":function(d){return "Aksi"},
"catControl":function(d){return "Loop"},
"catEvents":function(d){return "kegiatan"},
"catLogic":function(d){return "Logika"},
"catMath":function(d){return "Matematika"},
"catProcedures":function(d){return "fungsi"},
"catText":function(d){return "Teks"},
"catVariables":function(d){return "variabel"},
"changeScoreTooltip":function(d){return "Menambah atau menghapus satu angka untuk Skor."},
"changeScoreTooltipK1":function(d){return "tambahkan satu angka ke Skor."},
"continue":function(d){return "Lanjutkan"},
"decrementPlayerScore":function(d){return "hapus angka"},
"defaultSayText":function(d){return "ketik di sini"},
"emotion":function(d){return "perasaan"},
"finalLevel":function(d){return "Horee! Anda telah memecahkan teka-teki akhir."},
"for":function(d){return "untuk"},
"hello":function(d){return "Halo"},
"helloWorld":function(d){return "Halo dunia!"},
"incrementPlayerScore":function(d){return "Mengukur titik"},
"makeProjectileDisappear":function(d){return "menghilang"},
"makeProjectileBounce":function(d){return "memantul"},
"makeProjectileBlueFireball":function(d){return "buat bola api biru"},
"makeProjectilePurpleFireball":function(d){return "buat bola api ungu"},
"makeProjectileRedFireball":function(d){return "buat bola api merah"},
"makeProjectileYellowHearts":function(d){return "buat hati-hati kuning"},
"makeProjectilePurpleHearts":function(d){return "buat hati ungu"},
"makeProjectileRedHearts":function(d){return "Buat hati-hati merah"},
"makeProjectileTooltip":function(d){return "Buat peluru yang baru saja bertabrakan menghilang atau memantul."},
"makeYourOwn":function(d){return "Membuat aplikasi Play Lab anda sendiri"},
"moveDirectionDown":function(d){return "turun"},
"moveDirectionLeft":function(d){return "kiri"},
"moveDirectionRight":function(d){return "kanan"},
"moveDirectionUp":function(d){return "atas"},
"moveDirectionRandom":function(d){return "acak"},
"moveDistance25":function(d){return "25 pixel"},
"moveDistance50":function(d){return "50 pixel"},
"moveDistance100":function(d){return "100 piksel"},
"moveDistance200":function(d){return "200 piksel"},
"moveDistance400":function(d){return "400 piksel"},
"moveDistancePixels":function(d){return "piksel"},
"moveDistanceRandom":function(d){return "piksel-piksel acak"},
"moveDistanceTooltip":function(d){return "memindahkan aktor dalam jarak tertentu ke arah yang telah ditentukan"},
"moveSprite":function(d){return "bergerak"},
"moveSpriteN":function(d){return "pindahkan aktor"+appLocale.v(d,"spriteIndex")},
"toXY":function(d){return "ke x, y"},
"moveDown":function(d){return "Pindahkan ke bawah"},
"moveDownTooltip":function(d){return "pindahkan aktor ke bawah."},
"moveLeft":function(d){return "Gerak ke kiri"},
"moveLeftTooltip":function(d){return "pindahkan aktor ke kiri."},
"moveRight":function(d){return "Gerak ke kanan"},
"moveRightTooltip":function(d){return "pindahkan aktor ke kanan."},
"moveUp":function(d){return "Gerak ke atas"},
"moveUpTooltip":function(d){return "Pindahkan aktor ke atas."},
"moveTooltip":function(d){return "Pindahkan aktor."},
"nextLevel":function(d){return "Horee! Anda telah menyelesaikan teka-teki ini."},
"no":function(d){return "Tidak"},
"numBlocksNeeded":function(d){return "Teka-teki ini dapat diselesaikan dengan %1 blok."},
"ouchExclamation":function(d){return "Aduh!"},
"playSoundCrunch":function(d){return "mainkan bunyi \"crunch\""},
"playSoundGoal1":function(d){return "Mainkan suara gol 1"},
"playSoundGoal2":function(d){return "Mainkan suara gol 2"},
"playSoundHit":function(d){return "Mainkan suara pukulan"},
"playSoundLosePoint":function(d){return "mainkan suara kehilangan poin"},
"playSoundLosePoint2":function(d){return "mainkan suara kehilangan poin 2"},
"playSoundRetro":function(d){return "Mainkan suara retro "},
"playSoundRubber":function(d){return "mainkan suara karet"},
"playSoundSlap":function(d){return "putar suara tamparan"},
"playSoundTooltip":function(d){return "mainkan bunyi pilihan."},
"playSoundWinPoint":function(d){return "Putar suara  titik menang"},
"playSoundWinPoint2":function(d){return "Putar suara titik menang 2"},
"playSoundWood":function(d){return "mainkan suara kayu"},
"positionOutTopLeft":function(d){return "ke atas posisi kiri atas"},
"positionOutTopRight":function(d){return "ke atas posisi kanan atas"},
"positionTopOutLeft":function(d){return "ke paling atas di luar posisi kiri"},
"positionTopLeft":function(d){return "ke posisi kiri atas"},
"positionTopCenter":function(d){return "ke posisi tengah atas"},
"positionTopRight":function(d){return "ke posisi kanan atas"},
"positionTopOutRight":function(d){return "ke paling atas di luar posisi kanan"},
"positionMiddleLeft":function(d){return "ke tengah posisi kiri"},
"positionMiddleCenter":function(d){return "ke tengah posisi tengah"},
"positionMiddleRight":function(d){return "ke tengah posisi kanan"},
"positionBottomOutLeft":function(d){return "ke bawah posisi kiri luar"},
"positionBottomLeft":function(d){return "ke bawah posisi kiri"},
"positionBottomCenter":function(d){return "ke bawah posisi tengah"},
"positionBottomRight":function(d){return "ke bawah posisi kanan"},
"positionBottomOutRight":function(d){return "ke bawah posisi kanan luar"},
"positionOutBottomLeft":function(d){return "ke bawah bagian bawah posisi kiri"},
"positionOutBottomRight":function(d){return "ke bawah bagian bawah sebelah kanan"},
"positionRandom":function(d){return "ke posisi acak"},
"projectileBlueFireball":function(d){return "bola api biru"},
"projectilePurpleFireball":function(d){return "bola api ungu"},
"projectileRedFireball":function(d){return "bola api merah"},
"projectileYellowHearts":function(d){return "hati kuning"},
"projectilePurpleHearts":function(d){return "hati ungu"},
"projectileRedHearts":function(d){return "hati merah"},
"projectileRandom":function(d){return "acak"},
"projectileAnna":function(d){return "Hook"},
"projectileElsa":function(d){return "kilauan"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "roket"},
"projectileRapunzel":function(d){return "panci"},
"projectileCherry":function(d){return "ceri"},
"projectileIce":function(d){return "es"},
"projectileDuck":function(d){return "bebek"},
"reinfFeedbackMsg":function(d){return "Anda dapat menekan tombol \"Coba lagi\" untuk kembali bermain."},
"repeatForever":function(d){return "Ulangi selamanya"},
"repeatDo":function(d){return "kerjakan"},
"repeatForeverTooltip":function(d){return "jalankan tindakan-tindakan dalam  blok ini saat cerita masih berjalan"},
"saySprite":function(d){return "mengatakan"},
"saySpriteN":function(d){return "aktor "+appLocale.v(d,"spriteIndex")+" mengatakan"},
"saySpriteTooltip":function(d){return "Munculkan pop up dengan teks dari aktor tertentu."},
"saySpriteChoices_1":function(d){return "Hai!"},
"saySpriteChoices_2":function(d){return "Bagaimana kabarmu?"},
"saySpriteChoices_3":function(d){return "Ini menyenangkan..."},
"scoreText":function(d){return "Skor: "+appLocale.v(d,"playerScore")},
"setBackground":function(d){return "atur latar belakang"},
"setBackgroundRandom":function(d){return "tetapkan latar belakang acak"},
"setBackgroundBlack":function(d){return "menetapkan latar belakang hitam"},
"setBackgroundCave":function(d){return "set latar belakang gua"},
"setBackgroundCloudy":function(d){return "menetapkan latar belakang berawan"},
"setBackgroundHardcourt":function(d){return "set latar belakang hardcourt"},
"setBackgroundNight":function(d){return "atur latar belakang malam hari"},
"setBackgroundUnderwater":function(d){return "menetapkan latar belakang bawah air"},
"setBackgroundCity":function(d){return "atur latar belakang kota"},
"setBackgroundDesert":function(d){return "atur latar belakang padang pasir"},
"setBackgroundRainbow":function(d){return "atur latar belakang pelangi"},
"setBackgroundSoccer":function(d){return "atur latar belakang sepak bola"},
"setBackgroundSpace":function(d){return "atur latar belakang luar angkasa"},
"setBackgroundTennis":function(d){return "atur latar belakang tennis"},
"setBackgroundWinter":function(d){return "atur latar belakang musim dingin"},
"setBackgroundLeafy":function(d){return "Menetapkan latar belakang berdaun"},
"setBackgroundGrassy":function(d){return "Menetapkan latar belakang berumput"},
"setBackgroundFlower":function(d){return "Menetapkan latar belakang bunga"},
"setBackgroundTile":function(d){return "Menetapkan latar belakang tile"},
"setBackgroundIcy":function(d){return "Menetapkan latar belakang es"},
"setBackgroundSnowy":function(d){return "Menetapkan latar belakang bersalju"},
"setBackgroundTooltip":function(d){return "Atur gambar latar belakang"},
"setEnemySpeed":function(d){return "atur kecepatan musuh"},
"setPlayerSpeed":function(d){return "Atur kecepatan pemain"},
"setScoreText":function(d){return "tetapkan skor"},
"setScoreTextTooltip":function(d){return "atur teks yang ditampilkan di area skor"},
"setSpriteEmotionAngry":function(d){return "menjadi suasana hati marah"},
"setSpriteEmotionHappy":function(d){return "menjadi suasana hati bahagia"},
"setSpriteEmotionNormal":function(d){return "menjadi suasana yang normal"},
"setSpriteEmotionRandom":function(d){return "menjadi suasana hati acak"},
"setSpriteEmotionSad":function(d){return "menjadi suasana hati sedih"},
"setSpriteEmotionTooltip":function(d){return "Tetapkan suasana hati aktor"},
"setSpriteAlien":function(d){return "menjadi gambar alien"},
"setSpriteBat":function(d){return "untuk ke gambar kelelawar"},
"setSpriteBird":function(d){return "untuk ke gambar burung"},
"setSpriteCat":function(d){return "menjadi sebuah gambar kucing"},
"setSpriteCaveBoy":function(d){return "menjadi gambar anak gua laki-laki"},
"setSpriteCaveGirl":function(d){return "menjadi gambar anak gua perempuan"},
"setSpriteDinosaur":function(d){return "menjadi gambar dinosaurus"},
"setSpriteDog":function(d){return "menjadi gambar anjing"},
"setSpriteDragon":function(d){return "untuk ke gambar naga"},
"setSpriteGhost":function(d){return "menjadi gambar hantu"},
"setSpriteHidden":function(d){return "untuk gambar yang tersembunyi"},
"setSpriteHideK1":function(d){return "Sembunyikan"},
"setSpriteAnna":function(d){return "atur gambar Anna"},
"setSpriteElsa":function(d){return "atur gambar Elsa"},
"setSpriteHiro":function(d){return "atur gambar Hiro"},
"setSpriteBaymax":function(d){return "atur gambar Baymax"},
"setSpriteRapunzel":function(d){return "atur Gambar Rapunzel"},
"setSpriteKnight":function(d){return "menjadi gambar knight"},
"setSpriteMonster":function(d){return "menjadi gambar raksasa"},
"setSpriteNinja":function(d){return "menjadi gambar ninja bertopeng"},
"setSpriteOctopus":function(d){return "ke gambar gurita"},
"setSpritePenguin":function(d){return "menjadi gambar pinguin"},
"setSpritePirate":function(d){return "menjadi gambar bajak laut"},
"setSpritePrincess":function(d){return "menjadi gambar putri"},
"setSpriteRandom":function(d){return "untuk gambar yang acak"},
"setSpriteRobot":function(d){return "menjadi gambar robot"},
"setSpriteShowK1":function(d){return "tampilkan "},
"setSpriteSpacebot":function(d){return "menjadi gambar robot luar angkasa"},
"setSpriteSoccerGirl":function(d){return "menjadi gambar gadis sepakbola"},
"setSpriteSoccerBoy":function(d){return "menjadi gambar laki-laki sepakbola"},
"setSpriteSquirrel":function(d){return "untuk ke gambar tupai"},
"setSpriteTennisGirl":function(d){return "menjadi gambar perempuan tenis"},
"setSpriteTennisBoy":function(d){return "menjadi gambar laki-laki tenis"},
"setSpriteUnicorn":function(d){return "menjadi gambar unicorn"},
"setSpriteWitch":function(d){return "menjadi gambar penyihir"},
"setSpriteWizard":function(d){return "untuk ke gambar penyihir"},
"setSpritePositionTooltip":function(d){return "gerakkan langsung aktor ke tempat yang ditentukan"},
"setSpriteK1Tooltip":function(d){return "tampilkan atau sembunyikan aktor tertentu"},
"setSpriteTooltip":function(d){return "atur gambar aktor"},
"setSpriteSizeRandom":function(d){return "untuk ukuran acak"},
"setSpriteSizeVerySmall":function(d){return "untuk ukuran sangat kecil"},
"setSpriteSizeSmall":function(d){return "untuk ukuran kecil"},
"setSpriteSizeNormal":function(d){return "untuk ukuran normal"},
"setSpriteSizeLarge":function(d){return "untuk ukuran besar"},
"setSpriteSizeVeryLarge":function(d){return "untuk ukuran sangat besar"},
"setSpriteSizeTooltip":function(d){return "Sekumpulan ukuran aktor"},
"setSpriteSpeedRandom":function(d){return "untuk kecepatan acak"},
"setSpriteSpeedVerySlow":function(d){return "untuk kecepatan sangat lambat"},
"setSpriteSpeedSlow":function(d){return "untuk kecepatan lambat"},
"setSpriteSpeedNormal":function(d){return "untuk kecepatan normal"},
"setSpriteSpeedFast":function(d){return "untuk kecepatan tinggi"},
"setSpriteSpeedVeryFast":function(d){return "untuk kecepatan sangat cepat"},
"setSpriteSpeedTooltip":function(d){return "atur kecepatan aktor"},
"setSpriteZombie":function(d){return "menjadi gambar zombie"},
"shareStudioTwitter":function(d){return "Periksalah cerita saya dibuat. Saya menulis itu sendiri dengan @codeorg"},
"shareGame":function(d){return "Berbagi cerita Anda:"},
"showCoordinates":function(d){return "tampilkan koordinat"},
"showCoordinatesTooltip":function(d){return "tampilkan koordinat pemeran utama pada layar"},
"showTitleScreen":function(d){return "Tampilkan layar judul"},
"showTitleScreenTitle":function(d){return "judul"},
"showTitleScreenText":function(d){return "teks"},
"showTSDefTitle":function(d){return "Ketik Judul Disini"},
"showTSDefText":function(d){return "Ketik teks disini"},
"showTitleScreenTooltip":function(d){return "Tampilkan layar judul dengan judul dan teks terkait."},
"size":function(d){return "ukuran"},
"setSprite":function(d){return "tetapkan"},
"setSpriteN":function(d){return "pasang aktor\n"},
"soundCrunch":function(d){return "menjongkok"},
"soundGoal1":function(d){return "tujuan 1"},
"soundGoal2":function(d){return "tujuan 2"},
"soundHit":function(d){return "kenai"},
"soundLosePoint":function(d){return "poin kekalahan"},
"soundLosePoint2":function(d){return "poin kekalahan 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "karet"},
"soundSlap":function(d){return "tampar"},
"soundWinPoint":function(d){return "poin menang"},
"soundWinPoint2":function(d){return "poin menang 2"},
"soundWood":function(d){return "kayu"},
"speed":function(d){return "kecepatan"},
"startSetValue":function(d){return "Mulai (fungsi roket ketinggian)"},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "Stop"},
"stopSpriteN":function(d){return "berhentikan aktor"},
"stopTooltip":function(d){return "hentikan gerakan seorang pemeran."},
"throwSprite":function(d){return "Lempar"},
"throwSpriteN":function(d){return "aktor tersebut melempar"},
"throwTooltip":function(d){return "melempar sebuah objek ke aktor tertentu"},
"vanish":function(d){return "menghilang"},
"vanishActorN":function(d){return "menghilangkan aktor "+appLocale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Lenyapkan aktor."},
"waitFor":function(d){return "menunggu untuk"},
"waitSeconds":function(d){return "detik"},
"waitForClick":function(d){return "menunggu untuk klik"},
"waitForRandom":function(d){return "tunggu untuk sesuai yang acak"},
"waitForHalfSecond":function(d){return "tunggu untuk setengah detik"},
"waitFor1Second":function(d){return "tunggu 1 detik"},
"waitFor2Seconds":function(d){return "tunggu 2 detik"},
"waitFor5Seconds":function(d){return "tunggu selama 5 detik"},
"waitFor10Seconds":function(d){return "tunggu selama 10 detik"},
"waitParamsTooltip":function(d){return "tunggu sampai angka tertentu, atau gunakan angka nol sampai suatu klik terjadi"},
"waitTooltip":function(d){return "tunggu untuk waktu yang tertentu atau tunggu sampai suatu klik terjadi."},
"whenArrowDown":function(d){return "panah kebawah"},
"whenArrowLeft":function(d){return "panah kekiri"},
"whenArrowRight":function(d){return "panah kekanan"},
"whenArrowUp":function(d){return "panah keatas"},
"whenArrowTooltip":function(d){return "Lakukan aksi dibawah ini ketika panah yang tertentu sudah terpencet"},
"whenDown":function(d){return "ketika panah bawah"},
"whenDownTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kebawah ditekan."},
"whenGameStarts":function(d){return "Ketika cerita dimulai"},
"whenGameStartsTooltip":function(d){return "Melaksanakan tindakan-tindakan di bawah ini ketika cerita dimulai."},
"whenLeft":function(d){return "Ketika anak panah kiri"},
"whenLeftTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kiri ditekan."},
"whenRight":function(d){return "ketika anak panah kanan"},
"whenRightTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah kanan ditekan."},
"whenSpriteClicked":function(d){return "ketika aktor meng-klik"},
"whenSpriteClickedN":function(d){return "ketika aktor klik"},
"whenSpriteClickedTooltip":function(d){return "Laksanakan tindakan di bawah ini ketika aktor sudah di klik"},
"whenSpriteCollidedN":function(d){return "ketika aktor"},
"whenSpriteCollidedTooltip":function(d){return "Lakukan kegiatan di bawah ketika seorang aktor menyentuh aktor lainnya"},
"whenSpriteCollidedWith":function(d){return "menyentuh"},
"whenSpriteCollidedWithAnyActor":function(d){return "sentuh aktor apa saja"},
"whenSpriteCollidedWithAnyEdge":function(d){return "sentuh tepi apa saja"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "sentuh proyektil apa saja"},
"whenSpriteCollidedWithAnything":function(d){return "sentuh apa saja"},
"whenSpriteCollidedWithN":function(d){return "menyentuh aktor"},
"whenSpriteCollidedWithBlueFireball":function(d){return "menyentuh bola api biru"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "menyentuh bola api ungu"},
"whenSpriteCollidedWithRedFireball":function(d){return "menyentuh bola api merah"},
"whenSpriteCollidedWithYellowHearts":function(d){return "menyentuh bola api kuning"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "menyentuh bola api ungu"},
"whenSpriteCollidedWithRedHearts":function(d){return "menyentuh bola api merah"},
"whenSpriteCollidedWithBottomEdge":function(d){return "menyentuh ujung bawah"},
"whenSpriteCollidedWithLeftEdge":function(d){return "menyentuh ujung kiri"},
"whenSpriteCollidedWithRightEdge":function(d){return "menyentuh ujung kanan"},
"whenSpriteCollidedWithTopEdge":function(d){return "menyentuh ujung atas"},
"whenUp":function(d){return "ketika anak panah atas"},
"whenUpTooltip":function(d){return "Laksanakan tindakan-tindakan di bawah ini ketika tombol panah keatas ditekan."},
"yes":function(d){return "Ya"}};