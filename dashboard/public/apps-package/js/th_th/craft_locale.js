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
"blockDestroyBlock":function(d){return "ทำลายบล็อก"},
"blockIf":function(d){return "ถ้า"},
"blockIfLavaAhead":function(d){return "หากมีลาวาอยู่ข้างหน้า"},
"blockMoveForward":function(d){return "เดินไปข้างหน้า"},
"blockPlaceTorch":function(d){return "วางคบไฟ"},
"blockPlaceXAheadAhead":function(d){return "ข้างหน้า"},
"blockPlaceXAheadPlace":function(d){return "วาง"},
"blockPlaceXPlace":function(d){return "วาง"},
"blockPlantCrop":function(d){return "ปลูกพืช"},
"blockShear":function(d){return "ตัดขน"},
"blockTillSoil":function(d){return "ขุดดิน"},
"blockTurnLeft":function(d){return "เลี้ยวซ้าย"},
"blockTurnRight":function(d){return "เลี้ยวขวา"},
"blockTypeBedrock":function(d){return "หินดาน"},
"blockTypeBricks":function(d){return "อิฐ"},
"blockTypeClay":function(d){return "ดินเหนียว"},
"blockTypeClayHardened":function(d){return "ดินเผา"},
"blockTypeCobblestone":function(d){return "หินกรวด"},
"blockTypeDirt":function(d){return "ดิน"},
"blockTypeDirtCoarse":function(d){return "ดินหยาบ"},
"blockTypeEmpty":function(d){return "ความว่างเปล่า"},
"blockTypeFarmlandWet":function(d){return "ที่ดินเพาะปลูก"},
"blockTypeGlass":function(d){return "แก้ว"},
"blockTypeGrass":function(d){return "หญ้า"},
"blockTypeGravel":function(d){return "ก้อนกรวด"},
"blockTypeLava":function(d){return "ลาวา"},
"blockTypeLogAcacia":function(d){return "ซุงต้นอะคาเซีย"},
"blockTypeLogBirch":function(d){return "ซุงต้นเบิช"},
"blockTypeLogJungle":function(d){return "ซุงจังเกิ้ล"},
"blockTypeLogOak":function(d){return "ซุงต้นโอ๊ค"},
"blockTypeLogSpruce":function(d){return "ซุงต้นสน"},
"blockTypeOreCoal":function(d){return "แร่ถ่านหิน"},
"blockTypeOreDiamond":function(d){return "แร่เพชร"},
"blockTypeOreEmerald":function(d){return "แร่มรกต"},
"blockTypeOreGold":function(d){return "แร่ทองคำ"},
"blockTypeOreIron":function(d){return "แร่เหล็ก"},
"blockTypeOreLapis":function(d){return "แร่ลาปิส"},
"blockTypeOreRedstone":function(d){return "แร่หินแดง"},
"blockTypePlanksAcacia":function(d){return "ไม้กระดานต้นอะคาเซีย"},
"blockTypePlanksBirch":function(d){return "ไม้กระดานต้นเบิช"},
"blockTypePlanksJungle":function(d){return "ไม้กระดานจังเกิ้ล"},
"blockTypePlanksOak":function(d){return "ไม้กระดานต้นโอ๊ค"},
"blockTypePlanksSpruce":function(d){return "ไม้กระดานต้นสน"},
"blockTypeRail":function(d){return "รั้ว"},
"blockTypeSand":function(d){return "ทราย"},
"blockTypeSandstone":function(d){return "หินทราย"},
"blockTypeStone":function(d){return "หิน"},
"blockTypeTnt":function(d){return "ระเบิดทีเอ็นที"},
"blockTypeTree":function(d){return "ต้นไม้"},
"blockTypeWater":function(d){return "น้ำ"},
"blockTypeWool":function(d){return "ขนแกะ"},
"blockWhileXAheadAhead":function(d){return "ข้างหน้า"},
"blockWhileXAheadDo":function(d){return "ทำ"},
"blockWhileXAheadWhile":function(d){return "ในขณะที่"},
"generatedCodeDescription":function(d){return "โดยการลากและวางบล็อกในเกมปริศนานี้ คุณได้สร้างชุดของคำสั่งในภาษาคอมพิวเตอร์ที่เรียกว่า Javascript รหัสนี้จะบอกคอมพิวเตอร์ถึงสิ่งที่จะแสดงบนหน้าจอ ทุกสิ่งที่คุณเห็นและทำใน Minecraft ยังเริ่มต้นด้วยบรรทัดของรหัสคอมพิวเตอร์เช่นนี้"},
"houseSelectChooseFloorPlan":function(d){return "เลือกแบบแปลนสำหรับบ้านของคุณ"},
"houseSelectEasy":function(d){return "ง่าย"},
"houseSelectHard":function(d){return "ยาก"},
"houseSelectLetsBuild":function(d){return "สร้างบ้านกันเถอะ"},
"houseSelectMedium":function(d){return "ปานกลาง"},
"keepPlayingButton":function(d){return "เล่นต่อไป"},
"level10FailureMessage":function(d){return "ถมลาวาเพื่อเดินผ่าน จากนั้นระเบิดบล็อกเหล็ก 2 บล็อกที่อยู่อีกฟากหนึ่ง"},
"level11FailureMessage":function(d){return "อย่าลืมวางหินกรวดใหญ่ข้างหน้าถ้ามีลาวาข้างหน้า การทำเช่นนี้จะช่วยให้คุณระเบิดทรัพยากรในแถวนี้ได้อย่างปลอดภัย"},
"level12FailureMessage":function(d){return "อย่าลืมระเบิดบล็อกหินสีแดง 3 บล็อก นี่เป็นการผสมผสานสิ่งที่คุณได้เรียนรู้จากการสร้างบ้านของคุณและใช้ข้อความ \"หากมี\" เพื่อหลีกเลี่ยงการตกไปในลาวา"},
"level13FailureMessage":function(d){return "วาง \"รั้ว\" ไปตามแนวดินเพื่อนำทางจากประตูของคุณไปที่ขอบของแผนที่"},
"level1FailureMessage":function(d){return "คุณจำเป็นต้องใช้คำสั่งเพื่อเดินไปหาแกะ"},
"level1TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพิ่มเติมเพื่อเดินไปหาแกะ"},
"level2FailureMessage":function(d){return "ในการตัดต้นไม้ ให้เดินไปที่ลำต้นและใช้คำสั่ง \"destroy block\""},
"level2TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพิ่มเติมเพื่อตัดต้นไม้ เดินไปที่ลำต้นและใช้คำสั่ง \"destroy block\""},
"level3FailureMessage":function(d){return "ในการเก็บขนแกะจากแกะทั้ง 2 ตัว ให้เดินไปที่แกะแต่ละตัวและใช้คำสั่ง \"ตัดขน\" อย่าลืมใช้คำสั่งที่ผ่านมาเพื่อไปที่แกะ"},
"level3TooFewBlocksMessage":function(d){return "ลองใช้คำสั่งเพิ่มเติมเพื่อเก็บขนแกะจากแกะทั้ง 2 ตัว เดินไปที่แกะแต่ละตัวและใช้คำสั่ง \"ตัดขน\""},
"level4FailureMessage":function(d){return "คุณต้องใช้คำสั่ง \"destroy block\" กับลำต้นของต้นไม้ทั้ง 3 ต้น"},
"level5FailureMessage":function(d){return "วางบล็อกของคุณบนโครงดินเพื่อสร้างกำแพง คำสั่ง \"ทำซ้ำ\" สีชมพูจะเรียกใช้คำสั่งวางภายใน เช่น \"วางบล็อก\" และ \"เคลื่อนไปข้างหน้า\""},
"level6FailureMessage":function(d){return "วางบล็อกบนโครงดินของบ้านเพื่อให้เกมปริศนาสมบูรณ์"},
"level7FailureMessage":function(d){return "ใช้คำสั่ง \"ปลูก\" เพื่อวางพืชบนที่ดินแต่ละแปลงที่มีดินที่ขุดแล้วซึ่งมีสีเข้ม"},
"level8FailureMessage":function(d){return "หากคุณโดนไม้เลื้อยมันจะระเบิด ค่อยๆ หลบไม้เลื้อยและเข้าไปที่บ้านของคุณ"},
"level9FailureMessage":function(d){return "อย่าลืมวางคบไฟอย่างน้อย 2 อันเพื่อส่ิองทางและระเบิดถ่านหินอย่างน้อย 2 บล็อก"},
"minecraftBlock":function(d){return "บล็อก"},
"nextLevelMsg":function(d){return "เกมปริศนา "+craft_locale.v(d,"puzzleNumber")+" เกมเสร็จสมบูรณ์แล้ว ขอแสดงความยินดี!"},
"playerSelectChooseCharacter":function(d){return "เลือกตัวละครของคุณ"},
"playerSelectChooseSelectButton":function(d){return "เลือก"},
"playerSelectLetsGetStarted":function(d){return "มาเริ่มเล่นกันเถอะ!"},
"reinfFeedbackMsg":function(d){return "คุณสามารถกด  \"เล่นต่อไป\" เพื่อกลับไปเล่นเกมต่อ"},
"replayButton":function(d){return "เล่นซ้ำ"},
"selectChooseButton":function(d){return "เลือก"},
"tooManyBlocksFail":function(d){return "เกมปริศนา "+craft_locale.v(d,"puzzleNumber")+" สมบูรณ์แล้ว ขอแสดงความยินดี! นอกจากนี้ยังสามารถทำให้เกมเสร็จสมบูรณ์ด้วย "+craft_locale.p(d,"numBlocks",0,"th",{"one":"1 block","other":craft_locale.n(d,"numBlocks")+" blocks"})+"."}};