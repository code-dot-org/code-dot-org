var locale = {lc:{"ar":function(n){
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
v:function(d,k){locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){locale.c(d,k);return d[k] in p?p[d[k]]:(k=locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).locale = {
"and":function(d){return "và"},
"booleanTrue":function(d){return "đúng"},
"booleanFalse":function(d){return "sai"},
"blocks":function(d){return "khối"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "Các hành động"},
"catColour":function(d){return "Màu sắc"},
"catLogic":function(d){return "Logic"},
"catLists":function(d){return "Danh sách"},
"catLoops":function(d){return "Vòng lặp"},
"catMath":function(d){return "thuật toán"},
"catProcedures":function(d){return "Các hàm"},
"catText":function(d){return "văn bản"},
"catVariables":function(d){return "Các biến"},
"clearPuzzle":function(d){return "Clear Puzzle"},
"clearPuzzleConfirm":function(d){return "This will delete all blocks and reset the puzzle to its start state."},
"clearPuzzleConfirmHeader":function(d){return "Are you sure you want to clear the puzzle?"},
"codeTooltip":function(d){return "Xem mã \"JavaScript\" đã được tạo ra."},
"continue":function(d){return "Tiếp tục"},
"dialogCancel":function(d){return "Huỷ"},
"dialogOK":function(d){return "Đồng ý"},
"directionNorthLetter":function(d){return "Bắc"},
"directionSouthLetter":function(d){return "Nam"},
"directionEastLetter":function(d){return "Đông"},
"directionWestLetter":function(d){return "Tây"},
"end":function(d){return "kết thúc"},
"emptyBlocksErrorMsg":function(d){return "Miếng ghép được \"Lặp lại\" hay \"Nếu\" cần có những miếng ghép bên trong để hoạt động. Đảm bảo là miếng gạch đó khớp hoàn toàn phần ở trong của miếng gạch kia."},
"emptyFunctionBlocksErrorMsg":function(d){return "Khối \"hàm\"  cần có các khối lệnh bên trong để khiến nó hoạt động."},
"errorEmptyFunctionBlockModal":function(d){return "Cần các khối bên trong định nghĩa về chức năng của bạn. Chọn \"Chỉnh sửa\" và đặt các khối bên trong khối màu xanh lá cây."},
"errorIncompleteBlockInFunction":function(d){return "Chọn \"Chỉnh sửa\" để đảm bảo rằng bạn không thiếu khối nào trong định nghĩa chức năng của bạn."},
"errorParamInputUnattached":function(d){return "Hãy nhớ đính một khối vào mỗi thông số input trên khối chức năng trong không gian làm việc của bạn."},
"errorUnusedParam":function(d){return "Bạn thêm một khối tham số, nhưng đã không sử dụng nó trong định nghĩa. Đảm bảo rằng bạn sử dụng tham số của bạn bằng cách nhấp vào \"chỉnh sửa\" và đặt khối tham số bên trong các khối màu xanh lá cây."},
"errorRequiredParamsMissing":function(d){return "Thiết lập một tham số cho các chức năng của bạn bằng cách nhấp vào \"chỉnh sửa\" và thêm các tham số cần thiết. Kéo các khối tham số mới vào định nghĩa chức năng của bạn."},
"errorUnusedFunction":function(d){return "Bạn vừa thiết lập một chức năng, nhưng chưa bao giờ sử dụng nó trong không gian làm việc của bạn! Nhấn vào \"Chức năng\" trong hộp công cụ và đảm bảo rằng bạn sẽ sử dụng nó trong chương trình của bạn."},
"errorQuestionMarksInNumberField":function(d){return "Thử thay thế \"???\" với một giá trị."},
"extraTopBlocks":function(d){return "Bạn có các khối tự do. Ý của bạn là để đính kèm chúng vào khối \"khi chạy\"?"},
"finalStage":function(d){return "Chúc mừng. Bạn vừa hoàn thành xong bước cuối cùng."},
"finalStageTrophies":function(d){return "Chúc mừng! Bạn vừa hoàn thành bước cuối cùng và dành danh hiệu "+locale.p(d,"numTrophies",0,"vi",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "Hoàn Thành"},
"generatedCodeInfo":function(d){return "Các trường đại học hàng đầu cũng dạy lập trình dựa trên \"khối lệnh\" (block) (như: "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+"). Tuy nhiên, để hổ trợ, các \"khối lệnh\" cũng được hiển thị trong ngôn ngữ JavaScript, ngôn ngữ lập trình thông dụng nhất:"},
"hashError":function(d){return "Xin lỗi, '%1' không tương ứng với bất kì chương trình đã lưu."},
"help":function(d){return "Trợ Giúp"},
"hintTitle":function(d){return "Gợi ý:"},
"jump":function(d){return "nhảy"},
"keepPlaying":function(d){return "Keep Playing"},
"levelIncompleteError":function(d){return "Bạn đã dùng tất cả các khối cần thiết, nhưng không đúng cách."},
"listVariable":function(d){return "danh sách"},
"makeYourOwnFlappy":function(d){return "Tự tạo game Flappy Bird của riêng bạn"},
"missingBlocksErrorMsg":function(d){return "Thử dùng một hoặc nhiều khối được cho để giải quyết câu này."},
"nextLevel":function(d){return "Chúc mừng! Bạn đã hoàn thành câu số "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "Chúc mừng! Bạn đã hoàn thành Câu đố "+locale.v(d,"puzzleNumber")+" và chiến thắng "+locale.v(d,"numTrophies")+"."},
"nextStage":function(d){return "Chúc mừng! Bạn đã hoàn thành xong "+locale.v(d,"stageName")+"."},
"nextStageTrophies":function(d){return "Chúc mừng! Bạn đã vượt qua vòng "+locale.v(d,"stageName")+" và giành được "+locale.p(d,"numTrophies",0,"vi",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"numBlocksNeeded":function(d){return "Chúc mừng! Bạn đã hoàn thành câu đố "+locale.v(d,"puzzleNumber")+". Nhưng bạn thật sự chỉ cần "+locale.p(d,"numBlocks",0,"vi",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+" khối thôi ."},
"numLinesOfCodeWritten":function(d){return "Bạn vừa mới viết "+locale.p(d,"numLines",0,"vi",{"one":"1 dòng","other":locale.n(d,"numLines")+" dòng"})+" mã!"},
"play":function(d){return "Bắt đầu chơi"},
"print":function(d){return "In"},
"puzzleTitle":function(d){return "Câu đố thứ "+locale.v(d,"puzzle_number")+" trong số "+locale.v(d,"stage_total")+" câu"},
"repeat":function(d){return "lặp lại"},
"resetProgram":function(d){return "Thiết lập lại"},
"runProgram":function(d){return "Chạy"},
"runTooltip":function(d){return "Chạy chương trình được thiết kế bởi các khối lệnh trong khung làm việc."},
"score":function(d){return "Ghi điểm/điểm số"},
"showCodeHeader":function(d){return "Xem mã"},
"showBlocksHeader":function(d){return "Hiển thị khối"},
"showGeneratedCode":function(d){return "Xem mã"},
"stringEquals":function(d){return "Chuỗi =?"},
"subtitle":function(d){return "một môi trường lập trình trực quan"},
"textVariable":function(d){return "văn bản"},
"tooFewBlocksMsg":function(d){return "Bạn đang sử dụng tất cả các loại khối lệnh cần thiết, nhưng hãy thử sử dụng các loại khối lệnh khác để hoàn thành câu đố."},
"tooManyBlocksMsg":function(d){return "Câu đố này có thể được giải quyết với <x id='START_SPAN'/><x id='END_SPAN'/> khối lệnh."},
"tooMuchWork":function(d){return "Bạn làm tôi phải làm quá nhiều việc! Bạn làm ơn thử làm cho nó ít hơn được không?"},
"toolboxHeader":function(d){return "các khối"},
"openWorkspace":function(d){return "Hoạt động ra sao"},
"totalNumLinesOfCodeWritten":function(d){return "Thời gian tổng cộng: "+locale.p(d,"numLines",0,"vi",{"one":"1 dòng","other":locale.n(d,"numLines")+" dòng"})+" của mã chương trình."},
"tryAgain":function(d){return "Thử lại"},
"hintRequest":function(d){return "Xem gợi ý"},
"backToPreviousLevel":function(d){return "Chơi lại màn trước"},
"saveToGallery":function(d){return "Lưu vào bộ sưu tập"},
"savedToGallery":function(d){return "Đã lưu trong bộ sưu tập!"},
"shareFailure":function(d){return "Xin lỗi, chúng tôi không chia sẻ chương trình này."},
"workspaceHeader":function(d){return "Lắp ráp các khối của bạn ở đây: "},
"workspaceHeaderJavaScript":function(d){return "Nhập thuật toán JavaScript của bạn ở đây"},
"workspaceHeaderShort":function(d){return "Không gian làm việc:"},
"infinity":function(d){return "Vô cùng"},
"rotateText":function(d){return "Xoay thiết bị của bạn."},
"orientationLock":function(d){return "Tắt khóa hướng trong cài đặt thiết bị."},
"wantToLearn":function(d){return "Bạn muốn học lập trình?"},
"watchVideo":function(d){return "Xem Video"},
"when":function(d){return "Khi nào"},
"whenRun":function(d){return "Khi chạy"},
"tryHOC":function(d){return "Học thử Hour of Code"},
"signup":function(d){return "Đăng ký cho khóa học mở đầu"},
"hintHeader":function(d){return "Đây là một số mẹo:"},
"genericFeedback":function(d){return "Nhìn xem bằng cách nào bạn kết thúc và hãy cố gắng sửa chương trình của bạn."},
"toggleBlocksErrorMsg":function(d){return "Bạn cần phải sửa một lỗi trong chương trình của bạn trước khi nó được hiển thị thành các khối."},
"defaultTwitterText":function(d){return "Check out what I made"}};