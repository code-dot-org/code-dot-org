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
"blockDestroyBlock":function(d){return "bloğu yok et"},
"blockIf":function(d){return "eğer"},
"blockIfLavaAhead":function(d){return "eğer ileride lav varsa"},
"blockMoveForward":function(d){return "ilerle"},
"blockPlaceTorch":function(d){return "meşaleyi yerleştir"},
"blockPlaceXAheadAhead":function(d){return "ileri"},
"blockPlaceXAheadPlace":function(d){return "yerleştir"},
"blockPlaceXPlace":function(d){return "yerleştir"},
"blockPlantCrop":function(d){return "ekin ek"},
"blockShear":function(d){return "kırp"},
"blockTillSoil":function(d){return "toprağı sür"},
"blockTurnLeft":function(d){return "sola dön"},
"blockTurnRight":function(d){return "sağa dön"},
"blockTypeBedrock":function(d){return "kaya"},
"blockTypeBricks":function(d){return "tuğlalar"},
"blockTypeClay":function(d){return "kil"},
"blockTypeClayHardened":function(d){return "sertleşmiş kil"},
"blockTypeCobblestone":function(d){return "parke taşı"},
"blockTypeDirt":function(d){return "toprak"},
"blockTypeDirtCoarse":function(d){return "kaba toprak"},
"blockTypeEmpty":function(d){return "boş"},
"blockTypeFarmlandWet":function(d){return "tarla"},
"blockTypeGlass":function(d){return "cam"},
"blockTypeGrass":function(d){return "çimen"},
"blockTypeGravel":function(d){return "çakıl"},
"blockTypeLava":function(d){return "lav"},
"blockTypeLogAcacia":function(d){return "akasya kütüğü"},
"blockTypeLogBirch":function(d){return "huş ağacı kütüğü"},
"blockTypeLogJungle":function(d){return "tropik kütük"},
"blockTypeLogOak":function(d){return "meşe kütüğü"},
"blockTypeLogSpruce":function(d){return "ladin kütüğü"},
"blockTypeOreCoal":function(d){return "kömür cevheri"},
"blockTypeOreDiamond":function(d){return "elmas cevheri"},
"blockTypeOreEmerald":function(d){return "zümrüt cevheri"},
"blockTypeOreGold":function(d){return "altın cevheri"},
"blockTypeOreIron":function(d){return "demir cevheri"},
"blockTypeOreLapis":function(d){return "lapis cevheri"},
"blockTypeOreRedstone":function(d){return "redstone cevheri"},
"blockTypePlanksAcacia":function(d){return "akasya kalasları"},
"blockTypePlanksBirch":function(d){return "huş kalasları"},
"blockTypePlanksJungle":function(d){return "tropik kalaslar"},
"blockTypePlanksOak":function(d){return "meşe kalasları"},
"blockTypePlanksSpruce":function(d){return "ladin kalasları"},
"blockTypeRail":function(d){return "ray"},
"blockTypeSand":function(d){return "kum"},
"blockTypeSandstone":function(d){return "kumtaşı"},
"blockTypeStone":function(d){return "taş"},
"blockTypeTnt":function(d){return "TNT"},
"blockTypeTree":function(d){return "ağaç"},
"blockTypeWater":function(d){return "su"},
"blockTypeWool":function(d){return "yün"},
"blockWhileXAheadAhead":function(d){return "ileri"},
"blockWhileXAheadDo":function(d){return "yap"},
"blockWhileXAheadWhile":function(d){return "sürece"},
"generatedCodeDescription":function(d){return "Blokları bulmacaya sürükleyip yerleştirerek Javascript adı verilen bir bilgisayar dilinde bir dizi komutlar oluşturmuş oldunuz. Bu kod, bilgisayarlara ekranda ne gösterilmesi gerektiğini söyler. Minecraft'te gördüğünüz ve yaptığınız her şey de aynı bu şekilde bilgisayar kodlarıyla başlar."},
"houseSelectChooseFloorPlan":function(d){return "Evin için zemin planı seç."},
"houseSelectEasy":function(d){return "Kolay"},
"houseSelectHard":function(d){return "Zor"},
"houseSelectLetsBuild":function(d){return "Bir ev inşa edelim."},
"houseSelectMedium":function(d){return "Orta"},
"keepPlayingButton":function(d){return "Oynamaya devam et"},
"level10FailureMessage":function(d){return "Lavların üstünden geçmek için üstünü ört ve daha sonra diğer taraftaki demir bloklarını topla."},
"level11FailureMessage":function(d){return "Eğer ileride lava varsa parke taşı yerleştirdiğinden emin ol. Böylece bu sıradaki kaynakları güvenli bir şekilde toplayabileceksin."},
"level12FailureMessage":function(d){return "3 redstone bloğu topladığından emin ol. Bu sayede evini yaparken öğrendiklerini ve lav içine düşmemek için kullanırken öğrendiğin \"eğer\" komutunu birleştimiş olacaksın."},
"level13FailureMessage":function(d){return "Kapının önünden haritanın kenarına doğru patika boyuca \"ray\" yerleştir."},
"level1FailureMessage":function(d){return "Koyunun yanına yürümek için komutlar kullanmalısın."},
"level1TooFewBlocksMessage":function(d){return "Koyunun yanına yürümek için daha fazla komut kullan."},
"level2FailureMessage":function(d){return "Bir ağacı kesmek için gövdesinin yanına yürü ve \"bloğu yoket\" komutunu kullan."},
"level2TooFewBlocksMessage":function(d){return "Ağacı kesmek için daha fazla komut kullan. Gövdesinin yanına yürü ve \"bloğu yoket\" komutunu kullan."},
"level3FailureMessage":function(d){return "Her iki koyundan da yün toplamak için her birinin yanına yürü ve \"kırp\" komutunu kullan. Koyunların yanına ulaşmak için dön komutlarını kullanmayı unutma."},
"level3TooFewBlocksMessage":function(d){return "Her iki koyundan yün toplamak için daha fazla komut kullanmayı deneyin. Her birine doğru yürüyün ve \"kırp\" komutunu kullanın."},
"level4FailureMessage":function(d){return "Üç ağaç gövdesinde de \"bloğu yok et\" komutunu kullanmalısın."},
"level5FailureMessage":function(d){return "Bir duvar inşa etmek için toprak alan üzerine yerleştir. Pembe renkli \"tekrar et\" komutu içindeki, \"bloğu yerleştir\" ve \"ileri hareket et\" gibi komutları çalıştırır."},
"level6FailureMessage":function(d){return "Bulmacayı tamamlamak için evin dışındaki toprak alan üstüne bloklar yerleştir."},
"level7FailureMessage":function(d){return "Koyu renkli sürülmüş toprak parçalarına bitki yerleştirmek için \"bitki ek\" komutunu kullan."},
"level8FailureMessage":function(d){return "Eğer bir canavara dokunursan patlar. Çevrelerinden dolaş ve evine gir."},
"level9FailureMessage":function(d){return "Yolunu aydınlatmak için en az 2 meşale yerleştirmeyi VE en az 2 kömür toplamayı unutma."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return craft_locale.v(d,"puzzleNumber")+" numaralı bulmaca tamamlandı. Tebrikler!"},
"playerSelectChooseCharacter":function(d){return "Karakterini seç."},
"playerSelectChooseSelectButton":function(d){return "Seç"},
"playerSelectLetsGetStarted":function(d){return "Haydi Başlayalım."},
"reinfFeedbackMsg":function(d){return "\"Oynamaya Devam Et\" butonuna basarak oyununuzu oynamaya devam edebilirsiniz."},
"replayButton":function(d){return "Tekrar çalıştır"},
"selectChooseButton":function(d){return "Seç"},
"tooManyBlocksFail":function(d){return craft_locale.v(d,"puzzleNumber")+" numaralı bulmaca tamamlandı. Tebrikler! Bunu aynı zamanda şu şekilde tamamlamak da mümkün: "+craft_locale.p(d,"numBlocks",0,"tr",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};