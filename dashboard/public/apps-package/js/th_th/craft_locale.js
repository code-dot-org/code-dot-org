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
"blockDestroyBlock":function(d){return "ทำลายบล็อค"},
"blockIf":function(d){return "ถ้า"},
"blockIfLavaAhead":function(d){return "ลาวาข้างหน้า"},
"blockMoveForward":function(d){return "เดินไปข้างหน้า"},
"blockPlaceTorch":function(d){return "วางคบเพลิง"},
"blockPlaceXAheadAhead":function(d){return "ข้างหน้า"},
"blockPlaceXAheadPlace":function(d){return "วาง"},
"blockPlaceXPlace":function(d){return "วาง"},
"blockPlantCrop":function(d){return "ปลูก"},
"blockShear":function(d){return "กรรไกร"},
"blockTillSoil":function(d){return "ทำฟาร์ม"},
"blockTurnLeft":function(d){return "เลี้ยวซ้าย"},
"blockTurnRight":function(d){return "เลี้ยวขวา"},
"blockTypeBedrock":function(d){return "หินหมอน"},
"blockTypeBricks":function(d){return "อิฐ"},
"blockTypeClay":function(d){return "ดินเหนียว"},
"blockTypeClayHardened":function(d){return "ดินเหนียวเผา"},
"blockTypeCobblestone":function(d){return "หิน"},
"blockTypeDirt":function(d){return "ดิน"},
"blockTypeDirtCoarse":function(d){return "ดินแห้ง"},
"blockTypeEmpty":function(d){return "ว่างเปล่า"},
"blockTypeFarmlandWet":function(d){return "ที่ทำฟาร์มชื้น"},
"blockTypeGlass":function(d){return "กระจก"},
"blockTypeGrass":function(d){return "หญ้า"},
"blockTypeGravel":function(d){return "กรวด"},
"blockTypeLava":function(d){return "ลาวา"},
"blockTypeLogAcacia":function(d){return "ต้นอาคาเซีย"},
"blockTypeLogBirch":function(d){return "ต้นเบิรช์"},
"blockTypeLogJungle":function(d){return "ต้นป่า"},
"blockTypeLogOak":function(d){return "ต้นโอ๊ค"},
"blockTypeLogSpruce":function(d){return "ต้นสปรูซ"},
"blockTypeOreCoal":function(d){return "แร่ถ่าน"},
"blockTypeOreDiamond":function(d){return "แร่เพชร"},
"blockTypeOreEmerald":function(d){return "แร่มรกต"},
"blockTypeOreGold":function(d){return "แร่ทอง"},
"blockTypeOreIron":function(d){return "แร่เหล็ก"},
"blockTypeOreLapis":function(d){return "แร่ลาพิซ"},
"blockTypeOreRedstone":function(d){return "แร่หินแดง"},
"blockTypePlanksAcacia":function(d){return "ไม้อาคาเซีย"},
"blockTypePlanksBirch":function(d){return "ไม้เบิรช์"},
"blockTypePlanksJungle":function(d){return "ไม้ป่า"},
"blockTypePlanksOak":function(d){return "ไม้โอ๊ค"},
"blockTypePlanksSpruce":function(d){return "ไม้สปรูซ"},
"blockTypeRail":function(d){return "ราง"},
"blockTypeSand":function(d){return "ทราย"},
"blockTypeSandstone":function(d){return "ทรายก้อน"},
"blockTypeStone":function(d){return "หินเรียบ"},
"blockTypeTnt":function(d){return "ทีเอ็นที"},
"blockTypeTree":function(d){return "ต้นไม้"},
"blockTypeWater":function(d){return "น้ำ"},
"blockTypeWool":function(d){return "ขนแกะ"},
"blockWhileXAheadAhead":function(d){return "ข้างหน้า"},
"blockWhileXAheadDo":function(d){return "ทำ"},
"blockWhileXAheadWhile":function(d){return "ในขณะที่"},
"generatedCodeDescription":function(d){return "โดยการลากและวางบล็อคในปริศนานี้, คุณได้สร้างกลุ่มคำสั่งในภาษาคอมพิวเตอร์ที่เรียกว่า จาวาสคริปต์. โค้ดนี้จะบอกคอมพิวเตอร์ว่าต้องแสดงอะไรที่หน้าจอ. ทุกอย่างที่คุณเห็นในไมน์คราฟก็เริ่มจากโค้ดแบบนี้เช่นกัน."},
"houseSelectChooseFloorPlan":function(d){return "เลือกแบบแปลนบ้านที่คุณต้องการ"},
"houseSelectEasy":function(d){return "ง่าย"},
"houseSelectHard":function(d){return "ยาก"},
"houseSelectLetsBuild":function(d){return "มาสร้างบ้านกันเถอะ"},
"houseSelectMedium":function(d){return "ปานกลาง"},
"keepPlayingButton":function(d){return "เล่นต่อไป"},
"level10FailureMessage":function(d){return "ปิดทับลาวาแล้วเดินข้าม แล้วขุดแรร์เหล็กสองก้อนที่อีกฟากกนึ่ง"},
"level11FailureMessage":function(d){return "ให้แน่ใจว่าวางหินหยาบข้างหน้าถ้ามีลาวาอยู่. นี่จะทำให้ขุดแร่ได้อย่างปลอดภัย"},
"level12FailureMessage":function(d){return "ขุดแร่หินแดงสามก้อน. รวมความรู้จากการสร้างบ้านและใช้ คำสั่ง\"ถ้า\"เพื่อเดินข้ามลาวา"},
"level13FailureMessage":function(d){return "วาง \"ราง\" ตามทางดินจากหน้าบ้านไปยังสุดแผนที่"},
"level1FailureMessage":function(d){return "คุณต้องใช้คำสั่งเพื่นที่จะเดินไปหาแกะ"},
"level1TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพื่อที่จะเดินไปหาแกะ"},
"level2FailureMessage":function(d){return "ถ้าจะตัดต้นไม้, เดินไปที่โคนต้นไม้แล้วใช้คำสั่ง \"ทำลายบล็อค\""},
"level2TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพื่อตัดไม้. เดินไปที่โคนต้นไม้แล้วใช้คำสั่ง \"ทำลายบล็อค\""},
"level3FailureMessage":function(d){return "เพื่อที่จะเก็บขนแกะ, เดินไปหาแกะแต่ละตัวแล้วใช้คำสั่ง \"กรรไกร\". อย่าลืมใช้คำสั่ง \"หัน\"เพื่อไปให้ถึงแกะ"},
"level3TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพิ่มเติมเพื่อที่จะเก็บขนแกะจากแกะทั้งสองตัว. เดินไปหาแกะแต่ละตัวแล้วใช้คำสั่ง \"กรรไกร\""},
"level4FailureMessage":function(d){return "คุณต้องใช้คำสั่ง \"ทำลายบล็อค\" ที่โคนต้นไม้ทั้งสามต้น"},
"level5FailureMessage":function(d){return "วางปล็อกของคุณบนแนวดินเพื่อสร้างกำแพง. คำสั่ง \"repeat\" สีชมพูจะเรียกคำสั่งที่อยู่ข้างใน เช่น \"place block\" (วางบล็อก) และ \"move forward\" (ก้าวไปข้างหน้า)"},
"level6FailureMessage":function(d){return "Place blocks on the dirt outline of the house to complete the puzzle."},
"level7FailureMessage":function(d){return "Use the \"plant\" command to place crops on each patch of dark tilled soil."},
"level8FailureMessage":function(d){return "If you touch a creeper it will explode. Sneak around them and enter your house."},
"level9FailureMessage":function(d){return "Don't forget to place at least 2 torches to light your way AND mine at least 2 coal."},
"minecraftBlock":function(d){return "block"},
"nextLevelMsg":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations!"},
"playerSelectChooseCharacter":function(d){return "Choose your character."},
"playerSelectChooseSelectButton":function(d){return "Select"},
"playerSelectLetsGetStarted":function(d){return "Let's get started."},
"reinfFeedbackMsg":function(d){return "You can press \"Keep Playing\" to go back to playing your game."},
"replayButton":function(d){return "Replay"},
"selectChooseButton":function(d){return "Select"},
"tooManyBlocksFail":function(d){return "Puzzle "+craft_locale.v(d,"puzzleNumber")+" completed. Congratulations! It is also possible to complete it with "+craft_locale.p(d,"numBlocks",0,"th",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};