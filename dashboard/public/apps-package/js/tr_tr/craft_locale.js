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
"blockPlantCrop":function(d){return "hasat et"},
"blockShear":function(d){return "kırk"},
"blockTillSoil":function(d){return "tarla sür"},
"blockTurnLeft":function(d){return "sola dön"},
"blockTurnRight":function(d){return "sağa dön"},
"blockTypeBedrock":function(d){return "ana kaya"},
"blockTypeBricks":function(d){return "tuğlalar"},
"blockTypeClay":function(d){return "kil"},
"blockTypeClayHardened":function(d){return "sert kil"},
"blockTypeCobblestone":function(d){return "kırıktaş"},
"blockTypeDirt":function(d){return "toprak"},
"blockTypeDirtCoarse":function(d){return "ham toprak"},
"blockTypeEmpty":function(d){return "boş"},
"blockTypeFarmlandWet":function(d){return "ekilebilir arazi"},
"blockTypeGlass":function(d){return "cam"},
"blockTypeGrass":function(d){return "çim"},
"blockTypeGravel":function(d){return "çakıl"},
"blockTypeLava":function(d){return "lav"},
"blockTypeLogAcacia":function(d){return "akasya kütüğü"},
"blockTypeLogBirch":function(d){return "huş ağacı kütüğü"},
"blockTypeLogJungle":function(d){return "orman kütüğü"},
"blockTypeLogOak":function(d){return "meşe kütüğü"},
"blockTypeLogSpruce":function(d){return "çam kütüğü"},
"blockTypeOreCoal":function(d){return "kömür cevheri"},
"blockTypeOreDiamond":function(d){return "elmas cevheri"},
"blockTypeOreEmerald":function(d){return "zümrüt cevheri"},
"blockTypeOreGold":function(d){return "altın cevheri"},
"blockTypeOreIron":function(d){return "demir cevheri"},
"blockTypeOreLapis":function(d){return "lacivert taş cevheri"},
"blockTypeOreRedstone":function(d){return "kızıltaş cevheri"},
"blockTypePlanksAcacia":function(d){return "akasya kalaslar"},
"blockTypePlanksBirch":function(d){return "huş kalaslar"},
"blockTypePlanksJungle":function(d){return "orman kalasları"},
"blockTypePlanksOak":function(d){return "meşe kalaslar"},
"blockTypePlanksSpruce":function(d){return "çam kalaslar"},
"blockTypeRail":function(d){return "demiryolu"},
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
"generatedCodeDescription":function(d){return "Bu yapbozda blokları sürükleyip yerleştirerek Javascript adındaki bilgisayar dilinde bir dizi talimat oluşturdunuz. Bu kod, bilgisayarlara ekranda ne gösterileceğini söyler. Minecraft'ta gördüğünüz ve yaptığınız her şey de aynı şekilde bunun gibi bilgisayar kodu dizileriyle başlar."},
"houseSelectChooseFloorPlan":function(d){return "Eviniz için kat planını seçin."},
"houseSelectEasy":function(d){return "Kolay"},
"houseSelectHard":function(d){return "Zor"},
"houseSelectLetsBuild":function(d){return "Hadi bir ev yapalım."},
"houseSelectMedium":function(d){return "Orta"},
"keepPlayingButton":function(d){return "Oynamaya Devam Et"},
"level10FailureMessage":function(d){return "Karşıya geçmek için lavın üstünü kapatın ve ardından diğer taraftaki iki demir bloğunu çıkarın."},
"level11FailureMessage":function(d){return "Önünüzde lav varsa ileriye kırıktaş yerleştirmeyi unutmayın. Bu sayede bu kaynakları güvenli bir şekilde çıkarabilirsiniz."},
"level12FailureMessage":function(d){return "3 kızıltaşı çıkarmayı unutmayın. Bu, evinizi inşa ederken öğrendiklerinizi ve lavdan kurtulmak için \"eğer\" komutlarını kullanmayı birleştirmektedir."},
"level13FailureMessage":function(d){return "Kapınızdan haritanın ucuna kadar giden toprak yol boyunca \"ray\" yerleştirin."},
"level1FailureMessage":function(d){return "Koyunlara doğru yürümek için komutları kullanmanız gerekiyor."},
"level1TooFewBlocksMessage":function(d){return "Koyunlara doğru yürümek için daha fazla komut kullanmayı deneyin."},
"level2FailureMessage":function(d){return "Bir ağacı kesmek için ağacın gövdesine doğru yürüyün ve \"bloğu yok et\" komutunu kullanın."},
"level2TooFewBlocksMessage":function(d){return "Ağacı kesmek için daha fazla komut kullanmayı deneyin. Gövdesine doğru yürüyün ve \"bloğu yok et\" komutunu kullanın."},
"level3FailureMessage":function(d){return "Her iki koyundan da yün toplamak için koyunlara doğru yürüyün ve \"kırk\" komutunu kullanın. Koyunlara ulaşmak için dönüş komutlarını kullanmayı unutmayın."},
"level3TooFewBlocksMessage":function(d){return "Her iki koyundan da yün toplamak için daha fazla komut kullanmayı deneyin. Koyunlara doğru yürüyün ve \"kırk\" komutunu kullanın."},
"level4FailureMessage":function(d){return "Üç ağaç gövdesinin her birinde \"bloğu yok et\" komutunu kullanmalısınız."},
"level5FailureMessage":function(d){return "Bir duvar inşa etmek için bloklarınızı toprak hattına yerleştirin. Pembe \"tekrar et\" komutu, \"bloğu yerleştir\" ve \"ileri git\" gibi içine yerleştirilmiş olan komutları çalıştıracaktır."},
"level6FailureMessage":function(d){return "Yapbozu tamamlamak için blokları evin toprak hattına yerleştirin."},
"level7FailureMessage":function(d){return "Koyu renkli sürülmüş toprağın her bir parçasına ekinleri yerleştirmek için \"ek\" komutunu kullanın."},
"level8FailureMessage":function(d){return "Bir creeper'a dokunursanız patlar. Onların etrafından gizlice geçin ve evinize girin."},
"level9FailureMessage":function(d){return "Yolunuzu aydınlatmak için en az 2 meşale yerleştirmeyi VE 2 kömür çıkarmayı unutmayın."},
"minecraftBlock":function(d){return "blok"},
"nextLevelMsg":function(d){return "Yapboz "+craft_locale.v(d,"puzzleNumber")+" tamamlandı. Tebrikler!"},
"playerSelectChooseCharacter":function(d){return "Karakterinizi seçin."},
"playerSelectChooseSelectButton":function(d){return "Seç"},
"playerSelectLetsGetStarted":function(d){return "Hadi başlayalım."},
"reinfFeedbackMsg":function(d){return "Oyuna geri dönmek için \"Oynamaya Devam Et\" düğmesine basabilirsiniz."},
"replayButton":function(d){return "Tekrar oyna"},
"selectChooseButton":function(d){return "Seç"},
"tooManyBlocksFail":function(d){return "Yapboz "+craft_locale.v(d,"puzzleNumber")+" tamamlandı. Tebrikler! Bunu ayrıca "+craft_locale.p(d,"numBlocks",0,"tr",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+" ile de tamamlayabilirsiniz."}};