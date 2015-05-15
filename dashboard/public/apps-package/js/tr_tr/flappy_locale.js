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
"continue":function(d){return "Devam et"},
"doCode":function(d){return "yap"},
"elseCode":function(d){return "ya da"},
"endGame":function(d){return "oyunu bitir"},
"endGameTooltip":function(d){return "Oyunu bitirir."},
"finalLevel":function(d){return "Tebrikler! Son bulmacayı da çözdünüz."},
"flap":function(d){return "kanat çırp"},
"flapRandom":function(d){return "rastgele kanat çırp"},
"flapVerySmall":function(d){return "çok kısa kanat çırp"},
"flapSmall":function(d){return "kısa kanat çırp"},
"flapNormal":function(d){return "normal kanat çırp"},
"flapLarge":function(d){return "uzun kanat çırp"},
"flapVeryLarge":function(d){return "çok uzun kanat çırp"},
"flapTooltip":function(d){return "Flappy'i yukarı doğru uçur."},
"flappySpecificFail":function(d){return "Kodun güzel gözüküyor - her tıklama ile kanat çırpacak. Ama hedefe ulaşmak için bir çok kez tıklaman gerekir."},
"incrementPlayerScore":function(d){return "puan kazan"},
"incrementPlayerScoreTooltip":function(d){return "Oyuncunun şu andaki puanına bir puan ekle."},
"nextLevel":function(d){return "Tebrikler! Bu bulmacayı tamamladınız."},
"no":function(d){return "Hayır"},
"numBlocksNeeded":function(d){return "Bu bulmaca %1 blok ile çözülebilir."},
"playSoundRandom":function(d){return "rasgele ses çal"},
"playSoundBounce":function(d){return "zıplama sesi çal"},
"playSoundCrunch":function(d){return "ezilme sesi çal"},
"playSoundDie":function(d){return "üzgün ses çal"},
"playSoundHit":function(d){return "ezilme sesi çal"},
"playSoundPoint":function(d){return "Puan sesi çıkart"},
"playSoundSwoosh":function(d){return "Vın sesi çıkart"},
"playSoundWing":function(d){return "kanat sesi çıkar"},
"playSoundJet":function(d){return "Jet sesi çıkart"},
"playSoundCrash":function(d){return "Çarpışma sesi çıkar"},
"playSoundJingle":function(d){return "jingle sesi çıkart"},
"playSoundSplash":function(d){return "sıçrama sesi çıkart"},
"playSoundLaser":function(d){return "Lazer sesi çıkar"},
"playSoundTooltip":function(d){return "Seçilen sesi çal."},
"reinfFeedbackMsg":function(d){return "Oyununuzu tekrar oynamak için \"yeniden dene\" butonuna basabilirsiniz."},
"scoreText":function(d){return "Skor: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ayarla sahne"},
"setBackgroundRandom":function(d){return "ayarla sahne rastgele"},
"setBackgroundFlappy":function(d){return "ayarla sahne Şehir (gündüz)"},
"setBackgroundNight":function(d){return "ayarla sahne Şehir (gece)"},
"setBackgroundSciFi":function(d){return "ayarla sahne Bilim-Kurgu"},
"setBackgroundUnderwater":function(d){return "ayarla sahne Sualtı"},
"setBackgroundCave":function(d){return "ayarla sahne Mağara"},
"setBackgroundSanta":function(d){return "ayarla sahne Noel"},
"setBackgroundTooltip":function(d){return "Arka plan resmini ayarlar"},
"setGapRandom":function(d){return "ayarla rastgele boşluk"},
"setGapVerySmall":function(d){return "çok küçük bir boşluk ayarla"},
"setGapSmall":function(d){return "küçük bir boşluk ayarla"},
"setGapNormal":function(d){return "normal bir boşluk ayarla"},
"setGapLarge":function(d){return "ayarla geniş boşluk"},
"setGapVeryLarge":function(d){return "ayarla çok geniş boşluk"},
"setGapHeightTooltip":function(d){return "Engelin içinde bir dikey boşluk ayarlar"},
"setGravityRandom":function(d){return "ayarla yerçekimi rastgele"},
"setGravityVeryLow":function(d){return "ayarla yerçekimi çok düşük"},
"setGravityLow":function(d){return "ayarla yerçekimi düşük"},
"setGravityNormal":function(d){return "ayarla yerçekimi normal"},
"setGravityHigh":function(d){return "ayarla yerçekimi yüksek"},
"setGravityVeryHigh":function(d){return "ayarla yerçekimi çok yüksek"},
"setGravityTooltip":function(d){return "Level'ın yerçekimini ayarlar"},
"setGround":function(d){return "ayarla zemin"},
"setGroundRandom":function(d){return "ayarla zemin Rastgele"},
"setGroundFlappy":function(d){return "ayarla zemin Zemin"},
"setGroundSciFi":function(d){return "ayarla zemin Bilim-Kurgu"},
"setGroundUnderwater":function(d){return "ayarla zemin Sualtı"},
"setGroundCave":function(d){return "ayarla zemin Mağara"},
"setGroundSanta":function(d){return "ayarla zemin Noel"},
"setGroundLava":function(d){return "ayarla zemin Lav"},
"setGroundTooltip":function(d){return "Zemin resmini ayarlar"},
"setObstacle":function(d){return "ayarla engel"},
"setObstacleRandom":function(d){return "ayarla engel Rastgele"},
"setObstacleFlappy":function(d){return "ayarla engel Boru"},
"setObstacleSciFi":function(d){return "ayarla engel Bilim-Kurgu"},
"setObstacleUnderwater":function(d){return "ayarla engel Bitki"},
"setObstacleCave":function(d){return "ayarla engel Mağara"},
"setObstacleSanta":function(d){return "ayarla engel Baca"},
"setObstacleLaser":function(d){return "ayarla engel Lazer"},
"setObstacleTooltip":function(d){return "Engel resmini ayarlar"},
"setPlayer":function(d){return "ayarla oyuncu"},
"setPlayerRandom":function(d){return "ayarla oyuncu Rastgele"},
"setPlayerFlappy":function(d){return "ayarla oyuncu Sarı Kuş"},
"setPlayerRedBird":function(d){return "ayarla oyuncu Kırmızı Kuş"},
"setPlayerSciFi":function(d){return "ayarla oyuncu Uzay Mekiği"},
"setPlayerUnderwater":function(d){return "ayarla oyuncu Balık"},
"setPlayerCave":function(d){return "ayarla oyuncu Yarasa"},
"setPlayerSanta":function(d){return "ayarla oyuncu Noel"},
"setPlayerShark":function(d){return "ayarla oyuncu Köpekbalığı"},
"setPlayerEaster":function(d){return "ayarla oyuncu Paskalya Tavşanı"},
"setPlayerBatman":function(d){return "ayarla oyuncu Yarasa Adam"},
"setPlayerSubmarine":function(d){return "ayarla oyuncu Denizaltı"},
"setPlayerUnicorn":function(d){return "ayarla oyuncu Unicorn"},
"setPlayerFairy":function(d){return "ayarla oyuncu Peri"},
"setPlayerSuperman":function(d){return "ayarla oyuncu Flappyman"},
"setPlayerTurkey":function(d){return "ayarla oyuncu Hindi"},
"setPlayerTooltip":function(d){return "Oyuncu resmini ayarlar"},
"setScore":function(d){return "skor ayarla"},
"setScoreTooltip":function(d){return "Oyuncunun puanını ayarlar"},
"setSpeed":function(d){return "ayarla hız"},
"setSpeedTooltip":function(d){return "Level'ın hızını ayarlar"},
"shareFlappyTwitter":function(d){return "Kendi yaptığım Flappy oyununa bir göz at. Bunu @codeorg ile kendim programladım"},
"shareGame":function(d){return "Oyununu paylaş:"},
"soundRandom":function(d){return "gelişigüzel"},
"soundBounce":function(d){return "atla"},
"soundCrunch":function(d){return "çatlak"},
"soundDie":function(d){return "üzücü"},
"soundHit":function(d){return "paramparça"},
"soundPoint":function(d){return "puan"},
"soundSwoosh":function(d){return "Vın"},
"soundWing":function(d){return "kanat"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "çarpma"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "sıçrama"},
"soundLaser":function(d){return "lazer"},
"speedRandom":function(d){return "hızı rastgele ayarla"},
"speedVerySlow":function(d){return "hızı çok yavaş yap"},
"speedSlow":function(d){return "hızı yavaş yap"},
"speedNormal":function(d){return "ayarla hız normal"},
"speedFast":function(d){return "ayarla hız hızlı"},
"speedVeryFast":function(d){return "ayarla hız çok hızlı"},
"whenClick":function(d){return "tıkladığı zaman"},
"whenClickTooltip":function(d){return "Bir tıklama olayı oluştuğunda aşağıdaki eylemleri yürüt."},
"whenCollideGround":function(d){return "yere çarptığında"},
"whenCollideGroundTooltip":function(d){return "Flappy yere çarptığı zaman aşağıdaki eylemleri yürüt."},
"whenCollideObstacle":function(d){return "Bir engele çarptığı zaman"},
"whenCollideObstacleTooltip":function(d){return "Flappy bir engele çarptığı zaman aşağıdaki eylemler yürüt."},
"whenEnterObstacle":function(d){return "Engel geçildiği zaman"},
"whenEnterObstacleTooltip":function(d){return "Flappy bir engele giriş yaptığı zaman aşağıdaki eylemler yürüt."},
"whenRunButtonClick":function(d){return "oyun başladığında"},
"whenRunButtonClickTooltip":function(d){return "Oyun başladığında aşağıdaki eylemleri yürüt."},
"yes":function(d){return "Evet"}};