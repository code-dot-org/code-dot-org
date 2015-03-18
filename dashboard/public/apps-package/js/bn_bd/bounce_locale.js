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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"bounceBall":function(d){return "লাফানো বল"},
"bounceBallTooltip":function(d){return "বস্তুতে বল ধাক্কা লাগিয়ে অন্য দিকে পাঠান।"},
"continue":function(d){return "চালিয়ে যান"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S"},
"dirW":function(d){return "W"},
"doCode":function(d){return "করা"},
"elseCode":function(d){return "আর"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"heightParameter":function(d){return "উচ্চতা"},
"ifCode":function(d){return "যদী"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "score opponent point"},
"incrementOpponentScoreTooltip":function(d){return "Add one to the current opponent score."},
"incrementPlayerScore":function(d){return "score point"},
"incrementPlayerScoreTooltip":function(d){return "Add one to the current player score."},
"isWall":function(d){return "is this a wall"},
"isWallTooltip":function(d){return "Returns true if there is a wall here"},
"launchBall":function(d){return "নতুন বল সচল করুন"},
"launchBallTooltip":function(d){return "বল খেলার মধ্যে প্রবর্তন করান."},
"makeYourOwn":function(d){return "আপনার নিজের বাউন্স গেম তৈরি করুন"},
"moveDown":function(d){return "move down"},
"moveDownTooltip":function(d){return "Move the paddle down."},
"moveForward":function(d){return "সামনে এগিয়ে যান"},
"moveForwardTooltip":function(d){return "Move me forward one space."},
"moveLeft":function(d){return "move left"},
"moveLeftTooltip":function(d){return "Move the paddle to the left."},
"moveRight":function(d){return "move right"},
"moveRightTooltip":function(d){return "Move the paddle to the right."},
"moveUp":function(d){return "move up"},
"moveUpTooltip":function(d){return "Move the paddle up."},
"nextLevel":function(d){return "অভিনন্দন! আপনি এই ধাঁধা সম্পন্ন করেছেন।"},
"no":function(d){return "না"},
"noPathAhead":function(d){return "path is blocked"},
"noPathLeft":function(d){return "no path to the left"},
"noPathRight":function(d){return "no path to the right"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "সামনে পথ"},
"pathLeft":function(d){return "যদি বামদিকে পথ থাকে"},
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
"playSoundTooltip":function(d){return "Play the chosen sound."},
"playSoundWinPoint":function(d){return "play win point sound"},
"playSoundWinPoint2":function(d){return "play win point 2 sound"},
"playSoundWood":function(d){return "play wood sound"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "আপনি  পুনঃরাই আপনার খেলা প্লে করতে গিয়ে \"Try again\" বোতাম টিপতে পারেন."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "যতক্ষণ না পুনরাবৃত্তি"},
"repeatUntilBlocked":function(d){return "যদি সামনে পথ"},
"repeatUntilFinish":function(d){return "শেষ পর্যন্ত পুনরাবৃত্ত করুন"},
"scoreText":function(d){return "Score: "+appLocale.v(d,"playerScore")+" : "+appLocale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "এলোমেলো দৃশ্য সেট করুন"},
"setBackgroundHardcourt":function(d){return "হার্ডকোর্ট দৃশ্য সেট করুন"},
"setBackgroundRetro":function(d){return "বিপরীতমুখী দৃশ্য-বিন্যাস করুন"},
"setBackgroundTooltip":function(d){return "ব্যাকগ্রাউন্ড ইমেজ সেট করে"},
"setBallRandom":function(d){return "এলোমেলো বল সেট করুন"},
"setBallHardcourt":function(d){return "হার্ডকোর্ট বল সেট করুন"},
"setBallRetro":function(d){return "বিপরীতমুখী বল সেট করুন"},
"setBallTooltip":function(d){return "বল এর ছবি সেট করে"},
"setBallSpeedRandom":function(d){return "এলোমেলো বল গতির বিন্যাস করুন"},
"setBallSpeedVerySlow":function(d){return "অতি মন্থর গতির বল সেট করুন"},
"setBallSpeedSlow":function(d){return "মন্থর গতির বল সেট করুন"},
"setBallSpeedNormal":function(d){return "স্বাভাবিক গতির বল সেট করুন"},
"setBallSpeedFast":function(d){return "দ্রুত গতির বল  বিন্যাস করুন"},
"setBallSpeedVeryFast":function(d){return "খুব দ্রুত গতির বল  বিন্যাস করুন"},
"setBallSpeedTooltip":function(d){return "বল এর গতি সেট করে"},
"setPaddleRandom":function(d){return "সেট এলোমেলো প্যাডেল"},
"setPaddleHardcourt":function(d){return "সেট হার্ডকোর্ট প্যাডেল"},
"setPaddleRetro":function(d){return "সেট বিপরীতমুখী প্যাডেল"},
"setPaddleTooltip":function(d){return "প্যাডেল এর ছবি সেট করে"},
"setPaddleSpeedRandom":function(d){return "সেট এলোমেলো প্যাডেল এর গতি"},
"setPaddleSpeedVerySlow":function(d){return "অতি মন্থর গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedSlow":function(d){return "ধীর গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedNormal":function(d){return "সাধারণ গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedFast":function(d){return "দ্রুত গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedVeryFast":function(d){return "খুব দ্রুত গতির প্যাডেল বিন্যাস করুন"},
"setPaddleSpeedTooltip":function(d){return "প্যাডেল এর গতি সেট করে"},
"shareBounceTwitter":function(d){return "চেক আউট বাউন্স গেম |মেড. |নিজেই লিখেছিলেন @codeorg"},
"shareGame":function(d){return "আপনার খেলা শেয়ার করুন:"},
"turnLeft":function(d){return "বামে যান"},
"turnRight":function(d){return "ডানে যান"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "when ball in goal"},
"whenBallInGoalTooltip":function(d){return "Execute the actions below when a ball enters the goal."},
"whenBallMissesPaddle":function(d){return "when ball misses paddle"},
"whenBallMissesPaddleTooltip":function(d){return "Execute the actions below when a ball misses the paddle."},
"whenDown":function(d){return "when down arrow"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "যখন খেলা শুরু"},
"whenGameStartsTooltip":function(d){return "যখন খেলা শুরু করে নিচে কর্ম সম্পাদন করে."},
"whenLeft":function(d){return "when left arrow"},
"whenLeftTooltip":function(d){return "Execute the actions below when the left arrow key is pressed."},
"whenPaddleCollided":function(d){return "when ball hits paddle"},
"whenPaddleCollidedTooltip":function(d){return "Execute the actions below when a ball collides with a paddle."},
"whenRight":function(d){return "when right arrow"},
"whenRightTooltip":function(d){return "Execute the actions below when the right arrow key is pressed."},
"whenUp":function(d){return "when up arrow"},
"whenUpTooltip":function(d){return "Execute the actions below when the up arrow key is pressed."},
"whenWallCollided":function(d){return "when ball hits wall"},
"whenWallCollidedTooltip":function(d){return "Execute the actions below when a ball collides with a wall."},
"whileMsg":function(d){return "যখন"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "\"হ্যাঁ\""}};