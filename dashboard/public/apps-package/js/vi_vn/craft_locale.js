var craft_locale = {lc:{"ar":function(n){
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
v:function(d,k){craft_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:(k=craft_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){craft_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).craft_locale = {
"blockDestroyBlock":function(d){return "hủy khối"},
"blockIf":function(d){return "Nếu"},
"blockIfLavaAhead":function(d){return "nếu có dung nham phía trước"},
"blockMoveForward":function(d){return "đi thẳng"},
"blockPlaceTorch":function(d){return "đặt đuốc"},
"blockPlaceXAheadAhead":function(d){return "phía trước"},
"blockPlaceXAheadPlace":function(d){return "đặt"},
"blockPlaceXPlace":function(d){return "đặt"},
"blockPlantCrop":function(d){return "trồng cây"},
"blockShear":function(d){return "xén"},
"blockTillSoil":function(d){return "cày đất"},
"blockTurnLeft":function(d){return "rẽ trái"},
"blockTurnRight":function(d){return "rẽ phải"},
"blockTypeBedrock":function(d){return "đá móng"},
"blockTypeBricks":function(d){return "gạch"},
"blockTypeClay":function(d){return "đất sét"},
"blockTypeClayHardened":function(d){return "đất sét cứng"},
"blockTypeCobblestone":function(d){return "cuội"},
"blockTypeDirt":function(d){return "đất"},
"blockTypeDirtCoarse":function(d){return "đất thô"},
"blockTypeEmpty":function(d){return "rỗng"},
"blockTypeFarmlandWet":function(d){return "đất nông trại"},
"blockTypeGlass":function(d){return "gương"},
"blockTypeGrass":function(d){return "cỏ"},
"blockTypeGravel":function(d){return "sỏi"},
"blockTypeLava":function(d){return "dung nham"},
"blockTypeLogAcacia":function(d){return "gỗ cây keo"},
"blockTypeLogBirch":function(d){return "gỗ cây bulo"},
"blockTypeLogJungle":function(d){return "gỗ rừng"},
"blockTypeLogOak":function(d){return "gỗ cây sồi"},
"blockTypeLogSpruce":function(d){return "gỗ cây vân sam"},
"blockTypeOreCoal":function(d){return "quặng than"},
"blockTypeOreDiamond":function(d){return "quặng kim cương"},
"blockTypeOreEmerald":function(d){return "quặng ngọc lục bảo"},
"blockTypeOreGold":function(d){return "quặng vàng"},
"blockTypeOreIron":function(d){return "quặng sắt"},
"blockTypeOreLapis":function(d){return "quặng lapis"},
"blockTypeOreRedstone":function(d){return "quặng đá đỏ"},
"blockTypePlanksAcacia":function(d){return "ván cây keo"},
"blockTypePlanksBirch":function(d){return "ván cây bulo"},
"blockTypePlanksJungle":function(d){return "ván cây rừng"},
"blockTypePlanksOak":function(d){return "ván cây sồi"},
"blockTypePlanksSpruce":function(d){return "ván cây vân sam"},
"blockTypeRail":function(d){return "đường đi"},
"blockTypeSand":function(d){return "cát"},
"blockTypeSandstone":function(d){return "sa thạch"},
"blockTypeStone":function(d){return "đá"},
"blockTypeTnt":function(d){return "tnt"},
"blockTypeTree":function(d){return "cây"},
"blockTypeWater":function(d){return "nước"},
"blockTypeWool":function(d){return "len"},
"blockWhileXAheadAhead":function(d){return "phía trước"},
"blockWhileXAheadDo":function(d){return "thực hiện"},
"blockWhileXAheadWhile":function(d){return "Lặp khi"},
"generatedCodeDescription":function(d){return "Khi kéo và đặt các khối vào trong câu đố này, bạn đã tạo một bộ hướng dẫn bằng ngôn ngữ máy tính gọi là Javascript. Mã này cho máy tính biết nên hiển thị điều gì trên màn hình. Mọi thứ bạn nhìn thấy và thực hiện trong Minecraft đều bắt đầu bằng các dòng mã máy tính tương tự như các mã này."},
"houseSelectChooseFloorPlan":function(d){return "Chọn mặt bằng sàn cho nhà của bạn."},
"houseSelectEasy":function(d){return "Dễ"},
"houseSelectHard":function(d){return "Khó"},
"houseSelectLetsBuild":function(d){return "Hãy xây nhà nào."},
"houseSelectMedium":function(d){return "Trung bình"},
"keepPlayingButton":function(d){return "Tiếp tục Chơi"},
"level10FailureMessage":function(d){return "Lấp dung nham để bước qua, sau đó đào hai khối sắt ở phía bên kia."},
"level11FailureMessage":function(d){return "Hãy đảm bảo đặt đá cuội ở phía trước nếu có dung nham phía trước. Việc này sẽ giúp bạn khai thác chuỗi tài nguyên này một cách an toàn."},
"level12FailureMessage":function(d){return "Bạn phải đào 3 khối đá đỏ. Điều này kết hợp với những gì bạn đã học được từ việc xây dựng ngôi nhà của bạn và việc sử dụng lệnh \"if\" để tránh rơi vào dung nham."},
"level13FailureMessage":function(d){return "Đặt \"rail\" dọc theo đường đất bắt đầu từ cửa nhà của bạn đến mép của bản đồ."},
"level1FailureMessage":function(d){return "Bạn cần phải sử dụng lệnh để đi đến phía con cừu."},
"level1TooFewBlocksMessage":function(d){return "Hãy thử sử dụng nhiều lệnh hơn để đi về phía con cừu."},
"level2FailureMessage":function(d){return "Để đốn cây, hãy đi bộ về phía thân cây và sử dụng lệnh \"destroy block\"."},
"level2TooFewBlocksMessage":function(d){return "Hãy thử sử dụng nhiều lệnh hơn để đốn cây. Hãy đi về phía thân cây và sử dụng lệnh \"destroy block\"."},
"level3FailureMessage":function(d){return "Để thu thập lông của cả hai con cừu, hãy đi về phía mỗi con và sử dụng lệnh \"shear\". Hãy nhớ sử dụng lệnh rẽ để tiếp cận con cừu."},
"level3TooFewBlocksMessage":function(d){return "Hãy thử sử dụng nhiều lệnh hơn để thu thập lông của cả hai con cừu. Hãy đi về phía mỗi con cừu và sử dụng lệnh \"shear\"."},
"level4FailureMessage":function(d){return "Bạn phải sử dụng lệnh \"destroy block\" cho từng thân cây trong ba thân cây."},
"level5FailureMessage":function(d){return "Hãy đặt các khối trên đường viền đất để xây một bức tường. Lệnh \"repeat\" màu hồng sẽ kích hoạt các lệnh được đặt bên trong nó, như \"place block\" và \"move forward\"."},
"level6FailureMessage":function(d){return "Hãy đặt các khối gỗ trên đường viền đất của ngôi nhà để hoàn thành câu đố."},
"level7FailureMessage":function(d){return "Hãy sử dụng lệnh \"plant\" để đặt cây trồng trên mỗi mảnh đất đã canh tác có màu tối."},
"level8FailureMessage":function(d){return "Nếu bạn chạm vào một creeper, nó sẽ phát nổ. Hãy lẻn đi xung quanh chúng và bước vào ngôi nhà của bạn."},
"level9FailureMessage":function(d){return "Đừng quên đặt ít nhất 2 cây đuốc để thắp sáng đường đi VÀ đào ít nhất 2 viên than."},
"minecraftBlock":function(d){return "khối"},
"nextLevelMsg":function(d){return "Đã hoàn thành Câu đố "+craft_locale.v(d,"puzzleNumber")+". Xin chúc mừng!"},
"playerSelectChooseCharacter":function(d){return "Hãy chọn nhân vật của bạn."},
"playerSelectChooseSelectButton":function(d){return "Chọn"},
"playerSelectLetsGetStarted":function(d){return "Hãy bắt đầu nào."},
"reinfFeedbackMsg":function(d){return "Bạn có thể nhấn vào \"Keep Playing\" để quay trở lại trò chơi."},
"replayButton":function(d){return "Chơi lại"},
"selectChooseButton":function(d){return "Chọn"},
"tooManyBlocksFail":function(d){return "Đã hoàn thành Câu đố "+craft_locale.v(d,"puzzleNumber")+". Xin chúc mừng! Bạn cũng có thể hoàn thành câu đố bằng "+craft_locale.p(d,"numBlocks",0,"vi",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};