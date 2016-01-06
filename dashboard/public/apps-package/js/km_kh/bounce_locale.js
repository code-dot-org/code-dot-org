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
"bounceBall":function(d){return "គ្រាប់បាល់លោត"},
"bounceBallTooltip":function(d){return "គ្រាប់បាល់ទីមួយចេញពីវត្ថុមួយ។"},
"continue":function(d){return "បន្ត"},
"dirE":function(d){return "ខាងកើត"},
"dirN":function(d){return "ខាងជើង"},
"dirS":function(d){return "ខាងត្បូង"},
"dirW":function(d){return "ខាងលិច"},
"doCode":function(d){return "ធ្វើ"},
"elseCode":function(d){return "បើ​មិន​អ៊ីចឹង​ទេ"},
"finalLevel":function(d){return "សូម​អបអរសាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​ចុង​ក្រោយ​ហើយ។"},
"heightParameter":function(d){return "កម្ពស់"},
"ifCode":function(d){return "ប្រសិន​បើ"},
"ifPathAhead":function(d){return "បើផ្លូវខាងមុខ"},
"ifTooltip":function(d){return "ប្រ​សិន​បើ មាន​ផ្លូវ​ក្នុង​ទិស​ដៅ​កំ​ណត់​ណា​មួយ នោះ​ចូរ​ធ្វើ​សកម្ម​ភាព​ណា​មួយ"},
"ifelseTooltip":function(d){return "ប្រ​សិន​បើ មាន​ផ្លូវ​ក្នុង​ទិស​ដៅ​កំ​ណត់​ណា​មួយ នោះ​ចូរ​ធ្វើ​បណ្ដុំ​សកម្ម​ភាព​ទី​មួយ។ បើ​មិន​ពុំ​នោះទេ ចូរធ្វើ​បណ្ដុំ​នៃ​សកម្ម​ភាពទីពីរ"},
"incrementOpponentScore":function(d){return "score opponent point"},
"incrementOpponentScoreTooltip":function(d){return "Add one to the current opponent score."},
"incrementPlayerScore":function(d){return "ពិន្ទុ"},
"incrementPlayerScoreTooltip":function(d){return "Add one to the current player score."},
"isWall":function(d){return "នេះគឺជាជញ្ជាំង"},
"isWallTooltip":function(d){return "Returns true if there is a wall here"},
"launchBall":function(d){return "ដំណើរការគ្រាប់បាល់ថ្មី"},
"launchBallTooltip":function(d){return "ដំណើរការគ្រាប់បាល់ក្នុងការលេង។"},
"makeYourOwn":function(d){return "Make Your Own Bounce Game"},
"moveDown":function(d){return "ផ្លាស់​ទី​ចុះ​ក្រោម"},
"moveDownTooltip":function(d){return "Move the paddle down."},
"moveForward":function(d){return "រំកិល​ទៅមុខ"},
"moveForwardTooltip":function(d){return "រំកិល​ខ្ញុំ​ទៅ​មុខ​មួយ​ចន្លោះ"},
"moveLeft":function(d){return "ផ្លាស់​ទី​ទៅ​ឆ្វេង"},
"moveLeftTooltip":function(d){return "Move the paddle to the left."},
"moveRight":function(d){return "ផ្លាស់​ទី​ទៅ​ស្តាំ"},
"moveRightTooltip":function(d){return "Move the paddle to the right."},
"moveUp":function(d){return "ផ្លាស់​ទី​ឡើង​លើ"},
"moveUpTooltip":function(d){return "Move the paddle up."},
"nextLevel":function(d){return "សូម​អបអរ​សាទរ! អ្នក​បាន​បញ្ចប់​ល្បែង​ប្រាជ្ញា​នេះ​ហើយ។"},
"no":function(d){return "ទេ"},
"noPathAhead":function(d){return "ផ្លូវ​ត្រូវ​បាន​ឃាំង"},
"noPathLeft":function(d){return "គ្មាន​ផ្លូវ​ទៅ​ឆ្វេង​ទេ"},
"noPathRight":function(d){return "គ្មាន​ផ្លូវ​ទៅ​ស្ដាំ​ទេ"},
"numBlocksNeeded":function(d){return "ល្បែង​ប្រាជ្ញា​នេះ​អាច​ត្រូវ​បាន​ដោះស្រាយ​ជាមួយ​ប្លុក​ចំនួន %1 ។"},
"pathAhead":function(d){return "ផ្លូវ​ខាង​មុខ"},
"pathLeft":function(d){return "ប្រសិន​បើ​មាន​ផ្លូវ​ទៅ​ឆ្វេង"},
"pathRight":function(d){return "ប្រសិន​បើ​មាន​ផ្លូវ​ទៅ​ស្ដាំ"},
"pilePresent":function(d){return "មាន​ពំនូក​មួយ"},
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
"putdownTower":function(d){return "ដាក់​ពំនូក​ចុះ"},
"reinfFeedbackMsg":function(d){return "អ្នក​អាច​ចុច​ប៊ូតុង \"ព្យាយាម​ម្ដង​ទៀត\" ដើម្បី​ត្រឡប់​ទៅ​ការ​លេង​ហ្គេម​របស់​អ្នក។"},
"removeSquare":function(d){return "ដក​ ការេ​​ ចេញ"},
"repeatUntil":function(d){return "ធ្វើ​ឡើង​វិញ​រហូត​ដល់"},
"repeatUntilBlocked":function(d){return "នៅ​ពេល​មាន​ផ្លូវ​ខាង​មុខ"},
"repeatUntilFinish":function(d){return "ធ្វើ​រហូត​ដល់​ចប់"},
"scoreText":function(d){return "Score: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "កំណត់​ឆាក​ព្រាវ"},
"setBackgroundHardcourt":function(d){return "set hardcourt scene"},
"setBackgroundRetro":function(d){return "set retro scene"},
"setBackgroundTooltip":function(d){return "កំណត់​រូប​ភាព​ផ្ទៃ​ខាង​ក្រោយ"},
"setBallRandom":function(d){return "កំណត់​បាល់​ព្រាវ"},
"setBallHardcourt":function(d){return "set hardcourt ball"},
"setBallRetro":function(d){return "set retro ball"},
"setBallTooltip":function(d){return "កំណត់​រូបភាព​បាល់"},
"setBallSpeedRandom":function(d){return "កំណត់​ល្បឿន​បាល់​ព្រាវ"},
"setBallSpeedVerySlow":function(d){return "កំណត់​ល្បឿន​បាល់​យឺត​បំផុត"},
"setBallSpeedSlow":function(d){return "កំណត់​ល្បឿន​បាល់​យឺត"},
"setBallSpeedNormal":function(d){return "កំណត់​ល្បឿន​បាល់​ធម្មតា\n"},
"setBallSpeedFast":function(d){return "កំណត់​ល្បឿន​បាល់​លឿន"},
"setBallSpeedVeryFast":function(d){return "កំណត់​ល្បឿន​បាល់​លឿន​បំផុត"},
"setBallSpeedTooltip":function(d){return "កំណត់​ល្បឿន​បាល់"},
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
"shareBounceTwitter":function(d){return "ចូល​មើល​ហ្គេម​បាល់​លោត​ដែល​ខ្ញុំ​បាន​បង្កើត។ ខ្ញុំ​សរសេរ​វា​ដោយ​ខ្លួន​ឯង​ជាមួយ @codeorg"},
"shareGame":function(d){return "ចែក​រំលែង​ហ្គេម​របស់​អ្នក៖"},
"turnLeft":function(d){return "បត់​ឆ្វេង"},
"turnRight":function(d){return "បត់​ស្ដាំ"},
"turnTooltip":function(d){return "បង្វិល​ខ្ញុំ​ទៅ​ឆ្វេង​ឬ​ស្ដាំ 90 ដឺក្រេ។"},
"whenBallInGoal":function(d){return "when ball in goal"},
"whenBallInGoalTooltip":function(d){return "Execute the actions below when a ball enters the goal."},
"whenBallMissesPaddle":function(d){return "when ball misses paddle"},
"whenBallMissesPaddleTooltip":function(d){return "Execute the actions below when a ball misses the paddle."},
"whenDown":function(d){return "when down arrow"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "នៅ​ពេល​ហ្គេម​ចាប់ផ្ដើម"},
"whenGameStartsTooltip":function(d){return "ធ្វើ​សកម្មភាព​ខាង​ក្រោម នៅ​ពេល​ណា​ហ្គេម​ចាប់ផ្ដើម។"},
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
"whileMsg":function(d){return "នៅ​ពេល"},
"whileTooltip":function(d){return "ធ្វើ​រាល់​សកម្មភាព​ដែល​មាន​នៅ​ក្នុង​អនុគមន៍​រហូត​ដល់​លក្ខខណ្ឌ​បញ្ចប់​មក​ដល់"},
"yes":function(d){return "យល់ព្រម"}};