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
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"scoreText":function(d){return "Xal: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "səhnə qur"},
"setBackgroundRandom":function(d){return "ixtiyari səhnəni qur"},
"setBackgroundFlappy":function(d){return "Şəhər (gündüz) səhnəsini qur"},
"setBackgroundNight":function(d){return "Şəhər (gecə) səhnəsini qur"},
"setBackgroundSciFi":function(d){return "set scene Sci-Fi"},
"setBackgroundUnderwater":function(d){return "set scene Underwater"},
"setBackgroundCave":function(d){return "set scene Cave"},
"setBackgroundSanta":function(d){return "set scene Santa"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setGapRandom":function(d){return "set a random gap"},
"setGapVerySmall":function(d){return "set a very small gap"},
"setGapSmall":function(d){return "set a small gap"},
"setGapNormal":function(d){return "set a normal gap"},
"setGapLarge":function(d){return "set a large gap"},
"setGapVeryLarge":function(d){return "set a very large gap"},
"setGapHeightTooltip":function(d){return "Sets the vertical gap in an obstacle"},
"setGravityRandom":function(d){return "set gravity random"},
"setGravityVeryLow":function(d){return "set gravity very low"},
"setGravityLow":function(d){return "set gravity low"},
"setGravityNormal":function(d){return "set gravity normal"},
"setGravityHigh":function(d){return "set gravity high"},
"setGravityVeryHigh":function(d){return "set gravity very high"},
"setGravityTooltip":function(d){return "Sets the level's gravity"},
"setGround":function(d){return "set ground"},
"setGroundRandom":function(d){return "set ground Random"},
"setGroundFlappy":function(d){return "set ground Ground"},
"setGroundSciFi":function(d){return "set ground Sci-Fi"},
"setGroundUnderwater":function(d){return "set ground Underwater"},
"setGroundCave":function(d){return "set ground Cave"},
"setGroundSanta":function(d){return "set ground Santa"},
"setGroundLava":function(d){return "set ground Lava"},
"setGroundTooltip":function(d){return "Sets the ground image"},
"setObstacle":function(d){return "set obstacle"},
"setObstacleRandom":function(d){return "set obstacle Random"},
"setObstacleFlappy":function(d){return "set obstacle Pipe"},
"setObstacleSciFi":function(d){return "set obstacle Sci-Fi"},
"setObstacleUnderwater":function(d){return "set obstacle Plant"},
"setObstacleCave":function(d){return "set obstacle Cave"},
"setObstacleSanta":function(d){return "set obstacle Chimney"},
"setObstacleLaser":function(d){return "set obstacle Laser"},
"setObstacleTooltip":function(d){return "Sets the obstacle image"},
"setPlayer":function(d){return "set player"},
"setPlayerRandom":function(d){return "set player Random"},
"setPlayerFlappy":function(d){return "set player Yellow Bird"},
"setPlayerRedBird":function(d){return "set player Red Bird"},
"setPlayerSciFi":function(d){return "set player Spaceship"},
"setPlayerUnderwater":function(d){return "set player Fish"},
"setPlayerCave":function(d){return "set player Bat"},
"setPlayerSanta":function(d){return "set player Santa"},
"setPlayerShark":function(d){return "set player Shark"},
"setPlayerEaster":function(d){return "set player Easter Bunny"},
"setPlayerBatman":function(d){return "set player Bat guy"},
"setPlayerSubmarine":function(d){return "set player Submarine"},
"setPlayerUnicorn":function(d){return "set player Unicorn"},
"setPlayerFairy":function(d){return "set player Fairy"},
"setPlayerSuperman":function(d){return "set player Flappyman"},
"setPlayerTurkey":function(d){return "set player Turkey"},
"setPlayerTooltip":function(d){return "Sets the player image"},
"setScore":function(d){return "set score"},
"setScoreTooltip":function(d){return "Sets the player's score"},
"setSpeed":function(d){return "set speed"},
"setSpeedTooltip":function(d){return "Sets the level's speed"},
"shareFlappyTwitter":function(d){return "Check out the Flappy game I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Oyununuzu bölüşün:"},
"soundRandom":function(d){return "təsadüfi"},
"soundBounce":function(d){return "bounce"},
"soundCrunch":function(d){return "crunch"},
"soundDie":function(d){return "sad"},
"soundHit":function(d){return "smash"},
"soundPoint":function(d){return "point"},
"soundSwoosh":function(d){return "swoosh"},
"soundWing":function(d){return "wing"},
"soundJet":function(d){return "jet"},
"soundCrash":function(d){return "crash"},
"soundJingle":function(d){return "jingle"},
"soundSplash":function(d){return "splash"},
"soundLaser":function(d){return "laser"},
"speedRandom":function(d){return "set speed random"},
"speedVerySlow":function(d){return "set speed very slow"},
"speedSlow":function(d){return "set speed slow"},
"speedNormal":function(d){return "set speed normal"},
"speedFast":function(d){return "set speed fast"},
"speedVeryFast":function(d){return "set speed very fast"},
"whenClick":function(d){return "when click"},
"whenClickTooltip":function(d){return "Execute the actions below when a click event occurs."},
"whenCollideGround":function(d){return "when hit the ground"},
"whenCollideGroundTooltip":function(d){return "Execute the actions below when Flappy hits the ground."},
"whenCollideObstacle":function(d){return "when hit an obstacle"},
"whenCollideObstacleTooltip":function(d){return "Execute the actions below when Flappy hits an obstacle."},
"whenEnterObstacle":function(d){return "when pass obstacle"},
"whenEnterObstacleTooltip":function(d){return "Execute the actions below when Flappy enters an obstacle."},
"whenRunButtonClick":function(d){return "oyun başladıqda"},
"whenRunButtonClickTooltip":function(d){return "Execute the actions below when the game starts."},
"yes":function(d){return "Bəli"}};