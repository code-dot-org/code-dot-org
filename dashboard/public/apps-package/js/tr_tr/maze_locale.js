var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "Petekte"},
"atFlower":function(d){return "çiçekte"},
"avoidCowAndRemove":function(d){return "inek kaçın ve 1 çıkarın"},
"continue":function(d){return "Devam"},
"dig":function(d){return "1 çıkarın"},
"digTooltip":function(d){return "1 adet toprağı kaldırın"},
"dirE":function(d){return "D"},
"dirN":function(d){return "K"},
"dirS":function(d){return "G"},
"dirW":function(d){return "B"},
"doCode":function(d){return "yap"},
"elseCode":function(d){return "değilse"},
"fill":function(d){return "1 doldurun"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" doldurun"},
"fillStack":function(d){return maze_locale.v(d,"shovelfuls")+" delikleri yığını doldurun"},
"fillSquare":function(d){return "Kare doldurun"},
"fillTooltip":function(d){return "1 adet toprak yerleştirin"},
"finalLevel":function(d){return "Tebrikler! Son bulmacayı da çözdünüz."},
"flowerEmptyError":function(d){return "Üstünde bulunduğun çiçekte daha fazla nektar kalmadı."},
"get":function(d){return "değer al"},
"heightParameter":function(d){return "Yükseklik"},
"holePresent":function(d){return "bir delik var"},
"honey":function(d){return "bal yap"},
"honeyAvailable":function(d){return "bal"},
"honeyTooltip":function(d){return "Nektardan bal yap"},
"honeycombFullError":function(d){return "Bu petekte daha fazla bal için yer yok."},
"ifCode":function(d){return "eğer"},
"ifInRepeatError":function(d){return "\"repeat\" bloğu içinde \"if\" bloğuna ihtiyacın var. Sorun yaşıyorsanız, nasıl çalıştığını anlamak için önceki seviyeyi deneyin."},
"ifPathAhead":function(d){return "eğer ileride yol varsa"},
"ifTooltip":function(d){return "Belirtilen yönde bir yol varsa, o zaman bazı işlemleri yap."},
"ifelseTooltip":function(d){return "Belirtilen yönde bir yol varsa, o zaman ilk bloktaki işlemleri yap. Yoksa, ikinci bloktaki işlemleri yap."},
"ifFlowerTooltip":function(d){return "Eğer çiçek/petek belirtilen yönde varsa birşeyler yap."},
"ifOnlyFlowerTooltip":function(d){return "Belirtilen yönde bir yol varsa, o zaman bazı işlemleri yap."},
"ifelseFlowerTooltip":function(d){return "Çiçek/petek belirtilen yönde ise, o zaman eylemlerin ilk bloğunu yap. Aksi takdirde, eylemlerin ikinci bloğunu yap."},
"insufficientHoney":function(d){return "Gerekli tüm blokları kullanıyorsunuz ancak yeteri kadar bal toplamanız gerekiyor."},
"insufficientNectar":function(d){return "Gerekli tüm blokları kullanıyorsunuz ancak yeteri kadar nektar toplamanız gerekiyor."},
"make":function(d){return "yap"},
"moveBackward":function(d){return "geriye git"},
"moveEastTooltip":function(d){return "Beni doğuya bir boşluk ilerlet."},
"moveForward":function(d){return "ilerle"},
"moveForwardTooltip":function(d){return "Beni bir boşluk ilerlet."},
"moveNorthTooltip":function(d){return "Beni kuzeye bir boşluk ilerlet."},
"moveSouthTooltip":function(d){return "Beni güneye bir boşluk ilerlet."},
"moveTooltip":function(d){return "Beni ileriye/geriye bir boşluk ilerlet"},
"moveWestTooltip":function(d){return "Beni batıya bir boşluk ilerlet."},
"nectar":function(d){return "nektarı al"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Bir çiçekten nektar al"},
"nextLevel":function(d){return "Tebrikler! Bu bulmacayı tamamladınız."},
"no":function(d){return "Hayır"},
"noPathAhead":function(d){return "yol kapalı"},
"noPathLeft":function(d){return "sola yol yok"},
"noPathRight":function(d){return "sağa yol yok"},
"notAtFlowerError":function(d){return "Nektarı sadece bir çiçekten alabilirsiniz."},
"notAtHoneycombError":function(d){return "Balı sadece petekte yapabilirsiniz."},
"numBlocksNeeded":function(d){return "Bu bulmaca %1 blok kullanılarak çözülebilir."},
"pathAhead":function(d){return "öndeki yol"},
"pathLeft":function(d){return "eğer sola doğru yol varsa"},
"pathRight":function(d){return "eğer sağa doğru yol varsa"},
"pilePresent":function(d){return "bir yığın var"},
"putdownTower":function(d){return "Kule koyun"},
"removeAndAvoidTheCow":function(d){return "1 çıkarın ve inekten kaçının"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+" çıkarmak"},
"removePile":function(d){return "Yığını Kaldır"},
"removeStack":function(d){return maze_locale.v(d,"shovelfuls")+" yığınını Kaldır"},
"removeSquare":function(d){return "Kareyi Kaldır"},
"repeatCarefullyError":function(d){return "Bunu çözmek için, iki hamle ve bir dönüşün örgüsünü \"tekrar\" bloğuna koymayı dikkatle düşün. Sonunda fazladan bir dönüş olması sorun değil."},
"repeatUntil":function(d){return "kadar tekrarla"},
"repeatUntilBlocked":function(d){return "İleride yol olduğu sürece"},
"repeatUntilFinish":function(d){return "bitene kadar tekrarla"},
"step":function(d){return "Adım"},
"totalHoney":function(d){return "Toplam bal"},
"totalNectar":function(d){return "Toplam nektar"},
"turnLeft":function(d){return "sola dön"},
"turnRight":function(d){return "sağa dön"},
"turnTooltip":function(d){return "Beni sola ya da sağa 90 derece döndürür."},
"uncheckedCloudError":function(d){return "Onların çiçek mi yoksa petek mi olduğunu görmek için bütün bulutları kontrol ettiğinizden emin olun."},
"uncheckedPurpleError":function(d){return "Tüm mor çiçeklerde nektar olup olmadığını kontrol ediniz"},
"whileMsg":function(d){return "sürece"},
"whileTooltip":function(d){return "Bitiş noktasına ulaşana kadar blok içindeki işlemleri tekrarla."},
"word":function(d){return "Sözcüğü bul"},
"yes":function(d){return "Evet"},
"youSpelled":function(d){return "Açıkladınız"},
"didNotCollectEverything":function(d){return "Make sure you don't leave any nectar or honey behind!"}};