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
"bounceBall":function(d){return "توپ وغورځوۍ"},
"bounceBallTooltip":function(d){return "د یو شي له مخي توپ وغورځوۍ."},
"continue":function(d){return "Continue"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"heightParameter":function(d){return "height"},
"ifCode":function(d){return "که"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "د سیال امتیازونه زیات کړۍ"},
"incrementOpponentScoreTooltip":function(d){return "سیال ته یو امتیاز زیات کړۍ."},
"incrementPlayerScore":function(d){return "د امتیاز شمیره"},
"incrementPlayerScoreTooltip":function(d){return "یوه نمره اوسنۍ لوبغاړي ته زیات کړۍ."},
"isWall":function(d){return "آیا دا دیوال دۍ"},
"isWallTooltip":function(d){return "که دلته دیوال وي نو صحیح راړوي"},
"launchBall":function(d){return "نوۍ توپ چمتو کړۍ"},
"launchBallTooltip":function(d){return "نوۍ توپ لوبي ته دننه کړۍ."},
"makeYourOwn":function(d){return "خپل د خوښي لوبه جوړه کړۍ"},
"moveDown":function(d){return "ښکته لاړ سۍ"},
"moveDownTooltip":function(d){return "راکټ ته مخ په ښکته حرکت ورکړۍ."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "چپ اړخ ته لاړ شۍ"},
"moveLeftTooltip":function(d){return "راکټ ته په چپ اړخ حرکت ورکړۍ."},
"moveRight":function(d){return "راسته اړځ ته لاړ شۍ"},
"moveRightTooltip":function(d){return "راکټ ته په راسته اړځ حرکت ورکړۍ."},
"moveUp":function(d){return "اوچټ لاړ شۍ"},
"moveUpTooltip":function(d){return "راکټ ته اوچت حرکت ورکړۍ."},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "path ahead"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "there is a pile"},
"playSoundCrunch":function(d){return "د ړنګیدو غږ وغږوۍ"},
"playSoundGoal1":function(d){return "د ۱ ګول غږ وغږوۍ"},
"playSoundGoal2":function(d){return "د ۲ ګول غږ وغږوۍ"},
"playSoundHit":function(d){return "د برید غږ وغږوۍ"},
"playSoundLosePoint":function(d){return "د امتیاز له لاسه ورکولو غږ وغږوۍ"},
"playSoundLosePoint2":function(d){return "د ۲ امتیازو له لاسه ورکولو غږ وغږوۍ"},
"playSoundRetro":function(d){return "پخوانۍ غږ وغږوۍ"},
"playSoundRubber":function(d){return "د ټایر غږ وغږوۍ"},
"playSoundSlap":function(d){return "د لاس پړکولو غږ وغږوۍ"},
"playSoundTooltip":function(d){return "ټاکل شوۍ غږ وغږوۍ."},
"playSoundWinPoint":function(d){return "د امتیاز ترلاسه کولو غږ وغږوۍ"},
"playSoundWinPoint2":function(d){return "د ۲ امتیازو ترلاسه کولو غږ وغږوۍ"},
"playSoundWood":function(d){return "د لرګي غږ وغږوۍ"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "repeat until"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "امنیاز: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "منظري ناڅاپي کړۍ"},
"setBackgroundHardcourt":function(d){return "د لوبغالي ځمکي ته منظره سمه کړۍ"},
"setBackgroundRetro":function(d){return "پخوانۍ منظره سمه کړۍ"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setBallRandom":function(d){return "یو ناڅاپه توپ تنظیم کړۍ"},
"setBallHardcourt":function(d){return "د لوبغالي د ځمکي توپ تظیم کړۍ"},
"setBallRetro":function(d){return "پخوانۍ توپ تظیم کړۍ"},
"setBallTooltip":function(d){return "انځور توپ تنظیموي"},
"setBallSpeedRandom":function(d){return "د سرعت ناڅاپي کړۍ"},
"setBallSpeedVerySlow":function(d){return "د توپ سرعت ډیر ورو کړۍ"},
"setBallSpeedSlow":function(d){return "د توپ سرعت ورو کړۍ"},
"setBallSpeedNormal":function(d){return "د توپ سرعت نورماله کړۍ"},
"setBallSpeedFast":function(d){return "د توپ سرعت تیز کړۍ"},
"setBallSpeedVeryFast":function(d){return "د توپ سرعت ډیر تیز کړۍ"},
"setBallSpeedTooltip":function(d){return "د ټوپ سرعت تنظیم کړۍ"},
"setPaddleRandom":function(d){return "راکت ناڅاپي تنظیم کړۍ"},
"setPaddleHardcourt":function(d){return "د لوبغالي ځمکینۍ راکټ تنظیم کړۍ"},
"setPaddleRetro":function(d){return "پخوانۍ راکټ تنظیم کړۍ"},
"setPaddleTooltip":function(d){return "د راکټ انځور تنظیم کړۍ"},
"setPaddleSpeedRandom":function(d){return "راکټ په یو ناڅاپي سرعت تنظیم کړۍ"},
"setPaddleSpeedVerySlow":function(d){return "د راکټ سرعت ډیر ورو کړۍ"},
"setPaddleSpeedSlow":function(d){return "د راکت سرعت ورو کړۍ"},
"setPaddleSpeedNormal":function(d){return "د راکټ سرعت نورماله کړۍ"},
"setPaddleSpeedFast":function(d){return "د راکټ سرعت تیز کړۍ"},
"setPaddleSpeedVeryFast":function(d){return "د راکټ سرعت ډیر تیز کړۍ"},
"setPaddleSpeedTooltip":function(d){return "د راکټ سرعت تنظیم کړۍ"},
"shareBounceTwitter":function(d){return "د توپ وهلو لوبه وګورۍ. چي ما خپله په code.org@ کي جوړه کړي"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "turn left"},
"turnRight":function(d){return "turn right"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "کله چي توپ هدف ته رسيږي"},
"whenBallInGoalTooltip":function(d){return "کله چي توپ هدف کي وي په لاندینۍ لارښونو عمل وکړۍ"},
"whenBallMissesPaddle":function(d){return "کله چي توپ په راکت ونمښت"},
"whenBallMissesPaddleTooltip":function(d){return "کله چي توپ په راکت نمښلي دا کارونه عملي کړۍ."},
"whenDown":function(d){return "کله چي ځوړ غشى"},
"whenDownTooltip":function(d){return "لاندنۍ کارونه وکړۍ کله چي د ځوړغشى کیلی ته زور ورکول کیږي."},
"whenGameStarts":function(d){return "when game starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "کله چي چپ غشي"},
"whenLeftTooltip":function(d){return "لاندنۍ کارونه وکړۍ کله چي د چپ غشى کیلی ته زور ورکول کیږي."},
"whenPaddleCollided":function(d){return "کله چي توپ په راکټ نښلي"},
"whenPaddleCollidedTooltip":function(d){return "لاندنۍ کارونه وکړي کله چي توپ په راکټ نښلي."},
"whenRight":function(d){return "کله چي راسته غشي"},
"whenRightTooltip":function(d){return "لاندنۍ کارونه وکړۍ کله چي راسته غشى کیلی ته زور ورکول کیږي."},
"whenUp":function(d){return "کله چي بر غشي"},
"whenUpTooltip":function(d){return "لاندنۍ کارونه وکړۍ کله چي د برغشى کیلی ته زور ورکول کیږي."},
"whenWallCollided":function(d){return "کله چي توپ په دیوال نښلي"},
"whenWallCollidedTooltip":function(d){return "لاندنۍ کارونه وکړي کله چي توپ په دیوال نښلي."},
"whileMsg":function(d){return "کله چي"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "Yes"}};