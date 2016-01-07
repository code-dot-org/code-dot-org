var maze_locale = {lc:{"ar":function(n){
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
v:function(d,k){maze_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:(k=maze_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){maze_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).maze_locale = {
"atHoneycomb":function(d){return "tại/ trong tổ ong"},
"atFlower":function(d){return "tại/ trên bông hoa"},
"avoidCowAndRemove":function(d){return "tránh con bò và loại bỏ 1"},
"continue":function(d){return "Tiếp tục"},
"dig":function(d){return "xóa 1"},
"digTooltip":function(d){return "loại bỏ 1 đơn vị  bụi bẩn"},
"dirE":function(d){return "Đông"},
"dirN":function(d){return "Bắc"},
"dirS":function(d){return "Nam"},
"dirW":function(d){return "Tây"},
"doCode":function(d){return "thực hiện"},
"elseCode":function(d){return "nếu không"},
"fill":function(d){return "lấp đầy"},
"fillN":function(d){return "lấp đầy "+maze_locale.v(d,"shovelfuls")},
"fillStack":function(d){return "lấp đầy dãy "+maze_locale.v(d,"shovelfuls")+" những cái lỗ"},
"fillSquare":function(d){return "lấp đầy hình vuông"},
"fillTooltip":function(d){return "Đặt 1 đơn vị của bụi bẩn"},
"finalLevel":function(d){return "Xin chúc mừng! Bạn đã hoàn thành câu đố cuối cùng."},
"flowerEmptyError":function(d){return "Bông hoa bạn đang ở trên không còn mật."},
"get":function(d){return "nhận được"},
"heightParameter":function(d){return "chiều cao"},
"holePresent":function(d){return "có một cái hố"},
"honey":function(d){return "tạo mật ong"},
"honeyAvailable":function(d){return "mật ong"},
"honeyTooltip":function(d){return "Làm mật ong từ phấn hoa"},
"honeycombFullError":function(d){return "Tổ ong này không còn chỗ chứa."},
"ifCode":function(d){return "nếu"},
"ifInRepeatError":function(d){return "Bạn cần một khối \"if\" lồng trong khối \"repeat\". Nếu có sự cố, hãy thử lại vòng trước lần nữa để xem nó thực hiện thế nào."},
"ifPathAhead":function(d){return "Nếu có đường đi ở phía trước"},
"ifTooltip":function(d){return "Nếu có một con đường đi theo hướng được định trước, hãy làm một số hành động."},
"ifelseTooltip":function(d){return "Nếu có đường ở hướng được xét, thực hiện khối lệnh đầu tiên. Nếu không, thực hiện khối lệnh thứ hai."},
"ifFlowerTooltip":function(d){return "Nếu có một bông hoa hoặc một tổ ong ở hướng được xem xét, thì thực hiện các lệnh ..."},
"ifOnlyFlowerTooltip":function(d){return "Nếu có một bông hoa ở trong hướng định đi thì hãy làm một số hành động nào đó."},
"ifelseFlowerTooltip":function(d){return "Nếu có một bông hoa hoặc một tổ ong ở hướng được xem xét, thì thực hiện khối lệnh đầu tiên. Nếu không có, thì thực hiện khối lệnh thứ hai."},
"insufficientHoney":function(d){return "Bạn đã sử dụng đúng các lệnh, nhưng bạn cần tạo đúng số lượng mật ong."},
"insufficientNectar":function(d){return "Bạn đã sử dụng đúng các lệnh, nhưng cần thu lượm đúng số lượng phấn hoa."},
"make":function(d){return "Làm cho/ tạo/ khiến cho"},
"moveBackward":function(d){return "Lùi lại"},
"moveEastTooltip":function(d){return "Dịch chuyển/ di chuyển cho tớ một không gian phía đông."},
"moveForward":function(d){return "đi thẳng"},
"moveForwardTooltip":function(d){return "Di chuyển tôi về phía trước một bước."},
"moveNorthTooltip":function(d){return "Dịch chuyển/ di chuyển cho tớ một không gian phía bắc."},
"moveSouthTooltip":function(d){return "Dịch chuyển/ di chuyển cho tớ một không gian phía nam."},
"moveTooltip":function(d){return "Dịch chuyển/ di chuyển cho tớ tiến tới/ lùi lại một khoảng không gian."},
"moveWestTooltip":function(d){return "Dịch chuyển/ di chuyển cho tớ một không gian phía tây."},
"nectar":function(d){return "lấy được mật hoa/ phấn hoa"},
"nectarRemaining":function(d){return "phấn hoa/ mật hoa"},
"nectarTooltip":function(d){return "Lấy phấn hoa từ một bông hoa"},
"nextLevel":function(d){return "Chúc mừng. Bạn vừa hoàn thành bài tập này."},
"no":function(d){return "Không"},
"noPathAhead":function(d){return "con đường đã bị chặn"},
"noPathLeft":function(d){return "không có đường đi ở bên trái"},
"noPathRight":function(d){return "không có đường đi ở bên phải"},
"notAtFlowerError":function(d){return "Bạn chỉ có thể lấy được phấn hoa từ một bông hoa."},
"notAtHoneycombError":function(d){return "Bạn chỉ có thể làm mật ong tại một tổ ong."},
"numBlocksNeeded":function(d){return "Câu đố này có thể được giải quyết chỉ với %1 khối."},
"pathAhead":function(d){return "con đường phía trước"},
"pathLeft":function(d){return "Nếu có đường đi ở bên trái"},
"pathRight":function(d){return "Nếu có đường đi ở bên phải"},
"pilePresent":function(d){return "Một đống"},
"putdownTower":function(d){return "Đặt xuống tháp"},
"removeAndAvoidTheCow":function(d){return "loại bỏ 1 và tránh những con bò"},
"removeN":function(d){return "Loại bỏ "+maze_locale.v(d,"shovelfuls")},
"removePile":function(d){return "Loại bỏ mảng"},
"removeStack":function(d){return "Loại bỏ các ngăn xếp của "+maze_locale.v(d,"shovelfuls")+" những cái cọc"},
"removeSquare":function(d){return "xóa ô vuông"},
"repeatCarefullyError":function(d){return "Để giải quyết điều này,hãy suy nghĩ thật kỹ lưỡng về mô hình của hai bước di chuyển và một bước ngoặt để \"lặp lại\" một khối/ block. Điều đó sẽ ổn để có một turn thêm vào lúc cuối."},
"repeatUntil":function(d){return "lặp lại cho đến khi"},
"repeatUntilBlocked":function(d){return "khi có đường đi ở phía trước"},
"repeatUntilFinish":function(d){return "lặp lại cho đến khi kết thúc"},
"step":function(d){return "Bước/ từng bước thực hiện"},
"totalHoney":function(d){return "Tổng số mật ong"},
"totalNectar":function(d){return "Tổng số phấn hoa/ mật hoa"},
"turnLeft":function(d){return "rẽ trái"},
"turnRight":function(d){return "rẽ phải"},
"turnTooltip":function(d){return "Rẽ trái hoặc phải 90 độ."},
"uncheckedCloudError":function(d){return "Hãy đảm bảo rằng bạn đã kiểm tra tất cả các đám mây để biết được trong đó là những bông hoa hay những tổ ong."},
"uncheckedPurpleError":function(d){return "Hãy đảm bảo rằng bạn đã kiểm tra hết tất cả bông hoa màu tím để biết chúng có phấn hoa bên trong"},
"whileMsg":function(d){return "Lặp khi"},
"whileTooltip":function(d){return "Lặp lại các hành động trong câu lệnh cho đến khi có kết quả."},
"word":function(d){return "Tìm các từ"},
"yes":function(d){return "Đồng ý"},
"youSpelled":function(d){return "Bạn hãy đánh vần"}};