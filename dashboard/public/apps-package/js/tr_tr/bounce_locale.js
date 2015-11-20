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
v:function(d,k){bounce_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:(k=bounce_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){bounce_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).bounce_locale = {
"bounceBall":function(d){return "topu zıplat"},
"bounceBallTooltip":function(d){return "Topu bir nesnenin üstünden zıplat."},
"continue":function(d){return "Devam"},
"dirE":function(d){return "D"},
"dirN":function(d){return "K"},
"dirS":function(d){return "G"},
"dirW":function(d){return "B"},
"doCode":function(d){return "yap"},
"elseCode":function(d){return "değilse"},
"finalLevel":function(d){return "Tebrikler! Son bulmacayı da çözdünüz."},
"heightParameter":function(d){return "Yükseklik"},
"ifCode":function(d){return "eğer"},
"ifPathAhead":function(d){return "İleride yol varsa"},
"ifTooltip":function(d){return "Belirtilen yönde bir yol varsa, o zaman bazı işlemleri yap."},
"ifelseTooltip":function(d){return "Belirtilen yönde bir yol varsa, o zaman ilk bloktaki işlemleri yap. Yoksa, ikinci bloktaki işlemleri yap."},
"incrementOpponentScore":function(d){return "rakibe puan yaz"},
"incrementOpponentScoreTooltip":function(d){return "Rakibin şu andaki puanına bir ekle."},
"incrementPlayerScore":function(d){return "Skor puanı"},
"incrementPlayerScoreTooltip":function(d){return "Oyuncunun şu andaki puanına bir puan ekle."},
"isWall":function(d){return "bu bir duvar mı"},
"isWallTooltip":function(d){return "Eğer burada bir duvar varsa, doğru döndürür"},
"launchBall":function(d){return "yeni top fırlat"},
"launchBallTooltip":function(d){return "Oyuna bir top fırlat."},
"makeYourOwn":function(d){return "Kendi Zıplama Oyununu Yap"},
"moveDown":function(d){return "aşağı yönde ilerle"},
"moveDownTooltip":function(d){return "Raketi aşağı hareket ettir."},
"moveForward":function(d){return "ilerle"},
"moveForwardTooltip":function(d){return "Beni bir boşluk ilerlet."},
"moveLeft":function(d){return "sola ilerle"},
"moveLeftTooltip":function(d){return "Raketi sola hareket ettir."},
"moveRight":function(d){return "sağa ilerle"},
"moveRightTooltip":function(d){return "Raketi sağa hareket ettir."},
"moveUp":function(d){return "yukarı hareket et"},
"moveUpTooltip":function(d){return "Raketi yukarı hareket ettir."},
"nextLevel":function(d){return "Tebrikler! Bu bulmacayı tamamladınız."},
"no":function(d){return "Hayır"},
"noPathAhead":function(d){return "yol kapatıldı"},
"noPathLeft":function(d){return "sola doğru bir yol yok"},
"noPathRight":function(d){return "sağa doğru bir yol yok"},
"numBlocksNeeded":function(d){return "Bu bulmaca %1 blok ile çözülebilir."},
"pathAhead":function(d){return "öndeki yol"},
"pathLeft":function(d){return "eğer sola doğru yol varsa"},
"pathRight":function(d){return "eğer sağa doğru yol varsa"},
"pilePresent":function(d){return "bir yığın var"},
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
"putdownTower":function(d){return "Kule koyun"},
"reinfFeedbackMsg":function(d){return "Oyununuzu tekrar oynamak için \"yeniden dene\" butonuna basabilirsiniz."},
"removeSquare":function(d){return "Kareyi Kaldır"},
"repeatUntil":function(d){return "kadar tekrarla"},
"repeatUntilBlocked":function(d){return "İleride yol olduğu sürece"},
"repeatUntilFinish":function(d){return "bitene kadar tekrarla"},
"scoreText":function(d){return "Puan: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "arka planı rastgele seç"},
"setBackgroundHardcourt":function(d){return "arka planı sert zemin yap"},
"setBackgroundRetro":function(d){return "arka planı retro yap"},
"setBackgroundTooltip":function(d){return "arkaplanda resmini ayarla"},
"setBallRandom":function(d){return "topu rastgele seç"},
"setBallHardcourt":function(d){return "kort topu olarak ata"},
"setBallRetro":function(d){return "topu retro yap"},
"setBallTooltip":function(d){return "Topun görünümünü ayarlar"},
"setBallSpeedRandom":function(d){return "rastgele top hızı ayarla"},
"setBallSpeedVerySlow":function(d){return "top hızını çok yavaş yap"},
"setBallSpeedSlow":function(d){return "top hızını yavaş yap"},
"setBallSpeedNormal":function(d){return "top hızını normal yap"},
"setBallSpeedFast":function(d){return "top hızını hızlı yap"},
"setBallSpeedVeryFast":function(d){return "top hızını çok hızlı yap"},
"setBallSpeedTooltip":function(d){return "Topun hızını ayarlar"},
"setPaddleRandom":function(d){return "rastgele raket seç"},
"setPaddleHardcourt":function(d){return "raketi sert zemin raketi yap"},
"setPaddleRetro":function(d){return "raketi retro yap"},
"setPaddleTooltip":function(d){return "Raket görünümünü ayarlar"},
"setPaddleSpeedRandom":function(d){return "raket hızını rastgele ayarla"},
"setPaddleSpeedVerySlow":function(d){return "raket hızını çok yavaş yap"},
"setPaddleSpeedSlow":function(d){return "raket hızını yavaş yap"},
"setPaddleSpeedNormal":function(d){return "raket hızını normal yap"},
"setPaddleSpeedFast":function(d){return "raket hızını hızlı yap"},
"setPaddleSpeedVeryFast":function(d){return "raket hızını çok hızlı yap"},
"setPaddleSpeedTooltip":function(d){return "Raket hızını ayarlar"},
"shareBounceTwitter":function(d){return "Yaptığım Zıplama oyununa bir göz atın. Bunu @codeorg ile kendim yazdım"},
"shareGame":function(d){return "Oyununu paylaş:"},
"turnLeft":function(d){return "sola dön"},
"turnRight":function(d){return "sağa dön"},
"turnTooltip":function(d){return "Beni sola ya da sağa 90 derece döndürür."},
"whenBallInGoal":function(d){return "top hedefe vardığında"},
"whenBallInGoalTooltip":function(d){return "Top hedefe ulaştığında aşağıdaki işlemleri yürüt."},
"whenBallMissesPaddle":function(d){return "top raketi ıskaladığında"},
"whenBallMissesPaddleTooltip":function(d){return "Top raketi ıskaladığında aşağıdaki işlemleri yürüt."},
"whenDown":function(d){return "aşağı oka basıldığında"},
"whenDownTooltip":function(d){return "Aşağı oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenGameStarts":function(d){return "oyun başladığında"},
"whenGameStartsTooltip":function(d){return "Oyun başladığında aşağıdaki eylemleri yürüt."},
"whenLeft":function(d){return "sol oka basıldığında"},
"whenLeftTooltip":function(d){return "Sol oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenPaddleCollided":function(d){return "top rakete vurduğunda"},
"whenPaddleCollidedTooltip":function(d){return "Top raketle çarpıştığında aşağıdaki işlemleri yürüt."},
"whenRight":function(d){return "sağ oka basıldığında"},
"whenRightTooltip":function(d){return "Sağ oka basıldığında, aşağıdaki işlemleri yürüt."},
"whenUp":function(d){return "yukarı oka basıldığında"},
"whenUpTooltip":function(d){return "Yukarı ok tuşu basıldığında aşağıdaki eylemleri yürüt."},
"whenWallCollided":function(d){return "top duvara çarptığında"},
"whenWallCollidedTooltip":function(d){return "Top duvarla çarpıştığında aşağıdaki işlemleri yürüt."},
"whileMsg":function(d){return "sürece"},
"whileTooltip":function(d){return "Bitiş noktasına ulaşana kadar blok içindeki işlemleri tekrarla."},
"yes":function(d){return "Evet"}};