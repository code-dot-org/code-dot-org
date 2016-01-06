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
"bounceBall":function(d){return "گیند اچھالنا"},
"bounceBallTooltip":function(d){return "کسی چیز سے گیند ٹکرا کے اچھل دیں "},
"continue":function(d){return "جاری رکھیے"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "کر"},
"elseCode":function(d){return "ni to"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"heightParameter":function(d){return "height"},
"ifCode":function(d){return "agr"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "مخالف کے سکور میں اضافہ "},
"incrementOpponentScoreTooltip":function(d){return "حالیہ مخالف کے سکور میں ایک اور جمع کریں."},
"incrementPlayerScore":function(d){return "سکور پوائنٹ"},
"incrementPlayerScoreTooltip":function(d){return "حالیہ کھلاڑی کے سکور میں ایک شامل کریں."},
"isWall":function(d){return "کیا یہ ایک دیوار ہے"},
"isWallTooltip":function(d){return "اگردیوار ہے تو جواب دے گا \"صحیح\""},
"launchBall":function(d){return "نئی گیند سے آغاز"},
"launchBallTooltip":function(d){return "کھیل میں ایک گیند کا اضافہ."},
"makeYourOwn":function(d){return "اپنا کھیل خود بنائیں"},
"moveDown":function(d){return "نیچے لانا"},
"moveDownTooltip":function(d){return "پیڈل نیچے کریں."},
"moveForward":function(d){return "move forward"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "بائیں چلیں"},
"moveLeftTooltip":function(d){return "پیڈل بائیں کریں."},
"moveRight":function(d){return "دائیں چلیں"},
"moveRightTooltip":function(d){return "پیڈل دائیں کریں."},
"moveUp":function(d){return "اوپر لائیں"},
"moveUpTooltip":function(d){return "پیڈل اوپر کریں."},
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
"playSoundCrunch":function(d){return "چبانے کی آواز سنائیں"},
"playSoundGoal1":function(d){return "ہدف 1 کی آواز سنائیں"},
"playSoundGoal2":function(d){return "ہدف 2 کی آواز سنائیں"},
"playSoundHit":function(d){return "مارنے کی آواز سنائیں"},
"playSoundLosePoint":function(d){return "play lose point sound"},
"playSoundLosePoint2":function(d){return "play lose point 2 sound"},
"playSoundRetro":function(d){return "play retro sound"},
"playSoundRubber":function(d){return "play rubber sound"},
"playSoundSlap":function(d){return "play slap sound"},
"playSoundTooltip":function(d){return "Play the chosen sound."},
"playSoundWinPoint":function(d){return "play win point sound"},
"playSoundWinPoint2":function(d){return "جیت پوائنٹ 2 آواز چلائیں"},
"playSoundWood":function(d){return "لکڑی کی آواز سنائیں"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "تک دہرائیں"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "سکور: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "بلا ترتیب منظر لگائیں"},
"setBackgroundHardcourt":function(d){return "hard court منظر لگائیں"},
"setBackgroundRetro":function(d){return "retro منظر لگائیں"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setBallRandom":function(d){return "بلا ترتیب گیند رکھیں"},
"setBallHardcourt":function(d){return "hard court گیند رکھیں"},
"setBallRetro":function(d){return "retro گیند رکھیں"},
"setBallTooltip":function(d){return "گیند کی تصویر لگاتا ہے"},
"setBallSpeedRandom":function(d){return "بلا ترتيب گیند کی رفتار کا تعین کریں"},
"setBallSpeedVerySlow":function(d){return "گیند کی رفتار بہت سست کریں"},
"setBallSpeedSlow":function(d){return "گیند کی رفتار سست کریں"},
"setBallSpeedNormal":function(d){return "گیند کی رفتار مناسب کریں"},
"setBallSpeedFast":function(d){return "گیند کی رفتار تیز کریں"},
"setBallSpeedVeryFast":function(d){return "گیند کی رفتار بہت تیژ کریں"},
"setBallSpeedTooltip":function(d){return "گیند کی رفتار کا تعین کرتا ہے"},
"setPaddleRandom":function(d){return "بلا ترتيب پیڈل سیٹ کریں"},
"setPaddleHardcourt":function(d){return "hard court پیڈل سیٹ کریں"},
"setPaddleRetro":function(d){return "retro پیڈل سیٹ کریں"},
"setPaddleTooltip":function(d){return "پیڈل تصویر پر سیٹ کرتا ہے"},
"setPaddleSpeedRandom":function(d){return "set random paddle speed"},
"setPaddleSpeedVerySlow":function(d){return "set very slow paddle speed"},
"setPaddleSpeedSlow":function(d){return "set slow paddle speed"},
"setPaddleSpeedNormal":function(d){return "set normal paddle speed"},
"setPaddleSpeedFast":function(d){return "set fast paddle speed"},
"setPaddleSpeedVeryFast":function(d){return "پیڈل کی رفتار بہت تیژ کریں"},
"setPaddleSpeedTooltip":function(d){return "Sets the speed of the paddle"},
"shareBounceTwitter":function(d){return "Check out the Bounce game I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "turn left"},
"turnRight":function(d){return "turn right"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "جب گول میں گیند"},
"whenBallInGoalTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دیں جب ایک گیند گول میں داخل ہو"},
"whenBallMissesPaddle":function(d){return "جب گیند پیڈل سےنہ ٹکرائے"},
"whenBallMissesPaddleTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب گیند پیڈل سےنہ ٹکرائے"},
"whenDown":function(d){return "جب نیچے کا نشان"},
"whenDownTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب نیچے کے نشان کی کلید کو دبایا جاتا ہے."},
"whenGameStarts":function(d){return "when game starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "جب بائیں کا نشان"},
"whenLeftTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب بائیں نشان کی کلید کو دبایا جاتا ہے."},
"whenPaddleCollided":function(d){return "جب گیند پیڈل سے ٹکرائے"},
"whenPaddleCollidedTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب ایک گیند کے ساتھ ایک پیڈل ٹکرائے."},
"whenRight":function(d){return "جب دائیں کا نشان"},
"whenRightTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب دائیں کے نشان کی کلید کو دبایا جاتا ہے."},
"whenUp":function(d){return "جب اوپر کا نشان"},
"whenUpTooltip":function(d){return "مندرجہ ذیل افعال سرانجام دے، جب اوپر کے نشان کی کلید کو دبایا جاتا ہے."},
"whenWallCollided":function(d){return "جب گیند دیوار سے ٹکرائے"},
"whenWallCollidedTooltip":function(d){return "جب ایک دیوار کے ساتھ ایک گیند ٹکرائے مندرجہ ذیل افعال سرانجام دیں"},
"whileMsg":function(d){return "جب تک"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "Yes"}};