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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Davam et"},
"doCode":function(d){return "et"},
"elseCode":function(d){return "əks halda"},
"endGame":function(d){return "oyunu bitir"},
"endGameTooltip":function(d){return "Oyunu başa çatdırır."},
"finalLevel":function(d){return "Təbriklər! Axırıncı tapmacanı da tapdınız."},
"flap":function(d){return "qanad çal"},
"flapRandom":function(d){return "ixtiyari miqdarda qanad çal"},
"flapVerySmall":function(d){return "çox kiçik miqdarda qanad çal"},
"flapSmall":function(d){return "kiçik miqdarda qanad çal"},
"flapNormal":function(d){return "normal miqdarda qanad çal"},
"flapLarge":function(d){return "böyük miqdarda qanad çal"},
"flapVeryLarge":function(d){return "çox böyük miqdarda qanad çal"},
"flapTooltip":function(d){return "Flappy-ni yuxarıya uçurt."},
"flappySpecificFail":function(d){return "Sizin kodlaşdırmanız yaxşı görünür - hər klikdə qanad çalır. Lakin siz hədəfə çatmaq üçün bir neçə dəfə klikləyib qanad çalmalısınız."},
"incrementPlayerScore":function(d){return "bir xal qazan"},
"incrementPlayerScoreTooltip":function(d){return "Oyunçunun hazırki xallarının üstünə bir gəl."},
"nextLevel":function(d){return "Təbriklər! Siz bu tapmacanı tamamladınız."},
"no":function(d){return "Xeyr"},
"numBlocksNeeded":function(d){return "Bu tapmacanı %1 blokla həll etmək olar."},
"playSoundRandom":function(d){return "təsadüfi səs çıxart"},
"playSoundBounce":function(d){return "sıçrayış səsi çıxart"},
"playSoundCrunch":function(d){return "xırçıltı səsi çıxart"},
"playSoundDie":function(d){return "qəmgin səs çıxart"},
"playSoundHit":function(d){return "əzilmək səsini çıxart"},
"playSoundPoint":function(d){return "xal qazanmaq səsini çal"},
"playSoundSwoosh":function(d){return "swoosh səsini çal"},
"playSoundWing":function(d){return "qanad səsini çal"},
"playSoundJet":function(d){return "reaktiv təyyarə səsi çıxart"},
"playSoundCrash":function(d){return "qəza səsini çal"},
"playSoundJingle":function(d){return "jingle səsini çal"},
"playSoundSplash":function(d){return "splash səsini çal"},
"playSoundLaser":function(d){return "lazer səsini çal"},
"playSoundTooltip":function(d){return "Seçilmiş səsi oynat."},
"reinfFeedbackMsg":function(d){return "Oyununuzu təkrar oynamaq üçün \"Təkrar\" düyməsinə basa bilərsiniz."},
"scoreText":function(d){return "Xal: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "səhnə qur"},
"setBackgroundRandom":function(d){return "ixtiyari səhnəni qur"},
"setBackgroundFlappy":function(d){return "Şəhər (gündüz) səhnəsini qur"},
"setBackgroundNight":function(d){return "Şəhər (gecə) səhnəsini qur"},
"setBackgroundSciFi":function(d){return "arxa fonu elm-fantastika təyin et"},
"setBackgroundUnderwater":function(d){return "arxa fonu sualtı təyin et"},
"setBackgroundCave":function(d){return "arxa fonu mağara təyin et"},
"setBackgroundSanta":function(d){return "arxa fonu şaxta təyin et"},
"setBackgroundTooltip":function(d){return "Arxa fon şəklini təyin edir"},
"setGapRandom":function(d){return "təsadüfi boşluq seç"},
"setGapVerySmall":function(d){return "çox balaca boşluq seç"},
"setGapSmall":function(d){return "balaca boşluq seç"},
"setGapNormal":function(d){return "normal boşluq seç"},
"setGapLarge":function(d){return "böyük boşluq seç"},
"setGapVeryLarge":function(d){return "boşluğu çox böyük təyin et"},
"setGapHeightTooltip":function(d){return "Maneənin içində bir boşluq düzəldir"},
"setGravityRandom":function(d){return "cazibə gücünü təsadüfi təyin et"},
"setGravityVeryLow":function(d){return "cazibə gücünü çox zəif təyin et"},
"setGravityLow":function(d){return "cazibə gücünü zəif təyin et"},
"setGravityNormal":function(d){return "cazibə gücünü normal təyin et"},
"setGravityHigh":function(d){return "cazibə gücünü güclü təyin et"},
"setGravityVeryHigh":function(d){return "cazibə gücünü çox güclü təyin et"},
"setGravityTooltip":function(d){return "Mərhələnin cazibə gücünü təyin edir"},
"setGround":function(d){return "zəmini seç"},
"setGroundRandom":function(d){return "zəmini təadüfi təyin et"},
"setGroundFlappy":function(d){return "zəmini zəmin təyin et"},
"setGroundSciFi":function(d){return "zəmini elm-fantastika təyin et"},
"setGroundUnderwater":function(d){return "zəmini sualtı təyin et"},
"setGroundCave":function(d){return "zəmini mağara təyin et"},
"setGroundSanta":function(d){return "zəmini şaxta təyin et"},
"setGroundLava":function(d){return "zəmini lava təyin et"},
"setGroundTooltip":function(d){return "Zəmin şəkilini təyin edir"},
"setObstacle":function(d){return "maneəni seç"},
"setObstacleRandom":function(d){return "maneəni təsadüfi təyin et"},
"setObstacleFlappy":function(d){return "maneəni boru təyin et"},
"setObstacleSciFi":function(d){return "maneəni elm-fantastika təyin et"},
"setObstacleUnderwater":function(d){return "maneəni bitki təyin et"},
"setObstacleCave":function(d){return "maneəni mağara təyin et"},
"setObstacleSanta":function(d){return "maneəni baca təyin et"},
"setObstacleLaser":function(d){return "maneəni lazer təyin et"},
"setObstacleTooltip":function(d){return "Maneə şəkilini redaktə edir"},
"setPlayer":function(d){return "oyunçunu seç"},
"setPlayerRandom":function(d){return "oyunçunu təsadüfi seç"},
"setPlayerFlappy":function(d){return "oyunçunu sarı quş təyin et"},
"setPlayerRedBird":function(d){return "oyunçunu qırmızı quş təyin et"},
"setPlayerSciFi":function(d){return "oyunçunu fəza gəmisi təyin et"},
"setPlayerUnderwater":function(d){return "oyunçunu balıq təyin et"},
"setPlayerCave":function(d){return "oyunçunu yarasa təyin et"},
"setPlayerSanta":function(d){return "oyunçunu Şaxta Baba təyin et"},
"setPlayerShark":function(d){return "oyunçunu köpəkbalığı təyin et"},
"setPlayerEaster":function(d){return "oyunçunu Pasxa dovşanı təyin et"},
"setPlayerBatman":function(d){return "oyunçunu yarasa adam təyin et"},
"setPlayerSubmarine":function(d){return "oyunçunu dənizaltı təyin et"},
"setPlayerUnicorn":function(d){return "oyunçunu Unicorn təyin et"},
"setPlayerFairy":function(d){return "oyunçunu pəri təyin et"},
"setPlayerSuperman":function(d){return "oyunçunu quş adam təyin et"},
"setPlayerTurkey":function(d){return "oyunçunu hindiquşu təyin et"},
"setPlayerTooltip":function(d){return "Oyunç şəklini təyin edir"},
"setScore":function(d){return "skoru təyin et"},
"setScoreTooltip":function(d){return "Oyunçunun skorunu təyin edir"},
"setSpeed":function(d){return "sürəti təyin et"},
"setSpeedTooltip":function(d){return "Mərhələnin sürətini təyin edir"},
"shareFlappyTwitter":function(d){return "Düzəltdiyim Qanadlı oyununu yola. Onu @codeorg-da özüm yazmışam"},
"shareGame":function(d){return "Oyununuzu bölüşün:"},
"soundRandom":function(d){return "təsadüfi"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "çatlamış"},
"soundDie":function(d){return "qəmgin"},
"soundHit":function(d){return "parçalanmış"},
"soundPoint":function(d){return "xal"},
"soundSwoosh":function(d){return "\"vın\""},
"soundWing":function(d){return "qanad"},
"soundJet":function(d){return "raket"},
"soundCrash":function(d){return "toqquşma"},
"soundJingle":function(d){return "cingilti"},
"soundSplash":function(d){return "hoppanma"},
"soundLaser":function(d){return "lazer"},
"speedRandom":function(d){return "sürəti təsadüfi təyin et"},
"speedVerySlow":function(d){return "sürəti çox zəif təyin et"},
"speedSlow":function(d){return "sürəti zəif təyin et"},
"speedNormal":function(d){return "sürəti normal təyin et"},
"speedFast":function(d){return "sürəti sürətli təyin et"},
"speedVeryFast":function(d){return "sürəti çox sürətli təyin et"},
"whenClick":function(d){return "basanda"},
"whenClickTooltip":function(d){return "Siçanın düyməsinə basanda aşağıdakı əmrləri icra et."},
"whenCollideGround":function(d){return "yerə düşəndə"},
"whenCollideGroundTooltip":function(d){return "Quş yerə düşəndə aşağıdankı komandaları icra et."},
"whenCollideObstacle":function(d){return "bir maneəyə dəyəndə"},
"whenCollideObstacleTooltip":function(d){return "Quş bir maneəyə dəyəndə aşağıdakı komandaları icra et."},
"whenEnterObstacle":function(d){return "maneə keçiləndə"},
"whenEnterObstacleTooltip":function(d){return "Quş bir maneəyə girəndə aşağıdakı komandaları icra et."},
"whenRunButtonClick":function(d){return "oyun başladıqda"},
"whenRunButtonClickTooltip":function(d){return "Oyun başladıqda aşağıdakı əmrləri icra et."},
"yes":function(d){return "Bəli"}};