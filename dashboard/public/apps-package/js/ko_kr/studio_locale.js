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
"actor":function(d){return "케릭터"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "외계인 침공!"},
"backgroundBlack":function(d){return "검정"},
"backgroundCave":function(d){return "동굴"},
"backgroundCloudy":function(d){return "구름"},
"backgroundHardcourt":function(d){return "하드코트"},
"backgroundNight":function(d){return "밤"},
"backgroundUnderwater":function(d){return "물속"},
"backgroundCity":function(d){return "도시"},
"backgroundDesert":function(d){return "사막"},
"backgroundRainbow":function(d){return "비"},
"backgroundSoccer":function(d){return "축구"},
"backgroundSpace":function(d){return "우주"},
"backgroundTennis":function(d){return "테니스"},
"backgroundWinter":function(d){return "겨울"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "동작"},
"catControl":function(d){return "반복"},
"catEvents":function(d){return "이벤트"},
"catLogic":function(d){return "논리"},
"catMath":function(d){return "계산"},
"catProcedures":function(d){return "함수"},
"catText":function(d){return "문장"},
"catVariables":function(d){return "변수"},
"changeScoreTooltip":function(d){return "점수를 올리거나 내립니다."},
"changeScoreTooltipK1":function(d){return "점수를 1점 올립니다."},
"continue":function(d){return "계속하기"},
"decrementPlayerScore":function(d){return "점수 지우기"},
"defaultSayText":function(d){return "하고 싶은 말"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "점수를 올리거나 내립니다."},
"dropletBlock_changeScore_param0":function(d){return "점수"},
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
"dropletBlock_playSound_description":function(d){return "선택한 소리 출력"},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "배경 이미지 설정"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "스피드"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "케릭터의 표정을 설정합니다."},
"dropletBlock_setSpritePosition_description":function(d){return "케릭터를 지정한 위치로 바로 점프 시킵니다."},
"dropletBlock_setSpriteSpeed_description":function(d){return "케릭터의 속도를 설정합니다."},
"dropletBlock_setSprite_description":function(d){return "케릭터를 바꿉니다."},
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
"dropletBlock_throw_description":function(d){return "지정한 케릭터에서 물건을 던집니다."},
"dropletBlock_vanish_description":function(d){return "케릭터를 삭제합니다."},
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
"emotion":function(d){return "감정"},
"finalLevel":function(d){return "축하합니다! 마지막 퍼즐을 해결했습니다."},
"for":function(d){return "다음에 대해"},
"hello":function(d){return "안녕하세요."},
"helloWorld":function(d){return "안녕하세요. 여러분!"},
"incrementPlayerScore":function(d){return "점수 올리기"},
"itemBlueFireball":function(d){return "파란 파이어볼"},
"itemPurpleFireball":function(d){return "분홍 파이어볼"},
"itemRedFireball":function(d){return "빨간 파이어볼"},
"itemYellowHearts":function(d){return "노란 하트"},
"itemPurpleHearts":function(d){return "분홍 하트"},
"itemRedHearts":function(d){return "빨간 하트"},
"itemRandom":function(d){return "random(랜덤)"},
"itemAnna":function(d){return "갈고리"},
"itemElsa":function(d){return "광채"},
"itemHiro":function(d){return "마이크로 봇"},
"itemBaymax":function(d){return "로켓"},
"itemRapunzel":function(d){return "냄비"},
"itemCherry":function(d){return "체리"},
"itemIce":function(d){return "얼음"},
"itemDuck":function(d){return "오리"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "보이지 않게 하기"},
"makeProjectileBounce":function(d){return "튕김 소리"},
"makeProjectileBlueFireball":function(d){return "파란 파이어볼 만들기"},
"makeProjectilePurpleFireball":function(d){return "분홍 파이어볼 만들기"},
"makeProjectileRedFireball":function(d){return "빨간 파이어볼 만들기"},
"makeProjectileYellowHearts":function(d){return "노란 하트 만들기"},
"makeProjectilePurpleHearts":function(d){return "분홍 하트 만들기"},
"makeProjectileRedHearts":function(d){return "빨간 하트 만들기"},
"makeProjectileTooltip":function(d){return "충돌하면 없어지거나 튕기는 발사체를 만듭니다."},
"makeYourOwn":function(d){return "자신만의 Play Lab 앱을 만드세요."},
"moveDirectionDown":function(d){return "아래로"},
"moveDirectionLeft":function(d){return "왼쪽으로"},
"moveDirectionRight":function(d){return "오른쪽으로"},
"moveDirectionUp":function(d){return "위로"},
"moveDirectionRandom":function(d){return "random(랜덤)"},
"moveDistance25":function(d){return "25 픽셀"},
"moveDistance50":function(d){return "50 픽셀"},
"moveDistance100":function(d){return "100 픽셀"},
"moveDistance200":function(d){return "200 픽셀"},
"moveDistance400":function(d){return "400 픽셀"},
"moveDistancePixels":function(d){return "pixels"},
"moveDistanceRandom":function(d){return "랜덤 픽셀"},
"moveDistanceTooltip":function(d){return "케릭터를 지정한 방향으로 지정한 거리만큼 움직입니다."},
"moveSprite":function(d){return "움직이기"},
"moveSpriteN":function(d){return "캐릭터 움직이기 "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "x,y로"},
"moveDown":function(d){return "아래로 이동하기"},
"moveDownTooltip":function(d){return "케릭터를 아래로 움직입니다."},
"moveLeft":function(d){return "왼쪽으로 이동하기"},
"moveLeftTooltip":function(d){return "케릭터를 왼쪽으로 움직입니다."},
"moveRight":function(d){return "오른쪽으로 이동하기"},
"moveRightTooltip":function(d){return "케릭터를 오른쪽으로 움직입니다."},
"moveUp":function(d){return "위로 올라가기"},
"moveUpTooltip":function(d){return "케릭터를 위로 움직입니다."},
"moveTooltip":function(d){return "케릭터를 움직입니다."},
"nextLevel":function(d){return "축하합니다! 퍼즐을 해결했습니다."},
"no":function(d){return "아니요"},
"numBlocksNeeded":function(d){return "%1 개의 블럭으로 퍼즐을 해결할 수 있습니다."},
"onEventTooltip":function(d){return "어떤 이벤트에 지정되어있는 코드를 실행합니다."},
"ouchExclamation":function(d){return "앗!"},
"playSoundCrunch":function(d){return "부서짐 소리 출력"},
"playSoundGoal1":function(d){return "골1 소리 출력"},
"playSoundGoal2":function(d){return "골2 소리 출력"},
"playSoundHit":function(d){return "때리기 소리 출력"},
"playSoundLosePoint":function(d){return "실점 소리 출력"},
"playSoundLosePoint2":function(d){return "실점 소리2 출력"},
"playSoundRetro":function(d){return "옛날 소리 출력"},
"playSoundRubber":function(d){return "고무 소리 출력"},
"playSoundSlap":function(d){return "찰싹 소리 출력"},
"playSoundTooltip":function(d){return "선택한 소리 출력"},
"playSoundWinPoint":function(d){return "득점 소리 출력"},
"playSoundWinPoint2":function(d){return "득점 소리2 출력"},
"playSoundWood":function(d){return "나무 소리 출력"},
"positionOutTopLeft":function(d){return "가장 위쪽의 왼쪽 위로"},
"positionOutTopRight":function(d){return "가장 위쪽의 오른쪽 위로"},
"positionTopOutLeft":function(d){return "왼쪽 바깥쪽의 가장 위로"},
"positionTopLeft":function(d){return "왼쪽의 가장 위로"},
"positionTopCenter":function(d){return "가운데의 가장 위로"},
"positionTopRight":function(d){return "오른쪽의 가장 위로"},
"positionTopOutRight":function(d){return "오른쪽 바깥쪽의 가장 위로"},
"positionMiddleLeft":function(d){return "왼쪽의 가운데로"},
"positionMiddleCenter":function(d){return "오른쪽의 가운데로"},
"positionMiddleRight":function(d){return "오른쪽의 가운데로"},
"positionBottomOutLeft":function(d){return "왼쪽 바깥쪽의 가장 아래쪽으로"},
"positionBottomLeft":function(d){return "왼쪽의 가장 아래쪽으로"},
"positionBottomCenter":function(d){return "가운데의 가장 아래쪽으로"},
"positionBottomRight":function(d){return "오른쪽의 가장 아래쪽으로"},
"positionBottomOutRight":function(d){return "오른쪽 바깥쪽의 가장 아래쪽으로"},
"positionOutBottomLeft":function(d){return "왼쪽 가장 아래쪽 아래로"},
"positionOutBottomRight":function(d){return "오른쪽 가장 아래쪽 아래로"},
"positionRandom":function(d){return "랜덤 위치로"},
"projectileBlueFireball":function(d){return "파란 파이어볼"},
"projectilePurpleFireball":function(d){return "분홍 파이어볼"},
"projectileRedFireball":function(d){return "빨간 파이어볼"},
"projectileYellowHearts":function(d){return "노란 하트"},
"projectilePurpleHearts":function(d){return "분홍 하트"},
"projectileRedHearts":function(d){return "빨간 하트"},
"projectileRandom":function(d){return "random(랜덤)"},
"projectileAnna":function(d){return "갈고리"},
"projectileElsa":function(d){return "광채"},
"projectileHiro":function(d){return "마이크로 봇"},
"projectileBaymax":function(d){return "로켓"},
"projectileRapunzel":function(d){return "냄비"},
"projectileCherry":function(d){return "체리"},
"projectileIce":function(d){return "얼음"},
"projectileDuck":function(d){return "오리"},
"reinfFeedbackMsg":function(d){return "\""+studio_locale.v(d,"backButton")+"\" 버튼을 눌러 이야기 진행을 할 수 있습니다."},
"repeatForever":function(d){return "무한반복"},
"repeatDo":function(d){return "do"},
"repeatForeverTooltip":function(d){return "이 블럭 안에 들어있는 동작들을 스토리가 실행되는 동안 무한히 반복시킵니다."},
"saySprite":function(d){return "말하기 동작"},
"saySpriteN":function(d){return "케릭터 "+studio_locale.v(d,"spriteIndex")+" 가 말 함"},
"saySpriteTooltip":function(d){return "지정한 케릭터가 말하는 말 풍선을 나타냅니다."},
"saySpriteChoices_0":function(d){return "여러분 안녕하세요."},
"saySpriteChoices_1":function(d){return "모두들 안녕하세요."},
"saySpriteChoices_2":function(d){return "잘지내?"},
"saySpriteChoices_3":function(d){return "좋은 아침이야."},
"saySpriteChoices_4":function(d){return "좋은 오후야."},
"saySpriteChoices_5":function(d){return "잘 자."},
"saySpriteChoices_6":function(d){return "안녕하세요. 좋은 저녁입니다."},
"saySpriteChoices_7":function(d){return "새로운 것 없나요?"},
"saySpriteChoices_8":function(d){return "뭐야?"},
"saySpriteChoices_9":function(d){return "왜?"},
"saySpriteChoices_10":function(d){return "언제?"},
"saySpriteChoices_11":function(d){return "좋아."},
"saySpriteChoices_12":function(d){return "멋져!"},
"saySpriteChoices_13":function(d){return "좋아."},
"saySpriteChoices_14":function(d){return "나쁘지 않아."},
"saySpriteChoices_15":function(d){return "행운을 빌어!"},
"saySpriteChoices_16":function(d){return "예"},
"saySpriteChoices_17":function(d){return "아니요"},
"saySpriteChoices_18":function(d){return "알겠어"},
"saySpriteChoices_19":function(d){return "잘 던졌어!"},
"saySpriteChoices_20":function(d){return "즐거운 하루 보내세요."},
"saySpriteChoices_21":function(d){return "안녕."},
"saySpriteChoices_22":function(d){return "금방 돌아올 께요."},
"saySpriteChoices_23":function(d){return "내일 봐!"},
"saySpriteChoices_24":function(d){return "다음에 또 봐!"},
"saySpriteChoices_25":function(d){return "잘 있어!"},
"saySpriteChoices_26":function(d){return "즐겨!"},
"saySpriteChoices_27":function(d){return "난 가야 해요."},
"saySpriteChoices_28":function(d){return "친구할까?"},
"saySpriteChoices_29":function(d){return "정말 잘했어!"},
"saySpriteChoices_30":function(d){return "우후!"},
"saySpriteChoices_31":function(d){return "야호!"},
"saySpriteChoices_32":function(d){return "만나서 반가워."},
"saySpriteChoices_33":function(d){return "좋아!"},
"saySpriteChoices_34":function(d){return "고마워"},
"saySpriteChoices_35":function(d){return "아냐, 괜찮아."},
"saySpriteChoices_36":function(d){return "아아아아!"},
"saySpriteChoices_37":function(d){return "괜찮아."},
"saySpriteChoices_38":function(d){return "오늘"},
"saySpriteChoices_39":function(d){return "내일"},
"saySpriteChoices_40":function(d){return "어제"},
"saySpriteChoices_41":function(d){return "여기 있었네!"},
"saySpriteChoices_42":function(d){return "나 여기 있어!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "너 대단해!"},
"saySpriteChoices_45":function(d){return "너 재밌네!"},
"saySpriteChoices_46":function(d){return "너 바보! "},
"saySpriteChoices_47":function(d){return "넌 좋은 친구야!"},
"saySpriteChoices_48":function(d){return "조심해!"},
"saySpriteChoices_49":function(d){return "피해!"},
"saySpriteChoices_50":function(d){return "잡았다!"},
"saySpriteChoices_51":function(d){return "아야!"},
"saySpriteChoices_52":function(d){return "미안!"},
"saySpriteChoices_53":function(d){return "조심해!"},
"saySpriteChoices_54":function(d){return "우와!"},
"saySpriteChoices_55":function(d){return "이크!"},
"saySpriteChoices_56":function(d){return "넌 거의 나를 잡았어!"},
"saySpriteChoices_57":function(d){return "멋진 시도였어!"},
"saySpriteChoices_58":function(d){return "넌 나를 잡을 수 없어!"},
"scoreText":function(d){return "점수 : "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "배경 설정"},
"setBackgroundRandom":function(d){return "랜덤 배경 설정"},
"setBackgroundBlack":function(d){return "검은 배경 설정"},
"setBackgroundCave":function(d){return "동굴 배경 설정"},
"setBackgroundCloudy":function(d){return "구름낀 배경 설정"},
"setBackgroundHardcourt":function(d){return "하드 코트 배경 설정"},
"setBackgroundNight":function(d){return "밤 배경 설정"},
"setBackgroundUnderwater":function(d){return "수중 배경 설정"},
"setBackgroundCity":function(d){return "도시 배경 설정"},
"setBackgroundDesert":function(d){return "사막 배경 설정"},
"setBackgroundRainbow":function(d){return "무지개 배경 설정"},
"setBackgroundSoccer":function(d){return "축구 배경 설정"},
"setBackgroundSpace":function(d){return "우주 배경 설정"},
"setBackgroundTennis":function(d){return "테니스 배경 설정"},
"setBackgroundWinter":function(d){return "겨울 배경 설정"},
"setBackgroundLeafy":function(d){return "나뭇잎 배경 설정"},
"setBackgroundGrassy":function(d){return "잔디 배경 설정"},
"setBackgroundFlower":function(d){return "꽃 배경 설정"},
"setBackgroundTile":function(d){return "타일 배경 설정"},
"setBackgroundIcy":function(d){return "얼음 배경 설정"},
"setBackgroundSnowy":function(d){return "눈 배경 설정"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "배경 이미지 설정"},
"setEnemySpeed":function(d){return "상대방 스피드 설정"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "플레이어 속도 설정"},
"setScoreText":function(d){return "점수 등록"},
"setScoreTextTooltip":function(d){return "점수 판에 문장이 출력되도록 합니다."},
"setSpriteEmotionAngry":function(d){return "화난 기분으로"},
"setSpriteEmotionHappy":function(d){return "즐거운 표정으로"},
"setSpriteEmotionNormal":function(d){return "보통 표정으로"},
"setSpriteEmotionRandom":function(d){return "랜덤 표정으로"},
"setSpriteEmotionSad":function(d){return "슬픈 표정으로"},
"setSpriteEmotionTooltip":function(d){return "케릭터의 표정을 설정합니다."},
"setSpriteAlien":function(d){return "외계인으로"},
"setSpriteBat":function(d){return "박쥐로"},
"setSpriteBird":function(d){return "새로"},
"setSpriteCat":function(d){return "고양이로"},
"setSpriteCaveBoy":function(d){return "원시소년으로"},
"setSpriteCaveGirl":function(d){return "원시소녀로"},
"setSpriteDinosaur":function(d){return "공룡으로"},
"setSpriteDog":function(d){return "강아지로"},
"setSpriteDragon":function(d){return "용으로"},
"setSpriteGhost":function(d){return "유령으로"},
"setSpriteHidden":function(d){return "안보이도록"},
"setSpriteHideK1":function(d){return "보이지 않게 하기"},
"setSpriteAnna":function(d){return "안나 이미지로"},
"setSpriteElsa":function(d){return "엘사 이미지로"},
"setSpriteHiro":function(d){return "히로 이미지로"},
"setSpriteBaymax":function(d){return "베이맥스 이미지로"},
"setSpriteRapunzel":function(d){return "라푼젤 이미지로"},
"setSpriteKnight":function(d){return "기사로"},
"setSpriteMonster":function(d){return "괴물로"},
"setSpriteNinja":function(d){return "닌자로"},
"setSpriteOctopus":function(d){return "문어로"},
"setSpritePenguin":function(d){return "펭귄으로"},
"setSpritePirate":function(d){return "해적으로"},
"setSpritePrincess":function(d){return "공주로"},
"setSpriteRandom":function(d){return "랜덤 케릭터로"},
"setSpriteRobot":function(d){return "로봇으로"},
"setSpriteShowK1":function(d){return "보이게 하기"},
"setSpriteSpacebot":function(d){return "우주로봇으로"},
"setSpriteSoccerGirl":function(d){return "축구소녀로"},
"setSpriteSoccerBoy":function(d){return "축구소년으로"},
"setSpriteSquirrel":function(d){return "다람쥐로"},
"setSpriteTennisGirl":function(d){return "테니스소녀로"},
"setSpriteTennisBoy":function(d){return "테니스소년으로"},
"setSpriteUnicorn":function(d){return "유니콘으로"},
"setSpriteWitch":function(d){return "마녀로"},
"setSpriteWizard":function(d){return "마법사로"},
"setSpritePositionTooltip":function(d){return "케릭터를 지정한 위치로 바로 점프 시킵니다."},
"setSpriteK1Tooltip":function(d){return "지정한 케릭터를 보이게 하거나 보이지 않게 합니다."},
"setSpriteTooltip":function(d){return "케릭터를 바꿉니다."},
"setSpriteSizeRandom":function(d){return "랜덤 크기로"},
"setSpriteSizeVerySmall":function(d){return "매우 작게"},
"setSpriteSizeSmall":function(d){return "작게"},
"setSpriteSizeNormal":function(d){return "보통 크기로"},
"setSpriteSizeLarge":function(d){return "크게"},
"setSpriteSizeVeryLarge":function(d){return "매우 크게"},
"setSpriteSizeTooltip":function(d){return "케릭터의 크기를 설정합니다."},
"setSpriteSpeedRandom":function(d){return "랜덤 속도로"},
"setSpriteSpeedVerySlow":function(d){return "매우 느리게"},
"setSpriteSpeedSlow":function(d){return "느리게"},
"setSpriteSpeedNormal":function(d){return "보통 속도로"},
"setSpriteSpeedFast":function(d){return "빠르게"},
"setSpriteSpeedVeryFast":function(d){return "매우 빠르게"},
"setSpriteSpeedTooltip":function(d){return "케릭터의 속도를 설정합니다."},
"setSpriteZombie":function(d){return "좀비로"},
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
"shareStudioTwitter":function(d){return "@codeorg 에서 만든 내 스토리를 살펴보세요."},
"shareGame":function(d){return "스토리 공유하기:"},
"showCoordinates":function(d){return "좌표 보이기"},
"showCoordinatesTooltip":function(d){return "화면의 중점 좌표 보이기"},
"showTitleScreen":function(d){return "제목 화면 보이기"},
"showTitleScreenTitle":function(d){return "제목화면 주제"},
"showTitleScreenText":function(d){return "문장"},
"showTSDefTitle":function(d){return "제목을 입력하세요"},
"showTSDefText":function(d){return "문장을 넣으세요."},
"showTitleScreenTooltip":function(d){return "제목과 내용을 보여주는 제목 스크린을 나타냅니다."},
"size":function(d){return "크기"},
"setSprite":function(d){return "set"},
"setSpriteN":function(d){return "캐릭터 설정 "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "부서짐 소리"},
"soundGoal1":function(d){return "득점 소리1"},
"soundGoal2":function(d){return "득점 소리2"},
"soundHit":function(d){return "때리는 소리"},
"soundLosePoint":function(d){return "실점 소리"},
"soundLosePoint2":function(d){return "실점 소리2"},
"soundRetro":function(d){return "옛날 소리"},
"soundRubber":function(d){return "고무 소리"},
"soundSlap":function(d){return "찰싹 소리"},
"soundWinPoint":function(d){return "득점 소리"},
"soundWinPoint2":function(d){return "득점 소리2"},
"soundWood":function(d){return "나무 소리"},
"speed":function(d){return "스피드"},
"startSetValue":function(d){return "시작 (함수)"},
"startSetVars":function(d){return "game_vars (제목, 자막, 배경, 목표, 위험, 플레이어)"},
"startSetFuncs":function(d){return "game_funcs (업데이트 대상, 업데이트 위험, 업데이트 플레이어, 충돌?, 화면?)"},
"stopSprite":function(d){return "멈춤"},
"stopSpriteN":function(d){return "캐릭터 "+studio_locale.v(d,"spriteIndex")+" 멈춤"},
"stopTooltip":function(d){return "케릭터의 움직임을 멈춤니다."},
"throwSprite":function(d){return "던지기"},
"throwSpriteN":function(d){return "케릭터 "+studio_locale.v(d,"spriteIndex")+" 던지기"},
"throwTooltip":function(d){return "지정한 케릭터에서 물건을 던집니다."},
"vanish":function(d){return "삭제하기"},
"vanishActorN":function(d){return "케릭터 "+studio_locale.v(d,"spriteIndex")+" 삭제하기"},
"vanishTooltip":function(d){return "케릭터를 삭제합니다."},
"waitFor":function(d){return "기다리기"},
"waitSeconds":function(d){return "~초 기다리기"},
"waitForClick":function(d){return "클릭 기다리기"},
"waitForRandom":function(d){return "랜덤 초 기다리기"},
"waitForHalfSecond":function(d){return "0.5초 기다리기"},
"waitFor1Second":function(d){return "1초 기다리기"},
"waitFor2Seconds":function(d){return "2초 기다리기"},
"waitFor5Seconds":function(d){return "5초 기다리기"},
"waitFor10Seconds":function(d){return "10초 기다리기"},
"waitParamsTooltip":function(d){return "원하는 초 만큼 기다립니다. 0초이면 클릭할 때까지 기다립니다."},
"waitTooltip":function(d){return "원하는 초만큼 기다리거나 클릭할 때까지 기다립니다."},
"whenArrowDown":function(d){return "아래쪽 방향키를 누르면"},
"whenArrowLeft":function(d){return "왼쪽 방향키를 누르면"},
"whenArrowRight":function(d){return "오른쪽 방향키를 누르면"},
"whenArrowUp":function(d){return "위쪽 방향키를 누르면"},
"whenArrowTooltip":function(d){return "지정된 방향키를 누르면 아래의 동작을 실행합니다."},
"whenDown":function(d){return "아래 방향키를 누르면"},
"whenDownTooltip":function(d){return "아래 방향키를 누르면 아래의 동작을 실행합니다."},
"whenGameStarts":function(d){return "스토리가 시작되면"},
"whenGameStartsTooltip":function(d){return "스토리가 시작되면 아래의 동작을 실행합니다."},
"whenLeft":function(d){return "왼쪽 방향키를 누르면"},
"whenLeftTooltip":function(d){return "왼쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"whenRight":function(d){return "오른쪽 방향키를 누르면"},
"whenRightTooltip":function(d){return "오른쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"whenSpriteClicked":function(d){return "케릭터를 클릭하면"},
"whenSpriteClickedN":function(d){return "케릭터 "+studio_locale.v(d,"spriteIndex")+" 가 클릭되면"},
"whenSpriteClickedTooltip":function(d){return "케릭터가 클릭되면 아래의 동작을 실행합니다."},
"whenSpriteCollidedN":function(d){return "캐릭터가 "+studio_locale.v(d,"spriteIndex")+"에 닿으면"},
"whenSpriteCollidedTooltip":function(d){return "케릭터가 다른 케릭터에 닿으면 아래의 동작을 실행합니다."},
"whenSpriteCollidedWith":function(d){return "닿으면"},
"whenSpriteCollidedWithAnyActor":function(d){return "다른 케릭터와 닿았을 때"},
"whenSpriteCollidedWithAnyEdge":function(d){return "벽에 닿았을 때"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "발사체와 닿았을 때"},
"whenSpriteCollidedWithAnything":function(d){return "다른 것과 닿았을 때"},
"whenSpriteCollidedWithN":function(d){return "케릭터가 "+studio_locale.v(d,"spriteIndex")+"에 닿으면"},
"whenSpriteCollidedWithBlueFireball":function(d){return "파란 파이어볼에 닿으면"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "분홍 파이어볼에 닿으면"},
"whenSpriteCollidedWithRedFireball":function(d){return "빨간 파이어볼에 닿으면"},
"whenSpriteCollidedWithYellowHearts":function(d){return "노란 파이어볼에 닿으면"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "분홍 하트에 닿으면"},
"whenSpriteCollidedWithRedHearts":function(d){return "빨강 하트에 닿으면"},
"whenSpriteCollidedWithBottomEdge":function(d){return "바닥에 닿으면"},
"whenSpriteCollidedWithLeftEdge":function(d){return "화면 왼쪽에 닿으면"},
"whenSpriteCollidedWithRightEdge":function(d){return "화면 오른쪽에 닿으면"},
"whenSpriteCollidedWithTopEdge":function(d){return "화면 천장에 닿으면"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "위쪽 방향키를 누르면"},
"whenUpTooltip":function(d){return "위쪽 방향키를 누르면 아래의 동작을 실행합니다."},
"yes":function(d){return "예"},
"failedHasSetSprite":function(d){return "Next time, set a character."},
"failedHasSetBotSpeed":function(d){return "Next time, set a bot speed."},
"failedTouchAllItems":function(d){return "Next time, get all the items."},
"failedScoreMinimum":function(d){return "Next time, reach the minimum score."},
"failedRemovedItemCount":function(d){return "Next time, get the right number of items."},
"failedSetActivity":function(d){return "Next time, set the correct character activity."},
"calloutPutCommandsHereRunStart":function(d){return "Put commands here to have them run when the program starts"},
"calloutClickEvents":function(d){return "Click on the events header to see event function blocks."},
"calloutUseArrowButtons":function(d){return "Hold down these buttons or the arrow keys on your keyboard to trigger the move events"},
"calloutRunButton":function(d){return "Add a moveRight command to your code and then click here to run it"},
"calloutShowCodeToggle":function(d){return "Click here to switch between block and text mode"},
"calloutShowPlaceGoUpHere":function(d){return "Place goUp command here to move up"},
"calloutShowPlaySound":function(d){return "It's your game, so you choose the sounds now. Try the dropdown to pick a different sound"},
"calloutInstructions":function(d){return "Don't know what to do? Click the instructions to see them again"},
"calloutPlaceTwo":function(d){return "Can you make two MOUSEs appear when you get a BIRD?"},
"calloutSetMapAndSpeed":function(d){return "Set the map and your speed."},
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
"loseMessage":function(d){return "You lose!"},
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
"failedFourItemsTimeout":function(d){return "To pass this level, you'll need to put goLeft, goRight, goUp and go Down into the right functions. If your code looks correct, but you can't get there fast enough, try pressing and holding the arrow keys on your keyboard (or screen)."},
"failedScoreTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedScoreScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot."},
"failedScoreGoals":function(d){return "You used the addPoints command, but not in the right place. Can you put it inside the whenGetPilot function so BOT1 can't get points until he gets a pilot?"},
"failedWinLoseTimeout":function(d){return "Try to reach all the pilots before time runs out. To move faster, press and hold the arrow keys on your keyboard (or screen)."},
"failedWinLoseScore":function(d){return "You got the pilots, but you still don't have enough points to pass the level. Use the addPoints command to add 100 points when you get a pilot. Use removePoints to subtract 100 when you touch a MAN. Avoid the MANs!"},
"failedWinLoseGoals":function(d){return "You used the addPoints command, but not in the right place. Can you make it so that the command is only called when you get the pilot? Also, remove points when you touch the MAN."},
"failedAddCharactersTimeout":function(d){return "Use three addCharacter commands at the top of your program to add PIGs when you hit run. Now go get them."},
"failedChainCharactersTimeout":function(d){return "You need to get 8 MOUSEs. They move fast. Try pressing and holding the keys on your keyboard (or screen) to chase them."},
"failedChainCharactersScore":function(d){return "You got the MOUSEs, but you don't have enough points to move to the next level. Can you add 100 points to your score every time you get a MOUSE? "},
"failedChainCharactersItems":function(d){return "You used the addPoints command, but not in the right place.  Can you make it so that the command is only called when you get the MOUSEs?"},
"failedChainCharacters2Timeout":function(d){return "You need to get 8 MOUSEs. Can you make two (or more) of them appear every time you get a ROO?"},
"failedChangeSettingTimeout":function(d){return "Get 3 pilots to move on."},
"failedChangeSettingSettings":function(d){return "Make the level your own. To pass this level, you need to change the map and set your speed."}};