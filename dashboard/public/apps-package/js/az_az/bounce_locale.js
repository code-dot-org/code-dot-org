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
"bounceBall":function(d){return "sıçrayan top"},
"bounceBallTooltip":function(d){return "Bounce a ball off of an object."},
"continue":function(d){return "Davam et"},
"dirE":function(d){return "Şərq"},
"dirN":function(d){return "Şimal"},
"dirS":function(d){return "Cənub"},
"dirW":function(d){return "Qərb"},
"doCode":function(d){return "et"},
"elseCode":function(d){return "əks halda"},
"finalLevel":function(d){return "Təbriklər! Axırıncı tapmacanı da tapdınız."},
"heightParameter":function(d){return "hündürlük"},
"ifCode":function(d){return "əgər"},
"ifPathAhead":function(d){return "əgər qabaqda yol varsa,"},
"ifTooltip":function(d){return "Əgər göstərilən istiqamətdə bir yol varsa, bəzi əmrləri yerinə yetir."},
"ifelseTooltip":function(d){return "Əgər göstərilən istiqamətdə yol varsa, əmrlərin birinci blokunu yerinə yetir. Əks halda isə əmrlərin ikinci blokunu."},
"incrementOpponentScore":function(d){return "rəqibə xal qazandır"},
"incrementOpponentScoreTooltip":function(d){return "İndiki qarşı tərəfə vahid əlavə et."},
"incrementPlayerScore":function(d){return "xal qazan"},
"incrementPlayerScoreTooltip":function(d){return "Oyunçunun hazırki xallarının üstünə bir gəl."},
"isWall":function(d){return "bu divardırmı"},
"isWallTooltip":function(d){return "Əgər burada divar var isə doğruya çevirir"},
"launchBall":function(d){return "yeni top fırlat"},
"launchBallTooltip":function(d){return "Oyuna top fırlat."},
"makeYourOwn":function(d){return "Öz Sıçrayan Oyununu yarat"},
"moveDown":function(d){return "aşağı get"},
"moveDownTooltip":function(d){return "Kürəyi aşağı hərəkət etdir."},
"moveForward":function(d){return "irəli get"},
"moveForwardTooltip":function(d){return "Məni bir xana irəli apar."},
"moveLeft":function(d){return "sola get"},
"moveLeftTooltip":function(d){return "Kürəyi sola hərəkət etdir."},
"moveRight":function(d){return "sağa get"},
"moveRightTooltip":function(d){return "Kürəyi sağa hərəkət etdir."},
"moveUp":function(d){return "yuxarı get"},
"moveUpTooltip":function(d){return "Kürəyi yuxarı hərəkət etdir."},
"nextLevel":function(d){return "Təbriklər! Siz bu tapmacanı tamamladınız."},
"no":function(d){return "Xeyr"},
"noPathAhead":function(d){return "yol kəsilib"},
"noPathLeft":function(d){return "sola yol yoxdur"},
"noPathRight":function(d){return "sağa yol yoxdur"},
"numBlocksNeeded":function(d){return "Bu  tapmaca %1 blokla həll oluna bilər."},
"pathAhead":function(d){return "irəli yol var"},
"pathLeft":function(d){return "əgər sola yol varsa,"},
"pathRight":function(d){return "əgər sağa yol varsa,"},
"pilePresent":function(d){return "təpəcik var"},
"playSoundCrunch":function(d){return "xırçıltı səsini çal"},
"playSoundGoal1":function(d){return "hədəf 1 səsi çıxart"},
"playSoundGoal2":function(d){return "hədəf 2 səsi çıxart"},
"playSoundHit":function(d){return "zərbə səsini oynat"},
"playSoundLosePoint":function(d){return "xal itirmək səsini oynat"},
"playSoundLosePoint2":function(d){return "xal 2 uduzmaq səsini oynat"},
"playSoundRetro":function(d){return "qədimi səs oynat"},
"playSoundRubber":function(d){return "rezin səsini oynat"},
"playSoundSlap":function(d){return "çırpma səsini oynat"},
"playSoundTooltip":function(d){return "Seçilmiş səsi oynat."},
"playSoundWinPoint":function(d){return "qələbə xalı səsini oynat"},
"playSoundWinPoint2":function(d){return "2-ci qələbə xalı səsini oynat"},
"playSoundWood":function(d){return "taxta səsini oynat"},
"putdownTower":function(d){return "qülləni yerə qoy"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "kvadratı yığışdır"},
"repeatUntil":function(d){return "təkrar et, ta ki"},
"repeatUntilBlocked":function(d){return "hələ ki, qabaqda yol var"},
"repeatUntilFinish":function(d){return "bitənə qədər təkrar et"},
"scoreText":function(d){return "Hesab: "+bounce_locale.v(d,"oyunçuXalı")+" : "+bounce_locale.v(d,"rəqibXalı")},
"setBackgroundRandom":function(d){return "təsadüfi səhnə qur"},
"setBackgroundHardcourt":function(d){return "bərk kort səhnəsini qur"},
"setBackgroundRetro":function(d){return "qədimi səhnə qur"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setBallRandom":function(d){return "təsadüfi top qur"},
"setBallHardcourt":function(d){return "bərk kort topu qur"},
"setBallRetro":function(d){return "qədimi top qur"},
"setBallTooltip":function(d){return "Topun təsvirini qurur"},
"setBallSpeedRandom":function(d){return "təsadüfi top sürəti qur"},
"setBallSpeedVerySlow":function(d){return "çox yavaş top sürəti qur"},
"setBallSpeedSlow":function(d){return "yavaş top sürəti qur"},
"setBallSpeedNormal":function(d){return "orta top sürəti qur"},
"setBallSpeedFast":function(d){return "sürətli top sürəti qur"},
"setBallSpeedVeryFast":function(d){return "çox sürətli top sürəti qur"},
"setBallSpeedTooltip":function(d){return "Topun sürətini qurur"},
"setPaddleRandom":function(d){return "təsadüfi kürək qur"},
"setPaddleHardcourt":function(d){return "bərk kort kürəyi qur"},
"setPaddleRetro":function(d){return "qədimi kürəyi qur"},
"setPaddleTooltip":function(d){return "Kürəyin təsvirini qur"},
"setPaddleSpeedRandom":function(d){return "set random paddle speed"},
"setPaddleSpeedVerySlow":function(d){return "set very slow paddle speed"},
"setPaddleSpeedSlow":function(d){return "set slow paddle speed"},
"setPaddleSpeedNormal":function(d){return "set normal paddle speed"},
"setPaddleSpeedFast":function(d){return "set fast paddle speed"},
"setPaddleSpeedVeryFast":function(d){return "set very fast paddle speed"},
"setPaddleSpeedTooltip":function(d){return "Sets the speed of the paddle"},
"shareBounceTwitter":function(d){return "Mənim yaratdığım Sıçrayan oyununu yoxlayın. Onu @codeorg vasitəsilə mən yazmışam"},
"shareGame":function(d){return "Oyununuzu bölüşün:"},
"turnLeft":function(d){return "sola dön"},
"turnRight":function(d){return "sağa dön"},
"turnTooltip":function(d){return "Məni 90 dərəcə sola və ya sağa döndərir."},
"whenBallInGoal":function(d){return "top qol olanda"},
"whenBallInGoalTooltip":function(d){return "Elə ki, top hədəfə dəyir, aşağıdakı əmrləri icra et."},
"whenBallMissesPaddle":function(d){return "when ball misses paddle"},
"whenBallMissesPaddleTooltip":function(d){return "Execute the actions below when a ball misses the paddle."},
"whenDown":function(d){return "oxu aşağı etdikdə"},
"whenDownTooltip":function(d){return "Ox aşağı açarı basıldıqda aşağıdakı əmrləri icra et."},
"whenGameStarts":function(d){return "oyun başladıqda"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "oxu sola etdikdə"},
"whenLeftTooltip":function(d){return "Ox sola açarı basıldıqda aşağıdakı əmrləri icra et."},
"whenPaddleCollided":function(d){return "when ball hits paddle"},
"whenPaddleCollidedTooltip":function(d){return "Execute the actions below when a ball collides with a paddle."},
"whenRight":function(d){return "oxu sağa etdikdə"},
"whenRightTooltip":function(d){return "Ox aşağı açarı basıldıqda aşağıdakı əmrləri icra et."},
"whenUp":function(d){return "oxu yuxarı etdikdə"},
"whenUpTooltip":function(d){return "Ox yuxarı açarı basıldıqda aşağıdakı əmrləri icra et."},
"whenWallCollided":function(d){return "top divara dəyəndə"},
"whenWallCollidedTooltip":function(d){return "Top divarla toqquşanda aşağıdakı əmrləri icra et."},
"whileMsg":function(d){return "hələ ki,"},
"whileTooltip":function(d){return "Hasarlanmış əmrləri son nöqtəyə çatana qədər təkrarla."},
"yes":function(d){return "Bəli"}};