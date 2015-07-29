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
"playSoundCrash":function(d){return "เล่นเสียงชน"},
"playSoundJingle":function(d){return "เล่นเสียงกรุ๊งกริ๊ง"},
"playSoundSplash":function(d){return "เล่นเสียงพ่นน้ำ"},
"playSoundLaser":function(d){return "เล่นเสียงเลเซอร์"},
"playSoundTooltip":function(d){return "เล่นเสียงที่ถูกเลือก."},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เริ่มอีกครั้ง\" เพื่อกลับไปสู่เกมส์ของคุณ."},
"scoreText":function(d){return "คะแนน: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "ตั้งค่าฉาก"},
"setBackgroundRandom":function(d){return "ตั้งค่าฉากแบบสุ่ม"},
"setBackgroundFlappy":function(d){return "ตั้งค่าฉากเมือง (กลางวัน)"},
"setBackgroundNight":function(d){return "ตั้งค่าฉากเมือง (กลางคืน)"},
"setBackgroundSciFi":function(d){return "ตั้งค่าฉากแบบ ไซ-ไฟ"},
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
"setGapHeightTooltip":function(d){return "ตั้งค่าช่องว่างระหว่างสิ่งกีดขวาง"},
"setGravityRandom":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสุ่ม"},
"setGravityVeryLow":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบต่ำมาก"},
"setGravityLow":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบต่ำ"},
"setGravityNormal":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบปกติ"},
"setGravityHigh":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสูง"},
"setGravityVeryHigh":function(d){return "ตั้งค่าแรงโน้มถ่วงแบบสูงมาก"},
"setGravityTooltip":function(d){return "ตั้งค่าระดับของแรงโน้มถ่วง"},
"setGround":function(d){return "ตั้งค่าพื้นดิน"},
"setGroundRandom":function(d){return "ตั้งค่าพื้นดินแบบสุ่ม"},
"setGroundFlappy":function(d){return "ตั้งค่าพื้นดิน พื้นดิน"},
"setGroundSciFi":function(d){return "ตั้งค่าพื้นดิน ไซ-ไฟ"},
"setGroundUnderwater":function(d){return "ตั้งค่าพื้นดิน ใต้น้ำ"},
"setGroundCave":function(d){return "ตั้งค่าพื้นดิน ถ้ำ"},
"setGroundSanta":function(d){return "ตั้งค่าพื้นดิน แซนต้า"},
"setGroundLava":function(d){return "ตั้งค่าพื้นดิน ลาวา"},
"setGroundTooltip":function(d){return "ตั้งค่ารูปภาพพื้นดิน"},
"setObstacle":function(d){return "ตั้งค่าสิ่งกีดขวาง"},
"setObstacleRandom":function(d){return "ตั้งค่าสิ่งกีดขวางแบบสุ่ม"},
"setObstacleFlappy":function(d){return "ตั้งค่าสิ่งกีดขวางเป็นท่อ"},
"setObstacleSciFi":function(d){return "ตั้งค่าสิ่งกีดขวางแบบ ไซ-ไฟ"},
"setObstacleUnderwater":function(d){return "ตั้งค่าสิ่งกีดขวางเป็นต้นไม้"},
"setObstacleCave":function(d){return "ตั้งค่าสิ่งกีดขวางเป็นถ้ำ"},
"setObstacleSanta":function(d){return "ตั้งค่าสิ่งกีดขวางเป็นปล่องไฟ"},
"setObstacleLaser":function(d){return "ตั้งค่าสิ่งกีดขวางเป็นเลเซอร์"},
"setObstacleTooltip":function(d){return "ตั้งค่าภาพสิ่งกีดขวาง"},
"setPlayer":function(d){return "ตั้งค่า ผู้เล่น"},
"setPlayerRandom":function(d){return "ตั้งค่าผู้เล่นแบบสุ่ม"},
"setPlayerFlappy":function(d){return "ตั้งค่าผู้เล่นเป็นนกสีเหลือง"},
"setPlayerRedBird":function(d){return "ตั้งค่าผู้เล่นเป็นนกสีแดง"},
"setPlayerSciFi":function(d){return "ตั้งค่าผู้เล่นเป็นยานอวกาศ"},
"setPlayerUnderwater":function(d){return "ตั้งค่าผู้เล่นเป็นปลา"},
"setPlayerCave":function(d){return "ตั้งค่าผู้เล่นเป็นค้างคาว"},
"setPlayerSanta":function(d){return "ตั้งค่าผู้เล่นเป็นแซนต้า"},
"setPlayerShark":function(d){return "ตั้งค่าผู้เล่นเป็นฉลาม"},
"setPlayerEaster":function(d){return "ตั้งค่าผู้เล่นเป็นกระต่ายอีสเตอร์"},
"setPlayerBatman":function(d){return "ตั้งค่าผู้เล่นเป็นแบ็ตแมน"},
"setPlayerSubmarine":function(d){return "ตั้งค่าผู้เล่นเป็นเรือดำน้ำ"},
"setPlayerUnicorn":function(d){return "ตั้งค่าผู้เล่นเป็นม้ายูนิคอร์น"},
"setPlayerFairy":function(d){return "ตั้งค่าผู้เล่นเป็นนางฟ้าน้อย"},
"setPlayerSuperman":function(d){return "ตั้งค่าผู้เล่นเป็น มนุษย์แฟร็ปปี้"},
"setPlayerTurkey":function(d){return "ตั้งค่าผู้เล่นเป็นไก่งวง"},
"setPlayerTooltip":function(d){return "ตั้งค่ารูปภาพของผู้เล่น"},
"setScore":function(d){return "ตั้งค่า คะแนน"},
"setScoreTooltip":function(d){return "ตั้งค่า คะแนน ของผู้เล่น"},
"setSpeed":function(d){return "ตั้งค่า ความเร็ว"},
"setSpeedTooltip":function(d){return "ตั้งค่าระดับความเร็ว"},
"shareFlappyTwitter":function(d){return "ลองเล่นเกมส์ Flappy Bird นี่สิ. เขียนเองกับมือเลยนา ใช้ @codeorg น่ะ"},
"shareGame":function(d){return "แบ่งปันเกมส์ของคุณ:"},
"soundRandom":function(d){return "สุ่ม"},
"soundBounce":function(d){return "กระเด้ง"},
"soundCrunch":function(d){return "ครัชช์"},
"soundDie":function(d){return "เศร้า"},
"soundHit":function(d){return "ชน"},
"soundPoint":function(d){return "พ้อยน์"},
"soundSwoosh":function(d){return "สวูว"},
"soundWing":function(d){return "ปีก"},
"soundJet":function(d){return "เจ็ท"},
"soundCrash":function(d){return "ชน"},
"soundJingle":function(d){return "จิงเกิ้ล"},
"soundSplash":function(d){return "สาดน้ำ"},
"soundLaser":function(d){return "เลเซอร์"},
"speedRandom":function(d){return "ตั้งค่าความเร็วแบบสุ่ม"},
"speedVerySlow":function(d){return "ตั้งความเร็วช้ามาก"},
"speedSlow":function(d){return "ตั้งความเร็วช้า"},
"speedNormal":function(d){return "ตั้งความเร็วปานกลาง"},
"speedFast":function(d){return "ตั้งความเร็วเร็ว"},
"speedVeryFast":function(d){return "ตั้งความเร็วเร็วมาก"},
"whenClick":function(d){return "เมื่อคลิก"},
"whenClickTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อมีการคลิ๊กเกิดขึ้น"},
"whenCollideGround":function(d){return "เมื่อตกถึงพื้น"},
"whenCollideGroundTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อแฟรบปี้เบิร์ดตกถึงพื้น."},
"whenCollideObstacle":function(d){return "เมื่อชนสิ่งกีดขวาง"},
"whenCollideObstacleTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อแฟรปปี้เบิร์ดชนสิ่งกีดขวาง."},
"whenEnterObstacle":function(d){return "เมื่อผ่านสิ่งกีดขวาง"},
"whenEnterObstacleTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อแฟรปปี้เบิร์ดผ่านสิ่งกีดขวาง."},
"whenRunButtonClick":function(d){return "เมื่อเกมเริ่ม"},
"whenRunButtonClickTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อเริ่มเกมส์."},
"yes":function(d){return "ใช่"}};