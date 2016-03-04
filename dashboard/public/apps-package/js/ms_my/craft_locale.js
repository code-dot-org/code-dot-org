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
"blockDestroyBlock":function(d){return "musnahkan blok"},
"blockIf":function(d){return "jika"},
"blockIfLavaAhead":function(d){return "jika ada lava dihadapan"},
"blockMoveForward":function(d){return "bergerak ke hadapan"},
"blockPlaceTorch":function(d){return "letakkan obor"},
"blockPlaceXAheadAhead":function(d){return "di hadapan"},
"blockPlaceXAheadPlace":function(d){return "letakkan"},
"blockPlaceXPlace":function(d){return "letakkan"},
"blockPlantCrop":function(d){return "tanaman"},
"blockShear":function(d){return "gunting"},
"blockTillSoil":function(d){return "tanah longgar"},
"blockTurnLeft":function(d){return "belok kiri"},
"blockTurnRight":function(d){return "belok kanan"},
"blockTypeBedrock":function(d){return "batuan dasar"},
"blockTypeBricks":function(d){return "batu-bata"},
"blockTypeClay":function(d){return "tanah liat"},
"blockTypeClayHardened":function(d){return "tanah liat keras"},
"blockTypeCobblestone":function(d){return "batu kobel"},
"blockTypeDirt":function(d){return "tanah"},
"blockTypeDirtCoarse":function(d){return "tanah kasar"},
"blockTypeEmpty":function(d){return "kosong"},
"blockTypeFarmlandWet":function(d){return "tanah ladang"},
"blockTypeGlass":function(d){return "kaca"},
"blockTypeGrass":function(d){return "rumput"},
"blockTypeGravel":function(d){return "batu kerikil"},
"blockTypeLava":function(d){return "lava"},
"blockTypeLogAcacia":function(d){return "batang pokok akasia"},
"blockTypeLogBirch":function(d){return "batang pokok birch"},
"blockTypeLogJungle":function(d){return "batang pokok hutan"},
"blockTypeLogOak":function(d){return "batang pokok oak"},
"blockTypeLogSpruce":function(d){return "batang pokok sprus"},
"blockTypeOreCoal":function(d){return "bijih arang batu"},
"blockTypeOreDiamond":function(d){return "bijih berlian"},
"blockTypeOreEmerald":function(d){return "bijih zamrud"},
"blockTypeOreGold":function(d){return "bijih emas"},
"blockTypeOreIron":function(d){return "bijih besi"},
"blockTypeOreLapis":function(d){return "bijih lazuardi"},
"blockTypeOreRedstone":function(d){return "bijih batu merah"},
"blockTypePlanksAcacia":function(d){return "papan akasia"},
"blockTypePlanksBirch":function(d){return "papan birch"},
"blockTypePlanksJungle":function(d){return "papan kayu hutan"},
"blockTypePlanksOak":function(d){return "papan oak"},
"blockTypePlanksSpruce":function(d){return "papan sprus"},
"blockTypeRail":function(d){return "landasan"},
"blockTypeSand":function(d){return "pasir"},
"blockTypeSandstone":function(d){return "batu pasir"},
"blockTypeStone":function(d){return "batu"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "pokok"},
"blockTypeWater":function(d){return "air"},
"blockTypeWool":function(d){return "wul"},
"blockWhileXAheadAhead":function(d){return "di hadapan"},
"blockWhileXAheadDo":function(d){return "buat"},
"blockWhileXAheadWhile":function(d){return "semasa"},
"generatedCodeDescription":function(d){return "Dengan mengheret dan meletakkan blok dalam teka-teki ini, anda telah mencipta satu set arahan dalam Bahasa komputer yang dipanggil Javascript. Kod ini memberitahu komputer apa yang boleh dipaparkan pada skrin. Segala-galanya yang anda dilihat dan dilakukan di Minecraft juga bermula dengan baris kod komputer seperti ini."},
"houseSelectChooseFloorPlan":function(d){return "Pilih pelan lantai rumah anda."},
"houseSelectEasy":function(d){return "Mudah"},
"houseSelectHard":function(d){return "Susah"},
"houseSelectLetsBuild":function(d){return "Mari kita membina rumah."},
"houseSelectMedium":function(d){return "Sederhana"},
"keepPlayingButton":function(d){return "Teruskan main"},
"level10FailureMessage":function(d){return "Tutupkan lava sebelum menyeberang. Seterusnya, memperolehi blok besi yang didapati di seberang."},
"level11FailureMessage":function(d){return "Pastikan anda meletak cobblestone jika ada lava di depan. Ini adalah untuk memastikan keselamatan anda ketika melombong."},
"level12FailureMessage":function(d){return "Pastikan anda memperolehi sekurang-kurangya tiga blok batu merah. Menggabungkan pengetahuan daripada pembinaan rumah anda dan pengunaan statement \"if\" untuk mengelak jatuh ke dalam lava."},
"level13FailureMessage":function(d){return "Letakkan \"landasan\" di sepanjang laluan tanah yang menuju ke pintu rumah anda."},
"level1FailureMessage":function(d){return "Anda perlu menggunakan \"commands\" untuk membimbing biri-biri itu."},
"level1TooFewBlocksMessage":function(d){return "Cuba gunakan pelbagai jenis \"commands\" untuk membimbing biri-biri tersebut."},
"level2FailureMessage":function(d){return "Untuk memotongkan pokok, jalan ke depan pokok tersebut dan guna command \"destroy block\"."},
"level2TooFewBlocksMessage":function(d){return "Cuba guna lagi banyak commands untuk memotong pokok tersebut. Jalan ke depan pokok dan guna command \"destroy block\"."},
"level3FailureMessage":function(d){return "Untuk mendapatkan bulu biri-biri daripada kedua-dua biri-biri itu, hadap ke depan biri-biri dan menggunakan command \"shear\". Jangan lupa untuk menggunakan command \"turn\" untuk menyampaii biri-biri."},
"level3TooFewBlocksMessage":function(d){return "Cuba guna lagi banyak commands untuk medapatkan bulu biri-biri tersebut. Jalan ke depan biri-biri dan guna command \"shear\"."},
"level4FailureMessage":function(d){return "Anda perlu menggunakan command \"destroy block\" bagi ketiga-tiga batang pokok."},
"level5FailureMessage":function(d){return "Meletakkan blok anda pada garisan tanah untuk membina dinding. Command merah jambu \"repeat\" tu akan mengulang command yang didapati di dalam, contohnya \"meletak blok\" dan \"maju\"."},
"level6FailureMessage":function(d){return "Meletakkan blok ukur lilit tanah rumah untuk menyelesaikan teka-teki."},
"level7FailureMessage":function(d){return "Menggunakan arahan \"plant\" untuk meletakkan tanaman pada setiap tampalan tanah tilled gelap."},
"level8FailureMessage":function(d){return "Jika anda sentuh creeper, ia akan meletup. Menyelinap di sekeliling mereka dan memasuki rumah anda."},
"level9FailureMessage":function(d){return "Jangan lupa untuk meletakkan sekurang-kurangnya 2 torches kepada cahaya cara anda dan sekurang-kurangnya 2 lombong arang batu."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Teka-teki "+craft_locale.v(d,"puzzleNumber")+" selesai. Tahniah!"},
"playerSelectChooseCharacter":function(d){return "Memilih watak anda."},
"playerSelectChooseSelectButton":function(d){return "Pilih"},
"playerSelectLetsGetStarted":function(d){return "Mari kita bermula."},
"reinfFeedbackMsg":function(d){return "Anda boleh menekan \"Teruskan bermain\" untuk kembali ke bermain permainan anda."},
"replayButton":function(d){return "Mainan semula"},
"selectChooseButton":function(d){return "Pilih"},
"tooManyBlocksFail":function(d){return "Teka-teki "+craft_locale.v(d,"puzzleNumber")+" selesai. Tahniah! Ianya juga dapat melengkapkan dengan "+craft_locale.p(d,"numBlocks",0,"ms",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};