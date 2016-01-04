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
"bounceBall":function(d){return "tung bóng"},
"bounceBallTooltip":function(d){return "Tung một quả bóng tắt của một đối tượng."},
"continue":function(d){return "Tiếp tục"},
"dirE":function(d){return "Đông"},
"dirN":function(d){return "Bắc"},
"dirS":function(d){return "Nam"},
"dirW":function(d){return "Tây"},
"doCode":function(d){return "thực hiện"},
"elseCode":function(d){return "nếu không"},
"finalLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành thử thách cuối cùng."},
"heightParameter":function(d){return "chiều cao"},
"ifCode":function(d){return "nếu"},
"ifPathAhead":function(d){return "Nếu có đường đi ở phía trước"},
"ifTooltip":function(d){return "Nếu có một con đường đi theo hướng được định trước, hãy làm một số hành động."},
"ifelseTooltip":function(d){return "Nếu có đường ở hướng được xét, thực hiện khối lệnh đầu tiên. Nếu không, thực hiện khối lệnh thứ hai."},
"incrementOpponentScore":function(d){return "điểm đối thủ"},
"incrementOpponentScoreTooltip":function(d){return "thêm một vào điểm số của đối thủ."},
"incrementPlayerScore":function(d){return "điểm số ghi được"},
"incrementPlayerScoreTooltip":function(d){return "Thêm 1 vào điểm số hiện tại."},
"isWall":function(d){return "đây có phải là một bức tường không?"},
"isWallTooltip":function(d){return "Trở về giá trị đúng nếu có một bức tường ở đây"},
"launchBall":function(d){return "bắt đầu với quả bóng mới"},
"launchBallTooltip":function(d){return "Khởi động một quả bóng vào chơi."},
"makeYourOwn":function(d){return "Hãy biến trò chơi \"Bounce Game\" này thành riêng của bạn"},
"moveDown":function(d){return "di chuyển xuống"},
"moveDownTooltip":function(d){return "Di chuyển mái chèo đi xuống."},
"moveForward":function(d){return "đi thẳng"},
"moveForwardTooltip":function(d){return "Di chuyển tôi về phía trước một bước."},
"moveLeft":function(d){return "qua trái"},
"moveLeftTooltip":function(d){return "Di chuyển mái chèo sang bên trái."},
"moveRight":function(d){return "qua phải"},
"moveRightTooltip":function(d){return "Di chuyển mái chèo sang bên phải."},
"moveUp":function(d){return "di chuyển lên"},
"moveUpTooltip":function(d){return "Di chuyển mái chèo đi lên."},
"nextLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố này."},
"no":function(d){return "Không"},
"noPathAhead":function(d){return "con đường đã bị chặn"},
"noPathLeft":function(d){return "không có đường đi ở bên trái"},
"noPathRight":function(d){return "không có đường đi ở bên phải"},
"numBlocksNeeded":function(d){return "Bài tập này có thể được giải chỉ với %1 số khối."},
"pathAhead":function(d){return "con đường phía trước"},
"pathLeft":function(d){return "Nếu có đường đi ở bên trái"},
"pathRight":function(d){return "Nếu có đường đi ở bên phải"},
"pilePresent":function(d){return "Một đống"},
"playSoundCrunch":function(d){return "phát tiếng nhai"},
"playSoundGoal1":function(d){return "phát âm thanh ghi bàn 1"},
"playSoundGoal2":function(d){return "phát âm thanh ghi bàn 2"},
"playSoundHit":function(d){return "phát âm thanh va chạm"},
"playSoundLosePoint":function(d){return "phát âm thanh mất điểm"},
"playSoundLosePoint2":function(d){return "phát 2 lần âm thanh mất điểm"},
"playSoundRetro":function(d){return "phát âm thanh retro"},
"playSoundRubber":function(d){return "phát âm thanh cao su"},
"playSoundSlap":function(d){return "phát âm thanh vỗ tay"},
"playSoundTooltip":function(d){return "Phát âm thanh đã chọn."},
"playSoundWinPoint":function(d){return "phát âm thanh thắng 1 điểm"},
"playSoundWinPoint2":function(d){return "phát âm thanh thắng 2 điểm"},
"playSoundWood":function(d){return "phát âm thanh gỗ"},
"putdownTower":function(d){return "Đặt xuống tháp"},
"reinfFeedbackMsg":function(d){return "Bạn có thể bấm nút \"Thử lại\" để quay lại chơi trò chơi của mình."},
"removeSquare":function(d){return "xóa ô vuông"},
"repeatUntil":function(d){return "lặp lại cho đến khi"},
"repeatUntilBlocked":function(d){return "khi có đường đi ở phía trước"},
"repeatUntilFinish":function(d){return "lặp lại cho đến khi kết thúc"},
"scoreText":function(d){return "Điểm số: "+bounce_locale.v(d,"playerScore")+" : "+bounce_locale.v(d,"opponentScore")},
"setBackgroundRandom":function(d){return "thiết lập cảnh ngẫu nhiên"},
"setBackgroundHardcourt":function(d){return "thiết lập số cảnh"},
"setBackgroundRetro":function(d){return "thiết lập cảnh chạy phía sau"},
"setBackgroundTooltip":function(d){return "Thiết lập hình nền"},
"setBallRandom":function(d){return "thiết lập bóng ngẫu nhiên"},
"setBallHardcourt":function(d){return "thiết lập số bóng"},
"setBallRetro":function(d){return "Thiết bóng chạy lùi"},
"setBallTooltip":function(d){return "Thiết lập hình ảnh bóng"},
"setBallSpeedRandom":function(d){return "thiết lập tốc độ bóng ngẫu nhiên"},
"setBallSpeedVerySlow":function(d){return "thiết lập tốc độ bóng rất chậm"},
"setBallSpeedSlow":function(d){return "thiết lập tốc độ bóng chậm"},
"setBallSpeedNormal":function(d){return "thiết lập tốc độ bóng bình thường"},
"setBallSpeedFast":function(d){return "thiết lập tốc độ bóng nhanh"},
"setBallSpeedVeryFast":function(d){return "thiết lập tốc độ bóng rất nhanh"},
"setBallSpeedTooltip":function(d){return "Thiết lập tốc độ cho bóng"},
"setPaddleRandom":function(d){return "thiết lập mặt đập bóng ngẫu nhiên"},
"setPaddleHardcourt":function(d){return "thiết lập độ cứng mặt đập bóng"},
"setPaddleRetro":function(d){return "thiết lập mặt phía sau"},
"setPaddleTooltip":function(d){return "Chọn hình cho mái chèo"},
"setPaddleSpeedRandom":function(d){return "Thiết lập mái chèo tốc độ ngẫu nhiên"},
"setPaddleSpeedVerySlow":function(d){return "Thiết lập tốc độ rất chậm cho mái chèo"},
"setPaddleSpeedSlow":function(d){return "Thiết lập tốc độ chèo chậm"},
"setPaddleSpeedNormal":function(d){return "Thiết lập tốc độ mái chèo bình thường"},
"setPaddleSpeedFast":function(d){return "Thiết lập tốc độ cho mái chèo nhanh"},
"setPaddleSpeedVeryFast":function(d){return "thiết lập tốc độ lăn chuột rất nhanh"},
"setPaddleSpeedTooltip":function(d){return "Đặt tốc độ của các mái chèo"},
"shareBounceTwitter":function(d){return "Hãy xem game \"tưng bóng\" mà tôi đã làm nè. Tôi đã tự lập trình nó @codeorg"},
"shareGame":function(d){return "Chia sẻ trò chơi của bạn:"},
"turnLeft":function(d){return "rẽ trái"},
"turnRight":function(d){return "rẽ phải"},
"turnTooltip":function(d){return "Rẽ trái hoặc phải 90 độ."},
"whenBallInGoal":function(d){return "khi quả bóng vào mục tiêu"},
"whenBallInGoalTooltip":function(d){return "Thực hiện thao tác dưới đây khi một quả bóng vào trong mục tiêu."},
"whenBallMissesPaddle":function(d){return "khi quả bóng vào hụt mái chèo"},
"whenBallMissesPaddleTooltip":function(d){return "Thực hiện các thao tác dưới đây khi một quả bóng hụt mái chèo."},
"whenDown":function(d){return "khi bấm mũi tên xuống"},
"whenDownTooltip":function(d){return "Thực hiện các lệnh dưới đây khi bấm nút mũi tên xuống."},
"whenGameStarts":function(d){return "Khi trò chơi bắt đầu"},
"whenGameStartsTooltip":function(d){return "Thực hiện các hành động dưới đây khi trò chơi bắt đầu."},
"whenLeft":function(d){return "khi bấm mũi tên qua trái"},
"whenLeftTooltip":function(d){return "Thực hiện các lệnh dưới đây khi bấm nút mũi tên hướng qua trái."},
"whenPaddleCollided":function(d){return "Khi quả bóng chạm vào mái chèo"},
"whenPaddleCollidedTooltip":function(d){return "Thực hiện các thao tác dưới đây khi một quả bóng va chạm với một mái chèo."},
"whenRight":function(d){return "Khi mũi tên chỉ bên phải"},
"whenRightTooltip":function(d){return "Thực hiện các lệnh dưới đây khi bấm nút mũi tên hướng qua phải."},
"whenUp":function(d){return "Khi mũi tên chỉ lên trên"},
"whenUpTooltip":function(d){return "Thực hiện các lệnh dưới đây khi bấm nút mũi tên hướng lên."},
"whenWallCollided":function(d){return "Khi quả bóng chạm vào tường"},
"whenWallCollidedTooltip":function(d){return "Thực hiện các lệnh dưới đây khi một quả bóng va chạm với một bức tường."},
"whileMsg":function(d){return "Lặp khi"},
"whileTooltip":function(d){return "Lặp lại các hành động trong câu lệnh cho đến khi có kết quả."},
"yes":function(d){return "Đồng ý"}};