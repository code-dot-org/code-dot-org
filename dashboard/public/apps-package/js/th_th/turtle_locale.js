var turtle_locale = {lc:{"ar":function(n){
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
v:function(d,k){turtle_locale.c(d,k);return d[k]},
p:function(d,k,o,l,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:(k=turtle_locale.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){turtle_locale.c(d,k);return d[k] in p?p[d[k]]:p.other}};
(window.blockly = window.blockly || {}).turtle_locale = {
"blocksUsed":function(d){return "ใช้ไปแล้ว %1 คำสั่ง"},
"branches":function(d){return "สาขา"},
"catColour":function(d){return "สี"},
"catControl":function(d){return "ลูป"},
"catMath":function(d){return "คำนวณ"},
"catProcedures":function(d){return "ฟังก์ชัน"},
"catTurtle":function(d){return "การดำเนินการ"},
"catVariables":function(d){return "ตัวแปร"},
"catLogic":function(d){return "ตรรกะ"},
"colourTooltip":function(d){return "เปลี่ยนสีของดินสอ."},
"createACircle":function(d){return "สร้างวงกลม"},
"createSnowflakeSquare":function(d){return "สร้างเกล็ดหิมะจากรูปทรงสี่เหลี่ยม"},
"createSnowflakeParallelogram":function(d){return "สร้างรูปเกล็ดหิมะ ในประเภทของรูปสี่เหลี่ยมด้านขนาน"},
"createSnowflakeLine":function(d){return "สร้างเกล็ดหิมะจากเส้นตรง"},
"createSnowflakeSpiral":function(d){return "สร้างรูปเกล็ดหิมะ ในประเภทของรูปเกลียว"},
"createSnowflakeFlower":function(d){return "สร้างเกล็ดหิมะรูปทรงดอกไม้"},
"createSnowflakeFractal":function(d){return "สร้างรูปเกล็ดหิมะ ในประเภทของแฟร็กทัล"},
"createSnowflakeRandom":function(d){return "สร้างเกล็ดหิมะรูปทรงสุ่ม"},
"createASnowflakeBranch":function(d){return "สร้างสาขาของเกล็ดหิมะ"},
"degrees":function(d){return "องศา"},
"depth":function(d){return "ความลึก"},
"dots":function(d){return "พิกเซล"},
"drawACircle":function(d){return "วาดวงกลม"},
"drawAFlower":function(d){return "วาดดอกไม้"},
"drawAHexagon":function(d){return "วาดรูปหกเหลี่ยม"},
"drawAHouse":function(d){return "วาดรูปบ้าน"},
"drawAPlanet":function(d){return "วาดรูปดาวเคราะห์"},
"drawARhombus":function(d){return "วาดรูปสี่เหลี่ยมขนมเปียกปูน"},
"drawARobot":function(d){return "วาดรูปหุ่นยนต์"},
"drawARocket":function(d){return "วาดรูปจรวด"},
"drawASnowflake":function(d){return "วาดรูปเกล็ดหิมะ"},
"drawASnowman":function(d){return "วาดรูปตุ๊กตาหิมะ"},
"drawASquare":function(d){return "วาดสี่เหลี่ยมจตุรัส"},
"drawAStar":function(d){return "วาดรูปดวงดาว"},
"drawATree":function(d){return "วาดรูปต้นไม้"},
"drawATriangle":function(d){return "วาดสามเหลี่ยม"},
"drawUpperWave":function(d){return "วาดคลื่นสูงขึ้น"},
"drawLowerWave":function(d){return "วาดคลื่นต่ำลง"},
"drawStamp":function(d){return "วาดแสตมป์"},
"heightParameter":function(d){return "ความสูง"},
"hideTurtle":function(d){return "ซ่อนศิลปิน"},
"jump":function(d){return "กระโดด"},
"jumpBackward":function(d){return "กระโดดไปข้างหลังด้วยระยะทาง"},
"jumpForward":function(d){return "กระโดดไปข้างหน้าด้วยระยะทาง"},
"jumpTooltip":function(d){return "ย้าย Artist โดยไม่ต้องออกจากเครื่องหมายใด ๆ"},
"jumpEastTooltip":function(d){return "ย้าย Artist ไปทางทิศตะวันออก โดยไม่ต้องออกจากเครื่องหมายใด ๆ"},
"jumpNorthTooltip":function(d){return "ย้าย Artist ไปทางทิศเหนือ โดยไม่ต้องออกจากเครื่องหมายใด ๆ"},
"jumpSouthTooltip":function(d){return "ย้าย Artist ไปทางทิศใต้ โดยไม่ต้องออกจากเครื่องหมายใด ๆ"},
"jumpWestTooltip":function(d){return "ย้าย Artist ไปทางทิศตะวันตก โดยไม่ต้องออกจากเครื่องหมายใด ๆ"},
"lengthFeedback":function(d){return "คุณมีสิทธิ์ ยกเว้นสำหรับความยาวที่จะย้าย"},
"lengthParameter":function(d){return "ความยาว"},
"loopVariable":function(d){return "จำนวนนับ"},
"moveBackward":function(d){return "ไปด้านหลังด้วยระยะทาง"},
"moveEastTooltip":function(d){return "ย้าย Artist ไปทางทิศตะวันออก"},
"moveForward":function(d){return "ย้ายไปข้างหน้าโดย"},
"moveForwardTooltip":function(d){return "ขยับศิลปินไปข้างหน้า."},
"moveNorthTooltip":function(d){return "ขยับศิลปินไปทางเหนือ."},
"moveSouthTooltip":function(d){return "ขยับศิลปินไปทางใต้."},
"moveWestTooltip":function(d){return "ขยับศิลปินไปทางตะวันตก."},
"moveTooltip":function(d){return "ย้าย Artist ไปข้างหน้า หรือข้างหลัง ตามจำนวนที่ระบุ"},
"notBlackColour":function(d){return "คุณต้องใช้สีใดๆ ที่ไม่ใช่สีดำในปริศนานี้"},
"numBlocksNeeded":function(d){return "ปริศนานี้สามารถแก้ได้โดยใช้เพียง %1 ช่อง แต่คุณใช้ไป %2 ช่อง"},
"penDown":function(d){return "ใช้ดินสอวาดลงมา"},
"penTooltip":function(d){return "กดดินสอลงเพื่อวาด และยกดินสอขึ้นเพื่อหยุดวาด"},
"penUp":function(d){return "ยกดินสอขึ้น"},
"reinfFeedbackMsg":function(d){return "นี่เป็นที่ของรูปวาดคุณ! คุณยังจะทำมันต่อ หรือจะเลือกปริศนาต่อไป"},
"setAlpha":function(d){return "ตั้งค่าอัลฟา"},
"setColour":function(d){return "ตั้งค่าสี"},
"setPattern":function(d){return "ตั้งค่ารูปแบบ"},
"setWidth":function(d){return "ตั้งค่าความกว้าง"},
"shareDrawing":function(d){return "แชร์รูปวาดของคุณ:"},
"showMe":function(d){return "แสดงให้ฉันเห็น"},
"showTurtle":function(d){return "แสดงศิลปิน"},
"sizeParameter":function(d){return "ขนาด"},
"step":function(d){return "ขั้นตอนที่"},
"tooFewColours":function(d){return "คุณจำเป็นจะต้องใช้สีอย่างน้อย %1 สี ที่แตกต่างกันในปริศนานี้ ซึ่งตอนนี้คุณใช้แค่ %2 สี"},
"turnLeft":function(d){return "เลี้ยวซ้าย(องศา)"},
"turnRight":function(d){return "เลี้ยวขวา(องศา)"},
"turnRightTooltip":function(d){return "หันศิลปันทางขวาตามองศาที่กำหนด"},
"turnTooltip":function(d){return "หันศิลปินไปทางซ้ายหรือขวาตามองศาที่กำหนด"},
"turtleVisibilityTooltip":function(d){return "แสดงหรือซ่อน ศิลปิน."},
"widthTooltip":function(d){return "เปลี่ยนความกว้างของดินสอ."},
"wrongColour":function(d){return "รูปภาพนี้มีสีไม่ถูกต้อง สำหรับปริศนานี้ต้องเป็นสี %1"}};