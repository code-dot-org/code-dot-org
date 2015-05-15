var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "aktör"},
"alienInvasion":function(d){return "Uzaylı istilası!"},
"backgroundBlack":function(d){return "siyah"},
"backgroundCave":function(d){return "Mağara"},
"backgroundCloudy":function(d){return "Bulutlu"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "gece"},
"backgroundUnderwater":function(d){return "Sualtı"},
"backgroundCity":function(d){return "Şehir"},
"backgroundDesert":function(d){return "çöl"},
"backgroundRainbow":function(d){return "gökkuşağı"},
"backgroundSoccer":function(d){return "futbol"},
"backgroundSpace":function(d){return "boşluk"},
"backgroundTennis":function(d){return "tenis"},
"backgroundWinter":function(d){return "kış"},
"catActions":function(d){return "İşlemler"},
"catControl":function(d){return "Döngüler"},
"catEvents":function(d){return "Olaylar"},
"catLogic":function(d){return "Mantık"},
"catMath":function(d){return "Matematik"},
"catProcedures":function(d){return "Fonksiyonlar"},
"catText":function(d){return "yazı"},
"catVariables":function(d){return "Değişkenler"},
"changeScoreTooltip":function(d){return "Skoru bir puan arttır veya azalt."},
"changeScoreTooltipK1":function(d){return "Skora bir puan ekle."},
"continue":function(d){return "Devam"},
"decrementPlayerScore":function(d){return "Puanı sil"},
"defaultSayText":function(d){return "buraya yazın"},
"emotion":function(d){return "ruh hali"},
"finalLevel":function(d){return "Tebrikler! Son bulmacayı da çözdünüz."},
"for":function(d){return "için"},
"hello":function(d){return "merhaba"},
"helloWorld":function(d){return "Merhaba Dünya!"},
"incrementPlayerScore":function(d){return "Skor puanı"},
"makeProjectileDisappear":function(d){return "yok et"},
"makeProjectileBounce":function(d){return "atla"},
"makeProjectileBlueFireball":function(d){return "Mavi alev topu yap"},
"makeProjectilePurpleFireball":function(d){return "mavi alev topu yap"},
"makeProjectileRedFireball":function(d){return "kırmızı ateş topu yap\n"},
"makeProjectileYellowHearts":function(d){return "sarı kalpler yap"},
"makeProjectilePurpleHearts":function(d){return "mor kalpler yap"},
"makeProjectileRedHearts":function(d){return "kırmızı kalpler yap"},
"makeProjectileTooltip":function(d){return "Çarpıştığında yok olan veya sıçrayan bir mermi yap."},
"makeYourOwn":function(d){return "Kendi oyun atölyesi uygulamanızı yapın"},
"moveDirectionDown":function(d){return "aşağı"},
"moveDirectionLeft":function(d){return "sol"},
"moveDirectionRight":function(d){return "sağ"},
"moveDirectionUp":function(d){return "yukarı"},
"moveDirectionRandom":function(d){return "gelişigüzel"},
"moveDistance25":function(d){return "25 piksel"},
"moveDistance50":function(d){return "50 piksel"},
"moveDistance100":function(d){return "100 piksel"},
"moveDistance200":function(d){return "200 piksel"},
"moveDistance400":function(d){return "400 piksel"},
"moveDistancePixels":function(d){return "pikseller"},
"moveDistanceRandom":function(d){return "rasgele piksel"},
"moveDistanceTooltip":function(d){return "Bir oyuncuyu belirli bir yönde belirli bir mesafe hareket ettirin."},
"moveSprite":function(d){return "hareket et"},
"moveSpriteN":function(d){return "taşı aktör "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x, y konumuna"},
"moveDown":function(d){return "aşağı yönde ilerle"},
"moveDownTooltip":function(d){return "Bir oyuncuyu aşağı yönde hareket ettirin."},
"moveLeft":function(d){return "sola ilerle"},
"moveLeftTooltip":function(d){return "Bir oyuncuyu sola doğru hareket ettir."},
"moveRight":function(d){return "sağa ilerle"},
"moveRightTooltip":function(d){return "Bir oyuncuyu sağa doğru hareket ettir."},
"moveUp":function(d){return "yukarı hareket et"},
"moveUpTooltip":function(d){return "Bir oyuncuyu yukarı doğru hareket ettir."},
"moveTooltip":function(d){return "Bir aktör taşı."},
"nextLevel":function(d){return "Tebrikler! Bu bulmacayı tamamladınız."},
"no":function(d){return "Hayır"},
"numBlocksNeeded":function(d){return "Bu bulmaca %1 blok kullanılarak çözülebilir."},
"onEventTooltip":function(d){return "Belirtilen olaya karşılık gelen kodu çalıştırın."},
"ouchExclamation":function(d){return "Ah!"},
"playSoundCrunch":function(d){return "kırılma sesi çal"},
"playSoundGoal1":function(d){return "\"Hedef 1\" sesi çal"},
"playSoundGoal2":function(d){return "\"Hedef 2\" sesi çal"},
"playSoundHit":function(d){return "\"Çarpma\" sesi çal"},
"playSoundLosePoint":function(d){return "\"Puan kaybetme\" sesi çal"},
"playSoundLosePoint2":function(d){return "\"Puan kaybetme 2\" sesi çal"},
"playSoundRetro":function(d){return "\"Retro\" sesi çal"},
"playSoundRubber":function(d){return "\"Lastik\" sesi çıkart"},
"playSoundSlap":function(d){return "\"Tokat\" sesi çıkart"},
"playSoundTooltip":function(d){return "Seçilen sesi çal."},
"playSoundWinPoint":function(d){return "\"Puan kazanma\" sesi çal"},
"playSoundWinPoint2":function(d){return "\"Puan kazanma 2\" sesi çal"},
"playSoundWood":function(d){return "\"Odun\" sesi çıkart"},
"positionOutTopLeft":function(d){return "yukarıdaki sol üst konuma"},
"positionOutTopRight":function(d){return "yukarıdaki sağ üst konuma"},
"positionTopOutLeft":function(d){return "sol üst dış konuma"},
"positionTopLeft":function(d){return "sol üst konuma"},
"positionTopCenter":function(d){return "üst orta konuma"},
"positionTopRight":function(d){return "sağ üst konuma"},
"positionTopOutRight":function(d){return "sağ üst dış konuma"},
"positionMiddleLeft":function(d){return "orta sol konuma"},
"positionMiddleCenter":function(d){return "ortanın ortası konuma"},
"positionMiddleRight":function(d){return "orta sağ konuma"},
"positionBottomOutLeft":function(d){return "sol alt dış konuma"},
"positionBottomLeft":function(d){return "sol alt konuma"},
"positionBottomCenter":function(d){return "alt orta konuma"},
"positionBottomRight":function(d){return "sağ alt konuma"},
"positionBottomOutRight":function(d){return "sağ alt dış konuma"},
"positionOutBottomLeft":function(d){return "Aşağıdaki sol alt konuma"},
"positionOutBottomRight":function(d){return "Aşağıdaki sağ alt konuma"},
"positionRandom":function(d){return "rastgele konuma"},
"projectileBlueFireball":function(d){return "mavi ateş topu"},
"projectilePurpleFireball":function(d){return "mor ateş topu"},
"projectileRedFireball":function(d){return "kırmızı ateş topu"},
"projectileYellowHearts":function(d){return "sarı kalpler"},
"projectilePurpleHearts":function(d){return "mor kalpler"},
"projectileRedHearts":function(d){return "kırmızı kalpler"},
"projectileRandom":function(d){return "gelişigüzel"},
"projectileAnna":function(d){return "kanca"},
"projectileElsa":function(d){return "ışıltı"},
"projectileHiro":function(d){return "mikrobotlar"},
"projectileBaymax":function(d){return "roket"},
"projectileRapunzel":function(d){return "tencere"},
"projectileCherry":function(d){return "kiraz"},
"projectileIce":function(d){return "buz"},
"projectileDuck":function(d){return "ördek"},
"reinfFeedbackMsg":function(d){return "Hikayene geri dönmek için \" oynatmaya devam et\" butonuna tıklayabilirsin."},
"repeatForever":function(d){return "Sonsuza kadar tekrarla"},
"repeatDo":function(d){return "yap"},
"repeatForeverTooltip":function(d){return "Oyun çalışırken eylemleri bu blok içinde tekrarlı yürüt."},
"saySprite":function(d){return "de"},
"saySpriteN":function(d){return "aktör "+studio_locale.v(d,"spriteIndex")+" de"},
"saySpriteTooltip":function(d){return "Bir konuşma balonu ile ilişkili metni belirtilen aktörden aç."},
"saySpriteChoices_0":function(d){return "Selam."},
"saySpriteChoices_1":function(d){return "Herkese merhaba."},
"saySpriteChoices_2":function(d){return "Neler yapıyorsun?"},
"saySpriteChoices_3":function(d){return "Günaydın"},
"saySpriteChoices_4":function(d){return "İyi Günler"},
"saySpriteChoices_5":function(d){return "İyi Geceler"},
"saySpriteChoices_6":function(d){return "İyi Akşamlar"},
"saySpriteChoices_7":function(d){return "Ne haber?"},
"saySpriteChoices_8":function(d){return "Ne?"},
"saySpriteChoices_9":function(d){return "Nerede?"},
"saySpriteChoices_10":function(d){return "Ne zaman?"},
"saySpriteChoices_11":function(d){return "Iyi."},
"saySpriteChoices_12":function(d){return "Harika!"},
"saySpriteChoices_13":function(d){return "pekala."},
"saySpriteChoices_14":function(d){return "Fena değil."},
"saySpriteChoices_15":function(d){return "İyi şanslar."},
"saySpriteChoices_16":function(d){return "Evet"},
"saySpriteChoices_17":function(d){return "Hayır"},
"saySpriteChoices_18":function(d){return "Tamam"},
"saySpriteChoices_19":function(d){return "İyi atış!"},
"saySpriteChoices_20":function(d){return "İyi günler."},
"saySpriteChoices_21":function(d){return "Hoşça kal."},
"saySpriteChoices_22":function(d){return "Hemen döneceğim."},
"saySpriteChoices_23":function(d){return "Yarın görüşürüz!"},
"saySpriteChoices_24":function(d){return "Sonra görüşürüz!"},
"saySpriteChoices_25":function(d){return "Kendine iyi bak!"},
"saySpriteChoices_26":function(d){return "Tadını çıkarın!"},
"saySpriteChoices_27":function(d){return "Gitmek zorundayım."},
"saySpriteChoices_28":function(d){return "Arkadaş olmak ister misin?"},
"saySpriteChoices_29":function(d){return "İyi iş!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yaşasın!"},
"saySpriteChoices_32":function(d){return "Tanıştığımıza memnun oldum."},
"saySpriteChoices_33":function(d){return "pekala!"},
"saySpriteChoices_34":function(d){return "Teşekkür ederiz"},
"saySpriteChoices_35":function(d){return "Hayır, teşekkür ederim"},
"saySpriteChoices_36":function(d){return "Aaaaaaaa!"},
"saySpriteChoices_37":function(d){return "Sağlık olsun"},
"saySpriteChoices_38":function(d){return "Bugün"},
"saySpriteChoices_39":function(d){return "Yarın"},
"saySpriteChoices_40":function(d){return "Dün"},
"saySpriteChoices_41":function(d){return "Seni buldum!"},
"saySpriteChoices_42":function(d){return "Beni buldun!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Harikasın!"},
"saySpriteChoices_45":function(d){return "Çok komiksin!"},
"saySpriteChoices_46":function(d){return "Seni aptal! "},
"saySpriteChoices_47":function(d){return "Sen iyi bir arkadaşsın!"},
"saySpriteChoices_48":function(d){return "Dikkat et!"},
"saySpriteChoices_49":function(d){return "Ördek!"},
"saySpriteChoices_50":function(d){return "Yakaladım seni!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Üzgünüm!"},
"saySpriteChoices_53":function(d){return "Dikkat et!"},
"saySpriteChoices_54":function(d){return "Vaay!"},
"saySpriteChoices_55":function(d){return "Hay aksi!"},
"saySpriteChoices_56":function(d){return "Neredeyse kandırıyordun!"},
"saySpriteChoices_57":function(d){return "İyi denemeydi!"},
"saySpriteChoices_58":function(d){return "Beni yakalayamazsın!"},
"scoreText":function(d){return "Skor: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "ayarla arkaplan"},
"setBackgroundRandom":function(d){return "ayarla rastgele arkaplan"},
"setBackgroundBlack":function(d){return "ayarla siyah arkaplan"},
"setBackgroundCave":function(d){return "ayarla mağara arkaplan"},
"setBackgroundCloudy":function(d){return "ayarla bulutlu arkaplan"},
"setBackgroundHardcourt":function(d){return "ayarla arkaplan sert zemin"},
"setBackgroundNight":function(d){return "Gece arka planını ayarla"},
"setBackgroundUnderwater":function(d){return "Sualtı arka planını ayarla"},
"setBackgroundCity":function(d){return "Şehir arka planını ayarla"},
"setBackgroundDesert":function(d){return "Çöl arka planını ayarla"},
"setBackgroundRainbow":function(d){return "Gökkuşağı arkaplanını ayarla"},
"setBackgroundSoccer":function(d){return "Futbol arka planını ayarla"},
"setBackgroundSpace":function(d){return "Uzay arka planını ayarla"},
"setBackgroundTennis":function(d){return "Tenis arka planını ayarla"},
"setBackgroundWinter":function(d){return "Kış arka planını ayarla"},
"setBackgroundLeafy":function(d){return "Arka planı yapraklı yap"},
"setBackgroundGrassy":function(d){return "Arka planı çimenli yap"},
"setBackgroundFlower":function(d){return "Arka planı çiçekli yap"},
"setBackgroundTile":function(d){return "Arka planı döşemeli yap"},
"setBackgroundIcy":function(d){return "Arka planı buzlu yap"},
"setBackgroundSnowy":function(d){return "Arka planı karlı yap"},
"setBackgroundTooltip":function(d){return "arkaplanda resmini ayarla"},
"setEnemySpeed":function(d){return "düşman hızını ayarla"},
"setPlayerSpeed":function(d){return "oyuncu hızını ayarla"},
"setScoreText":function(d){return "skor ayarla"},
"setScoreTextTooltip":function(d){return "Skor alanında görüntülenecek metni ayarlar."},
"setSpriteEmotionAngry":function(d){return "Kızgın bir ruh haline"},
"setSpriteEmotionHappy":function(d){return "mutlu hal için"},
"setSpriteEmotionNormal":function(d){return "normal hal için"},
"setSpriteEmotionRandom":function(d){return "rastgele hal için"},
"setSpriteEmotionSad":function(d){return "üzgün hal için"},
"setSpriteEmotionTooltip":function(d){return "Aktör ruh halini ayarla"},
"setSpriteAlien":function(d){return "uzaylı görüntüsü için"},
"setSpriteBat":function(d){return "yarasa resmi için"},
"setSpriteBird":function(d){return "kuş resmi için"},
"setSpriteCat":function(d){return "kedi resmi için"},
"setSpriteCaveBoy":function(d){return "mağara çocuğu resmine"},
"setSpriteCaveGirl":function(d){return "mağara kızı resmine"},
"setSpriteDinosaur":function(d){return "dinozor resmi için"},
"setSpriteDog":function(d){return "köpek resmi için"},
"setSpriteDragon":function(d){return "ejderha resmi için"},
"setSpriteGhost":function(d){return "hayalet resmi için"},
"setSpriteHidden":function(d){return "gizli görüntü için"},
"setSpriteHideK1":function(d){return "gizle"},
"setSpriteAnna":function(d){return "Anna görünümüne"},
"setSpriteElsa":function(d){return "Elsa görünümüne"},
"setSpriteHiro":function(d){return "Hiro resmini görüntüle"},
"setSpriteBaymax":function(d){return "Baymax resmini görüntüle"},
"setSpriteRapunzel":function(d){return "Rapunzel resmini görüntüle"},
"setSpriteKnight":function(d){return "şövalye resmi için"},
"setSpriteMonster":function(d){return "canavar resmi için"},
"setSpriteNinja":function(d){return "maskeli ninja resmi için"},
"setSpriteOctopus":function(d){return "ahtapot resmi için"},
"setSpritePenguin":function(d){return "penguen resmi için"},
"setSpritePirate":function(d){return "korsan resmi için"},
"setSpritePrincess":function(d){return "prenses resmi için"},
"setSpriteRandom":function(d){return "rasgele bir resim için"},
"setSpriteRobot":function(d){return "robot resmi için"},
"setSpriteShowK1":function(d){return "göster"},
"setSpriteSpacebot":function(d){return "Uzaybotu görüntüsüne"},
"setSpriteSoccerGirl":function(d){return "futbolcu kız resmine"},
"setSpriteSoccerBoy":function(d){return "futbolcu çocuk resmine"},
"setSpriteSquirrel":function(d){return "sincap resmi için"},
"setSpriteTennisGirl":function(d){return "tenisçi kız resmine"},
"setSpriteTennisBoy":function(d){return "tenizçi çocuk resmine"},
"setSpriteUnicorn":function(d){return "tek boynuzlu at resmi için"},
"setSpriteWitch":function(d){return "cadı resmi için"},
"setSpriteWizard":function(d){return "büyücü resmi için"},
"setSpritePositionTooltip":function(d){return "Anlık olarak aktörü belirtilen konuma taşır."},
"setSpriteK1Tooltip":function(d){return "Belirtilen aktörü gösterir ya da gizler."},
"setSpriteTooltip":function(d){return "Aktör resmini ayarlar"},
"setSpriteSizeRandom":function(d){return "rastgele bi boyuta"},
"setSpriteSizeVerySmall":function(d){return "çok küçük bir boyuta\n"},
"setSpriteSizeSmall":function(d){return "küçük bir boyuta\n"},
"setSpriteSizeNormal":function(d){return "normal bir boyutu"},
"setSpriteSizeLarge":function(d){return "büyük bir boyuta"},
"setSpriteSizeVeryLarge":function(d){return "çok büyük bir boyuta"},
"setSpriteSizeTooltip":function(d){return "Oyuncu boyutunu ayarlama"},
"setSpriteSpeedRandom":function(d){return "rastgele bir hıza"},
"setSpriteSpeedVerySlow":function(d){return "çok yavaş bir hıza"},
"setSpriteSpeedSlow":function(d){return "yavaş bir hıza"},
"setSpriteSpeedNormal":function(d){return "normal bir hıza"},
"setSpriteSpeedFast":function(d){return "süratli bir hıza"},
"setSpriteSpeedVeryFast":function(d){return "çok süratli bir hıza"},
"setSpriteSpeedTooltip":function(d){return "Bir aktörün hızını ayarlar"},
"setSpriteZombie":function(d){return "bir zombi resmine"},
"shareStudioTwitter":function(d){return "Yaptığım hikayeye göz atın. @codeorg ile kendim yazdım"},
"shareGame":function(d){return "hikayeni paylaş:"},
"showCoordinates":function(d){return "koordinatları göster"},
"showCoordinatesTooltip":function(d){return "kahramanın koordinatları ekranda göster"},
"showTitleScreen":function(d){return "ekran başlığını göster"},
"showTitleScreenTitle":function(d){return "başlık"},
"showTitleScreenText":function(d){return "metin yazısı"},
"showTSDefTitle":function(d){return "başlığı buraya yazın"},
"showTSDefText":function(d){return "yazıyı buraya yazın"},
"showTitleScreenTooltip":function(d){return "İlişkili başlık ve metin içeren bir başlık ekranı göster."},
"size":function(d){return "boyut"},
"setSprite":function(d){return "atamak"},
"setSpriteN":function(d){return "ayarla aktör "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "çatlak"},
"soundGoal1":function(d){return "hedef 1"},
"soundGoal2":function(d){return "hedef 2"},
"soundHit":function(d){return "çarpma"},
"soundLosePoint":function(d){return "puan kaybetme"},
"soundLosePoint2":function(d){return "puan kaybetme 2"},
"soundRetro":function(d){return "tersine"},
"soundRubber":function(d){return "kauçuk"},
"soundSlap":function(d){return "tokat"},
"soundWinPoint":function(d){return "puan kazan"},
"soundWinPoint2":function(d){return "puan kazanma 2"},
"soundWood":function(d){return "ahşap"},
"speed":function(d){return "hız"},
"startSetValue":function(d){return "Başlat (fonksiyon)"},
"startSetVars":function(d){return "oyun_vars (başlık, alt başlık, arka plan, hedef, tehlike, oyuncu)"},
"startSetFuncs":function(d){return "oyun_işlevleri (hedef-güncelle, tehlike-güncelle, oyuncu-güncelle,  çarpışır?, ekranda?)"},
"stopSprite":function(d){return "dur"},
"stopSpriteN":function(d){return "durdur aktör "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Aktörün hareketini durdurur."},
"throwSprite":function(d){return "fırlat"},
"throwSpriteN":function(d){return "aktör "+studio_locale.v(d,"spriteIndex")+" fırlat"},
"throwTooltip":function(d){return "Belirlenen aktör atılacak cismi fırlatır."},
"vanish":function(d){return "kaybol"},
"vanishActorN":function(d){return "kaybol aktör "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Aktör kaybolur."},
"waitFor":function(d){return "için bekle"},
"waitSeconds":function(d){return "saniye"},
"waitForClick":function(d){return "tıklamak için bekle"},
"waitForRandom":function(d){return "rastgele için bekle"},
"waitForHalfSecond":function(d){return "yarım saniye bekleyin"},
"waitFor1Second":function(d){return "1 saniye bekleyin"},
"waitFor2Seconds":function(d){return "2 saniye bekleyin"},
"waitFor5Seconds":function(d){return "5 saniye bekleyin"},
"waitFor10Seconds":function(d){return "10 saniye bekleyin"},
"waitParamsTooltip":function(d){return "Belirtilen saniye kadar bekler, ya da tıklamaya kadar beklemesi için 0 kullanın."},
"waitTooltip":function(d){return "Bir tıklama oluşana kadar veya belirtilen zaman kadar bekler."},
"whenArrowDown":function(d){return "aşağı ok"},
"whenArrowLeft":function(d){return "sol ok"},
"whenArrowRight":function(d){return "sağ ok"},
"whenArrowUp":function(d){return "yukarı ok"},
"whenArrowTooltip":function(d){return "Belirtilen ok tuşuna basıldığında aşağıdaki eylemleri yürütür."},
"whenDown":function(d){return "aşağı oka basıldığında"},
"whenDownTooltip":function(d){return "Aşağı oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenGameStarts":function(d){return "hikaye başlarken"},
"whenGameStartsTooltip":function(d){return "Hikaye başladığında aşağıda eylemleri yürüt."},
"whenLeft":function(d){return "sol oka basıldığında"},
"whenLeftTooltip":function(d){return "Sol oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenRight":function(d){return "sağ oka basıldığında"},
"whenRightTooltip":function(d){return "Sağ oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenSpriteClicked":function(d){return "aktör tıklandığında"},
"whenSpriteClickedN":function(d){return "aktör "+studio_locale.v(d,"spriteIndex")+" e tıkladığında"},
"whenSpriteClickedTooltip":function(d){return "Aktör tıklandığında aşağıdaki eylemleri yürüt."},
"whenSpriteCollidedN":function(d){return "Aktör "+studio_locale.v(d,"spriteIndex")+" zamanında"},
"whenSpriteCollidedTooltip":function(d){return "Bir aktör başka bir aktöre dokunduğunda aşağıda eylemleri yürüt."},
"whenSpriteCollidedWith":function(d){return "dokunur"},
"whenSpriteCollidedWithAnyActor":function(d){return "herhangi bir aktöre dokunur"},
"whenSpriteCollidedWithAnyEdge":function(d){return "herhangi bir kenara dokunur"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "herhangi bir mermiye dokunur"},
"whenSpriteCollidedWithAnything":function(d){return "herhangi bir şeye dokunur"},
"whenSpriteCollidedWithN":function(d){return "dokunur aktör "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "mavi ateş topuna dokunur"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "mor ateş topuna dokunur"},
"whenSpriteCollidedWithRedFireball":function(d){return "kırmızı ateş topuna dokunur"},
"whenSpriteCollidedWithYellowHearts":function(d){return "sarı kalplere dokunur"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "mor kalplere dokunur"},
"whenSpriteCollidedWithRedHearts":function(d){return "kırmızı kalplere dokunur"},
"whenSpriteCollidedWithBottomEdge":function(d){return "alt kenara dokunur"},
"whenSpriteCollidedWithLeftEdge":function(d){return "sol kenara dokunur"},
"whenSpriteCollidedWithRightEdge":function(d){return "sağ kenara dokunur"},
"whenSpriteCollidedWithTopEdge":function(d){return "üst kenara dokunur"},
"whenUp":function(d){return "yukarı oka basıldığında"},
"whenUpTooltip":function(d){return "Yukarı ok tuşu basıldığında aşağıdaki eylemleri yürüt."},
"yes":function(d){return "Evet"}};