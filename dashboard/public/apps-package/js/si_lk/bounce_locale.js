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
"bounceBall":function(d){return "පොළාපනින බෝලය"},
"bounceBallTooltip":function(d){return "බෝලයක් වස්තුවක් උඩින් පොළාපන්නන්න."},
"continue":function(d){return "ඉදිරියට යන්න"},
"dirE":function(d){return "නැ"},
"dirN":function(d){return "උ"},
"dirS":function(d){return "ද"},
"dirW":function(d){return "බ"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "else"},
"finalLevel":function(d){return "සුභපැතුම්! ඔබ අවසාන ප්‍රහේලිකාව විසඳා ඇත."},
"heightParameter":function(d){return "උස"},
"ifCode":function(d){return "if"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "විරුධපක්ෂයට එරෙහිව ලකුණු ලාබාගන්න"},
"incrementOpponentScoreTooltip":function(d){return "විරුධපක්ෂයේ දැනට පවතින ලකුණු සඳහා එකක් එකතු කරන්න."},
"incrementPlayerScore":function(d){return "ජයග්‍රාහී ලකුණ"},
"incrementPlayerScoreTooltip":function(d){return "වත්මන් ක්‍රීඩකයා ගේ ලකුණු සඳහා එකක් එකතු කරන්න."},
"isWall":function(d){return "මේ බිත්තියක්"},
"isWallTooltip":function(d){return "මෙතන බිත්තියක් නම් සත්‍ය ලෙස රිටන් කරන්න"},
"launchBall":function(d){return "නව බෝලයක් දියත් කරන්න"},
"launchBallTooltip":function(d){return "ක්‍රීඩා කිරීම සඳහා නව බෝලයක් දියත් කරන්න."},
"makeYourOwn":function(d){return "ඔබේම බවුන්ස් ක්‍රීඩාවක් සකසන්න"},
"moveDown":function(d){return "පහළට චලනය කරන්න"},
"moveDownTooltip":function(d){return "පැඩලය පහළට චලනය කරන්න."},
"moveForward":function(d){return "ඉදිරියට චලනය වන්න"},
"moveForwardTooltip":function(d){return "මාව එක පියවරකින් ඉදිරියට ගෙන යන්න."},
"moveLeft":function(d){return "දකුණට චලනය කරන්න"},
"moveLeftTooltip":function(d){return "පැඩලය වමට චලනය කරන්න."},
"moveRight":function(d){return "දකුණට චලනය කරන්න"},
"moveRightTooltip":function(d){return "පැඩලය දකුණට චලනය කරන්න."},
"moveUp":function(d){return "ඉහළට චලනය කරන්න"},
"moveUpTooltip":function(d){return "පැඩලය ඉහළට චලනය කරන්න."},
"nextLevel":function(d){return "සුබ පැතුම්! ඔබට මෙම ප්‍රහේලිකාව සම්පූර්ණ කර ඇත."},
"no":function(d){return "නැහැ"},
"noPathAhead":function(d){return "මාර්ගය අවහිර කර ඇත"},
"noPathLeft":function(d){return "වමට මාර්ගයක් නොමැත"},
"noPathRight":function(d){return "දකුණට මාර්ගයක් නොමැත"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"pathAhead":function(d){return "මාර්ගය ඉදිරියෙන්"},
"pathLeft":function(d){return "if path to the left"},
"pathRight":function(d){return "if path to the right"},
"pilePresent":function(d){return "කුළුණක් තියෙනවා"},
"playSoundCrunch":function(d){return "හපන ශබ්ධය නගන්න"},
"playSoundGoal1":function(d){return "goal 1 ශබ්ධය නගන්න"},
"playSoundGoal2":function(d){return "goal 2 ශබ්ධය නගන්න"},
"playSoundHit":function(d){return "පහරදෙන ශබ්ධය නගන්න"},
"playSoundLosePoint":function(d){return "ලකුණු අඩුවීමේ ශබ්ධය නගන්න"},
"playSoundLosePoint2":function(d){return "ලකුණු අඩුවීමේ 2 ශබ්ධය නගන්න"},
"playSoundRetro":function(d){return "රෙට්ට්‍රෝ ශබ්ධය නගන්න"},
"playSoundRubber":function(d){return "රබර් ශබ්ධය නගන්න"},
"playSoundSlap":function(d){return "කම්මුපාහරේ ශබ්ධය නගන්න"},
"playSoundTooltip":function(d){return "තෝරාගත් ශබ්ධයක් නගන්න."},
"playSoundWinPoint":function(d){return "ලකුණු දිනීමේ ශබ්ධය නගන්න"},
"playSoundWinPoint2":function(d){return "ලකුණු දිනීමේ 2 ශබ්ධය නගන්න"},
"playSoundWood":function(d){return "ලී ශබ්ධය නගන්න"},
"putdownTower":function(d){return "කුළුණ බිඳ දමන්න"},
"reinfFeedbackMsg":function(d){return "නැවත වරක් ක්‍රීඩා කිරීමට \"Try again\" බොත්තම ඔබන්න."},
"removeSquare":function(d){return "චතුරශ්‍රය ඉවත් කරන්න"},
"repeatUntil":function(d){return "repeat until"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "ලකුණු ගණන: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "අහඹු දර්ශණයක් පිහිටුවන්න"},
"setBackgroundHardcourt":function(d){return "hardcourt දර්ශණයක් පිහිටුවන්න"},
"setBackgroundRetro":function(d){return "retro දර්ශණයක් පිහිටුවන්න"},
"setBackgroundTooltip":function(d){return "පසුතලය සඳහා පින්තූරයක් පිහිටුවන්න"},
"setBallRandom":function(d){return "අහඹු බෝලයක් පිහිටුවන්න"},
"setBallHardcourt":function(d){return "hardcourt බෝලයක් පිහිටුවන්න"},
"setBallRetro":function(d){return "retro බෝලයක් පිහිටුවන්න"},
"setBallTooltip":function(d){return "පන්දුවට පින්තුරයක් නියමකර"},
"setBallSpeedRandom":function(d){return "පන්දුවේ අහඹු වේගය සකසන්න"},
"setBallSpeedVerySlow":function(d){return "පන්දුවේ අඩුම වේගය සකසන්න"},
"setBallSpeedSlow":function(d){return "පන්දුවේ අඩු වේගය සකසන්න"},
"setBallSpeedNormal":function(d){return "පන්දුවේ සාමන්‍ය වේගය සකසන්න"},
"setBallSpeedFast":function(d){return "පන්දුවේ ඉහල වේගය සකසන්න"},
"setBallSpeedVeryFast":function(d){return "පන්දුවේ ඉහලම වේගය සකසන්න"},
"setBallSpeedTooltip":function(d){return "පන්දුවේ වේගයට අගයක් සැකසීම"},
"setPaddleRandom":function(d){return "අහඹු පැඩලය සකසන්න"},
"setPaddleHardcourt":function(d){return "රළු පැඩලය සකසන්න"},
"setPaddleRetro":function(d){return "පසුපස පැඩලය සකසන්න"},
"setPaddleTooltip":function(d){return "පැඩලයේ රූපය සකසන්න"},
"setPaddleSpeedRandom":function(d){return "අහඹු පැඩලයේ වේගය සකසන්න"},
"setPaddleSpeedVerySlow":function(d){return "පැඩලයේ අඩුම වේගය සකසන්න"},
"setPaddleSpeedSlow":function(d){return "පැඩලයේ අඩු වේගය සකසන්න"},
"setPaddleSpeedNormal":function(d){return "පැඩලයේ සාමාන්‍ය වේගය සකසන්න"},
"setPaddleSpeedFast":function(d){return "පැඩලයේ ඉහල වේගය සකසන්න"},
"setPaddleSpeedVeryFast":function(d){return "පැඩලයේ ඉහලම වේගය සකසන්න"},
"setPaddleSpeedTooltip":function(d){return "පැඩලයේ වේගය සැකසීම"},
"shareBounceTwitter":function(d){return "මා විසින් නිර්මාණය කරන ලද Bounce ක්‍රීඩාව ඔබත් උත්සහ කර බලන්න. @codeorg හි සහය සහිතව මා විසින්ම මෙහි කේතයන් ලියා ඇත"},
"shareGame":function(d){return "ඔබෙගේ ක්‍රීඩාව මිතුරන් අතරේ හුවමාරු කරන්න:"},
"turnLeft":function(d){return "වමට හැරෙන්න"},
"turnRight":function(d){return "දකුණට හැරෙන්න"},
"turnTooltip":function(d){return "මාව වමට හෝ දකුණට අංශක 90 කින් හරවන්න."},
"whenBallInGoal":function(d){return "පන්දුව ඉලක්කය තුළ විට"},
"whenBallInGoalTooltip":function(d){return "බෝලය ඉලක්කයට ඇතුලුවූවිට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenBallMissesPaddle":function(d){return "බෝලයට පැඩලය මගහැරුන විට"},
"whenBallMissesPaddleTooltip":function(d){return "බෝලයට පැඩලය මගහැරුන විට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenDown":function(d){return "පහළ ඊතලය තද කල විට"},
"whenDownTooltip":function(d){return "පහළට ඊතලය එබු විට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenGameStarts":function(d){return "ක්‍රීඩව ආරම්භ වූ විගස"},
"whenGameStartsTooltip":function(d){return "ක්‍රීඩව ආරම්භ වූ විගසම පහත ක්‍රියාවන් ක්‍රියාත්මක කරන්න."},
"whenLeft":function(d){return "වම් ඊතලය තද කල විට"},
"whenLeftTooltip":function(d){return "වම් ඊතලය එබු විට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenPaddleCollided":function(d){return "බෝලය පැඩලයේ ඝට්ටනය වූ විට"},
"whenPaddleCollidedTooltip":function(d){return "බෝලය පැඩලය හා ඝට්ටනය වු විට පහත ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenRight":function(d){return "දකුණු ඊතලය තද කල විට"},
"whenRightTooltip":function(d){return "දකුණු ඊතලය එබු විට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenUp":function(d){return "උඩු ඊතලය තද කල විට"},
"whenUpTooltip":function(d){return "ඉහලට ඊතලය එබු විට පහත ඇති ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whenWallCollided":function(d){return "බිත්තියේ බෝලය වැඳුනු විට"},
"whenWallCollidedTooltip":function(d){return "බෝලය බිත්තිය හා ඝට්ටනය වු විට පහත ක්‍රියාමාර්ග ක්‍රියාත්මක කරන්න."},
"whileMsg":function(d){return "එතෙක්"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "ඔව්"}};