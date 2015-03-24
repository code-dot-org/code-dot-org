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
"and":function(d){return "และ"},
"booleanTrue":function(d){return "จริง"},
"booleanFalse":function(d){return "เท็จ"},
"blocks":function(d){return "บล็อก"},
"blocklyMessage":function(d){return "Blockly"},
"catActions":function(d){return "การดำเนินการ"},
"catColour":function(d){return "Color"},
"catLogic":function(d){return "ตรรกะ"},
"catLists":function(d){return "ลิสต์"},
"catLoops":function(d){return "ลูป"},
"catMath":function(d){return "คำนวณ"},
"catProcedures":function(d){return "ฟังก์ชัน"},
"catText":function(d){return "ข้อความ"},
"catVariables":function(d){return "ตัวแปร"},
"clearPuzzle":function(d){return "เริ่มต้นใหม่"},
"clearPuzzleConfirm":function(d){return "สิ่งนี้จะเริ่มต้นเกมใหม่ที่จุดเริ่มต้นและลบทุกบล็อกที่คุณเพิ่มหรือเปลี่ยนออกไป."},
"clearPuzzleConfirmHeader":function(d){return "คุณจะเริ่มต้นใหม่จริงๆหรือ ?"},
"codeMode":function(d){return "โปรแกรม"},
"codeTooltip":function(d){return "ดูการสร้างโค้ด JavaScript."},
"continue":function(d){return "ดำเนินการต่อไป"},
"designModeHeader":function(d){return "สถานะการออกแบบ"},
"dialogCancel":function(d){return "ยกเลิก"},
"dialogOK":function(d){return "ตกลง"},
"directionNorthLetter":function(d){return "N"},
"directionSouthLetter":function(d){return "S"},
"directionEastLetter":function(d){return "E"},
"directionWestLetter":function(d){return "W"},
"end":function(d){return "สิ้นสุด"},
"emptyBlocksErrorMsg":function(d){return "\"ทำซ้ำ\" หรือ \"ถ้า\" บล็อกจำเป็นต้องมีบล็อกอื่น ๆ ภายในจึงจะทำงาน. ตรวจสอบให้แน่ใจว่า บล็อกภายในเข้ากันอย่างถูกต้องแล้ว."},
"emptyFunctionBlocksErrorMsg":function(d){return "บล็อกหน้าที่ต้องการให้มีบล็อกอื่นๆอยู่ด้านในถึงจะทำงานได้."},
"errorEmptyFunctionBlockModal":function(d){return "มันควรจะมีบล็อกอยู่ภายในความหมายของหน้าการทำงานของโปรแกรม. คลิ่กที่ การแก้ไข และ ลาก บล็อกทั้งหลายภายในบล็อกสีเขียว."},
"errorIncompleteBlockInFunction":function(d){return "คลิ่กที่ การแก้ไข เพื่อให้แน่ใจว่า คุณไม่มีบล็อกค้างอยู่ภายในความหมายของหน้าที่การทำงาน."},
"errorParamInputUnattached":function(d){return "จำให้ได้ว่า จะต้องแนบบล็อกไปในแต่ละข้อมูลเข้าในบล็อกหน้าที่การทำงาน ในพื้นที่การทำงานของคุณ."},
"errorUnusedParam":function(d){return "คุณเพิ่มบล็อกของตัวแทนค่า แต่อย่าใช้มันในการให้ความหมาย ให้แน่ใจว่า คุณ ใช้ตัวแปรของคุณโดยการคลิ่กที่ การแก้ไข และ วางมันลงไปที่บล็อกตัวแปร ด้านใน ของบล็อกเขียว."},
"errorRequiredParamsMissing":function(d){return "สร้างพารามิเตอร์สำหรับฟังก์ชันของคุณ โดยคลิก \"แก้ไข\" และเพิ่มพารามิเตอร์ที่จำเป็น.\nลากบล็อกของพารามิเตอร์ใหม่ไปสู่นิยามของฟังก์ชัน."},
"errorUnusedFunction":function(d){return "คุณสร้างฟังก์ชัน แต่ไม่เคยใช้มันบนพื้นที่ทำงานของคุณ คลิกที่ \"ฟังก์ชัน\" ในกล่องเครื่องมือ และให้แน่ใจว่า คุณใช้ในโปรแกรมของคุณ."},
"errorQuestionMarksInNumberField":function(d){return "ลองแทน \"???\" ด้วยค่า."},
"extraTopBlocks":function(d){return "คุณมีบล็อกที่แยกออกไป คุณหมายถึง ว่าคุณจะแนบบล็อคเหล่านี้ไปที่ \"เมื่อรัน\" บล็อกหรือเปล่า ?"},
"finalStage":function(d){return "ขอแสดงความยินดี ขั้นตอนสุดท้ายสำเร็จแล้ว."},
"finalStageTrophies":function(d){return "ขอแสดงความยินดี คุณได้เสร็จสิ้นขั้นตอนสุดท้าย และชนะ "+locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"finish":function(d){return "เสร็จ"},
"generatedCodeInfo":function(d){return "มหาวิทยาลัยชั้นนำสอนการเขียนโค้ดแบบ  บล็อกเบสต์   (e.g., "+locale.v(d,"berkeleyLink")+", "+locale.v(d,"harvardLink")+").  แต่ภายใต้กรอบสี่เหลี่ยมนั้น,  คุณต้องประมวลผลให้บล็อกของคุณแสดงใน ภาษาจาว่า, ซึ่งเป็นภาษาที่กว้าง และสำคัญของโลก."},
"hashError":function(d){return "ขออภัย '%1' ไม่ตรงกับโปรแกรมที่บันทึกไว้."},
"help":function(d){return "ขอความช่วยเหลือ"},
"hintTitle":function(d){return "คำแนะนำ:"},
"jump":function(d){return "กระโดด"},
"keepPlaying":function(d){return "เล่นต่อไป"},
"levelIncompleteError":function(d){return "คุณกำลังใช้ทุกสิ่งทุกอย่างที่จำเป็นของบล็อก แต่ไม่ใช่ทางที่ถูกต้อง."},
"listVariable":function(d){return "รายการ"},
"makeYourOwnFlappy":function(d){return "สร้าง Flappy เกม ไว้เป็นของเราเอง"},
"missingBlocksErrorMsg":function(d){return "ลองอย่างน้อยหนึ่งบล็อกด้านล่างเพื่อแก้ปริศนานี้."},
"nextLevel":function(d){return "ขอแสดงความยินดี คุณเสร็จสิ้นปริศนา "+locale.v(d,"puzzleNumber")+"."},
"nextLevelTrophies":function(d){return "ขอแสดงความยินดี คุณเสร็จสิ้นปริศนา "+locale.v(d,"puzzleNumber")+" และชนะ "+locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+"."},
"nextStage":function(d){return "เย้ ยินดีด้วย คุณผ่านด่าน "+locale.v(d,"stageName")+" แล้ว"},
"nextStageTrophies":function(d){return "เย้ ยินดีด้วย คุณผ่านด่าน "+locale.v(d,"stageName")+" แล้ว และยังได้ "+locale.p(d,"numTrophies",0,"th",{"one":"a trophy","other":locale.n(d,"numTrophies")+" trophies"})+" อีกด้วย !"},
"numBlocksNeeded":function(d){return "ขอแสดงความยินดี คุณสมบูรณ์ปริศนา "+locale.v(d,"puzzleNumber")+" (อย่างไรก็ตาม คุณสามารถใช้เฉพาะ "+locale.p(d,"numBlocks",0,"th",{"one":"1 block","other":locale.n(d,"numBlocks")+" blocks"})+".)"},
"numLinesOfCodeWritten":function(d){return "คุณเพิ่งเขียนรหัส "+locale.p(d,"numLines",0,"th",{"one":"1 บรรทัด","other":locale.n(d,"numLines")+" บรรทัด"})+"!"},
"play":function(d){return "เล่น"},
"print":function(d){return "พิมพ์"},
"puzzleTitle":function(d){return "ปริศนา "+locale.v(d,"puzzle_number")+" ของ "+locale.v(d,"stage_total")},
"repeat":function(d){return "ทำซ้ำ"},
"resetProgram":function(d){return "ตั้งค่าใหม่"},
"runProgram":function(d){return "เริ่ม"},
"runTooltip":function(d){return "เรียกใช้โปรแกรมที่กำหนด โดยบล็อกในพื้นที่ทำงาน."},
"score":function(d){return "ตะแนน"},
"showCodeHeader":function(d){return "แสดงรหัส"},
"showBlocksHeader":function(d){return "แสดงบล็อก"},
"showGeneratedCode":function(d){return "แสดงโค้ด"},
"stringEquals":function(d){return "ประโยค = ?"},
"subtitle":function(d){return "มุมมองสภาพการเขียนโปรแกรม"},
"textVariable":function(d){return "ข้อความ"},
"tooFewBlocksMsg":function(d){return "คุณได้ใช้ทุกบล็อกที่จำเป็นแล้ว แต่ลองให้บล็อกหลากหลายมากกว่านี้เพื่อให้การแก้ปัญหาสมบูรณ์แบบ."},
"tooManyBlocksMsg":function(d){return "ปัญหานี้สามารถแก้ด้วยบล็อกนี้คือ <x id='START_SPAN'/><x id='END_SPAN'/>."},
"tooMuchWork":function(d){return "คุณทำให้ฉันทำงานหนัก! คุณจะทำซ้ำให้น้อยลงได้ไหม?"},
"toolboxHeader":function(d){return "บล็อก"},
"openWorkspace":function(d){return "มันทำงานได้อย่างไร"},
"totalNumLinesOfCodeWritten":function(d){return "รวมสรุป: "+locale.p(d,"numLines",0,"th",{"one":"1 line","other":locale.n(d,"numLines")+" lines"})+" of code."},
"tryAgain":function(d){return "ลองอีกครั้ง"},
"hintRequest":function(d){return "ดูคำแนะนำ"},
"backToPreviousLevel":function(d){return "กลับไปยังระดับก่อนหน้า"},
"saveToGallery":function(d){return "จัดเก็บสู่ที่แสดงรูปภาพ"},
"savedToGallery":function(d){return "จัดเก็บสู่ที่แสดงรูปภาพเรียบร้อยแล้ว!"},
"shareFailure":function(d){return "ขออภัย เราไม่สามารถใช้โปรแกรมนี้ร่วมกันได้."},
"workspaceHeader":function(d){return "รวบรวมบล็อกของคุณที่นี่: "},
"workspaceHeaderJavaScript":function(d){return "พิมพ์ โปรแกรม JavaScript ของคุณที่นี่"},
"workspaceHeaderShort":function(d){return "พื้นที่ทำงาน: "},
"infinity":function(d){return "ไม่จำกัด"},
"rotateText":function(d){return "หมุนอุปกรณ์ของคุณ."},
"orientationLock":function(d){return "ปิดล็อควางแนวในการตั้งค่าอุปกรณ์."},
"wantToLearn":function(d){return "ต้องการศึกษาการเขียนโปรแกรมหรือ"},
"watchVideo":function(d){return "ดูวีดีโอ"},
"when":function(d){return "เมื่อ"},
"whenRun":function(d){return "เมื่อเรียกให้ทำงาน"},
"tryHOC":function(d){return "ลองใช้ Hour of Code สิ"},
"signup":function(d){return "ลงทะเบียนเพื่อทดลองเรียน"},
"hintHeader":function(d){return "นี่คือเคล็ดลับ:"},
"genericFeedback":function(d){return "ดูว่าคุณสิ้นสุดอย่างไร และพยายามที่จะแก้ไขโปรแกรมของคุณ."},
"toggleBlocksErrorMsg":function(d){return "คุณต้องแก้ไขข้อผิดพลาดในโปรแกรมของคุณก่อนที่จะไปแสดงเป็นบล็อก."},
"defaultTwitterText":function(d){return "Check out what I made"}};