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
"actor":function(d){return "nhân vật"},
"addCharacter":function(d){return "add a"},
"addCharacterTooltip":function(d){return "Add a character to the scene."},
"alienInvasion":function(d){return "Người ngoài hành tinh xâm lược!"},
"backgroundBlack":function(d){return "đen"},
"backgroundCave":function(d){return "hang động"},
"backgroundCloudy":function(d){return "có mây"},
"backgroundHardcourt":function(d){return "sân cứng"},
"backgroundNight":function(d){return "đêm"},
"backgroundUnderwater":function(d){return "dưới nước"},
"backgroundCity":function(d){return "thành phố"},
"backgroundDesert":function(d){return "sa mạc"},
"backgroundRainbow":function(d){return "cầu vồng"},
"backgroundSoccer":function(d){return "bóng đá"},
"backgroundSpace":function(d){return "vũ trụ"},
"backgroundTennis":function(d){return "quần vợt"},
"backgroundWinter":function(d){return "mùa đông"},
"calloutPlaceCommandsHere":function(d){return "Place commands here"},
"calloutPlaceCommandsAtTop":function(d){return "Place commands to set up your game at the top"},
"calloutTypeCommandsHere":function(d){return "Type your commands here"},
"calloutCharactersMove":function(d){return "These new commands let you control how the characters move"},
"calloutPutCommandsTouchCharacter":function(d){return "Put a command here to have it happen when you touch a character"},
"calloutClickCategory":function(d){return "Click a category header to see commands in each category"},
"calloutTryOutNewCommands":function(d){return "Try out all the new commands you’ve unlocked"},
"catActions":function(d){return "hành động"},
"catControl":function(d){return "Vòng lặp"},
"catEvents":function(d){return "Các sự kiện"},
"catLogic":function(d){return "Logic"},
"catMath":function(d){return "thuật toán"},
"catProcedures":function(d){return "Các hàm"},
"catText":function(d){return "văn bản"},
"catVariables":function(d){return "Các biến"},
"changeScoreTooltip":function(d){return "Thêm vào hoặc bớt đi một điểm từ số điểm đang có."},
"changeScoreTooltipK1":function(d){return "Thêm một điểm vào điểm số hiện có."},
"continue":function(d){return "Tiếp tục"},
"decrementPlayerScore":function(d){return "loại bớt đi điểm"},
"defaultSayText":function(d){return "gõ vào đây"},
"dropletBlock_addCharacter_description":function(d){return "Add a character to the scene."},
"dropletBlock_addCharacter_param0":function(d){return "type"},
"dropletBlock_addCharacter_param0_description":function(d){return "The type of the character to be added ('random', 'man', 'pilot', 'pig', 'bird', 'mouse', 'roo', or 'spider')."},
"dropletBlock_changeScore_description":function(d){return "Thêm vào hoặc bớt đi một điểm từ số điểm đang có."},
"dropletBlock_changeScore_param0":function(d){return "Ghi điểm/điểm số"},
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
"dropletBlock_playSound_description":function(d){return "Phát âm thanh đã chọn."},
"dropletBlock_playSound_param0":function(d){return "sound"},
"dropletBlock_playSound_param0_description":function(d){return "The name of the sound to play."},
"dropletBlock_setBackground_description":function(d){return "Thiết lập hình nền"},
"dropletBlock_setBackground_param0":function(d){return "image"},
"dropletBlock_setBackground_param0_description":function(d){return "The name of the background theme ('background1', 'background2', or 'background3')."},
"dropletBlock_setBot_description":function(d){return "Changes the active bot."},
"dropletBlock_setBot_param0":function(d){return "image"},
"dropletBlock_setBot_param0_description":function(d){return "The name of the bot image ('random', 'bot1', or 'bot2')."},
"dropletBlock_setBotSpeed_description":function(d){return "Sets the bot speed."},
"dropletBlock_setBotSpeed_param0":function(d){return "tốc độ"},
"dropletBlock_setBotSpeed_param0_description":function(d){return "The speed value ('random', 'slow', 'normal', or 'fast')."},
"dropletBlock_setSpriteEmotion_description":function(d){return "đặt tâm trạng nhân vật"},
"dropletBlock_setSpritePosition_description":function(d){return "Ngay lập tức di chuyển diễn viên đến vị trí chỉ định."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Cài đặt tốc độ của nhân vật"},
"dropletBlock_setSprite_description":function(d){return "Cài đặt hình ảnh của diễn viên"},
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
"dropletBlock_throw_description":function(d){return "Ném một viên đạn từ diễn viên được chỉ định."},
"dropletBlock_vanish_description":function(d){return "Biến mất của diễn viên."},
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
"emotion":function(d){return "tâm trạng/ tính tình"},
"finalLevel":function(d){return "Xin chúc mừng! Bạn đã hoàn thành câu đố cuối cùng."},
"for":function(d){return "cho"},
"hello":function(d){return "Xin chào"},
"helloWorld":function(d){return "Chào cả thế giới!"},
"incrementPlayerScore":function(d){return "điểm số ghi được"},
"itemBlueFireball":function(d){return "quả cầu lửa màu xanh"},
"itemPurpleFireball":function(d){return "quả cầu lửa màu tím"},
"itemRedFireball":function(d){return "quả cầu lửa màu đỏ"},
"itemYellowHearts":function(d){return "những trái tim màu vàng"},
"itemPurpleHearts":function(d){return "những trái tim màu tím"},
"itemRedHearts":function(d){return "những trái tim màu đỏ"},
"itemRandom":function(d){return "ngẫu nhiên"},
"itemAnna":function(d){return "móc"},
"itemElsa":function(d){return "lấp lánh"},
"itemHiro":function(d){return "microbots"},
"itemBaymax":function(d){return "tên lửa"},
"itemRapunzel":function(d){return "cái chảo"},
"itemCherry":function(d){return "trái anh đào"},
"itemIce":function(d){return "băng"},
"itemDuck":function(d){return "vịt"},
"itemMan":function(d){return "man"},
"itemPilot":function(d){return "pilot"},
"itemPig":function(d){return "pig"},
"itemBird":function(d){return "bird"},
"itemMouse":function(d){return "mouse"},
"itemRoo":function(d){return "roo"},
"itemSpider":function(d){return "spider"},
"makeProjectileDisappear":function(d){return "biến mất/ thoắt ẩn"},
"makeProjectileBounce":function(d){return "Dòng banh/ tung"},
"makeProjectileBlueFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu xanh nước biển"},
"makeProjectilePurpleFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu tím"},
"makeProjectileRedFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu đỏ"},
"makeProjectileYellowHearts":function(d){return "hãy làm cho trái tim thành màu vàng"},
"makeProjectilePurpleHearts":function(d){return "hãy làm cho trái tim thành màu tím"},
"makeProjectileRedHearts":function(d){return "hãy làm cho trái tim biến thành màu đỏ"},
"makeProjectileTooltip":function(d){return "Hãy làm cho viên đạn chỉ cần va chạm biến mất hoặc dội ngược trở lại."},
"makeYourOwn":function(d){return "Tạo ứng dụng trò chơi của riêng bạn"},
"moveDirectionDown":function(d){return "xuống"},
"moveDirectionLeft":function(d){return "trái/ bên trái"},
"moveDirectionRight":function(d){return "phải/ bên phải"},
"moveDirectionUp":function(d){return "trên/ lên"},
"moveDirectionRandom":function(d){return "ngẫu nhiên"},
"moveDistance25":function(d){return "25 pixels/ 25 điểm ảnh"},
"moveDistance50":function(d){return "50 pixels/ 50 điểm ảnh"},
"moveDistance100":function(d){return "100 pixels/ 100 điểm ảnh"},
"moveDistance200":function(d){return "200 pixels/ 200 điểm ảnh"},
"moveDistance400":function(d){return "400 pixels/ 400 điểm ảnh"},
"moveDistancePixels":function(d){return "các điểm ảnh"},
"moveDistanceRandom":function(d){return "điểm ảnh ngẫu nhiên"},
"moveDistanceTooltip":function(d){return "Di chuyển một diễn viên một khoảng cách cụ thể theo đúng hướng chỉ định."},
"moveSprite":function(d){return "di chuyển/ dịch chuyển"},
"moveSpriteN":function(d){return "di chuyển diễn viên "+studio_locale.v(d,"spriteIndex")},
"toXY":function(d){return "đến x,y"},
"moveDown":function(d){return "di chuyển xuống"},
"moveDownTooltip":function(d){return "Di chuyển một diễn viên xuống."},
"moveLeft":function(d){return "qua trái"},
"moveLeftTooltip":function(d){return "Di chuyển một diễn viên sang bên trái."},
"moveRight":function(d){return "qua phải"},
"moveRightTooltip":function(d){return "Di chuyển một diễn viên sang bên phải."},
"moveUp":function(d){return "di chuyển lên"},
"moveUpTooltip":function(d){return "Di chuyển một diễn viên lên trên."},
"moveTooltip":function(d){return "Di chuyển một diễn viên."},
"nextLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố này."},
"no":function(d){return "Không"},
"numBlocksNeeded":function(d){return "Câu đố này có thể được giải quyết chỉ với %1 khối."},
"onEventTooltip":function(d){return "Chạy mã tương ứng với các sự kiện được chỉ định."},
"ouchExclamation":function(d){return "Á!"},
"playSoundCrunch":function(d){return "phát tiếng nhai"},
"playSoundGoal1":function(d){return "phát âm thanh ghi bàn 1"},
"playSoundGoal2":function(d){return "phát âm thanh ghi bàn 2"},
"playSoundHit":function(d){return "phát âm thanh va chạm"},
"playSoundLosePoint":function(d){return "phát âm thanh mất điểm"},
"playSoundLosePoint2":function(d){return "phát âm thanh mất điểm 2"},
"playSoundRetro":function(d){return "phát âm thanh retro"},
"playSoundRubber":function(d){return "phát âm thanh cao su"},
"playSoundSlap":function(d){return "phát âm thanh slap"},
"playSoundTooltip":function(d){return "Phát âm thanh đã chọn."},
"playSoundWinPoint":function(d){return "phát âm thanh thắng 1 điểm"},
"playSoundWinPoint2":function(d){return "phát âm thanh thắng 2 điểm"},
"playSoundWood":function(d){return "phát âm thanh gỗ"},
"positionOutTopLeft":function(d){return "đến vị trí ở đầu phía trên bên trái"},
"positionOutTopRight":function(d){return "đến vị trí ở đầu trên phía bên phải"},
"positionTopOutLeft":function(d){return "đến vị trí ở bên ngoài phía bên trái"},
"positionTopLeft":function(d){return "đến vị trí ở trên phía bên trái"},
"positionTopCenter":function(d){return "đến vị trí ở trên chính giữa"},
"positionTopRight":function(d){return "đến vị trí ở trên phía bên phải"},
"positionTopOutRight":function(d){return "đến vị trí ở bên ngoài phía trên trái"},
"positionMiddleLeft":function(d){return "đến vị trí chính giữa/ trung gian bên trái"},
"positionMiddleCenter":function(d){return "đến vị trí chính giữa trung tâm"},
"positionMiddleRight":function(d){return "đến vị trí chính giữa phía bên phải"},
"positionBottomOutLeft":function(d){return "xuống dưới bên ngoài vị trí bên trái"},
"positionBottomLeft":function(d){return "tới vị trí cuối bên trái"},
"positionBottomCenter":function(d){return "tới vị trí cuối ở trung tâm"},
"positionBottomRight":function(d){return "tới vị trí cuối bên phải"},
"positionBottomOutRight":function(d){return "tới vị trí dưới cùng bên phải ra ngoài"},
"positionOutBottomLeft":function(d){return "tới vị trí dưới cùng bên trái"},
"positionOutBottomRight":function(d){return "tới vị trí bên dưới cùng bên phải"},
"positionRandom":function(d){return "tới vị trí ngẫu nhiên"},
"projectileBlueFireball":function(d){return "quả cầu lửa màu xanh"},
"projectilePurpleFireball":function(d){return "quả cầu lửa màu tím"},
"projectileRedFireball":function(d){return "quả cầu lửa màu đỏ"},
"projectileYellowHearts":function(d){return "những trái tim màu vàng"},
"projectilePurpleHearts":function(d){return "những trái tim màu tím"},
"projectileRedHearts":function(d){return "những trái tim màu đỏ"},
"projectileRandom":function(d){return "ngẫu nhiên"},
"projectileAnna":function(d){return "móc"},
"projectileElsa":function(d){return "lấp lánh"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "tên lửa"},
"projectileRapunzel":function(d){return "cái chảo"},
"projectileCherry":function(d){return "trái anh đào"},
"projectileIce":function(d){return "băng"},
"projectileDuck":function(d){return "vịt"},
"reinfFeedbackMsg":function(d){return "Bạn có thể bấm nút \""+studio_locale.v(d,"backButton")+"\" để quay trở lại chơi câu chuyện của bạn."},
"repeatForever":function(d){return "lặp lại mãi mãi"},
"repeatDo":function(d){return "thực hiện"},
"repeatForeverTooltip":function(d){return "Thực hiện các hành động trong khối này nhiều lần trong khi câu chuyện đang chạy."},
"saySprite":function(d){return "nói"},
"saySpriteN":function(d){return "diễn viên "+studio_locale.v(d,"spriteIndex")+" nói"},
"saySpriteTooltip":function(d){return "Bật lên bong bóng lời nói với các văn từ liên quan từ người diễn viên được chỉ định."},
"saySpriteChoices_0":function(d){return "Chào bạn."},
"saySpriteChoices_1":function(d){return "Chào mọi người."},
"saySpriteChoices_2":function(d){return "Bạn có khoẻ không?"},
"saySpriteChoices_3":function(d){return "Chào Buổi Sáng"},
"saySpriteChoices_4":function(d){return "Chào Buổi Chiều"},
"saySpriteChoices_5":function(d){return "Chúc ngủ ngon"},
"saySpriteChoices_6":function(d){return "Chào Buổi Tối"},
"saySpriteChoices_7":function(d){return "Có gì mới không?"},
"saySpriteChoices_8":function(d){return "Cái gì?"},
"saySpriteChoices_9":function(d){return "Ở đâu?"},
"saySpriteChoices_10":function(d){return "Khi nào?"},
"saySpriteChoices_11":function(d){return "Tốt."},
"saySpriteChoices_12":function(d){return "Tuyệt!"},
"saySpriteChoices_13":function(d){return "Được."},
"saySpriteChoices_14":function(d){return "Không tồi."},
"saySpriteChoices_15":function(d){return "Chúc May mắn."},
"saySpriteChoices_16":function(d){return "Đồng ý"},
"saySpriteChoices_17":function(d){return "Không"},
"saySpriteChoices_18":function(d){return "Đồng ý"},
"saySpriteChoices_19":function(d){return "Ném tốt đấy!"},
"saySpriteChoices_20":function(d){return "Chúc một ngày tốt lành."},
"saySpriteChoices_21":function(d){return "Tạm biệt."},
"saySpriteChoices_22":function(d){return "Tôi sẽ trở lại ngay."},
"saySpriteChoices_23":function(d){return "Hẹn gặp lại bạn vào ngày mai!"},
"saySpriteChoices_24":function(d){return "Hẹn gặp lại bạn!"},
"saySpriteChoices_25":function(d){return "Hãy bảo trọng!"},
"saySpriteChoices_26":function(d){return "Chúc bạn vui vẻ!"},
"saySpriteChoices_27":function(d){return "Tôi phải đi."},
"saySpriteChoices_28":function(d){return "Bạn muốn kết bạn?"},
"saySpriteChoices_29":function(d){return "Tuyệt!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Rất vui được gặp bạn."},
"saySpriteChoices_33":function(d){return "Đúng rồi!"},
"saySpriteChoices_34":function(d){return "Cảm ơn bạn"},
"saySpriteChoices_35":function(d){return "Không, cảm ơn bạn"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Đừng bận tâm"},
"saySpriteChoices_38":function(d){return "Hôm nay"},
"saySpriteChoices_39":function(d){return "Ngày mai"},
"saySpriteChoices_40":function(d){return "Hôm qua"},
"saySpriteChoices_41":function(d){return "Tôi tìm thấy bạn!"},
"saySpriteChoices_42":function(d){return "Bạn tìm thấy tôi rồi!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "Bạn tuyệt thật!"},
"saySpriteChoices_45":function(d){return "Bạn thật vui tính!"},
"saySpriteChoices_46":function(d){return "Bạn thiệt ngớ ngẩn!"},
"saySpriteChoices_47":function(d){return "Bạn là một người bạn tốt!"},
"saySpriteChoices_48":function(d){return "Coi chừng!"},
"saySpriteChoices_49":function(d){return "Tránh né nhé!"},
"saySpriteChoices_50":function(d){return "Bắt được bạn nhé!"},
"saySpriteChoices_51":function(d){return "Ui!"},
"saySpriteChoices_52":function(d){return "Xin lỗi!"},
"saySpriteChoices_53":function(d){return "Cẩn thận!"},
"saySpriteChoices_54":function(d){return "Ồ!"},
"saySpriteChoices_55":function(d){return "Ôi!"},
"saySpriteChoices_56":function(d){return "Bạn suýt nữa bắt được tôi!"},
"saySpriteChoices_57":function(d){return "Có cố gắng!"},
"saySpriteChoices_58":function(d){return "Bạn không thể bắt được tôi!"},
"scoreText":function(d){return "Điểm: "+studio_locale.v(d,"playerScore")},
"setActivityRandom":function(d){return "set activity to random for"},
"setActivityRoam":function(d){return "set activity to roam for"},
"setActivityChase":function(d){return "set activity to chase for"},
"setActivityFlee":function(d){return "set activity to flee for"},
"setActivityNone":function(d){return "set activity to none for"},
"setActivityTooltip":function(d){return "Sets the activity for a set of items"},
"setBackground":function(d){return "cài đặt hình nền"},
"setBackgroundRandom":function(d){return "cài đặt hình nền ngẫu nhiên"},
"setBackgroundBlack":function(d){return "cài đặt hình nền màu đen"},
"setBackgroundCave":function(d){return "cài đặt hình nền hình hang động"},
"setBackgroundCloudy":function(d){return "cài đặt hình nền đám mây"},
"setBackgroundHardcourt":function(d){return "thiết lập số nền"},
"setBackgroundNight":function(d){return "cài đặt hình nền ban đêm"},
"setBackgroundUnderwater":function(d){return "cài đặt hình nền dưới nước"},
"setBackgroundCity":function(d){return "cài đặt hình nền hình thành phố"},
"setBackgroundDesert":function(d){return "thiết lập nền sa mạc"},
"setBackgroundRainbow":function(d){return "thiết lập nền cầu vồng"},
"setBackgroundSoccer":function(d){return "cài đặt hình nền bóng đá"},
"setBackgroundSpace":function(d){return "cài đặt hình nền không gian"},
"setBackgroundTennis":function(d){return "cài đặt hình nền tennis"},
"setBackgroundWinter":function(d){return "cài đặt hình nền mùa đông"},
"setBackgroundLeafy":function(d){return "cài đặt hình nền kiểu lá"},
"setBackgroundGrassy":function(d){return "cài đặt hình nền kiểu cỏ"},
"setBackgroundFlower":function(d){return "cài đặt hình nền kiểu hoa"},
"setBackgroundTile":function(d){return "cài đặt hình nền gạch"},
"setBackgroundIcy":function(d){return "cài đặt hình nền băng đá"},
"setBackgroundSnowy":function(d){return "cài đặt hình nền tuyết"},
"setBackgroundForest":function(d){return "set forest background"},
"setBackgroundSnow":function(d){return "set snow background"},
"setBackgroundShip":function(d){return "set ship background"},
"setBackgroundTooltip":function(d){return "Thiết lập hình nền"},
"setEnemySpeed":function(d){return "thiết lập tốc độ đối phương"},
"setItemSpeedSet":function(d){return "set type"},
"setItemSpeedTooltip":function(d){return "Sets the speed for a set of items"},
"setPlayerSpeed":function(d){return "thiết lập tốc độ cầu thủ"},
"setScoreText":function(d){return "thiết lập điểm"},
"setScoreTextTooltip":function(d){return "Bộ văn bản sẽ được hiển thị trong khu vực ghi điểm."},
"setSpriteEmotionAngry":function(d){return "để mặt giận"},
"setSpriteEmotionHappy":function(d){return "để mặt cười"},
"setSpriteEmotionNormal":function(d){return "để mặt bình thường"},
"setSpriteEmotionRandom":function(d){return "để tâm trạng ngẫu nhiên"},
"setSpriteEmotionSad":function(d){return "để mặt buồn"},
"setSpriteEmotionTooltip":function(d){return "đặt tâm trạng nhân vật"},
"setSpriteAlien":function(d){return "để một hình ảnh người nước ngoài"},
"setSpriteBat":function(d){return "với hình ảnh con dơi"},
"setSpriteBird":function(d){return "với hình ảnh con chim"},
"setSpriteCat":function(d){return "với hình ảnh con mèo"},
"setSpriteCaveBoy":function(d){return "để hình ảnh cậu bé tiền sử"},
"setSpriteCaveGirl":function(d){return "để hình ảnh cô bé tiền sử (Jasmine)"},
"setSpriteDinosaur":function(d){return "với hình ảnh khủng long"},
"setSpriteDog":function(d){return "với hình ảnh con chó"},
"setSpriteDragon":function(d){return "với hình ảnh con rồng"},
"setSpriteGhost":function(d){return "với hình ảnh ma"},
"setSpriteHidden":function(d){return "với hình ảnh ẩn"},
"setSpriteHideK1":function(d){return "ẩn"},
"setSpriteAnna":function(d){return "để một hình ảnh của Anna"},
"setSpriteElsa":function(d){return "sang một bức ảnh của Elsa"},
"setSpriteHiro":function(d){return "sang một bức ảnh của Hiro"},
"setSpriteBaymax":function(d){return "sang một bức ảnh của Baymax"},
"setSpriteRapunzel":function(d){return "sang một bức ảnh của Rapunzel"},
"setSpriteKnight":function(d){return "sang một bức ảnh kị sĩ"},
"setSpriteMonster":function(d){return "sang một bức ảnh quái vật"},
"setSpriteNinja":function(d){return "sang một bức ảnh mặt nạ ninja"},
"setSpriteOctopus":function(d){return "sang một bức ảnh hình bạch tuộc"},
"setSpritePenguin":function(d){return "sang một bức ảnh hình chim cánh cụt (Waddles)"},
"setSpritePirate":function(d){return "sang một bức ảnh hình hải tặc"},
"setSpritePrincess":function(d){return "sang một bức ảnh hình công chúa"},
"setSpriteRandom":function(d){return "sang một bức ảnh ngẫu nhiên"},
"setSpriteRobot":function(d){return "sang một bức ảnh hình robot (Spiff)"},
"setSpriteShowK1":function(d){return "hiển thị"},
"setSpriteSpacebot":function(d){return "sang một bức ảnh robot không gian"},
"setSpriteSoccerGirl":function(d){return "sang hình cô gái đá bóng"},
"setSpriteSoccerBoy":function(d){return "sang hình cậu bé đá bóng"},
"setSpriteSquirrel":function(d){return "sang hình chú sóc"},
"setSpriteTennisGirl":function(d){return "sang hình cô gái đánh quần vợt"},
"setSpriteTennisBoy":function(d){return "sang hình cậu bé đánh quần vợt"},
"setSpriteUnicorn":function(d){return "sang hình con kỳ lân"},
"setSpriteWitch":function(d){return "sang hình phù thủy"},
"setSpriteWizard":function(d){return "sang hình thuật sĩ"},
"setSpritePositionTooltip":function(d){return "Ngay lập tức di chuyển diễn viên đến vị trí chỉ định."},
"setSpriteK1Tooltip":function(d){return "Hiển thị hoặc ẩn diễn viên được chỉ định."},
"setSpriteTooltip":function(d){return "Cài đặt hình ảnh của diễn viên"},
"setSpriteSizeRandom":function(d){return "sang một kích thước ngẫu nhiên"},
"setSpriteSizeVerySmall":function(d){return "sang một kích thước rất nhỏ"},
"setSpriteSizeSmall":function(d){return "sang kích thước nhỏ"},
"setSpriteSizeNormal":function(d){return "sang kích thước thông thường"},
"setSpriteSizeLarge":function(d){return "sang kích thước lớn"},
"setSpriteSizeVeryLarge":function(d){return "sang kích thước rất lớn"},
"setSpriteSizeTooltip":function(d){return "Cài đặt kích thước của nhân vật"},
"setSpriteSpeedRandom":function(d){return "sang một tốc độ ngẫu nhiên"},
"setSpriteSpeedVerySlow":function(d){return "sang một tốc độ rất chậm"},
"setSpriteSpeedSlow":function(d){return "sang tốc độ chậm"},
"setSpriteSpeedNormal":function(d){return "sang tốc độ bình thường"},
"setSpriteSpeedFast":function(d){return "sang tốc độ nhanh"},
"setSpriteSpeedVeryFast":function(d){return "sang tốc độ rất nhanh"},
"setSpriteSpeedTooltip":function(d){return "Cài đặt tốc độ của nhân vật"},
"setSpriteZombie":function(d){return "sang hình ảnh của thây ma"},
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
"shareStudioTwitter":function(d){return "Hãy xem ứng dụng tôi vừa tạo. Tôi tự viết nó với @codeorg"},
"shareGame":function(d){return "Chia sẻ câu chuyện của bạn:"},
"showCoordinates":function(d){return "hiển thị tọa độ"},
"showCoordinatesTooltip":function(d){return "hiển thị tọa độ của nhân vật chính trên màn hình"},
"showTitleScreen":function(d){return "hiển thị tiêu đề màn hình"},
"showTitleScreenTitle":function(d){return "tiêu đề"},
"showTitleScreenText":function(d){return "văn bản"},
"showTSDefTitle":function(d){return "gõ tiêu đề vào đây"},
"showTSDefText":function(d){return "gõ văn bản vào đây"},
"showTitleScreenTooltip":function(d){return "Hiển thịt màn hình tiêu đề với liên kết tiêu đề và văn bản."},
"size":function(d){return "kích thước"},
"setSprite":function(d){return "thiết lập"},
"setSpriteN":function(d){return "thiết lập diễn viên "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "khủng hoảng"},
"soundGoal1":function(d){return "mục tiêu 1"},
"soundGoal2":function(d){return "mục tiêu 2"},
"soundHit":function(d){return "nhấn"},
"soundLosePoint":function(d){return "mất điểm"},
"soundLosePoint2":function(d){return "mất điểm 2"},
"soundRetro":function(d){return "hoài niệm"},
"soundRubber":function(d){return "cục gôm"},
"soundSlap":function(d){return "vỗ"},
"soundWinPoint":function(d){return "giành điểm"},
"soundWinPoint2":function(d){return "giành điểm 2"},
"soundWood":function(d){return "gỗ"},
"speed":function(d){return "tốc độ"},
"startSetValue":function(d){return "bắt đầu (chức năng)"},
"startSetVars":function(d){return "trò chơi_những biến (tiêu đề, phụ đề, nền, mục tiêu, nguy hiểm, cầu thủ)"},
"startSetFuncs":function(d){return "trò chơi_những chức năng (Cập Nhật-mục tiêu, nguy hiểm Cập Nhật, bản Cập Nhật-cầu thủ, va chạm?, trên màn hình?)"},
"stopSprite":function(d){return "dừng"},
"stopSpriteN":function(d){return "dừng diễn viên "+studio_locale.v(d,"spriteIndex")},
"stopTooltip":function(d){return "Ngừng chuyển động của diễn viên."},
"throwSprite":function(d){return "ném"},
"throwSpriteN":function(d){return "diễn viên "+studio_locale.v(d,"spriteIndex")+" ném"},
"throwTooltip":function(d){return "Ném một viên đạn từ diễn viên được chỉ định."},
"vanish":function(d){return "biến mất"},
"vanishActorN":function(d){return "tan biến diễn viên "+studio_locale.v(d,"spriteIndex")},
"vanishTooltip":function(d){return "Biến mất của diễn viên."},
"waitFor":function(d){return "chờ đợi cho"},
"waitSeconds":function(d){return "vài giây"},
"waitForClick":function(d){return "chờ đợi cho nhấp chuột"},
"waitForRandom":function(d){return "chờ đợi ngẫu nhiên"},
"waitForHalfSecond":function(d){return "chờ một nửa giây"},
"waitFor1Second":function(d){return "chờ 1 giây"},
"waitFor2Seconds":function(d){return "chờ đợi trong 2 giây"},
"waitFor5Seconds":function(d){return "chờ đợi trong 5 giây"},
"waitFor10Seconds":function(d){return "chờ đợi trong 10 giây"},
"waitParamsTooltip":function(d){return "Chờ theo số giây được quy định hoặc sử dụng số 0 để chờ đợi cho đến khi một nhấp chuột xảy ra."},
"waitTooltip":function(d){return "Chờ theo số thời gian được quy định hoặc cho đến khi một nhấp chuột xảy ra."},
"whenArrowDown":function(d){return "mũi tên xuống dưới"},
"whenArrowLeft":function(d){return "mũi tên bên trái"},
"whenArrowRight":function(d){return "mũi tên bên phải"},
"whenArrowUp":function(d){return "mũi tên lên trên"},
"whenArrowTooltip":function(d){return "Thực hiện các hành động dưới đây khi nhấn các phím mũi tên được chỉ định."},
"whenDown":function(d){return "Khi mũi tên chỉ xuống"},
"whenDownTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ xuống bật."},
"whenGameStarts":function(d){return "khi câu chuyện bắt đầu"},
"whenGameStartsTooltip":function(d){return "Thực hiện các hành động dưới đây khi câu chuyện bắt đầu."},
"whenLeft":function(d){return "Khi mũi tên chỉ bên trái"},
"whenLeftTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ bên trái bật."},
"whenRight":function(d){return "Khi mũi tên chỉ bên phải"},
"whenRightTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ bên phải bật."},
"whenSpriteClicked":function(d){return "khi diễn viên được nhấp"},
"whenSpriteClickedN":function(d){return "khi diễn viên "+studio_locale.v(d,"spriteIndex")+" được nhấp"},
"whenSpriteClickedTooltip":function(d){return "Thực hiện các hành động dưới đây khi một diễn viên được nhấp."},
"whenSpriteCollidedN":function(d){return "khi diễn viên "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedTooltip":function(d){return "Thực hiện các hành động dưới đây khi một diễn viên chạm một diễn viên khác."},
"whenSpriteCollidedWith":function(d){return "chạm"},
"whenSpriteCollidedWithAnyActor":function(d){return "chạm vào bất kì nhân vật nào"},
"whenSpriteCollidedWithAnyEdge":function(d){return "chạm vào bất kì cạnh/góc nào"},
"whenSpriteCollidedWithAnyProjectile":function(d){return "chạm vào bất kì viên đạn nào"},
"whenSpriteCollidedWithAnything":function(d){return "chạm vào bất cứ thứ gì"},
"whenSpriteCollidedWithN":function(d){return "chạm vào nhân vật "+studio_locale.v(d,"spriteIndex")},
"whenSpriteCollidedWithBlueFireball":function(d){return "chạm vào quả cầu lửa màu xanh"},
"whenSpriteCollidedWithPurpleFireball":function(d){return "chạm vào quả cầu lửa màu tím"},
"whenSpriteCollidedWithRedFireball":function(d){return "chạm vào quả cầu lửa màu đỏ"},
"whenSpriteCollidedWithYellowHearts":function(d){return "chạm vào quả cầu lửa màu vàng"},
"whenSpriteCollidedWithPurpleHearts":function(d){return "chạm vào những trái tim màu tím"},
"whenSpriteCollidedWithRedHearts":function(d){return "chạm vào những trái tim màu đỏ"},
"whenSpriteCollidedWithBottomEdge":function(d){return "chạm vào mép dưới"},
"whenSpriteCollidedWithLeftEdge":function(d){return "chạm vào góc trái"},
"whenSpriteCollidedWithRightEdge":function(d){return "chạm vào góc phải"},
"whenSpriteCollidedWithTopEdge":function(d){return "chạm vào mép trên"},
"whenTouchItem":function(d){return "when item touched"},
"whenTouchItemTooltip":function(d){return "Execute the actions below when the actor touches an item."},
"whenTouchWall":function(d){return "when wall touched"},
"whenTouchWallTooltip":function(d){return "Execute the actions below when the actor touches a wall."},
"whenUp":function(d){return "Khi mũi tên chỉ lên trên"},
"whenUpTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ lên bật."},
"yes":function(d){return "Đồng ý"},
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