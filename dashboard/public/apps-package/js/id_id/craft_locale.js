var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "hancurkan balok"},
"blockIf":function(d){return "jika"},
"blockIfLavaAhead":function(d){return "jika lava mengadang"},
"blockMoveForward":function(d){return "Gerak maju"},
"blockPlaceTorch":function(d){return "letakkan obor"},
"blockPlaceXAheadAhead":function(d){return "adang"},
"blockPlaceXAheadPlace":function(d){return "letakkan"},
"blockPlaceXPlace":function(d){return "letakkan"},
"blockPlantCrop":function(d){return "tanam bibit"},
"blockShear":function(d){return "cukur"},
"blockTillSoil":function(d){return "bajak tanah"},
"blockTurnLeft":function(d){return "belok kiri"},
"blockTurnRight":function(d){return "belok kanan"},
"blockTypeBedrock":function(d){return "fondasi"},
"blockTypeBricks":function(d){return "batu bata"},
"blockTypeClay":function(d){return "tanah liat"},
"blockTypeClayHardened":function(d){return "tanah liat dikeraskan"},
"blockTypeCobblestone":function(d){return "batu alam"},
"blockTypeDirt":function(d){return "tanah"},
"blockTypeDirtCoarse":function(d){return "tanah kasar"},
"blockTypeEmpty":function(d){return "kosong"},
"blockTypeFarmlandWet":function(d){return "pertanian"},
"blockTypeGlass":function(d){return "kaca"},
"blockTypeGrass":function(d){return "rumput"},
"blockTypeGravel":function(d){return "batu kerikil"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "batang pohon akasia"},
"blockTypeLogBirch":function(d){return "batang pohon birch"},
"blockTypeLogJungle":function(d){return "batang pohon hutan"},
"blockTypeLogOak":function(d){return "batang pohon ek"},
"blockTypeLogSpruce":function(d){return "batang pohon spruce"},
"blockTypeOreCoal":function(d){return "bijih batu bara"},
"blockTypeOreDiamond":function(d){return "bijih berlian"},
"blockTypeOreEmerald":function(d){return "bijih zamrud"},
"blockTypeOreGold":function(d){return "bijih emas"},
"blockTypeOreIron":function(d){return "bijih besi"},
"blockTypeOreLapis":function(d){return "bijih batu lapis"},
"blockTypeOreRedstone":function(d){return "bijih batu merah"},
"blockTypePlanksAcacia":function(d){return "papan kayu pohon akasia"},
"blockTypePlanksBirch":function(d){return "papan kayu pohon birch"},
"blockTypePlanksJungle":function(d){return "papan kayu hutan"},
"blockTypePlanksOak":function(d){return "papan kayu pohon ek"},
"blockTypePlanksSpruce":function(d){return "papan kayu pohon spruce"},
"blockTypeRail":function(d){return "jalan rel"},
"blockTypeSand":function(d){return "pasir"},
"blockTypeSandstone":function(d){return "batu pasir"},
"blockTypeStone":function(d){return "batu"},
"blockTypeTnt":function(d){return "bom"},
"blockTypeTree":function(d){return "pohon"},
"blockTypeWater":function(d){return "air"},
"blockTypeWool":function(d){return "wol"},
"blockWhileXAheadAhead":function(d){return "adang"},
"blockWhileXAheadDo":function(d){return "kerjakan"},
"blockWhileXAheadWhile":function(d){return "Selagi"},
"generatedCodeDescription":function(d){return "Dengan menyeret dan menempatkan balok di teka-teki ini, kamu membuat sekumpulan instruksi dalam bahasa komputer bernama Javascript. Kode ini memberi tahu komputer apa yang harus ditampilkan pada layar. Semua yang kamu lihat dan lakukan di Minecraft juga diawali dengan barisan kode komputer seperti ini."},
"houseSelectChooseFloorPlan":function(d){return "Pilih denah lantai untuk rumah kamu."},
"houseSelectEasy":function(d){return "Mudah"},
"houseSelectHard":function(d){return "Sulit"},
"houseSelectLetsBuild":function(d){return "Ayo kita bangun rumah."},
"houseSelectMedium":function(d){return "Sedang"},
"keepPlayingButton":function(d){return "Tetap Mainkan"},
"level10FailureMessage":function(d){return "Tutup lava untuk berjalan melintasinya, lalu gali dua balok besi di sisi lain."},
"level11FailureMessage":function(d){return "Pastikan untuk menempatkan batu alam dahulu jika ada lava yang mengadang. Karenanya kamu bisa menggali deretan sumber daya ini dengan aman."},
"level12FailureMessage":function(d){return "Pastikan untuk menggali 3 balok batu merah. Hal ini memadukan apa yang sudah kamu pelajari dari membangun rumah dan menggunakan pernyataan \"jika\" untuk menghindari terjatuh di lava."},
"level13FailureMessage":function(d){return "Tempatkan \"jalan rel\" sepanjang jalan setapak bertanah mulai pintu kamu hingga tepi peta."},
"level1FailureMessage":function(d){return "Kamu harus menggunakan perintah untuk berjalan kaki ke domba."},
"level1TooFewBlocksMessage":function(d){return "Coba gunakan lebih banyak perintah untuk berjalan kaki ke domba."},
"level2FailureMessage":function(d){return "Untuk menebang pohon, jalan kaki ke batang dan gunakan perintah \"hancurkan balok\"."},
"level2TooFewBlocksMessage":function(d){return "Coba gunakan lebih banyak perintah untuk menebang pohon. Jalan kaki ke batangnya dan gunakan perintah \"hancurkan balok\"."},
"level3FailureMessage":function(d){return "Untuk mengumpulkan wol dari kedua domba, jalan kaki ke tiap domba dan gunakan perintah \"cukur\". Ingat untuk menggunakan perintah putar untuk mencapai domba."},
"level3TooFewBlocksMessage":function(d){return "Coba gunakan lebih banyak perintah untuk mengumpulkan wol dari kedua domba. Jalan kaki ke masing-masing domba dan gunakan perintah \"cukur\"."},
"level4FailureMessage":function(d){return "Kamu harus menggunakan perintah \"hancurkan balok\" pada ketiga batang pohon."},
"level5FailureMessage":function(d){return "Tempatkan balok kamu di garis tepi tanah untuk membangun dinding. Perintah \"ulangi\" berwarna merah muda akan menjalankan perintah yang ditempatkan di dalamnya, seperti \"tempatkan balok\" dan \"bergerak maju\"."},
"level6FailureMessage":function(d){return "Tempatkan balok di garis tepi tanah rumah untuk menyelesaikan teka-teki."},
"level7FailureMessage":function(d){return "Gunakan perintah \"tanam\" untuk menempatkan bibit di tiap petak tanah berwarna gelap yang telah dibajak."},
"level8FailureMessage":function(d){return "Jika kamu menyentuh creeper, maka ia akan meledak. Menyelinap di sekitar mereka dan masuki rumahmu."},
"level9FailureMessage":function(d){return "Jangan lupa untuk menempatkan setidaknya 2 obor untuk menerangi jalan kamu DAN gali setidaknya 2 batu bara."},
"minecraftBlock":function(d){return "balok"},
"nextLevelMsg":function(d){return "Teka-teki "+craft_locale.v(d,"puzzleNumber")+" selesai. Selamat!"},
"playerSelectChooseCharacter":function(d){return "Pilih karakter kamu."},
"playerSelectChooseSelectButton":function(d){return "Pilih"},
"playerSelectLetsGetStarted":function(d){return "Ayo kita mulai."},
"reinfFeedbackMsg":function(d){return "Kamu bisa menekan \"Tetap Main\" untuk kembali memainkan permainan kamu."},
"replayButton":function(d){return "Mainkan kembali"},
"selectChooseButton":function(d){return "Pilih"},
"tooManyBlocksFail":function(d){return "Teka-teki "+craft_locale.v(d,"puzzleNumber")+" selesai. Selamat! Kamu juga bisa menyelesaikannya dengan "+craft_locale.p(d,"numBlocks",0,"id",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};