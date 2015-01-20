var appLocale = {lc:{"ar":function(n){
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
},"da":function(n){return n===1?"one":"other"},"de":function(n){return n===1?"one":"other"},"el":function(n){return n===1?"one":"other"},"es":function(n){return n===1?"one":"other"},"et":function(n){return n===1?"one":"other"},"eu":function(n){return n===1?"one":"other"},"fa":function(n){return "other"},"fi":function(n){return n===1?"one":"other"},"fil":function(n){return n===0||n==1?"one":"other"},"fr":function(n){return Math.floor(n)===0||Math.floor(n)==1?"one":"other"},"he":function(n){return n===1?"one":"other"},"hi":function(n){return n===0||n==1?"one":"other"},"hr":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"bounceBall":function(d){return "bounce ball"},
"bounceBallTooltip":function(d){return "Bounce a ball off of an object."},
"continue":function(d){return "ต่อไป\n"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "ทำ"},
"elseCode":function(d){return "นอกจากนั้น"},
"finalLevel":function(d){return "ขอแสดงความยินดีคุณสามารถแก้ปัญหาสุดท้ายได้แล้ว."},
"heightParameter":function(d){return "height"},
"ifCode":function(d){return "ถ้า"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "ให้คะแนนฝ่ายตรงข้าม"},
"incrementOpponentScoreTooltip":function(d){return "Add one to the current opponent score."},
"incrementPlayerScore":function(d){return "score point"},
"incrementPlayerScoreTooltip":function(d){return "เพิ่มคะแนนผู้เล่น 1 คะแนน"},
"isWall":function(d){return "is this a wall"},
"isWallTooltip":function(d){return "Returns true if there is a wall here"},
"launchBall":function(d){return "ปล่อยบอลลูกใหม่"},
"launchBallTooltip":function(d){return "ปล่อยบอลเข้ามาในเกม"},
"makeYourOwn":function(d){return "สร้าง Bounce Game ของคุณสิ"},
"moveDown":function(d){return "move down"},
"moveDownTooltip":function(d){return "Move the paddle down."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "ย้ายไปทางซ้าย"},
"moveLeftTooltip":function(d){return "Move the paddle to the left."},
"moveRight":function(d){return "ย้ายไปทางขวา"},
"moveRightTooltip":function(d){return "Move the paddle to the right."},
"moveUp":function(d){return "move up"},
"moveUpTooltip":function(d){return "Move the paddle up."},
"nextLevel":function(d){return "ขอแสดงความยินดีคุณสำเร็จปริศนานี้."},
"no":function(d){return "ไม่ใช่"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "path ahead"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "there is a pile"},
"playSoundCrunch":function(d){return "play crunch sound"},
"playSoundGoal1":function(d){return "play goal 1 sound"},
"playSoundGoal2":function(d){return "play goal 2 sound"},
"playSoundHit":function(d){return "play hit sound"},
"playSoundLosePoint":function(d){return "play lose point sound"},
"playSoundLosePoint2":function(d){return "play lose point 2 sound"},
"playSoundRetro":function(d){return "play retro sound"},
"playSoundRubber":function(d){return "play rubber sound"},
"playSoundSlap":function(d){return "play slap sound"},
"playSoundTooltip":function(d){return "เล่นเสียงที่ถูกเลือก."},
"playSoundWinPoint":function(d){return "play win point sound"},
"playSoundWinPoint2":function(d){return "play win point 2 sound"},
"playSoundWood":function(d){return "play wood sound"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "คุณสามารถกดปุ่ม \"เริ่มอีกครั้ง\" เพื่อกลับไปสู่เกมส์ของคุณ."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "ทำซ้ำจนกว่า"},
"repeatUntilBlocked":function(d){return "ขณะที่ยังมีทางข้างหน้า"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "Score: "+appLocale.v(d,"playerScore")+" : "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "ตั่งฉากแบบสุ่ม"},
"setBackgroundHardcourt":function(d){return "ตั้งฉากแบบ hardcourt"},
"setBackgroundRetro":function(d){return "ตั้งฉากแบบยุคเก่า"},
"setBackgroundTooltip":function(d){return "ตั่งค่าภาพพื้นหลัง"},
"setBallRandom":function(d){return "ตั้งบอลแบบสุ่ม"},
"setBallHardcourt":function(d){return "ตั้ง Hardcourt Ball"},
"setBallRetro":function(d){return "ตั้ง Retro ball"},
"setBallTooltip":function(d){return "ตั้งรูปของลูกบอล"},
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
"setPaddleSpeedRandom":function(d){return "set random paddle speed"},
"setPaddleSpeedVerySlow":function(d){return "set very slow paddle speed"},
"setPaddleSpeedSlow":function(d){return "set slow paddle speed"},
"setPaddleSpeedNormal":function(d){return "set normal paddle speed"},
"setPaddleSpeedFast":function(d){return "set fast paddle speed"},
"setPaddleSpeedVeryFast":function(d){return "set very fast paddle speed"},
"setPaddleSpeedTooltip":function(d){return "Sets the speed of the paddle"},
"shareBounceTwitter":function(d){return "Check out the Bounce game I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "เลี้ยวซ้าย"},
"turnRight":function(d){return "เลี้ยวขวา"},
"turnTooltip":function(d){return "หันตัวเราไปทางซ้ายหรือขวา 90 องศา"},
"whenBallInGoal":function(d){return "when ball in goal"},
"whenBallInGoalTooltip":function(d){return "Execute the actions below when a ball enters the goal."},
"whenBallMissesPaddle":function(d){return "when ball misses paddle"},
"whenBallMissesPaddleTooltip":function(d){return "Execute the actions below when a ball misses the paddle."},
"whenDown":function(d){return "เมื่อกดลูกศรลง"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "เมื่อเกมเริ่ม"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "เมื่อกดลูกศรซ้าย"},
"whenLeftTooltip":function(d){return "Execute the actions below when the left arrow key is pressed."},
"whenPaddleCollided":function(d){return "when ball hits paddle"},
"whenPaddleCollidedTooltip":function(d){return "Execute the actions below when a ball collides with a paddle."},
"whenRight":function(d){return "เมื่อกดลูกศรขวา"},
"whenRightTooltip":function(d){return "Execute the actions below when the right arrow key is pressed."},
"whenUp":function(d){return "เมื่อกดลูกศรขึ้น"},
"whenUpTooltip":function(d){return "Execute the actions below when the up arrow key is pressed."},
"whenWallCollided":function(d){return "when ball hits wall"},
"whenWallCollidedTooltip":function(d){return "Execute the actions below when a ball collides with a wall."},
"whileMsg":function(d){return "ในขณะที่"},
"whileTooltip":function(d){return "ทำซ้ำจนกระทั่งถึงจุดสิ้นสุด"},
"yes":function(d){return "ใช่"}};