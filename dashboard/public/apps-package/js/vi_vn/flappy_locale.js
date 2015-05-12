var flappy_locale = {lc:{"ar":function(n){
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
v:function(d,k){flappy_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:(k=flappy_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){flappy_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).flappy_locale = {
"continue":function(d){return "Tiếp tục"},
"doCode":function(d){return "thực hiện"},
"elseCode":function(d){return "khác"},
"endGame":function(d){return "kết thúc trò chơi"},
"endGameTooltip":function(d){return "Kết thúc trò chơi."},
"finalLevel":function(d){return "Chúc mừng! Bạn đã giải quyết được câu đố cuối cùng."},
"flap":function(d){return "đập cánh"},
"flapRandom":function(d){return "đập cánh với lực ngẫu nhiên"},
"flapVerySmall":function(d){return "đập cánh với lực rất nhỏ"},
"flapSmall":function(d){return "đập cánh nhẹ"},
"flapNormal":function(d){return "đập cánh vừa phải"},
"flapLarge":function(d){return "đập cánh mạnh"},
"flapVeryLarge":function(d){return "đập cánh rất mạnh"},
"flapTooltip":function(d){return "Làm cho Flappy bay lên trên."},
"flappySpecificFail":function(d){return "Dòng mã lập trình của bạn có vẻ tốt -  nó sẽ vỗ cánh với mỗi lượt bấm chuột. Nhưng bạn cần phải bấm nhiều lần để bay tới mục tiêu."},
"incrementPlayerScore":function(d){return "ghi một điểm"},
"incrementPlayerScoreTooltip":function(d){return "Thêm 1 vào điểm số hiện tại."},
"nextLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố này."},
"no":function(d){return "Không"},
"numBlocksNeeded":function(d){return "Câu đố này có thể được giải quyết chỉ với %1 khối."},
"playSoundRandom":function(d){return "phát âm thanh ngẫu nhiên"},
"playSoundBounce":function(d){return "phát tiếng đập vào"},
"playSoundCrunch":function(d){return "phát tiếng nhai"},
"playSoundDie":function(d){return "phát nhạc buồn"},
"playSoundHit":function(d){return "phát tiếng đập phá"},
"playSoundPoint":function(d){return "phát âm thanh ghi điểm"},
"playSoundSwoosh":function(d){return "phát tiếng vút"},
"playSoundWing":function(d){return "phát tiếng cánh đập"},
"playSoundJet":function(d){return "phát tiếng gió"},
"playSoundCrash":function(d){return "phát tiếng rơi"},
"playSoundJingle":function(d){return "phát tiếng chuông"},
"playSoundSplash":function(d){return "phát tiếng đập"},
"playSoundLaser":function(d){return "phát tiếng la-ze"},
"playSoundTooltip":function(d){return "Phát âm thanh đã chọn."},
"reinfFeedbackMsg":function(d){return "Bạn có thể bấm nút \"Thử lại\" để quay lại chơi trò chơi của mình."},
"scoreText":function(d){return "Điểm: "+flappy_locale.v(d,"playerScore")},
"setBackground":function(d){return "thiết lập bối cảnh"},
"setBackgroundRandom":function(d){return "chọn cảnh ngẫu nhiên"},
"setBackgroundFlappy":function(d){return "chọn nền Thành phố (ngày)"},
"setBackgroundNight":function(d){return "chọn nền Thành phố (đêm)"},
"setBackgroundSciFi":function(d){return "chọn nền Sci-Fi"},
"setBackgroundUnderwater":function(d){return "chọn cảnh dưới nước"},
"setBackgroundCave":function(d){return "chọn cảnh Hang động"},
"setBackgroundSanta":function(d){return "chọn cảnh Ông già Noel"},
"setBackgroundTooltip":function(d){return "Thiết lập hình nền"},
"setGapRandom":function(d){return "thiết lập một khoảng cách ngẫu nhiên"},
"setGapVerySmall":function(d){return "thiết lập một khoảng cách rất nhỏ"},
"setGapSmall":function(d){return "thiết lập một khoảng cách nhỏ"},
"setGapNormal":function(d){return "thiết lập một khoảng cách vừa phải"},
"setGapLarge":function(d){return "thiết lập một khoảng cách lớn"},
"setGapVeryLarge":function(d){return "thiết lập một khoảng cách rất lớn"},
"setGapHeightTooltip":function(d){return "Thiết lập khoảng cách dọc giữa một vật cản"},
"setGravityRandom":function(d){return "thiết lập trọng lực ngẫu nhiên"},
"setGravityVeryLow":function(d){return "thiết lập trọng lực rất thấp"},
"setGravityLow":function(d){return "Đặt trọng lực thấp"},
"setGravityNormal":function(d){return "Đặt trọng lực bình thường"},
"setGravityHigh":function(d){return "Đặt trọng lực cao"},
"setGravityVeryHigh":function(d){return "thiết lập trọng lực rất cao"},
"setGravityTooltip":function(d){return "Đặt mức độ của lực hấp dẫn"},
"setGround":function(d){return "thiết lập nền"},
"setGroundRandom":function(d){return "chọn đất ngẫu nhiên"},
"setGroundFlappy":function(d){return "chọn đất Đất"},
"setGroundSciFi":function(d){return "chọn đất Sci-Fi"},
"setGroundUnderwater":function(d){return "chọn đất Dưới nước"},
"setGroundCave":function(d){return "chọn đất Hang động"},
"setGroundSanta":function(d){return "chọn đất Ông già Noel"},
"setGroundLava":function(d){return "chọn đất Nham thạch"},
"setGroundTooltip":function(d){return "Thiết lập hình ảnh của đất"},
"setObstacle":function(d){return "thiết lập trở ngại"},
"setObstacleRandom":function(d){return "chọn vật cản ngẫu nhiên"},
"setObstacleFlappy":function(d){return "chọn vật cản Ống nước"},
"setObstacleSciFi":function(d){return "chọn vật cản Sci-Fi"},
"setObstacleUnderwater":function(d){return "chọn vật cản Cây trồng"},
"setObstacleCave":function(d){return "chọn vật cản Hang động"},
"setObstacleSanta":function(d){return "chọn vật cản Ống khói"},
"setObstacleLaser":function(d){return "chọn vật cản La-ze"},
"setObstacleTooltip":function(d){return "Thiết lập hình ảnh cho vật cản"},
"setPlayer":function(d){return "thiết lập người chơi"},
"setPlayerRandom":function(d){return "chọn nhân vật ngẫu nhiên"},
"setPlayerFlappy":function(d){return "chọn nhân vật Chim Vàng"},
"setPlayerRedBird":function(d){return "chọn nhân vật Chim Đỏ"},
"setPlayerSciFi":function(d){return "chọn nhân vật Phi thuyền"},
"setPlayerUnderwater":function(d){return "chọn nhân vật Cá"},
"setPlayerCave":function(d){return "chọn nhân vật Dơi"},
"setPlayerSanta":function(d){return "chọn nhân vật Ông già Noel"},
"setPlayerShark":function(d){return "chọn nhân vật Cá Mập"},
"setPlayerEaster":function(d){return "chọn nhân vật Thỏ Phục Sinh"},
"setPlayerBatman":function(d){return "thiết lập máy nghe nhạc Bat guy"},
"setPlayerSubmarine":function(d){return "chọn nhân vật Tàu Ngầm"},
"setPlayerUnicorn":function(d){return "chọn nhân vật Kỳ Lân"},
"setPlayerFairy":function(d){return "chọn nhân vật Tiên tí hon"},
"setPlayerSuperman":function(d){return "chọn nhân vật Flappyman"},
"setPlayerTurkey":function(d){return "chọn nhân vật Gà Tây"},
"setPlayerTooltip":function(d){return "Thiết lập hình ảnh cho nhân vật"},
"setScore":function(d){return "thiết lập điểm"},
"setScoreTooltip":function(d){return "Đặt điểm của người chơi"},
"setSpeed":function(d){return "thiết lập tốc độc"},
"setSpeedTooltip":function(d){return "Thiết lập tốc độ màn chơi"},
"shareFlappyTwitter":function(d){return "Xem game Flappy do tôi tự mình làm tại @codeorg"},
"shareGame":function(d){return "Chia sẻ trò chơi của bạn:"},
"soundRandom":function(d){return "ngẫu nhiên"},
"soundBounce":function(d){return "Dòng banh/ tung"},
"soundCrunch":function(d){return "khủng hoảng"},
"soundDie":function(d){return "thất vọng/buồn/tẻ nhạt"},
"soundHit":function(d){return "đập phá"},
"soundPoint":function(d){return "điểm"},
"soundSwoosh":function(d){return "oup"},
"soundWing":function(d){return "cánh"},
"soundJet":function(d){return "phản lực"},
"soundCrash":function(d){return "sự cố/ tai nạn/ hư hỏng"},
"soundJingle":function(d){return "Jing"},
"soundSplash":function(d){return "giật gân/ vỗ vào"},
"soundLaser":function(d){return "tia laser"},
"speedRandom":function(d){return "thiết lập tốc độ ngẫu nhiên"},
"speedVerySlow":function(d){return "thiết lập tốc độ rất chậm"},
"speedSlow":function(d){return "thiết lập tốc độ chậm"},
"speedNormal":function(d){return "thiết lập tốc độ vừa phải"},
"speedFast":function(d){return "thiết lập tốc độ cao"},
"speedVeryFast":function(d){return "thiết lập tốc độ cực cao"},
"whenClick":function(d){return "khi nhấn"},
"whenClickTooltip":function(d){return "Thực hiện các hành động dưới đây khi xảy ra sự kiện nhấn."},
"whenCollideGround":function(d){return "khi chạm đất"},
"whenCollideGroundTooltip":function(d){return "Thực hiện các hành động dưới đây khi Flappy chạm đất."},
"whenCollideObstacle":function(d){return "khi chạm vào vật cản"},
"whenCollideObstacleTooltip":function(d){return "Thực hiện các hành động dưới đây khi Flappy chạm vật cản."},
"whenEnterObstacle":function(d){return "khi vượt qua vật cản"},
"whenEnterObstacleTooltip":function(d){return "Thực hiện các hành động dưới đây khi Flappy đụng vào vật cản."},
"whenRunButtonClick":function(d){return "Khi trò chơi bắt đầu"},
"whenRunButtonClickTooltip":function(d){return "Thực hiện các hành động dưới đây khi trò chơi bắt đầu."},
"yes":function(d){return "Đồng ý"}};