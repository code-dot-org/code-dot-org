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
"continue":function(d){return "ดำเนินการต่อไป"},
"doCode":function(d){return "ทำ"},
"elseCode":function(d){return "อีกอย่างหนึ่ง"},
"endGame":function(d){return "จบเกมส์"},
"endGameTooltip":function(d){return "เกมส์โอเวอร์."},
"finalLevel":function(d){return "ขอแสดงความยินดีคุณสามารถแก้ปัญหาสุดท้ายได้แล้ว."},
"flap":function(d){return "บิน"},
"flapRandom":function(d){return "บินด้วยความสูงระดับต่างๆ"},
"flapVerySmall":function(d){return "บินด้วยความต่างเล็กสุด"},
"flapSmall":function(d){return "บินด้วยความต่างระดับเล็ก"},
"flapNormal":function(d){return "บินด้วยความต่างระดับปานกลาง"},
"flapLarge":function(d){return "บินด้วยความต่างระดับใหญ่"},
"flapVeryLarge":function(d){return "บินด้วยความต่างระดับใหญ่มาก"},
"flapTooltip":function(d){return "บินขึ้น."},
"flappySpecificFail":function(d){return "โปรแกรมของคุณดูดีมาก - มันจะหมุนในแต่ละคลิ่ก. แต่คุณต้องคลิ่กหลายทีเพื่อให้มันหมุนไปที่เป้าหมาย."},
"incrementPlayerScore":function(d){return "ได้แต้ม"},
"incrementPlayerScoreTooltip":function(d){return "เพิ่มคะแนนผู้เล่น 1 คะแนน"},
"nextLevel":function(d){return "ขอแสดงความยินดีคุณสำเร็จปริศนานี้."},
"no":function(d){return "ไม่ใช่"},
"numBlocksNeeded":function(d){return "ปริศนานี้สามารถแก้ได้เพียงแค่ %1 บล็อกเท่านั้นเอง"},
"playSoundRandom":function(d){return "เล่นเพลงไม่ตามลำดับ"},
"playSoundBounce":function(d){return "เล่นเสียงกระเด้ง"},
"playSoundCrunch":function(d){return "ให้เล่นเสียงดังกร้วม"},
"playSoundDie":function(d){return "เล่นเพลงเศร้า"},
"playSoundHit":function(d){return "เล่นเสียงตบตี"},
"playSoundPoint":function(d){return "เล่นเสียงจุด"},
"playSoundSwoosh":function(d){return "เล่นเสียงสูบ"},
"playSoundWing":function(d){return "เล่นเสียงปีก"},
"playSoundJet":function(d){return "เล่นเสียงเจ๊ต"},
"playSoundCrash":function(d){return "play crash sound"},
"playSoundJingle":function(d){return "play jingle sound"},
"playSoundSplash":function(d){return "play splash sound"},
"playSoundLaser":function(d){return "play laser sound"},
"playSoundTooltip":function(d){return "เล่นเสียงที่ถูกเลือก."},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เริ่มอีกครั้ง\" เพื่อกลับไปสู่เกมส์ของคุณ."},
"scoreText":function(d){return "คะแนน: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ตั้งค่าฉาก"},
"setBackgroundRandom":function(d){return "ตั้งค่าฉากแบบสุ่ม"},
"setBackgroundFlappy":function(d){return "ตั้งค่าฉากเมือง (กลางวัน)"},
"setBackgroundNight":function(d){return "ตั้งค่าฉากเมือง (กลางคืน)"},
"setBackgroundSciFi":function(d){return "ตั้งค่าฉากแบบ Sci-Fi"},
"setBackgroundUnderwater":function(d){return "ตั้งค่าฉากแบบใต้น้ำ"},
"setBackgroundCave":function(d){return "ตั้งค่าฉากแบบถ้ำ"},
"setBackgroundSanta":function(d){return "ตั้งค่าฉากแบบซานต้า"},
"setBackgroundTooltip":function(d){return "ตั่งค่าภาพพื้นหลัง"},
"setGapRandom":function(d){return "ตั้งค่าช่องว่างแบบสุ่ม"},
"setGapVerySmall":function(d){return "ตั้งค่าช่องว่างขนาดเล็กมาก"},
"setGapSmall":function(d){return "ตั้งค่าช่องว่างขนาดเล็ก"},
"setGapNormal":function(d){return "ตั้งค่าช่องว่างปกติ"},
"setGapLarge":function(d){return "ตั้งค่าช่องว่างขนาดใหญ่"},
"setGapVeryLarge":function(d){return "ตั้งค่าช่องว่างขนาดใหญ่มาก"},
"setGapHeightTooltip":function(d){return "Sets the vertical gap in an obstacle"},
"setGravityRandom":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสุ่ม"},
"setGravityVeryLow":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบต่ำมาก"},
"setGravityLow":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบต่ำ"},
"setGravityNormal":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบปกติ"},
"setGravityHigh":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสูง"},
"setGravityVeryHigh":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสูงมาก"},
"setGravityTooltip":function(d){return "ตั้งค่าระดับของแรงโน้มถ่วง"},
"setGround":function(d){return "ตั้งค่าพื้นดิน"},
"setGroundRandom":function(d){return "ตั้งค่าพื้นดินแบบสุ่ม"},
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
"shareGame":function(d){return "Share your game:"},
"soundRandom":function(d){return "สุ่ม"},
"soundBounce":function(d){return "กระเด้ง"},
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
"whenRunButtonClick":function(d){return "เมื่อเกมเริ่ม"},
"whenRunButtonClickTooltip":function(d){return "Execute the actions below when the game starts."},
"yes":function(d){return "ใช่"}};