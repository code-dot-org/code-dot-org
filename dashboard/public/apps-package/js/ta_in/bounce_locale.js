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
"bounceBall":function(d){return "துள்ளல் பந்து"},
"bounceBallTooltip":function(d){return "Bounce a ball off of an object."},
"continue":function(d){return "தொடர்க"},
"dirE":function(d){return "கிழக்கு"},
"dirN":function(d){return "வடக்கு"},
"dirS":function(d){return "தெற்கு"},
"dirW":function(d){return "மேற்கு"},
"doCode":function(d){return "செய்க"},
"elseCode":function(d){return "அல்லது"},
"finalLevel":function(d){return "வாழ்த்துக்கள்! நீங்கள் இறுதிப் புதிரை முடித்துவிட்டீர்கள்."},
"heightParameter":function(d){return "உயரம்"},
"ifCode":function(d){return "இருந்தால்"},
"ifPathAhead":function(d){return "முன்னால் பாதை என்றால்"},
"ifTooltip":function(d){return "குறிப்பிட்ட திசையில் ஒரு பாதை உள்ளது என்றால், சில செயல்களை செய்ய."},
"ifelseTooltip":function(d){return "குறிப்பிட்ட திசையில் ஒரு பாதை உள்ளது என்றால், நடவடிக்கைகள் முதல் தொகுதி செய்கிறது. இல்லையெனில், நடவடிக்கைகள் இரண்டாவது தொகுதி செய்கிறது."},
"incrementOpponentScore":function(d){return "எதிரியின் புள்ளி பெறு"},
"incrementOpponentScoreTooltip":function(d){return "தற்போதைய எதிர்ப்பாளர் மதிப்பெண்ணில் ஒரு புள்ளி சேர்க்க."},
"incrementPlayerScore":function(d){return "மதிப்பெண் பெறு"},
"incrementPlayerScoreTooltip":function(d){return "தற்போதைய ஆட்டக்காரர் மதிப்பெண்ணில் ஒரு புள்ளி சேர்க்க."},
"isWall":function(d){return "இது ஒரு சுவரா"},
"isWallTooltip":function(d){return "ஒரு சுவர் இங்கே உள்ளது என்றால் உண்மை கொடுக்கிறது"},
"launchBall":function(d){return "புதிய பந்து துவக்கவும்"},
"launchBallTooltip":function(d){return "விளையாட்டில் ஒரு பந்தை துவக்கவும்."},
"makeYourOwn":function(d){return "உங்கள் சொந்த பவுன்ஸ் விளையாட்டு செய்யுங்கள்"},
"moveDown":function(d){return "கீழே நகர்த்த"},
"moveDownTooltip":function(d){return "Move the paddle down."},
"moveForward":function(d){return "முன்னோக்கி நகர்த்த"},
"moveForwardTooltip":function(d){return "என்னை ஒரு அடி முன்னே நகர்த்து."},
"moveLeft":function(d){return "edadu pakkam thirumbu"},
"moveLeftTooltip":function(d){return "Move the paddle to the left."},
"moveRight":function(d){return "move right"},
"moveRightTooltip":function(d){return "Move the paddle to the right."},
"moveUp":function(d){return "மேலே நகர்"},
"moveUpTooltip":function(d){return "Move the paddle up."},
"nextLevel":function(d){return "வாழ்த்துக்கள்! நீங்கள் இந்த புதிர் தீர்த்துவிட்டீர்கள்."},
"no":function(d){return "இல்லை"},
"noPathAhead":function(d){return "பாதை தடுக்கப்பட்டுள்ளது"},
"noPathLeft":function(d){return "இடப்புறம் வழி இல்லை"},
"noPathRight":function(d){return "வலப்புறம் வழி இல்லை"},
"numBlocksNeeded":function(d){return "இந்த புதிரை  %1 தொகுதிகள் கொண்டு தீர்க்க முடியும்."},
"pathAhead":function(d){return "வழி முன்னே"},
"pathLeft":function(d){return "இடப்புறம் வழி இருந்தால்"},
"pathRight":function(d){return "வலப்புறம் வழி இருந்தால்"},
"pilePresent":function(d){return "அங்கே ஒரு குவியல் இருக்கிறது"},
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
"putdownTower":function(d){return "கோபுரத்தை கீழே வை"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "சதுரத்தை நீக்கு"},
"repeatUntil":function(d){return "மெய்படும் வரை மீண்டும் செய்"},
"repeatUntilBlocked":function(d){return "முன்னே வழி இருக்கும் வரை"},
"repeatUntilFinish":function(d){return "முடியும் வரை மீண்டும் செய்"},
"scoreText":function(d){return "Score: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "set random scene"},
"setBackgroundHardcourt":function(d){return "set hardcourt scene"},
"setBackgroundRetro":function(d){return "set retro scene"},
"setBackgroundTooltip":function(d){return "பின்னணி படத்தை அமைக்கஉம்"},
"setBallRandom":function(d){return "set random ball"},
"setBallHardcourt":function(d){return "set hardcourt ball"},
"setBallRetro":function(d){return "set retro ball"},
"setBallTooltip":function(d){return "Sets the ball image"},
"setBallSpeedRandom":function(d){return "set random ball speed"},
"setBallSpeedVerySlow":function(d){return "set very slow ball speed"},
"setBallSpeedSlow":function(d){return "set slow ball speed"},
"setBallSpeedNormal":function(d){return "set normal ball speed"},
"setBallSpeedFast":function(d){return "set fast ball speed"},
"setBallSpeedVeryFast":function(d){return "set very fast ball speed"},
"setBallSpeedTooltip":function(d){return "Sets the speed of the ball"},
"setPaddleRandom":function(d){return "set random paddle"},
"setPaddleHardcourt":function(d){return "set hardcourt paddle"},
"setPaddleRetro":function(d){return "set retro paddle"},
"setPaddleTooltip":function(d){return "Sets the paddle image"},
"setPaddleSpeedRandom":function(d){return "set random paddle speed"},
"setPaddleSpeedVerySlow":function(d){return "set very slow paddle speed"},
"setPaddleSpeedSlow":function(d){return "set slow paddle speed"},
"setPaddleSpeedNormal":function(d){return "set normal paddle speed"},
"setPaddleSpeedFast":function(d){return "set fast paddle speed"},
"setPaddleSpeedVeryFast":function(d){return "set very fast paddle speed"},
"setPaddleSpeedTooltip":function(d){return "Sets the speed of the paddle"},
"shareBounceTwitter":function(d){return "Check out the Bounce game I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "இடதுபுறம் திரும்பவும்"},
"turnRight":function(d){return "வலதுபுறம் திரும்பவும்"},
"turnTooltip":function(d){return "வலப்புறமோ இடப்புறமோ என்னை 90 degrees திருப்பும்."},
"whenBallInGoal":function(d){return "when ball in goal"},
"whenBallInGoalTooltip":function(d){return "Execute the actions below when a ball enters the goal."},
"whenBallMissesPaddle":function(d){return "when ball misses paddle"},
"whenBallMissesPaddleTooltip":function(d){return "Execute the actions below when a ball misses the paddle."},
"whenDown":function(d){return "when down arrow"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "விளையாட்டு தொடங்கும் போது"},
"whenGameStartsTooltip":function(d){return "விளையாட்டு தொடங்கும் போது, கீழே கொடுக்கப்பட்டுள்ள செயல்களை செய்து முடிக்கவும்."},
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
"whileMsg":function(d){return "while"},
"whileTooltip":function(d){return "உள்ளடக்கப்பட்ட செயல்களை மீண்டும் செய், புள்ளியை அடையும் வரை."},
"yes":function(d){return "ஆம்"}};