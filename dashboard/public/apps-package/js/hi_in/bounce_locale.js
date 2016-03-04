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
"bounceBall":function(d){return "गेंद उछाले"},
"bounceBallTooltip":function(d){return "एक वस्तु के ऊपर से गेंद उछाले।"},
"continue":function(d){return "जारी रखें"},
"dirE":function(d){return "E"},
"dirN":function(d){return "N"},
"dirS":function(d){return "S\nS"},
"dirW":function(d){return "W"},
"doCode":function(d){return "do"},
"elseCode":function(d){return "remaining"},
"finalLevel":function(d){return "बधाइयाँ! आपने अंतिम पहेली हल कर दी है।"},
"heightParameter":function(d){return "ऊँचाई"},
"ifCode":function(d){return "if"},
"ifPathAhead":function(d){return "if path ahead"},
"ifTooltip":function(d){return "If there is a path in the specified direction, then do some actions."},
"ifelseTooltip":function(d){return "If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions."},
"incrementOpponentScore":function(d){return "ओपोनेन्ट पोइन्ट स्कोर"},
"incrementOpponentScoreTooltip":function(d){return "वर्तमान प्रतिद्वंद्वी के स्कोर में एक  जोड़ें।"},
"incrementPlayerScore":function(d){return "स्कोर पोइन्ट"},
"incrementPlayerScoreTooltip":function(d){return "वर्तमान खिलाडी के स्कोर में एक  जोड़ें।"},
"isWall":function(d){return "क्या यह दीवाल है ।"},
"isWallTooltip":function(d){return "return true अगर वहा दीवार है ।"},
"launchBall":function(d){return "नई गेंद लोंच करे"},
"launchBallTooltip":function(d){return "गेंद को खेल मे लांच कऱे।"},
"makeYourOwn":function(d){return "अपना खुद का गेंद उछालने का  खेल बनाऐ।"},
"moveDown":function(d){return "नीचे चले"},
"moveDownTooltip":function(d){return "चप्पू को नीचे चलाइए।"},
"moveForward":function(d){return "आगे जाएं"},
"moveForwardTooltip":function(d){return "मुझे एक स्थान आगे ले जाएँ।"},
"moveLeft":function(d){return "बायें चले"},
"moveLeftTooltip":function(d){return "चप्पू को बायें तरफ चलाइए।"},
"moveRight":function(d){return "दाहिना चले"},
"moveRightTooltip":function(d){return "चप्पू को दाहिना चलाइए।"},
"moveUp":function(d){return "ऊपर चले"},
"moveUpTooltip":function(d){return "चप्पू को ऊपर चलाइए।"},
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
"playSoundCrunch":function(d){return "चरमराने का ध्वनि बजाए"},
"playSoundGoal1":function(d){return "लक्ष्य 1 का ध्वनि बजाए"},
"playSoundGoal2":function(d){return "लक्ष्य 2 का ध्वनि बजाए"},
"playSoundHit":function(d){return "मारने का ध्वनि बजाए"},
"playSoundLosePoint":function(d){return "अंक खोने का ध्वनि बजाए"},
"playSoundLosePoint2":function(d){return "2 अंक खोने का ध्वनि बजाए"},
"playSoundRetro":function(d){return "पूर्वव्यापी का ध्वनि बजाए"},
"playSoundRubber":function(d){return "रबर का ध्वनि बजाए"},
"playSoundSlap":function(d){return "थप्पड का ध्वनि बजाए"},
"playSoundTooltip":function(d){return "चुनिंदा ध्वनि बजाए"},
"playSoundWinPoint":function(d){return "अंक जीतऩे का ध्वनि बजाए"},
"playSoundWinPoint2":function(d){return "2 अंक जीतऩे का ध्वनि बजाए"},
"playSoundWood":function(d){return "लकड़ी का ध्वनि बजाए"},
"putdownTower":function(d){return "put down tower"},
"reinfFeedbackMsg":function(d){return "You can press the \"Try again\" button to go back to playing your game."},
"removeSquare":function(d){return "remove square"},
"repeatUntil":function(d){return "दोहराएँ जब तक"},
"repeatUntilBlocked":function(d){return "while path ahead"},
"repeatUntilFinish":function(d){return "repeat until finish"},
"scoreText":function(d){return "स्कोर: "+bounce_locale.v(d,"playerScore")+": "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "निरुद्देश्य मंजर निर्धारित कऱे"},
"setBackgroundHardcourt":function(d){return "हार्डकोर्ट का मंजर निर्धारित कऱे"},
"setBackgroundRetro":function(d){return "पूर्वव्यापी मंजर निर्धारित कऱे"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setBallRandom":function(d){return "निरुद्देश्य मंजर निर्धारित कऱे"},
"setBallHardcourt":function(d){return "हार्डकोर्ट का गेंद निर्धारित कऱे"},
"setBallRetro":function(d){return "पूर्वव्यापी गेंद निर्धारित करें"},
"setBallTooltip":function(d){return "गेंद का छवि निर्धारित करें"},
"setBallSpeedRandom":function(d){return "गेंद की गति निरुद्देश्य निर्धारित करें"},
"setBallSpeedVerySlow":function(d){return "गेंद की गति बहुत धीमी  निर्धारित करें"},
"setBallSpeedSlow":function(d){return "गेंद की गति धीमी निर्धारित करें"},
"setBallSpeedNormal":function(d){return "गेंद की गति सामान्य निर्धारित करें"},
"setBallSpeedFast":function(d){return "गेंद की गति तेज निर्धारित करें"},
"setBallSpeedVeryFast":function(d){return "गेंद की गति बहुत तेज निर्धारित करें"},
"setBallSpeedTooltip":function(d){return "गेंद की गति निर्धारित करें"},
"setPaddleRandom":function(d){return "निरुद्देश्य चप्पू निर्धारित करें"},
"setPaddleHardcourt":function(d){return "हार्डकोर्ट चप्पू निर्धारित करें"},
"setPaddleRetro":function(d){return "पूर्वव्यापी चप्पू निर्धारित करें"},
"setPaddleTooltip":function(d){return "चप्पू छवि निर्धारित करें"},
"setPaddleSpeedRandom":function(d){return "चप्पू गति निरुद्देश्य निर्धारित करें"},
"setPaddleSpeedVerySlow":function(d){return "चप्पू गति बहुत धीमी निर्धारित करें"},
"setPaddleSpeedSlow":function(d){return "चप्पू गति धीमी निर्धारित करें"},
"setPaddleSpeedNormal":function(d){return "चप्पू गति सामान्य निर्धारित करें"},
"setPaddleSpeedFast":function(d){return "चप्पू गति तेज निर्धारित करें"},
"setPaddleSpeedVeryFast":function(d){return "चप्पू गति बहुत तेज निर्धारित करें"},
"setPaddleSpeedTooltip":function(d){return "चप्पू गति निर्धारित करें"},
"shareBounceTwitter":function(d){return "मेरा बनाया गया उछाल का खेल देखे।मैने खुद @codeorg से लिखा है"},
"shareGame":function(d){return "Share your game:"},
"turnLeft":function(d){return "turn left"},
"turnRight":function(d){return "turn right"},
"turnTooltip":function(d){return "Turns me left or right by 90 degrees."},
"whenBallInGoal":function(d){return "जब गेंद लक्ष्य में हो"},
"whenBallInGoalTooltip":function(d){return "जब गेंद लक्ष्य में हो तो नीचे दिये गएे कार्यों का संचालन करे।"},
"whenBallMissesPaddle":function(d){return "जब गेंद चप्पू को चूक जाएे"},
"whenBallMissesPaddleTooltip":function(d){return "जब गेंद चप्पू को चूक जाएे तो नीचे दिये गएे कार्यों को संचालन करे।"},
"whenDown":function(d){return "जब नीचे तीर"},
"whenDownTooltip":function(d){return "जब नीचे तीर दबाया जाएे तो नीचे दिये गएे कार्यों का संचालन करे।"},
"whenGameStarts":function(d){return "when game starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the game starts."},
"whenLeft":function(d){return "जब बाया तीर"},
"whenLeftTooltip":function(d){return "जब बाया तीर दबाया जाएे तो नीचे दिये गएे कार्यों को संचालन करे।"},
"whenPaddleCollided":function(d){return "जब गेंद चप्पू को मारेेेे"},
"whenPaddleCollidedTooltip":function(d){return "जब गेंद चप्पू सेे टकराये तब नीचे दिये गएे कार्यों का संचालन करे।"},
"whenRight":function(d){return "जब दाहिना तीर"},
"whenRightTooltip":function(d){return "जब दाहिना तीर दबाया जाएे तो नीचे दिये गएे कार्यों का संचालन करे।"},
"whenUp":function(d){return "जब ऊपर तीर"},
"whenUpTooltip":function(d){return "जब ऊपर तीर दबाया जाएे तो नीचे दिये गएे कार्यों का संचालन करे।"},
"whenWallCollided":function(d){return "जब गेंद दीवार को को मारे v"},
"whenWallCollidedTooltip":function(d){return "जब गेंद दीवार सेे टकराये तब नीचे दिये गएे कार्यों का संचालन करे।"},
"whileMsg":function(d){return "जबकि"},
"whileTooltip":function(d){return "Repeat the enclosed actions until finish point is reached."},
"yes":function(d){return "Yes"}};