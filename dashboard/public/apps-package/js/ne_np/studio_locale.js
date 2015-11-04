var studio_locale = {lc:{"ar":function(n){
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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "नायक"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Alien Invasion!"},
"backgroundBlack":function(d){return "कालो"},
"backgroundCave":function(d){return "गुफा"},
"backgroundCloudy":function(d){return "बादल लागेको"},
"backgroundHardcourt":function(d){return "कदरुपमा "},
"backgroundNight":function(d){return "राति"},
"backgroundUnderwater":function(d){return "पनि मुनि"},
"backgroundCity":function(d){return "शहर"},
"backgroundDesert":function(d){return "मरुभूमि"},
"backgroundRainbow":function(d){return "इन्द्रणी"},
"backgroundSoccer":function(d){return "प्राप्तांक"},
"backgroundSpace":function(d){return "space"},
"backgroundTennis":function(d){return "टेनिस"},
"backgroundWinter":function(d){return "चिसो"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "Actions"},
"catControl":function(d){return "Loops"},
"catEvents":function(d){return "कार्य "},
"catLogic":function(d){return "Logic"},
"catMath":function(d){return "Math"},
"catProcedures":function(d){return "Functions"},
"catText":function(d){return "Text"},
"catVariables":function(d){return "Variables"},
"changeScoreTooltip":function(d){return "जोड अथवा हटाऊ प्राप्तांक को संख्या."},
"changeScoreTooltipK1":function(d){return "जोड प्राप्तांकको संख्या."},
"continue":function(d){return "Continue"},
"decrementPlayerScore":function(d){return "संख्या हटाऊ"},
"defaultSayText":function(d){return "यहाँ टाइप गर्नुहोस"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "जोड अथवा हटाऊ प्राप्तांक को संख्या."},
"dropletBlock_changeScore_param0":function(d){return "score"},
"dropletBlock_changeScore_param0_description":function(d){return "The value to add to the score (negative values will reduce the score)."},
"dropletBlock_moveRight_description":function(d){return "Moves the character to the right."},
"dropletBlock_moveUp_description":function(d){return "Moves the character up."},
"dropletBlock_moveDown_description":function(d){return "Moves the character down."},
"dropletBlock_moveLeft_description":function(d){return "Moves the character left."},
"dropletBlock_moveSlow_description":function(d){return "Changes a set of characters to move slowly."},
"dropletBlock_moveSlow_param0":function(d){return "type"},
"dropletBlock_moveSlow_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveNormal_description":function(d){return "Changes a set of characters to move at a normal speed."},
"dropletBlock_moveNormal_param0":function(d){return "type"},
"dropletBlock_moveNormal_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_moveFast_description":function(d){return "Changes a set of characters to move quickly."},
"dropletBlock_moveFast_param0":function(d){return "type"},
"dropletBlock_moveFast_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_playSound_description":function(d){return "Play the chosen sound."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Sets the background image."},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "speed"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "पात्र को मुड छान  "},
"dropletBlock_setSpritePosition_description":function(d){return "Instantly moves an actor to the specified location."},
"dropletBlock_setSpriteSpeed_description":function(d){return "छिटो गति को पात्र छान "},
"dropletBlock_setSprite_description":function(d){return "Sets the actor image"},
"dropletBlock_setSprite_param0":function(d){return "index"},
"dropletBlock_setSprite_param0_description":function(d){return "The index (starting at 0) indicating which actor should change."},
"dropletBlock_setSprite_param1":function(d){return "image"},
"dropletBlock_setSprite_param1_description":function(d){return "The name of the actor image."},
"dropletBlock_setToChase_description":function(d){return "Changes a set of characters to chase the bot."},
"dropletBlock_setToChase_param0":function(d){return "type"},
"dropletBlock_setToChase_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToFlee_description":function(d){return "Changes a set of characters to flee from the bot."},
"dropletBlock_setToFlee_param0":function(d){return "type"},
"dropletBlock_setToFlee_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToRoam_description":function(d){return "Changes a set of characters to roam freely."},
"dropletBlock_setToRoam_param0":function(d){return "type"},
"dropletBlock_setToRoam_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setToStop_description":function(d){return "Changes a set of characters to stop moving."},
"dropletBlock_setToStop_param0":function(d){return "type"},
"dropletBlock_setToStop_param0_description":function(d){return "The type of characters to be changed ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_setMap_description":function(d){return "Changes the map in the scene."},
"dropletBlock_setMap_param0":function(d){return "name"},
"dropletBlock_setMap_param0_description":function(d){return "The name of the map ('random', 'blank', 'circle', 'circle2', 'horizontal', 'grid', or 'blobs')."},
"dropletBlock_throw_description":function(d){return "Throws a projectile from the specified actor."},
"dropletBlock_vanish_description":function(d){return "Vanishes the actor."},
"dropletBlock_whenDown_description":function(d){return "This function executes when the down button is pressed."},
"dropletBlock_whenLeft_description":function(d){return "This function executes when the left button is pressed."},
"dropletBlock_whenRight_description":function(d){return "This function executes when the right button is pressed."},
"dropletBlock_whenTouchCharacter_description":function(d){return "This function executes when the character touches any character."},
"dropletBlock_whenTouchObstacle_description":function(d){return "This function executes when the character touches any obstacle."},
"dropletBlock_whenTouchMan_description":function(d){return "This function executes when the character touches man characters."},
"dropletBlock_whenTouchPilot_description":function(d){return "This function executes when the character touches pilot characters."},
"dropletBlock_whenTouchPig_description":function(d){return "This function executes when the character touches pig characters."},
"dropletBlock_whenTouchBird_description":function(d){return "This function executes when the character touches bird characters."},
"dropletBlock_whenTouchMouse_description":function(d){return "This function executes when the character touches mouse characters."},
"dropletBlock_whenTouchRoo_description":function(d){return "This function executes when the character touches roo characters."},
"dropletBlock_whenTouchSpider_description":function(d){return "This function executes when the character touches spider characters."},
"dropletBlock_whenUp_description":function(d){return "This function executes when the up button is pressed."},
"emotion":function(d){return "mood"},
"finalLevel":function(d){return "Congratulations! You have solved the final puzzle."},
"for":function(d){return "for"},
"hello":function(d){return "हेल्लो"},
"helloWorld":function(d){return "हेल्लो विश्व !"},
"incrementPlayerScore":function(d){return "score point"},
"itemBlueFireball":function(d){return "निलो fireball"},
"itemPurpleFireball":function(d){return "कलेजी  fireball"},
"itemRedFireball":function(d){return "रातो आगोबल "},
"itemYellowHearts":function(d){return "पहेलो मुटु "},
"itemPurpleHearts":function(d){return "कलेजी  मुटु "},
"itemRedHearts":function(d){return "रातो  मुटु "},
"itemRandom":function(d){return "random"},
"itemAnna":function(d){return "hook"},
"itemElsa":function(d){return "sparkle"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "रकेट "},
"itemRapunzel":function(d){return "saucepan"},
"itemCherry":function(d){return "चेरी"},
"itemIce":function(d){return "बारफ"},
"itemDuck":function(d){return "duck"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "हराउनु"},
"makeProjectileBounce":function(d){return "नमिल्नु"},
"makeProjectileBlueFireball":function(d){return "निलो fireballमा चिनोलगाउनु"},
"makeProjectilePurpleFireball":function(d){return "गुलाबी  fireballमा चिनोलगाउनु"},
"makeProjectileRedFireball":function(d){return "रातो   fireballमा चिनोलगाउनु"},
"makeProjectileYellowHearts":function(d){return "पहेलो fireballमा चिनोलगाउनु"},
"makeProjectilePurpleHearts":function(d){return "गुलाबी   heartमा चिनोलगाउनु"},
"makeProjectileRedHearts":function(d){return "रतो  heartमा चिनोलगाउनु"},
"makeProjectileTooltip":function(d){return "चिनो लागु "},
"makeYourOwn":function(d){return "चिनो तपाइको आफ्नो प्रयोगशाला एप्स "},
"moveDirectionDown":function(d){return "तल"},
"moveDirectionLeft":function(d){return "बाँया"},
"moveDirectionRight":function(d){return "दाँया"},
"moveDirectionUp":function(d){return "माथि"},
"moveDirectionRandom":function(d){return "random"},
"moveDistance25":function(d){return "25 pixels"},
"moveDistance50":function(d){return "50 pixels"},
"moveDistance100":function(d){return "100 pixels"},
"moveDistance200":function(d){return "200 pixels"},
"moveDistance400":function(d){return "400 pixels"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "जुनसुकै pixels"},
"moveDistanceTooltip":function(d){return "पात्र लै कुनै निश्चित दिशा र दुरीमा सार "},
"moveSprite":function(d){return "चल्नु"},
"moveSpriteN":function(d){return "नायक चल्नुहोस "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "to x,y"},
"moveDown":function(d){return "move down"},
"moveDownTooltip":function(d){return "नायक तल चल्नुहोस."},
"moveLeft":function(d){return "move left"},
"moveLeftTooltip":function(d){return "पात्र लै बाया सार "},
"moveRight":function(d){return "move right"},
"moveRightTooltip":function(d){return "पात्र लै दायाँ सार "},
"moveUp":function(d){return "move up"},
"moveUpTooltip":function(d){return "सार पत्र लाई माथि"},
"moveTooltip":function(d){return "सार पात्र लाई "},
"nextLevel":function(d){return "Congratulations! You have completed this puzzle."},
"no":function(d){return "No"},
"numBlocksNeeded":function(d){return "This puzzle can be solved with %1 blocks."},
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "आम्मै !"},
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
"positionOutTopLeft":function(d){return "माथि बाट बाया मा "},
"positionOutTopRight":function(d){return "माथि बाट दाया मा "},
"positionTopOutLeft":function(d){return "माथि बाट बाहिर "},
"positionTopLeft":function(d){return "माथि बाट बाया मा "},
"positionTopCenter":function(d){return "माथि बाट बीच मा "},
"positionTopRight":function(d){return "माथि बाट दाया मा "},
"positionTopOutRight":function(d){return "माथि बाट दया बाहिर "},
"positionMiddleLeft":function(d){return "बीच को वाया "},
"positionMiddleCenter":function(d){return "बीच को बीच मा "},
"positionMiddleRight":function(d){return "बीच को दाया "},
"positionBottomOutLeft":function(d){return "मुनि को बिहिर baaya"},
"positionBottomLeft":function(d){return "मुनि को बायाँ मा "},
"positionBottomCenter":function(d){return "मुनि बाट केन्द्र मा "},
"positionBottomRight":function(d){return "मुनि बाट दाया "},
"positionBottomOutRight":function(d){return "मुनि पट्टि बाहिर दया मा "},
"positionOutBottomLeft":function(d){return "तल को मुनि बायाँ मा "},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "to the random position"},
"projectileBlueFireball":function(d){return "निलो fireball"},
"projectilePurpleFireball":function(d){return "कलेजी  fireball"},
"projectileRedFireball":function(d){return "रातो आगोबल "},
"projectileYellowHearts":function(d){return "पहेलो मुटु "},
"projectilePurpleHearts":function(d){return "कलेजी  मुटु "},
"projectileRedHearts":function(d){return "रातो  मुटु "},
"projectileRandom":function(d){return "random"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "रकेट "},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "चेरी"},
"projectileIce":function(d){return "बारफ"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "You can press the \"Keep Playing\" button to go back to playing your story."},
"repeatForever":function(d){return "repeat forever"},
"repeatDo":function(d){return "do"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the story is running."},
"saySprite":function(d){return "भन्नु"},
"saySpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" say"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_0":function(d){return "नमस्कार तपाई तेहा "},
"saySpriteChoices_1":function(d){return "नमस्कार सबैजना "},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "शुभ बिहानी "},
"saySpriteChoices_4":function(d){return "शुभ मध्यान"},
"saySpriteChoices_5":function(d){return "शुभा रात्री "},
"saySpriteChoices_6":function(d){return "शुभ सन्ध्या "},
"saySpriteChoices_7":function(d){return "के छ नयाँ"},
"saySpriteChoices_8":function(d){return "के "},
"saySpriteChoices_9":function(d){return "कहाँ "},
"saySpriteChoices_10":function(d){return "कहिले "},
"saySpriteChoices_11":function(d){return "राम्रो "},
"saySpriteChoices_12":function(d){return "अति राम्रो "},
"saySpriteChoices_13":function(d){return "सबै ठिक छ "},
"saySpriteChoices_14":function(d){return "नराम्रो छैन् "},
"saySpriteChoices_15":function(d){return "राम्रो gara"},
"saySpriteChoices_16":function(d){return "Yes"},
"saySpriteChoices_17":function(d){return "No"},
"saySpriteChoices_18":function(d){return "ओके "},
"saySpriteChoices_19":function(d){return "राम्रो  throw!"},
"saySpriteChoices_20":function(d){return "राम्रो होस् तिम्रो दिन "},
"saySpriteChoices_21":function(d){return "बाई "},
"saySpriteChoices_22":function(d){return "म पछि छु "},
"saySpriteChoices_23":function(d){return "भोलि भेतुला "},
"saySpriteChoices_24":function(d){return "पछी भेटौला "},
"saySpriteChoices_25":function(d){return "आफ्नु ख्याल गर्नुहोला "},
"saySpriteChoices_26":function(d){return "मजा लिनुहोस् "},
"saySpriteChoices_27":function(d){return "म जान्छु"},
"saySpriteChoices_28":function(d){return "म साथी बन्नु सक्छु"},
"saySpriteChoices_29":function(d){return "राम्रो काम"},
"saySpriteChoices_30":function(d){return "अह्ह्हा कति राम्रो !"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "सबै ठिक छ "},
"saySpriteChoices_34":function(d){return "धन्यवाद"},
"saySpriteChoices_35":function(d){return "हुन्न धन्यवाद"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "मैंड नगर "},
"saySpriteChoices_38":function(d){return "आज "},
"saySpriteChoices_39":function(d){return "भोलि "},
"saySpriteChoices_40":function(d){return "हिजो "},
"saySpriteChoices_41":function(d){return "मैले तिमीलाई भेटाए "},
"saySpriteChoices_42":function(d){return "तिमीले मलाई भेटायो"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "तिमि राम्रो छोउ "},
"saySpriteChoices_45":function(d){return "तिमि रमाइलो छोउ "},
"saySpriteChoices_46":function(d){return "तिमि खतम (नराम्रो) छौ "},
"saySpriteChoices_47":function(d){return "तिमि राम्रो साथी "},
"saySpriteChoices_48":function(d){return "हेर्न सिद्धियो "},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "ओव "},
"saySpriteChoices_52":function(d){return "माफ गर्नु होला "},
"saySpriteChoices_53":function(d){return "सतर्क "},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "ऊप्स "},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "राम्रो प्रयाश "},
"saySpriteChoices_58":function(d){return "तिमीले मलाई भेटाउन सक्नु भएन "},
"scoreText":function(d){return "Score: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return " background निश्चित गर्नुहोस् "},
"setBackgroundRandom":function(d){return "अनियमित  background निश्चित  गर्नु होस् "},
"setBackgroundBlack":function(d){return "कालो background निश्चित गर्नु होस्"},
"setBackgroundCave":function(d){return "निश्चित  cave background"},
"setBackgroundCloudy":function(d){return "निश्चित गर्नुहोस बादले BACKGROUND"},
"setBackgroundHardcourt":function(d){return "set hardcourt background"},
"setBackgroundNight":function(d){return "रति को BACKGROUND निश्चित गर्नुहोस "},
"setBackgroundUnderwater":function(d){return "पनि मुनिको  को BACKGROUND निश्चित गर्नुहोस "},
"setBackgroundCity":function(d){return "सहर को BACKGROUND निश्चित गर्नुहोस "},
"setBackgroundDesert":function(d){return "मरुभूमि  को BACKGROUND निश्चित गर्नुहोस "},
"setBackgroundRainbow":function(d){return "इन्द्रणी को BACKGROUND निश्चित गर्नुहोस "},
"setBackgroundSoccer":function(d){return "set soccer background"},
"setBackgroundSpace":function(d){return "set space background"},
"setBackgroundTennis":function(d){return "set tennis background"},
"setBackgroundWinter":function(d){return "set winter background"},
"setBackgroundLeafy":function(d){return "set leafy background"},
"setBackgroundGrassy":function(d){return "set grassy background"},
"setBackgroundFlower":function(d){return "set flower background"},
"setBackgroundTile":function(d){return "set tile background"},
"setBackgroundIcy":function(d){return "set icy background"},
"setBackgroundSnowy":function(d){return "set snowy background"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Sets the background image"},
"setEnemySpeed":function(d){return "set enemy speed"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "set player speed"},
"setScoreText":function(d){return "set score"},
"setScoreTextTooltip":function(d){return "Sets the text to be displayed in the score area."},
"setSpriteEmotionAngry":function(d){return "to a angry mood"},
"setSpriteEmotionHappy":function(d){return "खुशी मुद्रा को लागि "},
"setSpriteEmotionNormal":function(d){return "साधरण  मुड को लागि "},
"setSpriteEmotionRandom":function(d){return "अनियमित मुड को लागि "},
"setSpriteEmotionSad":function(d){return "रिसाउने मुड को लागि "},
"setSpriteEmotionTooltip":function(d){return "पात्र को मुड छान  "},
"setSpriteAlien":function(d){return " alien image को लागि "},
"setSpriteBat":function(d){return "bat image को लागि "},
"setSpriteBird":function(d){return "bird image को लागि"},
"setSpriteCat":function(d){return " cat image को लागि"},
"setSpriteCaveBoy":function(d){return "cave boy image को लागि "},
"setSpriteCaveGirl":function(d){return "cave girl (Jasmine) image को लागि "},
"setSpriteDinosaur":function(d){return "dinosaur image को लागि "},
"setSpriteDog":function(d){return "dog image को लागि "},
"setSpriteDragon":function(d){return " dragon image को लागि"},
"setSpriteGhost":function(d){return "to a ghost image"},
"setSpriteHidden":function(d){return "लुकेको चित्र "},
"setSpriteHideK1":function(d){return "लुकेको "},
"setSpriteAnna":function(d){return " Anna image को लागि "},
"setSpriteElsa":function(d){return " Elsa image को लागि"},
"setSpriteHiro":function(d){return " Hiro image को लागि "},
"setSpriteBaymax":function(d){return " Baymax image को लागि "},
"setSpriteRapunzel":function(d){return "Rapunzel image को लागि "},
"setSpriteKnight":function(d){return " knight image को लागि "},
"setSpriteMonster":function(d){return "monster image को लागि "},
"setSpriteNinja":function(d){return " masked ninja image को लागि "},
"setSpriteOctopus":function(d){return " octopus image को लागि "},
"setSpritePenguin":function(d){return "penguin (Waddles) image को लागि "},
"setSpritePirate":function(d){return " pirate image को लागि "},
"setSpritePrincess":function(d){return "princess image को लागि "},
"setSpriteRandom":function(d){return " random image को लागि "},
"setSpriteRobot":function(d){return "robot (Spiff) image को लागि "},
"setSpriteShowK1":function(d){return "देखाउ "},
"setSpriteSpacebot":function(d){return "spacebot image को लागि"},
"setSpriteSoccerGirl":function(d){return "soccer girl image को लागि"},
"setSpriteSoccerBoy":function(d){return " soccer boy imageको लागि "},
"setSpriteSquirrel":function(d){return " squirrel image को लागि"},
"setSpriteTennisGirl":function(d){return "tennis girl image को लागि"},
"setSpriteTennisBoy":function(d){return "tennis boy image को लागि"},
"setSpriteUnicorn":function(d){return "unicorn image को लागि"},
"setSpriteWitch":function(d){return "कुन चित्र को लागि"},
"setSpriteWizard":function(d){return "झाक्री चित्र को लागि "},
"setSpritePositionTooltip":function(d){return "Instantly moves an actor to the specified location."},
"setSpriteK1Tooltip":function(d){return "Shows or hides the specified actor."},
"setSpriteTooltip":function(d){return "Sets the actor image"},
"setSpriteSizeRandom":function(d){return "अनियमित आकार को लागि"},
"setSpriteSizeVerySmall":function(d){return "धेरै सानो को लागि"},
"setSpriteSizeSmall":function(d){return "सानो आकार को लागि "},
"setSpriteSizeNormal":function(d){return "साधरण आकारको लागि "},
"setSpriteSizeLarge":function(d){return "ठुलो आकार को लागि "},
"setSpriteSizeVeryLarge":function(d){return "धेरै ठूलो आकार को लागि "},
"setSpriteSizeTooltip":function(d){return "पात्र को आकार निश्चित गर्नुहोस "},
"setSpriteSpeedRandom":function(d){return "अनियमित गति को लागि "},
"setSpriteSpeedVerySlow":function(d){return "धरै कम गतिको लागि "},
"setSpriteSpeedSlow":function(d){return "कम गति को लागि "},
"setSpriteSpeedNormal":function(d){return "साधरण गति को लागि "},
"setSpriteSpeedFast":function(d){return "छिटो गति को लागि "},
"setSpriteSpeedVeryFast":function(d){return "धरै उच्च गतिको लागि "},
"setSpriteSpeedTooltip":function(d){return "छिटो गति को पात्र छान "},
"setSpriteZombie":function(d){return "zombie image को लागि "},
"setSpriteBot1":function(d){return "to bot1"},
"setSpriteBot2":function(d){return "to bot2"},
"setMap":function(d){return "set map"},
"setMapRandom":function(d){return "set random map"},
"setMapBlank":function(d){return "set blank map"},
"setMapCircle":function(d){return "set circle map"},
"setMapCircle2":function(d){return "set circle2 map"},
"setMapHorizontal":function(d){return "set horizontal map"},
"setMapGrid":function(d){return "set grid map"},
"setMapBlobs":function(d){return "set blobs map"},
"setMapTooltip":function(d){return "Changes the map in the scene"},
"shareStudioTwitter":function(d){return "Check out the story I made. म आफै लेख्न सक्छु  @codeorg"},
"shareGame":function(d){return "आफ्नु कथा भन"},
"showCoordinates":function(d){return "सर्त देखाऊ "},
"showCoordinatesTooltip":function(d){return "show the protagonist's coordinates on the screen"},
"showTitleScreen":function(d){return "शीर्षक देखाऊ "},
"showTitleScreenTitle":function(d){return "title"},
"showTitleScreenText":function(d){return "text"},
"showTSDefTitle":function(d){return "type title here"},
"showTSDefText":function(d){return "type text here"},
"showTitleScreenTooltip":function(d){return "Show a title screen with the associated title and text."},
"size":function(d){return "size"},
"setSprite":function(d){return "set"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "crunch"},
"soundGoal1":function(d){return "goal 1"},
"soundGoal2":function(d){return "goal 2"},
"soundHit":function(d){return "hit"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "झापड "},
"soundWinPoint":function(d){return "जितेको अंक "},
"soundWinPoint2":function(d){return "जितेको अंक २ "},
"soundWood":function(d){return "wood"},
"speed":function(d){return "speed"},
"startSetValue":function(d){return "सुरु को कार्य "},
"startSetVars":function(d){return "game_vars (title, subtitle, background, target, danger, player)"},
"startSetFuncs":function(d){return "game_funcs (update-target, update-danger, update-player, collide?, on-screen?)"},
"stopSprite":function(d){return "stop"},
"stopSpriteN":function(d){return "stop actor "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Stops an actor's movement."},
"throwSprite":function(d){return "throw"},
"throwSpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" throw"},
"throwTooltip":function(d){return "Throws a projectile from the specified actor."},
"vanish":function(d){return "vanish"},
"vanishActorN":function(d){return "vanish actor "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Vanishes the actor."},
"waitFor":function(d){return "wait for"},
"waitSeconds":function(d){return "seconds"},
"waitForClick":function(d){return "wait for click"},
"waitForRandom":function(d){return "wait for random"},
"waitForHalfSecond":function(d){return "wait for a half second"},
"waitFor1Second":function(d){return "wait for 1 second"},
"waitFor2Seconds":function(d){return "wait for 2 seconds"},
"waitFor5Seconds":function(d){return "wait for 5 seconds"},
"waitFor10Seconds":function(d){return "wait for 10 seconds"},
"waitParamsTooltip":function(d){return "Waits for a specified number of seconds or use zero to wait until a click occurs."},
"waitTooltip":function(d){return "Waits for a specified amount of time or until a click occurs."},
"whenArrowDown":function(d){return "down arrow"},
"whenArrowLeft":function(d){return "left arrow"},
"whenArrowRight":function(d){return "right arrow"},
"whenArrowUp":function(d){return "up arrow"},
"whenArrowTooltip":function(d){return "Execute the actions below when the specified arrow key is pressed."},
"whenDown":function(d){return "when down arrow"},
"whenDownTooltip":function(d){return "Execute the actions below when the down arrow key is pressed."},
"whenGameStarts":function(d){return "when story starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "when left arrow"},
"whenLeftTooltip":function(d){return "Execute the actions below when the left arrow key is pressed."},
"whenRight":function(d){return "when right arrow"},
"whenRightTooltip":function(d){return "Execute the actions below when the right arrow key is pressed."},
"whenSpriteClicked":function(d){return "when actor clicked"},
"whenSpriteClickedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")+" clicked"},
"whenSpriteClickedTooltip":function(d){return "Execute the actions below when an actor is clicked."},
"whenSpriteCollidedN":function(d){return "when actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Execute the actions below when an actor touches another actor."},
"whenSpriteCollidedWith":function(d){return "touches"},
"whenSpriteCollidedWithAnyActor":function(d){return "touches any actor"},
"whenSpriteCollidedWithAnyEdge":function(d){return "touches any edge"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "touches any projectile"},
"whenSpriteCollidedWithAnything":function(d){return "touches anything"},
"whenSpriteCollidedWithN":function(d){return "touches actor "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "touches blue fireball"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "touches purple fireball"},
"whenSpriteCollidedWithRedFireball":function(d){return "touches red fireball"},
"whenSpriteCollidedWithYellowHearts":function(d){return "touches yellow hearts"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "touches purple hearts"},
"whenSpriteCollidedWithRedHearts":function(d){return "touches red hearts"},
"whenSpriteCollidedWithBottomEdge":function(d){return "touches bottom edge"},
"whenSpriteCollidedWithLeftEdge":function(d){return "touches left edge"},
"whenSpriteCollidedWithRightEdge":function(d){return "touches right edge"},
"whenSpriteCollidedWithTopEdge":function(d){return "touches top edge"},
"whenTouchItem":function(d){return "when character touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchWall":function(d){return "when obstacle touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenUp":function(d){return "when up arrow"},
"whenUpTooltip":function(d){return "Execute the actions below when the up arrow key is pressed."},
"yes":function(d){return "Yes"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"addPoints10":function(d){return "add 10 points"},
"addPoints50":function(d){return "add 50 points"},
"addPoints100":function(d){return "add 100 points"},
"addPoints400":function(d){return "add 400 points"},
"addPoints1000":function(d){return "add 1000 points"},
"addPointsTooltip":function(d){return "Add points to the score."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutClickEvents":function(d){return "Click on the events header to see event function blocks."},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events"},
"calloutUseArrowButtonsAutoSteer":function(d){return "You can still use these buttons or the arrow keys on your keyboard to move"},
"calloutMoveRightRunButton":function(d){return "Add a second moveRight command to your code and then click here to run it"},
"calloutShowCodeToggle":function(d){return "Click here to switch between block and text mode"},
"calloutShowPlaceGoUpHere":function(d){return "Place goUp command here to move up"},
"calloutShowPlaySound":function(d){return "It's your game, so you choose the sounds now. Try the dropdown to pick a different sound"},
"calloutInstructions":function(d){return "Don't know what to do? Click the instructions to see them again"},
"calloutPlaceTwo":function(d){return "Can you make two MOUSEs appear when you get one MOUSE?"},
"calloutPlaceTwoWhenBird":function(d){return "Can you make two MOUSEs appear when you get a BIRD?"},
"calloutSetMapAndSpeed":function(d){return "Set the map and your speed."},
"calloutFinishButton":function(d){return "Click here when you are ready to share your game."},
"tapOrClickToPlay":function(d){return "Tap or click to play"},
"tapOrClickToReset":function(d){return "Tap or click to reset"},
"dropletBlock_addPoints_description":function(d){return "Add points to the score."},
"dropletBlock_addPoints_param0":function(d){return "score"},
"dropletBlock_addPoints_param0_description":function(d){return "The value to add to the score."},
"dropletBlock_removePoints_description":function(d){return "Remove points from the score."},
"dropletBlock_removePoints_param0":function(d){return "score"},
"dropletBlock_removePoints_param0_description":function(d){return "The value to remove from the score."},
"dropletBlock_endGame_description":function(d){return "End the game."},
"dropletBlock_endGame_param0":function(d){return "type"},
"dropletBlock_endGame_param0_description":function(d){return "Whether the game was won or lost ('win', 'lose')."},
"dropletBlock_whenGetCharacter_description":function(d){return "This function executes when the character gets any character."},
"dropletBlock_whenGetMan_description":function(d){return "This function executes when the character gets man characters."},
"dropletBlock_whenGetPilot_description":function(d){return "This function executes when the character gets pilot characters."},
"dropletBlock_whenGetPig_description":function(d){return "This function executes when the character gets pig characters."},
"dropletBlock_whenGetBird_description":function(d){return "This function executes when the character gets bird characters."},
"dropletBlock_whenGetMouse_description":function(d){return "This function executes when the character gets mouse characters."},
"dropletBlock_whenGetRoo_description":function(d){return "This function executes when the character gets roo characters."},
"dropletBlock_whenGetSpider_description":function(d){return "This function executes when the character gets spider characters."},
"hoc2015_lastLevel_continueText":function(d){return "Done"},
"hoc2015_reinfFeedbackMsg":function(d){return "You can press the \""+studio_locale.v(d,"backButton")+"\" button to go back to playing your game."},
"hoc2015_shareGame":function(d){return "Share your game:"},
"iceAge":function(d){return "Ice Age!"},
"itemIAProjectile1":function(d){return "hearts"},
"itemIAProjectile2":function(d){return "boulder"},
"itemIAProjectile3":function(d){return "ice cube"},
"itemIAProjectile4":function(d){return "snowflake"},
"itemIAProjectile5":function(d){return "ice crystal"},
"loseMessage":function(d){return "You lose!"},
"projectileIAProjectile1":function(d){return "hearts"},
"projectileIAProjectile2":function(d){return "boulder"},
"projectileIAProjectile3":function(d){return "ice cube"},
"projectileIAProjectile4":function(d){return "snowflake"},
"projectileIAProjectile5":function(d){return "ice crystal"},
"removePoints10":function(d){return "remove 10 points"},
"removePoints50":function(d){return "remove 50 points"},
"removePoints100":function(d){return "remove 100 points"},
"removePoints400":function(d){return "remove 400 points"},
"removePoints1000":function(d){return "remove 1000 points"},
"removePointsTooltip":function(d){return "Remove points from the score."},
"setSpriteManny":function(d){return "to a Manny image"},
"setSpriteSid":function(d){return "to a Sid image"},
"setSpriteGranny":function(d){return "to a Granny image"},
"setSpriteDiego":function(d){return "to a Diego image"},
"setSpriteScrat":function(d){return "to a Scrat image"},
"whenGetCharacterPIG":function(d){return "when get PIG"},
"whenGetCharacterMAN":function(d){return "when get MAN"},
"whenGetCharacterROO":function(d){return "when get ROO"},
"whenGetCharacterBIRD":function(d){return "when get BIRD"},
"whenGetCharacterSPIDER":function(d){return "when get SPIDER"},
"whenGetCharacterMOUSE":function(d){return "when get MOUSE"},
"whenGetCharacterPILOT":function(d){return "when get PILOT"},
"whenGetCharacterTooltip":function(d){return "Execute the actions below when an actor gets the specified type of character."},
"whenTouchCharacter":function(d){return "when character touched"},
"whenTouchCharacterTooltip":function(d){return "Execute the actions below when the actor touches a character."},
"whenTouchObstacle":function(d){return "when obstacle touched"},
"whenTouchObstacleTooltip":function(d){return "Execute the actions below when the actor touches an obstacle."},
"whenTouchGoal":function(d){return "when goal touched"},
"whenTouchGoalTooltip":function(d){return "Execute the actions below when the actor touches a goal."},
"winMessage":function(d){return "You win!"},
"failedHasSetBackground":function(d){return "Next time, set the background."},
"failedHasSetMap":function(d){return "Next time, set the map."},
"failedHasWonGame":function(d){return "Next time, win the game."},
"failedHasLostGame":function(d){return "Next time, lose the game"},
"failedAddItem":function(d){return "Next time, add a character."},
"failedAvoidHazard":function(d){return "\"Uh oh, a GUY got you!  Try again.\""},
"failedHasAllGoals":function(d){return "\"Try again, BOTX.  You can get it.\""},
"successHasAllGoals":function(d){return "\"You did it, BOTX!\""},
"successCharacter1":function(d){return "\"Well done, BOT1!\""},
"successGenericCharacter":function(d){return "\"Congratulations.  You did it!\""},
"failedTwoItemsTimeout":function(d){return "You need to get the pilots before time runs out. To move, put the goUp and goDown commands inside the whenUp and whenDown functions. Then, press and hold the arrow keys on your keyboard (or screen) to move quickly."},
"failedFourItemsTimeout":function(d){return "To pass this level, you'll need to put goLeft, goRight, goUp and goDown into the right functions. If your code looks correct, but you can't get there fast enough, try pressing and holding the arrow keys on your keyboard (or screen)."},
"failedScoreTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedScoreScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot."},
"failedScoreGoals":function(d){return "You used the addPoints command, but not in the right place. Can you put it inside the whenGetPilot function so BOT1 can't get points until he gets a pilot?"},
"failedWinLoseTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedWinLoseScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot. Use removePoints to subtract 100 when you touch a MAN. Avoid the MANs!"},
"failedWinLoseGoals":function(d){return "You used the addPoints command, but not in the right place. Can you make it so that the command is only called when you get the pilot? Also, remove points when you touch the MAN."},
"failedAddCharactersTimeout":function(d){return "Use three addCharacter commands at the top of your program to add PIGs when you hit run. Now go get them."},
"failedChainCharactersTimeout":function(d){return "You need to get 20 MOUSEs. They move fast. Try pressing and holding the keys on your keyboard (or screen) to chase them."},
"failedChainCharactersScore":function(d){return "You got the MOUSEs, but you don't have enough points to move to the next level. Make sure you add 100 points to your score every time you get a MOUSE?"},
"failedChainCharactersItems":function(d){return "You used the addPoints command, but not in the right place.  Can you make it so that the command is only called when you get the MOUSEs?"},
"failedChainCharacters2Timeout":function(d){return "You need to get 8 MOUSEs. Can you make two (or more) of them appear every time you get a ROO?"},
"failedChangeSettingTimeout":function(d){return "Get 3 pilots to move on."},
"failedChangeSettingSettings":function(d){return "Make the level your own. To pass this level, you need to change the map and set your speed."}};