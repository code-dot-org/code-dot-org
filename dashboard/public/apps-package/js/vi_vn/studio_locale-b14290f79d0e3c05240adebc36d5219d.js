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
"addItems1":function(d){return "Thêm 1 mục"},
"addItems2":function(d){return "Thêm 2 mục"},
"addItems3":function(d){return "Thêm 3 mục"},
"addItems5":function(d){return "Thêm 5 mục"},
"addItems10":function(d){return "Thêm 10 mục"},
"addItemsRandom":function(d){return "Thêm một vài mục ngẫu nhiên"},
"addItemsTooltip":function(d){return "Thêm các mục vào phân cảnh này."},
"alienInvasion":function(d){return "Người ngoài hành tinh xâm lược!"},
"backgroundBlack":function(d){return "đen"},
"backgroundCave":function(d){return "hang động"},
"backgroundCloudy":function(d){return "có mây"},
"backgroundHardcourt":function(d){return "hardcourt"},
"backgroundNight":function(d){return "đêm"},
"backgroundUnderwater":function(d){return "dưới nước"},
"backgroundCity":function(d){return "thành phố"},
"backgroundDesert":function(d){return "sa mạc"},
"backgroundRainbow":function(d){return "cầu vồng"},
"backgroundSoccer":function(d){return "bóng đá"},
"backgroundSpace":function(d){return "Vũ trụ"},
"backgroundTennis":function(d){return "quần vợt"},
"backgroundWinter":function(d){return "mùa đông"},
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
"dropletBlock_changeScore_description":function(d){return "Thêm vào hoặc bớt đi một điểm từ số điểm đang có."},
"dropletBlock_penColour_description":function(d){return "Sets the color of the line drawn behind the turtle as it moves"},
"dropletBlock_penColour_param0":function(d){return "color"},
"dropletBlock_setBackground_description":function(d){return "Thiết lập hình nền"},
"dropletBlock_setSpriteEmotion_description":function(d){return "Sets the actor mood"},
"dropletBlock_setSpritePosition_description":function(d){return "Ngay lập tức di chuyển diễn viên đến vị trí chỉ định."},
"dropletBlock_setSpriteSpeed_description":function(d){return "Cài đặt tốc độ của nhân vật"},
"dropletBlock_setSprite_description":function(d){return "Cài đặt hình ảnh của diễn viên"},
"dropletBlock_throw_description":function(d){return "Throws a projectile from the specified actor."},
"dropletBlock_vanish_description":function(d){return "Vanishes the actor."},
"emotion":function(d){return "tâm trạng/ tính tình"},
"finalLevel":function(d){return "Xin chúc mừng! Bạn đã hoàn thành câu đố cuối cùng."},
"for":function(d){return "for"},
"hello":function(d){return "Xin chào"},
"helloWorld":function(d){return "Chào cả thế giới!"},
"incrementPlayerScore":function(d){return "điểm số ghi được"},
"itemBlueFireball":function(d){return "blue fireball"},
"itemPurpleFireball":function(d){return "purple fireball"},
"itemRedFireball":function(d){return "red fireball"},
"itemYellowHearts":function(d){return "yellow hearts"},
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
"reinfFeedbackMsg":function(d){return "Bạn có thể bấm nút \"Tiếp tục chơi\" để quay trở lại để chơi câu chuyện của bạn."},
"repeatForever":function(d){return "Lặp lại mãi mãi"},
"repeatDo":function(d){return "thực hiện"},
"repeatForeverTooltip":function(d){return "Thực hiện các hành động khối này lập đi lập lại trong khi câu chuyện đang diển tiến"},
"saySprite":function(d){return "nói"},
"saySpriteN":function(d){return "diễn viên "+studio_locale.v(d,"spriteIndex")+" nói"},
"saySpriteTooltip":function(d){return "Bật lên bong bóng lời nói với các văn từ liên quan từ người diễn viên được chỉ định"},
"saySpriteChoices_0":function(d){return "Chào bạn"},
"saySpriteChoices_1":function(d){return "Chào mọi người"},
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
"saySpriteChoices_37":function(d){return "Đừng lo"},
"saySpriteChoices_38":function(d){return "Hôm nay"},
"saySpriteChoices_39":function(d){return "Ngày mai"},
"saySpriteChoices_40":function(d){return "Hôm qua"},
"saySpriteChoices_41":function(d){return "Tôi tìm thấy bạn!"},
"saySpriteChoices_42":function(d){return "Bạn tìm thấy tôi!"},
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
"setBackground":function(d){return "Cài đặt hình nền"},
"setBackgroundRandom":function(d){return "Cài đặt hình nền ngẫu nhiên"},
"setBackgroundBlack":function(d){return "Cài đặt hình nền màu đen"},
"setBackgroundCave":function(d){return "cài đặt hình nền hình hang động"},
"setBackgroundCloudy":function(d){return "cài đặt hình nền đám mây"},
"setBackgroundHardcourt":function(d){return "set hardcourt background"},
"setBackgroundNight":function(d){return "cài đặt hình nền ban đêm"},
"setBackgroundUnderwater":function(d){return "cài đặt hình nền dưới nước"},
"setBackgroundCity":function(d){return "cài đặt hình nền hình thành phố"},
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
"setSpriteElsa":function(d){return "sang một bức ảnh của Elsa"},
"setSpriteHiro":function(d){return "sang một bức ảnh của Hiro"},
"setSpriteBaymax":function(d){return "sang một bức ảnh của Baymax"},
"setSpriteRapunzel":function(d){return "sang một bức ảnh của Rapunzel"},
"setSpriteKnight":function(d){return "sang một bức ảnh kị sĩ"},
"setSpriteMonster":function(d){return "sang một bức ảnh quái vật"},
"setSpriteNinja":function(d){return "sang một bức ảnh mặt nạ ninja"},
"setSpriteOctopus":function(d){return "sang một bức ảnh hình bạch tuột"},
"setSpritePenguin":function(d){return "sang một bức ảnh hình chim cánh cụt (Waddles)"},
"setSpritePirate":function(d){return "sang một bức ảnh hình hải tặc"},
"setSpritePrincess":function(d){return "sang một bức ảnh hình công chúa"},
"setSpriteRandom":function(d){return "sang một bức ảnh ngẫu nhiên"},
"setSpriteRobot":function(d){return "sang một bức ảnh hình robot (Spiff)"},
"setSpriteShowK1":function(d){return "Hiển thị"},
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
"shareStudioTwitter":function(d){return "Hãy xem ứng dụng tôi vừa tạo. Tôi tự viết nó với @codeorg"},
"shareGame":function(d){return "Chia sẻ câu chuyện của bạn:"},
"showCoordinates":function(d){return "Hiện thị tọa độ"},
"showCoordinatesTooltip":function(d){return "Hiển thị tọa độ của nhân vật chính trên màn hình"},
"showTitleScreen":function(d){return "Hiển thị tiêu đề màn hình"},
"showTitleScreenTitle":function(d){return "tiêu đề"},
"showTitleScreenText":function(d){return "văn bản"},
"showTSDefTitle":function(d){return "Gõ tiêu đề vào đây"},
"showTSDefText":function(d){return "Gõ văn bản vào đây"},
"showTitleScreenTooltip":function(d){return "Hiển thịt màn hình tiêu đề với liên kết tiêu đề và văn bản."},
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
"whenUp":function(d){return "Khi mũi tên chỉ lên trên"},
"whenUpTooltip":function(d){return "Thực hiện các thao tác dưới đây khi chìa khoá mũi tên chỉ lên bật."},
"yes":function(d){return "Đồng ý"}};