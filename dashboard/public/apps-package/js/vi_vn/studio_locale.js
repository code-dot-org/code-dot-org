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
v:function(d,k){studio_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:(k=studio_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){studio_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).studio_locale = {
"actor":function(d){return "diễn viên"},
"alienInvasion":function(d){return "Alien Invasion!"},
"backgroundBlack":function(d){return "black"},
"backgroundCave":function(d){return "cave"},
"backgroundCloudy":function(d){return "cloudy"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "night"},
"backgroundUnderwater":function(d){return "underwater"},
"backgroundCity":function(d){return "city"},
"backgroundDesert":function(d){return "desert"},
"backgroundRainbow":function(d){return "rainbow"},
"backgroundSoccer":function(d){return "soccer"},
"backgroundSpace":function(d){return "space"},
"backgroundTennis":function(d){return "tennis"},
"backgroundWinter":function(d){return "winter"},
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
"emotion":function(d){return "tâm trạng/ tính tình"},
"finalLevel":function(d){return "Xin chúc mừng! Bạn đã hoàn thành câu đố cuối cùng."},
"for":function(d){return "for"},
"hello":function(d){return "Xin chào"},
"helloWorld":function(d){return "Chào cả thế giới!"},
"incrementPlayerScore":function(d){return "điểm số ghi được"},
"makeProjectileDisappear":function(d){return "biến mất/ thoắt ẩn"},
"makeProjectileBounce":function(d){return "Dòng banh/ tung"},
"makeProjectileBlueFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu xanh nước biển"},
"makeProjectilePurpleFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu tím"},
"makeProjectileRedFireball":function(d){return "hãy làm cho quả cầu lửa biến thành màu đỏ"},
"makeProjectileYellowHearts":function(d){return "hãy làm cho trái tim thành màu vàng"},
"makeProjectilePurpleHearts":function(d){return "hãy làm cho trái tim thành màu tím"},
"makeProjectileRedHearts":function(d){return "hãy làm cho trái tim biến thành màu đỏ"},
"makeProjectileTooltip":function(d){return "Hãy làm cho viên đạn chỉ cần va chạm biến mất hoặc dội ngược trở lại."},
"makeYourOwn":function(d){return "Make Your Own Play Lab App"},
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
"toXY":function(d){return "to x,y"},
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
"onEventTooltip":function(d){return "Execute code in response to the specified event."},
"ouchExclamation":function(d){return "ộp!"},
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
"positionOutTopLeft":function(d){return "đến vị trí ở đầu trên phía bên trái"},
"positionOutTopRight":function(d){return "đến vị trí ở đầu trên phía bên phải"},
"positionTopOutLeft":function(d){return "đến vị trí ở bên ngoài phía bên trái"},
"positionTopLeft":function(d){return "đến vị trí ở trên phía bên trái"},
"positionTopCenter":function(d){return "đến vị trí ở trên chính giữa"},
"positionTopRight":function(d){return "đến vị trí ở trên phía bên phải"},
"positionTopOutRight":function(d){return "đến vị trí ở bên ngoài phía trên trái"},
"positionMiddleLeft":function(d){return "đến vị trí chính giữa/ trung gian bên trái"},
"positionMiddleCenter":function(d){return "đến vị trí chính giữa trung tâm"},
"positionMiddleRight":function(d){return "đến vị trí chính giữa phía bên phải"},
"positionBottomOutLeft":function(d){return "to the bottom outside left position"},
"positionBottomLeft":function(d){return "to the bottom left position"},
"positionBottomCenter":function(d){return "to the bottom center position"},
"positionBottomRight":function(d){return "to the bottom right position"},
"positionBottomOutRight":function(d){return "to the bottom outside right position"},
"positionOutBottomLeft":function(d){return "to the below bottom left position"},
"positionOutBottomRight":function(d){return "to the below bottom right position"},
"positionRandom":function(d){return "to the random position"},
"projectileBlueFireball":function(d){return "blue fireball"},
"projectilePurpleFireball":function(d){return "purple fireball"},
"projectileRedFireball":function(d){return "red fireball"},
"projectileYellowHearts":function(d){return "yellow hearts"},
"projectilePurpleHearts":function(d){return "purple hearts"},
"projectileRedHearts":function(d){return "red hearts"},
"projectileRandom":function(d){return "ngẫu nhiên"},
"projectileAnna":function(d){return "Anna"},
"projectileElsa":function(d){return "Elsa"},
"projectileHiro":function(d){return "Hiro"},
"projectileBaymax":function(d){return "Baymax"},
"projectileRapunzel":function(d){return "Rapunzel"},
"projectileCherry":function(d){return "cherry"},
"projectileIce":function(d){return "ice"},
"projectileDuck":function(d){return "duck"},
"reinfFeedbackMsg":function(d){return "Bạn có thể bấm nút \"Thử lại\" để chơi lại."},
"repeatForever":function(d){return "Lặp lại mãi mãi"},
"repeatDo":function(d){return "thực hiện"},
"repeatForeverTooltip":function(d){return "Execute the actions in this block repeatedly while the story is running."},
"saySprite":function(d){return "nói"},
"saySpriteN":function(d){return "actor "+studio_locale.v(d,"spriteIndex")+" say"},
"saySpriteTooltip":function(d){return "Pop up a speech bubble with the associated text from the specified actor."},
"saySpriteChoices_0":function(d){return "Hi there."},
"saySpriteChoices_1":function(d){return "Hi there!"},
"saySpriteChoices_2":function(d){return "How are you?"},
"saySpriteChoices_3":function(d){return "This is fun..."},
"saySpriteChoices_4":function(d){return "Good afternoon"},
"saySpriteChoices_5":function(d){return "Good night"},
"saySpriteChoices_6":function(d){return "Good evening"},
"saySpriteChoices_7":function(d){return "What’s new?"},
"saySpriteChoices_8":function(d){return "What?"},
"saySpriteChoices_9":function(d){return "Where?"},
"saySpriteChoices_10":function(d){return "When?"},
"saySpriteChoices_11":function(d){return "Good."},
"saySpriteChoices_12":function(d){return "Great!"},
"saySpriteChoices_13":function(d){return "All right."},
"saySpriteChoices_14":function(d){return "Not bad."},
"saySpriteChoices_15":function(d){return "Good luck."},
"saySpriteChoices_16":function(d){return "Đồng ý"},
"saySpriteChoices_17":function(d){return "Không"},
"saySpriteChoices_18":function(d){return "Okay"},
"saySpriteChoices_19":function(d){return "Nice throw!"},
"saySpriteChoices_20":function(d){return "Have a nice day."},
"saySpriteChoices_21":function(d){return "Bye."},
"saySpriteChoices_22":function(d){return "I’ll be right back."},
"saySpriteChoices_23":function(d){return "See you tomorrow!"},
"saySpriteChoices_24":function(d){return "See you later!"},
"saySpriteChoices_25":function(d){return "Take care!"},
"saySpriteChoices_26":function(d){return "Enjoy!"},
"saySpriteChoices_27":function(d){return "I have to go."},
"saySpriteChoices_28":function(d){return "Want to be friends?"},
"saySpriteChoices_29":function(d){return "Great job!"},
"saySpriteChoices_30":function(d){return "Woo hoo!"},
"saySpriteChoices_31":function(d){return "Yay!"},
"saySpriteChoices_32":function(d){return "Nice to meet you."},
"saySpriteChoices_33":function(d){return "All right!"},
"saySpriteChoices_34":function(d){return "Thank you"},
"saySpriteChoices_35":function(d){return "No, thank you"},
"saySpriteChoices_36":function(d){return "Aaaaaah!"},
"saySpriteChoices_37":function(d){return "Never mind"},
"saySpriteChoices_38":function(d){return "Today"},
"saySpriteChoices_39":function(d){return "Tomorrow"},
"saySpriteChoices_40":function(d){return "Yesterday"},
"saySpriteChoices_41":function(d){return "I found you!"},
"saySpriteChoices_42":function(d){return "You found me!"},
"saySpriteChoices_43":function(d){return "10, 9, 8, 7, 6, 5, 4, 3, 2, 1!"},
"saySpriteChoices_44":function(d){return "You are great!"},
"saySpriteChoices_45":function(d){return "You are funny!"},
"saySpriteChoices_46":function(d){return "You are silly! "},
"saySpriteChoices_47":function(d){return "You are a good friend!"},
"saySpriteChoices_48":function(d){return "Watch out!"},
"saySpriteChoices_49":function(d){return "Duck!"},
"saySpriteChoices_50":function(d){return "Gotcha!"},
"saySpriteChoices_51":function(d){return "Ow!"},
"saySpriteChoices_52":function(d){return "Sorry!"},
"saySpriteChoices_53":function(d){return "Careful!"},
"saySpriteChoices_54":function(d){return "Whoa!"},
"saySpriteChoices_55":function(d){return "Oops!"},
"saySpriteChoices_56":function(d){return "You almost got me!"},
"saySpriteChoices_57":function(d){return "Nice try!"},
"saySpriteChoices_58":function(d){return "You can’t catch me!"},
"scoreText":function(d){return "Điểm: "+studio_locale.v(d,"playerScore")},
"setBackground":function(d){return "set background"},
"setBackgroundRandom":function(d){return "set random background"},
"setBackgroundBlack":function(d){return "set black background"},
"setBackgroundCave":function(d){return "set cave background"},
"setBackgroundCloudy":function(d){return "set cloudy background"},
"setBackgroundHardcourt":function(d){return "set hardcourt background"},
"setBackgroundNight":function(d){return "set night background"},
"setBackgroundUnderwater":function(d){return "set underwater background"},
"setBackgroundCity":function(d){return "set city background"},
"setBackgroundDesert":function(d){return "set desert background"},
"setBackgroundRainbow":function(d){return "set rainbow background"},
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
"setBackgroundTooltip":function(d){return "Thiết lập hình nền"},
"setEnemySpeed":function(d){return "set enemy speed"},
"setPlayerSpeed":function(d){return "set player speed"},
"setScoreText":function(d){return "thiết lập điểm"},
"setScoreTextTooltip":function(d){return "Sets the text to be displayed in the score area."},
"setSpriteEmotionAngry":function(d){return "to a angry mood"},
"setSpriteEmotionHappy":function(d){return "to a happy mood"},
"setSpriteEmotionNormal":function(d){return "to a normal mood"},
"setSpriteEmotionRandom":function(d){return "to a random mood"},
"setSpriteEmotionSad":function(d){return "to a sad mood"},
"setSpriteEmotionTooltip":function(d){return "Sets the actor mood"},
"setSpriteAlien":function(d){return "to an alien image"},
"setSpriteBat":function(d){return "to a bat image"},
"setSpriteBird":function(d){return "to a bird image"},
"setSpriteCat":function(d){return "to a cat image"},
"setSpriteCaveBoy":function(d){return "to a cave boy image"},
"setSpriteCaveGirl":function(d){return "to a cave girl image"},
"setSpriteDinosaur":function(d){return "to a dinosaur image"},
"setSpriteDog":function(d){return "to a dog image"},
"setSpriteDragon":function(d){return "to a dragon image"},
"setSpriteGhost":function(d){return "to a ghost image"},
"setSpriteHidden":function(d){return "to a hidden image"},
"setSpriteHideK1":function(d){return "hide"},
"setSpriteAnna":function(d){return "to a Anna image"},
"setSpriteElsa":function(d){return "to a Elsa image"},
"setSpriteHiro":function(d){return "to a Hiro image"},
"setSpriteBaymax":function(d){return "to a Baymax image"},
"setSpriteRapunzel":function(d){return "to a Rapunzel image"},
"setSpriteKnight":function(d){return "to a knight image"},
"setSpriteMonster":function(d){return "to a monster image"},
"setSpriteNinja":function(d){return "to a masked ninja image"},
"setSpriteOctopus":function(d){return "to an octopus image"},
"setSpritePenguin":function(d){return "to a penguin image"},
"setSpritePirate":function(d){return "to a pirate image"},
"setSpritePrincess":function(d){return "to a princess image"},
"setSpriteRandom":function(d){return "to a random image"},
"setSpriteRobot":function(d){return "to a robot image"},
"setSpriteShowK1":function(d){return "show"},
"setSpriteSpacebot":function(d){return "to a spacebot image"},
"setSpriteSoccerGirl":function(d){return "to a soccer girl image"},
"setSpriteSoccerBoy":function(d){return "to a soccer boy image"},
"setSpriteSquirrel":function(d){return "to a squirrel image"},
"setSpriteTennisGirl":function(d){return "to a tennis girl image"},
"setSpriteTennisBoy":function(d){return "to a tennis boy image"},
"setSpriteUnicorn":function(d){return "to a unicorn image"},
"setSpriteWitch":function(d){return "to a witch image"},
"setSpriteWizard":function(d){return "to a wizard image"},
"setSpritePositionTooltip":function(d){return "Instantly moves an actor to the specified location."},
"setSpriteK1Tooltip":function(d){return "Shows or hides the specified actor."},
"setSpriteTooltip":function(d){return "Sets the actor image"},
"setSpriteSizeRandom":function(d){return "to a random size"},
"setSpriteSizeVerySmall":function(d){return "to a very small size"},
"setSpriteSizeSmall":function(d){return "to a small size"},
"setSpriteSizeNormal":function(d){return "to a normal size"},
"setSpriteSizeLarge":function(d){return "to a large size"},
"setSpriteSizeVeryLarge":function(d){return "to a very large size"},
"setSpriteSizeTooltip":function(d){return "Sets the size of an actor"},
"setSpriteSpeedRandom":function(d){return "to a random speed"},
"setSpriteSpeedVerySlow":function(d){return "to a very slow speed"},
"setSpriteSpeedSlow":function(d){return "to a slow speed"},
"setSpriteSpeedNormal":function(d){return "to a normal speed"},
"setSpriteSpeedFast":function(d){return "to a fast speed"},
"setSpriteSpeedVeryFast":function(d){return "to a very fast speed"},
"setSpriteSpeedTooltip":function(d){return "Sets the speed of an actor"},
"setSpriteZombie":function(d){return "to a zombie image"},
"shareStudioTwitter":function(d){return "Check out the story I made. I wrote it myself with @codeorg"},
"shareGame":function(d){return "Share your story:"},
"showCoordinates":function(d){return "show coordinates"},
"showCoordinatesTooltip":function(d){return "show the protagonist's coordinates on the screen"},
"showTitleScreen":function(d){return "show title screen"},
"showTitleScreenTitle":function(d){return "title"},
"showTitleScreenText":function(d){return "văn bản"},
"showTSDefTitle":function(d){return "type title here"},
"showTSDefText":function(d){return "type text here"},
"showTitleScreenTooltip":function(d){return "Show a title screen with the associated title and text."},
"size":function(d){return "size"},
"setSprite":function(d){return "thiết lập"},
"setSpriteN":function(d){return "set actor "+studio_locale.v(d,"spriteIndex")},
"soundCrunch":function(d){return "khủng hoảng"},
"soundGoal1":function(d){return "goal 1"},
"soundGoal2":function(d){return "goal 2"},
"soundHit":function(d){return "hit"},
"soundLosePoint":function(d){return "lose point"},
"soundLosePoint2":function(d){return "lose point 2"},
"soundRetro":function(d){return "retro"},
"soundRubber":function(d){return "rubber"},
"soundSlap":function(d){return "slap"},
"soundWinPoint":function(d){return "win point"},
"soundWinPoint2":function(d){return "win point 2"},
"soundWood":function(d){return "wood"},
"speed":function(d){return "speed"},
"startSetValue":function(d){return "start (rocket-height function)"},
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
"whenDown":function(d){return "Khi mũi tên chỉ xuống"},
"whenDownTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ xuống bật."},
"whenGameStarts":function(d){return "when story starts"},
"whenGameStartsTooltip":function(d){return "Execute the actions below when the story starts."},
"whenLeft":function(d){return "Khi mũi tên chỉ bên trái"},
"whenLeftTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ bên trái bật."},
"whenRight":function(d){return "Khi mũi tên chỉ bên phải"},
"whenRightTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ bên phải bật."},
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
"whenUp":function(d){return "Khi mũi tên chỉ lên trên"},
"whenUpTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ lên bật."},
"yes":function(d){return "Đồng ý"}};