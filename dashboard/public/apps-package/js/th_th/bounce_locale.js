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
"bounceBall":function(d){return "เลี้ยงบอล"},
"bounceBallTooltip":function(d){return "เลี้ยงบอลหนึ่งลูกออกจากวัตถุ"},
"continue":function(d){return "ต่อไป\n"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "ทำ"},
"elseCode":function(d){return "นอกจากนั้น"},
"finalLevel":function(d){return "ขอแสดงความยินดีคุณสามารถแก้ปัญหาสุดท้ายได้แล้ว."},
"heightParameter":function(d){return "ความสูง"},
"ifCode":function(d){return "ถ้า"},
"ifPathAhead":function(d){return "ถ้าเป็นทางข้างหน้า"},
"ifTooltip":function(d){return "ถ้ามีเส้นทางในทิศที่กำหนด ให้กระทำบางอย่าง"},
"ifelseTooltip":function(d){return "ถ้ามีเส้นทางในทิศที่กำหนด ให้กระทำในบล็อกแรก มิเช่นนั้น ให้กระทำในบล็อกที่สอง"},
"incrementOpponentScore":function(d){return "ให้คะแนนฝ่ายตรงข้าม"},
"incrementOpponentScoreTooltip":function(d){return "เพิ่ม 1 คะแนนให้ฝ่ายตรงข้าม"},
"incrementPlayerScore":function(d){return "คะแนนที่ได้"},
"incrementPlayerScoreTooltip":function(d){return "เพิ่มคะแนนผู้เล่น 1 คะแนน"},
"isWall":function(d){return "นี่คือกำแพงใช่ไหม"},
"isWallTooltip":function(d){return "ให้ส่งค่า จริง กลับมา ถ้านั่นคือกำแพง"},
"launchBall":function(d){return "ปล่อยบอลลูกใหม่"},
"launchBallTooltip":function(d){return "ปล่อยบอลเข้ามาในเกม"},
"makeYourOwn":function(d){return "สร้างเกมกระเด้งของคุณเอง"},
"moveDown":function(d){return "เคลื่อนลง"},
"moveDownTooltip":function(d){return "ย้ายใบพัดลง."},
"moveForward":function(d){return "เดินไปข้างหน้า"},
"moveForwardTooltip":function(d){return "พาฉันเดินข้างหน้าไปหนึ่งช่อง"},
"moveLeft":function(d){return "ย้ายไปทางซ้าย"},
"moveLeftTooltip":function(d){return "ย้ายใบพัดไปด้านซ้าย."},
"moveRight":function(d){return "ย้ายไปทางขวา"},
"moveRightTooltip":function(d){return "เคลื่อนใบพัดไปด้านขวา."},
"moveUp":function(d){return "เคลื่อนขึ้น"},
"moveUpTooltip":function(d){return "เคลื่อนใบพัดขึ้น."},
"nextLevel":function(d){return "ขอแสดงความยินดีคุณสำเร็จปริศนานี้."},
"no":function(d){return "ไม่ใช่"},
"noPathAhead":function(d){return "เส้นทางถูกบล็อก"},
"noPathLeft":function(d){return "ไม่มีเส้นทางไปทางซ้าย"},
"noPathRight":function(d){return "ไม่มีเส้นทางไปทางขวา"},
"numBlocksNeeded":function(d){return "ปริศนานี้สามารถแก้ได้เพียงแค่ %1 บล็อกเท่านั้นเอง"},
"pathAhead":function(d){return "เส้นทางข้างหน้า"},
"pathLeft":function(d){return "ถ้าเส้นทางไปทางซ้าย"},
"pathRight":function(d){return "ถ้าเส้นทางไปทางขวา"},
"pilePresent":function(d){return "มีกองดิน"},
"playSoundCrunch":function(d){return "ให้เล่นเสียงดังกร้วม"},
"playSoundGoal1":function(d){return "เล่นเสียงที่บรรลุเป้าหมายเสียงที่ 1"},
"playSoundGoal2":function(d){return "เล่นเสียงที่บรรลุเป้าหมายเสียงที่ 2"},
"playSoundHit":function(d){return "เล่นเสียงที่โดนชน"},
"playSoundLosePoint":function(d){return "เล่นเสียงที่เสียคะแนน เสียงที่ 1"},
"playSoundLosePoint2":function(d){return "เล่นเสียงที่เสียคะแนน เสียงที่ 2"},
"playSoundRetro":function(d){return "เล่นเสียงย้อนยุค"},
"playSoundRubber":function(d){return "เล่นเสียงยาง"},
"playSoundSlap":function(d){return "เล่นเสียงตบ"},
"playSoundTooltip":function(d){return "เล่นเสียงที่ถูกเลือก."},
"playSoundWinPoint":function(d){return "เล่นเสียงของการชนะ เสียงที่ 1"},
"playSoundWinPoint2":function(d){return "เล่นเสียงของการชนะ เสียงที่ 2"},
"playSoundWood":function(d){return "เล่นเสียงไม้"},
"putdownTower":function(d){return "วางตึกลง"},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เริ่มอีกครั้ง\" เพื่อกลับไปสู่เกมส์ของคุณ."},
"removeSquare":function(d){return "เอาสี่เหลี่ยมออก"},
"repeatUntil":function(d){return "ทำซ้ำจนกว่า"},
"repeatUntilBlocked":function(d){return "ขณะที่ยังมีทางข้างหน้า"},
"repeatUntilFinish":function(d){return "ทำซ้ำจนกว่าจะเสร็จ"},
"scoreText":function(d){return "คะแนน: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "ตั้งฉากแบบสุ่ม"},
"setBackgroundHardcourt":function(d){return "ตั้งฉากแบบ hardcourt"},
"setBackgroundRetro":function(d){return "ตั้งฉากแบบยุคเก่า"},
"setBackgroundTooltip":function(d){return "ตั่งค่าภาพพื้นหลัง"},
"setBallRandom":function(d){return "เลือกบอลแบบสุ่ม"},
"setBallHardcourt":function(d){return "เลือกบอลแบบ Hardcourt"},
"setBallRetro":function(d){return "เลือกบอลย้อนยุค"},
"setBallTooltip":function(d){return "เลือกรูปของลูกบอล"},
"setBallSpeedRandom":function(d){return "ตั้งความเร็วลูกบอลแบบสุ่ม"},
"setBallSpeedVerySlow":function(d){return "ตั้งความเร็วลูกบอลช้ามาก"},
"setBallSpeedSlow":function(d){return "ตั้งความเร็วลูกบอลช้าๆ"},
"setBallSpeedNormal":function(d){return "ตั้งความเร็วลูกบอลปกติ"},
"setBallSpeedFast":function(d){return "ตั้งความเร็วของลูกบอลให้เร็ว"},
"setBallSpeedVeryFast":function(d){return "ตั้งความเร็วของลูกบอลให้เร็วมากๆ"},
"setBallSpeedTooltip":function(d){return "ตั้งความเร็วของลูกบอล"},
"setPaddleRandom":function(d){return "ตั้งไม้พายแบบสุ่ม"},
"setPaddleHardcourt":function(d){return "ตั้ง hardcourt paddle"},
"setPaddleRetro":function(d){return "ตั้ง retro paddle"},
"setPaddleTooltip":function(d){return "ตั้งรูปไม้พาย"},
"setPaddleSpeedRandom":function(d){return "สุ่มการตั้งค่าความเร็วของใบพัด"},
"setPaddleSpeedVerySlow":function(d){return "ตั้งค่าความเร็วของใบพัดให้ช้ามากๆ"},
"setPaddleSpeedSlow":function(d){return "ตั้งค่าความเร็วของใบพัดให้ช้า"},
"setPaddleSpeedNormal":function(d){return "ตั้งค่าความเร็วของใบพัดให้เป็นปกติ"},
"setPaddleSpeedFast":function(d){return "ตั้งค่าความเร็วของใบพัดให้เร็ว"},
"setPaddleSpeedVeryFast":function(d){return "ตั้งค่าความเร็วของใบพัดให้เร็วมากๆ"},
"setPaddleSpeedTooltip":function(d){return "การตั้งค่าความเร็วของใบพัด"},
"shareBounceTwitter":function(d){return "นำเอาเกมกระเด้งที่ฉันทำเองออกมาดู ฉันเขียนมันขึ้นเองกับ @codeorg"},
"shareGame":function(d){return "แบ่งปันเกมส์ของคุณ:"},
"turnLeft":function(d){return "เลี้ยวซ้าย"},
"turnRight":function(d){return "เลี้ยวขวา"},
"turnTooltip":function(d){return "หันตัวเราไปทางซ้ายหรือขวา 90 องศา"},
"whenBallInGoal":function(d){return "เมื่อลูกบอลอยู่ในเป้าหมาย"},
"whenBallInGoalTooltip":function(d){return "ให้ทำคำสั่งด้านล่างเมื่อลูกบอลเข้าเป้าหมาย."},
"whenBallMissesPaddle":function(d){return "เมื่อลูกบอลพลาดจากใบพัด"},
"whenBallMissesPaddleTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อลูกบอลหลุดจากใบพัด."},
"whenDown":function(d){return "เมื่อกดลูกศรลง"},
"whenDownTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มลง."},
"whenGameStarts":function(d){return "เมื่อเกมเริ่ม"},
"whenGameStartsTooltip":function(d){return "รันคำสั่งด้านล่างเมื่อเริ่มเกมส์."},
"whenLeft":function(d){return "เมื่อกดลูกศรซ้าย"},
"whenLeftTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มซ้าย."},
"whenPaddleCollided":function(d){return "เมื่อลูกบอลชนกับใบพัด"},
"whenPaddleCollidedTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อลูกบอลชนกับใบพัด."},
"whenRight":function(d){return "เมื่อกดลูกศรขวา"},
"whenRightTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มขวา."},
"whenUp":function(d){return "เมื่อกดลูกศรขึ้น"},
"whenUpTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อมีการกดปุ่มขึ้น."},
"whenWallCollided":function(d){return "เมื่อลูกบอลชนกับกำแพง"},
"whenWallCollidedTooltip":function(d){return "ทำคำสั่งด้านล่างเมื่อลูกบอลชนกับกำแพง."},
"whileMsg":function(d){return "ในขณะที่"},
"whileTooltip":function(d){return "ทำซ้ำจนกระทั่งถึงจุดสิ้นสุด"},
"yes":function(d){return "ใช่"}};