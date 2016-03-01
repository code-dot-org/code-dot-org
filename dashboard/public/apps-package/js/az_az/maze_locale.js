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
"atHoneycomb":function(d){return "pətəkdə"},
"atFlower":function(d){return "çiçəkdə"},
"avoidCowAndRemove":function(d){return "inəyə toxunma və birini yiğişdır"},
"continue":function(d){return "Davam et"},
"dig":function(d){return "birini yığışdır"},
"digTooltip":function(d){return "Bir parça torpağı yığışdır"},
"dirE":function(d){return "Şərq"},
"dirN":function(d){return "Şimal"},
"dirS":function(d){return "Cənub"},
"dirW":function(d){return "Qərb"},
"doCode":function(d){return "et"},
"elseCode":function(d){return "əks halda"},
"fill":function(d){return "birini doldur"},
"fillN":function(d){return maze_locale.v(d,"shovelfuls")+" doldur"},
"fillStack":function(d){return "çuxurları kürəklə dalbadal doldur"},
"fillSquare":function(d){return "kvadrat doldur"},
"fillTooltip":function(d){return "bir parça torpaq qoy"},
"finalLevel":function(d){return "Təbriklər! Axırıncı tapmacanı da tapdınız."},
"flowerEmptyError":function(d){return "Üstündəki çiçəkdə nektar qalmadı."},
"didNotCollectEverything":function(d){return "Hər hansı bir bal və ya nektarı geridə buraxmadığından əmin ol!"},
"get":function(d){return "götür"},
"heightParameter":function(d){return "hündürlük"},
"holePresent":function(d){return "çuxur var"},
"honey":function(d){return "bal hazırla"},
"honeyAvailable":function(d){return "bal"},
"honeyTooltip":function(d){return "Nektardan bal hazırla"},
"honeycombFullError":function(d){return "Bu pətəkdə daha çox bal üçün yer yoxdur."},
"ifCode":function(d){return "əgər"},
"ifInRepeatError":function(d){return "Sizə \"təkrar et\" blokunun daxilində \"əgər\" bloku lazımdır. Əgər çətinlik çəkirsinizsə, əvvəlki mərhələni bir də keçin ki, bunu necə etdiyinizi görəsiniz."},
"ifPathAhead":function(d){return "əgər qabaqda yol varsa,"},
"ifTooltip":function(d){return "Əgər göstərilən istiqamətdə bir yol varsa, bəzi əmrləri yerinə yetir."},
"ifelseTooltip":function(d){return "Əgər göstərilən istiqamətdə yol varsa, əmrlərin birinci blokunu yerinə yetir. Əks halda isə əmrlərin ikinci blokunu."},
"ifFlowerTooltip":function(d){return "Çiçək/pətək göstərilən tərəfdə varsa, bir şey et."},
"ifOnlyFlowerTooltip":function(d){return "Göstərilən tərəfdə yol varsa, onda bəzi komandalar yaz."},
"ifelseFlowerTooltip":function(d){return "Çiçək/pətək göstərilən tərəfdədirsə, onda komandaların ilk əmrini yaz. Əkshalda, komandaların ikinci blokunu düzəlt."},
"insufficientHoney":function(d){return "Lazımi bütün blokları işlədirsiniz, lakin lazımi qədər bal yığmağınız tələb olunur."},
"insufficientNectar":function(d){return "Nektarı düzgün miqdarda toplamalısan."},
"make":function(d){return "hazırla"},
"moveBackward":function(d){return "geriyə get"},
"moveEastTooltip":function(d){return "Məni şərqə bir boşluq apar."},
"moveForward":function(d){return "irəli get"},
"moveForwardTooltip":function(d){return "Məni bir xana irəli apar."},
"moveNorthTooltip":function(d){return "Məni şimala bir boşluq apar."},
"moveSouthTooltip":function(d){return "Məni cənuba bir boşluq apar."},
"moveTooltip":function(d){return "Məni irəli/geri bir boşluq apar"},
"moveWestTooltip":function(d){return "Məni qərbə tərəf bir boşluq apar."},
"nectar":function(d){return "nektarı al"},
"nectarRemaining":function(d){return "nektar"},
"nectarTooltip":function(d){return "Çiçəkdən nektar al"},
"nextLevel":function(d){return "Təbriklər! Siz bu tapmacanı tamamladınız."},
"no":function(d){return "Xeyr"},
"noPathAhead":function(d){return "yol kəsilib"},
"noPathLeft":function(d){return "sola yol yoxdur"},
"noPathRight":function(d){return "sağa yol yoxdur"},
"notAtFlowerError":function(d){return "Nektarı yalnız bir çiçəkdən ala bilərsiniz."},
"notAtHoneycombError":function(d){return "Yalnız pətəkdə bal hazırlaya bilərsən."},
"numBlocksNeeded":function(d){return "Bu  tapmaca %1 blokla həll oluna bilər."},
"pathAhead":function(d){return "irəli yol var"},
"pathLeft":function(d){return "əgər sola yol varsa,"},
"pathRight":function(d){return "əgər sağa yol varsa,"},
"pilePresent":function(d){return "təpəcik var"},
"putdownTower":function(d){return "qülləni yerə qoy"},
"removeAndAvoidTheCow":function(d){return "Birini yığışdır və inəyə toxunma"},
"removeN":function(d){return maze_locale.v(d,"shovelfuls")+" yığışdır"},
"removePile":function(d){return "təpəciyi yiğışdır"},
"removeStack":function(d){return "dalbadal "+maze_locale.v(d,"shovelfuls")+" təpəciyi yığışdır"},
"removeSquare":function(d){return "kvadratı yığışdır"},
"repeatCarefullyError":function(d){return "Bunu həll etmək üçün iki həmlə və bir döngəni \"təkrarla\" blokuna qoymağı diqqətlicə düşün. Nəticədə artıq bir təkrarın olması problem deyil."},
"repeatUntil":function(d){return "təkrar et, ta ki"},
"repeatUntilBlocked":function(d){return "hələ ki, qabaqda yol var"},
"repeatUntilFinish":function(d){return "bitənə qədər təkrar et"},
"step":function(d){return "addım"},
"totalHoney":function(d){return "ümumi bal"},
"totalNectar":function(d){return "ümumi nektar"},
"turnLeft":function(d){return "sola dön"},
"turnRight":function(d){return "sağa dön"},
"turnTooltip":function(d){return "Məni 90 dərəcə sola və ya sağa döndərir."},
"uncheckedCloudError":function(d){return "Onların çiçək yoxsa pətək olduğunu öyrənmək üçün bütün buludları konrol etdiyinizdən əmin olun."},
"uncheckedPurpleError":function(d){return "Bütün bənövşəyi çiçəklərdə nektar olub-olmadığını kontrol edin"},
"whileMsg":function(d){return "hələ ki,"},
"whileTooltip":function(d){return "Hasarlanmış əmrləri son nöqtəyə çatana qədər təkrarla."},
"word":function(d){return "Sözü tap"},
"yes":function(d){return "Bəli"},
"youSpelled":function(d){return "Açıqladınız"}};