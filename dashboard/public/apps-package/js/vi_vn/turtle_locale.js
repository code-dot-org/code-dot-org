var appLocale = {lc:{"ar":function(n){
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
v:function(d,k){appLocale.c(d,k);return d[k]},
p:function(d,k,o,l,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:(k=appLocale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){appLocale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).appLocale = {
"blocksUsed":function(d){return "Số lượng khối đã dùng: %1"},
"branches":function(d){return "Chi nhánh/ các nhánh"},
"catColour":function(d){return "Màu sắc"},
"catControl":function(d){return "Vòng lặp"},
"catMath":function(d){return "thuật toán"},
"catProcedures":function(d){return "Các hàm"},
"catTurtle":function(d){return "hành động"},
"catVariables":function(d){return "Các biến"},
"catLogic":function(d){return "Logic"},
"colourTooltip":function(d){return "Thay đổi màu của cây bút chì."},
"createACircle":function(d){return "tạo ra một hình tròn"},
"createSnowflakeSquare":function(d){return "tạo một bông tuyết hình vuông"},
"createSnowflakeParallelogram":function(d){return "tạo một bông tuyết hình bình hành"},
"createSnowflakeLine":function(d){return "tạo một bông tuyết kiểu đường thẳng"},
"createSnowflakeSpiral":function(d){return "tạo một bông tuyết kiểu xoắn ốc"},
"createSnowflakeFlower":function(d){return "tạo một bông tuyết kiểu hoa"},
"createSnowflakeFractal":function(d){return "tạo một bông tuyết của kiểu phân dạng"},
"createSnowflakeRandom":function(d){return "tạo một bông tuyếtdạng ngẫu nhiên"},
"createASnowflakeBranch":function(d){return "tạo ra một nhánh bông tuyết"},
"degrees":function(d){return "độ"},
"depth":function(d){return "độ sâu/ chiều sâu"},
"dots":function(d){return "các điểm ảnh"},
"drawASquare":function(d){return "vẽ một hình vuông"},
"drawATriangle":function(d){return "vẽ một hình tam giác"},
"drawACircle":function(d){return "vẽ một hình tròn"},
"drawAFlower":function(d){return "vẽ một bông hoa"},
"drawAHexagon":function(d){return "vẽ một hình lục giác"},
"drawAHouse":function(d){return "vẽ một căn nhà"},
"drawAPlanet":function(d){return "hãy vẽ một hành tinh"},
"drawARhombus":function(d){return "vẽ một hình thoi"},
"drawARobot":function(d){return "vẽ một con robot"},
"drawARocket":function(d){return "vẽ một quả tên lửa"},
"drawASnowflake":function(d){return "vẽ một bông tuyết"},
"drawASnowman":function(d){return "vẽ một người tuyết"},
"drawAStar":function(d){return "vẽ một ngôi sao"},
"drawATree":function(d){return "vẽ một cái cây"},
"drawUpperWave":function(d){return "vẽ làn sóng nhấp nhô cao"},
"drawLowerWave":function(d){return "vẽ làn sóng nhấp nhô thấp"},
"drawStamp":function(d){return "vẽ con dấu"},
"heightParameter":function(d){return "chiều cao"},
"hideTurtle":function(d){return "ẩn nghệ sĩ"},
"jump":function(d){return "nhảy"},
"jumpBackward":function(d){return "di chuyển bút lui về mà không ghi"},
"jumpForward":function(d){return "di chuyển tới trước (mà không ghi)"},
"jumpTooltip":function(d){return "di chuyển nghệ sĩ mà không để lại bất kì dấu gì."},
"jumpEastTooltip":function(d){return "Di chuyển về phía đông nghệ sĩ mà không để lại bất cứ dấu hiệu nào."},
"jumpNorthTooltip":function(d){return "Di chuyển về phía bắc nghệ sĩ mà không để lại bất cứ dấu hiệu nào."},
"jumpSouthTooltip":function(d){return "Di chuyển về phía nam nghệ sĩ mà không để lại bất cứ dấu hiệu nào."},
"jumpWestTooltip":function(d){return "Di chuyển về phía tây nghệ sĩ mà không để lại bất cứ dấu hiệu nào."},
"lengthFeedback":function(d){return "Bạn đã làm đúng ngoại trừ độ dài dịch chuyển"},
"lengthParameter":function(d){return "chiều dài"},
"loopVariable":function(d){return "biến đếm"},
"moveBackward":function(d){return "di chuyển lui về"},
"moveEastTooltip":function(d){return "Di chuyển nghệ sĩ đông."},
"moveForward":function(d){return "di chuyển tới trước"},
"moveForwardTooltip":function(d){return "di chuyển nghệ sĩ tới trước."},
"moveNorthTooltip":function(d){return "Di chuyển nghệ sĩ bắc."},
"moveSouthTooltip":function(d){return "Di chuyển nghệ sĩ nam."},
"moveWestTooltip":function(d){return "Di chuyển nghệ sĩ tây."},
"moveTooltip":function(d){return "Di chuyển nghệ sĩ tới trước hay lùi về một khoản nhất định."},
"notBlackColour":function(d){return "Bạn cần chỉnh màu khác ngoại trừ màu đen cho bài này."},
"numBlocksNeeded":function(d){return "Câu đố này có thể được giải quyết với khối %1.  Bạn sử dụng khối %2."},
"penDown":function(d){return "bỏ bút xuống"},
"penTooltip":function(d){return "nâng lên hay hạ bút xuống, để bắt đầu và ngừng vẽ."},
"penUp":function(d){return "nâng bút lên"},
"reinfFeedbackMsg":function(d){return "Đây là bản vẽ của bạn! Tiếp tục làm việc trên nó hoặc tiếp tục câu đố tiếp theo."},
"setColour":function(d){return "chỉnh màu"},
"setPattern":function(d){return "thiết lập thiết kế mẫu"},
"setWidth":function(d){return "chỉnh độ rộng"},
"shareDrawing":function(d){return "Chia sẻ bản vẽ của bạn:"},
"showMe":function(d){return "cho tôi thấy"},
"showTurtle":function(d){return "hiển thị nghệ sĩ"},
"sizeParameter":function(d){return "size"},
"step":function(d){return "bước/ từng bước"},
"tooFewColours":function(d){return "Bạn phải sử dụng ít nhất %1 màu khác nhau ở câu đố này.  Bạn mới chỉ sử dụng %2 màu."},
"turnLeft":function(d){return "rẽ trái (độ)"},
"turnRight":function(d){return "rẽ phải (độ)"},
"turnRightTooltip":function(d){return "rẽ nghệ sĩ về bên phải một góc nhất định."},
"turnTooltip":function(d){return "rẽ nghệ sĩ về bên phải hay bên trái một góc nhất định."},
"turtleVisibilityTooltip":function(d){return "Làm ẩn hoặc hiện họa sĩ."},
"widthTooltip":function(d){return "thay đổi độ rộng của cây bút chì."},
"wrongColour":function(d){return "Bức hình của bạn bị sai màu. Cho bài này, cần phải là"}};